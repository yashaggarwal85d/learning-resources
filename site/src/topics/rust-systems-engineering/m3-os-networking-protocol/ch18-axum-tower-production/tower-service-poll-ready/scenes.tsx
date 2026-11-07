import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// poll_ready and call are two separate steps, and that split is the backpressure
// contract itself. Layers compose around that same contract, each bounding a
// different real thing; Buffer's own queue can hide the backlog a hard cap exists
// to prevent, unless it is sized on purpose.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · poll_ready reports not ready, then ready (predict, hook) ────────────────────────────────
export function ContractPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a service that reports not ready, then ready"
        lines={['svc.poll_ready(cx)?; // Pending, Pending, Pending...', 'svc.call(req); // call it anyway, right now?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a real caller waits for real ready (swipe test's "from" step — NO takeaway) ───
export function ContractReveal({ t }: StepCtx) {
  const polls = [0, 1, 2, 3];
  return (
    <Svg label="service_is_poll_ready_then_call.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>reported not ready, several times over</T>
      {polls.map((i) => {
        const tick = easeOut(seg(t, 0.4 + i * 0.12, 0.55 + i * 0.12));
        return <circle key={i} cx={210 + i * 20} cy={57} r={4} fill={i < 3 ? C.cherry : C.taupe} opacity={tick} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>only then did the caller call it</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>readiness genuinely awaited, not assumed</T>
    </Svg>
  );
}

// ── 3 · Four layers around one service, a batch arriving (predict) ──────────────────────────────
export function LayersPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="four layers, one batch of calls arriving together"
        lines={['ConcurrencyLimit(LoadShed(RateLimit(Timeout(svc))))', '// a batch of calls, through all four at once']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: four real, distinct outcomes (takeaway) ───────────────────────────────────────
export function LayersReveal({ t }: StepCtx) {
  const rows = [
    'concurrency cap: capped how many ran at once',
    'load shedder: rejected a call, immediately',
    'rate limiter: spaced calls out over real time',
    'deadline: cancelled a call that ran too long',
  ];
  return (
    <Svg label="layers_compose_and_bound_a_stack.rs, measured" h={240}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.3, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 5 · A queue in front of a concurrency-capped service (predict) ──────────────────────────────
export function BufferPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a queue in front of a service capped at one"
        lines={['let svc = Buffer::new(ConcurrencyLimit::new(inner, 1), n);', '// several calls arrive at once; does it reject some?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the queue accepts everything, inner still capped (takeaway) ───────────────────
export function BufferReveal({ t }: StepCtx) {
  const calls = [0, 1, 2, 3, 4];
  return (
    <Svg label="layers_compose_and_bound_a_stack.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>every call accepted, immediately</T>
      {calls.map((i) => {
        const land = easeOut(seg(t, 0.4 + i * 0.06, 0.55 + i * 0.06));
        return <circle key={i} cx={190 + i * 20} cy={74} r={4} fill={C.caramel} opacity={land} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>the inner service: still one at a time</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a real backlog, hidden, not a rejection</T>
    </Svg>
  );
}

// ── 7 · Back to the first question: what does the trait allow (predict) ─────────────────────────
export function PanicPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="calling a service that never reported ready"
        lines={['// svc.poll_ready(cx) was never checked at all', 'svc.call(req); // what does the trait allow here?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The trait's own words, quoted (no takeaway, connecting step) ────────────────────────────
export function PanicReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="tower::Service, quoted directly" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>permitted to panic, if called too soon</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>the trait's own words, not a convention</T>
      </g>
    </Svg>
  );
}

// ── 9 · Two steps, one contract, every layer composes around it (takeaway) ──────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'ask if it is ready: that is the contract',
    'ask it to do the work: only once it is',
    'every layer composes around that contract',
  ];
  return (
    <Svg label="readiness as the backpressure contract" h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a service says not ready, a caller waits',
    'four layers, each bounding a different thing',
    'a queue can hide a backlog, if sized carelessly',
    'calling too soon: the trait permits a panic',
  ];
  return (
    <Svg label="recap: a service and callers that actually listen" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
