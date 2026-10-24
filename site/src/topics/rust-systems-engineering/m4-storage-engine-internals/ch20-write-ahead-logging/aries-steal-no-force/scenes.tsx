import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Redo repeats history for everyone first, winners and losers alike. A
// fuzzy checkpoint's own dirty-page bound lets it skip what's already
// durable without skipping anything it needs. And a compensation log
// record bounds undo's own work across repeated failures, which is
// exactly what makes steal and no-force, the high-performance buffer
// policy, safe.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does redo apply committed, uncommitted, or both (predict, hook) ──
export function RedoScopePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one committed txn, one that never did"
        lines={['redo(&wal, start_lsn, &mut pages);', "// which transaction's own updates land?"]}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: both, genuinely (takeaway) ───────────────────────────────
export function RedoScopeReveal({ t }: StepCtx) {
  const rows = [
    'committed transaction: reapplied',
    'uncommitted transaction: reapplied too',
  ];
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does a checkpoint-bounded redo still reach the right state (predict) ──
export function CheckpointPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one page already durable at checkpoint time"
        lines={['redo(&wal, checkpoint_redo_lsn, &mut pages);', '// correct, or missing something older?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: fewer records, identical state (takeaway) ───────────────
export function CheckpointReveal({ t }: StepCtx) {
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a full scan, and a bounded one</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>fewer records, same final state</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>skips only what's already durable</T>
    </Svg>
  );
}

// ── 5 · Does a second crash mid-undo repeat, skip, or resume (predict) ────
export function ClrPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one CLR written, then a second crash"
        lines={['undo_one_txn(&mut wal, t2, cursor, &mut pages);', '// repeats, skips ahead, or resumes exactly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: resumes exactly, one CLR per update (takeaway) ──────────
export function ClrReveal({ t }: StepCtx) {
  return (
    <Svg label="aries_analysis_redo_undo.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two recovery attempts, one loser txn</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>exactly one CLR per update, total</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>resumed right where the first one stopped</T>
    </Svg>
  );
}

// ── 7 · Is a CLR's own effect ever itself undone (predict) ────────────────
export function PaperClrPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the paper's own term for this record"
        lines={['// compensation log record (CLR)', '// is a CLR itself ever undone later?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The paper's own words on CLRs (connecting step, NO takeaway) ──────
export function PaperClrReveal({ t }: StepCtx) {
  const rows = [
    "a CLR's own update is never undone",
    'CLRs are redo-only log records',
  ];
  return (
    <Svg label="ARIES paper, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Why steal + no-force is safe (surprising fact, takeaway) ──────────
export function StealNoForceReveal({ t }: StepCtx) {
  return (
    <Svg label="ARIES paper, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>steal: early write-back. no-force: late</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>redo and undo fix up either case</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>that freedom is why it's the fast policy</T>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'redo repeats history for everyone first',
    "a checkpoint's bound skips only what's durable",
    'a CLR bounds undo across repeated failures',
    'that is why steal and no-force are safe',
  ];
  return (
    <Svg label="recap: who redoes, who undoes, and why" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
