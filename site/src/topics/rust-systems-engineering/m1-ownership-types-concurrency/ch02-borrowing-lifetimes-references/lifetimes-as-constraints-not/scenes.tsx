import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: a lifetime as a bracket drawn *over* existing borrow edges, never touching the drop
// timeline. Variance gets its own small two-box diagram (CHAPTER.md §A.5): an outer box (the longer lifetime)
// and an inner box (the shorter one), with an arrow that is accepted (covariant, caramel) or rejected
// (invariant, cherry). Every snippet is an exact line of examples/*.rs; every claim is executed by examples.py.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

function DropMark({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={x} y={y + 4} s={12} a="middle" f={C.taupe}>drop</T>
    </g>
  );
}

/** A lifetime bracket spanning [x1, x2] at height y, with a small 'a label. */
function LifetimeSpan({ x1, x2, y, t, from, to, label = "'a" }: { x1: number; x2: number; y: number; t: number; from: number; to: number; label?: string }) {
  const k = easeOut(seg(t, from, to));
  if (k <= 0) return null;
  const x2k = x1 + (x2 - x1) * k;
  return (
    <g opacity={k}>
      <line x1={x1} y1={y} x2={x2k} y2={y} stroke={C.caramel} strokeWidth={2} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={C.caramel} strokeWidth={2} />
      {k >= 0.98 && <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={C.caramel} strokeWidth={2} />}
      <T x={(x1 + x2) / 2} y={y - 12} s={13} a="middle" f={C.caramel} serif italic>{label}</T>
    </g>
  );
}

/** Two nested boxes for variance: outer = longer lifetime, inner = shorter. `accept` draws a solid caramel
 * arrow (covariant), otherwise a rejected cherry arrow with the error code. */
function VarianceBoxes({ t, from, accept, code }: { t: number; from: number; accept: boolean; code?: string }) {
  const k = fa(t, from, 0.4);
  return (
    <Svg label={accept ? "a longer-lived outer borrow with a shorter-lived inner borrow, accepted by covariance" : "the same two borrows, rejected because the inner type position is invariant"} h={300}>
      <g opacity={k}>
        <rect x={60} y={30} width={480} height={200} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={76} y={54} s={13} f={C.taupe}>'static, outer, lives longer</T>
        <rect x={100} y={74} width={360} height={116} rx={10} fill="none" stroke={accept ? C.caramel : C.cherryText} strokeWidth={2} />
        <T x={116} y={98} s={13} f={C.taupe}>'a, inner, lives shorter</T>
        <Draw pts={[[300, 182], [300, 148]]} t={t} from={from + 0.3} to={from + 0.7} stroke={accept ? C.caramel : C.cherryText} w={2.5} pen={false} />
        <T x={300} y={218} s={13} a="middle" f={accept ? C.caramel : C.cherryText} o={fa(t, from + 0.7, 0.3)}>
          {accept ? 'accepted: covariant' : `rejected: ${code}`}
        </T>
      </g>
    </Svg>
  );
}

// ── 1 · A lifetime never extends a value's life ─────────────────────────────────────────────────────────────────
export function NotADuration({ t }: StepCtx) {
  return (
    <Svg label="a lifetime is a span drawn over existing borrows; it never touches when a value is actually dropped" h={340}>
      <T x={40} y={40} s={14} f={C.crema}>the value's real lifespan</T>
      <line x1={40} y1={70} x2={420} y2={70} stroke={C.mocha} strokeWidth={2} />
      <DropMark x={420} y={70} />
      <g opacity={fa(t, 1.0, 0.4)}>
        <T x={40} y={170} s={14} f={C.crema}>a lifetime: a span over borrows of it</T>
        <LifetimeSpan x1={120} x2={320} y={210} t={t} from={1.4} to={2.4} />
        <T x={120} y={250} s={13} f={C.taupe}>starts and ends well inside the real lifespan</T>
      </g>
      <T x={40} y={300} s={14} f={C.caramel} o={fa(t, 2.8, 0.4)}>it describes a relation between borrows, not a duration</T>
    </Svg>
  );
}

// ── 2 · Three rules fill in what is left out ────────────────────────────────────────────────────────────────────
export function Elision({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="examples/elision.rs" lines={['fn substr1(s: &str, until: usize) -> &str {', '    &s[..until]', '}']} t={t} start={0.1} end={1.4} highlight={[0]} />
    </Stack>
  );
}

// ── 3 · Two input lifetimes, no receiver: elision gives up ─────────────────────────────────────────────────────
export function ElisionAmbiguous({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/elision_ambiguous.rs"
        lines={['fn frob(s: &str, t: &str) -> &str {', '    s', '}']}
        t={t}
        start={0.1}
        end={1.0}
      />
      <div style={{ opacity: fa(t, 1.3, 0.4) }}>
        <Code title="rustc" lines={['error[E0106]: missing lifetime specifier', 'borrowed from s or t?']} t={t} start={1.3} end={2.0} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 4 · Can a longer borrow stand in for a shorter one? ─────────────────────────────────────────────────────────
export function Covariance({ t }: StepCtx) {
  return <VarianceBoxes t={t} from={0.3} accept />;
}

// ── 5 · The same two references, now through a mutable reference (predict) ─────────────────────────────────────
export function InvarianceMut({ t }: StepCtx) {
  return <VarianceBoxes t={t} from={0.3} accept={false} code="E0597, mut T is invariant" />;
}

// ── 6 · Cell<T> inherits the same invariance ────────────────────────────────────────────────────────────────────
export function CellInvariance({ t }: StepCtx) {
  return (
    <Stack>
      <VarianceBoxes t={t} from={0.1} accept={false} code="E0597, Cell inherits mut's variance" />
    </Stack>
  );
}

// ── 7 · A lifetime that cannot be named until the call happens ──────────────────────────────────────────────────
export function Hrtb({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the bound call() actually needs"
        lines={['where', "    for<'a> F: Fn(&'a (u8, u16)) -> &'a u8,"]}
        t={t}
        start={0.2}
        end={1.6}
        highlight={[1]}
      />
      <Svg label="read: for every choice of a, F must work" h={44}>
        <T x={40} y={28} s={13} f={C.taupe} o={fa(t, 2.0, 0.4)}>read: for every choice of 'a, F must work</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · T: 'static is not a promise a value lives forever (predict) ────────────────────────────────────────────
export function StaticBound({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/static_bound_fail.rs"
        lines={['fn print_it(input: impl Debug + \'static) { }', 'print_it(i);     // owned: fine', 'print_it(&i);    // borrowed: ?']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[1, 2]}
      />
    </Stack>
  );
}

// ── 9 · The one case the bound really is the fix ────────────────────────────────────────────────────────────────
export function BoxLeak({ t }: StepCtx) {
  return (
    <Svg label="Box::leak mints a genuine static reference to data created at run time, by deliberately skipping its destructor" h={300}>
      <T x={40} y={50} s={15} f={C.crema}>Box::leak(Box::new(n))</T>
      <g opacity={fa(t, 0.6, 0.4)}>
        <T x={40} y={90} s={14} f={C.taupe}>the destructor never runs, on purpose</T>
        <T x={40} y={112} s={14} f={C.taupe}>(Chapter 1's leak-safety)</T>
      </g>
      <g opacity={fa(t, 1.4, 0.4)}>
        <T x={40} y={150} s={14} f={C.caramel}>really &'static, no coercion needed</T>
      </g>
      <g opacity={fa(t, 2.2, 0.4)}>
        <T x={40} y={190} s={14} f={C.taupe}>rare, explicit, and deliberate</T>
        <T x={40} y={212} s={14} f={C.taupe}>almost never the fix for a 'static hint</T>
      </g>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a constraint between borrows, not a duration', 'one input lifetime wins; two is ambiguous', "&'a T is covariant; &mut T and Cell<T> aren't", 'a higher-ranked bound holds for every lifetime', "'static: no short borrows inside, not forever"];
  return (
    <Svg label="recap: lifetime as constraint, elision, variance, higher-ranked bounds, the static bound" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
