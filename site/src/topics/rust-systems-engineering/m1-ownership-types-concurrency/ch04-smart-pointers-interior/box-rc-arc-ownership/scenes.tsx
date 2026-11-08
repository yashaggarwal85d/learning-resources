import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so a reveal can still move. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4.5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}


// This topic's own shape: one owner box (Box), a shared-count box with a plain dial (Rc), and the
// same shape with a lock-glyph border (Arc) — the chapter's new refcount-dial and contention-bar
// visual language from CHAPTER.md §A.5. Every snippet is an exact line of examples/*.rs; every
// claim is executed by examples.py. No digits in any caption text; the contention bar reads its
// contrast qualitatively, never from a hard-coded number.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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

// ── 1 · One owner, many owners, many owners safely ──────────────────────────────────────────────────
export function OwnershipShapes({ t }: StepCtx) {
  // One owner dot drops onto Box; Rc's owner dots arrive one after another from the same side (one
  // thread, in sequence); Arc's owner dots arrive at the same time from spread-out starting points
  // (many threads, at once) — the arrival pattern itself is the safety difference, not just a label.
  const boxDrop = easeOut(seg(t, 0.1, 0.4));
  const ownerY = (row: number) => 20 + row * 70 + 25;
  const rc2 = easeOut(seg(t, 0.7, 0.95));
  const rc3 = easeOut(seg(t, 0.95, 1.2));
  const arc1 = easeOut(seg(t, 1.3, 1.55));
  const arc2 = easeOut(seg(t, 1.3, 1.55));
  const arc3 = easeOut(seg(t, 1.3, 1.55));
  return (
    <Svg label="Box is one owner on the heap; Rc shares that owner on one thread; Arc shares it safely across threads" h={296}>
      <rect x={60} y={20} width={260} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.1, 0.3)} />
      <T x={110} y={51} s={13} a="middle" f={C.crema} o={fa(t, 0.1, 0.3)}>Box, one owner</T>
      <circle cx={280} cy={20 + (1 - boxDrop) * -40 + 25} r={6} fill={C.caramel} opacity={fa(t, 0.1, 0.3)} />

      <rect x={60} y={90} width={260} height={50} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0.6, 0.3)} />
      <T x={105} y={121} s={13} a="middle" f={C.crema} o={fa(t, 0.6, 0.3)}>Rc, one thread</T>
      <circle cx={70 + (1 - rc2) * -40} cy={ownerY(1)} r={6} fill={C.taupe} opacity={rc2 > 0 ? 1 : 0} />
      <circle cx={88 + (1 - rc3) * -40} cy={ownerY(1)} r={6} fill={C.taupe} opacity={rc3 > 0 ? 1 : 0} />

      <rect x={60} y={160} width={260} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={fa(t, 1.1, 0.3)} />
      <T x={95} y={191} s={13} a="middle" f={C.crema} o={fa(t, 1.1, 0.3)}>Arc, shared safely</T>
      <circle cx={70} cy={160 + (1 - arc1) * 50 + 25} r={6} fill={C.mocha} opacity={arc1 > 0 ? 1 : 0} />
      <circle cx={88} cy={160 + (1 - arc2) * -50 + 25} r={6} fill={C.mocha} opacity={arc2 > 0 ? 1 : 0} />
      <circle cx={106} cy={160 + (1 - arc3) * 50 + 25} r={6} fill={C.mocha} opacity={arc3 > 0 ? 1 : 0} />

      <T x={40} y={250} s={13} f={C.taupe} o={fa(t, 1.9, 0.4)}>all three point at the same heap value</T>
      <T x={40} y={278} s={13} f={C.taupe} o={fa(t, 2.2, 0.4)}>what changes is owners, and safety</T>
    </Svg>
  );
}

// ── 2 · Moving Rc into a new thread (predict) ───────────────────────────────────────────────────────
export function RcNotSend({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code title="examples/rc_not_send_fail.rs" lines={['let shared = Rc::new(value);', 'thread::spawn(move || { use(shared); });']} t={t} start={0.1} end={1.6} highlight={[0, 1]} />
      )}
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="rustc" lines={['error[E0277]: Rc cannot be sent', 'between threads safely']} t={s} start={0.1} end={0.7} highlight={[0, 1]} />
        </div>
      )}
    </Stack>
  );
}

// ── 3 · A shared count, cheap to touch (no takeaway: the reel's "from" step) ────────────────────────
export function RcShared({ t }: StepCtx) {
  // A clone token travels up into the count circle (bumping it), then a drop token travels back
  // down out of it (bringing it back down) — the count's own motion carries the idea, not a label.
  const up = easeOut(seg(t, 0.9, 1.2));
  const upY = 220 - up * 80;
  const down = easeOut(seg(t, 1.4, 1.7));
  const downY = 140 + down * 80;
  return (
    <Svg label="cloning an Rc bumps a plain count and shares the same allocation; dropping a clone brings the count back down" h={300}>
      <rect x={220} y={30} width={160} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={64} s={13} a="middle" f={C.crema}>the shared Node</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <circle cx={300} cy={140} r={28} fill="none" stroke={C.taupe} strokeWidth={2} />
        <T x={300} y={145} s={14} a="middle" f={C.crema}>count</T>
      </g>
      <circle cx={180} cy={upY} r={6} fill={C.taupe} opacity={up > 0 && up < 1 ? 1 : 0} />
      <circle cx={420} cy={downY} r={6} fill={C.mocha} opacity={down > 0 && down < 1 ? 1 : 0} />
      <T x={120} y={220} s={13} f={C.taupe} o={fa(t, 0.9, 0.3)}>clone bumps it up</T>
      <T x={360} y={220} s={13} f={C.taupe} o={fa(t, 1.4, 0.3)}>drop brings it down</T>
      <T x={120} y={260} s={12} f={C.mocha} o={fa(t, 1.9, 0.4)}>a plain count, one thread only</T>
    </Svg>
  );
}

// ── 4 · The same shape, safe across threads ─────────────────────────────────────────────────────────
export function ArcShared({ t }: StepCtx) {
  const threads = [
    [100, 220],
    [240, 220],
    [360, 220],
    [500, 220],
  ];
  return (
    <Svg label="four real threads each clone the same Arc, read it, and exit; the count is safe to touch from all of them at once" h={320}>
      <rect x={220} y={20} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={52} s={13} a="middle" f={C.crema}>shared Arc&lt;Node&gt;</T>
      {threads.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.4 + i * 0.3, 0.4)}>
          <Draw pts={[[300, 70], [x + 30, y - 10]]} t={t} from={0.4 + i * 0.3} to={0.7 + i * 0.3} stroke={C.mocha} w={1.5} pen={false} />
          <rect x={x} y={y} width={60} height={40} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
          <T x={x + 30} y={y + 25} s={11} a="middle" f={C.crema}>thread</T>
        </g>
      ))}
      <T x={60} y={290} s={12} f={C.mocha} o={fa(t, 1.9, 0.4)}>an atomic count, safe to touch from all four at once</T>
    </Svg>
  );
}

// ── 5 · Does splitting the work across threads speed it up? (predict) ──────────────────────────────
export function ContentionPredict({ t, portrait }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/arc_contention.rs"
        lines={['clone_drop_loop(&shared, total);   // one thread alone', 'barrier.wait();   // four threads, released together']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 1]}
      />
      {!portrait && (
        <Svg label="the identical total clone and drop work, once alone and once split across four threads" h={34}>
          <T x={40} y={24} s={16} f={C.taupe} o={fa(t, 1.7, 0.4)}>same total work, two different ways to run it</T>
        </Svg>
      )}
    </Stack>
  );
}

// ── 6 · Measuring what contention really costs ──────────────────────────────────────────────────────
export function ContentionBar({ t }: StepCtx) {
  // Both bars grow upward from the baseline (scale), the contended bar visibly taller — the real
  // measured shape of the result, not a label fading onto two static boxes.
  const base = 260;
  const h1 = easeOut(seg(t, 0.2, 0.6)) * 50;
  const h2 = easeOut(seg(t, 0.6, 1.1)) * 140;
  return (
    <Svg label="measured: the contended run took longer than the single uncontended thread doing all of it alone" h={380}>
      <rect x={100} y={base - h1} width={120} height={h1} fill="none" stroke={C.taupe} strokeWidth={2} />
      <T x={160} y={base + 24} s={13} a="middle" f={C.crema} o={fa(t, 0.3, 0.3)}>one thread</T>
      <rect x={340} y={base - h2} width={120} height={h2} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={400} y={base + 24} s={13} a="middle" f={C.crema} o={fa(t, 0.7, 0.3)}>four threads</T>
      <T x={60} y={base + 60} s={13} f={C.mocha} o={fa(t, 1.5, 0.4)}>contention cost more than</T>
      <T x={60} y={base + 82} s={13} f={C.mocha} o={fa(t, 1.7, 0.4)}>the parallelism gave back</T>
    </Svg>
  );
}

// ── 7 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'Box is one owner, just moved onto the heap',
    'Rc shares that owner on one thread, a plain count',
    'Arc shares it safely across threads',
    'that atomic count is cheap only while uncontended',
    'real contention has to be measured, not assumed',
  ];
  return <RecapList t={t} end={3} label="recap: Box, Rc, Arc, and what Arc's safety actually costs under real contention" rows={rows}
      s={14}
    />;
}
