import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing measured (the staircase, the knee), cherry/cherryText = a
// measurement mistake (overlap, a short cycle, a hidden prefetcher), taupe/latte = labels, crema = data.
// Every number shown is asserted in examples.py; latencies are drawn as positions, never printed beyond those figures.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

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

// The staircase every step reuses: working-set size to the right, latency up. Plateaus for L1, L2, L3, DRAM.
const STAIR: [number, number][] = [
  [40, 236],
  [140, 236],
  [140, 204],
  [260, 204],
  [260, 158],
  [380, 158],
  [380, 70],
  [560, 70],
];
/** The y of the staircase at x (for a probe dot riding it). */
const stairY = (x: number) => (x < 140 ? 236 : x < 260 ? 204 : x < 380 ? 158 : 70);

// 1 · The models took M and B as a gift. The two gift tags are struck out; the real hierarchy builds level by level,
// each size an unknown that pulses until it is measured.
export function Problem({ t }: StepCtx) {
  const levels: [string, number][] = [
    ['registers', 40],
    ['L1', 100],
    ['L2', 180],
    ['L3', 280],
    ['DRAM', 400],
  ];
  const strike = easeInOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="The block size B and the fast-memory size M were given; a real machine has registers, three caches and DRAM whose sizes must be measured" h={330}>
      <T x={25} y={34} s={15} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>the models: B and M, given</T>
      <line x1={22} y1={29} x2={22 + 246 * strike} y2={29} stroke={C.cherryText} strokeWidth={2} />
      {levels.map(([lvl, w], i) => {
        const at = 1.0 + i * 0.4;
        const a = easeOut(seg(t, at, at + 0.4));
        const g = easeOutBack(seg(t, at, at + 0.6));
        const y = 62 + i * 46;
        return (
          <g key={lvl} opacity={a}>
            <T x={25} y={y + 21} s={13} f={C.crema}>{lvl}</T>
            <rect x={120} y={y} width={Math.max(0, w * g)} height={30} rx={6} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
            <T x={130 + w} y={y + 22} s={17} f={C.caramel} w={700} o={0.55 + 0.45 * Math.abs(Math.sin((t - at) * 3))}>?</T>
          </g>
        );
      })}
      <Decode x={25} y={312} s={15} f={C.caramel} w={700} text="so: measure each one" t={t} at={3.0} dur={0.5} />
    </Svg>
  );
}

// 2 · Predict: the shape of the latency curve. After the answer the staircase draws itself, plateau by plateau.
export function StaircaseShapePredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  return (
    <Svg label="A working set swept from a few kibibytes to a gibibyte, timing one memory load at each size; the answer is a staircase" h={300}>
      <line x1={40} y1={250} x2={560} y2={250} stroke={C.taupe} />
      <line x1={40} y1={250} x2={40} y2={40} stroke={C.taupe} />
      <T x={560} y={276} s={13} f={C.taupe} a="end">working set →</T>
      <T x={50} y={50} s={13} f={C.taupe}>time per load</T>
      {answer === null && <T x={300} y={150} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && <Draw pts={STAIR} t={s} from={0.1} to={1.6} stroke={C.caramel} w={3} />}
    </Svg>
  );
}

// 3 · Timing one load means breaking the overlap. A playhead runs along a time axis: four independent loads overlap and
// finish together; four chained loads (p = next[p]) wait for each other, end to end.
export function PointerChasing({ t }: StepCtx) {
  const L = 116; // one load's latency, in time units on screen
  const ph = 40 + 500 * easeInOut(seg(t, 0.3, 3.3)); // the playhead
  const bar = (x0: number, y: number, fill: string, i: number) => {
    const w = clamp(ph - x0, 0, L);
    return (
      <g key={`${y}-${i}`}>
        <rect x={x0} y={y} width={L} height={18} rx={4} fill="none" stroke={C.mocha} opacity={ph > x0 ? 1 : 0.35} />
        <rect x={x0} y={y} width={w} height={18} rx={4} fill={fill} />
      </g>
    );
  };
  const chainX = (i: number) => 40 + i * (L + 10);
  return (
    <Svg label="Independent loads overlap in time and measure throughput; a dependency chain forces each load to wait for the last, measuring true latency" h={320}>
      <T x={25} y={30} s={13} f={C.latte}>independent loads: overlap</T>
      {[0, 1, 2, 3].map((i) => bar(40 + i * 14, 42 + i * 22, C.cherry, i))}
      <T x={40 + 3 * 14 + L + 14} y={112} s={13} f={C.cherryText} o={easeOut(seg(ph, 40 + 3 * 14 + L, 40 + 3 * 14 + L + 20))}>all done: throughput</T>
      <T x={25} y={170} s={13} f={C.latte}>chained loads: p = next[p]</T>
      {[0, 1, 2, 3].map((i) => bar(chainX(i), 184, C.caramel, i))}
      {[0, 1, 2].map((i) => (
        <Draw key={i} pts={[[chainX(i) + L - 6, 206], [chainX(i) + L + 5, 216], [chainX(i + 1) + 6, 206]]} t={ph} from={chainX(i) + L - 2} to={chainX(i + 1) + 2} stroke={C.latte} w={1.5} pen={false} />
      ))}
      <line x1={40} y1={244} x2={560} y2={244} stroke={C.mocha} />
      <line x1={ph} y1={36} x2={ph} y2={250} stroke={C.crema} strokeWidth={1} opacity={t < 3.4 ? 0.8 : 0} />
      <T x={560} y={266} s={13} f={C.taupe} a="end">time →</T>
      <T x={300} y={302} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.3, 3.8))}>no overlap: the whole latency is paid, every time</T>
    </Svg>
  );
}

// 4 · One cycle, visited in random order. Ten slots sit on a ring in address order. First a careless shuffle: a short
// loop (red) that a walker circles forever. Then Sattolo's cycle draws chord by chord in visiting order, and the walker
// follows it through every slot once.
const RING = 10;
const SATTOLO: number[] = (() => {
  // Sattolo's algorithm: for i from n−1 down to 1, swap a[i] with a[j], j drawn from strictly below i.
  const r = rng(7);
  const a = Array.from({ length: RING }, (_, i) => i);
  for (let i = RING - 1; i > 0; i--) {
    const j = Math.floor(r() * i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  // a is a single cycle: follow it from slot 0 to list the visiting order.
  const order = [0];
  while (order.length < RING) order.push(a[order[order.length - 1]]);
  return order;
})();
export function SattoloCycle({ t }: StepCtx) {
  const cx = 300, cy = 136, R = 100;
  const P = (i: number): [number, number] => [cx + Math.cos((i / RING) * Math.PI * 2 - Math.PI / 2) * R, cy + Math.sin((i / RING) * Math.PI * 2 - Math.PI / 2) * R];
  const SHORT = [0, 3, 6];
  const bad = 1 - easeOut(seg(t, 1.2, 1.5));
  // Walker on the short loop (0.3 to 1.2 s), then along Sattolo's cycle (1.5 to 3.3 s).
  const walk = (loop: number[], u: number, closed: boolean): [number, number] => {
    const n = closed ? loop.length : loop.length - 1;
    const pos = clamp(u) * n;
    const k = Math.min(Math.floor(pos), n - 1);
    const f = pos - k;
    const a = P(loop[k % loop.length]), b = P(loop[(k + 1) % loop.length]);
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  };
  const onShort = t < 1.2;
  const w = onShort ? walk(SHORT, ((t - 0.3) / 0.45) % 1, true) : walk([...SATTOLO, SATTOLO[0]], seg(t, 1.5, 3.3), false);
  const pts = [...SATTOLO, SATTOLO[0]].map(P);
  return (
    <Svg label="A careless shuffle leaves a short loop that revisits three slots; Sattolo's algorithm builds a single cycle through all ten slots, in random order" h={300}>
      {Array.from({ length: RING }, (_, i) => {
        const [x, y] = P(i);
        const visited = !onShort && SATTOLO.indexOf(i) <= Math.floor(seg(t, 1.5, 3.3) * RING);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={visited ? C.crema : C.cocoa} stroke={C.latte} strokeWidth={1.2} />
            <T x={x + (x >= cx ? 16 : -16)} y={y + 5} s={13} f={C.taupe} a={x >= cx ? 'start' : 'end'}>{String(i)}</T>
          </g>
        );
      })}
      <g opacity={bad}>
        {SHORT.map((a, k) => {
          const [x1, y1] = P(a), [x2, y2] = P(SHORT[(k + 1) % SHORT.length]);
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cherryText} strokeWidth={2} />;
        })}
        <T x={300} y={284} s={14} f={C.cherryText} a="middle">a short loop: three slots, forever</T>
      </g>
      <Draw pts={pts} t={t} from={1.5} to={3.3} stroke={C.caramel} w={2} pen={false} />
      <circle cx={w[0]} cy={w[1]} r={6} fill={onShort ? C.cherryText : C.focus} opacity={t < 3.3 ? 1 : 0} />
      <T x={300} y={284} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>one full cycle, every slot once, random order</T>
    </Svg>
  );
}

// 5 · Reading the staircase. A probe rides the curve as the working set grows; at each climb a dashed line drops to the
// size axis (that size is the capacity of the level just left); at the end the span from top step to bottom locks on.
export function StaircasePlateaus({ t }: StepCtx) {
  const steps = [
    { label: 'L1', y: 236, x: 90, lat: '~1 ns' },
    { label: 'L2', y: 204, x: 200, lat: 'a few ns' },
    { label: 'L3', y: 158, x: 320, lat: '~10 ns' },
    { label: 'DRAM', y: 70, x: 470, lat: '50-100 ns' },
  ];
  const px = 40 + 520 * easeInOut(seg(t, 0.2, 2.8));
  return (
    <Svg label="L1 costs about one nanosecond, L3 about ten, and DRAM fifty to a hundred: a hundredfold span; each climb sits at a cache's capacity" h={300}>
      <line x1={40} y1={262} x2={560} y2={262} stroke={C.mocha} />
      <Draw pts={STAIR} t={t} from={0.2} to={2.8} stroke={C.caramel} w={3} pen={false} />
      <circle cx={px} cy={stairY(px)} r={6} fill={C.focus} opacity={t < 2.9 ? 1 : 0} />
      {steps.map((s, i) => (
        <T key={s.label} x={s.x} y={s.y - 12} s={13} f={C.crema} a="middle" o={easeOut(seg(px, s.x - 40, s.x))}>{s.lat}</T>
      ))}
      {[140, 260, 380].map((x, i) => (
        <g key={x} opacity={easeOut(seg(px, x, x + 30))}>
          <line x1={x} y1={stairY(x - 1) + 4} x2={x} y2={262} stroke={C.latte} strokeDasharray="3 4" />
          <T x={x} y={284} s={13} f={C.latte} a="middle">{['L1', 'L2', 'L3'][i]} size</T>
        </g>
      ))}
      <Reticle x={300} y={153} w={540} h={190} t={t} at={3.4} color={C.latte} />
      <T x={555} y={150} s={20} f={C.caramel} a="end" serif w={700} o={easeOut(seg(t, 3.4, 3.9))}>×100</T>
    </Svg>
  );
}

// 6 · Predict: cost per access as the stride grows. After the answer the curve climbs, and the knee locks on.
export function StridePredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const curve: [number, number][] = Array.from({ length: 41 }, (_, i) => {
    const x = 40 + i * 13;
    const u = clamp((x - 40) / 280);
    return [x, Math.round(230 - 170 * (u < 1 ? u * u * (3 - 2 * u) : 1))];
  });
  return (
    <Svg label="Cost per access climbs as the stride grows, then flattens once the stride reaches the cache-line size" h={300}>
      <line x1={40} y1={250} x2={560} y2={250} stroke={C.taupe} />
      <line x1={40} y1={250} x2={40} y2={40} stroke={C.taupe} />
      <T x={560} y={276} s={13} f={C.taupe} a="end">stride →</T>
      <T x={50} y={34} s={13} f={C.taupe}>cost per access</T>
      {answer === null && <T x={300} y={150} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && (
        <>
          <Draw pts={curve} t={s} from={0.1} to={1.4} stroke={C.caramel} w={3} />
          <line x1={320} y1={60} x2={320} y2={250} stroke={C.latte} strokeDasharray="3 4" opacity={easeOut(seg(s, 1.3, 1.6))} />
          <Reticle x={320} y={60} w={34} h={34} t={s} at={1.4} />
          <T x={340} y={100} s={13} f={C.crema} o={easeOut(seg(s, 1.5, 1.9))}>knee: 64-byte line, 8 keys</T>
        </>
      )}
    </Svg>
  );
}

// 7 · A prefetcher can hide the knee. Eight 64-byte lines in a row; each access (white) also pulls in its neighbour
// (red, fetched too). Measured naively, a line seems 128 bytes wide; the bracket shows the true 64.
export function PrefetcherCaveat({ t }: StepCtx) {
  const LW = 64, X0 = 44;
  const touched = (k: number) => t >= 0.4 + (k / 2) * 0.45; // access k (even lines), one every 0.45 s
  const twin = (k: number) => t >= 0.6 + (Math.floor(k / 2)) * 0.45;
  const k = Math.min(3, Math.max(0, Math.floor((t - 0.4) / 0.45)));
  const arrowX = X0 + 2 * k * LW + LW / 2;
  const meas = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="An adjacent-line prefetcher pulls in the neighbouring line too, which can make a sixty four byte line look one hundred twenty eight bytes wide" h={300}>
      <T x={X0} y={34} s={13} f={C.latte}>memory, in 64-byte lines</T>
      {Array.from({ length: 8 }, (_, i) => {
        const self = i % 2 === 0 && touched(i);
        const pulled = i % 2 === 1 && twin(i - 1);
        return <rect key={i} x={X0 + i * LW + 2} y={92} width={LW - 4} height={40} rx={5} fill={self ? C.crema : pulled ? C.cherry : C.cocoa} stroke={C.mocha} />;
      })}
      <g opacity={t >= 0.4 && t < 2.3 ? 1 : 0} transform={`translate(${arrowX.toFixed(1)} 0)`}>
        <path d="M0 84 l-7 -12 h14 Z" fill={C.focus} />
        <T x={0} y={62} s={13} f={C.crema} a="middle">load</T>
      </g>
      <T x={X0 + LW * 1.5} y={160} s={13} f={C.cherryText} a="middle" o={twin(0) ? 1 : 0}>fetched too</T>
      <g opacity={meas}>
        <path d={`M${X0 + 2} 182 v8 h${2 * LW - 4} v-8`} stroke={C.cherryText} strokeWidth={2} fill="none" />
        <T x={X0 + LW} y={210} s={14} f={C.cherryText} a="middle" w={700}>128 B?</T>
        <path d={`M${X0 + 4 * LW + 2} 182 v8 h${LW - 4} v-8`} stroke={C.caramel} strokeWidth={2} fill="none" />
        <T x={X0 + 4.5 * LW} y={210} s={14} f={C.caramel} a="middle" w={700}>64 B</T>
      </g>
      <T x={300} y={258} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>random order, or name the prefetcher</T>
    </Svg>
  );
}

// 8 · A second miss, hiding underneath. A sweep strides across twelve pages; each new page takes one of the table's
// entries (8 drawn, standing for 64). Once the entries run out, every new page evicts one: a red miss. Then reach is
// entries × page size, and huge pages stretch the same entries 512 times further.
export function TlbReach({ t }: StepCtx) {
  const SLOTS = 8, PAGES = 12;
  const p = Math.min(PAGES, Math.floor(seg(t, 0.3, 2.3) * PAGES + 1e-9)); // pages touched so far
  const reach = easeOut(seg(t, 2.6, 3.1));
  const huge = easeInOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="A small table caches page translations; touching more pages than it has entries evicts them; reach is entries times page size, and 2 MiB huge pages give 512 times the reach" h={330}>
      <T x={25} y={30} s={13} f={C.latte}>translation table: 64 entries, a few drawn</T>
      {Array.from({ length: SLOTS }, (_, i) => {
        // The page held by slot i after p touches, and whether it was just evicted.
        const last = p > i ? i + SLOTS * Math.floor((p - 1 - i) / SLOTS) : -1;
        const evicted = last >= SLOTS && last === p - 1;
        return (
          <g key={i}>
            <rect x={25 + i * 68} y={42} width={60} height={30} rx={5} fill={evicted ? C.cherry : last >= 0 ? C.cocoa : 'none'} stroke={evicted ? C.cherryText : C.mocha} />
            {last >= 0 && <T x={55 + i * 68} y={62} s={13} f={evicted ? C.crema : C.latte} a="middle">p{last}</T>}
          </g>
        );
      })}
      <T x={25} y={110} s={13} f={C.latte}>pages, 4 KiB each</T>
      {Array.from({ length: PAGES }, (_, i) => (
        <rect key={i} x={25 + i * 45} y={120} width={41} height={22} rx={3} fill={i < p ? (i >= SLOTS ? C.cherry : C.crema) : C.cocoa} stroke={C.mocha} opacity={i < p ? 1 : 0.6} />
      ))}
      <T x={575} y={164} s={13} f={C.cherryText} a="end" o={p > SLOTS ? 1 : 0}>more pages than entries: misses</T>
      <g opacity={reach}>
        <T x={25} y={204} s={14} f={C.crema}>reach = 64 × 4 KiB = 256 KiB</T>
        <rect x={25} y={214} width={20} height={14} rx={3} fill={C.caramel} />
      </g>
      <g opacity={huge > 0 ? 1 : 0}>
        <rect x={25} y={250} width={20 + 530 * huge} height={14} rx={3} fill={C.cinnamon} />
        <T x={25} y={290} s={14} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>2 MiB pages: same entries, 512× the reach</T>
      </g>
    </Svg>
  );
}

// 9 · Sequential vs random tells the prefetcher apart. Both walks run side by side across the same footprint: the
// sequential probe stays low, the random one climbs the full staircase. The gap between them is the prefetcher.
export function SequentialVsRandom({ t }: StepCtx) {
  const px = 40 + 520 * easeInOut(seg(t, 0.3, 2.4));
  const gap = easeOut(seg(t, 2.5, 3.0));
  return (
    <Svg label="A sequential walk stays flat because the prefetcher predicts it; the same footprint walked at random climbs the full staircase" h={300}>
      <line x1={40} y1={250} x2={560} y2={250} stroke={C.mocha} />
      <Draw pts={[[40, 226], [560, 220]]} t={t} from={0.3} to={2.4} stroke={C.caramel} w={3} pen={false} />
      <Draw pts={STAIR.map(([x, y]) => [x, y - 4] as [number, number])} t={t} from={0.3} to={2.4} stroke={C.cherryText} w={3} pen={false} />
      <circle cx={px} cy={226 - ((px - 40) / 520) * 6} r={5} fill={C.caramel} opacity={t < 2.5 ? 1 : 0} />
      <circle cx={px} cy={stairY(px) - 4} r={5} fill={C.cherryText} opacity={t < 2.5 ? 1 : 0} />
      <T x={555} y={242} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 2.2, 2.6))}>sequential</T>
      <T x={555} y={56} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 2.2, 2.6))}>random</T>
      <g opacity={gap}>
        <line x1={530} y1={72} x2={530} y2={216} stroke={C.crema} strokeWidth={1.5} />
        <path d="M524 80 l6 -8 l6 8 M524 208 l6 8 l6 -8" stroke={C.crema} strokeWidth={1.5} fill="none" />
        <T x={520} y={150} s={13} f={C.crema} a="end">prefetcher</T>
      </g>
      <T x={300} y={284} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>the gap between them is the prefetcher, measured</T>
    </Svg>
  );
}

// 10 · Predict: why would the clock still spike? Twenty appends' times sit flat; after the answer the last resize's
// bar shoots up in red.
export function ClockSpikePredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const N = 20;
  const spike = easeOutBack(seg(s, 0.2, 0.8));
  return (
    <Svg label="A flat count of copies per append, but one resize near the end can still spike the clock if its copy spills into slow memory" h={300}>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOut(seg(t, i * 0.06, i * 0.06 + 0.4));
        const h = i === N - 1 ? 20 + 110 * spike : 20;
        return <rect key={i} x={25 + i * 27} y={220 - h} width={20} height={h} rx={4} fill={i === N - 1 && spike > 0.05 ? C.cherry : C.caramel} opacity={clamp(a)} />;
      })}
      {answer === null && <T x={300} y={270} s={16} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && <T x={300} y={270} s={14} f={C.cherryText} a="middle" o={easeOut(seg(s, 0.6, 1.0))}>one resize, copying into cold memory</T>}
    </Svg>
  );
}

// 11 · Back to the vector: count and clock agree. The doubling array's twenty resizes stand as bars (height: log of the
// copy); the copy count races to 1,048,575, about 1.05 per append. Then a cache line drops across them: the biggest
// copies spill past it and turn red, priced by the staircase.
export function Verdict({ t }: StepCtx) {
  const R = 20;
  const count = easeOut(seg(t, 0.3, 1.6));
  const spill = easeOut(seg(t, 1.8, 2.3));
  const copies = 2 ** Math.floor(count * R) - 1; // copies after the resizes so far
  return (
    <Svg label="A million appends make twenty resizes and 1,048,575 copies, about 1.05 per append; the biggest copies spill out of cache and cost the most time" h={320}>
      <T x={25} y={30} s={14} f={C.caramel} w={600}>the proof: count the copies</T>
      <T x={575} y={30} s={17} f={C.caramel} a="end" w={700}>{fmt(count >= 1 ? 1048575 : copies)}</T>
      <T x={575} y={52} s={13} f={C.latte} a="end" o={easeOut(seg(t, 1.4, 1.7))}>about 1.05 per append</T>
      {Array.from({ length: R }, (_, k) => {
        const on = k < count * R;
        const h = 8 + (k + 1) * 7;
        const hot = k >= 15 && spill > 0;
        return <rect key={k} x={40 + k * 26} y={236 - h * (on ? 1 : 0)} width={18} height={h * (on ? 1 : 0)} rx={3} fill={hot ? C.cherry : C.caramel} />;
      })}
      <g opacity={spill}>
        <line x1={30} y1={lerp(60, 128, spill)} x2={570} y2={lerp(60, 128, spill)} stroke={C.cinnamon} strokeDasharray="6 5" strokeWidth={1.5} />
        <T x={30} y={lerp(52, 120, spill)} s={13} f={C.cinnamon}>past the cache</T>
      </g>
      <T x={25} y={268} s={14} f={C.cinnamon} w={600} o={easeOut(seg(t, 2.3, 2.7))}>the staircase: price the time</T>
      <T x={25} y={300} s={13} f={C.taupe} o={easeOut(seg(t, 2.8, 3.3))}>the shape transfers; the exact numbers are this machine's</T>
    </Svg>
  );
}
