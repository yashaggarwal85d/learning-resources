import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a structure's own live state; latte = secondary labels; taupe = an empty
// or consumed slot; caramel = the thing to look at (the winner, the path being replayed); cinnamon = the
// alternative being compared (the heap-based merge); cherryText = extra cost. Run contents are letters
// (illustrations, not measurements); every printed number is printed by examples.py.

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

// Eight sorted runs; the first letter of each is its current head.
const RUNS = ['dks', 'bhq', 'gmt', 'ejr', 'anu', 'flv', 'cow', 'ipx'];
const HEADS = RUNS.map((r) => r[0]);

function Cell({ x, y, v, c = C.crema, o = 1, w = 28, h = 20 }: { x: number; y: number; v: string; c?: string; o?: number; w?: number; h?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w - 3} height={h} rx={3} fill={C.roast} stroke={c} strokeWidth={1.2} />
      <T x={x + (w - 3) / 2} y={y + h / 2 + 5} s={13} f={c} a="middle">{v}</T>
    </g>
  );
}

function Nd({ p, v, c = C.crema, o = 1, r = 14, ring = false, dash }: { p: Pt; v?: string; c?: string; o?: number; r?: number; ring?: boolean; dash?: string }) {
  return (
    <g opacity={o}>
      <circle cx={p[0]} cy={p[1]} r={r} fill={C.roast} stroke={c} strokeWidth={ring ? 2.4 : 1.4} strokeDasharray={dash} />
      {v !== undefined && <T x={p[0]} y={p[1] + 5} s={14} f={c} a="middle">{v}</T>}
    </g>
  );
}

function Edge({ a, b, c = C.mocha, w = 1.3, o = 1 }: { a: Pt; b: Pt; c?: string; w?: number; o?: number }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} opacity={o} />;
}

/** One comparison, as a small filled tick-box. */
function Tick({ x, y, c = C.caramel, o = 1 }: { x: number; y: number; c?: string; o?: number }) {
  return <rect x={x} y={y} width={12} height={16} rx={2} fill={c} opacity={o} />;
}

/** Two words crossfading in one place (a node's stored value changing without anything moving). */
function Swap({ p, a, b, k, ca = C.crema, cb = C.crema }: { p: Pt; a: string; b: string; k: number; ca?: string; cb?: string }) {
  return (
    <>
      <T x={p[0]} y={p[1] + 5} s={14} f={ca} a="middle" o={1 - k}>{a}</T>
      <T x={p[0]} y={p[1] + 5} s={14} f={cb} a="middle" o={k}>{b}</T>
    </>
  );
}

// 1 · Opening. Eight sorted runs, each with its head boxed. The smallest head is ringed and slides into the
// merged output; the run's next letter becomes its head; again, and again: the same question every output.
export function Opening({ t }: StepCtx) {
  const RY = (r: number) => 40 + r * 26;
  const CX = (c: number) => 60 + c * 30;
  const outs: [number, number][] = [[4, 1.0], [1, 1.9], [6, 2.8]]; // run, start time
  const headOf = (r: number) => outs.filter(([q, s]) => q === r && t >= s + 0.6).length;
  return (
    <Svg label="Eight sorted runs; again and again, the smallest of their current heads moves into one merged output" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>sorted runs, heads boxed</T>
      {RUNS.map((run, r) => (
        <g key={r}>
          {run.split('').map((ch, c) => {
            const gone = c < headOf(r);
            return <Cell key={c} x={CX(c)} y={RY(r)} v={ch} c={c === headOf(r) ? C.crema : C.latte} o={gone ? 0.15 : c === headOf(r) ? 1 : 0.6} />;
          })}
          <rect x={CX(headOf(r)) - 3} y={RY(r) - 3} width={31} height={26} rx={4} fill="none" stroke={C.latte} strokeWidth={1} opacity={0.7} />
        </g>
      ))}
      <T x={330} y={110} s={13} f={C.caramel} o={easeOut(seg(t, 0.6, 0.9))}>merged output</T>
      {[0, 1, 2].map((j) => <rect key={j} x={330 + j * 34} y={124} width={30} height={24} rx={3} fill="none" stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 0.6, 0.9))} />)}
      {outs.map(([r, s], j) => {
        const ring = easeOutBack(seg(t, s, s + 0.25));
        const k = easeInOut(seg(t, s + 0.3, s + 0.8));
        const from: Pt = [CX(0) + 12, RY(r) + 10];
        const to: Pt = [330 + j * 34 + 15, 136];
        return (
          <g key={j}>
            {t < s + 0.3 && <circle cx={from[0]} cy={from[1]} r={16 * ring} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ring} />}
            {k > 0 && <T x={lerp(from[0], to[0], k)} y={lerp(from[1], to[1], k) + 5} s={14} f={C.caramel} a="middle">{RUNS[r][0]}</T>}
          </g>
        );
      })}
      <T x={30} y={268} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>every output: smallest head, right now?</T>
    </Svg>
  );
}

// 2 · The naive scan. A cursor walks down the eight heads, keeping the smallest seen so far (ringed); each head
// after the first costs one comparison (a tick). Then a ninth run slides in: one more tick, every output.
export function NaiveReveal({ t }: StepCtx) {
  const RY = (r: number) => 40 + r * 25;
  const at = (r: number) => 0.3 + r * 0.26;
  const seen = HEADS.filter((_, r) => t >= at(r)).length;
  let best = 0;
  for (let r = 1; r < seen; r++) if (HEADS[r] < HEADS[best]) best = r;
  const cur = Math.max(0, Math.min(7, seen - 1));
  const extra = easeOut(seg(t, 2.7, 3.1));
  return (
    <Svg label="A cursor scans every run's head, keeping the smallest so far, one comparison per head after the first; a ninth run adds one more comparison every output" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>scan every head</T>
      {HEADS.map((h, r) => <Cell key={r} x={60} y={RY(r)} v={h} c={r === best && seen > 0 ? C.caramel : r < seen ? C.crema : C.latte} />)}
      {seen > 0 && <circle cx={72} cy={RY(best) + 10} r={16} fill="none" stroke={C.caramel} strokeWidth={2} />}
      {seen > 0 && seen <= 8 && t < at(7) + 0.4 && <path d={`M 104 ${RY(cur) + 10} l 12 -6 l 0 12 z`} fill={C.crema} />}
      <g opacity={extra}>
        <Cell x={60} y={RY(8) + 8 * (1 - extra)} v="h" c={C.cherryText} />
      </g>
      <T x={300} y={58} s={13} f={C.latte}>comparisons, this output</T>
      {HEADS.slice(1).map((_, i) => <Tick key={i} x={300 + i * 18} y={70} c={C.crema} o={easeOut(seg(t, at(i + 1), at(i + 1) + 0.15))} />)}
      <Tick x={300 + 7 * 18} y={70} c={C.cherryText} o={extra} />
      <T x={300} y={124} s={13} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>one per head after the first</T>
      <T x={300} y={150} s={13} f={C.cherryText} o={easeOut(seg(t, 3.1, 3.4))}>one more run, one more</T>
    </Svg>
  );
}

// The eight heads as a min-heap (a valid one), for steps 3 and 4.
const HEAP = ['a', 'b', 'c', 'e', 'd', 'f', 'g', 'i'];
function hpos(i: number): Pt {
  const d = Math.floor(Math.log2(i + 1));
  const k = i - (2 ** d - 1);
  return [250 + ((k + 0.5) / 2 ** d - 0.5) * 380, 70 + d * 60];
}

// 3 · Predict. The heap of heads; a was just output and its run's next letter, n, now sits at the root. Under it,
// two children, each with a question mark. After answering: comparison 1 (between the two children) and
// comparison 2 (the sinking value against the smaller child) are drawn and numbered.
export function HeapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const vals = ['n', ...HEAP.slice(1)];
  return (
    <Svg label="A heap of run heads with the newcomer n at the root above children b and c; after answering, the two comparisons at that level are drawn: child against child, then n against the smaller" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a went out; its run&apos;s next, n, sits on top</T>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => <Edge key={i} a={hpos(Math.floor((i - 1) / 2))} b={hpos(i)} />)}
      {vals.map((v, i) => <Nd key={i} p={hpos(i)} v={v} c={i === 0 ? C.cherryText : (i === 1 || i === 2) && answered ? C.cinnamon : C.crema} ring={i === 0} />)}
      {!answered && [1, 2].map((i) => <T key={i} x={hpos(i)[0] + 20} y={hpos(i)[1] - 12} s={14} f={C.cherryText} o={pulse}>?</T>)}
      {answered && (
        <>
          <Draw pts={[[hpos(1)[0] + 16, hpos(1)[1] + 4], [250, hpos(1)[1] + 22], [hpos(2)[0] - 16, hpos(2)[1] + 4]]} t={s} from={0.2} to={0.6} stroke={C.cinnamon} w={2} pen={false} />
          <T x={250} y={hpos(1)[1] + 40} s={14} f={C.cinnamon} a="middle" o={easeOut(seg(s, 0.5, 0.8))}>1</T>
          <Draw pts={[[hpos(0)[0] - 14, hpos(0)[1] + 4], [hpos(1)[0] + 12, hpos(1)[1] - 12]]} t={s} from={0.8} to={1.1} stroke={C.cinnamon} w={2.6} pen={false} />
          <T x={170} y={88} s={14} f={C.cinnamon} o={easeOut(seg(s, 1.0, 1.3))}>2</T>
        </>
      )}
      {!answered && <T x={30} y={290} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>how many looks per level?</T>}
      {answered && <T x={30} y={290} s={13} f={C.cinnamon} o={easeOut(seg(s, 1.4, 1.8))}>two per level: which child, then swap?</T>}
    </Svg>
  );
}

/** Values in flight through swaps of index a with index b over [t0, t1]; partners bow to opposite sides. */
function flight(n: number, swaps: [number, number, number, number][], t: number) {
  const at = Array.from({ length: n }, (_, i) => i);
  let moving: { a: number; b: number; k: number } | null = null;
  for (const [a, b, t0, t1] of swaps) {
    const va = at.indexOf(a);
    const vb = at.indexOf(b);
    if (t >= t1) {
      at[va] = b;
      at[vb] = a;
      continue;
    }
    if (t > t0) moving = { a, b, k: easeInOut(seg(t, t0, t1)) };
    break;
  }
  return at.map((i) => {
    if (moving && (i === moving.a || i === moving.b)) return { from: i, to: i === moving.a ? moving.b : moving.a, k: moving.k };
    return { from: i, to: i, k: 0 };
  });
}

function bowed(p: Pt, q: Pt, k: number, bow: number): Pt {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const L = Math.hypot(dx, dy) || 1;
  const s = Math.sin(Math.PI * k) * bow;
  return [lerp(p[0], q[0], k) - (dy / L) * s, lerp(p[1], q[1], k) + (dx / L) * s];
}

// 4 · The heap's sift-down, counted. Level 1: b and c compared (1), n against b (2), swap. Level 2: e and d
// compared (1), n against d (2), swap. n has no children left: stop. Ticks pile up two per level on the right.
const DOWN: [number, number, number, number][] = [[0, 1, 1.0, 1.5], [1, 4, 2.2, 2.7]];
export function HeapReveal({ t }: StepCtx) {
  const vals = ['n', ...HEAP.slice(1)];
  const fl = flight(8, DOWN, t);
  const beats: [number, number, number, number][] = [
    // [time, level, which comparison, ...]
    [0.3, 0, 0, 0], [0.65, 0, 1, 0], [1.6, 1, 0, 0], [1.9, 1, 1, 0],
  ];
  const on = (a: number, b: number) => t >= a && t < b;
  const kidsA = on(0.3, 1.0);
  const kidsB = on(1.6, 2.2);
  return (
    <Svg label="Sift-down of n: at each level the two children are compared, then n against the smaller, then a swap; two comparisons per level, counted as ticks" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>sift-down, counted</T>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => <Edge key={i} a={hpos(Math.floor((i - 1) / 2))} b={hpos(i)} />)}
      <Edge a={hpos(1)} b={hpos(2)} c={C.cinnamon} w={2} o={kidsA ? 1 : 0} />
      <Edge a={hpos(3)} b={hpos(4)} c={C.cinnamon} w={2} o={kidsB ? 1 : 0} />
      {vals.map((v, n) => {
        const f = fl[n];
        const p = bowed(hpos(f.from), hpos(f.to), f.k, 22);
        const lit = (kidsA && (f.from === 1 || f.from === 2)) || (kidsB && (f.from === 3 || f.from === 4));
        return <Nd key={n} p={p} v={v} c={v === 'n' ? C.caramel : lit ? C.cinnamon : C.crema} ring={v === 'n' || lit} />;
      })}
      <T x={440} y={84} s={13} f={C.latte}>per level</T>
      {[0, 1].map((lv) => (
        <g key={lv}>
          <T x={440} y={118 + lv * 40} s={13} f={C.latte} o={easeOut(seg(t, beats[lv * 2][0], beats[lv * 2][0] + 0.2))}>{lv === 0 ? 'top' : 'next'}</T>
          {[0, 1].map((j) => <Tick key={j} x={490 + j * 18} y={104 + lv * 40} c={C.cinnamon} o={easeOut(seg(t, beats[lv * 2 + j][0], beats[lv * 2 + j][0] + 0.15))} />)}
        </g>
      ))}
      <T x={hpos(4)[0] + 22} y={hpos(4)[1] + 30} s={13} f={C.crema} o={easeOut(seg(t, 2.8, 3.1))}>no children: stop</T>
      <T x={30} y={306} s={13} f={C.cinnamon} o={easeOut(seg(t, 3.2, 3.6))}>log levels, but two looks at each</T>
    </Svg>
  );
}

// The bracket over the eight heads: leaves, then three rounds of games, then the winner slot above.
const LX = (i: number) => 75 + i * 64;
const RX = (round: number, j: number) => {
  const span = 2 ** round;
  return (LX(j * span) + LX(j * span + span - 1)) / 2;
};
const RYb = (round: number) => 236 - round * 52;
const W1 = ['b', 'e', 'a', 'c'];
const W2 = ['b', 'a'];
const L1 = ['d', 'g', 'f', 'i'];
const L2 = ['e', 'c'];

function BracketEdges({ hot = [] as string[] }: { hot?: string[] }) {
  const out = [];
  for (let round = 1; round <= 3; round++) {
    for (let j = 0; j < 8 / 2 ** round; j++) {
      for (const c of [2 * j, 2 * j + 1]) {
        const key = `${round}-${j}-${c}`;
        out.push(<Edge key={key} a={[RX(round, j), RYb(round)]} b={[RX(round - 1, c), RYb(round - 1)]} c={hot.includes(key) ? C.caramel : C.mocha} w={hot.includes(key) ? 2.4 : 1.3} />);
      }
    }
  }
  return <>{out}</>;
}

// 5 · Predict. The same eight heads as the leaves of a bracket; every game above is empty, a dashed circle.
// After answering: the winners appear in place, round by round, each game showing a single tick.
export function TournamentPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const games: [number, number, string][] = [...W1.map((w, j) => [1, j, w] as [number, number, string]), ...W2.map((w, j) => [2, j, w] as [number, number, string]), [3, 0, 'a']];
  return (
    <Svg label="The eight heads as leaves of a single-elimination bracket with empty games above; after answering, each game fills with its winner, one comparison each" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>the same heads, as a bracket</T>
      <BracketEdges />
      {HEADS.map((h, i) => <Nd key={i} p={[LX(i), RYb(0)]} v={h} />)}
      {games.map(([round, j, w]) => {
        const k = answered ? easeOut(seg(s, 0.2 + (round - 1) * 0.35, 0.45 + (round - 1) * 0.35)) : 0;
        return (
          <g key={`${round}-${j}`}>
            <Nd p={[RX(round, j), RYb(round)]} c={answered ? C.caramel : C.latte} dash={answered ? undefined : '3 3'} o={answered ? 1 : pulse} />
            <T x={RX(round, j)} y={RYb(round) + 5} s={14} f={C.caramel} a="middle" o={k}>{w}</T>
          </g>
        );
      })}
      {!answered && <T x={30} y={290} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>can a bracket beat the heap?</T>}
      {answered && <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(s, 1.3, 1.7))}>one game per node: one comparison</T>}
    </Svg>
  );
}

// 6 · The bracket plays. Round by round, each game's winner rises from its child into the game; each game is one
// tick. Then the champion's path (a) lights up: three levels, three ticks, against the heap's two per level.
export function TournamentReveal({ t }: StepCtx) {
  const RS = [0.3, 1.2, 2.1];
  const winners = [W1, W2, ['a']];
  const src = (round: number, j: number) => {
    const prev = round === 1 ? HEADS : winners[round - 2];
    const w = winners[round - 1][j];
    return prev[2 * j] === w ? 2 * j : 2 * j + 1;
  };
  const path = easeOut(seg(t, 3.0, 3.4));
  const hot = path > 0 ? ['1-2-4', '2-1-2', '3-0-1'] : [];
  return (
    <Svg label="Each game's winner rises from its child into the game, one comparison per game; the champion a reaches the top in three games, one per level" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>one game per node, smaller goes up</T>
      <BracketEdges hot={hot} />
      {HEADS.map((h, i) => <Nd key={i} p={[LX(i), RYb(0)]} v={h} c={h === 'a' && path > 0 ? C.caramel : C.crema} />)}
      {winners.map((ws, ri) =>
        ws.map((w, j) => {
          const round = ri + 1;
          const k = easeInOut(seg(t, RS[ri], RS[ri] + 0.6));
          const from: Pt = [RX(round - 1, src(round, j)), RYb(round - 1)];
          const to: Pt = [RX(round, j), RYb(round)];
          const c = w === 'a' && path > 0 ? C.caramel : C.crema;
          return (
            <g key={`${round}-${j}`}>
              <Nd p={to} c={k >= 1 ? c : C.mocha} />
              {k > 0 && <T x={lerp(from[0], to[0], k)} y={lerp(from[1], to[1], k) + 5} s={14} f={c} a="middle">{w}</T>}
            </g>
          );
        }),
      )}
      {[0, 1, 2].map((ri) => <Tick key={ri} x={520} y={RYb(ri + 1) - 8} c={C.caramel} o={easeOut(seg(t, 3.1 + ri * 0.15, 3.3 + ri * 0.15))} />)}
      <T x={570} y={RYb(3) - 26} s={13} f={C.caramel} a="end" o={path}>per level</T>
      <T x={30} y={306} s={13} f={C.caramel} o={easeOut(seg(t, 3.5, 3.9))}>one look per level, not two</T>
    </Svg>
  );
}

// 7 · The loser tree. Each game's winner fades into its loser: the tree now stores losers, and the champion a
// floats above the root. a goes out; its leaf refills with n. Replay climbs only n's path: at each game the
// newcomer meets the stored loser; the loser stays, the winner climbs (n stays below f; f stays below c;
// c stays below b; b floats up). Every other game is untouched.
export function LoserTreeReveal({ t }: StepCtx) {
  const flip = easeInOut(seg(t, 0.2, 0.9));
  const out = easeOut(seg(t, 1.1, 1.5));
  const refill = easeOut(seg(t, 1.5, 1.8));
  const r1 = easeInOut(seg(t, 2.0, 2.3));
  const r2 = easeInOut(seg(t, 2.4, 2.7));
  const r3 = easeInOut(seg(t, 2.8, 3.1));
  const top = easeInOut(seg(t, 3.1, 3.4));
  const still = easeOut(seg(t, 3.5, 3.8));
  const hot = r1 > 0 ? ['1-2-4', ...(r2 > 0 ? ['2-1-2'] : []), ...(r3 > 0 ? ['3-0-1'] : [])] : [];
  const P = (round: number, j: number): Pt => [RX(round, j), RYb(round)];
  const topP: Pt = [RX(3, 0), RYb(3) - 52];
  const climb = (a: Pt, b: Pt, k: number) => (k > 0 && k < 1 ? <circle cx={lerp(a[0], b[0], k)} cy={lerp(a[1], b[1], k)} r={5} fill={C.caramel} /> : null);
  return (
    <Svg label="The bracket stores each game's loser and the champion a above the root; a goes out, its leaf refills with n, and only n's path replays: n stays below f, f below c, c below b, b becomes champion" h={320}>
      <BracketEdges hot={hot} />
      <Edge a={P(3, 0)} b={topP} c={C.caramel} w={1.6} o={flip} />
      {HEADS.map((h, i) => (
        <g key={i}>
          <Nd p={[LX(i), RYb(0)]} c={i === 4 && refill > 0 ? C.caramel : C.crema} />
          {i === 4 ? <Swap p={[LX(i), RYb(0)]} a={h} b="n" k={refill} cb={C.caramel} /> : <T x={LX(i)} y={RYb(0) + 5} s={14} f={C.crema} a="middle">{h}</T>}
        </g>
      ))}
      {W1.map((w, j) => (
        <g key={`1-${j}`}>
          <Nd p={P(1, j)} c={j === 2 && r1 > 0 ? C.caramel : C.crema} />
          {j === 2 && r1 > 0 ? <Swap p={P(1, j)} a={L1[j]} b="n" k={r1} cb={C.caramel} /> : <Swap p={P(1, j)} a={w} b={L1[j]} k={flip} />}
        </g>
      ))}
      {W2.map((w, j) => (
        <g key={`2-${j}`}>
          <Nd p={P(2, j)} c={j === 1 && r2 > 0 ? C.caramel : C.crema} />
          {j === 1 && r2 > 0 ? <Swap p={P(2, j)} a={L2[j]} b="f" k={r2} cb={C.caramel} /> : <Swap p={P(2, j)} a={w} b={L2[j]} k={flip} />}
        </g>
      ))}
      <Nd p={P(3, 0)} c={r3 > 0 ? C.caramel : C.crema} />
      {r3 > 0 ? <Swap p={P(3, 0)} a="b" b="c" k={r3} cb={C.caramel} /> : <Swap p={P(3, 0)} a="a" b="b" k={flip} />}
      <g opacity={flip}>
        <Nd p={topP} c={C.caramel} ring />
        <Swap p={topP} a="a" b="b" k={top} ca={C.caramel} cb={C.caramel} />
      </g>
      <T x={topP[0] + 26} y={topP[1] + 5} s={13} f={C.caramel} o={flip * (1 - out)}>champion</T>
      <T x={topP[0] + 26} y={topP[1] + 5} s={13} f={C.latte} o={out * (1 - top)}>a: out</T>
      <T x={topP[0] + 26} y={topP[1] + 5} s={13} f={C.caramel} o={top}>new champion</T>
      <T x={30} y={24} s={13} f={C.latte} o={flip}>losers stay in the tree</T>
      {climb([LX(4), RYb(0)], P(1, 2), seg(t, 1.8, 2.0))}
      {climb(P(1, 2), P(2, 1), seg(t, 2.2, 2.4))}
      {climb(P(2, 1), P(3, 0), seg(t, 2.6, 2.8))}
      {climb(P(3, 0), topP, seg(t, 3.0, 3.15))}
      <T x={30} y={306} s={13} f={C.crema} o={still}>one path replayed; the rest untouched</T>
    </Svg>
  );
}

// 8 · Where it runs. Six sorted runs. Left: merged two at a time, pass after pass (6, then 3, then 2, then 1):
// three passes. Right: merged six-way in one pass. This is external sort's merge phase and LSM compaction.
export function ExternalSortReveal({ t }: StepCtx) {
  const rows: number[][] = [[1, 1, 1, 1, 1, 1], [2, 2, 2], [4, 2], [6]];
  const U = 30;
  const rowY = (r: number) => 84 + r * 46;
  const pass = (r: number) => easeOut(seg(t, 0.3 + r * 0.7, 0.8 + r * 0.7));
  const wide = easeInOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="Six sorted runs merged two at a time take three passes; merged six-way they take one; the same k-way merge is external sorting's merge phase and LSM compaction" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>external sort&apos;s merge; LSM compaction</T>
      <T x={30} y={60} s={13} f={C.cinnamon}>two at a time</T>
      <T x={340} y={60} s={13} f={C.caramel}>six-way</T>
      {rows.map((row, r) => {
        const k = r === 0 ? 1 : pass(r - 1);
        let x = 30;
        return (
          <g key={r} opacity={k}>
            {row.map((w, j) => {
              const el = <rect key={j} x={x} y={rowY(r) - 14 * (1 - k)} width={w * U - 6} height={16} rx={2} fill={C.cinnamon} opacity={r === 3 ? 1 : 0.75} />;
              x += w * U;
              return el;
            })}
            {r > 0 && <T x={220} y={rowY(r) + 13} s={12} f={C.latte}>pass {r}</T>}
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <rect key={j} x={lerp(340 + j * U, 340 + j * U, wide)} y={lerp(rowY(0), rowY(1), wide)} width={lerp(U - 6, U, wide)} height={16} rx={2} fill={C.caramel} opacity={0.75 + 0.25 * wide} />
      ))}
      <T x={340} y={rowY(1) + 40} s={12} f={C.latte} o={wide}>pass 1</T>
      <T x={30} y={290} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.5, 2.8))}>3 passes</T>
      <T x={340} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 1.4, 1.7))}>1 pass</T>
    </Svg>
  );
}

// 9 · Prove it. examples.py, k = 8 runs, 480 elements: comparisons per output 6.94 naive, 4.35 heap, 3.00 loser
// tree; heap over loser 1.45x (and 1.19x at k = 6). A dashed outline marks the rough two-per-level estimate for
// the heap (drawn as a length only); the measured heap bar stops well short of it.
export function ProveIt({ t }: StepCtx) {
  const S = 50;
  const X = 160;
  const rows: [string, number, string, string][] = [
    ['naive scan', 6.94, '6.94', C.crema],
    ['heap merge', 4.35, '4.35', C.cinnamon],
    ['loser tree', 3.0, '3.00', C.caramel],
  ];
  const rough = easeOut(seg(t, 2.2, 2.6));
  return (
    <Svg label="Measured on 8 runs and 480 elements: comparisons per output 6.94 for the naive scan, 4.35 for the heap merge, 3.00 for the loser tree; heap over loser 1.45x, and 1.19x for 6 runs; the heap stays below a rough two-per-level estimate" h={300}>
      <T x={30} y={24} s={13} f={C.crema}>8 runs, 480 elements</T>
      <T x={30} y={46} s={12} f={C.latte}>comparisons per output</T>
      {rows.map(([name, v, label, c], i) => {
        const g = easeInOut(seg(t, 0.3 + i * 0.5, 0.9 + i * 0.5));
        const y = 70 + i * 40;
        return (
          <g key={name}>
            <T x={30} y={y + 14} s={13} f={c}>{name}</T>
            <rect x={X} y={y} width={v * S * g} height={18} rx={2} fill={c} />
            <T x={X + v * S + 8} y={y + 14} s={13} f={c} o={easeOut(seg(t, 0.8 + i * 0.5, 1.1 + i * 0.5))}>{label}</T>
          </g>
        );
      })}
      <rect x={X} y={108} width={6 * S} height={22} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.2} strokeDasharray="4 3" opacity={rough} />
      <T x={X + 6 * S + 10} y={124} s={12} f={C.cinnamon} o={rough}>estimate</T>
      <T x={30} y={220} s={15} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>heap / loser: 1.45x</T>
      <T x={30} y={248} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.5))}>6 runs: 1.19x</T>
      <T x={30} y={280} s={13} f={C.crema} o={easeOut(seg(t, 3.5, 3.9))}>a heap rarely sinks to the bottom</T>
    </Svg>
  );
}
