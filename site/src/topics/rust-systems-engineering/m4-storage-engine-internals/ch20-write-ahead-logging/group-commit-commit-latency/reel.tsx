import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Without grouping, every transaction pays for its own flush; group
// commit trades a short wait for one flush instead of many. Inside one
// batch, commit latency is entirely about how long the shared flush
// made you wait, not about any transaction's own execution time. And
// asynchronous commit's own risk window is real: acknowledging before
// the flush can tell a client something that wasn't true yet.
const reel: Reel = {
  steps: [
    {
      title: 'Five transactions all become ready to commit within a short window. Commit each one separately, with no grouping at all. How many WAL flushes does that cost?',
      body: (
        <>
          Five transactions, ready together, no grouping.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "One flush, since they're all ready at nearly the same time" },
          { label: 'Five flushes, one per transaction', correct: true },
          { label: 'Somewhere in between, depending on exact timing' },
        ],
        explain: (
          <>
            Five, genuinely. No grouping means no sharing of the flush.
          </>
        ),
      },
      Visual: S.NoGroupingPredict,
    },
    {
      title: 'Measured: committing without any grouping genuinely cost one flush per transaction, five separate flushes for five transactions ready within the same short window',
      body: (
        <>
          The real, measured count, five flushes.
        </>
      ),
      duration: 3.0,
      takeaway: 'Without grouping, every transaction pays for its own flush, even when several become ready at almost the same moment.',
      Visual: S.NoGroupingReveal,
    },
    {
      title: 'Now let the same five transactions commit as one group instead: the earliest-ready one becomes the leader, waits briefly, and a single flush covers everyone ready by then. How many flushes does that cost?',
      body: (
        <>
          The same five transactions, grouped under one leader.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Still five; grouping only changes the order, not the count' },
          { label: 'Exactly one, for the whole batch', correct: true },
          { label: 'It depends on how many followers actually join before the leader gives up' },
        ],
        explain: (
          <>
            Exactly one. The whole batch shares that single flush.
          </>
        ),
      },
      Visual: S.GroupedPredict,
    },
    {
      title: 'Measured: group commit genuinely used exactly one flush for the whole batch of five',
      body: (
        <>
          The real, measured count, one flush.
        </>
      ),
      duration: 3.0,
      takeaway: 'Group commit trades a short wait for one flush instead of one per transaction.',
      Visual: S.GroupedReveal,
    },
    {
      title: "Every transaction in that batch did identical, instant work. Does each one's own commit latency, the time from ready to acknowledged, end up identical too, or does it differ?",
      body: (
        <>
          Five transactions, identical execution time, grouped under one leader.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Identical; their execution time was identical, so their commit latency should be too' },
          { label: 'It genuinely differs; the earliest-ready one waits the longest for the shared flush', correct: true },
          { label: 'It differs, but randomly, with no relation to ready order' },
        ],
        explain: (
          <>
            It genuinely differs. The earliest-ready one waits the longest.
          </>
        ),
      },
      Visual: S.LatencyPredict,
    },
    {
      title: "Measured: commit latency genuinely varied across the batch, even though every transaction's own execution time was identical; the earliest-ready one waited the longest",
      body: (
        <>
          The real, measured latencies, one per transaction.
        </>
      ),
      duration: 3.0,
      takeaway: "Commit latency isn't execution time: inside one batch, it's entirely about how long the shared flush made you wait.",
      Visual: S.LatencyReveal,
    },
    {
      title: "One transaction commits asynchronously: it's told 'committed' the instant it's ready, before its own flush even happens. Crash in the gap between that acknowledgment and the real flush. Does its update survive?",
      body: (
        <>
          An asynchronous commit, acknowledged early, a crash in the gap.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the acknowledgment itself is what matters, not the flush' },
          { label: "No, genuinely; the client was told something that wasn't true yet", correct: true },
          { label: 'Only if the gap is shorter than one flush interval' },
        ],
        explain: (
          <>
            No, genuinely. The client was told something not yet true.
          </>
        ),
      },
      Visual: S.AsyncPredict,
    },
    {
      title: 'Measured: the crash inside that gap genuinely revealed a false promise for the asynchronous commit; the identical crash against a synchronous commit never did',
      body: (
        <>
          The real, measured crash, one false promise, one none.
        </>
      ),
      duration: 3.0,
      takeaway: "Asynchronous commit's own risk window is real: a crash inside it can reveal a promise that wasn't true yet.",
      Visual: S.AsyncReveal,
    },
    {
      title: "PostgreSQL's own documentation names exactly this trade-off directly: what does asynchronous commit actually risk, and what doesn't it risk?",
      body: (
        <>
          PostgreSQL's own words on asynchronous commit, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PgAsyncReveal,
    },
    {
      title: 'Recap: what grouping buys, and what asynchronous commit gives away',
      body: (
        <>
          Without grouping, every transaction pays for its own flush; group commit trades a short wait for one flush instead of many. Inside one batch, commit latency is entirely about how long the shared flush made you wait, not about any transaction's own execution time. And asynchronous commit's own risk window is real: acknowledging before the flush can tell a client something that wasn't true yet — exactly the trade PostgreSQL's own documentation names directly, data loss, never corruption.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
