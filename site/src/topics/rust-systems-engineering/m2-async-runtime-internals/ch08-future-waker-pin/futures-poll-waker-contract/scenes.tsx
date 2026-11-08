import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// A hand-rolled Future and a minimal executor (Waker built from Arc<Task> via std::task::Wake),
// with no async/.await sugar and no hidden thread doing the work. Both outcomes — the completed
// run and the real, timed-out hang — are executed for real by examples.py (rustc 1.97.0, edition
// 2024; no external crate needed, std::task::Wake has been stable since std 1.51).
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

/** A labelled box. */
function Box({ x, y, w, h = 36, label, hot = false, dim = false, f }: { x: number; y: number; w: number; h?: number; label: string; hot?: boolean; dim?: boolean; f?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={hot ? C.cocoa : 'none'} stroke={hot ? C.caramel : C.mocha} strokeWidth={hot ? 2 : 1.5} strokeDasharray={dim ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} a="middle" f={f ?? (hot ? C.caramel : dim ? C.taupe : C.crema)}>{label}</T>
    </g>
  );
}

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
export function BuildByHandPredict({ t, portrait }: StepCtx) {
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
      {!portrait && (
        <Svg label="does constructing it do any work?" h={34}>
          <T x={40} y={24} s={16} f={C.mocha} o={fa(t, 1.9, 0.4)}>no poll has happened yet</T>
        </Svg>
      )}
    </Stack>
  );
}

// ── 3 · Nothing. Polling is the only thing that runs it (no takeaway, "from" step) ──────────────
export function PollOnlyReveal({ t }: StepCtx) {
  const polls = [0.8, 1.4, 2.0];
  const X0 = 60;
  const X1 = 560;
  const xAt = (s: number) => lerp(X0, X1, s / 2.6);
  // Progress only climbs during a poll: a staircase that is flat between calls.
  const steps: [number, number][] = [[X0, 140]];
  polls.forEach((p, i) => {
    steps.push([xAt(p), 140 - i * 36]);
    steps.push([xAt(p + 0.15), 140 - (i + 1) * 36]);
  });
  steps.push([X1, 140 - polls.length * 36]);
  const now = Math.min(2.6, t);
  return (
    <Stack>
      <Code title="the Future trait's only required method" lines={['trait Future {', '    type Output;', '    fn poll(self: Pin<&mut Self>, cx: &mut Context)', '        -> Poll<Self::Output>;', '}']} t={t} start={0.1} end={0.6} highlight={[2, 3]} />
      <Svg label="a future's progress over time is a staircase: it climbs only at the instants poll is called, and stays flat in between" h={180} fill>
        <line x1={X0} y1={150} x2={X1} y2={150} stroke={C.mocha} strokeWidth={1.5} />
        <T x={X1} y={170} s={13} a="end" f={C.taupe}>time</T>
        <T x={X0} y={20} s={13} f={C.taupe}>progress</T>
        {polls.map((p) => (
          <g key={p} opacity={t >= p ? 1 : 0}>
            <line x1={xAt(p)} y1={146} x2={xAt(p)} y2={154} stroke={C.caramel} strokeWidth={2} />
            <T x={xAt(p) + 6} y={170} s={13} a="middle" f={C.caramel}>poll</T>
          </g>
        ))}
        <Draw pts={steps} t={now} from={0.6} to={2.6} stroke={C.crema} w={2.5} />
      </Svg>
    </Stack>
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
export function NoWakeupPredict({ t, portrait }: StepCtx) {
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
      {!portrait && (
        <Svg label="what happens to this future next?" h={34}>
          <T x={40} y={24} s={16} f={C.mocha} o={fa(t, 1.9, 0.4)}>no waker stored, no waker called</T>
        </Svg>
      )}
    </Stack>
  );
}

// ── 6 · It hangs. Timed out on purpose (takeaway) ───────────────────────────────────────────────
export function HangsForRealReveal({ t, portrait }: StepCtx) {
  const toPoll = easeInOut(seg(t, 0.5, 0.9));
  const park = easeInOut(seg(t, 1.0, 1.4));
  const ring = seg(t, 1.3, 2.5);
  const r = 22;
  const a = Math.min(ring * Math.PI * 2, 6.28);
  const tx = park > 0 ? lerp(300, 240, park) : lerp(90, 300, toPoll);
  const ty = park > 0 ? lerp(60, 140, park) : 60;
  return (
    <Stack>
      {!portrait && <Code title="broken_contract_hangs.rs — run under a timeout" dim={t < 0.1} lines={['executor.spawn(NeverWakes);', 'executor.run();', '// never returns within the timeout', '// TimeoutExpired, on purpose']} t={t} start={0.1} end={0.5} highlight={t > 2.5 ? [3] : [1]} />}
      <Svg label="the executor polls NeverWakes once, gets Pending, and the task is parked; nothing ever wakes it, so run never returns, and the timeout expires" h={180} fill>
        <Box x={30} y={42} w={120} h={36} label="run queue" />
        <Box x={240} y={42} w={120} h={36} label="poll()" hot={toPoll >= 1 && park <= 0} />
        <Box x={220} y={124} w={160} h={36} label="parked" dim />
        <T x={300} y={30} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 0.95, 1.1))}>Pending</T>
        {toPoll > 0 && <circle cx={tx} cy={ty} r={9} fill={C.crema} />}
        <T x={430} y={146} s={13} f={C.taupe} o={easeOut(seg(t, 1.5, 1.8))}>no wake, ever</T>
        <circle cx={500} cy={60} r={r} fill="none" stroke={C.mocha} strokeWidth={3} opacity={ring > 0 ? 1 : 0} />
        {ring > 0 && <path d={`M500 ${60 - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${(500 + r * Math.sin(a)).toFixed(1)} ${(60 - r * Math.cos(a)).toFixed(1)}`} fill="none" stroke={ring >= 1 ? C.cherryText : C.crema} strokeWidth={3} />}
        {t >= 2.5 && <Decode text="TimeoutExpired" x={500} y={104} s={13} a="middle" f={C.cherryText} t={t} at={2.5} dur={0.4} />}
      </Svg>
    </Stack>
  );
}

// ── 7 · The fix: store the Waker, call it when the work finishes (takeaway) ────────────────────
export function StoreWakerFixReveal({ t, portrait }: StepCtx) {
  const store = easeInOut(seg(t, 0.5, 0.9)); // Pending hands over a waker, kept in the shared state
  const work = easeOut(seg(t, 0.9, 1.8)); // the conduit thread does the real waiting
  const wake = easeInOut(seg(t, 1.9, 2.4)); // takes the waker and calls it
  const again = easeOutBack(seg(t, 2.4, 2.8));
  return (
    <Stack>
      {!portrait && <Code title="delay_executor.rs — Delay stores the Waker it was given" lines={['state.waker = Some(cx.waker().clone());', '// --- a conduit thread, elsewhere ---', 's.done = true;', 'if let Some(w) = s.waker.take() {', '    w.wake();', '}']} t={t} start={0.1} end={0.5} highlight={t > 1.9 ? [4] : t > 0.9 ? [2] : [0]} />}
      <Svg label="the future returns Pending and stores its waker in shared state; a conduit thread finishes its work, takes the waker and calls wake, and the task goes back to be polled, completing with 1" h={190} fill>
        <Box x={20} y={20} w={130} h={36} label="Delay" />
        <Box x={230} y={20} w={150} h={36} label="shared state" />
        <T x={20} y={124} s={13} f={C.latte}>conduit thread</T>
        <rect x={180} y={110} width={230} height={16} rx={4} fill={C.cocoa} />
        <rect x={180} y={110} width={230 * work} height={16} rx={4} fill={C.crema} />
        {work >= 1 && <T x={420} y={124} s={13} f={C.caramel}>done</T>}
        {store > 0 && wake <= 0 && (
          <g transform={`translate(${lerp(85, 305, store).toFixed(1)} ${lerp(70, 72, store).toFixed(1)})`}>
            <rect x={-34} y={-12} width={68} height={24} rx={12} fill={C.cinnamon} />
            <T x={0} y={5} s={12} a="middle" f={C.espresso} w={700}>waker</T>
          </g>
        )}
        {wake > 0 && wake < 1 && (
          <g transform={`translate(${lerp(305, 85, wake).toFixed(1)} ${(72 + Math.sin(wake * Math.PI) * 60).toFixed(1)})`}>
            <rect x={-34} y={-12} width={68} height={24} rx={12} fill={C.cinnamon} />
            <T x={0} y={5} s={12} a="middle" f={C.espresso} w={700}>wake()</T>
          </g>
        )}
        {again > 0 && (
          <g transform={`translate(85 170) scale(${again.toFixed(3)}) translate(-85 -170)`}>
            <T x={85} y={176} s={14} a="middle" f={C.caramel} w={700}>polled: Ready(1)</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 8 · A Waker is built from an Arc via Wake (takeaway) ────────────────────────────────────────
export function WakeTraitReveal({ t, portrait }: StepCtx) {
  const wrap = easeOutBack(seg(t, 0.8, 1.2)); // Waker::from wraps the Arc'd task
  const fire = easeInOut(seg(t, 1.6, 2.4)); // wake(): the task is sent back to the queue
  return (
    <Stack>
      {!portrait && <Code title="the std library's own Wake trait" lines={['impl Wake for Task {', '    fn wake(self: Arc<Self>) {', '        self.sender.send(self.clone());', '    }', '}', 'let waker = Waker::from(task.clone());']} t={t} start={0.1} end={0.6} highlight={t > 1.6 ? [2] : t > 0.8 ? [5] : [0]} />}
      <Svg label="Waker::from wraps an Arc of the task; calling wake sends a clone of that Arc back down the channel into the run queue, where it will be polled again" h={170} fill>
        {wrap > 0 && (
          <g transform={`translate(120 70) scale(${wrap.toFixed(3)}) translate(-120 -70)`}>
            <rect x={20} y={22} width={200} height={96} rx={12} fill="none" stroke={C.cinnamon} strokeWidth={2} />
            <T x={30} y={16} s={13} f={C.cinnamon}>Waker</T>
          </g>
        )}
        <rect x={45} y={44} width={150} height={52} rx={9} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={55} y={40} s={13} f={C.taupe}>Arc</T>
        <Box x={70} y={54} w={100} h={32} label="Task" hot />
        <Draw pts={[[220, 70], [420, 70]]} t={t} from={1.4} to={1.7} stroke={C.mocha} w={10} pen={false} />
        <T x={320} y={52} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>sender</T>
        <rect x={420} y={40} width={150} height={60} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={495} y={124} s={13} a="middle" f={C.latte}>run queue</T>
        {fire > 0 && (
          <g transform={`translate(${lerp(120, 495, fire).toFixed(1)} 70)`}>
            <rect x={-40} y={-14} width={80} height={28} rx={6} fill={C.caramel} />
            <T x={0} y={5} s={12} a="middle" f={C.espresso} w={700}>Task</T>
          </g>
        )}
        <T x={300} y={160} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.4, 2.7))}>waking = back in the queue</T>
      </Svg>
    </Stack>
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
    'building a future does no work: that is backpressure',
    'Pending is a real promise to arrange a wakeup',
    'a Waker built from Arc via Wake is the usual way',
    'the loop runs with no hidden thread anywhere',
  ];
  return <RecapList t={t} end={3} label="recap: future, waker, scheduler, poll — proven both ways" rows={rows} step={55}
      s={13}
    />;
}
