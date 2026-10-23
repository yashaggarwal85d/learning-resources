import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// One shared lock vs three ways around it: four threads funneled through one lock, four threads
// each with their own lock, one owner reached by messages, and a lock-free read-mostly swap.
// Every snippet is an exact line of examples/*.rs; every claim is executed by examples.py. No
// digits in any caption text; contention numbers read qualitatively, never hard-coded.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDots = (cx: number, cy: number, opacity: number) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
  </g>
);

// ── 1 · The reflex: wrap it in Arc<Mutex<T>> ────────────────────────────────────────────────────────
export function MutexReflex({ t }: StepCtx) {
  return (
    <Svg label="four real threads increment a shared counter through one Arc Mutex; the final count is exact" h={300}>
      <rect x={250} y={30} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>counter</T>
      {[[90, 170], [220, 170], [350, 170], [480, 170]].map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.4 + i * 0.25, 0.4)}>
          <Draw pts={[[x, y], [300, 86]]} t={t} from={0.4 + i * 0.25} to={0.65 + i * 0.25} stroke={C.mocha} w={1.5} pen={false} />
          {threadDots(x, y, 1)}
          <T x={x} y={y + 5} s={11} a="middle" f={C.crema}>t{i + 1}</T>
        </g>
      ))}
      <T x={60} y={250} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>one shared lock, correct every time</T>
    </Svg>
  );
}

// ── 2 · Does splitting the work across threads help? (predict) ─────────────────────────────────────
export function ContentionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/mutex_contention.rs"
        lines={['barrier.wait();   // four threads, released together', 'increment_loop(&c, per_thread);   // through one Mutex']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1]}
      />
      <Svg label="measured: the four-thread run took several times longer than one thread alone" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>slower than one thread doing it all alone</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Sharding: no two threads share a lock (no takeaway: the reel's "from" step) ────────────────
export function Sharding({ t }: StepCtx) {
  return (
    <Svg label="each thread gets its own independent Mutex; no two threads ever contend for the same lock" h={300}>
      {[[90, 110], [250, 110], [410, 110], [570, 110]].map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.2 + i * 0.3, 0.4)}>
          <rect x={x - 45} y={y} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} />
          <T x={x} y={y + 29} s={12} a="middle" f={C.crema}>shard</T>
          <circle cx={x} cy={y - 26} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
          <T x={x} y={y - 21} s={11} a="middle" f={C.crema}>t{i + 1}</T>
        </g>
      ))}
      <T x={60} y={220} s={13} f={C.mocha} o={fa(t, 1.6, 0.4)}>beats both single-lock runs above</T>
    </Svg>
  );
}

// ── 4 · An owner task, reached only by channel ──────────────────────────────────────────────────────
export function OwnerTask({ t }: StepCtx) {
  return (
    <Svg label="one thread owns the counter outright; every other thread only ever sends a message" h={280}>
      <rect x={230} y={30} width={140} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>owner thread</T>
      {[[90, 170], [220, 170], [380, 170], [510, 170]].map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.4 + i * 0.25, 0.4)}>
          <Draw pts={[[x, y], [300, 86]]} t={t} from={0.4 + i * 0.25} to={0.65 + i * 0.25} stroke={C.taupe} w={1.5} pen={false} />
          {threadDots(x, y, 1)}
          <T x={x} y={y + 5} s={11} a="middle" f={C.crema}>send</T>
        </g>
      ))}
      <T x={60} y={230} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>no lock anywhere in this picture</T>
    </Svg>
  );
}

// ── 5 · Can a reader see a half-updated config? (predict) ──────────────────────────────────────────
export function ArcSwapPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/arc_swap_config.rs"
        lines={['let snapshot = reader_shared.load();', 'shared.store(Arc::new(Config { version: v }));']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1]}
      />
      <Svg label="never: each load returns one complete, consistent snapshot" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.2, 0.4)}>never: one complete snapshot, every time</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · arc-swap: a lock-free swap for read-mostly data ─────────────────────────────────────────────
export function ArcSwapFig({ t }: StepCtx) {
  return (
    <Svg label="readers load with no lock at all; a writer store swaps in a whole new Arc atomically" h={280}>
      <rect x={220} y={30} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>ArcSwap&lt;Config&gt;</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[300, 82], [120, 160]]} t={t} from={0.5} to={0.7} stroke={C.taupe} w={1.5} pen={false} />
        <T x={60} y={185} s={12} f={C.crema}>readers: load, no lock</T>
      </g>
      <g opacity={fa(t, 1.0, 0.4)}>
        <Draw pts={[[300, 82], [480, 160]]} t={t} from={1.0} to={1.2} stroke={C.mocha} w={1.5} pen={false} />
        <T x={380} y={185} s={12} f={C.crema}>writer: atomic swap</T>
      </g>
      <T x={60} y={240} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>built for data read often, changed rarely</T>
    </Svg>
  );
}

// ── 7 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'one shared lock serializes every access',
    'sharding removes the shared lock entirely',
    'an owner task trades the lock for a queue',
    'arc-swap gives read-mostly data a lock-free read',
  ];
  return (
    <Svg label="recap: one lock, and three ways around it" h={280}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
