"""Secret rotation reproduced against a real local PostgreSQL instance (not a cloud account; see
OUTLINE.md's engine-of-record note), plus a local scan demonstrating the "never in images,
notebooks or DAG code" clause. Vault itself isn't installed in this sandbox, so the dynamic
short-lived credential clause is reproduced with PostgreSQL's own native VALID UNTIL clause,
disclosed as a local stand-in for Vault's lease-based automatic invalidation.
"""

import re
from datetime import datetime, timedelta, timezone

import psycopg2

PG_DSN = dict(host="127.0.0.1", port=5432, user="postgres", password="localtest", dbname="postgres")
PREFIX = "lr_ch10_secrets_demo"


def _admin_conn():
    return psycopg2.connect(**PG_DSN)


def _can_connect(role, password):
    try:
        conn = psycopg2.connect(host="127.0.0.1", port=5432, user=role, password=password, dbname="postgres")
        conn.close()
        return True
    except psycopg2.OperationalError:
        return False


def _cleanup(roles):
    conn = _admin_conn()
    conn.autocommit = True
    cur = conn.cursor()
    for role in roles:
        cur.execute(f"DROP ROLE IF EXISTS {role}")
    conn.close()


def naive_rotation_causes_inflight_failure():
    """A naive rotation updates the one password a role has and nothing else. The instant that
    happens, every connection still holding the old password is locked out — reproducing the
    hook's mid-batch failure directly, with a real PostgreSQL authentication rejection, not a
    simulated one."""
    role = f"{PREFIX}_naive"
    old_password, new_password = "old_pw_123", "new_pw_456"
    _cleanup([role])
    conn = _admin_conn()
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f"CREATE ROLE {role} LOGIN PASSWORD %s", (old_password,))

    before_rotation = _can_connect(role, old_password)
    assert before_rotation is True

    cur.execute(f"ALTER ROLE {role} PASSWORD %s", (new_password,))

    old_password_now_fails = not _can_connect(role, old_password)
    new_password_works = _can_connect(role, new_password)
    assert old_password_now_fails is True
    assert new_password_works is True

    conn.close()
    _cleanup([role])
    return {"before_rotation": before_rotation, "old_password_now_fails": old_password_now_fails, "new_password_works": new_password_works}


def dual_credential_rotation_avoids_inflight_failure():
    """The fix: rotate by creating a second role (AWS's own "alternating users" pattern) with
    identical privileges, rather than overwriting the first role's password in place. Both
    credentials stay valid through an overlap window, so nothing that was already connected with
    the old one is ever locked out mid-rotation — only after every consumer has moved to the new
    role is the old one's login revoked."""
    role_a, role_b = f"{PREFIX}_a", f"{PREFIX}_b"
    password_a, password_b = "pw_a_123", "pw_b_456"
    _cleanup([role_a, role_b])
    conn = _admin_conn()
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f"CREATE ROLE {role_a} LOGIN PASSWORD %s", (password_a,))

    both_consumers_connected_before_cutover = _can_connect(role_a, password_a)
    assert both_consumers_connected_before_cutover is True

    cur.execute(f"CREATE ROLE {role_b} LOGIN PASSWORD %s", (password_b,))
    overlap_a_still_works = _can_connect(role_a, password_a)
    overlap_b_now_works_too = _can_connect(role_b, password_b)
    assert overlap_a_still_works is True
    assert overlap_b_now_works_too is True

    cur.execute(f"ALTER ROLE {role_a} NOLOGIN")
    after_cutover_a_fails = not _can_connect(role_a, password_a)
    after_cutover_b_still_works = _can_connect(role_b, password_b)
    assert after_cutover_a_fails is True
    assert after_cutover_b_still_works is True

    conn.close()
    _cleanup([role_a, role_b])
    return {
        "overlap_a_still_works": overlap_a_still_works,
        "overlap_b_now_works_too": overlap_b_now_works_too,
        "after_cutover_a_fails": after_cutover_a_fails,
        "after_cutover_b_still_works": after_cutover_b_still_works,
    }


def dynamic_credential_expires_automatically():
    """A local stand-in for Vault's lease-based dynamic credential: PostgreSQL's native VALID
    UNTIL clause issues a credential that stops authenticating on its own once its expiry passes
    — no separate revoke call needed, the same hands-off expiry Vault's lease gives a dynamic
    role."""
    role = f"{PREFIX}_dynamic"
    password = "dynamic_pw_123"
    _cleanup([role])
    conn = _admin_conn()
    conn.autocommit = True
    cur = conn.cursor()

    already_expired = datetime.now(timezone.utc) - timedelta(seconds=5)
    cur.execute(f"CREATE ROLE {role} LOGIN PASSWORD %s VALID UNTIL %s", (password, already_expired.isoformat()))
    expired_credential_fails = not _can_connect(role, password)
    assert expired_credential_fails is True

    cur.execute(f"ALTER ROLE {role} VALID UNTIL %s", ((datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),))
    unexpired_credential_works = _can_connect(role, password)
    assert unexpired_credential_works is True

    conn.close()
    _cleanup([role])
    return {"expired_credential_fails": expired_credential_fails, "unexpired_credential_works": unexpired_credential_works}


def secret_scan_catches_image_and_notebook_surfaces():
    """A simple, real pattern scan over two concrete surfaces named by the chapter's own scope:
    a Dockerfile layer's committed `ENV` line, and a Jupyter notebook cell's committed output —
    both catch a plaintext credential, demonstrating why each surface is a real leak, not a
    theoretical one."""
    secret_pattern = re.compile(r"(password|secret|api_key)\s*=\s*['\"]?[\w\-]{6,}", re.IGNORECASE)

    dockerfile_layer = 'ENV DATABASE_PASSWORD="S3cretProd2026"\nRUN pip install psycopg2\n'
    notebook_cell_output = '{"output_type": "stream", "text": "connecting with api_key=sk_live_abc123xyz789\\n"}'

    image_layer_flagged = bool(secret_pattern.search(dockerfile_layer))
    notebook_output_flagged = bool(secret_pattern.search(notebook_cell_output))
    assert image_layer_flagged is True
    assert notebook_output_flagged is True
    return {"image_layer_flagged": image_layer_flagged, "notebook_output_flagged": notebook_output_flagged}


def main():
    results = {}
    results["naive_rotation_causes_inflight_failure"] = naive_rotation_causes_inflight_failure()
    results["dual_credential_rotation_avoids_inflight_failure"] = dual_credential_rotation_avoids_inflight_failure()
    results["dynamic_credential_expires_automatically"] = dynamic_credential_expires_automatically()
    results["secret_scan_catches_image_and_notebook_surfaces"] = secret_scan_catches_image_and_notebook_surfaces()
    for name, value in results.items():
        print(f"{name}: {value}")
    print("\nAll examples passed.")


if __name__ == "__main__":
    main()
