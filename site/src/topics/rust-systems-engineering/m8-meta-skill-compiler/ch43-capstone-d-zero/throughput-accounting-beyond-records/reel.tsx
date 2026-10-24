import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Two implementations can run at the identical real speed while one
// allocates a dramatically larger real cost underneath it, a gap
// records per second, measured alone, never once reveals.
const reel: Reel = {
  steps: [
    {
      title: 'Two real transform implementations process the identical twenty thousand real records, computing the identical real checksum. One borrows each record directly; the other clones it first, needlessly, before doing the identical work. Does that real difference show up in how many real records per second each one processes?',
      body: (
        <>
          Two implementations, the identical real records.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The cloning version is dramatically slower, records per second included' },
          { label: 'Both land within a real, modest band of each other', correct: true },
          { label: 'Only the borrowing version produces a real, measurable number at all' },
        ],
        explain: (
          <>
            Both land close, statistically indistinguishable.
          </>
        ),
      },
      Visual: S.ThroughputPredict,
    },
    {
      title: 'Measured: the real, borrowing implementation and the real, cloning implementation both process several million real records per second, landing within a real, modest band of each other, statistically indistinguishable throughput for the identical real workload',
      body: (
        <>
          Millions of real records per second, either way.
        </>
      ),
      duration: 3.0,
      Visual: S.ThroughputReveal,
    },
    {
      title: 'The identical real workload, this time measured by a real, custom global allocator counting every real byte each implementation actually allocates. Does that real number look as close between the two as records per second did?',
      body: (
        <>
          The identical workload, a different question now.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, since they process the identical records at the identical speed' },
          { label: 'No, the cloning version allocates a dramatically larger number of bytes', correct: true },
          { label: 'Only if the records themselves are unusually large' },
        ],
        explain: (
          <>
            No, the real gap underneath is dramatically larger.
          </>
        ),
      },
      Visual: S.AllocationPredict,
    },
    {
      title: 'Measured: the real, borrowing implementation allocates only a handful of real bytes per record, essentially none of each record own data, while the real, cloning implementation allocates right around each record own full real size, every single time',
      body: (
        <>
          A handful of bytes, against each record own size.
        </>
      ),
      duration: 3.0,
      takeaway: 'Records per second measured the identical real speed; bytes allocated measured a completely different story underneath it.',
      Visual: S.AllocationReveal,
    },
    {
      title: 'The real, measured gap between eight real bytes per record and two hundred eight real bytes per record, for implementations whose own real throughput looked statistically indistinguishable. Is that a modest, incidental difference, or a real, structural one?',
      body: (
        <>
          Two real numbers, a very different story each.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Modest, since the two implementations run at the identical real speed' },
          { label: 'A real, structural difference, over twenty times larger', correct: true },
          { label: 'A difference that only shows up at this exact record size' },
        ],
        explain: (
          <>
            A real, structural gap, over twenty times larger.
          </>
        ),
      },
      Visual: S.GapPredict,
    },
    {
      title: 'Measured: the real, cloning implementation own bytes per record is more than twenty times the real, borrowing implementation own, for the identical real throughput and the identical real checksum result, a real, structural gap a single speed number hid completely',
      body: (
        <>
          The identical speed, a cost over twenty times larger.
        </>
      ),
      duration: 3.0,
      takeaway: 'Two real implementations can run at the identical speed while paying a dramatically different cost underneath.',
      Visual: S.GapReveal,
    },
    {
      title: 'The Rust standard library own documentation on a real global allocator states this directly: a real, registered allocator stands behind every real allocation a running program makes, invoked through functions the program never calls directly',
      body: (
        <>
          A real allocator, in the standard library own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'Records per second alone hides a real allocation cost; bytes allocated per record is what actually exposes it.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: the cost a single number hides',
      body: (
        <>
          Two real transform implementations, run over the identical real workload, can report statistically indistinguishable real throughput while one of them allocates more than twenty times the real bytes per record the other does, a real, structural cost that records per second, measured alone, never once reveals.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
