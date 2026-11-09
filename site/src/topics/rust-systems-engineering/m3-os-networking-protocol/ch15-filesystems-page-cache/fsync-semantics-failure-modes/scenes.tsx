import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Decode } from '../../../../../reels/kit';

// sync_all and sync_data genuinely make different syscalls; a file's fsync and its
// directory's fsync are genuinely two separate calls; and a failed fsync's own retry
// can succeed without having written anything at all.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · sync_all vs sync_data (predict, hook) ───────────────────────────────────────────────────
export function SyncCallPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two real calls, traced with strace"
        lines={['f.sync_all()?;', 'g.sync_data()?;', '// the same real syscall, or two?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: fsync vs fdatasync (this is the swipe test's "from" step — NO takeaway) ───────
export function SyncCallReveal({ t }: StepCtx) {
  return (
    <Svg label="sync_demo.rs, traced: two real syscalls" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>sync_all()</T>
      <Decode text="fsync(fd)" t={t} at={0.3} dur={0.5} x={60} y={60} s={16} f={C.caramel} />
      <T x={60} y={95} s={13} f={C.quiet}>sync_data()</T>
      <Decode text="fdatasync(fd)" t={t} at={0.8} dur={0.5} x={60} y={125} s={16} f={C.mocha} />
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>confirmed by strace, not by the docs alone</T>
    </Svg>
  );
}

// ── 3 · File fsync vs directory fsync (predict) ─────────────────────────────────────────────────
export function DirSyncPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the file's fsync, then the directory's own"
        lines={['f.sync_all()?;', 'dir_fd.sync_all()?;', '// does the first one already cover it?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: two separate real syscalls (takeaway) ────────────────────────────────────────
export function DirSyncReveal({ t }: StepCtx) {
  return (
    <Svg label="directory_fsync_is_a_separate_syscall.rs: a real trace" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>the file's own fsync</T>
      <Decode text="fsync(file_fd)" t={t} at={0.2} dur={0.5} x={60} y={60} s={15} f={C.caramel} />
      <T x={60} y={95} s={13} f={C.quiet}>the directory's own fsync</T>
      <Decode text="fsync(dir_fd)" t={t} at={0.7} dur={0.5} x={60} y={125} s={15} f={C.mocha} />
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.2, 0.3)}>two different handles, two different calls</T>
    </Svg>
  );
}

// ── 5 · Atomic replace vs a racing reader (predict) ─────────────────────────────────────────────
export function AtomicReplacePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="write-temp, fsync, rename, fsync-dir — racing a reader"
        lines={['loop { write_temp(); fsync(); rename(); }', 'loop { read(target); } // on another thread', '// does the reader ever catch it half-written?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: no partial reads, ever (takeaway) ─────────────────────────────────────────────
export function AtomicReplaceReveal({ t }: StepCtx) {
  const flipAt = 0.6;
  const n = 10;
  return (
    <Svg label="atomic_replace_never_exposes_a_partial_file.rs: a real race" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>tens of thousands of concurrent reads</T>
      {Array.from({ length: n }).map((_, i) => {
        const start = 0.1 + i * 0.1;
        const k = easeOut(seg(t, start, start + 0.2));
        const afterFlip = start > flipAt;
        return <circle key={i} cx={60 + i * 36} cy={60} r={5} fill={afterFlip ? C.caramel : C.taupe} opacity={k} />;
      })}
      <line x1={60 + flipAt * 360} y1={40} x2={60 + flipAt * 360} y2={80} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="3 3" opacity={fa(t, flipAt, 0.1)} />
      <T x={60} y={110} s={13} f={C.mocha} o={fa(t, 0.8, 0.3)}>a half-written file: never once observed</T>
      <T x={60} y={140} s={13} f={C.latte} o={fa(t, 1.1, 0.3)}>old content or new content, never a mix</T>
    </Svg>
  );
}

// ── 7 · PostgreSQL's retry (predict) ────────────────────────────────────────────────────────────
export function RetryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a failed fsync, retried exactly as always"
        lines={['let r = file.sync_all();', '// r is Err(EIO) — retry it, as always', '// what actually went wrong?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The paper's own account, quoted (no takeaway, connecting step) ──────────────────────────
export function RetryReveal({ t }: StepCtx) {
  const clearAt = 0.5;
  const cleanedOpac = easeOut(seg(t, clearAt, clearAt + 0.2));
  return (
    <Svg label="the paper's own account of the 2018 incident" h={160}>
      <rect x={60} y={10} width={28} height={28} rx={4} fill={C.cherry} opacity={1 - cleanedOpac * 0.8} />
      <circle cx={100} cy={15} r={4} fill={C.cherryText} opacity={fa(t, 0.3, 0.1) * (1 - easeOut(seg(t, clearAt, clearAt + 0.1)))} />
      <T x={60} y={75} s={13} f={C.crema} o={fa(t, 0.2, 0.4)}>a failed fsync marks the dirty page clean anyway</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>the retry finds nothing left to write, "succeeds"</T>
    </Svg>
  );
}

// ── 9 · One question, three answers (takeaway) ──────────────────────────────────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'sync_all vs sync_data: what gets flushed',
    "a file's fsync vs its directory's",
    'a retried fsync: what success means',
  ];
  return (
    <Svg label="three names, one shared question" h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'sync_all and sync_data differ by syscall',
    "a file's fsync and its directory's are two calls",
    'atomic replace genuinely needs both',
    'a retried fsync can report success, nothing written',
  ];
  return (
    <Svg label="recap: two real calls, one real sequence, one real lie" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
