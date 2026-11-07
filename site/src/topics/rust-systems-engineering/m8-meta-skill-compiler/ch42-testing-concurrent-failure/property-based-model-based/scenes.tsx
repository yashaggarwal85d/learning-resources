import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const longIds = Array.from({ length: 12 }, (_, i) => i);
  const shrink = easeOut(seg(t, 0.55, 0.85));
  return (
    <Svg label="proptest, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the real failure, shrunk down</T>
      {longIds.map((i) => {
        const start = 0.1 + i * 0.025;
        const fadeOut = i >= 4 ? easeOut(seg(t, 0.55 + i * 0.015, 0.7 + i * 0.015)) : 0;
        return (
          <circle
            key={i}
            cx={30 + i * 26}
            cy={55}
            r={5}
            fill={i < 4 ? C.caramel : C.cherry}
            opacity={fa(t, start, 0.15) * (1 - fadeOut)}
          />
        );
      })}
      <Draw pts={[[30, 75], [30 + 3 * 26, 75]]} t={t} from={0.85} to={1.0} stroke={C.caramel} w={2} pen />
      <g opacity={fa(t, 0.95, 0.3)}>
        <rect x={60} y={95} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={117} s={12} a="middle" f={C.mocha}>a handful of inserts, barely over capacity</T>
      </g>
      <T x={60} y={150} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>the smallest real cause, not a lucky guess</T>
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
  const ids = [0, 1, 2, 3, 4, 5, 6];
  return (
    <Svg label="proptest, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical check, the checked insert</T>
      {ids.map((i) => {
        const start = 0.15 + i * 0.07;
        const travel = easeOut(seg(t, start, start + 0.3));
        return (
          <g key={i}>
            <Draw pts={[[40 + i * 44, 50], [40 + i * 44, 95]]} t={t} from={start} to={start + 0.3} stroke={C.caramel} w={2} pen />
            <circle cx={40 + i * 44} cy={50 + travel * 45} r={5} fill={C.caramel} opacity={fa(t, start, 0.15)} />
          </g>
        );
      })}
      <g opacity={fa(t, 1.0, 0.3)}>
        <rect x={60} y={110} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={132} s={12} a="middle" f={C.mocha}>every random case, genuinely passed</T>
      </g>
      <T x={60} y={165} s={12} f={C.latte} o={fa(t, 1.4, 0.3)}>confidence from many cases, not one</T>
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
