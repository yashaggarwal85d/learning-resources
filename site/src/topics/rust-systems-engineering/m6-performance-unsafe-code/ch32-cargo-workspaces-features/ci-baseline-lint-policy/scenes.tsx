import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

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
  return (
    <Svg label="ci_demo/core, checked both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cargo clippy, the real violation and its fix</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>fails and names it, then builds clean</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>denied once, caught every real time</T>
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
  return (
    <Svg label="ci_demo/core, checked both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cargo build versus cargo test, the regression</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>build: clean · test: genuinely fails</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>only the test checks what it actually does</T>
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
