import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

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
  return (
    <Svg label="field_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same three events, re-parsed from text</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>total: 3, genuinely wrong (should be 6)</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a sentence's own words are not a value</T>
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
  return (
    <Svg label="field_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real header, parsed both ways</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>exact round-trip; malformed: rejected</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a specified format survives a new parser</T>
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
