import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A recorded history gathered under several real, independent failures can
// be mechanically checked for linearizability; only the failures an actual
// read observes ever show up as a violation, and a brute-force checker
// finds the real answer by genuine enumeration, never by assumption.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the failure history check out (predict) ──────────────────────
export function FailureHistoryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a delayed ack and a duplicated message, injected together"
        lines={['let history = build_history_with_failures(true);', 'check_linearizability(&history) -- consistent with any real order?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely not linearizable (no takeaway, "from" step) ───
export function FailureHistoryReveal({ t }: StepCtx) {
  const rows = ['candidates checked: every real total order', 'genuinely not linearizable'];
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Which failure does the checker name (predict) ──────────────────────
export function AttributionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two failures injected, only one shows up"
        lines={['// delayed ack: a read sees a stale value', '// duplicated message: applied twice, idempotent']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: names the delayed-ack read (takeaway) ────────────────────
export function AttributionReveal({ t }: StepCtx) {
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the checker names the real violation directly</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the delayed-ack read, not the duplicated one</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>idempotent, so the duplicate was harmless</T>
    </Svg>
  );
}

// ── 5 · Does fixing the stale read fix the history (predict) ───────────────
export function FixedHistoryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical failures, the lagging replica now caught up"
        lines={['let history = build_history_with_failures(false);', '// the duplicated message is still injected -- fixed now?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely linearizable now (takeaway) ────────────────────
export function FixedHistoryReveal({ t }: StepCtx) {
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the lagging replica caught up before any read</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>linearizable, failure still injected</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>unobserved failures never show up at all</T>
    </Svg>
  );
}

// ── 7 · How many orders does a concurrent pair allow (predict) ─────────────
export function ConcurrentPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a read genuinely overlapping a write, in real time"
        lines={['// read starts before the write ends, ends before it ends too', 'check_linearizability(&concurrent_history) -- how many real orders?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: exactly two real orders (takeaway) ────────────────────────
export function ConcurrentReveal({ t }: StepCtx) {
  const rows = ['write first or read first: both real orders', 'both genuinely respect real-time precedence'];
  return (
    <Svg label="failure_injection_linearizability_checker.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Jepsen's own real methodology (connecting) ─────────────────────────
export function JepsenReveal({ t }: StepCtx) {
  const rows = ['a generator makes ops; a history records them', 'a nemesis injects real faults', 'a checker decides correctness'];
  return (
    <Svg label="Jepsen README, quoted" h={200}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={36 + i * 42} r={5} fill={C.caramel} />
          <T x={48} y={42 + i * 42} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'two failures injected together: one shows up',
    'the checker names the real one, mechanically',
    'same duplicate, fixed replica: linearizable',
    'a concurrent pair: exactly two real orders',
  ];
  return (
    <Svg label="recap: checking a real history, not assuming it" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
