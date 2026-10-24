import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Log first, data later: the same crash survives when the log comes
// first and silently loses the update when it's reversed. Comparing a
// page's own LSN against a record's own LSN makes redo safe to run more
// than once. And a torn page is caught by its own checksum, fixed by
// restoring the log's own already-durable full-page image.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Log-first or data-first: which survives the crash (predict, hook) ──
export function OrderPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same crash, two orderings"
        lines={['log(change); write_page(change);', '// or: write_page(change); log(change);']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: log-first survives, data-first loses it (takeaway) ──────
export function OrderReveal({ t }: StepCtx) {
  const rows = [
    'log first, crash: recovers correctly',
    'page first, crash: lost, silently',
  ];
  return (
    <Svg label="log_first_redo_idempotent_torn_page.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does redo re-apply an already-applied record (predict) ───────────
export function IdempotentPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a record already reflected in the page"
        lines={['redo(old_record, &mut page);', '// re-applied, or a genuine no-op?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: a genuine no-op, twice over (takeaway) ─────────────────
export function IdempotentReveal({ t }: StepCtx) {
  return (
    <Svg label="log_first_redo_idempotent_torn_page.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one old record, one full recovery pass</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>both: a genuine no-op</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>page.lsn already covers both of them</T>
    </Svg>
  );
}

// ── 5 · Does a checksum catch a torn page (predict) ───────────────────────
export function TornPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a page torn by a partial write"
        lines={['page.is_torn(); // part new bytes, part old', '// caught by its own checksum, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: caught and fixed (takeaway) ─────────────────────────────
export function TornReveal({ t }: StepCtx) {
  return (
    <Svg label="log_first_redo_idempotent_torn_page.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a page torn by a partial write</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>checksum mismatch: caught, then fixed</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>fixed from the log's own full-page image</T>
    </Svg>
  );
}

// ── 7 · Why doesn't commit need every page flushed (predict) ─────────────
export function PgWalPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own write-ahead rule"
        lines={['commit(); // which pages must be flushed first?', '// all of them, or none?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · PostgreSQL's own words on WAL (connecting step, NO takeaway) ─────
export function PgWalReveal({ t }: StepCtx) {
  const rows = [
    'data files written only after logging',
    'an unapplied change can be redone later',
  ];
  return (
    <Svg label="PostgreSQL docs, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · PostgreSQL's own full-page write (surprising fact, takeaway) ─────
export function FullPageWriteReveal({ t }: StepCtx) {
  return (
    <Svg label="PostgreSQL docs, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a full image, written before the page</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>PostgreSQL's own name: full-page write</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the same fix this topic just measured</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'log first, data later',
    'the reversed order silently loses it',
    'LSN comparison makes redo safe to repeat',
    'a torn page: caught, fixed from the log',
  ];
  return (
    <Svg label="recap: log first, data later" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
