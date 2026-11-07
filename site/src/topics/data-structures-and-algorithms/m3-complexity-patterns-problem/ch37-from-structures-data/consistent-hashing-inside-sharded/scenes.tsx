import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels; taupe = data on disk, not yet read back; caramel =
// the thing to look at; cinnamon (rare) = the system's modification set against the textbook;
// cherry/cherryText = the bad outcome (an overloaded node, keys that move).
//
// Every printed number is examples.py's or the sources': ten nodes and an eleventh, 16,384
// slots and the 1,480 a join moves, a hot key carrying a quarter of 40,000 requests, the
// busiest node at 2.93 times the average with one point per node and 3.22 times with a thousand,
// HAProxy's example factor of 150, 1.5 times the average. The ring positions are examples.py's
// own md5 hash of each node and of the hot key, drawn to scale (one token per node, and eight
// per node for the virtual-node picture). The keys that move on growth come from a seeded draw,
// and bounded-load placement depends on the seeded request order, so those are drawn as shape
// only, in the title's own words.

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

/** Question opacity: shown until the reveal starts, then gone at once. */
const rev = (ask: number, r: number) => (r > 0 ? 0 : ask);

/** One token per node: [degrees around the ring, node number], from examples.py's md5 positions. */
const TOKENS: [number, number][] = [
  [0.2, 7], [9.0, 4], [68.0, 0], [121.1, 8], [129.7, 6], [209.8, 5], [214.7, 3], [314.7, 1], [315.9, 9], [336.3, 2],
];
const NEW_TOKEN = 170.4; // node-10
const HOT_DEG = 316.8; // the hot key; its first token clockwise is node 2's at 336.3
/** Eight tokens per node, the same hash. */
const VTOKENS: [number, number][] = [
  [0.1, 8], [0.2, 7], [0.8, 8], [6.5, 6], [9.0, 4], [10.6, 6], [17.5, 0], [31.0, 5], [48.2, 7], [50.7, 8], [51.5, 2], [57.4, 1], [59.4, 1], [68.0, 0], [71.1, 9], [76.0, 8],
  [77.5, 3], [81.2, 2], [91.6, 5], [96.5, 0], [97.3, 0], [97.3, 3], [101.3, 4], [103.9, 4], [104.9, 8], [105.9, 3], [106.0, 4], [106.6, 6], [121.1, 8], [124.2, 2], [129.7, 6], [132.3, 9],
  [133.1, 2], [137.9, 6], [141.9, 8], [147.8, 4], [149.4, 2], [151.9, 5], [154.9, 3], [161.1, 1], [161.7, 0], [173.1, 7], [176.7, 1], [179.4, 9], [181.0, 1], [189.6, 9], [196.1, 0], [201.4, 6],
  [209.8, 5], [214.7, 3], [216.4, 9], [221.0, 2], [221.5, 9], [230.9, 7], [233.9, 1], [238.9, 5], [241.0, 6], [249.7, 7], [260.0, 7], [264.5, 2], [266.9, 5], [278.4, 5], [283.8, 9], [290.3, 6],
  [294.6, 7], [305.6, 0], [305.7, 4], [311.6, 1], [312.0, 7], [314.7, 1], [315.9, 9], [324.9, 3], [336.1, 4], [336.3, 2], [336.3, 4], [338.8, 3], [342.3, 3], [345.7, 8], [346.9, 0], [353.0, 5],
];
/** Each node's load as a multiple of the average, the 40,000-request stream with the hot key: one token per node, then a thousand. */
const LOAD_ONE = [1.23, 2.09, 2.93, 0.1, 0.19, 1.68, 0.18, 0.5, 1.08, 0.02];
const LOAD_THOUSAND = [0.74, 3.22, 0.8, 0.77, 0.71, 0.76, 0.77, 0.73, 0.76, 0.73];

const pt = (cx: number, cy: number, r: number, deg: number): [number, number] => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];

/** An arc along the ring from a to b degrees, clockwise. */
function arc(cx: number, cy: number, r: number, a: number, b: number) {
  const [x1, y1] = pt(cx, cy, r, a);
  const [x2, y2] = pt(cx, cy, r, b);
  const large = (b - a + 360) % 360 > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function Ring({ cx, cy, r, o = 1, tokens = TOKENS, tick = 7, hot = 0, hotFill = C.caramel, tokenFill }: { cx: number; cy: number; r: number; o?: number; tokens?: [number, number][]; tick?: number; hot?: number; hotFill?: string; tokenFill?: (n: number, i: number) => string }) {
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.mocha} strokeWidth={2} />
      {tokens.map(([d, n], i) => {
        const [x1, y1] = pt(cx, cy, r - tick, d);
        const [x2, y2] = pt(cx, cy, r + tick, d);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={tokenFill ? tokenFill(n, i) : C.crema} strokeWidth={2} />;
      })}
      {hot > 0 && <circle cx={pt(cx, cy, r, HOT_DEG)[0]} cy={pt(cx, cy, r, HOT_DEG)[1]} r={7} fill={hotFill} opacity={hot} />}
    </g>
  );
}

/** Ten load bars, heights as multiples of the average, with the average line. */
function LoadBars({ x0, y0, loads, o = 1, grow = 1, hl, unit = 26, label }: { x0: number; y0: number; loads: number[]; o?: number; grow?: number; hl?: number; unit?: number; label?: string }) {
  return (
    <g opacity={o}>
      {loads.map((v, i) => (
        <rect key={i} x={x0 + i * 22} y={y0 - v * unit * grow} width={16} height={v * unit * grow} fill={i === hl ? C.cherry : C.crema} />
      ))}
      <line x1={x0 - 6} y1={y0 - unit} x2={x0 + 220} y2={y0 - unit} stroke={C.latte} strokeWidth={1} strokeDasharray="4 3" />
      <line x1={x0 - 6} y1={y0} x2={x0 + 220} y2={y0} stroke={C.mocha} />
      {label && <T x={x0 + 108} y={y0 + 20} s={12} a="middle" f={C.latte}>{label}</T>}
    </g>
  );
}

// 1 · Hook: ten nodes become eleven, and one hot key none of the schemes notices
export function GrowthHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const grow = easeOut(seg(t, 1.0, 1.8));
  const hot = easeOut(seg(t, 2.2, 3.0));
  const ask = easeOut(seg(t, 3.4, 4.2));
  const many = answered ? easeOut(seg(s, 0.2, 1.2)) : 0;
  const lab = answered ? easeOut(seg(s, 1.6, 2.4)) : 0;
  const cx = 160;
  const cy = 130;
  const r = 90;
  return (
    <Svg label="A ring of ten nodes, and an eleventh joining. One hot key sits at its own point. After answering: with eight times the tokens the boundaries move everywhere, but the hot key's point stays where it was, still owned by exactly one node" h={290}>
      <Ring cx={cx} cy={cy} r={r} o={a * (1 - many)} hot={hot} hotFill={C.cherryText} />
      <Ring cx={cx} cy={cy} r={r} o={many} tokens={VTOKENS} tick={5} hot={1} hotFill={C.cherryText} />
      {grow > 0 && (
        <line x1={pt(cx, cy, r - 9, NEW_TOKEN)[0]} y1={pt(cx, cy, r - 9, NEW_TOKEN)[1]} x2={pt(cx, cy, r + 9, NEW_TOKEN)[0]} y2={pt(cx, cy, r + 9, NEW_TOKEN)[1]} stroke={C.cinnamon} strokeWidth={3} opacity={grow * (1 - many)} />
      )}
      <g opacity={a}>
        <T x={330} y={60} s={12} f={C.latte}>10 nodes on a ring</T>
        <T x={330} y={86} s={12} f={C.cinnamon} o={grow}>node 11 joins</T>
        <T x={330} y={112} s={12} f={C.cherryText} o={hot}>hot key: 1/4 of traffic</T>
      </g>
      <T x={300} y={252} s={13} a="middle" f={C.caramel} o={rev(ask, many)}>a thousand points per node: does it help?</T>
      <g opacity={lab}>
        <T x={330} y={150} s={12} f={C.crema}>more points: boundaries move</T>
        <T x={330} y={176} s={12} f={C.cherryText}>the hot key's point does not</T>
        <T x={300} y={252} s={13} a="middle" f={C.caramel}>still one key, one point, one node</T>
      </g>
    </Svg>
  );
}

// 2 · Three real answers to one question
export function ThreeChoices({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const k = stepIdx(t, 0.9, 3.3, 3);
  const key = easeInOut(seg(t, 3.5, 4.4));
  return (
    <Svg label="Which machine owns this key? Cassandra's token ring, Redis Cluster's fixed slot table, Kafka's modulo hashing, each mapping the same key to one machine its own way" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>which machine owns this key?</T>
      <g opacity={k >= 0 ? 1 : 0}>
        <Ring cx={100} cy={120} r={50} tick={5} />
        <T x={100} y={206} s={12} a="middle" f={C.crema}>Cassandra: ring</T>
      </g>
      <g opacity={k >= 1 ? 1 : 0}>
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={240 + (i % 6) * 21} y={78 + Math.floor(i / 6) * 21} width={17} height={17} fill={[C.crema, C.latte, C.taupe][i % 3]} opacity={0.8} />
        ))}
        <T x={302} y={206} s={12} a="middle" f={C.crema}>Redis: slot table</T>
      </g>
      <g opacity={k >= 2 ? 1 : 0}>
        <T x={500} y={110} s={14} a="middle" f={C.crema} serif italic>h(key) mod n</T>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={440 + i * 25} y={130} width={20} height={20} fill={C.roast} stroke={C.crema} />
        ))}
        <T x={500} y={206} s={12} a="middle" f={C.crema}>Kafka: modulo</T>
      </g>
      <g opacity={key}>
        <circle cx={pt(100, 120, 50, HOT_DEG)[0]} cy={pt(100, 120, 50, HOT_DEG)[1]} r={5} fill={C.caramel} />
        <rect x={282} y={99} width={17} height={17} fill={C.caramel} />
        <rect x={490} y={130} width={20} height={20} fill={C.caramel} />
        <T x={300} y={248} s={13} a="middle" f={C.caramel}>one key, three rules, one owner each</T>
      </g>
    </Svg>
  );
}

// 3 · Cassandra: a token ring; several tokens per node even out a small cluster
export function CassandraRing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const big = easeOut(seg(t, 1.2, 2.0));
  const v = easeOut(seg(t, 2.6, 3.6));
  const note = easeOut(seg(t, 3.9, 4.6));
  const cx = 150;
  const cy = 140;
  const r = 90;
  return (
    <Svg label="Consistent hashing using a token ring: one token per node leaves wildly uneven arcs, node 1 owning a wide stretch and node 9 almost nothing. Several tokens per node, virtual nodes, cut the ring into many small arcs and even it out" h={280}>
      <T x={300} y={24} s={12} a="middle" f={C.crema} o={a}>consistent hashing using a token ring</T>
      <Ring cx={cx} cy={cy} r={r} o={a * (1 - v)} />
      <g opacity={big * (1 - v)}>
        <path d={arc(cx, cy, r, 214.7, 314.7)} fill="none" stroke={C.cherryText} strokeWidth={5} />
        <path d={arc(cx, cy, r, 314.7, 315.9)} fill="none" stroke={C.cinnamon} strokeWidth={7} />
        <T x={330} y={110} s={12} f={C.cherryText}>one token each: a wide arc</T>
        <T x={330} y={136} s={12} f={C.cinnamon}>next to a sliver</T>
      </g>
      <Ring cx={cx} cy={cy} r={r} o={v} tokens={VTOKENS} tick={5} tokenFill={(n) => (n % 2 ? C.crema : C.latte)} />
      <g opacity={v}>
        <T x={330} y={110} s={12} f={C.caramel}>virtual nodes: several</T>
        <T x={330} y={136} s={12} f={C.caramel}>tokens per node</T>
      </g>
      <T x={300} y={262} s={12} a="middle" f={C.latte} o={note}>many small arcs per node: balance on a small cluster</T>
    </Svg>
  );
}

// 4 · Redis Cluster: a fixed table of slots, each owned by a master
export function RedisSlotTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const own = stepIdx(t, 1.0, 2.6, 10);
  const key = easeInOut(seg(t, 3.0, 4.0));
  const note = easeOut(seg(t, 4.2, 4.9));
  const cols = 32;
  const rows = 4;
  return (
    <Svg label="16,384 slots, drawn as a strip of blocks. Each master node takes a subset of slots. A key's slot is CRC16 of the key modulo 16,384: a slot number picked directly, no neighbour searched for" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>16,384 slots, a fixed table</T>
      {Array.from({ length: cols * rows }, (_, i) => {
        const node = i % 10;
        return <rect key={i} x={44 + (i % cols) * 16} y={44 + Math.floor(i / cols) * 16} width={13} height={13} fill={node <= own ? [C.crema, C.latte, C.taupe, C.mocha][node % 4] : C.cocoa} opacity={a} />;
      })}
      <T x={300} y={128} s={12} a="middle" f={C.latte} o={own >= 9 ? 1 : 0}>each master owns a subset of slots</T>
      <g opacity={key}>
        <T x={300} y={170} s={14} a="middle" f={C.crema}>HASH_SLOT = CRC16(key) mod 16384</T>
        <line x1={300} y1={178} x2={lerp(300, 44 + 21 * 16 + 6, key)} y2={lerp(178, 98, key)} stroke={C.caramel} strokeWidth={2} />
        <rect x={44 + 21 * 16 - 1} y={44 + 3 * 16 - 1} width={15} height={15} fill="none" stroke={C.caramel} strokeWidth={2} />
      </g>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={note}>a box number, picked directly</T>
      <T x={300} y={252} s={12} a="middle" f={C.latte} o={note}>not a ring: no neighbour search</T>
    </Svg>
  );
}

// 5 · Kafka: hash modulo the partition count, no stability at all
export function KafkaModulo({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const map = easeOut(seg(t, 0.9, 1.8));
  const grow = easeInOut(seg(t, 2.2, 3.4));
  const note = easeOut(seg(t, 3.6, 4.3));
  const keys = 8;
  // examples.py's own hash of the stream's keys req-0 to req-7, modulo 10 and then modulo 11.
  const before = [7, 1, 9, 8, 0, 0, 0, 6];
  const after = [7, 7, 2, 3, 9, 6, 1, 0];
  const px = (p: number, n: number) => 60 + (p + 0.5) * (480 / n);
  return (
    <Svg label="Eight keys map to partitions by hash modulo the partition count. When ten partitions become eleven, seven of the eight land in a different partition" h={270}>
      <T x={300} y={24} s={13} a="middle" f={C.crema} o={a}>partition = hash(key) mod count</T>
      {Array.from({ length: keys }, (_, i) => (
        <circle key={i} cx={90 + i * 60} cy={60} r={7} fill={C.crema} opacity={a} />
      ))}
      {Array.from({ length: keys }, (_, i) => {
        const x = lerp(px(before[i], 10), px(after[i], 11), grow);
        const moved = before[i] !== after[i];
        return <line key={i} x1={90 + i * 60} y1={68} x2={x} y2={150} stroke={grow > 0.5 && moved ? C.cherryText : C.latte} strokeWidth={1.5} opacity={map} />;
      })}
      {Array.from({ length: 11 }, (_, p) => (
        <rect key={p} x={lerp(60 + p * 48, 60 + p * (480 / 11), grow) + 2} y={150} width={lerp(44, 480 / 11 - 4, grow)} height={22} fill={C.roast} stroke={p === 10 ? C.cinnamon : C.crema} opacity={p === 10 ? grow : a} />
      ))}
      <T x={300} y={200} s={12} a="middle" f={C.latte} o={a}>{grow > 0.5 ? '11 partitions' : '10 partitions'}</T>
      <T x={300} y={240} s={13} a="middle" f={C.cherryText} o={note}>change the count: almost every key moves</T>
    </Svg>
  );
}

// 6 · Predict: ten nodes become eleven; how much does each scheme move?
export function PredictGrowth({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const ask = easeOut(seg(t, 1.4, 2.2));
  const g = answered ? easeOut(seg(s, 0.2, 1.6)) : 0;
  const rows: [string, number, string][] = [
    ['ring', 0.11, C.crema],
    ['slot table', 0.09, C.cinnamon],
    ['modulo', 0.91, C.cherry],
  ];
  return (
    <Svg label="Ten nodes become eleven: ring, slot table and modulo hashing, each with a bar for the share of keys that moves. After answering: the ring's and the slot table's bars stay short, modulo's runs nearly the whole way" h={260}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>10 nodes → 11: share of keys that moves</T>
      {rows.map(([n, v, col], i) => (
        <g key={n} opacity={a}>
          <T x={150} y={76 + i * 44} s={13} a="end" f={C.crema}>{n}</T>
          <rect x={164} y={60 + i * 44} width={380} height={22} fill={C.cocoa} />
          <rect x={164} y={60 + i * 44} width={380 * v * g} height={22} fill={col} />
          <T x={554} y={76 + i * 44} s={13} a="end" f={C.taupe} o={g > 0 ? 0 : 1}>?</T>
        </g>
      ))}
      <T x={300} y={230} s={13} a="middle" f={C.caramel} o={rev(ask, g)}>how much of the key space moves?</T>
      <T x={300} y={230} s={13} a="middle" f={C.caramel} o={g >= 1 ? 1 : 0}>two small shares, one almost everything</T>
    </Svg>
  );
}

// 7 · Measured: one key in nine, 1,480 of 16,384 slots, almost every key
export function GrowthMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const k = stepIdx(t, 0.8, 3.2, 3);
  const gap = easeOut(seg(t, 3.6, 4.4));
  const rows: [string, number, string, string][] = [
    ['ring', 0.11, C.crema, 'about one key in nine'],
    ['slot table', 0.09, C.cinnamon, '1,480 of 16,384 slots'],
    ['modulo', 0.91, C.cherry, 'almost every key'],
  ];
  return (
    <Svg label="Measured on the growth from ten nodes to eleven: the ring moves about one key in nine; the slot table moves 1,480 of 16,384 slots, a comparably small share; modulo hashing moves almost every key" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>measured: 10 nodes → 11</T>
      {rows.map(([n, v, col, words], i) => {
        const on = i <= k ? easeOut(seg(t, 0.8 + i * 0.8, 1.6 + i * 0.8)) : 0;
        return (
          <g key={n} opacity={a}>
            <T x={150} y={70 + i * 56} s={13} a="end" f={C.crema}>{n}</T>
            <rect x={164} y={54 + i * 56} width={380} height={22} fill={C.cocoa} />
            <rect x={164} y={54 + i * 56} width={380 * v * on} height={22} fill={col} />
            <T x={164} y={94 + i * 56} s={12} f={i === 2 ? C.cherryText : C.latte} o={on}>{words}</T>
          </g>
        );
      })}
      <T x={300} y={240} s={13} a="middle" f={C.caramel} o={gap}>two built for change, one never was</T>
    </Svg>
  );
}

// 8 · Rebalancing: the ring's new node claims a range itself; the slot table moves slots by hand
export function Rebalancing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const claim = easeInOut(seg(t, 0.9, 2.2));
  const b = easeOut(seg(t, 2.4, 3.0));
  const mig = easeOut(seg(t, 3.0, 3.8));
  const imp = easeOut(seg(t, 3.8, 4.6));
  const moved = easeInOut(seg(t, 4.6, 5.4));
  const cx = 130;
  const cy = 130;
  const r = 80;
  return (
    <Svg label="Left: node 11's token lands on the ring and automatically claims the arc behind it from its neighbour. Right: an operator moves one slot at a time, the source marked migrating, the target importing, before the slot is fully moved" h={280}>
      <g opacity={a}>
        <T x={130} y={24} s={12} a="middle" f={C.crema}>ring: automatic</T>
        <Ring cx={cx} cy={cy} r={r} tick={6} />
        <path d={arc(cx, cy, r, 129.7, lerp(129.7, NEW_TOKEN, claim))} fill="none" stroke={C.cinnamon} strokeWidth={5} />
        <line x1={pt(cx, cy, r - 9, NEW_TOKEN)[0]} y1={pt(cx, cy, r - 9, NEW_TOKEN)[1]} x2={pt(cx, cy, r + 9, NEW_TOKEN)[0]} y2={pt(cx, cy, r + 9, NEW_TOKEN)[1]} stroke={C.cinnamon} strokeWidth={3} />
        <T x={130} y={240} s={12} a="middle" f={C.cinnamon} o={claim}>claims its arc</T>
      </g>
      <line x1={270} y1={20} x2={270} y2={250} stroke={C.mocha} opacity={b} />
      <g opacity={b}>
        <T x={430} y={24} s={12} a="middle" f={C.crema}>slot table: by an operator</T>
        <rect x={300} y={70} width={100} height={60} fill="none" stroke={C.crema} />
        <T x={350} y={150} s={12} a="middle" f={C.latte}>source</T>
        <rect x={460} y={70} width={100} height={60} fill="none" stroke={C.cinnamon} />
        <T x={510} y={150} s={12} a="middle" f={C.latte}>new node</T>
        <rect x={lerp(334, 494, moved)} y={86} width={32} height={28} fill={C.caramel} />
      </g>
      <T x={350} y={190} s={12} a="middle" f={C.crema} o={mig}>MIGRATING</T>
      <T x={510} y={190} s={12} a="middle" f={C.cinnamon} o={imp}>IMPORTING</T>
      <T x={430} y={240} s={12} a="middle" f={C.caramel} o={moved}>one slot moved</T>
    </Svg>
  );
}

// 9 · The shared blind spot: keys are balanced, load is not
export function SharedBlindSpot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const g = easeOut(seg(t, 0.9, 2.4));
  const hot = easeOut(seg(t, 2.6, 3.4));
  const x0 = 190;
  return (
    <Svg label="Load on ten nodes under the 40,000-request stream: the hot key's quarter of all traffic lands on node 2, which carries 2.93 times the average" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>load per node, one hot key in the stream</T>
      <LoadBars x0={x0} y0={200} loads={LOAD_ONE} o={a} grow={g} hl={hot > 0.5 ? 2 : undefined} unit={42} />
      <T x={x0 - 12} y={162} s={12} a="end" f={C.latte} o={a}>average</T>
      <g opacity={hot}>
        <T x={x0 + 2 * 22 + 8} y={64} s={13} f={C.cherryText}>node 2: 2.93× average</T>
        <T x={300} y={248} s={13} a="middle" f={C.crema}>keys balanced, load never is</T>
      </g>
    </Svg>
  );
}

// 10 · A thousand points per node: the hot key still hashes to one point
export function VirtualNodesDontHelp({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const g1 = easeOut(seg(t, 0.8, 2.0));
  const g2 = easeOut(seg(t, 2.2, 3.4));
  const note = easeOut(seg(t, 3.8, 4.6));
  return (
    <Svg label="One token per node: busiest node 2 at 2.93 times the average. A thousand per node: the ordinary keys even out, but the hot key now lands on node 1, at 3.22 times the average" h={280}>
      <T x={150} y={24} s={12} a="middle" f={C.latte} o={a}>one point per node</T>
      <T x={450} y={24} s={12} a="middle" f={C.latte} o={g2 > 0 ? 1 : 0}>a thousand points per node</T>
      <LoadBars x0={40} y0={200} loads={LOAD_ONE} o={a} grow={g1} hl={2} unit={42} />
      <LoadBars x0={340} y0={200} loads={LOAD_THOUSAND} o={g2 > 0 ? 1 : 0} grow={g2} hl={1} unit={42} />
      <T x={150} y={228} s={13} a="middle" f={C.cherryText} o={g1 >= 1 ? 1 : 0}>busiest: 2.93×</T>
      <T x={450} y={228} s={13} a="middle" f={C.cherryText} o={g2 >= 1 ? 1 : 0}>busiest: 3.22×</T>
      <T x={300} y={262} s={13} a="middle" f={C.caramel} o={note}>the owner changed, the overload did not</T>
    </Svg>
  );
}

// 11 · HAProxy's hash-balance-factor: skip a node over its share, try the next candidate
export function BoundedLoadRule({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const req = easeInOut(seg(t, 1.0, 2.0));
  const skip = easeOut(seg(t, 2.2, 2.8));
  const walk = easeInOut(seg(t, 3.0, 4.2));
  const note = easeOut(seg(t, 4.4, 5.1));
  const cx = 150;
  const cy = 140;
  const r = 90;
  const hotP = pt(cx, cy, r, HOT_DEG);
  const n2 = pt(cx, cy, r, 336.3);
  const n7 = pt(cx, cy, r, 360.2);
  return (
    <Svg label="A request for the hot key walks clockwise to node 2, its first choice. Node 2 is already over 1.5 times the average, so it is skipped and the next node the same walk reaches, node 7, takes the request. The factor is off by default" h={280}>
      <T x={300} y={24} s={12} a="middle" f={C.crema} o={a}>hash-balance-factor</T>
      <Ring cx={cx} cy={cy} r={r} o={a} hot={1} hotFill={C.caramel} tokenFill={(n) => (n === 2 && skip > 0.5 ? C.cherryText : n === 7 && walk >= 1 ? C.caramel : C.crema)} />
      <path d={arc(cx, cy, r, HOT_DEG, lerp(HOT_DEG, 336.3, req))} fill="none" stroke={C.caramel} strokeWidth={4} opacity={req > 0 ? 1 : 0} />
      <path d={arc(cx, cy, r, 336.3, lerp(336.3, 360.2, walk))} fill="none" stroke={C.caramel} strokeWidth={4} opacity={walk > 0 ? 1 : 0} />
      <circle cx={n2[0]} cy={n2[1]} r={10} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={skip} />
      <circle cx={n7[0]} cy={n7[1]} r={10} fill="none" stroke={C.caramel} strokeWidth={2} opacity={walk >= 1 ? 1 : 0} />
      <circle cx={hotP[0]} cy={hotP[1]} r={4} fill={C.caramel} opacity={a} />
      <g opacity={a}>
        <T x={300} y={90} s={12} f={C.latte}>first choice: node 2</T>
      </g>
      <T x={300} y={118} s={12} f={C.cherryText} o={skip}>over 1.5× average: skip</T>
      <T x={300} y={146} s={12} f={C.caramel} o={walk >= 1 ? 1 : 0}>next candidate: node 7</T>
      <T x={300} y={200} s={13} f={C.crema} o={note}>a cap on load</T>
      <T x={300} y={226} s={12} f={C.latte} o={note}>off by default</T>
    </Svg>
  );
}

// 12 · Measured: plain placement against bounded load at factor 150
export function BoundedLoadMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const g1 = easeOut(seg(t, 0.8, 2.0));
  const g2 = easeOut(seg(t, 2.2, 3.4));
  const cap = easeOut(seg(t, 3.6, 4.3));
  const unit = 42;
  // Bounded-load bars depend on the seeded request order: drawn as shape only, the busiest at the cap.
  const BOUNDED_SHAPE = [1.23, 1.5, 1.5, 0.28, 0.61, 1.5, 0.18, 1.5, 1.08, 0.61];
  return (
    <Svg label="Plain placement: node 2 at 2.93 times the average. Bounded load at factor 150: the busiest nodes held at the 1.5 times average cap, the hot key's overflow sent on to the next candidates" h={280}>
      <T x={150} y={24} s={12} a="middle" f={C.latte} o={a}>plain placement</T>
      <T x={450} y={24} s={12} a="middle" f={C.latte} o={g2 > 0 ? 1 : 0}>bounded load, factor 150</T>
      <LoadBars x0={40} y0={200} loads={LOAD_ONE} o={a} grow={g1} hl={2} unit={unit} />
      <LoadBars x0={340} y0={200} loads={BOUNDED_SHAPE} o={g2 > 0 ? 1 : 0} grow={g2} unit={unit} />
      <T x={150} y={228} s={13} a="middle" f={C.cherryText} o={g1 >= 1 ? 1 : 0}>busiest: 2.93×</T>
      <g opacity={cap}>
        <line x1={334} y1={200 - 1.5 * unit} x2={566} y2={200 - 1.5 * unit} stroke={C.caramel} strokeWidth={2} />
        <T x={566} y={200 - 1.5 * unit - 8} s={12} a="end" f={C.caramel}>cap: 1.5×</T>
        <T x={450} y={228} s={13} a="middle" f={C.caramel}>busiest: at the cap</T>
        <T x={300} y={262} s={12} a="middle" f={C.latte}>a limit set on purpose, not found by a hash</T>
      </g>
    </Svg>
  );
}

// 13 · Recap: three placements, one shared vulnerability, one fix
export function Recap({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 2.2, 3);
  const bar = easeOut(seg(t, 2.6, 3.4));
  const fix = easeOut(seg(t, 3.6, 4.3));
  return (
    <Svg label="Ring, slot table, modulo: each places keys, and each puts the hot key on one node. The fix is a cap on load across every placement" h={260}>
      {['ring', 'slot table', 'modulo'].map((n, i) => (
        <g key={n} opacity={i <= k ? 1 : 0}>
          <rect x={60 + i * 170} y={50} width={140} height={44} fill={C.roast} stroke={C.crema} />
          <T x={130 + i * 170} y={77} s={13} a="middle" f={C.crema}>{n}</T>
          <rect x={115 + i * 170} y={112} width={30} height={60 * bar} fill={C.cherry} />
        </g>
      ))}
      <T x={300} y={196} s={12} a="middle" f={C.cherryText} o={bar}>the same hot node, every time</T>
      <line x1={50} y1={142} x2={550} y2={142} stroke={C.caramel} strokeWidth={2} opacity={fix} />
      <T x={300} y={236} s={13} a="middle" f={C.caramel} o={fix}>the fix: a cap on load, not a better placement</T>
    </Svg>
  );
}

// 14 · Handoff: partial answers per machine, combined without the raw rows
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const part = easeOut(seg(t, 0.9, 1.8));
  const merge = easeInOut(seg(t, 2.2, 3.4));
  const next = easeOut(seg(t, 3.8, 4.5));
  return (
    <Svg label="Three machines each hold their own rows and compute a small partial answer. The partial answers travel to one place and merge into one, without the raw rows moving" h={260}>
      {[0, 1, 2].map((m) => (
        <g key={m} opacity={a}>
          <rect x={60 + m * 180} y={40} width={120} height={60} fill="none" stroke={C.mocha} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={70 + m * 180 + (i % 4) * 26} y={50 + Math.floor(i / 4) * 22} width={20} height={14} fill={C.taupe} />
          ))}
          <rect x={lerp(105 + m * 180, 255 + m * 15, merge)} y={lerp(112, 168, merge)} width={30} height={16} fill={C.caramel} opacity={part} />
        </g>
      ))}
      <rect x={248} y={162} width={104} height={28} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={merge} />
      <T x={300} y={212} s={12} a="middle" f={C.latte} o={merge}>partial answers merged, raw rows stay put</T>
      <T x={300} y={244} s={13} a="middle" f={C.caramel} o={next}>next: structures that can be merged</T>
    </Svg>
  );
}
