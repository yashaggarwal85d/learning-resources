import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing measured (the staircase, the knee), cherry/cherryText = a
// measurement mistake (overlap, a short cycle, a hidden prefetcher), taupe/latte = labels, crema = data.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · The models took M and B as a gift.
export function Problem({ t }: StepCtx) {
  const levels = ['registers', 'L1', 'L2', 'L3', 'DRAM'];
  return (
    <Svg label="A staircase of memory levels, each larger and slower than the one above it, that the earlier models simply assumed" h={320}>
      {levels.map((lvl, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.3, 0.7 + i * 0.3));
        const w = 60 + i * 70;
        return (
          <g key={lvl} opacity={clamp(a)}>
            <rect x={25} y={40 + i * 48} width={w} height={32} rx={7} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
            <T x={25 + w + 10} y={60 + i * 48} s={13} f={C.crema}>{lvl}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Predict: the shape of the latency curve.
export function StaircaseShapePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const draw = easeOut(seg(t, 0.3, 2.4));
  return (
    <Svg label="A working set swept from a few kibibytes to a gibibyte, timing one memory load at each size" h={300}>
      <line x1={40} y1={240} x2={560} y2={240} stroke={C.taupe} />
      <line x1={40} y1={240} x2={40} y2={40} stroke={C.taupe} />
      {!answered && <T x={300} y={140} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <path
          d={`M40 220 H140 V180 H260 V130 H380 V60 H560`}
          stroke={C.caramel}
          strokeWidth={3}
          fill="none"
          opacity={draw}
        />
      )}
    </Svg>
  );
}

// 3 · Timing one load means breaking the overlap.
export function PointerChasing({ t }: StepCtx) {
  const overlap = easeOut(seg(t, 0.3, 1.4));
  const chain = easeOut(seg(t, 1.8, 3.2));
  return (
    <Svg label="Independent loads overlap and measure throughput; a dependency chain forces each load to wait for the last, measuring true latency" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>independent loads: overlap</T>
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={25 + i * 30} y={48} width={22} height={22} rx={5} fill={C.cherry} opacity={overlap} />
      ))}
      <T x={25} y={140} s={13} f={C.latte}>chained loads: p = next[p]</T>
      {Array.from({ length: 4 }, (_, i) => {
        const a = easeOut(seg(t, 1.8 + i * 0.3, 2.1 + i * 0.3));
        return <rect key={i} x={25 + i * 60} y={154} width={40} height={26} rx={6} fill={C.caramel} opacity={clamp(a)} />;
      })}
      <T x={300} y={240} s={14} f={C.crema} a="middle" o={chain}>no overlap: the whole latency is paid, every time</T>
    </Svg>
  );
}

// 4 · One cycle, visited in random order.
export function SattoloCycle({ t }: StepCtx) {
  const N = 10;
  const r = (i: number) => rng(i + 3)();
  const draw = easeOut(seg(t, 0.3, 2.0));
  const cx = 300, cy = 140, R = 100;
  return (
    <Svg label="A single cycle through every slot, built with Sattolo's algorithm, and visited in random order so nothing can be predicted" h={300}>
      {Array.from({ length: N }, (_, i) => {
        const a1 = (i / N) * Math.PI * 2;
        const a2 = ((i + 1) / N) * Math.PI * 2;
        const a = clamp(draw * N - i);
        return (
          <g key={i} opacity={a}>
            <line x1={cx + Math.cos(a1) * R} y1={cy + Math.sin(a1) * R} x2={cx + Math.cos(a2) * R} y2={cy + Math.sin(a2) * R} stroke={C.caramel} strokeWidth={2} />
            <circle cx={cx + Math.cos(a1) * R} cy={cy + Math.sin(a1) * R} r={6} fill={C.crema} />
          </g>
        );
      })}
      <T x={300} y={270} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>one full cycle, every slot visited once</T>
    </Svg>
  );
}

// 5 · Reading the staircase.
export function StaircasePlateaus({ t }: StepCtx) {
  const steps = [
    { label: 'L1', y: 220, lat: '~1 ns' },
    { label: 'L2', y: 180, lat: 'a few ns' },
    { label: 'L3', y: 130, lat: '~10 ns' },
    { label: 'DRAM', y: 60, lat: '50-100 ns' },
  ];
  return (
    <Svg label="L1 costs about one nanosecond, L3 about ten, and DRAM fifty to a hundred: a hundredfold span from top step to bottom" h={300}>
      <path d="M40 236 H140 V220 H260 V180 H380 V130 H560 V60" stroke={C.caramel} strokeWidth={3} fill="none" opacity={easeOut(seg(t, 0.3, 2.0))} />
      {steps.map((s, i) => (
        <T key={s.label} x={60 + i * 130} y={s.y - 12} s={12} f={C.crema} o={easeOut(seg(t, 0.6 + i * 0.3, 1.2 + i * 0.3))}>{s.lat}</T>
      ))}
    </Svg>
  );
}

// 6 · Predict: cost per access as the stride grows.
export function StridePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const draw = easeOut(seg(t, 0.3, 2.2));
  return (
    <Svg label="Cost per access climbs as the stride grows, then flattens once the stride reaches the cache-line size" h={300}>
      {!answered && <T x={300} y={140} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <path d="M40 220 C 160 220, 220 70, 320 60 L 560 60" stroke={C.caramel} strokeWidth={3} fill="none" opacity={draw} />
      )}
      {answered && <T x={320} y={90} s={13} f={C.crema} o={draw}>knee: 64-byte line, 8 keys</T>}
    </Svg>
  );
}

// 7 · A prefetcher can hide the knee.
export function PrefetcherCaveat({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="An adjacent-line prefetcher pulls in the neighbouring line too, which can make a sixty four byte line look one hundred twenty eight bytes wide" h={300}>
      <rect x={60} y={80} width={60} height={40} rx={6} fill={C.caramel} opacity={a} />
      <T x={90} y={104} s={12} f={C.espresso} a="middle" w={600} o={a}>64 B</T>
      <rect x={125} y={80} width={60} height={40} rx={6} fill={C.cherry} opacity={b} />
      <T x={155} y={104} s={12} f={C.cherryText} a="middle" w={600} o={b}>fetched too</T>
      <T x={300} y={160} s={16} f={C.crema} a="middle" o={b}>looks like 128 bytes, measured naively</T>
    </Svg>
  );
}

// 8 · A second miss, hiding underneath.
export function TlbReach({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="TLB reach is the entry count times the page size; a four kibibyte page and a larger huge page trade granularity for reach" h={300}>
      <T x={25} y={40} s={14} f={C.latte} o={a}>entries × page size = reach</T>
      <rect x={25} y={54} width={150} height={30} rx={7} fill={C.caramel} opacity={a} />
      <T x={185} y={74} s={13} f={C.crema} o={a}>4 KiB pages</T>
      <rect x={25} y={120} width={420} height={30} rx={7} fill={C.cinnamon} opacity={b} />
      <T x={25} y={176} s={13} f={C.crema} o={b}>huge pages: same entries, far more reach</T>
    </Svg>
  );
}

// 9 · Sequential vs random tells the prefetcher apart.
export function SequentialVsRandom({ t }: StepCtx) {
  const seq = easeOut(seg(t, 0.3, 2.0));
  const rand = easeOut(seg(t, 0.3, 2.0));
  return (
    <Svg label="A sequential walk stays flat because the prefetcher predicts it; the same footprint walked at random climbs the full staircase" h={300}>
      <path d="M40 200 H560" stroke={C.caramel} strokeWidth={3} fill="none" opacity={seq} />
      <T x={575} y={196} s={12} f={C.caramel} a="end" o={seq}>sequential</T>
      <path d="M40 220 H140 V180 H260 V130 H380 V60 H560" stroke={C.cherry} strokeWidth={3} fill="none" opacity={rand} />
      <T x={575} y={56} s={12} f={C.cherryText} a="end" o={rand}>random</T>
      <T x={300} y={270} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>the gap between them is the prefetcher, measured</T>
    </Svg>
  );
}

// 10 · Predict: why would the clock still spike?
export function ClockSpikePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const N = 20;
  const spikeAt = N - 1;
  return (
    <Svg label="A flat count of copies per append, but one resize near the end can still spike the clock if its copy spills into slow memory" h={300}>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOut(seg(t, i * 0.08, i * 0.08 + 0.4));
        const h = i === spikeAt && answered ? 120 : 20;
        const color = i === spikeAt && answered ? C.cherry : C.caramel;
        return <rect key={i} x={25 + i * 27} y={220 - h} width={20} height={h} rx={4} fill={color} opacity={clamp(a)} />;
      })}
      {!answered && <T x={300} y={270} s={16} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={270} s={14} f={C.cherryText} a="middle">one resize, copying into cold memory</T>}
    </Svg>
  );
}

// 11 · Back to the vector: count and clock agree.
export function Verdict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.1, 1.9));
  return (
    <Svg label="The amortized proof bounds the count of copies; the staircase prices what each copy actually costs in time" h={280}>
      <T x={25} y={70} s={16} f={C.caramel} w={600} o={a}>the proof: count the copies</T>
      <T x={25} y={130} s={16} f={C.cinnamon} w={600} o={b}>the staircase: price the time</T>
      <T x={25} y={190} s={14} f={C.taupe} o={easeOut(seg(t, 2.0, 2.8))}>the shape transfers; the exact numbers are this machine's</T>
    </Svg>
  );
}
