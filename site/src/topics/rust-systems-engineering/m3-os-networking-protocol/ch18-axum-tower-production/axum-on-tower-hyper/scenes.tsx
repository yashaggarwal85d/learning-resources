import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// Axum has no middleware system of its own; it is tower::Service and Layer all
// the way down. A real extractor, real shared state, a real middleware::from_fn
// layer, and a real tower-http layer all compose through that same abstraction
// inside a real running server.
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

// ── 1 · Does Axum build its own middleware system (predict, hook) ───────────────────────────────
export function FrameworkPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a router, and a question about its own middleware"
        lines={['let app = Router::new().route(path, get(handler));', '// its own system, or Service and Layer, underneath?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · The framework's own words, quoted (no takeaway, swipe-test "from" step) ──────────────────
export function FrameworkReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="axum's own documentation, quoted directly" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>no middleware system of its own</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>it's Service, all the way down</T>
      </g>
    </Svg>
  );
}

// ── 3 · A real path-parameter route (predict) ───────────────────────────────────────────────────
export function ExtractPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real route, the newer path-parameter syntax"
        lines={['.route("/greet/{name}", get(greet))', 'async fn greet(Path(name): Path<String>) -> String']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the real extractor pulled out the name (takeaway) ─────────────────────────────
export function ExtractReveal({ t }: StepCtx) {
  const pull = easeOut(seg(t, 0.5, 0.85));
  const dy = (1 - pull) * -24;
  return (
    <Svg label="axum_is_tower_underneath.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real request, a name in its own path</T>
      <Draw pts={[[240, 50], [240, 85]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} pen />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g transform={`translate(0,${dy})`} opacity={pull}>
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>the exact name, already extracted</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the handler never touched the raw path</T>
    </Svg>
  );
}

// ── 5 · Shared state, three real requests (predict) ─────────────────────────────────────────────
export function StatePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one shared counter, three separate real requests"
        lines={['async fn counter(State(s): State<AppState>) -> String', '// request, request, request — fresh each time, or shared?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: three requests, a genuinely accumulating value (takeaway) ─────────────────────
export function StateReveal({ t }: StepCtx) {
  const reqs = [0, 1, 2];
  return (
    <Svg label="axum_is_tower_underneath.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>three separate, real requests, in a row</T>
      {reqs.map((i) => {
        const land = easeOut(seg(t, 0.5 + i * 0.2, 0.75 + i * 0.2));
        const dy = (1 - land) * -16;
        return (
          <g key={i} transform={`translate(0,${dy})`} opacity={land}>
            <circle cx={200 + i * 30} cy={76} r={4} fill={C.caramel} />
          </g>
        );
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>the shared value: genuinely increasing</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>shared state, not three fresh copies</T>
    </Svg>
  );
}

// ── 7 · A from_fn layer and a tower-http layer, both wrapped on (predict) ───────────────────────
export function LayersPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two layers, wrapped around the same real server"
        lines={['.layer(middleware::from_fn(mark_ran))', 'route.layer(TimeoutLayer::new(dur)) // both genuinely run?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: both layers genuinely ran (takeaway) ───────────────────────────────────────────
export function LayersReveal({ t }: StepCtx) {
  // Lane one: a request goes in through the from_fn layer to the handler, and the response comes back out through
  // it, picking up the layer's change (a tag that snaps on) as it crosses. Lane two: a slow handler's bar grows
  // toward the timeout line and is cut off there.
  const layerX = 220, handlerX = 470;
  const go = easeOut(seg(t, 0.3, 0.8));
  const back = easeOut(seg(t, 0.9, 1.4));
  const x = back > 0 ? lerp(handlerX, 70, back) : lerp(70, handlerX, go);
  const tagged = back > 0 && x < layerX;
  const slow = easeOut(seg(t, 1.5, 2.3));
  const cut = 400;
  return (
    <Svg label="axum_is_tower_underneath.rs, measured" h={220}>
      <rect x={layerX - 6} y={30} width={12} height={170} rx={3} fill={C.cocoa} stroke={C.latte} />
      <T x={layerX} y={22} s={13} a="middle" f={C.latte}>layers</T>
      <T x={30} y={50} s={13} f={C.crema} o={fa(t, 0.2, 0.3)}>from_fn layer</T>
      <T x={handlerX + 60} y={92} s={13} a="middle" f={C.taupe}>handler</T>
      <line x1={70} y1={75} x2={handlerX} y2={75} stroke={C.mocha} strokeDasharray="3 4" />
      <circle cx={x} cy={75} r={7} fill={C.caramel} opacity={fa(t, 0.3, 0.2)} />
      {tagged && <rect x={x + 9} y={69} width={14} height={12} rx={2} fill={C.cinnamon} />}
      <Decode text="response modified" t={t} at={1.35} x={110} y={105} s={13} a="middle" f={C.cinnamon} />
      <T x={30} y={145} s={13} f={C.crema} o={fa(t, 1.4, 0.3)}>timeout layer</T>
      <line x1={cut} y1={140} x2={cut} y2={200} stroke={C.cherryText} strokeWidth={2} opacity={fa(t, 1.4, 0.3)} />
      <rect x={240} y={162} width={Math.max(2, slow * (cut - 240))} height={18} rx={3} fill={slow >= 1 ? C.cherry : C.caramel} />
      <Draw pts={[[cut, 160], [570, 160]]} t={t} from={2.2} to={2.5} stroke={C.mocha} w={1.5} dash="3 4" pen={false} />
      <Decode text="cut off" t={t} at={2.3} x={490} y={190} s={13} a="middle" f={C.cherryText} />
    </Svg>
  );
}

// ── 9 · One abstraction, inside a real server (no takeaway, connecting step) ────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'an extractor, pulling itself out of a request',
    'shared state, accumulating across requests',
    'two layers, composing around the same server',
  ];
  return (
    <Svg label="one abstraction, running for real" h={220}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="the same contract" />
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a path parameter, handed over already parsed',
    'shared state, genuinely accumulating, not reset',
    'two real layers, running against real requests',
    'no middleware system of its own, by its words',
  ];
  return (
    <Svg label="recap: one abstraction, running for real" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={190} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
