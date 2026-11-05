---
id: dsa.local-search-metaheuristics
title: Local search and metaheuristics
---

<section data-section="outcomes">

## After this topic you can

- Run two-opt by hand on a small tour, and say why it stops and what it does and does not guarantee.
- Describe simulated annealing and a genetic algorithm in terms of what each changes about plain local search, and say what each gives up.
- State when giving up a worst-case guarantee is the right engineering call, and read PostgreSQL's `geqo_threshold` documentation as a real instance of that decision.

</section>

<section data-section="internals">

## Into the internals

### Why a local optimum has no guaranteed quality

Every guarantee earlier in this chapter was proved by bounding an algorithm's answer against a computable lower bound on the true optimum. Local search has no equivalent step: nothing about the two-opt rule (stop when no single reversal improves the tour) implies any relationship between the local optimum it lands on and the true shortest tour, because the proof technique those other guarantees used — find a quantity you can compute that the optimum can't beat — has no analogue here. A local optimum is defined entirely in terms of its own immediate neighbors, never in terms of the global optimum at all. This is why the topic states the absence of a bound directly, instead of citing a loose, unstated one.

### Why simulated annealing's win here isn't automatic

The measured gap between annealing and plain two-opt on this topic's instance comes from annealing's ability to temporarily accept a worse move, which lets it walk out of a local optimum that two-opt accepts immediately as final. But that same willingness to accept worse moves, under a schedule that cools too fast or too slowly, can leave annealing worse off than two-opt: too fast, and it behaves like two-opt before it has had a chance to explore; too slow, and it may still be wandering when the search budget runs out. The schedule is a design choice with no universally correct setting, which is why the topic reports its own schedule's specific constants rather than a schedule-independent claim.

</section>

<section data-section="lab">

## In the lab

Take the twelve-point clustered instance in `examples.py` and change its random seed: does two-opt's roughly even split between reaching and missing the true optimum hold at other seeds, or was 45% itself special to this one layout? Separately, try a faster cooling schedule for simulated annealing (a smaller `alpha`, so the temperature falls faster) and a slower one, and see whether either one changes how often it reaches the true optimum on the same instance — the chapter plan's own warning, that annealing is not always better at equal time and depends on the schedule, is directly testable this way.

</section>

<section data-section="production">

## In production

PostgreSQL's genetic query optimizer (GEQO) is the real system this topic reads directly from its own documentation: below `geqo_threshold` (twelve FROM items by default) it searches every join order exhaustively; at or above it, a genetic algorithm takes over, encoding each join tree as an integer string and crossing two such strings over into a child, with mutation deliberately turned off so that crossover alone can never produce an illegal tour. The underlying dynamic program PostgreSQL actually uses below the threshold (DPccp, a program over connected subgraphs of the join graph) is not built in this topic; it is named here as the thing that runs instead, left for a reader to pursue on their own.

</section>

<section data-section="frontier">

## The frontier

For the *metric* version of the traveling salesman problem (where the triangle inequality holds), two actual guaranteed approximation algorithms exist — the minimum-spanning-tree double-tree method (ratio two) and Christofides's algorithm (ratio three halves) — neither built in this topic, and neither something local search alone gives you; a 2021 improvement on Christofides's ratio by Karlin, Klein and Oveis Gharan is named here only as a pointer, not verified against its own paper in this build. Tabu search, ant-colony optimization and parallel tempering are named once as the same broader family of searches without a proved bound, and none of them is developed further here.

</section>

<section data-section="questions">

## More questions

- This topic's genetic algorithm used order crossover and a fixed ten percent mutation rate. PostgreSQL's own GEQO uses edge recombination crossover instead and deprecates mutation outright. Would switching this topic's own implementation to edge recombination and zero mutation close the measured gap with simulated annealing, or widen it?
- The predict question asked which of two queries — one run once an hour, one run constantly — should risk the genetic planner's weaker plan. What would change the answer if the "weaker plan" risk were itself unknown in advance, rather than a documented trade-off?

</section>

<section data-section="next">

## Where this goes next

Every algorithm in this chapter, so far, assumed the whole input sat in front of it before it had to decide anything: the sets, the files, the points, the join graph. Some decisions do not get that luxury. A cache has to evict a page right now, before it knows which page will be asked for next, and the choice cannot be undone. The question changes from "how close to the best answer can you get" to "how close to the best answer could someone who could see the future have gotten". Online paging, next.

</section>
