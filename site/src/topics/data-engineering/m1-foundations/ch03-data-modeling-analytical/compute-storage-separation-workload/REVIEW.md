# Review — de.compute-storage-separation-workload

## Content summary

13 steps covering compute-storage separation as an architecture, workload isolation as the
separate decision that actually prevents noisy-neighbor contention, elastic multi-cluster
scaling scoped specifically to concurrency (not single-query speed), and warehouse-local caching
as a deliberate, named re-coupling of storage and compute that pays for its speed when the
caching compute is suspended. Three predicts (first at step 3, within the first four), three
takeaways, closing with a "Prove it" that asks what an aggressive auto-suspend cost-saving policy
actually trades away.

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a direct quote from a
single cloud warehouse vendor's own documentation (Snowflake), disclosed explicitly as
sourced-only since this sandbox has no way to run a real multi-cluster warehouse to measure
against.

## Sources

Three Snowflake documentation pages ("Snowflake key concepts and architecture," "Multi-cluster
warehouses," "Warehouse considerations"). 7 quotes total, verified word for word
(`node scripts/sources.mjs check`, 0 problems) after one fix (see below).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 7, 8, 11).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, max 22%) after two fixes (see below).
- No literal digits appear in `reel.tsx` at all. This topic has no numeric lab of its own, so
  every claim is the vendor's own qualitative statement, never a specific figure this sandbox
  could not verify.

## Fixes made during this build

- `SOURCES.md`'s first draft of the warehouse-caching quote used an ellipsis to join two
  sentences from the source page; `scripts/sources.mjs check` correctly rejected it as not found
  word for word — split into two separate, exact quotes instead.
- The build's narration-teaches check caught two steps echoing the on-screen description nearly
  verbatim: step 1 (the hook) and step 12 (the recap, 51% overlap) — both rewritten to frame the
  same content from the narrator's own angle rather than reading the visual's caption.
- One of those rewrites produced a 51-word narration line, over the build's 50-word-per-line
  limit; split into two shorter lines instead of trimmed down to one, since both ideas (storage
  separation vs. workload isolation) deserved to stay distinct, not compressed.
- No coverage, takeaway-count, or step-title-mismatch fixes were needed — `coverage.json` was
  written with 11 expert items and `at.step` values copied from the final `reel.tsx` titles from
  the start.
- No Playwright phone/desktop text-overflow fixes were needed — `scenes.tsx` was written with the
  short 1–3-word Row label/value pattern from the start and passed clean on the first run.

## Checks run

- `node scripts/sources.mjs check` — 7/7 quotes verified word for word.
- `python3 examples.py` — pass, "compute-storage-separation-workload examples: all numbers check
  out" (this topic has no lab; the two constants are the vendor's own disclosed scoping claims,
  asserted as booleans, not measurements).
- `node scripts/check-all.mjs --skip reels,links --topic compute-storage-separation-workload` —
  pass (locked, docs, sources, build, narration) after the fixes above.
- `node scripts/narration-teaches.mjs .../compute-storage-separation-workload` — pass, all 13
  steps under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic compute-storage-separation-workload` — pass,
  Playwright desktop and phone, clean on the first run.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
