import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Two unrelated counters sharing one real cache line genuinely pay a
// real, growing invalidation cost; padding each counter onto its own
// real cache line genuinely removes that cost entirely.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does sharing a line cost the other core anything (predict, hook) ─
export function SharedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two unrelated counters, one real cache line"
        lines={['count_invalidations_shared(&alternating_writes);', '// costs the other core anything?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: pays a real cost on every write (takeaway) ────────────
export function SharedReveal({ t }: StepCtx) {
  return (
    <Svg label="false_sharing_costs_a_shared_cache_line.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two unrelated counters, one shared line</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>an invalidation on every alternating write</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>unrelated data still pays a real, shared cost</T>
    </Svg>
  );
}

// ── 3 · Does padding remove the cost entirely (predict) ──────────────────
export function PaddedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical counters, each its own real line"
        lines={['count_invalidations_padded(&alternating_writes);', '// only reduces the cost, or removes it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely removes it entirely (takeaway) ───────────────
export function PaddedReveal({ t }: StepCtx) {
  return (
    <Svg label="false_sharing_costs_a_shared_cache_line.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical writes, now two real lines</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>zero cross-core invalidations, genuinely</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>padding removes the whole cost, not a share</T>
    </Svg>
  );
}

// ── 5 · Does the shared cost grow with more work (predict) ───────────────
export function ScalePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical two layouts, far more operations"
        lines={['shared_cost(long_run) vs shared_cost(short_run);', '// grows, or stays fixed?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: grows; padded stays at zero (takeaway) ─────────────────
export function ScaleReveal({ t }: StepCtx) {
  const rows = ['shared layout: cost rises with every run', 'padded layout: stays at zero, every run'];
  return (
    <Svg label="false_sharing_costs_a_shared_cache_line.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact rule (connecting) ─────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['one write invalidates the whole real line', 'padding is the real, standard fix'];
  return (
    <Svg label="crossbeam_utils Docs / Wikipedia, quoted" h={180}>
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
  const rows = ['a shared cache line costs both cores, always', 'that cost grows, it never plateaus', 'padding removes it, down to zero'];
  return (
    <Svg label="recap: a real cache line, shared and padded" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
