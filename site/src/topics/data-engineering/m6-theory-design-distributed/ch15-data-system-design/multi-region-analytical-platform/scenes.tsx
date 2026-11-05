import { useEffect, useState } from 'react';
import { C, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 18: two regions and a border line; dataset chips tagged by classification, EU personal data stopped
// at a closed gate and a de-identified aggregate crossing freely; replicate (a thick recurring egress arrow) against
// federate (thin per-query arrows), egress totals counted; a failure strip killing one region and showing what
// survives (the bucket) and what does not (the catalog, the keys), the missing ones red. examples.py's numbers: egress
// $0.09 a GB; events 400 GB a day ($36 a day to replicate, $9 to federate 20 queries of 5 GB); the aggregate 2 GB a
// day ($0.18 to replicate, $22.50 to federate 500 queries of 0.5 GB); EU fresh at 09:00, US at 08:40, global at 08:40.

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

/** A plain box with a centred label. */
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A red box for a missing or failed piece. */
const BadBox = ({ x, y, w, h = 32, label, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; o?: number }) => <Box x={x} y={y} w={w} h={h} label={label} o={o} fill={C.bad} stroke={C.badText} f={C.focus} />;

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

/** The two regions and the dashed border between them. */
function Border({ o, y0 = 34, y1 = 180 }: { o: number; y0?: number; y1?: number }) {
  return (
    <g opacity={o}>
      <T x={150} y={22} s={13} f={C.secondary} a="middle">
        US
      </T>
      <T x={450} y={22} s={13} f={C.secondary} a="middle">
        EU
      </T>
      <line x1={300} y1={y0} x2={300} y2={y1} stroke={C.secondary} strokeDasharray="5 4" />
    </g>
  );
}

// 1 · Two lakes either side of the border sync over the weekend, chips streaming across both ways; afterwards some of
// the chips sitting on the US side light red: EU personal data. Then the EU catalog fails and the copies go blank.
export function Hook({ t }: StepCtx) {
  const sync = seg(t, 0.4, 2.0);
  const red = easeOut(seg(t, 2.0, 2.4));
  const cat = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="a weekend replication crosses a border nobody checked" h={270}>
      <Border o={easeOut(seg(t, 0, 0.3))} />
      <rect x={40} y={44} width={200} height={70} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={360} y={44} width={200} height={70} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 10 }, (_, i) => {
        const x = 52 + (i % 5) * 36;
        const y = 56 + Math.floor(i / 5) * 26;
        const k = easeOut(seg(sync, i / 12, i / 12 + 0.2));
        const personal = i === 2 || i === 6 || i === 8;
        return <rect key={i} x={x} y={y} width={28} height={18} rx={2} fill={personal && red > 0.5 ? C.bad : C.primary} stroke={personal && red > 0.5 ? C.badText : 'none'} opacity={k} />;
      })}
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={372 + (i % 5) * 36} y={56 + Math.floor(i / 5) * 26} width={28} height={18} rx={2} fill={C.primary} opacity={easeOut(seg(t, 0.1, 0.4))} />
      ))}
      {sync > 0 &&
        sync < 1 &&
        [0, 1, 2, 3].map((i) => {
          const p = ((sync * 3 + i / 4) % 1);
          const dir = i % 2 === 0;
          return <rect key={i} x={dir ? lerp(360, 224, p) : lerp(240, 376, p)} y={dir ? 70 : 92} width={16} height={10} rx={2} fill={C.focus} />;
        })}
      <T x={30} y={140} s={13} f={C.badText} o={red}>
        which EU customers are here?
      </T>
      {cat < 0.5 ? <Box x={360} y={126} w={200} h={28} label="catalog" o={easeOut(seg(t, 0.2, 0.5))} /> : <BadBox x={360} y={126} w={200} h={28} label="catalog failed" />}
      <T x={460} y={176} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 3.2, 3.5))}>
        buckets, no table metadata
      </T>
      <Line2 y={220} l="Monday" r="EU data in the US?" rc={C.badText} o={easeOut(seg(t, 2.3, 2.7))} />
      <Line2 y={248} l="catalog lost" r="copies unreadable" rc={C.badText} o={easeOut(seg(t, 3.5, 3.9))} />
    </Svg>
  );
}

const PROBS = ['EU rows in the US', 'no table metadata'];
const FIXES = ['residency per dataset', 'catalog backup in failover'];

// 2 · Two red problems on the left, two dashed slots on the right. After the pick each slot fills with its decision, a
// line runs across, and the problem turns white with a check.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="which two decisions would have prevented both?" h={210}>
      {PROBS.map((p, i) => {
        const k = on ? easeOut(seg(s, 0.3 + i * 0.6, 0.7 + i * 0.6)) : 0;
        const y = 30 + i * 70;
        return (
          <g key={p}>
            <Box x={30} y={y} w={230} label={p} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} stroke={k > 0.5 ? C.focus : C.badText} f={k > 0.5 ? C.focus : C.badText} />
            {k < 1 && <Box x={320} y={y} w={250} label="?" dash="4 3" o={easeOut(seg(t, 0.6, 0.9)) * (1 - k)} />}
            {k > 0 && <Box x={320} y={y} w={250} label={FIXES[i]} lit o={k} />}
            {k > 0 && <line x1={320} y1={y + 16} x2={lerp(320, 260, k)} y2={y + 16} stroke={C.focus} strokeWidth={1.4} />}
          </g>
        );
      })}
      <T x={300} y={192} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        both made at design time
      </T>
    </Svg>
  );
}

// 3 · Three tagged chips on the EU side. The personal-data chip runs at the border and the gate slams shut; the
// aggregate chip slides straight through; the reference chip appears on both sides at once.
export function RevealPlacement({ t }: StepCtx) {
  const pRun = easeInOut(seg(t, 0.6, 1.2));
  const gate = easeOutBack(seg(t, 1.0, 1.3));
  const aRun = easeInOut(seg(t, 1.8, 2.8));
  const ref = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="personal data stops at the gate; an aggregate crosses freely" h={240}>
      <Border o={easeOut(seg(t, 0, 0.3))} y1={190} />
      <Box x={lerp(400, 320, pRun)} y={44} w={160} h={28} label="EU personal" lit o={easeOut(seg(t, 0.2, 0.5))} />
      {gate > 0 && (
        <g opacity={Math.min(1, gate)}>
          <rect x={294} y={36} width={12} height={44} fill={C.focus} />
          <T x={280} y={64} s={13} f={C.focus} a="end">
            closed
          </T>
        </g>
      )}
      <Box x={lerp(400, 60, aRun)} y={100} w={160} h={28} label="aggregate" o={easeOut(seg(t, 0.4, 0.7))} stroke={C.second} f={C.second} />
      <Box x={400} y={156} w={160} h={28} label="reference" o={easeOut(seg(t, 0.5, 0.8))} />
      {ref > 0 && <Box x={60} y={156} w={160} h={28} label="reference" o={ref} />}
      <T x={300} y={222} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        placed by tag, at design time
      </T>
    </Svg>
  );
}

const PRICE: { name: string; vol: string; rep: number; fed: number }[] = [
  { name: 'events', vol: '400 GB a day', rep: 36, fed: 9 },
  { name: 'aggregate', vol: '2 GB a day', rep: 0.18, fed: 22.5 },
];
const money = (v: number) => `$${v.toFixed(2)}`;

// 4 · For the events table and the aggregate, a replicate bar and a federate bar grow, their daily dollar costs counting
// up. Events: federating is cheaper. The aggregate: replicating is. The cheaper bar of each lights with a check.
export function RevealPriced({ t }: StepCtx) {
  return (
    <Svg label="replicate's recurring egress against federate's per-query cost" h={210}>
      {PRICE.map((p, i) => {
        const y0 = 24 + i * 80;
        const g = easeOut(seg(t, 0.5 + i * 1.3, 1.5 + i * 1.3));
        const done = g > 0.98;
        const cheapRep = p.rep < p.fed;
        const W = (v: number) => Math.max(2, (v / 36) * 140);
        return (
          <g key={p.name} opacity={easeOut(seg(t, i * 1.3, 0.3 + i * 1.3))}>
            <T x={30} y={y0 + 14} s={14} f={C.primary}>
              {p.name}
            </T>
            <T x={30} y={y0 + 34} s={13} f={C.secondary}>
              {p.vol}
            </T>
            <T x={250} y={y0 + 14} s={13} f={C.secondary} a="end">
              replicate
            </T>
            <rect x={260} y={y0 + 3} width={W(p.rep) * g} height={14} fill={done && cheapRep ? C.focus : C.line} />
            <T x={268 + W(p.rep) * g} y={y0 + 15} s={13} f={done && cheapRep ? C.focus : C.secondary}>
              {money(p.rep * g)}
            </T>
            <T x={250} y={y0 + 38} s={13} f={C.secondary} a="end">
              federate
            </T>
            <rect x={260} y={y0 + 27} width={W(p.fed) * g} height={14} fill={done && !cheapRep ? C.focus : C.line} />
            <T x={268 + W(p.fed) * g} y={y0 + 39} s={13} f={done && !cheapRep ? C.focus : C.secondary}>
              {money(p.fed * g)}
            </T>
            <Tick x={565} y={cheapRep ? y0 + 9 : y0 + 33} k={done ? easeOut(seg(t, 1.5 + i * 1.3, 1.8 + i * 1.3)) : 0} />
          </g>
        );
      })}
      <T x={30} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 3.2, 3.6))}>
        a day, at $0.09 per GB of egress
      </T>
    </Svg>
  );
}

// 5 · The EU rows stay packed behind the closed gate. One aggregate chip after another rides a dashed SLA pipe across;
// each trip's lag bracket stays inside the paid bound.
export function RevealAggregateCompromise({ t }: StepCtx) {
  return (
    <Svg label="replicate the aggregate, never the rows, with a bounded paid lag" h={210}>
      <Border o={easeOut(seg(t, 0, 0.3))} y1={170} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={360 + (i % 4) * 50} y={52 + Math.floor(i / 4) * 18} width={42} height={12} rx={2} fill={C.primary} opacity={easeOut(seg(t, 0.1 + i * 0.02, 0.4 + i * 0.02))} />
      ))}
      <T x={460} y={44} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        rows stay
      </T>
      <rect x={294} y={36} width={12} height={80} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <g opacity={easeOut(seg(t, 0.8, 1.1))}>
        <rect x={150} y={134} width={300} height={22} rx={11} fill="none" stroke={C.focus} strokeDasharray="5 3" />
        <T x={300} y={174} s={13} f={C.focus} a="middle">
          paid, SLA-backed
        </T>
      </g>
      <Box x={30} y={128} w={110} h={34} label="aggregate" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <Box x={460} y={128} w={110} h={34} label="aggregate" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      {[0, 1, 2].map((i) => {
        const p = easeInOut(seg(t, 1.3 + i * 0.8, 2.0 + i * 0.8));
        return p > 0 && p < 1 ? <rect key={i} x={lerp(440, 146, p)} y={139} width={18} height={12} rx={2} fill={C.second} /> : null;
      })}
      <T x={30} y={202} s={13} f={C.secondary} o={easeOut(seg(t, 2.6, 3.0))}>
        lag bounded to minutes
      </T>
      <T x={575} y={202} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        $0.18 a day
      </T>
    </Svg>
  );
}

const PIECES = ['bucket', 'catalog', 'keys', 'checkpoints'];

// 6 · The EU region holds four pieces. It goes dark with a red ✕. Only the bucket appears on the US side; the other
// three arrive as red, missing slots.
export function RevealFailoverGaps({ t }: StepCtx) {
  const down = easeOut(seg(t, 0.9, 1.3));
  return (
    <Svg label="the bucket survives; the catalog, the keys and the state do not" h={240}>
      <Border o={easeOut(seg(t, 0, 0.3))} y1={200} />
      <rect x={330} y={34} width={240} height={166} rx={6} fill="none" stroke={down > 0.5 ? C.badText : C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <Cross x={555} y={46} k={down} />
      {PIECES.map((p, i) => {
        const y = 46 + i * 38;
        const at = 1.6 + i * 0.45;
        const k = easeOut(seg(t, at, at + 0.35));
        return (
          <g key={p}>
            <Box x={350} y={y} w={180} h={28} label={p} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1)) * (1 - 0.65 * down)} />
            {k > 0 && (i === 0 ? <Box x={60} y={y} w={180} h={28} label="bucket · replicated" lit o={k} /> : <BadBox x={60} y={y} w={180} h={28} label={`${p} · missing`} o={k} />)}
          </g>
        );
      })}
      <T x={300} y={226} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        bucket replication never touched the rest
      </T>
    </Svg>
  );
}

const CLASSES = ['orders', 'events', 'aggregates'];

// 7 · A small table, data classes down the side and RPO and RTO across the top; each cell is stamped "named" with a
// check, row by row, before a later "failover plan" box appears and builds on it.
export function RevealRpoRto({ t }: StepCtx) {
  return (
    <Svg label="each data class gets its own recovery point and recovery time" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={290} y={26} s={13} f={C.secondary} a="middle">
          RPO
        </T>
        <T x={440} y={26} s={13} f={C.secondary} a="middle">
          RTO
        </T>
      </g>
      {CLASSES.map((c, i) => {
        const y = 38 + i * 40;
        return (
          <g key={c}>
            <T x={30} y={y + 20} s={14} f={C.primary} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))}>
              {c}
            </T>
            {[0, 1].map((j) => {
              const at = 0.7 + i * 0.6 + j * 0.25;
              const k = easeOut(seg(t, at, at + 0.3));
              const x = 220 + j * 150;
              return (
                <g key={j}>
                  <rect x={x} y={y} width={140} height={30} rx={3} fill={C.panel} stroke={k > 0.5 ? C.focus : C.line} opacity={easeOut(seg(t, 0.3, 0.6))} />
                  {k > 0 && (
                    <T x={x + 60} y={y + 20} s={13} f={C.focus} a="middle" o={k}>
                      named
                    </T>
                  )}
                  <Tick x={x + 118} y={y + 14} k={k} />
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={30} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 2.9, 3.3))}>
        stated up front, part of the design
      </T>
    </Svg>
  );
}

// 8 · Two regional partials, EU fresh at 09:00 and US at 08:40, flow into one global box. The box's clock takes the
// older time, and the US link lights as the one it is waiting on.
export function RevealStalestRegion({ t }: StepCtx) {
  const merge = easeInOut(seg(t, 0.8, 1.6));
  const pin = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="the global figure's clock is pinned to the slowest region's clock" h={210}>
      <Box x={30} y={30} w={190} label="EU · 09:00" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={30} y={100} w={190} label="US · 08:40" lit={pin > 0.5} o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={220} y1={46} x2={lerp(220, 340, merge)} y2={lerp(46, 76, merge)} stroke={C.line} strokeWidth={1.5} />
      <line x1={220} y1={116} x2={lerp(220, 340, merge)} y2={lerp(116, 86, merge)} stroke={pin > 0.5 ? C.focus : C.line} strokeWidth={pin > 0.5 ? 2.4 : 1.5} />
      <g opacity={easeOut(seg(t, 1.4, 1.7))}>
        <rect x={340} y={56} width={230} height={50} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={455} y={78} s={13} f={C.primary} a="middle">
          global revenue
        </T>
        <T x={455} y={98} s={14} f={pin > 0.5 ? C.focus : C.secondary} a="middle">
          {pin > 0.5 ? 'as of 08:40' : 'as of ?'}
        </T>
      </g>
      <Line2 y={170} l="the slowest region" r="sets the clock" o={easeOut(seg(t, 2.4, 2.8))} />
      <Line2 y={196} l="the oldest time" r="never the average" o={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['placement', 'a gate by tag'],
    ['replicate or federate', 'priced'],
    ['failover', 'catalog and keys too', C.badText],
    ['RPO and RTO', 'per data class'],
    ['global number', 'as fresh as the slowest'],
  ];
  return (
    <Svg label="a placement gate, a priced decision, a failover plan, one honest number" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <line x1={69} y1={y - 20} x2={69} y2={y + 4} stroke={C.secondary} strokeDasharray="3 2" />
                <rect x={66} y={y - 16} width={6} height={18} fill={C.focus} />
                <rect x={80} y={y - 12} width={26} height={10} rx={2} fill={C.second} />
                <rect x={30} y={y - 12} width={30} height={10} rx={2} fill={C.primary} />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 16} width={70} height={7} fill={C.line} />
                <rect x={30} y={y - 6} width={20} height={7} fill={C.focus} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={30} y={y - 16} width={22} height={18} rx={2} fill={C.focus} />
                <rect x={58} y={y - 16} width={22} height={18} rx={2} fill={C.bad} stroke={C.badText} />
                <rect x={86} y={y - 16} width={22} height={18} rx={2} fill={C.bad} stroke={C.badText} />
              </g>
            )}
            {i === 3 && [0, 1, 2, 3].map((j) => <rect key={j} x={30 + (j % 2) * 40} y={y - 16 + Math.floor(j / 2) * 10} width={36} height={8} fill={C.focus} />)}
            {i === 4 && (
              <g>
                <rect x={30} y={y - 16} width={34} height={7} fill={C.primary} />
                <rect x={30} y={y - 6} width={22} height={7} fill={C.focus} />
                <line x1={52} y1={y - 3} x2={100} y2={y - 8} stroke={C.focus} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Three regions feed the global box: EU, US and a new region whose backfill bar is still filling. Before the pick a
// dashed "blend it in?" chip waits. After, the new region's link goes dashed and drops out, the box reads
// "EU and US, as of 08:40", and a plain note says the new region is excluded until its backfill finishes.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fill = 0.15 + 0.35 * easeInOut(seg(t, 0.4, 2.0));
  const cut = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const note = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="a third region backfills; what does the global number say meanwhile?" h={250}>
      <Box x={30} y={20} w={190} h={30} label="EU · 09:00" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={30} y={62} w={190} h={30} label="US · 08:40" o={easeOut(seg(t, 0.1, 0.4))} />
      <g opacity={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.5 * cut)}>
        <rect x={30} y={104} width={190} height={30} rx={4} fill={C.panel} stroke={C.second} strokeDasharray="4 3" />
        <rect x={34} y={128} width={Math.max(0, 182 * fill)} height={3} fill={C.second} />
        <T x={125} y={124} s={13} f={C.second} a="middle">
          new · backfilling
        </T>
      </g>
      <line x1={220} y1={35} x2={340} y2={66} stroke={C.line} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={220} y1={77} x2={340} y2={76} stroke={C.line} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={220} y1={119} x2={340} y2={86} stroke={C.second} strokeWidth={1.4} strokeDasharray={on ? '4 4' : undefined} opacity={easeOut(seg(t, 0.4, 0.7)) * (1 - 0.8 * cut)} />
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <rect x={340} y={50} width={230} height={50} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={455} y={72} s={13} f={C.primary} a="middle">
          global revenue
        </T>
        <T x={455} y={92} s={13} f={on ? C.focus : C.secondary} a="middle">
          {on && cut > 0.5 ? 'EU and US, as of 08:40' : 'all three?'}
        </T>
      </g>
      {note > 0 && (
        <T x={340} y={124} s={13} f={C.focus} o={note}>
          new region excluded, for now
        </T>
      )}
      <Box x={30} y={170} w={250} label="blend it in, unmarked?" dash="4 3" o={easeOut(seg(t, 0.8, 1.2)) * (1 - 0.6 * cut)} />
      <Box x={320} y={170} w={250} label="exclude it, say so" lit o={on ? easeOut(seg(s, 0.8, 1.2)) : 0} />
      <T x={300} y={236} s={13} f={C.secondary} a="middle" o={on ? easeOut(seg(s, 1.6, 2.0)) : 0}>
        honest about what it covers
      </T>
    </Svg>
  );
}
