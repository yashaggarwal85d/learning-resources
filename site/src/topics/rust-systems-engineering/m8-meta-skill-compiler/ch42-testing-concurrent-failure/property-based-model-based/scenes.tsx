import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A shrunk counterexample catches a real bug a hand-picked example
// test, checking only the cases its author thought of, would never
// have been written to find.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a random search find the bug (predict) ────────────────────
export function BugPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a slot allocator, checked only against one example"
        lines={['naive_insert(len) // never checks where it starts', '// does a random search find the bug anyway?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the random search finds a failing sequence ───────────
export function BugReveal({ t }: StepCtx) {
  const rows = ['hundreds of random sequences, tried in turn', 'one of them genuinely breaks the bounds check'];
  return (
    <Svg label="proptest, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the failing case stay long, or shrink (predict) ───────────
export function ShrinkPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a long, random sequence that triggers the bug"
        lines={['up to thirty real inserts in the sequence', '// does the reported case stay that long?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the case shrinks to a minimal cause ───────────────────
export function ShrinkReveal({ t }: StepCtx) {
  return (
    <Svg label="proptest, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real failure, shrunk down</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>a handful of inserts, barely over capacity</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the smallest real cause, not a lucky guess</T>
    </Svg>
  );
}

// ── 5 · Does the checked version pass by luck (predict) ─────────────────
export function CheckedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the checked insert, the identical real test"
        lines={['checked_insert(len) // checks start plus len', '// does it only pass by picking easy cases?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: it passes every one of the random cases ──────────────
export function CheckedReveal({ t }: StepCtx) {
  return (
    <Svg label="proptest, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical check, the checked insert</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>every random case, genuinely passed</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>confidence from many cases, not one</T>
    </Svg>
  );
}

// ── 7 · proptest's own words on properties and shrinking ────────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['tests that real properties hold for any input', 'on failure: finds the real, minimal case'];
  return (
    <Svg label="proptest, its own words" h={180}>
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
  const rows = ['far more cases than anyone writes by hand', 'shrunk down to the smallest real cause', 'a simpler model, checked against reality'];
  return (
    <Svg label="recap: trying a great many real cases" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
