import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// This chapter's own two shapes (CHAPTER.md §A.5): a monomorphization fan-out (one generic box, an arrow to each
// concrete-type box it was compiled for) and an outlining split (a thin generic shim box feeding one wider shared
// box, the opposite visual direction from the fan-out). Every snippet is an exact line of examples/*.rs; every
// claim is executed by examples.py. No digits in any caption text (house style: numbers are spelled, not shown).

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** One generic function box with an arrow fanning out to two labelled, separately compiled bodies. */
function MonoFanOut({ t, labelA = 'A', labelB = 'B' }: { t: number; labelA?: string; labelB?: string }) {
  return (
    <Svg label="one generic function, compiled separately for each concrete type it is called with" h={320}>
      <rect x={210} y={20} width={180} height={56} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={54} s={14} a="middle" f={C.crema}>encode_generic&lt;C&gt;</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <Draw pts={[[260, 76], [150, 170]]} t={t} from={0.5} to={0.9} stroke={C.mocha} w={2} pen={false} />
        <rect x={60} y={176} width={180} height={56} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={150} y={210} s={14} a="middle" f={C.taupe}>compiled for {labelA}</T>
      </g>
      <g opacity={fa(t, 0.9, 0.4)}>
        <Draw pts={[[340, 76], [450, 170]]} t={t} from={0.9} to={1.3} stroke={C.mocha} w={2} pen={false} />
        <rect x={360} y={176} width={180} height={56} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={450} y={210} s={14} a="middle" f={C.taupe}>compiled for {labelB}</T>
      </g>
      <T x={300} y={272} s={14} a="middle" f={C.caramel} o={fa(t, 1.6, 0.4)}>written once per type, not once total</T>
    </Svg>
  );
}

// ── 1 · One generic function, compiled once per concrete type ──────────────────────────────────────────────────
export function MonoFanOutStep({ t }: StepCtx) {
  return <MonoFanOut t={t} />;
}

// ── 2 · How many compiled bodies does rustc actually emit? (predict) ───────────────────────────────────────────
export function MonomorphizationCode({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/monomorphization.rs"
        lines={['pub fn encode_generic<C: Codec>(c: &C) -> u8 {', '    c.encode()', '}', 'call_a(&A)   // compiled for A', 'call_b(&B)   // compiled for B']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 3 · Zero run-time overhead is not zero cost (no predict, no takeaway: this is the reel's "from" step) ──────
export function MonoProof({ t }: StepCtx) {
  return (
    <Svg label="the two compiled bodies run exactly as fast as hand-written code, but compiling and storing both of them costs compile time and binary size" h={320}>
      <T x={40} y={46} s={15} f={C.crema}>rustc --emit=llvm-ir (no optimizer)</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <rect x={40} y={70} width={240} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={60} y={98} s={13} f={C.taupe}>define encode_generic ... A</T>
        <rect x={320} y={70} width={240} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={340} y={98} s={13} f={C.taupe}>define encode_generic ... B</T>
      </g>
      <T x={40} y={160} s={15} f={C.caramel} o={fa(t, 1.0, 0.4)}>each call runs as fast as hand-written</T>
      <T x={40} y={200} s={15} f={C.latte} o={fa(t, 1.6, 0.4)}>but two bodies cost more than one</T>
      <T x={40} y={224} s={15} f={C.latte} o={fa(t, 1.6, 0.4)}>and that cost grows with new types</T>
    </Svg>
  );
}

// ── 4 · Pulling the loop out of the generic shrinks the duplicate ───────────────────────────────────────────────
function OutliningSplit({ t, naive = false }: { t: number; naive?: boolean }) {
  if (naive) {
    return (
      <Svg label="without outlining, the whole loop is duplicated inside each compiled copy of the generic function" h={300}>
        <rect x={60} y={40} width={200} height={90} rx={10} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <T x={160} y={70} s={13} a="middle" f={C.crema}>encode&lt;A&gt;</T>
        <T x={160} y={94} s={12} a="middle" f={C.taupe}>whole loop, inline</T>
        <rect x={340} y={40} width={200} height={90} rx={10} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <T x={440} y={70} s={13} a="middle" f={C.crema}>encode&lt;B&gt;</T>
        <T x={440} y={94} s={12} a="middle" f={C.taupe}>whole loop, inline</T>
        <T x={300} y={180} s={14} a="middle" f={C.cherryText} o={fa(t, 0.6, 0.4)}>both copies carry the whole loop</T>
      </Svg>
    );
  }
  return (
    <Svg label="outlining splits a generic function into a thin shim, duplicated per type, and one shared body, compiled once" h={300}>
      <rect x={70} y={40} width={130} height={60} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={135} y={75} s={12} a="middle" f={C.taupe}>shim&lt;A&gt;</T>
      <rect x={70} y={120} width={130} height={60} rx={8} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={135} y={155} s={12} a="middle" f={C.taupe}>shim&lt;B&gt;</T>
      <Draw pts={[[200, 70], [360, 100]]} t={t} from={0.4} to={0.7} stroke={C.caramel} w={2} pen={false} />
      <Draw pts={[[200, 150], [360, 110]]} t={t} from={0.4} to={0.7} stroke={C.caramel} w={2} pen={false} />
      <g opacity={fa(t, 0.7, 0.4)}>
        <rect x={360} y={60} width={200} height={90} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={460} y={100} s={13} a="middle" f={C.crema}>format_bytes</T>
        <T x={460} y={124} s={12} a="middle" f={C.taupe}>one shared body</T>
      </g>
      <T x={300} y={230} s={14} a="middle" f={C.caramel} o={fa(t, 1.3, 0.4)}>only the shim is duplicated per type</T>
    </Svg>
  );
}
export function OutliningSplitStep({ t }: StepCtx) {
  return <OutliningSplit t={t} />;
}

// ── 5 · Skip the outlining: what happens to the duplicate? (predict) ───────────────────────────────────────────
export function NaiveVsOutlining({ t }: StepCtx) {
  return <OutliningSplit t={t} naive />;
}

// ── 6 · impl Trait in argument position: sugar for a hidden generic ────────────────────────────────────────────
export function ImplTraitArg({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/impl_trait_arg.rs"
        lines={['fn two_impl_trait(a: impl Greet, b: impl Greet)', '    -> (&\'static str, &\'static str) {', '    (a.hi(), b.hi())', '}', 'two_impl_trait(Dog, Cat)   // woof meow']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[0, 4]}
      />
    </Stack>
  );
}

// ── 7 · One shared bound instead of two impl Trait parameters (predict) ────────────────────────────────────────
export function SharedBoundFail({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/trait_bound_same_type_fail.rs"
        lines={['fn two_same_type<T: Greet>(a: T, b: T) -> (&\'static str, &\'static str) {', '    (a.hi(), b.hi())', '}', 'two_same_type(Dog, Cat)']}
        t={t}
        start={0.1}
        end={1.6}
        highlight={[0, 3]}
      />
      <div style={{ opacity: fa(t, 1.8, 0.4) }}>
        <Code title="rustc" lines={['error[E0308]: mismatched types', 'expected `Dog`, found `Cat`']} t={t} start={1.8} end={2.4} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 8 · impl Trait in return position: one hidden, committed type ──────────────────────────────────────────────
export function ImplTraitReturn({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/impl_trait_return.rs"
        lines={['fn make_adder_impl_trait(n: i32) -> impl Fn(i32) -> i32 {', '    move |x| x + n', '}']}
        t={t}
        start={0.1}
        end={1.4}
        highlight={[0]}
      />
      <Svg label="the caller only ever sees Fn's interface, never the real closure type the function picked" h={56}>
        <T x={40} y={32} s={13} f={C.taupe} o={fa(t, 1.6, 0.4)}>the function picks the real type; the caller only sees Fn</T>
      </Svg>
    </Stack>
  );
}

// ── 9 · Returning it unboxed costs nothing extra; boxing it allocates ──────────────────────────────────────────
export function AllocCount({ t }: StepCtx) {
  return (
    <Svg label="a counting global allocator shows the impl Trait return making no new allocation, and the boxed trait object making exactly one, every call" h={300}>
      <T x={40} y={44} s={15} f={C.crema}>a counting allocator, before and after each call</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <rect x={40} y={70} width={240} height={60} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={160} y={96} s={13} a="middle" f={C.crema}>make_adder_impl_trait</T>
        <T x={160} y={118} s={13} a="middle" f={C.caramel}>no new allocation</T>
      </g>
      <g opacity={fa(t, 1.0, 0.4)}>
        <rect x={320} y={70} width={240} height={60} rx={8} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <T x={440} y={96} s={13} a="middle" f={C.crema}>make_adder_boxed</T>
        <T x={440} y={118} s={13} a="middle" f={C.cherryText}>one new allocation</T>
      </g>
      <T x={300} y={200} s={14} a="middle" f={C.latte} o={fa(t, 1.6, 0.4)}>same closure, same result, different cost every call</T>
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'one body compiled per concrete type',
    'free at run time, costly at compile time',
    'outlining keeps the duplicated shim thin',
    'impl Trait args may differ in type',
    'unboxed return allocates nothing extra',
  ];
  return (
    <Svg label="recap: monomorphization, its cost, outlining, and the two impl Trait positions" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
