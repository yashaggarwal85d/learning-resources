import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every value shown is computed and asserted in examples.py on a 3-record worked example (order
// 100 with 3 items, order 200 with 0 items, order 300 with 1 item), hand-shredded into Dremel's
// own repetition-level / definition-level column stripes and reassembled back into the original
// records, then checked against two other real layouts for the same structure: Apache Arrow's
// offsets-plus-validity-bitmap list layout (offsets 0, 3, 3, 4; validity 1, 1, 1) and Apache ORC's
// present-plus-length streams (present 1, 1, 1; length 3, 0, 1) — asserted equal to Arrow's own
// derived item counts. A separate 100-record synthetic dataset (20 records with empty item lists)
// measures the fixed per-record overhead this costs: 179 level entries for 159 actual items.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Three real orders — one with 3 items, one with none, one with 1 — shredded by hand into
          two flat columns, and reassembled back exactly.
        </>
      ),
      duration: 4.2,
      fig: '3 orders, 3 items + 0 items + 1 item, shredded into 2 columns and reassembled.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: the sku column, 5 rows from 3 orders?',
      body: (
        <>
          Order 200 has no items at all. When its column is flattened, does that order's row just
          disappear?
        </>
      ),
      duration: 3.2,
      fig: '3 orders, 3 + 0 + 1 items. Does the order with 0 items vanish from the column?',
      predict: {
        options: [
          { label: 'No — it leaves one marker row behind', correct: true },
          { label: 'Yes — a record with no items writes nothing' },
        ],
        explain: (
          <>
            Without a marker, a reader scanning the flat column could never tell "no items" apart
            from "the next item just hasn't arrived yet."
          </>
        ),
      },
      Visual: S.PredictSkuOrder,
    },
    {
      title: 'Reveal: a repetition level per value, not per row',
      body: (
        <>
          Level 0 starts a new record. Level 1 means the same repeated field fired again — not a
          new record at all.
        </>
      ),
      duration: 4.4,
      fig: 'sku repetition levels, read straight from the shredded column: 0, 1, 1, 0, 0.',
      Visual: S.RevealRepetitionLevel,
    },
    {
      title: 'Reveal: a NULL still needs a definition level',
      body: (
        <>
          Order 200's empty item list gets exactly one marker row, with definition level 0 — the
          list was there, just empty.
        </>
      ),
      duration: 4.2,
      fig: "order 200's own row in the sku column: value NULL, definition level 0.",
      takeaway: 'A definition level of 0 tells a reader the list existed and was simply empty — not missing data.',
      Visual: S.RevealNullDefLevel,
    },
    {
      title: 'Predict: how many definition levels does note need?',
      body: (
        <>
          Note can be missing on its own, and the whole item it lives in can be missing too. How
          many definition levels does that take?
        </>
      ),
      duration: 3.4,
      fig: 'note is optional, inside a repeated item. How many definition levels does it need?',
      predict: {
        options: [
          { label: 'Two — one for the item, one for note itself', correct: true },
          { label: "One — note is either there or it isn't" },
        ],
        explain: (
          <>
            Each non-required ancestor in the path adds one more level a reader has to be able to
            distinguish, not just the leaf field alone.
          </>
        ),
      },
      Visual: S.PredictNoteLevels,
    },
    {
      title: 'Reveal: definition level 2 vs 1 vs 0',
      body: (
        <>
          Level 2: item and note both present. Level 1: item present, note missing. Level 0: no
          item at all. One integer, two ancestors.
        </>
      ),
      duration: 4.6,
      fig: 'note definition levels, read from the shredded column: 2, 1, 2, 0, 2.',
      Visual: S.RevealNoteDefLevels,
    },
    {
      title: 'Reveal: reassembly walks both streams in lock-step',
      body: (
        <>
          No tree, no recursion into nested objects — just a repetition level of 0 telling the
          reader a new record has started.
        </>
      ),
      duration: 4.2,
      fig: 'both leaf streams, walked together: a repetition level of 0 is the only record boundary.',
      takeaway: 'A single repeated field value, repetition level 0, tells a flat-stream reader exactly where a new record starts.',
      Visual: S.RevealReassembly,
    },
    {
      title: "Reveal: Arrow's answer — offsets, not levels",
      body: (
        <>
          The same 3 records as one offsets buffer and a validity bitmap — a separate buffer pair
          for this one nesting level, not a shared stream across the whole path.
        </>
      ),
      duration: 4.4,
      fig: "arrow's list layout for the same 3 orders: offsets 0, 3, 3, 4; validity 1, 1, 1.",
      Visual: S.RevealArrowOffsets,
    },
    {
      title: "Reveal: ORC's answer — present and length",
      body: (
        <>
          The same structure again: a present stream and a length stream — the same item counts
          Arrow's offsets implied, just stored directly instead of as a running sum.
        </>
      ),
      duration: 4.4,
      fig: "orc's list layout for the same 3 orders: present 1, 1, 1; length 3, 0, 1.",
      takeaway: "Arrow's offsets and ORC's length stream carry the identical per-record item counts — different storage, same fact.",
      Visual: S.RevealOrcPresent,
    },
    {
      title: 'Recap',
      body: (
        <>
          Dremel's levels, Arrow's offsets, and ORC's present/length streams all encode the same
          structural fact — and every record pays for at least one entry per leaf field.
        </>
      ),
      duration: 4.6,
      fig: 'three formats, three places to put the same structural information.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
