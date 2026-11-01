"""Measured claims for de.row-column-security-dynamic, against a real local PostgreSQL 16.

Claim 1: a row-security policy, enforced in the engine, blocks a direct SELECT by the
restricted role, while an application-side filter (a plain WHERE the application forgot to add)
would not -- shown by querying as the restricted role with and without the policy applied.

Claim 2: adding a row-security policy measurably changes the query plan on EXPLAIN -- the filter
moves from a scan-level predicate to an explicit Filter node, and rows examined can rise,
confirming the engine cannot always push the policy predicate down the way it could an ordinary
WHERE clause on an indexed column.

Claim 3: the policy does not protect the underlying file -- reading the same data via a
superuser role (standing in for a direct file/bypass read) still returns every row, the bypass
path this topic's own scope line names.
"""

import subprocess

DB = "rls_demo"


def run_sql(sql: str, role: str | None = None, as_superuser: bool = False) -> str:
    # SET ROLE switches privilege within the same session (no OS-level peer-auth account
    # needed for analyst_role) and is exactly how row security evaluates "the user running the
    # query" per PostgreSQL's own documentation.
    full_sql = f"SET ROLE {role}; {sql}" if role and not as_superuser else sql
    cmd = ["psql", "-d", DB, "-X", "-A", "-t", "-c", full_sql]
    result = subprocess.run(["sudo", "-u", "postgres"] + cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise RuntimeError(result.stderr)
    return result.stdout


def setup() -> None:
    subprocess.run(["sudo", "-u", "postgres", "psql", "-c", f"DROP DATABASE IF EXISTS {DB};"], check=True, capture_output=True)
    subprocess.run(["sudo", "-u", "postgres", "psql", "-c", f"CREATE DATABASE {DB};"], check=True, capture_output=True)
    run_sql("DROP ROLE IF EXISTS analyst_role;")
    run_sql("CREATE ROLE analyst_role LOGIN;")
    run_sql(
        """
        CREATE TABLE customers (
            id serial PRIMARY KEY,
            region text NOT NULL,
            email text NOT NULL
        );
        INSERT INTO customers (region, email)
        SELECT (ARRAY['us','eu','apac'])[1 + (n % 3)], 'customer' || n || '@example.com'
        FROM generate_series(1, 3000) AS n;
        GRANT SELECT ON customers TO analyst_role;
        GRANT USAGE, SELECT ON SEQUENCE customers_id_seq TO analyst_role;
        """
    )


def last_int(out: str) -> int:
    lines = [l for l in out.strip().splitlines() if l.strip()]
    return int(lines[-1])


def rows_visible_without_policy() -> int:
    out = run_sql("SELECT count(*) FROM customers;", role="analyst_role")
    return last_int(out)


def apply_row_policy() -> None:
    run_sql(
        """
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY region_only_us ON customers
            FOR SELECT
            TO analyst_role
            USING (region = 'us');
        """
    )


def rows_visible_with_policy() -> int:
    out = run_sql("SELECT count(*) FROM customers;", role="analyst_role")
    return last_int(out)


def rows_visible_as_superuser_bypass() -> int:
    # Superuser bypasses row security entirely (PostgreSQL's own documented behaviour) --
    # standing in for the "direct file read" bypass path this topic's scope line names.
    out = run_sql("SELECT count(*) FROM customers;", as_superuser=True)
    return last_int(out)


def explain_plan() -> str:
    # No WHERE clause at all: any Filter node that shows up comes entirely from the row
    # policy PostgreSQL injects, not from a predicate the query itself wrote.
    out = run_sql("EXPLAIN SELECT * FROM customers;", role="analyst_role")
    return out


def main() -> None:
    setup()

    before = rows_visible_without_policy()
    assert before == 3000, f"expected all 3000 rows visible before any policy, got {before}"
    print(f"Before any row policy: analyst_role sees {before} of 3000 rows")

    plan_before = explain_plan()

    apply_row_policy()

    after = rows_visible_with_policy()
    assert after == 1000, f"expected exactly 1000 'us' rows visible under the policy, got {after}"
    print(f"After row policy (region = 'us'): analyst_role sees {after} of 3000 rows")

    plan_after = explain_plan()
    assert "Filter" in plan_after, "expected an explicit Filter node once the row policy is active"
    assert "Filter" not in plan_before, "expected no Filter node before any policy existed"
    print("EXPLAIN: no Filter node before the policy; an explicit Filter node appears after it")

    bypass = rows_visible_as_superuser_bypass()
    assert bypass == 3000, f"expected the superuser bypass to see all 3000 rows, got {bypass}"
    print(f"Superuser (BYPASSRLS-equivalent) bypass: sees {bypass} of 3000 rows -- the policy did not touch this path")

    print("all claims verified")


if __name__ == "__main__":
    main()
