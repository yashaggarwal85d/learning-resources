import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// mio::Poll's real register -> park -> readiness event -> poll cycle, built directly; the
// timer driver's own wake cycle, measured; io_uring named as real but unstable and opt-in.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Register a connect, then poll (predict, hook) ───────────────────────────────────────────
export function RegisterPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="register a real connect, then poll"
        lines={['poll.registry().register(', '    &mut stream, Token(0), Interest::WRITABLE)?;', 'poll.poll(&mut events, timeout)?;']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a real event (takeaway) ────────────────────────────────────────────────────────
export function RegisterReveal({ t }: StepCtx) {
  return (
    <Svg label="mio_register_then_connect.rs: a real event, named" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>register, then wait</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>writable: Token(0)</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a real event, naming the exact socket</T>
    </Svg>
  );
}

// ── 3 · A socket that never becomes ready (predict) ─────────────────────────────────────────────
export function TimeoutPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="registered, but nothing is ever written"
        lines={['poll.registry().register(', '    &mut stream, Token(0), Interest::READABLE)?;', '// nothing ever arrives']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 4 · Measured: parked for the timeout (takeaway) ──────────────────────────────────────────────
export function TimeoutReveal({ t }: StepCtx) {
  return (
    <Svg label="mio_poll_times_out_with_nothing_ready.rs: a real, measured wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>parked, waiting for nothing</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>waited: the full timeout</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>zero events, measured directly</T>
    </Svg>
  );
}

// ── 5 · sleep, timed (predict) ───────────────────────────────────────────────────────────────────
export function SleepPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a plain sleep, timed precisely"
        lines={['let start = Instant::now();', 'sleep(Duration::from_millis(200)).await;', 'println!("{:?}", start.elapsed());']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: wakes on time (takeaway) ───────────────────────────────────────────────────────
export function SleepReveal({ t }: StepCtx) {
  return (
    <Svg label="sleep_actually_wakes_at_deadline.rs: close to the real deadline" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>asked for 200ms</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>woke at: 201ms</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the thing that actually calls wake</T>
    </Svg>
  );
}

// ── 7 · io_uring the default? (predict) ──────────────────────────────────────────────────────────
export function UringPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a newer way of doing fast I/O"
        lines={['// io_uring: faster, newer, Linux-only', '// is this the default path now?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 8 · The real feature-flag text (no takeaway, naming step) ──────────────────────────────────
export function UringReveal({ t }: StepCtx) {
  return (
    <Code
      title="tokio crate docs: unstable features"
      lines={['io-uring: Enables io-uring (Linux only).', '// requires --cfg tokio_unstable']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 9 · The full cycle, closed (no takeaway, connecting step) ──────────────────────────────────
export function CycleReveal({ t }: StepCtx) {
  const steps = ['register', 'park', 'real event', 'wake', 'poll again'];
  return (
    <Svg label="the cycle, each step now measured" h={160}>
      {steps.map((s, i) => (
        <g key={s} opacity={fa(t, 0.2 + i * 0.3, 0.4)}>
          <T x={60 + i * 100} y={70} s={12} f={C.crema}>{s}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'registering and polling delivers a real, named event',
    'with nothing ready, poll genuinely parks for the timeout',
    'a timer wakes a sleep close to its real deadline',
    'io_uring is real, but still unstable and opt-in',
  ];
  return (
    <Svg label="recap: a real cycle, measured end to end" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
