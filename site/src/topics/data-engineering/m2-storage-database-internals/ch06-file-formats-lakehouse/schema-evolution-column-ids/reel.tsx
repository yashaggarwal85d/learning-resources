import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against Iceberg's own spec (columns selected by field ID, never
// by name or position; a rename changes the name but never the field ID; the worked
// rename-plus-reorder projection example; the default-value rules for an added field) and
// Delta's own column-mapping docs (column mapping lets the logical name and the underlying
// Parquet file's physical column name differ, enabling RENAME COLUMN without rewriting the
// file; the name/id mode split) — and against a real rename-plus-reorder reproduced twice on a
// real local file: once read by position (the same corruption topic 3 showed for plain
// Parquet) and once read by field ID (Iceberg's real fix), plus a real Delta-style rename
// performed with and without column mapping, verified by comparing the data file's own bytes.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A deletion vector works because a row's identity survives fine inside one data file.
          This topic is what happens when a whole column needs to survive a rename or reorder at
          the table level — exactly the problem topic 3 raised for Parquet alone, now solved by
          Iceberg's field IDs and Delta's column mapping.
        </>
      ),
      duration: 4.8,
      fig: "a row's identity survives inside one file -- this topic is a column's identity, across the whole table.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: a column is renamed and a new one is inserted — what happens if a reader still matches by position?',
      body: (
        <>
          A table's schema renames a column and inserts a new one before it. If a reader still
          matches columns by their position in the file, what happens to the data?
        </>
      ),
      duration: 4.8,
      fig: 'a column renamed, a new one inserted before it -- does position-based matching still work?',
      predict: {
        options: [
          { label: 'Nothing — the data reads back correctly' },
          { label: 'Every column after the insert silently reads the wrong data', correct: true },
        ],
        explain: (
          <>
            This is topic 3's own corruption again, now at the table level: an inserted column
            shifts every later column's real value into the wrong logical slot.
          </>
        ),
      },
      Visual: S.PredictPositionCorrupts,
    },
    {
      title: 'Reveal: reproduced for real — position-based matching corrupts the table',
      body: (
        <>
          A real on-disk table, renamed and reordered exactly as topic 3 did for Parquet, read by
          position: the inserted column silently takes the next column's real value, and every
          later column shifts one slot wrong. Position-based matching corrupts a table the moment
          a column is inserted anywhere but the end.
        </>
      ),
      duration: 4.8,
      fig: 'a real file, read by position after a rename and an insert -- every later column shifts wrong.',
      Visual: S.RevealPositionCorruptsForReal,
    },
    {
      title: "Reveal: Iceberg's real fix — columns are selected by field ID",
      body: (
        <>
          Iceberg's own spec: "Columns in Iceberg data files are selected by field id... Renaming
          an existing field must change the name, but not the field ID."
        </>
      ),
      duration: 4.8,
      fig: 'a field ID is assigned once and never reused -- a rename changes the name, never the ID.',
      takeaway: 'A field ID is assigned once, never reused, and a rename can never touch it.',
      Visual: S.RevealFieldIdsAreTheFix,
    },
    {
      title: 'Reveal: reproduced for real — field-ID projection survives the identical rename and insert',
      body: (
        <>
          The same real file, read by field ID this time: the renamed column still resolves to
          its real data, and the genuinely new column correctly reads back missing.
        </>
      ),
      duration: 4.8,
      fig: 'the same real file, read by field ID -- the rename survives, the new column reads missing.',
      takeaway: "A field ID doesn't care what a column is called or where it sits — only what it always was.",
      Visual: S.RevealFieldIdProjectionSurvives,
    },
    {
      title: "Predict: Delta's files use real column names — how does it rename without rewriting the file?",
      body: (
        <>
          Delta's data files use real Parquet column names, not field IDs. How does Delta rename
          a column without rewriting the file?
        </>
      ),
      duration: 4.8,
      fig: "Delta's files use real column names -- always rewrite on rename, or keep a stable name in metadata?",
      predict: {
        options: [
          { label: 'It always rewrites the Parquet file to the new name' },
          { label: 'A stable physical name is kept in metadata, separate from the logical name', correct: true },
        ],
        explain: (
          <>
            Delta's column mapping is the same idea as Iceberg's field ID, aimed at a real Parquet
            file instead of a field-ID-tagged one.
          </>
        ),
      },
      Visual: S.PredictDeltaRenameMechanism,
    },
    {
      title: 'Reveal: without column mapping, a rename really does rewrite the file',
      body: (
        <>
          Reproduced for real: with the physical column name equal to the logical name, renaming
          a column really does rewrite the data file — measured directly on disk, byte for byte.
        </>
      ),
      duration: 4.8,
      fig: 'without column mapping, the physical name IS the logical name -- a rename rewrites the file for real.',
      Visual: S.RevealNoMappingRewrites,
    },
    {
      title: 'Reveal: reproduced for real — column mapping renames without touching the data file',
      body: (
        <>
          Delta's own docs: column mapping "enables Delta schema evolution operations such as
          RENAME COLUMN and DROP COLUMNS on a Delta table without the need to rewrite the
          underlying Parquet files." Measured for real: the file's bytes stay identical.
        </>
      ),
      duration: 4.8,
      fig: 'with column mapping, the rename only touches metadata -- the data file comes back byte-for-byte identical.',
      takeaway: 'A stable physical name turns a rename into a metadata edit instead of a file rewrite.',
      Visual: S.RevealMappingAvoidsRewrite,
    },
    {
      title: 'Reveal: the same stable-ID idea also makes three more moves safe',
      body: (
        <>
          Iceberg's own default-value rules for an added field — "The initial-default must be set
          when a field is added and cannot change... The write-default... may change" — show why
          adding a column, widening a type, and evolving a nested struct are all safe the same
          way.
        </>
      ),
      duration: 4.8,
      fig: 'the same stable ID that survives a rename also makes adding, widening, and nested structs safe.',
      Visual: S.RevealThreeMoreMovesSafe,
    },
    {
      title: 'Recap',
      body: (
        <>
          A stable ID — Iceberg's field ID, Delta's physical column name — is what makes rename,
          reorder, add, widen and nested-struct evolution all safe. Name- or position-based
          matching is the real failure mode underneath every one of them.
        </>
      ),
      duration: 4.8,
      fig: 'a stable ID is what lets a column survive a rename, a reorder, or a widened type.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
