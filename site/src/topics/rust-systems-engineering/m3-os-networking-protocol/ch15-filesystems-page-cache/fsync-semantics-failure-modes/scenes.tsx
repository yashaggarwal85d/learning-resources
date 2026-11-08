import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Plot, Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// sync_all and sync_data genuinely make different syscalls; a file's fsync and its
// directory's fsync are genuinely two separate calls; and a failed fsync's own retry
// can succeed without having written anything at all.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Several names pour into one idea: a line from each row's dot runs down the left gutter into one node,
// where the idea they share decodes and is locked on.
function Converge({ t, n, y0, dy, at, verdict }: { t: number; n: number; y0: number; dy: number; at: number; verdict: string }) {
  const yN = y0 + n * dy + 5;
  const k = easeOut(seg(t, at + 0.5, at + 0.8));
  const w = 44 + verdict.length * 10;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Draw key={i} pts={[[30, y0 + i * dy], [14, y0 + i * dy], [14, yN], [30, yN]]} t={t} from={at + i * 0.1} to={at + 0.5 + i * 0.1} stroke={C.taupe} w={1.5} />
      ))}
      <circle cx={30} cy={yN} r={7 * k} fill={C.caramel} />
      <Decode text={verdict} t={t} at={at + 0.6} x={48} y={yN + 5} s={14} f={C.caramel} w={600} />
      <Reticle x={20 + w / 2} y={yN} w={w} h={30} t={t} at={at + 1.0} />
    </g>
  );
}

// A list row that lands on its beat: its text slides in from the left while its marker draws
// (a tick for a recap point, a growing dot for one of several names, a cross for a failure).
function Row({ t, at, y, text, mark = 'tick' }: { t: number; at: number; y: number; text: string; mark?: 'tick' | 'dot' | 'cross' }) {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      {mark === 'tick' && <Draw pts={[[23, y], [28, y + 5], [37, y - 6]]} t={t} from={at + 0.1} to={at + 0.4} stroke={C.caramel} w={2} />}
      {mark === 'cross' && <Draw pts={[[25, y - 5], [35, y + 5]]} t={t} from={at + 0.1} to={at + 0.3} stroke={C.cherryText} w={2} />}
      {mark === 'cross' && <Draw pts={[[35, y - 5], [25, y + 5]]} t={t} from={at + 0.25} to={at + 0.45} stroke={C.cherryText} w={2} />}
      {mark === 'dot' && <circle cx={30} cy={y} r={5 * k} fill={C.caramel} />}
      <g opacity={k} transform={`translate(${((1 - k) * -28).toFixed(1)} 0)`}>
        <T x={48} y={y + 6} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
}

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
  // rename() swings the name from the old file to the new one and back, over and over, while a reader samples
  // the length: every sample lands on the old row or the new row, and the band between them stays empty.
  const swing = (() => {
    if (t < 0.4) return 0;
    const n = Math.floor((t - 0.4) / 0.32);
    const k = easeOut(seg((t - 0.4) % 0.32, 0, 0.12));
    const from = n % 2, to = (n + 1) % 2;
    return from + (to - from) * k;
  })();
  const yTip = lerp(60, 140, swing);
  const pattern = [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1];
  return (
    <Svg label="atomic_replace_never_exposes_a_partial_file.rs: a real race" h={230}>
      <rect x={30} y={86} width={80} height={28} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={70} y={105} s={13} a="middle" f={C.crema}>name</T>
      <line x1={110} y1={100} x2={170} y2={yTip} stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.3, 0.2)} />
      <circle cx={170} cy={yTip} r={4} fill={C.caramel} opacity={fa(t, 0.3, 0.2)} />
      <rect x={170} y={46} width={80} height={28} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={210} y={65} s={13} a="middle" f={C.latte}>old</T>
      <rect x={170} y={126} width={80} height={28} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={210} y={145} s={13} a="middle" f={C.latte}>new</T>
      <rect x={280} y={82} width={290} height={36} rx={4} fill="none" stroke={C.mocha} strokeDasharray="3 4" />
      <T x={425} y={105} s={13} a="middle" f={C.cherryText} o={fa(t, 1.6, 0.4)}>a half-written file: never</T>
      <T x={280} y={36} s={13} f={C.taupe} o={fa(t, 0.4, 0.3)}>reader samples</T>
      <Plot pts={pattern.map((p, i) => [292 + i * 18, p ? 140 : 60] as [number, number])} t={t} start={0.5} beat={0.09} r={4} fill={C.crema} />
      <Reticle x={425} y={100} w={300} h={44} t={t} at={2.2} />
      <T x={300} y={210} s={13} a="middle" f={C.latte} o={fa(t, 2.0, 0.4)}>old content or new content, never a mix</T>
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
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="what it promised" />
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
    <Svg label="recap: two real calls, one real sequence, one real lie" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={190} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
