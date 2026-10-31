# Outline — de.workload-identity-least-privilege

**Kind:** full, §10.1. About 15 minutes.

## Scope (full syllabus line)

"Roles over users, short-lived federated credentials (EKS Pod Identity/IRSA, GKE Workload
Identity Federation, Entra workload identity) instead of static keys, trust policies,
permission boundaries and org-level guardrails (SCPs), `PassRole`-style escalation paths,
separating raw vs curated access by role."

- Clause 1: roles over users — a role has no long-lived credential of its own.
- Clause 2: short-lived federated credentials (EKS Pod Identity/IRSA, GKE Workload Identity
  Federation, Entra workload identity) instead of a static key.
- Clause 3: trust policies, permission boundaries, and org-level guardrails (SCPs) as distinct
  ceilings.
- Clause 4: `PassRole`-style escalation and the fix.
- Clause 5: separating raw vs curated access by role.

## Outcomes

Explain why a short-lived federated credential is strictly safer than a static key and name the
specific mechanism on at least two clouds. Distinguish a trust policy from a permission policy
and from a permission boundary. Reproduce a `PassRole`-style escalation and close it with a
Resource-scoped statement. Design separate raw and curated access roles.

## Engagement arc

- Hook: step 1 (a stolen static key that still works two years later, versus a stolen federated
  credential that already expired nine minutes ago and never touched curated data).
- Predict: step 2, within the first four steps.
- Takeaways: steps 4, 5, 6, 7 (four total, all at or after the midpoint). Step 3 (first
  non-predict step after the predict step) carries **no** takeaway (known Playwright "swipe
  from the caption" gotcha on phone — see team memory).
- Recap: step 8, **no** takeaway (per the recap-takeaway-squeeze gotcha: only give recap its own
  takeaway when it's one of the engagement arc's required ones, which it isn't here).
- Prove it: step 9 (full topic).

## Storyboard (9 steps)

### 1. Hook — "A key that never expires, a credential that already has"
- Visual: two timelines side by side. A static access key's validity bar stretches unbroken for
  two years, covering one wide box labeled "raw + curated." A federated credential's validity
  bar is a row of short ticks that keep resetting, each tick scoped to one narrow box
  ("raw only").
- Narrator's line of thought: open on the same breach happening to both. A contractor's laptop
  with a static key pasted into a `.env` file two years ago is stolen; the key still works,
  because nothing ever rotated or scoped it, and it reaches both raw and curated data. Replay
  the identical theft against a workload-identity design: the credential the thief finds already
  expired nine minutes ago, and it never touched curated data at all.
- No takeaway, no predict.

### 2. Predict — "What made the difference?"
- Predict question: "The same laptop theft happened in both halves of the hook. What property of
  the second credential — not of the thief, not of the laptop — is the entire reason the breach
  did almost no damage?" Options: "It was encrypted on disk" / "It was short-lived and scoped to
  one role" (correct) / "The attacker was less skilled the second time" / "The laptop had a
  firewall". Wrong-option temptation: a learner used to thinking about breach prevention as
  endpoint hardening reaches for encryption or a firewall — neither explains why the credential
  itself was useless to the thief.
- Answer explain: Short-lived and scoped. A federated credential is minted fresh, expires in
  minutes to hours, and is scoped to exactly the role a workload assumed — never written to disk
  by a human. The laptop's own security posture is irrelevant once the thing worth stealing from
  it expires before anyone even notices it's missing.
- Visual: the same two timelines from the hook, now with the federated credential's validity
  window highlighted and labeled with its lifetime.

### 3. "Three clouds, the same broker pattern" — no takeaway
- Visual: one shared diagram — workload → proves identity to a broker → broker hands back a
  short-lived credential — with each cloud's own naming filled into the same three boxes: AWS
  (IRSA / EKS Pod Identity), GKE (Workload Identity Federation), Azure (Entra workload identity
  federation).
- Narrator's line of thought: name the mechanism once, then show it's the same shape everywhere.
  A Kubernetes service account token (or a platform-issued identity) proves who a workload is to
  a broker; the broker hands back a credential that expires in minutes to hours. AWS has two
  versions of this (the older OIDC-based IRSA, and the newer, simpler EKS Pod Identity); GKE and
  Azure each have their own name for the identical exchange.
- No takeaway (reserved; the point lands as the shared-shape observation itself, not a numeric
  claim).

### 4. "A trust policy answers one question; a permission policy answers another" — takeaway
- Visual: two independent gates in sequence on one role — "who may assume this role" (trust
  policy) and "what may it then do" (permission policy) — both must open for a credential to do
  anything.
- Narrator's line of thought: a trust policy and a permission policy are not two names for the
  same thing. The trust policy decides who may even become this role for a moment; the
  permission policy decides what that role, once assumed, is actually allowed to do. Getting
  either one wrong breaks the role in a different way.
- Takeaway: "A role's trust policy (who may assume it) and its permission policy (what it may
  then do) are two independent gates, not one."

### 5. "A boundary and an org guardrail are the same idea, drawn at different sizes" — takeaway
- Visual: a permission policy's allowed region intersected with a smaller permission-boundary
  region for one entity; then the same intersection redrawn at the account level as an SCP
  covering every entity in the account, including its root user.
- Narrator's line of thought: a permission boundary never grants anything by itself — it only
  caps what an identity-based policy is allowed to grant, by intersection. An SCP is the exact
  same cap, just drawn around an entire account instead of one role, and it reaches even that
  account's own root user.
- Takeaway: "A permission boundary and an SCP never grant access; both only cap what an identity
  policy can grant, by intersection — one entity at a time, or a whole account at once."

### 6. "The escalation, reproduced — and closed" — takeaway
- Visual: a local policy evaluator runs twice. First with `iam:PassRole` scoped to `Resource:
  "*"` — a low-privilege principal passes an admin-permissioned role to a launched resource, and
  the resource ends up with every one of that role's permissions. Second with the Resource
  element scoped to an approved naming pattern — the identical attempt to pass the admin role is
  rejected, while passing an actually-approved low-privilege role still works.
- Narrator's line of thought: this is not a hypothetical. AWS's own documentation names this
  exact path and its own fix. A principal that can create a resource and hand it a role ends up
  with that role's permissions by proxy — unless the Resource element of the PassRole statement
  is scoped down to only the roles that principal should ever be allowed to pass.
- Takeaway: "`iam:PassRole` scoped to `Resource: \"*\"` lets any launch escalate to any role's
  permissions; scoping Resource to an approved pattern is the fix, not a permission boundary on
  the user."

### 7. "Raw and curated are never the same role" — takeaway
- Visual: two boxes, "raw role" and "curated role," with disjoint permission sets; a breach
  arrow hits the raw box and visibly stops at its boundary, never reaching the curated box.
- Narrator's line of thought: this is the first concrete payoff of separating roles by layer. A
  role scoped to raw data and a role scoped to curated data share nothing, so a credential
  stolen for one of them is simply the wrong key for the other door.
- Takeaway: "A role scoped to raw data and a role scoped to curated data should share zero
  permissions — so a breach of one role is not a breach of the other."

### 8. Recap — no takeaway
- Visual: pure HTML, 3 short lines (lesson from topic 3's squeeze gotcha): roles over static
  keys; trust vs permission vs boundary vs SCP as four distinct gates; PassRole's fix is scoping
  Resource, not a blanket deny.
- Narrator's line of thought: compress the whole topic into what to actually do differently
  tomorrow, then hand off to the next question.

### 9. Prove it — full-topic predict
- Predict question: a team gives a CI service account `iam:PassRole` with `Resource: "*"` so it
  can launch any of the team's pre-approved deployment roles, reasoning that the roles
  themselves are already least-privilege. Is this safe?
- Options: "Yes — the roles being least-privilege is what matters" / "No — Resource: \"*\" still
  lets that account pass *any* role in the account, not just the approved ones, including one
  created later with more permissions" (correct).
- Answer explain: the roles being least-privilege today says nothing about every role that will
  ever exist in that account. `Resource: "*"` on PassRole means the moment anyone creates a
  higher-privileged role for an unrelated purpose, this same CI account can pass it too — the
  exact gap step 6 closed, reopened by a policy that looked safe at the time it was written.

## Examples to execute (`examples.py`)

1. `passrole_wildcard_resource_allows_escalation` — a `Resource: "*"` PassRole statement lets a
   low-privilege principal escalate via a passed admin role.
2. `passrole_scoped_resource_blocks_escalation` — the same principal, with Resource scoped to an
   approved naming pattern, can no longer pass the admin role but can still pass an approved one.
3. `permission_boundary_caps_effective_permissions` — AWS's own Shirley example: an identity
   policy's `iam:CreateUser` grant is excluded by a boundary that doesn't cover IAM.
4. `scp_caps_account_even_with_full_identity_policy` — a full-access identity policy is still
   capped down to exactly an SCP's allow-set.
5. `raw_vs_curated_role_separation` — two roles' permission sets have zero overlap, so a breach
   of one never reaches the other.

All five ran via `python3 examples.py` and every assertion passed.

## Changes from the chapter plan

None. No real cloud account is used anywhere in this topic — the PassRole escalation, the
permission-boundary cap and the SCP cap are each a local policy-evaluator simulation, exactly as
CHAPTER.md's own plan calls for ("reproduced as a minimal local simulation (not a real cloud
account)").

## Concept ledger

- **Introduces:** `short-lived-federated-credential`, `role-trust-vs-permission`,
  `passrole-escalation-boundary`.
- **Uses:** `failure-domain-blast-radius`.
- **Declared:** basic IAM vocabulary (a role, a policy, a principal).

## Bridge / handoff (verbatim from CHAPTER.md)

- **Bridge:** "Everything so far has been about data sitting still. This topic and the next are
  about who is allowed to touch it: starting with identity, because the alternative to a role
  assumed for minutes is a key that sits in a notebook forever."
- **Handoff:** "A role answers who may act. It says nothing about the other kind of secret a
  pipeline needs — a database password, a third-party API key — which has to live somewhere
  between deployments, and that somewhere is its own discipline."

## Claims to fact-check

1. IRSA maps an IAM role to a Kubernetes service account via an OIDC provider; the private
   signing key rotates every 7 days.
2. EKS Pod Identity is OIDC-free and uses one reusable IAM principal
   (`pods.eks.amazonaws.com`) instead of a per-cluster OIDC provider.
3. GKE Workload Identity Federation creates a fixed per-project workload identity pool
   (`PROJECT_ID.svc.id.goog`); enabling it alone grants no IAM permissions.
4. Entra workload identity federation names Kubernetes (including non-Azure clusters) as a
   supported external-workload scenario, and the token-exchange workflow is the same across
   every supported scenario.
5. A permissions boundary limits but never grants permissions; effective permissions are the
   intersection of an identity-based policy and the boundary.
6. An SCP never grants permissions either, and restricts even a member account's root user; it
   does not apply to the organization's management account.
7. `iam:PassRole` is the specific, documented mechanism AWS names for the escalation where a
   principal that can create a resource and pass it an over-permissioned role gains that role's
   permissions by proxy; scoping the Resource element of the PassRole statement is AWS's own
   named fix.
