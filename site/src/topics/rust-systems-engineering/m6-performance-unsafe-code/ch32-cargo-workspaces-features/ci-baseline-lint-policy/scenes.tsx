import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A format check catches what a human eye would call messy; a denied
// lint catches a known, named mistake the instant it appears; a test
// catches a real behavior regression neither one can see; none of the
// three substitutes for either of the other two.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does fmt --check catch it (predict) ──────────────────────────────
export function FmtPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one line, indented four extra spaces"
        lines={['// core/src/lib.rs, cargo build compiles it fine', 'cargo fmt --check // does this genuinely fail?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: fmt --check fails, build never minds (no takeaway) ────
export function FmtReveal({ t }: StepCtx) {
  const rows = ['cargo build: genuinely clean, both versions', 'cargo fmt --check: fails, then passes again'];
  return (
    <Svg label="ci_demo, checked both ways" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the denied lint catch it (predict) ──────────────────────────
export function ClippyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real needless_return, denied by the workspace"
        lines={['return format!("Hello, {name}!"); // denied', 'cargo clippy --workspace // does this fail?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: clippy genuinely fails, names the lint (takeaway) ─────
export function ClippyReveal({ t }: StepCtx) {
  const bounce = easeOut(seg(t, 0.5, 0.8));
  const dy = (1 - Math.abs(bounce - 0.5) * 2) * 12;
  const fixed = easeOut(seg(t, 0.95, 1.2));
  return (
    <Svg label="ci_demo/core, checked both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cargo clippy, the real violation and its fix</T>
      <circle cx={100} cy={78 - dy} r={5} fill={C.cherry} opacity={fa(t, 0.4, 0.2) * (1 - fixed)} />
      <T x={115} y={82} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>needless_return: denied</T>
      <Draw pts={[[100, 95], [100, 115]]} t={t} from={0.95} to={1.1} stroke={C.caramel} w={2} pen />
      <circle cx={100} cy={115} r={5} fill={C.caramel} opacity={fa(t, 1.0, 0.2) * fixed} />
      <T x={115} y={119} s={12} f={C.latte} o={fa(t, 1.0, 0.3)}>fixed: builds clean</T>
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>fails and names it, then builds clean</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>denied once, caught every real time</T>
    </Svg>
  );
}

// ── 5 · Which gate catches the logic regression (predict) ───────────────
export function TestPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same return type, now always wrong"
        lines={['fn is_valid_feature_name(_n: &str) -> bool {', '    true // compiles fine; still correct? }']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: build stays green, test catches it (takeaway) ─────────
export function TestReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="ci_demo/core, checked both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cargo build versus cargo test, the regression</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>cargo build</T>
      <circle cx={190 + travel * 90} cy={76} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>cargo test</T>
      <circle cx={260} cy={111} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.8, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>build: clean · test: genuinely fails</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>only the test checks what it actually does</T>
    </Svg>
  );
}

// ── 7 · The Cargo Book's own words on these exact rules (connecting) ────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a lint level, overridden once in one table', 'unit, integration, and documentation tests'];
  return (
    <Svg label="The Cargo Book, quoted" h={180}>
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
  const rows = ['a format check catches what looks messy', 'a denied lint catches a known mistake', 'a test catches what only behavior reveals'];
  return (
    <Svg label="recap: three real, different gates" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
