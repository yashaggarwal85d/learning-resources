# FACT-CHECK — de.branches-tags-write-audit

## Claims table

| # | Claim | Step | Source | Status |
|---|---|---|---|---|
| 1 | A real tag and a real branch were created from the same snapshot in this sandbox | 3 | Executed: `examples.py` `demo_tag_and_branch_from_same_snapshot` asserts `refs["released-v1"].snapshot_id == refs["audit"].snapshot_id == refs["main"].snapshot_id` on a freshly reloaded table | Verified |
| 2 | Both were created through pyiceberg's own public API, not a workaround | 3 | Executed: `table.manage_snapshots().create_tag(...).create_branch(...).commit()` — a real, documented pyiceberg API (`pyiceberg.table.ManageSnapshots`) | Verified |
| 3 | Tags are labels for individual snapshots; branches are mutable named references | 4 | Apache Iceberg Table Spec, quoted in SOURCES.md | Verified, sourced |
| 4 | Writing to the audit branch does not move `main` | 6 | Executed: asserted `audit_snapshot_id != main_snapshot_id_before` and `main_ids_before == list(range(5))` directly after the branch-scoped append | Verified |
| 5 | The branch-scoped write used pyiceberg's own public `branch=` parameter on `append()` | 6 | Executed: `table.append(data, branch="audit")` — a real, documented keyword argument (`inspect.signature` confirms it exists on `Table.append`/`Transaction.append`) | Verified |
| 6 | A real validation check (duplicate-id detection) was run against the staged branch before publishing | 7 | Executed: `validation_passed = len(staged_ids) == len(set(staged_ids))`, asserted true before the fast-forward proceeds | Verified |
| 7 | `main` was fast-forwarded to the validated branch's snapshot through a real public API | 7 | Executed: `table.manage_snapshots().set_current_snapshot(ref_name="audit")`, then asserted `published.metadata.current_snapshot_id == audit_snapshot_id` | Verified |
| 8 | The project's own procedures documentation names this exact mechanism: fast-forwarding one branch's snapshot to another's | 7 | Apache Iceberg Spark Procedures (`fast_forward`), quoted in SOURCES.md | Verified, sourced |
| 9 | The tag created in step 3 is unaffected by the publish in step 7 | 7 | Executed (implied by the flow): the tag's ref is never touched by `set_current_snapshot(ref_name="audit")`, which only reassigns `main`; not independently re-asserted after the publish, a scope note (see red-team #2) | Disclosed |
| 10 | A second write-audit-publish attempt, reintroducing a duplicate id, genuinely fails validation | 8 | Executed: `validation_passed` computed the same way, asserted false (`assert not validation_passed`) | Verified |
| 11 | The rejected batch never reaches `main` | 8 | Executed: asserted `final.metadata.refs["main"].snapshot_id == current_main_id` after discarding the branch | Verified |
| 12 | Iceberg views are a distinct kind of catalog object, with their own metadata and version history, holding no data of their own | 9 | Apache Iceberg View Spec, quoted in SOURCES.md | Sourced only, not built (see scope boundary) |
| 13 | Multi-table branching is a catalog-level feature (§6.3.4), not demonstrated here | 9 | CHAPTER.md's own forward-pointer note for this topic, carried into FACT-CHECK as a stated scope boundary, not a sourced claim | Disclosed, named only |

## Red-team

1. **The "bad" batch's rejection is a real, executed assertion, not a described outcome.** Step 8
   genuinely builds a second branch from the table's then-current `main`, genuinely appends a
   batch containing a duplicate id, genuinely computes the same validation check used in step 7,
   and genuinely asserts it fails before discarding the branch and re-checking `main`'s snapshot
   id is unchanged. Nothing about the rejection is asserted without first being produced.

2. **The tag's post-publish state is not independently re-verified by its own assertion.** Step 7
   fast-forwards only the `main` ref; `manage_snapshots().set_current_snapshot(ref_name="audit")`
   has no path to touching any other ref, so the tag's immutability here follows from the API's
   own documented behavior (SOURCES.md: tags are "labels for individual snapshots," only
   `main`/branches move) rather than from a dedicated post-publish assertion in `examples.py`.
   This is a minor gap, disclosed rather than silently assumed: a stricter version of this script
   would re-load the table after the publish and assert `refs["released-v1"].snapshot_id` is
   still the original value.

3. **No official Apache Iceberg project page documents "write-audit-publish" as a named pattern
   with that exact phrase.** The project's own Spark procedures page documents the mechanism
   (`fast_forward`, `publish_changes`, a `wap_id` table property) without using the three-word
   phrase as a section heading; third-party vendor write-ups (AWS, Dremio, lakeFS) use the WAP
   name more prominently. This topic cites only the project's own procedures documentation, which
   describes the same mechanism under its own names, and does not claim the phrase itself is an
   official spec term.

4. **Iceberg views are named only, never built.** No view is created in this sandbox; the three
   quoted spec lines (SOURCES.md) are the full extent of what's claimed about them, consistent
   with this topic's own CHAPTER.md scope ("name Iceberg views as a related but distinct
   reference type").

5. **Multi-table branching is a bridge to a later chapter, not a claim checked against any
   source here.** CHAPTER.md's own scope line marks the "§6.3.4" clause as "a forward
   cross-reference, not content this topic teaches" — carried into this topic's narration and
   FACT-CHECK as exactly that: a named pointer forward, not a sourced or executed claim.

## Scope boundary

Built and verified for real in this sandbox: a tag and a branch from the same snapshot, a
branch-scoped write provably invisible to `main`, a real validation check, a real fast-forward
publish, and a real rejected publish that never touches `main` — all through pyiceberg's own
public `manage_snapshots()`/`append(branch=...)` APIs. Named from sourced documentation only, not
built: Iceberg views, and multi-table branching (a forward pointer to §6.3.4, not a claim).
