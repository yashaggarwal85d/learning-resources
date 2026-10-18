import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing to look at (the device, the fix), cherry/cherryText = a bad outcome (loss, flush,
// amplification), taupe = quiet/waiting, latte = secondary labels, crema = data, cinnamon = the alternative being compared.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · A write that returns, before it is safe.
export function Problem({ t }: StepCtx) {
  const toCache = easeOut(seg(t, 0.2, 1.1));
  const question = easeOutBack(seg(t, 1.6, 2.4));
  return (
    <Svg label="write() lands bytes in the page cache; the real device below has not seen them yet" h={360}>
      <T x={300} y={40} s={16} f={C.latte} a="middle">write(fd, bytes)</T>
      <rect x={60} y={60} width={120} height={46} rx={10} fill={C.cocoa} stroke={C.mocha} />
      <T x={120} y={88} s={14} f={C.crema} a="middle">your bytes</T>
      <rect x={240} y={60} width={120} height={46} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={88} s={14} f={C.crema} a="middle">page cache</T>
      <circle cx={lerp(180, 240, toCache) + 20} cy={83} r={6} fill={C.caramel} opacity={clamp(toCache * 3)} />
      <T x={420} y={88} s={14} f={C.taupe} a="middle">RAM</T>
      <line x1={420} y1={106} x2={420} y2={190} stroke={C.taupe} strokeDasharray="4 5" />
      <rect x={120} y={210} width={360} height={80} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={300} y={238} s={14} f={C.latte} a="middle">the real device</T>
      <T x={300} y={256} s={13} f={C.taupe} a="middle">platters that must be sought,</T>
      <T x={300} y={280} s={13} f={C.taupe} a="middle">or flash that cannot overwrite in place</T>
      <g transform={`translate(300 320) scale(${question})`} opacity={clamp(question)}>
        <circle r={22} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <T x={0} y={7} s={22} f={C.caramel} a="middle" w={700}>?</T>
      </g>
      <T x={300} y={352} s={13} f={C.taupe} a="middle" o={clamp(question)}>durable yet?</T>
    </Svg>
  );
}

// 2 · A hard disk pays for every seek: a timeline of seek, rotate, transfer, then IOPS vs MB/s bars.
export function SeekTimeline({ t }: StepCtx) {
  const seek = easeOut(seg(t, 0.2, 1.0));
  const rotate = easeOut(seg(t, 1.0, 1.7));
  const xfer = easeOut(seg(t, 1.7, 2.1));
  const bars = easeOut(seg(t, 2.4, 3.4));
  const ratio = 414;
  const seqW = 220;
  const randW = seqW / ratio;
  return (
    <Svg label="A random read on a 7,200 rpm disk pays for a seek and a rotation before any transfer; sequential and random throughput sit about 414 times apart" h={420}>
      <T x={25} y={34} s={14} f={C.latte}>one random read, in series</T>
      <rect x={25} y={48} width={160 * seek} height={28} rx={6} fill={C.cherry} opacity={seek > 0 ? 1 : 0} />
      <T x={25} y={92} s={12} f={C.taupe} o={clamp(seek * 2)}>seek</T>
      <rect x={190} y={48} width={100 * rotate} height={28} rx={6} fill={C.cinnamon} opacity={rotate > 0 ? 1 : 0} />
      <T x={190} y={92} s={12} f={C.taupe} o={clamp(rotate * 2)}>rotate</T>
      <rect x={295} y={48} width={60 * xfer} height={28} rx={6} fill={C.caramel} opacity={xfer > 0 ? 1 : 0} />
      <T x={295} y={92} s={12} f={C.taupe} o={clamp(xfer * 2)}>transfer</T>

      <T x={25} y={160} s={14} f={C.latte}>sequential, MB per second</T>
      <rect x={25} y={176} width={seqW * bars} height={30} rx={7} fill={C.caramel} />
      <T x={30 + seqW * bars} y={196} s={15} f={C.crema} w={600}>285</T>

      <T x={25} y={246} s={14} f={C.latte}>random 4 KiB reads per second</T>
      <rect x={25} y={262} width={Math.max(3, randW * bars)} height={30} rx={7} fill={C.cherry} />
      <T x={30 + Math.max(3, randW * bars)} y={282} s={15} f={C.cherryText} w={600}>168</T>

      <T x={300} y={352} s={30} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.8))}>414×</T>
      <T x={300} y={382} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>same drive, sequential over random</T>
    </Svg>
  );
}

// 3 · Predict: does flash still favor sequential? A seesaw with no mechanical arm beneath it.
export function FlashPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const tilt = answered ? 0 : Math.sin(t * 2.1) * 6;
  return (
    <Svg label="A balance between random and sequential reads on flash, with no head or platter to explain the difference" h={340}>
      <T x={300} y={40} s={14} f={C.latte} a="middle">no head · no platter · no seek</T>
      <g transform={`translate(300 200) rotate(${tilt})`}>
        <rect x={-180} y={-6} width={360} height={10} rx={5} fill={C.mocha} />
        <g transform="translate(-150 0)">
          <line x1={0} y1={0} x2={0} y2={-34} stroke={C.taupe} strokeWidth={2} />
          <rect x={-70} y={-80} width={140} height={46} rx={12} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={0} y={-50} s={14} f={C.crema} a="middle" w={600}>SEQUENTIAL</T>
        </g>
        <g transform="translate(150 0)">
          <line x1={0} y1={0} x2={0} y2={-34} stroke={C.taupe} strokeWidth={2} />
          <rect x={-70} y={-80} width={140} height={46} rx={12} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={0} y={-50} s={14} f={C.crema} a="middle" w={600}>RANDOM</T>
        </g>
      </g>
      {!answered && <T x={300} y={300} s={60} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={300} y={290} s={16} f={C.crema} a="middle">one at a time: latency-bound</T>
          <T x={300} y={316} s={16} f={C.caramel} a="middle">many at once: bandwidth-bound</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Below one block, a write becomes two.
export function BlockAlignment({ t }: StepCtx) {
  const BW = 36, N = 12;
  const x0 = (600 - N * BW) / 2;
  const hit = Math.floor(seg(t, 0.4, 1.0) * (N - 3));
  const rmw = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="A write that straddles a 4 KiB block boundary forces the device to read the whole block, splice in the new bytes, and write it back" h={340}>
      <T x={25} y={34} s={14} f={C.latte}>device blocks, 4 KiB each</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={x0 + i * BW} y={50} width={BW - 3} height={40} rx={4} fill={C.cocoa} stroke={C.mocha} />
      ))}
      <rect x={x0 + 5 * BW} y={50} width={2 * BW - 3} height={40} rx={4} fill="none" stroke={C.cherry} strokeWidth={2} opacity={clamp(hit >= 2 ? 1 : 0)} />
      <T x={x0 + 6 * BW} y={110} s={13} f={C.cherryText} a="middle" o={clamp(hit >= 2 ? 1 : 0)}>your write straddles two blocks</T>

      <g opacity={rmw}>
        <T x={25} y={176} s={14} f={C.latte}>read the whole block</T>
        <rect x={25} y={190} width={200} height={26} rx={6} fill={C.cinnamon} />
        <T x={25} y={246} s={14} f={C.latte}>splice in your bytes</T>
        <rect x={25} y={260} width={200} height={26} rx={6} fill={C.caramel} />
        <T x={25} y={316} s={14} f={C.latte}>write the whole block back</T>
        <rect x={25} y={330} width={200} height={26} rx={6} fill={C.cherry} />
      </g>
      <T x={575} y={300} s={18} f={C.caramel} w={700} a="end" o={rmw}>one write → read + write</T>
    </Svg>
  );
}

// 5 · Flash can only erase in bulk: pages inside an erase block, a stale page relocated.
export function OutOfPlace({ t }: StepCtx) {
  const PW = 48, PH = 30, N = 8;
  const x0 = (600 - N * PW) / 2;
  const moveT = easeOut(seg(t, 1.2, 2.2));
  const eraseGlow = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="A page cannot be overwritten in place; new data goes to a fresh page elsewhere, and the old page waits, stale, for the whole erase block to be wiped" h={360}>
      <T x={25} y={34} s={14} f={C.latte}>one erase block, eight pages</T>
      {Array.from({ length: N }, (_, i) => {
        const stale = i === 2;
        return (
          <g key={i}>
            <rect x={x0 + i * PW} y={50} width={PW - 4} height={PH} rx={4} fill={stale ? C.cherry : C.cocoa} stroke={C.mocha} opacity={stale ? 1 - 0.5 * eraseGlow : 1} />
            <T x={x0 + i * PW + (PW - 4) / 2} y={50 + PH / 2 + 4} s={11} f={C.crema} a="middle">{stale ? 'stale' : 'live'}</T>
          </g>
        );
      })}
      <circle cx={x0 + 2 * PW + (PW - 4) / 2} cy={lerp(50 + PH / 2, 170, moveT)} r={6} fill={C.caramel} opacity={clamp(moveT * 3)} />
      <rect x={x0 + 5 * PW} y={160} width={PW - 4} height={PH} rx={4} fill={C.caramel} opacity={clamp(moveT)} />
      <T x={300} y={222} s={14} f={C.crema} a="middle" o={clamp(moveT)}>new data lands on a fresh page</T>
      <T x={300} y={270} s={14} f={C.cherryText} a="middle" o={eraseGlow}>the old page waits for the block&rsquo;s next erase</T>
      <rect x={x0 - 6} y={44} width={N * PW - 2 + 12} height={PH + 12} rx={10} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={0.6} />
    </Svg>
  );
}

// 6 · Predict: which pattern amplifies writes? Two cleanup passes, one near-empty, one dense with live pages.
export function AmplifyPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const copyA = answered ? 0.1 : 0.5 + 0.3 * Math.sin(t * 2);
  const copyB = answered ? 0.85 : 0.5 + 0.3 * Math.sin(t * 2 + 1);
  const row = (y: number, label: string, frac: number, color: string) => (
    <g key={label}>
      <T x={25} y={y - 10} s={14} f={C.latte}>{label}</T>
      <rect x={25} y={y} width={300} height={26} rx={6} fill={C.cocoa} />
      <rect x={25} y={y} width={300 * clamp(frac)} height={26} rx={6} fill={color} />
      <T x={340} y={y + 19} s={13} f={C.taupe}>live pages to copy</T>
    </g>
  );
  return (
    <Svg label="A cleanup pass over a sequential-stream block copies almost nothing; a cleanup pass over a randomly-written block copies most of its pages" h={320}>
      {row(70, 'sequential stream', copyA, C.caramel)}
      {row(160, 'scattered random writes', copyB, C.cherry)}
      {answered && <T x={300} y={250} s={16} f={C.crema} a="middle">write amplification: flash written ÷ bytes requested</T>}
      {answered && <T x={300} y={278} s={14} f={C.cherryText} a="middle">random pushes it well past one</T>}
    </Svg>
  );
}

// 7 · Spare flash and TRIM push back.
export function Levers({ t }: StepCtx) {
  const op = easeOut(seg(t, 0.3, 1.4));
  const trim = easeOut(seg(t, 1.8, 2.9));
  return (
    <Svg label="Over-provisioned spare flash gives cleanup emptier blocks to reclaim; TRIM tells the drive which pages are garbage the moment a file is deleted" h={340}>
      <T x={25} y={36} s={14} f={C.latte}>over-provisioning: spare flash the host never sees</T>
      <rect x={25} y={50} width={420} height={30} rx={7} fill={C.cocoa} />
      <rect x={25} y={50} width={420 * (1 - 0.15 * op)} height={30} rx={7} fill={C.caramel} opacity={0.9} />
      <rect x={25 + 420 * (1 - 0.15 * op)} y={50} width={420 * 0.15 * op} height={30} rx={7} fill={C.taupe} />
      <T x={25} y={104} s={13} f={C.taupe}>spare capacity, held in reserve</T>

      <T x={25} y={176} s={14} f={C.latte}>TRIM: deleted pages marked garbage at once</T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={25 + i * 46} y={190} width={38} height={30} rx={5} fill={i === 4 || i === 7 ? (trim > 0.5 ? C.taupe : C.cherry) : C.cocoa} opacity={i === 4 || i === 7 ? 1 : 0.7} />
      ))}
      <T x={25} y={250} s={13} f={C.taupe} o={trim}>skipped on the next cleanup pass</T>
      <T x={300} y={310} s={14} f={C.caramel} a="middle" w={600}>leave free space, keep TRIM on</T>
    </Svg>
  );
}

// 8 · fsync forces the cache down.
export function FlushPath({ t }: StepCtx) {
  const toRam = easeOut(seg(t, 0.2, 0.9));
  const toDisk = easeOut(seg(t, 1.4, 2.6));
  const flushCache = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="write() lands dirty pages in RAM; fsync walks them, and metadata, down to the device and flushes the device's own write cache before returning" h={360}>
      <rect x={40} y={60} width={140} height={50} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
      <T x={110} y={90} s={14} f={C.crema} a="middle">page cache (RAM)</T>
      <circle cx={lerp(180, 300, toRam)} cy={85} r={6} fill={C.caramel} opacity={clamp(toRam * 3)} />
      <T x={110} y={48} s={12} f={C.taupe} a="middle">dirty pages</T>

      <rect x={300} y={60} width={120} height={50} rx={10} fill={C.cocoa} stroke={C.mocha} />
      <T x={360} y={90} s={14} f={C.crema} a="middle">fsync</T>
      <circle cx={lerp(420, 540, toDisk)} cy={85} r={6} fill={C.caramel} opacity={clamp(toDisk * 3)} />

      <rect x={450} y={60} width={120} height={50} rx={10} fill={C.roast} stroke={C.mocha} />
      <T x={510} y={90} s={14} f={C.crema} a="middle">device</T>

      <rect x={450} y={150} width={120} height={40} rx={8} fill={C.cherry} opacity={flushCache} />
      <T x={510} y={175} s={13} f={C.cherryText} a="middle" o={flushCache}>cache flushed too</T>
      <T x={300} y={250} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>blocks until the device reports: done</T>
    </Svg>
  );
}

// 9 · The directory needs its own fsync.
export function DirectoryGotcha({ t }: StepCtx) {
  const fileFlush = easeOut(seg(t, 0.3, 1.1));
  const dirFlush = easeOut(seg(t, 1.6, 2.4));
  const crash = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="A file's data can be flushed while the directory entry naming it is still unflushed; a crash can then leave a durable file nothing points to" h={360}>
      <rect x={60} y={60} width={200} height={60} rx={10} fill={C.roast} stroke={fileFlush > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
      <T x={160} y={94} s={14} f={C.crema} a="middle">file: data + metadata</T>
      <T x={160} y={140} s={13} f={fileFlush > 0.5 ? C.caramel : C.taupe} a="middle" o={fileFlush}>fsync(file) ✓</T>

      <rect x={340} y={60} width={200} height={60} rx={10} fill={C.roast} stroke={dirFlush > 0.5 ? C.caramel : C.cherry} strokeWidth={2} />
      <T x={440} y={94} s={14} f={C.crema} a="middle">directory entry</T>
      <T x={440} y={140} s={13} f={dirFlush > 0.5 ? C.caramel : C.cherryText} a="middle">{dirFlush > 0.5 ? 'fsync(dir) ✓' : 'not yet flushed'}</T>

      <g opacity={crash}>
        <path d="M70 220 L160 260 L120 230 L220 280" stroke={C.cherry} strokeWidth={3} fill="none" />
        <T x={300} y={320} s={16} f={C.cherryText} a="middle" w={600}>a durable file nothing points to</T>
      </g>
    </Svg>
  );
}

// 10 · Predict: is a retried fsync safe? Flow of a failed flush, dropped pages, a hollow retry.
export function FsyncGate({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const fail = easeOut(seg(t, 0.3, 1.0));
  const drop = easeOut(seg(t, 1.2, 1.9));
  const retry = easeOut(seg(t, 2.3, 3.0));
  return (
    <Svg label="A failed fsync is reported once, and the kernel marks the dirty pages clean and drops them; a retry then has nothing left to flush" h={340}>
      <T x={25} y={34} s={14} f={C.latte}>fsync call 1</T>
      <rect x={25} y={48} width={160} height={34} rx={7} fill={C.cherry} opacity={fail} />
      <T x={105} y={70} s={13} f={C.crema} a="middle" o={fail}>disk error</T>

      <T x={25} y={116} s={14} f={C.latte} o={drop}>dirty pages</T>
      <rect x={25} y={130} width={60} height={30} rx={6} fill={C.cocoa} opacity={1 - 0.7 * drop} />
      <T x={55} y={150} s={11} f={C.taupe} a="middle" o={1 - drop}>marked clean, contents dropped</T>

      <T x={300} y={222} s={14} f={C.latte}>fsync call 2</T>
      <rect x={300} y={236} width={160} height={34} rx={7} fill={retry > 0.5 ? C.caramel : C.cocoa} opacity={retry} />
      <T x={380} y={258} s={13} f={C.crema} a="middle" o={retry}>reports success</T>
      {answered && <T x={300} y={310} s={15} f={C.cherryText} a="middle">nothing left to flush: the data is already gone</T>}
    </Svg>
  );
}

// 11 · io_uring keeps a fast drive fed: two ring buffers.
export function IoUring({ t }: StepCtx) {
  const N = 8;
  const r = rng(5);
  const slots = Array.from({ length: N }, () => 0.3 + r() * 0.7);
  const spin = (t * 40) % 360;
  const workers = easeOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="An application posts requests on a submission ring and the kernel posts completions on another; one thread keeps many I/Os outstanding" h={380}>
      <g transform={`translate(170 150) rotate(${spin})`}>
        {slots.map((f, i) => {
          const a = (i / N) * Math.PI * 2;
          const lit = (t * 1.3) % N > i;
          return <circle key={i} cx={Math.cos(a) * 90} cy={Math.sin(a) * 90} r={10} fill={lit ? C.caramel : C.cocoa} opacity={f} />;
        })}
      </g>
      <T x={170} y={270} s={13} f={C.latte} a="middle">submission ring</T>

      <g transform={`translate(430 150) rotate(${-spin})`}>
        {slots.map((f, i) => {
          const a = (i / N) * Math.PI * 2;
          const lit = (t * 1.3 - 0.6) % N > i;
          return <circle key={i} cx={Math.cos(a) * 90} cy={Math.sin(a) * 90} r={10} fill={lit ? C.cinnamon : C.cocoa} opacity={f} />;
        })}
      </g>
      <T x={430} y={270} s={13} f={C.latte} a="middle">completion ring</T>

      <line x1={260} y1={150} x2={340} y2={150} stroke={C.taupe} strokeDasharray="4 4" />
      <T x={300} y={320} s={15} f={C.crema} a="middle" o={workers}>PostgreSQL 18: io_method, 3 workers by default</T>
      <T x={300} y={346} s={13} f={C.taupe} a="middle" o={workers}>up to 64 I/Os outstanding per backend</T>
    </Svg>
  );
}

// 12 · Back to the drive, three answers.
export function Verdict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.1, 1.9));
  const c = easeOut(seg(t, 2.0, 2.8));
  const rows = [
    { label: 'sequential vs random', value: '414×', color: C.caramel, o: a },
    { label: 'write amplification', value: 'past one', color: C.cherry, o: b },
    { label: 'durability recipe', value: 'write, fsync, fsync', color: C.cinnamon, o: c },
  ];
  return (
    <Svg label="Three answers for the drive below the cache: a 414 times sequential-to-random gap, write amplification past one on random writes, and a three-step durability recipe" h={320}>
      {rows.map((r, i) => (
        <g key={r.label} opacity={r.o} transform={`translate(0 ${(1 - r.o) * 10})`}>
          <T x={25} y={70 + i * 80} s={15} f={C.latte}>{r.label}</T>
          <T x={25} y={104 + i * 80} s={26} f={r.color} w={700}>{r.value}</T>
        </g>
      ))}
    </Svg>
  );
}
