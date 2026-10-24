import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Snapshot isolation's own commit rule only checks for same-key writes,
// so it genuinely lets write skew through even while two transactions
// each individually preserve a shared invariant; a stricter,
// dependency-graph check catches exactly that pattern, while correctly
// leaving unrelated transactions alone.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the shared rule survive (predict, hook) ─────────────────────
export function WriteSkewPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two doctors, each sees one other still on call"
        lines={['doctor_a.go_off_call(); doctor_b.go_off_call();', "// does 'at least one on call' survive?"]}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: it breaks (no takeaway, the test's own "from" step) ────
export function WriteSkewReveal({ t }: StepCtx) {
  const rows = ['both doctors: off call', 'the shared rule: violated'];
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does a same-key-only check notice this (predict) ─────────────────
export function NoConflictPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two writes, two different doctors' own rows"
        lines={['txn_a.writes(doctor_0); txn_b.writes(doctor_1);', '// same key anywhere? or genuinely disjoint?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: no conflict at all (takeaway) ───────────────────────────
export function NoConflictReveal({ t }: StepCtx) {
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same-key write check, run for real</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>no conflict found, genuinely</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>never designed to catch this</T>
    </Svg>
  );
}

// ── 5 · Does a dependency graph catch it (predict) ────────────────────────
export function CyclePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two transactions, a dependency graph"
        lines={['rw_antidependency(txn_a, txn_b) && rw_antidependency(txn_b, txn_a)', '// a real cycle, or nothing at all?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: a real two-edge cycle (takeaway) ────────────────────────
export function CycleReveal({ t }: StepCtx) {
  const rows = ["A's read: invalidated by B's write", "B's read: invalidated by A's write"];
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 7 · Does the check over-flag unrelated transactions (predict) ────────
export function NoCyclePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two unrelated transactions, nobody reads the other"
        lines={['rw_antidependency(txn_c, txn_d) && rw_antidependency(txn_d, txn_c)', '// still flagged, or correctly left alone?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: no cycle for unrelated transactions (takeaway) ─────────
export function NoCycleReveal({ t }: StepCtx) {
  return (
    <Svg label="isolation_level_permitted_anomaly.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two transactions, no shared keys at all</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>no cycle found, genuinely</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>not stricter about everything</T>
    </Svg>
  );
}

// ── 9 · PostgreSQL's own words on the serialization anomaly (connecting) ──
export function SerializationAnomalyReveal({ t }: StepCtx) {
  const rows = [
    'inconsistent with every one-at-a-time ordering',
    'that result: a serialization anomaly',
  ];
  return (
    <Svg label="PostgreSQL Docs: 13.2. Transaction Isolation, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'same-key writes: the only thing SI checks',
    'write skew: genuinely let through',
    'a dependency cycle: write skew\'s own signature',
    'unrelated transactions: correctly left alone',
  ];
  return (
    <Svg label="recap: what a stricter check catches and leaves alone" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
