---
id: dsa.tournament-loser-trees
title: Tournament and loser trees
---

<section data-section="outcomes">

## After this topic you can

- Build and trace a loser tree performing a k-way merge by hand.
- State and justify the ⌈log₂ k⌉-comparisons-per-output bound, and contrast it against a binary-heap-based merge's own cost per output on the identical k and input.
- Name external sorting's merge phase and LSM compaction as the two real systems whose actual merge kernel this structure is.

</section>

<section data-section="internals">

## Into the internals

### Why the precise ⌈log₂ k⌉ bound isn't quoted from either source

Both sources describe the tournament tree's cost informally ("log(k)", "Θ(log k)"), never with the ceiling function. The ceiling form follows directly from the balanced-tree construction both sources do describe: sentinel-padded runs fill the tree out to the next power of two, so every leaf sits at the identical depth, ⌈log₂ k⌉. `examples.py` verifies this exactly, at more than one k, including a k that isn't already a power of two.

### Why the measured heap-vs-loser-tree gap comes out smaller than "2x"

The source states a heap costs "approximately 2*log(k)" comparisons per step — a rough estimate for a sift-down that sinks all the way to the bottom. A real k-way merge rarely forces that: a stream's replacement value is usually close in rank to what was just removed, so a sift-down often stops partway down, costing fewer comparisons than the worst case. `examples.py` measures this honestly rather than assuming the source's own rough estimate is what a real merge produces — the loser tree still wins on every run measured, which is the claim that actually matters.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds k sorted runs and merges them three ways on the identical input: a naive scan of every run's current head, a real binary-heap-based merge (with an instrumented sift-down counting every comparison), and a loser tree (with an instrumented replay counting one comparison per layer). All three are checked against the same fully-sorted ground truth, and the loser tree's own comparisons-per-output is asserted to equal ⌈log₂ k⌉ exactly, including at a k that isn't a power of two (padded with sentinel runs to the next one).

</section>

<section data-section="production">

## In production

External sorting's own second stage merges sorted runs exactly this way, and a wider merge pass directly cuts the number of passes needed over the data: six runs merged two at a time takes three passes, merged six-way takes one. An LSM-tree's own compaction step — leveled or tiered, as topic 29 covered — is the same k-way merge of several runs into one, with this structure as its actual merge kernel.

</section>

<section data-section="frontier">

## The frontier

Binomial heaps, pairing heaps and Fibonacci heaps are named here only in passing — this chapter's own syllabus marks all three as skipped, since their own decrease-key-optimized use case (graph algorithms such as Dijkstra) isn't this chapter's problem.

</section>

<section data-section="questions">

## More questions

- A loser tree's comparisons-per-output is exactly ⌈log₂ k⌉, deterministically, every single output. Why doesn't a heap's own comparisons-per-output come out just as deterministic?
- If a workload's k runs are extremely unequal in length, at what point does the tree keep paying for sentinel "null" runs that never produce another real comparison?

</section>

<section data-section="next">

## Where this goes next

Every structure in this chapter answered the same question, which one is smallest right now, without ever asking where its own data physically sits — a sharp contrast with Chapters 4 and 5, where that question was the entire point. The next chapter asks something different again: given a string, where does it live, and how fast can that be found out, independent of how many strings there are. Tries, next.

</section>
