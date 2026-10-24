import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Time/size retention deletes by age alone; compaction keeps the latest
// value per key forever instead, until a real tombstone genuinely removes
// that key for good.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does retention delete a key's own latest entry (predict) ──────────
export function RetentionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one old entry, one key's own only value"
        lines={['apply_retention(&log, now, max_age);', '// deletes the key\'s own latest entry too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely deleted (no takeaway, "from" step) ────────────
export function RetentionReveal({ t }: StepCtx) {
  const rows = ['the old entry deleted, no key check at all', 'the recent entries for the other key survive'];
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the key's latest entry survive compaction (predict) ──────────
export function CompactionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical log, compaction instead"
        lines={['apply_compaction(&log);', '// the old entry survives, just by being latest?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely survives (takeaway) ─────────────────────────────
export function CompactionReveal({ t }: StepCtx) {
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same old entry, the same key, compaction</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the identical old entry, kept by compaction</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>it is still that key's own latest value</T>
    </Svg>
  );
}

// ── 5 · Does a tombstone remove the key entirely (predict) ────────────────
export function TombstonePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real tombstone, the same key, appended last"
        lines={['Entry { key, value: None, .. }', '// compaction runs past it -- key gone entirely?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely removed (takeaway) ──────────────────────────────
export function TombstoneReveal({ t }: StepCtx) {
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a tombstone, appended after every real entry</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the key disappears; every other key stays</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a tombstone deletes the key, not just a value</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact rule (connecting) ───────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['at least the last state is kept, per key', 'a null payload is a real delete, a tombstone'];
  return (
    <Svg label="Confluent Docs / Apache Kafka design, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · All three outcomes, measured together (takeaway) ───────────────────
export function CoherenceReveal({ t }: StepCtx) {
  const rows = ['retention: deletes by age, not by key', 'compaction: keeps the latest, forever', 'a tombstone: removes the key for good'];
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={200}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · The chapter's own three topics, named directly (connecting) ───────
export function ChapterArcReveal({ t }: StepCtx) {
  const rows = ['order, then delivery, then how long it lasts', 'three topics, one partitioned log, measured'];
  return (
    <Svg label="Chapter 27, measured end to end" h={180}>
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
  const rows = ['retention deletes by age alone', 'compaction keeps the latest value per key', 'a tombstone removes that key for good'];
  return (
    <Svg label="recap: a real log, retention, and compaction" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
