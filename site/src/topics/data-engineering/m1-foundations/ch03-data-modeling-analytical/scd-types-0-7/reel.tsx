import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md): the mini-dimension sizing, row-count and
// update-cost numbers are a disclosed, self-consistent worked scenario computed in examples.py
// (SOURCES.md), not a claim about a real running system. Every number on screen traces to a
// literal constant there; everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'Not every change deserves a new row',
      body: (
        <>
          Topic thirteen's answer was: add a new row, keep the old one, never overwrite. Apply
          that to every attribute in a wide customer dimension and the dimension never stops growing.
        </>
      ),
      duration: 4.8,
      fig: 'treat every attribute like Type 2, and the dimension never stops growing',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: Type 0, quoted directly',
      body: (
        <>
          Some attributes never change in any way that matters — an original credit score, a
          durable identifier, most of a date dimension. Those get no mechanism at all.
        </>
      ),
      duration: 4.8,
      fig: 'the value never changes, so there is nothing to track',
      Visual: S.RevealType0,
    },
    {
      title: 'Reveal: Type 1, quoted directly',
      body: (
        <>
          Other attributes change, but the old value is worth nothing. Overwrite it in place — no
          new row, easy to implement, but the history is genuinely gone.
        </>
      ),
      duration: 4.8,
      fig: 'overwrite in place — easy, but history is gone for good',
      Visual: S.RevealType1,
    },
    {
      title: 'Predict: can one column hold both the current value and the original, without a new row?',
      body: (
        <>
          Overwriting loses the old value entirely. Keeping it with a new row is Type 2's answer.
          Is there a way to keep it without a new row at all?
        </>
      ),
      duration: 2.8,
      fig: 'keep the old value, but without adding a whole new row — possible?',
      predict: {
        options: [
          { label: 'No — preserving the old value always needs a second row' },
          { label: 'Yes — a second column on the same row can hold it', correct: true },
        ],
        explain: (
          <>
            Yes. A second column, right on the same row, can carry the old value while the main
            column is overwritten with the new one — one row, two values.
          </>
        ),
      },
      Visual: S.PredictOneColumn,
    },
    {
      title: 'Reveal: Type 3, quoted directly',
      body: (
        <>
          Type 3 adds exactly that second column — Kimball calls it an "alternate reality." The
          main column is overwritten like Type 1, but the prior value survives beside it.
        </>
      ),
      duration: 4.8,
      fig: 'a second column, an "alternate reality," beside the overwritten one',
      Visual: S.RevealType3,
    },
    {
      title: 'Reveal: the gallery, one change, four treatments, counted',
      body: (
        <>
          The same reclassification, run through Types 0, 1, 2 and 3 side by side: whether the old
          value survives at all, and if so, in a new row or in a new column.
        </>
      ),
      duration: 4.8,
      fig: 'one change, four treatments: row count and column count, side by side',
      takeaway: 'Types 0, 1, 2 and 3 differ only in whether the old value survives, in a row or a column.',
      Visual: S.RevealGallery,
    },
    {
      title: "Predict: does a rapidly changing, shared attribute group force Type 2's cost onto the whole dimension?",
      body: (
        <>
          Type 2 is fine for one attribute that changes now and then. What happens when a whole
          group of attributes, shared across many customers, changes often?
        </>
      ),
      duration: 2.8,
      fig: 'a fast-changing attribute group, shared by many rows — does Type 2 scale?',
      predict: {
        options: [
          { label: 'Yes — Type 2 scales the same way no matter what changes' },
          { label: 'No — the whole wide row gets duplicated on every change', correct: true },
        ],
        explain: (
          <>
            No. Type 2 on the base dimension duplicates every other base attribute on every single
            change, not just the ones that actually changed — the wide row pays for the narrow change.
          </>
        ),
      },
      Visual: S.PredictMonsterDimension,
    },
    {
      title: 'Reveal: Type 4, quoted directly — the mini-dimension, counted',
      body: (
        <>
          Split the fast-changing group into its own small table — Kimball's "rapidly changing
          monster dimension," pulled out on its own key. Only the combinations that actually occur
          get a row.
        </>
      ),
      duration: 4.8,
      fig: 'nine possible combinations, five actually seen — the mini-dimension stays that small',
      takeaway: 'A mini-dimension is bounded by the attributes\' own combinations, not by how many rows or changes reference it.',
      Visual: S.RevealType4,
    },
    {
      title: 'Reveal: Type 5, quoted directly — current without a fact join',
      body: (
        <>
          Type 5 is Type 4 with one addition: a current-profile pointer, overwritten Type 1 style,
          sitting right on the base dimension — the current mini-dimension values without a join.
        </>
      ),
      duration: 4.8,
      fig: 'Type 4, plus one overwritten pointer to the current profile — four plus one',
      takeaway: 'Type 5 is Type 4 plus one Type 1 pointer — a combination, not a new mechanism.',
      Visual: S.RevealType5,
    },
    {
      title: 'Predict: can Type 6 and Type 7 both deliver current-plus-historical reporting, at different cost?',
      body: (
        <>
          Two more hybrids claim the same thing: both the value in effect at the time, and the
          value as of right now, from one dimension. Can they really cost different amounts?
        </>
      ),
      duration: 2.8,
      fig: 'same reporting, two hybrids — do they really cost different amounts?',
      predict: {
        options: [
          { label: "No — delivering the same report always costs the same" },
          { label: 'Yes — one rewrites history to stay current, the other never does', correct: true },
        ],
        explain: (
          <>
            Yes. One keeps the current value by physically overwriting every prior row for the
            key; the other reaches the current value with a second key instead, and rewrites nothing.
          </>
        ),
      },
      Visual: S.PredictSixSeven,
    },
    {
      title: 'Reveal: Type 6 and Type 7, quoted directly — the update cost, counted',
      body: (
        <>
          Type 6 is Type 2 plus Type 3 plus Type 1 — Kimball's own arithmetic. Type 7 delivers the
          identical functionality through a second, durable key instead of overwriting anything.
        </>
      ),
      duration: 4.8,
      fig: 'six prior rows rewritten for Type 6; zero rewritten for Type 7',
      takeaway: 'Type 6 and Type 7 answer the same question; they differ only in whether history gets rewritten.',
      Visual: S.RevealSixSevenMeasured,
    },
    {
      title: 'Reveal: choosing by churn and query pattern, applied to three scenarios',
      body: (
        <>
          The choice is made attribute by attribute, with the business: a signup channel that
          never meaningfully changes, a typo with no history worth keeping, and a fast-changing
          pair that needs both current and historical reporting.
        </>
      ),
      duration: 4.8,
      fig: 'one attribute, one decision each: Type 0, Type 1, and Type 4 moving to Type 5',
      Visual: S.RevealChoosing,
    },
    {
      title: 'Recap',
      body: (
        <>
          Zero, one and three decide whether the old value survives at all, and where. Four splits
          off what changes fast and is shared. Five, six and seven are named combinations of the
          first four, not new mechanisms, each trading a different cost for the same reporting.
        </>
      ),
      duration: 4.8,
      fig: 'zero through three: keep it or not; four: split it off; five, six, seven: combinations',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new attribute changes about as often as the mini-dimension's pair, but is tracked
          alone, and every query needs its exact value at the time of each sale, never the
          current one. Which type fits?
        </>
      ),
      duration: 2.8,
      fig: 'changes often, tracked alone, history always needed — which type?',
      predict: {
        options: [
          { label: 'Type 4 — any fast-changing attribute belongs in a mini-dimension' },
          { label: 'Type 2 — tracked alone with no need for the current value, it is the plain case', correct: true },
        ],
        explain: (
          <>
            Type 2. A mini-dimension earns its keep on a shared, grouped, current-value need; a
            single attribute with no current-value requirement is exactly Type 2's own case.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
