import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: the trace id surviving a Kafka hop
// unchanged; five producer contexts collapsing to one under a parent field versus all five
// surviving as links; one million messages against a default link limit of one hundred
// twenty-eight, dropping the rest; a trace id surviving three hops automatically and lost at
// exactly the fourth without an explicit pass; and two event shapes sharing only a run id.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          One order is wrong in the warehouse. It crossed a database change, a Kafka topic, and a
          Spark aggregate — three systems, each logging perfectly on its own.
        </>
      ),
      duration: 4.8,
      fig: 'three systems. Each logs perfectly. None sees the others.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: how do you find the one hop that broke it?',
      body: (
        <>
          How do you find the one hop where it went wrong, without grepping three separate
          clusters by order id?
        </>
      ),
      duration: 3.2,
      fig: 'three clusters. One query, not three greps. How?',
      predict: {
        options: [
          { label: 'A single parent-child chain across all three systems' },
          { label: "A shared order id, the same idea as this chapter's own correlation key" },
          { label: 'Links connecting each hop to where its data actually came from', correct: true },
        ],
        explain: (
          <>
            A parent-child chain can't work here: a span has exactly one parent, and a batch
            aggregate reading many Kafka records has many producers behind it, not one. A shared
            id alone still means three separately-indexed systems to search. Links are the one
            structure built to survive a single parent limit, a batch fan-in, and a step that's
            already inside another span — all three at once.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: "Reveal: OTel's signals and the Collector",
      body: (
        <>
          Traces, metrics, logs and baggage, all exported once through a Collector that receives,
          processes and routes to wherever they need to go.
        </>
      ),
      duration: 4.4,
      fig: 'one export. The Collector decides where it goes.',
      Visual: S.RevealSignalsCollector,
    },
    {
      title: 'Reveal: the traceparent header',
      body: (
        <>
          A fixed, four-part string — carried in the Kafka record's own headers, because nothing
          like an HTTP request crosses that hop to carry it automatically.
        </>
      ),
      duration: 4.8,
      fig: 'injected at produce. Extracted at consume. Unchanged.',
      Visual: S.RevealTraceparent,
    },
    {
      title: 'Reveal: why links, not parent-child, for a batch receive',
      body: (
        <>
          Force five producer contexts through a single parent field and only the last one
          survives. Hold them as links instead and all five do.
        </>
      ),
      duration: 4.8,
      fig: 'five producers, one parent field. Only the last survives.',
      Visual: S.RevealLinksNotParent,
    },
    {
      title: 'Reveal: the link limit, and what it costs',
      body: (
        <>
          A million messages in one nightly batch, against a default cap of one hundred
          twenty-eight links. Almost all of them are dropped from the trace, by design.
        </>
      ),
      duration: 4.8,
      fig: 'a million messages. One hundred twenty-eight links kept.',
      takeaway: 'A span’s own link limit is real: a huge batch keeps a sample of its producers, not all of them.',
      Visual: S.RevealLinkLimit,
    },
    {
      title: 'Reveal: semantic conventions',
      body: (
        <>
          The same attribute names for a destination and a partition, whether the span came from
          Kafka or from a database — one vocabulary, not two.
        </>
      ),
      duration: 4.0,
      fig: 'one vocabulary. A Kafka span and a database span, queried alike.',
      Visual: S.RevealSemanticConventions,
    },
    {
      title: 'Reveal: the honest break — CDC to warehouse',
      body: (
        <>
          The trace survives automatically across three hops. At the database write itself, the
          one place the documentation names directly, it only survives if the application passes
          it on purpose.
        </>
      ),
      duration: 5.0,
      fig: 'three hops automatic. One hop, only if you pass it.',
      takeaway: 'The database write is the one seam that is not automatic — skip it, and the trace id is gone.',
      Visual: S.RevealCdcBreak,
    },
    {
      title: 'Reveal: OTel vs OpenLineage',
      body: (
        <>
          One answers what happened to this execution and how long it took. The other, which
          datasets a job actually read and wrote this run. They share a run id, nothing else.
        </>
      ),
      duration: 4.8,
      fig: 'two questions, two shapes. A run id is all they share.',
      takeaway: 'OpenTelemetry and OpenLineage are not the same idea twice: one is execution, one is lineage.',
      Visual: S.RevealOtelVsOpenLineage,
    },
    {
      title: 'Recap',
      body: (
        <>
          A header crossing a hop nothing else carries it across; links where a single parent
          can't exist; one real seam, named honestly; two standards, two separate questions.
        </>
      ),
      duration: 4.8,
      fig: 'a header, a link, one honest seam, two standards.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A nightly Spark job reads a million Kafka records in one batch and writes a single row.
          The consumer span's links are capped at one hundred twenty-eight.
        </>
      ),
      duration: 3.4,
      fig: 'a million in, one row out. The trace shows one hundred twenty-eight links.',
      predict: {
        options: [
          { label: "The data for the other producers is wrong, since their link wasn't kept" },
          { label: "The data is unaffected; only the trace's own record of those producers is incomplete", correct: true },
        ],
        explain: (
          <>
            The link limit is a tracing-SDK setting, not a data-processing one — dropping a link
            only means the trace can't point back to that one producer's context. The aggregate
            itself still reads and folds in every record; what's missing afterward is visibility
            into where most of them came from, not the data.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
