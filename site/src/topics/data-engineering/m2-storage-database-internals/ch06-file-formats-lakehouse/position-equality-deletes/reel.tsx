import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against the Apache Iceberg table spec's own row-level-delete
// section (position deletes by file+ordinal vs equality deletes by column value; v3 deprecates
// position delete files in favor of deletion vectors; v4 forbids adding any new equality delete
// file) and Apache Flink's Iceberg connector docs (UPSERT mode producing equality deletes,
// convertEqualityDeletes() requiring v3) -- and against a real Apache Iceberg table built in this
// sandbox with the real pyiceberg library, carrying a real committed position-delete file (read
// back through pyiceberg's own table.scan()) and a real committed equality-delete file (which
// pyiceberg's own scan refuses to read, a disclosed and verified library limitation, merged by
// hand instead).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Hidden partitioning prunes whole files. A single file's own rows still need to be
          deleted without rewriting it — that's what v2's row-level deletes are for.
        </>
      ),
      duration: 4.8,
      fig: "hidden partitioning prunes whole files -- a single file's own rows still need deletes.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: an upsert writer deletes a row it never rewrote — what can it write instead of a position?',
      body: (
        <>
          A streaming upsert writer, like Flink, deletes one row before re-inserting it. It never
          rewrote the data file, so it doesn't know the row's position inside it. What can it
          write instead of a file+position delete?
        </>
      ),
      duration: 4.8,
      fig: "a streaming upsert writer never rewrote the file -- it has no row position to delete by.",
      predict: {
        options: [
          { label: 'It has to rewrite the whole file' },
          { label: 'A delete naming column values instead', correct: true },
        ],
        explain: (
          <>
            That's an equality delete — it names `id = 4` instead of a file and a row position,
            because the writer never had a position to give.
          </>
        ),
      },
      Visual: S.PredictUpsertNoPosition,
    },
    {
      title: 'Reveal: reproduced for real — an equality delete file, naming column values',
      body: (
        <>
          Equality deletes: a delete file naming column values instead of a position — `id = 4`,
          `id = 8` — built and committed for real, against the same table.
        </>
      ),
      duration: 4.8,
      fig: 'equality delete file: id = 4, id = 8 -- matches by value, not by file and position.',
      Visual: S.RevealEqualityDeleteBuilt,
    },
    {
      title: 'Reveal: reproduced for real — a position delete, read back through pyiceberg’s own scan',
      body: (
        <>
          A position delete is built and committed too: a real file-path-and-row-ordinal delete,
          read back correctly through pyiceberg's own `table.scan()`.
        </>
      ),
      duration: 4.8,
      fig: "real measured result: positions 3 and 7 removed, read back through table.scan() itself.",
      takeaway: 'A position delete is read back as a direct offset lookup, nothing else touched.',
      Visual: S.RevealPositionDeleteReadBack,
    },
    {
      title: 'Predict: what does reading an equality delete actually cost, compared to a position delete?',
      body: (
        <>
          Reading a position delete back is a direct offset lookup. What does reading an equality
          delete back actually cost, at read time, compared to that?
        </>
      ),
      duration: 4.8,
      fig: 'a position delete is a direct offset lookup -- what does an equality delete cost to read?',
      predict: {
        options: [
          { label: 'About the same — both are direct lookups' },
          { label: 'Every row’s value has to be compared', correct: true },
        ],
        explain: (
          <>
            An equality delete names a value, not a position — a reader has to check every
            candidate row's own column value against it.
          </>
        ),
      },
      Visual: S.PredictEqualityDeleteCost,
    },
    {
      title: 'Reveal: reproduced for real — the measured join cost of an equality delete',
      body: (
        <>
          Measured: every one of the data file's column values has to be read and compared
          against the delete set — a real join against a predicate, not a lookup.
        </>
      ),
      duration: 4.8,
      fig: "real measured result: every row's value compared -- a position delete touches zero.",
      takeaway: "An equality delete is a join over every row's value; a position delete is not.",
      Visual: S.RevealJoinCostMeasured,
    },
    {
      title: 'Reveal: pyiceberg’s own scan refuses to read this table — a disclosed library gap',
      body: (
        <>
          pyiceberg's own `table.scan()` refuses outright to read a table carrying an
          equality-delete file — a genuine, open limitation in this library, not a construction
          mistake; the merge above was done by hand, the way a conformant v2 reader performs it.
        </>
      ),
      duration: 4.8,
      fig: "pyiceberg's table.scan() refuses to read this table -- the join above was done by hand.",
      Visual: S.RevealScanRefusesEquality,
    },
    {
      title: 'Reveal: v3 deprecates position delete files, replacing them with deletion vectors',
      body: (
        <>
          v3 deprecates position delete files outright, replacing them with the deletion vectors
          this chapter already built — a bitmap, cheaper than either delete-file kind to apply.
        </>
      ),
      duration: 4.8,
      fig: 'v3 deprecates position delete files -- replaced by this chapter’s deletion vectors.',
      Visual: S.RevealV3DeprecatesPosition,
    },
    {
      title: 'Reveal: v4 drafts forbid adding any new equality delete — the measured cost is why',
      body: (
        <>
          v4 drafts go further and forbid adding any new equality delete file at all — the
          read-side join cost measured here is exactly why.
        </>
      ),
      duration: 4.8,
      fig: 'v4 drafts forbid any new equality delete -- the read-side cost measured here is why.',
      takeaway: 'v4 forbids new equality deletes for the exact cost this topic just measured.',
      Visual: S.RevealV4ForbidsEquality,
    },
    {
      title: 'Recap',
      body: (
        <>
          A position delete is a direct offset lookup; an equality delete is a join over every
          row's value. That cost is exactly why v3 moves to deletion vectors and v4 forbids new
          equality deletes.
        </>
      ),
      duration: 4.8,
      fig: 'both delete mechanisms here are v2; next is v3 as a whole.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
