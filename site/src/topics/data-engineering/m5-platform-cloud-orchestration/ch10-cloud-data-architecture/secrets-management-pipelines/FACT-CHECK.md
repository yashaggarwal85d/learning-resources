# FACT-CHECK: Secrets management for pipelines

Self-review, fact-check and red team, 2026-10-31. Each row re-derives the claim from the fetched
source text in `sources/`, checks the quote actually supports it, and tries to break it with an
edge case.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | AWS Secrets Manager offers managed rotation (no Lambda function) and Lambda-function rotation, and the Lambda flow follows four named steps tracked by staging labels. | Confirmed | `sources/aws-secrets-rotation.txt` (the two mechanisms); `sources/aws-lambda-functions.txt` (createSecret/setSecret/testSecret/finishSecret, each quoted; AWSPENDING/AWSCURRENT/AWSPREVIOUS). |
| 2 | AWS's own RDS "alternating users" rotation strategy creates a second, cloned database user rather than overwriting the first user's password in place. | Confirmed | `sources/aws-lambda-functions.txt`: "For Amazon RDS MySQL, in alternating users rotation, Secrets Manager creates a cloned user with a name no longer than 16 characters." Red-team check: re-derived this directly as the dual-credential mechanism reproduced in `examples.py` (two roles, not one role with two passwords) rather than assuming Postgres behaves identically to RDS MySQL's specific cloning mechanics. |
| 3 | Vault's dynamic roles issue a brand-new credential per lease that becomes invalid once the lease expires via Vault's internal revocation system; static roles are a separate mechanism that rotates an existing user's password on a schedule instead. | Confirmed | `sources/vault-db-secrets-engine.txt`: "generates database credentials dynamically based on configured roles"; "Vault makes use of its own internal revocation system to ensure that users become invalid within a reasonable time of the lease expiring"; the static-roles quotes (1-to-1 mapping, scheduled password rotation). Red-team check: Vault itself is not installed in this sandbox (disclosed in OUTLINE.md), so this claim is sourced-only; `examples.py`'s `dynamic_credential_expires_automatically` reproduces the same *property* (self-expiring credential, no separate revoke) with PostgreSQL's own `VALID UNTIL`, not a claim about Vault's internals being demonstrated directly. |
| 4 | Azure Key Vault separates authentication (Entra ID) from authorization (RBAC or vault access policy), addresses secrets by versioned URI, and offers access logging as a distinct feature. | Confirmed | `sources/azure-key-vault-overview.txt`, all three quoted verbatim. |
| 5 | GCP Secret Manager models a secret as metadata plus many immutable versions, each individually addressable, with IAM roles separating who can access/manage/audit/rotate. | Confirmed | `sources/gcp-secret-manager-overview.txt`, both quoted verbatim ("A secret version stores the actual secret data... Each version is identified by a unique ID"; "you can segregate responsibilities for accessing, managing, auditing, and rotating secrets"). |
| 6 | Airflow's secrets backend is checked first in a fixed, non-configurable search order (secrets backend, then environment variables, then the metastore database). | Confirmed | `sources/airflow-secrets-backend.txt`: "If you enable an alternative secrets backend, it will be searched first, followed by environment variables, then metastore. This search ordering is not configurable." |

## Red team on the predict question (step 2)

Edge case tried: could a learner object that "rotate less often" is a legitimate fix too, since
fewer rotations mean fewer chances to hit the race? Checked against the hook's own mechanism:
the race exists at every single rotation regardless of frequency — rotating less often only
makes the failure rarer, never impossible, and it trades safety (slower-to-replace credentials)
for a cosmetic reduction in how often the bug is hit. The wrong-option explain text names this
distinction (delaying vs. preventing) directly rather than just marking it wrong.

## Red team on step 9's reproduction

Edge case tried: does the prove-it scenario risk implying the dual-credential pattern is
unreliable in general? Checked the wording of the answer explain against the actual failure
mode: the scenario is deliberately built so the fix is "size the overlap window to the actual
consumer, or check for zero active connections," not "add a third credential" or "abandon
dual-credential rotation." This keeps the lesson about correctly implementing the mechanism
step 4 and step 5 already established, not about those mechanisms being insufficient.

## Outcome

No claim dropped. Vault's own internals (step 5's sourced comparison) are disclosed as
sourced-only; the dynamic-credential *property* it demonstrates is reproduced with PostgreSQL's
native `VALID UNTIL`, not Vault itself, exactly as OUTLINE.md's "Changes from the chapter plan"
discloses. All four `examples.py` reproductions ran against a real local PostgreSQL 16 instance
and their asserted values are the ones shown on screen.
