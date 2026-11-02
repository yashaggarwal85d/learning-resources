import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg table spec's own row lineage
// section (a table-level next-row-id counter; _row_id assigned once via inheritance;
// _last_updated_sequence_number reset only when a row is modified, carried forward
// otherwise), the Iceberg Spark queries docs' own incremental-read section (start-snapshot-id
// exclusive, end-snapshot-id inclusive, appends only -- cannot support replace, overwrite or
// delete operations), the Iceberg Spark procedures docs' own create_changelog_view section
// (INSERT/DELETE/UPDATE_BEFORE/UPDATE_AFTER; carry-over rows from a copy-on-write rewrite
// removed by default), Databricks' own Change Data Feed docs (insert/update_preimage/
// update_postimage/delete; forward-looking only from when it was enabled), and Apache Hudi's
// own SQL queries docs (the hudi_table_changes function's cdc vs. latest_state modes; latest_state
// amortizes the cost of compactions) -- and against a real row-lineage model implementing the
// v3 spec directly, a real copy-on-write update, and a real copy-on-write compaction, each
// measured by a real naive file-diff scan against a real row-identity-aware scan.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A well-laid-out table of snapshots is still just a sequence of point-in-time states.
          This topic reads that sequence itself as data: what actually changed between two of
          them.
        </>
      ),
      duration: 4.8,
      fig: 'a table of snapshots is still a sequence of states -- this topic reads the sequence as data.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: a compaction merges two files, touching no row — zero changes, or a pile of deletes and inserts?',
      body: (
        <>
          A compaction merges two files into one. It touches no row's value — it only moves
          rows to a new file. Does a changelog scan of that commit report zero changes, or a
          pile of deletes and inserts?
        </>
      ),
      duration: 4.8,
      fig: 'a compaction merges two files, touching no value -- zero changes, or deletes and inserts?',
      predict: {
        options: [
          { label: 'Zero — nothing actually changed' },
          { label: 'A pile of deletes and inserts', correct: true },
        ],
        explain: (
          <>
            A scan with no way to tell "moved" from "changed" sees every row in a rewritten
            file as gone from its old file and new in the new one.
          </>
        ),
      },
      Visual: S.PredictCompactionZeroOrSpurious,
    },
    {
      title: 'Reveal: reproduced for real — a stable row identity and a sequence number that only moves on change',
      body: (
        <>
          The real mechanism: every row gets a `_row_id`, a stable identifier assigned once.
          Its `_last_updated_sequence_number` only moves forward when the row's value actually
          changes — untouched rows keep their old number through any rewrite.
        </>
      ),
      duration: 4.8,
      fig: 'a stable _row_id, assigned once -- a sequence number that only moves on a real change.',
      Visual: S.RevealRowLineageFields,
    },
    {
      title: 'Reveal: reproduced for real — a naive changelog scan on a real copy-on-write update',
      body: (
        <>
          A ten-row file, one real value change. A copy-on-write update rewrites the whole
          file. A naive scan that only compares which files exist before and after: 10 deletes,
          10 inserts — for one real change.
        </>
      ),
      duration: 4.8,
      fig: 'one real change, a whole file rewritten -- a naive scan reports 10 deletes and 10 inserts.',
      Visual: S.RevealNaiveScanOnUpdate,
    },
    {
      title: 'Reveal: reproduced for real — the same update, scanned by matching row identity instead of file',
      body: (
        <>
          The same update, scanned by matching `_row_id` across the whole snapshot instead of
          by file: exactly one real change found. The other nine rows carried over unmodified,
          and are filtered out.
        </>
      ),
      duration: 4.8,
      fig: 'matched by _row_id instead of by file -- exactly 1 real change found, the rest filtered.',
      takeaway: 'Row identity turns a file diff into a true record of what actually changed.',
      Visual: S.RevealLineageScanOnUpdate,
    },
    {
      title: 'Predict: scale it up — the same naive scan on a real compaction of two ten-row files',
      body: (
        <>
          Now scale it up: two ten-row files compact into one, changing zero values. Run the
          same naive, file-diffing scan on that commit. How many changes does it report?
        </>
      ),
      duration: 4.8,
      fig: 'two ten-row files compact into one, zero values change -- how many changes does the naive scan report?',
      predict: {
        options: [
          { label: 'Still a small number, like before' },
          { label: 'Every row in both files, doubled', correct: true },
        ],
        explain: (
          <>
            The naive scan has no way to recognize a row that only moved — it treats the
            entire old file as deleted and the entire new file as inserted.
          </>
        ),
      },
      Visual: S.PredictCompactionScaleUp,
    },
    {
      title: 'Reveal: reproduced for real — compaction, measured by both scans',
      body: (
        <>
          Measured for real: the naive scan reports 40 changes for a commit that changed zero
          values. The row-lineage scan reports 0 — it recognizes every row as a carry-over, the
          same filtering Iceberg's own changelog procedure does by default.
        </>
      ),
      duration: 4.8,
      fig: 'measured for real: naive scan reports 40 changes; the row-lineage scan reports 0.',
      takeaway: "A compacted file's rows all look changed to a scan with no row identity.",
      Visual: S.RevealCompactionMeasured,
    },
    {
      title: "Reveal: Delta's and Hudi's own words — the same idea, their own vocabulary",
      body: (
        <>
          Delta's Change Data Feed tags rows insert, update_preimage, update_postimage, or
          delete, forward-looking only from when it was enabled. Hudi's `hudi_table_changes`
          offers a `cdc` mode with full before/after images, and a cheaper `latest_state` mode
          that already amortizes the cost of compactions.
        </>
      ),
      duration: 4.8,
      fig: "Delta tags insert/preimage/postimage/delete; Hudi offers a cdc mode and a cheaper latest_state mode.",
      takeaway: 'Three formats, one idea: a stable row identity or a windowed diff of real changes.',
      Visual: S.RevealDeltaHudiSameIdea,
    },
    {
      title: "Reveal: reproduced for real — Iceberg's own plain incremental scan, appends only",
      body: (
        <>
          Iceberg's own plain incremental scan, measured: start snapshot exclusive, end
          snapshot inclusive, reading only the rows appended in that range — and raising
          outright the moment a compaction or any non-append snapshot falls inside it.
        </>
      ),
      duration: 4.8,
      fig: 'start exclusive, end inclusive, appends only -- raises outright on a compaction in range.',
      Visual: S.RevealIncrementalScanAppendOnly,
    },
    {
      title: 'Recap',
      body: (
        <>
          A stable row identity tells a rewrite from a real change. A naive, file-diffing scan
          reports every rewritten row as changed. Delta and Hudi name the same idea in their
          own vocabulary. Downstream CDC needs row identity, not just a before-and-after diff.
        </>
      ),
      duration: 4.8,
      fig: 'downstream CDC needs row identity, not just a before-and-after diff of files.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
