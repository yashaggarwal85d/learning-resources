# Review — de.partitioning-schemes-range-hash

Role: sceptical senior engineer and teacher, no prior involvement with this topic's authorship.
No independent reviewer ran this session; both passes below are self-review.

## Content review, self-review, 2026-10-30

1. **Where:** reel steps 2/6 (the two predicts). **What:** checked the two predicts are genuinely
   independent questions, not the same question restated. **Evidence:** step 2 asks where the
   newest write lands under range partitioning; step 6 asks how much data moves on a resize under
   naive hashing — one is about ordering, the other about membership change, different axes of the
   same topic. **Fix:** none needed. **Severity:** n/a.
2. **Where:** `examples.py`'s `range_partitioning_concentrates_an_ordered_write_workload`. **What:**
   as the fact-checker, caught that the first implementation measured the lifetime distribution of
   all 10,000 keys (an even ~10% split per partition) rather than a recent-write-window hot tail,
   which would have made the claim false. **Evidence:** rerun with the corrected recent-500-write
   window shows all 500 landing on exactly one partition. **Fix:** redesigned the function (and its
   hash-partitioning counterpart, for a fair contrast) before this review; re-verified via
   `python3 examples.py`. **Severity:** would have been high (a false claim) if shipped unfixed —
   caught before shipping.
3. **Where:** `coverage.json`'s syllabus clauses vs. the raw syllabus line. **What:** the
   parenthetical "(algorithm in → *Data Structures & Algorithms* Ch.2)" wasn't covered by any
   clause on the first build attempt. **Fix:** added a fifth clause matching that exact text,
   pointed at the Frontier deep-dive section. **Severity:** low, caught before shipping.
4. **Where:** `prerequisites.mdx`'s cross-domain `<Resource>` for `dsa.consistent-hashing-rings`.
   **What:** the title string didn't match that topic's actual `registry.ts` title ("Consistent
   hashing and rings" vs. the real "Consistent hashing rings"), which crashed the `/reels` index
   page build entirely, not just this topic's own page. **Fix:** corrected the title string to
   match `registry.ts` exactly. **Severity:** high (a build-breaking error for the whole site), but
   caught immediately by the build and fixed before shipping.
5. **Where:** the relationship to `dsa.consistent-hashing-rings`. **What:** confirmed this topic
   genuinely assumes the ring algorithm rather than re-teaching it — `declared` lists
   `consistent-hashing`, `ring-placement`, `virtual-node`, `minimal-remapping`, all already
   `introduces`d by that DSA topic (confirmed via `registry.ts` lines 2419-2430) — and that this
   topic's own "Reveal: consistent hashing and rendezvous hashing" step states the algorithms'
   *outcomes* (measured remap fractions) without re-deriving the ring-placement mechanism itself.
   **Fix:** none needed. **Severity:** n/a.

## Looks review, self-review, 2026-10-30

The first reel smoke test run found three phone-only text-overlap failures: step 8's
"client, proxy, coordinator" / "three ways to route" row, step 9's "naive vs smart hashing" /
"breaks vs survives resize" row, and step 10's "order IDs, range-partitioned" / "traffic spikes
hard" row. **Fixed** by shortening the label/value text on all three rows (e.g. step 8's label
became "routing", step 10's became "order IDs" / "traffic spikes"), without losing any claim —
the step's own `body` and `fig` text still carry the full statement. Re-ran the smoke test clean:
`Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.` The separate `Editor test
failed` block in the same run is the known, unrelated sandbox limitation (popup/new-tab handling
in this container's Playwright, confirmed pre-existing on an unmodified `main`), not a regression
from this topic.

- The point is visible at a glance on every step (Hook's two-outcome contrast; step 4's single
  hot partition; step 5's spread across all partitions; step 7's naive-vs-smart remap contrast).
- Every step moves and lands on a final frame that teaches; after the text shortening, none
  crowded, clipped, or overlapping at either desktop or phone width.
- Colour is used only where it means something: the focus colour marks the resolving row in each
  reveal step (the hot partition, the spread result, rendezvous hashing's own fair share, the
  "replication is separate" row, and the Prove It predict's correct answer).
- The caption (`fig`) matches the picture on every step.
- Three takeaways present (steps 4, 5, 7), all within the 20-word limit after the build's own
  word-count check (counting the em dash as a word) caught three over-length ones across two
  rounds of trimming.

Everything here is green. Shipping.
