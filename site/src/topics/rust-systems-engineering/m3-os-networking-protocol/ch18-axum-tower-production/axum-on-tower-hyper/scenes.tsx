import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Axum has no middleware system of its own; it is tower::Service and Layer all
// the way down. A real extractor, real shared state, a real middleware::from_fn
// layer, and a real tower-http layer all compose through that same abstraction
// inside a real running server.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="axum's own documentation, quoted directly" h={160}>
      <T x={60} y={70} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>no middleware system of its own</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>it's Service, all the way down</T>
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
  return (
    <Svg label="axum_is_tower_underneath.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real request, a name in its own path</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
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
  return (
    <Svg label="axum_is_tower_underneath.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>three separate, real requests, in a row</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>the shared value: genuinely increasing</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>shared state, not three fresh copies</T>
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
  const rows = [
    'the from_fn layer: modified a real response',
    'the tower-http layer: cut off a slow handler',
  ];
  return (
    <Svg label="axum_is_tower_underneath.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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
    'a path parameter, handed over already parsed',
    'shared state, genuinely accumulating, not reset',
    'two real layers, running against real requests',
    'no middleware system of its own, by its words',
  ];
  return (
    <Svg label="recap: one abstraction, running for real" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
