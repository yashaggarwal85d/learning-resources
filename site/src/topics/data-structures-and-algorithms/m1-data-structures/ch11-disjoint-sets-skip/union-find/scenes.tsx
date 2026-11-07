import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's shared language): crema = an element or stored entry; latte = secondary
// labels; caramel = the thing to look at (the find path, the node being linked in); cinnamon = the alternative being
// compared; cherryText = the bad outcome. Every printed number is examples.py's: the naive chain's depth 15 on 16
// elements, rank's tight depth 4, the 16-read first Find and 2-read second Find after compression, the long run's
// 4,519.81 / 5.89 / 3.95 average reads per operation, Kruskal's sorted order (C-D, A-C, D-E, B-C, E-F merge; the
// other five are already together). "Less than 5" for alpha(n) is the Princeton note quoted in SOURCES.md.

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

/** A pointer from child (x1,y1) to parent (x2,y2), stopping at the parent's rim, with an arrowhead there. */
function Ptr({ x1, y1, x2, y2, r = 11, c = C.crema, w = 1.5, o = 1, dash }: { x1: number; y1: number; x2: number; y2: number; r?: number; c?: string; w?: number; o?: number; dash?: string }) {
  const d = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / d;
  const uy = (y2 - y1) / d;
  const ax = x1 + ux * r;
  const ay = y1 + uy * r;
  const bx = x2 - ux * r;
  const by = y2 - uy * r;
  const px = -uy;
  const py = ux;
  return (
    <g opacity={o}>
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={c} strokeWidth={w} strokeDasharray={dash} />
      <path d={`M ${bx} ${by} L ${bx - ux * 7 + px * 4} ${by - uy * 7 + py * 4} L ${bx - ux * 7 - px * 4} ${by - uy * 7 - py * 4} Z`} fill={c} />
    </g>
  );
}

/** A small loop above a root: it points at itself. */
function SelfLoop({ x, y, r = 11, c = C.latte, o = 1 }: { x: number; y: number; r?: number; c?: string; o?: number }) {
  return <path d={`M ${x - 5} ${y - r + 1} C ${x - 14} ${y - r - 18}, ${x + 14} ${y - r - 18}, ${x + 5} ${y - r + 1}`} fill="none" stroke={c} strokeWidth={1.3} opacity={o} />;
}

function Node({ x, y, label, r = 11, c = C.crema, fill = C.roast, o = 1, s = 12 }: { x: number; y: number; label?: string | number; r?: number; c?: string; fill?: string; o?: number; s?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={c} strokeWidth={1.6} />
      {label !== undefined && <T x={x} y={y + 4} s={s} f={c} a="middle">{label}</T>}
    </g>
  );
}

// 1 · Ten million matches, one chain. Relabelling: cluster a merges into cluster b, and every one of a's six records
// is touched in turn, the counter climbing with the cluster's size. A graph search per pair: the same cost under a new
// name. Then every record just points at the one before it: a lookup walks the whole chain.
export function Hook({ t }: StepCtx) {
  const show = easeOut(seg(t, 0.1, 0.5));
  const relAt = (i: number) => 0.8 + i * 0.18;
  const touched = [0, 1, 2, 3, 4, 5].filter((i) => t >= relAt(i)).length;
  const dim = 1 - 0.6 * easeOut(seg(t, 2.3, 2.6));
  const chainIn = easeOut(seg(t, 2.5, 2.9));
  const N = 8;
  const CX = (i: number) => 60 + i * 64;
  const walk = clamp(seg(t, 3.0, 4.0) * (N - 1));
  const mx = lerp(CX(N - 1), CX(0), walk / (N - 1));
  return (
    <Svg label="Merging two clusters by relabelling touches every record of the smaller one; then records chained one to the next make every lookup walk the whole chain" h={330}>
      <g opacity={show * dim}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 40 + (i % 3) * 40;
          const y = 40 + Math.floor(i / 3) * 34;
          const on = t >= relAt(i);
          const flash = on && t < relAt(i) + 0.25;
          return (
            <g key={i}>
              <rect x={x} y={y} width={32} height={24} rx={3} fill={C.roast} stroke={flash ? C.caramel : on ? C.cinnamon : C.crema} strokeWidth={flash ? 2 : 1.2} />
              <T x={x + 16} y={y + 17} s={13} f={on ? C.cinnamon : C.crema} a="middle">{on ? 'b' : 'a'}</T>
            </g>
          );
        })}
        {[0, 1, 2].map((i) => (
          <g key={`b${i}`}>
            <rect x={260 + i * 40} y={40} width={32} height={24} rx={3} fill={C.roast} stroke={C.cinnamon} strokeWidth={1.2} />
            <T x={276 + i * 40} y={57} s={13} f={C.cinnamon} a="middle">b</T>
          </g>
        ))}
        <Ptr x1={170} y1={60} x2={250} y2={60} r={4} c={C.latte} o={easeOut(seg(t, 0.5, 0.8))} />
        <T x={176} y={46} s={12} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>merge</T>
        <T x={40} y={132} s={13} f={C.caramel} o={touched > 0 ? 1 : 0}>relabelled: {touched} of 6</T>
        <T x={40} y={156} s={12} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>one merge costs the whole cluster</T>
      </g>
      <T x={40} y={190} s={12} f={C.latte} o={easeOut(seg(t, 2.1, 2.4)) * (1 - 0.5 * chainIn)}>a search per pair: the same cost again</T>
      <g opacity={chainIn}>
        {Array.from({ length: N }, (_, i) => (
          <g key={i}>
            <Node x={CX(i)} y={250} c={walk >= N - 1 - i && t >= 3.0 ? C.caramel : C.crema} />
            {i > 0 && <Ptr x1={CX(i)} y1={250} x2={CX(i - 1)} y2={250} />}
          </g>
        ))}
        {t >= 3.0 && <circle cx={mx} cy={250} r={15} fill="none" stroke={C.caramel} strokeWidth={2} />}
      </g>
      <T x={40} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 3.6, 4.0))}>every lookup walks the whole chain</T>
    </Svg>
  );
}

// 2 · Three operations, one forest. MakeSet: six singletons, each pointing at itself, the parent array reading
// 0..5. Unions build two trees (1, 2 under 0; 4, 5 under 3), the cells updating. Find(5) climbs to 3. Union points
// root 3 at root 0. Every arrow points up; none points down to a child.
export function Forest({ t }: StepCtx) {
  const mk = (i: number) => easeOutBack(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1));
  const build = (i: number) => easeInOut(seg(t, 1.0 + i * 0.18, 1.4 + i * 0.18)); // 1, 2, 4, 5 in turn
  const ORDER = [1, 2, 4, 5];
  const find = seg(t, 2.1, 2.7);
  const un = easeInOut(seg(t, 3.0, 3.5));
  const SING: Pt[] = [0, 1, 2, 3, 4, 5].map((i) => [70 + i * 80, 170]);
  const TREE: Pt[] = [[150, 140], [100, 230], [200, 230], [330, 170], [290, 250], [370, 250]];
  const pos = (i: number): Pt => {
    const k = i === 0 || i === 3 ? easeInOut(seg(t, 1.0, 1.4)) : build(ORDER.indexOf(i));
    return [lerp(SING[i][0], TREE[i][0], k), lerp(SING[i][1], TREE[i][1], k)];
  };
  const parentOf = (i: number) => {
    if (i === 3) return un >= 0.5 ? 0 : 3;
    if (i === 0) return 0;
    const k = build(ORDER.indexOf(i));
    return k >= 0.5 ? (i < 3 ? 0 : 3) : i;
  };
  const phase = t < 1.0 ? 0 : t < 3.0 ? 1 : 2;
  const findNode = find > 0 && find < 1 ? (find < 0.5 ? 5 : 3) : -1;
  return (
    <Svg label="Six singletons each pointing at themselves; unions hang 1 and 2 under 0 and 4 and 5 under 3; Find from 5 climbs to 3; a final Union points root 3 at root 0; the parent array updates with every pointer" h={330}>
      <T x={30} y={24} s={13} f={phase === 0 ? C.caramel : C.latte}>MakeSet</T>
      <T x={120} y={24} s={13} f={t >= 2.1 && t < 3.0 ? C.caramel : C.latte}>Find</T>
      <T x={180} y={24} s={13} f={t >= 3.0 ? C.caramel : C.latte}>Union</T>
      <T x={280} y={24} s={12} f={C.latte}>parent[i]</T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = parentOf(i);
        const changed = p !== i;
        return (
          <g key={`c${i}`} opacity={clamp(mk(i))}>
            <T x={300 + i * 44} y={46} s={12} f={C.latte} a="middle">{i}</T>
            <rect x={280 + i * 44} y={54} width={40} height={30} rx={3} fill={C.roast} stroke={changed ? C.caramel : C.mocha} strokeWidth={1.2} />
            <T x={300 + i * 44} y={74} s={13} f={changed ? C.caramel : C.crema} a="middle">{p}</T>
          </g>
        );
      })}
      {[1, 2, 4, 5].map((i) => {
        const k = build(ORDER.indexOf(i));
        const [x, y] = pos(i);
        const [px, py] = pos(i < 3 ? 0 : 3);
        return k > 0.5 ? <Ptr key={`p${i}`} x1={x} y1={y} x2={px} y2={py} c={findNode >= 0 && i === 5 ? C.caramel : C.crema} o={clamp((k - 0.5) * 2)} /> : null;
      })}
      {un > 0.001 && <Ptr x1={pos(3)[0]} y1={pos(3)[1]} x2={pos(0)[0]} y2={pos(0)[1]} c={C.caramel} w={2} o={un} />}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const [x, y] = pos(i);
        const isRoot = parentOf(i) === i;
        return (
          <g key={`n${i}`}>
            {isRoot && mk(i) > 0.001 && <SelfLoop x={x} y={y} c={findNode === 3 && i === 3 ? C.caramel : C.latte} o={i === 3 ? 1 - un : 1} />}
            <Node x={x} y={y} label={i} o={clamp(mk(i))} c={findNode === i ? C.caramel : C.crema} />
          </g>
        );
      })}
      {t >= 2.1 && t < 3.0 && <T x={430} y={180} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 2.8))}>Find(5) = 3</T>}
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>every arrow points up; none points down</T>
    </Svg>
  );
}

// The 16-element chain from examples.py: merge k attaches the chain {0..k} under k+1, so after m merges node i sits
// at depth max(0, m - i). Drawn as a staircase: node i at x = 40 + 33i, sinking 12 units per level.
const SX = (i: number) => 40 + i * 33;
const SY = (depth: number) => 56 + depth * 12;

// 3 · Predict. You pick the merge order, there is no rule: sixteen singletons; each merge hangs the whole chain under
// a new singleton, and the chain sinks one level per merge. After answering: Find from the bottom record climbs
// fifteen pointers, a counter keeping score.
export function AdversarialChain({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const m = clamp(seg(t, 0.15, 1.5)) * 15;
  const climb = answered ? clamp(seg(s, 0.2, 1.8)) * 15 : 0;
  const at = Math.floor(climb + 1e-6);
  const fr = climb - at;
  const mx = at >= 15 ? SX(15) : lerp(SX(at), SX(at + 1), fr);
  const my = at >= 15 ? SY(0) : lerp(SY(15 - at), SY(14 - at), fr);
  return (
    <Svg label="Sixteen singletons; each merge hangs the whole chain under a new singleton until it is fifteen pointers deep; after answering, a Find from the bottom climbs all fifteen" h={330}>
      <T x={30} y={24} s={12} f={C.latte}>you pick the order; rule: none</T>
      {Array.from({ length: 15 }, (_, i) => {
        const k = clamp(m - i);
        const d0 = Math.max(0, m - i);
        const d1 = Math.max(0, m - i - 1);
        return k > 0 ? <Ptr key={`p${i}`} x1={SX(i)} y1={SY(d0)} x2={SX(i + 1)} y2={SY(d1)} r={7} c={answered && climb > i ? C.caramel : C.crema} w={1.3} o={k} /> : null;
      })}
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={SX(i)} cy={SY(Math.max(0, m - i))} r={7} fill={C.roast} stroke={answered && climb >= i && (i > 0 || s > 0.2) ? C.caramel : C.crema} strokeWidth={1.5} />
      ))}
      {answered && s > 0.2 && <circle cx={mx} cy={my} r={11} fill="none" stroke={C.caramel} strokeWidth={2} />}
      {!answered && <T x={30} y={270} s={15} f={C.cherryText} o={pulse}>how deep can you make it?</T>}
      {answered && <T x={30} y={262} s={13} f={C.caramel}>pointers climbed: {Math.min(15, Math.round(climb))}</T>}
      {answered && <T x={30} y={290} s={13} f={C.crema} o={easeOut(seg(s, 1.9, 2.3))}>depth 15 on 16: the whole chain, Θ(n)</T>}
    </Svg>
  );
}

// 4 · Union by rank. Sixteen records; each round joins trees of equal rank in pairs, an arc from the losing root to
// the winning one, and each row's rank goes up by one while its trees double: 1, 2, 4, 8, 16. Five rows, rank 4 at
// the bottom: log2 16, met exactly.
export function RankBound({ t }: StepCtx) {
  const RY = (r: number) => 52 + r * 46;
  const CW = 24;
  const X0 = 150;
  const rowAt = (r: number) => 0.3 + r * 0.8;
  return (
    <Svg label="Sixteen records merged in rounds of equal-rank pairs: trees of 1, 2, 4, 8 and finally 16, the rank rising by one each round, ending at rank 4, log base two of sixteen" h={330}>
      <T x={30} y={24} s={12} f={C.latte}>rank r needs at least 2^r records</T>
      {[0, 1, 2, 3, 4].map((r) => {
        const k = easeOut(seg(t, rowAt(r), rowAt(r) + 0.4));
        const size = 2 ** r;
        const groups = 16 / size;
        const yFrom = r === 0 ? RY(0) - 20 : RY(r - 1);
        const y = lerp(yFrom, RY(r), k);
        return (
          <g key={r} opacity={k}>
            <T x={30} y={RY(r) + 5} s={12} f={r === 4 ? C.caramel : C.crema}>rank {r}: {size}</T>
            {Array.from({ length: 16 }, (_, i) => (
              <rect key={i} x={X0 + i * CW + 3} y={y - 6} width={CW - 6} height={12} rx={2} fill={i % size === 0 ? C.crema : C.mocha} />
            ))}
            {Array.from({ length: groups }, (_, g) => (
              <rect key={`g${g}`} x={X0 + g * size * CW} y={RY(r) - 10} width={size * CW - 2} height={20} rx={4} fill="none" stroke={r === 4 ? C.caramel : C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, rowAt(r) + 0.3, rowAt(r) + 0.6))} />
            ))}
            {r > 0 &&
              Array.from({ length: groups }, (_, g) => {
                const wx = X0 + g * size * CW + CW / 2;
                const lx = wx + (size / 2) * CW;
                const top = RY(r) - 12;
                return <Draw key={`a${g}`} pts={[[lx, top], [(wx + lx) / 2, top - 10 - r * 2], [wx, top]]} t={t} from={rowAt(r) + 0.35} to={rowAt(r) + 0.7} stroke={C.caramel} w={1.5} pen={false} />;
              })}
          </g>
        );
      })}
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 3.9, 4.3))}>16 records: rank at most log₂ 16 = 4</T>
      <T x={30} y={314} s={12} f={C.latte} o={easeOut(seg(t, 4.2, 4.5))}>this worst case meets it exactly</T>
    </Svg>
  );
}

// 5 · Path compression. The depth-15 chain again; one Find from the bottom climbs it (16 reads, the last one the
// root's own check). Then every node it passed swings straight to the root. A second Find from the same node: 2 reads.
export function Compression({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.4));
  const climb = clamp(seg(t, 0.5, 1.8)) * 15;
  const at = Math.floor(climb + 1e-6);
  const fr = climb - at;
  const sw = easeInOut(seg(t, 2.0, 2.9));
  const again = seg(t, 3.2, 3.7);
  const ROOT: Pt = [SX(15), SY(0)];
  const flat = (i: number): Pt => [40 + i * 34, 190];
  const p = (i: number): Pt => (i === 15 ? ROOT : [lerp(SX(i), flat(i)[0], sw), lerp(SY(15 - i), flat(i)[1], sw)]);
  const reads = t < 0.5 ? 0 : Math.min(16, at + (t >= 1.8 ? 1 : 0) + (at > 0 || fr > 0 ? 1 : 0));
  const mk: Pt =
    t < 3.2
      ? at >= 15
        ? ROOT
        : [lerp(p(at)[0], p(at + 1)[0], fr), lerp(p(at)[1], p(at + 1)[1], fr)]
      : [lerp(p(0)[0], ROOT[0], easeInOut(again)), lerp(p(0)[1], ROOT[1], easeInOut(again))];
  return (
    <Svg label="The depth-fifteen chain; one Find from the bottom climbs every pointer, sixteen reads, then every node it passed relinks straight to the root; a second Find from the same node takes two reads" h={330}>
      <g opacity={a}>
        {Array.from({ length: 15 }, (_, i) => {
          const tgt = sw >= 0.5 ? ROOT : p(i + 1);
          return <Ptr key={`p${i}`} x1={p(i)[0]} y1={p(i)[1]} x2={tgt[0]} y2={tgt[1]} r={7} c={climb > i && t < 3.2 ? C.caramel : C.crema} w={1.2} o={sw > 0.3 && sw < 0.6 ? 0.3 : 1} />;
        })}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={p(i)[0]} cy={p(i)[1]} r={7} fill={C.roast} stroke={i === 15 ? C.caramel : C.crema} strokeWidth={1.5} />
        ))}
        <T x={ROOT[0] - 14} y={ROOT[1] - 14} s={12} f={C.latte} a="end">root</T>
      </g>
      {t >= 0.5 && <circle cx={mk[0]} cy={mk[1]} r={11} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={30} y={262} s={13} f={C.crema} o={t >= 0.5 ? 1 : 0}>Find from the bottom: {reads} reads</T>
      <T x={30} y={286} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>everyone it passed now points at the root</T>
      <T x={30} y={312} s={13} f={C.caramel} o={easeOut(seg(t, 3.6, 3.9))}>the same Find again: 2 reads</T>
    </Svg>
  );
}

// Per-call costs on a long run, as a shape: mostly a few reads, now and then a spike that compression then pays down.
const CALLS = Array.from({ length: 56 }, (_, i) => (i === 6 ? 46 : i === 21 ? 30 : i === 39 ? 18 : 4 + ((i * 37) % 7)));

// 6 · Predict. Each call's cost drawn as a strip: mostly low, a few spikes. What is the average per call? After
// answering: one spike circled (a single call can still be costly), then the measured averages: naive 4,519.81 reads
// per operation, off the scale; rank only 5.89; rank and compression 3.95, under the line at five.
export function TypicalCost({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const grow = (i: number) => easeOut(seg(t, 0.1 + i * 0.022, 0.3 + i * 0.022));
  const bars = answered ? easeOut(seg(s, 0.9, 1.7)) : 0;
  const PX = 50; // one read per operation, in units
  return (
    <Svg label="Per-call costs on a long run, mostly a few reads with occasional spikes; after answering, measured averages: naive 4,519.81 reads per operation, rank only 5.89, rank with compression 3.95, under five" h={320}>
      <T x={30} y={24} s={12} f={C.latte}>each call&apos;s cost, one bar per call</T>
      {CALLS.map((h, i) => (
        <rect key={i} x={30 + i * 9.5} y={110 - h * grow(i)} width={6} height={h * grow(i)} fill={C.crema} opacity={0.8} />
      ))}
      <line x1={30} y1={110} x2={565} y2={110} stroke={C.mocha} strokeWidth={1} />
      {!answered && <T x={30} y={150} s={15} f={C.cherryText} o={pulse}>the average per call?</T>}
      {answered && (
        <g opacity={easeOut(seg(s, 0.1, 0.5))}>
          <circle cx={30 + 6 * 9.5 + 3} cy={70} r={22} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
          <T x={124} y={66} s={12} f={C.cherryText}>one call: still up to log n</T>
          <line x1={30} y1={110 - 6} x2={565} y2={110 - 6} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="5 4" />
        </g>
      )}
      {answered && (
        <g opacity={bars}>
          <T x={30} y={146} s={12} f={C.latte}>average reads per operation</T>
          <T x={30} y={176} s={12} f={C.cherryText}>naive: 4,519.81 (off the scale)</T>
          <rect x={30} y={182} width={510 * bars} height={14} rx={2} fill={C.cherry} />
          <path d="M 392 178 l 8 22 M 402 178 l 8 22" stroke={C.espresso} strokeWidth={4} />
          <T x={30} y={222} s={12} f={C.crema}>rank only: 5.89</T>
          <rect x={30} y={228} width={5.89 * PX * bars} height={14} rx={2} fill={C.crema} />
          <T x={30} y={268} s={12} f={C.caramel}>rank + compression: 3.95</T>
          <rect x={30} y={274} width={3.95 * PX * bars} height={14} rx={2} fill={C.caramel} />
          <line x1={30 + 5 * PX} y1={208} x2={30 + 5 * PX} y2={296} stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 4" />
          <T x={30 + 5 * PX + 6} y={312} s={12} f={C.cinnamon}>five</T>
        </g>
      )}
    </Svg>
  );
}

// 7 · The O(alpha(n)) bound. n runs off to the right; log2 n (cinnamon) climbs off the top; alpha(n) climbs four tiny
// steps, each wider than the one before, the last stretching past anything a machine could hold, under the dashed
// "less than 5" line. Then the bound, amortized, and its matching lower bound.
export function AlphaBound({ t }: StepCtx) {
  const ax = easeOut(seg(t, 0.1, 0.5));
  const Y = (v: number) => 250 - v * 30;
  const LOG: Pt[] = Array.from({ length: 30 }, (_, i) => {
    const x = 62 + i * 4;
    return [x, Math.max(60, Y(Math.log2(1 + (x - 60) * 2.2) * 0.9))];
  });
  const ALPHA: Pt[] = [[60, Y(0)], [66, Y(0)], [66, Y(1)], [80, Y(1)], [80, Y(2)], [120, Y(2)], [120, Y(3)], [230, Y(3)], [230, Y(4)], [540, Y(4)]];
  return (
    <Svg label="As n grows to anything a machine could hold, log base two of n climbs off the chart while alpha of n takes four small steps and stays under the dashed line at five" h={340}>
      <g opacity={ax}>
        <line x1={60} y1={250} x2={545} y2={250} stroke={C.mocha} strokeWidth={1.2} />
        <line x1={60} y1={60} x2={60} y2={250} stroke={C.mocha} strokeWidth={1.2} />
        <T x={545} y={272} s={12} f={C.latte} a="end">n, up to any n a machine holds</T>
      </g>
      <Draw pts={LOG} t={t} from={0.4} to={1.3} stroke={C.cinnamon} w={2} pen={false} />
      <T x={190} y={74} s={12} f={C.cinnamon} o={easeOut(seg(t, 1.2, 1.5))}>log₂ n: off the top</T>
      <Draw pts={ALPHA} t={t} from={1.5} to={2.8} stroke={C.caramel} w={2.4} pen={false} />
      <T x={300} y={Y(4) - 10} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 2.9))}>α(n)</T>
      <line x1={60} y1={Y(5)} x2={545} y2={Y(5)} stroke={C.crema} strokeWidth={1.2} strokeDasharray="5 5" opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={545} y={Y(5) - 8} s={12} f={C.crema} a="end" o={easeOut(seg(t, 2.8, 3.1))}>less than 5</T>
      <T x={30} y={302} s={13} f={C.caramel} o={easeOut(seg(t, 3.3, 3.7))}>O(α(n)) amortized: rank + compression</T>
      <T x={30} y={326} s={12} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>lower bound Ω(α(n)): no pointer trick beats it</T>
    </Svg>
  );
}

// The chapter-10 graph, undirected, and its ten edges sorted by weight (a stable sort, as examples.py's).
const GV: Record<string, Pt> = { A: [70, 80], B: [210, 60], C: [120, 170], D: [250, 170], E: [170, 255], F: [290, 255] };
const SORTED: [string, string, number][] = [['C', 'D', 1], ['A', 'C', 2], ['D', 'E', 2], ['B', 'C', 3], ['E', 'F', 3], ['A', 'B', 4], ['B', 'D', 5], ['C', 'E', 6], ['A', 'B', 7], ['D', 'F', 8]];
const MERGES = 5; // the first five sorted edges merge; the other five find their ends already together

// 8 · Three uses. Kruskal: the sorted edges, one at a time: the first five join different sets (drawn bold, a tick),
// the last five find both ends already together (a red flash, a cross). The same calls read as "which component";
// the same calls on match decisions cluster records. Then a cut is tried on a merged edge: no Split.
export function ThreeUses({ t }: StepCtx) {
  const at = (i: number) => 0.3 + i * 0.3;
  const comp = easeOut(seg(t, 3.4, 3.8));
  const cut = easeOut(seg(t, 4.4, 4.8));
  const key = (u: string, v: string) => [u, v].sort().join('');
  const BASE = [['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'E'], ['D', 'F'], ['E', 'F']];
  const merged = (u: string, v: string) => SORTED.slice(0, MERGES).some(([a, b], i) => key(a, b) === key(u, v) && t >= at(i) + 0.15);
  const flash = (u: string, v: string) => SORTED.some(([a, b], i) => i >= MERGES && key(a, b) === key(u, v) && t >= at(i) && t < at(i) + 0.3);
  return (
    <Svg label="Kruskal's order on the ten edges: C-D, A-C, D-E, B-C and E-F merge sets; A-B, B-D, C-E, A-B again and D-F find their ends already together; the same calls read as components and as entity clusters, with no Split" h={350}>
      {BASE.map(([u, v]) => {
        const m = merged(u, v);
        const f = flash(u, v);
        return <line key={u + v} x1={GV[u][0]} y1={GV[u][1]} x2={GV[v][0]} y2={GV[v][1]} stroke={m ? C.caramel : f ? C.cherryText : C.mocha} strokeWidth={m ? 2.6 : f ? 2 : 1.2} strokeDasharray={m ? undefined : '4 4'} />;
      })}
      <ellipse cx={180} cy={158} rx={150} ry={128} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={comp} />
      {Object.entries(GV).map(([v, [x, y]]) => <Node key={v} x={x} y={y} label={v} s={13} />)}
      {SORTED.map(([u, v, w], i) => {
        const on = t >= at(i);
        const ok = i < MERGES;
        return (
          <g key={i} opacity={on ? 1 : 0.35}>
            <T x={350} y={40 + i * 24} s={13} f={on ? C.crema : C.latte}>{u}–{v} {w}</T>
            {on && <T x={430} y={40 + i * 24} s={12} f={ok ? C.caramel : C.cherryText}>{ok ? '✓ merge' : '× together'}</T>}
          </g>
        );
      })}
      <g opacity={cut}>
        <line x1={84} y1={112} x2={106} y2={138} stroke={C.cherryText} strokeWidth={2.4} />
        <line x1={106} y1={112} x2={84} y2={138} stroke={C.cherryText} strokeWidth={2.4} />
      </g>
      <T x={30} y={296} s={12} f={C.cinnamon} o={comp}>same Find: which component is F in?</T>
      <T x={30} y={318} s={12} f={C.crema} o={easeOut(seg(t, 3.9, 4.3))}>a match decision is a Union: clusters</T>
      <T x={30} y={340} s={12} f={C.cherryText} o={cut}>no Split: a merge cannot be cut back out</T>
    </Svg>
  );
}

// 9 · Recap. Five rows come alive in turn: three operations (two records hang under a root); the doubling (1, 2, 4);
// compression (a chain swings to a star); alpha (a flat line under the dashed five); and one door that only swings
// one way (the up arrow stays, the down arrow is struck).
export function Recap({ t }: StepCtx) {
  const r = (i: number) => easeInOut(seg(t, 0.2 + i * 0.6, 0.7 + i * 0.6));
  const Y = (i: number) => 46 + i * 58;
  const txt = ['three names', 'rank: height ≤ log₂ n', 'compression: pays forward', 'α(n): under five', 'no Split: one way only'];
  const sw = r(2);
  return (
    <Svg label="Recap rows: the three operations, rank's doubling, compression's chain collapsing to a star, alpha under five, and the one-way parent pointer" h={320}>
      {txt.map((s, i) => (
        <T key={i} x={190} y={Y(i) + 5} s={14} f={i === 4 ? C.cherryText : C.crema} o={easeOut(seg(t, 0.3 + i * 0.6, 0.6 + i * 0.6))}>{s}</T>
      ))}
      <g opacity={easeOut(seg(t, 0.2, 0.4))}>
        <circle cx={90} cy={Y(0) - 8} r={6} fill="none" stroke={C.crema} strokeWidth={1.4} />
        {[0, 1].map((j) => {
          const x = lerp(50 + j * 80, 70 + j * 40, r(0));
          const y = lerp(Y(0) - 8, Y(0) + 14, r(0));
          return (
            <g key={j}>
              <circle cx={x} cy={y} r={6} fill="none" stroke={C.crema} strokeWidth={1.4} />
              {r(0) > 0.6 && <line x1={x} y1={y - 6} x2={90} y2={Y(0) - 2} stroke={C.caramel} strokeWidth={1.3} />}
            </g>
          );
        })}
      </g>
      <g opacity={easeOut(seg(t, 0.8, 1.0))}>
        {[1, 2, 4].map((w, j) => (
          <rect key={j} x={40 + [0, 14, 42][j]} y={Y(1) - 6} width={w * 12 - 2} height={12} rx={2} fill={j === Math.min(2, Math.floor(r(1) * 3)) ? C.caramel : C.mocha} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 1.4, 1.6))}>
        <circle cx={140} cy={Y(2) - 14} r={5} fill={C.caramel} />
        {[0, 1, 2, 3].map((j) => {
          const x = lerp(40 + j * 25, 50 + j * 25, sw);
          const y = lerp(Y(2) + 14 - j * 7, Y(2) + 14, sw);
          const nx = j === 3 ? 140 : lerp(40 + (j + 1) * 25, 140, sw);
          const ny = j === 3 ? Y(2) - 14 : lerp(Y(2) + 14 - (j + 1) * 7, Y(2) - 14, sw);
          return (
            <g key={j}>
              <line x1={x} y1={y} x2={nx} y2={ny} stroke={C.crema} strokeWidth={1.1} />
              <circle cx={x} cy={y} r={4} fill={C.roast} stroke={C.crema} strokeWidth={1.2} />
            </g>
          );
        })}
      </g>
      <g opacity={easeOut(seg(t, 2.0, 2.2))}>
        <line x1={40} y1={Y(3) - 10} x2={150} y2={Y(3) - 10} stroke={C.crema} strokeDasharray="4 4" strokeWidth={1} />
        <Draw pts={[[40, Y(3) + 12], [52, Y(3) + 12], [52, Y(3) + 6], [70, Y(3) + 6], [70, Y(3)], [100, Y(3)], [100, Y(3) - 4], [150, Y(3) - 4]]} t={t} from={2.0} to={2.6} stroke={C.caramel} w={2} pen={false} />
      </g>
      <g opacity={easeOut(seg(t, 2.6, 2.8))}>
        <Ptr x1={70} y1={Y(4) + 16} x2={70} y2={Y(4) - 16} r={0} c={C.caramel} w={2} />
        <Ptr x1={120} y1={Y(4) - 16} x2={120} y2={Y(4) + 16} r={0} c={C.latte} w={1.4} o={0.6} />
        <g opacity={r(4)}>
          <line x1={108} y1={Y(4) - 10} x2={132} y2={Y(4) + 10} stroke={C.cherryText} strokeWidth={2.2} />
          <line x1={132} y1={Y(4) - 10} x2={108} y2={Y(4) + 10} stroke={C.cherryText} strokeWidth={2.2} />
        </g>
      </g>
    </Svg>
  );
}

// 10 · Predict. Records 0 and 1 merge on a match that turns out wrong (1 under 0), then 2 joins the same cluster
// (2 under 0, rank's choice). Can you take the first merge back? After answering: a Split call is struck out; the
// pointers only ever point up. Then the rebuild: the corrected pairs (drop 0-1, keep 1-2) build a fresh forest:
// 2 under 1, 0 and 3 alone.
export function ProveIt({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const u1 = easeInOut(seg(t, 0.2, 0.7));
  const u2 = easeInOut(seg(t, 0.8, 1.3));
  const START: Pt[] = [[60, 110], [125, 110], [190, 110], [255, 110]];
  const END: Pt[] = [[115, 80], [70, 160], [160, 160], [240, 80]];
  const pos = (i: number): Pt => {
    const k = i === 1 ? u1 : i === 2 ? u2 : i === 0 ? u1 : 0;
    return [lerp(START[i][0], END[i][0], k), lerp(START[i][1], END[i][1], k)];
  };
  const struck = answered ? easeOut(seg(s, 0.3, 0.6)) : 0;
  const rebuild = answered ? easeOut(seg(s, 1.4, 1.8)) : 0;
  const link2 = answered ? easeInOut(seg(s, 1.9, 2.4)) : 0;
  return (
    <Svg label="Records 0 and 1 merged on a wrong match, then 2 joined them; no Split call exists, since every pointer only points up; the fix rebuilds a fresh forest from the corrected pairs, 2 under 1, with 0 and 3 alone" h={330}>
      <T x={30} y={26} s={12} f={C.latte}>the clustered records</T>
      {u1 > 0.5 && <Ptr x1={pos(1)[0]} y1={pos(1)[1]} x2={pos(0)[0]} y2={pos(0)[1]} c={C.cherryText} o={(u1 - 0.5) * 2} />}
      {u2 > 0.5 && <Ptr x1={pos(2)[0]} y1={pos(2)[1]} x2={pos(0)[0]} y2={pos(0)[1]} o={(u2 - 0.5) * 2} />}
      {[0, 1, 2, 3].map((i) => <Node key={i} x={pos(i)[0]} y={pos(i)[1]} label={i} c={i === 0 || i === 1 ? (u1 > 0.5 ? C.cherryText : C.crema) : C.crema} />)}
      <T x={30} y={204} s={12} f={C.cherryText} o={easeOut(seg(t, 0.6, 0.9))}>0–1: the wrong match</T>
      {!answered && <T x={30} y={270} s={15} f={C.cherryText} o={pulse}>take that merge back?</T>}
      {answered && (
        <g opacity={easeOut(seg(s, 0.1, 0.3))}>
          <T x={30} y={236} s={13} f={C.crema}>Split(0, 1)</T>
          <line x1={26} y1={231} x2={30 + 10 * 9.5} y2={231} stroke={C.cherryText} strokeWidth={2} opacity={struck} />
          <T x={30} y={258} s={12} f={C.latte} o={easeOut(seg(s, 0.7, 1.0))}>no such call: pointers only point up</T>
        </g>
      )}
      <g opacity={rebuild}>
        <line x1={300} y1={40} x2={300} y2={220} stroke={C.mocha} strokeWidth={1} />
        <T x={320} y={26} s={12} f={C.latte}>rebuilt from corrected pairs</T>
        <T x={320} y={52} s={12} f={C.latte}>0–1 drop</T>
        <line x1={318} y1={48} x2={394} y2={48} stroke={C.cherryText} strokeWidth={1.6} />
        <T x={420} y={52} s={12} f={C.caramel}>1–2 keep</T>
        {link2 > 0.5 && <Ptr x1={360} y1={lerp(110, 170, link2)} x2={360} y2={110} c={C.caramel} o={(link2 - 0.5) * 2} />}
        <Node x={360} y={110} label={1} />
        <Node x={lerp(420, 360, link2)} y={lerp(110, 170, link2)} label={2} />
        <Node x={470} y={110} label={0} />
        <Node x={530} y={110} label={3} />
      </g>
      <T x={30} y={300} s={13} f={C.caramel} o={answered ? easeOut(seg(s, 2.4, 2.8)) : 0}>the fix is a rebuild, not a call</T>
    </Svg>
  );
}
