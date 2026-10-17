import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The bottom rung of the memory hierarchy: a flat key-to-blob namespace reached over HTTP, where a
// request's fixed latency dwarfs its bandwidth. Running example: the order_events compaction output, 1 TiB.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Near-unlimited capacity, at a price',
      body: (
        <>
          Local disks gave microseconds and <code>fsync</code>. Object storage gives near-unlimited, cheap, durable capacity instead, reached over
          HTTP. The price: every request costs tens to hundreds of milliseconds, and the contract underneath has changed.
        </>
      ),
      duration: 3.4,
      Visual: S.Problem,
    },
    {
      title: 'A flat namespace, not a filesystem',
      body: (
        <>
          A <b>key</b> is just a string; it maps to an opaque <b>object</b>. The slashes in <code>events/2026/10/13/part.parquet</code> are part of the
          string, not folders. Writes are whole-object: a <code>PUT</code> replaces the whole thing, and on an ordinary bucket there is no append and
          no rename, only <code>COPY</code> then <code>DELETE</code>, two steps, not one.
        </>
      ),
      duration: 4,
      Visual: S.FlatNamespace,
    },
    {
      title: 'Strong read-after-write, since 2020',
      body: (
        <>
          Since December 2020, Amazon S3 gives strong read-after-write consistency for every <code>PUT</code> and <code>DELETE</code>: the very next
          read sees the write, and a read racing a write gets the old object or the new one, never a torn mix. What still is not atomic: swapping two
          keys at once.
        </>
      ),
      duration: 4,
      Visual: S.Consistency,
    },
    {
      title: 'The cost of one request: α + n/β',
      body: (
        <>
          The chapter&rsquo;s cost shape again, at its extreme: a fixed latency <b>α</b> of roughly <b>100</b>–<b>200 ms</b> for a small object, plus
          bytes over a bandwidth <b>β</b>. Latency is a distribution, so this is where percentiles start to matter: the median, the one request in a
          hundred that is slower, the one in a thousand slower still.
        </>
      ),
      duration: 4.4,
      Visual: S.CostShape,
    },
    {
      title: 'Predict: where does waiting equal transferring?',
      body: <>One request costs about 100 ms of latency and streams at about 90 MB/s. At what size does the wait equal the transfer?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'About 90 KB' },
          { label: 'About 9 MB', correct: true },
          { label: 'About 900 MB' },
          { label: 'It never equalizes' },
        ],
        explain: (
          <>
            α·β: a tenth of a second times 90 MB/s is about 9 MB — right where AWS tells you to size ranges, 8 or 16 MB. Below that you pay mostly
            for the request; above it, mostly for bytes.
          </>
        ),
      },
      Visual: S.AlphaBetaPredict,
    },
    {
      title: 'Predict: how many requests fill the link?',
      body: (
        <>
          One stream at 90 MB/s drags a terabyte across in about three and a half hours. To fill one machine&rsquo;s 10 Gbit/s link, about 1,250 MB/s,
          how many 90 MB/s requests do you need running at once?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: 'About 1' }, { label: 'About 14', correct: true }, { label: 'About 140' }, { label: "It can't be filled" }],
        explain: <>1,250 divided by 90 is about 14. There is no per-bucket bandwidth cap, only the per-prefix request-rate limit next; add requests, then add machines.</>,
      },
      Visual: S.ConcurrencyPredict,
    },
    {
      title: 'Each prefix has its own ceiling',
      body: (
        <>
          A <b>prefix</b> is a shared leading substring of keys. Each one is good for at least <b>3,500</b> writes and <b>5,500</b> reads a second;
          push past it and the store answers <b>503</b>, Slow Down, while it repartitions. That is back-pressure, not a bug: spread hot keys across
          many prefixes instead of funnelling them through one.
        </>
      ),
      duration: 4,
      Visual: S.PrefixLimits,
    },
    {
      title: 'A range GET reads just a slice',
      body: (
        <>
          A <code>Range:</code> header fetches a slice of an object instead of the whole thing. A columnar file keeps its directory at the very end,
          so a query reads the footer first, then only the column chunks it needs: 3 of 30 columns moves about a tenth of the bytes. What you actually
          move is what counts, not the file&rsquo;s size.
        </>
      ),
      duration: 4.2,
      Visual: S.RangeGet,
    },
    {
      title: 'Large objects upload in parts',
      body: (
        <>
          <b>Multipart upload</b> splits a large object into parts, up to <b>10,000</b> of them, each <b>5 MiB</b> to <b>5 GiB</b>, uploaded in
          parallel and assembled by one final call. A stalled part is retried alone, not the whole object, and nothing exists under the key until
          assembly finishes. Our 1 TiB object over 10,000 parts needs a minimum part size of about <b>105 MiB</b>.
        </>
      ),
      duration: 4.6,
      Visual: S.MultipartUpload,
    },
    {
      title: 'Predict: two writers, one key',
      body: <>Two writers race to create the same key, each saying "write this, only if nothing is there yet." What happens?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Both succeed, last write wins' },
          { label: 'Exactly one succeeds, the other is refused', correct: true },
          { label: 'Both fail' },
          { label: 'It depends on object size' },
        ],
        explain: (
          <>
            Exactly one PUT succeeds; the loser gets a precondition-failed error and retries against the next version. That compare-and-set, plus
            strong read-after-write consistency, is enough to commit a table with no separate lock service.
          </>
        ),
      },
      Visual: S.ConditionalWrite,
    },
    {
      title: 'Back to the tier: count requests, not bytes',
      body: (
        <>
          Count requests before bytes: size ranges near 9 MB, run about 14 at once to fill a link, spread across prefixes to stay under their
          ceiling. Coalesce small reads, cache the hot ones, hedge the slow tail. The bytes come back exactly as written; next is whether they still
          mean the right number.
        </>
      ),
      duration: 3.8,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
