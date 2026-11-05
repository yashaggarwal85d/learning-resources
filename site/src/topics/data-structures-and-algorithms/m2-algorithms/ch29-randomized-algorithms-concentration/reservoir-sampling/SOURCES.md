# Sources — dsa.reservoir-sampling

Fetched at research time (2026-11-05) into `sources/`. Checked with
`node scripts/sources.mjs check reservoir-sampling`.

## 1. Wikipedia, "Reservoir sampling"

URL: https://en.wikipedia.org/wiki/Reservoir_sampling
Local copy: `sources/wiki-reservoir-sampling.txt`

> Reservoir sampling was introduced as early as 1962 by Fan, Muller, and Rezucha, who described
> a sampling algorithm which did not need to know the population size n in advance.

> A simpler algorithm, known as Algorithm R, was discovered independently by Alan G. Waterman

> and McLeod & Bellhouse;

> it can also be viewed as a variant of the Fisher–Yates shuffle.

> The Algorithm R described in the previous section has linear runtime, since it generates a
> random number for every element in the input stream to determine whether it should be
> included in the reservoir. It was observed by Jeffrey Vitter that it is possible to obtain
> faster algorithms with sublinear runtime when the algorithm is allowed to skip past sections
> of the input stream without examining them. Vitter gave a reservoir sampling algorithm which
> runs in time

> and proved that this is optimal.

> Kim-Hung Li described a simple algorithm, Algorithm L, achieving the same asymptotic runtime,
> and which is described in this section.

> This results in Algorithm L, which is implemented as follows:

> // S has items to sample, R will contain the result
> ReservoirSample(S[1..n], R[1..k])
>  // fill the reservoir array with the first k items
>  for i = 1 to k
>  R[i] := S[i]
>  end
>
>  // random() generates a uniform (0,1) random number
>  W := exp(log(random())/k)
>
>  while i <= n
>  // skip items according to a geometric distribution
>  i := i + floor(log(random())/log(1-W)) + 1
>  if i <= n
>  // replace a random item of the reservoir with item i
>  R[randomInteger(1,k)] := S[i]
>  W := W * exp(log(random())/k)
>  end
>  end
> end

> This algorithm computes three random numbers for each item that becomes part of the
> reservoir, and does not spend any time on items that do not.

Note: this article attributes Algorithm R to Waterman (independently of McLeod & Bellhouse),
matching `CHAPTER.md`'s note to check "the Wikipedia article states Waterman discovered it
independently of an earlier method" — confirmed exactly.

## 2. Efraimidis, "Weighted Random Sampling over Data Streams" (arXiv:1012.0256)

URL: https://arxiv.org/pdf/1012.0256
Local copy: `sources/arxiv-efraimidis-full.txt`

> for random sampling schemes without replacement there are at least two natural
> ways to interpret the item weights. In the first case, the relative weight of
> each item determines the probability that the item is in the final sample. In
> the second, the weight of each item determines the probability that the item
> is selected in each of the explicit or implicit item selections of the sampling
> procedure.

> The algorithm of Efraimidis and Spirakis [8], which we call A-ES, is a sampling
> scheme for problem WRS-N-W. In A-ES, each item vi of the population V
> independently generates a uniform random number ui ∈ (0, 1) and calculates
> a key ki = ui 1/wi . The items that possess the m largest keys form a weighted
> random sample.

> In uniform random sampling it is possible to generate an exponential
> jump that identifies the next item of the population that will enter the reservoir [7], while in [8] it is shown that exponential jumps can be used for WRS
> with algorithm A-ES.

Note: this source (by Efraimidis alone, a companion paper to Efraimidis & Spirakis 2006) names
the Efraimidis–Spirakis algorithm **"A-ES"**, not "A-Res" — `CHAPTER.md` named it "A-Res" with
"A-ExpJ" for the jump variant, attributed to the original 2006 paper (not read, per the plan).
Since this fetched source does not use either of those two names anywhere, this topic uses
only the name this source actually gives ("A-ES") and does not state "A-Res" or "A-ExpJ" on
screen, per the project's rule against asserting a claim no fetched source confirms.

## 3. Apache Spark source, `SamplingUtils.scala` (branch: master, read 2026-11-05)

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/util/random/SamplingUtils.scala
Local copy: `sources/spark-samplingutils.scala`

> // There are k elements in the reservoir, and the l-th element has been
> // consumed. It should be chosen with probability k/l. The expression
> // below is a random long chosen uniformly from [0,l)

> Utility functions that help us determine bounds on adjusted sampling rate to guarantee exact

## 4. Apache Spark source, `Partitioner.scala` (branch: master, read 2026-11-05)

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/Partitioner.scala
Local copy: `sources/spark-partitioner.scala`

> Sketches the input RDD via reservoir sampling on each partition.

> The weight is 1 over the sampling probability.

## 5. Apache Spark source, `RDD.scala` (branch: master, read 2026-11-05)

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/rdd/RDD.scala
Local copy: `sources/spark-rdd.scala`

> If the first sample didn't turn out large enough, keep trying to take samples;

Note: `takeSample`'s own comment, read together with `SamplingUtils.computeFractionForSampleSize`,
confirms the chapter plan's description: it counts the RDD, computes a sampling fraction with
`BinomialBounds`/`PoissonBounds` that succeeds with high confidence, samples with that
fraction, and retries (logging a warning) if the sample came back too small — never a
reservoir sample.

**Named, not read** (per `CHAPTER.md`; cited only for attribution, nothing attributed beyond
the title/author/year below):

- Vitter, "Random sampling with a reservoir", ACM Transactions on Mathematical Software 11(1),
  1985, pp. 37–57 — attribution confirmed via source 1 above (Vitter's own skip-based bound and
  optimality claim are stated there, word for word).
- Li, "Reservoir-sampling algorithms of time complexity O(n(1 + log(N/n)))", ACM Transactions
  on Mathematical Software 20(4), 1994, pp. 481–493 — attribution confirmed via source 1 above.
- Efraimidis and Spirakis, "Weighted random sampling with a reservoir", Information Processing
  Letters 97(5), 2006, pp. 181–185 — named via source 2 above as reference [8]; the paper
  itself not opened, so this topic states only what source 2 (which cites it) confirms.
- Knuth, *The Art of Computer Programming*, Vol. 2, §3.4.2 (Algorithm R; framing only, not
  opened).
- Mitzenmacher and Upfal, *Probability and Computing*, 2nd ed. (the syllabus's canonical
  reference; not opened for this topic specifically).
