import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's shared language): crema = an entry or stored key; latte = secondary
// labels; caramel = the thing to look at (the entry being touched, the handle, the sweeping hand); cinnamon = the
// alternative being compared (CLOCK beside exact LRU, the key being followed); cherryText = the bad outcome (an
// eviction of something wanted, the scan's damage).
// Every printed number is examples.py's: the 12-request trace over 3 slots (A hits at request 4, is evicted at 7, misses
// at 8), at most 6 pointer writes per operation at 100 and at 50,000 entries, the replay's miss ratios 0.0749 (LRU),
// 0.0752 (CLOCK) and 0.0761 (sampled), and the hit rate on the first 300 requests after warm-up, without and with the
// scan: LRU 0.4667 to 0.3767, CLOCK 0.4767 to 0.3733. Ages before the trace are drawn as shape only.

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

function Box({ x, y, k, w = 44, h = 28, c = C.crema, o = 1, s = 13, fill = C.roast, sw = 1.3 }: { x: number; y: number; k: string; w?: number; h?: number; c?: string; o?: number; s?: number; fill?: string; sw?: number }) {
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} fill={fill} stroke={c} strokeWidth={sw} />
      <T x={x} y={y + 5} s={s} f={c} a="middle">{k}</T>
    </g>
  );
}

/** A doubly linked pair: forward arrow above the centre line, backward arrow below. */
function Dbl({ x1, x2, y, c = C.latte, o = 1 }: { x1: number; x2: number; y: number; c?: string; o?: number }) {
  return (
    <g opacity={o}>
      <line x1={x1} y1={y - 4} x2={x2 - 2} y2={y - 4} stroke={c} strokeWidth={1.2} />
      <path d={`M ${x2} ${y - 4} l -6 -3 l 0 6 z`} fill={c} />
      <line x1={x2} y1={y + 4} x2={x1 + 2} y2={y + 4} stroke={c} strokeWidth={1.2} />
      <path d={`M ${x1} ${y + 4} l 6 -3 l 0 6 z`} fill={c} />
    </g>
  );
}

// 1 · A cache that's full. Three slots hold A, B and C, each with an age (B oldest). D arrives: a miss. With only
// timestamps, finding the oldest means checking every stamp; then B goes and D takes its slot.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.4));
  const req = easeInOut(seg(t, 0.6, 1.0));
  const SX = [90, 220, 350];
  const KEYS = ['A', 'B', 'C'];
  const AGE = [14, 70, 40]; // shape only: A just touched, B the stalest
  const scanAt = (i: number) => 1.4 + i * 0.4;
  const checked = [0, 1, 2].filter((i) => t >= scanAt(i)).length;
  const scanX = t < 1.4 ? SX[0] : lerp(SX[Math.min(2, checked - 1)], SX[Math.min(2, checked)], clamp((t - scanAt(Math.max(0, checked - 1))) / 0.4));
  const out = easeInOut(seg(t, 2.8, 3.2));
  const swap = easeInOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="A full cache of three slots, A, B and C, each with an age; D arrives as a miss; checking every stamp finds B oldest, and D takes B's slot" h={300}>
      <T x={30} y={26} s={12} f={C.latte} o={a}>a full cache: 3 slots, each stamped with its last touch</T>
      {KEYS.map((k, i) => {
        const gone = i === 1 ? out : 0;
        return (
          <g key={k} opacity={a}>
            <rect x={SX[i] - 40} y={50} width={80} height={44} rx={4} fill={C.roast} stroke={i === 1 && t >= 2.6 ? C.cherryText : C.crema} strokeWidth={1.4} />
            <T x={SX[i]} y={78} s={14} f={i === 1 && t >= 2.6 ? C.cherryText : C.crema} a="middle" o={1 - gone}>{k}</T>
            <rect x={SX[i] - 40} y={104} width={AGE[i] * (i === 1 ? 1 - swap : 1)} height={8} rx={2} fill={i === 1 && t >= 2.6 ? C.cherryText : C.latte} />
          </g>
        );
      })}
      <T x={30} y={130} s={12} f={C.latte} o={a}>age</T>
      <Box x={lerp(520, SX[1], swap > 0 ? swap : 0) + (swap > 0 ? 0 : lerp(60, 0, req))} y={swap > 0 ? lerp(160, 72, swap) : 72} k="D" c={C.caramel} o={req} w={46} h={32} />
      <T x={500} y={110} s={12} f={C.cherryText} o={req * (1 - swap)}>miss</T>
      {t >= 1.4 && t < 2.8 && <rect x={scanX - 46} y={44} width={92} height={74} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={30} y={190} s={13} f={C.crema} o={t >= 1.4 ? 1 : 0}>stamps checked: {checked} of 3</T>
      <T x={30} y={222} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>the oldest is only found by looking at all of them</T>
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 3.7, 4.1))}>the very work a cache exists to avoid</T>
    </Svg>
  );
}

const LX = [320, 420, 520]; // recency chain, newest on the left

// 2 · Two structures, one answer. A hash map (keys, no order) and a recency chain A, C, B (order, no fast lookup).
// get(C): the C row lights, and its entry is a handle straight into the chain, ready to move without a search.
export function TwoStructures({ t }: StepCtx) {
  const map = easeOut(seg(t, 0.2, 0.6));
  const list = easeOut(seg(t, 0.8, 1.2));
  const look = t >= 2.3;
  const MAP = ['A', 'B', 'C'];
  const MY = (i: number) => 66 + i * 34;
  const CHAIN = ['A', 'C', 'B'];
  return (
    <Svg label="A hash map with keys A, B and C beside a recency chain A, C, B; looking up C returns a handle straight to C's place in the chain" h={300}>
      <g opacity={map}>
        <T x={30} y={30} s={13} f={C.crema}>hash map</T>
        {MAP.map((k, i) => (
          <g key={k}>
            <rect x={30} y={MY(i) - 13} width={120} height={26} rx={3} fill={C.roast} stroke={look && k === 'C' ? C.caramel : C.mocha} strokeWidth={look && k === 'C' ? 2 : 1.2} />
            <T x={44} y={MY(i) + 5} s={13} f={look && k === 'C' ? C.caramel : C.crema}>{k}</T>
            <T x={136} y={MY(i) + 5} s={13} f={C.latte} a="end">&rarr;</T>
          </g>
        ))}
        <T x={30} y={190} s={12} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>finds by key; no order</T>
      </g>
      <g opacity={list}>
        <T x={290} y={30} s={13} f={C.crema}>recency chain</T>
        {CHAIN.map((k, i) => (
          <g key={k}>
            <Box x={LX[i]} y={100} k={k} c={look && k === 'C' ? C.caramel : C.crema} />
            {i < 2 && <Dbl x1={LX[i] + 22} x2={LX[i + 1] - 22} y={100} />}
          </g>
        ))}
        <T x={LX[0]} y={140} s={12} f={C.latte} a="middle">newest</T>
        <T x={LX[2]} y={140} s={12} f={C.latte} a="middle">oldest</T>
        <T x={290} y={190} s={12} f={C.latte} o={easeOut(seg(t, 1.7, 2.0))}>keeps order; slow by key</T>
      </g>
      <T x={30} y={30 + 222} s={13} f={C.caramel} o={easeOut(seg(t, 2.4, 2.7))}>get(C): the value and a handle into the chain</T>
      <Draw pts={[[150, MY(2)], [240, MY(2)], [LX[1] - 30, 120], [LX[1] - 22, 108]]} t={t} from={2.6} to={3.3} stroke={C.caramel} w={2} />
      <T x={30} y={280} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.8))}>ready to move, with no search</T>
    </Svg>
  );
}

// 3 · Predict. The chain is C, B, A (C newest). get(A) is a hit. Does anything move? After answering: A lifts out of
// the oldest end and drops in at the front; the chain reads A, C, B: a read just became a write.
export function HitDoes({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const XS = [140, 270, 400];
  const lift = answered ? easeInOut(seg(s, 0.2, 0.5)) : 0;
  const slide = answered ? easeInOut(seg(s, 0.5, 1.1)) : 0;
  const drop = answered ? easeInOut(seg(s, 1.1, 1.4)) : 0;
  const settled = answered && s >= 1.4;
  const ax = lerp(XS[2], XS[0], slide);
  const ay = 100 - 50 * lift + 50 * drop;
  const cx = lerp(XS[0], XS[1], slide);
  const bx = lerp(XS[1], XS[2], slide);
  return (
    <Svg label="The chain C, B, A with A the oldest; reading A is a hit; after answering, A moves from the oldest end to the front, and the chain reads A, C, B" h={290}>
      <T x={30} y={30} s={13} f={C.crema}>get(A): a hit</T>
      <T x={XS[0]} y={150} s={12} f={C.latte} a="middle">newest</T>
      <T x={XS[2]} y={150} s={12} f={C.latte} a="middle">oldest</T>
      {!answered || settled ? (
        <>
          <Dbl x1={(settled ? XS[0] : XS[0]) + 22} x2={XS[1] - 22} y={100} c={settled ? C.caramel : C.latte} />
          <Dbl x1={XS[1] + 22} x2={XS[2] - 22} y={100} c={C.latte} />
        </>
      ) : (
        <Dbl x1={cx + 22} x2={bx - 22} y={100} />
      )}
      <Box x={cx} y={100} k="C" />
      <Box x={bx} y={100} k="B" />
      <Box x={ax} y={ay} k="A" c={C.caramel} o={answered ? 1 : pulse} sw={2} />
      {!answered && <T x={30} y={220} s={15} f={C.cherryText} o={pulse}>does anything move?</T>}
      {answered && <T x={30} y={220} s={13} f={C.caramel} o={easeOut(seg(s, 1.4, 1.7))}>A moves to the front: a read became a write</T>}
      {answered && <T x={30} y={250} s={12} f={C.latte} o={easeOut(seg(s, 1.8, 2.1))}>every hit edits the chain</T>}
    </Svg>
  );
}

// 4 · O(1), measured directly. Moving A from the oldest end to the front of H, C, B, A, T: six pointer writes, counted
// as each one lands (two to unlink, four to push in). Then the measured maximum per operation: 6 at 100 entries and
// 6 at 50,000.
export function O1Measured({ t }: StepCtx) {
  const XS = [50, 150, 250, 350, 450];
  const W = [0.7, 0.9, 1.6, 1.75, 1.9, 2.05];
  const writes = W.filter((w) => t >= w).length;
  const lift = easeOut(seg(t, 0.5, 0.8));
  const slide = easeInOut(seg(t, 1.0, 1.5));
  const drop = easeOut(seg(t, 1.5, 1.8));
  const aX = lerp(XS[3], XS[1], slide);
  const aY = 80 - 44 * lift + 44 * drop;
  const cX = lerp(XS[1], XS[2], slide);
  const bX = lerp(XS[2], XS[3], slide);
  const bars = easeOut(seg(t, 2.6, 3.2));
  const hot = (i: number) => writes > i && t < W[i] + 0.4;
  return (
    <Svg label="Moving A from the oldest end to the front of the chain takes six pointer writes, two to unlink and four to push in; measured, the most per operation is 6 at 100 entries and 6 at 50,000" h={320}>
      <Box x={XS[0]} y={80} k="H" c={C.latte} w={34} />
      <Box x={XS[4]} y={80} k="T" c={C.latte} w={34} />
      {writes < 6 ? <Dbl x1={XS[0] + 17} x2={cX - 22} y={80} /> : <Dbl x1={XS[0] + 17} x2={aX - 22} y={80} c={hot(5) ? C.caramel : C.latte} />}
      {writes >= 3 && <Dbl x1={aX + 22} x2={cX - 22} y={80} c={hot(2) || hot(3) || hot(4) ? C.caramel : C.latte} o={drop} />}
      <Dbl x1={cX + 22} x2={bX - 22} y={80} />
      {writes < 2 ? (
        <>
          <Dbl x1={bX + 22} x2={aX - 22} y={80} o={1 - lift} />
          <Dbl x1={aX + 22} x2={XS[4] - 17} y={80} o={1 - lift} />
        </>
      ) : (
        <Dbl x1={bX + 22} x2={XS[4] - 17} y={80} c={hot(0) || hot(1) ? C.caramel : C.latte} />
      )}
      <Box x={cX} y={80} k="C" />
      <Box x={bX} y={80} k="B" />
      <Box x={aX} y={aY} k="A" c={C.caramel} sw={2} />
      <T x={30} y={150} s={14} f={C.caramel} o={t >= 0.5 ? 1 : 0}>pointer writes: {writes}</T>
      <T x={260} y={150} s={12} f={C.latte} o={t >= 0.5 ? 1 : 0}>{writes <= 2 ? 'unlink A' : 'push A to the front'}</T>
      <g opacity={bars}>
        <T x={30} y={200} s={12} f={C.latte}>most writes in one operation, measured</T>
        <T x={30} y={232} s={13} f={C.crema}>100 entries</T>
        <rect x={190} y={220} width={6 * 30 * bars} height={16} rx={2} fill={C.crema} />
        <T x={386} y={232} s={13} f={C.crema}>6</T>
        <T x={30} y={262} s={13} f={C.crema}>50,000 entries</T>
        <rect x={190} y={250} width={6 * 30 * bars} height={16} rx={2} fill={C.caramel} />
        <T x={386} y={262} s={13} f={C.caramel}>6</T>
      </g>
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 3.4, 3.8))}>only its neighbours are ever touched</T>
    </Svg>
  );
}

// The 12-request trace over three slots, LRU (examples.py's picture_log): the chain after each request, newest first,
// and what each request evicted.
const TRACE = ['A', 'B', 'C', 'A', 'D', 'B', 'E', 'A', 'C', 'D', 'B', 'A'];
const HIT = [false, false, false, true, false, false, false, false, false, false, false, false];
const AFTER = [['A'], ['B', 'A'], ['C', 'B', 'A'], ['A', 'C', 'B'], ['D', 'A', 'C'], ['B', 'D', 'A'], ['E', 'B', 'D'], ['A', 'E', 'B'], ['C', 'A', 'E'], ['D', 'C', 'A'], ['B', 'D', 'C'], ['A', 'B', 'D']];
const EVICT = ['', '', '', '', 'B', 'C', 'A', 'D', 'B', 'E', 'A', 'C'];

// 5 · The replay. The twelve requests run one at a time; the three-slot chain reorders under each, evictions drop out
// to the right. Follow A (blue): a hit at request 4; pushed out by E at request 7; a miss when it returns at 8.
export function Replay({ t }: StepCtx) {
  const at = (i: number) => 0.3 + i * 0.3;
  const done = TRACE.filter((_, i) => t >= at(i)).length;
  const cur = done - 1;
  const state = cur >= 0 ? AFTER[cur] : [];
  const ev = cur >= 0 ? EVICT[cur] : '';
  const fresh = cur >= 0 ? clamp((t - at(cur)) / 0.2) : 0;
  return (
    <Svg label="Twelve requests over a three-slot cache: A hits at request 4, is evicted when E arrives at request 7, and misses when it returns at request 8" h={320}>
      <T x={30} y={24} s={12} f={C.latte}>requests</T>
      {TRACE.map((k, i) => {
        const on = t >= at(i);
        const isA = k === 'A';
        return (
          <g key={i} opacity={on ? 1 : 0.35}>
            <Box x={50 + i * 44} y={50} k={k} w={34} h={26} c={i === cur ? C.caramel : isA ? C.cinnamon : C.crema} sw={i === cur ? 2 : 1.2} />
            {on && <T x={50 + i * 44} y={84} s={12} f={HIT[i] ? C.caramel : isA ? C.cherryText : C.latte} a="middle">{HIT[i] ? 'hit' : '✗'}</T>}
          </g>
        );
      })}
      <T x={30} y={128} s={12} f={C.latte}>cache, newest first</T>
      {[0, 1, 2].map((j) => {
        const k = state[j];
        return (
          <g key={j}>
            <rect x={30 + j * 80} y={142} width={68} height={38} rx={4} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
            {k && <T x={64 + j * 80} y={167} s={15} f={k === 'A' ? C.cinnamon : C.crema} a="middle" o={j === 0 ? fresh : 1}>{k}</T>}
          </g>
        );
      })}
      {ev && (
        <g opacity={1 - 0.6 * clamp((t - at(cur) - 0.15) / 0.15)}>
          <T x={300} y={167} s={14} f={ev === 'A' ? C.cherryText : C.latte}>out: {ev}</T>
        </g>
      )}
      <T x={30} y={234} s={13} f={C.cinnamon} o={t >= at(3) ? 1 : 0}>A at request 4: still inside, a hit</T>
      <T x={30} y={260} s={13} f={C.cherryText} o={t >= at(6) ? 1 : 0}>request 7: E pushes A out</T>
      <T x={30} y={286} s={13} f={C.cherryText} o={t >= at(7) ? 1 : 0}>request 8: A is back, a miss</T>
    </Svg>
  );
}

// 6 · Predict. Five threads, one lock: every touch must take it just to slide one entry to the front, and the
// threads queue. What would make a hit cheaper? After answering: the lock goes; each entry gets one flag, and every
// thread just lights its entry's flag, with no queue.
export function HitCheaper({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const free = answered ? easeInOut(seg(s, 0.3, 1.0)) : 0;
  const XS = [230, 310, 390, 470];
  const q = easeOut(seg(t, 0.2, 1.2));
  const lockO = answered ? 1 - easeOut(seg(s, 0.1, 0.4)) : 1;
  return (
    <Svg label="Five threads queue at one lock before they may touch the ordered chain; after answering, the lock is gone, each entry carries a flag, and every thread just flips its entry's flag" h={300}>
      {XS.map((x, i) => (
        <g key={i}>
          <Box x={x} y={160} k={['A', 'C', 'B', 'D'][i]} />
          {i < 3 && <Dbl x1={x + 22} x2={XS[i + 1] - 22} y={160} o={1 - free * 0.6} />}
          <circle cx={x} cy={128} r={5} fill={free > 0.5 && i !== 2 ? C.caramel : C.roast} stroke={C.latte} strokeWidth={1.2} opacity={free} />
        </g>
      ))}
      <g opacity={lockO}>
        <rect x={330} y={74} width={40} height={30} rx={4} fill={C.roast} stroke={C.cherryText} strokeWidth={1.6} />
        <path d="M 340 74 v -8 a 10 10 0 0 1 20 0 v 8" fill="none" stroke={C.cherryText} strokeWidth={1.6} />
        <T x={350} y={58 - 12} s={12} f={C.cherryText} a="middle">one lock</T>
      </g>
      {[0, 1, 2, 3, 4].map((i) => {
        const qx = lerp(40, 280 - i * 40, q);
        const qy = lerp(60 + i * 40, 90, q);
        const target = XS[[0, 1, 3, 0, 1][i]];
        const x = lerp(qx, target, free);
        const y = lerp(qy, 112, free);
        return <circle key={i} cx={x} cy={y} r={9} fill="none" stroke={C.cinnamon} strokeWidth={1.8} />;
      })}
      {!answered && <T x={30} y={236} s={12} f={C.latte}>every thread waits its turn to reorder</T>}
      {!answered && <T x={30} y={270} s={15} f={C.cherryText} o={pulse}>how could a hit cost less?</T>}
      {answered && <T x={30} y={236} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.3))}>a flag per entry: no reorder, no queue</T>}
      {answered && <T x={30} y={262} s={12} f={C.latte} o={easeOut(seg(s, 1.4, 1.7))}>the exact order is given up</T>}
    </Svg>
  );
}

// 7 · CLOCK. Three slots on a circle (A, B, C, every flag lit) and a hand on A. D arrives: the hand walks forward,
// clearing each lit flag (A, B, C), comes round to A, now dark: A goes, D takes its slot. Then B is touched: one flag
// flips on. Same replay as exact LRU: miss ratio 0.0749 against 0.0752.
export function ClockReveal({ t }: StepCtx) {
  const CX = 140;
  const CY = 150;
  const R = 78;
  const ANG = [-90, 30, 150].map((d) => (d * Math.PI) / 180);
  const P = (i: number): Pt => [CX + R * Math.cos(ANG[i]), CY + R * Math.sin(ANG[i])];
  const a = easeOut(seg(t, 0.2, 0.5));
  const clearAt = [1.0, 1.4, 1.8];
  const handAng = (() => {
    if (t < 1.0) return ANG[0];
    if (t < 2.2) {
      const k = clamp((t - 1.0) / 1.2) * 3;
      return ANG[0] + (k * 2 * Math.PI) / 3;
    }
    if (t < 2.5) return ANG[0] + 2 * Math.PI;
    return ANG[0] + 2 * Math.PI + ((2 * Math.PI) / 3) * easeInOut(seg(t, 2.5, 2.7));
  })();
  const bit = (i: number) => {
    if (i === 1 && t >= 2.9) return 1;
    if (i === 0 && t >= 2.4) return 1;
    return t >= clearAt[i] + 0.15 ? 0 : 1;
  };
  const key = (i: number) => (i === 0 ? (t >= 2.4 ? 'D' : 'A') : i === 1 ? 'B' : 'C');
  const evict = t >= 2.2 && t < 2.4;
  const bars = easeOut(seg(t, 3.4, 4.0));
  const BW = (v: number) => (v / 0.08) * 340;
  return (
    <Svg label="CLOCK: three slots on a circle, each with a flag; D arrives, the hand clears A, B and C's flags, comes back to A now dark, evicts it and puts D there; touching B just lights its flag; on the same replay CLOCK misses 0.0752 against exact LRU's 0.0749" h={330}>
      <g opacity={a}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.mocha} strokeWidth={1.2} />
        {[0, 1, 2].map((i) => {
          const [x, y] = P(i);
          return (
            <g key={i}>
              <Box x={x} y={y} k={key(i)} w={44} h={30} c={evict && i === 0 ? C.cherryText : key(i) === 'D' ? C.caramel : C.crema} fill={C.espresso} />
              <circle cx={x + 30} cy={y - 14} r={5} fill={bit(i) ? C.caramel : C.roast} stroke={C.latte} strokeWidth={1.2} />
            </g>
          );
        })}
        <line x1={CX} y1={CY} x2={CX + (R - 26) * Math.cos(handAng)} y2={CY + (R - 26) * Math.sin(handAng)} stroke={C.caramel} strokeWidth={2.4} />
        <circle cx={CX} cy={CY} r={4} fill={C.caramel} />
      </g>
      <T x={290} y={70} s={13} f={C.cherryText} o={easeOut(seg(t, 0.6, 0.9))}>D arrives: a miss</T>
      <T x={290} y={100} s={12} f={C.crema} o={easeOut(seg(t, 1.0, 1.3))}>flag lit: clear it, move on</T>
      <T x={290} y={126} s={12} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.4))}>flag dark: evict A, D goes in</T>
      <T x={290} y={170} s={12} f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>touch B: one flag on</T>
      <g opacity={bars}>
        <T x={30} y={262} s={12} f={C.latte}>same replay, miss ratio</T>
        <T x={30} y={288} s={12} f={C.crema}>LRU 0.0749</T>
        <rect x={150} y={278} width={BW(0.0749) * bars} height={13} rx={2} fill={C.crema} />
        <T x={30} y={314} s={12} f={C.cinnamon}>CLOCK 0.0752</T>
        <rect x={150} y={304} width={BW(0.0752) * bars} height={13} rx={2} fill={C.cinnamon} />
      </g>
    </Svg>
  );
}

// 8 · Predict. The cache holds eight popular pages; a one-time scan of far more pages than the cache holds streams
// in, each read once. Do the popular pages survive? After answering: the scan pages enter one by one and every
// popular page is pushed out.
export function ScanPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const SX = (i: number) => 60 + i * 62;
  const stream = easeOut(seg(t, 0.3, 1.5));
  const inAt = (i: number) => 0.2 + i * 0.18;
  const taken = answered ? [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => s >= inAt(i)).length : 0;
  return (
    <Svg label="Eight popular pages fill the cache while a long one-time scan streams toward it; after answering, scan pages take every slot one by one and the popular pages are pushed out" h={300}>
      <T x={30} y={30} s={12} f={C.latte}>cache: the popular pages</T>
      {Array.from({ length: 8 }, (_, i) => {
        const gone = i < taken;
        const k = gone ? clamp((s - inAt(i)) / 0.18) : 0;
        return (
          <g key={i}>
            <rect x={SX(i) - 26} y={52} width={52} height={36} rx={4} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
            {k < 0.5 ? <T x={SX(i)} y={76} s={13} f={C.crema} a="middle">hot</T> : <T x={SX(i)} y={76} s={13} f={C.latte} a="middle">scan</T>}
            {gone && k < 1 && <T x={SX(i)} y={lerp(112, 140, k)} s={12} f={C.cherryText} a="middle" o={1 - k}>hot</T>}
          </g>
        );
      })}
      <T x={30} y={156} s={12} f={C.latte} o={stream}>a one-time scan: every page read once</T>
      {Array.from({ length: 14 }, (_, i) => {
        const x = lerp(620 + i * 40, 40 + i * 40, stream) - (answered ? 300 * easeInOut(seg(s, 0.2, 1.8)) : 0);
        return x > 20 && x < 580 ? <rect key={i} x={x} y={174} width={30} height={22} rx={3} fill={C.roast} stroke={C.latte} strokeWidth={1.1} /> : null;
      })}
      {!answered && <T x={30} y={250} s={15} f={C.cherryText} o={pulse}>do the popular pages survive?</T>}
      {answered && <T x={30} y={250} s={13} f={C.cherryText} o={easeOut(seg(s, 1.7, 2.0))}>pushed out: once looks just like always</T>}
    </Svg>
  );
}

// 9 · A scan really does flush it. Hit rate on the first 300 requests after warm-up, no scan against after the scan:
// LRU 0.4667 drops to 0.3767; CLOCK 0.4767 drops to 0.3733. Then ordinary traffic: sampled eviction, with almost no
// structure, misses 0.0761 against LRU's 0.0749 and CLOCK's 0.0752.
export function ScanReveal({ t }: StepCtx) {
  const HW = (v: number) => (v / 0.5) * 340;
  const g = easeOut(seg(t, 0.3, 0.9));
  const dropK = easeInOut(seg(t, 1.4, 2.1));
  const third = easeOut(seg(t, 3.0, 3.5));
  const MW = (v: number) => (v / 0.08) * 300;
  const ROWS = [
    { y: 40, lab: 'LRU', c: C.crema, before: 0.4667, after: 0.3767 },
    { y: 120, lab: 'CLOCK', c: C.cinnamon, before: 0.4767, after: 0.3733 },
  ];
  return (
    <Svg label="Hit rate on the first 300 requests after warm-up: LRU drops from 0.4667 to 0.3767 after the scan and CLOCK from 0.4767 to 0.3733; on ordinary traffic sampled eviction misses 0.0761 against 0.0749 and 0.0752" h={340}>
      <T x={30} y={20} s={12} f={C.latte}>hit rate, first 300 requests after warm-up</T>
      {ROWS.map((r) => (
        <g key={r.lab}>
          <T x={30} y={r.y + 20} s={13} f={r.c}>{r.lab}</T>
          <T x={30} y={r.y + 44} s={12} f={C.latte}>no scan</T>
          <rect x={130} y={r.y + 33} width={HW(r.before) * g} height={14} rx={2} fill={r.c} opacity={0.85} />
          <T x={130 + HW(r.before) + 8} y={r.y + 45} s={12} f={r.c} o={g}>{r.before.toFixed(4)}</T>
          <T x={30} y={r.y + 68} s={12} f={C.cherryText} o={t >= 1.3 ? 1 : 0}>after scan</T>
          <rect x={130} y={r.y + 57} width={lerp(HW(r.before), HW(r.after), dropK) * g} height={14} rx={2} fill={C.cherryText} opacity={t >= 1.3 ? 0.85 : 0} />
          <T x={130 + HW(r.after) + 8} y={r.y + 69} s={12} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.4))}>{r.after.toFixed(4)}</T>
        </g>
      ))}
      <g opacity={third}>
        <T x={30} y={226} s={12} f={C.latte}>ordinary traffic, miss ratio</T>
        {[
          ['LRU', 0.0749, C.crema],
          ['CLOCK', 0.0752, C.cinnamon],
          ['sampled', 0.0761, C.caramel],
        ].map(([lab, v, c], i) => (
          <g key={lab as string}>
            <T x={30} y={252 + i * 24} s={12} f={c as string}>{lab as string}</T>
            <rect x={110} y={241 + i * 24} width={MW(v as number) * third} height={13} rx={2} fill={c as string} opacity={0.85} />
            <T x={110 + MW(v as number) + 8} y={252 + i * 24} s={12} f={c as string}>{(v as number).toFixed(4)}</T>
          </g>
        ))}
        <T x={30} y={330} s={12} f={C.caramel} o={easeOut(seg(t, 3.8, 4.2))}>sampled, almost no structure: a little worse</T>
      </g>
    </Svg>
  );
}

// 10 · Recap. Three rows: the exact pair (an entry slides to the front of its chain: exact, a write per read); CLOCK
// (a hand sweeps a circle of flags: nearly as good, almost free); and both under one oversized scan (the row flushes).
export function Recap({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 0.2 + i * 0.9, 0.5 + i * 0.9));
  const mv = easeInOut(seg(t, 0.6, 1.1));
  const hand = -Math.PI / 2 + 2 * Math.PI * clamp(seg(t, 1.3, 2.4));
  const flush = clamp(seg(t, 2.4, 3.4));
  return (
    <Svg label="Three recap rows: the map and chain give exact order at a write per read; a flag and a sweeping hand give nearly the same at almost no cost; one oversized scan flushes both" h={290}>
      <g opacity={r(0)}>
        {[0, 1, 2].map((j) => {
          const x = j === 2 ? lerp(130, 40, mv) : lerp(40 + j * 45, 85 + j * 45, mv);
          return <rect key={j} x={x} y={j === 2 ? 40 - 14 * Math.sin(mv * Math.PI) : 40} width={34} height={22} rx={3} fill={C.roast} stroke={j === 2 ? C.caramel : C.crema} strokeWidth={1.3} />;
        })}
        <T x={190} y={56} s={13} f={C.crema}>map + chain: exact, a write per read</T>
      </g>
      <g opacity={r(1)}>
        <circle cx={90} cy={140} r={32} fill="none" stroke={C.mocha} strokeWidth={1.2} />
        {[0, 1, 2, 3].map((j) => {
          const an = -Math.PI / 2 + (j * Math.PI) / 2;
          const lit = ((an - hand) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) > 0.4;
          return <circle key={j} cx={90 + 32 * Math.cos(an)} cy={140 + 32 * Math.sin(an)} r={5} fill={lit ? C.cinnamon : C.roast} stroke={C.latte} strokeWidth={1.1} />;
        })}
        <line x1={90} y1={140} x2={90 + 24 * Math.cos(hand)} y2={140 + 24 * Math.sin(hand)} stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={146} s={13} f={C.cinnamon}>flag + hand: nearly as good</T>
      </g>
      <g opacity={r(2)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={30 + j * 34} y={222} width={28} height={22} rx={3} fill={C.roast} stroke={j < flush * 4.2 ? C.cherryText : C.crema} strokeWidth={1.3} />
        ))}
        <T x={190} y={238} s={13} f={C.cherryText}>both: one big scan flushes them</T>
      </g>
    </Svg>
  );
}
