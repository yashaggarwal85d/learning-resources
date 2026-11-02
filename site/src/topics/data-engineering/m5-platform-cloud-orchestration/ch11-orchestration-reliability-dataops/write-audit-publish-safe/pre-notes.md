# Before you watch

- **WAP (write-audit-publish)** — write a change somewhere production can't see yet, audit it there, and only publish once the audit passes.
- **Audit branch** — an Iceberg branch holding the unpublished write, independent of main's own snapshot history.
- **Fast-forward** — promoting main straight to the audit branch's head, legal only when main's current snapshot is still an ancestor of it.
- **Blue-green table** — two full copies of a table, one live and one being rebuilt, swapped with a single atomic pointer update.
- **Shadow run** — a new pipeline version run in parallel with the old one, diffed against its real output before any traffic moves.
- **Canary rollout** — a change measured on one partition or tenant first, expanded only while every partition it reaches still looks healthy.
- **Feature flag** — a toggle that switches a transform's logic without a redeploy, including instantly back off.
- **Time travel** — rolling a table back to an exact prior snapshot in one operation, rather than a manual row-by-row undo.
