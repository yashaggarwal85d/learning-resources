"""Examples for de.row-column-security-dynamic."""

CUSTOMERS = [
    {"id": 1, "region": "us", "email": "alice@example.com", "ssn": "111-11-1111"},
    {"id": 2, "region": "us", "email": "bob@example.com", "ssn": "222-22-2222"},
    {"id": 3, "region": "eu", "email": "carla@example.com", "ssn": "333-33-3333"},
    {"id": 4, "region": "eu", "email": "dima@example.com", "ssn": "444-44-4444"},
    {"id": 5, "region": "apac", "email": "eve@example.com", "ssn": "555-55-5555"},
]


def row_policy_filter(rows, allowed_region):
    """A row policy: keep only rows whose region matches the caller's region."""
    return [r for r in rows if r["region"] == allowed_region]


def column_mask(rows, role):
    """A column mask: anyone who isn't admin sees a redacted email and ssn."""
    masked = []
    for r in rows:
        copy = dict(r)
        if role != "admin":
            copy["email"] = "REDACTED"
            copy["ssn"] = "REDACTED"
        masked.append(copy)
    return masked


def masked_query_through_engine(rows, role, allowed_region):
    """The normal path: the engine applies the row policy, then the column mask,
    to every query, whoever sends it."""
    return column_mask(row_policy_filter(rows, allowed_region), role)


def direct_file_read_bypass(rows):
    """Reading the table's underlying files (e.g. straight from the bucket) skips
    the engine entirely -- no row policy, no column mask."""
    return rows


def unprotected_derived_table_bypass(rows):
    """A materialized view built before the mask existed: it was populated by a
    query that ran before the policy was added, so it carries the original
    values -- the engine treats it as a plain table now, with no link back to
    the mask on the base table."""
    return [dict(r) for r in rows]


def extract_taken_before_mask_bypass(rows):
    """A CSV export taken last month, before today's mask was added, carries
    whatever the export query returned at the time -- unmasked."""
    return [dict(r) for r in rows]


def rows_examined(rows, allowed_region, pushed_down):
    """A stand-in for EXPLAIN's rows-examined counter: a pushed-down row policy
    filters at the scan; one that isn't pushed down scans every row first and
    filters after."""
    if pushed_down:
        return len(row_policy_filter(rows, allowed_region))
    return len(rows)


def main():
    analyst_view = masked_query_through_engine(CUSTOMERS, role="analyst", allowed_region="us")
    assert len(analyst_view) == 2
    assert all(c["email"] == "REDACTED" and c["ssn"] == "REDACTED" for c in analyst_view)

    admin_view = masked_query_through_engine(CUSTOMERS, role="admin", allowed_region="us")
    assert all(c["email"] != "REDACTED" for c in admin_view)

    direct_read = direct_file_read_bypass(CUSTOMERS)
    assert direct_read[0]["ssn"] == "111-11-1111"

    stale_view = unprotected_derived_table_bypass(CUSTOMERS)
    assert any(c["ssn"] != "REDACTED" for c in stale_view)

    old_export = extract_taken_before_mask_bypass(CUSTOMERS)
    assert any(c["ssn"] != "REDACTED" for c in old_export)

    pushed = rows_examined(CUSTOMERS, allowed_region="us", pushed_down=True)
    not_pushed = rows_examined(CUSTOMERS, allowed_region="us", pushed_down=False)
    assert pushed == 2
    assert not_pushed == 5

    print(f"analyst query: {len(analyst_view)} row(s), email and ssn masked")
    print(f"admin query: {len(admin_view)} row(s), nothing masked")
    print(f"direct file read bypass: ssn={direct_read[0]['ssn']!r}")
    print(f"stale materialized view bypass: ssn values={[c['ssn'] for c in stale_view]}")
    print(f"old export bypass: ssn values={[c['ssn'] for c in old_export]}")
    print(f"rows examined, pushed down: {pushed}; not pushed down: {not_pushed}")


if __name__ == "__main__":
    main()
