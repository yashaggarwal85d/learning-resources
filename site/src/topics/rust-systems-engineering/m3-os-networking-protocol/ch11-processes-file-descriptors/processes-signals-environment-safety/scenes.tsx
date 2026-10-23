import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A forked child genuinely has one thread; a pidfd genuinely refers to one exact
// process; set_var genuinely races with C's own getenv — three names for one lesson.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="command_spawns_a_real_child.rs: a real child" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>child's pid: genuinely its own</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>exit code: exactly 7</T>
      </g>
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
  return (
    <Svg label="fork_child_has_one_thread.rs: a real count" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>parent's own thread count: several</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>forked child's count: exactly one</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>one thread, the rest simply gone</T>
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
  return (
    <Svg label="pidfd_fails_after_the_process_is_gone.rs: a real check" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>while alive: the signal succeeds</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>once gone: fails outright, ESRCH</T>
      </g>
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
  return (
    <Svg label="std::env::set_var's own safety section" h={160}>
      <T x={60} y={70} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>sound alone on one thread, or on Windows</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>elsewhere, multithreaded: never call it at all</T>
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
    'Command genuinely spawns its own, separate pid',
    'a forked child genuinely has exactly one thread',
    'a pidfd genuinely refers to one exact process',
    "set_var genuinely races with C's own getenv",
  ];
  return (
    <Svg label="recap: a real pid, a real thread count, a real race" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
