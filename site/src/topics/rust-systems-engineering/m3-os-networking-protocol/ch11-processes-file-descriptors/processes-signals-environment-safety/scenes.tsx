import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A forked child genuinely has one thread; a pidfd genuinely refers to one exact
// process; set_var genuinely races with C's own getenv — three names for one lesson.
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

// ── 1 · Spawn a real child (predict, hook) ──────────────────────────────────────────────────────
export function CommandPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="spawn a real child, then check its pid"
        lines={['let child = Command::new("/bin/sh")', '    .arg("-c").arg("exit 7").spawn()?;', 'child.id() != std::process::id()']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 2 · Measured: own pid, real exit code (this is the swipe test's "from" step — NO takeaway) ──
export function CommandReveal({ t }: StepCtx) {
  const spawn = easeOut(seg(t, 0.5, 0.8));
  const dx = spawn * 100;
  return (
    <Svg label="command_spawns_a_real_child.rs: a real child" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>child's pid: genuinely its own</T>
      <circle cx={60 + dx} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>exit code: exactly 7</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a real, separate process</T>
    </Svg>
  );
}

// ── 3 · fork() from a multithreaded process (predict) ───────────────────────────────────────────
export function ForkPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="several real threads, then a real fork()"
        lines={['for _ in 0..4 { thread::spawn(|| ...); }', 'let pid = libc::fork();', '// how many threads in the child?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: child has exactly one thread (takeaway) ───────────────────────────────────────
export function ForkReveal({ t }: StepCtx) {
  // The parent runs several threads (lanes drawing left to right). fork() copies the process, but only the
  // calling thread crosses into the child; the other lanes reach the boundary and stop dead.
  const lanes = [0, 1, 2, 3];
  const cross = easeOut(seg(t, 1.0, 1.7));
  return (
    <Svg label="fork_child_has_one_thread.rs: a real count" h={230}>
      <rect x={20} y={30} width={240} height={150} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={30} y={50} s={13} f={C.taupe}>parent</T>
      <rect x={340} y={30} width={240} height={150} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.3)} />
      <T x={350} y={50} s={13} f={C.taupe} o={fa(t, 0.9, 0.3)}>forked child</T>
      <T x={300} y={22} s={13} a="middle" f={C.latte} o={fa(t, 0.8, 0.3)}>fork</T>
      {lanes.map((i) => {
        const y = 75 + i * 28;
        const caller = i === 0;
        return (
          <g key={i}>
            <Draw pts={[[40, y], [240, y]]} t={t} from={0.2 + i * 0.1} to={0.8 + i * 0.1} stroke={caller ? C.caramel : C.taupe} w={2} />
            {!caller && <Draw pts={[[240, y], [300, y]]} t={t} from={1.0} to={1.3} stroke={C.cherryText} w={1.5} dash="3 4" pen={false} />}
            {!caller && <circle cx={300} cy={y} r={4 * fa(t, 1.3, 0.2)} fill={C.cherryText} />}
          </g>
        );
      })}
      <Draw pts={[[240, 75], [560, 75]]} t={t} from={1.0} to={1.7} stroke={C.caramel} w={2} />
      <circle cx={lerp(240, 560, cross)} cy={75} r={5} fill={C.caramel} opacity={fa(t, 1.0, 0.2)} />
      <T x={46} y={68} s={13} f={C.crema} o={fa(t, 0.4, 0.3)}>caller</T>
      <Decode text="exactly one thread" t={t} at={1.8} x={460} y={115} s={14} a="middle" f={C.caramel} w={600} />
      <Reticle x={460} y={95} w={200} h={60} t={t} at={2.2} />
      <T x={300} y={214} s={13} a="middle" f={C.latte} o={fa(t, 1.9, 0.4)}>one thread, the rest simply gone</T>
    </Svg>
  );
}

// ── 5 · Signal through a pidfd after exit (predict) ─────────────────────────────────────────────
export function PidfdPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="signal through a pidfd, after the process is gone"
        lines={['child.wait()?; // genuinely reaped', 'pidfd_send_signal(pidfd, 0, null, 0);', '// what happens now?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: succeeds alive, ESRCH once gone (takeaway) ────────────────────────────────────
export function PidfdReveal({ t }: StepCtx) {
  const land = easeOut(seg(t, 0.5, 0.8));
  const dx = land * 120;
  return (
    <Svg label="pidfd_fails_after_the_process_is_gone.rs: a real check" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>while alive: the signal succeeds</T>
      <Draw pts={[[60, 82], [60 + dx, 82]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} pen />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>once gone: fails outright, ESRCH</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>never confused with a new process</T>
    </Svg>
  );
}

// ── 7 · Why set_var became unsafe (predict) ─────────────────────────────────────────────────────
export function SetVarPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="set_var, in the current edition's own signature"
        lines={['pub unsafe fn set_var(key: K, value: V)', '// safe for years — why unsafe now?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 8 · The documented safety contract, quoted (no takeaway, connecting step) ───────────────────
export function SetVarReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="std::env::set_var's own safety section" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>sound alone on one thread, or on Windows</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>elsewhere, multithreaded: never call it at all</T>
      </g>
    </Svg>
  );
}

// ── 9 · One lesson, three names (takeaway) ──────────────────────────────────────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    "fork — a lock nobody's left to release",
    'pidfd — one process, never confused with another',
    'set_var — a global, read without asking',
  ];
  return (
    <Svg label="three names, one shared-state lesson" h={220}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="shared state" />
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'Command genuinely spawns its own, separate pid',
    'a forked child genuinely has exactly one thread',
    'a pidfd genuinely refers to one exact process',
    "set_var genuinely races with C's own getenv",
  ];
  return (
    <Svg label="recap: a real pid, a real thread count, a real race" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={90} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
