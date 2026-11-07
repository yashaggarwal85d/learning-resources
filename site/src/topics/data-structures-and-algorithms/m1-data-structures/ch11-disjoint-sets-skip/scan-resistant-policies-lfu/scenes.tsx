import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's shared language): crema = an entry or stored key; latte = secondary
// labels; caramel = the thing to look at (the second question, the entry being followed); cinnamon = the alternative
// being compared (the ghost lists' names, a fading tally); cherryText = the bad outcome (the flush, the stuck tally).
// Every printed number is examples.py's or the previous topic's: hit rate on the first 300 requests after warm-up,
// without and with the scan (LRU 0.4667 to 0.3767, CLOCK 0.4767 to 0.3733, LFU with decay 0.4267 both, 2Q 0.4800 to
// 0.5033, ARC 0.4667 both, LIRS 0.5000 both); the decay tick every 1,000 operations; ARC's hand trace on four slots
// (a, b, c, d; a again; e; b again: p from 0 to 1). The 2Q sizes (25% and 50%) are Johnson and Shasha's and Redis's
// 8-bit counter (at most 255) is redis.conf's, both quoted in SOURCES.md. Tallies are drawn as shape only.

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

function Box({ x, y, k, w = 44, h = 28, c = C.crema, o = 1, s = 13, dash, sw = 1.3 }: { x: number; y: number; k: string; w?: number; h?: number; c?: string; o?: number; s?: number; dash?: string; sw?: number }) {
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} fill={C.roast} stroke={c} strokeWidth={sw} strokeDasharray={dash} />
      <T x={x} y={y + 5} s={s} f={c} a="middle">{k}</T>
    </g>
  );
}

// 1 · Can a cache remember something besides recency? The last topic's flush replays: eight popular pages pushed out by
// a one-time scan, the hit rate dropping from 0.4667 to 0.3767. One question only, "how long ago?"; a second slot for a
// second question opens beside it.
export function Hook({ t }: StepCtx) {
  const SX = (i: number) => 54 + i * 62;
  const flushAt = (i: number) => 0.3 + i * 0.13;
  const bar = easeOut(seg(t, 1.5, 1.8));
  const drop = easeInOut(seg(t, 1.9, 2.5));
  const q1 = easeOut(seg(t, 2.8, 3.1));
  const q2 = easeOut(seg(t, 3.5, 3.9));
  const W = (v: number) => (v / 0.5) * 360;
  return (
    <Svg label="Last topic's flush: a one-time scan pushes all eight popular pages out and the hit rate drops from 0.4667 to 0.3767; the policy only ever asked how long ago, and a slot for a second question opens" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>last time: one big scan through LRU</T>
      {Array.from({ length: 8 }, (_, i) => {
        const k = clamp((t - flushAt(i)) / 0.13);
        return (
          <g key={i}>
            <rect x={SX(i) - 26} y={40} width={52} height={32} rx={4} fill={C.roast} stroke={k > 0 ? C.cherryText : C.mocha} strokeWidth={1.2} />
            {k < 0.5 ? <T x={SX(i)} y={61} s={12} f={C.crema} a="middle">hot</T> : <T x={SX(i)} y={61} s={12} f={C.latte} a="middle">scan</T>}
          </g>
        );
      })}
      <g opacity={bar}>
        <T x={30} y={104} s={12} f={C.latte}>hit rate after</T>
        <rect x={170} y={94} width={lerp(W(0.4667), W(0.3767), drop)} height={14} rx={2} fill={drop > 0 ? C.cherryText : C.crema} />
        <T x={170 + lerp(W(0.4667), W(0.3767), drop) + 8} y={106} s={12} f={drop > 0.5 ? C.cherryText : C.crema}>{drop > 0.5 ? '0.3767' : '0.4667'}</T>
      </g>
      <g opacity={q1}>
        <rect x={30} y={150} width={240} height={60} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
        <circle cx={60} cy={180} r={14} fill="none" stroke={C.latte} strokeWidth={1.4} />
        <line x1={60} y1={180} x2={60} y2={170} stroke={C.latte} strokeWidth={1.4} />
        <line x1={60} y1={180} x2={68} y2={184} stroke={C.latte} strokeWidth={1.4} />
        <T x={86} y={185} s={13} f={C.crema}>how long ago?</T>
      </g>
      <g opacity={q2}>
        <rect x={300} y={150} width={240} height={60} rx={6} fill={C.roast} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="5 4" />
        <T x={420} y={187} s={18} f={C.caramel} a="middle">?</T>
      </g>
      <T x={30} y={256} s={13} f={C.caramel} o={q2}>give the cache a second question</T>
    </Svg>
  );
}

// 2 · Evict the least frequently used. Four popular pages keep getting touched, their tallies climbing; two seats take
// newcomers. The scan's pages arrive with a tally of one each and evict one another, never a popular page.
export function LFU({ t }: StepCtx) {
  const SX = (i: number) => 70 + i * 80;
  const touches = (i: number) => (i < 4 ? Math.min(6, Math.floor(clamp(seg(t, 0.2 + i * 0.1, 1.6 + i * 0.1)) * (6 - i))) : 0);
  const scanAt = (j: number) => 1.9 + j * 0.3;
  const nScan = [0, 1, 2, 3, 4, 5].filter((j) => t >= scanAt(j)).length;
  const scanSlot = (j: number) => 4 + (j % 2);
  return (
    <Svg label="Four popular pages' tallies climb with every touch; the scan's pages arrive with a tally of one and only evict each other, never a popular page" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>evict the smallest tally</T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const n = touches(i);
        const newest = i >= 4 ? [...Array(nScan).keys()].reverse().find((j) => scanSlot(j) === i) : undefined;
        return (
          <g key={i}>
            <rect x={SX(i) - 30} y={150} width={60} height={34} rx={4} fill={C.roast} stroke={i < 4 ? C.crema : C.mocha} strokeWidth={1.3} />
            <T x={SX(i)} y={172} s={12} f={i < 4 ? C.crema : C.latte} a="middle">{i < 4 ? 'hot' : newest !== undefined ? 'scan' : 'free'}</T>
            {i < 4 && Array.from({ length: n }, (_, k) => <rect key={k} x={SX(i) - 10} y={136 - k * 14} width={20} height={10} rx={2} fill={C.caramel} />)}
            {newest !== undefined && <rect x={SX(i) - 10} y={136} width={20} height={10} rx={2} fill={C.latte} />}
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const k = easeInOut(seg(t, scanAt(j) - 0.25, scanAt(j)));
        const out = j >= 2 && t >= scanAt(j) ? clamp((t - scanAt(j)) / 0.3) : 0;
        if (k <= 0 || k >= 1) return out > 0 && out < 1 ? <T key={j} x={SX(scanSlot(j))} y={lerp(204, 240, out)} s={12} f={C.cherryText} a="middle" o={1 - out}>scan</T> : null;
        return <Box key={j} x={lerp(560, SX(scanSlot(j)), k)} y={lerp(230, 167, k)} k="scan" w={52} h={26} c={C.latte} s={12} />;
      })}
      <T x={30} y={262} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>a page read once scores one</T>
      <T x={30} y={288} s={13} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>the popular pages win on points</T>
    </Svg>
  );
}

// 3 · Predict. X was touched constantly long ago (a tall tally, its touches all at the far left of the timeline) and not
// since; Y is popular now, its tally still small. What happens to X's standing? After answering: time runs on, X's
// tally never moves, and Y is evicted again and again under it.
export function NeverForgets({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const a = easeOut(seg(t, 0.1, 0.6));
  const run = answered ? clamp(seg(s, 0.2, 2.2)) : 0;
  const xT = [40, 52, 60, 70, 78, 88, 96, 104, 116, 124];
  const yT = [430, 470, 500, 530];
  const yFill = (k: number) => Math.min(4, 1 + Math.floor((k * 8) % 4));
  const evictions = Math.floor(run * 4);
  return (
    <Svg label="X has a tall tally from touches long ago; Y, popular now, has a short one; after answering, time runs on, X's tally never shrinks and Y is evicted again and again" h={300}>
      <g opacity={a}>
        <T x={30} y={24} s={12} f={C.latte}>touches over time</T>
        <line x1={30} y1={70} x2={560} y2={70} stroke={C.mocha} strokeWidth={1.2} />
        {xT.map((x, i) => <line key={i} x1={x} y1={52} x2={x} y2={68} stroke={C.crema} strokeWidth={2} />)}
        {yT.map((x, i) => <line key={`y${i}`} x1={x} y1={52} x2={x} y2={68} stroke={C.caramel} strokeWidth={2} />)}
        <T x={40} y={92} s={12} f={C.crema}>X: long ago</T>
        <T x={430} y={92} s={12} f={C.caramel}>Y: now</T>
        <Box x={120} y={220} k="X" w={50} h={30} />
        {Array.from({ length: 10 }, (_, k) => <rect key={k} x={110} y={190 - k * 9} width={20} height={6} rx={1.5} fill={answered ? C.cherryText : C.crema} />)}
        <Box x={320} y={220} k="Y" w={50} h={30} c={C.caramel} o={answered ? 1 - 0.7 * (run * 4 - evictions) : 1} />
        {Array.from({ length: answered ? yFill(run) : 4 }, (_, k) => <rect key={k} x={310} y={190 - k * 9} width={20} height={6} rx={1.5} fill={C.caramel} />)}
      </g>
      {answered && (
        <g>
          <circle cx={470} cy={160} r={22} fill="none" stroke={C.latte} strokeWidth={1.4} />
          <line x1={470} y1={160} x2={470 + 16 * Math.cos(run * 12 - Math.PI / 2)} y2={160 + 16 * Math.sin(run * 12 - Math.PI / 2)} stroke={C.latte} strokeWidth={1.6} />
          <T x={420} y={216} s={12} f={C.cherryText}>Y evicted: {evictions}×</T>
        </g>
      )}
      {!answered && <T x={30} y={276} s={15} f={C.cherryText} o={pulse}>what happens to X&apos;s standing?</T>}
      {answered && <T x={30} y={276} s={13} f={C.cherryText} o={easeOut(seg(s, 1.0, 1.3))}>X keeps winning, on touches long gone</T>}
    </Svg>
  );
}

// 4 · Decay, and Redis's real counter. A tick every 1,000 operations halves every tally: X's tall bar halves, and
// halves again, while Y's grows; Y overtakes, and X can finally go. Then Redis's counter: 8 bits, at most 255, climbing
// ever more slowly the higher it gets, and fading on its own clock.
export function Decay({ t }: StepCtx) {
  const ticks = [0.8, 1.5, 2.2].filter((k) => t >= k).length;
  const xH = 160 / 2 ** ticks;
  const yH = 20 + 90 * clamp(seg(t, 0.4, 2.4));
  const over = yH > xH;
  const red = easeOut(seg(t, 2.9, 3.3));
  const LOG: Pt[] = Array.from({ length: 31 }, (_, i) => [330 + i * 7.5, 250 - 100 * Math.log(1 + i * 0.8) / Math.log(25)]);
  return (
    <Svg label="Every 1,000 operations each tally halves: X's tall bar shrinks and Y's grows past it, so X can be evicted; Redis keeps an 8-bit counter, at most 255, that climbs ever more slowly and fades on a clock" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>every 1,000 operations: halve every tally</T>
      <line x1={40} y1={220} x2={260} y2={220} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={70} y={220 - xH} width={40} height={xH} rx={2} fill={over ? C.latte : C.crema} />
      <rect x={170} y={220 - yH} width={40} height={yH} rx={2} fill={C.caramel} />
      <T x={90} y={240} s={13} f={C.crema} a="middle">X</T>
      <T x={190} y={240} s={13} f={C.caramel} a="middle">Y</T>
      {[0.8, 1.5, 2.2].map((k, i) => <T key={i} x={40 + i * 74} y={50} s={12} f={C.cinnamon} o={t >= k ? 1 - 0.6 * clamp((t - k) / 0.6) : 0}>½</T>)}
      <T x={30} y={270} s={12} f={C.caramel} o={easeOut(seg(t, 2.4, 2.7))}>Y overtakes: X can finally go</T>
      <g opacity={red}>
        <T x={310} y={70} s={12} f={C.crema}>Redis: 8 bits, at most 255</T>
        <line x1={330} y1={250} x2={560} y2={250} stroke={C.mocha} strokeWidth={1.2} />
        <line x1={330} y1={130} x2={330} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      </g>
      <Draw pts={LOG} t={t} from={3.1} to={4.0} stroke={C.cinnamon} w={2} pen={false} />
      <T x={310} y={100} s={12} f={C.cinnamon} o={easeOut(seg(t, 3.6, 3.9))}>climbs slower the higher it is</T>
      <T x={310} y={284} s={12} f={C.latte} o={easeOut(seg(t, 4.1, 4.4))}>and fades on its own clock</T>
    </Svg>
  );
}

// The 2Q layout: A1in (a short FIFO for first-timers), Am (the main LRU), A1out (names only).
const Q = { in: { x: 30, y: 60, w: 250 }, am: { x: 310, y: 60, w: 260 }, out: { x: 30, y: 170, w: 250 } };
function Queues({ o = 1, amKeys = ['h1', 'h2', 'h3', 'h4'], amC = C.crema }: { o?: number; amKeys?: string[]; amC?: string }) {
  return (
    <g opacity={o}>
      <rect x={Q.in.x} y={Q.in.y} width={Q.in.w} height={50} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <T x={Q.in.x} y={Q.in.y - 10} s={12} f={C.latte}>A1in: 25% of the slots</T>
      <rect x={Q.am.x} y={Q.am.y} width={Q.am.w} height={50} rx={6} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <T x={Q.am.x} y={Q.am.y - 10} s={12} f={C.crema}>Am: real seats</T>
      {amKeys.map((k, i) => <Box key={k} x={Q.am.x + 34 + i * 62} y={Q.am.y + 25} k={k} w={50} h={28} c={amC} s={12} />)}
      <rect x={Q.out.x} y={Q.out.y} width={Q.out.w} height={40} rx={6} fill="none" stroke={C.cinnamon} strokeWidth={1.2} strokeDasharray="5 4" />
      <T x={Q.out.x} y={Q.out.y - 10} s={12} f={C.cinnamon}>A1out: names only</T>
    </g>
  );
}

// 5 · The ghost list idea. A newcomer k lands in A1in, a holding spot, and drifts to its end; nobody asks again, so it
// falls out, and only its name is written into A1out. Asked again while the name is there, k earns a seat in Am.
export function GhostIdea({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const enter = easeInOut(seg(t, 0.6, 1.0));
  const drift = easeInOut(seg(t, 1.0, 1.8));
  const fall = easeInOut(seg(t, 1.9, 2.5));
  const ask = t >= 2.9;
  const seat = easeInOut(seg(t, 3.1, 3.7));
  const inX = lerp(Q.in.x + 40, Q.in.x + Q.in.w - 40, drift);
  let p: Pt = [lerp(560, Q.in.x + 40, enter), lerp(140, Q.in.y + 25, enter)];
  if (t >= 1.0) p = [inX, Q.in.y + 25];
  if (t >= 1.9) p = [lerp(inX, Q.out.x + 50, fall), lerp(Q.in.y + 25, Q.out.y + 20, fall)];
  if (t >= 3.1) p = [lerp(Q.out.x + 50, Q.am.x + 34 + 4 * 62 - 248, seat), lerp(Q.out.y + 20, Q.am.y + 25, seat)];
  const ghost = t >= 2.3 && t < 3.1;
  return (
    <Svg label="A newcomer k enters the short A1in queue and drifts to its end; untouched, it falls out and only its name is kept in A1out; asked for again while named there, it earns a seat in Am" h={300}>
      <Queues o={a} amKeys={seat >= 1 ? ['k', 'h2', 'h3', 'h4'] : ['h1', 'h2', 'h3', 'h4']} />
      {!(seat >= 1) && <Box x={p[0]} y={p[1]} k="k" w={ghost ? 34 : 50} h={ghost ? 22 : 28} c={ghost ? C.cinnamon : C.caramel} dash={ghost ? '4 3' : undefined} sw={2} o={enter > 0.001 ? 1 : 0} />}
      {seat >= 1 && <T x={Q.am.x + 34} y={Q.am.y + 54} s={12} f={C.caramel} a="middle">↑</T>}
      <T x={310} y={196} s={13} f={C.caramel} o={ask ? 1 : 0}>asked again: k?</T>
      <T x={30} y={254} s={12} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>untouched: out of A1in, name kept</T>
      <T x={30} y={280} s={13} f={C.caramel} o={easeOut(seg(t, 3.7, 4.0))}>named and asked again: a real seat</T>
    </Svg>
  );
}

// 6 · Predict. A seat holds the name and the whole page; the list holds just a name. Does writing a name down cost
// anything like a seat? After answering: the two costs grow side by side, the page's bar long, the name's a sliver.
export function GhostCost({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const a = easeOut(seg(t, 0.1, 0.5));
  const g = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  return (
    <Svg label="A seat holds a name plus the whole page; a ghost entry holds only the name; after answering, the page's cost bar runs long while the name's is a sliver" h={290}>
      <g opacity={a}>
        <T x={30} y={30} s={13} f={C.crema}>a seat</T>
        <rect x={30} y={44} width={60} height={30} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.3} />
        <T x={60} y={64} s={12} f={C.crema} a="middle">name</T>
        <rect x={96} y={44} width={250} height={30} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.3} />
        <T x={221} y={64} s={12} f={C.crema} a="middle">the page itself</T>
        <T x={30} y={118} s={13} f={C.cinnamon}>a name on the list</T>
        <rect x={30} y={132} width={60} height={30} rx={3} fill={C.roast} stroke={C.cinnamon} strokeWidth={1.3} strokeDasharray="4 3" />
        <T x={60} y={152} s={12} f={C.cinnamon} a="middle">name</T>
      </g>
      {!answered && <T x={30} y={240} s={15} f={C.cherryText} o={pulse}>does a name cost like a seat?</T>}
      {answered && (
        <>
          <rect x={30} y={190} width={480 * g} height={12} rx={2} fill={C.crema} />
          <rect x={30} y={210} width={22 * g} height={12} rx={2} fill={C.cinnamon} />
          <T x={30} y={250} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.3))}>nowhere close: a label, never the page</T>
        </>
      )}
    </Svg>
  );
}

// 7 · 2Q against the same scan. Scan pages pour into A1in, fall out into A1out as names, and the popular pages in Am are
// never touched. Measured, the first 300 requests after: LRU 0.4667 drops to 0.3767; 2Q goes 0.4800 to 0.5033.
export function TwoQReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.4));
  const flow = (j: number) => clamp(seg(t, 0.4 + j * 0.22, 1.6 + j * 0.22));
  const bars = easeOut(seg(t, 3.0, 3.6));
  const W = (v: number) => (v / 0.55) * 300;
  return (
    <Svg label="Scan pages pour through 2Q's A1in and out into A1out as names while Am's popular pages stay; measured after the scan, LRU drops from 0.4667 to 0.3767 while 2Q goes from 0.4800 to 0.5033" h={330}>
      <Queues o={a} amC={C.caramel} />
      {Array.from({ length: 8 }, (_, j) => {
        const k = flow(j);
        if (k <= 0 || k >= 1) return null;
        let p: Pt;
        if (k < 0.2) p = [lerp(580, Q.in.x + 30, k / 0.2), Q.in.y + 25];
        else if (k < 0.65) p = [lerp(Q.in.x + 30, Q.in.x + Q.in.w - 30, (k - 0.2) / 0.45), Q.in.y + 25];
        else p = [lerp(Q.in.x + Q.in.w - 30, Q.out.x + 30 + (j % 4) * 56, (k - 0.65) / 0.35), lerp(Q.in.y + 25, Q.out.y + 20, (k - 0.65) / 0.35)];
        const ghost = k >= 0.65;
        return <Box key={j} x={p[0]} y={p[1]} k="s" w={ghost ? 28 : 36} h={ghost ? 20 : 24} c={ghost ? C.cinnamon : C.latte} dash={ghost ? '3 3' : undefined} s={12} />;
      })}
      <T x={310} y={196} s={12} f={C.caramel} o={easeOut(seg(t, 2.4, 2.7))}>Am: never touched</T>
      <g opacity={bars}>
        <T x={30} y={244} s={12} f={C.latte}>first 300 requests after, no scan → scan</T>
        <T x={30} y={274} s={12} f={C.crema}>LRU</T>
        <rect x={90} y={264} width={W(0.4667)} height={12} rx={2} fill={C.mocha} />
        <rect x={90} y={264} width={lerp(W(0.4667), W(0.3767), easeInOut(seg(t, 3.6, 4.1)))} height={12} rx={2} fill={C.cherryText} />
        <T x={400} y={274} s={12} f={C.cherryText}>0.4667 → 0.3767</T>
        <T x={30} y={304} s={12} f={C.caramel}>2Q</T>
        <rect x={90} y={294} width={lerp(W(0.48), W(0.5033), easeInOut(seg(t, 3.6, 4.1)))} height={12} rx={2} fill={C.caramel} />
        <T x={400} y={304} s={12} f={C.caramel}>0.4800 → 0.5033</T>
      </g>
    </Svg>
  );
}

// ARC's four lists, as rows: T1 (seen once), T2 (seen twice or more), B1 and B2 (names evicted from each).
const AR = { t1: 70, t2: 120, b1: 180, b2: 230 };
function ArcRows({ t1, t2, b1, b2, hot }: { t1: string[]; t2: string[]; b1: string[]; b2: string[]; hot?: string }) {
  const row = (keys: string[], y: number, ghost: boolean, c: string) =>
    keys.map((k, i) => <Box key={`${y}-${k}`} x={170 + i * 56} y={y} k={k} w={ghost ? 36 : 46} h={ghost ? 22 : 28} c={k === hot ? C.caramel : c} dash={ghost ? '4 3' : undefined} sw={k === hot ? 2 : 1.3} />);
  return (
    <g>
      <T x={30} y={AR.t1 + 5} s={12} f={C.crema}>T1 once</T>
      <T x={30} y={AR.t2 + 5} s={12} f={C.crema}>T2 again</T>
      <T x={30} y={AR.b1 + 5} s={12} f={C.cinnamon}>B1 names</T>
      <T x={30} y={AR.b2 + 5} s={12} f={C.cinnamon}>B2 names</T>
      {row(t1, AR.t1, false, C.crema)}
      {row(t2, AR.t2, false, C.crema)}
      {row(b1, AR.b1, true, C.cinnamon)}
      {row(b2, AR.b2, true, C.cinnamon)}
    </g>
  );
}

// 8 · Predict. ARC's four lists with b's name in B1 (it was evicted from T1). b is asked for again. What does a hit on a
// name say? After answering: an arrow from b's name back up to T1: that list was too small to have kept it.
export function ArcPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const a = easeOut(seg(t, 0.1, 0.5));
  return (
    <Svg label="ARC's lists T1, T2, B1 and B2, with b's name in B1; after answering, an arrow from b's name back to T1 says T1 was too small to keep it" h={300}>
      <g opacity={a}>
        <ArcRows t1={['c', 'd', 'e']} t2={['a']} b1={['b']} b2={[]} hot="b" />
      </g>
      {!answered && <T x={250} y={AR.b1 + 5} s={13} f={C.cherryText} o={pulse}>b is asked for again</T>}
      {!answered && <T x={30} y={284} s={15} f={C.cherryText} o={pulse}>what does that hit tell you?</T>}
      {answered && (
        <>
          <Draw pts={[[190, AR.b1 - 12], [210, AR.t1 + 40], [330, AR.t1 + 16]]} t={s} from={0.2} to={0.8} stroke={C.caramel} w={2} />
          <rect x={140} y={AR.t1 - 18} width={210 + 46 * easeOut(seg(s, 0.8, 1.2))} height={36} rx={5} fill="none" stroke={C.caramel} strokeWidth={1.6} strokeDasharray="5 4" />
          <T x={30} y={284} s={13} f={C.caramel} o={easeOut(seg(s, 1.1, 1.4))}>T1 was too small to have kept b</T>
        </>
      )}
    </Svg>
  );
}

// ARC's hand trace, capacity 4 (examples.py's arc_demo): the lists after each request, and p, T1's target size.
const ARC_STEPS: { req: string; t1: string[]; t2: string[]; b1: string[]; p: number }[] = [
  { req: 'a', t1: ['a'], t2: [], b1: [], p: 0 },
  { req: 'b', t1: ['a', 'b'], t2: [], b1: [], p: 0 },
  { req: 'c', t1: ['a', 'b', 'c'], t2: [], b1: [], p: 0 },
  { req: 'd', t1: ['a', 'b', 'c', 'd'], t2: [], b1: [], p: 0 },
  { req: 'a', t1: ['b', 'c', 'd'], t2: ['a'], b1: [], p: 0 },
  { req: 'e', t1: ['c', 'd', 'e'], t2: ['a'], b1: ['b'], p: 0 },
  { req: 'b', t1: ['d', 'e'], t2: ['a', 'b'], b1: ['c'], p: 1 },
];

// 9 · ARC adapts, by hand. Four slots; requests a, b, c, d fill T1; a again moves to T2; e pushes b out, its name into
// B1; b again is a hit on that name: b takes a seat in T2, c's name goes to B1, and p, T1's target, rises from 0 to 1.
export function ArcReveal({ t }: StepCtx) {
  const at = (i: number) => 0.3 + i * 0.5;
  const done = ARC_STEPS.filter((_, i) => t >= at(i)).length;
  const st = done > 0 ? ARC_STEPS[done - 1] : { req: '', t1: [], t2: [], b1: [], p: 0 };
  const pUp = done >= 7;
  return (
    <Svg label="ARC with four slots: a, b, c, d fill T1; a again moves to T2; e evicts b, whose name goes to B1; b again hits that name, takes a seat in T2, and T1's target p rises from 0 to 1" h={330}>
      <T x={30} y={26} s={12} f={C.latte}>four slots; request:</T>
      <T x={226} y={27} s={15} f={C.caramel}>{st.req}</T>
      <ArcRows t1={st.t1} t2={st.t2} b1={st.b1} b2={[]} hot={st.req} />
      <T x={30} y={282} s={14} f={pUp ? C.caramel : C.crema}>p, T1&apos;s target: {st.p}</T>
      {[0, 1, 2, 3].map((i) => <rect key={i} x={300 + i * 30} y={268} width={26} height={16} rx={2} fill={i < st.p ? C.caramel : C.roast} stroke={C.latte} strokeWidth={1} />)}
      <T x={30} y={314} s={12} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>set by no one; no counters anywhere</T>
    </Svg>
  );
}

// 10 · Reuse distance. A loop of five entries, one more than four seats, visited round and round. Between two uses of a,
// the other four are touched: a distance of 4 every lap. The loop slows to half speed: the time between uses doubles,
// the distance does not.
export function ReuseDistance({ t }: StepCtx) {
  const CX = 130;
  const CY = 150;
  const R = 70;
  const KEYS = ['a', 'b', 'c', 'd', 'e'];
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  const slow = t > 2.4;
  const phase = slow ? 2.4 * 2.2 + (t - 2.4) * 1.1 : t * 2.2;
  const cur = Math.floor(phase) % 5;
  const lap = Math.floor(phase / 5);
  const between = slow || lap > 0 ? (cur === 0 ? 4 : cur) : cur;
  const tl = (x: number, y: number, w: number, c: string) => (
    <g>
      {[0, 1, 2].map((k) => <line key={k} x1={x + k * w} y1={y - 8} x2={x + k * w} y2={y + 8} stroke={c} strokeWidth={2} />)}
      <line x1={x} y1={y} x2={x + 2 * w} y2={y} stroke={C.mocha} strokeWidth={1} />
    </g>
  );
  return (
    <Svg label="Five entries in a loop, one more than the four seats; between two uses of a, four others are touched every lap, a distance of four; slowing the loop doubles the time between uses but not the distance" h={300}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      {KEYS.map((k, i) => (
        <Box key={k} x={CX + R * Math.cos(ang(i))} y={CY + R * Math.sin(ang(i))} k={k} w={34} h={24} c={i === cur ? C.caramel : i === 0 ? C.cinnamon : C.crema} sw={i === cur ? 2 : 1.3} />
      ))}
      <T x={30} y={26} s={12} f={C.latte}>a loop of 5, over 4 seats</T>
      <T x={290} y={70} s={13} f={C.cinnamon}>others since a: {between}</T>
      <T x={290} y={130} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>time between uses of a</T>
      {tl(290, 150, 50, C.crema)}
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        {tl(290, 190, 100, C.latte)}
        <T x={290} y={222} s={12} f={C.latte}>half speed: twice the time</T>
      </g>
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>distance stays 4, however slow the loop</T>
      <T x={30} y={288} s={12} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>a time-only rule calls every one stale</T>
    </Svg>
  );
}

const POLICIES: { lab: string; before: number; after: number; c: string }[] = [
  { lab: 'LRU', before: 0.4667, after: 0.3767, c: C.cherryText },
  { lab: 'CLOCK', before: 0.4767, after: 0.3733, c: C.cherryText },
  { lab: 'LFU+decay', before: 0.4267, after: 0.4267, c: C.caramel },
  { lab: '2Q', before: 0.48, after: 0.5033, c: C.caramel },
  { lab: 'ARC', before: 0.4667, after: 0.4667, c: C.caramel },
  { lab: 'LIRS', before: 0.5, after: 0.5, c: C.caramel },
];

// 11 · The measured comparison. Six rows, hit rate on the first 300 requests after warm-up: a dot at the no-scan value,
// and a second dot that slides to the after-scan value. LRU and CLOCK slide well left; the four others barely move.
export function Comparison({ t }: StepCtx) {
  const X = (v: number) => 170 + ((v - 0.35) / 0.17) * 360;
  const a = easeOut(seg(t, 0.1, 0.5));
  const mv = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="Hit rate after the same scan, six policies: LRU 0.4667 to 0.3767 and CLOCK 0.4767 to 0.3733 drop; LFU with decay, 2Q, ARC and LIRS barely move" h={330}>
      <T x={30} y={24} s={12} f={C.latte}>first 300 requests after: no scan ○ → scan ●</T>
      {[0.4, 0.45, 0.5].map((v) => (
        <g key={v} opacity={a}>
          <line x1={X(v)} y1={40} x2={X(v)} y2={270} stroke={C.mocha} strokeWidth={1} strokeDasharray="2 4" />
          <T x={X(v)} y={290} s={12} f={C.latte} a="middle">{v.toFixed(2)}</T>
        </g>
      ))}
      {POLICIES.map((p, i) => {
        const y = 56 + i * 40;
        const xa = lerp(X(p.before), X(p.after), mv);
        const flat = p.before === p.after;
        return (
          <g key={p.lab} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))}>
            <T x={30} y={y + 5} s={13} f={i < 2 ? C.cherryText : C.crema}>{p.lab}</T>
            <line x1={X(p.before)} y1={y} x2={xa} y2={y} stroke={p.c} strokeWidth={2} />
            <circle cx={X(p.before)} cy={y} r={6} fill={C.roast} stroke={C.crema} strokeWidth={1.6} />
            <circle cx={xa} cy={y + (flat ? 0 : 0)} r={4.5} fill={p.c} />
          </g>
        );
      })}
      <T x={30} y={318} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>a second question holds the line</T>
    </Svg>
  );
}

// 12 · Recap. Four small pictures light up in turn, each what one policy bought: a tally with a fading clock (LFU with
// decay), a name on a list (2Q), a split that tunes itself (ARC), a distance instead of a time (LIRS). The cheapest: a
// list that remembers nothing but names.
export function Recap({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 0.2 + i * 0.6, 0.5 + i * 0.6));
  const Y = (i: number) => 44 + i * 56;
  const fade = 1 - 0.5 * clamp(seg(t, 0.5, 1.0));
  const split = 120 + 20 * Math.sin(Math.max(0, t - 1.4) * 3);
  return (
    <Svg label="Four policies, four purchases: a tally with a fading clock, a name on a list, a split that tunes itself, and a distance in place of a time; the cheapest is a list of names" h={300}>
      <g opacity={r(0)}>
        <rect x={40} y={Y(0) - 4 - 30 * fade} width={18} height={30 * fade} rx={2} fill={C.crema} />
        <circle cx={90} cy={Y(0) - 10} r={10} fill="none" stroke={C.latte} strokeWidth={1.3} />
        <T x={170} y={Y(0)} s={13} f={C.crema}>a tally, and a fading clock</T>
      </g>
      <g opacity={r(1)}>
        <Box x={70} y={Y(1) - 6} k="name" w={60} h={24} c={C.cinnamon} dash="4 3" s={12} />
        <T x={170} y={Y(1)} s={13} f={C.cinnamon}>a name on a list</T>
      </g>
      <g opacity={r(2)}>
        <rect x={30} y={Y(2) - 18} width={120} height={22} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <line x1={30 + (split - 120) + 60} y1={Y(2) - 22} x2={30 + (split - 120) + 60} y2={Y(2) + 8} stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={Y(2)} s={13} f={C.crema}>a split that tunes itself</T>
      </g>
      <g opacity={r(3)}>
        {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={40 + k * 24} cy={Y(3) - 6} r={6} fill={k === 0 || k === 4 ? C.caramel : C.roast} stroke={C.crema} strokeWidth={1.2} />)}
        <T x={170} y={Y(3)} s={13} f={C.crema}>distance, not time</T>
      </g>
      <T x={30} y={278} s={13} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>the cheapest: a list that keeps only names</T>
    </Svg>
  );
}
