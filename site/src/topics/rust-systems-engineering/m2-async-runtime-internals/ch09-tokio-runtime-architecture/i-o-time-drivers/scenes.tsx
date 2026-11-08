import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// mio::Poll's real register -> park -> readiness event -> poll cycle, built directly; the
// timer driver's own wake cycle, measured; io_uring named as real but unstable and opt-in.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

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
  const drop = easeOut(seg(t, 0.9, 1.3));
  const dy = (1 - drop) * -30;
  return (
    <Svg label="mio_register_then_connect.rs: a real event, named" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>register, then wait</T>
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g transform={`translate(0,${dy})`} opacity={drop}>
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
  const grow = easeOut(seg(t, 0.9, 1.3));
  const w = grow * 220;
  return (
    <Svg label="mio_poll_times_out_with_nothing_ready.rs: a real, measured wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>parked, waiting for nothing</T>
      <rect x={60} y={85} width={w} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>waited: 300ms, the full timeout</T>}
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
  const target = easeOut(seg(t, 0.3, 0.9));
  const dotX = 60 + target * 215;
  return (
    <Svg label="sleep_actually_wakes_at_deadline.rs: close to the real deadline" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>asked for 200ms</T>
      <circle cx={dotX} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.3, 0.3)} />
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
  const g1 = easeInOut(seg(t, 0.5, 0.9)); // the build passes the Linux-only gate
  const flag = easeInOut(seg(t, 1.0, 1.5)); // the explicit cfg flag slides in
  const open = easeOut(seg(t, 1.5, 1.8));
  const g2 = easeInOut(seg(t, 1.8, 2.3));
  const x = lerp(lerp(60, 230, g1), 470, g2);
  return (
    <Stack>
      <Code title="tokio crate docs: unstable features" lines={['io-uring: Enables io-uring (Linux only).', '// requires --cfg tokio_unstable']} t={t} start={0.1} end={0.5} highlight={t > 1.0 ? [1] : [0]} />
      <Svg label="to reach io-uring a build passes a Linux-only gate, then a second gate that opens only once --cfg tokio_unstable is passed explicitly" h={160} fill>
        <line x1={30} y1={80} x2={570} y2={80} stroke={C.mocha} strokeWidth={1.5} />
        <line x1={180} y1={50} x2={180} y2={110} stroke={C.crema} strokeWidth={3} />
        <T x={180} y={36} s={13} a="middle" f={C.latte}>Linux only</T>
        <line x1={360} y1={50} x2={360} y2={lerp(110, 60, open)} stroke={open > 0.5 ? C.caramel : C.cherryText} strokeWidth={3} />
        <T x={360} y={36} s={13} a="middle" f={C.latte}>unstable</T>
        <g transform={`translate(${lerp(-160, 0, flag).toFixed(1)} 0)`} opacity={flag}>
          <rect x={170} y={118} width={220} height={26} rx={13} fill={C.cinnamon} />
          <T x={280} y={136} s={12} a="middle" f={C.espresso} w={700}>--cfg tokio_unstable</T>
        </g>
        <rect x={470} y={58} width={100} height={44} rx={8} fill={g2 >= 1 ? C.cocoa : 'none'} stroke={g2 >= 1 ? C.caramel : C.mocha} strokeWidth={1.5} />
        <T x={520} y={85} s={13} a="middle" f={g2 >= 1 ? C.caramel : C.taupe}>io-uring</T>
        {g1 > 0 && g2 < 1 && <circle cx={x} cy={80} r={8} fill={C.crema} />}
        <T x={520} y={36} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.3, 2.6))}>opt-in</T>
      </Svg>
    </Stack>
  );
}

// ── 9 · The full cycle, closed (no takeaway, connecting step) ──────────────────────────────────
export function CycleReveal({ t }: StepCtx) {
  const steps = ['register', 'park', 'real event', 'wake', 'poll again'];
  return (
    <Svg label="the cycle, each step now measured" h={160}>
      {steps.slice(0, -1).map((_, i) => (
        <Draw key={`l${i}`} pts={[[60 + i * 100 + 55, 70], [60 + (i + 1) * 100, 70]]} t={t} from={0.3 + i * 0.3} to={0.5 + i * 0.3} stroke={C.taupe} w={1.5} />
      ))}
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
    'with nothing ready, poll truly parks for the timeout',
    'a timer wakes a sleep close to its real deadline',
    'io_uring is real, but still unstable and opt-in',
  ];
  return <RecapList t={t} end={3} label="recap: a real cycle, measured end to end" rows={rows} step={55}
      s={13}
    />;
}
