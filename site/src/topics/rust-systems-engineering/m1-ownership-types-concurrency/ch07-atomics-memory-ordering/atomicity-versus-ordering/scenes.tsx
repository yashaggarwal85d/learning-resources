import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// Atomicity (no torn updates) and ordering (visibility between threads) are separate concerns.
// The exact count and the loom-found ordering violation are both executed for real by
// examples.py (rustc 1.97.0, edition 2024, x86_64 Linux; the loom example is built via cargo).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

const threadDot = (cx: number, cy: number, label: string, opacity = 1) => (
  <g opacity={opacity}>
    <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    <T x={cx} y={cy + 4} s={10} a="middle" f={C.crema}>{label}</T>
  </g>
);

// ── 1 · Two separate questions about the same shared memory (hook) ─────────────────────────────
export function TwoQuestionsHook({ t }: StepCtx) {
  // Question 1 (atomicity): a split line races across the shared value, as if two half-writes landed.
  // Question 2 (ordering): two arrows to two observers draw at different speeds, arriving out of step.
  const tearK = easeOut(seg(t, 0.2, 0.7));
  const arrowA = easeOut(seg(t, 1.0, 1.5));
  const arrowB = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="one shared location, two separate questions about it" h={260}>
      <rect x={220} y={16} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={46} s={13} a="middle" f={C.crema}>shared memory</T>
      <line x1={220 + 160 * tearK} y1={16} x2={220 + 160 * tearK} y2={66} stroke={C.cherryText} strokeWidth={2} opacity={tearK > 0 && tearK < 1 ? 1 : 0} />
      <T x={60} y={110} s={14} f={C.latte} o={fa(t, 0.4, 0.4)}>did this update tear?</T>
      <line x1={260} y1={80} x2={lerp(260, 100, arrowA)} y2={lerp(80, 150, arrowA)} stroke={C.mocha} strokeWidth={1.5} opacity={fa(t, 1.0, 0.3)} />
      <line x1={340} y1={80} x2={lerp(340, 500, arrowB)} y2={lerp(80, 150, arrowB)} stroke={C.mocha} strokeWidth={1.5} opacity={fa(t, 1.0, 0.3)} />
      {threadDot(lerp(260, 100, arrowA), lerp(80, 150, arrowA), 'A', arrowA > 0 ? 1 : 0)}
      {threadDot(lerp(340, 500, arrowB), lerp(80, 150, arrowB), 'B', arrowB > 0 ? 1 : 0)}
      <T x={60} y={190} s={14} f={C.mocha} o={fa(t, 1.3, 0.4)}>what order do others see it in?</T>
    </Svg>
  );
}

// ── 2 · Eight threads, one counter (predict) ────────────────────────────────────────────────────
export function EightThreadsPredict({ t }: StepCtx) {
  const positions: [number, number][] = [[60, 180], [150, 200], [240, 180], [330, 200], [420, 180], [510, 200]];
  return (
    <Svg label="eight threads, one AtomicU64, fifty thousand relaxed increments each" h={260}>
      <rect x={250} y={40} width={100} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={70} s={13} a="middle" f={C.crema}>counter</T>
      {positions.map(([x, y], i) => (
        <g key={i} opacity={fa(t, 0.3 + i * 0.12, 0.4)}>
          <Draw pts={[[x, y], [300, 96]]} t={t} from={0.3 + i * 0.12} to={0.5 + i * 0.12} stroke={C.mocha} w={1.5} pen={false} />
          {threadDot(x, y, `t${i + 1}`)}
        </g>
      ))}
      <T x={60} y={240} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>does the final count come out exact?</T>
    </Svg>
  );
}

// ── 3 · Exact (no takeaway: the reel's "from" step) ─────────────────────────────────────────────
export function ExactCountReveal({ t }: StepCtx) {
  return (
    <Code
      title="examples/atomic_no_torn_updates.rs"
      lines={['counter.fetch_add(1, Ordering::Relaxed);', '// eight threads, fifty thousand times each', 'println!("{}", counter.load(Ordering::Relaxed));', '// measured: exact, every run']}
      t={t}
      start={0.1}
      end={2.4}
      highlight={[0, 3]}
    />
  );
}

// ── 4 · Atomicity bought that, but nothing about order (takeaway) ──────────────────────────────
export function AtomicityOnlyReveal({ t }: StepCtx) {
  return (
    <Svg label="every access was atomic — nothing here claimed anything about visibility" h={220}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>no torn value, ever — that's atomicity</T>
      <T x={60} y={110} s={14} f={C.mocha} o={fa(t, 0.9, 0.4)}>when another thread sees it — that's ordering</T>
      <T x={60} y={160} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>this step only proved the first one</T>
    </Svg>
  );
}

// ── 5 · One thread publishes a value, then a flag (predict) ────────────────────────────────────
export function PublicationPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the relaxed publication shape"
        lines={['data.store(42, Ordering::Relaxed);', 'ready.store(true, Ordering::Relaxed);', '// --- another thread ---', 'if ready.load(Ordering::Relaxed) {', '    data.load(Ordering::Relaxed)', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0, 1, 3, 4]}
      />
      <Svg label="can the reader see the flag before the value?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.6, 0.4)}>both stores are Relaxed — no ordering requested</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · loom found it (takeaway) ────────────────────────────────────────────────────────────────
export function LoomViolationReveal({ t }: StepCtx) {
  return (
    <Code
      title="loom-check: model-checked, not a one-off hardware fluke"
      dim
      lines={['assertion `left == right` failed', '  left: 0', ' right: 42', '// the reader saw ready == true,', '// but data had not arrived yet']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[0, 1, 2]}
    />
  );
}

// ── 7 · The missing piece has a name: happens-before (takeaway) ────────────────────────────────
export function HappensBeforeReveal({ t }: StepCtx) {
  // The relation itself draws: event A, an arrow for "happens-before", event B — the one
  // relation every ordering in the model is built from.
  return (
    <Svg label="the C++20 memory model Rust's atomics follow, minus consume" h={240}>
      <rect x={120} y={30} width={360} height={50} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0, 0.3)} />
      <T x={300} y={60} s={12} a="middle" f={C.latte} o={fa(t, 0, 0.3)}>"Rust atomics currently follow the same rules as C++20"</T>
      <circle cx={100} cy={160} r={16} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.6, 0.3)} />
      <T x={100} y={165} s={13} a="middle" f={C.crema} o={fa(t, 0.6, 0.3)}>A</T>
      <Draw pts={[[120, 160], [280, 160]]} t={t} from={0.8} to={1.3} stroke={C.caramel} w={2} />
      <T x={200} y={145} s={11} a="middle" f={C.taupe} o={fa(t, 1.0, 0.3)}>happens-before</T>
      <circle cx={300} cy={160} r={16} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 1.3, 0.3)} />
      <T x={300} y={165} s={13} a="middle" f={C.crema} o={fa(t, 1.3, 0.3)}>B</T>
      <T x={60} y={210} s={13} f={C.mocha} o={fa(t, 1.7, 0.4)}>every ordering is built from this one relation</T>
    </Svg>
  );
}

// ── 8 · Unsynchronized conflicting access is UB (takeaway) ─────────────────────────────────────
export function DataRaceUbReveal({ t }: StepCtx) {
  return (
    <Code
      title="the std library's own definition"
      lines={['// data races are undefined behavior', '// conflicting, non-synchronized accesses', '// where at least one is a write']}
      t={t}
      start={0.1}
      end={2.0}
      highlight={[0, 1, 2]}
    />
  );
}

// ── 9 · The kernel has its own, stricter model (takeaway) ──────────────────────────────────────
export function LkmmReveal({ t }: StepCtx) {
  // The one path this topic follows (C++20) draws straight across; a second path forks off and
  // is labelled LKMM, visibly a different model rather than just a second sentence.
  const forkK = easeOut(seg(t, 0.6, 1.1));
  return (
    <Svg label="LKMM: a distinct, stricter model, named and set aside" h={220}>
      <T x={60} y={40} s={13} f={C.taupe} o={fa(t, 0, 0.3)}>C++20 / Rust</T>
      <Draw pts={[[60, 56], [300, 56]]} t={t} from={0.1} to={0.6} stroke={C.caramel} w={2} />
      <Draw pts={[[300, 56], [500, 56]]} t={t} from={0.6} to={1.0} stroke={C.caramel} w={2} />
      <Draw pts={[[300, 56], [500, lerp(56, 130, forkK)]]} t={t} from={0.6} to={1.1} stroke={C.taupe} w={1.5} dash="4 4" />
      <T x={500} y={150} s={12} a="end" f={C.taupe} o={fa(t, 1.1, 0.3)}>LKMM</T>
      <T x={60} y={90} s={14} f={C.crema} o={fa(t, 1.3, 0.4)}>the Linux kernel's own memory model is different</T>
      <T x={60} y={180} s={13} f={C.mocha} o={fa(t, 1.8, 0.4)}>it matters only for kernel Rust</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'atomicity: no torn updates, proven exact',
    'ordering: a real violation, found by loom',
    'Rust follows C++20, minus consume',
    'a data race is real undefined behavior',
  ];
  return (
    <Svg label="recap: atomicity and ordering, each proven separately" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
