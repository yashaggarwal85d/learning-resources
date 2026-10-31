"""The catalog-and-vending diagram, a row filter and a column mask against a real local stand-in,
and the bypass failure mode — reproduced against a real local PostgreSQL 16 instance.

Engine of record: PostgreSQL's own row-level security (RLS) and a masking view play the role of
a real catalog's row/column enforcement, since none of the five real catalogs (Lake Formation,
Unity Catalog, BigLake, Polaris, OneLake) can run in this sandbox — disclosed in OUTLINE.md's
"Changes from the chapter plan". The bypass failure mode is reproduced with a real Postgres role
that has the BYPASSRLS attribute, standing in for an engine handed the bucket's own bulk IAM role
instead of a catalog-vended, scoped credential — the same failure shape, a different storage
engine underneath it.
"""

import psycopg2

ADMIN_DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="localtest", dbname="postgres")
PREFIX = "lr_ch10_catalog_demo"


def _admin_conn():
    conn = psycopg2.connect(**ADMIN_DSN)
    conn.autocommit = True
    return conn


def _setup():
    with _admin_conn() as conn, conn.cursor() as cur:
        cur.execute(f"DROP TABLE IF EXISTS {PREFIX}_payroll CASCADE")
        cur.execute(f"DROP ROLE IF EXISTS {PREFIX}_east_analyst")
        cur.execute(f"DROP ROLE IF EXISTS {PREFIX}_west_analyst")
        cur.execute(f"DROP ROLE IF EXISTS {PREFIX}_bulk_engine")
        cur.execute(
            f"""
            CREATE TABLE {PREFIX}_payroll (
                id serial PRIMARY KEY,
                region text NOT NULL,
                employee text NOT NULL,
                salary numeric NOT NULL
            )
            """
        )
        cur.execute(
            f"INSERT INTO {PREFIX}_payroll (region, employee, salary) VALUES "
            "('east', 'Amara', 118000), ('east', 'Deepak', 97000), "
            "('west', 'Lin', 142000), ('west', 'Sofia', 88000)"
        )
        cur.execute(f"ALTER TABLE {PREFIX}_payroll ENABLE ROW LEVEL SECURITY")
        cur.execute(f"ALTER TABLE {PREFIX}_payroll FORCE ROW LEVEL SECURITY")
        cur.execute(
            f"""
            CREATE POLICY {PREFIX}_row_filter ON {PREFIX}_payroll
            USING (region = current_setting('{PREFIX}.region', true))
            """
        )
        # The catalog's own trusted engines: each gets a scoped, vended credential with no
        # bypass attribute, able to see only its own region's rows via the policy above.
        cur.execute(f"CREATE ROLE {PREFIX}_east_analyst LOGIN PASSWORD 'scoped'")
        cur.execute(f"CREATE ROLE {PREFIX}_west_analyst LOGIN PASSWORD 'scoped'")
        cur.execute(f"GRANT SELECT ON {PREFIX}_payroll TO {PREFIX}_east_analyst, {PREFIX}_west_analyst")
        # The bypass: an engine mistakenly handed the bucket's own bulk role, which carries
        # BYPASSRLS — the exact failure every one of the five real catalogs' docs warns about.
        cur.execute(f"CREATE ROLE {PREFIX}_bulk_engine LOGIN PASSWORD 'bulk' BYPASSRLS")
        cur.execute(f"GRANT SELECT ON {PREFIX}_payroll TO {PREFIX}_bulk_engine")


def _teardown():
    with _admin_conn() as conn, conn.cursor() as cur:
        cur.execute(f"DROP TABLE IF EXISTS {PREFIX}_payroll CASCADE")
        cur.execute(f"DROP ROLE IF EXISTS {PREFIX}_east_analyst")
        cur.execute(f"DROP ROLE IF EXISTS {PREFIX}_west_analyst")
        cur.execute(f"DROP ROLE IF EXISTS {PREFIX}_bulk_engine")


def catalog_and_vending_flow():
    """The four-step flow Lake Formation's own documentation names: get metadata, check
    permissions, get (scoped, temporary) credentials, get data. Modeled as a small state
    machine, not a real network call, since no real catalog runs here."""
    catalog_policy = {"east-analyst": "east", "west-analyst": "west"}

    def request_table_access(principal):
        if principal not in catalog_policy:
            return {"step": "check_permissions", "granted": False}
        scoped_region = catalog_policy[principal]
        vended_credential = {"region_filter": scoped_region, "ttl_seconds": 900}
        return {"step": "get_credentials", "granted": True, "vended_credential": vended_credential}

    east = request_table_access("east-analyst")
    unknown = request_table_access("intern-no-grant")
    assert east["granted"] is True and east["vended_credential"]["region_filter"] == "east"
    assert unknown["granted"] is False
    return {"east_analyst_flow": east, "unauthorized_flow": unknown}


def row_filter_scopes_visible_rows():
    """A real connection as the east-region analyst sees only east rows; the west analyst sees
    only west rows — enforced by the policy, not by the application code."""
    results = {}
    for region, role in (("east", f"{PREFIX}_east_analyst"), ("west", f"{PREFIX}_west_analyst")):
        conn = psycopg2.connect(host="127.0.0.1", port=5432, user=role, password="scoped", dbname="postgres")
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(f"SET {PREFIX}.region = %s", (region,))
            cur.execute(f"SELECT region FROM {PREFIX}_payroll")
            rows = cur.fetchall()
        conn.close()
        results[region] = sorted({r[0] for r in rows})

    assert results["east"] == ["east"]
    assert results["west"] == ["west"]
    return results


def column_mask_redacts_salary_for_unprivileged_role():
    """The east analyst's own connection reads real rows but through a masking view that
    redacts salary; an admin connection through the same view sees it unmasked."""
    with _admin_conn() as conn, conn.cursor() as cur:
        cur.execute(f"DROP VIEW IF EXISTS {PREFIX}_payroll_masked")
        cur.execute(
            f"""
            CREATE VIEW {PREFIX}_payroll_masked WITH (security_invoker = true) AS
            SELECT region, employee,
                   CASE WHEN current_user = 'postgres' THEN salary ELSE NULL END AS salary
            FROM {PREFIX}_payroll
            """
        )
        cur.execute(f"GRANT SELECT ON {PREFIX}_payroll_masked TO {PREFIX}_east_analyst")

    conn = psycopg2.connect(host="127.0.0.1", port=5432, user=f"{PREFIX}_east_analyst", password="scoped", dbname="postgres")
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(f"SET {PREFIX}.region = 'east'")
        cur.execute(f"SELECT employee, salary FROM {PREFIX}_payroll_masked")
        analyst_rows = cur.fetchall()
    conn.close()

    with _admin_conn() as conn, conn.cursor() as cur:
        cur.execute(f"SELECT employee, salary FROM {PREFIX}_payroll_masked")
        admin_rows = cur.fetchall()

    assert all(salary is None for _, salary in analyst_rows)
    assert {name for name, _ in analyst_rows} == {"Amara", "Deepak"}  # the row filter still applies through the view.
    assert any(salary is not None for _, salary in admin_rows)
    return {"analyst_sees": analyst_rows, "admin_sees": admin_rows}


def bypass_reads_everything_the_policy_was_supposed_to_hide():
    """An engine mistakenly handed the bulk BYPASSRLS role reads every row, every region,
    with no filter applied at all — the real failure, not a simulated one."""
    conn = psycopg2.connect(host="127.0.0.1", port=5432, user=f"{PREFIX}_bulk_engine", password="bulk", dbname="postgres")
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute(f"SELECT region, salary FROM {PREFIX}_payroll")
        rows = cur.fetchall()
    conn.close()

    regions_seen = sorted({r[0] for r in rows})
    assert regions_seen == ["east", "west"]  # both regions, despite never setting a region filter.
    assert len(rows) == 4  # all four rows, raw salary included, nothing masked.
    return {"regions_seen": regions_seen, "row_count": len(rows)}


def main():
    _setup()
    try:
        results = {
            "catalog_and_vending_flow": catalog_and_vending_flow(),
            "row_filter_scopes_visible_rows": row_filter_scopes_visible_rows(),
            "column_mask_redacts_salary_for_unprivileged_role": column_mask_redacts_salary_for_unprivileged_role(),
            "bypass_reads_everything_the_policy_was_supposed_to_hide": bypass_reads_everything_the_policy_was_supposed_to_hide(),
        }
        for name, value in results.items():
            print(f"{name}: {value}")
        return results
    finally:
        _teardown()


if __name__ == "__main__":
    main()
