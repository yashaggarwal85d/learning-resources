---
id: dsa.compressed-sparse-row-csr
title: Compressed sparse row (CSR) and reordering
---

<section data-section="outcomes">

## After this topic you can

- Build CSR's `offsets` and `targets` arrays from a real edge list in the two passes (count degrees → prefix sum; scatter), and verify the result matches the adjacency list topic 36 already built over the identical graph.
- Build CSC from the identical edge list and use it to answer a reverse-edge query CSR itself cannot answer directly.
- Measure, on a real synthetic graph, that degree-sort reordering shrinks the number of distinct cache lines a set of hub vertices' own entries depend on, and explain in one sentence why BFS/RCM and community order exist as alternatives to degree sort.

</section>

<section data-section="internals">

## Into the internals

### The two passes, exactly

Pass one counts every vertex's own out-degree, then turns those V counts into `offsets`'s V + 1 entries by a running prefix sum: `offsets[v]` is the total of every degree *before* v, so it has to be computed after every degree is known, left to right, not incrementally while edges are still being read. Pass two walks the edge list again, and for each edge writes its target into `targets` at its source's own next free slot — a per-vertex write cursor, initialised from a **copy** of `offsets`, never `offsets` itself. Reusing `offsets` directly as the cursor is the one classic bug this topic's own `examples.py` names and reproduces directly: the second pass's writes would corrupt the very array every later lookup depends on to find where a vertex's own slice starts.

### CSC is CSR, transposed

CSC answers "who points at v" with the identical two-pass idea, run over the edge list with source and target swapped. It is not a smarter query over CSR's own arrays — CSR was built to answer the other direction cheaply, and nothing about its own layout helps with the reverse one.

### Why a cache line, not a single value, is the right unit

A 64-byte cache line holds eight consecutive `float64` values, fetched together as one unit regardless of how many of them were actually asked for. A vertex's own id decides which line its value sits in; reordering never changes a vertex's own value, out-edges, or identity — only which id, and so which line, it occupies.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds CSR and CSC over the chapter's own six-vertex graph by the real two-pass construction, and checks every resulting slice against the adjacency list topic 36 already built — multi-edge included. It then builds a synthetic graph at 2,000,000 vertices and roughly 16,000,000 edges (the chapter's own syllabus names 100,000,000 edges as the production target; this sandbox's own hardware runs a smaller real measurement instead, at a scale chosen to still show the real effect clearly), with a skewed degree distribution: 2,000 "hub" vertices (0.1% of the graph) draw 90% of all edges, matching how real large graphs are known to be skewed rather than uniform. Before any reordering, those 2,000 hubs' own ids are scattered across virtually the entire 2,000,000-id range, landing in 1,995 distinct 64-byte cache lines — almost one hub, one line, with almost no sharing. After relabelling vertices by descending in-degree (degree sort), the identical 2,000 hubs occupy ids 0 through 1,999, which fit in exactly 250 cache lines. That is an 8.0&times; drop in the number of distinct cache lines the hub vertices' own entries depend on — computed exactly, not sampled from a timing run (this sandbox's own containerised CPU made wall-clock timing too noisy to assert on reliably across repeated runs).

</section>

<section data-section="production">

## In production

A published measurement of this same mechanism (Zhang et al., arXiv:1608.01362v2) reports up to 4&times; speedups on PageRank and Collaborative Filtering, and 2&times; on Betweenness Centrality, from degree-sort vertex reordering combined with a second technique (CSR segmenting) over real graph workloads — a different scale and a different, combined measurement from this topic's own, but the identical underlying mechanism: clustering frequently-read vertices into a small, cache-resident range of ids.

</section>

<section data-section="frontier">

## The frontier

Plain degree sort can do little for locality on a graph whose degrees are close to uniform, since sorting by a near-constant value is close to a random relabelling — real large graphs are rarely uniform, but the technique's benefit is graph-dependent, not universal. Heavier-weight orderings (GOrder, RabbitOrder, SlashBurn) trade more preprocessing time for a better order than any of this chapter's three named strategies achieve alone; Degree-Based Grouping (DBG) is a counter-proposal that buckets vertices into a few coarse degree groups rather than sorting fully, specifically because full degree sorting can break up community structure that already gave some locality for free.

</section>

<section data-section="questions">

## More questions

- If a graph's own vertex ids are also referenced from somewhere outside this structure (a separate name-to-id lookup table, say), what else has to change when the graph is reordered — and what breaks if it doesn't?
- Degree sort uses each vertex's own in-degree as its signal here. Community order uses cluster membership instead. Construct a small graph (on paper) where the two strategies would relabel the identical vertices into genuinely different orders.

</section>

<section data-section="next">

## Where this goes next

Graphs as sparse matrices (the GraphBLAS API, expressing graph algorithms as matrix-vector multiplication over a semiring) and property-graph storage (the index-free adjacency and labelled-property model behind graph databases) are both named here only in passing — this chapter's own syllabus marks both as skipped (`syllabus/review-notes/dsa-cuts.md`).

Compressed sparse row answers how a graph's own edges are laid out in memory, and reordering answers how to lay that same memory out so the layout actually helps. The next chapter asks a different kind of structural question about graphs: not how fixed connections sit in memory, but how to track which vertices end up in the same component as a graph of edges is built up one at a time — the structure behind Kruskal's minimum spanning tree, connected components, and entity-resolution clustering. Union–find, next.

</section>
