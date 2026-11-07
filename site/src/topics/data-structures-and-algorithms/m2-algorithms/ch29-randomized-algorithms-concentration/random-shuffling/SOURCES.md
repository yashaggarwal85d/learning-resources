# Sources — dsa.random-shuffling

Fetched at research time (2026-11-05) into `sources/`. Checked with
`node scripts/sources.mjs check random-shuffling`.

## 1. Wikipedia, "Fisher–Yates shuffle"

URL: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
Local copy: `sources/wiki-fisher-yates.txt`

> The Fisher–Yates shuffle is an algorithm for shuffling a finite sequence. The algorithm takes
> a list of all the elements of the sequence, and continually determines the next element in
> the shuffled sequence by randomly drawing an element from the list until no elements remain.

> The algorithm produces an unbiased permutation: every permutation is equally likely.

> The Fisher–Yates shuffle is named after Ronald Fisher and Frank Yates, who first described
> it. It is also known as the Knuth shuffle after Donald Knuth.

> A variant of the Fisher–Yates shuffle, known as Sattolo's algorithm, may be used to generate
> random cyclic permutations of length n instead of random permutations.

> The modern version of the Fisher–Yates shuffle, designed for computer use, was introduced by
> Richard Durstenfeld in 1964

> A very similar algorithm was published in 1986 by Sandra Sattolo for generating uniformly
> distributed cycles of (maximal) length n.

> The only difference between Durstenfeld's and Sattolo's algorithms is that in the latter, in
> step 2 above, the random number j is chosen from the range between 1 and i − 1 (rather than
> between 1 and i) inclusive. This simple change modifies the algorithm so that the resulting
> permutation always consists of a single cycle.

> In fact, as described below, it is quite easy to accidentally implement Sattolo's algorithm
> when the ordinary Fisher–Yates shuffle is intended. This will bias the results by causing the
> permutations to be picked from the smaller set of (n − 1)! cycles of length n, instead of from
> the full set of all n! possible permutations.

> The naïve method of swapping each element with another element chosen randomly from all
> elements is biased.

> A variant of the above method that has seen some use in languages that support sorting with
> user-specified comparison functions is to shuffle a list by sorting it with a comparison
> function that returns random values. However, this is very likely to produce highly
> non-uniform distributions, which in addition depend heavily on the sorting algorithm used.

> Care must be taken when implementing the Fisher–Yates shuffle, both in the implementation of
> the algorithm itself and in the generation of the random numbers it is built on, otherwise the
> results may show detectable bias.

> Doing a Fisher–Yates shuffle involves picking uniformly distributed random integers from
> various ranges. Most random number generators, however — whether true or pseudorandom — will
> only directly provide numbers in a fixed range from 0 to RAND_MAX, and in some libraries,
> RAND_MAX may be as low as 32767.

> For example, assume that your random number source gives numbers from 0 to 99 (as was the case
> for Fisher and Yates' original tables), which is 100 values, and that you wish to obtain an
> unbiased random number from 0 to 15 (16 values). If you simply divide the numbers by 16 and
> take the remainder, you will find that the numbers 0–3 occur about 17% more often than others.

Note: this article's attributions (Durstenfeld 1964, Knuth's "Algorithm P", Sattolo 1986,
the one-line j-range change producing a single cycle, modulo bias) are checked against Crossref
below and used only as the article states them.

## 2. Mike Bostock, "Fisher–Yates Shuffle"

URL: https://bost.ocks.org/mike/shuffle/
Local copy: `sources/bostock-shuffle.txt`

> A simple but effective way of doing this is to pull a random card from the deck repeatedly and
> set it aside, incrementally building a new stack. As long as you pick each remaining card from
> the deck with equal probability, you'll have a perfectly-unbiased random stack when you're
> done:

> But here's an interesting, if obvious, insight: the number of shuffled elements (n - m) plus
> the number of remaining elements (m) is always equal to n. This means we can do the entire
> shuffle in-place, without any extra space!

## 3. Rob Weir, "Doing the Microsoft Shuffle: Algorithm Fail in Browser Ballot"

URL: https://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html
Local copy: `sources/weir-microsoft-shuffle.txt`

> The ordering of the browser choices is determined by JavaScript code on the BrowserChoice.eu
> web site. You can see the core function in the GenerateBrowserOrder function. I took that
> function and supporting functions, put it into my own HTML file, added some test driver code
> and ran it for 10,000 iterations on Internet Explorer.

> This confirms the DSL.sk results. Chrome appears more often in one of the first 3 positions
> and I.E. is most likely to be in the 5th position.

> The simplest approach is to adopt a well-known and respected algorithm like the Fisher-Yates
> Shuffle, which has been known since 1938. I tested with that algorithm, using a JavaScript
> implementation taken from the Fisher-Yates Wikpedia page, with the following results for
> 10,000 iterations in Internet Explorer:

Note: the raw-counts table (row "5", column "I.E." = 5034 of 10,000 runs) is the source for "I.E.
in the last position about half the time," read directly from the published table, not restated
from a summary.

## 4. Python documentation, `random` module (3.15.2)

URL: https://docs.python.org/3/library/random.html
Local copy: `sources/python-random-docs.txt`

> Note that even for small len(x), the total number of permutations of x can quickly grow larger
> than the period of most random number generators. This implies that most permutations of a
> long sequence can never be generated. For example, a sequence of length 2080 is the largest
> that can fit within the period of the Mersenne Twister random number generator.

> Python uses the Mersenne Twister as the core generator. It produces 53-bit precision floats
> and has a period of 2**19937-1.

## 5. TensorFlow API documentation, `tf.data.Dataset.shuffle` (v2.21.0)

URL: https://www.tensorflow.org/api_docs/python/tf/data/Dataset
Local copy: `sources/tf-dataset-shuffle.txt`

> This dataset fills a buffer with buffer_size elements, then randomly samples elements from
> this buffer, replacing the selected elements with new elements. For perfect shuffling, a
> buffer size greater than or equal to the full size of the dataset is required.

> For instance, if your dataset contains 10,000 elements but buffer_size is set to 1,000, then
> shuffle will initially select a random element from only the first 1,000 elements in the
> buffer.

> To shuffle an entire dataset, set buffer_size=dataset.cardinality(). This is equivalent to
> setting the buffer_size equal to the number of elements in the dataset, resulting in uniform
> shuffle.

Note: the version fetched (v2.21.0) differs from the chapter plan's stated v2.16.1, but the
quoted text is unchanged between them (the same wording appears verbatim); recorded here as the
version actually read.

## 6. Hugging Face `datasets` documentation, "Stream"

URL: https://huggingface.co/docs/datasets/en/stream
Local copy: `sources/hf-datasets-stream.txt`

> The buffer_size argument controls the size of the buffer to randomly sample examples from.
> Let's say your dataset has one million examples, and you set the buffer_size to ten thousand.
> IterableDataset.shuffle() will randomly select examples from the first ten thousand examples
> in the buffer. Selected examples in the buffer are replaced with new examples.

> IterableDataset.shuffle() will also shuffle the order of the shards if the dataset is sharded
> into multiple files.

## 7. arXiv:1508.03167, Bacher, Bodini, Hollender and Lumbroso, "MergeShuffle"

URL: https://arxiv.org/abs/1508.03167
Local copy: `sources/arxiv-mergeshuffle-abs.txt`

> This article introduces an algorithm, MergeShuffle, which is an extremely efficient algorithm
> to generate random permutations (or to randomly permute an existing array). It is easy to
> implement, runs in

Note: abstract only, as the chapter plan specifies ("abstract read at planning time"); not
built, named once in post-notes as the parallel in-memory algorithm.

**Named, not read** (citations checked against Crossref at research time; the papers themselves
not opened):

- Durstenfeld, "Algorithm 235: Random permutation", *Communications of the ACM* 7(7), 1964, p.
  420 — DOI `10.1145/364520.364540`, confirmed July 1964.
- Sattolo, "An algorithm to generate a random cyclic permutation", *Information Processing
  Letters* 22(6), 1986, pp. 315–317 — DOI `10.1016/0020-0190(86)90073-6`, confirmed May 1986.
- Sanders, "Random permutations on distributed, external and hierarchical memory",
  *Information Processing Letters* 67(6), 1998, pp. 305–309 — DOI `10.1016/s0020-0190(98)00127-6`,
  confirmed September 1998.
- Fisher and Yates, *Statistical Tables for Biological, Agricultural and Medical Research*,
  1938 (named only, via the Wikipedia article above; not read).
- Knuth, *The Art of Computer Programming*, Vol. 2, §3.4.2, Algorithm P (framing only, not
  opened).
- Mitzenmacher and Upfal, *Probability and Computing*, 2nd ed. (the syllabus's canonical
  reference; not opened for this topic specifically).

**Within this repo, read directly (not "fetched," already on disk):**

- `dsa.expectation-indicator-variables` (topic 95): the fixed-point expectation this topic's
  Sattolo-versus-Fisher–Yates check relies on — "the expected number of fixed points of a
  uniform random permutation of n items is exactly 1 for every n" (topic 95's own checked claim,
  used here, not re-derived).
- `dsa.measuring-memory-hierarchy` (live): that topic's own account of Sattolo's algorithm, read
  directly from its `post-notes.md`, so this topic's account does not contradict it: "Build the
  cycle with **Sattolo's algorithm** (Sattolo, 1986), a one-line variant of Fisher–Yates whose
  only change — drawing each swap partner from strictly *below* the current index — guarantees a
  single cycle of full length."
