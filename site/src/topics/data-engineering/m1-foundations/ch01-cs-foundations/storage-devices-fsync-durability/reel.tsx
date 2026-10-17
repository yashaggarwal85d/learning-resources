import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Below the page cache: what makes a device fast or slow, and the exact sequence that makes a write survive a crash.
// Running example: the orders table's write-ahead log, landing on a 7,200 rpm disk or an NVMe SSD. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A write that returns, before it is safe',
      body: (
        <>
          <code>write()</code> copies your bytes into the kernel&rsquo;s page cache and returns. The real device, platters or flash, has not seen them
          yet. Whether they survive a crash depends on what that device does next, and on one more call you have not made.
        </>
      ),
      duration: 3.4,
      Visual: S.Problem,
    },
    {
      title: 'A hard disk pays for every seek',
      body: (
        <>
          Reading in order, a 7,200 rpm drive streams at about <b>285 MB/s</b>. Reading at random, the head must seek and the platter must spin the
          sector into place first: about <b>168</b> random 4 KiB reads a second. Same drive, about <b>414×</b> apart.
        </>
      ),
      duration: 4,
      Visual: S.SeekTimeline,
    },
    {
      title: 'Predict: does flash still favor sequential?',
      body: <>No head, no platter, no seek. On a solid-state drive, is a random read still slower than a sequential one?</>,
      duration: 1.4,
      predict: {
        options: [
          { label: 'No, flash reads anywhere at the same cost' },
          { label: 'Yes, but for a different reason', correct: true },
          { label: 'Only when the drive is nearly full' },
          { label: 'Only for writes, never for reads' },
        ],
        explain: (
          <>
            Yes. One outstanding read waits out the drive&rsquo;s full latency, so a single thread tops out however fast the drive is rated. Only
            many reads in flight at once, spread across the drive&rsquo;s internal chips, reach its rated bandwidth. Sequential access gets that
            spread for free; a lone random read does not.
          </>
        ),
      },
      Visual: S.FlashPredict,
    },
    {
      title: 'Below one block, a write becomes two',
      body: (
        <>
          The drive&rsquo;s real unit is a <b>4 KiB</b> physical block. Write less than that, or straddle its boundary, and the device must read the
          whole block, splice your bytes in, and write it all back: one small write, a read plus a write.
        </>
      ),
      duration: 3.6,
      Visual: S.BlockAlignment,
    },
    {
      title: 'Flash can only erase in bulk',
      body: (
        <>
          A page is written once; the erase block holding it must be wiped clean before any of its space is reused. So nothing is overwritten in
          place: new data goes to a fresh page elsewhere, and the old page is marked stale, waiting to be reclaimed.
        </>
      ),
      duration: 4,
      Visual: S.OutOfPlace,
    },
    {
      title: 'Predict: which pattern amplifies writes?',
      body: (
        <>
          Write the same bytes two ways: one long sequential stream, or scattered random writes. Which one leaves the drive&rsquo;s cleanup copying
          more live data for every byte you asked to write?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'The sequential stream' },
          { label: 'The scattered random writes', correct: true },
          { label: 'Both the same' },
          { label: 'Neither; cleanup is free' },
        ],
        explain: (
          <>
            The random writes. A sequential stream fills whole erase blocks, so cleanup finds almost nothing live to copy. Scattered writes mix live
            and stale pages together, so every cleanup pass copies live data again: <em>write amplification</em>, flash bytes written over bytes you
            asked for, climbs well past one.
          </>
        ),
      },
      Visual: S.AmplifyPredict,
    },
    {
      title: 'Spare flash and TRIM push back',
      body: (
        <>
          Over-provisioning holds spare flash the host can never fill, so cleanup always finds an emptier block to reclaim. TRIM tells the drive the
          instant a file is deleted which pages are garbage, so it stops copying data nobody needs. Skip both, and a full, write-heavy drive can fall
          off a write cliff.
        </>
      ),
      duration: 3.8,
      Visual: S.Levers,
    },
    {
      title: 'fsync forces the cache down',
      body: (
        <>
          A dirty page sits in RAM until something forces it out. <code>fsync</code> walks a file&rsquo;s dirty pages and metadata down to the
          device, tells the device to flush its own write cache too, and blocks until the device reports the transfer complete.
        </>
      ),
      duration: 3.6,
      Visual: S.FlushPath,
    },
    {
      title: 'The directory needs its own fsync',
      body: (
        <>
          Creating a file is two separate facts: the file&rsquo;s data, and the directory entry that names it. <code>fsync</code> on the file reaches
          the data; the directory entry needs a second <code>fsync</code>, on the directory itself, or a crash can strand a durable file nothing
          points to.
        </>
      ),
      duration: 3.8,
      Visual: S.DirectoryGotcha,
    },
    {
      title: 'Predict: is a retried fsync safe?',
      body: <>An fsync call fails with a disk error. You call it again a moment later and it reports success. Is the data durable now?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Yes, the retry proves it landed' },
          { label: 'No, the first failure already discarded it', correct: true },
          { label: 'Only on a filesystem with journaling' },
          { label: 'Only if the write was synchronous' },
        ],
        explain: (
          <>
            No. When writeback fails, the kernel marks those dirty pages clean and drops their contents; the error reaches a caller once and is then
            forgotten. The second call has nothing left to flush, so it reports success over data already gone. PostgreSQL&rsquo;s fix is to crash
            and recover from the write-ahead log instead of trusting a retry.
          </>
        ),
      },
      Visual: S.FsyncGate,
    },
    {
      title: 'io_uring keeps a fast drive fed',
      body: (
        <>
          One ring buffer for requests, one for completions, shared with the kernel: a single thread keeps dozens of reads or writes outstanding
          without a system call each. PostgreSQL <b>18</b> added this as an <code>io_method</code>, defaulting to a pool of <b>3</b> worker
          processes, with up to <b>64</b> I/Os outstanding per backend.
        </>
      ),
      duration: 4,
      Visual: S.IoUring,
    },
    {
      title: 'Back to the drive, three answers',
      body: (
        <>
          Sequential beats random on every device, each for its own mechanical reason: a <b>414×</b> gap on a spinning disk, a queue-depth story on
          flash. Write amplification turns small random writes into far more flash traffic underneath. And durability is a specific recipe, write,
          fsync the file, fsync the directory, with a failure you never retry.
        </>
      ),
      duration: 3.4,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
