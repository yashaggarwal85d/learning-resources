import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a structure as it is; latte = secondary labels (a key, a
// count); caramel = the thing to look at (the operation being asked, the winning structure);
// cinnamon (rare) = the alternative compared against; cherry/cherryText = the breaking condition
// (the operation a structure cannot answer, a wrong answer).
//
// Every printed number is examples.py's: the range share of one tenth of one percent; top-k at ten
// and twenty percent; the Bloom filter's 10 bits a key, 7 hashes, a false-positive rate of
// (1 − e^−0.7)^7 ≈ 0.82%, 12.5 MB against an exact set's 80 MB at 10,000,000 keys; union-find's
// unions (0,1), (1,2), (3,4) over ten elements; the trie's cat, car, cart, dog, dove and 'art'; the
// breaking array 999, 1, 2, 7, 3, 5 with range [3, 5], the trick's 999 against the true 7; the
// segment tree's own nodes for that array; the cost model's totals (n = 10,000,000, k = 10). The
// measured timings are machine-dependent, so they are drawn as shape only (which side wins, as
// examples.py asserts).

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

/** Two cost bars, shape only: which one is shorter is what examples.py asserts. */
function Duel({ y, labA, labB, a, b, winA, o = 1 }: { y: number; labA: string; labB: string; a: number; b: number; winA: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <T x={30} y={y + 13} s={12} f={winA ? C.caramel : C.latte}>{labA}</T>
      <rect x={130} y={y} width={a} height={16} fill={winA ? C.caramel : C.cherry} opacity={0.7} />
      <T x={30} y={y + 43} s={12} f={!winA ? C.caramel : C.latte}>{labB}</T>
      <rect x={130} y={y + 30} width={b} height={16} fill={!winA ? C.caramel : C.cherry} opacity={0.7} />
    </g>
  );
}

// 1 · Hook: the same table, a different mix, a different winner
export function MixHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const look = easeOut(seg(t, 0.6, 1.4));
  const shift = stepIdx(t, 2.2, 3.4, 12);
  const flip = easeInOut(seg(t, 3.4, 4.2));
  const ranges = new Set([7, 19, 33, 46, 52, 61, 70, 78, 85, 91, 24, 97]);
  return (
    <Svg label="10,000,000 keys and a hundred operations, nearly all lookups: the hash table's cost bar is short, the tree's long. Range queries replace some lookups, and the bars swap: the tree wins" h={280}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>10,000,000 keys; each square one operation</T>
      {Array.from({ length: 100 }).map((_, i) => {
        const rng = ranges.has(i) && [...ranges].indexOf(i) <= shift;
        return <rect key={i} x={30 + (i % 25) * 22} y={42 + Math.floor(i / 25) * 18} width={16} height={12} fill={rng ? C.cinnamon : C.crema} opacity={a * (rng ? 0.9 : 0.35)} />;
      })}
      <g opacity={a}>
        <rect x={30} y={130} width={12} height={12} fill={C.crema} opacity={0.35} />
        <T x={48} y={141} s={11} f={C.latte}>lookup</T>
        <rect x={130} y={130} width={12} height={12} fill={C.cinnamon} opacity={0.9} />
        <T x={148} y={141} s={11} f={C.latte}>range query</T>
      </g>
      <Duel y={170} labA="hash table" labB="tree" a={lerp(60, 400, flip)} b={lerp(300, 120, flip)} winA={flip < 0.5} o={look} />
      <T x={560} y={268} s={12} a="end" f={C.caramel} o={look}>{flip < 0.5 ? 'hash table wins' : 'the tree wins'}</T>
    </Svg>
  );
}

const KEYS = ['m', 'c', 'x', 'f', 'q', 'a', 'k', 't'];

// 2 · What a hash table cannot answer
export function HashBreakingCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const look = easeOut(seg(t, 0.8, 1.4));
  const q1 = easeOut(seg(t, 1.9, 2.4));
  const q2 = easeOut(seg(t, 2.8, 3.3));
  const end = easeOut(seg(t, 3.7, 4.2));
  const bx = (i: number) => 60 + i * 62;
  return (
    <Svg label="Eight buckets holding keys m, c, x, f, q, a, k, t in hash order. A lookup for q goes straight to its bucket. Asking for the next key after f, or every key from c to m, finds no order to follow" h={270}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>a hash table: keys where the hash puts them</T>
        {KEYS.map((k, i) => (
          <g key={k}>
            <rect x={bx(i) - 22} y={50} width={44} height={34} fill="none" stroke={look > 0.5 && k === 'q' ? C.caramel : C.latte} strokeWidth={look > 0.5 && k === 'q' ? 2 : 1.2} />
            <T x={bx(i)} y={72} s={13} a="middle" f={C.crema}>{k}</T>
          </g>
        ))}
      </g>
      <g opacity={look}>
        <path d={`M${bx(4)} 120 L${bx(4)} 90`} stroke={C.caramel} strokeWidth={1.6} />
        <T x={bx(4)} y={136} s={12} a="middle" f={C.caramel}>lookup q: one step</T>
      </g>
      <T x={30} y={180} s={12} f={C.cherryText} o={q1}>next key after f?  no order to follow</T>
      <T x={30} y={208} s={12} f={C.cherryText} o={q2}>every key from c to m?  same</T>
      <T x={300} y={256} s={12} a="middle" f={C.latte} o={end}>constant-time equality, nothing about order</T>
    </Svg>
  );
}

// 3 · Predict: how big a sliver of range queries flips the winner?
export function PredictRangeShare({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const ask = easeOut(seg(t, 1.6, 2.1));
  const rev = answered ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const flow = (t * 0.25) % 1;
  return (
    <Svg label="A stream of operations, all lookups but for a rare range query. Before answering, the share is a question mark. After, the share reads one tenth of one percent, and the measured bars swap: the tree already wins" h={260}>
      <g opacity={a}>
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 30 + ((i / 26 + flow) % 1) * 540;
          return <rect key={i} x={x} y={40} width={14} height={12} fill={i === 13 ? C.cinnamon : C.crema} opacity={i === 13 ? 0.9 : 0.35} />;
        })}
        <T x={30} y={84} s={12} f={C.latte}>range share:</T>
        <T x={150} y={84} s={13} f={rev > 0.3 ? C.caramel : C.taupe}>{rev > 0.3 ? '0.1%, one in a thousand' : '?'}</T>
      </g>
      <Duel y={110} labA="hash table" labB="tree" a={lerp(80, 400, rev)} b={lerp(260, 140, rev)} winA={rev < 0.5} o={a} />
      <T x={300} y={236} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>how big a sliver until the tree wins?</T>
      <T x={300} y={236} s={12} a="middle" f={C.caramel} o={rev}>measured: the tree already wins</T>
    </Svg>
  );
}

// 4 · Why: a full scan against the width of the range
export function TreeRangeMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const scanF = seg(t, 0.7, 2.4) * 20;
  const scan = t < 0.7 ? -1 : Math.min(19, Math.floor(scanF));
  const end = easeOut(seg(t, 4.2, 4.7));
  const cx = (i: number) => 52 + i * 26;
  const probes = [10, 5, 7];
  // The hash table's cursor has to glide over every cell; the tree's binary search hops (10, then 5, then 7) and then
  // walks only the range's width. The distance each cursor travels is the cost.
  const hashX = cx(Math.min(19, scanF));
  const hop = seg(t, 2.6, 3.2) * 3; // 0..3 through the three probes
  const bs = t < 2.6 ? -1 : Math.min(2, Math.floor(hop));
  const walkF = seg(t, 3.3, 4.0) * 4;
  const walk = t < 3.3 ? -1 : Math.min(3, Math.floor(walkF));
  let treeX = cx(probes[0]);
  let treeY = 0;
  if (t >= 2.6 && t < 3.3) {
    const j = Math.min(2, Math.floor(hop));
    const f = easeInOut(Math.min(1, (hop - j) * 1.6));
    const from = j === 0 ? cx(probes[0]) : cx(probes[j - 1]);
    treeX = lerp(from, cx(probes[j]), f);
    treeY = j === 0 ? 0 : Math.sin(Math.PI * f) * 24;
  } else if (t >= 3.3) treeX = cx(7 + Math.min(3, walkF));
  return (
    <Svg label="Twenty cells for the hash table, every one checked in turn to answer one range query. Twenty sorted cells for the tree: a binary search lands on the range's start in a few steps, then walks only the range's own width" h={270}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>hash table, one range query:</T>
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={cx(i) - 10} y={42} width={20} height={20} fill={i <= scan ? C.cherry : 'none'} fillOpacity={0.6} stroke={C.mocha} strokeWidth={1} />
        ))}
        {t >= 0.7 && t < 2.5 && <rect x={hashX - 12} y={40} width={24} height={24} fill="none" stroke={C.cherryText} strokeWidth={1.8} />}
        <T x={30} y={92} s={12} f={C.cherryText} o={scan >= 19 ? 1 : 0}>every key it holds: all n</T>
        <T x={30} y={136} s={12} f={C.latte}>tree, kept in order:</T>
        {Array.from({ length: 20 }).map((_, i) => {
          const probed = probes.slice(0, bs + 1).includes(i);
          const walked = walk >= 0 && i >= 7 && i <= 7 + walk;
          return <rect key={i} x={cx(i) - 10} y={148} width={20} height={20} fill={walked ? C.caramel : probed ? C.latte : 'none'} fillOpacity={0.6} stroke={C.mocha} strokeWidth={1} />;
        })}
        {t >= 2.6 && t < 4.1 && <circle cx={treeX} cy={140 - treeY} r={4.5} fill={C.caramel} />}
        <T x={30} y={198} s={12} f={C.caramel} o={walk >= 0 ? 1 : 0}>log n to find the start, then the range's width</T>
      </g>
      <T x={300} y={252} s={12} a="middle" f={C.crema} o={end}>that asymmetry is why a sliver flips it</T>
    </Svg>
  );
}

// 5 · Top-k: a small heap against sorting everything
export function TopKCrossover({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const p1 = easeOut(seg(t, 0.7, 1.4));
  const r1 = easeInOut(seg(t, 1.4, 2.2));
  const p2 = easeOut(seg(t, 2.6, 3.2));
  const r2 = easeInOut(seg(t, 3.2, 4.0));
  const heap = (cx: number, y: number, sz: number, o: number) => <path d={`M${cx} ${y} L${cx - sz} ${y + sz} L${cx + sz} ${y + sz} Z`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={o} />;
  return (
    <Svg label="A large collection. Keeping the top ten percent, a small heap beats sorting everything; at twenty percent, the heap has grown and sorting everything wins back" h={290}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>top k of a large collection</T>
      <g opacity={p1}>
        <T x={30} y={66} s={13} f={C.crema}>k = 10% of n</T>
        {heap(220, 48, 18, 1)}
      </g>
      <Duel y={86} labA="heap" labB="sort all" a={lerp(0, 120, r1)} b={lerp(0, 300, r1)} winA o={p1} />
      <g opacity={p2}>
        <T x={30} y={186} s={13} f={C.crema}>k = 20% of n</T>
        {heap(220, 160, 30, 1)}
      </g>
      <Duel y={206} labA="heap" labB="sort all" a={lerp(0, 340, r2)} b={lerp(0, 300, r2)} winA={false} o={p2} />
    </Svg>
  );
}

// 6 · A Bloom filter, priced against an exact set
export function BloomFilterPriced({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const ins = stepIdx(t, 0.7, 1.9, 7);
  const miss = easeOut(seg(t, 2.1, 2.7));
  const price = easeInOut(seg(t, 3.0, 4.0));
  const end = easeOut(seg(t, 4.2, 4.7));
  const bits = [2, 6, 11, 15, 21, 26, 31];
  const probe = [4, 11, 26];
  const bx = (i: number) => 40 + i * 15.5;
  return (
    <Svg label="A row of bits. Adding a key sets seven of them, one per hash. Asking about an absent key finds a zero among its bits: a definite no. Priced: 10 bits a key, a wrong yes about 0.82% of the time, 12.5 MB for 10,000,000 keys against an exact set's 80 MB" h={290}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>a bit array; each key sets 7 bits</T>
        {Array.from({ length: 34 }).map((_, i) => {
          const on = bits.slice(0, ins + 1).includes(i);
          const asked = miss > 0.5 && probe.includes(i);
          return <rect key={i} x={bx(i) - 6} y={44} width={12} height={18} fill={on ? C.crema : 'none'} fillOpacity={0.7} stroke={asked ? (on ? C.caramel : C.cherry) : C.mocha} strokeWidth={asked ? 2 : 1} />;
        })}
      </g>
      <T x={30} y={96} s={12} f={C.cherryText} o={miss}>an absent key hits a 0: a definite no</T>
      <g opacity={price}>
        <T x={30} y={140} s={12} f={C.crema}>10 bits a key: a wrong yes about 0.82%</T>
        <T x={30} y={174} s={12} f={C.latte}>10,000,000 keys</T>
        <T x={30} y={204} s={12} f={C.caramel}>filter</T>
        <rect x={140} y={192} width={(12.5 / 80) * 400 * price} height={16} fill={C.caramel} opacity={0.7} />
        <T x={150 + (12.5 / 80) * 400} y={205} s={12} f={C.caramel}>12.5 MB</T>
        <T x={30} y={236} s={12} f={C.latte}>exact set</T>
        <rect x={140} y={224} width={400 * price} height={16} fill={C.latte} opacity={0.5} />
        <T x={540} y={258} s={12} a="end" f={C.latte}>80 MB</T>
      </g>
      <T x={30} y={284} s={11} f={C.latte} o={end}>a wrong no never happens</T>
    </Svg>
  );
}

// 7 · Union-find: merges only, never a split
export function UnionFindBreakingCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const u = stepIdx(t, 0.7, 2.2, 3);
  const chk = easeOut(seg(t, 2.4, 2.9));
  const split = easeOut(seg(t, 3.2, 3.8));
  const nx = (i: number) => 60 + i * 52;
  const unions: [number, number][] = [
    [0, 1],
    [1, 2],
    [3, 4],
  ];
  // after union(0,1): 1 → 0; union(1,2): 2 → 0; union(3,4): 4 → 3 (examples.py's union by rank)
  const parentEdges: [number, number][] = [
    [1, 0],
    [2, 0],
    [4, 3],
  ];
  return (
    <Svg label="Ten elements, 0 to 9. Union 0 and 1, union 1 and 2, union 3 and 4: arrows point each merged element at its group's root. 0 and 2 now share a root; 0 and 3 do not. A request to split the group 0, 1, 2 apart has no operation to call" h={270}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>ten elements, merged as unions arrive</T>
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <circle cx={nx(i)} cy={110} r={14} fill="none" stroke={i <= 2 && u >= 1 ? C.caramel : i >= 3 && i <= 4 && u >= 2 ? C.cinnamon : C.latte} strokeWidth={1.4} />
            <T x={nx(i)} y={115} s={12} a="middle" f={C.crema}>{`${i}`}</T>
          </g>
        ))}
        {parentEdges.map(([c, p], j) => (
          <path key={j} d={`M${nx(c)} 96 Q${(nx(c) + nx(p)) / 2} ${60 - (c - p) * 8} ${nx(p)} 96`} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={u >= j ? 1 : 0} />
        ))}
        {unions.map(([x, y], j) => (
          <T key={j} x={30 + j * 180} y={170} s={12} f={u === j ? C.caramel : C.latte} o={u >= j ? 1 : 0}>{`union(${x}, ${y})`}</T>
        ))}
      </g>
      <g opacity={chk}>
        <T x={30} y={204} s={12} f={C.crema}>0 and 2: same group</T>
        <T x={300} y={204} s={12} f={C.crema}>0 and 3: different</T>
      </g>
      <g opacity={split}>
        <T x={30} y={246} s={12} f={C.taupe}>split(0, 1, 2)</T>
        <line x1={28} y1={242} x2={170} y2={242} stroke={C.cherry} strokeWidth={1.6} />
        <T x={190} y={246} s={12} f={C.cherryText}>no such operation exists</T>
      </g>
    </Svg>
  );
}

// 8 · A trie: prefixes yes, a substring in the middle no
export function TrieBreakingCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const pre = stepIdx(t, 0.8, 1.8, 3);
  const sub = easeOut(seg(t, 2.3, 2.8));
  const end = easeOut(seg(t, 3.3, 3.9));
  const N: Record<string, [number, number, string, boolean]> = {
    root: [170, 34, '', false],
    c: [110, 84, 'c', false],
    ca: [110, 134, 'a', false],
    cat: [70, 184, 't', true],
    car: [150, 184, 'r', true],
    cart: [150, 234, 't', true],
    d: [230, 84, 'd', false],
    do: [230, 134, 'o', false],
    dog: [190, 184, 'g', true],
    dov: [270, 184, 'v', false],
    dove: [270, 234, 'e', true],
  };
  const edges: [string, string][] = [
    ['root', 'c'], ['c', 'ca'], ['ca', 'cat'], ['ca', 'car'], ['car', 'cart'],
    ['root', 'd'], ['d', 'do'], ['do', 'dog'], ['do', 'dov'], ['dov', 'dove'],
  ];
  const path = ['root', 'c', 'ca'];
  return (
    <Svg label="A trie of cat, car, cart, dog, dove. The prefix 'ca' walks down root, c, a: found, in two steps. The substring 'art' sits inside cart, but from the root there is no 'a' to step to, so the trie's own search cannot reach it" h={270}>
      <g opacity={a}>
        {edges.map(([p, c]) => (
          <line key={c} x1={N[p][0]} y1={N[p][1]} x2={N[c][0]} y2={N[c][1]} stroke={path.indexOf(c) >= 0 && path.indexOf(c) <= pre ? C.caramel : C.mocha} strokeWidth={path.indexOf(c) >= 0 && path.indexOf(c) <= pre ? 2 : 1.2} />
        ))}
        {Object.entries(N).map(([id, [x, y, ch, end]]) => (
          <g key={id}>
            <circle cx={x} cy={y} r={13} fill={C.band} stroke={path.indexOf(id) > 0 && path.indexOf(id) <= pre ? C.caramel : end ? C.crema : C.latte} strokeWidth={end || (path.indexOf(id) > 0 && path.indexOf(id) <= pre) ? 2 : 1} />
            <T x={x} y={y + 5} s={13} a="middle" f={C.crema}>{ch}</T>
          </g>
        ))}
        <T x={150} y={262} s={11} a="middle" f={C.latte}>cat, car, cart, dog, dove</T>
      </g>
      <T x={330} y={90} s={12} f={C.caramel} o={pre >= 2 ? 1 : 0}>prefix "ca": found,</T>
      <T x={330} y={110} s={12} f={C.caramel} o={pre >= 2 ? 1 : 0}>by its own length</T>
      <g opacity={sub}>
        <T x={330} y={160} s={12} f={C.cherryText}>"art", inside cart:</T>
        <T x={330} y={180} s={12} f={C.cherryText}>no 'a' under the root</T>
        <line x1={170} y1={47} x2={170} y2={71} stroke={C.cherry} strokeWidth={1.4} strokeDasharray="3 3" />
        <circle cx={170} cy={84} r={13} fill="none" stroke={C.cherry} strokeWidth={1.4} strokeDasharray="3 3" />
        <T x={170} y={89} s={13} a="middle" f={C.cherryText}>a</T>
      </g>
      <T x={330} y={230} s={12} f={C.latte} o={end}>brute force finds it</T>
    </Svg>
  );
}

const ARR = [999, 1, 2, 7, 3, 5];

// 9 · Predict: does the prefix trick work for maximum?
export function PredictFenwickMax({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const sums = easeOut(seg(t, 0.8, 1.6));
  const maxes = easeOut(seg(t, 1.9, 2.5));
  const rev = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const cx = (i: number) => 150 + i * 62;
  let run = 0;
  const pre = ARR.map((v) => (run += v));
  let m = -Infinity;
  const pmax = ARR.map((v) => (m = Math.max(m, v)));
  // Each running value is carried along from its left neighbour, so the accumulation is visible: sums grow cell by
  // cell; the maximum's 999 is carried unchanged all the way across. After the answer, that early 999 is traced
  // over the bracket into the trick's result, and the lock-on finds the range's real maximum, 7.
  const carry = (i: number, from: number) => easeOut(seg(t, from + i * 0.12, from + 0.25 + i * 0.12));
  return (
    <Svg label="The array 999, 1, 2, 7, 3, 5 with the range from index 3 to 5 bracketed. Prefix sums: 1017 minus 1002 is 15, the range's sum. Prefix maxima are 999 all along. After answering, the trick's answer is 999; the range's true maximum is 7" h={280}>
      <g opacity={a}>
        <T x={30} y={52} s={12} f={C.latte}>array</T>
        {ARR.map((v, i) => (
          <g key={i}>
            <rect x={cx(i) - 24} y={34} width={48} height={26} fill="none" stroke={i >= 3 ? C.caramel : C.latte} strokeWidth={i >= 3 ? 2 : 1} />
            <T x={cx(i)} y={52} s={12} a="middle" f={C.crema}>{`${v}`}</T>
          </g>
        ))}
        <T x={cx(4)} y={24} s={11} a="middle" f={C.caramel}>range [3, 5]</T>
      </g>
      <g opacity={sums}>
        <T x={30} y={98} s={12} f={C.latte}>prefix sum</T>
        {pre.map((v, i) => {
          const k = carry(i, 0.8);
          return k > 0 ? (
            <T key={i} x={lerp(i > 0 ? cx(i - 1) : cx(0), cx(i), k)} y={98} s={12} a="middle" f={i === 2 || i === 5 ? C.cinnamon : C.latte} o={clamp(k * 2)}>{`${v}`}</T>
          ) : null;
        })}
        <T x={150} y={124} s={12} f={C.cinnamon} o={easeOut(seg(t, 1.5, 1.8))}>{`sum: ${pre[5]} − ${pre[2]} = ${pre[5] - pre[2]}, correct`}</T>
      </g>
      <g opacity={maxes}>
        <T x={30} y={168} s={12} f={C.latte}>prefix max</T>
        {pmax.map((v, i) => {
          const k = carry(i, 1.9);
          return k > 0 ? (
            <T key={i} x={lerp(i > 0 ? cx(i - 1) : cx(0), cx(i), k)} y={168} s={12} a="middle" f={C.latte} o={clamp(k * 2)}>{`${v}`}</T>
          ) : null;
        })}
        <T x={150} y={194} s={12} f={C.caramel} o={1 - rev}>max: undo the first three?</T>
      </g>
      {answered && <Draw pts={[[cx(0), 62], [cx(0), 76], [cx(5) + 30, 76], [cx(5) + 30, 182]]} t={s} from={0.1} to={0.9} stroke={C.cherryText} w={1.5} dash="4 3" />}
      {answered && <Reticle x={cx(3)} y={47} w={56} h={34} t={s} at={1.1} color={C.cinnamon} />}
      <g opacity={rev}>
        <T x={150} y={194} s={12} f={C.cherryText}>{`the trick says ${pmax[5]}`}</T>
        <T x={150} y={222} s={12} f={C.cinnamon}>{`true max of 7, 3, 5: ${Math.max(...ARR.slice(3))}`}</T>
        <T x={300} y={262} s={12} a="middle" f={C.latte}>max has no inverse to subtract</T>
      </g>
    </Svg>
  );
}

// 10 · A segment tree gets it right
export function SegmentTreeCorrect({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const end = easeOut(seg(t, 3.4, 3.9));
  // examples.py's SegmentTree(BREAKING_ARRAY), size 8: tree[1..15]; −inf shown as a dash.
  const tree: (number | null)[] = [null, 999, 999, 5, 999, 7, 5, null, 999, 1, 2, 7, 3, 5, null, null];
  const pos = (i: number): [number, number] => {
    const depth = Math.floor(Math.log2(i));
    const first = 2 ** depth;
    const span = 520 / first;
    return [40 + span * (i - first) + span / 2, 40 + depth * 52];
  };
  // Built bottom-up: each parent rises out of its two children, carrying their max. Then the query walks down from the
  // root to the two nodes that cover [3, 5] exactly, and their values drop to the answer.
  const rise = (depth: number) => (depth === 3 ? 1 : easeOut(seg(t, 0.6 + (2 - depth) * 0.4, 1.0 + (2 - depth) * 0.4)));
  const at = (i: number): [number, number] => {
    const [x, y] = pos(i);
    const depth = Math.floor(Math.log2(i));
    if (depth === 3) return [x, y];
    const k = rise(depth);
    return [x, lerp(pos(2 * i)[1], y, k)];
  };
  const used = [11, 6];
  const paths: [number, number][][] = [
    [1, 2, 5, 11].map((i) => pos(i)),
    [1, 3, 6].map((i) => pos(i)),
  ];
  const drop = (j: number) => easeInOut(seg(t, 2.9 + j * 0.15, 3.4 + j * 0.15));
  return (
    <Svg label="A segment tree over 999, 1, 2, 7, 3, 5, each parent the max of its two children. The query for range 3 to 5 takes the leaf 7 and the node covering 3 and 5, whose max is 5: the answer is 7, correct" h={280}>
      {tree.map((v, i) => {
        if (i === 0) return null;
        const [x, y] = at(i);
        const depth = Math.floor(Math.log2(i));
        const k = rise(depth);
        const hit = used.indexOf(i);
        const isHit = hit >= 0 && t >= 2.4 + hit * 0.4;
        return (
          <g key={i} opacity={a * (depth === 3 ? 1 : clamp(k * 2))}>
            {i > 1 && <line x1={at(i >> 1)[0]} y1={at(i >> 1)[1] + 12} x2={x} y2={y - 12} stroke={C.mocha} strokeWidth={1} opacity={rise(depth - 1)} />}
            <rect x={x - 22} y={y - 12} width={44} height={24} fill={C.band} stroke={isHit ? C.caramel : C.latte} strokeWidth={isHit ? 2.2 : 1} />
            <T x={x} y={y + 5} s={12} a="middle" f={isHit ? C.caramel : C.crema}>{v === null ? '–' : `${v}`}</T>
          </g>
        );
      })}
      {paths.map((p, j) => <Draw key={j} pts={p} t={t} from={2.0 + j * 0.4} to={2.4 + j * 0.4} stroke={C.caramel} w={1.6} />)}
      {used.map((i, j) => {
        const k = drop(j);
        if (k <= 0 || k >= 1) return null;
        const [x, y] = pos(i);
        return <T key={i} x={lerp(x, 90 + j * 40, k)} y={lerp(y + 5, 244, k)} s={12} a="middle" f={C.caramel}>{`${tree[i]}`}</T>;
      })}
      <Decode text="max(7, 5) = 7, correct" t={t} at={3.4} x={30} y={244} s={12} f={C.caramel} />
      <T x={30} y={270} s={11} f={C.latte} o={end}>only needs an associative combine; matched brute force, 20 cases</T>
    </Svg>
  );
}

// 11 · The weighted-mix thesis: three mixes, three winners
export function WeightedMixThesis({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const redis = easeOut(seg(t, 3.8, 4.5));
  const rows: [string, string[], number][] = [
    ['all lookups', ['1', '23.25', '10,000,000'], 0],
    ['60% ranges', ['6,000,000.4', '29.25', '10,000,000'], 1],
    ['leaderboard', ['5,000,000.5', '16.63', '6.66'], 2],
  ];
  const cols = [230, 350, 480];
  // Each mix slides in as a row; a single "winner" frame then travels to that row's cheapest structure, so the winner
  // visibly moves column as the mix moves. Last, the two structures of a mix that needs both slide together and link.
  const rowIn = (i: number) => easeOut(seg(t, 0.7 + i * 0.9, 1.1 + i * 0.9));
  const move = (i: number) => easeInOut(seg(t, 1.0 + i * 0.9, 1.5 + i * 0.9));
  let fx = cols[0], fy = 66;
  rows.forEach(([, , win], i) => {
    if (i === 0) return;
    const k = move(i);
    if (k > 0) {
      fx = lerp(cols[rows[i - 1][2]], cols[win], k);
      fy = lerp(66 + (i - 1) * 40, 66 + i * 40, k);
    }
  });
  const pair = easeInOut(seg(t, 3.9, 4.6));
  return (
    <Svg label="Cost per operation as frequency times cost, n = 10,000,000, k = 10. All lookups: hash 1, tree 23.25, heap 10,000,000; hash wins. Sixty percent ranges: tree 29.25 wins. A leaderboard of inserts and top-k: heap 6.66 wins. Then a hash table and a skip list kept together over one sorted set" h={290}>
      <g opacity={a}>
        <T x={30} y={28} s={11} f={C.latte}>Σ freq × cost</T>
        {['hash', 'tree', 'heap'].map((h, j) => (
          <T key={h} x={cols[j]} y={28} s={12} a="middle" f={C.crema}>{h}</T>
        ))}
      </g>
      {rows.map(([lab, vals, win], i) => {
        const y = 66 + i * 40;
        const k = rowIn(i);
        const won = i === 0 ? move(0) > 0 || t > 1.0 : move(i) >= 1;
        return (
          <g key={lab} opacity={clamp(k * 2)} transform={`translate(${((1 - k) * 24).toFixed(2)} 0)`}>
            <T x={30} y={y} s={12} f={C.latte}>{lab}</T>
            {vals.map((v, j) => (
              <g key={j}>
                {j === win && won && <rect x={cols[j] - 54} y={y - 16} width={108} height={24} fill="none" stroke={C.caramel} strokeWidth={1} opacity={0.5} />}
                <T x={cols[j]} y={y} s={12} a="middle" f={j === win && won ? C.caramel : C.latte}>{v}</T>
              </g>
            ))}
          </g>
        );
      })}
      {t > 1.0 && <rect x={fx - 54} y={fy - 16} width={108} height={24} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <g opacity={redis}>
        <T x={30} y={204} s={12} f={C.crema}>a mix that needs both:</T>
        <g transform={`translate(${lerp(-30, 0, pair).toFixed(2)} 0)`}>
          <rect x={60} y={218} width={150} height={28} fill="none" stroke={C.caramel} strokeWidth={1.4} />
          <T x={135} y={237} s={12} a="middle" f={C.caramel}>hash table</T>
        </g>
        <g transform={`translate(${lerp(30, 0, pair).toFixed(2)} 0)`}>
          <rect x={300} y={218} width={150} height={28} fill="none" stroke={C.caramel} strokeWidth={1.4} />
          <T x={375} y={237} s={12} a="middle" f={C.caramel}>skip list</T>
        </g>
        <Draw pts={[[210, 232], [300, 232]]} t={t} from={4.5} to={4.9} stroke={C.latte} w={1.2} dash="4 3" />
        <T x={255} y={274} s={11} a="middle" f={C.latte}>one sorted set, kept in sync</T>
      </g>
    </Svg>
  );
}

// 12 · Recap: a situation, not a table
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOutBack(seg(t, 1.0, 1.6));
  const end = easeOut(seg(t, 3.9, 4.4));
  // The table stays put; the situation is a single position that sprouts: its next situations slide out of it along
  // their edges, then each of those sprouts its own, the space growing faster than any table could be written.
  const g1 = easeOut(seg(t, 1.8, 2.5));
  const g2 = easeOut(seg(t, 2.6, 3.4));
  const kids = (x: number, y: number, dx: number) => [
    [x - dx, y + 46],
    [x, y + 46],
    [x + dx, y + 46],
  ];
  const l1 = kids(400, 60, 80);
  return (
    <Svg label="A structure holds data. A situation, a position with legal moves toward a goal, sprouts its next situations, and those sprout theirs: the space being searched is the situations themselves" h={260}>
      <g opacity={a}>
        <rect x={40} y={60} width={140} height={60} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={110} y={95} s={12} a="middle" f={C.latte}>data in a table</T>
      </g>
      <g opacity={clamp(b * 2)} transform={`translate(400 60) scale(${Math.max(0.01, b).toFixed(3)}) translate(-400 -60)`}>
        <circle cx={400} cy={60} r={10} fill={C.caramel} />
        <T x={420} y={44} s={11} f={C.caramel}>a position</T>
      </g>
      {l1.map(([x0, y0], i) => {
        const x = lerp(400, x0, g1), y = lerp(60, y0, g1);
        return (
          <g key={i} opacity={g1 > 0 ? 1 : 0}>
            <line x1={400} y1={70} x2={x} y2={y - 8} stroke={C.latte} strokeWidth={1.2} />
            <circle cx={x} cy={y} r={8} fill="none" stroke={C.crema} strokeWidth={1.4} />
            {kids(x0, y0, 24).map(([x2, y2], j) => {
              const cx2 = lerp(x0, x2, g2), cy2 = lerp(y0, y2, g2);
              return (
                <g key={j} opacity={g2 > 0 ? 1 : 0}>
                  <line x1={x0} y1={y0 + 8} x2={cx2} y2={cy2 - 6} stroke={C.mocha} strokeWidth={1} />
                  <circle cx={cx2} cy={cy2} r={6} fill="none" stroke={C.latte} strokeWidth={1} />
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={400} y={214} s={11} a="middle" f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>legal moves, toward a goal</T>
      <T x={300} y={246} s={13} a="middle" f={C.caramel} o={end}>next: modelling problems as graphs</T>
    </Svg>
  );
}
