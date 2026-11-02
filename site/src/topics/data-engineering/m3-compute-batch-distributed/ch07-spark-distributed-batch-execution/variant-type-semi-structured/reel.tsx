import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real local DataFrames (examples.py): repeatedly extracting one field from a
// JSON-string column is real, measurably slower than extracting the identical field from VARIANT,
// since the string column re-parses the whole text every time while VARIANT was parsed once, into
// binary, at write time. Casting a field whose type varies row to row into a fixed struct schema
// silently turns the mismatched row into NULL; VARIANT preserves and extracts every row correctly.
// Shredding's own read/write trade-off is GA only as of a later Spark release than this chapter's
// pinned version, so it is sourced in SOURCES.md, not measured here.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          ANSI mode changed how existing types behave. This topic closes the section with a
          type that didn't exist before at all.
        </>
      ),
      duration: 4.5,
      fig: 'existing types just changed. This one never existed before now.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: semi-structured data used to force a choice between two bad options',
      body: (
        <>
          A JSON string column is opaque text the engine re-parses on every read. An inferred
          struct breaks the moment a field's own type drifts from one row to the next.
        </>
      ),
      duration: 4.8,
      fig: 'opaque text, or a struct that breaks on drift. Those were the choices.',
      Visual: S.RevealTwoBadOptions,
    },
    {
      title: 'Predict: extracting one field, over and over. Faster from a JSON string, or from VARIANT?',
      body: (
        <>
          The same field, extracted the same way, many times over. Is the JSON-string column
          faster, or is the identical data stored as VARIANT faster?
        </>
      ),
      duration: 2.8,
      fig: 'same field, extracted repeatedly. String column, or VARIANT: faster?',
      predict: {
        options: [
          { label: 'JSON string — a plain string is the simplest possible format' },
          { label: "VARIANT — it's already parsed, the string isn't", correct: true },
        ],
        explain: (
          <>
            VARIANT. The JSON string has to be parsed fresh on every single extraction; VARIANT
            did that parsing once, when it was written.
          </>
        ),
      },
      Visual: S.PredictExtractSpeed,
    },
    {
      title: 'Reveal: slower from the JSON string, measured directly',
      body: (
        <>
          Measured: extracting the same field is real, meaningfully slower from the JSON-string
          column than from VARIANT, on the identical data.
        </>
      ),
      duration: 4.8,
      fig: 'JSON string: slower, measured. VARIANT: faster, same field, same data.',
      Visual: S.RevealVariantFaster,
    },
    {
      title: 'Elaborate: VARIANT is self-describing binary, not text',
      body: (
        <>
          Every VARIANT value carries a header byte describing what follows, and shares one
          field-name dictionary across the whole column. Extraction is pointer arithmetic, not
          text parsing.
        </>
      ),
      duration: 5,
      fig: 'a header byte, a shared dictionary -- extraction never re-reads the text.',
      takeaway: "VARIANT's extraction is fast because the parsing already happened once, not because the format is smaller.",
      Visual: S.ElaborateSelfDescribing,
    },
    {
      title: 'Predict: a field whose type varies row to row, cast into a fixed struct. Does every row survive?',
      body: (
        <>
          One field, sometimes a number and sometimes text, cast into a struct that declares it
          as a single fixed type. Does every row come through, or does one disappear?
        </>
      ),
      duration: 2.8,
      fig: 'a field with two different types, cast into one fixed struct. Every row survives?',
      predict: {
        options: [
          { label: "Every row survives — Spark coerces whatever it can" },
          { label: "The mismatched row becomes NULL — it can't be forced into the declared type", correct: true },
        ],
        explain: (
          <>
            The mismatched row becomes NULL. A struct commits to one type per field; a value
            that doesn't fit that type is silently lost, not coerced.
          </>
        ),
      },
      Visual: S.PredictStructDrift,
    },
    {
      title: 'Reveal: the mismatched row quietly becomes NULL, measured directly',
      body: (
        <>
          Measured: the row whose field doesn't match the struct's declared type comes back
          NULL. The identical data read through VARIANT keeps every row's own value, intact.
        </>
      ),
      duration: 4.8,
      fig: 'struct: one row lost to NULL. VARIANT: every row kept, measured.',
      Visual: S.RevealStructDrops,
    },
    {
      title: "Elaborate: a struct picks one type per field before any data arrives",
      body: (
        <>
          The struct's schema is a commitment made in advance. The moment real data disagrees
          with that commitment, something has to be lost -- VARIANT never has to make it.
        </>
      ),
      duration: 5,
      fig: "a schema decided early, data that doesn't always agree with it later.",
      takeaway: "A struct is fast because it commits to one shape in advance; VARIANT is tolerant because it never has to.",
      Visual: S.ElaborateOneTypeChosen,
    },
    {
      title: "Reveal: shredding buys the struct's own speed back, for the fields that earn it",
      body: (
        <>
          Promoting one frequently read field into its own typed Parquet column gives that field
          the struct's read speed, without giving up VARIANT's tolerance for everything else --
          generally available only in a Spark release after this chapter's own pinned version,
          so it's sourced here, not measured.
        </>
      ),
      duration: 5,
      fig: "one hot field promoted to its own column; the rest stays as it was.",
      Visual: S.RevealShreddingSourced,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three shapes of cost for the same semi-structured data: a string's repeated
          re-parsing, a struct's early commitment, and VARIANT's binary in between.
        </>
      ),
      duration: 5,
      fig: 'one kind of data, three different costs -- picked by the column type.',
      takeaway: "The choice between a JSON string, a struct and VARIANT is about when parsing gets paid, and what gets lost.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
