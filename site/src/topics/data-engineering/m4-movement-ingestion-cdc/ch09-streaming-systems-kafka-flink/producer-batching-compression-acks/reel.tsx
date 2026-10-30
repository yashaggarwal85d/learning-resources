import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy single-partition accumulator racing
// batch.size against linger.ms for a thousand records; a real zstd compressor run once on a
// lone record and once on a full batch of the same shape; a toy sticky-vs-round-robin
// partitioner routing nine hundred keyless records into three partitions; and a toy leader
// crash comparing what an acks=1 producer believed was durable against what an acks=all
// producer believed, and what each actually kept. No literal digits anywhere below (duration
// numbers are exempt); the real counts are shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the lowest-latency setting that wasn't",
      body: (
        <>
          A team sets the producer's artificial wait to nothing, chasing the lowest possible
          latency. For the identical stream of records, that setting ends up issuing twice as
          many requests as Kafka's own default. Why would waiting on purpose ever help?
        </>
      ),
      duration: 4.8,
      fig: 'the identical stream of records, sent two ways on a real run — one setting issues twice as many requests as the other',
      Visual: S.Hook,
    },
    {
      title: 'Setup: the accumulator',
      body: (
        <>
          Before anything reaches a broker, records for a partition sit in memory, in a
          buffer racing two limits: a byte ceiling, and a clock.
        </>
      ),
      duration: 4.8,
      fig: 'one partition, one buffer — a byte limit and a linger clock, both still empty',
      Visual: S.Setup,
    },
    {
      title: 'Predict: the clock runs out before the buffer fills. What happens?',
      body: (
        <>
          The buffer has not reached its byte limit. The linger clock has just run out
          anyway. What happens to the batch sitting in the buffer right now?
        </>
      ),
      duration: 2.8,
      fig: 'under the byte limit, and the linger clock just ran out — does the batch wait, go out as it stands, or get dropped?',
      predict: {
        options: [
          { label: 'It keeps waiting until the byte limit is reached' },
          { label: 'It is sent as it stands, partly full', correct: true },
          { label: 'It is dropped and retried later' },
        ],
        explain: (
          <>
            It is sent as it stands. The byte limit is a ceiling, not a floor the clock has
            to wait for — the clock only ever gives an upper bound on the wait. Nothing in
            the design treats a partly-full batch as invalid; every record ever added to it
            goes out, in order, every time.
          </>
        ),
      },
      Visual: S.PredictBatchClose,
    },
    {
      title: 'Reveal: the race, in real numbers',
      body: (
        <>
          The same thousand records, sent twice: once with no artificial wait at all, once at
          the real default. A few milliseconds of patience changes the request count a lot.
        </>
      ),
      duration: 4.8,
      fig: 'the same thousand records, sent two ways — fewer, larger batches at the real default wait',
      takeaway: 'Whichever limit is hit first closes the batch — a short wait can mean half as many requests.',
      Visual: S.RevealBatchRace,
    },
    {
      title: 'Reveal: compression is a batch trick, not a record trick',
      body: (
        <>
          The identical compressor, run once on a single record and once on a full batch of
          the same shape. A lone record barely shrinks. A full batch shrinks dramatically —
          there is simply more repeated structure for the compressor to find.
        </>
      ),
      duration: 4.8,
      fig: 'one compressor, run on a lone record and on a full batch of the same records',
      takeaway: "A bigger batch compresses far better than a lone record — compression rewards batching, not individual records.",
      Visual: S.RevealCompression,
    },
    {
      title: 'Predict: sticking to one partition — bigger batches, or smaller?',
      body: (
        <>
          No key on these records, three partitions available. Instead of spreading records
          across all three in turn, the producer sticks to one partition until its batch
          closes. Does that make the resulting batches bigger, or smaller?
        </>
      ),
      duration: 2.8,
      fig: "no key, three partitions — sticking to one instead of round-robin: bigger batches, or smaller?",
      predict: {
        options: [
          { label: 'Bigger — more consecutive records land together before it switches', correct: true },
          { label: 'About the same — the same records go out either way' },
          { label: 'Smaller — one partition ends up overloaded' },
        ],
        explain: (
          <>
            Bigger. Round-robin spreads consecutive records across every partition
            immediately, so each partition's batch fills slowly. Sticking to one partition
            until its own batch closes lets far more consecutive records land together
            first — and which partition is sticky changes only when a batch closes, not
            mid-batch, so no single partition is ever favored for long.
          </>
        ),
      },
      Visual: S.PredictStickyPartition,
    },
    {
      title: 'Reveal: sticky partitioning, in real numbers',
      body: (
        <>
          The identical nine hundred keyless records, routed two ways into the same three
          partitions. Sticking to one partition at a time fills noticeably bigger batches.
        </>
      ),
      duration: 4.8,
      fig: 'the same records, routed two ways into the same partitions — real average batch sizes for each',
      takeaway: "Sticking to a partition until its batch closes fills bigger batches than spreading records thin from the start.",
      Visual: S.RevealStickyFill,
    },
    {
      title: 'Reveal: acks, and what each level actually risks',
      body: (
        <>
          A producer can declare a record safe at three different points: the moment it's
          handed off, the moment the leader writes it, or the moment every in-sync replica
          has it. A real toy leader crash shows what the gap between the first two can cost.
        </>
      ),
      duration: 4.8,
      fig: 'a real toy leader crash — records an each acks level believed were safe, against what it actually kept',
      takeaway: "Leader-only acknowledgement can call a record safe just before losing it — waiting for every in-sync replica cannot.",
      Visual: S.RevealAcksCrash,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          producer, just now — the request race, the compression ratios, the partition fill
          comparison, and the acks crash counts.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          A batch that races a byte limit against a clock. Compression that rewards batching,
          not single records. A partitioner that sticks instead of spreading thin. And an acks
          level that decides, precisely, what "durable" is even allowed to mean.
        </>
      ),
      duration: 4.8,
      fig: 'an accumulator racing two limits, batch-level compression, sticky partitioning, and an acks level — the four ideas this topic opened on',
      Visual: S.Recap,
    },
  ],
};

export default reel;
