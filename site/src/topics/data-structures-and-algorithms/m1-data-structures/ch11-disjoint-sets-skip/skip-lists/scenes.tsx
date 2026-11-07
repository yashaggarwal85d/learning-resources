import { useEffect, useState, type ReactElement } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's shared language): crema = an element, node or stored entry; latte =
// secondary labels; caramel = the thing to look at (the search path, the node being linked in); cinnamon (rare) = the
// alternative being compared, always p = 1/4 against p = 1/2 (and a reader moving through); cherryText = the bad
// outcome (a rotation's several pointers changing together, a missing backward link).
// The sixteen-key picture is examples.py's own seeded run: keys 3..66, tower heights [3,2,3,6,3,1,1,2,2,5,2,1,2,4,3,3],
// drawn as shape. Printed numbers are examples.py's prints: promotion 0.2509 / 0.4990, pointers per entry 1.3358 /
// 1.9971, average search steps 26.29 / 28.76 against Pugh's bound 29.91 / 30.58 at n = 20,000. Spans on the picture
// are counted from the drawn picture itself. "Less than one in a million" past 250 elements is Pugh's, quoted in
// SOURCES.md.

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
const KEYS = [3, 7, 9, 12, 19, 22, 27, 31, 36, 40, 44, 48, 52, 57, 61, 66];
const H = [3, 2, 3, 6, 3, 1, 1, 2, 2, 5, 2, 1, 2, 4, 3, 3];
const LEVELS = 6;
const PX = (i: number) => 70 + i * 31; // column of key i; the head sits at x = 36
const HEAD_X = 36;

/** The next column after i (i = -1 is the head) whose tower reaches level l, or -1. */
function nextAt(hs: number[], i: number, l: number) {
  for (let j = i + 1; j < hs.length; j++) if (hs[j] > l) return j;
  return -1;
}

function Arrow({ x1, x2, y, c = C.mocha, w = 1.2, o = 1 }: { x1: number; x2: number; y: number; c?: string; w?: number; o?: number }) {
  return (
    <g opacity={o}>
      <line x1={x1} y1={y} x2={x2 - 2} y2={y} stroke={c} strokeWidth={w} />
      <path d={`M ${x2} ${y} l -6 -3.5 l 0 7 z`} fill={c} />
    </g>
  );
}

/** One tower cell: the key's own box on level 0, a small square above. */
function Cell({ x, y, l, k, c = C.crema, o = 1 }: { x: number; y: number; l: number; k?: number; c?: string; o?: number }) {
  if (l === 0)
    return (
      <g opacity={o}>
        <rect x={x - 12} y={y - 9} width={24} height={18} rx={3} fill={C.roast} stroke={c} strokeWidth={1.3} />
        {k !== undefined && <T x={x} y={y + 4} s={12} f={c} a="middle">{k}</T>}
      </g>
    );
  return <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={C.roast} stroke={c} strokeWidth={1.3} opacity={o} />;
}

/** The skip list: head column, towers, and every forward pointer. */
function Pic({ base, gap, X = PX, keys = KEYS, hs = H, towerO, cellC, linkC, linksO = 1 }: { base: number; gap: number; X?: (i: number) => number; keys?: number[]; hs?: number[]; towerO?: (i: number, l: number) => number; cellC?: (i: number, l: number) => string; linkC?: (from: number, l: number) => string; linksO?: number }) {
  const Y = (l: number) => base - l * gap;
  const links: ReactElement[] = [];
  for (let l = 0; l < LEVELS; l++) {
    for (let i = -1; i < keys.length; i++) {
      if (i >= 0 && hs[i] <= l) continue;
      const j = nextAt(hs, i, l);
      if (j < 0) continue;
      const x1 = (i < 0 ? HEAD_X : X(i)) + (l === 0 && i >= 0 ? 12 : 6);
      const x2 = X(j) - (l === 0 ? 12 : 6);
      links.push(<Arrow key={`${l}-${i}`} x1={x1} x2={x2} y={Y(l)} c={linkC ? linkC(i, l) : C.mocha} o={linksO} />);
    }
  }
  return (
    <g>
      {Array.from({ length: LEVELS }, (_, l) => (
        <rect key={`h${l}`} x={HEAD_X - 6} y={Y(l) - 6} width={12} height={12} rx={2} fill={C.mocha} />
      ))}
      {links}
      {keys.map((k, i) =>
        Array.from({ length: hs[i] }, (_, l) => <Cell key={`${i}-${l}`} x={X(i)} y={Y(l)} l={l} k={k} c={cellC ? cellC(i, l) : C.crema} o={towerO ? towerO(i, l) : 1} />),
      )}
    </g>
  );
}

/** A marker moving along a polyline of points, k in 0..1 of its length. */
function along(pts: Pt[], k: number): Pt {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = clamp(k) * lens[lens.length - 1];
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] >= goal) {
      const f = (goal - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
      return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    }
  }
  return pts[pts.length - 1];
}

/** A coin mid-flip: it squashes and shows H or T. */
function Coin({ x, y, face, spin = 0 }: { x: number; y: number; face: 'H' | 'T'; spin?: number }) {
  const sx = Math.max(0.08, Math.abs(Math.cos(spin * Math.PI * 3)));
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <circle r={16} fill={C.roast} stroke={face === 'H' ? C.caramel : C.latte} strokeWidth={1.8} />
      {sx > 0.5 && <T x={0} y={5} s={13} f={face === 'H' ? C.caramel : C.latte} a="middle">{face}</T>}
    </g>
  );
}

// 1 · A sorted buffer with no lock on reads. A sorted list takes a new key while a reader moves along it. A tree
// rotates: three pointers change at once, and a reader caught in the middle sees nonsense. Then a coin decides one
// key's tower height, once.
export function Hook({ t }: StepCtx) {
  const list = easeOut(seg(t, 0.1, 0.4));
  const drop = easeInOut(seg(t, 0.6, 1.1));
  const LK = [3, 7, 9, 12, 19, 27, 31];
  const LX = (j: number) => 40 + j * 54;
  const slotOf = (j: number) => (j >= 5 ? j + drop : j);
  const reader = clamp(seg(t, 0.2, 1.6));
  const tree = easeOut(seg(t, 1.6, 1.9));
  const rot = easeInOut(seg(t, 2.1, 2.7));
  // Right rotation at 12: before 12 over 7 over 3; after 7 over 3 and 12.
  const p12: Pt = [lerp(180, 190, rot), lerp(140, 190, rot)];
  const p7: Pt = [lerp(140, 140, rot), lerp(185, 140, rot)];
  const p3: Pt = [lerp(100, 90, rot), lerp(230, 190, rot)];
  const mid = rot > 0.05 && rot < 0.95;
  const coinIn = easeOut(seg(t, 3.0, 3.2));
  const flip = seg(t, 3.1, 3.6);
  const tower = (l: number) => easeOut(seg(t, 3.5 + l * 0.15, 3.65 + l * 0.15));
  return (
    <Svg label="A sorted list takes a new key while a reader moves along it; a balanced tree's rotation changes three pointers at once and a reader caught mid-way sees a broken shape; a coin then fixes one key's tower height, once" h={320}>
      <g opacity={list}>
        <T x={40} y={26} s={12} f={C.latte}>a write buffer: sorted, written and read at once</T>
        {LK.map((k, j) => (
          <g key={k}>
            <Cell x={LX(slotOf(j))} y={56} l={0} k={k} />
            {j < LK.length - 1 && <Arrow x1={LX(slotOf(j)) + 12} x2={LX(slotOf(j + 1)) - 12} y={56} o={j === 4 ? 1 - drop : 1} />}
          </g>
        ))}
        <Cell x={LX(5)} y={lerp(10, 56, drop)} l={0} k={22} c={C.caramel} o={drop > 0.001 ? 1 : 0} />
        {drop >= 1 && <Arrow x1={LX(4) + 12} x2={LX(5) - 12} y={56} c={C.caramel} />}
        {drop >= 1 && <Arrow x1={LX(5) + 12} x2={LX(6) - 12} y={56} c={C.caramel} />}
        <circle cx={lerp(LX(0), LX(7), reader)} cy={56} r={15} fill="none" stroke={C.cinnamon} strokeWidth={1.6} opacity={t < 1.7 ? 1 : 0.3} />
      </g>
      <g opacity={tree}>
        <T x={40} y={112} s={12} f={C.latte}>a rotation: 3 pointers at once</T>
        <line x1={p12[0]} y1={p12[1]} x2={p7[0]} y2={p7[1]} stroke={mid ? C.cherryText : C.crema} strokeWidth={1.6} />
        <line x1={p7[0]} y1={p7[1]} x2={p3[0]} y2={p3[1]} stroke={mid ? C.cherryText : C.crema} strokeWidth={1.6} />
        {[[12, p12], [7, p7], [3, p3]].map(([k, p]) => (
          <g key={k as number}>
            <circle cx={(p as Pt)[0]} cy={(p as Pt)[1]} r={13} fill={C.roast} stroke={mid ? C.cherryText : C.crema} strokeWidth={1.5} />
            <T x={(p as Pt)[0]} y={(p as Pt)[1] + 4} s={12} f={mid ? C.cherryText : C.crema} a="middle">{k as number}</T>
          </g>
        ))}
        {t >= 2.1 && <circle cx={p7[0]} cy={p7[1]} r={19} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />}
        <T x={40} y={252} s={12} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.7))}>a reader mid-way sees nonsense</T>
      </g>
      <g opacity={coinIn}>
        <T x={340} y={112} s={12} f={C.latte}>instead: one coin, once</T>
        <Coin x={360} y={170} face={flip < 1 ? (Math.floor(flip * 6) % 2 ? 'T' : 'H') : 'T'} spin={flip} />
        {[0, 1, 2].map((l) => (
          <Cell key={l} x={440} y={226 - l * 28} l={l} k={22} c={C.caramel} o={tower(l)} />
        ))}
      </g>
      <T x={40} y={296} s={13} f={C.caramel} o={easeOut(seg(t, 3.9, 4.3))}>no rotation: the height is never touched again</T>
    </Svg>
  );
}

// 2 · Towers by coin flip. Level zero, the sorted list, appears. Then each key flips: heads climbs one level, tails
// stops it (the coin shown for the first three keys, the rest quicker). The forward pointers on every level follow.
export function Towers({ t }: StepCtx) {
  const BASE = 250;
  const GAP = 30;
  const base = easeOut(seg(t, 0.1, 0.5));
  const startAt = (i: number) => (i < 3 ? 0.8 + i * 0.55 : 2.45 + (i - 3) * 0.08);
  const step = (i: number) => (i < 3 ? 0.13 : 0.03);
  const towerO = (i: number, l: number) => (l === 0 ? base : t >= startAt(i) + l * step(i) ? 1 : 0);
  const cur = [0, 1, 2].find((i) => t >= startAt(i) && t < startAt(i) + 0.5);
  let face: 'H' | 'T' = 'H';
  if (cur !== undefined) {
    const f = Math.floor((t - startAt(cur)) / step(cur));
    face = f < H[cur] - 1 ? 'H' : 'T';
  }
  return (
    <Svg label="The sorted list on level zero, then each key's tower climbing one level per heads and stopping on tails, then the forward pointers along every level" h={330}>
      <T x={30} y={24} s={12} f={C.latte}>heads: climb a level &middot; tails: stop</T>
      <Pic base={BASE} gap={GAP} towerO={towerO} cellC={(i, l) => (cur === i && l > 0 ? C.caramel : C.crema)} linksO={0} />
      {KEYS.map((_, i) => i < KEYS.length - 1 && <Arrow key={i} x1={PX(i) + 12} x2={PX(i + 1) - 12} y={BASE} o={base} />)}
      <g opacity={easeOut(seg(t, 3.4, 3.8))}>
        <Pic base={BASE} gap={GAP} towerO={() => 0} />
      </g>
      {cur !== undefined && <Coin x={540} y={40} face={face} spin={((t - startAt(cur)) % step(cur)) / step(cur) / 3} />}
      <T x={30} y={278} s={12} f={C.latte} o={base}>level 0: just the sorted list</T>
      <T x={30} y={304} s={13} f={C.caramel} o={easeOut(seg(t, 3.7, 4.1))}>no look at n, no look at any other tower</T>
    </Svg>
  );
}

// 3 · Predict. Level one, all of them; level two, half (the coin is fair). Level three: what share of level two?
// After answering: level three grows to half of level two, and so on up; a fresh coin flips beside it; the measured
// promotion fraction at p = 1/2, 0.4990.
export function Promotion({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const W = 400;
  const g1 = easeOut(seg(t, 0.1, 0.5));
  const g2 = easeOut(seg(t, 0.5, 0.9));
  const g3 = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const g4 = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  const Y = (l: number) => 50 + l * 46;
  return (
    <Svg label="Level one holds every entry, level two half of them; after answering, level three holds half of level two and level four half again, each a fresh flip; measured fraction 0.4990 at p one half" h={300}>
      {[['level 1', W * g1, 'all'], ['level 2', (W / 2) * g2, '½'], ['level 3', (W / 4) * g3, '½ again'], ['level 4', (W / 8) * g4, '½']].map(([lab, w, note], l) => (
        <g key={l}>
          <T x={30} y={Y(l) + 14} s={12} f={C.latte}>{lab as string}</T>
          <rect x={120} y={Y(l)} width={w as number} height={20} rx={2} fill={l === 2 && answered ? C.caramel : C.crema} opacity={l === 2 && answered ? 1 : 0.85} />
          {(w as number) > 4 && <T x={120 + (w as number) + 10} y={Y(l) + 14} s={12} f={l === 2 ? C.caramel : C.latte}>{note as string}</T>}
        </g>
      ))}
      {!answered && (
        <g opacity={pulse}>
          <rect x={120} y={Y(2)} width={100} height={20} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 4" />
          <T x={232} y={Y(2) + 15} s={15} f={C.cherryText}>?</T>
        </g>
      )}
      {answered && <Coin x={420} y={Y(2) + 10} face="H" spin={clamp(seg(s, 0.2, 0.9))} />}
      {answered && <T x={30} y={244} s={12} f={C.caramel} o={easeOut(seg(s, 0.9, 1.2))}>each climb is a fresh flip: no memory</T>}
      {answered && <T x={30} y={272} s={13} f={C.crema} o={easeOut(seg(s, 1.3, 1.6))}>measured at p = 1/2: 0.4990</T>}
    </Svg>
  );
}

// 4 · The geometric tower, and its price. The same staircase twice: p = 1/4 shrinks four-fold per level, p = 1/2
// two-fold. Measured: 0.2509 and 0.4990 of each level climb on. Pointers per entry: 1.3358 and 1.9971.
export function GeometricPrice({ t }: StepCtx) {
  const W = 220;
  const lv = (l: number) => easeOut(seg(t, 0.3 + l * 0.25, 0.6 + l * 0.25));
  const meas = easeOut(seg(t, 1.9, 2.3));
  const ptr = easeOut(seg(t, 3.0, 3.6));
  const PANEL = [
    { x: 30, p: 0.25, lab: 'p = 1/4', c: C.cinnamon, keep: '0.2509', per: 1.3358 },
    { x: 320, p: 0.5, lab: 'p = 1/2', c: C.crema, keep: '0.4990', per: 1.9971 },
  ];
  return (
    <Svg label="Two staircases of levels: at p one quarter each level keeps a quarter, measured 0.2509, at 1.3358 pointers per entry; at p one half each keeps half, measured 0.4990, at 1.9971 pointers per entry" h={320}>
      {PANEL.map((P) => (
        <g key={P.lab}>
          <T x={P.x} y={28} s={13} f={P.c}>{P.lab}</T>
          {[0, 1, 2, 3, 4].map((l) => (
            <rect key={l} x={P.x} y={44 + l * 26} width={Math.max(2, W * P.p ** l) * lv(l)} height={18} rx={2} fill={P.c} opacity={0.85} />
          ))}
          <T x={P.x} y={196} s={12} f={P.c} o={meas}>keeps {P.keep} per level</T>
          <rect x={P.x} y={232} width={P.per * 80 * ptr} height={14} rx={2} fill={P.c} />
          <T x={P.x} y={268} s={12} f={P.c} o={ptr}>{P.per.toFixed(4)} pointers / entry</T>
        </g>
      ))}
      <T x={30} y={304} s={13} f={C.caramel} o={easeOut(seg(t, 3.8, 4.2))}>a little over one pointer each, at 1/4</T>
    </Svg>
  );
}

// The search for 48 on the picture, as (column, level) stops; column -1 is the head.
const PATH48: [number, number][] = [[-1, 5], [3, 5], [3, 4], [9, 4], [9, 3], [9, 2], [9, 1], [10, 1], [10, 0], [11, 0]];
// LevelDB's Prev() from 44: a fresh search for the last key below 44 ends on 40.
const PATH_PREV: [number, number][] = [[-1, 5], [3, 5], [3, 4], [9, 4], [9, 3], [9, 2], [9, 1], [9, 0]];

// 5 · A search, traced. Find 48: from the head's top level, go right while the next key is below 48, otherwise drop a
// level; the path drawn as it goes, the current move named underneath.
export function SearchTrace({ t }: StepCtx) {
  const BASE = 240;
  const GAP = 30;
  const pts: Pt[] = PATH48.map(([i, l]) => [i < 0 ? HEAD_X : PX(i), BASE - l * GAP]);
  const k = seg(t, 0.4, 3.4);
  const seg_i = Math.min(PATH48.length - 2, Math.floor(k * (PATH48.length - 1)));
  const moveRight = PATH48[seg_i + 1][0] !== PATH48[seg_i][0];
  const done = t >= 3.4;
  const at = along(pts, k);
  return (
    <Svg label="Searching for 48: from the head's top level the path moves right while the next key is smaller and drops a level otherwise, through 12, 40 and 44 down to 48" h={320}>
      <T x={30} y={26} s={12} f={C.latte}>find 48</T>
      <Pic base={BASE} gap={GAP} cellC={(i, l) => (done && i === 11 ? C.caramel : C.crema)} />
      <Draw pts={pts} t={t} from={0.4} to={3.4} stroke={C.caramel} w={2.2} pen={false} />
      {t >= 0.4 && <circle cx={at[0]} cy={at[1]} r={10} fill="none" stroke={C.caramel} strokeWidth={2} />}
      {t >= 0.4 && !done && (
        <T x={30} y={284} s={13} f={C.caramel}>{moveRight ? 'right: the next key is below 48' : 'down: the next key is not below 48'}</T>
      )}
      {done && <T x={30} y={284} s={13} f={C.caramel}>found 48</T>}
      <T x={30} y={310} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.8))}>every search: right, or down, until no levels are left</T>
    </Svg>
  );
}

// 6 · Predict. Twenty thousand entries; on a log axis, the three guesses: 20, 200, 2,000. After answering: the two
// measured averages drop onto the axis, both next to 20: 26.29 at p = 1/4, 28.76 at p = 1/2.
export function SearchCount({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const AX = (v: number) => 60 + ((Math.log10(v) - 1) / 3) * 480;
  const d1 = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const d2 = answered ? easeOut(seg(s, 0.5, 1.0)) : 0;
  const a = easeOut(seg(t, 0.1, 0.5));
  return (
    <Svg label="A log axis from ten to ten thousand with the guesses twenty, two hundred and two thousand; after answering, the measured averages 26.29 and 28.76 both land next to twenty" h={280}>
      <T x={30} y={26} s={13} f={C.crema} o={a}>20,000 entries: steps per search?</T>
      <line x1={60} y1={130} x2={540} y2={130} stroke={C.mocha} strokeWidth={1.4} opacity={a} />
      {[20, 200, 2000].map((v) => (
        <g key={v} opacity={a}>
          <line x1={AX(v)} y1={122} x2={AX(v)} y2={138} stroke={C.latte} strokeWidth={1.4} />
          <T x={AX(v)} y={160} s={13} f={C.latte} a="middle">{v.toLocaleString('en-US')}</T>
        </g>
      ))}
      {!answered && <T x={30} y={220} s={15} f={C.cherryText} o={pulse}>twenty, two hundred, or two thousand?</T>}
      {answered && (
        <>
          <circle cx={AX(26.29)} cy={lerp(60, 130, d1)} r={6} fill={C.cinnamon} opacity={d1} />
          <circle cx={AX(28.76)} cy={lerp(60, 130, d2)} r={6} fill="none" stroke={C.crema} strokeWidth={2} opacity={d2} />
          <T x={30} y={204} s={13} f={C.cinnamon} o={easeOut(seg(s, 0.8, 1.1))}>p = 1/4: 26.29 steps</T>
          <T x={30} y={228} s={13} f={C.crema} o={easeOut(seg(s, 1.0, 1.3))}>p = 1/2: 28.76 steps</T>
          <T x={30} y={258} s={12} f={C.caramel} o={easeOut(seg(s, 1.4, 1.7))}>around twenty: the logarithm at work</T>
        </>
      )}
    </Svg>
  );
}

// 7 · The bound, and why one in four. Measured averages against Pugh's ceiling at n = 20,000: 26.29 under 29.91 at
// p = 1/4, 28.76 under 30.58 at p = 1/2; the lower ceiling is 1/4's. Then the tail: past 250 elements, a search
// three times its expected cost is under one in a million.
export function Bound({ t }: StepCtx) {
  const U = 15; // units per step
  const g = easeOut(seg(t, 0.3, 1.2));
  const ceil = easeOut(seg(t, 1.3, 1.7));
  const low = easeOut(seg(t, 2.2, 2.6));
  const tail = easeOut(seg(t, 3.2, 3.6));
  const ROWS = [
    { y: 56, lab: 'p = 1/4', c: C.cinnamon, m: 26.29, b: 29.91 },
    { y: 128, lab: 'p = 1/2', c: C.crema, m: 28.76, b: 30.58 },
  ];
  const curve: Pt[] = Array.from({ length: 41 }, (_, i) => {
    const x = 60 + i * 12;
    const u = i / 10;
    return [x, 290 - 60 * Math.exp(-((u - 1) ** 2) * 2.2)];
  });
  return (
    <Svg label="Measured average search steps 26.29 and 28.76 sit under Pugh's ceilings 29.91 and 30.58; the quarter coin's ceiling is lower; a cost curve's far tail at three times expected is under one in a million" h={330}>
      {ROWS.map((r) => (
        <g key={r.lab}>
          <T x={30} y={r.y - 8} s={12} f={r.c}>{r.lab}: {r.m} measured, ceiling {r.b}</T>
          <rect x={30} y={r.y} width={r.m * U * g} height={18} rx={2} fill={r.c} opacity={0.85} />
          <line x1={30 + r.b * U} y1={r.y - 4} x2={30 + r.b * U} y2={r.y + 22} stroke={r.lab === 'p = 1/4' && low > 0 ? C.caramel : C.latte} strokeWidth={2} opacity={ceil} />
        </g>
      ))}
      <T x={30} y={186} s={12} f={C.caramel} o={low}>the 1/4 coin&apos;s ceiling sits lower</T>
      <g opacity={tail}>
        <line x1={60} y1={290} x2={545} y2={290} stroke={C.mocha} strokeWidth={1.2} />
        <path d={`M ${curve.map((p) => p.join(' ')).join(' L ')}`} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <line x1={60 + 30 * 12} y1={232} x2={60 + 30 * 12} y2={290} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 4" />
        <T x={60 + 10 * 12} y={306} s={12} f={C.latte} a="middle">expected</T>
        <T x={60 + 30 * 12} y={306} s={12} f={C.cherryText} a="middle">3×</T>
        <T x={30} y={222} s={12} f={C.cherryText}>past 250 entries: under one in a million</T>
      </g>
    </Svg>
  );
}

// 8 · Why a reader never sees a broken list. Insert 50 (a tower of three): the gap opens after 48, the tower rises,
// and its three predecessors (48 on level 0, 44 on level 1, 40 on level 2) are found. Then one pointer is written per
// level, one at a time: a reader passing through sees the old link or the new one, never half of one.
export function Splice({ t }: StepCtx) {
  const BASE = 236;
  const GAP = 30;
  const open = easeInOut(seg(t, 0.2, 0.7));
  const X17 = (i: number) => 64 + i * 29;
  const keys = [...KEYS.slice(0, 12), 50, ...KEYS.slice(12)];
  const writeAt = [1.5, 2.1, 2.7];
  const writes = writeAt.filter((w) => t >= w).length;
  const hs = [...H.slice(0, 12), writes, ...H.slice(12)];
  const X = (i: number) => (i < 12 ? X17(i) : i === 12 ? X17(12) : lerp(X17(i - 1), X17(i), open));
  const rise = (l: number) => easeOut(seg(t, 0.7 + l * 0.15, 0.85 + l * 0.15));
  const PRED: Record<number, number> = { 0: 11, 1: 10, 2: 9 };
  const reader = clamp(seg(t, 3.3, 4.6));
  const rx = lerp(HEAD_X, X17(16), reader);
  return (
    <Svg label="Inserting 50, a tower of three: one forward pointer is written per level it reaches, one at a time, from 48, 44 and 40; a reader passing along level zero sees the old or the new link, never a half-built one" h={330}>
      <T x={30} y={26} s={12} f={C.latte}>insert 50, a tower of three</T>
      <Pic base={BASE} gap={GAP} X={X} keys={keys} hs={hs} cellC={(i, l) => (l < 3 && PRED[l] === i && t >= 1.1 && t < 3.2 ? C.cinnamon : C.crema)} linkC={(i, l) => (l < 3 && (i === PRED[l] || i === 12) && writes > l ? C.caramel : C.mocha)} />
      {[0, 1, 2].map((l) => (l >= writes ? <Cell key={l} x={X17(12)} y={BASE - l * GAP} l={l} k={50} c={C.caramel} o={rise(l)} /> : null))}
      <T x={30} y={274} s={13} f={C.caramel} o={t >= 1.5 ? 1 : 0}>pointer writes: {writes}, one per level</T>
      {t >= 3.3 && <circle cx={rx} cy={BASE} r={14} fill="none" stroke={C.cinnamon} strokeWidth={1.8} />}
      <T x={30} y={300} s={12} f={C.cinnamon} o={easeOut(seg(t, 3.4, 3.8))}>a reader sees old or new, never half</T>
      <T x={30} y={322} s={12} f={C.cherryText} o={easeOut(seg(t, 4.0, 4.4))}>a tree rotation flips several at once</T>
    </Svg>
  );
}

// 9 · Two real systems. LevelDB's write buffer: a key is spliced in while two readers keep moving, never stopping.
// Redis's sorted sets: every pointer carries its span; rank(48) adds the spans along the search path: 4 + 6 + 1 + 1.
export function TwoSystems({ t }: StepCtx) {
  const top = easeOut(seg(t, 0.1, 0.4));
  const LK = [3, 7, 9, 12, 19, 27, 31, 36];
  const LX = (j: number) => 50 + j * 62;
  const drop = easeInOut(seg(t, 0.9, 1.4));
  const slot = (j: number) => (j >= 5 ? j + drop : j);
  const r1 = ((t * 0.35) % 1);
  const r2 = ((t * 0.35 + 0.5) % 1);
  const bot = easeOut(seg(t, 2.0, 2.4));
  const BASE = 316;
  const GAP = 22;
  const pts: Pt[] = PATH48.map(([i, l]) => [i < 0 ? HEAD_X : PX(i), BASE - l * GAP]);
  // The rightward hops of rank(48) and the span each pointer carries (columns skipped, counted on the picture).
  const HOPS: { from: number; to: number; l: number; span: number }[] = [
    { from: -1, to: 3, l: 5, span: 4 },
    { from: 3, to: 9, l: 4, span: 6 },
    { from: 9, to: 10, l: 1, span: 1 },
    { from: 10, to: 11, l: 0, span: 1 },
  ];
  const hop = (h: number) => easeOut(seg(t, 2.7 + h * 0.4, 3.0 + h * 0.4));
  return (
    <Svg label="A storage engine's write buffer takes a new key while two readers keep moving; an in-memory database stores each pointer's span, and the rank of 48 is the sum of spans along its search path, 4 plus 6 plus 1 plus 1, twelve" h={350}>
      <g opacity={top}>
        <T x={30} y={24} s={12} f={C.latte}>LevelDB memtable: readers take no lock</T>
        {LK.map((k, j) => (
          <g key={k}>
            <Cell x={LX(slot(j))} y={56} l={0} k={k} />
            {j < LK.length - 1 && <Arrow x1={LX(slot(j)) + 12} x2={LX(slot(j + 1)) - 12} y={56} o={j === 4 ? 1 - drop : 1} />}
          </g>
        ))}
        <Cell x={LX(5)} y={lerp(14, 56, drop)} l={0} k={22} c={C.caramel} o={drop > 0.001 ? 1 : 0} />
        {drop >= 1 && <Arrow x1={LX(4) + 12} x2={LX(5) - 12} y={56} c={C.caramel} />}
        {drop >= 1 && <Arrow x1={LX(5) + 12} x2={LX(6) - 12} y={56} c={C.caramel} />}
        {[r1, r2].map((r, i) => <circle key={i} cx={lerp(LX(0), LX(8), r)} cy={56} r={14} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />)}
      </g>
      <g opacity={bot}>
        <T x={30} y={118} s={12} f={C.latte}>Redis sorted set: each pointer stores its span</T>
        <Pic base={BASE} gap={GAP} />
        <Draw pts={pts} t={t} from={2.6} to={4.2} stroke={C.caramel} w={2} pen={false} />
        {HOPS.map((h, i) => {
          const x1 = h.from < 0 ? HEAD_X : PX(h.from);
          const x2 = PX(h.to);
          return <T key={i} x={(x1 + x2) / 2} y={BASE - h.l * GAP - 10} s={12} f={C.caramel} a="middle" o={hop(i)}>{h.span}</T>;
        })}
      </g>
      <T x={30} y={150} s={13} f={C.caramel} o={easeOut(seg(t, 4.2, 4.6))}>rank(48) = 4 + 6 + 1 + 1 = 12</T>
    </Svg>
  );
}

// 10 · Recap. Three things this structure never does are struck out in turn: rebalancing, repairing an invariant,
// recomputing after the fact. What it does instead: one coin per entry, once, while the readers keep moving.
export function Recap({ t }: StepCtx) {
  const NEVER = ['no rebalancing', 'no invariant to repair', 'nothing recomputed'];
  const coin = easeOut(seg(t, 2.0, 2.3));
  const flip = seg(t, 2.1, 2.6);
  const tower = (l: number) => easeOut(seg(t, 2.6 + l * 0.15, 2.75 + l * 0.15));
  const r = (t * 0.3) % 1;
  return (
    <Svg label="Rebalancing, invariant repair and recomputation each struck out; instead one coin flip per entry fixes its tower once, and readers keep moving" h={300}>
      {NEVER.map((n, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.5, 0.4 + i * 0.5));
        const w = n.length * 9.6;
        return (
          <g key={n} opacity={a}>
            <T x={30} y={40 + i * 38} s={14} f={C.latte}>{n}</T>
            <line x1={26} y1={35 + i * 38} x2={lerp(26, 34 + w, easeOut(seg(t, 0.4 + i * 0.5, 0.7 + i * 0.5)))} y2={35 + i * 38} stroke={C.cherryText} strokeWidth={2} />
          </g>
        );
      })}
      <g opacity={coin}>
        <Coin x={60} y={200} face="T" spin={flip} />
        {[0, 1, 2].map((l) => <Cell key={l} x={120} y={230 - l * 26} l={l} k={22} c={C.caramel} o={tower(l)} />)}
        <T x={160} y={206} s={14} f={C.caramel}>one coin per entry, once</T>
      </g>
      <g opacity={easeOut(seg(t, 3.0, 3.4))}>
        <line x1={160} y1={262} x2={560} y2={262} stroke={C.mocha} strokeWidth={1.2} />
        <circle cx={lerp(160, 560, r)} cy={262} r={8} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={160} y={290} s={13} f={C.cinnamon}>so readers never stop</T>
      </g>
    </Svg>
  );
}

// 11 · Predict. The cursor sits on 44; every pointer runs forward; the backward step (dashed, red) has no link. How
// does Prev work? After answering: a fresh search from the head for the last key below 44 traces down and lands on
// 40, the same cost as any other search.
export function ProveIt({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const BASE = 236;
  const GAP = 30;
  const pts: Pt[] = PATH_PREV.map(([i, l]) => [i < 0 ? HEAD_X : PX(i), BASE - l * GAP]);
  const k = answered ? seg(s, 0.2, 1.6) : 0;
  const done = answered && s >= 1.6;
  const at = along(pts, k);
  return (
    <Svg label="The cursor on 44 with only forward pointers and no backward link; after answering, a fresh search from the head for the last key below 44 traces down to 40" h={320}>
      <T x={30} y={26} s={12} f={C.latte}>a cursor on 44, stepping back</T>
      <Pic base={BASE} gap={GAP} cellC={(i) => (i === 10 ? C.caramel : done && i === 9 ? C.caramel : C.crema)} />
      <circle cx={PX(10)} cy={BASE} r={16} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      {!answered && (
        <g opacity={pulse}>
          <path d={`M ${PX(10) - 4} ${BASE + 22} Q ${(PX(9) + PX(10)) / 2} ${BASE + 38} ${PX(9) + 4} ${BASE + 22}`} fill="none" stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" />
          <T x={30} y={300} s={15} f={C.cherryText}>no backward link: how?</T>
        </g>
      )}
      {answered && (
        <>
          <Draw pts={pts} t={s} from={0.2} to={1.6} stroke={C.caramel} w={2.2} pen={false} />
          {s >= 0.2 && <circle cx={at[0]} cy={at[1]} r={10} fill="none" stroke={C.caramel} strokeWidth={2} />}
          <T x={30} y={280} s={13} f={C.caramel} o={easeOut(seg(s, 1.6, 1.9))}>a fresh search: last key below 44 is 40</T>
          <T x={30} y={306} s={12} f={C.latte} o={easeOut(seg(s, 2.0, 2.3))}>the same cost as any other search</T>
        </>
      )}
    </Svg>
  );
}
