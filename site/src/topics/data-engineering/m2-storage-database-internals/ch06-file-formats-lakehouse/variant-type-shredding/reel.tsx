import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every value shown is computed and asserted in examples.py on 6 real, heterogeneous click/scroll
// records (4 distinct shapes). A hand-rolled Variant metadata dictionary and value encoder, built
// to the spec's own byte layout, round-trips all 6 records exactly at 155 bytes (vs 250 bytes as
// JSON strings). Forced into a single fixed struct, 3 of 6 records lose a field. Shredding
// event_type and button_id into typed columns gives 3 fully shredded records, 2 partially
// shredded, and 1 fallback (button_id present as a string, which the int32 column can't hold) —
// 126 bytes total, and a filter on event_type (always a string here) never touches the 0
// remaining residual value bytes.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          6 real click and scroll events, 4 distinct shapes, and one field — button_id — that's an
          int32 in most records and a string in one.
        </>
      ),
      duration: 4.4,
      fig: '6 heterogeneous events: different fields, different shapes, one type conflict.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: can one fixed struct hold all 6 events?',
      body: (
        <>
          A struct with columns event_type (string) and button_id (int32) — the two fields most of
          these records share. Can it hold every one of the 6 without losing data?
        </>
      ),
      duration: 3.6,
      fig: 'a fixed struct schema (event_type, button_id) against 6 heterogeneous records.',
      predict: {
        options: [
          { label: 'No — any shape or type the struct lacks gets dropped', correct: true },
          { label: 'Yes — nulls can stand in for anything missing' },
        ],
        explain: (
          <>
            A null can stand in for a missing field, but not for a field the struct has no column
            for at all, or a value whose type the column can't represent.
          </>
        ),
      },
      Visual: S.PredictStruct,
    },
    {
      title: 'Reveal: 3 of 6 records lose a field',
      body: (
        <>
          The scroll event's only real field, depth_pct, has no column in a struct shaped for
          click events — and button_id: "unknown" is silently dropped, not merely left null.
        </>
      ),
      duration: 4.4,
      fig: "forcing all 6 records into the fixed struct: 3 lose a field, one of them silently.",
      Visual: S.RevealStructLoss,
    },
    {
      title: 'Reveal: the Variant encoding stores every record exactly',
      body: (
        <>
          A real metadata dictionary plus per-record value encoding, built to the specification's
          own byte layout — decoded back, every one of the 6 records matches byte for byte.
        </>
      ),
      duration: 4.6,
      fig: "this topic's own Variant metadata + value encoder, round-tripped against all 6 records.",
      takeaway: 'A Variant stores any shape or type without a fixed schema — nothing is ever silently dropped.',
      Visual: S.RevealVariantRoundTrip,
    },
    {
      title: 'Predict: does filtering mean decoding the whole value?',
      body: (
        <>
          A query asks which events have event_type = "click". Does answering it mean decoding
          every record's full Variant binary value, every time?
        </>
      ),
      duration: 3.6,
      fig: "filtering on event_type across 6 Variant-encoded records — decode everything, or not?",
      predict: {
        options: [
          { label: "Not if event_type is shredded into its own typed column", correct: true },
          { label: 'Yes — the value is opaque binary until decoded' },
        ],
        explain: (
          <>
            Shredding a field into a typed Parquet column means a reader can filter on it directly,
            the same way it would filter any other column — no Variant decoding required.
          </>
        ),
      },
      Visual: S.PredictDecodeCost,
    },
    {
      title: 'Reveal: shredding, field by field',
      body: (
        <>
          event_type and button_id move into typed columns. 3 records are fully shredded with
          nothing left over; 2 keep a real residual field; 1 falls back because its button_id is a
          string, not an int32.
        </>
      ),
      duration: 4.6,
      fig: 'shredding event_type and button_id: 3 fully shredded, 2 partial, 1 fallback.',
      Visual: S.RevealShredBreakdown,
    },
    {
      title: 'Reveal: a typed-column filter touches zero residual bytes',
      body: (
        <>
          event_type is a string in all 6 records, so it's always shredded — finding the 5 click
          events never has to read a single byte of the residual Variant value.
        </>
      ),
      duration: 4.4,
      fig: 'filtering event_type = "click" via the typed column alone: 0 residual bytes read.',
      takeaway: "A field that's shredded in every record never needs its residual Variant value read at all.",
      Visual: S.RevealTypedColumnOnly,
    },
    {
      title: 'Reveal: measured size, three ways',
      body: (
        <>
          250 bytes as JSON strings, 155 bytes as an unshredded Variant, 126 bytes once event_type
          and button_id are shredded into typed columns.
        </>
      ),
      duration: 4.4,
      fig: 'measured bytes: JSON strings vs unshredded Variant vs shredded typed columns, same 6 records.',
      Visual: S.RevealMeasuredSize,
    },
    {
      title: "Reveal: shredding's real win isn't size",
      body: (
        <>
          126 bytes against 155 is a modest gain on 6 records — the real payoff is the typed
          filter above, which read none of the residual Variant value at all.
        </>
      ),
      duration: 4.2,
      fig: 'the honest comparison: a modest size gain, a much larger pushdown gain.',
      takeaway: 'Shredding earns its keep through pushdown and statistics, not mainly through smaller files.',
      Visual: S.RevealSynthesis,
    },
    {
      title: 'Recap',
      body: (
        <>
          A fixed struct silently drops data a Variant would have kept; shredding gets most of
          that struct's speed back for the fields that matter, with a residual for everything
          else.
        </>
      ),
      duration: 4.8,
      fig: "shred what's typed, keep a residual — never force a schema that drops data.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
