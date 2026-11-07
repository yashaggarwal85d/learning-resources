import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
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
  // One line, then one, traces out of the shared location toward each separate question in turn.
  return (
    <Svg label="one shared location, two separate questions about it" h={240}>
      <rect x={220} y={30} width={160} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={60} s={13} a="middle" f={C.crema}>shared memory</T>
      <Draw pts={[[260, 80], [90, 132]]} t={t} from={0.3} to={0.5} stroke={C.latte} w={1.5} pen={false} />
      <T x={60} y={140} s={14} f={C.latte} o={fa(t, 0.5, 0.3)}>did this update tear?</T>
      <Draw pts={[[340, 80], [90, 182]]} t={t} from={0.8} to={1.0} stroke={C.mocha} w={1.5} pen={false} />
      <T x={60} y={190} s={14} f={C.mocha} o={fa(t, 1.0, 0.3)}>what order do others see it in?</T>
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
  // A check mark lands below the proven claim; a bare question mark lands below the untouched one.
  const check = easeOut(seg(t, 0.6, 0.8));
  const mark = easeOut(seg(t, 1.3, 1.5));
  return (
    <Svg label="every access was atomic — nothing here claimed anything about visibility" h={240}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.3)}>no torn value, ever — that's atomicity</T>
      <g transform={`translate(0,${(1 - check) * -14})`}>
        <T x={60} y={84} s={15} f={C.caramel} o={check}>✓ proven</T>
      </g>
      <T x={60} y={130} s={14} f={C.mocha} o={fa(t, 1.0, 0.3)}>when another thread sees it — that's ordering</T>
      <g transform={`translate(0,${(1 - mark) * -14})`}>
        <T x={60} y={154} s={15} f={C.mocha} o={mark}>? open</T>
      </g>
      <T x={60} y={200} s={13} f={C.taupe} o={fa(t, 1.8, 0.4)}>this step only proved the first one</T>
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
  // An arrow draws from one event dot to the next, tracing the happens-before relation itself.
  return (
    <Svg label="the C++20 memory model Rust's atomics follow, minus consume" h={220}>
      <rect x={120} y={30} width={360} height={50} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={300} y={60} s={12} a="middle" f={C.latte}>"Rust atomics currently follow the same rules as C++20"</T>
      <circle cx={120} cy={130} r={5} fill={C.crema} />
      <T x={135} y={134} s={12} f={C.crema}>event A</T>
      <Draw pts={[[195, 130], [405, 130]]} t={t} from={0.6} to={0.9} stroke={C.caramel} w={2} pen />
      <circle cx={480} cy={130} r={5} fill={C.crema} opacity={fa(t, 0.9, 0.2)} />
      <T x={430} y={110} s={12} f={C.crema} o={fa(t, 0.9, 0.2)}>event B</T>
      <T x={60} y={170} s={13} f={C.mocha} o={fa(t, 1.2, 0.4)}>every ordering is built from this one relation</T>
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
  // A dividing line draws itself between the two models, setting LKMM apart rather than just
  // naming it in text.
  return (
    <Svg label="LKMM: a distinct, stricter model, named and set aside" h={200}>
      <T x={60} y={50} s={13} a="middle" f={C.taupe}>C++20 / Rust</T>
      <Draw pts={[[180, 30], [180, 160]]} t={t} from={0.2} to={0.5} stroke={C.mocha} w={2} dash="4 4" pen={false} />
      <T x={300} y={50} s={13} a="middle" f={C.taupe}>LKMM</T>
      <T x={60} y={100} s={14} f={C.crema} o={fa(t, 0.6, 0.3)}>the Linux kernel's own memory model is different</T>
      <T x={60} y={150} s={13} f={C.mocha} o={fa(t, 1.2, 0.4)}>it matters only for kernel Rust</T>
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
