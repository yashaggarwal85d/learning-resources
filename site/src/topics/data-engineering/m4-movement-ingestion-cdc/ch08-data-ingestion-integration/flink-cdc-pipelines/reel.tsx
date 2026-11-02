import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No runnable system for this topic — CHAPTER.md's own "Lab" line names it as sourced-only
// without a running Flink cluster, with the lock-free chunked read already reproduced by an
// earlier topic's own measured implementation. Every claim here traces directly to Flink CDC's
// own current documentation (SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A team runs Debezium, Kafka and a sink connector to copy one MySQL database into
          Iceberg, and spends more time on the middle than on the data.
        </>
      ),
      duration: 4.8,
      fig: 'a team runs Debezium, Kafka and a sink connector to copy one MySQL database into Iceberg, and spends more time on the middle than on the data.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does the snapshot stay lock-free',
      body: (
        <>
          Skipping Kafka and a broker entirely. Does that also mean giving up the lock-free,
          parallel snapshot read, or is that part independent of Kafka?
        </>
      ),
      duration: 2.8,
      fig: 'skipping Kafka and a broker entirely. Does that also mean giving up the lock-free, parallel snapshot read, or is that part independent of Kafka?',
      predict: {
        options: [
          { label: "Giving up Kafka also gives up the lock-free parallel read" },
          {
            label: "Independent — the lock-free parallel read lives in the source, not in whatever sits downstream of it",
            correct: true,
          },
        ],
        explain: (
          <>
            The parallel, lock-free snapshot is a property of how the source itself reads the
            database. Whether the records then go to a broker or straight to a sink never
            changes how that read happens.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the parallel lock-free snapshot',
      body: (
        <>
          The source reads a snapshot in parallel, checkpoints at chunk granularity, and needs
          no global read lock before reading — the same watermark idea from earlier in this
          chapter, generalized to parallel readers.
        </>
      ),
      duration: 4.8,
      fig: "the source reads a snapshot in parallel, checkpoints at chunk granularity, and needs no global read lock before reading — the same watermark idea, generalized to parallel readers.",
      Visual: S.RevealParallelSnapshot,
    },
    {
      title: "Reveal: PostgreSQL's own version is experimental",
      body: (
        <>
          For PostgreSQL, this same incremental snapshot reading is marked experimental and off
          by default — unlike MySQL, where it's already the standard path.
        </>
      ),
      duration: 4.8,
      fig: "for PostgreSQL, this same incremental snapshot reading is marked experimental and off by default — unlike MySQL, where it's already the standard path.",
      takeaway: 'The same source family can mature at two different speeds inside the exact same release.',
      Visual: S.RevealPostgresExperimental,
    },
    {
      title: 'Reveal: the log read straight into Flink',
      body: (
        <>
          The source embeds the connector engine directly inside a Flink source operator,
          reading the log in the job's own parallel readers, with Flink's own checkpoints
          holding the position.
        </>
      ),
      duration: 4.8,
      fig: "the source embeds the connector engine directly inside a Flink source operator, reading the log in the job's own parallel readers, with Flink's own checkpoints holding the position.",
      Visual: S.RevealEmbeddedBinlog,
    },
    {
      title: 'Reveal: one YAML file, several possible sinks',
      body: (
        <>
          A source, sink and pipeline block in one YAML file, submitted to a cluster, can write
          to a lakehouse, a warehouse, a search index or several other sinks directly.
        </>
      ),
      duration: 4.8,
      fig: 'a source, sink and pipeline block in one YAML file, submitted to a cluster, can write to a lakehouse, a warehouse, a search index or several other sinks directly.',
      Visual: S.RevealYamlPipeline,
    },
    {
      title: 'Reveal: schema changes, declared not coded',
      body: (
        <>
          Schema changes are handled by one of five named modes, chosen declaratively, rather
          than the manual column-by-column handling an earlier topic measured by hand.
        </>
      ),
      duration: 4.8,
      fig: 'schema changes are handled by one of five named modes, chosen declaratively, rather than the manual column-by-column handling an earlier topic measured by hand.',
      Visual: S.RevealSchemaModes,
    },
    {
      title: 'Reveal: what this path gives up',
      body: (
        <>
          Fewer moving parts, no broker to run — but no shared durable log either. A second
          consumer, a replay, or a different sink later means reading the source again.
        </>
      ),
      duration: 4.8,
      fig: 'fewer moving parts, no broker to run — but no shared durable log either. A second consumer, a replay, or a different sink later means reading the source again.',
      takeaway: 'Removing the middle also removes whatever else was going to read from it.',
      Visual: S.RevealWhatItGivesUp,
    },
    {
      title: 'Recap',
      body: (
        <>
          A lock-free parallel snapshot, a log read straight into Flink, one YAML file for the
          whole path, declarative schema handling — and no shared log for anyone else.
        </>
      ),
      duration: 4.8,
      fig: 'a lock-free parallel snapshot, a log read straight into Flink, one YAML file for the whole path, declarative schema handling — and no shared log for anyone else.',
      takeaway: 'This path trades a shared log for simplicity, not the other way around.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team wants two different sinks, a lakehouse and a search index, from the same
          source table. Under Flink CDC, what does adding the second sink actually require?
        </>
      ),
      duration: 2.8,
      fig: 'a team wants two different sinks, a lakehouse and a search index, from the same source table. Under Flink CDC, what does adding the second sink actually require?',
      predict: {
        options: [
          { label: 'Adding a second sink block to the same running pipeline, nothing more' },
          {
            label: 'A second job reading the source database again — another slot, another load, since nothing durable sits between the source and the first sink',
            correct: true,
          },
        ],
        explain: (
          <>
            There is no durable log in the middle to add a second reader to. Every consumer of
            this source needs its own read of the source itself, which is exactly the tradeoff
            this topic opened with.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
