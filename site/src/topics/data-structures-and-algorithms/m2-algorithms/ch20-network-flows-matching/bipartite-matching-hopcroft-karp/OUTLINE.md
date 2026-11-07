# OUTLINE: Bipartite matching and Hopcroft-Karp

Thirteen steps, following `CHAPTER.md`'s own plan for topic 70.

1. **Hook.** Four tasks, four machines, each task allowed on only some machines. A greedy scan
   leaves one task with no machine, although every task can be placed. Which single change lets
   it in, and how do you find it without trying every arrangement? Then the same question on a
   million vertices, and the question of proving nothing better exists, without searching.
2. **Matching as unit flow.** A matching pairs each task with at most one machine. Orient every
   edge from tasks to machines, add a source into the tasks and a sink out of the machines, give
   every edge capacity one: a matching is a flow of that value, and by last topic's integrality a
   maximum flow of whole numbers is a maximum matching.
3. **The greedy scan, maximal but not maximum.** Scanning tasks in order and taking the first free
   machine matches three of four tasks and leaves one machine idle, even though a matching of four
   exists.
4. **Predict: can one single change fix the greedy scan?** Before naming the mechanism, ask
   directly: does reaching the true maximum need one small adjustment, or a restart from scratch?
5. **The alternating path, and the zig-zag reroute.** The free task's augmenting path in the unit
   network reads back in the original graph as an alternating path. Flipping it reassigns three
   existing pairs in a chain and reaches the maximum of four.
6. **Berge's lemma.** A matching is maximum exactly when no alternating path from a free vertex on
   one side to a free vertex on the other exists — the matching form of last topic's theorem, with
   the one direction that matters justified from it rather than reproved.
7. **One augmentation at a time, and its cost.** Try to extend the matching from each free task in
   turn; each search costs as much as the edge count, and there are at most as many searches as
   there are tasks, giving a running time that scales with the vertex count times the edge count.
8. **Hopcroft-Karp's phase.** Breadth-first search from every free task at once builds layers; a
   depth-first search through those layers finds many vertex-disjoint shortest augmenting paths at
   once; all of them flip together, and the next phase's shortest path is strictly longer.
9. **Predict: how many phases does that take?** Before naming the bound, ask whether the number of
   phases should scale with the vertex count, the edge count, or something smaller than both.
10. **The phase count, and the measured gap.** After enough phases the shortest remaining
    augmenting path is already long, which bounds how many further phases can remain; on a large
    random graph a handful of phases replaces hundreds of one-at-a-time searches.
11. **König's theorem.** In a bipartite graph the maximum matching size equals the minimum vertex
    cover size; the cover is built directly from the last alternating search, no extra search
    needed, the same certifying role a minimum cut played last topic.
12. **The Hall obstruction.** A graph where two tasks compete for one machine has a matching of two
    and a cover of two that points straight at the competing pair — unlike the task-machine graph's
    own trivial cover, which is simply every task.
13. **Handoff.** Hopcroft and Karp beat the general method by noticing what a unit-capacity network
    allows. That habit is what the next chapter is about: divide-and-conquer design, next.

## Changes from the chapter plan

- `CHAPTER.md`'s own visual idea and hook cite a planned illustrative run on a one-thousand-plus-
  one-thousand-vertex graph with four phases of eight hundred eight, one hundred twenty-five,
  nineteen and one paths (nine hundred fifty-three augmentations total). `examples.py`'s own run,
  on a graph built the same size but with this topic's own random generator and seed, measures a
  different but qualitatively identical gap (three phases against several hundred one-at-a-time
  augmentations, matching size in the eight hundreds); `reel.tsx` and `post-notes.md` report
  `examples.py`'s own real numbers, not `CHAPTER.md`'s own planning illustration, per the
  established "the hook's own scale is never the measurement's own scale" pattern.
- D. König's own 1931 paper is named only, with its exact title, venue and year left unverified,
  per `CHAPTER.md`'s own instruction (a Crossref search at planning time returned no record); this
  topic states König's theorem itself, confirmed independently by SciPy's own documentation, and
  makes no bibliographic claim about König's own paper.
- Hall's theorem is named only, as the left-side reading of the same obstruction the Hall-
  obstruction graph already shows picture-first; it is not separately proved.
