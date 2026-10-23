## Content review, self-review, 2026-10-23

- Claims traced to sources: ring placement and the "more than one point per bucket" fix are quoted
  directly from Karger et al.'s own 1997 STOC paper; the bounded-loads guarantee is quoted directly
  from Mirrokni, Thorup, Zadimoghaddam's own SODA 2018 paper; the clockwise-walk mechanism and the
  256-token-per-node default are quoted directly from Cassandra's current stable docs. All 9 quotes
  pass `sources.mjs check`.
- Honest terminology correction, recorded rather than smoothed over: Karger's own 1997 paper never
  says "ring" or "clockwise" — it maps items and buckets onto "the unit interval" with nearest-point
  assignment. This topic's ring-and-clockwise visual is the now-standard pedagogical picture,
  confirmed as real, current production terminology by Cassandra's own docs ("walk the ring in a
  clockwise fashion"), not invented for this topic or misattributed to Karger's own words. Recorded
  in `OUTLINE.md`'s "Changes from the chapter plan" and `post-notes.md`'s internals section.
- `examples.py`'s first draft needed one honest correction, not a forced pass: a single ring-join
  trial's moved-key fraction varied far above the expected ~9% with only ten existing ring points
  (one trial measured 31.5%), so the assertion was moved from a single trial to the average across
  50 independent joins (measured 8.8%, close to the theoretical 1/11 ≈ 9.1%), the real claim this
  topic makes — not loosened past the point of meaning anything.
- Gap hunt (`coverage.json` → `gapReview`): no open items. Rendezvous, jump, and Maglev hashing are
  named with no mechanism (skipped in the syllabus); the from-scratch measured numbers make no claim
  against any real system's own benchmarked performance.
- All five syllabus clauses in `coverage.json` are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md`'s §3.3 line for this topic. 11 expert items were
  written blind, from the syllabus line and the three fetched sources alone, satisfying the
  ≥10-item minimum from the first draft.
- `FACT-CHECK.md`'s "Claims not made" section explicitly declines to claim this topic's own
  from-scratch ring measurements match any real production system's benchmarked numbers, declines
  to attribute "ring"/"clockwise" terminology to Karger's own words, declines any mechanism claim
  about rendezvous/jump/Maglev hashing, and declines any claim about *Data Engineering* §5.3's own
  content beyond naming the handoff.
- The build caught two real problems before this was ready to ship: six narration steps (3, 4, 5, 6,
  8, 9) were initially too close to their on-screen description text (up to 77% word-for-word
  overlap) — rewritten as the professor's own explanation of why the mechanism works and what to
  watch for, not a restatement of the caption; and step 7's takeaway was 22 words (the em dash
  counts as its own token) — fixed by shortening "verified against a real system's own documented
  count" to "verified against a real system's count," without losing the claim.
- Two predict steps (step 3: how many keys move on a join; step 6: what fixes the imbalance) both
  have matching `answer` arrays in `narration.json`; both distractor sets are red-teamed in
  `FACT-CHECK.md` against the real misconceptions each mechanism invites (carrying topic 20's
  resize-everything picture forward; treating the imbalance as a capacity problem).
- Three takeaways (steps 4, 7, 8) satisfy the three-minimum rule, each at or under the 20-word limit
  after the one fix above.
- Every number shown on screen (step 7's "two hundred fifty six," step 9's measured bars) was
  checked against `examples.py`'s own printed output, or Cassandra's own cited source text, before
  being written into `reel.tsx`/`scenes.tsx`.

## Looks review, self-review, 2026-10-23

`npm run build` and `PREVIEW_HELD=1 npm run build` are both clean. The full
`check-all.mjs --topic dsa.consistent-hashing-rings` run (locked, docs, sources, build, narration,
reels, links) passes, with the reel smoke test run against a built, served preview.

- Step 1 (Opening): the dissolving single-machine table and the forming ring render clear of each
  other at both sizes.
- Step 2 (RingPlacement): the ring, its machine dots, and the one highlighted key dot stay legible.
- Step 3 (JoinPredictViz) and its answer state: the pulsing new-machine dot and the predict/answer
  text are both legible at both sizes.
- Step 4 (MinimalRemapping): the faded existing machines, the highlighted new one, and the short
  moved arc render without overlapping the captions.
- Step 5 (ImbalanceProblem): the ring and the uneven bar chart beneath it fit cleanly in the frame.
- Step 6 (VirtualNodesPredictViz) and its answer state: the pulsing overloaded machine and the
  predict/answer text are legible at both sizes.
- Step 7 (VirtualNodesReveal): the many-point ring and the more even bar chart stay inside the frame.
- Step 8 (BoundedLoads): the capped machine, the redirect arrow, and the captions render without
  overlap.
- Step 9 (ProveIt): both measured bar pairs and the closing caption fit cleanly at both sizes.

Final reel check (full `check-all --topic dsa.consistent-hashing-rings`): locked, docs, sources,
build, narration, reels, and links all pass.
