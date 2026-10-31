# Review — de.optimistic-commits-conflict-resolution

## Fixes made during build

- **CHAPTER.md's planned Delta source didn't exist as written**: CHAPTER.md's draft named "Delta Lake's protocol documentation on optimistic concurrency control and its WriteSerializable vs Serializable isolation levels," but neither PROTOCOL.md nor docs.delta.io (the open-source docs) document a named "WriteSerializable" isolation level — that specific framing is Databricks-platform-proprietary (docs.databricks.com), not part of the open Delta Lake project. Resolved by sourcing docs.delta.io's actual "Concurrency control" page (the three-stage protocol and five named conflict exceptions) and basing the "isolation is a choice" claim on Iceberg's own "writers can select what to validate" quote instead of fabricating or misattributing a quote. Documented in FACT-CHECK.md's red-team #1.
- **examples.py race-condition bug**: `try_atomic_swap` originally wrote both writers' staged snapshot content to the same filename before checking the CAS marker, so the losing writer's write clobbered the winning writer's snapshot content even though the CAS correctly rejected the loser. Fixed by giving every staged snapshot file a globally unique name (version + random suffix), so only the CAS marker decides whose content becomes canonical.
- **coverage.json initially failed PROJECT_PLAN.md Rule #6** on first build check: the `{"deep": "Production"}` references didn't match post-notes.md's heading text ("Production failures this topic warns about" vs the referenced "Production"), and the expert list had only 6 items (needs 10+, written independently). Fixed by renaming the post-notes.md heading to "## Production" and expanding the expert list to 11 items.

## Checks — all passed

- `node scripts/sources.mjs check` — 17/17 quotes found word for word, 0 problems (first try).
- `python3 examples.py` — all assertions pass after the staged-snapshot-filename fix: demo 1 (append vs append) retries to a clean success; demo 2 (delete vs delete on the same file) fails permanently on retry, by design.
- `node scripts/narration-teaches.mjs` — clean after two small fixes: moved a stray `answer` block off a non-predict step (step 4), and split one 54-word line in the Recap step's narration into two shorter lines. 0–6% overlap across all 10 steps, no flags.
- `node scripts/check-all.mjs --skip reels,links,narration --topic` — pass after the coverage.json fixes above (locked 66.0s, docs 0.2s, sources 0.1s, build 45.0s).
- `node scripts/check-links.mjs` — 0 broken out of 1890 links checked.
- `node scripts/check-all.mjs --only reels --topic` — **passed on the first try**: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes." No phone-overflow fix needed.

## Screenshot review

All 24 screenshots (12 desktop incl. 2 `-q` predict-state variants, 12 phone incl. 2 `-q` variants) manually reviewed. All render cleanly at both viewport sizes: no overlapping or cut-off text, predict states (step 2, step 5) and takeaway blocks (steps 4, 7, 9) all render correctly, Recap renders cleanly. One cosmetic note: phone step 1's step-counter text renders as "01/SW" instead of "01/10" at this font size — the identical artifact appeared in topic 12's phone step 1 ("01/16" instead of "01/10") and shipped without issue, so this is a pre-existing small-size font-rendering quirk, not a regression introduced here.

## Disclosed local-stand-in pattern (per FACT-CHECK.md)

`examples.py` models a Iceberg/Delta-style commit using a local directory with JSON "snapshot" files and `os.open(O_CREAT | O_EXCL)` standing in for a metastore's atomic pointer swap / check-and-put — the same stand-in topic 12 used. What transfers is the validate-before-retry shape (append always safe to retry; delete/replace must re-verify its files are still present), not a claim that local disk is a real catalog, and not a claim that this reproduces Iceberg's actual row-level delete-file format. The two-writer race is a scripted sequence in one process, same disclosed limitation as topic 12.
