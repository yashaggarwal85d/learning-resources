import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: ninety-three of three hundred lines
// matched by the correlation key; the counter forced through a reset losing seventy to zero; the
// stale night's six hundred twenty minutes against a ninety minute threshold; the pull scraper
// missing a four second job against a fifteen second interval; and the series count climbing from
// one to ten thousand as the per-customer label is added.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's nightly revenue table is stale. Every task shows green, no alert fired, and a
          stakeholder found it at nine in the morning.
        </>
      ),
      duration: 4.8,
      fig: 'every task green. No alert. Found by a stakeholder at nine.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which number would have caught it at two in the morning?',
      body: (
        <>
          One number the pipeline already had would have told you at two in the morning. Which
          one?
        </>
      ),
      duration: 3.2,
      fig: 'one number already existed. Which one would have told you?',
      predict: {
        options: [
          { label: 'Whether every task succeeded' },
          { label: 'How many rows were written' },
          { label: 'The age of the newest partition', correct: true },
        ],
        explain: (
          <>
            A task can succeed while touching zero new rows, and a job can faithfully rewrite
            yesterday's partition every night and report a healthy row count. Only the age of the
            newest partition measures what a reader actually experiences, independent of whether
            the task that should have refreshed it ran at all.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: a log record as fields, not a sentence',
      body: (
        <>
          A structured record carries the same fields every time: a run, a task, an asset, a
          partition. A sentence does not.
        </>
      ),
      duration: 4.8,
      fig: 'a record with fields, not a sentence to parse.',
      Visual: S.RevealStructuredFields,
    },
    {
      title: 'Reveal: what a hundred-task pipeline costs without it',
      body: (
        <>
          Three hundred log lines from four interleaved runs. One correlation-key query returns
          exactly the ninety-three that belong to this run — nothing else to read.
        </>
      ),
      duration: 4.8,
      fig: 'three hundred lines, four runs tangled. One key, ninety-three back.',
      takeaway: 'A correlation key turns a grep through everyone’s logs into a query for one run’s own.',
      Visual: S.RevealCorrelationCost,
    },
    {
      title: 'Reveal: counter',
      body: (
        <>
          Rows processed only grows while the process runs, and resets only when it restarts. That
          is a counter's whole contract.
        </>
      ),
      duration: 4.0,
      fig: 'only up, until a restart. A counter’s whole contract.',
      Visual: S.RevealCounter,
    },
    {
      title: 'Reveal: gauge',
      body: (
        <>
          Queue depth drains, a last-success timestamp jumps. Force a fall through a counter's
          increment-only update and the real depth of seventy is lost: the honest answer a counter
          can give is a reset to zero.
        </>
      ),
      duration: 4.8,
      fig: 'a real depth of seventy. A counter can only answer zero.',
      Visual: S.RevealGauge,
    },
    {
      title: 'Reveal: histogram',
      body: (
        <>
          Task duration is a distribution: a histogram buckets it and keeps a running sum. A
          quantile read off those buckets is an estimate, not an exact value — and averaging
          separate instances' quantiles is not valid arithmetic.
        </>
      ),
      duration: 4.8,
      fig: 'buckets and a sum. A quantile from them is an estimate.',
      takeaway: 'A histogram’s quantile is an estimate from buckets; averaging two instances’ quantiles is not a valid operation.',
      Visual: S.RevealHistogram,
    },
    {
      title: 'Reveal: the six golden signals',
      body: (
        <>
          Throughput, latency and error rate carry over directly. Consumer lag, freshness and
          backlog are the pipeline's own: the stale night's partition sat six hundred twenty
          minutes old against a ninety minute limit, while every task bar stayed green the whole
          time.
        </>
      ),
      duration: 5.4,
      fig: 'six hundred twenty minutes old. Every task bar still green.',
      takeaway: 'Freshness is the one signal with no request-and-response analogue, and it is the one that would have paged you.',
      Visual: S.RevealGoldenSignals,
    },
    {
      title: 'Reveal: push vs pull',
      body: (
        <>
          A scraper sampling every fifteen seconds never catches a job that starts and finishes in
          four. Pushing the value in works — but a Pushgateway never forgets it: the same number
          still reports back days later, until someone deletes it.
        </>
      ),
      duration: 4.8,
      fig: 'a four second job, a fifteen second scrape. Push it, or miss it.',
      takeaway: 'A pushed value never expires on its own — it keeps answering after the job is gone.',
      Visual: S.RevealPushPull,
    },
    {
      title: 'Lab beat: the series-explosion extension',
      body: (
        <>
          Add one per-customer label to that same counter. At ten thousand customers it is ten
          thousand separate time series where there was one.
        </>
      ),
      duration: 4.4,
      fig: 'one series. Ten thousand customers later, ten thousand series.',
      Visual: S.RevealCardinality,
    },
    {
      title: 'Recap',
      body: (
        <>
          A record's own fields and key; the right metric for the right question; six signals, one
          with no service analogue; push or pull, and what each loses.
        </>
      ),
      duration: 4.8,
      fig: 'fields and a key. The right metric. Six signals. Push or pull.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new pipeline stage has no instrumentation yet. It runs on a schedule shorter than any
          scrape interval, and it writes to a table three other jobs read from.
        </>
      ),
      duration: 3.4,
      fig: 'no instrumentation yet. Which signal catches a stale write first?',
      predict: {
        options: [
          { label: 'Instrument throughput and error rate; that already covers it' },
          { label: 'Add a freshness gauge pushed at the end of each run, on top of throughput and error rate', correct: true },
        ],
        explain: (
          <>
            Throughput and error rate tell you the job ran and didn't crash — exactly the "every
            task green" picture from the hook. Freshness is the signal that tells you whether what
            it wrote is actually new, and because the job is shorter than any scrape interval, it
            has to be pushed, not pulled.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
