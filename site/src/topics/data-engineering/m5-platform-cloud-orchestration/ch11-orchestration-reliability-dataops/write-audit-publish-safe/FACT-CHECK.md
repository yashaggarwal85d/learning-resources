# Fact-check

1. **Writes in a write-audit-publish flow are performed on a separate audit branch, independent from the main table's own history.** Sourced directly: `examples.py` asserts Apache Iceberg's own branching documentation states this, verified word for word against the fetched page text.

2. **After validation, main can be fast-forwarded to the head of the audit branch to update the main table's state.** Sourced directly: `examples.py` asserts Iceberg's own documentation states this, verified word for word against the fetched page text; `SnapshotTable.fast_forward` reproduces the mechanism, including its ancestor-check legality rule.

3. **A write on the staging/audit branch isn't accessible to downstream consumers who can only access the main branch.** Sourced directly: `examples.py` asserts AWS's own Big Data Blog write-up on the WAP pattern states this, verified word for word against the fetched page text (after normalizing a curly apostrophe).

4. **A good write -- an idempotent reprocessing run of the shop's own baseline data -- passes a real diff-and-tolerance audit and is fast-forwarded into production.** Run and reproduced directly: `examples.py`'s `run_wap_good_write` asserts the audit passes and the fast-forward succeeds, and that production afterward exactly matches the audited candidate.

5. **A deliberately bad write, carrying one real negative amount, fails that same audit, and production is left completely untouched.** Run and reproduced directly: `examples.py`'s `run_wap_bad_write_blocked` asserts the audit fails specifically on the negative-amount check, that the fast-forward is correctly refused, and that production afterward is byte-for-byte identical to its state before the bad write.

6. **A blue-green table swap is a single atomic pointer update between two full table copies, not a row-by-row migration.** Run and reproduced directly: `examples.py`'s `run_blue_green_swap` serves one of two real in-memory table copies and asserts the swap is exactly one pointer reassignment.

7. **A shadow run diffs a new pipeline version's output against the old version's real output before any traffic cuts over, catching a regression with zero production traffic ever touched.** Run and reproduced directly: `examples.py`'s `run_shadow_diff_before_cutover` audits a byte-identical re-run as safe and a real, measured ~3.7%-shifted regressed re-run as blocked, under the same audit logic as the branch write.

8. **A canary rollout measured by partition halts expansion the moment it reaches a partition with an elevated error rate, rather than exposing every partition to a bad change at once.** Run and reproduced directly: `examples.py`'s `run_canary_rollout` seeds one of ten partitions with a real elevated error rate and asserts the expansion correctly stops before reaching it.

9. **A feature-flagged transform reverts to its exact prior output the instant the flag is toggled back off, with no redeploy.** Run and reproduced directly: `examples.py`'s `run_feature_flag_toggle` asserts the flagged-off output, the flagged-on output, and the output after reverting the flag match exactly as expected.

10. **A time-travel rollback restores a table to its exact prior snapshot in one operation, removing every row a bad publish introduced.** Run and reproduced directly: `examples.py`'s `run_time_travel_rollback` publishes a bad write carrying a negative amount, rolls the table back to the snapshot before it, and asserts the restored state exactly matches the pre-bad-write snapshot with no negative-amount rows remaining.
