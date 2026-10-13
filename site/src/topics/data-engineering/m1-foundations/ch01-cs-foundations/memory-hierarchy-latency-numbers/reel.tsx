import type { Reel, StepCtx } from '../../../../../reels/types';
import * as S from './scenes';

const Q1 = (c: StepCtx) => (
  <S.Quiz {...c} chips={['2,000,000 random 8 KB page reads', 'one NVMe drive, 80 µs per read', 'one at a time', 'nothing cached']} Answer={S.Answer1} />
);
const Q2 = (c: StepCtx) => (
  <S.Quiz
    {...c}
    chips={['copy orders: 8.2 GB', 'local NVMe drive (6,800 MB/s) to another machine', 'one TCP connection, no placement group', 'both instances: 25 Gbit/s']}
    Answer={S.Answer2}
  />
);
const Q3 = (c: StepCtx) => (
  <S.Quiz {...c} chips={['1 TiB in 16 MiB ranges', '8 requests in flight, α ≈ 100 ms', '100 Gbit/s instance', 'measured: 18 minutes']} Answer={S.Answer3} />
);

const reel: Reel = {
  steps: [
    {
      title: 'How fast could it possibly be?',
      body: (
        <>
          The nightly job reads all 1 TiB of <code>order_events</code> from a local NVMe drive. The team wants to read it straight from object storage
          instead. Before anyone runs it: what is the least time each way could take? By the end you'll compute both, and the least setting that could make
          them match.
        </>
      ),
      duration: 3.0,
      Visual: S.Problem,
    },
    {
      title: 'RAM read vs object-store wait',
      body: (
        <>
          One read from RAM takes about 100 ns. Object storage takes about 100 ms to send the first byte. How many RAM reads fit into one
          object-storage wait?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: 'About 1,000' }, { label: 'About 100,000' }, { label: 'About 1,000,000', correct: true }, { label: 'About 1,000,000,000' }],
        explain: (
          <>
            About a million: 100 ms ÷ 100 ns = 1,000,000. That is the gap between one second and eleven and a half days. On a linear axis the RAM read
            would be invisible next to the wait, so every latency chart from here on is logarithmic: equal steps are equal multiples. The numbers are
            orders of magnitude; the next steps say where each comes from.
          </>
        ),
      },
      Visual: S.TwoDots,
    },
    {
      title: 'Registers to RAM, in cycles',
      body: (
        <>
          Inside the chip, latency is counted in clock cycles. Intel's manual gives a Skylake server core 4–6 cycles to L1, 14 to L2 and 50–70 to L3.
          Drepper's 2007 rule for main memory is 200 or more. At 2 GHz a cycle is half a nanosecond: L1 is 2–3 ns, DRAM about 100.
        </>
      ),
      duration: 3.6,
      Visual: S.OnChip,
    },
    {
      title: 'Below RAM: drives and network',
      body: (
        <>
          Off the chip, waits jump to microseconds and milliseconds. A random 4 KB read from an enterprise NVMe drive: 80 µs, says Samsung's datasheet.
          A hard disk waits for the platter to turn: Seagate gives 4.16 ms on average at 7,200 rpm, and its 168 random reads a second, measured with 16
          queued, give at least 6 ms each. Object storage: 100–200 ms to the first byte (medians for small requests: tens of ms). The 500 µs round trip
          is from 2009; AWS now shows live medians in its network console, not a fixed figure: read yours there, or measure.
        </>
      ),
      duration: 7.0,
      Visual: S.OffChip,
    },
    {
      title: 'The same RAM, one socket away',
      body: (
        <>
          A server with several sockets gives each its own memory: a <em>NUMA node</em>. Memory on another node is slower to reach. On 2007 Opterons,
          Drepper measured remote reads 20% slower. Linux places a page on the node of the CPU that first touches it, so a thread that moves to another socket
          can leave its memory behind. Pin memory to each node with <code>numactl</code> and time the lab's walk.
        </>
      ),
      duration: 3.6,
      Visual: S.Numa,
    },
    {
      title: 'Latency is not bandwidth',
      body: (
        <>
          Latency is how long until the first byte. Bandwidth is how fast the bytes come after that. They rank the tiers differently. RAM alone runs from
          12 GB/s on one core to a 460.8 GB/s spec peak on one 12-channel socket. Object storage is the slowest rung to answer, yet AWS says one machine can pull up to 100 Gbit/s from it, given enough requests at once. A hard disk is slow on
          both.
        </>
      ),
      duration: 5.6,
      Visual: S.TwoAxes,
    },
    {
      title: 'One transfer: α + n/β',
      body: (
        <>
          Every transfer costs a wait plus the bytes: <b>T(n) = α + n/β</b>. Read 1 MiB and the split depends on the tier: a third waiting on NVMe,
          at least 62% on a hard disk, 98% on object storage even if one request streamed at 625 MB/s (an assumed top speed). Below n = α·β a read is
          mostly waiting: about 0.5 MB on this NVMe drive, at least 1.7 MB on the disk.
        </>
      ),
      duration: 3.8,
      Visual: S.Split,
    },
    {
      title: 'In order or at random, in RAM',
      body: (
        <>
          Lab: read every number in a 1 GiB array, once in order and once in a random order. Same count, same RAM. How much longer does each random
          read take?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: "The same: it's random-access memory" }, { label: 'About 2× longer' }, { label: 'About 20× longer', correct: true }, { label: 'About 1,000× longer' }],
        explain: (
          <>
            Here, 20×. Memory moves 64-byte lines. In order, one line serves eight numbers and the CPU fetches the next lines before you ask. At random,
            each read uses one number of its line and waits, but the CPU overlaps several waits. Make each address depend on the last read and
            nothing overlaps: 158 ns, the whole DRAM wait. Big-O counted all three the same.
          </>
        ),
      },
      Visual: S.RamWalk,
    },
    {
      title: 'Many requests in flight',
      body: (
        <>
          One request at a time pays α every time. With <b>k</b> in flight the waits overlap, so they cost about requests × α / k. One NVMe read takes 80
          µs alone: 12,500 reads a second. To reach the drive's 1,000,000 a second you need at least 80 in flight; Samsung measured it with 128.
        </>
      ),
      duration: 3.8,
      Visual: S.InFlight,
    },
    {
      title: 'The floor is the larger term',
      body: (
        <>
          A job can't finish faster than its bytes take at bandwidth β, or than its waits take with k in flight: the floor is the larger. Read 1 TiB
          sequentially from NVMe: 162 s of bytes, 5 s of waits (α = 20 µs, sequential), bandwidth-bound. Read <code>orders</code> page by page at random from a
          hard disk: 29 s of bytes, 5,952 s of waits (α of at least 6 ms, a floor value), latency-bound. A floor ignores everything else, so a real run is slower.
        </>
      ),
      duration: 7.0,
      Visual: S.Floor,
    },
    {
      title: 'Scanning orders, three ways',
      body: (
        <>
          A full scan is sequential, so its floor is bytes / β. <code>orders</code> is 8.2 GB: 0.7 s from RAM on one core (measured here), 1.2 s from one
          NVMe drive, 29 s from one hard disk. If your scan takes a minute on NVMe, the drive isn't the problem: look for what's spending the other 59
          seconds.
        </>
      ),
      duration: 5.2,
      Visual: S.OrdersRace,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          1 TiB from the NVMe drive: bandwidth-bound, 162 s. From object storage in 16 MiB ranges: 65,536 requests. One at a time, the 100 ms waits alone
          take 1.8 hours. With k in flight they take 6,554 s ÷ k, and with at least k = 41 in flight the floor matches the drive. Each request also streams its 16 MiB, so a
          real run needs more: measure the per-request rate before you promise it.
        </>
      ),
      duration: 6.4,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          Going row by row through an index, a query makes 2,000,000 random 8 KB page reads of <code>orders</code>, one at a time, from one NVMe drive.
          What is the floor?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'About 2 s' }, { label: 'About 160 s', correct: true }, { label: 'About 1.2 s' }, { label: 'About 16 s' }],
        explain: (
          <>
            160 s. One at a time, every read pays its 80 µs wait: 2,000,000 × 80 µs. That's 130 times the 1.2 s it takes to scan the whole table in order.
            With 80 reads in flight the waits fall to 2 s, and the 16 GB of pages, at the drive's best rate of 6,800 MB/s (2.4 s), become the floor. Same count of reads, a floor 66
            times lower.
          </>
        ),
      },
      Visual: Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          You copy <code>orders</code> from a local NVMe drive to another EC2 instance over one TCP connection. The instances are not in a cluster
          placement group (instances packed close together in one availability zone). Floor?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [{ label: 'About 1.2 s' }, { label: 'About 2.6 s' }, { label: 'About 13 s', correct: true }, { label: 'About 29 s' }],
        explain: (
          <>
            13 s. A chain runs at its slowest link. AWS limits a single flow (one TCP connection) to 5 Gbit/s between instances outside a cluster placement group: 625 MB/s, so
            8.2 GB takes 13 s however fast the drive is. A placement group raises one flow to 10 Gbit/s (6.6 s); several connections in parallel can use
            the instance's full bandwidth instead (here 25 Gbit/s: 2.6 s).
          </>
        ),
      },
      Visual: Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          The nightly job reads the 1 TiB from object storage with 8 requests in flight and takes 18 minutes. A teammate says object storage is
          throttling you. Is something broken?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: "Yes: the key prefix's request limit" },
          { label: 'Yes: the network card is full' },
          { label: 'Yes: the store is having a slow day' },
          { label: "No: it's near its floor; raise k", correct: true },
        ],
        explain: (
          <>
            Nothing is broken. With 8 in flight the waits alone take 13.7 minutes, and 18 minutes is only 1.3 times that: near the floor, so k is the limit.
            The job sends at most 80 requests a second against at least 5,500 allowed per key prefix (the start of an object's name), and its bytes need
            88 s of a 100 Gbit/s card. It's latency-bound: raise k, or use fewer, larger ranges.
          </>
        ),
      },
      Visual: Q3,
    },
  ],
};

export default reel;
