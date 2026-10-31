import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every value shown is computed and asserted in examples.py, which writes a real, spec-compliant
// Parquet file by hand (no pyarrow/fastparquet installed in this sandbox — confirmed again this
// session, and the file was independently verified readable by a temporarily pip-installed
// pyarrow, then that was uninstalled): 941 bytes total, a 551-byte footer starting at offset 382,
// 2 row groups of 2 rows each (4 rows, 5 columns), a dictionary page in row group 0's status
// column and none in row group 1's, page-header type 0 (DATA_PAGE) vs. 3 (DATA_PAGE_V2) read
// directly from the real bytes, and the same 12 written INT96 bytes decoding to the correct
// 12:00:00 UTC instant one way and a wrong instant 7 hours off the other way.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          This is a real Parquet file, 941 bytes, written one struct at a time in this sandbox —
          no library did it.
        </>
      ),
      duration: 4.2,
      fig: 'PAR1 ... row groups, column chunks, pages ... PAR1 — a real file, read back byte by byte.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does the footer come first or last?',
      body: (
        <>
          A reader needs the schema before any row makes sense. Where in this file did the schema
          actually end up?
        </>
      ),
      duration: 3,
      fig: 'the footer holds the schema and every page offset. First in the file, or last?',
      predict: {
        options: [
          { label: 'Last — after every row group' , correct: true },
          { label: 'First — before any data' },
        ],
        explain: (
          <>
            Putting the schema first would mean knowing its exact size before any data is
            written. Writing it last means the file can be produced in a single streaming pass.
          </>
        ),
      },
      Visual: S.PredictFooterOrder,
    },
    {
      title: 'Reveal: the footer is written last',
      body: (
        <>
          Every row group, column chunk and page comes first. The footer — schema, offsets, row
          counts — is appended only once the data is done.
        </>
      ),
      duration: 4.2,
      fig: 'file metadata is written after the data, to allow a single pass write.',
      Visual: S.RevealFooterLast,
    },
    {
      title: 'Reveal: row group, column chunk, page',
      body: (
        <>
          Read straight from this file's own footer: 2 row groups, 5 columns each, 2 rows per
          group, 4 rows in total.
        </>
      ),
      duration: 4.4,
      fig: "this file's real hierarchy, parsed from its own footer bytes.",
      takeaway: 'A write-once object store can only append — writing the footer last is what makes one streaming pass possible.',
      Visual: S.RevealHierarchy,
    },
    {
      title: 'Predict: a repeated string, stored how?',
      body: (
        <>
          The status column only ever holds two words, repeated across 4 rows. Does the file
          store four full copies of that text?
        </>
      ),
      duration: 3.2,
      fig: "status holds only 'created' or 'shipped', across 4 rows. Stored as 4 full copies?",
      predict: {
        options: [
          { label: 'No — the 2 unique strings are stored once, in a dictionary', correct: true },
          { label: 'Yes — each row gets its own full copy of the text' },
        ],
        explain: (
          <>
            A dictionary page holds each unique value once. The data page then stores only small
            integer indexes into it, one per row.
          </>
        ),
      },
      Visual: S.PredictRepeatedString,
    },
    {
      title: 'Reveal: dictionary page vs. data page',
      body: (
        <>
          A dictionary page holds the 2 unique strings once. A separate data page then holds just
          4 small indexes into it — not the strings again.
        </>
      ),
      duration: 4.4,
      fig: 'a dictionary page of 2 values, then a data page of 4 one-bit indexes into it.',
      Visual: S.RevealDictionaryPage,
    },
    {
      title: 'Reveal: the same column, v1 vs v2',
      body: (
        <>
          One row group apart, the same column switches page formats. The page header's own type
          field — 0, then 3 — is how a reader tells them apart.
        </>
      ),
      duration: 4.4,
      fig: "row group 0's status page header reads type 0; row group 1's reads type 3.",
      takeaway: "A v2 data page keeps its levels uncompressed outside the value section — that's the entire difference from v1.",
      Visual: S.RevealV1VsV2,
    },
    {
      title: 'Reveal: the INT96 timestamp pitfall',
      body: (
        <>
          The same 12 written bytes decode to the correct 12 o'clock UTC instant one way, and a
          wrong instant 7 hours off the other way.
        </>
      ),
      duration: 4.6,
      fig: 'one INT96 value, two readers: a UTC instant, and an America/Los Angeles wall clock.',
      Visual: S.RevealInt96Pitfall,
    },
    {
      title: 'Reveal: isAdjustedToUTC closes the gap',
      body: (
        <>
          INT96 carries no timezone flag at all — a reader has to guess. The modern logical type
          makes that choice an explicit, required flag instead.
        </>
      ),
      duration: 4.2,
      fig: 'TIMESTAMP(isAdjustedToUTC=true): the instant is unambiguous, by the type itself.',
      takeaway: 'INT96 forces a reader to guess the timezone; isAdjustedToUTC makes that choice an explicit, required flag.',
      Visual: S.RevealIsAdjusted,
    },
    {
      title: 'Recap',
      body: (
        <>
          File, row groups, column chunks, pages — and at every leaf, a physical type for the
          bytes, riding next to a logical type for what they mean.
        </>
      ),
      duration: 4.6,
      fig: 'the footer, written last, carries both the file hierarchy and every column\'s logical type.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
