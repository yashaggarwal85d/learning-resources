import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's estimate sheet for the first time (CHAPTER.md, topic 2): rows of `quantity × unit = result` that
// fill in one per beat, each result counted up, the storage row lit; Little's law as a pipe with an in-flight
// counter rising to λ × W; the in-flight count poured into consumers of fifty; three dated reference numbers, each
// stamped with what it is not. Every figure on screen is examples.py's: capacity_chain(), little_s_law_sizing() and
// REFERENCE_NUMBERS (two million orders a day, ten events an order, a peak of five, five hundred bytes an event,
// ninety days, three replicas, 1.3 compaction overhead → 1,157 events a second at peak, 10 GB a day, 3.51 TB;
// two seconds of processing → 2,315 in flight → 47 consumers).

type Pt = readonly [number, number];

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

/** Thousands separators, the way an estimate sheet is read. */
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** One row of the estimate sheet: an operator column, the quantity, and a result counted up from zero. */
function SheetRow({
  y,
  op,
  label,
  result,
  t,
  at,
  lit = false,
  dim = false,
}: {
  y: number;
  op: string;
  label: string;
  result: (k: number) => string;
  t: number;
  at: number;
  lit?: boolean;
  dim?: boolean;
}) {
  const k = easeOut(seg(t, at, at + 0.35));
  if (k <= 0) return null;
  const count = easeInOut(seg(t, at + 0.15, at + 0.75));
  const f = dim ? C.quiet : lit ? C.focus : C.primary;
  return (
    <g opacity={k} transform={`translate(${(1 - k) * -14} 0)`}>
      <T x={30} y={y} s={15} f={dim ? C.quiet : C.secondary} w={600}>
        {op}
      </T>
      <T x={58} y={y} s={14} f={f}>
        {label}
      </T>
      <T x={575} y={y} s={15} f={f} a="end" w={lit ? 700 : 500}>
        {result(count)}
      </T>
    </g>
  );
}

/** A small laptop: a screen and a base. */
const Laptop = ({ x, y, k }: { x: number; y: number; k: number }) => (
  <g opacity={k} fill="none" stroke={C.primary} strokeWidth={1.6}>
    <rect x={x - 34} y={y - 44} width={68} height={42} rx={3} />
    <path d={`M${x - 44} ${y} L${x + 44} ${y} L${x + 38} ${y + 8} L${x - 38} ${y + 8} Z`} />
  </g>
);

/** A rack whose servers slide in one by one. */
const Rack = ({ x, y, t, at }: { x: number; y: number; t: number; at: number }) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const k = easeOutBack(seg(t, at + i * 0.18, at + i * 0.18 + 0.35));
      if (k <= 0) return null;
      return (
        <g key={i} opacity={Math.min(1, k)} transform={`translate(${(1 - k) * 30} 0)`}>
          <rect x={x - 40} y={y - 14 - i * 14} width={80} height={11} rx={2} fill={C.band} stroke={C.primary} strokeWidth={1.2} />
          <circle cx={x + 30} cy={y - 8.5 - i * 14} r={1.8} fill={C.focus} />
        </g>
      );
    })}
  </g>
);

// 1 · The ask on top, splitting into two machines: a laptop for the mean-orders reading, a rack whose servers
// slide in as clicks, peak and replication are counted.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the shop is told about two million orders a day, with some clicks — one engineer says a laptop could do it, another says the opposite" h={260}>
      <T x={300} y={40} s={17} f={C.primary} a="middle" serif italic o={easeOut(seg(t, 0, 0.5))}>
        "about two million orders a day, with some clicks"
      </T>
      <Draw pts={[[250, 54], [150, 96]]} t={t} from={0.5} to={0.9} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[350, 54], [450, 96]]} t={t} from={0.6} to={1.0} stroke={C.line} w={1.4} pen={false} />
      <Laptop x={150} y={168} k={easeOut(seg(t, 0.9, 1.3))} />
      <T x={150} y={150} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        {fmt(23 * easeInOut(seg(t, 1.3, 2.0)))}/s
      </T>
      <Rack x={450} y={180} t={t} at={1.1} />
      <T x={150} y={204} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        a laptop could do it
      </T>
      <T x={150} y={226} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        mean orders a second
      </T>
      <T x={450} y={204} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.1, 2.5))}>
        we need a cluster
      </T>
      <T x={450} y={226} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.3, 2.7))}>
        clicks, peak, replication
      </T>
      <T x={300} y={140} s={15} f={C.quiet} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        same sentence
      </T>
    </Svg>
  );
}

// 2 · The laptop's sheet: the division is ticked, three multiplier slots sit empty. After the pick, ×10 clicks,
// ×5 peak and ×3 replicas drop into the slots and the rate bar stretches from 23 orders to 1,157 events a second.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const SLOTS: [string, string][] = [
    ['×10', 'clicks'],
    ['×5', 'peak'],
    ['×3', 'replicas'],
  ];
  const grow = on ? easeInOut(seg(s, 1.3, 2.3)) : 0;
  // the bar is drawn on a log scale so 23 → 1,157 (and ×3 on bytes) reads as more than an order of magnitude
  const logW = (v: number) => (Math.log10(v) / Math.log10(4000)) * 480;
  return (
    <Svg label="which single multiplication did 'a laptop could do it' leave out that changes the answer by more than an order of magnitude?" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={40} y={40} s={14} f={C.primary}>
          2,000,000 orders ÷ 86,400 s
        </T>
        <Draw pts={[[300, 34], [306, 41], [318, 27]]} t={t} from={0.4} to={0.7} stroke={C.focus} w={2.2} pen={false} />
        <T x={575} y={40} s={13} f={C.quiet} a="end">
          got this part right
        </T>
      </g>
      {SLOTS.map(([mult, name], i) => {
        const x = 120 + i * 180;
        const drop = on ? easeOutBack(seg(s, 0.2 + i * 0.3, 0.6 + i * 0.3)) : 0;
        return (
          <g key={name} opacity={easeOut(seg(t, 0.3 + i * 0.15, 0.7 + i * 0.15))}>
            <rect x={x - 50} y={70} width={100} height={40} rx={4} fill="none" stroke={drop > 0.5 ? C.focus : C.line} strokeDasharray={drop > 0.5 ? undefined : '4 4'} />
            {!on && (
              <T x={x} y={96} s={16} f={C.quiet} a="middle">
                ?
              </T>
            )}
            {drop > 0 && (
              <g transform={`translate(0 ${(1 - drop) * -40})`} opacity={Math.min(1, drop)}>
                <T x={x} y={96} s={16} f={C.focus} a="middle" w={700}>
                  {mult}
                </T>
              </g>
            )}
            <T x={x} y={130} s={13} f={drop > 0.5 ? C.primary : C.quiet} a="middle">
              {name}
            </T>
          </g>
        );
      })}
      {!on && (
        <T x={300} y={196} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.5))}>
          never multiplied in?
        </T>
      )}
      {on && (
        <g opacity={easeOut(seg(s, 1.1, 1.4))}>
          <rect x={60} y={166} width={logW(23)} height={14} fill={C.secondary} />
          <T x={60} y={200} s={13} f={C.secondary}>
            23 orders/s
          </T>
          <rect x={60} y={166} width={lerp(logW(23), logW(1157), grow)} height={14} fill="none" stroke={C.focus} strokeWidth={1.6} />
          <T x={60 + lerp(logW(23), logW(1157), grow)} y={200} s={13} f={C.focus} a="end" o={easeOut(seg(s, 2.0, 2.4))}>
            {fmt(1157 * grow)} events/s
          </T>
          <T x={300} y={236} s={14} f={C.focus} a="middle" o={easeOut(seg(s, 2.4, 2.8))}>
            fifty times the laptop's number
          </T>
        </g>
      )}
    </Svg>
  );
}

// 3 · The estimate sheet itself, one row per beat, each result counted up; the storage row lit.
export function RevealChain({ t }: StepCtx) {
  const at = (i: number) => 0.2 + i * 0.6;
  return (
    <Svg label="orders a day, times events per order, over seconds a day, times the peak ratio, times bytes an event, times retention and replication — the estimate sheet, one row per beat" h={340}>
      <T x={30} y={28} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        estimate sheet
      </T>
      <line x1={30} y1={40} x2={575} y2={40} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <SheetRow y={74} op="" label="orders a day" result={(k) => fmt(2_000_000 * k)} t={t} at={at(0)} />
      <SheetRow y={118} op="×" label="10 events an order" result={(k) => `${fmt(20_000_000 * k)}/day`} t={t} at={at(1)} />
      <SheetRow y={162} op="÷" label="86,400 s a day" result={(k) => `${fmt(231 * k)}/s mean`} t={t} at={at(2)} />
      <SheetRow y={206} op="×" label="5 peak ratio" result={(k) => `${fmt(1157 * k)}/s design`} t={t} at={at(3)} />
      <SheetRow y={250} op="×" label="500 bytes an event" result={(k) => `${fmt(10 * k)} GB/day`} t={t} at={at(4)} />
      <SheetRow y={294} op="×" label="90 d × 3 × 1.3" result={(k) => `${(3.51 * k).toFixed(2)} TB`} t={t} at={at(5)} lit />
      <T x={575} y={326} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 3.9, 4.3))}>
        storage to buy
      </T>
      <Reticle x={520} y={289} w={110} h={30} t={t} at={3.8} />
    </Svg>
  );
}

/** A day's traffic: a quiet night, a busy afternoon peak at five times the mean. */
const dayCurve = (u: number) => {
  const base = 0.12 + 0.08 * Math.sin((u - 0.3) * Math.PI * 2);
  const spike = Math.exp(-Math.pow((u - 0.62) / 0.05, 2)) * 0.8;
  return Math.max(0.03, base + spike);
};

// 4 · The same day of traffic against two capacity lines: sized for the mean, the afternoon spills over in red;
// sized for the peak, the curve stays under.
export function RevealPeakRatio({ t }: StepCtx) {
  const X0 = 40, X1 = 560, Y0 = 210, H = 160;
  const pts: Pt[] = Array.from({ length: 61 }, (_, i) => {
    const u = i / 60;
    return [lerp(X0, X1, u), Y0 - dayCurve(u) * H] as const;
  });
  const meanY = Y0 - 0.2 * H; // mean is a fifth of the peak
  const peakY = Y0 - 1.0 * H;
  const over = pts.filter(([, y]) => y < meanY - 0.5);
  const spill = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="the same chain run at the mean rate and at the design rate — what does the five-times difference actually change?" h={296}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={pts} t={t} from={0.1} to={1.3} stroke={C.primary} w={1.8} pen={false} />
      <T x={X0} y={Y0 + 20} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        one day
      </T>
      {/* sized for the mean */}
      <Draw pts={[[X0, meanY], [X1, meanY]]} t={t} from={1.2} to={1.6} stroke={C.secondary} w={1.4} pen={false} dash="5 4" />
      {spill > 0 && over.length > 1 && (
        <path
          d={`M${over[0][0]} ${meanY} ${over.map(([x, y]) => `L${x} ${y}`).join(' ')} L${over[over.length - 1][0]} ${meanY} Z`}
          fill={C.bad}
          opacity={0.75 * spill}
        />
      )}
      <T x={X0} y={meanY - 8} s={13} f={C.secondary} o={easeOut(seg(t, 1.4, 1.7))}>
        sized for the mean: 231/s
      </T>
      <T x={X0} y={258} s={14} f={C.badText} o={easeOut(seg(t, 2.0, 2.4))}>
        sized for the mean: falls over some afternoon
      </T>
      {/* sized for the peak */}
      <Draw pts={[[X0, peakY - 6], [X1, peakY - 6]]} t={t} from={2.6} to={3.0} stroke={C.focus} w={1.6} pen={false} />
      <T x={X0} y={peakY - 14} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        sized for the peak: 1,157/s
      </T>
      <T x={X0} y={284} s={14} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        sized for the peak: what you actually provision
      </T>
    </Svg>
  );
}

// 5 · Little's law as a pipe: events enter at λ, each stays W = 2 s, and the counter of how many are inside rises
// to λ × W and holds.
export function RevealLittlesLaw({ t }: StepCtx) {
  const PX0 = 120, PX1 = 480, PY = 90;
  const fill = easeInOut(seg(t, 0.6, 2.4));
  const N = 24; // dots drawn in the pipe stand for the in-flight events
  const flow = t * 0.45;
  return (
    <Svg label="the design rate, times a processing time per event, equals how many events are in flight at any instant" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={PX0} y={PY - 26} width={PX1 - PX0} height={52} rx={26} fill="none" stroke={C.primary} strokeWidth={1.6} />
        <T x={60} y={PY + 5} s={14} f={C.secondary} a="middle">
          λ in
        </T>
        <T x={540} y={PY + 5} s={14} f={C.secondary} a="middle">
          out
        </T>
      </g>
      {Array.from({ length: N }, (_, i) => {
        const u = (((i / N + flow) % 1) + 1) % 1;
        if (u > fill) return null;
        const x = lerp(PX0 + 18, PX1 - 18, u);
        const y = PY + ((i * 37) % 3 - 1) * 12;
        return <circle key={i} cx={x} cy={y} r={4} fill={C.focus} />;
      })}
      <T x={300} y={PY + 48} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        each event stays W = 2 s
      </T>
      <T x={300} y={180} s={20} f={C.focus} a="middle" w={700} o={easeOut(seg(t, 0.8, 1.1))}>
        {fmt(2315 * fill)} in flight
      </T>
      <T x={300} y={214} s={16} f={C.primary} a="middle" serif italic o={easeOut(seg(t, 2.4, 2.8))}>
        L = λW: 1,157/s × 2 s = 2,315
      </T>
      <T x={300} y={240} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        buffers, connections, consumer slots
      </T>
    </Svg>
  );
}

// 6 · The in-flight count poured into consumers that hold fifty each: forty-six fill, the forty-seventh takes the
// last fifteen, so the ceiling is forty-seven, not a safe round number.
export function RevealConsumerSizing({ t }: StepCtx) {
  const COLS = 12;
  const pour = easeInOut(seg(t, 0.6, 3.0)) * 2315;
  return (
    <Svg label="the in-flight count, divided by what one consumer can hold, gives the real number to provision" h={280}>
      <T x={300} y={30} s={16} f={C.primary} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        2,315 in flight ÷ 50 a consumer
      </T>
      {Array.from({ length: 47 }, (_, i) => {
        const x = 63 + (i % COLS) * 41;
        const y = 56 + Math.floor(i / COLS) * 46;
        const held = Math.max(0, Math.min(50, pour - i * 50));
        const show = easeOut(seg(t, 0.2 + i * 0.012, 0.5 + i * 0.012));
        return (
          <g key={i} opacity={show}>
            <rect x={x} y={y} width={30} height={36} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
            <rect x={x} y={y + 36 - (36 * held) / 50} width={30} height={(36 * held) / 50} rx={2} fill={i === 46 ? C.secondary : C.primary} opacity={0.85} />
          </g>
        );
      })}
      <T x={300} y={260} s={16} f={C.focus} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.4))}>
        47 consumers to provision
      </T>
      <Reticle x={488} y={212} w={44} h={48} t={t} at={3.1} />
    </Svg>
  );
}

/** A reference-number card with its date and a stamp saying what it is not. */
function RefCard({ y, name, value, when, isNot, t, at }: { y: number; name: string; value: string; when: string; isNot: string; t: number; at: number }) {
  const k = easeOut(seg(t, at, at + 0.4));
  if (k <= 0) return null;
  const stamp = easeOutBack(seg(t, at + 0.5, at + 0.85));
  return (
    <g opacity={k} transform={`translate(0 ${(1 - k) * 12})`}>
      <rect x={25} y={y} width={550} height={74} rx={4} fill={C.panel} stroke={C.line} />
      <T x={40} y={y + 24} s={14} f={C.focus} w={600}>
        {name}
      </T>
      <T x={560} y={y + 24} s={13} f={C.quiet} a="end">
        {when}
      </T>
      <T x={40} y={y + 46} s={14} f={C.primary}>
        {value}
      </T>
      {stamp > 0 && (
        <g opacity={Math.min(1, stamp)}>
          <T x={40} y={y + 66} s={13} f={C.secondary}>
            not: {isNot}
          </T>
        </g>
      )}
    </g>
  );
}

// 7 · Three dated cards, each stamped with what it is not.
export function RevealReferenceNumbers({ t }: StepCtx) {
  return (
    <Svg label="three dated reference numbers, each tagged with what it is not" h={290}>
      <RefCard y={10} name="Kafka benchmark" when="April 2014" value="~800,000 records/s, no replication" isNot="a plan for your hardware" t={t} at={0.1} />
      <RefCard y={104} name="S3's prefix floor" when="current docs" value="3,500 writes · 5,500 reads /s a prefix" isNot="a ceiling; more prefixes scale" t={t} at={1.1} />
      <RefCard y={198} name="scan rate, here" when="measured" value="SUM over DuckDB rows, this sandbox" isNot="any real warehouse's speed" t={t} at={2.1} />
    </Svg>
  );
}

// 8 · One rate axis on a log scale: the benchmark near the top, our design rate far below. The wrong claim draws an
// arrow from our cluster up to the benchmark and is struck; the right claim shows one partition's headroom.
export function RevealRightUse({ t }: StepCtx) {
  const Y0 = 220, Y1 = 40;
  const yOf = (v: number) => lerp(Y0, Y1, Math.log10(v) / Math.log10(1_000_000));
  const strike = easeOut(seg(t, 1.6, 1.9));
  const head = easeInOut(seg(t, 2.4, 3.2));
  const mid = lerp(yOf(1157), yOf(800_000), 0.5);
  return (
    <Svg label="two uses of the same benchmark number side by side — one wrong, one the actual bounded claim it supports" h={300}>
      <line x1={60} y1={Y0} x2={60} y2={Y1} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={60} y={Y0 + 20} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        rate, log
      </T>
      <g opacity={easeOut(seg(t, 0.1, 0.5))}>
        <line x1={50} y1={yOf(800_000)} x2={70} y2={yOf(800_000)} stroke={C.focus} strokeWidth={2} />
        <T x={78} y={yOf(800_000) + 5} s={13} f={C.primary}>
          benchmark ~800,000/s
        </T>
        <line x1={50} y1={yOf(1157)} x2={70} y2={yOf(1157)} stroke={C.focus} strokeWidth={2} />
        <T x={78} y={yOf(1157) + 5} s={13} f={C.primary}>
          our design rate 1,157/s
        </T>
        <line x1={70} y1={yOf(800_000)} x2={560} y2={yOf(800_000)} stroke={C.line} strokeDasharray="3 5" />
        <line x1={300} y1={yOf(1157)} x2={560} y2={yOf(1157)} stroke={C.line} strokeDasharray="3 5" />
      </g>
      {/* wrong use: a new cluster claims the benchmark's rate */}
      <Draw pts={[[420, yOf(1157)], [420, yOf(800_000) + 4]]} t={t} from={0.6} to={1.3} stroke={C.secondary} w={1.6} pen={false} dash="4 4" />
      {strike > 0 && <line x1={402} y1={mid - 16} x2={438} y2={mid + 16} stroke={C.badText} strokeWidth={2.4} opacity={strike} />}
      {/* right use: one partition's headroom over our own rate */}
      <rect x={500} y={lerp(yOf(1157), yOf(800_000), head)} width={22} height={yOf(1157) - lerp(yOf(1157), yOf(800_000), head)} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 2.3, 2.5))} />
      <rect x={500} y={yOf(1157)} width={22} height={Y0 - yOf(1157)} fill={C.focus} opacity={easeOut(seg(t, 2.2, 2.5))} />
      <T x={420} y={Y0 + 20} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        A
      </T>
      <T x={511} y={Y0 + 20} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        B
      </T>
      <g opacity={easeOut(seg(t, 0.8, 1.1))}>
        <T x={40} y={262} s={14} f={C.primary}>
          A · cluster will hit that rate
        </T>
      </g>
      <T x={575} y={262} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.8, 2.1))}>
        wrong claim
      </T>
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <T x={40} y={288} s={14} f={C.primary}>
          B · one partition won't bottleneck
        </T>
      </g>
      <T x={575} y={288} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.5))}>
        right claim
      </T>
    </Svg>
  );
}

// 9 · Four small panels drawn back in: the sheet, the peak curve, the pipe, the tagged cards.
export function Recap({ t }: StepCtx) {
  const P = [
    { x: 30, y: 20, label: 'orders to storage', sub: 'one row per beat' },
    { x: 310, y: 20, label: 'peak ratio', sub: 'what you provision' },
    { x: 30, y: 150, label: "Little's Law", sub: 'sizes consumers, pools' },
    { x: 310, y: 150, label: 'reference numbers', sub: 'each with its ceiling' },
  ];
  return (
    <Svg label="the full chain from orders to storage, the peak ratio's effect, Little's Law sizing consumers, and three reference numbers each with its own ceiling" h={280}>
      {P.map((p, i) => {
        const at = 0.2 + i * 0.7;
        const k = easeOut(seg(t, at, at + 0.4));
        return (
          <g key={p.label} opacity={k}>
            <rect x={p.x} y={p.y} width={260} height={110} rx={4} fill={C.panel} stroke={i === 2 ? C.focus : C.line} />
            <T x={p.x + 14} y={p.y + 82} s={14} f={i === 2 ? C.focus : C.primary} w={600}>
              {p.label}
            </T>
            <T x={p.x + 14} y={p.y + 100} s={13} f={C.secondary}>
              {p.sub}
            </T>
          </g>
        );
      })}
      {/* sheet */}
      {[0, 1, 2, 3].map((r) => (
        <Draw key={r} pts={[[50, 38 + r * 10], [lerp(120, 250, (r * 0.37) % 1), 38 + r * 10]]} t={t} from={0.4 + r * 0.1} to={0.7 + r * 0.1} stroke={r === 3 ? C.focus : C.secondary} w={2} pen={false} />
      ))}
      {/* peak curve */}
      <Draw
        pts={Array.from({ length: 31 }, (_, i) => [lerp(326, 554, i / 30), 74 - dayCurve(i / 30) * 40] as const)}
        t={t}
        from={1.0}
        to={1.6}
        stroke={C.primary}
        w={1.5}
        pen={false}
      />
      <Draw pts={[[326, 32], [554, 32]]} t={t} from={1.5} to={1.8} stroke={C.focus} w={1.4} pen={false} />
      {/* pipe */}
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        <rect x={60} y={36} width={200} height={26} rx={13} transform="translate(0 130)" fill="none" stroke={C.primary} strokeWidth={1.4} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={74 + ((i * 34 + t * 30) % 172)} cy={179} r={3.5} fill={C.focus} />
        ))}
      </g>
      {/* tagged cards */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 2.3 + i * 0.15, 2.6 + i * 0.15))}>
          <rect x={330 + i * 76} y={166} width={66} height={36} rx={3} fill="none" stroke={C.line} />
          <line x1={338 + i * 76} y1={178} x2={384 + i * 76} y2={178} stroke={C.primary} strokeWidth={2} />
          <line x1={338 + i * 76} y1={190} x2={368 + i * 76} y2={190} stroke={C.secondary} strokeWidth={2} />
        </g>
      ))}
    </Svg>
  );
}

// 10 · The chain once more, with three approval calls arriving as a chip. After the pick, the chip slides into the
// events-per-order slot (ten becomes thirteen) and every row below it lights ×1.3: the same arithmetic.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const slide = on ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const ROWS = ['orders a day', 'events an order', 'mean rate', 'design rate', 'bytes a day', 'storage'];
  return (
    <Svg label="a second business: same order volume, but every order needs three approval-service calls before it ships — what moves in the chain?" h={290}>
      {ROWS.map((r, i) => {
        const y = 40 + i * 34;
        const lit = on && i >= 1 && easeOut(seg(s, 1.0 + i * 0.2, 1.3 + i * 0.2)) > 0;
        return (
          <g key={r} opacity={easeOut(seg(t, i * 0.12, i * 0.12 + 0.3))}>
            <T x={40} y={y} s={14} f={lit ? C.focus : C.primary}>
              {r}
            </T>
            {i === 1 && (
              <T x={280} y={y} s={14} f={slide > 0.9 ? C.focus : C.primary} a="end" w={700}>
                {slide > 0.9 ? '13' : '10'}
              </T>
            )}
            {lit && i >= 2 && (
              <T x={280} y={y} s={13} f={C.focus} a="end" o={easeOut(seg(s, 1.0 + i * 0.2, 1.3 + i * 0.2))}>
                ×1.3
              </T>
            )}
          </g>
        );
      })}
      {slide < 0.9 && <g transform={`translate(${lerp(0, -100, slide)} ${lerp(0, -10, slide)})`} opacity={easeOut(seg(t, 0.6, 1.0))}>
        <rect x={400} y={56} width={160} height={30} rx={15} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <T x={480} y={76} s={13} f={C.focus} a="middle">
          +3 approvals
        </T>
      </g>}
      {!on && (
        <T x={480} y={130} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          new arithmetic?
        </T>
      )}
      {on && (
        <>
          <T x={455} y={130} s={14} f={C.primary} a="middle" o={easeOut(seg(s, 1.0, 1.3))}>
            three approvals an order
          </T>
          <T x={455} y={150} s={13} f={C.secondary} a="middle" o={easeOut(seg(s, 1.1, 1.4))}>
            a new multiplier
          </T>
          <T x={300} y={252} s={15} f={C.focus} a="middle" o={easeOut(seg(s, 2.4, 2.8))}>
            same chain: no new kind of arithmetic
          </T>
          <T x={300} y={276} s={13} f={C.secondary} a="middle" o={easeOut(seg(s, 2.7, 3.0))}>
            dominant mover: still the multiplication
          </T>
        </>
      )}
    </Svg>
  );
}
