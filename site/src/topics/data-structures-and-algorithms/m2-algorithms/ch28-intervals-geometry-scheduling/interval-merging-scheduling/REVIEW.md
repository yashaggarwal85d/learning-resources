# Content review — dsa.interval-merging-scheduling

**Flow.** Hook (text-as-intervals framing) → predict (best greedy rule) → three rule
failures (earliest-start, shortest-first, earliest-finish-wins-and-trap, which also lands the
fewest-conflicts trap) → exchange-argument proof → merge sweep → insertion into a merged
list → a real system (Flink session windows) → predict (min rooms) → min-heap algorithm →
+1/-1 sweep equivalence → predict (weighted sting) → DP table → recap naming the sweep line.
Each step's visual and narration carry forward the same ten real bookings from `examples.py`,
so no step introduces an unexplained number. Three predicts (steps 2, 10, 13), all within the
engagement-arc requirements; four takeaways (steps 5, 7, 11, 14).

**Pre-notes coverage.** All seven pre-notes terms (half-open interval, overlap, greedy
algorithm, min-heap, binary search, DP recurrence, independent set) are used by name or by
clear paraphrase in the reel steps that need them — verified against `pre-notes.md` and the
`coverage.json` `syllabus` block.

**Gap-hunt.** Re-read `FACT-CHECK.md`'s red-team section: tie-breaking in the exchange proof,
the room-count witness argument (depth is a hard lower bound), the weighted-sting margin (29 vs
28, not a coincidence of rounding), and predict-distractor plausibility (each wrong option is a
rule a learner would plausibly guess) were all checked there and hold up on a second read. No
new gap found.

**Expert-reader pass.** Read start to finish as a reader who already knows interval scheduling:
the earliest-finish exchange argument is stated precisely enough to reconstruct the induction
without hand-waving; the min-heap algorithm's accounting (why opening a room implies every open
room is genuinely busy) is stated, not just asserted; the DP recurrence's `p(j)` (latest
compatible predecessor via binary search) is named and tied to the finish-sorted order it
depends on. Nothing reads as circular or merely descriptive.

**Engagement.** The three predicts sit at natural decision points (before any rule is tried, at
the room-count moment, before weights are introduced) rather than being bolted onto convenient
steps. The recap (step 15) explicitly names the sweep line as the unifying method and points
forward to topic 94, which is the chapter's own handoff text.

**Narration teaches, not reads.** Re-checked every step's `narration.json` lines against its
`body` caption: no line repeats the caption's own phrasing above the build's overlap threshold
(confirmed separately by `check-all.mjs`'s narration check, which passed). Narration lines
explain *why* each rule wins or fails, not just *what* is on screen.

**Looks review (Playwright screenshots, desktop + phone).** Fixed one real bug this pass: the
`Ruler` component's time-range label (`"08:00 — 19:00"`) was left-anchored at the same x
position as several step captions, overlapping them on both desktop and phone at steps 1, 3, 4,
5, 10, 11. Moved the label to the ruler's right end, anchored `end`, sitting just above the
ruler line instead of below it — clear of both the booking bars above and the captions below.
Also moved step 11's `"depth = 3"` annotation down six units so it no longer collides with the
relocated ruler label. Re-ran `check-all.mjs --only reels --topic interval-merging-scheduling`:
reel smoke test now passes at both sizes (`test:editor`'s failure is the known, pre-existing,
sandbox-only popup-handling limitation unrelated to this topic — see team memory). Screenshots
for steps 1, 5, and 11 (desktop and phone) spot-checked directly: no clipped or overlapping
text, drawing kit colours/fonts match the house style, takeaway and predict UI render correctly.

**Verdict:** ready to ship as `status: 'held'`.
