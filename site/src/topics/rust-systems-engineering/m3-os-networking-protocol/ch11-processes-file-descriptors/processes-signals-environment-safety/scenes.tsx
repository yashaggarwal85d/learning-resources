import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
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
  const x = lerp(140, 320, easeOut(seg(t, 0.2, 0.6)));
  return (
    <Svg label="command_spawns_a_real_child.rs: a real child" h={200}>
      <circle cx={90} cy={55} r={6} fill={C.taupe} />
      <T x={90} y={38} s={11} a="middle" f={C.quiet}>parent</T>
      <circle cx={x} cy={55} r={6} fill={C.caramel} />
      <T x={x} y={38} s={11} a="middle" f={C.crema}>child, own pid</T>
      <T x={60} y={115} s={13} f={C.mocha} o={fa(t, 0.7, 0.3)}>exit code: exactly 7</T>
      <T x={60} y={145} s={13} f={C.latte} o={fa(t, 1.0, 0.3)}>a real, separate process</T>
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
  const crossAt = 0.5;
  return (
    <Svg label="fork_child_has_one_thread.rs: a real count" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>parent, before fork</T>
      {[0, 1, 2, 3].map((i) => {
        const k = easeOut(seg(t, 0.15 + i * 0.1, 0.15 + i * 0.1 + 0.2));
        return <circle key={i} cx={70 + i * 35} cy={55} r={5} fill={C.taupe} opacity={k} />;
      })}
      <line x1={220} y1={20} x2={220} y2={110} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={220} y={123} s={11} a="middle" f={C.taupe}>fork()</T>
      <circle cx={260} cy={55} r={5} fill={C.caramel} opacity={fa(t, crossAt, 0.2)} />
      <T x={60} y={145} s={13} f={C.mocha} o={fa(t, crossAt + 0.3, 0.3)}>forked child's count: exactly one</T>
      <T x={60} y={175} s={13} f={C.latte} o={fa(t, crossAt + 0.6, 0.3)}>one thread, the rest simply gone</T>
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
  const reapAt = 0.6;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const aliveOpac = pulse * (1 - easeOut(seg(t, reapAt, reapAt + 0.1)));
  return (
    <Svg label="pidfd_fails_after_the_process_is_gone.rs: a real check" h={200}>
      <circle cx={100} cy={55} r={5} fill={C.caramel} opacity={aliveOpac} />
      <T x={60} y={35} s={12} f={C.quiet}>while alive</T>
      <circle cx={300} cy={55} r={5} fill={C.cherryText} opacity={fa(t, reapAt, 0.2)} />
      <T x={260} y={35} s={12} f={C.quiet}>once gone</T>
      <T x={60} y={115} s={13} f={C.mocha} o={fa(t, 0.4, 0.3)}>while alive: the signal succeeds</T>
      <T x={60} y={145} s={13} f={C.latte} o={fa(t, reapAt + 0.3, 0.3)}>once gone: fails outright, ESRCH</T>
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
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  return (
    <Svg label="std::env::set_var's own safety section" h={160}>
      <T x={60} y={50} s={13} f={C.crema} o={fa(t, 0.2, 0.4)}>sound alone on one thread, or on Windows</T>
      <circle cx={430} cy={90} r={5} fill={C.cherryText} opacity={fa(t, 0.6, 0.3) * pulse} />
      <T x={60} y={95} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>elsewhere, multithreaded: never call it at all</T>
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
