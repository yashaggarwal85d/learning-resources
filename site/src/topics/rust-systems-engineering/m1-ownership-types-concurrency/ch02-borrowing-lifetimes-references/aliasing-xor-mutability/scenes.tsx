import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: a single payload box on the right, with borrow edges reaching into it from owner slots on
// the left — the same owner/heap regions Chapter 1 used, now asking "how many edges, of what kind, at once" instead
// of "who owns it". A shared edge is dashed latte ending in an open dot; an exclusive edge is dashed cinnamon ending
// in an open dot (CHAPTER.md §A.5); the edges never carry an arrowhead, since nothing here is an owner edge. Every
// snippet is an exact line of examples/*.rs (examples.py asserts every number and every compiler message shown).

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
const rv = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transition: 'opacity .15s', transitionDelay: on ? `${Math.min(delay, 0.1)}s` : '0s' });

function Payload({ x, y, label, w = 130, h = 56, hot = false }: { x: number; y: number; label: string; w?: number; h?: number; hot?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={C.cocoa} stroke={hot ? C.caramel : C.mocha} strokeWidth={hot ? 2.5 : 1.5} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={14} a="middle" f={C.crema}>{label}</T>
    </g>
  );
}

function Slot({ x, y, name, w = 110, h = 38, bad = false }: { x: number; y: number; name: string; w?: number; h?: number; bad?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={bad ? C.cherryText : C.mocha} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={14} a="middle" f={bad ? C.cherryText : C.crema}>{name}</T>
    </g>
  );
}

/** A borrow edge from an owner slot's right edge into a payload's left edge; open-dot end, no arrowhead. */
function Edge({ x1, y1, x2, y2, t, from, to, kind, reject }: { x1: number; y1: number; x2: number; y2: number; t: number; from: number; to: number; kind: 'shared' | 'exclusive' | 'reserved'; reject?: number }) {
  const stroke = reject !== undefined && t >= reject ? C.cherryText : kind === 'exclusive' ? C.cinnamon : C.latte;
  const dash = kind === 'reserved' ? '2 5' : '5 4';
  const k = easeOut(seg(t, from, to));
  if (k <= 0) return null;
  const mx = x1 + (x2 - x1) * k;
  const my = y1 + (y2 - y1) * k;
  return (
    <g>
      <Draw pts={[[x1, y1], [mx, my]]} t={t} from={from} to={to} stroke={stroke} w={2} dash={dash} pen={false} />
      {k >= 0.98 && <circle cx={x2} cy={y2} r={4.5} fill={C.espresso} stroke={stroke} strokeWidth={2} />}
    </g>
  );
}

function Flash({ x, y, code, t, at }: { x: number; y: number; code: string; t: number; at: number }) {
  const k = easeOutBack(seg(t, at, at + 0.3));
  if (k <= 0.01) return null;
  return (
    <g opacity={k}>
      <Reticle x={x} y={y} w={120} h={48} t={t} at={at} color={C.cherryText} />
      <T x={x} y={y + 38} s={14} a="middle" f={C.cherryText} w={600}>{code}</T>
    </g>
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

// ── 1 · Two readers or one writer, never both ─────────────────────────────────────────────────────────────────────
export function TheRule({ t }: StepCtx) {
  return (
    <Svg label="many shared borrows of a place, or exactly one exclusive borrow, never both at once" h={310}>
      <Payload x={380} y={122} label="the place" hot />
      <g opacity={1 - fa(t, 1.8, 0.3)}>
        <Slot x={40} y={30} name="&T" />
        <Slot x={40} y={95} name="&T" />
        <Slot x={40} y={160} name="&T" />
        <Edge x1={150} y1={49} x2={380} y2={140} t={t} from={0.2} to={0.9} kind="shared" />
        <Edge x1={150} y1={114} x2={380} y2={148} t={t} from={0.5} to={1.1} kind="shared" />
        <Edge x1={150} y1={179} x2={380} y2={156} t={t} from={0.8} to={1.4} kind="shared" />
      </g>
      <g opacity={fa(t, 2.0, 0.4)}>
        <Slot x={40} y={95} name="&mut T" />
        <Edge x1={150} y1={114} x2={380} y2={148} t={t} from={2.1} to={2.5} kind="exclusive" />
      </g>
      <T x={40} y={270} s={14} f={C.taupe} o={1 - fa(t, 1.8, 0.3)}>many &T …</T>
      <T x={40} y={270} s={14} f={C.caramel} o={fa(t, 2.0, 0.4)}>… or exactly one &mut T, never both</T>
    </Svg>
  );
}

// ── 2 · No two threads both holding the pen ────────────────────────────────────────────────────────────────────────
export function DataRaceFreedom({ t }: StepCtx) {
  return (
    <Svg label="two threads cannot both hold an exclusive borrow of the same place; a Mutex gives the same exclusivity at run time instead" h={380}>
      <Payload x={380} y={122} label="shared state" hot />
      <Slot x={40} y={50} name="thread A" />
      <Slot x={40} y={190} name="thread B" />
      <Edge x1={150} y1={69} x2={380} y2={140} t={t} from={0.2} to={0.9} kind="exclusive" />
      <Edge x1={150} y1={209} x2={380} y2={156} t={t} from={1.0} to={1.6} kind="exclusive" reject={1.6} />
      <Flash x={460} y={230} code="E0499: already borrowed" t={t} at={1.6} />
      <g opacity={fa(t, 3.0, 0.4)}>
        <T x={40} y={290} s={14} f={C.taupe}>at compile time: the checker rejects it, as above</T>
        <T x={40} y={314} s={14} f={C.crema}>at run time: a Mutex makes thread B wait instead</T>
      </g>
    </Svg>
  );
}

// ── 3 · A function the compiler wants to shrink (predict) ──────────────────────────────────────────────────────────
export function Compute({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const m = ans ? easeInOut(seg(s, 0.1, 0.8)) : 0; // the two cells slide into one place
  const careful = ans ? easeOut(seg(s, 0.9, 1.5)) : 0;
  const shortcut = ans ? easeOut(seg(s, 1.0, 2.0)) : 0;
  const outX = lerp(390, 60, m);
  const merged = m > 0.95;
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code
          title="examples/compute.rs"
          lines={['pub fn compute(input: &u32, output: &mut u32) {', '    if *input > 10 { *output = 1; }', '    if *input > 5 { *output *= 2; }', '}']}
          t={t}
          start={0.1}
          end={0.8}
          highlight={t > 1.0 && !ans ? [1, 2] : []}
        />
      )}
      <Svg label="compute reads input twice and may write output twice; a shortcut would read once and write once. If both were the same place, the careful version stops at 1 while the shortcut lands on 2" h={196} fill>
        <rect x={60} y={50} width={150} height={44} rx={8} fill={C.cocoa} stroke={merged ? C.caramel : C.mocha} strokeWidth={merged ? 2.5 : 1.5} />
        {!merged && <rect x={outX} y={50} width={150} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />}
        {m < 0.5 && <T x={135} y={78} s={14} a="middle" f={C.crema}>*input</T>}
        {m < 0.5 && <T x={outX + 75} y={78} s={14} a="middle" f={C.crema}>*output</T>}
        {m >= 0.5 && <T x={135} y={78} s={14} a="middle" f={C.caramel}>one place</T>}
        {!ans && (
          <g>
            <Draw pts={arc(210, 58, 390, 58, 0)} t={t} from={0.25} to={0.7} stroke={C.latte} w={2} />
            <T x={300} y={22} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 0.55, 0.8))}>{'> 10: write'}</T>
            <Draw pts={arc(210, 86, 390, 86, 136)} t={t} from={0.75} to={1.2} stroke={C.latte} w={2} />
            <T x={300} y={136} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 1.05, 1.3))}>{'> 5: write again'}</T>
            <Draw pts={[[210, 72], [390, 72]]} t={t} from={1.25} to={1.6} stroke={C.caramel} w={2} dash="6 5" />
            <T x={300} y={180} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 1.4, 1.7))}>shortcut: once</T>
          </g>
        )}
        {ans && (
          <g opacity={easeOut(seg(s, 0.8, 1.0))}>
            <T x={40} y={134} s={13} f={C.latte}>careful</T>
            <line x1={170} y1={130} x2={520} y2={130} stroke={C.mocha} strokeWidth={1.5} />
            <circle cx={lerp(170, 345, careful)} cy={130} r={7} fill={C.cherryText} />
            {careful > 0.95 && <T x={345} y={114} s={14} a="middle" f={C.cherryText} w={600}>1</T>}
            <T x={40} y={176} s={13} f={C.latte}>shortcut</T>
            <line x1={170} y1={172} x2={520} y2={172} stroke={C.mocha} strokeWidth={1.5} />
            <circle cx={lerp(170, 520, shortcut)} cy={172} r={7} fill={C.caramel} />
            {shortcut > 0.95 && <T x={520} y={156} s={14} a="middle" f={C.caramel} w={600}>2</T>}
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 4 · compute(&x, &mut x) doesn't compile ─────────────────────────────────────────────────────────────────────────
export function AliasFail({ t }: StepCtx) {
  return (
    <Svg label="compute(&x, &mut x) is rejected: E0502, cannot borrow x as mutable because it is also borrowed as immutable" h={360}>
      <Payload x={380} y={150} label="x" hot />
      <Slot x={40} y={90} name="&x" bad />
      <Slot x={40} y={210} name="&mut x" bad />
      <Edge x1={150} y1={109} x2={380} y2={170} t={t} from={0.2} to={0.8} kind="shared" reject={1.4} />
      <Edge x1={150} y1={229} x2={380} y2={186} t={t} from={0.5} to={1.1} kind="exclusive" reject={1.4} />
      <Flash x={260} y={178} code="E0502" t={t} at={1.4} />
      <g opacity={fa(t, 2.1, 0.4)}>
        <Code title="rustc" lines={['error[E0502]: cannot borrow `x` as mutable', 'because it is also borrowed as immutable']} t={t} start={2.1} end={2.9} highlight={[0, 1]} />
      </g>
    </Svg>
  );
}

// ── 5 · The optimizer is told, not just lucky ──────────────────────────────────────────────────────────────────────
export function Noalias({ t }: StepCtx) {
  const drop = (a: number) => easeOutBack(seg(t, a, a + 0.4));
  const ghost = easeOut(seg(t, 1.45, 1.95));
  return (
    <Stack>
      <Code
        title="-O --emit=llvm-ir"
        lines={['define void @compute_ref(ptr noalias %input, ptr noalias %output)', 'define void @compute_raw(ptr %input, ptr %output)']}
        t={t}
        start={0.1}
        end={0.7}
        highlight={t > 1.3 ? [0] : []}
      />
      <Svg label="the reference version's two pointer parameters each receive a noalias tag; on the raw-pointer version the tags fall away, since raw pointers promise nothing" h={184} fill>
        <T x={20} y={75} s={13} f={C.latte}>{'&u32, &mut'}</T>
        <T x={20} y={159} s={13} f={C.latte}>raw ptrs</T>
        {[230, 410].map((x, i) => {
          const k = drop(0.75 + i * 0.25);
          return (
            <g key={x}>
              <rect x={x} y={52} width={140} height={36} rx={8} fill={C.cocoa} stroke={k > 0.95 ? C.caramel : C.mocha} strokeWidth={1.5} />
              <T x={x + 70} y={75} s={13} a="middle" f={C.crema}>{i ? '%output' : '%input'}</T>
              {k > 0 && (
                <g transform={`translate(0 ${((1 - k) * -40).toFixed(1)})`} opacity={Math.min(1, k * 2)}>
                  <rect x={x + 20} y={18} width={100} height={26} rx={5} fill={C.caramel} />
                  <T x={x + 70} y={36} s={13} a="middle" f={C.espresso} w={700}>noalias</T>
                </g>
              )}
              <rect x={x} y={136} width={140} height={36} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 4" />
              <T x={x + 70} y={159} s={13} a="middle" f={C.latte}>{i ? '%output' : '%input'}</T>
              {ghost > 0 && ghost < 1 && <rect x={x + 20} y={92 + ghost * 40} width={100} height={26} rx={5} fill="none" stroke={C.taupe} strokeDasharray="4 3" opacity={1 - ghost} />}
            </g>
          );
        })}
        <Reticle x={390} y={54} w={350} h={84} t={t} at={1.5} />
      </Svg>
    </Stack>
  );
}

// ── 6 · Lending from a &mut without losing it: a reborrow ─────────────────────────────────────────────────────────
export function Reborrow({ t }: StepCtx) {
  const first = fa(t, 0.3, 0.3);
  const back = fa(t, 1.6, 0.3);
  const second = fa(t, 2.0, 0.3);
  return (
    <Svg label="r is lent to bump twice; each call reborrows a shorter &mut *r rather than moving r" h={340}>
      <Slot x={40} y={130} name="r: &mut i32" />
      <Payload x={380} y={130} label="n" hot />
      <g opacity={first}>
        <Edge x1={150} y1={149} x2={330} y2={70} t={t} from={0.3} to={0.9} kind="exclusive" />
        <T x={260} y={55} s={13} a="middle" f={C.latte}>bump(r) — reborrow 1</T>
      </g>
      <g opacity={back}>
        <T x={260} y={110} s={13} a="middle" f={C.taupe}>r usable again</T>
      </g>
      <g opacity={second}>
        <Edge x1={150} y1={149} x2={330} y2={230} t={t} from={2.0} to={2.6} kind="exclusive" />
        <T x={260} y={250} s={13} a="middle" f={C.latte}>bump(r) — reborrow 2</T>
      </g>
      <g opacity={fa(t, 2.9, 0.4)}>
        <T x={40} y={300} s={14} f={C.caramel}>r itself is never marked moved</T>
      </g>
    </Svg>
  );
}

// ── 7 · Does v.push(v.len()) compile? (predict) ─────────────────────────────────────────────────────────────────────
export function TwoPhaseQuestion({ t }: StepCtx) {
  return (
    <Stack>
      <Code title="?" lines={['let mut v = vec![10, 20, 30];', 'v.push(v.len() as i32);']} t={t} start={0.1} end={1.2} highlight={[1]} />
    </Stack>
  );
}

// ── 8 · Reserved, then activated ────────────────────────────────────────────────────────────────────────────────
export function TwoPhase({ t }: StepCtx) {
  return (
    <Svg label="v.push's &mut starts reserved (behaves like a shared borrow), then activates into an exclusive borrow at the call" h={340}>
      <Payload x={380} y={130} label="v" hot />
      <Slot x={40} y={60} name="v.len()" />
      <Slot x={40} y={190} name="v.push( )" />
      <Edge x1={150} y1={79} x2={380} y2={150} t={t} from={0.2} to={0.7} kind="shared" />
      <Edge x1={150} y1={209} x2={380} y2={166} t={t} from={0.0} to={0.5} kind="reserved" />
      <g opacity={fa(t, 0.9, 0.3)}>
        <T x={40} y={250} s={13} f={C.taupe}>reservation: behaves like a shared borrow</T>
      </g>
      <g opacity={fa(t, 1.6, 0.3)}>
        <Edge x1={150} y1={209} x2={380} y2={166} t={t} from={1.6} to={2.0} kind="exclusive" />
        <T x={40} y={272} s={13} f={C.caramel}>activated at the call: now exclusive</T>
      </g>
    </Svg>
  );
}

// ── 9 · A reservation still is not a free pass ─────────────────────────────────────────────────────────────────────
export function Sneaky({ t }: StepCtx) {
  return (
    <Svg label="a shared borrow taken during the reservation but used after the call still spans the activation point, and is rejected" h={380}>
      <Payload x={380} y={150} label="v" hot />
      <Slot x={40} y={60} name="p = &v[0]" bad />
      <Slot x={40} y={220} name="v.push( )" bad />
      <Edge x1={150} y1={79} x2={380} y2={160} t={t} from={0.2} to={0.7} kind="shared" reject={1.8} />
      <Edge x1={150} y1={239} x2={380} y2={180} t={t} from={0.0} to={0.5} kind="reserved" />
      <Edge x1={150} y1={239} x2={380} y2={180} t={t} from={1.4} to={1.8} kind="exclusive" reject={1.8} />
      <Flash x={260} y={190} code="E0502" t={t} at={1.8} />
      <g opacity={fa(t, 2.4, 0.4)}>
        <T x={40} y={320} s={14} f={C.crema}>the aliasing rule still holds across activation</T>
      </g>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      end={2.5}
      label="recap: the aliasing rule, what it buys, and its two exceptions-that-are-not"
      rows={['many &T or one &mut T, never both', 'that rule gives data-race freedom', 'and the noalias facts the optimizer uses', 'a reborrow lends from a &mut, never moves it', 'a two-phase borrow: reserved, then activated', 'reservation still obeys the rule, past the call']}
      s={14}
    />
  );
}
