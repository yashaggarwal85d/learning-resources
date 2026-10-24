import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A distribution's own p50 and p99 are genuinely separate statistics; a
// real change can genuinely improve one while genuinely regressing the
// other, and a single average alone genuinely hides that divergence.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a lower average mean faster for everyone (predict, hook) ─────
export function AveragePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a benchmark's own average, down after a change"
        lines={['after_avg < before_avg;', '// means every real request got faster?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: p50 and p99 genuinely separate (no takeaway, "from") ────
export function PercentileReveal({ t }: StepCtx) {
  const rows = ['p50: the typical real request, 10ms', 'p99: the real worst case, 45ms'];
  return (
    <Svg label="tail_latency_diverges_from_the_average.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the median dropping mean the p99 drops too (predict) ─────────
export function MedianPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real change, the real median genuinely drops"
        lines={['after_p50 < before_p50;', '// means after_p99 < before_p99 too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: median improved, p99 regressed (takeaway) ───────────────
export function MedianReveal({ t }: StepCtx) {
  return (
    <Svg label="tail_latency_diverges_from_the_average.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>p50: 10ms down to 8ms, genuinely faster</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>p99: 45ms up to 55ms, genuinely slower</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a median alone cannot show the real tail</T>
    </Svg>
  );
}

// ── 5 · Does the average show the real p99 regression (predict) ──────────
export function AverageDoesItPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical change, the real average instead"
        lines={['after_avg < before_avg;', '// does this still show the p99 regression?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: average also improved, hiding the regression (takeaway) ─
export function AverageHidesReveal({ t }: StepCtx) {
  return (
    <Svg label="tail_latency_diverges_from_the_average.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>avg: 11.75ms down to 10.35ms, improved too</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>yet the real p99 still regressed, 45 to 55</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a single average can hide a real tail cost</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact discipline (connecting) ─────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['warmup, then outlier classification, first', 'an uncorrected sample hides its own slow tail'];
  return (
    <Svg label="Criterion.rs Docs / HdrHistogram README, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['p50 and p99 are two separate real statistics', 'a median and the real tail can move apart', 'an average alone can hide what the tail does'];
  return (
    <Svg label="recap: a real latency distribution, measured" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
