import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// An entry is only genuinely committed once it is replicated to a real
// majority under the leader's own current term; conflict repair genuinely
// backs a divergent follower up to the real common prefix, never silently
// corrupting an index.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does repair find the real common prefix (predict) ─────────────────
export function RepairPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a follower's own log genuinely diverges"
        lines={['replicate_with_retry(leader_log, term, &mut follower_log);', '// backs up one entry at a time -- finds it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely finds it (no takeaway, "from" step) ───────────
export function RepairReveal({ t }: StepCtx) {
  const rows = ['the common prefix, found by backing up', 'the divergent suffix, overwritten exactly'];
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does a previous-term majority alone commit (predict) ──────────────
export function PreviousTermPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one entry from a previous term, on a real majority"
        lines={['// a real majority already holds this old entry', 'commit_index_after_replica_count(..) -- committed?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely not committed (takeaway) ───────────────────────
export function PreviousTermReveal({ t }: StepCtx) {
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real majority, but from a previous term</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>genuinely not committed, by that alone</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the real hazard this rule exists to prevent</T>
    </Svg>
  );
}

// ── 5 · Does a current-term entry commit both (predict) ───────────────────
export function CurrentTermPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real entry from the leader's own current term"
        lines={['// replicated to the identical real majority', '// commits only itself, or the earlier one too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: both commit, genuinely (takeaway) ────────────────────────
export function CurrentTermReveal({ t }: StepCtx) {
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the current-term entry, on the same majority</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>both genuinely commit, together</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>one real commitment reaches backward too</T>
    </Svg>
  );
}

// ── 7 · The paper's own words on this exact rule (connecting) ─────────────
export function PaperRuleReveal({ t }: StepCtx) {
  const rows = ['only the current term is counted by replicas', 'earlier entries commit indirectly with it'];
  return (
    <Svg label="Raft Paper, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · A real implementation separates consensus (connecting) ────────────
export function SeparationReveal({ t }: StepCtx) {
  const rows = ['log storage, kept fully separate from state', 'consensus testable against a trivial state'];
  return (
    <Svg label="openraft README, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · All three rules, measured together (takeaway) ──────────────────────
export function CoherenceReveal({ t }: StepCtx) {
  const rows = [
    'repair: the real common prefix, found exactly',
    'a previous term alone: not committed',
    'the current term: commits both, together',
  ];
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={200}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'repair genuinely finds the real common prefix',
    'no index is ever silently corrupted',
    'a past term alone never commits by itself',
    'the current term commits it, and the past too',
  ];
  return (
    <Svg label="recap: a real log, checked against the real rules" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
