import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

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

/** A quadratic arc from (x1, y1) to (x2, y2) bowing through control height `peak`, sampled for Draw. */
const arc = (x1: number, y1: number, x2: number, y2: number, peak: number): [number, number][] =>
  Array.from({ length: 25 }, (_, i) => {
    const u = i / 24;
    return [lerp(x1, x2, u), (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * peak + u * u * y2];
  });

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

// ── 1 · A lifetime never extends a value's life ─────────────────────────────────────────────────────────────────
export function NotADuration({ t }: StepCtx) {
  return (
    <Svg label="a lifetime is a span drawn over existing borrows; it never touches when a value is actually dropped" h={316}>
      <T x={40} y={40} s={14} f={C.crema}>the value's real lifespan</T>
      <line x1={40} y1={70} x2={420} y2={70} stroke={C.mocha} strokeWidth={2} />
      <DropMark x={420} y={70} />
      <g opacity={fa(t, 1.0, 0.4)}>
        <T x={40} y={170} s={14} f={C.crema}>a lifetime: a span over borrows of it</T>
        <LifetimeSpan x1={120} x2={320} y={210} t={t} from={1.4} to={2.4} />
        <T x={120} y={250} s={13} f={C.taupe}>starts and ends well inside the real lifespan</T>
      </g>
      <T x={40} y={300} s={14} f={C.caramel} o={fa(t, 2.8, 0.4)}>a relation between borrows, not a duration</T>
    </Svg>
  );
}

// ── 2 · Three rules fill in what is left out ────────────────────────────────────────────────────────────────────
export function Elision({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const scan = easeOut(seg(t, 0.4, 1.3));
  const dotX = lerp(40, 390, scan);
  const pills: { x: number; w: number; label: string; borrowed: boolean }[] = [
    { x: 30, w: 160, label: 's: &str', borrowed: true },
    { x: 210, w: 190, label: 'until: usize', borrowed: false },
  ];
  return (
    <Stack>
      {!portrait && <Code title="examples/elision.rs" lines={['fn substr1(s: &str, until: usize) -> &str {', '    &s[..until]', '}']} t={t} start={0.1} end={0.7} highlight={[0]} />}
      <Svg label="the compiler scans the inputs for borrows, finds exactly one, s, and ties the returned &str to it" h={180} fill>
        {pills.map((p) => {
          const lit = p.borrowed && dotX > p.x + 20;
          return (
            <g key={p.label}>
              <rect x={p.x} y={70} width={p.w} height={38} rx={8} fill={C.cocoa} stroke={lit ? C.caramel : C.mocha} strokeWidth={lit ? 2.5 : 1.5} />
              <T x={p.x + p.w / 2} y={94} s={14} a="middle" f={lit ? C.caramel : p.borrowed ? C.crema : C.taupe}>{p.label}</T>
            </g>
          );
        })}
        <rect x={430} y={70} width={140} height={38} rx={8} fill="none" stroke={ans ? C.caramel : C.mocha} strokeWidth={1.5} strokeDasharray={ans ? undefined : '5 4'} />
        <T x={500} y={94} s={14} a="middle" f={C.crema}>{'-> &str'}</T>
        {scan > 0 && scan < 1 && <circle cx={dotX} cy={128} r={5} fill={C.caramel} />}
        <line x1={30} y1={128} x2={lerp(30, 400, scan)} y2={128} stroke={C.mocha} strokeWidth={1.5} />
        <T x={30} y={160} s={13} f={C.latte} o={easeOut(seg(t, 1.25, 1.55))}>one borrowed input</T>
        {ans && (
          <g>
            <Draw pts={arc(500, 68, 110, 68, -6)} t={s} from={0.15} to={0.9} stroke={C.caramel} w={2.5} />
            <Decode text="'a" x={110} y={58} s={15} a="middle" f={C.caramel} t={s} at={0.2} dur={0.4} />
            <Decode text="'a" x={500} y={58} s={15} a="middle" f={C.caramel} t={s} at={0.9} dur={0.4} />
          </g>
        )}
      </Svg>
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
  const calls = [
    { x: 70, w: 70, at: 0.9 },
    { x: 230, w: 150, at: 1.5 },
    { x: 440, w: 50, at: 2.1 },
  ];
  const all = easeOut(seg(t, 2.7, 3.3));
  return (
    <Stack>
      <Code title="the bound call() actually needs" lines={['where', "    for<'a> F: Fn(&'a (u8, u16)) -> &'a u8,"]} t={t} start={0.2} end={0.9} highlight={t > 2.7 ? [1] : []} />
      <Svg label="every call of the closure brings a fresh lifetime of its own; the higher-ranked bound must hold for all of them at once" h={200} fill>
        <T x={30} y={30} s={13} f={C.taupe}>calls of F</T>
        <Draw pts={[[30, 50], [570, 50]]} t={t} from={0.2} to={0.8} stroke={C.mocha} w={1.5} pen={false} />
        {calls.map((c, i) => {
          const drop = easeOutBack(seg(t, c.at, c.at + 0.35));
          const grow = easeOut(seg(t, c.at + 0.2, c.at + 0.6));
          const ok = easeOut(seg(t, 2.9 + i * 0.12, 3.25 + i * 0.12));
          if (drop <= 0) return null;
          return (
            <g key={c.x}>
              <circle cx={c.x} cy={lerp(20, 50, drop)} r={6} fill={C.crema} />
              <line x1={c.x} y1={92} x2={c.x + c.w * grow} y2={92} stroke={C.caramel} strokeWidth={2.5} />
              <line x1={c.x} y1={85} x2={c.x} y2={99} stroke={C.caramel} strokeWidth={2} />
              {grow > 0.98 && <line x1={c.x + c.w} y1={85} x2={c.x + c.w} y2={99} stroke={C.caramel} strokeWidth={2} />}
              <T x={c.x + c.w / 2} y={78} s={14} a="middle" f={C.caramel} serif italic o={grow}>'a</T>
              <path d={`M${c.x + c.w / 2 - 8} ${116} l5 5 l10 -11`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeDasharray="22" strokeDashoffset={22 * (1 - ok)} opacity={ok > 0 ? 1 : 0} />
            </g>
          );
        })}
        <line x1={30} y1={148} x2={lerp(30, 570, all)} y2={148} stroke={C.focus} strokeWidth={2.5} opacity={all > 0 ? 1 : 0} />
        <T x={300} y={180} s={14} a="middle" f={C.focus} o={all}>{"for<'a>: every 'a, at once"}</T>
      </Svg>
    </Stack>
  );
}

// ── 8 · T: 'static is not a promise a value lives forever (predict) ────────────────────────────────────────────
export function StaticBound({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const req = easeOut(seg(t, 0.9, 1.5));
  const borrow = ans ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const fail = ans ? easeOutBack(seg(s, 0.9, 1.2)) : 0;
  const okTick = ans ? easeOut(seg(s, 1.3, 1.7)) : 0;
  return (
    <Stack>
      {!portrait && <Code
        title="examples/static_bound_fail.rs"
        lines={['fn print_it(input: impl Debug + \'static) { }', 'print_it(i);     // owned: fine', 'print_it(&i);    // borrowed: ?']}
        t={t}
        start={0.1}
        end={0.8}
        highlight={[1, 2]}
      />}
      <Svg label="the 'static bound asks for no borrow shorter than the rest of the program; &i's borrow stops where main ends and is rejected, owned i holds no borrow at all" h={196} fill>
        <T x={30} y={26} s={13} f={C.taupe}>rest of the program</T>
        <line x1={150} y1={44} x2={lerp(150, 570, req)} y2={44} stroke={C.focus} strokeWidth={2.5} opacity={req > 0 ? 1 : 0} />
        <T x={570} y={26} s={14} a="end" f={C.focus} o={req} serif italic>'static</T>
        <line x1={380} y1={58} x2={380} y2={176} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.6, 0.9))} />
        <T x={380} y={192} s={13} a="middle" f={C.taupe} o={easeOut(seg(t, 0.6, 0.9))}>main ends</T>
        <T x={30} y={94} s={14} f={C.crema}>i</T>
        <T x={30} y={150} s={14} f={C.crema}>&i</T>
        {ans && (
          <g>
            <T x={150} y={94} s={13} f={C.latte} o={okTick}>no borrow inside</T>
            <path d="M330 84 l6 6 l12 -14" fill="none" stroke={C.caramel} strokeWidth={2.5} strokeDasharray="28" strokeDashoffset={28 * (1 - okTick)} />
            <line x1={150} y1={146} x2={lerp(150, 380, borrow)} y2={146} stroke={fail > 0 ? C.cherryText : C.caramel} strokeWidth={6} strokeLinecap="round" />
            {fail > 0 && (
              <g opacity={Math.min(1, fail)}>
                <line x1={392} y1={146} x2={560} y2={146} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 4" />
                <T x={475} y={134} s={14} a="middle" f={C.cherryText} w={700}>E0597</T>
              </g>
            )}
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 9 · The one case the bound really is the fix ────────────────────────────────────────────────────────────────
export function BoxLeak({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.3, 1.5));
  const boxX = 110 + (380 - 110) * travel;
  const dropAt = 1.5;
  const xMark = easeOutBack(seg(t, dropAt, dropAt + 0.35));
  return (
    <Svg label="Box::leak mints a genuine static reference to data created at run time, by deliberately skipping its destructor" h={320}>
      <T x={40} y={34} s={14} f={C.crema}>Box::leak(Box::new(n))</T>
      <rect x={60} y={60} width={420} height={110} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={76} y={84} s={13} f={C.taupe}>owner's scope</T>
      <rect x={boxX} y={100} width={90} height={48} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
      <T x={boxX + 45} y={128} s={14} a="middle" f={C.crema}>n</T>
      <g opacity={fa(t, dropAt - 0.2, 0.3)}>
        <circle cx={160} cy={204} r={13} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={160} y={208} s={11} a="middle" f={C.taupe}>drop</T>
        {xMark > 0.01 && (
          <g opacity={xMark}>
            <Draw pts={[[148, 192], [172, 216]]} t={t} from={dropAt} to={dropAt + 0.2} stroke={C.cherryText} w={2.5} pen={false} />
            <Draw pts={[[172, 192], [148, 216]]} t={t} from={dropAt + 0.05} to={dropAt + 0.25} stroke={C.cherryText} w={2.5} pen={false} />
          </g>
        )}
      </g>
      <g opacity={fa(t, dropAt + 0.1, 0.3)}>
        <T x={60} y={234} s={13} f={C.taupe}>the destructor never runs, on purpose</T>
        <T x={60} y={256} s={13} f={C.taupe}>(Chapter 1's leak-safety)</T>
      </g>
      <g opacity={travel >= 0.98 ? fa(t, dropAt + 0.5, 0.4) : 0}>
        <Reticle x={425} y={124} w={110} h={64} t={t} at={dropAt + 0.5} color={C.caramel} />
        <T x={425} y={200} s={13} a="middle" f={C.caramel}>really &'static, no coercion needed</T>
      </g>
      <T x={40} y={290} s={13} f={C.taupe} o={fa(t, 2.6, 0.4)}>rare, explicit: almost never the 'static fix</T>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      end={2.6}
      label="recap: lifetime as constraint, elision, variance, higher-ranked bounds, the static bound"
      rows={['a constraint between borrows, not a duration', 'one input lifetime wins; two is ambiguous', "&'a T is covariant; &mut T and Cell<T> aren't", 'a higher-ranked bound holds for every lifetime', "'static: no short borrows inside, not forever"]}
      s={14}
    />
  );
}
