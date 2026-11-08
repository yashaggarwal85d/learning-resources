import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Bar, Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// Order changes meaning: a real buffer-then-concurrency-limit stack admits far
// more concurrent callers than the reverse order, matching ServiceBuilder's own
// documented numbers; a deadline bounds whatever it wraps, and moving it changes
// what it protects; a non-idempotent handler's side effect reruns on every retry
// unless a real idempotency key stops it.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Three attempts at one handler, two failing. Each attempt's arrow draws to the handler; when the effect runs,
// a dot drops into the side-effects tray. With `guard`, a check that remembers the first run stops the repeats
// at the gate, so the tray ends with one dot instead of three.
function RetryLane({ t, guard }: { t: number; guard: boolean }) {
  const attempts = [0, 1, 2];
  return (
    <g>
      <T x={30} y={30} s={13} f={C.taupe}>attempts</T>
      <rect x={380} y={40} width={150} height={120} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={455} y={32} s={13} a="middle" f={C.taupe}>handler</T>
      {guard && <line x1={370} y1={40} x2={370} y2={160} stroke={C.caramel} strokeWidth={3} opacity={fa(t, 0.2, 0.3)} />}
      {guard && <T x={370} y={178} s={13} a="middle" f={C.caramel} o={fa(t, 0.2, 0.3)}>key check</T>}
      <T x={30} y={215} s={13} f={C.taupe}>side effects</T>
      <line x1={180} y1={220} x2={560} y2={220} stroke={C.mocha} />
      {attempts.map((i) => {
        const at = 0.3 + i * 0.6;
        const y = 65 + i * 38;
        const ran = !guard || i === 0;
        const end = ran ? 400 : 362;
        const drop = easeOut(seg(t, at + 0.35, at + 0.6));
        const failed = i < 2;
        return (
          <g key={i}>
            <T x={30} y={y + 5} s={13} f={C.crema} o={fa(t, at - 0.1, 0.2)}>{['first', 'second', 'third'][i]}</T>
            <Draw pts={[[110, y], [end, y]]} t={t} from={at} to={at + 0.3} stroke={ran ? C.caramel : C.taupe} w={2} />
            {ran && <circle cx={420 + i * 40} cy={lerp(y, 210, drop)} r={6} fill={C.cherryText} opacity={drop > 0 ? 1 : 0} />}
            {failed && <T x={500} y={y + 5} s={13} a="middle" f={C.cherryText} o={fa(t, at + 0.3, 0.2)}>failed</T>}
          </g>
        );
      })}
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

// ── 1 · Does order really change how many callers are admitted (predict, hook) ──────────────────
export function OrderPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two layers, in two different orders"
        lines={['ServiceBuilder::new().buffer(n).concurrency_limit(n)', '// swap the order: still the same two layers?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the real counts, side by side (swipe test's "from" step — NO takeaway) ────────
export function OrderReveal({ t }: StepCtx) {
  // A bar race between the two orders, the same burst of callers each time: with the buffer in front, the
  // admitted bar runs long (the buffer's slots plus the cap's); with the cap in front it stops dead almost at once.
  const full = 330;
  const a = easeOut(seg(t, 0.3, 1.5));
  const b = easeOut(seg(t, 0.3, 0.6));
  return (
    <Svg label="service_builder_order_bounds_in_flight.rs, measured" h={200}>
      <T x={30} y={30} s={13} f={C.taupe} o={fa(t, 0.1, 0.3)}>admitted right away</T>
      <T x={30} y={66} s={13} f={C.crema} o={fa(t, 0.2, 0.3)}>buffer first</T>
      <Bar x={210} y={54} w={a * full} h={16} full={full} fill={C.caramel} />
      <Decode text="well over a hundred" t={t} at={1.4} x={210} y={96} s={13} f={C.caramel} />
      <T x={30} y={136} s={13} f={C.crema} o={fa(t, 0.2, 0.3)}>cap first</T>
      <Bar x={210} y={124} w={b * full * (10 / 110)} h={16} full={full} fill={C.cherryText} />
      <Decode text="exactly ten" t={t} at={1.6} x={210} y={166} s={13} f={C.cherryText} />
      <Reticle x={226} y={132} w={52} h={30} t={t} at={2.1} />
    </Svg>
  );
}

// ── 3 · A deadline around a slow auth step too (predict) ────────────────────────────────────────
export function TimeoutOutsidePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a deadline, wrapped around auth and the handler"
        lines={['Timeout::new(Auth(Handler), dur)', '// does the deadline catch a slow auth step too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the deadline fired early, auth included (takeaway) ────────────────────────────
export function TimeoutOutsideReveal({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.4, 0.9));
  const w = grow * 180;
  return (
    <Svg label="timeout_placement_bounds_different_things.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a slow auth step, wrapped by the deadline</T>
      <rect x={60} y={70} width={w} height={10} rx={3} fill={C.cherry} opacity={0.7} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.9 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>fired, well before auth would finish</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the deadline bounded everything inside it</T>
    </Svg>
  );
}

// ── 5 · The same deadline, moved inside (predict) ────────────────────────────────────────────────
export function TimeoutInsidePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same deadline, now around only the handler"
        lines={['Auth(Timeout::new(Handler, dur))', '// auth, outside the deadline entirely']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: auth ran unbounded, outside the deadline (takeaway) ───────────────────────────
export function TimeoutInsideReveal({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.4, 1.0));
  const w = grow * 260;
  return (
    <Svg label="timeout_placement_bounds_different_things.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same slow auth step, moved outside</T>
      <rect x={60} y={70} width={w} height={10} rx={3} fill={C.taupe} opacity={0.7} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {grow > 0.9 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>ran to completion, entirely unbounded</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the deadline never even saw it</T>
    </Svg>
  );
}

// ── 7 · A non-idempotent handler, retried (predict) ──────────────────────────────────────────────
export function RetryPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a handler that fails twice, then succeeds"
        lines={['Retry::new(RetryOnError, handler)', '// side effect runs on every single attempt?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: the side effect ran once per attempt (takeaway) ───────────────────────────────
export function RetryReveal({ t }: StepCtx) {
  return (
    <Svg label="retry_without_idempotency_reruns_the_effect.rs, measured" h={260}>
      <RetryLane t={t} guard={false} />
      <Decode text="ran all three times" t={t} at={2.1} x={300} y={250} s={13} a="middle" f={C.cherryText} w={600} />
    </Svg>
  );
}

// ── 9 · Add an idempotency key: runs once (no takeaway, surprising fact) ────────────────────────
export function IdempotentReveal({ t }: StepCtx) {
  return (
    <Svg label="retry_without_idempotency_reruns_the_effect.rs, measured" h={260}>
      <RetryLane t={t} guard />
      <Decode text="ran exactly once" t={t} at={2.1} x={300} y={250} s={13} a="middle" f={C.caramel} w={600} />
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'buffer first admits far more than the reverse',
    'a deadline bounds only what it actually wraps',
    'move the deadline, the protection moves too',
    'a retry without a key reruns the side effect',
  ];
  return (
    <Svg label="recap: order, bounds, and a side effect that remembers" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={190} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
