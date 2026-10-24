import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Visibility is a function of a version's own metadata and a reader's
// fixed snapshot, never the newest row written; a writer appends a
// new version instead of overwriting one a reader may still need,
// which is exactly what lets reading never block writing and writing
// never block reading.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Which version does an existing reader see (predict, hook) ───────
export function OldVersionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an old committed version, a new uncommitted one"
        lines={['reader.snapshot.visible_version(&chain);', '// old, or the chain\'s own newest row?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the old version, not the newest row (takeaway) ────────
export function OldVersionReveal({ t }: StepCtx) {
  const rows = ['reader sees: the old, committed version', "chain's own tail: the newer, uncommitted one"];
  return (
    <Svg label="snapshot_visibility_version_chain.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does commit change what the reader sees (predict) ───────────────
export function AfterCommitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the writer commits, the reader still waits"
        lines={['writer.commit(); reader.snapshot.visible_version(&chain);', '// unchanged, or now the new version?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: unchanged, even after the commit (takeaway) ───────────
export function AfterCommitReveal({ t }: StepCtx) {
  return (
    <Svg label="snapshot_visibility_version_chain.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same reader, before and after the commit</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>genuinely identical, both times</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a snapshot taken once stays fixed</T>
    </Svg>
  );
}

// ── 5 · Does an update overwrite the old version (predict) ──────────────
export function NoOverwritePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an update, the existing version right there"
        lines={['chain.update(txn, new_value);', '// rewritten in place, or a new version?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: never touched, a new version appended (takeaway) ──────
export function NoOverwriteReveal({ t }: StepCtx) {
  const rows = ["old version's own fields: bit-for-bit unchanged", 'the chain: one new version, appended'];
  return (
    <Svg label="snapshot_visibility_version_chain.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 7 · Does a write ever force a read to wait (predict) ────────────────
export function NeverBlockPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own words on reading and writing"
        lines={['// does a long write force a read to wait,', '// a long read force a write to wait, or neither?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Reading never blocks writing, the reverse too (takeaway) ────────
export function NeverBlockReveal({ t }: StepCtx) {
  const rows = ['reading never blocks writing', 'writing never blocks reading'];
  return (
    <Svg label="PostgreSQL Docs: 13.1. Introduction, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · PostgreSQL's own xmin/xmax columns (connecting) ─────────────────
export function SystemColumnsReveal({ t }: StepCtx) {
  const rows = [
    'xmin: the inserting transaction, per row version',
    'xmax: the deleting transaction, or zero',
  ];
  return (
    <Svg label="PostgreSQL Docs: 5.6. System Columns, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'visibility: version metadata plus the snapshot',
    'never simply the newest row written',
    'a writer appends, it never overwrites',
    'the payoff: neither reads nor writes block',
  ];
  return (
    <Svg label="recap: what a version chain guarantees" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
