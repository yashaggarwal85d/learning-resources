import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A length read from untrusted input is a real security boundary
// whether or not anyone decided to treat it as one; checking it first
// is what makes the difference measurable rather than theoretical.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the unchecked slice survive an oversized claim (predict) ──
export function BoundsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a naive parser, slicing with the claimed length"
        lines={['&buf[start..start + len] // len claims far more', '// than the buffer holds. what happens?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the naive slice panics, the checked parser rejects ──
export function BoundsReveal({ t }: StepCtx) {
  const rows = ['naive parser: genuinely panics', 'checked parser: rejected cleanly, no panic'];
  return (
    <Svg label="parser_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the naive parser catch an over-policy length (predict) ────
export function PolicyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a length that fits the buffer, but not the policy"
        lines={['len <= buf.len() // fits. but over the max size?', '// does the naive parser catch this one too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: naive accepts it, checked rejects it (takeaway) ──────
export function PolicyReveal({ t }: StepCtx) {
  return (
    <Svg label="parser_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a length that fits, but breaks the policy</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>naive: accepted. checked: rejected</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>fitting the buffer is not the same as safe</T>
    </Svg>
  );
}

// ── 5 · Does overflow look obviously wrong (predict) ───────────────────
export function OverflowPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two lengths, added with plain arithmetic"
        lines={['header_len + payload_len // release build', '// does a real overflow look obviously wrong?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the sum wraps silently to a small number ─────────────
export function OverflowReveal({ t }: StepCtx) {
  return (
    <Svg label="parser_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real overflow, in a real release build</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>naive: wraps small. checked: catches it</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>silent wraparound looks perfectly safe</T>
    </Svg>
  );
}

// ── 7 · checked_add and overflow-checks' own words (connecting) ────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['checked_add: reports none, never wraps', 'release skips overflow checks by default'];
  return (
    <Svg label="checked_add and overflow-checks, their own docs" h={180}>
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
  const rows = ['a length that fits still needs its own policy', 'a small sum may have just overflowed', 'checking both is what makes a boundary real'];
  return (
    <Svg label="recap: a length nobody checked before trusting it" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
