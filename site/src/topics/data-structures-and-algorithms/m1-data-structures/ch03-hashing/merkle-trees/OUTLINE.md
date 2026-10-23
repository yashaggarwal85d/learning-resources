# Outline — Merkle trees

## Learning outcomes

1. Build a Merkle tree over a batch of data and explain why comparing root hashes answers "do these agree" in O(1).
2. Find which leaf(ves) differ between two trees in O(log n) by walking down from a root mismatch.
3. Name at least two real production uses (anti-entropy repair, Git, certificate transparency) and what each one proves without transferring the whole dataset.
4. Explain why content-defined chunking (prolly trees) avoids invalidating every later chunk's hash on a small edit, where fixed-offset chunking would not.

## Engagement arc

- **Hook (step 1):** topic 21 answered where a piece of data lives and how little moves when machines change; this topic asks a different question entirely — do two copies of that data even agree?
- **Predict (step 3):** "two trees' root hashes match. What does that actually tell you?"
- **Predict (step 5):** "one leaf out of many changed. How many hashes do you have to check to find which one?"
- **Surprising number:** a real production system's own repair mechanism (Cassandra) comparing whole key ranges with one hash each, instead of exchanging every key.
- **Takeaways:** steps 4, 6, 8 (three).
- **Recap (step 9, "Prove it"):** measured, side by side — comparing every leaf vs. comparing along one root-to-leaf path, and content-defined vs. fixed-offset chunking's blast radius on one edit.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** topic 21's ring (locating data) giving way to two copies of the same data sitting side by side, with a question mark between them.
- **Caption:** consistent hashing answered where a piece of data lives. It said nothing about whether two copies of it actually agree. This topic proves they do, without comparing either one whole.
- **Narrator's line of thought:** "last topic was about location. This one is about trust — do these two copies actually match?"

### 2 — TreeBuilt
- **fig:** `TreeBuilt`
- **Visual idea:** a handful of the log's own segment files as leaves, each leaf's hash rising into its parent's hash, up to one root hash at the top.
- **Caption:** hash each piece of data, then hash the hashes, two at a time, all the way up. One number at the top speaks for everything underneath it.
- **Narrator's line of thought:** "this is the same hashing idea from this whole chapter — just applied to combine many hashes into one."

### 3 — RootMatchPredict (predict)
- **fig:** `RootMatchPredict`
- **Visual idea:** two complete trees side by side, both root hashes glowing the same colour, asking what that match actually proves.
- **Predict options:**
  1. "Probably agree — but you'd still want to spot-check a few leaves"
  2. **"Every single leaf underneath is identical, guaranteed"** (correct)
  3. "Only the top level of the tree agrees"
  4. "Nothing — root hashes can match by coincidence too often to trust"
- **Explain:** a root hash is built from every leaf beneath it; if any leaf anywhere had differed, that difference would have propagated all the way up and changed the root. A matching root is as strong a guarantee as comparing every leaf, for the cost of comparing one number.
- **Narrator's line of thought:** "one number, one comparison, and it speaks for an entire dataset."

### 4 — RootMismatch
- **fig:** `RootMismatch`
- **Visual idea:** two trees whose root hashes now visibly differ, the mismatch highlighted at the top.
- **Caption:** a mismatched root tells you the two copies disagree somewhere — but not yet where. Finding the exact leaf is the next problem.
- **Takeaway:** "A matching root hash guarantees every leaf beneath it matches too — one comparison, not n."
- **Narrator's line of thought:** "now the real question: given that they disagree, how do you find where, without checking everything?"

### 5 — WalkDownPredict (predict)
- **fig:** `WalkDownPredict`
- **Visual idea:** the mismatched tree from the previous step, one path highlighted from the root downward, asking how many hashes actually need checking.
- **Predict options:**
  1. "Every leaf — there's no way around checking them all"
  2. "Half the leaves, on average"
  3. **"Only the one path from the root down to the differing leaf — about log n hashes"** (correct)
  4. "Just the one leaf itself, nothing else"
- **Explain:** at each level, only one of the two children's hashes can disagree with what you expect — so you only ever follow one branch down. A tree of n leaves has about log2 n levels, so finding the mismatch costs about log2 n comparisons, not n.
- **Narrator's line of thought:** "exactly the same binary-tree halving every divide-and-conquer idea in this curriculum relies on."

### 6 — ProofPath
- **fig:** `ProofPath`
- **Visual idea:** the one root-to-leaf path re-lit as the walk proceeds level by level, every sibling path left untouched.
- **Caption:** at each level, only one child's hash can be wrong. Follow that one branch down, and you reach the exact leaf that differs in about log n steps.
- **Takeaway:** "Walking from a root mismatch down to the one differing leaf costs about log n comparisons, not n."
- **Narrator's line of thought:** "this is the whole payoff — verify a dataset's worth of data, or find exactly what changed in it, without ever reading it all."

### 7 — ProductionUses
- **fig:** `ProductionUses`
- **Visual idea:** three small, labelled hash-tree icons side by side — a database's repair process, Git's commit history, a certificate log — each with one line naming what it proves.
- **Caption:** this isn't a theoretical structure. A real database's repair process, a version-control system's entire history, and a public certificate log all run on exactly this idea.
- **Narrator's line of thought:** "three completely different systems, solving three completely different problems, with the same tree."

### 8 — ContentDefinedChunking
- **fig:** `ContentDefinedChunking`
- **Visual idea:** the same data stream split two ways — fixed-offset chunks, where one early edit shifts every later chunk boundary, all the way along; content-defined chunks, where the same edit reshapes only the one boundary near it.
- **Caption:** split that data into fixed-size pieces, and one early edit shifts every boundary after it — and every chunk's hash with it. Split it where the data's own content says to instead, and only the one nearby chunk changes.
- **Takeaway:** "Content-defined chunking lets one small edit reshape only the chunks near it — fixed-offset chunking reshapes every chunk after it."
- **Narrator's line of thought:** "the tree's whole promise — cheap verification — falls apart if a one-byte edit invalidates every hash above it anyway. This is the fix."

### 9 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** two measured bar pairs — hashes checked finding one changed leaf (full scan vs. root-to-leaf walk), and chunks reshaped by one edit (fixed-offset vs. content-defined).
- **Caption:** measured, not assumed: finding one changed leaf costs about log n comparisons, not n; and one small edit reshapes far fewer chunks under content-defined chunking than under fixed-offset chunking.
- **Narrator's line of thought:** recap — "the whole chapter's last idea, proven with real numbers: trust a dataset, or find exactly what changed in it, without reading it all."

## Post-notes headings (Deep dive)

- `outcomes` — the four learning outcomes above.
- `internals` — why a root hash is as strong as comparing every leaf (the propagation argument); why only one child's hash can disagree at each level during a walk-down.
- `lab` — this topic's own `examples.py` measurement: hashes checked to find one changed leaf, and chunks reshaped by one edit, under each chunking scheme.
- `production` — Cassandra's own anti-entropy repair, Git's own object model, and RFC 6962's certificate-transparency logs, each cited from its own current source.
- `frontier` — Merkle proofs' use in blockchains and other append-only ledgers, named with no mechanism, since the syllabus doesn't name it for this topic.
- `questions` — "Why must a Merkle tree combine exactly two children per node, rather than, say, four?"; "What happens to the walk-down guarantee if two completely different leaves happen to hash to the same value?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A real Merkle tree built from scratch over a batch of leaves, with a root hash and a working root-to-leaf walk-down that finds the one differing leaf.
2. A measurement of how many hashes a full leaf-by-leaf comparison checks vs. how many a root-to-leaf walk-down checks, for the same single-leaf change, confirming the walk-down is O(log n).
3. A measurement of content-defined chunking vs. fixed-offset chunking: how many chunks change their hash after one small edit near the start of a data stream, on the same data.
4. Every number shown on screen (step 9) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "Consistent hashing answers where a piece of data lives, and how little moves when the set of machines changes. It says nothing about whether two copies of that data actually agree. Merkle trees prove they do, without comparing either one whole."
- **Handoff** (word for word, matching `CHAPTER.md`): "Every structure in this chapter answered 'where is the key' or 'do these two copies agree' by turning data into a number. The next chapter asks a question hashing can't answer at all: keep the keys in order, so you can ask for the smallest, the largest, or everything between two bounds. Binary search trees, next, and the rotations that keep one balanced."

## Concept ledger

- **Introduces:** `merkle-tree`, `root-hash`, `merkle-proof`, `anti-entropy-repair`, `content-defined-chunking`.
- **Uses:** `hash-function`, `cryptographic-hash` (topic 16).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. A Merkle tree's root hash is built by recursively hashing pairs of child hashes up to one top value — Merkle's own original "tree authentication" mechanism. → `SOURCES.md` § Merkle.
2. A matching root hash guarantees every leaf beneath it matches; finding which leaf differs on a mismatch costs about log n comparisons by walking the one disagreeing path down from the root. → `SOURCES.md` § Merkle (the proof-path property); `examples.py` (measured directly).
3. Anti-entropy repair (Cassandra) compares two replicas' Merkle trees over a shared key range to find exactly the out-of-sync sections, without exchanging every key. → `SOURCES.md` § Cassandra.
4. Git's own object store is a real hash tree: a tree object's entries are each a hash of a blob or subtree, and a commit stores one tree hash plus its parents' hashes. → `SOURCES.md` § Git.
5. Certificate Transparency (RFC 6962) uses a public, append-only Merkle tree of certificates so that a log's history can't be shown differently to different people without being caught by comparing roots and consistency proofs. → `SOURCES.md` § RFC 6962.
6. Content-defined chunking (prolly trees, e.g. Dolt) sets chunk boundaries by a rolling hash crossing a threshold, so a small edit reshapes only the nearby chunk boundary and the path to the root, unlike fixed-offset chunking, which reshapes every later chunk. → `SOURCES.md` § Dolt; `examples.py` (measured directly).
7. Every number put on screen (step 9) is measured directly in `examples.py`.

## Changes from the chapter plan

Followed directly: the chapter plan's own visual idea (leaves rising to one root; one edited segment's leaf hash changing, with exactly its root-path re-lit while siblings stay untouched) is this topic's own steps 2, 4, and 6. One honest note: Merkle's own 1979 paper's PDF text extraction is heavily garbled in its two-column, decades-old typeset body (word order and hyphenation break across lines in the extracted text, the same class of issue `FACT-CHECK.md` records for topic 18's Knuth paper and topic 21's Karger paper) — `SOURCES.md` quotes only the lines that survive that garbling intact, and no claim here depends on a line that doesn't.
