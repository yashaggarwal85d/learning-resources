import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A per-update fsync makes one real syscall per write; batching into WAL-style flush
// points makes a dramatically smaller number for the identical writes, and is also
// dramatically faster — and none of it is durable until a volatile write cache is
// actually forced to tell the truth.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · fsync after every write (predict, hook) ─────────────────────────────────────────────────
export function PerUpdatePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a thousand writes, each followed by a real fsync"
        lines={['for i in 0..1000 {', '    write(record); sync_all()?;', '}', '// how many real fsync syscalls?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: exactly 1000 (this is the swipe test's "from" step — NO takeaway) ─────────────
export function PerUpdateReveal({ t }: StepCtx) {
  return (
    <Svg label="fsync_per_update.rs, traced: one call per write" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a thousand writes, each flushed on its own</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>real fsync syscalls: exactly 1000</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>confirmed by strace, not assumed</T>
    </Svg>
  );
}

// ── 3 · Batching into flush points (predict) ────────────────────────────────────────────────────
export function BatchedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same writes, flushed every fifty records"
        lines={['for i in 0..1000 {', '    write(record);', '    if (i+1) % 50 == 0 { sync_all()?; }', '}']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 4 · Measured: 21 real fsync calls, not 1000 (takeaway) ──────────────────────────────────────
export function BatchedReveal({ t }: StepCtx) {
  return (
    <Svg label="fsync_batched_flush_points.rs: a real trace" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical thousand writes, batched</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>real fsync syscalls: 21, not 1000</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>close to one flush per batch, not a vague cut</T>
    </Svg>
  );
}

// ── 5 · Does the time drop by the same factor? (predict) ────────────────────────────────────────
export function TimingPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two binaries, timed instead of counted"
        lines={['let start = Instant::now();', '// run the per-update loop, then the batched loop', '// does elapsed time drop by the same factor?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 6 · Measured: dramatically faster, for the identical writes (takeaway) ──────────────────────
export function TimingReveal({ t }: StepCtx) {
  return (
    <Svg label="both binaries, timed on the same 1000 writes" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>per-update: a thousand real waits</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>batched: far less real wall-clock time</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>same writes, far less waiting</T>
    </Svg>
  );
}

// ── 7 · What does PostgreSQL's own WAL avoid flushing? (predict) ────────────────────────────────
export function WalDocPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own documentation, on why WAL helps"
        lines={['// a transaction commits:', '// flush the WAL file only, or every data file it touched?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The documentation's own words, quoted (no takeaway, connecting step) ────────────────────
export function WalDocReveal({ t }: StepCtx) {
  return (
    <Svg label="PostgreSQL's own WAL documentation, quoted" h={160}>
      <T x={60} y={70} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>only the WAL file needs flushing, not every file</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>one flush can cover many transactions at once</T>
    </Svg>
  );
}

// ── 9 · A volatile write cache, and what forces it to tell the truth (takeaway) ─────────────────
export function FuaReveal({ t }: StepCtx) {
  const rows = [
    'a volatile cache can signal done too early',
    'FUA forces completion to wait for the write',
  ];
  return (
    <Svg label="the kernel's own write-back-cache documentation" h={160}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'per-update fsync: 1000 real syscalls, measured',
    'batched flush points: 21 real syscalls, measured',
    'batched is also dramatically faster, for the same writes',
    'a WAL flush covers many transactions, docs confirm it',
  ];
  return (
    <Svg label="recap: fewer flushes, less waiting, same durability" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
