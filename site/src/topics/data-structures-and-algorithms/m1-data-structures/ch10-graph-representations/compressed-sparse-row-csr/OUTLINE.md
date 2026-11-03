# OUTLINE: Compressed sparse row (CSR) and reordering (`dsa.compressed-sparse-row-csr`)

## Learning outcomes

1. Build CSR's `offsets` and `targets` arrays from a real edge list in the two passes (count degrees → prefix sum; scatter), and verify the result matches the adjacency list topic 36 already built over the identical graph.
2. Build CSC from the identical edge list and use it to answer a reverse-edge query ("who points at v") CSR cannot answer directly.
3. Name degree sort, BFS/RCM and community order as three reordering strategies that pursue the identical cache-locality goal from three different signals, and explain — with a real, exact measurement — why clustering high-degree vertices' ids shrinks the number of distinct cache lines their reads depend on.

## Reel steps (storyboard)

### Step 1 — Hook: the adjacency list's own cost at scale
- **fig:** `Opening`
- **Visual idea:** the chapter's small graph redrawn as an adjacency list (topic 36's own picture), then a caption naming a billion-edge graph: each node in the list is its own small heap allocation and pointer, millions of times over.
- **On screen:** the small graph's adjacency-list chains (reused from topic 36's drawing), then text scaling the per-edge pointer-chase cost up to "billions of edges, billions of allocations."
- **Moves:** `Draw` fades in the chains (from topic 36's own layout); a `Decode` types in the scaled-up cost line.
- **Final frame:** the adjacency list's chains sitting next to the words "one allocation, one pointer — per edge, at any scale."
- **Narrator's line of thought:** an adjacency list's own cost wasn't wrong at six vertices — it never had to pay for a billion separate allocations. The question this topic opens on is what changes when it does.
- **Takeaway:** none yet (step 1 is the hook).

### Step 2 — CSR: two flat arrays instead of a list of lists
- **fig:** `TwoArrays`
- **Visual idea:** the identical small graph's edge list (topic 36's own edge-list picture) redrawn as two flat arrays side by side: `offsets` (6 boxes, one per vertex, plus one more) and `targets` (10 boxes, one per edge), empty at first.
- **On screen:** `offsets` and `targets`, both drawn as flat strips of boxes, unlabelled with values yet.
- **Moves:** `Draw` outlines both arrays; a `Reticle` calls out that `targets` has exactly one box per edge (10), and `offsets` has one more box than there are vertices (7, not 6).
- **Final frame:** two empty flat arrays, `offsets` captioned "length V + 1" and `targets` captioned "length E."
- **Narrator's line of thought:** no per-vertex allocation at all here — just two arrays, sized by vertex count and edge count directly. The "+1" on `offsets` looks like an off-by-one until the next step shows exactly what that extra box is for.
- **Takeaway:** "CSR replaces one allocation per edge with two flat arrays, sized V + 1 and E."

### Step 3 — Pass one: counting degrees into a prefix sum
- **fig:** `PassOneCount`
- **Visual idea:** each vertex's out-degree counted from the edge list (A: 3, B: 2, C: 2, D: 2, E: 1, F: 0), then those six counts turned into `offsets`'s seven values by a running prefix sum, counted up left to right.
- **On screen:** the six degree counts above the graph's vertices, then an arrow sweeping left to right across `offsets`'s boxes as each running total fills in.
- **Moves:** `Plot` places each degree count as it's read off the edge list; `Draw` animates the prefix-sum sweep filling `offsets` left to right, each box's value the sum of every degree before it.
- **Final frame:** `offsets` fully filled — `[0, 3, 5, 7, 9, 10, 10]` — with the last two boxes both showing 10 (E's slice ends where F's empty slice also ends).
- **Narrator's line of thought:** `offsets[v]` isn't v's own count — it's the total of everyone's count *before* v. That's why it has to be a running sum, not six independent numbers: F's own entry only makes sense once every other vertex's degree has already been added in.
- **Takeaway:** "Offsets[v] is a running total of every degree before v, not v's own degree."

### Step 4 — Pass two: scattering edges with a write cursor — predict
- **fig:** `PassTwoPredict`
- **Visual idea:** a predict question about the one classic bug: can pass two just write into `offsets` directly as its own cursor?
- **On screen:** the filled `offsets` array from step 3, with a question mark over whether a second pass can reuse it directly as its write position.
- **Moves:** none yet (a predict step, held static until answered).
- **Predict options:** "Yes — offsets already holds exactly the next free slot for each vertex" / "No — writing into offsets directly would corrupt it, so pass two needs its own copy as a cursor" (correct) / "It doesn't matter, since offsets is rebuilt from scratch afterward anyway" / "No — targets has to be built before offsets, not after."
- **Explain:** `offsets[v]` has to survive this pass unchanged — later code reads `offsets[v]` to `offsets[v+1]` to find v's own slice, forever. Pass two needs a separate, mutable copy to track "the next free slot," initialised from offsets but advanced on its own.
- **Final frame:** the predict card itself.
- **Narrator's line of thought:** this is the one place a real implementation most often breaks CSR: forgetting that `offsets` has to keep meaning "where v's slice starts" after construction, not just during it.
- **Takeaway:** none (predict step).

### Step 5 — Pass two, resolved: the scatter, and the cross-check
- **fig:** `PassTwoScatter`
- **Visual idea:** a separate cursor array (a copy of `offsets`) advancing as each edge from the edge list gets written into its own source's next free slot in `targets`; then `targets`'s finished contents laid directly beside topic 36's own adjacency-list chains for A, to show they hold the identical three neighbours.
- **On screen:** the cursor array ticking up one slot at a time as `targets` fills; then a side-by-side of `targets`'s slice for A (`[B, C, B]`) against topic 36's own chain for A.
- **Moves:** `Draw` animates the scatter, one edge at a time; a final `Draw` draws the side-by-side comparison, locking on with `Reticle` where they match.
- **Final frame:** `targets` fully filled, A's own three-entry slice matching topic 36's own three-entry chain exactly, multi-edge (two B's) and all.
- **Narrator's line of thought:** this is the proof this is the same graph topic 36 already built, just laid out differently — not a new structure with its own, possibly different, answer.
- **Takeaway:** "CSR's own slice for a vertex matches its adjacency list exactly — same neighbours, different layout."

### Step 6 — CSC: the identical idea, transposed — predict
- **fig:** `CSCPredict`
- **Visual idea:** the question CSR's own arrays cannot answer in one lookup: who points at F?
- **On screen:** F highlighted, with CSR's own `targets` array shown as the only thing available, and the question "which array answers this in one lookup?"
- **Moves:** none yet (predict).
- **Predict options:** "Scan all of targets for F's own index — CSR already supports this directly" / "Build a second pair of arrays, CSC, indexed by destination instead of source" (correct) / "F has no incoming edges, so the question has no answer" / "Rebuild the adjacency list and read it backwards."
- **Explain:** CSR is built to answer "who does v point at" in one slice; "who points at v" needs the identical idea run the other way — CSC, built from the same edge list with source and destination swapped.
- **Final frame:** the predict card.
- **Narrator's line of thought:** this is the same lesson as topic 36's own list-vs-matrix trade: a structure optimised for one direction of query doesn't answer the other direction for free. CSR being "already laid out in memory" doesn't change what it was laid out to answer.
- **Takeaway:** none (predict step).

### Step 7 — CSC, resolved
- **fig:** `CSCReveal`
- **Visual idea:** CSC's own `offsets`/`targets` pair built from the same small edge list, transposed, with F's own slice revealing `[D, E]` and B's own slice revealing the multi-edge from the other direction, `[A, A]`.
- **On screen:** CSC's two flat arrays, F's and B's own slices highlighted.
- **Moves:** `Draw` builds CSC's arrays (fast — the identical two-pass idea, not re-explained step by step); `Reticle` locks on F's and B's own slices.
- **Final frame:** CSC's arrays with F's own slice reading `[D, E]` and B's own slice reading `[A, A]`.
- **Narrator's line of thought:** CSC answers "who points at F" exactly as cheaply as CSR answered "who does A point at" — the same construction, the same cost, the other direction.
- **Takeaway:** "CSC is CSR transposed: the same two-pass construction, indexed by destination instead of source."

### Step 8 — Why reordering: a hub's slice, scattered
- **fig:** `WhyReorderHook`
- **Visual idea:** zoom out to a billion-edge graph's own CSR, where a handful of "hub" vertices are read constantly (many other vertices' edges point at them) but their own ids sit scattered at random, far-apart positions across the whole vertex-id range.
- **On screen:** a small cluster of highlighted "hub" dots scattered across a long numbered strip representing the full vertex-id range.
- **Moves:** `Surface` or a simple `Plot` scattering the hub dots at random positions along the strip; a `cherry`-coloured annotation marking how far apart two hubs' own ids sit.
- **Final frame:** the scattered hubs, captioned with how far apart their own ids are.
- **Narrator's line of thought:** CSR's own layout never said anything about which id a vertex gets — that's a free choice this topic hasn't used yet. A hub read constantly but sitting at a random, far-off id pays for that distance every single time.
- **Takeaway:** "CSR never fixes which id a vertex gets — reordering is a free choice CSR leaves open."

### Step 9 — Three reordering strategies, named
- **fig:** `ThreeStrategies`
- **Visual idea:** the identical scattered-hub strip from step 8, with three small labelled arrows showing three different signals for relabelling it: degree sort (by raw degree alone), BFS/RCM (by breadth-first visiting order from a low-degree start), community order (by detected cluster membership).
- **On screen:** three short captions, each beside the same strip, naming what each strategy sorts by.
- **Moves:** `Decode` types in each strategy's name in turn; no change yet to the strip itself (this step names, step 10 performs).
- **Final frame:** all three named, side by side.
- **Narrator's line of thought:** these aren't three unrelated tricks — they're three different answers to "which vertices will be read close together in time," from the simplest signal (degree alone) to a more structural one (which community a vertex's own neighbours mostly fall into).
- **Takeaway:** "Degree sort, RCM and community order relabel by three different signals toward the identical goal: neighbours at nearby ids."

### Step 10 — Degree sort, performed: hubs clustered — predict
- **fig:** `DegreeSortPredict`
- **Visual idea:** degree sort actually run on the scattered hubs from step 8 (2,000 hubs out of 2,000,000 vertices, each hub drawing most of its graph's own in-edges) — a predict question about what happens to a 64-byte cache line (8 ids) once the hubs are relabelled to the smallest ids.
- **On screen:** the scattered-hub strip from step 8, beside an empty "after degree sort" strip.
- **Moves:** none yet (predict, held before the reorder animates).
- **Predict options:** "Nothing changes — a cache line still only ever holds one vertex's own value" / "The hubs end up packed into a tiny range of ids, so most cache lines in that range now hold only hub values" (correct) / "Degree sort removes the need for a value array entirely" / "Only the single highest-degree hub benefits; the rest are unaffected."
- **Explain:** a cache line is a fixed-size block of memory (8 of these float values), not one id — relabelling 2,000 hubs into ids 0 through 1,999 means a cache line fetched anywhere in that tiny range is now almost entirely useful hub data, instead of mostly unrelated, unread values.
- **Final frame:** the predict card.
- **Narrator's line of thought:** the win isn't "a hub gets fetched faster" — a single value was never slow to fetch alone. It's that fetching one hub's own cache line now also pulls in several *other* hubs for free, because they're sitting right next to it.
- **Takeaway:** none (predict step).

### Step 11 — The measured payoff
- **fig:** `MeasuredPayoff`
- **Visual idea:** two real bars, before and after degree-sort reordering, showing the exact number of distinct 64-byte cache lines the 2,000 hub vertices' own entries depend on.
- **On screen:** "before: 1,995 cache lines" and "after: 250 cache lines" as two bars, the second visibly far shorter, with "8.0x fewer" between them.
- **Moves:** `Bar` draws both bars growing from zero; a `cherry`→`crema` colour shift on the "after" bar once it lands.
- **Final frame:** both bars, final numbers captioned, "8.0x fewer distinct cache lines."
- **Narrator's line of thought:** before reordering, 2,000 hubs spread across 2,000,000 ids land in essentially 2,000 separate cache lines — one hub, one line, almost no sharing. After reordering, those same 2,000 hubs are packed into ids 0 through 1,999, which is exactly 250 cache lines of 8 each. Nothing about any hub's own value changed — only which id, and so which cache line, it lives at.
- **Takeaway:** "Packing 2,000 hub vertices into contiguous ids cuts their own cache-line footprint from about 2,000 lines to 250 — an 8x drop, measured directly, not estimated."

### Step 12 — Recap
- **fig:** `Recap`
- **Visual idea:** the chapter's small graph one more time, with CSR's two arrays, CSC's two arrays, and a reordered strip of hub ids all drawn together in miniature.
- **On screen:** three small panels (CSR, CSC, reordering) under one heading, "how a graph's own edges sit in memory."
- **Moves:** `Draw` fades in all three panels together; no new content, a pure recap.
- **Final frame:** all three panels, captioned with the chapter's own next step.
- **Narrator's line of thought:** CSR answered how to lay a graph out without paying per-edge allocation; CSC answered the same question in reverse; reordering answered how to lay that same memory out so the layout actually pays off at scale.
- **Takeaway:** "CSR, CSC and reordering are three answers to one question: how a graph's own edges sit in memory, and what that costs."

## Engagement arc

- **Hook (step 1):** the adjacency list's real cost at billion-edge scale, framed as a cost topic 36 never had to pay at six vertices.
- **Early predict (step 4, within the first four full-weight steps):** the write-cursor bug — whether pass two can reuse `offsets` directly.
- **Second predict (step 6):** which structure answers a reverse-edge query.
- **Surprising number (step 11):** 1,995 → 250 distinct cache lines, an 8.0x drop, from relabelling alone — no data changed, only which id each hub owns.
- **Takeaways:** steps 2, 5, 7, 9, 11, 12 (six, comfortably past the "at least three" floor).
- **Recap:** step 12.

## Narrator's line of thought (summary; full lines in narration.json)

Each step's narration explains *why*, not what's drawn: why offsets needs a running sum rather than six independent counts (step 3); why a second pass can't reuse offsets directly, naming the exact bug (step 4); why CSC is a second, transposed structure rather than a smarter query over CSR (steps 6–7); why a cache line, not a single value, is the right unit to reason about reordering's own payoff (step 10); and why the measured 8.0x drop in distinct cache lines is the real mechanism behind the published 4x/2x speedups cited in SOURCES.md, not a reproduction of those exact figures at a different scale (step 11).

## Post-notes headings

- **Internals:** the exact two-pass pseudocode, the write-cursor bug named precisely, and why `offsets` must have length V + 1.
- **Lab:** the chapter's own 100M-edge target (CHAPTER.md), reproduced at 2,000,000 vertices / ~16,000,000 edges in this sandbox (`examples.py`), with the real, exact cache-line count (not a timing side-channel, which this sandbox's own shared CPU made too noisy to assert on reliably) as the measured payoff.
- **Production failures:** forgetting to copy `offsets` before using it as pass two's cursor (silently corrupts every later lookup); reordering a graph whose vertex ids are referenced from outside the structure itself (an external id-to-vertex mapping has to be reordered too, or every outside reference breaks).
- **Frontier:** GOrder, RabbitOrder and SlashBurn as heavier-weight reordering heuristics than degree sort, RCM or community order, trading more preprocessing time for a better order; Degree-Based Grouping (DBG) as a counter to naive degree sort, which can break up community structure that already gave some locality for free.
- **Where this goes next:** graphs as sparse matrices (GraphBLAS) and property-graph storage, both named once here and in the chapter's own skip note, never rebuilt; Chapter 11's union–find, next.

## Examples to execute and what each must assert

All in `examples.py` (already written and passing):
- CSR's `offsets`/`targets` built from the chapter's own small edge list, matching topic 36's adjacency list exactly for every vertex, multi-edge included.
- The write-cursor's own final position matching `offsets`'s own next-vertex boundary, with `offsets` itself provably unmodified.
- CSC built the same way, transposed, answering two real reverse-edge queries and matching a brute-force scan.
- A 2,000,000-vertex synthetic graph with a real skewed (hub-heavy) degree distribution; the exact, deterministic drop in distinct 64-byte cache lines the hub vertices' own entries occupy, before (1,995) and after (250) degree-sort reordering — an 8.0x drop.

## Bridge and handoff

- **Bridge** (word for word from topic 36's own handoff, per CHAPTER.md): "Three representations, three different costs for the same two queries — and none of them is free at scale: an adjacency list pays a pointer and an allocation per edge, millions of times over on a billion-edge graph. The next topic asks what a graph representation looks like when it's built for exactly that scale instead of for convenience. Compressed sparse row, next."
- **Handoff** (word for word, per CHAPTER.md): "Compressed sparse row answers how a graph's own edges are laid out in memory, and reordering answers how to lay that same memory out so the layout actually helps. The next chapter asks a different kind of structural question about graphs: not how fixed connections sit in memory, but how to track which vertices end up in the same component as a graph of edges is built up one at a time — the structure behind Kruskal's minimum spanning tree, connected components, and entity-resolution clustering. Union–find, next."

## Concept ledger

- **Introduces:** `compressed-sparse-row`, `compressed-sparse-column`, `vertex-reordering`.
- **Uses:** `adjacency-list`, `edge-list` (both from topic 36).
- **Declared:** none new.

## Claims list (source: see SOURCES.md and FACT-CHECK.md)

1. CSR stores a sparse matrix (here, a graph) as three arrays: values, column indices, row-start offsets — "Sparse matrix" (Wikipedia).
2. The row-offsets array has length m + 1, encoding where each row starts in the other two arrays — "Sparse matrix" (Wikipedia).
3. CSC is CSR with values read column-first, a row index per value, and column-start pointers — "Sparse matrix" (Wikipedia).
4. RCM relabels vertices to reduce adjacency-matrix bandwidth, starting from a peripheral (lowest-degree) vertex — "Cuthill–McKee algorithm" (Wikipedia).
5. Degree-sort vertex reordering improves cache-line utilization with no runtime overhead, and measurably sped up real graph workloads (up to 4x on PageRank/Collaborative Filtering, 2x on Betweenness Centrality) in published work — Zhang et al., arXiv:1608.01362v2.
6. A community is a set of vertices more densely connected internally than to the rest of the graph — "Community structure" (Wikipedia).
7. This topic's own measured claim (8.0x fewer distinct cache lines for 2,000 hub vertices after degree-sort reordering, on a 2,000,000-vertex synthetic graph) is a real, exact, deterministic computation in `examples.py`, not a reproduction of claim 5's published figures at a different scale.
