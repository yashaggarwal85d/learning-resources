import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Opens the I/O cost model's sort bound into two phases: run generation, then a k-way merge.
// Running example: 1 TiB of order_events, sorted with 16 GiB of memory in 1 MiB blocks.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A sort never has to fit',
      body: (
        <>
          A hash table that outgrows memory has to spill and recurse. A sort has a different answer: split the work into two phases, make sorted{' '}
          <b>runs</b> that do fit, then <b>merge</b> them. The I/O cost model already priced this; here is what each phase actually does.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'Two phases: make runs, then merge them',
      body: (
        <>
          Sort <b>1 TiB</b> of <code>order_events</code> with <b>16 GiB</b> of memory in <b>1 MiB</b> blocks. Phase one turns the unsorted file into
          sorted pieces that fit in memory. Phase two merges those pieces into one sorted output.
        </>
      ),
      duration: 3.6,
      Visual: S.TwoPhases,
    },
    {
      title: 'Load, sort, spill: quicksort runs',
      body: (
        <>
          Read until memory is full, quicksort that load in place, write it out as one run, repeat. Each run is about one memory load, so <b>1
          TiB / 16 GiB</b> gives <b>64 runs</b>. Simple, cache-friendly, and trivially parallel across workers.
        </>
      ),
      duration: 3.8,
      Visual: S.QuicksortRuns,
    },
    {
      title: 'A snowplow heap makes longer runs',
      body: (
        <>
          Keep a min-heap of the current memory load. Pop the smallest into the run; if the next item read is still larger than what you just wrote,
          it joins the same run instead of starting a new one. On random data this snowplow doubles run length to about <b>2M</b>, giving about{' '}
          <b>32 runs</b> for the same terabyte.
        </>
      ),
      duration: 4.2,
      Visual: S.ReplacementSelection,
    },
    {
      title: 'Predict: why give up the longer runs?',
      body: <>Fewer, longer runs can save a whole merge pass. Yet almost every modern engine abandoned this heap and sorts with quicksort instead. Why?</>,
      duration: 1.8,
      predict: {
        options: [
          { label: 'Longer runs are a myth' },
          { label: 'The cost model counts transfers, but the processor pays in scattered comparisons', correct: true },
          { label: 'Disks got slower' },
          { label: 'It never actually ran faster, even in theory' },
        ],
        explain: (
          <>
            The heap sifts one item at a time, jumping all over memory; quicksort partitions a block that sits in cache. The longer runs rarely saved
            a pass, and the scattered memory access cost more than one extra, cheap merge. PostgreSQL made exactly this switch.
          </>
        ),
      },
      Visual: S.WhyQuicksortPredict,
    },
    {
      title: 'Merge all the runs at once, not two at a time',
      body: (
        <>
          Merging two runs at a time would read and write the whole dataset <b>⌈log₂ k⌉</b> times. Instead, a k-way merge folds every run down in one
          pass: a min-heap holds each run&rsquo;s front item, pops the smallest to the output, and pulls the next item from that run&rsquo;s source.
        </>
      ),
      duration: 4,
      Visual: S.KWayMerge,
    },
    {
      title: 'The merge barely touches memory',
      body: (
        <>
          The heap holds only one item per run, so an M-way merge costs M tuples of memory, nothing like the data it is merging. That is why a merge
          of sorted streams fits in a few lines over generators: hold one record per stream, yield the smallest, forever.
        </>
      ),
      duration: 3.6,
      Visual: S.HeapqMerge,
    },
    {
      title: 'Memory sets the fan-in',
      body: (
        <>
          Every run needs its own read buffer; the output needs one too. <b>16 GiB</b> of memory in <b>1 MiB</b> blocks gives room for{' '}
          <b>16,384</b> buffers, one of them for the output, so the fan-in is <b>16,383</b>: how many runs can merge in a single pass.
        </>
      ),
      duration: 4,
      Visual: S.FanInCalc,
    },
    {
      title: 'Predict: how many passes in total?',
      body: <>64 runs from phase one, a fan-in of 16,383 to merge them with. Add up the run-generation sweep and whatever merging it takes: what does that total come to?</>,
      duration: 1.8,
      predict: {
        options: [{ label: '1' }, { label: '2', correct: true }, { label: '7' }, { label: '64' }],
        explain: (
          <>
            Two: one pass builds 64 runs, and a single merge pass folds all 64 at once, since the fan-in dwarfs them. Merging two runs at a time
            instead would take 7 passes in total.
          </>
        ),
      },
      Visual: S.PassesPredict,
    },
    {
      title: 'More fan-in, smaller buffers, more seeks',
      body: (
        <>
          A bigger fan-in needs fewer passes, but a fixed memory budget split across more runs leaves each read buffer smaller. Small buffers mean
          the merge seeks across the temp file instead of streaming; the model&rsquo;s fan-in is an upper bound, not a free lunch.
        </>
      ),
      duration: 3.8,
      Visual: S.BufferTension,
    },
    {
      title: 'Predict: does maximizing fan-in make it faster?',
      body: <>Crank the fan-in as high as memory allows. The pass count drops by one. Does the sort finish sooner?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Yes, fewer passes always wins' },
          { label: 'Often no: tiny buffers turn streaming reads into seeks', correct: true },
          { label: 'Only on a hard disk' },
          { label: 'Only if the data is already sorted' },
        ],
        explain: (
          <>
            Often no. Thousands of tiny buffers turn sequential reads into a storm of seeks, which is why real engines cap the fan-in at a few
            hundred and will happily pay for an extra pass to keep reads sequential.
          </>
        ),
      },
      Visual: S.MaxFanInPredict,
    },
    {
      title: 'Back to the pipeline: one merge, everywhere',
      body: (
        <>
          An <code>ORDER BY</code> spill, a sort-merge join and an LSM compaction are the same k-way merge wearing different clothes. Learn to tune
          it once, in the only two places that matter: how long the runs come out, and how many merge in a single pass.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
