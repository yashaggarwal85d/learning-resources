# Fact-check — de.processing-serving-choices

## Claims re-derived against the source

1. **DuckDB's in-process, embedded design is deliberately adopted from SQLite's own success, not
   accidental.** SOURCES.md's first DuckDB quote supports this directly ("Simplicity in
   installation, and embedded in-process operation are central to its success. DuckDB adopted the
   ideas of simplicity and in-process operation"). Checked the reel doesn't overclaim DuckDB as
   identical to SQLite — the quote itself notes DuckDB "later stepped out of the realm of
   in-process operations," which the reel doesn't contradict since it only cites the design
   lineage, not current scope.

2. **DuckDB has zero external dependencies for build or runtime.** SOURCES.md's second quote
   supports this exactly. Used as the concrete form of "no server to operate" in the team-skill
   reveal — checked this is presented as DuckDB's own stated property, not generalized to every
   single-node engine (Polars isn't claimed to share this exact property).

3. **Kleppmann's framing: a database as mutable global state, with derived views from streams as
   the alternative.** SOURCES.md's first Kleppmann quote supports the "mutable global state"
   framing directly. The reel's own "one system of record, several derived stores" claim (step 6)
   is this chapter's own established vocabulary from topic 4, not attributed to Kleppmann as if he
   coined "system of record" — checked the reel credits Kleppmann only for the derived-views
   argument, which the quote actually makes.

4. **Kleppmann's own named trade-off: simpler code, lower latency, at a cost.** SOURCES.md's
   second Kleppmann quote lists the gains ("simpler code, better scalability, better robustness,
   lower latency, and more flexibility") without naming a cost explicitly in this short abstract.
   Checked the reel doesn't attribute the staleness/fixed-shape cost of pre-aggregation to
   Kleppmann directly — that cost is this topic's own addition (and matches `CHAPTER.md`'s own
   scope line), stated as the topic's own reasoning, not as something the quote itself says.

5. **The amplification-ledger reasoning.** Not an independent citation — this is `CHAPTER.md`'s
   own described extension of topic 2's estimate chain, using the read/write/space-amplification
   framing from Chapter 5's live LSM-compaction topic (`lsm-compaction-rum`, confirmed live and
   moved into `uses`). No source risk: presented as reasoning built on a `uses` concept, not as a
   cited authority's finding requiring its own fetch.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the real-time OLAP store always wins") is a genuine,
  common first instinct (reach for the newest, most purpose-built tool) rather than a strawman.
  The correct option names a specific, checkable failure mode (the pre-aggregated table breaks on
  a new breakdown) rather than a vague "it depends."
- **Predict 2 (step 11, "Prove it"):** checked the claim that a pre-aggregated table "usually
  needs a new grouping key" when a breakdown changes is presented as the common case, not an
  absolute — the explain text says "usually," matching the real variability (some schema changes
  really are additive) without overclaiming every breakdown change forces a rebuild.

## Illustrative numbers (step 8-9 fig)

The amplification ledger's stacked bars (logical bytes, then replication, then pre-aggregate
rewrite, then compaction, summing to physical bytes) are illustrative orderings showing the
*shape* of the multiplier, not a cited real-world ratio from any vendor. `examples.py`'s own
`amplification_ledger()` computes the actual modeled multipliers for the three serving options
from the shop's own constants (from topic 2's capacity chain), so the on-screen comparison is
backed by a real computation.

## Outcome

No open findings. Every claim about DuckDB or Kleppmann's own framing traces to one of
SOURCES.md's four verbatim quotes; the amplification-ledger and predict reasoning rest on this
chapter's own established method and a live `uses` concept, not an unsourced factual claim.
