import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Auto Loader's two discovery modes, its RocksDB-backed checkpoint, its four schema-evolution
// modes, and the rescued-data column — sourced from Databricks' own current documentation and
// reproduced locally as a plain-Python simulation of the documented rules (no real Databricks
// workspace runs in this sandbox, disclosed in OUTLINE.md/examples.py).
const reel: Reel = {
  steps: [
    {
      title: "A new column shows up overnight, and nothing breaks",
      body: (
        <>
          A partner's feed adds a column overnight. A naive ingestion job either crashes in the
          middle of the night or silently drops the new field forever. A stream configured to evolve its schema
          just picks the column up on the next batch.
        </>
      ),
      duration: 4.4,
      Visual: S.NewColumnOvernight,
    },
    {
      title: "What does a restarted stream need to avoid re-ingesting a file?",
      body: (
        <>
          Before the mechanism: a stream crashes, restarts, and sees the same file listing again.
          What has to be true for it to not process that file a second time?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: "It needs to remember every file it has already ingested, durably" , correct: true },
          { label: 'It needs to process files in a strict, guaranteed order' },
          { label: 'It needs the source files to be deleted immediately after ingestion' },
          { label: 'It needs to re-read the entire table and deduplicate afterward' },
        ],
        explain: (
          <>
            A durable memory of what's already been ingested. That's exactly what Auto Loader's
            checkpoint is: a RocksDB-backed set of seen file keys, persisted at the checkpoint
            location, checked before anything is processed.
          </>
        ),
      },
      Visual: S.PredictCheckpoint,
    },
    {
      title: 'Two ways to notice a new file landed',
      body: (
        <>
          Directory listing sweeps the whole prefix every trigger — simple, but its cost scales
          with files ingested, not directories scanned. File notification subscribes to cloud
          storage events directly — Databricks' own recommended default for most workloads.
        </>
      ),
      duration: 4.8,
      Visual: S.TwoDiscoveryModes,
    },
    {
      title: 'The same file, listed twice, ingested once',
      body: (
        <>
          A stream restarts. The same batch comes back, plus one genuinely new file. The
          checkpoint rejects every file it's already marked seen and lets only the new one
          through — reproduced for real against a local checkpoint.
        </>
      ),
      duration: 4.6,
      Visual: S.RestartReplaySafe,
      takeaway: "A checkpointed seen-file set is what makes a replayed file safe to see twice but ingest once.",
    },
    {
      title: 'Four modes, four different reactions to a new column',
      body: (
        <>
          addNewColumns fails once, then resumes with the wider schema. rescue never fails and
          never evolves — it just routes the new field elsewhere. failOnNewColumns fails and
          stays failed until someone intervenes.
        </>
      ),
      duration: 5.0,
      Visual: S.FourSchemaModes,
    },
    {
      title: "Nothing gets silently dropped — it goes to one place",
      body: (
        <>
          In rescue mode, the unexpected field doesn't vanish. It lands in the rescued-data
          column as a JSON blob, next to the source file path — recoverable later, not lost.
        </>
      ),
      duration: 4.4,
      Visual: S.RescuedColumnReal,
      takeaway: "The rescued-data column means an unexpected field is captured, not silently dropped.",
    },
    {
      title: "A lighter answer for the simpler case",
      body: (
        <>
          COPY INTO is retryable and idempotent at the file level too — already-loaded files are
          skipped, even if modified since. It's the right-sized tool for a periodic batch load,
          not an always-on stream.
        </>
      ),
      duration: 4.4,
      Visual: S.CopyIntoAlternative,
      takeaway: "COPY INTO's file-level idempotency fits a periodic batch load; Auto Loader's checkpoint fits an always-on stream.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          Two discovery modes with real cost differences. A checkpoint that makes a replayed file
          safe. Four schema-evolution modes that handle a surprise column in four different ways.
          And COPY INTO as the lighter-weight idempotent alternative.
        </>
      ),
      duration: 4.0,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pipeline runs once a day, on a stable schema, loading a known batch of files from a
          fixed location. Does it need Auto Loader's always-on streaming discovery, or does
          COPY INTO's lighter idempotency cover it?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Auto Loader — any file ingestion should default to streaming discovery" },
          { label: "COPY INTO — a periodic, stable-schema batch load doesn't need an always-on stream", correct: true },
        ],
        explain: (
          <>
            COPY INTO. A once-a-day, stable-schema batch load is exactly the shape Auto Loader's
            always-on discovery and schema-evolution machinery weren't built to be necessary for —
            COPY INTO's own file-level idempotency already covers it, more simply.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
