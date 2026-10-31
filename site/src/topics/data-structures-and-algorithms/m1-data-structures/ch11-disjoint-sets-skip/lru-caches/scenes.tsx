import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = an entry in the cache; latte = secondary labels (a count,
// a bit); taupe = not yet touched / out of the cache; caramel = the thing to look at (the entry
// just hit, the hand on the clock, the victim about to leave); cinnamon (rare) = the alternative
// policy being compared (CLOCK against exact LRU, always the same slot in each bar group); cherry
// (with cherryText) = the bad outcome (an evicted hot entry, a scan in flight).

const SLOT_X = [80, 170, 260, 350, 440, 530];
const SLOT_W = 70;

function slot(x: number, y: number, label: string, colour = C.crema, opacity = 1) {
  return (
    <g key={`${x}-${y}`} opacity={opacity}>
      <rect x={x} y={y} width={SLOT_W - 10} height={44} rx={4} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + (SLOT_W - 10) / 2} y={y + 28} s={14} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · A cache that's full
export function Hook({ t }: StepCtx) {
  const aRow = easeOut(seg(t, 0.1, 1.0));
  const aQ = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Six full cache slots, each holding an entry, with a question mark over a seventh request asking which one must leave" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>a cache, full, six of six slots used</T>
      <g opacity={aRow}>
        {SLOT_X.map((x, i) => slot(x, 90, `e${i + 1}`))}
      </g>
      <g opacity={aQ}>
        <T x={300} y={200} s={16} a="middle" f={C.caramel}>a new entry needs room</T>
        <T x={300} y={230} s={13} a="middle" f={C.latte}>which slot goes?</T>
        <T x={300} y={270} s={14} a="middle" f={C.latte}>with a timestamp per entry, finding the</T>
        <T x={300} y={290} s={14} a="middle" f={C.latte}>oldest one means scanning all of them</T>
      </g>
    </Svg>
  );
}

// 2 · Two structures, one answer
export function TwoStructures({ t }: StepCtx) {
  const aMap = easeOut(seg(t, 0.1, 1.2));
  const aList = easeOut(seg(t, 1.3, 2.5));
  const aArrows = easeOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="A key column with arrows into a doubly linked list of nodes in recency order, most recent on the left" h={360}>
      <g opacity={aMap}>
        <T x={30} y={24} s={13} f={C.latte}>a hash map</T>
        <T x={30} y={44} s={12} f={C.taupe}>key to node</T>
        {['k1', 'k2', 'k3'].map((k, i) => (
          <T key={k} x={40} y={90 + i * 36} s={14} f={C.crema}>{k}</T>
        ))}
      </g>
      <g opacity={aList}>
        <T x={220} y={24} s={13} f={C.latte}>a doubly linked list</T>
        <T x={220} y={44} s={12} f={C.taupe}>recency order, newest left</T>
        {['k2', 'k3', 'k1'].map((k, i) => {
          const x = 220 + i * 110;
          return (
            <g key={k}>
              {slot(x, 90, k, C.crema)}
              {i > 0 && <line x1={x} y1={112} x2={x + 110 - (SLOT_W - 10)} y2={112} stroke={C.crema} strokeWidth={1.6} />}
            </g>
          );
        })}
      </g>
      <g opacity={aArrows}>
        <path d="M70 100 C140 100 180 108 220 112" stroke={C.caramel} strokeWidth={1.4} fill="none" strokeDasharray="3 3" />
        <path d="M70 136 C150 160 280 180 440 112" stroke={C.caramel} strokeWidth={1.4} fill="none" strokeDasharray="3 3" />
        <path d="M70 172 C160 190 300 160 330 112" stroke={C.caramel} strokeWidth={1.4} fill="none" strokeDasharray="3 3" />
        <T x={300} y={260} s={13} a="middle" f={C.latte}>the map finds a node; the list orders nodes</T>
        <T x={300} y={290} s={13} a="middle" f={C.latte}>a node that knows its own neighbours can</T>
        <T x={300} y={310} s={13} a="middle" f={C.latte}>move without a scan — the O(1) splice</T>
      </g>
    </Svg>
  );
}

// 3 · What does a hit do, besides read? (predict)
export function HitDoes({ t, answer }: StepCtx) {
  const aRow = easeOut(seg(t, 0.1, 1.0));
  const aMove = answer ? easeOut(seg(t, 1.1, 2.0)) : 0;
  const order = ['k2', 'k3', 'k1'];
  return (
    <Svg label="A recency-ordered row of three entries, with the entry just read sliding from the middle to the front" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a get on k3 — recency order before and after</T>
      {order.map((k, i) => {
        const fromX = 100 + i * 140;
        const toIndex = k === 'k3' ? 0 : i < order.indexOf('k3') ? i + 1 : i;
        const toX = 100 + toIndex * 140;
        const x = fromX + (toX - fromX) * (k === 'k3' ? aMove : aMove * 0.5);
        return <g key={k} opacity={aRow}>{slot(x, 110, k, k === 'k3' ? C.caramel : C.crema)}</g>;
      })}
      {answer && (
        <T x={300} y={220} s={13} a="middle" f={C.caramel}>a read moves k3 to the front — a write</T>
      )}
    </Svg>
  );
}

// 4 · O(1), measured directly (takeaway)
export function O1Measured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const w100 = 6 / 6;
  const w50k = 6 / 6;
  return (
    <Svg label="Two bars, one for capacity one hundred and one for capacity fifty thousand, each topping out at six pointer writes" h={320}>
      <T x={30} y={30} s={13} f={C.latte}>max pointer writes per get/put, measured</T>
      <g opacity={a}>
        <T x={60} y={100} s={13} f={C.crema}>capacity 100</T>
        <Bar x={200} y={88} w={w100 * 300} h={16} full={300} fill={C.caramel} />
        <T x={520} y={100} s={13} f={C.crema}>six</T>
        <T x={60} y={160} s={13} f={C.crema}>capacity fifty thousand</T>
        <Bar x={200} y={148} w={w50k * 300} h={16} full={300} fill={C.caramel} />
        <T x={520} y={160} s={13} f={C.crema}>six</T>
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>same bound, five hundred times the entries</T>
    </Svg>
  );
}

// 5 · The replay
const PICTURE = ['A', 'B', 'C', 'A', 'D', 'B', 'E', 'A', 'C', 'D', 'B', 'A'];
const PICTURE_HITS = [false, false, false, true, false, false, false, false, false, false, false, false];

export function Replay({ t }: StepCtx) {
  const n = Math.min(PICTURE.length, Math.floor(seg(t, 0.2, 4.4) * PICTURE.length) + 1);
  return (
    <Svg label="Twelve accesses to a three-slot cache replayed one at a time, each marked hit or miss" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>capacity three, twelve accesses, replayed</T>
      {PICTURE.slice(0, n).map((k, i) => {
        const x = 50 + (i % 6) * 90;
        const y = 70 + Math.floor(i / 6) * 90;
        return (
          <g key={i}>
            {slot(x, y, k, PICTURE_HITS[i] ? C.caramel : C.crema)}
            <T x={x + 30} y={y + 58} s={11} a="middle" f={C.latte}>{PICTURE_HITS[i] ? 'hit' : 'miss'}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · What would make a hit cheaper? (predict)
export function HitCheaper({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A dimmed circular row of slots, hinting at a clock face, beside the question of what could make a hit cost less than a reorder" h={300}>
      <g opacity={a}>
        {Array.from({ length: 8 }, (_, i) => {
          const a2 = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const cx = 300 + Math.cos(a2) * 100;
          const cy = 150 + Math.sin(a2) * 100;
          return <circle key={i} cx={cx} cy={cy} r={6} fill="none" stroke={C.taupe} strokeWidth={1.4} />;
        })}
        <T x={300} y={155} s={13} a="middle" f={C.latte}>a hit still costs a reorder under LRU</T>
      </g>
      <T x={300} y={270} s={13} a="middle" f={C.latte}>what if the order only had to be approximate?</T>
    </Svg>
  );
}

// 7 · CLOCK, the lock-friendly approximation (takeaway)
export function ClockReveal({ t }: StepCtx) {
  const n = 8;
  const hand = Math.floor(seg(t, 0.3, 2.6) * n) % n;
  const aBars = easeOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="A circular row of eight slots with reference bits, a hand sweeping and clearing bits, beside a bar comparing LRU and CLOCK miss ratios" h={360}>
      <T x={30} y={22} s={13} f={C.latte}>a hand sweeps, clearing bits, choosing a victim</T>
      {Array.from({ length: n }, (_, i) => {
        const a2 = (i / n) * Math.PI * 2 - Math.PI / 2;
        const cx = 170 + Math.cos(a2) * 95;
        const cy = 135 + Math.sin(a2) * 95;
        const swept = i <= hand;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={11} fill="none" stroke={i === hand ? C.caramel : C.crema} strokeWidth={1.6} />
            <T x={cx} y={cy + 4} s={13} a="middle" f={swept ? C.taupe : C.crema}>{swept ? '0' : '1'}</T>
          </g>
        );
      })}
      <g opacity={aBars}>
        <T x={60} y={260} s={13} f={C.crema}>LRU miss ratio</T>
        <Bar x={210} y={248} w={0.0749 * 1000} h={14} full={100} fill={C.caramel} />
        <T x={60} y={300} s={13} f={C.cinnamon}>CLOCK miss ratio</T>
        <Bar x={210} y={288} w={0.0752 * 1000} h={14} full={100} fill={C.cinnamon} />
      </g>
    </Svg>
  );
}

// 8 · What happens when one giant scan runs through? (predict)
export function ScanPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const slide = easeOut(seg(t, 0.3, 2.2));
  return (
    <Svg label="A long row of single-use scan pages sliding toward a small cache that holds a hot working set" h={300}>
      <g opacity={a}>
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={30 + i * 14 - slide * 60} y={70} width={10} height={20} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.2} />
        ))}
        <T x={40} y={60} s={12} f={C.cherryText}>one scan, used once each</T>
      </g>
      {SLOT_X.slice(0, 3).map((x) => slot(x, 150, 'hot', C.crema))}
      <T x={300} y={240} s={13} a="middle" f={C.latte}>does the scan push the hot entries out?</T>
    </Svg>
  );
}

// 9 · A scan really does flush it (takeaway)
export function ScanReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Two pairs of bars, no-scan and after-scan hit rate, for LRU and for CLOCK, both dropping after the scan" h={360}>
      <T x={30} y={24} s={13} f={C.latte}>hit rate, right after a scan vs. with none</T>
      <g opacity={a}>
        <T x={60} y={80} s={13} f={C.crema}>LRU, no scan</T>
        <Bar x={230} y={68} w={0.4667 * 300} h={14} full={300} fill={C.crema} />
        <T x={60} y={116} s={13} f={C.caramel}>LRU, after scan</T>
        <Bar x={230} y={104} w={0.3767 * 300} h={14} full={300} fill={C.caramel} />
        <T x={60} y={172} s={13} f={C.cinnamon}>CLOCK, no scan</T>
        <Bar x={230} y={160} w={0.4767 * 300} h={14} full={300} fill={C.cinnamon} />
        <T x={60} y={208} s={13} f={C.caramel}>CLOCK, after scan</T>
        <Bar x={230} y={196} w={0.3733 * 300} h={14} full={300} fill={C.caramel} />
      </g>
      <T x={300} y={270} s={13} a="middle" f={C.latte}>a few random samples do a little worse still</T>
      <T x={300} y={296} s={13} a="middle" f={C.latte}>with no ordered structure to lose in the first place</T>
    </Svg>
  );
}

// 10 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Three small icons in a row: a map and list, a clock, and a pair of dice, each labelled with its trade-off" h={300}>
      <g opacity={a}>
        <T x={100} y={90} s={14} a="middle" f={C.crema}>map + list</T>
        <T x={100} y={116} s={12} a="middle" f={C.latte}>exact order</T>
        <T x={100} y={136} s={12} a="middle" f={C.latte}>reorder each hit</T>
        <T x={300} y={90} s={14} a="middle" f={C.crema}>CLOCK</T>
        <T x={300} y={116} s={12} a="middle" f={C.latte}>approximate</T>
        <T x={300} y={136} s={12} a="middle" f={C.latte}>one bit each hit</T>
        <T x={500} y={90} s={14} a="middle" f={C.crema}>sampled</T>
        <T x={500} y={116} s={12} a="middle" f={C.latte}>no order</T>
        <T x={500} y={136} s={12} a="middle" f={C.latte}>a few probes</T>
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>none of them survive a scan</T>
      <T x={300} y={250} s={13} a="middle" f={C.latte}>which is next topic's whole subject</T>
    </Svg>
  );
}
