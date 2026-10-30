import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py, a toy segmented log with a sparse
// offset index: a naive full scan to a record near the end of four hundred appended
// records scans nearly all of them; a seek through the sparse index for the identical
// record scans only a handful. The log rolls a new segment three separate times as it
// crosses its real configured byte limit (Kafka's own default is one gigabyte; this toy
// log uses a far smaller limit so the roll happens on screen, disclosed in post-notes.md).
// A consumer rewinding its own stored offset and re-reading is measured to change nothing
// about the partition's segments or index, byte for byte. No literal digits anywhere below
// (duration numbers are exempt); the real counts are shown in scenes.tsx instead.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the seek that shouldn't be fast",
      body: (
        <>
          A toy partition holds hundreds of records on real disk, nothing sorted for lookup.
          Reading the last few of them by scanning from the start touches almost every record.
          Reading the exact same record a different way touches a tiny handful. What's the
          difference?
        </>
      ),
      duration: 4.8,
      fig: 'the identical record, read two ways on a real run — one scan touches nearly every record, the other touches a handful',
      Visual: S.Hook,
    },
    {
      title: 'Setup: a partition is files on disk',
      body: (
        <>
          A partition is not an abstract queue. It is a directory of ordinary files on real
          disk: one of them open and growing, the rest sealed and unchanging.
        </>
      ),
      duration: 4.8,
      fig: 'one partition, read directly as real files — which one is still being written to?',
      Visual: S.Setup,
    },
    {
      title: 'Predict: the open segment just filled up. What happens to the next record?',
      body: (
        <>
          The segment currently being written to has just crossed its size limit. The next
          record still has to go somewhere. Where?
        </>
      ),
      duration: 2.8,
      fig: 'the open segment just hit its size limit — does the write block, does an old segment get deleted, or does something else happen?',
      predict: {
        options: [
          { label: 'The broker blocks the write until space frees up' },
          { label: 'A new segment opens, and the write lands there instead', correct: true },
          { label: 'The oldest segment is deleted to make room' },
        ],
        explain: (
          <>
            A new segment opens. A size limit is a per-file roll trigger, not a capacity
            ceiling — the partition just keeps growing onto a new file. Deleting an old
            segment is a different mechanism entirely (retention, driven by age or total
            size across the whole partition), triggered on its own schedule, not by a
            single segment filling up.
          </>
        ),
      },
      Visual: S.PredictSegmentFull,
    },
    {
      title: 'Reveal: the active segment rolls',
      body: (
        <>
          A real toy log, appending record after record. The open segment's byte count
          climbs to its real configured limit on screen, and a new segment opens exactly
          there — more than once, as the run continues.
        </>
      ),
      duration: 4.8,
      fig: 'a real run: the open segment rolls to a new file every time it crosses its configured byte limit',
      takeaway: 'A segment rolls at a size limit — only the newest segment can still be appended to.',
      Visual: S.RevealSegmentRoll,
    },
    {
      title: 'Reveal: the offset index is sparse',
      body: (
        <>
          Every one of those records got appended to the log file. Only some of them got an
          entry in the companion index file — by design, not by accident.
        </>
      ),
      duration: 4.8,
      fig: 'four hundred real records, and a real index with far fewer entries than that — sparse on purpose',
      takeaway: 'The index is sparse on purpose — a few entries get a seek close, then a short scan finishes it.',
      Visual: S.RevealSparseIndex,
    },
    {
      title: 'Predict: the index only checks in every so often. Can that ever return the wrong record?',
      body: (
        <>
          The index does not name a position for every record — only every so often. Does
          that occasional checking-in risk a seek landing on the wrong record?
        </>
      ),
      duration: 2.8,
      fig: 'the index checks in only every so often — can a seek that relies on it ever come back with the wrong record?',
      predict: {
        options: [
          { label: 'Sometimes — skipping records means the seek can land on an approximate answer' },
          { label: "Never — the index only narrows where to start a short, exact scan that finds the one correct record", correct: true },
        ],
        explain: (
          <>
            Never. The index only narrows a search down to roughly the right position. A
            short, exact scan from there always finds the one record actually asked for —
            this topic's own run already proved the sparse-index seek and a full naive scan
            return the bit-for-bit identical record for the same offset, every time.
          </>
        ),
      },
      Visual: S.PredictIndexCorrectness,
    },
    {
      title: 'Reveal: reads come from the page cache, with zero copies to spare',
      body: (
        <>
          A naive path from disk to a consumer's socket copies the same bytes four times.
          Kafka's real design, using the operating system's own page cache and a kernel
          call named `sendfile`, skips straight past the middle of that path entirely.
        </>
      ),
      duration: 4.8,
      fig: "two data paths for the identical bytes — one copies them repeatedly, the other hands them from the kernel's own cache straight to the network",
      takeaway: "Zero-copy skips the detour through user space — the kernel hands cached bytes straight to the network.",
      Visual: S.RevealZeroCopy,
    },
    {
      title: 'Reveal: an offset belongs to the consumer, not the broker',
      body: (
        <>
          A consumer's position in a partition is a single integer it keeps for itself.
          Rewinding that integer and re-reading touches nothing on the broker side at all —
          measured directly, byte for byte, on this topic's own real run.
        </>
      ),
      duration: 4.8,
      fig: "a consumer rewinds its own stored offset and re-reads — does the broker's own state change along with it, or not at all?",
      takeaway: "An offset is just an integer the consumer owns — rewinding costs the broker nothing.",
      Visual: S.RevealOffsetOwnership,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          log, just now — the roll trigger, the index's real sparsity, the scan counts for
          both kinds of seek, and the rewind that changed nothing.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          A partition as real segment files on disk. A segment that rolls once it crosses
          its own size limit. An index sparse enough to stay small and still seek fast. A
          read path that hands bytes to the network without ever really touching them. And
          an offset that belongs to the consumer alone — which is why a log never has to
          ask who has read what.
        </>
      ),
      duration: 4.8,
      fig: 'a rolling segment, a sparse index, a zero-copy read, and a consumer-owned offset — the four ideas this topic opened on',
      Visual: S.Recap,
    },
  ],
};

export default reel;
