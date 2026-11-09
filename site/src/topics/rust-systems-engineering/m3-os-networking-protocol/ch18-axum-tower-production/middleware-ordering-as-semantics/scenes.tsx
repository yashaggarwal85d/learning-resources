import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Bar, Reticle } from '../../../../../reels/kit';

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
  const deadlineAt = 0.5;
  const authW = lerp(6, 280, easeOut(seg(t, 0.15, 1.3)));
  const cutW = Math.min(authW, 140);
  return (
    <Svg label="timeout_placement_bounds_different_things.rs, measured" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>a slow auth step, wrapped by the deadline</T>
      <Bar x={60} y={45} w={cutW} h={18} full={280} fill={C.cherry} />
      <line x1={200} y1={40} x2={200} y2={70} stroke={C.cherryText} strokeWidth={2} />
      <T x={200} y={83} s={11} a="middle" f={C.cherryText}>deadline</T>
      <Reticle x={200} y={54} w={30} h={34} t={t} at={deadlineAt} />
      <T x={60} y={115} s={13} f={C.mocha} o={fa(t, 0.6, 0.3)}>fired, well before auth would finish</T>
      <T x={60} y={145} s={13} f={C.latte} o={fa(t, 0.9, 0.3)}>the deadline bounded everything inside it</T>
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
  const authW = lerp(6, 280, easeOut(seg(t, 0.15, 1.0)));
  return (
    <Svg label="timeout_placement_bounds_different_things.rs, measured" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>the same slow auth step, moved outside</T>
      <Bar x={60} y={45} w={authW} h={18} full={280} fill={C.caramel} />
      <T x={60} y={100} s={13} f={C.mocha} o={fa(t, 1.0, 0.3)}>ran to completion, entirely unbounded</T>
      <T x={60} y={130} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>the deadline never even saw it</T>
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
  const attempts = [{ fail: true }, { fail: true }, { fail: false }];
  return (
    <Svg label="retry_without_idempotency_reruns_the_effect.rs, measured" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>three attempts</T>
      {attempts.map((a, i) => {
        const start = 0.2 + i * 0.3;
        const k = easeOut(seg(t, start, start + 0.2));
        return (
          <g key={i}>
            <rect x={60 + i * 100} y={45} width={80} height={30} rx={4} fill="none" stroke={a.fail ? C.cherryText : C.caramel} strokeWidth={2} opacity={k} />
            <circle cx={100 + i * 100} cy={95} r={4} fill={C.caramel} opacity={fa(t, start + 0.1, 0.15)} />
          </g>
        );
      })}
      <T x={60} y={125} s={13} f={C.mocha} o={fa(t, 1.1, 0.3)}>the side effect: ran all three times</T>
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.4, 0.3)}>nothing was guarding it from running again</T>
    </Svg>
  );
}

// ── 9 · Add an idempotency key: runs once (no takeaway, surprising fact) ────────────────────────
export function IdempotentReveal({ t }: StepCtx) {
  const attempts = [{ fail: true }, { fail: true }, { fail: false }];
  return (
    <Svg label="retry_without_idempotency_reruns_the_effect.rs, measured" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>same handler, same failures, same retries</T>
      {attempts.map((a, i) => {
        const start = 0.2 + i * 0.3;
        const k = easeOut(seg(t, start, start + 0.2));
        return (
          <g key={i}>
            <rect x={60 + i * 100} y={45} width={80} height={30} rx={4} fill="none" stroke={a.fail ? C.cherryText : C.caramel} strokeWidth={2} opacity={k} />
            {i === 0 ? (
              <circle cx={100 + i * 100} cy={95} r={4} fill={C.caramel} opacity={fa(t, start + 0.1, 0.15)} />
            ) : (
              <T x={70 + i * 100} y={100} s={11} f={C.taupe} o={fa(t, start + 0.1, 0.15)}>skipped</T>
            )}
          </g>
        );
      })}
      <T x={60} y={125} s={13} f={C.mocha} o={fa(t, 1.1, 0.3)}>the side effect: ran exactly once</T>
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.4, 0.3)}>one check, and the repeats stopped mattering</T>
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
