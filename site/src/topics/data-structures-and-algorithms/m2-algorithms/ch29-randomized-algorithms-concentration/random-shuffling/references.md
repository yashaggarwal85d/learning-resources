Last verified: 2026-11-05.

- Wikipedia, "Fisher–Yates shuffle" — the modern algorithm, Sattolo's variant, the naive and
  random-comparator biases, and the modulo-bias section. [source](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- Mike Bostock, "Fisher–Yates Shuffle" — the in-place derivation and its visual matrix of bias. [source](https://bost.ocks.org/mike/shuffle/)
- Rob Weir, "Doing the Microsoft Shuffle: Algorithm Fail in Browser Ballot" — the 10,000-run
  measurement of the 2010 browser-choice ballot's random-comparator bias. [source](https://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html)
- Python documentation, `random` module (3.15.2) — the Mersenne Twister's period and the
  2,080-item limit on reachable permutations. [source](https://docs.python.org/3/library/random.html)
- TensorFlow API documentation, `tf.data.Dataset.shuffle` — the documented buffer-and-replace
  behavior and its non-uniformity below the dataset's full size. [source](https://www.tensorflow.org/api_docs/python/tf/data/Dataset)
- Hugging Face `datasets` documentation, "Stream" — `IterableDataset.shuffle()`'s buffer limit. [source](https://huggingface.co/docs/datasets/en/stream)
- arXiv:1508.03167, Bacher, Bodini, Hollender and Lumbroso, "MergeShuffle" — abstract only,
  named as the parallel in-memory algorithm. [source](https://arxiv.org/abs/1508.03167)

Named for attribution only, not read directly (per the chapter plan, citations checked against
Crossref): Durstenfeld, "Algorithm 235: Random permutation," Communications of the ACM 7(7),
1964, p. 420; Sattolo, "An algorithm to generate a random cyclic permutation," Information
Processing Letters 22(6), 1986, pp. 315–317; Sanders, "Random permutations on distributed,
external and hierarchical memory," Information Processing Letters 67(6), 1998, pp. 305–309;
Fisher and Yates, *Statistical Tables for Biological, Agricultural and Medical Research*, 1938;
Knuth, *The Art of Computer Programming*, Vol. 2, §3.4.2; Mitzenmacher and Upfal, *Probability
and Computing*, 2nd ed.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=random-shuffling:%20).
