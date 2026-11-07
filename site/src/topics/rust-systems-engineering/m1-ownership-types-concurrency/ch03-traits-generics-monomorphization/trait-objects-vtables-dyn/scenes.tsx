import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// This topic's own shape (CHAPTER.md §A.5): a fat pointer as two adjacent small boxes (data, vtable)
// drawn as one unit, the vtable box carrying its own rows for each method's function pointer. Reused
// across every dyn Trait step. Every snippet is an exact line of examples/*.rs; every claim is
// executed by examples.py. No digits in any caption text (house style: numbers are spelled, not shown).

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A thin, one-word pointer box. */
function ThinPointer({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={90} height={46} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={x + 45} y={y + 29} s={12} a="middle" f={C.taupe}>{label}</T>
    </g>
  );
}

/** The fat pointer: a data-pointer box and a vtable box drawn as one unit, the vtable with its own
 * rows for each method's function pointer. */
function FatPointerDiagram({ t, from = 0.3, showRows = false }: { t: number; from?: number; showRows?: boolean }) {
  const k = fa(t, from, 0.4);
  // The vtable pointer box docks onto the data pointer box by sliding in from the right (position);
  // its method table then unfolds downward from the vtable box's own bottom edge (grow), one row
  // fading in just after the box has grown enough to hold it (staggered reveal, not all at once).
  const dock = easeOut(seg(t, from, from + 0.4));
  const vtx = 260 + (1 - dock) * 160;
  const unfold = showRows ? easeOut(seg(t, from + 0.5, from + 0.8)) : 0;
  const rowsH = unfold * 120;
  return (
    <Svg label="a dyn Trait reference is a fat pointer: a data pointer and a vtable pointer drawn as one unit" h={300}>
      <g opacity={k > 0 ? 1 : 0}>
        <rect x={120} y={30} width={130} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k} />
        <T x={185} y={62} s={13} a="middle" f={C.crema} o={k}>data pointer</T>
        <rect x={vtx} y={30} width={130} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k} />
        <T x={vtx + 65} y={62} s={13} a="middle" f={C.crema} o={k}>vtable pointer</T>
        <T x={252} y={25} s={12} a="middle" f={C.taupe} o={k}>one fat pointer</T>
      </g>
      {showRows && (
        <g>
          <rect x={260} y={100} width={220} height={rowsH} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={280} y={124} s={12} f={C.taupe} o={fa(t, from + 0.55, 0.25)}>encode fn pointer</T>
          <T x={280} y={150} s={12} f={C.taupe} o={fa(t, from + 0.65, 0.25)}>drop fn pointer</T>
          <T x={280} y={176} s={12} f={C.taupe} o={fa(t, from + 0.75, 0.25)}>size, align</T>
          <T x={325} y={238} s={13} a="middle" f={C.caramel} o={fa(t, from + 0.9, 0.3)}>one slot per method</T>
        </g>
      )}
    </Svg>
  );
}

// ── 1 · Two words, not one ──────────────────────────────────────────────────────────────────────────
export function FatPointer({ t }: StepCtx) {
  // The vtable half of each dyn pointer slides in and docks next to its data-pointer half (position),
  // arriving right as the caption that names it appears.
  const dock = easeOut(seg(t, 0.7, 1.1));
  const vdx = (1 - dock) * 140;
  return (
    <Svg label="a reference or Box to a concrete type is one word; to a dyn Trait it is two words, a data pointer plus a vtable pointer" h={300}>
      <ThinPointer x={60} y={40} label="&A" />
      <ThinPointer x={60} y={110} label="Box<A>" />
      <T x={40} y={190} s={13} f={C.taupe} o={fa(t, 0.2, 0.4)}>one word: just the data</T>
      <g opacity={fa(t, 0.7, 0.3)}>
        <rect x={320} y={40} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={365} y={69} s={12} a="middle" f={C.crema}>&dyn Codec</T>
        <rect x={320} y={110} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={365} y={139} s={12} a="middle" f={C.crema}>Box dyn</T>
      </g>
      <g transform={`translate(${vdx},0)`} opacity={fa(t, 0.7, 0.3)}>
        <rect x={420} y={40} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={465} y={69} s={12} a="middle" f={C.crema}>vtable</T>
        <rect x={420} y={110} width={90} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={465} y={139} s={12} a="middle" f={C.crema}>vtable</T>
      </g>
      <T x={320} y={190} s={13} f={C.caramel} o={fa(t, 1.1, 0.3)}>two words: data plus vtable</T>
    </Svg>
  );
}

// ── 2 · What's actually inside the second word? (predict) ──────────────────────────────────────────
export function VtableContents({ t }: StepCtx) {
  return <FatPointerDiagram t={t} from={0.2} showRows />;
}

// ── 3 · Calling through it is late binding (no takeaway: the reel's "from" step) ────────────────────
export function LateBinding({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="calling c.encode() through &dyn Codec" lines={['let ptr = vtable.encode;', 'ptr(data_ptr)   // resolved right now, not before']} t={t} start={0.1} end={1.4} highlight={[0, 1]} />
      <Svg label="late binding: the function pointer is loaded from the vtable and invoked at the moment of the call" h={50}>
        <T x={40} y={30} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>loaded and invoked at the moment of the call, not before</T>
      </Svg>
    </Stack>
  );
}

// ── 4 · The cost isn't the indirect call ────────────────────────────────────────────────────────────
export function LostInlining({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="sum_generic, optimized" lines={['; encode() inlined away entirely', '; no call left in the loop at all']} t={t} start={0.1} end={1.2} highlight={[0, 1]} />
      <div style={{ opacity: fa(t, 1.4, 0.4) }}>
        <Code title="sum_dyn, optimized" lines={['%f = load ptr, vtable_slot', 'invoke %f(data_ptr)   // still a real call']} t={t} start={1.4} end={2.2} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 5 · A method that takes Self by value can't go in the vtable (predict) ─────────────────────────
export function DynIncompatible({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/dyn_incompatible_fail.rs" lines={['fn loud(self) -> Self;', 'let d: Box<dyn Greet> = Box::new(Dog);']} t={t} start={0.1} end={1.4} highlight={[0, 1]} />
      <div style={{ opacity: fa(t, 1.6, 0.4) }}>
        <Code title="rustc" lines={['error[E0038]: Greet is not dyn compatible', 'loud references the Self type']} t={t} start={1.6} end={2.2} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 6 · One bound excludes just that method ─────────────────────────────────────────────────────────
export function SizedEscape({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/sized_escape_hatch.rs"
        lines={['fn loud(self) -> Self where Self: Sized;', 'fn hi(&self) -> &\'static str { "hi" }', 'let d: Box<dyn Greet> = Box::new(Dog);   // compiles']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 2]}
      />
    </Stack>
  );
}

// ── 7 · Widening to the parent trait, directly (predict) ───────────────────────────────────────────
export function Upcasting({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/upcasting.rs"
        lines={['let sub_ref: &dyn Sub = &x;', 'let super_ref: &dyn Super = sub_ref;   // direct, no detour']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 8 · A closed list, matched by hand ──────────────────────────────────────────────────────────────
export function EnumDispatch({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/enum_dispatch.rs"
        lines={['enum CodecKind { A(A), B(B) }', 'match self {', '    CodecKind::A(a) => a.encode(),', '    CodecKind::B(b) => b.encode(),', '}']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[0]}
      />
      <Svg label="no vtable, no fat pointer, but every implementor must be known in advance" h={46}>
        <T x={40} y={28} s={13} f={C.taupe} o={fa(t, 2.4, 0.4)}>no vtable, no fat pointer; every type known in advance</T>
      </Svg>
    </Stack>
  );
}

// ── 9 · Recap ────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'dyn Trait: a fat pointer, data plus vtable',
    'called through at run time, not before',
    'the real cost is lost inlining, not the call',
    'by-value Self blocks the vtable slot',
    'where Self: Sized excludes just one method',
    'a subtrait widens directly to its parent',
    'a closed enum needs no vtable at all',
  ];
  return (
    <Svg label="recap: fat pointers, late binding, lost inlining, dyn compatibility, the escape hatch, upcasting, and enum dispatch" h={400}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
