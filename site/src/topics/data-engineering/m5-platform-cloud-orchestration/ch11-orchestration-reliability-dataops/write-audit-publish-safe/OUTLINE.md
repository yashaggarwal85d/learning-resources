# Outline: Write-audit-publish and safe deploys

1. **Hook** — a bad transformation deployed straight to production silently corrupts a week of data before anyone notices; the same bad transformation run through a WAP publish fails its audit in minutes, and production is never touched.
2. **Predict: does catching a bug before the merge mean it's safe at deploy time?** Slim CI (the prior topic) proves a change is safe before it merges. Is that the same guarantee as safe at the moment it reaches production?
   - Answer: no — a change can pass every pre-merge test and still corrupt production the moment it writes, which is a different failure this topic protects against.
3. **Reveal: write to an audit branch** — the write happens somewhere production can't see yet, independent of the main table's history.
4. **Reveal: audit, then fast-forward or block** — a real audit runs against the branch; only a pass fast-forwards main to it, demonstrated with both a good write that reaches production and a bad write that never does.
5. **Predict: does a table-level deploy need the same care as an application deploy?** Blue-green and canary are known patterns for application deploys.
   - Answer: yes — a table swap or a canary-by-partition rollout work the same way at the table level, with the same measured safety.
6. **Reveal: blue-green tables and a canary rollout** — one atomic pointer swap between two full copies; a change measured on one partition before it expands to the rest.
7. **Reveal: a shadow run, diffed before cutover** — a new pipeline version runs in parallel, diffed against the old one's real output, catching a regression with zero production traffic ever touched.
8. **Reveal: a feature-flagged transform and time-travel rollback** — new logic toggled without a redeploy; a bad publish undone in one operation back to the exact prior snapshot.
9. **Recap** — six mechanisms, one shared idea: never let an unverified change touch what consumers actually read.
10. **Prove it** — a real audit branch write, audited for real, for both a good batch and a deliberately bad one, and only one of them ever reaches the shop's own production table.

## Internals / Frontier
- Internals: fast-forward is only legal when main's current snapshot is still an ancestor of the audit branch's — the same rule a git fast-forward merge follows, and the reason a stale main has to be handled differently (a real merge, not a fast-forward).
- Frontier: a true zero-copy branch (the chapter's one skipped syllabus entry) is what an Iceberg audit branch approximates; the diff technique the audit step runs is topic 16's, used not re-taught; Chapter 6's own snapshot/time-travel mechanics are used, not re-taught.
