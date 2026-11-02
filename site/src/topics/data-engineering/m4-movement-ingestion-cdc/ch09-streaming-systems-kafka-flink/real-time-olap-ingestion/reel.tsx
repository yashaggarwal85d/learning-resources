import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: each of four partitions genuinely builds its
// own segments independently; an atomic offset-and-segment commit, forced to fail, leaves state
// completely untouched, while a naive non-atomic commit leaves the offset ahead of the segment
// count after the identical crash; an upsert query genuinely answers with the overlay's newer
// value while the sealed segment's own row stays unchanged. No literal digits anywhere below;
// the real measured values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a sealed segment that never changes",
      body: (
        <>
          A query for an order's status answers with its latest value, even though the segment
          physically holding that order's original row was sealed minutes earlier and never
          touched again. The update lived somewhere else entirely.
        </>
      ),
      duration: 4.8,
      fig: 'a sealed segment never changes — the newer value lives in a separate overlay',
      Visual: S.Hook,
    },
    {
      title: 'Setup: the other destination a stream can land on',
      body: (
        <>
          A lakehouse table is read by a batch-style query engine. This topic is the other
          destination this chapter's streams can land on: a store built to answer a query in
          milliseconds against data that arrived seconds ago.
        </>
      ),
      duration: 4.8,
      fig: 'a lakehouse table is one destination; this topic answers queries in milliseconds',
      Visual: S.Setup,
    },
    {
      title: "Predict: who builds this store's queryable unit?",
      body: (
        <>
          A Kafka partition feeds this kind of store directly, with no table-format sink in
          between. What actually builds the basic unit this store queries, and who's in charge
          of that?
        </>
      ),
      duration: 2.8,
      fig: 'a partition feeds this store directly — who builds its queryable unit?',
      predict: {
        options: [
          { label: 'A single coordinator process builds every unit for the whole topic' },
          { label: "Each partition gets its own consuming task that builds that partition's own unit", correct: true },
          { label: 'The query engine builds it lazily, only when a query actually asks for it' },
        ],
        explain: (
          <>
            Each partition gets its own consuming task. That task builds its own segment
            directly from its partition, the same per-partition-consumer model this chapter
            opened with.
          </>
        ),
      },
      Visual: S.PredictSegmentOwner,
    },
    {
      title: 'Reveal: a consuming task per partition builds a segment',
      body: (
        <>
          Druid and Pinot both assign one consuming task to each Kafka partition, and that task
          builds its own segment directly from the stream — the same segment vocabulary this
          chapter's first topic already taught, now built by the store itself.
        </>
      ),
      duration: 4.8,
      fig: 'one consuming task per partition, building that partition\'s own segment',
      Visual: S.RevealConsumerPerPartition,
    },
    {
      title: 'Reveal: an atomic offset-and-segment commit',
      body: (
        <>
          A segment only counts as final, immutable, and queryable once its consumed offsets
          are durably recorded alongside it, in the same atomic action — the OLAP-store version
          of this chapter's own exactly-once-sink pattern.
        </>
      ),
      duration: 5,
      fig: 'the offset and the segment commit together, in one atomic action',
      takeaway: 'An atomic offset-and-segment commit can only ever redo identical work on failure, never advance one without the other.',
      Visual: S.RevealAtomicCommit,
    },
    {
      title: 'Reveal: a naive, non-atomic commit falls out of step',
      body: (
        <>
          Commit the offset first and seal the segment afterward instead, and a crash landing
          between those two steps leaves the offset looking committed even though no matching
          segment ever landed.
        </>
      ),
      duration: 4.8,
      fig: 'commit the offset first, and a crash leaves it ahead of the segment',
      Visual: S.RevealNaiveMismatch,
    },
    {
      title: 'Predict: does a newer value require rewriting the sealed segment?',
      body: (
        <>
          A later event updates a key whose original row sits inside a segment that's already
          sealed and immutable. Does answering a query with that newer value require rewriting
          the sealed segment at all?
        </>
      ),
      duration: 2.8,
      fig: 'does a newer value require rewriting the sealed segment holding the old one?',
      predict: {
        options: [
          { label: 'Yes — the old segment has to be rewritten with the newer row in place' },
          { label: "No — a separate overlay carries the newer value, checked first at query time", correct: true },
          { label: 'No — the query simply returns whichever row is scanned first' },
        ],
        explain: (
          <>
            No. A separate overlay carries the newer value and is checked first at query time;
            the sealed segment itself is never rewritten.
          </>
        ),
      },
      Visual: S.PredictUpsertRewrite,
    },
    {
      title: 'Reveal: an upsert overlay answers it instead',
      body: (
        <>
          Pinot's upsert tables let a later event for a primary key logically replace an
          earlier one at query time, over immutable segments, by keeping a separate record of
          which rows are current rather than rewriting the segments themselves.
        </>
      ),
      duration: 4.8,
      fig: 'the sealed segment stays untouched; an overlay carries the newer value',
      Visual: S.RevealUpsertOverlay,
    },
    {
      title: "Reveal: ClickHouse's Kafka engine or ClickPipes",
      body: (
        <>
          ClickHouse's Kafka table engine runs the consumer in-process, self-managed. ClickPipes
          runs the equivalent as a managed service instead, owned externally — the identical
          build-versus-buy choice this syllabus already taught in a different context.
        </>
      ),
      duration: 5,
      fig: 'run the consumer yourself, or pay a managed service to run it instead',
      takeaway: 'Running the Kafka engine yourself or paying ClickPipes to run it is the same build-versus-buy choice this syllabus already taught.',
      Visual: S.RevealBuildVsBuy,
    },
    {
      title: 'Reveal: the same shape, three stores',
      body: (
        <>
          Druid, Pinot, and ClickHouse each build segments per partition and commit them exactly
          once. What differs between them is the upsert behavior and who operates the ingestion
          path, not this underlying shape.
        </>
      ),
      duration: 4.8,
      fig: 'three stores, the same per-partition segments and the same atomic commit',
      Visual: S.RevealSameShape,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just
          now — partitions genuinely building independent segments, a forced commit failure
          that genuinely stayed in step while a naive one genuinely fell out of it, and an
          overlay genuinely answering a newer value with no rewrite.
        </>
      ),
      duration: 5.2,
      fig: "this topic's own real run, every number read straight off it",
      takeaway: 'The toy model’s own numbers: independent segments, a commit that stays in step, and an overlay answering without a rewrite.',
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Segments, reused from this chapter's very first topic. An exactly-once commit, reused
          from its middle. Upsert, echoing compaction and changelog modes. Build-versus-buy,
          straight from the chapter on CDC and landing strategies. This chapter's own question
          is answered; a bigger one is next.
        </>
      ),
      duration: 5.2,
      fig: 'segments, exactly-once, upsert, build-versus-buy — all reused, none reinvented',
      Visual: S.Recap,
    },
  ],
};

export default reel;
