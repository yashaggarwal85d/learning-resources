import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = keys; latte = machine labels; taupe = the ring and quiet axes;
// caramel = the arc a join or leave moves, and the machine a key is routed to; cinnamon = the compared
// alternative (virtual nodes against one point per machine); cherryText = every key moving on a resize,
// and the overloaded machine. Every printed number is asserted in examples.py or quoted in SOURCES.md;
// the measured shares depend on Python's per-process hash seed, so they are drawn as shape only.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
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
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

type Pt = [number, number];
/** A point at fraction u (0..1, clockwise from the top) of a ring. */
const at = (cx: number, cy: number, r: number, u: number): Pt => [cx + r * Math.sin(u * Math.PI * 2), cy - r * Math.cos(u * Math.PI * 2)];
/** Points along the ring from u0 clockwise to u1. */
const arc = (cx: number, cy: number, r: number, u0: number, u1: number): Pt[] => {
  const d = ((u1 - u0) % 1 + 1) % 1;
  return Array.from({ length: 24 }, (_, i) => at(cx, cy, r, u0 + (d * i) / 23));
};

/** A machine on the ring: a small square with its label outside. */
function Machine({ cx, cy, r, u, label, f = C.latte, o = 1 }: { cx: number; cy: number; r: number; u: number; label: string; f?: string; o?: number }) {
  const [x, y] = at(cx, cy, r, u);
  const [lx, ly] = at(cx, cy, r + 24, u);
  return (
    <g opacity={o}>
      <rect x={x - 8} y={y - 8} width={16} height={16} rx={2} fill={C.cocoa} stroke={f} strokeWidth={2} />
      <T x={lx} y={ly + 5} s={13} f={f} a="middle">{label}</T>
    </g>
  );
}

/** The owner of a key at u: the first machine clockwise. */
const owner = (u: number, ms: number[]) => {
  let best = -1, bd = 2;
  ms.forEach((m, i) => {
    const d = ((m - u) % 1 + 1) % 1;
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
};

const MS = [0.08, 0.33, 0.55, 0.8];
const KEYS = (() => {
  const r = rng(21);
  return Array.from({ length: 18 }, () => r());
})();

// 1 · One level up. Left: last topic's resize, every entry moving at once (red). Right: a ring of machines,
// where a new machine is about to join, with the question of how many keys move.
export function Opening({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 0.4, 1.3));
  const ring = easeOut(seg(t, 1.5, 2.1));
  const join = easeOutBack(seg(t, 2.3, 2.8));
  return (
    <Svg label="Last topic's resize moves every entry; one level up, a machine joins a ring and the question is how many keys move" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>before: one table, one resize</T>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={40 + i * 30} y={50} width={26} height={22} rx={3} fill={C.cocoa} stroke={C.taupe} strokeWidth={1.2} />
          <rect x={lerp(40 + i * 30, 40 + ((i * 5) % 12) * 15, mv)} y={lerp(50, 110, mv)} width={lerp(26, 13, mv)} height={22} rx={3} fill={C.mocha} stroke={C.cherryText} strokeWidth={1.4} />
        </g>
      ))}
      <T x={30} y={160} s={13} f={C.cherryText} o={easeOut(seg(t, 1.1, 1.4))}>every entry moved</T>
      <circle cx={430} cy={140} r={90} fill="none" stroke={C.taupe} strokeWidth={1.4} opacity={ring} />
      {MS.map((u, i) => <Machine key={i} cx={430} cy={140} r={90} u={u} label={'ABCD'[i]} o={ring} />)}
      <Machine cx={430} cy={140} r={90} u={0.44} label="E" f={C.caramel} o={clamp(join)} />
      <T x={430} y={146} s={18} f={C.caramel} a="middle" o={clamp(join) * (0.6 + 0.4 * Math.sin(t * 4))}>?</T>
      <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>now: the same question, one level up</T>
    </Svg>
  );
}

// 2 · Ring placement. The ring draws; machines A-D hash onto it; keys hash onto it; then each key walks clockwise
// (a short caramel arc) to the first machine it meets.
export function RingPlacement({ t }: StepCtx) {
  const cx = 300, cy = 140, R = 100;
  const ringT = easeOut(seg(t, 0.1, 0.6));
  return (
    <Svg label="Keys and machines hashed onto the same ring; each key belongs to the first machine clockwise from it" h={300}>
      <Draw pts={arc(cx, cy, R, 0, 0.999)} t={t} from={0.1} to={0.6} stroke={C.taupe} w={1.4} pen={false} />
      {MS.map((u, i) => <Machine key={i} cx={cx} cy={cy} r={R} u={u} label={'ABCD'[i]} o={easeOutBack(clamp(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15)))} />)}
      {KEYS.map((u, k) => {
        const [x, y] = at(cx, cy, R, u);
        const o = easeOut(seg(t, 1.2 + k * 0.03, 1.4 + k * 0.03));
        const m = MS[owner(u, MS)];
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={4} fill={C.crema} opacity={o * ringT} />
            <Draw pts={arc(cx, cy, R - 12, u, m)} t={t} from={1.9 + k * 0.05} to={2.4 + k * 0.05} stroke={C.caramel} w={1.4} pen={false} o={0.8} />
          </g>
        );
      })}
      <T x={30} y={284} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>a key finds its machine, walking clockwise</T>
    </Svg>
  );
}

// 3 · Predict: a machine joins. Before answering, E hovers off the ring. After it, E drops into place and only
// the keys in the arc just before it change owner (caramel), each hopping from its old machine to E.
export function JoinPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const cx = 300, cy = 120, R = 90, E = 0.44;
  const drop = answered ? easeOutBack(seg(s, 0.05, 0.4)) : 0;
  const moveArc = answered ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const prev = MS[1];
  const moved = (u: number) => ((u - prev) % 1 + 1) % 1 < ((E - prev) % 1 + 1) % 1;
  return (
    <Svg label="A new machine joins the ring: only the keys between it and the machine before it change owner" h={300}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.taupe} strokeWidth={1.4} />
      {MS.map((u, i) => <Machine key={i} cx={cx} cy={cy} r={R} u={u} label={'ABCD'[i]} />)}
      {KEYS.map((u, k) => {
        const [x, y] = at(cx, cy, R, u);
        return <circle key={k} cx={x} cy={y} r={4} fill={answered && moved(u) && drop > 0.5 ? C.caramel : C.crema} />;
      })}
      {!answered && <Machine cx={cx} cy={cy - 6 * Math.sin(t * 4)} r={R + 40} u={E} label="E" f={C.caramel} />}
      {answered && <Machine cx={cx} cy={cy} r={lerp(R + 40, R, clamp(drop))} u={E} label="E" f={C.caramel} />}
      {answered && moveArc > 0 && <Draw pts={arc(cx, cy, R + 12, prev, E)} t={moveArc} from={0} to={1} stroke={C.caramel} w={3} pen={false} />}
      {!answered && <T x={30} y={284} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>how many keys move?</T>}
      {answered && (
        <>
          <Decode text="only one arc's keys" t={s} at={0.9} dur={0.4} x={30} y={262} s={14} f={C.caramel} />
          <T x={30} y={286} s={13} f={C.latte} o={easeOut(seg(s, 1.3, 1.7))}>every other key stays exactly put</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Minimal remapping. Left: a resize: every entry's arrow lights red at once. Right: the ring join: one short
// caramel arc moves its few keys; the rest of the ring stays dark.
export function MinimalRemapping({ t }: StepCtx) {
  const left = easeOut(seg(t, 0.3, 1.0));
  const right = easeOut(seg(t, 1.4, 2.2));
  const cx = 440, cy = 120, R = 80, E = 0.44, prev = MS[1];
  const moved = (u: number) => ((u - prev) % 1 + 1) % 1 < ((E - prev) % 1 + 1) % 1;
  return (
    <Svg label="A resize moves every entry; a ring join moves only the short arc of keys before the new machine" h={300}>
      <T x={30} y={24} s={13} f={C.cherryText}>last topic: a resize</T>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x={40 + (i % 5) * 46} y={50 + Math.floor(i / 5) * 60} width={30} height={20} rx={3} fill={C.mocha} stroke={C.crema} strokeWidth={1.1} />
          <Draw pts={[[55 + (i % 5) * 46, 72 + Math.floor(i / 5) * 60], [55 + ((i * 3) % 5) * 46 + 10, 100 + Math.floor(i / 5) * 60]]} t={left} from={0} to={1} stroke={C.cherryText} w={1.4} pen={false} />
        </g>
      ))}
      <T x={30} y={200} s={13} f={C.cherryText} o={left}>every entry moves</T>
      <T x={360} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.5))}>a ring join</T>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.taupe} strokeWidth={1.4} opacity={easeOut(seg(t, 1.2, 1.5))} />
      {[...MS, E].map((u, i) => <Machine key={i} cx={cx} cy={cy} r={R} u={u} label={'ABCDE'[i]} f={i === 4 ? C.caramel : C.latte} o={easeOut(seg(t, 1.2, 1.5))} />)}
      {KEYS.map((u, k) => {
        const [x, y] = at(cx, cy, R, u);
        return <circle key={k} cx={x} cy={y} r={3.5} fill={moved(u) && right > 0.5 ? C.caramel : C.crema} opacity={easeOut(seg(t, 1.2, 1.5))} />;
      })}
      <Draw pts={arc(cx, cy, R + 10, prev, E)} t={right} from={0} to={1} stroke={C.caramel} w={3} pen={false} />
      <T x={330} y={260} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.6))}>only this short arc moves</T>
      <T x={30} y={284} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>every other machine, untouched</T>
    </Svg>
  );
}

// 5 · Imbalance. Eight machines' single points jitter like rolling dice, then settle; each machine's arc is drawn
// and its key-count bar grows below; one lands in a wide gap and its bar towers, red.
export function ImbalanceProblem({ t }: StepCtx) {
  const cx = 150, cy = 130, R = 90;
  const r = rng(5);
  const final = [0.02, 0.07, 0.15, 0.2, 0.26, 0.31, 0.7, 0.78];
  const settle = easeOut(seg(t, 0.2, 1.2));
  const jit = (i: number) => (1 - settle) * 0.08 * Math.sin(t * 13 + i * 2.1 + r());
  const us = final.map((u, i) => (u + jit(i) + 1) % 1);
  const share2 = final.map((u, i) => (((u - final[(i + 7) % 8]) % 1) + 1) % 1);
  const bars = easeOut(seg(t, 1.4, 2.4));
  const big = share2.indexOf(Math.max(...share2));
  return (
    <Svg label="Eight machines with one random point each: chance leaves one machine owning a far wider arc of the ring, and far more keys, than the others" h={300}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.taupe} strokeWidth={1.4} />
      {us.map((u, i) => {
        const [x, y] = at(cx, cy, R, u);
        return <rect key={i} x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={C.cocoa} stroke={i === big && bars > 0 ? C.cherryText : C.latte} strokeWidth={1.8} />;
      })}
      {bars > 0 && <Draw pts={arc(cx, cy, R + 10, final[(big + 7) % 8], final[big])} t={bars} from={0} to={1} stroke={C.cherryText} w={3} pen={false} />}
      <T x={300} y={30} s={13} f={C.latte}>keys per machine</T>
      <T x={300} y={50} s={13} f={C.latte}>one point each</T>
      <line x1={300} y1={220} x2={560} y2={220} stroke={C.mocha} strokeWidth={1.2} />
      {share2.map((v, i) => <rect key={i} x={306 + i * 31} y={220 - v * 330 * bars} width={22} height={v * 330 * bars} fill={i === big ? C.cherryText : C.latte} />)}
      <line x1={300} y1={220 - 330 / 8} x2={560} y2={220 - 330 / 8} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="5 4" opacity={bars} />
      <line x1={300} y1={240} x2={330} y2={240} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="5 4" opacity={bars} />
      <T x={338} y={245} s={13} f={C.caramel} o={bars}>fair share</T>
      <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(t, 2.5, 2.9))}>random isn&apos;t even: one roll of the dice each</T>
    </Svg>
  );
}

// 6 · Predict: what fixes one machine's share? Before answering, its single point owns a wide red arc. After,
// the point splits into many small caramel points scattered round the ring and its share bar drops to fair.
export function VirtualNodesPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const cx = 160, cy = 130, R = 90;
  const split = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const r = rng(17);
  const vs = Array.from({ length: 12 }, () => r());
  const share = lerp(0.38, 0.13, split);
  return (
    <Svg label="One machine's single point owns a wide arc of the ring; hashing it to many points instead evens its share out" h={300}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.taupe} strokeWidth={1.4} />
      <Draw pts={arc(cx, cy, R + 10, 0.42, 0.8)} t={1} from={0} to={0.01} stroke={C.cherryText} w={3} pen={false} o={1 - split} />
      {vs.map((u, i) => {
        const [x, y] = at(cx, cy, R, lerp(0.8, u, split));
        return <rect key={i} x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={C.cocoa} stroke={answered ? C.caramel : C.cherryText} strokeWidth={1.8} opacity={i === 0 || answered ? 1 : 0} />;
      })}
      <T x={320} y={60} s={13} f={C.latte}>this machine&apos;s share</T>
      <rect x={320} y={74} width={240} height={14} rx={2} fill={C.cocoa} />
      <rect x={320} y={74} width={240 * share} height={14} rx={2} fill={answered ? C.caramel : C.cherryText} />
      <line x1={320 + 240 * 0.125} y1={68} x2={320 + 240 * 0.125} y2={94} stroke={C.latte} strokeWidth={1.4} />
      <T x={320 + 240 * 0.125} y={112} s={13} f={C.latte} a="middle">fair</T>
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what gives it a fair shot?</T>}
      {answered && (
        <>
          <Decode text="many points, not one" t={s} at={0.7} dur={0.4} x={30} y={256} s={14} f={C.caramel} />
          <T x={30} y={280} s={13} f={C.latte} o={easeOut(seg(s, 1.1, 1.5))}>many small shares average out evenly</T>
        </>
      )}
    </Svg>
  );
}

// 7 · 256 points per node. Three nodes' points sprinkle onto the ring in growing numbers, up to the documented
// 256 each; their share bars, uneven at first, settle level.
export function VirtualNodesReveal({ t }: StepCtx) {
  const cx = 150, cy = 140, R = 100;
  const k = Math.max(1, Math.floor(Math.pow(256, clamp(seg(t, 0.3, 2.4)))));
  const cols = [C.caramel, C.cinnamon, C.crema];
  const r = rng(41);
  const pts = Array.from({ length: 3 * 256 }, () => r());
  const uneven = [0.55, 0.2, 0.25];
  const lv = clamp(Math.log(k) / Math.log(256));
  return (
    <Svg label="Three nodes each hashed to 256 points on the ring, a real system's documented count, and their shares settling level" h={300}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.taupe} strokeWidth={1} />
      {[0, 1, 2].map((n) => Array.from({ length: k }, (_, i) => {
        const u = pts[n * 256 + i];
        const [x1, y1] = at(cx, cy, R - 6, u);
        const [x2, y2] = at(cx, cy, R + 6, u);
        return <line key={`${n}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cols[n]} strokeWidth={1} opacity={0.8} />;
      }))}
      <T x={300} y={50} s={13} f={C.latte}>points per node</T>
      <T x={490} y={51} s={16} f={C.caramel}>{k}</T>
      {[0, 1, 2].map((n) => (
        <rect key={n} x={300} y={80 + n * 30} width={lerp(uneven[n], 1 / 3, lv) * 600 * 0.6} height={16} rx={2} fill={cols[n]} opacity={0.85} />
      ))}
      <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>a real system&apos;s own count: 256 per node, older scheme</T>
    </Svg>
  );
}

// 8 · Bounded loads. Requests aimed at one machine pour into its bar until it hits the dashed cap; the excess
// spills over to its clockwise neighbour, and the next, but no bar ever crosses the cap.
export function BoundedLoads({ t }: StepCtx) {
  const base = [0.3, 0.35, 0.28, 0.32, 0.3];
  const flood = clamp(seg(t, 0.3, 2.6)) * 1.2;
  const cap = 0.7;
  const loads = base.slice();
  let extra = flood;
  for (let i = 1; i < 5 && extra > 0; i++) {
    const room = cap - loads[i];
    const add = Math.min(room, extra);
    loads[i] += add;
    extra -= add;
  }
  const H = 150, Y = 220;
  return (
    <Svg label="Requests aimed at one machine fill it to its cap and the excess spills to the next machine; no machine ever exceeds the cap" h={300}>
      <T x={30} y={24} s={13} f={C.cherryText}>an adversary aims every request at B</T>
      <line x1={60} y1={Y} x2={540} y2={Y} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={60} y1={Y - cap * H} x2={540} y2={Y - cap * H} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="6 4" />
      <T x={540} y={Y - cap * H - 8} s={13} f={C.caramel} a="end">cap</T>
      {loads.map((v, i) => (
        <g key={i}>
          <rect x={90 + i * 90} y={Y - v * H} width={50} height={v * H} fill={i === 1 ? C.cherryText : v > base[i] + 0.01 ? C.cinnamon : C.latte} opacity={0.85} />
          <T x={115 + i * 90} y={Y + 22} s={13} f={C.latte} a="middle">{'ABCDE'[i]}</T>
        </g>
      ))}
      {flood > 0.4 && <Draw pts={[[165, Y - cap * H - 20], [205, Y - cap * H - 30], [245, Y - cap * H - 20]]} t={t} from={1.2} to={1.5} stroke={C.cinnamon} w={1.6} pen={false} />}
      {flood > 0.8 && <Draw pts={[[255, Y - cap * H - 20], [295, Y - cap * H - 30], [335, Y - cap * H - 20]]} t={t} from={2.0} to={2.3} stroke={C.cinnamon} w={1.6} pen={false} />}
      <T x={30} y={270} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.4, 2.8))}>excess redirected to the next machine</T>
      <T x={30} y={292} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>a guaranteed cap, even adversarially</T>
    </Svg>
  );
}

// 9 · Prove it. Left pair: a 10 → 11 join moves a small slice of 20,000 keys; a resize moves all of them.
// Right pair: 8 machines, one point each (uneven bars) against 32 points each (nearly level). Shape only.
export function ProveIt({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.2));
  const b = easeInOut(seg(t, 1.6, 2.6));
  const one = [0.25, 0.08, 0.12, 0.2, 0.05, 0.1, 0.14, 0.06];
  const many = [0.13, 0.12, 0.125, 0.13, 0.12, 0.125, 0.12, 0.13];
  return (
    <Svg label="A ring join moves a small slice of the keys while a resize moves all of them; thirty-two points per machine level out the shares that one point leaves uneven" h={300}>
      <T x={30} y={24} s={13} f={C.crema}>20,000 keys</T>
      <T x={30} y={44} s={13} f={C.crema}>50 joins of 10 &rarr; 11</T>
      <line x1={40} y1={200} x2={260} y2={200} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={60} y={200 - 120 * 0.072 * a} width={60} height={120 * 0.072 * a} fill={C.caramel} />
      <rect x={170} y={200 - 120 * a} width={60} height={120 * a} fill={C.cherryText} />
      <T x={90} y={222} s={13} f={C.caramel} a="middle">join</T>
      <T x={200} y={222} s={13} f={C.cherryText} a="middle">resize</T>
      <T x={200} y={72} s={13} f={C.cherryText} a="middle" o={a}>100%</T>
      <T x={320} y={24} s={13} f={C.crema} o={easeOut(seg(t, 1.4, 1.7))}>8 machines</T>
      <line x1={310} y1={120} x2={560} y2={120} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.4, 1.7))} />
      {one.map((v, i) => <rect key={i} x={316 + i * 30} y={120 - v * 300 * b} width={20} height={v * 300 * b} fill={C.latte} />)}
      <T x={320} y={142} s={13} f={C.latte} o={b}>one point each</T>
      <line x1={310} y1={240} x2={560} y2={240} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.4, 1.7))} />
      {many.map((v, i) => <rect key={i} x={316 + i * 30} y={240 - v * 300 * b} width={20} height={v * 300 * b} fill={C.cinnamon} />)}
      <T x={320} y={262} s={13} f={C.cinnamon} o={b}>32 points each</T>
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>both measured, on the same ring</T>
    </Svg>
  );
}
