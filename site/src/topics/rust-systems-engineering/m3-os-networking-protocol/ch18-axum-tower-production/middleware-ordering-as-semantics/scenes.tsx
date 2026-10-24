import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Order changes meaning: a real buffer-then-concurrency-limit stack admits far
// more concurrent callers than the reverse order, matching ServiceBuilder's own
// documented numbers; a deadline bounds whatever it wraps, and moving it changes
// what it protects; a non-idempotent handler's side effect reruns on every retry
// unless a real idempotency key stops it.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  const rows = [
    'buffer first: admitted well over a hundred',
    'concurrency cap first: admitted exactly ten',
  ];
  return (
    <Svg label="service_builder_order_bounds_in_flight.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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
  return (
    <Svg label="timeout_placement_bounds_different_things.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a slow auth step, wrapped by the deadline</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>fired, well before auth would finish</T>
      </g>
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
  return (
    <Svg label="timeout_placement_bounds_different_things.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same slow auth step, moved outside</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>ran to completion, entirely unbounded</T>
      </g>
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
    <Svg label="retry_without_idempotency_reruns_the_effect.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>three attempts, two failed, one succeeded</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>the side effect: ran all three times</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>nothing was guarding it from running again</T>
    </Svg>
  );
}

// ── 9 · Add an idempotency key: runs once (no takeaway, surprising fact) ────────────────────────
export function IdempotentReveal({ t }: StepCtx) {
  return (
    <Svg label="retry_without_idempotency_reruns_the_effect.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same handler, same failures, same retries</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>the side effect: ran exactly once</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>one check, and the repeats stopped mattering</T>
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
    <Svg label="recap: order, bounds, and a side effect that remembers" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
