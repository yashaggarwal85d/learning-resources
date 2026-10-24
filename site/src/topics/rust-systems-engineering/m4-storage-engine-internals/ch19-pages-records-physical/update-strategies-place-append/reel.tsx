import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Overwriting in place is the cheapest in space, but destroys the old
// version outright. Appending keeps every version until a real compaction
// pass discards the old ones. Copying the whole page costs the most in
// space, a page at a time, but that's exactly what buys crash safety with
// no special recovery procedure. Three real systems each made a
// different, deliberate choice among these three.
const reel: Reel = {
  steps: [
    {
      title: 'Apply the exact same sequence of updates to one logical record three different real ways: overwrite it in place, append each new version to a growing log, or copy a whole page with the new version swapped in. Does overwriting in place ever leave behind any garbage to clean up later?',
      body: (
        <>
          The same five updates, about to be applied three ways.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, a little garbage accumulates every time' },
          { label: 'No, overwriting in place leaves nothing behind at all', correct: true },
          { label: 'Only if the new value is a different length than the old one' },
        ],
        explain: (
          <>
            Nothing behind at all. The old bytes are simply gone.
          </>
        ),
      },
      Visual: S.InPlacePredict,
    },
    {
      title: "Measured: overwriting the record in place, five times, left its own footprint exactly as it started, with no garbage at all",
      body: (
        <>
          The real, measured footprint before and after five in-place updates.
        </>
      ),
      duration: 3.0,
      Visual: S.InPlaceReveal,
    },
    {
      title: "Now apply those same five updates by appending each new version to a growing log instead, never overwriting the old one. Does the log's own footprint grow with every update?",
      body: (
        <>
          The same five updates, appended one after another.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, only the newest version is ever actually kept on disk' },
          { label: "Yes, the log's own footprint grows with every single update", correct: true },
          { label: 'It only grows once the log reaches a certain size' },
        ],
        explain: (
          <>
            It grows every single time. Nothing old was ever thrown away yet.
          </>
        ),
      },
      Visual: S.AppendPredict,
    },
    {
      title: "Measured: the append-only log's own footprint genuinely grew with every update; compacting it afterward discarded every version but the newest to reclaim that growth",
      body: (
        <>
          The real, measured growth, then the real, measured compaction.
        </>
      ),
      duration: 3.0,
      takeaway: 'Appending each new version keeps every old one around until a real compaction pass goes and discards it.',
      Visual: S.AppendReveal,
    },
    {
      title: "Apply the same five updates one more way: copy the whole page the record lives on, write the new version into the copy, and swap it in. Does this grow the structure by just the record's own few bytes each time, the same as the log did?",
      body: (
        <>
          A whole page, copied for one small update.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, only the record's own bytes are ever duplicated" },
          { label: "No, a whole page is copied every time, not just the record's own bytes", correct: true },
          { label: 'It depends on how much of the page the record actually uses' },
        ],
        explain: (
          <>
            A whole page, every single time, no matter how small the update.
          </>
        ),
      },
      Visual: S.CowPredict,
    },
    {
      title: "Measured: copying the whole page on every update grew the structure by a whole page each time, not just the record's own bytes",
      body: (
        <>
          The real, measured per-update growth, in whole pages.
        </>
      ),
      duration: 3.0,
      takeaway: 'Copy-on-write own unit of work is the whole page, so its footprint grows by a page each time.',
      Visual: S.CowReveal,
    },
    {
      title: 'Compare the real garbage left behind by append-only and by copy-on-write, on the exact same five updates. Which one leaves more behind for a compaction pass to reclaim?',
      body: (
        <>
          The two real garbage totals, side by side.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Append-only leaves more, since it keeps every version' },
          { label: 'Copy-on-write leaves more, since every discarded copy is a whole page', correct: true },
          { label: 'They leave back exactly the same amount' },
        ],
        explain: (
          <>
            Copy-on-write leaves more. A whole page costs more than one record.
          </>
        ),
      },
      Visual: S.ComparePredict,
    },
    {
      title: "Measured: on the exact same five updates, copy-on-write's own garbage was strictly larger than append-only's own garbage",
      body: (
        <>
          The real, measured comparison.
        </>
      ),
      duration: 2.8,
      Visual: S.CompareReveal,
    },
    {
      title: "Three real systems made three different, deliberate choices here. LMDB's own documentation: copying a page instead of overwriting it means no active data page is ever touched, so a crash can't leave a page half-written, and there's no special recovery procedure needed at all",
      body: (
        <>
          LMDB's own words on copy-on-write and crash safety.
        </>
      ),
      duration: 3.0,
      takeaway: "Copy-on-write's larger footprint buys crash safety: a page never overwritten can't be left half-written.",
      Visual: S.CrashSafetyReveal,
    },
    {
      title: 'Recap: three deliberate choices',
      body: (
        <>
          Overwriting in place is the cheapest in space, but destroys the old version outright. Appending keeps every version until a real compaction pass discards the old ones. Copying the whole page costs the most in space, a page at a time, but that's exactly what buys crash safety with no special recovery procedure. Three real systems each made a different, deliberate choice among these three.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
