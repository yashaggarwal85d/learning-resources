import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md). Every claim traces to a direct quote from each
// architecture's own originator. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "The shop's fraud check, one stream or two?",
      body: (
        <>
          A fraud check needs an answer in seconds, but it also needs to be exactly right once
          every one of today's orders is in. Does that take one pipeline, or two?
        </>
      ),
      duration: 4.8,
      fig: 'an answer in seconds, exactly right by day\'s end — one stream, or two?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: Lambda itself, quoted directly',
      body: (
        <>
          A batch system and a stream-processing system run in parallel on the same input, and
          their results get merged together at query time.
        </>
      ),
      duration: 4.8,
      fig: 'batch and stream, run in parallel, merged at query time',
      Visual: S.RevealLambdaQuote,
    },
    {
      title: 'Predict: does merging two independently-computed layers risk them disagreeing?',
      body: (
        <>
          Two different systems compute two different answers, then those answers get merged.
          Can that merge end up disagreeing with itself?
        </>
      ),
      duration: 2.8,
      fig: 'two systems, two answers, merged — can they disagree?',
      predict: {
        options: [
          { label: 'No — the merge is just arithmetic, so it always resolves cleanly' },
          { label: 'Yes, but one layer is designed to always win the disagreement', correct: true },
        ],
        explain: (
          <>
            Yes, briefly — but by design, one layer always wins. The batch layer's answer
            eventually overrides the realtime layer's, so any disagreement is temporary.
          </>
        ),
      },
      Visual: S.PredictMergeDisagree,
    },
    {
      title: "Reveal: the realtime layer's own stack, quoted directly",
      body: (
        <>
          The realtime layer runs on read/write databases and incremental algorithms — a
          genuinely different way of reasoning than the batch layer's plain functions on data.
        </>
      ),
      duration: 4.8,
      fig: 'incremental algorithms, read/write databases — not the batch layer\'s plain functions',
      Visual: S.RevealRealtimeStackQuote,
    },
    {
      title: 'Reveal: the batch layer always wins, quoted directly',
      body: (
        <>
          Everything the realtime layer computes eventually gets overridden by the batch layer,
          so if the realtime layer makes a mistake, the batch layer corrects it.
        </>
      ),
      duration: 4.8,
      fig: 'realtime layer\'s output — always overridden by the batch layer, eventually',
      takeaway: 'A serving-time merge is not a vote between equals; the batch layer always has the final say.',
      Visual: S.RevealBatchAlwaysWinsQuote,
    },
    {
      title: "Predict: is running the same logic twice the expensive part of Lambda, or is it the merge step?",
      body: (
        <>
          Lambda needs the same transformation written once for batch and once for streaming.
          Is that duplication the costly part, or is stitching the two answers together at query
          time?
        </>
      ),
      duration: 2.8,
      fig: 'the same logic, written twice — or the merge at query time: which costs more?',
      predict: {
        options: [
          { label: 'The merge step — reconciling two different answers is the hard part' },
          { label: "Maintaining the same logic correctly in two different systems", correct: true },
        ],
        explain: (
          <>
            Maintaining the same logic in two different systems. The merge itself is
            comparatively simple arithmetic; keeping two implementations of the same
            transformation correct and in sync, in two different frameworks, is the real cost.
          </>
        ),
      },
      Visual: S.PredictWhichCostsMore,
    },
    {
      title: "Reveal: Lambda's own restatement and its real cost, quoted directly",
      body: (
        <>
          Transformation logic gets implemented twice, once per system — and maintaining code
          that must produce the same result in two complex distributed systems is exactly as
          painful as it sounds.
        </>
      ),
      duration: 4.8,
      fig: 'logic implemented twice, in two systems — a cost its own describer calls not fixable',
      takeaway: "Lambda's real cost is duplicate logic across two systems, not the merge arithmetic at the end.",
      Visual: S.RevealDualLogicCostQuote,
    },
    {
      title: 'Reveal: reprocessing as the shared problem, quoted directly',
      body: (
        <>
          Whenever the code that derives output from input changes, that output has to be
          computed again — and that reprocessing problem is very often ignored.
        </>
      ),
      duration: 4.8,
      fig: 'code changes — output must be re-derived, a problem both architectures must answer',
      Visual: S.RevealReprocessingQuote,
    },
    {
      title: "Predict: could one stream-only pipeline reprocess history without a separate batch system?",
      body: (
        <>
          If every input record were kept, fully, in order, replayable from the start — could a
          single streaming pipeline reprocess all of history through its own code path?
        </>
      ),
      duration: 2.8,
      fig: 'every input kept, replayable from the start — can streaming alone reprocess it?',
      predict: {
        options: [
          { label: "No — streaming can only see new data, never the full history" },
          { label: "Yes — replaying the retained log from the start reprocesses it", correct: true },
        ],
        explain: (
          <>
            Yes. A stream processor's position in a retained log is just an offset; restarting
            from the earliest offset reprocesses the full history through the same code.
          </>
        ),
      },
      Visual: S.PredictStreamOnlyReprocess,
    },
    {
      title: "Reveal: Kappa itself, named by its own creator, quoted directly",
      body: (
        <>
          Retain the full log, start a second instance of the job reading from the beginning,
          then switch over once it catches up — its own creator named this the Kappa
          Architecture.
        </>
      ),
      duration: 4.8,
      fig: 'retain the log, replay from the start, switch over — named "Kappa" by its own creator',
      takeaway: "Kappa answers Lambda's own reprocessing problem with one pipeline, not two.",
      Visual: S.RevealKappaQuote,
    },
    {
      title: 'Reveal: the honest trade, quoted directly',
      body: (
        <>
          The efficiency trade-off between the two approaches comes out roughly even — the real
          advantage of one pipeline is operating a single framework, not raw efficiency.
        </>
      ),
      duration: 4.8,
      fig: 'efficiency — roughly even either way; the real win is one framework, not speed',
      takeaway: 'The industry drifted to unified engines for operational simplicity, not because one pipeline is faster than two.',
      Visual: S.RevealHonestTradeQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          Lambda's real cost is duplicate logic across two systems, merged at serving. Kappa
          answers the same reprocessing problem with one pipeline that replays a retained log.
          The industry's real reason to prefer it is operational simplicity, not raw speed.
        </>
      ),
      duration: 4.8,
      fig: 'duplicate logic, merged at serving — versus one pipeline, replayed from a retained log',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pipeline whose retained log is enormous, where reprocessing by replay would itself
          take far too long. Does Kappa's single pipeline still fully replace a batch layer
          here?
        </>
      ),
      duration: 2.8,
      fig: 'a log too large to replay quickly — does one pipeline still replace the batch layer?',
      predict: {
        options: [
          { label: 'Yes — a single stream-only pipeline always replaces the batch layer' },
          { label: 'No — a separately-correct batch layer still earns its cost here', correct: true },
        ],
        explain: (
          <>
            No. If replaying the full log cannot finish inside the latency the system actually
            needs, a slower, independently-correct batch layer to lean on still earns its cost —
            exactly the role Lambda's own batch layer played from the start.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
