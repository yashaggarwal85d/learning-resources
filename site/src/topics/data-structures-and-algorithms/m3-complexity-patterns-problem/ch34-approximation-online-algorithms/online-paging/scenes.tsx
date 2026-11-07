import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the algorithm's own solution (the cache contents);
// latte = secondary labels; taupe = not yet decided; caramel = the thing to look at (the
// page being evicted, the move being tried); cinnamon (rare) = the benchmark (the offline
// optimum); cherry/cherryText = the bad outcome (a fault, the cache losing every time).
//
// Every printed number is examples.py's: k = 4, 2,000 adversary requests and 2,000 faults,
// the adversary's own trace 4, 0, 1, 2, 3, 4, ...; the classic string 1 2 3 4 1 2 5 1 2 3 4 5
// with FIFO 9 then 10, LRU 10 then 8, the optimum 7 then 6; the ratios 2.0, 2.99, 3.98, 4.95
// at k = 2 to 5. Cache contents are run below by the same three loops examples.py uses
// (LRU, FIFO, Bélády's furthest-next-use), each new page taking the evicted page's slot.

/** examples.py's build_adversary_trace(4, ...): the first sixteen requests. */
const ADV = [4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4];
/** examples.py's ANOMALY_SEQUENCE. */
const SEQ = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
/** The shortest k = 3 string on which FIFO evicts a page marked in the current phase. */
const MARK_SEQ = [1, 2, 3, 4, 2, 1];

type Pol = 'lru' | 'fifo' | 'opt';
type Snap = { slots: (number | null)[]; hit: boolean; evicted: number | null; slot: number };

/** One cache run, request by request: examples.py's lru_faults / fifo_faults / opt_faults, keeping slot positions. */
function run(seq: number[], k: number, pol: Pol): Snap[] {
  const slots: (number | null)[] = Array(k).fill(null);
  const order: number[] = [];
  const out: Snap[] = [];
  seq.forEach((p, i) => {
    if (order.includes(p)) {
      if (pol === 'lru') {
        order.splice(order.indexOf(p), 1);
        order.push(p);
      }
      out.push({ slots: [...slots], hit: true, evicted: null, slot: slots.indexOf(p) });
      return;
    }
    let evicted: number | null = null;
    if (order.length === k) {
      if (pol === 'opt') {
        const next = (f: number) => {
          const j = seq.indexOf(f, i + 1);
          return j < 0 ? Infinity : j;
        };
        evicted = order.reduce((a, b) => (next(b) > next(a) ? b : a));
        order.splice(order.indexOf(evicted), 1);
      } else {
        evicted = order.shift() as number;
      }
    }
    order.push(p);
    const slot = evicted === null ? slots.indexOf(null) : slots.indexOf(evicted);
    slots[slot] = p;
    out.push({ slots: [...slots], hit: false, evicted, slot });
  });
  return out;
}

const ADV_LRU = run(ADV, 4, 'lru');
const ANOM = {
  fifo3: run(SEQ, 3, 'fifo'),
  fifo4: run(SEQ, 4, 'fifo'),
  lru3: run(SEQ, 3, 'lru'),
  lru4: run(SEQ, 4, 'lru'),
  opt3: run(SEQ, 3, 'opt'),
  opt4: run(SEQ, 4, 'opt'),
};
const OPT3 = ANOM.opt3;
const MARK_FIFO = run(MARK_SEQ, 3, 'fifo');
const MARK_LRU = run(MARK_SEQ, 3, 'lru');

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

/** A row of page cells. */
function Strip({ seq, x0, y, gap, cur = -1, hide = false, col }: { seq: number[]; x0: number; y: number; gap: number; cur?: number; hide?: boolean; col?: (i: number) => string | undefined }) {
  return (
    <g>
      {seq.map((p, i) => {
        const future = hide && i > cur;
        const fill = col?.(i);
        return (
          <g key={i}>
            <rect x={x0 + i * gap - 13} y={y - 15} width={26} height={22} fill={fill ?? 'none'} fillOpacity={fill ? 0.3 : 0} stroke={i === cur ? C.caramel : C.mocha} strokeWidth={i === cur ? 2 : 1} />
            <T x={x0 + i * gap} y={y + 1} s={12} a="middle" f={future ? C.taupe : i === cur ? C.caramel : C.latte}>{future ? '?' : `${p}`}</T>
          </g>
        );
      })}
    </g>
  );
}

/** Cache slots. */
function Slots({ snap, x0, y, gap, flash, marked }: { snap?: Snap; x0: number; y: number; gap: number; flash?: string; marked?: Set<number> }) {
  const k = snap?.slots.length ?? 0;
  return (
    <g>
      {Array.from({ length: k }).map((_, j) => {
        const p = snap?.slots[j];
        const changed = snap && !snap.hit && snap.slot === j;
        const isMarked = p != null && marked?.has(p);
        return (
          <g key={j}>
            <rect x={x0 + j * gap} y={y} width={42} height={30} fill="none" stroke={changed && flash ? flash : isMarked ? C.caramel : C.latte} strokeWidth={changed || isMarked ? 2 : 1.2} />
            <T x={x0 + j * gap + 21} y={y + 20} s={13} a="middle" f={C.crema}>{p == null ? '' : `${p}`}</T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · The hook: a cache that always loses
export function CyclicTrace({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const i = stepIdx(t, 0.4, 3.8, 14);
  const snap = i >= 0 ? ADV_LRU[i] : undefined;
  const end = easeOut(seg(t, 4.0, 4.5));
  return (
    <Svg label="Requests cycle through five pages, 4, 0, 1, 2, 3 and round again, into a cache of four. Each request asks for the page the cache just evicted, so every one is a fault; over 2,000 requests, 2,000 faults" h={280}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>requests, five pages</T>
        <Strip seq={ADV.slice(0, 14)} x0={44} y={64} gap={38} cur={i} hide col={(j) => (j < i || j === i ? C.cherry : undefined)} />
        <T x={30} y={140} s={12} f={C.latte}>cache, 4 pages</T>
        <Slots snap={snap ?? { slots: [null, null, null, null], hit: true, evicted: null, slot: -1 }} x0={200} y={118} gap={56} flash={C.cherry} />
      </g>
      <g opacity={i >= 0 ? 1 : 0}>
        <T x={300} y={200} s={12} a="middle" f={C.cherryText}>{snap?.evicted != null ? `fault: evict ${snap.evicted}, the next request` : 'fault: the page is not there'}</T>
      </g>
      <T x={300} y={252} s={15} a="middle" f={C.caramel} o={end}>2,000 requests: 2,000 faults</T>
    </Svg>
  );
}

// 2 · Online against offline
export function OnlineConstraint({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const cur = stepIdx(t, 0.6, 3.2, 12);
  const b = easeOut(seg(t, 1.6, 2.2));
  const c = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="Two copies of one request stream. Online, a cursor moves along it and every request after the cursor is a question mark. Offline, the whole stream is visible at once, and no running system ever has that" h={250}>
      <g opacity={a}>
        <T x={30} y={60} s={12} f={C.crema}>online</T>
        <Strip seq={SEQ} x0={150} y={60} gap={36} cur={cur} hide />
        <T x={137} y={92} s={11} f={C.latte}>decides with the past only</T>
      </g>
      <g opacity={b}>
        <T x={30} y={150} s={12} f={C.cinnamon}>offline</T>
        <Strip seq={SEQ} x0={150} y={150} gap={36} />
        <T x={137} y={182} s={11} f={C.latte}>sees the whole stream first</T>
      </g>
      <T x={300} y={232} s={12} a="middle" f={C.cherryText} o={c}>offline: never available to a running system</T>
    </Svg>
  );
}

// 3 · The adversary: k + 1 pages, always the one just evicted
export function AdversaryArgument({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.7, 1.2));
  const i = 4 + Math.max(0, stepIdx(t, 1.3, 4.3, 6));
  const snap = ADV_LRU[i];
  const out = [0, 1, 2, 3, 4].find((p) => !snap.slots.includes(p)) as number;
  const next = ADV[i + 1];
  const live = t >= 1.3;
  return (
    <Svg label="A cache of k = 4 slots and k + 1 = 5 pages: one page is always outside. The opponent asks for exactly that page; it comes in, another goes out, and the opponent asks for that one next. Every request faults" h={270}>
      <g opacity={a}>
        <T x={30} y={34} s={12} f={C.latte}>k = 4 slots</T>
        <T x={30} y={56} s={12} f={C.latte}>k + 1 = 5 pages</T>
        <Slots snap={snap} x0={150} y={110} gap={56} flash={live ? C.cherry : undefined} />
        <T x={150} y={100} s={11} f={C.latte}>in the cache</T>
      </g>
      <g opacity={b}>
        <rect x={430} y={110} width={42} height={30} fill="none" stroke={C.cherry} strokeWidth={1.6} strokeDasharray="4 3" />
        <T x={451} y={130} s={13} a="middle" f={C.cherryText}>{`${out}`}</T>
        <T x={430} y={100} s={11} f={C.cherryText}>outside</T>
        <path d="M451 196 L451 148" stroke={C.caramel} strokeWidth={1.6} />
        <path d="M445 156 L451 146 L457 156" fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={451} y={214} s={12} a="middle" f={C.caramel}>{`next request: ${live ? next : out}`}</T>
      </g>
      <T x={30} y={214} s={12} f={C.crema} o={b}>ask for the one</T>
      <T x={30} y={232} s={12} f={C.crema} o={b}>just thrown out</T>
      <T x={300} y={262} s={12} a="middle" f={C.cherryText} o={live ? 1 : 0}>never in the cache: a fault, every time</T>
    </Svg>
  );
}

// 4 · Predict: could a cleverer fixed rule escape?
export function PredictEscape({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const loop = (t * 0.6) % 1;
  const ask = easeOut(seg(t, 2.6, 3.1));
  const rev = answered ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const along = (u: number): [number, number] => {
    // top arc left → right, then bottom arc right → left
    if (u < 0.5) {
      const v = u / 0.5;
      return [lerp(220, 380, v), 90 - Math.sin(v * Math.PI) * 40];
    }
    const v = (u - 0.5) / 0.5;
    return [lerp(380, 220, v), 130 + Math.sin(v * Math.PI) * 40];
  };
  const [dx, dy] = along(loop);
  return (
    <Svg label="A loop between a fixed rule and the opponent: the rule's eviction feeds the opponent, the opponent's next request feeds the rule. After answering, the rule becomes a random one, and the opponent has nothing fixed to aim at" h={260}>
      <g opacity={a}>
        <rect x={80} y={90} width={140} height={40} fill="none" stroke={rev > 0.5 ? C.cinnamon : C.crema} strokeWidth={1.4} />
        <T x={150} y={115} s={12} a="middle" f={rev > 0.5 ? C.cinnamon : C.crema}>{rev > 0.5 ? 'random rule' : 'fixed rule'}</T>
        <rect x={380} y={90} width={140} height={40} fill="none" stroke={C.cherry} strokeWidth={1.4} />
        <T x={450} y={115} s={12} a="middle" f={C.cherryText}>opponent</T>
        <path d="M220 90 Q300 10 380 90" fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray={rev > 0.5 ? '3 5' : undefined} opacity={1 - 0.6 * rev} />
        <path d="M380 130 Q300 210 220 130" fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={300} y={40} s={11} a="middle" f={C.latte}>{rev > 0.5 ? 'its eviction: unknown' : 'its eviction'}</T>
        <T x={300} y={190} s={11} a="middle" f={C.latte}>the next request</T>
        <circle cx={dx} cy={dy} r={5} fill={C.caramel} opacity={1 - rev} />
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>could a cleverer fixed rule dodge this?</T>
      <T x={300} y={240} s={12} a="middle" f={C.cinnamon} o={rev}>no fixed rule; randomness leaves nothing to aim at</T>
    </Svg>
  );
}

// 5 · Bélády's offline optimum: evict the page needed furthest ahead
export function BeladyOptimum({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const arcs = stepIdx(t, 0.8, 2.3, 3);
  const pick = easeOut(seg(t, 2.5, 3.0));
  const swap = t >= 3.2;
  const end = easeOut(seg(t, 3.8, 4.4));
  const x = (i: number) => 60 + i * 44;
  const cached = OPT3[2].slots as number[]; // [1, 2, 3] just before request 3 (page 4)
  const nextUse = cached.map((p) => SEQ.indexOf(p, 4));
  const far = OPT3[3].evicted;
  return (
    <Svg label="The classic string with a cursor on its fourth request, page 4, a fault with pages 1, 2, 3 cached. Arcs reach from the cursor to each cached page's next use: 1 next, then 2, and 3 furthest away; 3 is evicted. It needs the future, so it is only a yardstick" h={280}>
      <g opacity={a}>
        <Strip seq={SEQ} x0={60} y={50} gap={44} cur={3} />
        <T x={30} y={200} s={12} f={C.latte}>cache</T>
        <Slots snap={swap ? OPT3[3] : OPT3[2]} x0={100} y={180} gap={56} flash={C.cinnamon} />
      </g>
      {cached.map((p, j) => {
        const isFar = p === far;
        const x2 = x(nextUse[j]);
        const depth = 18 + (nextUse[j] - 3) * 11;
        return (
          <g key={p} opacity={arcs >= j ? 1 : 0}>
            <path d={`M${x(3)} 62 Q${(x(3) + x2) / 2} ${62 + depth * 2} ${x2} 62`} fill="none" stroke={isFar && pick > 0.5 ? C.cherry : C.latte} strokeWidth={isFar && pick > 0.5 ? 2 : 1.2} />
            <T x={x2 + 9} y={84} s={12} a="middle" f={isFar && pick > 0.5 ? C.cherryText : C.latte}>{`${p}`}</T>
          </g>
        );
      })}
      <T x={330} y={200} s={12} f={C.cherryText} o={pick}>{`evict ${far}: needed furthest ahead`}</T>
      <g opacity={end}>
        <T x={300} y={248} s={12} a="middle" f={C.cinnamon}>always the fewest faults, but it reads the future</T>
        <T x={300} y={270} s={12} a="middle" f={C.latte}>so it is a yardstick, never a running policy</T>
      </g>
    </Svg>
  );
}

// 6 · The marking rule: LRU keeps it, FIFO breaks it
export function MarkingAlgorithm({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const i = stepIdx(t, 0.4, 3.6, 6);
  const end = easeOut(seg(t, 3.8, 4.3));
  // phases of k = 3 distinct pages: 1 2 3 | 4 2 1
  const marked = new Set<number>(i < 0 ? [] : i < 3 ? MARK_SEQ.slice(0, i + 1) : MARK_SEQ.slice(3, i + 1));
  const x = (j: number) => 150 + j * 64;
  return (
    <Svg label="Requests 1, 2, 3, then 4, 2, 1 into a cache of three. A page is marked when first asked for in a phase; the fourth distinct page starts a new phase and clears the marks. At the last request FIFO evicts page 2, marked moments earlier; LRU evicts page 3, unmarked" h={290}>
      <g opacity={a}>
        <Strip seq={MARK_SEQ} x0={150} y={50} gap={64} cur={i} />
        {MARK_SEQ.map((p, j) => (
          <circle key={j} cx={x(j)} cy={20} r={4} fill={C.caramel} opacity={j <= i && marked.has(p) && (i < 3 || j >= 3) ? 1 : 0} />
        ))}
        <line x1={x(2) + 32} y1={14} x2={x(2) + 32} y2={68} stroke={C.latte} strokeWidth={1} strokeDasharray="3 3" opacity={i >= 3 ? 1 : 0} />
        <T x={30} y={24} s={11} f={C.caramel}>marked</T>
        <T x={x(2) + 40} y={88} s={11} f={C.latte} o={i >= 3 ? 1 : 0}>new phase: marks clear</T>
        <T x={30} y={146} s={12} f={C.crema}>FIFO</T>
        <Slots snap={i >= 0 ? MARK_FIFO[i] : undefined} x0={150} y={126} gap={56} flash={i === 5 ? C.cherry : C.latte} marked={marked} />
        <T x={30} y={216} s={12} f={C.crema}>LRU</T>
        <Slots snap={i >= 0 ? MARK_LRU[i] : undefined} x0={150} y={196} gap={56} flash={C.latte} marked={marked} />
      </g>
      <g opacity={end}>
        <T x={330} y={146} s={12} f={C.cherryText}>{`evicts ${MARK_FIFO[5].evicted}: marked!`}</T>
        <T x={330} y={216} s={12} f={C.latte}>{`evicts ${MARK_LRU[5].evicted}: unmarked`}</T>
        <T x={300} y={270} s={12} a="middle" f={C.caramel}>LRU never evicts a marked page; FIFO can</T>
      </g>
    </Svg>
  );
}

// 7 · Predict: can more room mean more faults?
export function PredictAnomaly({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.8, 1.3));
  const ask = easeOut(seg(t, 1.6, 2.1));
  const rev = answered ? easeOut(seg(s, 0.3, 1.0)) : 0;
  return (
    <Svg label="The same request string fed to a FIFO cache of three frames and one of four. After answering, the counts appear: 9 faults with three frames, 10 with four" h={250}>
      <g opacity={a}>
        <T x={60} y={50} s={12} f={C.latte}>FIFO, 3 frames</T>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={60 + j * 48} y={70} width={40} height={30} fill="none" stroke={C.latte} strokeWidth={1.2} />
        ))}
        <T x={60} y={140} s={14} f={rev > 0 ? C.crema : C.taupe}>{rev > 0 ? '9 faults' : '? faults'}</T>
      </g>
      <g opacity={b}>
        <T x={340} y={50} s={12} f={C.latte}>FIFO, 4 frames</T>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={340 + j * 48} y={70} width={40} height={30} fill="none" stroke={C.latte} strokeWidth={1.2} />
        ))}
        <T x={340} y={140} s={14} f={rev > 0 ? C.cherryText : C.taupe}>{rev > 0 ? '10 faults' : '? faults'}</T>
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>more room: can the fault count climb?</T>
      <T x={300} y={210} s={12} a="middle" f={C.cherryText} o={rev}>more room, more faults</T>
    </Svg>
  );
}

// 8 · Bélády's anomaly, request by request
export function BeladyAnomaly({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const i = stepIdx(t, 0.5, 3.5, 12);
  const tot = t >= 3.6;
  const hl = easeOut(seg(t, 4.0, 4.5));
  const rows: [string, Snap[], number][] = [
    ['FIFO, 3', ANOM.fifo3, 9],
    ['FIFO, 4', ANOM.fifo4, 10],
    ['LRU, 3', ANOM.lru3, 10],
    ['LRU, 4', ANOM.lru4, 8],
    ['best, 3', ANOM.opt3, 7],
    ['best, 4', ANOM.opt4, 6],
  ];
  const x = (j: number) => 130 + j * 32;
  return (
    <Svg label="The classic string across the top; six rows beneath it fill in fault by fault. FIFO faults 9 times with three frames and 10 with four. LRU faults 10 then 8; the true optimum 7 then 6" h={290}>
      <g opacity={a}>
        {SEQ.map((p, j) => (
          <T key={j} x={x(j)} y={30} s={12} a="middle" f={j === i ? C.caramel : C.latte}>{`${p}`}</T>
        ))}
        <T x={556} y={30} s={11} a="end" f={C.latte}>faults</T>
      </g>
      {rows.map(([lab, snaps, total], r) => {
        const y = 60 + r * 34;
        const fifo = r < 2;
        return (
          <g key={lab} opacity={a}>
            <T x={20} y={y + 4} s={12} f={fifo ? C.crema : r >= 4 ? C.cinnamon : C.crema}>{lab}</T>
            {snaps.map((sn, j) => (
              <rect key={j} x={x(j) - 11} y={y - 11} width={22} height={20} fill={j <= i && !sn.hit ? C.cherry : 'none'} fillOpacity={0.55} stroke={j <= i ? C.mocha : C.line} strokeWidth={1} />
            ))}
            {r % 2 === 1 && (
              <line x1={14} y1={y + 17} x2={556} y2={y + 17} stroke={C.line} strokeWidth={1} />
            )}
            <T x={540} y={y + 4} s={13} a="end" f={fifo && hl > 0.5 ? C.cherryText : C.crema} o={tot ? 1 : 0}>{`${total}`}</T>
          </g>
        );
      })}
      <rect x={515} y={44} width={34} height={56} fill="none" stroke={C.cherry} strokeWidth={1.6} opacity={hl} />
      <T x={300} y={278} s={12} a="middle" f={C.cherryText} o={hl}>FIFO: more room, more faults; others improve</T>
    </Svg>
  );
}

// 9 · A worst case is not a typical case
export function ConnectingToPractice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 1.0, 1.6));
  const c = easeOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="A ceiling labelled the worst case, k times the optimum's faults, with the one hostile sequence pinned against it; ordinary request traces sit far below the ceiling" h={260}>
      <g opacity={a}>
        <line x1={60} y1={30} x2={60} y2={220} stroke={C.mocha} strokeWidth={1} />
        <T x={70} y={236} s={11} f={C.latte}>faults, against the optimum's</T>
        <line x1={60} y1={70} x2={560} y2={70} stroke={C.cherry} strokeWidth={1.4} strokeDasharray="6 4" />
        <T x={70} y={58} s={12} f={C.cherryText}>worst case: k times</T>
      </g>
      <g opacity={b}>
        <circle cx={420} cy={70} r={7} fill={C.cherry} />
        <T x={420} y={98} s={11} a="middle" f={C.cherryText}>built to hurt</T>
      </g>
      <g opacity={c}>
        <rect x={120} y={lerp(220, 180, c)} width={360} height={28} fill={C.cinnamon} opacity={0.25} />
        <T x={300} y={172} s={12} a="middle" f={C.cinnamon}>ordinary traces: far below</T>
      </g>
    </Svg>
  );
}

// 10 · Recap: the ratio reaches k
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const k = stepIdx(t, 0.5, 2.5, 4);
  const b = easeOut(seg(t, 2.8, 3.3));
  const c = easeOut(seg(t, 3.8, 4.3));
  const ratios: [number, string][] = [
    [2, '2.0'],
    [3, '2.99'],
    [4, '3.98'],
    [5, '4.95'],
  ];
  const base = 196;
  const u = 32;
  return (
    <Svg label="On the opponent's trace, LRU's faults over the optimum's: 2.0, 2.99, 3.98, 4.95 at k = 2, 3, 4, 5, each bar reaching its dashed line at k. True of the worst input, rarely the one in front of you; next, complexity budgeting from constraints" h={290}>
      <T x={30} y={24} s={12} f={C.latte} o={a}>the opponent's trace: LRU ÷ optimum</T>
      {ratios.map(([kk, v], j) => {
        const x = 120 + j * 110;
        const vis = j <= k ? 1 : 0;
        return (
          <g key={kk} opacity={a}>
            <line x1={x - 10} y1={base - kk * u} x2={x + 50} y2={base - kk * u} stroke={C.latte} strokeWidth={1} strokeDasharray="4 3" />
            <rect x={x} y={base - Number(v) * u} width={40} height={Number(v) * u} fill={C.cherry} opacity={0.55 * vis} />
            <T x={x + 20} y={base - Number(v) * u - 8} s={12} a="middle" f={C.cherryText} o={vis}>{v}</T>
            <T x={x + 20} y={base + 18} s={12} a="middle" f={C.latte}>{`k = ${kk}`}</T>
          </g>
        );
      })}
      <T x={300} y={248} s={12} a="middle" f={C.crema} o={b}>true of the worst input, rarely the one you have</T>
      <T x={300} y={276} s={12} a="middle" f={C.caramel} o={c}>next: complexity budgeting from constraints</T>
    </Svg>
  );
}
