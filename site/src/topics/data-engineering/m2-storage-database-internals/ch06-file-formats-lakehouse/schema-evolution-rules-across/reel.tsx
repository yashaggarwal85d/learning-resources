import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every value shown is computed and asserted in examples.py, hand-rolled against each format's
// own spec (no fastavro or pyarrow installed in this sandbox): Avro resolves a missing field with
// a default to "USD" and raises for one with no default; Protobuf's reused field 2 decodes
// "Alice"'s bytes as the int32 1,667,853,377; Parquet's by-name match returns the renamed and new
// columns as missing, by-position silently swaps region's value with 4,599 and amount_cents's
// with "USD", and by-field-ID resolves every real column (4,017 and 4,599) correctly.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A record was written before currency existed. The reader's schema asks for it anyway,
          with a default.
        </>
      ),
      duration: 4.4,
      fig: "Avro: a reader field missing from the writer, with a default, resolves to that default.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a required field get the same pass?',
      body: (
        <>
          A default just rescued one missing field without any drama. Here's a second field the
          reader also wants, this one with no default at all.
        </>
      ),
      duration: 3,
      fig: 'currency had a default and resolved quietly. What about a field with none?',
      predict: {
        options: [
          { label: 'No — a field with no default and no writer value is an error', correct: true },
          { label: "Yes — the reader always gets something back" },
        ],
        explain: (
          <>
            A default is doing real work here, not just being convenient. Without one, the
            reader has nothing to fall back to, and the spec treats that as a hard error.
          </>
        ),
      },
      Visual: S.PredictDefault,
    },
    {
      title: "Reveal: Avro's one strict rule",
      body: (
        <>
          No default, and the writer never had this field either. The resolution isn't a guess or
          a null — it's an error, by the specification's own words.
        </>
      ),
      duration: 4,
      fig: 'a reader field with no default, missing from the writer, is an error.',
      takeaway: 'An Avro field is safe to add only with a default; without one, old records make the reader error.',
      Visual: S.RevealNoDefault,
    },
    {
      title: "Reveal: Protobuf doesn't match by name",
      body: (
        <>
          Everything so far has been about matching fields by name. Protobuf throws that out
          completely — on the wire, a field is identified by its number, never its name.
        </>
      ),
      duration: 4,
      fig: 'Avro matches fields by name. Protobuf matches fields by number, on the wire.',
      Visual: S.RevealProtobufIntro,
    },
    {
      title: "Predict: what happens when a deleted field's number is reused?",
      body: (
        <>
          A field gets deleted, and nobody reserves its number. Later, a completely different
          field — a different type — gets assigned that same number.
        </>
      ),
      duration: 3.4,
      fig: "field 2 was a string. It's deleted, and a new int field takes number 2.",
      predict: {
        options: [
          { label: 'The old bytes parse fine, as the wrong value', correct: true },
          { label: 'The old bytes fail to parse' },
        ],
        explain: (
          <>
            The wire format has no way to tell these two definitions apart. It just decodes
            whatever bytes are there using the current field's type — successfully, and wrong.
          </>
        ),
      },
      Visual: S.PredictFieldReuse,
    },
    {
      title: 'Reveal: the surprising number',
      body: (
        <>
          A real name's real bytes, reinterpreted as a different type entirely. No crash, no
          parse error — just a specific, ordinary-looking wrong number.
        </>
      ),
      duration: 4.6,
      fig: "a name's own UTF-8 bytes, reread as an int32, decode to 1,667,853,377 — successfully.",
      takeaway: "Reusing a deleted field number doesn't fail to parse; it silently decodes as the wrong value — what reserved prevents.",
      Visual: S.RevealSurprisingNumber,
    },
    {
      title: "Reveal: Parquet's three ways to match a column",
      body: (
        <>
          One schema change — a rename, plus a brand new column inserted in the middle — read
          back three different ways against the same file.
        </>
      ),
      duration: 4,
      fig: 'the same renamed, reordered schema: matched by name, by position, by field ID.',
      Visual: S.RevealParquetIntro,
    },
    {
      title: 'Reveal: by-position corrupts silently',
      body: (
        <>
          The new column shifts every column after it over by one slot. By-position matching
          doesn't notice — it just reads whatever used to be in that slot.
        </>
      ),
      duration: 4.6,
      fig: "inserting one column shifts every later slot; by-position reads each one's wrong data.",
      takeaway: 'Inserting a column anywhere but the end breaks by-position matching — it returns wrong data, never an error.',
      Visual: S.RevealByPosition,
    },
    {
      title: 'Reveal: by-field-ID survives both',
      body: (
        <>
          The same rename, the same insertion — but matched against a stable ID instead of a
          name or a slot. Every real column lands exactly where it should.
        </>
      ),
      duration: 4.2,
      fig: 'matched by field ID, every real column resolves correctly; only the genuinely new one reads missing.',
      Visual: S.RevealByFieldId,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three formats, one shared shape: every safe evolution move still needs something stable
          to match against — a name, a guarded number, or an ID.
        </>
      ),
      duration: 4.6,
      fig: 'Avro: a trusted name. Protobuf: a guarded number. Parquet: a stable field ID.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
