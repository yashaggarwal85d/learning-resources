import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const naive = easeOut(seg(t, 0.2, 0.55));
  const checked = easeOut(seg(t, 0.35, 0.6));
  return (
    <Svg label="parser_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>a length that fits, but breaks the policy</T>
      <Draw pts={[[40, 55], [320, 55]]} t={t} from={0.2} to={0.55} stroke={C.caramel} w={2} pen />
      <circle cx={40 + naive * 280} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <T x={330} y={58} s={10} f={C.latte}>naive</T>
      <Draw pts={[[40, 90], [200, 90]]} t={t} from={0.35} to={0.6} stroke={C.latte} w={2} pen />
      <circle cx={40 + checked * 160} cy={90} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.35, 0.15)} />
      <rect x={200} y={75} width={2} height={30} fill={C.cherry} opacity={fa(t, 0.6, 0.15)} />
      <T x={210} y={100} s={10} f={C.latte}>checked: policy limit</T>
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={60} y={125} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={147} s={12} a="middle" f={C.mocha}>naive: accepted. checked: rejected</T>
      </g>
      <T x={60} y={175} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>fitting the buffer is not the same as safe</T>
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
  const sumUp = easeOut(seg(t, 0.2, 0.45));
  const wrap = easeOut(seg(t, 0.5, 0.7));
  const naiveH = sumUp * 55 * (1 - wrap) + wrap * 6;
  return (
    <Svg label="parser_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>a real overflow, in a real release build</T>
      <T x={30} y={45} s={10} f={C.latte} o={fa(t, 0.1, 0.2)}>header_len + payload_len, both large</T>
      <rect x={60} y={95 - naiveH} width={40} height={naiveH} fill={naiveH < 10 ? C.cherry : C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <T x={80} y={110} s={10} a="middle" f={C.latte}>naive: wraps small</T>
      <circle cx={210} cy={70} r={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.6, 0.15)} />
      <T x={225} y={74} s={10} f={C.latte}>checked: catches it</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={125} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={147} s={12} a="middle" f={C.mocha}>naive: wraps small. checked: catches it</T>
      </g>
      <T x={60} y={175} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>silent wraparound looks perfectly safe</T>
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
