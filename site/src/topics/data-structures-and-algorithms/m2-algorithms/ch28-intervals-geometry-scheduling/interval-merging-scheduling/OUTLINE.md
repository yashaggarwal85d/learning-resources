# OUTLINE: Interval merging and scheduling (`dsa.interval-merging-scheduling`)

## Progress

- [x] Research (SOURCES.md, coverage.json → expert)
- [x] Content plan and storyboard (this file)
- [ ] Fact-check
- [ ] Coverage map (full)
- [ ] Build every file
- [ ] Content review
- [ ] Checks and looks review
- [ ] Narrate / queue
- [ ] Ship

## Learning outcomes

1. Merge a set of intervals and insert one into a merged set, stating the cost of each step and the invariant that makes the loop correct.
2. Show by counter-example why earliest-start and shortest-first fail, and prove earliest-finish-first optimal by exchange.
3. Compute the minimum number of rooms with a min-heap of end times and argue it equals the depth.
4. Write the weighted-interval recurrence, compute p(j) by binary search, and say when greedy is enough and when DP is needed.

## Running example (computed and asserted in examples.py)

- Ten bookings `(start, end, weight)`: (75,120,5) (210,270,4) (345,495,6) (480,660,5) (255,300,1) (435,615,3) (180,210,5) (120,300,8) (90,120,6) (270,330,8)
- Earliest-finish greedy picks 5: (75,120) (180,210) (210,270) (270,330) (345,495)
- Earliest-start-first picks 3; shortest-first picks 4
- Fewest-conflicts trap, 8 intervals [2,7) [3,5) [3,7) [6,8) [7,10) [8,11) [10,12) [11,14): fewest-conflicts-first keeps 3, earliest-finish keeps 4
- Depth (busiest moment): 3
- Weighted optimum by DP: 29, against 28 for the earliest-finish set's own total weight

## Engagement arc

- **Hook (step 1):** ten bookings, one room, keep only non-overlapping ones; the booking that starts first is long and blocks four others.
- **Predict 1 (step 1):** which of earliest-start, shortest, fewest-conflicts, earliest-finish always keeps the most bookings? Wrong options are tempting because each sounds locally reasonable (shortest intuitively "wastes less room"; fewest-conflicts sounds like it directly optimizes the right thing). Answer: earliest-finish-first, proved by exchange in step 5.
- **Predict 2 (step 7, minimum rooms):** before revealing the heap run, predict the minimum number of rooms the ten bookings need. Wrong options: 2 (undercounts the depth-3 moment), 4 (overcounts — depth is the tight bound, not n/2-ish guesses). Answer: 3, same as the busiest-moment count.
- **Predict 3 (step 9, weighted sting):** does earliest-finish-first still win once bookings carry weights? Wrong option "yes, it's still safe" is tempting because it worked for every rule comparison so far. Answer: no — a concrete set beats it 29 to 28.
- **Surprising number:** 28 vs 29 — the unweighted-optimal set is not weight-optimal, by a margin of exactly one.
- **Takeaways (>=3):** (a) sorting the endpoints once is the whole cost of every algorithm in this topic; (b) a safe greedy rule is proved by exchange, not by trying it on one example; (c) depth is a hard lower bound on rooms and the heap algorithm always meets it; (d) weights break greedy — optimal substructure needs a DP table, not a single sorted pass.
- **Recap:** every program here sorted the endpoints once and walked them, keeping only what's open right now — merge, greedy choice, heap of end times, or a DP table.

## Reel steps, in order

1. **Hook — ten bookings, one room.** `fig: booking-bars`. Ten bars on the horizontal ruler (real minutes-from-08:00 coordinates), `crema`. Portrait: bars stacked top to bottom in time order; landscape: same, wider ruler. **Moves:** `Draw` the ruler, then each bar in start order. Final frame: all ten bars drawn, unlabelled by rule yet, with the long early booking (75,120,… wait it's actually (120,300,8), the long 180-minute one) visually dominant. Caption: "Keep the most bookings you can, none overlapping." **Predict 1** here (per above). Narrator's line of thought: she doesn't describe the bars — she poses the trap ("three rules look equally reasonable; only one survives every case you'll see today") and asks the viewer to commit before any rule runs.

2. **Earliest-start-first fails.** `fig: greedy-race`. Same bars; a vertical sweep (`Draw`) visits bars in start order, marking kept ones `caramel`, rejected ones `taupe`. Ends on 3 kept, a `cherry` marker + `cherryText` on a rejected booking a better rule would keep. Takeaway: "Starting first doesn't mean finishing in time to let others through." Narrator explains *why* it fails structurally (a long early interval blocks everything after it), not just that it fails.

3. **Shortest-first fails too.** Same mechanic, `cinnamon` strip beside the earliest-start result for comparison, ends on 4 kept, `cherry` marker on its own miss. Narrator: shortest looks like it "wastes less room," but a short interval can still sit where it blocks two longer, more useful ones.

4. **Earliest-finish-first wins — and the fewest-conflicts trap.** Same mechanic on the ten bookings, ends on 5 kept (`caramel`, no cherry). Then a second, smaller frame: the separate eight-interval strip, fewest-conflicts-first keeps 3 against earliest-finish's 4, with its own `cherry` marker. Takeaway: "Earliest finish time is the only rule that survives both traps." Narrator names the pattern across both counter-examples: every wrong rule can be made to fail by *some* input; a right rule needs a proof, not a winning example.

5. **Proof by exchange.** `fig: exchange-swap`. Abstract step: two schedules side by side (optimal `cinnamon`, greedy `caramel`), a `Reticle` on the first interval of each, an arrow showing the swap. No new real numbers; this is the argument, stated plainly: swap the optimal's first pick for the greedy one — it finishes no later, so it can't newly collide with what follows — then induct down the rest. Takeaway: "Any optimal set can be turned into the greedy set one swap at a time, each swap never making it worse." Narrator: this is the one argument that makes earliest-finish *provably* safe, the thing no amount of testing on examples can give you.

6. **Merging intervals.** `fig: merge-sweep`. A fresh, smaller set of overlapping intervals merges left to right: sort by start (`Draw` the sorted order), a running "current merged interval" bar extends (`Plot`) or a new one starts each time the overlap predicate fails. Caption shows the predicate `s1 < e2 and s2 < e1` and the tie rule. Takeaway: "Everything left of the sweep is already final — that invariant is the whole proof." Narrator: she walks the invariant, not the mechanics ("why can you never go back and re-merge something you passed?").

7. **Insertion into an already-merged list.** Same picture, one new interval dropped in; `Reticle` finds the first merged interval ending after the new one's start, absorbs the run it overlaps (`caramel`), splices. Caption states both costs (O(n) linear scan vs O(log n + r) binary search to find the place, shifting still O(n)). Narrator corrects the natural but wrong intuition that binary search alone makes insertion O(log n) — the array still has to shift.

8. **Real instance: Flink session windows.** `fig: session-windows` (small, same ruler language). A stream of events each start their own tiny window, windows closer than the gap merge into one, shown as the exact same merge-sweep as step 6. Caption: Flink's own documented mechanic. Narrator: this is literally the merge pass from step 6, running inside a stream processor, nothing new to learn.

9. **Minimum rooms — predict, then the heap run.** `fig: room-heap`. **Predict 2** here (per above). Then: sort by start (`Draw`), a small min-heap of end times rendered beside the ruler, bars stack into room rows (`caramel`) as the sweep passes each start; a depth counter under the ruler peaks at 3 exactly when room 3 opens. Caption states the algorithm (reuse the earliest-ending room if it's already finished, else open one) and the result: 3 rooms. Narrator: she names the invariant that makes 3 provably minimal — the room-opening event *is* a witness of depth 3, not just a count that happens to come out right.

10. **The bridge sweep.** `fig: depth-plusminus`. The same ten bookings, now walked once as a +1/−1 sweep over sorted endpoints with a running count, landing on the same peak of 3. Caption: "Same number, simpler walk." Narrator explicitly calls this the seed of the next topic's method (sweep line), without naming it as a cliffhanger gimmick — she states what generalizes (sort the endpoints, walk them, track only what's open).

11. **Weighted sting — predict, then the table.** `fig: weighted-table`. **Predict 3** here (per above). Reveal: the same ten bookings now carry weights; earliest-finish's 5-interval set totals 28. Then the DP table `OPT(j)` fills left to right over the finish-sorted bars (`Plot`, one cell per step), landing on 29 — a different, larger set. Caption shows the recurrence `OPT(j) = max(OPT(j-1), w_j + OPT(p(j)))` and names `p(j)` found by binary search. Takeaway: "Weights break every greedy rule you just proved safe; only the DP table is safe once value, not count, is the goal." Narrator: she walks why Case 2 of the recurrence (take job j) is forced to skip every job incompatible with j, which is exactly what `p(j)` computes.

12. **Prove it / recap.** `fig: recap-sweep`. Final frame restates all four outcomes as one picture: the sorted endpoints, the merge, the heap, the table — four passes over the same sorted order. Caption/handoff line (verbatim, per CHAPTER.md): "Every program here sorted the endpoints once and walked them, keeping only what is open right now: a running count, a heap of end times, a table over the sorted order. That is not a trick for intervals. It is a method with a name, and it handles far more than a count: the height of a skyline, the area of a union of rectangles, every crossing among a thousand segments. The method is the sweep line, next."

## Post-notes headings

- **Outcomes** (restate the four).
- **Internals:** the exchange argument spelled out fully with the formal substitution; why binary search for `p(j)` needs the finish-sorted order; the priority-queue implementation of the room algorithm (insert/find-min/increase-key) and its O(n log n) accounting.
- **Lab:** reproduce the ten-booking table in Python (already `examples.py`); the reader is pointed to re-run it with a different seeded set and check depth still equals the heap's final size.
- **Production:** Apache Flink session windows (step 8's real instance, Flink 2.3.0 docs); PostgreSQL's `[)` canonical range form as the production convention behind the tie rule.
- **Frontier:** the single-interval/multiple-interval contrast — this topic's whole subject stays polynomial because each job needs exactly one interval; Kleinberg & Tardos's Multiple-Interval Job Scheduling exercise (8.14), where a job needs a *set* of intervals, is NP-complete by reduction from Independent Set (confirmed at fact-check, see FACT-CHECK.md); interval trees for the stored-set query (Chapter 4, skipped, named only).
- **Where this goes next:** topic 94 (sweep line), Chapter 21 (exchange arguments and matroids in general), Chapter 22 (DP state design), Data Engineering's interval/range joins (`de.point-in-time-as-of-joins`, named, not linked unless live).

## Examples to execute (examples.py)

1. The ten bookings; assert earliest-finish-first picks exactly the 5 named; assert earliest-start-first picks 3 and shortest-first picks 4 on this data.
2. The fewest-conflicts eight-interval set; assert fewest-conflicts-first (counted once, up front) keeps 3 and earliest-finish keeps 4 on it.
3. Merge: a small overlapping set merged to its minimal disjoint form; assert the result and its length.
4. Insertion: insert one interval into the merged result; assert the spliced result.
5. Minimum rooms: run the min-heap algorithm on the ten bookings; assert the room count is 3; assert the independent +1/−1 sweep gives the same 3.
6. Weighted DP: run `OPT(j)` on the ten weighted bookings; assert the optimum is 29 and the earliest-finish set's own weight sums to 28; assert the reconstructed optimal set and its p(j) table.
7. Exchange-argument sanity check: assert that swapping the optimal's first interval for the greedy pick on a small synthetic case never shrinks the schedule (a concrete, asserted instance of the argument, not a proof restated in code).

## Bridge and handoff

- **Bridge** (assumed handoff of ch27's last reel, per CHAPTER.md; ch27 is not yet live, so this is the plan's own text, used as given): "A regular-expression engine is a choice of automaton, and choosing the wrong one turns a pattern into an attack. That closes text: sequences of characters, matched, indexed and searched. The next chapter's data has no letters at all: pairs of numbers, a start and an end, and the questions are about which of them overlap. Interval merging and scheduling, next." This topic's own bridge line answers it: "Text was a sequence you scanned for a pattern. A booking, a session or a lease is two numbers, and the question 'which of these collide' looks quadratic until you sort the endpoints."
- **Handoff:** as quoted in step 12.

## Concept ledger

- **Introduces:** `interval-merging`, `interval-overlap-predicate`, `earliest-finish-greedy`, `interval-depth`, `min-heap-of-end-times`, `weighted-interval-scheduling`.
- **Uses:** `binary-heap`, `sift-up-down` (Ch.6), `sorting-lower-bound`, `big-o-theta-omega` (Ch.1), `contiguous-storage` (Ch.2).
- **Declared:** `exchange-argument`, `dp-state-design`, `binary-search-invariants` (Chs. 21, 22, 16).

## Claims list (claim → source)

1. Earliest-finish-time-first is optimal for unweighted interval scheduling (exchange/contradiction proof) → Wayne, Greedy Algorithms I slides, SOURCES.md.
2. The earliest-start-time-first algorithm, run on lectures sorted by start with a min-heap of end times keyed by finish, is optimal for interval partitioning, and the number of rooms it uses equals the depth → Wayne, Greedy Algorithms I slides.
3. Weighted interval scheduling's `OPT(j)` recurrence and the predecessor function `p(j)` → Wayne, Dynamic Programming I slides.
4. A second, independent "greedy stays ahead" proof of the same optimality result → Erickson, *Algorithms*, Ch.4.
5. PostgreSQL's built-in range types use `[)` (lower-inclusive, upper-exclusive) as their canonical/standard form → PostgreSQL docs, Range Types.
6. Flink's session-window operator starts every element in its own window and merges windows closer together than the configured gap → Apache Flink 2.3.0 docs, Windows.
7. Interval scheduling stays polynomial only while each job needs a single interval; once a job can need a *set* of several time intervals (Multiple-Interval Job Scheduling, Kleinberg & Tardos exercise 8.14), the problem is NP-complete, shown by a reduction from Independent Set → confirmed at fact-check against the Swarthmore CS41 problem-set statement of K&T 8.14 (a primary-source-adjacent restatement of the textbook exercise); the "three or more intervals" framing from Wikipedia is NOT confirmed by this source and is dropped — the topic states the single-interval/multiple-interval contrast instead, which is what the primary source actually supports.

## Changes from the chapter plan

None yet.
