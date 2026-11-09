import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeInOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// Pin exists because the compiler's generated async state machines can hold a reference into
// their own fields; moving such a value after that reference forms leaves it stale. Every claim
// is executed by examples.py (current stable rustc, edition 2024; pin-project-lite is the one
// real crate dependency, used only for the structural-projection example).
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Can a local point into a sibling local? (predict, hook) ────────────────────────────────
export function SelfPointingLocalsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two ordinary locals, side by side"
        lines={['let mut value = String::from("hello");', 'let mut pointer: *const String = null();', '// could pointer target value\'s own address?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 2 · Named by the standard library itself (no takeaway, "from" step) ────────────────────────
export function NamedByStdlibReveal({ t }: StepCtx) {
  return (
    <Code
      title="std::pin's own words"
      dim
      lines={['// "a key example of such self-referential', '//  types are the state machines generated', '//  by the compiler to implement Future', '//  for async fns"']}
      t={t}
      start={0.1}
      end={2.6}
      highlight={[0, 1, 2, 3]}
    />
  );
}

// ── 3 · Breaks on move (takeaway) ────────────────────────────────────────────────────────────────
export function BreaksOnMoveReveal({ t }: StepCtx) {
  const k = easeInOut(seg(t, 1.0, 1.8));
  const x = lerp(70, 340, k);
  const broken = k > 0.05;
  return (
    <Svg label="self_ref_breaks_on_move.rs: the value moves, the pointer doesn't" h={240}>
      <T x={60} y={30} s={13} f={C.quiet}>right after construction, the pointer targets value, in place</T>
      <circle cx={150} cy={110} r={3} fill={C.taupe} />
      <rect x={x} y={70} width={160} height={60} rx={6} fill="none" stroke={broken ? C.caramel : C.taupe} strokeWidth={2} />
      <T x={x + 80} y={95} s={12} a="middle" f={C.crema}>value</T>
      <T x={x + 80} y={115} s={11} a="middle" f={broken ? C.cherryText : C.mocha}>{broken ? 'pointer: dangling' : 'pointer: self'}</T>
      <line x1={150} y1={110} x2={x + 20} y2={100} stroke={broken ? C.cherryText : C.taupe} strokeWidth={1.5} strokeDasharray={broken ? '3 3' : undefined} />
      <T x={60} y={210} s={13} f={C.latte} o={fa(t, 1.9, 0.3)}>moved — the pointer now targets stale, freed memory</T>
    </Svg>
  );
}

// ── 4 · Does Box<T> fix it? (predict) ───────────────────────────────────────────────────────────
export function BoxFixPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same struct, now behind a Box"
        lines={['let a: Box<SelfRef> = Box::new(this);', 'let b = a;', '// has moving it into b fixed anything?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 5 · Pin<Ptr> is a promise about the pointee (takeaway) ─────────────────────────────────────
export function PinPromiseReveal({ t }: StepCtx) {
  const y = lerp(10, 55, easeOut(seg(t, 0.3, 0.9)));
  return (
    <Svg label="Pin<Ptr>: a promise about where the pointee stays" h={200}>
      <rect x={180} y={65} width={160} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={260} y={95} s={13} a="middle" f={C.crema}>the pointee</T>
      <line x1={260} y1={y} x2={260} y2={65} stroke={C.caramel} strokeWidth={2} />
      <circle cx={260} cy={y} r={6} fill={C.caramel} />
      <Reticle x={260} y={90} w={170} h={60} t={t} at={0.9} />
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.1, 0.4)}>Pin wraps the pointer: a promise the pointee won't move</T>
      <T x={60} y={180} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>almost every ordinary type never needed it: Unpin</T>
    </Svg>
  );
}

// ── 6 · Pinned both ways, still valid (takeaway) ────────────────────────────────────────────────
export function PinnedBothWaysReveal({ t }: StepCtx) {
  return (
    <Svg label="pin_prevents_the_break.rs and pin_macro_stack_pin.rs" h={220}>
      <g opacity={fa(t, 0.3, 0.4)}>
        <rect x={60} y={50} width={220} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <T x={170} y={80} s={13} a="middle" f={C.crema}>Box::pin, heap: valid</T>
      </g>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={320} y={50} width={220} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={430} y={80} s={13} a="middle" f={C.crema}>pin!, stack: valid</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the identical promise, two different places</T>
    </Svg>
  );
}

// ── 7 · Can T still be moved out? (predict) ─────────────────────────────────────────────────────
export function MoveOutPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the pinned value, handed to a by-value function"
        lines={['fn takes_by_value(_: SelfRef) {}', 'let a: Pin<Box<SelfRef>> = SelfRef::new("x");', 'takes_by_value(*a); // does this compile?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 8 · rustc's own diagnostic (takeaway) ───────────────────────────────────────────────────────
export function CompileFailReveal({ t }: StepCtx) {
  return (
    <Code
      title="move_out_of_pin_fails.rs — a real compile error"
      dim
      lines={['error[E0507]: cannot move out of', '  dereference of Pin<Box<SelfRef>>', '// no Unpin, so no plain SelfRef to take']}
      t={t}
      start={0.1}
      end={2.2}
      highlight={[0, 1]}
    />
  );
}

// ── 9 · Structural projection, a per-field choice (takeaway) ────────────────────────────────────
export function StructuralProjectionReveal({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="pin-project-lite: structural_projection.rs"
        lines={['pin_project! { struct Combined<T, U> {', '    #[pin] pinned: T,', '    unpinned: U,', '} }']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a value pointing into itself breaks the instant it moves',
    'Pin<Ptr> is a type-level promise, not a convention',
    'the compiler enforces that promise, rejecting the move',
    'pin projection is a per-field choice, never automatic',
  ];
  return (
    <Svg label="recap: self-reference and Pin, proven both ways" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
