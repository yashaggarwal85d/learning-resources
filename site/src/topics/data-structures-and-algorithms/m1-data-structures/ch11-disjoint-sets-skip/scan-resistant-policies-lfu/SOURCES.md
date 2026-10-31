## Johnson and Shasha, "2Q: A Low Overhead High Performance Buffer Management Replacement Algorithm"

URL: https://www.vldb.org/conf/1994/P439.PDF
Version: VLDB '94 proceedings, pp. 439–450, fetched 2026-10-31

> Given a
> buffer size B, one divides it into Am, Alin (of maximum size Kin and minimum size l), and Alout (of
> maximum size Kout). Fixing these parameter8 is per
> tentially a tuning question though the following values work well: Kin should be 25% of the page slot8
> and Kout should hold identifier8 for as many pages as
> would fit on 50% of the buffer.

> This algorithm solves the correlated reference problem by retaining newly referenced pages in Alin to satisfy repeated requests. If a page in Alin is accessed, it
> isn't promoted to Am, because the second access may
> simply be a correlated reference. The Alout buffer,
> by contrast, is used to detect page8 that have high
> long-term access rates.

> Thus, 2Q provides a kind of "scan resistance."

Contents: the queue-split (Am, A1in capped at Kin, A1out capped at Kout), the recommended sizing
(25%/50%), the rule that a hit in A1in doesn't promote to Am, and the paper's own scan-resistance
claim. (OCR note: the PDF's text extraction drops the "1" from "A1in"/"A1out" — rendered "Alin"/
"Alout" throughout — and mangles a few other characters, e.g. "parameter8" for "parameters"; the
quotes above are copied exactly as extracted, since that's what `sources.mjs check` matches
against.)

## Megiddo and Modha, "ARC: A Self-Tuning, Low Overhead Replacement Cache"

URL: https://www.usenix.org/legacy/event/fast03/tech/full_papers/megiddo/megiddo.pdf
Version: USENIX FAST '03 proceedings, pp. 115–130, fetched 2026-10-31

> In contrast to LRU-2, 2Q, LIRS, FBR, and LRFU
> which require offline selection of tunable parameters,
> our replacement policy ARC is online and is completely
> self-tuning. Most importantly, ARC is empirically universal. The policy ARC maintains no frequency counts,
> and, hence, unlike LFU and FBR, it does not suffer from
> periodic rescaling requirements.

> ARC maintains a cache
> directory that remembers twice as many pages as in the
> cache memory.

Contents: ARC's own summary of what makes it self-tuning (no offline parameter selection, no
frequency counts, no periodic rescaling) and its directory-size claim (twice the cache's own
capacity — the 2c directory CHAPTER.md's plan names). The paper's own T1/T2/B1/B2 subscript
notation does not survive this PDF's text extraction (subscripted list names render as blank
space in the cached text — the same class of PDF-extraction loss recorded for other papers in
project memory `learning-resources-sources-mjs-c-header-mangling`); the four-list structure and
the adaptation parameter *p* are described in this topic's own words from the paper's prose
(read directly, not quote-checked) rather than quoted.

## Redis documentation: Key eviction

URL: https://redis.io/docs/latest/develop/reference/eviction/
Version: fetched 2026-10-31

(Same page already quoted in `dsa.lru-caches/SOURCES.md` for the sampled-LRU claims; this topic
cites it again for its LFU-specific content, read fresh at the same URL.)

## Redis `redis.conf`

URL: https://raw.githubusercontent.com/redis/redis/unstable/redis.conf
Version: `unstable` branch, fetched 2026-10-31

> # There are two tunable parameters in the Redis LFU implementation: the
> # counter logarithm factor and the counter decay time.

> # The LFU counter is just 8 bits per key, it's maximum value is 255, so Redis
> # uses a probabilistic increment with logarithmic behavior. Given the value

> # The default lfu-log-factor is 10.

> # The counter decay time is the time, in minutes, that must elapse in order
> # for the key counter to be decremented.

> # The default value for the lfu-decay-time is 1.

Contents: the Morris-style probabilistic counter's update rule, its 8-bit/255-max size, the
default `lfu-log-factor` of 10, and the default `lfu-decay-time` of one minute.

## PostgreSQL `src/backend/storage/buffer/README`

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/storage/buffer/README
Version: `master` branch, fetched 2026-10-31

(Same README already quoted in `dsa.lru-caches/SOURCES.md` for the clock-sweep and scan-ring
claims; this topic re-cites it for its own scan-resistance framing.)

## PostgreSQL documentation: Release 8.0.2

URL: https://www.postgresql.org/docs/8.0/release-8-0-2.html
Version: fetched 2026-10-31

> New cache management algorithm 2Q replaces ARC (Tom)
>
> This was done to avoid a pending US patent on
> ARC. The 2Q code might be a few percentage
> points slower than ARC
> for some work loads. A better cache management algorithm
> will appear in 8.1.

Contents: the exact reason PostgreSQL 8.0.2 replaced ARC with 2Q, word for word, and the forward
pointer to a better algorithm in 8.1.

## PostgreSQL documentation: Release 8.1

URL: https://www.postgresql.org/docs/8.1/release-8-1.html
Version: fetched 2026-10-31

> The
> buffer manager has also been changed to use a
> "clock sweep" replacement
> policy.

Contents: confirms 8.1's "better cache management algorithm" (promised in the 8.0.2 notes) was
clock sweep, not ARC's return — closing the loop CHAPTER.md's plan asks for.

## Zhang et al., "SIEVE is Simpler than LRU: an Efficient Turn-Key Eviction Algorithm for Web Caches"

URL: https://www.usenix.org/system/files/nsdi24-zhang-yazhuo.pdf
Version: NSDI '24, fetched 2026-10-31

> We implemented
> S IEVE in five production cache libraries, requiring fewer than
> 20 lines of code changes on average. Our evaluation on 1559
> cache traces from 7 sources shows that S IEVE achieves up
> to 63.2% lower miss ratio than ARC.

Contents: the abstract's own code-change and miss-ratio claims, used only for the skipped-topic
pointer in `post-notes.md`'s Frontier section, not built. (OCR note: the ligature "SIEVE" is
split into "S IEVE" throughout this PDF's extracted text; quoted exactly as extracted.)

### Secondary source (primary paper not reachable)

- **LIRS** (Jiang and Zhang, SIGMETRICS '02, pp. 31–42): the original paper is behind ACM's
  paywall (`dl.acm.org/doi/pdf/10.1145/511399.511340` returns HTTP 403), and the authors' own
  mirror of the later journal-length version (`ranger.uta.edu/~sjiang/pubs/papers/jiang05_LIRS.pdf`)
  fails TLS verification from this sandbox (the same `.edu`-hosted-source TLS failure pattern
  recorded in project memory for the `dsa` chapter-5-tail topics). Per `CHAPTER.md`'s own
  instruction for this case, LIRS's claims here are sourced to a secondary description instead:

  URL: https://en.wikipedia.org/wiki/LIRS_caching_algorithm
  Version: fetched 2026-10-31

  > LIRS uses reuse distance of a page, or the number of distinct pages accessed between two
  > consecutive references of the page, to quantify locality.

  > The cache is divided into a Low Inter-reference Recency (LIR) and a High Inter-reference
  > Recency (HIR) partition. The LIR partition is to store the most highly ranked pages (LIR
  > pages) and the HIR partition is to store some of the other pages (HIR pages).

  > LIRS has been deployed in MySQL since version 5.1

  Every LIRS claim in this topic (the reuse-distance metric, the LIR/HIR split, and the real-world
  deployment in MySQL) traces to this secondary description, not to the original paper, and
  `FACT-CHECK.md` and `post-notes.md` both say so explicitly rather than presenting it as
  independently verified against the primary source.
