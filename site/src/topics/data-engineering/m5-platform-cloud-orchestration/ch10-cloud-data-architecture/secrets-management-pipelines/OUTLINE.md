# Outline — de.secrets-management-pipelines

**Kind:** full, §10.1. About 15 minutes.

## Scope (full syllabus line)

"Managed secret stores and Vault, rotation without downtime (dual credentials), dynamic
short-lived database credentials, orchestrator secrets backends; never in images, notebooks or
DAG code."

- Clause 1: managed secret stores and Vault — what each provides beyond "a place to put a
  string" (access control, audit log, versioning).
- Clause 2: rotation without downtime (dual credentials).
- Clause 3: dynamic short-lived database credentials.
- Clause 4: orchestrator secrets backends.
- Clause 5: never in images, notebooks or DAG code.

## Outcomes

Explain what a managed secret store or Vault adds beyond storage. Design a dual-credential
rotation that causes zero downtime. Issue a dynamic, short-lived database credential and show
its automatic expiry. Name the three places a secret must never be committed and why each is
worse than the others.

## Engagement arc

- Hook: step 1 (a naive rotation locks out every in-flight pipeline run the instant the old
  password is revoked; replayed with a dual-credential rotation where nothing fails).
- Predict: step 2, within the first four steps.
- Takeaways: steps 4, 5, 6, 7 (four total, all at or after the midpoint). Step 3 (first
  non-predict step after the predict step) carries **no** takeaway (known Playwright "swipe from
  the caption" gotcha on phone — see team memory).
- Recap: step 8, **no** takeaway (per the recap-takeaway-squeeze gotcha).
- Prove it: step 9 (full topic).

## Storyboard (9 steps)

### 1. Hook — "One password, revoked at the exact wrong instant"
- Visual: two horizontal validity bars (credential A, credential B) over one timeline. The naive
  rotation shows A's bar ending exactly when B's begins, with a failure mark at every in-flight
  request that straddles the join. Replayed below with the bars overlapping — no mark lands in a
  gap.
- Narrator's line of thought: open on the failure as it actually happens in production — a
  rotation script updates the secret store and revokes the old password in the same breath, and
  every pipeline run holding that old password starts failing within seconds, mid-batch.
- No takeaway, no predict.

### 2. Predict — "What's the one change that prevents every one of those failures?"
- Predict question: "The rotation script in the hook did two things in one step: issue a new
  password, and revoke the old one. Which single change prevents every one of those in-flight
  failures, without giving up rotation entirely?" Options: "Rotate less often" (wrong — delays
  the same failure, doesn't prevent it) / "Keep both the old and new credential valid for an
  overlap window, cut the old one only after every consumer has moved" (correct) / "Make the
  rotation script run faster" (wrong — the race still exists, just narrower) / "Store the
  password in more places" (wrong — doesn't address the gap at all).
- Answer explain: an overlap window. The failure isn't about rotation being bad; it's about
  revoking the old credential at the same instant the new one appears, with zero time for
  anything still using the old one to notice. Keep both valid until every consumer has actually
  switched, and the exact same rotation causes nothing to fail.
- Visual: the hook's two timelines, now with the overlap window itself highlighted and labeled.

### 3. "A secret store is not just a place to put a string" — no takeaway
- Visual: one box labeled "the string itself" next to three labeled capabilities a managed
  secret store or Vault adds on top of it: access control, an audit log of every read, and
  versioning (with rollback to a prior version).
- Narrator's line of thought: name what you're actually buying. A secret manager or Vault isn't
  competing with "just an environment variable" on storage — it's competing on knowing who read
  a secret and when, being able to roll a compromised value back to a known-good one, and
  controlling exactly who can read which secret at all.
- No takeaway (reserved; the point lands as the capability list itself).

### 4. "Two roles, not one password, is the whole trick" — takeaway
- Visual: a real rotation reproduced against a local PostgreSQL instance. First, one role's
  password is changed in place — the old password stops authenticating on the very next
  connection attempt. Then the alternate version: a second role is created with the same
  privileges, both valid at once, and only after both can be reached is the first role's login
  revoked.
- Narrator's line of thought: this is the exact "alternating users" pattern AWS's own rotation
  Lambda uses for RDS — a cloned user, not an overwritten one. Nothing about the cloud provider's
  machinery is special; a role with no write access to the other role's password is enough.
- Takeaway: "Rotate by creating a second credential with the same access, not by overwriting the
  first — cut the old one only once everything has moved."

### 5. "A credential that expires without anyone revoking it" — takeaway
- Visual: a dynamic database credential, minted with its own expiry already attached. Before
  expiry, a connection using it succeeds. After expiry, the identical connection attempt fails —
  with nobody having run a revoke command in between.
- Narrator's line of thought: a static secret needs a human or a script to notice it should be
  retired. A dynamic credential is handed out with its own death date built in, so a forgotten
  consumer's credential simply stops working on schedule instead of staying valid forever by
  default.
- Takeaway: "A dynamic credential expires on its own schedule; nobody has to remember to revoke
  it for it to stop working."

### 6. "The orchestrator asks the real store, every time it runs" — takeaway
- Visual: a task's lookup order drawn as three stacked boxes it checks in a fixed sequence —
  the secrets backend first, then environment variables, then the metastore database — with the
  secrets backend lit up as the one actually answering.
- Narrator's line of thought: an orchestrator's own metastore is a database like any other, and
  anyone who can query it can read whatever was pasted into a connection string there. A secrets
  backend moves that lookup to task-run time, against the real store, so the metastore never has
  to hold the value at all.
- Takeaway: "An orchestrator's secrets backend is checked before its own metastore, so the real
  secret never has to live inside the orchestrator's own database."

### 7. "Three surfaces, one mistake" — takeaway
- Visual: a scanner run over two concrete artifacts — a Dockerfile's `ENV` line, a notebook
  cell's committed output — both lighting up as a caught credential, with a third box (DAG code)
  named alongside them.
- Narrator's line of thought: each of these three surfaces is worse than it looks at first
  glance. An image layer is cached and redistributed to every machine that ever pulls that image.
  A notebook's outputs get committed right along with its code, often without anyone noticing. A
  DAG file's literal string sits in version-control history forever, long after anyone remembers
  it's there.
- Takeaway: "A secret in an image layer, a notebook's committed output, or literal DAG code
  outlives the fix — each surface keeps the leak alive in its own way."

### 8. Recap — no takeaway
- Visual: pure HTML, 3 short lines: a secret store buys access control, audit and versioning;
  rotate by adding a second credential, not overwriting the first; a dynamic credential's own
  expiry beats a human remembering to revoke it.

### 9. Prove it — full-topic predict
- Predict question: a team's rotation script creates a second database role, waits five minutes,
  then revokes the first role's login — but one batch job that runs every six hours was still
  mid-run on the old role when its login got revoked. Did the dual-credential approach fail
  here, or something else?
- Options: "The dual-credential approach itself failed — overlap isn't enough" / "The overlap
  window was shorter than the thing it needed to outlast — a fixed five minutes, not 'until every
  consumer has actually finished'" (correct).
- Answer explain: the mechanism didn't fail; the window was sized wrong. "Overlap until every
  consumer has moved" means checking that nothing is still using the old credential, not picking
  a fixed delay and hoping it's long enough — a six-hour batch job needs a window that accounts
  for jobs that long, or a check that confirms the old role actually has zero active connections
  before it's revoked.

## Examples to execute (`examples.py`)

1. `naive_rotation_causes_inflight_failure` — against a real local PostgreSQL role, changing a
   password in place instantly breaks a connection attempt using the old one.
2. `dual_credential_rotation_avoids_inflight_failure` — two PostgreSQL roles, both valid through
   an overlap window; the old one only fails after it is deliberately revoked post-cutover.
3. `dynamic_credential_expires_automatically` — PostgreSQL's native `VALID UNTIL` as a local
   stand-in for a Vault-issued lease: a credential past its expiry fails with no separate revoke
   call; one still inside its window succeeds.
4. `secret_scan_catches_image_and_notebook_surfaces` — a real pattern scan catches a credential
   committed in a Dockerfile `ENV` line and in a notebook cell's committed output.

All four ran via `python3 examples.py` against a real local PostgreSQL 16 instance (`service
postgresql start`), and every assertion passed.

## Changes from the chapter plan

Vault itself is not installed in this sandbox (no internet-facing package mirror reachable for
it here, and running a long-lived Vault server is out of scope for a single topic's local
reproduction). The dual-credential rotation clause is reproduced exactly as planned, against a
real local PostgreSQL instance. The dynamic short-lived database credential clause is reproduced
using PostgreSQL's own native `VALID UNTIL` role clause as a local, disclosed stand-in for
Vault's lease-based dynamic-role mechanism — it demonstrates the same property (a credential
that stops working on its own schedule, with no separate revoke call) using a different, real
mechanism rather than a mocked one. Every claim about Vault itself in the reel and notes is
sourced, not demonstrated locally; this is disclosed again in FACT-CHECK.md and references.md.

## Concept ledger

- **Introduces:** `dual-credential-rotation`, `dynamic-short-lived-db-credential`.
- **Uses:** `short-lived-federated-credential`.
- **Declared:** basic familiarity with environment variables and container images.

## Bridge / handoff (verbatim from CHAPTER.md)

- **Bridge:** "A role answers who may act. A database password or a third-party key is a
  different kind of secret, one that has to exist somewhere between deployments — and this topic
  is where it should live, and how it gets replaced without an outage."
- **Handoff:** "Identity and secrets answer who can act and with what. Neither answers what any
  of this actually costs — and a pipeline that is perfectly secure and perfectly correct can
  still be a budget incident, which is where this section ends."

## Claims to fact-check

1. AWS Secrets Manager offers managed rotation (no Lambda function) and Lambda-function
   rotation, and the Lambda flow follows four named steps (createSecret, setSecret, testSecret,
   finishSecret) tracked by AWSPENDING/AWSCURRENT/AWSPREVIOUS staging labels.
2. AWS's own RDS "alternating users" rotation strategy creates a second, cloned database user
   rather than overwriting the first user's password in place.
3. Vault's dynamic roles issue a brand-new credential per lease that becomes invalid once the
   lease expires via Vault's internal revocation system; static roles are a separate mechanism
   that rotates an existing user's password on a schedule instead.
4. Azure Key Vault separates authentication (Entra ID) from authorization (RBAC or vault access
   policy), addresses secrets by versioned URI, and offers access logging as a distinct feature.
5. GCP Secret Manager models a secret as metadata plus many immutable versions, each
   individually addressable, with IAM roles separating who can access/manage/audit/rotate.
6. Airflow's secrets backend is checked first in a fixed, non-configurable search order (secrets
   backend, then environment variables, then the metastore database).
