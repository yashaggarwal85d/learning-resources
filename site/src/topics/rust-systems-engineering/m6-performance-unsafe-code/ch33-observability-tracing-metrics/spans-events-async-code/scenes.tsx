import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

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
  return (
    <Svg label="span_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>task_b's own event, this time</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>current span: none, genuinely correct</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>exited and re-entered around the await</T>
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
  return (
    <Svg label="span_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the macro, checked the same way</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>current span: none, the identical fix</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>generated code, not a different mechanism</T>
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
