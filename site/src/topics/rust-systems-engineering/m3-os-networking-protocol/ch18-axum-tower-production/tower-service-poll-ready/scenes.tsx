import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Plot, Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// poll_ready and call are two separate steps, and that split is the backpressure
// contract itself. Layers compose around that same contract, each bounding a
// different real thing; Buffer's own queue can hide the backlog a hard cap exists
// to prevent, unless it is sized on purpose.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Several names pour into one idea: a line from each row's dot runs down the left gutter into one node,
// where the idea they share decodes and is locked on.
function Converge({ t, n, y0, dy, at, verdict }: { t: number; n: number; y0: number; dy: number; at: number; verdict: string }) {
  const yN = y0 + n * dy + 5;
  const k = easeOut(seg(t, at + 0.5, at + 0.8));
  const w = 44 + verdict.length * 10;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Draw key={i} pts={[[30, y0 + i * dy], [14, y0 + i * dy], [14, yN], [30, yN]]} t={t} from={at + i * 0.1} to={at + 0.5 + i * 0.1} stroke={C.taupe} w={1.5} />
      ))}
      <circle cx={30} cy={yN} r={7 * k} fill={C.caramel} />
      <Decode text={verdict} t={t} at={at + 0.6} x={48} y={yN + 5} s={14} f={C.caramel} w={600} />
      <Reticle x={20 + w / 2} y={yN} w={w} h={30} t={t} at={at + 1.0} />
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
  // Each poll_ready lands as a point on a time axis: on the "pending" row, again and again, until one lands on
  // "ready". Only then does the call() arrow draw from that point to the service.
  const xs = [150, 210, 270, 330];
  return (
    <Svg label="service_is_poll_ready_then_call.rs, measured" h={220}>
      <T x={30} y={75} s={13} f={C.cherryText} o={fa(t, 0.2, 0.3)}>pending</T>
      <T x={30} y={145} s={13} f={C.crema} o={fa(t, 0.2, 0.3)}>ready</T>
      <line x1={120} y1={70} x2={380} y2={70} stroke={C.mocha} strokeDasharray="3 4" />
      <line x1={120} y1={140} x2={380} y2={140} stroke={C.mocha} strokeDasharray="3 4" />
      <T x={250} y={30} s={13} a="middle" f={C.taupe} o={fa(t, 0.2, 0.3)}>poll_ready()</T>
      <Plot pts={xs.slice(0, 3).map((x) => [x, 70] as [number, number])} t={t} start={0.4} beat={0.28} r={6} fill={C.cherryText} />
      <Plot pts={[[xs[3], 140]]} t={t} start={0.4 + 3 * 0.28} r={6} fill={C.caramel} />
      <rect x={440} y={118} width={130} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 1.3, 0.3)} />
      <T x={505} y={145} s={13} a="middle" f={C.crema} o={fa(t, 1.3, 0.3)}>service</T>
      <Draw pts={[[xs[3] + 8, 140], [436, 140]]} t={t} from={1.5} to={1.9} stroke={C.caramel} w={2} />
      <T x={388} y={130} s={13} a="middle" f={C.caramel} o={fa(t, 1.8, 0.3)}>call()</T>
      <Reticle x={505} y={140} w={140} h={54} t={t} at={2.1} />
      <T x={300} y={200} s={13} a="middle" f={C.latte} o={fa(t, 2.0, 0.4)}>readiness awaited, not assumed</T>
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
  // Four wrappers, each shown bounding its own thing: a cap lets only two through its gate at once, a shedder
  // bounces a call straight back, a rate limiter lands calls one even beat apart, a deadline cuts a long call.
  const gate = 420;
  const capDots = [0, 1, 2, 3];
  const shed = seg(t, 0.8, 1.4);
  const shedX = shed < 0.5 ? lerp(270, gate - 8, easeOut(shed * 2)) : lerp(gate - 8, 300, easeOut(shed * 2 - 1));
  const dl = easeOut(seg(t, 1.9, 2.5));
  return (
    <Svg label="layers_compose_and_bound_a_stack.rs, measured" h={250}>
      {[45, 105, 165, 225].map((y, i) => (
        <line key={y} x1={gate} y1={y - 18} x2={gate} y2={y + 12} stroke={i === 2 ? C.mocha : C.latte} strokeWidth={2} opacity={i === 2 ? 0 : fa(t, 0.1 + i * 0.5, 0.3)} />
      ))}
      <T x={30} y={50} s={13} f={C.crema} o={fa(t, 0.1, 0.3)}>concurrency cap</T>
      {capDots.map((i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.08, 0.7 + i * 0.08));
        const pass = i < 2;
        const x = pass ? lerp(270, 450 + i * 30, k) : lerp(270, gate - 14 - (i - 2) * 16, k);
        return <circle key={i} cx={x} cy={42} r={6} fill={pass ? C.caramel : C.taupe} opacity={fa(t, 0.2, 0.2)} />;
      })}
      <T x={30} y={110} s={13} f={C.crema} o={fa(t, 0.7, 0.3)}>load shedder</T>
      <circle cx={shedX} cy={102} r={6} fill={shed > 0.5 ? C.cherryText : C.caramel} opacity={fa(t, 0.8, 0.2)} />
      <Decode text="rejected" t={t} at={1.3} x={500} y={108} s={13} a="middle" f={C.cherryText} />
      <T x={30} y={170} s={13} f={C.crema} o={fa(t, 1.3, 0.3)}>rate limiter</T>
      <line x1={270} y1={162} x2={570} y2={162} stroke={C.mocha} />
      <Plot pts={[0, 1, 2, 3, 4].map((i) => [290 + i * 65, 162] as [number, number])} t={t} start={1.4} beat={0.22} r={5} fill={C.caramel} base={172} />
      <T x={30} y={230} s={13} f={C.crema} o={fa(t, 1.8, 0.3)}>deadline</T>
      <rect x={270} y={216} width={Math.max(2, dl * (gate - 270))} height={16} rx={3} fill={dl >= 1 ? C.cherry : C.caramel} />
      <Draw pts={[[gate + 4, 216], [gate + 20, 232]]} t={t} from={2.5} to={2.65} stroke={C.cherryText} w={2} />
      <Draw pts={[[gate + 20, 216], [gate + 4, 232]]} t={t} from={2.6} to={2.75} stroke={C.cherryText} w={2} />
      <T x={500} y={230} s={13} a="middle" f={C.cherryText} o={fa(t, 2.55, 0.3)}>cancelled</T>
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
  // Five calls zip into the buffer at once ("accepted"), then leave it for the service one at a time, slowly:
  // by the end most are still sitting in the queue — a hidden backlog, not a rejection.
  const calls = [0, 1, 2, 3, 4];
  return (
    <Svg label="layers_compose_and_bound_a_stack.rs, measured" h={220}>
      <T x={60} y={40} s={13} f={C.taupe}>calls</T>
      <rect x={200} y={70} width={170} height={44} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={285} y={56} s={13} a="middle" f={C.taupe}>buffer</T>
      <rect x={440} y={70} width={120} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <T x={500} y={56} s={13} a="middle" f={C.taupe}>inner service</T>
      {calls.map((i) => {
        const inQ = easeOut(seg(t, 0.25 + i * 0.05, 0.5 + i * 0.05));
        const out = easeOut(seg(t, 1.0 + i * 0.6, 1.4 + i * 0.6));
        const qx = 340 - i * 30;
        const x = out > 0 ? lerp(qx, 500, out) : lerp(70 + i * 12, qx, inQ);
        const r = 8 * (1 - easeOut(seg(t, 1.4 + i * 0.6, 1.6 + i * 0.6)));
        return <circle key={i} cx={x} cy={92} r={r} fill={C.caramel} />;
      })}
      <Decode text="every call accepted" t={t} at={0.55} x={285} y={145} s={13} a="middle" f={C.crema} />
      <T x={500} y={145} s={13} a="middle" f={C.latte} o={fa(t, 1.2, 0.3)}>one at a time</T>
      <Reticle x={285} y={92} w={186} h={60} t={t} at={2.3} />
      <T x={300} y={200} s={13} a="middle" f={C.latte} o={fa(t, 2.2, 0.4)}>a real backlog, hidden, not a rejection</T>
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
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="ready, then call" />
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
    <Svg label="recap: a service and callers that actually listen" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={40} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
