# Fact-check — de.file-ingestion-landing-zones

## Claims re-derived against the source

1. **Renaming directories to commit is unsafe and slow on an object store.** SOURCES.md's Hadoop
   quote supports this directly. `examples.py` never attempts a rename at all — `MockObjectStore`
   only exposes an atomic `put` and a `list_prefix`, modeling the real constraint rather than a
   rename that doesn't exist.
2. **`If-None-Match` prevents an overwrite of an existing key.** SOURCES.md's AWS quote supports
   this directly. `examples.py`'s `conditional_write_race` reproduces it exactly: the second
   producer's conditional `put` against an already-written key returns status `412`, while the
   identical race without the condition succeeds silently.
3. **S3 event notifications are delivered at least once.** SOURCES.md's AWS quote supports this
   directly. `examples.py`'s `event_notification_dedup` feeds in a delivery list with repeats and
   measures that deduping by key is what keeps each real object processed exactly once.
4. **`ignoreCorruptFiles` silently skips a corrupt file and keeps the job running.** SOURCES.md's
   Spark quote supports this directly. `examples.py`'s `poison_file_quarantine` is deliberately
   built the opposite way: a reason is recorded for every quarantined file, nothing is silently
   dropped.
5. **A manifest-gated reader sees nothing from an incomplete batch, not a partial one.** Not from
   an external source — `examples.py`'s own direct measurement: the identical crash that leaves a
   naive listing reader with thirty-one files leaves a manifest-gated reader with none at all,
   because the manifest itself was never written.
6. **Schema-on-write catches a bad file immediately; schema-on-read can defer the identical bug.**
   Not from an external source — `examples.py`'s own measurement: the same malformed row is
   caught at run zero under schema-on-write and not caught until run ninety under schema-on-read,
   the run that happens to touch the broken column.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the same thirty-one files, since they really did
  land") is a natural first guess — the files are genuinely sitting in the store. It's ruled out
  directly by claim 5's own measurement: a manifest-gated reader never inspects the data files at
  all, only the manifest's own existence, so a missing manifest means zero files trusted, not a
  partial set.
- **Predict 2 (step 12, "Prove it"):** checked directly against claim 3 (notifications need
  dedup because delivery is at-least-once) and `examples.py`'s own `listing_cost_grows_with_prefix_size`
  measurement (listing cost scales with how many objects already sit under the prefix,
  independent of how many are new). The wrong option treats listing as strictly simpler, which
  ignores that its own cost keeps growing while a notification's cost does not.

## Illustrative numbers (figs for steps 1, 4, 8, 10, 12)

The specific file counts (forty written, thirty-one before the crash), the exact reasons recorded
in quarantine, the ninety-run detection delay, and the specific prefix sizes in the listing-cost
measurement are this topic's own synthetic reproduction, run deterministically in `examples.py` —
not a cited real incident's numbers. The mechanisms themselves (rename's unsafety on an object
store, conditional-write rejection, at-least-once notification delivery, a corrupt-file silent
skip) are each quoted verbatim from a primary source or measured directly, not illustrative.

## Outcome

No open findings. Every claim about object-store rename safety, conditional writes, event
notification delivery and Spark's corrupt-file handling traces to one of SOURCES.md's four
verbatim quotes across four independent primary sources; the manifest-gate, conditional-write-
race, quarantine, schema-timing and notification-dedup measurements are `examples.py`'s own
direct, reproducible runs against a mock object store; both predicts are checked against the
topic's own cited mechanism and measured facts, not invented reasoning.
