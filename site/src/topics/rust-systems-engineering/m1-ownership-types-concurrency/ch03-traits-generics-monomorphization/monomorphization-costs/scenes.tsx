import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

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

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so a reveal can still move. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4.5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

// ── 1 · One generic function, compiled once per concrete type ──────────────────────────────────────────────────
export function MonoFanOutStep({ t }: StepCtx) {
  return <MonoFanOut t={t} />;
}

// ── 2 · How many compiled bodies does rustc actually emit? (predict) ───────────────────────────────────────────
export function MonomorphizationCode({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const box = easeOut(seg(t, 0.5, 0.9));
  const ca = easeInOut(seg(t, 0.9, 1.4));
  const cb = easeInOut(seg(t, 1.2, 1.7));
  const split = ans ? easeInOut(seg(s, 0.15, 0.9)) : 0;
  return (
    <Stack>
      {!portrait && <Code
        title="examples/monomorphization.rs"
        lines={['pub fn encode_generic<C: Codec>(c: &C) -> u8 {', '    c.encode()', '}', 'call_a(&A)   // compiled for A', 'call_b(&B)   // compiled for B']}
        t={t}
        start={0.1}
        end={0.9}
        highlight={[0]}
      />}
      <Svg label="two call sites, one with A and one with B, reach the one generic function; the compiler emits a separate full body for each" h={190} fill>
        <T x={30} y={44} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.0))}>call_a(&A)</T>
        <T x={30} y={154} s={13} f={C.latte} o={easeOut(seg(t, 1.1, 1.3))}>call_b(&B)</T>
        {ca > 0 && split < 1 && <circle cx={lerp(140, 230, ca)} cy={lerp(40, 95, ca)} r={6} fill={C.crema} />}
        {cb > 0 && split < 1 && <circle cx={lerp(140, 230, cb)} cy={lerp(150, 95, cb)} r={6} fill={C.cinnamon} />}
        {[0, 1].map((i) => {
          const dy = (i ? 1 : -1) * 52 * split;
          const label = !ans || split < 0.5 ? 'encode_generic<C>' : i ? 'encode_generic::<B>' : 'encode_generic::<A>';
          if (i === 1 && split <= 0) return null;
          return (
            <g key={i} transform={`translate(${(split * 40).toFixed(1)} ${dy.toFixed(1)})`} opacity={box}>
              <rect x={230} y={74} width={250} height={42} rx={8} fill={C.cocoa} stroke={split > 0.9 ? (i ? C.cinnamon : C.caramel) : C.mocha} strokeWidth={1.5} />
              <T x={355} y={100} s={14} a="middle" f={C.crema}>{label}</T>
            </g>
          );
        })}
        {ans && split > 0.95 && <Reticle x={395} y={95} w={280} h={150} t={s} at={1.0} />}
      </Svg>
    </Stack>
  );
}

// ── 3 · Zero run-time overhead is not zero cost (no predict, no takeaway: this is the reel's "from" step) ──────
export function MonoProof({ t }: StepCtx) {
  // The two bodies slide into place (position), a speed line draws itself across both at equal height
  // (draw, equal — same speed), then a cost bar grows wider under them (scale — the cost that keeps growing).
  const slideIn = easeOut(seg(t, 0, 0.5));
  const dxA = (1 - slideIn) * -260;
  const dxB = (1 - slideIn) * 260;
  const costGrow = easeOut(seg(t, 1.0, 1.5));
  return (
    <Svg label="the two compiled bodies run exactly as fast as hand-written code, but compiling and storing both of them costs compile time and binary size" h={320}>
      <T x={40} y={46} s={15} f={C.crema}>rustc --emit=llvm-ir (no optimizer)</T>
      <g transform={`translate(${dxA},0)`}>
        <rect x={40} y={70} width={240} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={60} y={98} s={13} f={C.taupe}>{'define encode_generic<A>'}</T>
      </g>
      <g transform={`translate(${dxB},0)`}>
        <rect x={320} y={70} width={240} height={46} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={340} y={98} s={13} f={C.taupe}>{'define encode_generic<B>'}</T>
      </g>
      <Draw pts={[[40, 140], [560, 140]]} t={t} from={0.5} to={0.9} stroke={C.caramel} w={2} dash="4 4" pen={false} />
      <T x={40} y={160} s={15} f={C.caramel} o={fa(t, 0.9, 0.3)}>each call runs as fast as hand-written</T>
      <T x={40} y={200} s={15} f={C.latte} o={fa(t, 1.2, 0.3)}>but two bodies cost more than one</T>
      <rect x={40} y={216} width={20 + costGrow * 520} height={16} rx={4} fill={C.latte} opacity={0.85} />
      <T x={40} y={260} s={15} f={C.latte} o={fa(t, 1.5, 0.4)}>and that cost grows with new types</T>
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
  const slots = easeOut(seg(t, 0.5, 0.9));
  const hid = (a: number) => (t >= a ? 1 : 0);
  const dog = easeInOut(seg(t, 1.9, 2.5));
  const cat = easeInOut(seg(t, 2.1, 2.7));
  return (
    <Stack>
      <Code
        title="examples/impl_trait_arg.rs"
        lines={['fn two_impl_trait(a: impl Greet, b: impl Greet)', '    -> (&\'static str, &\'static str) {', '    (a.hi(), b.hi())', '}', 'two_impl_trait(Dog, Cat)   // woof meow']}
        t={t}
        start={0.1}
        end={0.8}
        highlight={t > 1.9 ? [4] : [0]}
      />
      <Svg label="each impl Greet parameter is its own hidden type parameter, so a Dog and a Cat land in the two slots and both are accepted" h={190} fill>
        {[0, 1].map((i) => {
          const x = 100 + i * 230;
          return (
            <g key={i} opacity={slots}>
              <rect x={x} y={90} width={170} height={44} rx={8} fill={C.cocoa} stroke={(i ? cat : dog) > 0.95 ? C.caramel : C.mocha} strokeWidth={1.5} />
              <T x={x + 12} y={82} s={13} f={C.taupe}>{i ? 'b' : 'a'}</T>
              {hid(1.0 + i * 0.3) ? (
                <Decode text={i ? 'hidden type U' : 'hidden type T'} x={x + 85} y={117} s={13} a="middle" f={C.cinnamon} t={t} at={1.0 + i * 0.3} dur={0.5} />
              ) : (
                <T x={x + 85} y={117} s={13} a="middle" f={C.crema}>impl Greet</T>
              )}
              {(i ? cat : dog) > 0.98 && <T x={x + 85} y={168} s={14} a="middle" f={C.caramel}>{i ? 'meow' : 'woof'}</T>}
            </g>
          );
        })}
        {dog > 0 && dog < 1 && (
          <g transform={`translate(${lerp(30, 185, dog).toFixed(1)} ${lerp(30, 112, dog).toFixed(1)})`}>
            <rect x={-30} y={-14} width={60} height={28} rx={6} fill={C.crema} />
            <T x={0} y={5} s={13} a="middle" f={C.espresso} w={700}>Dog</T>
          </g>
        )}
        {cat > 0 && cat < 1 && (
          <g transform={`translate(${lerp(570, 415, cat).toFixed(1)} ${lerp(30, 112, cat).toFixed(1)})`}>
            <rect x={-30} y={-14} width={60} height={28} rx={6} fill={C.cinnamon} />
            <T x={0} y={5} s={13} a="middle" f={C.espresso} w={700}>Cat</T>
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 7 · One shared bound instead of two impl Trait parameters (predict) ────────────────────────────────────────
export function SharedBoundFail({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code
          title="examples/trait_bound_same_type_fail.rs"
          lines={['fn two_same_type<T: Greet>(a: T, b: T) -> (&\'static str, &\'static str) {', '    (a.hi(), b.hi())', '}', 'two_same_type(Dog, Cat)']}
          t={t}
          start={0.1}
          end={1.6}
          highlight={[0, 3]}
        />
      )}
      {ans && (
        <div style={{ opacity: fa(s, 0, 0.3) }}>
          <Code title="rustc" lines={['error[E0308]: mismatched types', 'expected `Dog`, found `Cat`']} t={s} start={0.1} end={0.7} highlight={[0, 1]} />
        </div>
      )}
    </Stack>
  );
}

// ── 8 · impl Trait in return position: one hidden, committed type ──────────────────────────────────────────────
export function ImplTraitReturn({ t }: StepCtx) {
  const box = easeOut(seg(t, 0.5, 0.9));
  const pick = easeOutBack(seg(t, 0.9, 1.3));
  const cover = easeInOut(seg(t, 2.0, 2.7)); // the opaque type slides over the real one
  const caller = easeOut(seg(t, 2.6, 3.0));
  return (
    <Stack>
      <Code title="examples/impl_trait_return.rs" lines={['fn make_adder_impl_trait(n: i32) -> impl Fn(i32) -> i32 {', '    move |x| x + n', '}']} t={t} start={0.1} end={0.6} highlight={[0]} />
      <Svg label="the function picks one real closure type; every return path hands back that one type; the caller only ever sees impl Fn" h={200} fill>
        <g opacity={box}>
          <rect x={20} y={30} width={330} height={140} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={34} y={52} s={13} f={C.taupe}>make_adder_impl_trait</T>
        </g>
        {pick > 0 && (
          <g transform={`translate(270 110) scale(${pick.toFixed(3)}) translate(-270 -110)`}>
            <rect x={200} y={88} width={140} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
            {cover < 0.95 && <T x={270} y={115} s={13} a="middle" f={C.caramel}>its closure</T>}
          </g>
        )}
        <Draw pts={[[40, 80], [140, 80], [198, 104]]} t={t} from={1.3} to={1.7} stroke={C.latte} w={2} />
        <Draw pts={[[40, 145], [140, 145], [198, 118]]} t={t} from={1.5} to={1.9} stroke={C.latte} w={2} />
        <T x={44} y={72} s={13} f={C.taupe} o={easeOut(seg(t, 1.3, 1.5))}>path</T>
        <T x={44} y={137} s={13} f={C.taupe} o={easeOut(seg(t, 1.5, 1.7))}>path</T>
        {cover > 0 && (
          <g>
            <rect x={196} y={84} width={150 * cover} height={52} rx={8} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
            {cover > 0.95 && <T x={271} y={115} s={13} a="middle" f={C.crema}>impl Fn</T>}
          </g>
        )}
        <g transform={`translate(${((1 - caller) * 30).toFixed(1)} 0)`} opacity={caller}>
          <line x1={346} y1={110} x2={440} y2={110} stroke={C.crema} strokeWidth={2} />
          <rect x={440} y={88} width={130} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={505} y={115} s={13} a="middle" f={C.crema}>caller</T>
          <T x={505} y={156} s={13} a="middle" f={C.latte}>sees Fn only</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 9 · Returning it unboxed costs nothing extra; boxing it allocates ──────────────────────────────────────────
export function AllocCount({ t }: StepCtx) {
  // A call token travels from each function box toward the heap below. The impl Trait call stops short
  // of the heap (never touches it); the boxed call reaches it and a real allocation block grows there.
  const heapY = 230;
  const allocGrow = easeOut(seg(t, 1.5, 1.8));
  return (
    <Svg label="a counting global allocator shows the impl Trait return making no new allocation, and the boxed trait object making exactly one, every call" h={320}>
      <T x={40} y={44} s={15} f={C.crema}>a counting allocator, before and after each call</T>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={40} y={70} width={240} height={60} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={160} y={96} s={13} a="middle" f={C.crema}>make_adder_impl_trait</T>
        <T x={160} y={118} s={13} a="middle" f={C.caramel}>no new allocation</T>
      </g>
      <g opacity={fa(t, 0.6, 0.4)}>
        <rect x={320} y={70} width={240} height={60} rx={8} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <T x={440} y={96} s={13} a="middle" f={C.crema}>make_adder_boxed</T>
        <T x={440} y={118} s={13} a="middle" f={C.cherryText}>one new allocation</T>
      </g>
      <rect x={40} y={heapY} width={520} height={30} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={48} y={heapY + 20} s={12} f={C.taupe}>heap</T>
      <Draw pts={[[160, 132], [160, 210]]} t={t} from={0.9} to={1.2} stroke={C.caramel} w={2} pen />
      <Draw pts={[[440, 132], [440, heapY]]} t={t} from={0.9} to={1.2} stroke={C.cherryText} w={2} pen />
      <rect x={410} y={heapY + 4} width={allocGrow * 60} height={22} rx={4} fill={C.cherryText} opacity={0.75} />
      <T x={300} y={290} s={14} a="middle" f={C.latte} o={fa(t, 2.0, 0.4)}>same closure, same result, different cost every call</T>
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      end={2.8}
      label="recap: monomorphization, its cost, outlining, and the two impl Trait positions"
      rows={['one body compiled per concrete type', 'free at run time, costly at compile time', 'outlining keeps the duplicated shim thin', 'impl Trait args may differ in type', 'unboxed return allocates nothing extra']}
    />
  );
}
