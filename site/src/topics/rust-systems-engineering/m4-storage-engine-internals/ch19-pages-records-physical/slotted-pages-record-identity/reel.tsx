import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A slotted page's whole point is that a record's own identity (its slot
// index) and its physical offset are two different things, deliberately:
// compacting the page moves the offset, and the slot index never has to
// know. A record too big for the page is rejected cleanly rather than
// corrupting it, which is exactly why a real system moves oversized values
// out of line entirely.
const reel: Reel = {
  steps: [
    {
      title: "Add a real slot array to the page: each slot holds a physical offset and a length, and a record's own identity is its slot index, never its offset. Delete a record in the middle of the page and compact it, physically closing the gap. Does the record's own identity survive that move?",
      body: (
        <>
          A slotted page, one record deleted, about to be compacted.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, moving a record changes its own identity too' },
          { label: 'Yes, its slot index stays exactly the same even though its physical offset changes', correct: true },
          { label: 'It depends on which record moved' },
        ],
        explain: (
          <>
            Yes. The slot index and the physical offset were never the same thing.
          </>
        ),
      },
      Visual: S.CompactionPredict,
    },
    {
      title: 'Measured: three variable-length records, inserted into the page, all read back correctly through their own slot index; after deleting the middle one and compacting, the surviving records own physical offsets genuinely changed',
      body: (
        <>
          The real, measured round-trip, then the real, measured compaction.
        </>
      ),
      duration: 3.0,
      Visual: S.CompactionReveal,
    },
    {
      title: "The surviving records' own slot indices: did compacting the page change them at all?",
      body: (
        <>
          The same two records, their own slot index called out directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the slot indices shifted to fill the gap' },
          { label: 'No, each record own slot index stayed exactly what it was before the deletion', correct: true },
          { label: 'Only the record immediately after the gap kept its own index' },
        ],
        explain: (
          <>
            No, neither one changed. A slot index is never renumbered.
          </>
        ),
      },
      Visual: S.IdentityPredict,
    },
    {
      title: "Measured: the surviving records' own slot indices never changed; only their physical offsets did",
      body: (
        <>
          The real, measured pair: offset changed, slot index unchanged.
        </>
      ),
      duration: 3.0,
      takeaway: "A slot index is a record's own stable name; its offset is just where it sits right now.",
      Visual: S.IdentityReveal,
    },
    {
      title: 'Read each surviving record back by its own slot index, after the compaction that physically moved it. Does it still return the exact same content it held before?',
      body: (
        <>
          Reading by slot index, after the move.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, the content is now subtly wrong, since the bytes moved" },
          { label: 'Yes, the exact same content comes back, since the slot index was never tied to the old offset', correct: true },
          { label: "Only for the record that didn't move" },
        ],
        explain: (
          <>
            Yes, exactly the same content, for every surviving record.
          </>
        ),
      },
      Visual: S.ReadbackPredict,
    },
    {
      title: 'Measured: reading by slot index after compaction returned the exact same content as before, for every surviving record',
      body: (
        <>
          The real, measured pair of reads.
        </>
      ),
      duration: 3.0,
      takeaway: 'Decoupling identity from location means a caller holding only a slot index never notices a record moved.',
      Visual: S.ReadbackReveal,
    },
    {
      title: 'Try to insert one more record, too large to fit in whatever free space is left on the page. What happens?',
      body: (
        <>
          An oversized record, about to be inserted.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's written anyway, overflowing into the next page's own bytes" },
          { label: 'The insert is rejected cleanly, and every record already on the page stays exactly as it was', correct: true },
          { label: 'The page silently drops an existing record to make room' },
        ],
        explain: (
          <>
            Rejected cleanly. Nothing already on the page was touched at all.
          </>
        ),
      },
      Visual: S.OverflowPredict,
    },
    {
      title: 'Measured: the oversized insert was rejected cleanly, and every record already on the page, read back by its own slot index, was still exactly intact',
      body: (
        <>
          The real, measured rejection, then the real, measured intact read-back.
        </>
      ),
      duration: 2.8,
      Visual: S.OverflowReveal,
    },
    {
      title: "PostgreSQL's own documentation makes a stronger claim still: because a page's own size is fixed, a value too large to fit can't just overflow onto another page, it has to be compressed, or broken up and stored somewhere else entirely. That's the real reason TOAST exists",
      body: (
        <>
          The documentation's own words on the fixed page size.
        </>
      ),
      duration: 3.0,
      takeaway: "A fixed page size is not a limitation; it's why a large value needs a different kind of home.",
      Visual: S.FixedSizeReveal,
    },
    {
      title: 'Recap: identity, decoupled from location',
      body: (
        <>
          A slotted page's whole point is that a record's own identity, its slot index, and its physical offset are two different things, deliberately. Compacting the page moves the offset, and the slot index never has to know. A record too big for the page is rejected cleanly rather than corrupting it, exactly why a real system moves oversized values out of line entirely.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
