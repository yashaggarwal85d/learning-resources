# Outline — de.bloom-cuckoo-xor-filters

## Outcomes (from CHAPTER.md)

Explain approximate membership with no false negatives as a Bloom filter's own core guarantee;
size a real Bloom filter from a target false-positive rate (bits per key, hash count) and measure
its real false-positive rate against a real data set; explain what a cuckoo filter adds (real
deletes) and what xor/binary-fuse/ribbon filters trade (build cost for space); name the real
systems (LSM reads, already built in topic 8; Parquet column filters, Chapter 6's own subject;
join pruning; runtime filters) that use this family of structure.

## 9-step storyboard (full, ~15 min)

1. **Hook.** A tiny bit array, far smaller than the set it describes, answers one question about
   a value it has never stored: could this be in the set at all.
2. **Predict: can that tiny array ever wrongly say a value is absent when it was actually added.**
   (Correct: no — a Bloom filter never produces a false negative; its only error is the opposite
   one, wrongly saying present when a value was never added.)
3. **Reveal: the guarantee comes from how insertion and lookup use the same hash positions.** No
   takeaway (reel test's reference "from" step).
4. **Reveal: sizing is a trade a target false-positive rate dictates.** Fewer bits per key means
   more false positives; the real sizing formula ties bits per key and hash count directly to a
   chosen target rate. Takeaway.
5. **Reveal: a real Bloom filter's measured rate, checked against its own predicted rate.** This
   topic's own real measurement: build one at a target rate, query it against real held-out keys,
   and compare the measured rate to the formula's prediction. Takeaway.
6. **Reveal: a standard Bloom filter can never delete a single item.** Removing one entry would
   require rebuilding the whole filter from scratch; a cuckoo filter adds real deletes by storing
   a fingerprint it can remove directly. Takeaway.
7. **Reveal: xor and ribbon filters trade build cost for an even smaller footprint.** Both need the
   whole set known up front and cannot be modified afterward, in exchange for less memory per key
   than a Bloom or cuckoo filter at the same false-positive rate; RocksDB's own ribbon filter ships
   this exact trade, named directly from its own documentation. Takeaway.
8. **Recap.**
9. **Prove it.** A system already has topic 8's own per-file Bloom filter skipping files that
   can't hold a key before every disk read. A teammate asks whether switching that filter to a
   cuckoo filter would help. What does a cuckoo filter actually add here, and does this system
   need it?
   (Correct: a cuckoo filter adds real deletes; this system never deletes an on-disk file's filter
   without deleting the whole file, so there's nothing here for a cuckoo filter's extra capability
   to buy — the standard Bloom filter already fits.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the no-false-negative guarantee and why; the bits-per-key/hash-count sizing
formula); Production (the real measured-vs-predicted false-positive rate; cuckoo filters' real
deletes; xor/ribbon filters' build-cost-for-space trade; the real systems that use this family —
LSM reads, Parquet column filters, join pruning, runtime filters); Frontier (Count-Min Sketch,
named sourced-only as a related structure for frequency rather than membership); Where this goes
next (counting distinct values without storing any of them).

## Bridge / handoff

Bridge (answers topic 29's handoff verbatim): "Every mechanism in this chapter answered a question
with an exact result. This topic closes the chapter's last section by opening the opposite idea: a
structure that trades a small, bounded error for a massive reduction in memory — the Bloom filter
family, and the real system (topic 8's own LSM reads) that already used one without this topic
naming it yet."

Handoff: "Membership ('is it in there') is one question a tiny structure can answer approximately.
The next topic is a completely different question answered the same way: how many distinct values
are there, without storing any of them."

## Concept ledger

Introduces: `probabilistic-membership-filters`. Uses: `lsm-write-read-path` (topic 8's own per-file
Bloom filters are a real, already-seen instance of this family). Declared: a hash function's own
basic behavior, from Chapter 1.

## Claims list (for FACT-CHECK.md)

1. Wikipedia's own article on the Bloom filter (substituting for the unfetchable original 1970
   paper): a Bloom filter is a space-efficient probabilistic structure for approximate set
   membership; false positives are possible, false negatives are not.
2. Wikipedia's own article: fewer than 10 bits per element are required for a 1% false-positive
   probability, independent of set size — the real sizing relationship this topic's own example
   measures an instance of.
3. The cuckoo filter paper (Fan, Andersen, Kaminsky, Mitzenmacher): standard Bloom filters cannot
   delete a single item without rebuilding the whole filter; a cuckoo filter deletes by removing a
   stored fingerprint directly.
4. The xor filter paper (Graf & Lemire): an xor filter is immutable once built and needs the whole
   set known up front, in exchange for being faster and smaller than a Bloom or cuckoo filter at
   the same false-positive rate.
5. RocksDB's own wiki documentation: a Ribbon filter saves about 30% of Bloom filter space at the
   cost of about 3-4x the construction CPU and substantially higher temporary memory during build
   — the real, shipped instance of the build-cost-for-space trade this topic names.
