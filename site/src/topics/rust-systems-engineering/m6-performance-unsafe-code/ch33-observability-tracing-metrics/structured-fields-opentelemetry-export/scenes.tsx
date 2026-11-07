import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A structured field sums exactly, every time, no matter how its own
// event is worded; a formatted sentence can silently lose the
// identical value the moment it is phrased differently; and a real,
// specified format like traceparent survives being built by one
// program and parsed by a completely different one, exactly.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the structured field sum correctly (predict) ───────────────
export function StructuredPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="three events, one real typed field each"
        lines={['info!(attempt = 1u64, "attempt 1 of 3 failed")', '// sum the real field directly: correct total?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the structured sum is exactly right (no takeaway) ─────
export function StructuredReveal({ t }: StepCtx) {
  const rows = ['attempt field: 1, 2, 3', 'structured total: 6, genuinely right'];
  return (
    <Svg label="field_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the formatted text give the same total (predict) ───────────
export function FormattedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same total, pulled from the message text"
        lines={['"third attempt now running" // no digit at all', '// re-parse the sentence: same total?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the formatted total is genuinely wrong (takeaway) ─────
export function FormattedReveal({ t }: StepCtx) {
  const bars = [0, 1, 2];
  return (
    <Svg label="field_demo, captured" h={210}>
      <T x={30} y={30} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>recovered from text: 1, 1, 1</T>
      {bars.map((i) => {
        const start = 0.2 + i * 0.15;
        const grow = easeOut(seg(t, start, start + 0.25));
        return (
          <rect key={i} x={30 + i * 50} y={95 - grow * 14} width={30} height={grow * 14} fill={C.cherry} opacity={fa(t, start, 0.2)} />
        );
      })}
      <Draw pts={[[200, 60], [200, 85]]} t={t} from={0.6} to={0.75} stroke={C.caramel} w={2} pen />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={150} y={95} width={210} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={255} y={122} s={13} a="middle" f={C.mocha}>total: 3, wrong (should be 6)</T>
      </g>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>a sentence's own words are not a value</T>
    </Svg>
  );
}

// ── 5 · Does the traceparent header round-trip (predict) ────────────────
export function TraceContextPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real traceparent header, built then parsed"
        lines={['00-4bf92f35...e4736-00f067aa...02b7-01', '// round-trips exactly? a bad header rejected?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: it round-trips, the bad header is rejected (takeaway) ─
export function TraceContextReveal({ t }: StepCtx) {
  const good = easeOut(seg(t, 0.2, 0.5));
  const bad = easeOut(seg(t, 0.35, 0.6));
  return (
    <Svg label="field_demo, captured" h={210}>
      <T x={30} y={30} s={11} f={C.latte} o={fa(t, 0.1, 0.2)}>built header</T>
      <Draw pts={[[90, 35], [260, 65]]} t={t} from={0.2} to={0.5} stroke={C.caramel} w={2} pen />
      <circle cx={90 + good * 170} cy={35 + good * 30} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={30} y={85} s={11} f={C.latte} o={fa(t, 0.3, 0.2)}>malformed header</T>
      <Draw pts={[[110, 90], [230, 90]]} t={t} from={0.35} to={0.6} stroke={C.latte} w={2} pen />
      <circle cx={110 + bad * 60} cy={90} r={5} fill={C.cherry} opacity={fa(t, 0.35, 0.2)} />
      <circle cx={230} cy={90} r={7} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.6, 0.2)} />
      <g opacity={fa(t, 0.75, 0.3)}>
        <rect x={190} y={45} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={270} y={70} s={12} a="middle" f={C.mocha}>exact round-trip</T>
        <T x={240} y={112} s={11} f={C.latte}>rejected, not guessed at</T>
      </g>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>a specified format survives a new parser</T>
    </Svg>
  );
}

// ── 7 · The W3C and tracing docs' own words (connecting) ────────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a trace id: a real, specific byte value', 'fields: key-value data, not free text'];
  return (
    <Svg label="W3C and tracing's own docs, quoted" h={180}>
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
  const rows = ['a structured field sums exactly, always', 'a sentence can silently lose the value', 'a specified format survives a new parser'];
  return (
    <Svg label="recap: a field that survives being queried" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
