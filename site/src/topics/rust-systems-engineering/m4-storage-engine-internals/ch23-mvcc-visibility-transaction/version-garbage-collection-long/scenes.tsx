import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A version becomes reclaimable only once no open snapshot could still
// need it, so one long-running reader genuinely blocks every reclaim
// newer than it, turning into a real, measurable storage-growth
// problem that ending the transaction, not a smarter VACUUM, actually
// fixes.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Do dead versions reclaim while a reader stays open (predict) ─────
export function BlockedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one open reader, four further updates"
        lines={['chain.gc(horizon(&open_readers));', '// any of the four dead versions freed?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: none freed (no takeaway, the test's own "from" step) ───
export function BlockedReveal({ t }: StepCtx) {
  const rows = ['four dead versions, the reader still open', 'reclaimed: none at all'];
  return (
    <Svg label="version_gc_coupled_to_snapshot_lifetime.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does closing the reader free them (predict) ───────────────────────
export function FreedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the reader closes, the identical updates stand"
        lines={['open_readers.clear(); chain.gc(horizon(&open_readers));', '// freed now, or still pinned?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: all four freed (takeaway) ───────────────────────────────
export function FreedReveal({ t }: StepCtx) {
  const versions = [0, 1, 2, 3];
  return (
    <Svg label="version_gc_coupled_to_snapshot_lifetime.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical four dead versions</T>
      {versions.map((i) => {
        const vanish = easeOut(seg(t, 0.5 + i * 0.15, 0.8 + i * 0.15));
        return (
          <circle
            key={i}
            cx={80 + i * 60}
            cy={85}
            r={6}
            fill={C.taupe}
            opacity={fa(t, 0.4 + i * 0.1, 0.2) * (1 - vanish)}
          />
        );
      })}
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={130} s={13} a="middle" f={C.mocha}>genuinely all reclaimed</T>}
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>closing the reader removed the need</T>
    </Svg>
  );
}

// ── 5 · Does the long-lived run retain more (predict) ─────────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical workload, two reader lifetimes"
        lines={['retained_short vs retained_long, same workload', '// the same count, or genuinely different?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the long-lived run retains far more (takeaway) ─────────
export function CompareReveal({ t }: StepCtx) {
  const short = easeOut(seg(t, 0.4, 0.75));
  const long = easeOut(seg(t, 0.8, 1.15));
  return (
    <Svg label="version_gc_coupled_to_snapshot_lifetime.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>short-lived run vs long-lived run</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>short-lived reader</T>
      <rect x={60} y={82} width={short * 60} height={16} rx={3} fill={C.caramel} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>long-lived reader</T>
      <rect x={60} y={119} width={long * 260} height={16} rx={3} fill={C.cherry} opacity={0.85} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>long-lived: far more retained</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a real storage-growth problem</T>
    </Svg>
  );
}

// ── 7 · Does ending the transaction free space VACUUM can't (predict) ────
export function EndTransactionsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own guidance on long-running transactions"
        lines={['// does ending one free space VACUUM alone cannot?', '// or does VACUUM handle it regardless?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · End long-running open transactions directly (takeaway) ───────────
export function EndTransactionsReveal({ t }: StepCtx) {
  const rows = ['end long-running open transactions', 'checked by age(backend_xid), age(backend_xmin)'];
  return (
    <Svg label="PostgreSQL Docs: 24.1. Routine Vacuuming, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · PostgreSQL's own words on the xmin horizon (connecting) ──────────
export function HorizonReveal({ t }: StepCtx) {
  const rows = ['backend_xmin: the current backend\'s own column', 'its value: that backend\'s own xmin horizon'];
  return (
    <Svg label="PostgreSQL Docs: 27.2.3. pg_stat_activity, quoted" h={180}>
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
    'reclaimable: only once no open snapshot needs it',
    'one long reader: blocks everything newer',
    'the result: real, measurable storage growth',
    'the fix: end the transaction, not a smarter VACUUM',
  ];
  return (
    <Svg label="recap: what pins a version, what frees it" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
