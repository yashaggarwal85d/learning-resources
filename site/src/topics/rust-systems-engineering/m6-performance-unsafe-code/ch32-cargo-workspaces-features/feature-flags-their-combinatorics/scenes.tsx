import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>consumer_b alone: "plain"</T>
      <circle cx={280} cy={76} r={5} fill={C.caramel} opacity={fa(t, 0.45, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.6, 0.3)}>consumer_b with fancy: "plain"</T>
      <circle cx={280} cy={111} r={5} fill={C.caramel} opacity={fa(t, 0.65, 0.2)} />
      <Draw pts={[[280, 86], [280, 101]]} t={t} from={0.8} to={1.0} stroke={C.taupe} w={2} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={140} s={13} a="middle" f={C.mocha}>"plain" alone, "plain" together</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>additive means nothing already there moves</T>
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
  const leak = easeOut(seg(t, 0.5, 0.8));
  return (
    <Svg label="feature_demo vs feature_demo_legacy" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical declaration, two resolvers</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>legacy resolver</T>
      <circle cx={190 + leak * 90} cy={76} r={5} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.85, 0.3)}>resolver 3</T>
      <circle cx={280} cy={111} r={5} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>legacy: "fast" · resolver 3: "plain"</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>the resolver decides what can leak through</T>
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
