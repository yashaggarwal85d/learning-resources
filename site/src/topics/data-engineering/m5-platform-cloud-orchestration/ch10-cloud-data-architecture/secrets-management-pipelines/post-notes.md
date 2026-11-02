---
id: de.secrets-management-pipelines
title: 'Secrets management for pipelines'
---

<section data-section="outcomes">

## Outcomes

- Explain what a managed secret store or Vault adds beyond storage.
- Design a dual-credential rotation that causes zero downtime.
- Issue a dynamic, short-lived database credential and show its automatic expiry.
- Name the three places a secret must never be committed and why each is worse than the others.

</section>

<section data-section="internals">

## Internals

- **AWS's own rotation Lambda names the dual-credential pattern directly.** The four-step rotation function (createSecret, setSecret, testSecret, finishSecret) tracks which version is which with AWSPENDING/AWSCURRENT/AWSPREVIOUS staging labels, and for RDS MySQL "in alternating users rotation, Secrets Manager creates a cloned user" rather than overwriting the existing one in place — the exact mechanism this topic reproduces against a real local PostgreSQL instance.
- **Vault's dynamic roles and static roles solve two different problems.** A dynamic role issues a brand-new credential per lease, invalidated automatically by Vault's own revocation system once that lease expires. A static role is a 1-to-1 mapping to an existing database user whose password Vault rotates on a schedule — it's still one shared credential, just one Vault manages the rotation of, not a freshly-minted one per consumer.
- **Vault itself isn't installed in this sandbox** (disclosed in OUTLINE.md's "Changes from the chapter plan"). Every claim about Vault's own behavior here is sourced from HashiCorp's documentation, not demonstrated directly. The dynamic-credential *property* — a credential that stops working on its own schedule with no separate revoke call — is reproduced instead with PostgreSQL's native `VALID UNTIL` role clause, a real mechanism with the same effect, not a mock.
- **Azure Key Vault and GCP Secret Manager both separate "who can read a secret" from "who can see that it was read."** Azure splits authentication (Entra ID) from authorization (RBAC or vault access policy); GCP's IAM roles let an organization "segregate responsibilities for accessing, managing, auditing, and rotating secrets" as genuinely separate permissions, not one all-or-nothing grant.
- **Airflow's lookup order is fixed, not configurable.** "If you enable an alternative secrets backend, it will be searched first, followed by environment variables, then metastore. This search ordering is not configurable" — so once a secrets backend is enabled, nothing in the metastore can silently shadow it.

</section>

<section data-section="production">

## Production

A common, real-shaped incident: an on-call engineer writes a rotation script that does the obvious thing — generate a new password, write it to the secret store, and immediately revoke the old one so no stale credential lingers. The first time it runs during business hours, every in-flight pipeline run holding the old password starts failing within seconds, mid-batch, with no warning. The on-call fix in the moment is almost always to roll the password back, which just delays the next identical failure. The fix a team converges on is the one this topic reproduces directly: rotate by creating a second credential with the same access, and only revoke the first one once there's actual confirmation — not a guessed delay — that nothing is still using it.

</section>

<section data-section="frontier">

## Frontier

This topic's identity-and-secrets framing (who may act, and what secret that role still needs that isn't replaced by identity alone) feeds the chapter's own 10.1 lab and a later topic's closing architecture decision record, both of which treat "where does this credential live, and how does it get replaced" as a design decision made here, not re-derived from scratch.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Identity and secrets answer who can act and with what. Neither answers what any of it actually costs — and a pipeline that is perfectly secure and perfectly correct can still be a budget incident, which is where this section turns next.

</section>
