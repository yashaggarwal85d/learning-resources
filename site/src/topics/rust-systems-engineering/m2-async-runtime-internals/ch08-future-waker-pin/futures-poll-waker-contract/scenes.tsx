import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A hand-rolled Future and a minimal executor (Waker built from Arc<Task> via std::task::Wake),
// with no async/.await sugar and no hidden thread doing the work. Both outcomes — the completed
// run and the real, timed-out hang — are executed for real by examples.py (rustc 1.97.0, edition
// 2024; no external crate needed, std::task::Wake has been stable since std 1.51).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · A value that does nothing until something asks (hook) ──────────────────────────────────
export function InertFutureHook({ t }: StepCtx) {
  // A tick mark sweeps back and forth across the thread's box, showing it already progressing,
  // while the future's box stays untouched — the same instant, two different states.
  const cyclePos = t > 0.8 ? ((t - 0.8) % 0.8) / 0.8 : 0;
  const bounce = cyclePos < 0.5 ? cyclePos * 2 : (1 - cyclePos) * 2;
  return (
    <Svg label="a future, inert, next to a thread already running" h={220}>
      <rect x={60} y={50} width={180} height={60} rx={8} fill="none" stroke={C.taupe} strokeWidth={2} />
      <T x={150} y={85} s={13} a="middle" f={C.crema}>future: nothing running</T>
      <g opacity={fa(t, 0.6, 0.4)}>
        <rect x={340} y={50} width={180} height={60} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={430} y={85} s={13} a="middle" f={C.crema}>thread: already running</T>
        <circle cx={360 + bounce * 140} cy={120} r={4} fill={C.caramel} opacity={t > 0.8 ? 1 : 0} />
      </g>
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.2, 0.4)}>constructing one does not start it</T>
    </Svg>
  );
}

// ── 2 · Build a future by hand (predict) ────────────────────────────────────────────────────────
export function BuildByHandPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a future, before it is ever polled"
        lines={['struct Delay {', '    state: Arc<Mutex<DelayState>>,', '}', 'let d = Delay::new(duration, result);']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[3]}
      />
      <Svg label="does constructing it do any work?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.4, 0.4)}>no poll has happened yet</T>
      </Svg>
    </Stack>
  );
}

// ── 3 · Nothing. Polling is the only thing that runs it (no takeaway, "from" step) ──────────────
export function PollOnlyReveal({ t }: StepCtx) {
  return (
    <Code
      title="the Future trait's only required method"
      lines={['trait Future {', '    type Output;', '    fn poll(self: Pin<&mut Self>, cx: &mut Context)', '        -> Poll<Self::Output>;', '}']}
      t={t}
      start={0.1}
      end={2.4}
      highlight={[2, 3]}
    />
  );
}

// ── 4 · That laziness is the backpressure (takeaway) ────────────────────────────────────────────
export function LazinessBackpressureReveal({ t }: StepCtx) {
  // Five idle futures settle in, then a single poll arrow descends onto just one of them,
  // flipping only that one box active — the rest stay untouched, exactly as stated below.
  const positions: [number, number][] = [[60, 90], [160, 90], [260, 90], [360, 90], [460, 90]];
  const pollDrop = easeOut(seg(t, 1.3, 1.6));
  return (
    <Svg label="many constructed, unpolled futures — no cost paid for existing" h={220}>
      {positions.map(([x, y], i) => {
        const polled = i === 2;
        return (
          <g key={i} opacity={fa(t, 0.2 + i * 0.15, 0.4)}>
            <rect x={x} y={y} width={80} height={40} rx={6} fill="none" stroke={polled && pollDrop > 0.6 ? C.caramel : C.taupe} strokeWidth={1.5} />
            <T x={x + 40} y={y + 25} s={11} a="middle" f={C.crema}>{polled && pollDrop > 0.6 ? 'polled' : 'idle'}</T>
          </g>
        );
      })}
      <Draw pts={[[300, 20], [300, 85]]} t={t} from={1.3} to={1.6} stroke={C.caramel} w={2} pen />
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>nothing runs until something polls one</T>
    </Svg>
  );
}

// ── 5 · Pending without a plan to be asked again (predict) ─────────────────────────────────────
export function NoWakeupPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a future that returns Pending and does nothing else"
        lines={['impl Future for NeverWakes {', '    fn poll(self: Pin<&mut Self>, _cx: &mut Context)', '        -> Poll<()> {', '        Poll::Pending', '    }', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[3]}
      />
      <Svg label="what happens to this future next?" h={46}>
        <T x={40} y={28} s={13} f={C.mocha} o={fa(t, 2.6, 0.4)}>no waker stored, no waker called</T>
      </Svg>
    </Stack>
  );
}

// ── 6 · It hangs. Timed out on purpose (takeaway) ───────────────────────────────────────────────
export function HangsForRealReveal({ t }: StepCtx) {
  return (
    <Code
      title="broken_contract_hangs.rs — run under a timeout"
      dim
      lines={['executor.spawn(NeverWakes);', 'executor.run();', '// never returns within the timeout', '// TimeoutExpired, on purpose']}
      t={t}
      start={0.1}
      end={2.4}
      highlight={[2, 3]}
    />
  );
}

// ── 7 · The fix: store the Waker, call it when the work finishes (takeaway) ────────────────────
export function StoreWakerFixReveal({ t }: StepCtx) {
  return (
    <Code
      title="delay_executor.rs — Delay stores the Waker it was given"
      lines={['state.waker = Some(cx.waker().clone());', '// --- a conduit thread, elsewhere ---', 's.done = true;', 'if let Some(w) = s.waker.take() {', '    w.wake();', '}']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[0, 4]}
    />
  );
}

// ── 8 · A Waker is built from an Arc via Wake (takeaway) ────────────────────────────────────────
export function WakeTraitReveal({ t }: StepCtx) {
  return (
    <Code
      title="the std library's own Wake trait"
      lines={['impl Wake for Task {', '    fn wake(self: Arc<Self>) {', '        self.sender.send(self.clone());', '    }', '}', 'let waker = Waker::from(task.clone());']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[1, 2, 5]}
    />
  );
}

// ── 9 · Future, Waker, scheduler, poll — run end to end (takeaway) ─────────────────────────────
export function FullLoopReveal({ t }: StepCtx) {
  // A token travels the full loop, station by station, in the order named above it.
  const stations: [number, string][] = [[60, 'future'], [190, 'waker'], [320, 'scheduler'], [450, 'poll']];
  return (
    <Svg label="future, waker, scheduler, poll — the whole architecture" h={240}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.2, 0.3)}>future → waker → scheduler → poll</T>
      {stations.map(([x, label], i) => (
        <g key={label} opacity={fa(t, 0.5 + i * 0.25, 0.3)}>
          <rect x={x} y={85} width={110} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
          <T x={x + 55} y={108} s={11} a="middle" f={C.crema}>{label}</T>
        </g>
      ))}
      {stations.slice(0, -1).map(([x], i) => (
        <Draw key={x} pts={[[x + 110, 103], [stations[i + 1][0], 103]]} t={t} from={0.75 + i * 0.25} to={0.95 + i * 0.25} stroke={C.mocha} w={2} pen />
      ))}
      <T x={60} y={160} s={13} f={C.mocha} o={fa(t, 1.8, 0.4)}>delay_executor.rs: the result lands exactly once</T>
      <T x={60} y={200} s={13} f={C.taupe} o={fa(t, 2.2, 0.4)}>no hidden thread does the future's work</T>
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'constructing a future does no work: that is backpressure',
    'Pending is a real promise to arrange a wakeup',
    'a Waker built from Arc via Wake is the usual way',
    'the loop runs with no hidden thread anywhere',
  ];
  return (
    <Svg label="recap: future, waker, scheduler, poll — proven both ways" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
