import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Bar, C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

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

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

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
          <T x={x} y={y + 5} s={12} a="middle" f={C.crema}>t{i + 1}</T>
        </g>
      ))}
      <T x={60} y={250} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>one shared lock, correct every time</T>
    </Svg>
  );
}

// ── 2 · Does splitting the work across threads help? (predict) ─────────────────────────────────────
export function ContentionPredict({ t, answer }: StepCtx) {
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
        {answer !== null && <T x={40} y={28} s={16} f={C.mocha} o={fa(t, 1.6, 0.4)}>slower than one thread doing it all alone</T>}
      </Svg>
    </Stack>
  );
}

// ── 3 · Sharding: no two threads share a lock (no takeaway: the reel's "from" step) ────────────────
export function Sharding({ t }: StepCtx) {
  const xs = [90, 230, 370, 510];
  const one = easeOut(seg(t, 0.2, 0.6));
  const split = easeInOut(seg(t, 0.8, 1.5)); // the one lock becomes one per thread
  const work = easeOut(seg(t, 1.6, 2.5)); // every shard's work fills at the same time
  return (
    <Svg label="one shared Mutex splits into one shard per thread; each thread works on its own shard and all four finish together, beating both single-lock runs" h={300}>
      {xs.map((x, i) => {
        const cx = lerp(300, x, split);
        const ty = lerp(36 + i * 0 , 64, split);
        const tx = lerp(240 + i * 40, x, split);
        return (
          <g key={i}>
            <g opacity={i === 0 || split > 0 ? one : 0}>
              <rect x={cx - 55} y={110} width={110} height={46} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
              <T x={cx} y={139} s={13} a="middle" f={C.crema}>{split > 0.5 ? 'shard' : 'one Mutex'}</T>
            </g>
            <g opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))}>
              <circle cx={tx} cy={ty} r={15} fill="none" stroke={C.taupe} strokeWidth={1.5} />
              <T x={tx} y={ty + 5} s={12} a="middle" f={C.crema}>t{i + 1}</T>
              <line x1={tx} y1={ty + 15} x2={cx} y2={110} stroke={C.mocha} strokeWidth={1.5} opacity={split} />
            </g>
            <Bar x={x - 55} y={176} w={110 * work} h={10} full={110} fill={C.caramel} o={split > 0.95 ? 1 : 0} />
          </g>
        );
      })}
      <T x={300} y={36} s={13} a="middle" f={C.cherryText} o={one * (1 - split)}>all four wait on one lock</T>
      <T x={60} y={240} s={13} f={C.crema} o={easeOut(seg(t, 2.4, 2.8))}>beats both single-lock runs above</T>
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
export function ArcSwapPredict({ t, answer }: StepCtx) {
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
        {answer !== null && <T x={40} y={28} s={16} f={C.mocha} o={fa(t, 1.6, 0.4)}>never: one complete snapshot, every time</T>}
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
  return <RecapList t={t} end={3} label="recap: one lock, and three ways around it" rows={rows}
      s={14}
    />;
}
