# Chapter 10 plan: Graph Representations (Data Structures & Algorithms, Milestone 1)

This is the contract for this chapter's two topics. The builder keeps to this entry. If a topic really can't keep to it, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 27 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 10, §10.1) and Chapter 9's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 10, title: 'Graph Representations', section: '10.1' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** both topics live in `…/m1-data-structures/ch10-graph-representations/<folder>`, next to this file.
- **Inherits from earlier chapters** (not re-taught; used directly): none this chapter reuses as a mechanism. This is the first chapter in Milestone 1 whose topics concern graphs at all — "vertex", "edge", "directed/undirected", "weighted" and "multigraph" are all introduced fresh here, not assumed from an earlier structure.

---

## The chapter

### The problem it solves

Every structure through Chapter 9 organized values along one dimension — an array's position, a key, now a space-filling curve's own linear order. A graph is a different shape of data entirely: a set of vertices and a set of connections between pairs of them, with no single "position" a vertex naturally sits at. Before any graph algorithm (breadth-first search, shortest paths, minimum spanning trees — all in Milestone 2) can be written, the graph itself has to live somewhere in memory, and the representation chosen decides which operations are cheap and which are expensive: can you check whether an edge exists in O(1), or must you scan a vertex's whole neighbour list? Does iterating every edge in the graph touch O(E) memory or O(V²)? Does the representation fit in cache at all once the graph has a billion edges? This chapter answers "how is a graph laid out in memory, and what does that layout cost" before Milestone 2 asks what to compute over it.

### Order of ideas, and why

1. **§10.1 Adjacency lists, matrices and edge lists (36, refresher).** The three textbook representations side by side: what each stores, its space cost, and the cost of its two most common queries (does edge (u, v) exist; what are u's neighbours). Directed vs undirected, weighted, and multigraph are each a small variation on the same three shapes, not a fourth representation. DAG terminology is named here (a directed graph with no cycles) because Milestone 2's algorithms (topological sort, DAG shortest paths) assume the term is already familiar, not because this chapter does anything with acyclicity itself.
2. **§10.1 Compressed sparse row (CSR) and reordering (37, full).** A fourth representation, built for scale rather than convenience: two flat arrays (`offsets`, `targets`) instead of a list-of-lists, eliminating per-vertex pointer overhead entirely. CSR is built directly from an edge list in two linear passes (count degrees, then scatter), which is why topic 36 introduces the edge list first. CSC is the same idea transposed, for reverse-edge queries. Vertex reordering (degree sort, BFS/RCM, community order) is a second, independent idea that composes with CSR: relabelling vertices before building the arrays so that a vertex's neighbours land near each other in memory, which is what actually buys the cache-locality win at billion-edge scale.
3. **Handoff to Chapter 11.** Topic 37 ends having answered how a graph's own edges are laid out in memory and why that layout decides which algorithms run fast on it. Chapter 11 asks a structural question about a different kind of graph-adjacent bookkeeping: not how to lay out fixed connections, but how to track which vertices end up in the same component as a graph of edges is built up one at a time (union–find), which this same milestone names as the structure behind Kruskal's MST, connected components and entity-resolution clustering.

**Skipped in this chapter** (stay in the curriculum, get no reel, per `syllabus/review-notes/dsa-cuts.md`, "Chapter 10 — Graph Representations (2 of 4)"): Graphs as sparse matrices (GraphBLAS) and Property-graph storage (§10.1). Both are named once, in passing, in topic 37's post-notes "Where this goes next" for cross-reference, never rebuilt.

### One running example: a small, fixed directed weighted graph, reused and scaled up

Chapters 1–9 each built one running example sized to fit a single frame. This chapter needs two scales at once: a tiny graph (6–8 vertices, 10–14 edges) small enough that every representation's full contents fit on screen for topic 36 and for CSR's own two-pass construction in topic 37, and a large synthetic graph (the builder picks a size that keeps `examples.py` fast to run, documented in `OUTLINE.md`; the syllabus's own Lab names 100M edges as the target scale for the real measurement, which the builder reproduces in the post-notes lab, not necessarily inside the reel's own animation) for the reordering locality measurement. Every number on screen is computed or asserted in each topic's own `examples.py`; the values here are planning values, and the builder who finds one wrong fixes it in `examples.py` and records it in `REVIEW.md`.

| Piece | Planning values (the builder computes and asserts its own) | Used by |
|---|---|---|
| The small graph | a fixed directed, weighted graph, 6–8 vertices and 10–14 edges, with at least one multi-edge (two edges between the identical ordered pair) so topic 36 can show how each representation handles it | 36, 37 |
| Edge list | the small graph's own edge list, (u, v, weight) triples, the input topic 37 builds CSR from | 36, 37 |
| CSR construction | the small graph's own offsets and targets arrays, built in the two passes the syllabus names (count degrees, then scatter), shown step by step | 37 |
| Large synthetic graph | a synthetic sparse graph at whatever vertex/edge count the builder's own hardware runs `examples.py` against in reasonable time (document the real count used; the syllabus names 100M edges as the production target the lab's own numbers should be read against) | 37 |
| Locality measurement | BFS (or neighbour-iteration) cache-miss counts or wall-clock time, measured before and after degree-sort reordering, on the large synthetic graph | 37 |

### Shared notation and terms

- **Vertex, edge, directed, undirected, weighted, multigraph, DAG:** all introduced in topic 36, in the plain terms a later algorithm topic (Milestone 2) will assume without re-explaining.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); "adjacency list," "adjacency matrix," "edge list," "compressed sparse row," "offsets array," "targets array," "degree sort" should be said as the named terms they are, any digit spoken in words (QUALITY.md #29).

### One visual language for the chapter's reel

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme: black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` a vertex or a stored value (a cell, a list entry, an array slot), drawn once it exists; `latte` secondary labels (an edge weight, an index, a degree count); `taupe` memory not yet touched by the construction being traced; `caramel` **the thing to look at**: the representation or array being built right now, or the one neighbour-iteration step the caption names; `cinnamon` (rare) **the alternative being compared**: an adjacency list's own scattered allocations set directly against CSR's own two flat arrays, or a reordered vertex's new position set against its old one; `cherry` with `cherryText` **the bad outcome**: a cache miss, or an adjacency-matrix cell that must represent two parallel edges and can't.
- **The small graph is drawn the same way across both topics:** vertices as labelled circles, directed edges as arrows with their weight on the edge, so the identical graph is instantly recognisable moving from topic 36 into topic 37.
- **A representation is drawn as what it actually is in memory:** an adjacency list as a row of vertices each with its own short chain of neighbour cells; an adjacency matrix as a V×V grid of cells; an edge list as a flat row of (u, v, weight) triples; CSR as exactly two flat arrays (`offsets`, `targets`) with arrows showing which slice of `targets` each vertex's `offsets` entries select. Never an abstract box labelled with the representation's name instead of its real shape.
- **Reel shape.** Topic 36 is a refresher (about 5 minutes, at least one predict question): open on the problem (one query, "does this edge exist," asked against three representations at once), each representation's real space and query cost, direction/weight/multigraph as a variation on each, DAG named, then a brief "which representation does each later algorithm assume" close. Topic 37 is a full topic (about 13–15 minutes, 2–4 predict questions): open on the cost of an adjacency list at billion-edge scale (pointer-chasing, per-node allocation overhead), CSR's own two flat arrays, the two-pass construction from an edge list, CSC named for reverse edges, then vertex reordering and its measured locality win, then "Prove it."

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch10-graph-representations/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it.

### 36. Adjacency lists, matrices and edge lists (`dsa.adjacency-lists-matrices-edge`): refresher, §10.1

- **Folder:** `adjacency-lists-matrices-edge`. About 5 min.
- **Scope (syllabus clause → what it delivers):**
  - "space and query costs": each of the three representations' own space cost (adjacency list O(V + E); adjacency matrix O(V²); edge list O(E)) and the cost of its two most common queries — does edge (u, v) exist, and what are u's own neighbours — verified against the chapter's own small graph, not asserted from memory.
  - "directed/undirected": a directed edge as one entry (list), one asymmetric cell (matrix), one ordered triple (edge list); an undirected edge as two entries (list, one per endpoint), one symmetric pair of cells (matrix), one unordered pair (edge list) — shown as the identical small graph read both ways.
  - "weighted": where the weight lives in each representation (the list entry becomes a pair, the matrix cell holds the weight instead of a boolean, the edge-list triple's third field).
  - "multigraph": the chapter's own small graph includes a real multi-edge; the adjacency list and edge list represent it with no change in kind (one more entry), while the adjacency matrix cannot represent two parallel edges without changing what a cell means (a count, or losing one edge's own weight) — the one real limitation that distinguishes the matrix from the other two.
  - "DAG terminology": a directed acyclic graph named and defined (a directed graph with no directed cycle) against the chapter's own small graph if it happens to be acyclic, or a second tiny example if not; defined here because Milestone 2's own algorithm topics (topological sort, DAG shortest paths) use the term without re-defining it.
  - "which representation each later algorithm assumes": a brief closing comparison — naming (not building) that breadth-first and depth-first search assume an adjacency list, that dense or small graphs can afford an adjacency matrix, that an edge list is the natural input format before any representation is built (exactly topic 37's own starting point) — establishing the cross-reference without rebuilding any later algorithm here.
- **Outcomes:**
  - State the space cost and the cost of an edge-existence check and a neighbour-iteration for each of the three representations, and verify them against a real graph.
  - Represent the identical directed, weighted, multi-edge graph in all three ways, and name the one query each representation makes expensive.
  - Define a DAG and recognise the one representation detail (multi-edges) that an adjacency matrix cannot express.
- **Introduces:** `adjacency-list`, `adjacency-matrix`, `edge-list`, `directed-acyclic-graph`. **Uses:** none from an earlier chapter as a reused mechanism. **Declared:** none new beyond its own.
- **Bridge:** word for word, topic 35's own handoff above ("A space-filling curve turns points scattered across several dimensions into one ordering that keeps nearby points nearby, letting an ordinary one-dimensional structure index spatial data directly. The next chapter asks a structural question instead, about connections rather than coordinates: how a graph's own edges are laid out in memory, and why that layout alone decides which algorithms run fast on it. Adjacency lists, matrices and edge lists, next.").
- **Handoff:** "Three representations, three different costs for the same two queries — and none of them is free at scale: an adjacency list pays a pointer and an allocation per edge, millions of times over on a billion-edge graph. The next topic asks what a graph representation looks like when it's built for exactly that scale instead of for convenience. Compressed sparse row, next."
- **Prerequisites panel:** none from an earlier chapter as a direct prerequisite (graph vocabulary is introduced fresh in this topic). On-site: none new.
- **Visual idea:** the identical small directed, weighted, multi-edge graph drawn once, then redrawn as an adjacency list, an adjacency matrix and an edge list in turn, with the one multi-edge highlighted in each to show how (or whether) each representation keeps both edges.
- **Sources to start from:** a current, careful algorithms reference (textbook or well-documented course material) on graph representations and their complexity costs; a current reference defining DAG terminology consistently with how Milestone 2's topological-sort and DAG-shortest-path topics will use it (to verify at research time, not assumed here).

### 37. Compressed sparse row (CSR) and reordering (`dsa.compressed-sparse-row-csr`): full, §10.1

- **Folder:** `compressed-sparse-row-csr`. About 14 min.
- **Scope (syllabus clause → what it delivers):**
  - "offsets + targets arrays": CSR's own two flat arrays over the chapter's small graph — `offsets` (length V + 1, where `offsets[v]` to `offsets[v+1]` is the slice of `targets` holding v's own neighbours) and `targets` (length E, one entry per directed edge) — built and read directly, not described abstractly.
  - "CSC for reverse edges": the identical idea transposed — CSC's own `offsets`/`targets` pair indexed by destination instead of source, answering "who points at v" exactly as cheaply as CSR answers "who does v point at," built over the identical small graph so the two are directly comparable.
  - "building CSR from an edge list in two passes": pass one counts each vertex's out-degree and turns those counts into `offsets` by a running prefix sum; pass two walks the edge list again, scattering each edge into `targets` at its source vertex's own next free slot (a per-vertex write cursor initialised from `offsets`) — both passes shown step by step over the chapter's small edge list, each array's contents checked against the adjacency list topic 36 already built for the identical graph.
  - "vertex reordering (degree sort, BFS/RCM, community order) to improve locality on billion-edge graphs": three real reordering strategies named and explained by what each optimises for — degree sort (relabel by descending degree, cheapest to compute, clusters high-degree "hub" vertices together); BFS/RCM (Reverse Cuthill–McKee: relabel in BFS visiting order, then reverse it, so a vertex's neighbours get nearby labels because they were visited nearby in time); community order (relabel by graph-clustering/community-detection output, so vertices that are densely interconnected — and so frequently traversed together — get nearby labels) — then the one real payoff: CSR built over a reordered vertex-numbering puts a vertex's neighbours' own array slots physically closer together in memory, measured directly as a drop in cache misses or wall-clock time on the chapter's own large synthetic graph, reproducing (at whatever scale the builder's own hardware runs in reasonable time, recorded in `OUTLINE.md`) the syllabus's own named target of billion-edge graphs.
- **Outcomes:**
  - Build CSR's `offsets` and `targets` arrays from a real edge list in the two passes the syllabus names, and verify the result matches an adjacency list built over the identical graph.
  - Build CSC from the identical edge list and use it to answer a reverse-edge query CSR itself cannot answer directly.
  - Measure, on a real (synthetic) large graph, that a degree-sort reordering before building CSR measurably improves locality (fewer cache misses, or less wall-clock time) on a neighbour-traversal workload, and explain in one sentence why BFS/RCM and community order exist as alternatives to degree sort.
- **Introduces:** `compressed-sparse-row`, `compressed-sparse-column`, `vertex-reordering`. **Uses:** `adjacency-list`, `edge-list` (both from topic 36: CSR is built from an edge list, and compared directly against the adjacency list topic 36 already built). **Declared:** none new beyond its own.
- **Bridge:** word for word, topic 36's own handoff above ("Three representations, three different costs for the same two queries — and none of them is free at scale: an adjacency list pays a pointer and an allocation per edge, millions of times over on a billion-edge graph. The next topic asks what a graph representation looks like when it's built for exactly that scale instead of for convenience. Compressed sparse row, next.").
- **Handoff:** "Compressed sparse row answers how a graph's own edges are laid out in memory, and reordering answers how to lay that same memory out so the layout actually helps. The next chapter asks a different kind of structural question about graphs: not how fixed connections sit in memory, but how to track which vertices end up in the same component as a graph of edges is built up one at a time — the structure behind Kruskal's minimum spanning tree, connected components, and entity-resolution clustering. Union–find, next."
- **Prerequisites panel:** topic 36 (adjacency lists and edge lists) as a direct prerequisite. On-site: none new.
- **Visual idea:** the identical small graph's edge list scattered into CSR's two flat arrays, pass by pass, with `offsets`' running prefix sum counting up and each `targets` slot filling in turn; then the same construction repeated after a degree-sort relabelling, with the large synthetic graph's own measured cache-miss (or time) numbers shown as two real bars, before and after.
- **Sources to start from:** a current, careful reference on the CSR/CSC sparse-matrix-style graph layout and its two-pass construction (this exact format is shared with sparse linear algebra, so a sparse-matrix reference is a legitimate primary source alongside a graph-algorithms one); a current reference on Reverse Cuthill–McKee and on degree-based or community-based graph reordering for cache locality, ideally with a measured result from the literature to cross-check the topic's own measurement against (to verify at research time, not assumed here).

---

## Concept ledger at a glance (introduces, in order)

36. `adjacency-list`, `adjacency-matrix`, `edge-list`, `directed-acyclic-graph`
37. `compressed-sparse-row`, `compressed-sparse-column`, `vertex-reordering`

Each concept is introduced once. No concept is declared a second time in this chapter.

## Notes for the release run

1. **Verification discipline carries over from Chapters 1–9.** Every "to verify" claim above is a placeholder for the research stage (section 3 of the skill): fetch or read a current primary or well-documented source, quote or cite it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory.
2. **Seams to check at release:** topic 37's own handoff against Chapter 11's first topic's actual opening (the exact wording above, "Union–find, next," must match whatever Chapter 11's plan actually names as its own first topic); topic 36's own handoff against topic 37's actual opening.
3. **The syllabus's own Lab bullet** ("load a 100M-edge graph into adjacency lists of vectors and into CSR; time BFS on both before and after degree-based reordering and attribute the gap with cache-miss counters") depends on structures both topics in this chapter build (unlike Chapter 9's lab, which this chapter does not inherit any constraint from); it belongs in topic 37's own post-notes "lab" section, reusing topic 36's adjacency-list construction as the "before" baseline. The exact scale actually run is the builder's own hardware-bound choice, recorded in `OUTLINE.md`, read against the syllabus's own 100M-edge target rather than literally reproducing it if that proves impractical in session.
4. **Cross-domain links:** none named directly in this chapter's own §10.1 syllabus line (unlike Chapter 9's Delta Lake link); the skipped "Property-graph storage" line names a Data Engineering §17.3/§17.4 link, which stays with the skip note and is not this chapter's concern.
