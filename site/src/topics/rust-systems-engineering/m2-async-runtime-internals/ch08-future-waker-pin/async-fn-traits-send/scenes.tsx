import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeInOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A trait's async fn is neither dyn compatible nor Send-constrainable by callers — two separate
// gaps in the stable 2026 language, each proven by a real compiler error. trait-variant and
// async-trait are real crate dependencies, each fixing exactly one of the two gaps.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Can an async trait method be boxed as dyn? (predict, hook) ─────────────────────────────
export function DynBoxPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a trait with one async method"
        lines={['trait Greeter {', '    async fn greet(&self);', '}', 'fn make() -> Box<dyn Greeter> { .. }']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[3]}
      />
    </Stack>
  );
}

// ── 2 · No — the compiler's own diagnostic (no takeaway, "from" step) ──────────────────────────
export function DynFailReveal({ t }: StepCtx) {
  return (
    <Code
      title="async_fn_in_trait_not_dyn_safe.rs"
      dim
      lines={['error[E0038]: the trait Greeter is', '  not dyn compatible', '// because method greet is async']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 3 · Can a generic caller require Send? (predict) ────────────────────────────────────────────
export function SendGenericPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a Send implementor, a generic spawn"
        lines={['fn run<G: Greeter + Send>(g: G) {', '    multi_threaded_spawn(g.greet());', '}', '// does this type-check?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · rustc's own diagnostic (takeaway) ───────────────────────────────────────────────────────
export function SendFailReveal({ t }: StepCtx) {
  return (
    <Code
      title="returned_future_not_send.rs"
      dim
      lines={['error[E0277]: impl Future<..> cannot', '  be sent between threads safely', '// even though G itself is Send']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 5 · trait-variant generates a second trait (takeaway) ──────────────────────────────────────
export function TraitVariantReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="trait_variant's own example"
        lines={['#[trait_variant::make(Greeter: Send)]', 'trait LocalGreeter {', '    async fn greet(self) -> String;', '}']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 6 · Proven: spawned on a real thread (takeaway) ──────────────────────────────────────────────
export function TraitVariantProvenReveal({ t }: StepCtx) {
  const x = lerp(60, 330, easeInOut(seg(t, 0.3, 1.1)));
  return (
    <Svg label="trait-variant-fix: a real cross-thread spawn" h={200}>
      <T x={60} y={40} s={13} f={C.quiet}>through the generated Greeter trait</T>
      <line x1={300} y1={55} x2={300} y2={150} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={300} y={165} s={12} a="middle" f={C.taupe}>thread boundary</T>
      <rect x={x} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={x + 110} y={112} s={13} a="middle" f={C.mocha}>spawned, joined, correct</T>
      <Reticle x={x + 110} y={107} w={230} h={54} t={t} at={1.1} />
    </Svg>
  );
}

// ── 7 · Does fixing Send fix dyn too? (predict) ─────────────────────────────────────────────────
export function StillNotDynPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same boxed attempt, after the Send fix"
        lines={['fn make() -> Box<dyn Greeter> { .. }', '// Send is fixed now. does this compile?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · async-trait boxes every call (takeaway) ─────────────────────────────────────────────────
export function AsyncTraitReveal({ t }: StepCtx) {
  return (
    <Code
      title="async-trait's own documented expansion"
      lines={['fn run(&self)', '  -> Pin<Box<dyn Future<Output=()>', '       + Send + \'async_trait>>']}
      t={t}
      start={0.1}
      end={2.4}
      highlight={[1, 2]}
    />
  );
}

// ── 9 · Measured: one real allocation (takeaway) ────────────────────────────────────────────────
export function AllocationCountReveal({ t }: StepCtx) {
  const n = Math.round(lerp(0, 1, easeOut(seg(t, 0.4, 1.1))));
  return (
    <Svg label="async-trait-fix: a real counting allocator" h={200}>
      <T x={60} y={40} s={13} f={C.quiet}>one dyn-dispatched call, through the macro</T>
      <T x={60} y={125} s={48} f={C.caramel} serif>{n}</T>
      <T x={150} y={120} s={14} f={C.mocha}>heap allocation</T>
      <Reticle x={90} y={100} w={160} h={64} t={t} at={1.1} />
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>counted directly, not cited</T>
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'an async method is neither dyn-safe nor Send by default',
    'trait-variant fixes Send with a generated sibling trait',
    'async-trait fixes dyn, at one measured allocation',
    'the two gaps are separate; each needs its own fix',
  ];
  return (
    <Svg label="recap: two gaps, two fixes, proven both ways" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
