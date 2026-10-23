import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// This topic's own shape: one owner box (Box), a shared-count box with a plain dial (Rc), and the
// same shape with a lock-glyph border (Arc) — the chapter's new refcount-dial and contention-bar
// visual language from CHAPTER.md §A.5. Every snippet is an exact line of examples/*.rs; every
// claim is executed by examples.py. No digits in any caption text; the contention bar reads its
// contrast qualitatively, never from a hard-coded number.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · One owner, many owners, many owners safely ──────────────────────────────────────────────────
export function OwnershipShapes({ t }: StepCtx) {
  return (
    <Svg label="Box is one owner on the heap; Rc shares that owner on one thread; Arc shares it safely across threads" h={360}>
      <g opacity={fa(t, 0.1, 0.4)}>
        <rect x={60} y={20} width={260} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={51} s={13} a="middle" f={C.crema}>Box, one owner</T>
      </g>
      <g opacity={fa(t, 0.6, 0.4)}>
        <rect x={60} y={90} width={260} height={50} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={190} y={121} s={13} a="middle" f={C.crema}>Rc, shared on one thread</T>
      </g>
      <g opacity={fa(t, 1.1, 0.4)}>
        <rect x={60} y={160} width={260} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={190} y={191} s={13} a="middle" f={C.crema}>Arc, shared safely</T>
      </g>
      <T x={40} y={250} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>all three point at the same heap value</T>
      <T x={40} y={278} s={13} f={C.taupe} o={fa(t, 1.9, 0.4)}>what changes is owners, and safety</T>
    </Svg>
  );
}

// ── 2 · Moving Rc into a new thread (predict) ───────────────────────────────────────────────────────
export function RcNotSend({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/rc_not_send_fail.rs" lines={['let shared = Rc::new(value);', 'thread::spawn(move || { use(shared); });']} t={t} start={0.1} end={1.6} highlight={[0, 1]} />
      <div style={{ opacity: fa(t, 1.8, 0.4) }}>
        <Code title="rustc" lines={['error[E0277]: Rc cannot be sent', 'between threads safely']} t={t} start={1.8} end={2.4} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 3 · A shared count, cheap to touch (no takeaway: the reel's "from" step) ────────────────────────
export function RcShared({ t }: StepCtx) {
  return (
    <Svg label="cloning an Rc bumps a plain count and shares the same allocation; dropping a clone brings the count back down" h={300}>
      <rect x={220} y={30} width={160} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={64} s={13} a="middle" f={C.crema}>the shared Node</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <circle cx={300} cy={140} r={28} fill="none" stroke={C.taupe} strokeWidth={2} />
        <T x={300} y={145} s={14} a="middle" f={C.crema}>count</T>
      </g>
      <T x={120} y={220} s={13} f={C.taupe} o={fa(t, 0.9, 0.4)}>clone bumps it up</T>
      <T x={360} y={220} s={13} f={C.taupe} o={fa(t, 1.4, 0.4)}>drop brings it down</T>
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
export function ContentionPredict({ t }: StepCtx) {
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
      <Svg label="the identical total clone and drop work, once alone and once split across four threads" h={46}>
        <T x={40} y={28} s={13} f={C.taupe} o={fa(t, 2.2, 0.4)}>same total work, two different ways to run it</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · Measuring what contention really costs ──────────────────────────────────────────────────────
export function ContentionBar({ t }: StepCtx) {
  return (
    <Svg label="measured: the contended run took longer than the single uncontended thread doing all of it alone" h={380}>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={100} y={260} width={120} height={60} fill="none" stroke={C.taupe} strokeWidth={2} />
        <T x={160} y={300} s={13} a="middle" f={C.crema}>one thread</T>
      </g>
      <g opacity={fa(t, 0.8, 0.4)}>
        <rect x={340} y={140} width={120} height={180} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={400} y={180} s={13} a="middle" f={C.crema}>four threads</T>
      </g>
      <T x={60} y={340} s={13} f={C.mocha} o={fa(t, 1.4, 0.4)}>contention cost more than</T>
      <T x={60} y={362} s={13} f={C.mocha} o={fa(t, 1.6, 0.4)}>the parallelism gave back</T>
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
  return (
    <Svg label="recap: Box, Rc, Arc, and what Arc's safety actually costs under real contention" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
