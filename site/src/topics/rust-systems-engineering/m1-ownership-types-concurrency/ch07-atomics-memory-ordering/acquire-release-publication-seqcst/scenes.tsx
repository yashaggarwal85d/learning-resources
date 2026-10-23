import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// The publication pattern (Release store, Acquire load) and the SeqCst-only store-buffering
// litmus test are both executed for real by examples.py — loom model-checked where loom can be
// trusted (release_acquire_fix, half_fixed_still_races, store_buffering_acqrel) and compiled-only
// where loom's own tests document a known gap for this exact shape (store_buffering_seqcst).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

// ── 1 · Last topic's race, fixed with two words (hook) ──────────────────────────────────────────
export function RaceRecapHook({ t }: StepCtx) {
  return (
    <Svg label="the relaxed publication race from last topic, and the two words that fix it" h={220}>
      <T x={60} y={60} s={14} f={C.mocha} o={fa(t, 0.3, 0.4)}>data.store(42, Relaxed);</T>
      <T x={60} y={90} s={14} f={C.mocha} o={fa(t, 0.6, 0.4)}>ready.store(true, Relaxed);</T>
      <T x={60} y={130} s={13} f={C.taupe} o={fa(t, 1.0, 0.4)}>loom found: the flag seen before the value</T>
      <T x={60} y={180} s={16} f={C.caramel} o={fa(t, 1.6, 0.4)}>Release. Acquire.</T>
    </Svg>
  );
}

// ── 2 · Release-store, acquire-load it back (predict) ───────────────────────────────────────────
export function ReleaseAcquirePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same pair, now paired properly"
        lines={['data.store(42, Ordering::Relaxed);', 'ready.store(true, Ordering::Release);', '// --- another thread ---', 'if ready.load(Ordering::Acquire) {', '    data.load(Ordering::Relaxed)', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1, 3]}
      />
      <Svg label="does this fix the race loom found last topic?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.6, 0.4)}>only the flag's ordering changed — the data store stays Relaxed</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Fixed: loom finds no violation (no takeaway: the reel's "from" step) ────────────────────
export function FixedReveal({ t }: StepCtx) {
  return (
    <Code
      title="ordering-check/release_acquire_fix.rs — loom explored every interleaving"
      lines={['ready.store(true, Ordering::Release);', '// --- another thread ---', 'if ready.load(Ordering::Acquire) {', '    assert_eq!(data.load(Ordering::Relaxed), 42);', '}', '// loom: no violation found']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[0, 2, 5]}
    />
  );
}

// ── 4 · Why it works: release orders before, acquire orders after (takeaway) ───────────────────
export function WhyPairingWorks({ t }: StepCtx) {
  return (
    <Svg label="release orders everything before it; acquire orders everything after it" h={300}>
      <Draw pts={[[80, 60], [520, 60]]} t={t} from={0.1} to={0.5} stroke={C.taupe} w={1.5} pen={false} />
      <T x={60} y={46} s={11} f={C.taupe}>thread A</T>
      <T x={100} y={80} s={12} f={C.mocha} o={fa(t, 0.5, 0.4)}>store data</T>
      <T x={280} y={80} s={12} f={C.caramel} o={fa(t, 0.9, 0.4)}>Release: store ready</T>
      <Draw pts={[[80, 200], [520, 200]]} t={t} from={0.1} to={0.5} stroke={C.taupe} w={1.5} pen={false} />
      <T x={60} y={186} s={11} f={C.taupe}>thread B</T>
      <T x={100} y={230} s={12} f={C.caramel} o={fa(t, 1.4, 0.4)}>Acquire: load ready</T>
      <T x={340} y={230} s={12} f={C.mocha} o={fa(t, 1.8, 0.4)}>load data</T>
      <Draw pts={[[320, 70], [320, 190]]} t={t} from={1.4} to={1.8} stroke={C.caramel} w={2} pen={false} />
      <T x={60} y={280} s={13} f={C.crema} o={fa(t, 2.3, 0.4)}>a happens-before edge, both sides opted in</T>
    </Svg>
  );
}

// ── 5 · Fixing only the write side doesn't work either (takeaway) ──────────────────────────────
export function HalfFixedReveal({ t }: StepCtx) {
  return (
    <Code
      title="ordering-check/half_fixed_still_races.rs — the load stayed Relaxed"
      dim
      lines={['ready.store(true, Ordering::Release);', '// --- another thread ---', 'if ready.load(Ordering::Relaxed) {', '    assert_eq!(data.load(Ordering::Relaxed), 42);', '}', '// assertion failed: left: 0, right: 42']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[2, 5]}
    />
  );
}

// ── 6 · Two threads, two flags, no shared leader (predict) ─────────────────────────────────────
export function StoreBufferingPredict({ t }: StepCtx) {
  return (
    <Svg label="each thread stores its own flag, then loads the other's" h={260}>
      <rect x={60} y={40} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={140} y={70} s={12} a="middle" f={C.crema}>thread 1: store x, load y</T>
      <rect x={380} y={40} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={460} y={70} s={12} a="middle" f={C.crema}>thread 2: store y, load x</T>
      {threadDot(140, 150, 'x,y', fa(t, 0.5, 0.4))}
      {threadDot(460, 150, 'y,x', fa(t, 0.9, 0.4))}
      <T x={60} y={220} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>every access is Release/Acquire — still safe?</T>
    </Svg>
  );
}

// ── 7 · loom finds it: both loads see 0 (takeaway) ──────────────────────────────────────────────
export function StoreBufferingAcqRelReveal({ t }: StepCtx) {
  return (
    <Code
      title="ordering-check/store_buffering_acqrel.rs — a real found interleaving"
      dim
      lines={['x.store(1, Ordering::Release);', 'let r1 = y.load(Ordering::Acquire);', 'y.store(1, Ordering::Release);', 'let r2 = x.load(Ordering::Acquire);', 'assertion failed: r1 != 0 or r2 != 0', '  left: 0', ' right: 0']}
      t={t}
      start={0.1}
      end={2.8}
      highlight={[1, 3, 4]}
    />
  );
}

// ── 8 · SeqCst adds the one missing thing (takeaway) ────────────────────────────────────────────
export function SeqCstReveal({ t }: StepCtx) {
  return (
    <Svg label="SeqCst: one single order, every thread agrees" h={240}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>Release/Acquire orders one pair at a time</T>
      <T x={60} y={110} s={14} f={C.mocha} o={fa(t, 0.9, 0.4)}>SeqCst: every thread agrees on one global order</T>
      <T x={60} y={170} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>that total order rules out both loads seeing nothing</T>
    </Svg>
  );
}

// ── 9 · A fence carries the same handoff (takeaway) ─────────────────────────────────────────────
export function FenceSpinlockReveal({ t }: StepCtx) {
  return (
    <Code
      title="fence_spinlock.rs — Relaxed CAS, a standalone Acquire fence"
      lines={['while flag.compare_exchange_weak(false, true,', '    Ordering::Relaxed, Ordering::Relaxed).is_err() {}', 'fence(Ordering::Acquire);', '// ... critical section ...', 'flag.store(false, Ordering::Release);']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[2, 4]}
    />
  );
}

// ── 10 · Relaxed is still right for independent counters (takeaway) ────────────────────────────
export function RelaxedCountersReveal({ t }: StepCtx) {
  const positions: [number, number][] = [[60, 170], [150, 190], [240, 170], [330, 190], [420, 170], [510, 190]];
  return (
    <Svg label="independent counters, no publication — nothing for a stronger ordering to add" h={240}>
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.2 + i * 0.1, 0.4)}>
          <circle cx={x} cy={y - 50} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
          {threadDot(x, y, `c${i + 1}`)}
        </g>
      ))}
      <T x={60} y={230} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>each counter only depends on operations on itself</T>
    </Svg>
  );
}

// ── 11 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'release + acquire, both sides, closes the race',
    'Release/Acquire orders a pair, not every thread',
    'SeqCst: one total order, needed for store-load patterns',
    'fences carry the same handoff off the atomic op',
    'Relaxed is still correct with no publication involved',
  ];
  return (
    <Svg label="recap: publication, SeqCst, fences, and when Relaxed is still right" h={340}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
