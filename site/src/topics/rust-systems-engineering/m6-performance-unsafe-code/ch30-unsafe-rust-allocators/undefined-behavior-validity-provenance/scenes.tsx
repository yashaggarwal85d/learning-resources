import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A validity rule and a provenance rule are both checked directly and
// safely, never by constructing the invalid case they describe.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · How many of 256 bytes are a valid bool (predict, hook) ──────────
export function BoolValidityPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="256 possible byte patterns, one bool"
        lines={['for byte in 0u16..=255 { is_valid_bool_byte(byte as u8) }', '// how many of the 256 genuinely pass?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: exactly 2 of 256 (takeaway) ────────────────────────────
export function BoolValidityReveal({ t }: StepCtx) {
  return (
    <Svg label="validity_and_provenance_are_rules_not_bit_patterns.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>every one of 256 real byte values, checked</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>exactly 2 pass: byte 0, byte 1</T>
      </g>
    </Svg>
  );
}

// ── 3 · Does with_addr keep the real right to read it (predict) ─────────
export function AddrRoundTripPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="addr(), shifted, rebuilt with with_addr()"
        lines={['ptr.with_addr(ptr.addr() + 3 * size_of::<i32>());', '// still the real right to read that allocation?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the round trip recovers the correct value (takeaway) ──
export function AddrRoundTripReveal({ t }: StepCtx) {
  const rows = ['base_addr read out, shifted by three elements', 'with_addr rebuilds it, same real provenance'];
  return (
    <Svg label="validity_and_provenance_are_rules_not_bit_patterns.rs" h={200}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>with_addr keeps that right, a cast never does</T>
    </Svg>
  );
}

// ── 5 · Of 6 addresses, how many pass non-null and aligned (predict) ────
export function NullAlignPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="6 real candidate addresses, align 4, no reference built"
        lines={['[0, 4, 6, 8, 11, 16].filter(|a| a != 0 && a % 4 == 0)', '// how many of the six genuinely pass?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: exactly 3 of 6 pass (takeaway) ─────────────────────────
export function NullAlignReveal({ t }: StepCtx) {
  return (
    <Svg label="validity_and_provenance_are_rules_not_bit_patterns.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical check, on six real addresses</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>exactly 3 pass: 4, 8, 16</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>checked on the address; nothing invalid built</T>
    </Svg>
  );
}

// ── 7 · Three sources' own words on this exact rule (connecting) ────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['producing an invalid value is immediate UB', 'provenance is the real right to access memory'];
  return (
    <Svg label="Rust Reference / std::mem / std::ptr, quoted" h={180}>
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
  const rows = ['a validity rule: checked on every real byte', 'a provenance rule: checked on a real address', 'neither one built by constructing the invalid case'];
  return (
    <Svg label="recap: validity and provenance, checked directly" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
