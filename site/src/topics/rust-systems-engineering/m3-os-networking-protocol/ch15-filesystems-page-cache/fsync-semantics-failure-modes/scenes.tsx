import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const trace = easeOut(seg(t, 0.5, 0.85));
  const dx = trace * 110;
  return (
    <Svg label="sync_demo.rs, traced: two real syscalls" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>sync_all() traced as: fsync</T>
      <circle cx={60 + dx} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>sync_data() traced as: fdatasync</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>confirmed by strace, not by the docs alone</T>
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
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the file's own fsync: one real syscall</T>
      <circle cx={260} cy={57} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <Draw pts={[[260, 61], [260, 85]]} t={t} from={0.6} to={0.9} stroke={C.caramel} w={2} pen />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>the directory's own fsync: a second one</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>two different handles, two different calls</T>
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
  const cyclePos = t > 0.4 ? ((t - 0.4) % 0.5) / 0.5 : 0;
  const swap = cyclePos < 0.5 ? 0 : 1;
  return (
    <Svg label="atomic_replace_never_exposes_a_partial_file.rs: a real race" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>tens of thousands of real concurrent reads</T>
      <circle cx={260} cy={57} r={4} fill={swap === 0 ? C.taupe : C.caramel} opacity={fa(t, 0.4, 0.3)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>a half-written file: never once observed</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>old content or new content, never a mix</T>
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
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="the paper's own account of the 2018 incident" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>a failed fsync marks the dirty page clean anyway</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>the retry finds nothing left to write, "succeeds"</T>
      </g>
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
