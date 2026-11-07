import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  // The struct, with its own pointer arrow curling back into itself, slides to a new spot — but
  // the pointer's target (fixed in place) does not move with it, so the arrow visibly misses.
  const moveX = easeOut(seg(t, 1.1, 1.5)) * 260;
  return (
    <Svg label="self_ref_breaks_on_move.rs: measured, not assumed" h={240}>
      <circle cx={140} cy={60} r={4} fill={C.taupe} opacity={fa(t, 0.3, 0.3)} />
      <g transform={`translate(${moveX},0)`}>
        <rect x={60} y={70} width={160} height={44} rx={6} fill="none" stroke={moveX > 10 ? C.cherryText : C.taupe} strokeWidth={1.5} opacity={fa(t, 0.3, 0.3)} />
        <path d={`M ${140} 70 A 30 30 0 0 1 ${160} 55`} fill="none" stroke={moveX > 10 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={fa(t, 0.6, 0.3)} />
        <T x={140} y={97} s={13} a="middle" f={moveX > 10 ? C.cherryText : C.mocha}>{moveX > 10 ? 'valid: false' : 'valid: true'}</T>
      </g>
      <T x={60} y={150} s={14} f={C.crema} o={fa(t, 1.1, 0.3)}>after the move, it no longer does</T>
      <T x={60} y={190} s={13} f={C.taupe} o={fa(t, 1.7, 0.4)}>the pointer still aims at the old address</T>
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
  // Pin wraps around the pointer (drawn growing to enclose it), then an anchor line drops from
  // the wrapped pointer to the pointee, pinning it in place rather than just naming the promise.
  const wrap = easeOut(seg(t, 0.3, 0.6));
  return (
    <Svg label="std::pin's own definition" h={220}>
      <rect x={60} y={30} width={60 + wrap * 60} height={44} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={70} y={56} s={12} f={C.crema}>Pin&lt;</T>
      <rect x={100} y={38} width={60} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.1, 0.3)} />
      <T x={130} y={56} s={11} a="middle" f={C.crema}>ptr</T>
      <Draw pts={[[130, 74], [130, 130]]} t={t} from={0.7} to={0.95} stroke={C.caramel} w={2} pen />
      <rect x={90} y={130} width={80} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.3)} />
      <T x={130} y={152} s={11} a="middle" f={C.crema}>pinned</T>
      <T x={60} y={190} s={13} f={C.taupe} o={fa(t, 1.5, 0.4)}>almost every ordinary type never needed it: Unpin</T>
    </Svg>
  );
}

// ── 6 · Pinned both ways, still valid (takeaway) ────────────────────────────────────────────────
export function PinnedBothWaysReveal({ t }: StepCtx) {
  // Each box's own self-pointer arrow tries the same move the earlier topic broke, and this time
  // stays anchored instead of slipping, drawn in rather than only labelled "valid".
  return (
    <Svg label="pin_prevents_the_break.rs and pin_macro_stack_pin.rs" h={240}>
      <rect x={60} y={50} width={220} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={fa(t, 0.3, 0.3)} />
      <T x={170} y={80} s={13} a="middle" f={C.crema}>Box::pin, heap: valid</T>
      <Draw pts={[[170, 100], [170, 140]]} t={t} from={0.6} to={0.85} stroke={C.taupe} w={1.5} pen />
      <rect x={320} y={50} width={220} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.9, 0.3)} />
      <T x={430} y={80} s={13} a="middle" f={C.crema}>pin!, stack: valid</T>
      <Draw pts={[[430, 100], [430, 140]]} t={t} from={1.2} to={1.45} stroke={C.caramel} w={1.5} pen />
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>the identical promise, two different places</T>
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
