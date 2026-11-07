import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// Holding a span's own guard across an await lets it leak onto
// whatever runs next on the same thread; .instrument(span) and
// #[instrument] both fix it the identical, correct way, by exiting
// and re-entering the span around every real await instead.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the guard leak onto task_b (predict) ────────────────────────
export function BadPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="task_a holds the guard, then awaits"
        lines={['let _entered = span.enter();', 'sleep(50ms).await; // task_b runs meanwhile']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: task_b's event leaks into task_a's span (no takeaway) ─
export function BadReveal({ t }: StepCtx) {
  const rows = ['task_b emits its own, real event', 'current span: task_a (wrong)'];
  return (
    <Svg label="span_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does .instrument(span) still leak it (predict) ───────────────────
export function InstrumentPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="task_a wraps the future instead of entering by hand"
        lines={['async { sleep(50ms).await }', '    .instrument(span).await // still leaks?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: instrument(span) genuinely fixes it (takeaway) ────────
export function InstrumentReveal({ t }: StepCtx) {
  const exitX = easeOut(seg(t, 0.2, 0.4)) * 90 + 50;
  const travel = easeOut(seg(t, 0.45, 0.75));
  return (
    <Svg label="span_demo, captured" h={200}>
      <rect x={50} y={30} width={90} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.1, 0.2)} />
      <T x={95} y={52} s={11} a="middle" f={C.crema} o={fa(t, 0.1, 0.2)}>task_a span</T>
      <circle cx={exitX} cy={48} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <Draw pts={[[140, 48], [260, 48]]} t={t} from={0.45} to={0.75} stroke={C.latte} w={2} pen />
      <circle cx={140 + travel * 120} cy={48} r={5} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={160} y={80} width={180} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={250} y={105} s={12} a="middle" f={C.mocha}>current span: none, correct</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.4, 0.4)}>exited and re-entered around the await</T>
    </Svg>
  );
}

// ── 5 · Does the macro behave the same, correct way (predict) ───────────
export function MacroPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the plain function, written with the attribute"
        lines={['#[tracing::instrument]', 'async fn task_a() { sleep(50ms).await } // same fix?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the macro matches instrument(span) exactly (takeaway) ─
export function MacroReveal({ t }: StepCtx) {
  const travelA = easeOut(seg(t, 0.25, 0.55));
  const travelB = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="span_demo, captured" h={200}>
      <T x={50} y={35} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>.instrument(span)</T>
      <T x={50} y={70} s={11} f={C.latte} o={fa(t, 0.25, 0.2)}>#[instrument]</T>
      <Draw pts={[[150, 30], [250, 95]]} t={t} from={0.25} to={0.55} stroke={C.caramel} w={2} pen />
      <Draw pts={[[150, 65], [250, 95]]} t={t} from={0.4} to={0.7} stroke={C.caramel} w={2} pen />
      <circle cx={150 + travelA * 100} cy={30 + travelA * 65} r={5} fill={C.caramel} opacity={fa(t, 0.25, 0.2)} />
      <circle cx={150 + travelB * 100} cy={65 + travelB * 30} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={190} y={95} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={270} y={120} s={12} a="middle" f={C.mocha}>current span: none, identical</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>generated code, not a different mechanism</T>
    </Svg>
  );
}

// ── 7 · The tracing docs' own words on this exact mistake (connecting) ──
export function DocsReveal({ t }: StepCtx) {
  const rows = ['holding the guard: incorrect traces', 'entered every time the future is polled'];
  return (
    <Svg label="tracing's own docs, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a held guard leaks onto whatever runs next', 'instrument(span): exit and re-enter it', 'the attribute macro: the identical fix'];
  return (
    <Svg label="recap: a span tied to being polled" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
