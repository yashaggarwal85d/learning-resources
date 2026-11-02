# Fact-check — de.partitioning-schemes-range-hash

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources-tmp/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | CockroachDB stores data as a monolithic sorted map divided into contiguous "ranges," so every key can always be found in a single range. | Confirmed | CockroachDB Distribution Layer docs, quoted verbatim. |
| 2 | Defining the order of data makes it easy to find data within a particular range during a scan. | Confirmed | CockroachDB docs, quoted verbatim. |
| 3 | Each table's range splits into two once it reaches a size threshold, as the table grows. | Confirmed | CockroachDB docs, quoted verbatim. |
| 4 | Cassandra partitions data via consistent hashing; naive modulo hashing can invalidate almost all key-to-node mappings when a single node is added. | Confirmed | Cassandra Dynamo architecture docs, quoted verbatim. |
| 5 | Cassandra maps every node to one or more tokens on a continuous hash ring; consistent hashing only has to move a small fraction of keys when the node count changes. | Confirmed | Cassandra docs, quoted verbatim. |
| 6 | Consistent hashing assigns items to buckets so each bin gets roughly the same number; unlike standard hashing, a small change in the bucket set doesn't induce a total remapping. | Confirmed | Karger et al., STOC 1997, quoted verbatim. |
| 7 | Rendezvous (HRW) hashing is simpler than consistent hashing, distributes objects uniformly, and needs no precomputed or stored tokens. | Confirmed | Wikipedia "Rendezvous hashing", quoted verbatim (footnote markers excluded from the quoted span). |
| 8 | The HRW assignment can be computed independently by any client, since it depends only on the identifiers for the set of sites. | Confirmed | Wikipedia "Rendezvous hashing", quoted verbatim (footnote marker excluded). |
| 9 | Range partitioning concentrates the most recent writes of an ordered workload onto a single partition (the tail); hash partitioning spreads the identical recent writes across most or all partitions. | Confirmed, executed | `examples.py`: `range_partitioning_concentrates_an_ordered_write_workload` and `hash_partitioning_spreads_the_identical_workload`, both asserted and run. |
| 10 | Hash partitioning cannot support an efficient ordered range scan — a 100-key ordered scan touches most of the hash partitions, not a contiguous few. | Confirmed, executed | `examples.py`: `hash_partitioning_cannot_do_an_efficient_range_scan`, asserted and run. |
| 11 | Naive modulo hashing remaps the large majority of keys (measured ~90.9%) when one node joins a 10-node cluster. | Confirmed, executed | `examples.py`: `naive_modulo_hashing_remaps_almost_everything_on_resize`, asserted `> 0.85`, measured 90.9%. |
| 12 | Consistent hashing (measured ~8.3%) and rendezvous hashing (measured ~9.1%) each move only a small fraction of keys on the identical membership change. | Confirmed, executed | `examples.py`: `consistent_hashing_moves_only_a_small_fraction_on_resize` and `rendezvous_hashing_also_moves_only_a_small_fraction_on_resize`, both asserted `< 0.20` and run. |

## Currency check

- The CockroachDB Distribution Layer docs are the current, maintained architecture documentation
  for a database that is still actively developed; no currency risk — range splitting on a size
  threshold is current, documented behavior, not a deprecated design.
- The Cassandra Dynamo architecture docs are the current, maintained documentation for Cassandra's
  own consistent-hashing token ring; no currency risk.
- Karger et al. (1997) is the original consistent-hashing paper; its own definition of minimal
  remapping is foundational and has not been superseded — every later consistent-hashing scheme
  (including Cassandra's) still cites this same property.
- The Wikipedia rendezvous-hashing article restates Thaler & Ravishankar's 1996/1998 papers; the
  algorithm itself (HRW: highest random weight, computed independently per client) is unchanged
  since its original publication; no currency risk for the two claims actually quoted.

## Red team

1. **"Is the 'hot tail' claim (claim 9) actually about where new writes land right now, or does it
   smuggle in a claim about lifetime historical distribution instead?"** It's specifically about
   the recent-write window: `range_partitioning_concentrates_an_ordered_write_workload` measures
   only the most recent 500 of 10,000 writes and asserts they land on exactly one partition — an
   earlier draft of this function mistakenly measured the lifetime distribution across all 10,000
   keys (which is naturally ~10% per partition, an even split, not a hot tail at all) before being
   corrected to the recent-window measurement that actually demonstrates the operational problem.
2. **"Is substituting Wikipedia for the original Thaler & Ravishankar paper (hosted at an
   unreachable `cs.rutgers.edu` mirror) a weaker source than the earlier `.edu` substitutions in
   this chapter's prior two topics?"** No — the two quotes used (claims 7 and 8) are Wikipedia's
   own restatement of the algorithm's defining properties, both of which trace directly to the
   cited original papers in the article's own references; the claims made here are about the
   algorithm's definition, not about priority or authorship, so a well-sourced tertiary restatement
   carries the same evidentiary weight as the primary text would for this specific use.
3. **"Does the naive-modulo-hashing claim (claim 11) depend on the specific key set chosen, or does
   it generalize?"** It generalizes by construction: modulo hashing's formula (`hash(key) % N`)
   has the node count `N` baked into every key's placement, so changing `N` changes the divisor for
   every key simultaneously regardless of which specific keys are used — the measured 90.9% is a
   property of the formula, not an artifact of this run's particular 10,000 keys (confirmed by the
   function using a stable, uniform hash rather than a key set engineered to fail).
4. **"Is the comparison between consistent hashing (8.3%) and rendezvous hashing (9.1%) fair, given
   they use different internal mechanisms (a precomputed ring with virtual nodes vs. independent
   per-key computation)?"** Yes — both are measured on the identical starting node set, the
   identical 10,000 keys, and the identical membership change (one node added), so the comparison
   isolates the property both algorithms claim (bounded remapping) rather than any difference in
   setup; the two numbers landing close together (8.3% vs. 9.1%) is itself consistent with both
   algorithms solving the same problem by different means, as claim 6's own definition predicts.
5. **"Does the 'Prove it' answer (more nodes don't fix a range-partitioned hot tail under flash-sale
   load) actually follow from what's measured, or is it an unjustified extrapolation?"** It follows
   directly from claim 9's own mechanism: the hot tail exists because the newest key is always the
   largest key under range partitioning, a structural fact independent of how many partitions exist
   — adding partitions changes how the key space is divided, not which partition currently owns the
   highest key, so the measured result (one partition takes 100% of the recent-write window
   regardless of total partition count) generalizes to any number of range partitions.

## Problem Solving

- The rendezvous-hashing paper (Thaler & Ravishankar, hosted at a `cs.rutgers.edu` course-notes
  mirror) served a broken TLS chain in this sandbox, the same domain-wide `.edu` limitation already
  documented for Terry et al. and Abadi's formal paper in this chapter's prior two topics. **Fixed**
  by substituting Wikipedia's own "Rendezvous hashing" article, which restates the algorithm's
  defining properties precisely and traces directly back to the original paper.
- Two initial quote attempts in `SOURCES.md` failed exact-match verification because the scraped
  source text had footnote markers (`[1][2]`) merged directly into the surrounding words with no
  space (e.g. "hashing[1][2] is", "1996.[1] Consistent"), an artifact of the fetcher stripping HTML
  formatting. **Fixed** by selecting different, complete sentences that happened to fall between
  footnote markers rather than trying to quote around them.
- `range_partitioning_concentrates_an_ordered_write_workload`'s first implementation asserted
  `last_partition_share > 0.9` while measuring the lifetime distribution of all 10,000 keys across
  all 10 partitions — which is naturally an even ~10% split, not a hot tail, and failed the
  assertion. **Root cause:** misunderstood "hot tail" as a lifetime-total property rather than a
  recent-write-window property. **Fixed** by redesigning the function (and the matching hash-
  partitioning function, for an apples-to-apples contrast) to measure only the most recent 500-write
  window, which correctly shows the operational concentration this topic is actually about.
- `prerequisites.mdx`'s `<Resource title="Consistent hashing and rings">` caused a hard build-time
  crash on the `/reels` index page ("not a topic in syllabus/data-structures-and-algorithms.md"),
  because the actual registry title for `dsa.consistent-hashing-rings` is "Consistent hashing
  rings" (no "and"). **Fixed** by correcting the title string to match `registry.ts` exactly.
