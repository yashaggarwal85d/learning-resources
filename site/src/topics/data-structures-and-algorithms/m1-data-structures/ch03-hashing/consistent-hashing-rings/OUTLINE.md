# Outline — Consistent hashing rings

## Learning outcomes

1. Explain ring placement and why a key's owning machine is found by walking clockwise from the key's hash.
2. Explain virtual nodes as the fix for a single ring point's unpredictable load share.
3. State the minimal-remapping property and measure it directly for a join or leave.
4. Name the bounded-loads extension and the real guarantee it adds over plain consistent hashing.

## Engagement arc

- **Hook (step 1):** topic 20 answered what a resize costs on one machine; this topic asks the same question one level up — when a *machine* joins or leaves, how many keys move?
- **Predict (step 3):** "a new machine joins the ring. How many keys actually have to move to it?"
- **Predict (step 6):** "one machine's single point on the ring gets an unpredictable share of the keys. What actually fixes that?"
- **Surprising number:** a real production system's own documented virtual-node count (256 tokens per node, Cassandra's older random-allocation default) — a concrete, cited number, not an invented one.
- **Takeaways:** steps 4, 7, 8 (three).
- **Recap (step 9, "Prove it"):** measured, side by side — the fraction of keys that move on a ring join vs. topic 20's full-table resize, and virtual nodes' real evenness improvement.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** topic 20's single-machine table resize (every key moving) dissolving into a ring of several machines, with the same question asked one level up.
- **Caption:** a single machine's table can always grow. Consistent hashing asks the same question one level up: when a machine itself joins or leaves, how many keys have to move?
- **Narrator's line of thought:** "last topic was about data moving inside one machine. This one is about data moving between machines."

### 2 — RingPlacement
- **fig:** `RingPlacement`
- **Visual idea:** both keys and machines hashed onto the same circular range; a key's dot connecting to the first machine found walking clockwise from it.
- **Caption:** hash both keys and machines onto the same ring. A key belongs to the first machine you find walking clockwise from the key's own position.
- **Narrator's line of thought:** "this is the exact same hashing idea from every earlier topic — just applied to machines, not slots in one array."

### 3 — JoinPredict (predict)
- **fig:** `JoinPredict`
- **Visual idea:** a new machine's dot landing on the ring between two existing machines, asking how many of the ring's keys actually have to move.
- **Predict options:**
  1. "All of them, the same as a single-machine resize"
  2. "About half of them"
  3. **"Only the keys between the new machine's position and its clockwise neighbor"** (correct)
  4. "None, until the ring itself needs to grow"
- **Explain:** only the short arc of keys between the new machine's own position and the next machine clockwise ever belonged to that neighbor in the first place — every other key's owning machine never changes.
- **Narrator's line of thought:** "topic twenty's resize moved everything. This is the entire point of the ring: almost nothing does."

### 4 — MinimalRemapping
- **fig:** `MinimalRemapping`
- **Visual idea:** the ring redrawn with only the short arc between the new machine and its clockwise neighbor highlighted as moved; every other key's position untouched.
- **Caption:** only the keys in that one short arc move. Every other key, on every other machine, stays exactly where it was.
- **Takeaway:** "Only the keys between a joining machine and its clockwise neighbor move — not the whole ring."
- **Narrator's line of thought:** "contrast this directly with last topic's resize, where every single key moved."

### 5 — ImbalanceProblem
- **fig:** `ImbalanceProblem`
- **Visual idea:** a ring with a handful of machines, each hashed to exactly one point, with a bar chart beneath showing wildly uneven key counts per machine.
- **Caption:** one point per machine isn't enough. Pure chance gives some machines a much larger arc of the ring than others.
- **Narrator's line of thought:** "the ring's math is elegant. The one point per machine part is where it falls apart in practice."

### 6 — VirtualNodesPredict (predict)
- **fig:** `VirtualNodesPredict`
- **Visual idea:** the same lopsided ring from the previous step, asking what actually fixes one machine's unpredictable share.
- **Predict options:**
  1. "Give the overloaded machine more memory"
  2. **"Hash each machine to many points on the ring instead of just one"** (correct)
  3. "Pick each machine's ring position by hand instead of hashing it"
  4. "Shrink the ring's total range so there's less room to be uneven"
- **Explain:** hashing one machine to many points spreads its share across many small arcs instead of one big, unpredictable one — by the law of large numbers, many small random shares average out far more evenly than one big one.
- **Narrator's line of thought:** "same hash function, same ring — just asking it more questions per machine."

### 7 — VirtualNodesReveal
- **fig:** `VirtualNodesReveal`
- **Visual idea:** the same machines, now each hashed to many points, the bar chart beneath visibly more even; a real, cited virtual-node count labeled beside it.
- **Caption:** a real production system's own count: two hundred fifty six points per node, under its older random-allocation scheme — a concrete number, not an invented one.
- **Takeaway:** "Hashing each machine to many points on the ring spreads its share evenly — verified against a real system's own documented count."
- **Narrator's line of thought:** "I went and found the actual number a real system uses for this, instead of saying 'several.'"

### 8 — BoundedLoads
- **fig:** `BoundedLoads`
- **Visual idea:** a ring under an adversarial key distribution, one machine's load capped and the excess redirected to its clockwise neighbor instead of piling up.
- **Caption:** a real extension caps how overloaded any one machine can get, even under an adversarial key distribution — by redirecting the excess to the next machine on the ring.
- **Takeaway:** "Consistent hashing with bounded loads caps the worst machine's load at a guaranteed factor over the average, even adversarially."
- **Narrator's line of thought:** "plain consistent hashing balances well on average. This is the paper that proves a worst-case guarantee too."

### 9 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** two measured bars side by side — the fraction of keys that moved on a ring join, versus topic 20's full-table resize; a second pair showing virtual nodes' evenness improvement.
- **Caption:** measured, not assumed: a ring join moves a small fraction of the keys a single-machine resize would have moved; virtual nodes measurably even out one machine's unpredictable share.
- **Narrator's line of thought:** recap — "the ring's whole promise, proven with real numbers, not just drawn."

## Post-notes headings (Deep dive)

- `outcomes` — the four learning outcomes above.
- `internals` — the honest distinction between Karger's original "closest point on the unit interval" framing and the now-standard "ring, walk clockwise" visual metaphor; the law-of-large-numbers reasoning for why many small virtual-node shares average out evenly.
- `lab` — the syllabus's own Lab bullet's "key movement when growing 10 → 11 nodes" measurement, kept for this ring scheme specifically.
- `production` — Cassandra's own real vnode history (256 under random allocation, fewer under the newer deterministic allocator), cited from its own current docs.
- `frontier` — rendezvous, jump, and Maglev hashing, named with no mechanism, skipped in the syllabus; the cross-domain handoff to *Data Engineering* §5.3.
- `questions` — "Why does a ring join only ever affect one clockwise neighbor, never two?"; "What would happen to the bounded-loads guarantee if every client requested the same one key?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A real consistent-hashing ring built from scratch: machines and keys both hashed onto the same numeric range, a key owned by its first clockwise machine.
2. A measurement of how many keys move when a machine joins a ten-machine ring (growing it to eleven, per the syllabus's own Lab bullet), contrasted against topic 20's full-table resize fraction.
3. A measurement of per-machine key-count imbalance with one point per machine versus many virtual points per machine, on the same ring and key set.
4. Every number shown on screen (steps 4, 7, 9) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "A single machine's table can always grow to fit more keys. Consistent hashing asks the same question one level up: when a machine itself joins or leaves, how many keys have to move?"
- **Handoff** (word for word, matching `CHAPTER.md`): "Consistent hashing answers where a piece of data lives, and how little moves when the set of machines changes. It says nothing about whether two copies of that data actually agree. Next: proving they do, without comparing either one whole."

## Concept ledger

- **Introduces:** `consistent-hashing`, `ring-placement`, `virtual-node`, `minimal-remapping`, `bounded-load-hashing`.
- **Uses:** `hash-function`, `hash-table-resize` (as the single-machine question this answers one level up).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. Ring placement: both keys and machines are hashed onto the same continuous range; a key belongs to the first machine found walking clockwise from it. → `SOURCES.md` § Karger et al., § Cassandra docs.
2. Minimal remapping: when a machine joins or leaves, only the keys between its ring position and its clockwise neighbor move. → `examples.py` (measured directly); the mechanism itself follows from claim 1.
3. One point per machine gives an unpredictable, often lopsided share of the ring — Karger's own paper's reason for needing "more than one point" per bucket. → `SOURCES.md` § Karger et al.
4. Virtual nodes (hashing one machine to many ring points) fix the imbalance; a real production system (Cassandra) documents a concrete count (256 under its older random-allocation scheme). → `SOURCES.md` § Cassandra docs.
5. Consistent hashing with bounded loads (Mirrokni, Thorup, Zadimoghaddam, SODA 2018) guarantees a maximum load factor c = 1+ε over the fair share, while still moving only an expected constant number of clients per join/leave. → `SOURCES.md` § Mirrokni, Thorup, Zadimoghaddam.
6. Every number put on screen (steps 4, 7, 9) is measured directly in `examples.py`.

## Changes from the chapter plan

Followed directly: the chapter plan's own two-picture visual idea (a near-empty moved arc on join; virtual nodes' bar chart evening out) is this topic's own steps 4 and 7. One honest framing choice recorded: Karger's own 1997 paper describes buckets and items mapped to "the unit interval" with nearest-point assignment, not literally a "ring" with "clockwise" walking — this topic's ring-and-clockwise visual metaphor is the now-standard pedagogical picture (confirmed as Cassandra's own production terminology, not invented for this topic), and `post-notes.md`'s internals section names the distinction rather than attributing "clockwise" to Karger's own words.
