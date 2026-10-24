import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Without compaction, every flush is one more file a lookup might have
// to check, forever; real compaction, of either kind, genuinely beats
// that. But leveled and tiered trade real, different costs: tiered
// costs less rewritten data to run, at the price of leaving more files
// and more stale data behind than leveled does.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Flushing forever with no compaction (predict, hook) ──────────────
export function NoCompactionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="many flushes, no compaction, ever"
        lines={['run_no_compaction(&batches);', '// does lookup cost ever stop growing?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: run count keeps growing (takeaway) ──────────────────────
export function NoCompactionReveal({ t }: StepCtx) {
  const rows = ['flush: one more run, every time', 'no merge, ever: nothing shrinks'];
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Do both strategies beat no compaction (predict) ──────────────────
export function BothBeatPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="same flushes, through two real compactors"
        lines={['leveled.run_count(); tiered.run_count();', '// both beat no compaction, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: both beat no compaction (takeaway) ──────────────────────
export function BothBeatReveal({ t }: StepCtx) {
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>no compaction versus either real strategy</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>leveled and tiered: both ahead</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>on read cost and on stale data left behind</T>
    </Svg>
  );
}

// ── 5 · Same workload, same write cost (predict) ──────────────────────────
export function WriteAmpPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same flushes, two different compactors"
        lines={['leveled.write_cost; tiered.write_cost;', '// same rewritten data, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: tiered costs less to run (takeaway) ────────────────────
export function WriteAmpReveal({ t }: StepCtx) {
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same inserts, two different write costs</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>tiered rewrites less data overall</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>leveled merges more often, costs more</T>
    </Svg>
  );
}

// ── 7 · Does cheaper to run mean cheaper to read (predict) ───────────────
export function ReadAmpPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two compactors, a different measure"
        lines={['leveled.run_count(); tiered.run_count();', '// fewer files left behind too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: tiered leaves more behind (takeaway) ────────────────────
export function ReadAmpReveal({ t }: StepCtx) {
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cheaper to run, a cost elsewhere</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>tiered: more files, more stale data</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>leveled: fewer files, less stale data</T>
    </Svg>
  );
}

// ── 9 · RocksDB's own words on write stalls (connecting) ──────────────────
export function WriteStallsReveal({ t }: StepCtx) {
  const rows = [
    'an extensive system to slow writes',
    'when flush or compaction falls behind',
  ];
  return (
    <Svg label="RocksDB Wiki: Write Stalls, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'no compaction: files pile up forever',
    'either real strategy beats that',
    'tiered: cheaper to run',
    'leveled: cheaper to read',
  ];
  return (
    <Svg label="recap: what compacting buys, what it trades" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
