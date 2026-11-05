# Fact-check — dsa.random-shuffling

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | The Fisher–Yates shuffle produces an unbiased permutation: every permutation equally likely | Confirmed | SOURCES.md §1 |
| 2 | Named after Ronald Fisher and Frank Yates, also known as the Knuth shuffle after Donald Knuth | Confirmed | SOURCES.md §1 |
| 3 | A variant, Sattolo's algorithm, generates random cyclic permutations of length n | Confirmed | SOURCES.md §1 |
| 4 | The modern (in-place) version was introduced by Richard Durstenfeld in 1964 | Confirmed | SOURCES.md §1, §8 (Crossref DOI 10.1145/364520.364540, July 1964) |
| 5 | Sattolo's algorithm published 1986; the only difference from Durstenfeld's: j is drawn from 1…i−1, not 1…i, which forces a single cycle | Confirmed | SOURCES.md §1, §8 (Crossref DOI 10.1016/0020-0190(86)90073-6, May 1986) |
| 6 | Accidentally implementing Sattolo's algorithm where Fisher–Yates was meant biases the result toward the (n−1)! cycles instead of all n! permutations | Confirmed | SOURCES.md §1 |
| 7 | The naive "swap each element with a randomly chosen element" method is biased | Confirmed | SOURCES.md §1 |
| 8 | Sorting with a random-valued comparator is "very likely to produce highly non-uniform distributions, which in addition depend heavily on the sorting algorithm used" | Confirmed | SOURCES.md §1 |
| 9 | Modulo bias: dividing by a range that does not evenly divide the generator's range skews toward small remainders; the example given (0–99 source, mod 16) shows numbers 0–3 about 17% over-represented | Confirmed | SOURCES.md §1 |
| 10 | Bostock's in-place shuffle derivation: shuffled count (n − m) plus remaining count (m) always equals n, so the shuffle can run with no extra space | Confirmed | SOURCES.md §2 |
| 11 | Microsoft's BrowserChoice.eu ballot used a `GenerateBrowserOrder` function tested by Rob Weir over 10,000 iterations | Confirmed | SOURCES.md §3 |
| 12 | In Weir's measured raw-count table, Internet Explorer occupied position 5 (last) in 5,034 of 10,000 runs | Confirmed, read directly from the published table | SOURCES.md §3 |
| 13 | Python's documentation states a sequence of length 2,080 is the largest whose permutations fit within the Mersenne Twister's period (2^19937 − 1) | Confirmed | SOURCES.md §4 |
| 14 | TensorFlow's `tf.data.Dataset.shuffle` fills a buffer, samples from it, and replaces the sampled element; "for perfect shuffling, a buffer size greater than or equal to the full size of the dataset is required" | Confirmed | SOURCES.md §5 |
| 15 | Hugging Face `datasets`' `IterableDataset.shuffle()` samples from only the first `buffer_size` examples of a larger stream and replaces them as it goes | Confirmed | SOURCES.md §6 |
| 16 | MergeShuffle (Bacher, Bodini, Hollender, Lumbroso) is an efficient, parallelizable random-permutation algorithm, abstract only | Confirmed | SOURCES.md §7 |
| 17 | Sanders 1998 citation (distributed/external/hierarchical-memory random permutations) | Confirmed via Crossref metadata | SOURCES.md §8 |
| 18 | `dsa.measuring-memory-hierarchy`'s own account of Sattolo's algorithm (strictly-below-index swap partner, single full-length cycle) | Confirmed, read directly from that topic's files | SOURCES.md §10 |
| 19 | The expected number of fixed points of a uniform random permutation is exactly 1 for every n | Confirmed, reused from topic 95 | SOURCES.md §9; `dsa.expectation-indicator-variables` |
| 20 | Every numeric claim on screen (chi-squared values, nⁿ mod n! table, Sattolo cycle counts, the 2,080/2,081 factorial crossing, log₂(52!), the buffered-shuffle emission matrix) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Is "about half the time" for Internet Explorer's last-place finish an honest reading of
  Weir's data, or a rounded-up headline figure?** Checked against the raw table itself, not a
  summary sentence: position 5, column "I.E." reads 5,034 out of 10,000, i.e. 50.34% — "about
  half" is accurate to the number actually printed in the source, not a loose paraphrase.

- **Does the chi-squared comparison in `examples.py` actually distinguish the two algorithms, or
  could it be a fluke of the seed?** The naive shuffle's statistic (≈700) is roughly 200 times
  the 5%-critical value (11.07 at five degrees of freedom) and roughly 200 times Fisher–Yates'
  own statistic (≈3, itself comfortably below critical) — a gap this large across 60,000 runs is
  not seed-sensitive; re-running with a different seed moves each figure by single digits, not
  by orders of magnitude. The exact (non-simulated) 27-choice enumeration backs the same
  conclusion independently of any seed: counts (4, 4, 4, 5, 5, 5), never (4.5, 4.5, …, 4.5).

- **Is the buffered-shuffle "emitted earlier by at most about b − 1" claim a loose
  approximation or an exact structural fact?** `examples.py` enumerates every random choice
  exactly (fractions, not simulation) and asserts, for every input position p and every output
  position q earlier than max(0, p − (b − 1)), that the probability is exactly zero — this is a
  hard combinatorial limit (the buffer can hold at most b items, so at most b − 1 older arrivals
  can be displaced ahead of a new one before the next emission), not a tendency that happens to
  hold in this example.

- **Does the "first item lands near the front" claim generalize beyond the n = 6 toy case, or is
  it an artifact of the short stream?** `examples.py` reports the exact computed fractions for
  n = 6 only, as the chapter plan specifies (a worked example, not a general theorem); the topic
  states the structural *shape* (geometric decay with distance from the buffer's current front)
  as what the enumeration shows for this case, and does not claim the specific percentages hold
  at other stream lengths.

- **Predict-distractor plausibility.** Step 2's distractors (uniform; depends on the seed) each
  reflect a learner not yet having seen that 27 does not divide by 6. Step 7's distractors ("all
  of them, given enough time"; "it depends only on the shuffle algorithm, not the generator")
  each misplace where the limit actually comes from (the generator's state space, not time or
  algorithm choice). Step 12's distractors ("there is no way"; "always use a small fixed-size
  buffer"; "skip shuffling") each overstate or understate what the three real options actually
  trade off.
