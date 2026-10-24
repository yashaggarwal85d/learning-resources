import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A feature a sibling crate requests is unified into a shared
// dependency's own single build, for better or worse; staying
// additive is what keeps that unification safe, and the resolver a
// workspace declares decides whether even a dev-only request can
// leak somewhere nobody meant it to go.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does consumer_b's output change (predict) ────────────────────────
export function NonAdditivePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="consumer_b never asks for fast_mode itself"
        lines={['cargo build -p consumer_a -p consumer_b \\', '  --features consumer_a/fast_mode // consumer_b changes too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: consumer_b changes anyway (no takeaway, "from") ───────
export function NonAdditiveReveal({ t }: StepCtx) {
  const rows = ['consumer_b alone: "plain"', 'consumer_b with consumer_a/fast_mode: "fast"'];
  return (
    <Svg label="feature_demo/target/debug" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the additive feature change it too (predict) ───────────────
export function AdditivePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="now consumer_a requests fancy instead, purely additive"
        lines={['cargo build -p consumer_a -p consumer_b \\', '  --features consumer_a/fancy // consumer_b changes too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: consumer_b stays untouched (takeaway) ──────────────────
export function AdditiveReveal({ t }: StepCtx) {
  return (
    <Svg label="feature_demo/target/debug" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>consumer_b, checked both ways again</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>"plain" alone, "plain" together</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>additive means nothing already there moves</T>
    </Svg>
  );
}

// ── 5 · Does the dev-dependency leak (predict) ───────────────────────────
export function DevDepPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="consumer_b's own dev-dependency requests fast_mode"
        lines={['[dev-dependencies]', 'core_crate = { path = "../core", features = ["fast_mode"] }']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: leaks under the old resolver, not the new (takeaway) ──
export function DevDepReveal({ t }: StepCtx) {
  return (
    <Svg label="feature_demo vs feature_demo_legacy" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical declaration, two resolvers</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>legacy: "fast" · resolver 3: "plain"</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the resolver decides what can leak through</T>
    </Svg>
  );
}

// ── 7 · The Cargo Book's own words on these exact rules (connecting) ────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['features unify to their union, every build', 'a feature should stay additive, always'];
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
  const rows = ['a sibling\'s requested feature reaches you', 'additive is what keeps that reach safe', 'the resolver decides what can leak through'];
  return (
    <Svg label="recap: a feature's own real combinatorics" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
