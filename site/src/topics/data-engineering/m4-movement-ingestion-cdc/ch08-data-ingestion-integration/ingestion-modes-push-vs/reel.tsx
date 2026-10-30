import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py (a seeded Poisson arrival
// trace, three hundred orders over a two-hour window, cut by three poll intervals): one example
// order waits about thirty-six hundred seconds under an hourly batch poll, about twenty under a
// thirty-second micro-batch poll, and under one second under a one-second streaming poll; across
// all three hundred orders the average delay is about two thousand seconds, about fourteen
// seconds and about half a second; batch hands its consumer about a hundred rows at once per
// tick, micro-batch about one, streaming well under one; and the three modes have one, two and
// three moving parts respectively, a named count, not a benchmark.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A team calls its dashboard "real time." It is an hourly cron job. Nobody has ever put a
          number on how long one order actually waits. The same stream, cut three ways, about to
          answer that.
        </>
      ),
      duration: 4.8,
      fig: "the same orders stream, cut three ways. One row's own delay, counting up in each.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the four positions',
      body: (
        <>
          Every pipeline has a source, a buffer, a sink and a cursor. In a pull, the consumer
          owns the schedule and the source is left holding the buffer. In a push, that flips.
        </>
      ),
      duration: 4.8,
      fig: 'source, buffer, sink, cursor. Who owns the buffer flips between pull and push.',
      Visual: S.RevealFourPositions,
    },
    {
      title: 'Predict: which mode surprises the consumer most',
      body: (
        <>
          Batch does the most work per run. Streaming does the least per tick. Which one actually
          drops the most unplanned load on whatever has to consume it?
        </>
      ),
      duration: 2.8,
      fig: 'batch does the most work per run. Which mode drops the most unplanned load?',
      predict: {
        options: [
          { label: 'Batch — it moves the most rows in one go' },
          { label: "Streaming — nothing shields the consumer from when the producer sends it", correct: true },
        ],
        explain: (
          <>
            Batch really does move the most rows at once — that's the trap. But it does it on a
            schedule the consumer chose. Streaming hands the consumer whatever arrives, whenever
            it arrives, which is the real source of an unplanned surge.
          </>
        ),
      },
      Visual: S.PredictSurprise,
    },
    {
      title: 'Reveal: the three cuts, measured',
      body: (
        <>
          Three hundred orders, one fixed arrival trace, cut by three poll sizes. Average delay:
          about two thousand seconds, fourteen seconds, half a second. Rows per delivery: about a
          hundred, about one, well under one.
        </>
      ),
      duration: 4.8,
      fig: 'average delay: thousands of seconds, tens of seconds, under one second. Rows per tick: about a hundred, about one, well under one.',
      takeaway: 'The same stream, cut three ways, trades latency for burst size. Nothing here is free.',
      Visual: S.RevealMeasured,
    },
    {
      title: 'Reveal: moving parts, and the one failure each is prone to',
      body: (
        <>
          One moving part for batch, two for micro-batch, three for streaming. More parts buys
          lower latency, and a new way to fail: a late batch nobody notices, a pile of small
          checkpointed files, or a backlog streaming has no schedule to shield it from.
        </>
      ),
      duration: 4.8,
      fig: 'moving parts: one, two, three. Each buys lower latency, and its own new way to fail.',
      takeaway: 'More moving parts buys lower latency, and a new way to fail.',
      Visual: S.RevealMovingParts,
    },
    {
      title: 'Recap',
      body: (
        <>
          Source, buffer, sink, cursor — pull and push swap who holds the buffer. Batch, micro-
          batch and streaming trade burst size for delay, measured, not guessed. Each has exactly
          one failure mode this topic names.
        </>
      ),
      duration: 4.8,
      fig: 'four positions. Three cuts, measured. One failure mode each — not interchangeable.',
      takeaway: 'Pick a mode by the failure you can tolerate, not by the word "real-time."',
      Visual: S.Recap,
    },
  ],
};

export default reel;
