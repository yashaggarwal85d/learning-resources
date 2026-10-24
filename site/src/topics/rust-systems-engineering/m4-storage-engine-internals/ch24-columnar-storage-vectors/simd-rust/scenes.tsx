import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// An explicit SIMD kernel, called only once the real CPU's own support
// is checked at runtime, computes the exact identical answer as its
// scalar equivalent while processing far fewer real operations, by
// exactly the real lane width, and that runtime check is the genuine
// safety contract making any of it sound to call at all.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the real CPU support AVX2 (predict) ──────────────────────────
export function DetectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="checked at runtime, before the kernel ever runs"
        lines={['is_x86_feature_detected!("avx2")', '// genuinely supported, or always falls back?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely supported (no takeaway, the test's own "from" step) ──
export function DetectReveal({ t }: StepCtx) {
  const rows = ['is_x86_feature_detected!("avx2"): true', 'the explicit kernel ran for real'];
  return (
    <Svg label="simd_autovectorization_verification.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the kernel match the scalar sum exactly (predict) ───────────
export function CorrectnessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical column, both paths"
        lines={['scalar_sum(&column) == simd_sum(&column).0?', '// the exact identical sum?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the identical sum (takeaway) ────────────────────────────
export function CorrectnessReveal({ t }: StepCtx) {
  return (
    <Svg label="simd_autovectorization_verification.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>scalar sum vs explicit SIMD sum</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>exact identical result, both paths</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>SIMD changes cost, not correctness</T>
    </Svg>
  );
}

// ── 5 · Does SIMD process far fewer operations (predict) ─────────────────
export function OpCountPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="scalar operations vs vector operations"
        lines={['scalar_ops vs simd_ops, the identical column', '// far fewer in the SIMD kernel?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: far fewer, exact match (takeaway) ───────────────────────
export function OpCountReveal({ t }: StepCtx) {
  return (
    <Svg label="simd_autovectorization_verification.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>scalar ops vs vector ops, same column</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>far fewer, exact lane-width match</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the cut follows exactly from the lane width</T>
    </Svg>
  );
}

// ── 7 · Does Rust name it unsafe without the check (predict) ─────────────
export function SafetyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the Rust standard library's own safety contract"
        lines={['// does it name calling without the check as unsafe?', '// or merely slower, without real risk?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: unsafe without the check (takeaway) ─────────────────────
export function SafetyReveal({ t }: StepCtx) {
  const rows = ['unsafe to call an AVX2 function', 'on a CPU that genuinely lacks AVX2'];
  return (
    <Svg label="Rust Standard Library Docs: std::arch, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · the real mechanism, cpuid (connecting) ────────────────────────────
export function CpuidReveal({ t }: StepCtx) {
  const rows = ['runtime detection: relies mostly on cpuid', 'the real instruction behind the check'];
  return (
    <Svg label="Rust Standard Library Docs: is_x86_feature_detected!, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'checked first: the real CPU genuinely supports it',
    'the result: exact, identical to the scalar sum',
    'the cost: far fewer ops, by the real lane width',
    'the contract: the check is what makes it safe',
  ];
  return (
    <Svg label="recap: what makes an explicit SIMD kernel sound" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
