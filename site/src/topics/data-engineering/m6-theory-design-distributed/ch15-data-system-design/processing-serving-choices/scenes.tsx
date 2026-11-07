import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 5: the decision card with three serving options for the one slow query, each with latency,
// freshness and run-cost bars; the amplification ledger as a bar per option that multiplies out from logical to
// physical bytes, the surprising multiplier counted up; a question-shape strip drawing each store as an arrow out
// of the one system-of-record box. Bytes are examples.py's: a 50 MB base table, a 2 MB aggregate, three replicas;
// OLAP ×2 compaction → 300 MB (6×), clustering key ×1.3 index upkeep → 195 MB (3.9×), the nightly pre-aggregate
// rescans the base table → (50 + 2) × 3 = 156 MB for a 2 MB table (78×).

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

type Opt = { name: string; lat: number; fresh: number; cost: number };
// qualitative bars (longer = slower, staler, costlier), in the reel's own order of the three fixes
const OPTS: Opt[] = [
  { name: 'real-time OLAP', lat: 0.25, fresh: 0.15, cost: 0.95 },
  { name: 'nightly pre-agg', lat: 0.1, fresh: 0.9, cost: 0.5 },
  { name: 'clustering key', lat: 0.35, fresh: 0.15, cost: 0.25 },
];

/** One option card on the decision card: a name and three bars that grow with `k`. */
function OptCard({ x, y, opt, k, lift = 0, dim = 0, chosen = false, broken = 0 }: { x: number; y: number; opt: Opt; k: number; lift?: number; dim?: number; chosen?: boolean; broken?: number }) {
  const bars: [string, number][] = [
    ['latency', opt.lat],
    ['staleness', opt.fresh],
    ['run cost', opt.cost],
  ];
  return (
    <g opacity={1 - 0.6 * dim} transform={`translate(0 ${-lift})`}>
      <rect x={x} y={y} width={170} height={128} rx={5} fill={C.panel} stroke={broken > 0.5 ? C.badText : chosen ? C.focus : C.line} strokeWidth={chosen || broken > 0.5 ? 1.8 : 1} />
      <T x={x + 85} y={y + 22} s={13} f={chosen ? C.focus : C.primary} a="middle" w={600}>
        {opt.name}
      </T>
      {bars.map(([label, v], i) => (
        <g key={label}>
          <T x={x + 12} y={y + 50 + i * 28} s={13} f={C.secondary}>
            {label}
          </T>
          <rect x={x + 12} y={y + 56 + i * 28} width={146} height={5} fill={C.band} />
          <rect x={x + 12} y={y + 56 + i * 28} width={146 * v * k} height={5} fill={chosen ? C.focus : C.primary} />
        </g>
      ))}
      {broken > 0 && (
        <path d={`M${x + 120} ${y} l-14 34 l18 20 l-16 34`} fill="none" stroke={C.badText} strokeWidth={2} opacity={broken} />
      )}
    </g>
  );
}

// 1 · The dashboard tile with a spinner and a timer counting to eight seconds; three fixes fan out beneath it.
export function Hook({ t }: StepCtx) {
  const secs = 8 * easeInOut(seg(t, 0.2, 1.6));
  const FIX: [string, string, string][] = [
    ['real-time OLAP', 'a new store', C.primary],
    ['nightly pre-aggregate', 'a new table', C.primary],
    ['clustering key', 'just two lines', C.focus],
  ];
  return (
    <Svg label="the dashboard query takes eight seconds — three fixes proposed: a real-time OLAP store, a nightly pre-aggregate, or a two-line clustering key" h={280}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={170} y={14} width={260} height={86} rx={5} fill={C.panel} stroke={C.line} />
        <T x={186} y={38} s={13} f={C.secondary}>
          dashboard · revenue
        </T>
        <circle cx={210} cy={70} r={12} fill="none" stroke={C.line} strokeWidth={2} />
        {t < 1.6 && (
          <path d={`M${210 + 12 * Math.cos(t * 6)} ${70 + 12 * Math.sin(t * 6)} A12 12 0 0 1 ${210 + 12 * Math.cos(t * 6 + 1.6)} ${70 + 12 * Math.sin(t * 6 + 1.6)}`} fill="none" stroke={C.focus} strokeWidth={2} />
        )}
        <T x={410} y={78} s={22} f={secs > 7.9 ? C.badText : C.primary} a="end" w={700}>
          {secs.toFixed(1)} s
        </T>
      </g>
      {FIX.map(([name, value, f], i) => {
        const x = 30 + i * 190;
        const at = 1.8 + i * 0.4;
        const k = easeOutBack(seg(t, at, at + 0.4));
        if (k <= 0) return null;
        return (
          <g key={name} opacity={Math.min(1, k)} transform={`translate(0 ${(1 - k) * -20})`}>
            <Draw pts={[[300, 100], [x + 85, 140]]} t={t} from={at - 0.2} to={at + 0.1} stroke={C.line} w={1.2} pen={false} />
            <rect x={x} y={140} width={170} height={84} rx={5} fill={C.panel} stroke={i === 2 ? C.focus : C.line} />
            <T x={x + 85} y={170} s={13} f={C.primary} a="middle" w={600}>
              {name}
            </T>
            <T x={x + 85} y={200} s={14} f={f} a="middle">
              {value}
            </T>
          </g>
        );
      })}
      <T x={300} y={260} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        which one actually wins?
      </T>
    </Svg>
  );
}

// 2 · The decision card: three options with latency, staleness and run-cost bars. After the pick, OLAP's cost bar is
// called out, the clustering key lifts as cheapest, and the pre-aggregate gets a crack: it breaks first.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const k = easeInOut(seg(t, 0.2, 1.2));
  const lift = on ? easeOutBack(seg(s, 0.8, 1.3)) * 10 : 0;
  return (
    <Svg label="which fix is cheapest, which is fastest, and which breaks when the question changes tomorrow?" h={250}>
      {OPTS.map((opt, i) => (
        <OptCard key={opt.name} x={20 + i * 190} y={20} opt={opt} k={k} chosen={i === 2 && on && s > 1.0} lift={i === 2 ? lift : 0} dim={on && i === 0 ? easeOut(seg(s, 0.3, 0.7)) * 0.6 : 0} broken={i === 1 && on ? easeOut(seg(s, 1.5, 1.9)) : 0} />
      ))}
      {!on && (
        <T x={300} y={200} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          purpose-built = cheapest?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={198} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            OLAP always wins
          </T>
          <T x={575} y={198} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            not the cheapest
          </T>
          <T x={40} y={230} s={14} f={C.focus} o={easeOut(seg(s, 1.0, 1.3))}>
            clustering, cheapest
          </T>
          <T x={575} y={230} s={14} f={C.badText} a="end" o={easeOut(seg(s, 1.6, 1.9))}>
            pre-agg breaks first
          </T>
        </>
      )}
    </Svg>
  );
}

// 3 · Three gauges: a state blob outgrowing the memory box and spilling to a state backend; a latency clock with the
// shape's floor marked; a pager at two in the morning and a person who can or cannot read the stack trace.
export function RevealEngineDrivers({ t }: StepCtx) {
  const blob = easeInOut(seg(t, 0.3, 1.5));
  const spill = Math.max(0, blob - 0.7) / 0.3;
  const hand = easeInOut(seg(t, 1.4, 2.4));
  const ring = t > 2.8 && t < 3.6;
  return (
    <Svg label="three real drivers for picking a processing engine" h={250}>
      {/* state size */}
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={40} y={30} width={130} height={110} rx={4} fill="none" stroke={C.primary} strokeWidth={1.4} />
        <T x={105} y={22} s={13} f={C.quiet} a="middle">
          memory
        </T>
        <rect x={52} y={128 - 100 * Math.min(blob, 0.7) * 1.3} width={106} height={100 * Math.min(blob, 0.7) * 1.3} fill={C.primary} opacity={0.7} />
        {spill > 0 && <rect x={52} y={146} width={106 * spill} height={14} fill={C.second} opacity={0.85} />}
        <T x={105} y={178} s={13} f={C.second} a="middle" o={spill}>
          state backend
        </T>
      </g>
      {/* latency floor */}
      <g opacity={easeOut(seg(t, 1.1, 1.4))}>
        <circle cx={300} cy={85} r={48} fill="none" stroke={C.primary} strokeWidth={1.4} />
        <line x1={300} y1={37} x2={300} y2={47} stroke={C.focus} strokeWidth={3} />
        <line x1={300} y1={85} x2={300 + 38 * Math.sin(hand * 5.8)} y2={85 - 38 * Math.cos(hand * 5.8)} stroke={C.focus} strokeWidth={2} />
        <T x={300} y={160} s={13} f={C.quiet} a="middle">
          floor set by the shape
        </T>
      </g>
      {/* team skill */}
      <g opacity={easeOut(seg(t, 2.2, 2.5))} transform={`translate(${ring ? Math.sin(t * 60) * 2 : 0} 0)`}>
        <rect x={450} y={50} width={90} height={60} rx={6} fill="none" stroke={ring ? C.focus : C.primary} strokeWidth={1.6} />
        <T x={495} y={88} s={16} f={C.focus} a="middle" w={700}>
          02:00
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.8, 3.1))}>
        <circle cx={495} cy={134} r={8} fill="none" stroke={C.primary} strokeWidth={1.4} />
        <path d="M480 160 q15 -18 30 0" fill="none" stroke={C.primary} strokeWidth={1.4} />
        <T x={515} y={140} s={15} f={C.focus} w={700} o={easeOut(seg(t, 3.2, 3.5))}>
          ?
        </T>
      </g>
      {[
        ['state size', 'fits in memory?', 105, 0.6],
        ['latency floor', 'from the shape', 300, 1.6],
        ['team skill', 'who debugs it', 495, 3.0],
      ].map(([label, value, x, at], i) => (
        <g key={label as string} opacity={easeOut(seg(t, at as number, (at as number) + 0.3))}>
          <T x={x as number} y={208} s={14} f={i === 2 ? C.focus : C.primary} a="middle" w={600}>
            {label}
          </T>
          <T x={x as number} y={232} s={13} f={C.secondary} a="middle">
            {value}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 4 · Two engines' cost bars in one unit. The benchmark-fast engine starts shorter, then a "nobody can debug it"
// segment grows onto its end until its total passes the familiar engine's.
export function RevealTeamSkillCost({ t }: StepCtx) {
  const base = easeInOut(seg(t, 0.2, 1.0));
  const skill = easeInOut(seg(t, 1.6, 2.8));
  const SCALE = 360;
  return (
    <Svg label="an engine nobody on call can debug is a cost bar, same units as latency and compute cost" h={240}>
      <T x={150} y={26} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        cost, one unit
      </T>
      {[
        ['fast on a slide', 0.45, 0.5],
        ['the team knows it', 0.6, 0.08],
      ].map(([name, b, extra], i) => {
        const y = 50 + i * 60;
        return (
          <g key={name as string} opacity={easeOut(seg(t, i * 0.15, i * 0.15 + 0.3))}>
            <T x={190} y={y + 16} s={13} f={C.primary} a="end">
              {name}
            </T>
            <rect x={200} y={y} width={SCALE * (b as number) * base * 0.55} height={22} fill={C.secondary} />
            <rect x={200 + SCALE * (b as number) * base * 0.55} y={y} width={SCALE * (b as number) * base * 0.45} height={22} fill={C.primary} />
            <rect
              x={200 + SCALE * (b as number) * base}
              y={y}
              width={SCALE * (extra as number) * skill}
              height={22}
              fill={i === 0 ? C.bad : C.line}
              stroke={i === 0 ? C.badText : C.line}
            />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <rect x={150} y={150} width={12} height={10} fill={C.secondary} />
        <T x={168} y={160} s={13} f={C.secondary}>
          latency
        </T>
        <rect x={250} y={150} width={12} height={10} fill={C.primary} />
        <T x={268} y={160} s={13} f={C.secondary}>
          compute
        </T>
        <rect x={360} y={150} width={12} height={10} fill={C.bad} stroke={C.badText} opacity={easeOut(seg(t, 1.6, 1.9))} />
        <T x={378} y={160} s={13} f={C.badText} o={easeOut(seg(t, 1.6, 1.9))}>
          can't debug
        </T>
      </g>
      <T x={40} y={198} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        latency, compute
      </T>
      <T x={575} y={198} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        counted costs
      </T>
      <T x={40} y={228} s={14} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        who can debug it
      </T>
      <T x={575} y={228} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        a cost too
      </T>
    </Svg>
  );
}

/** Small store icons, each drawn in a 28×28 box at (x, y). */
function StoreIcon({ kind, x, y }: { kind: number; x: number; y: number }) {
  const s = { fill: 'none', stroke: C.focus, strokeWidth: 1.5 } as const;
  if (kind === 0)
    return (
      <g {...s}>
        <circle cx={x + 8} cy={y + 14} r={6} />
        <path d={`M${x + 14} ${y + 14} h12 v5 M${x + 22} ${y + 14} v4`} />
      </g>
    );
  if (kind === 1)
    return (
      <g {...s}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={x + 2 + i * 7} y={y + 4} width={5} height={20} />
        ))}
      </g>
    );
  if (kind === 2)
    return (
      <g {...s}>
        <circle cx={x + 11} cy={y + 11} r={7} />
        <path d={`M${x + 16} ${y + 16} l8 8`} />
      </g>
    );
  return (
    <g fill={C.focus}>
      {[
        [6, 8],
        [10, 12],
        [8, 18],
        [22, 6],
        [20, 20],
      ].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={2.4} opacity={i < 3 ? 1 : 0.5} />
      ))}
    </g>
  );
}

// 5 · One system-of-record box on the left; four arrows draw out of it, each labelled with a question shape and
// landing on its store.
export function RevealQuestionShapeToStore({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['point lookup', 'key-value store'],
    ['OLAP slice', 'columnar store'],
    ['full-text', 'search index'],
    ['similarity', 'vector index'],
  ];
  return (
    <Svg label="four question shapes, four stores, each an arrow out of the one system of record" h={320}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={20} y={120} width={110} height={70} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
        <T x={75} y={150} s={13} f={C.focus} a="middle" w={600}>
          system
        </T>
        <T x={75} y={170} s={13} f={C.focus} a="middle" w={600}>
          of record
        </T>
      </g>
      {rows.map(([q, store], i) => {
        const y = 40 + i * 76;
        const at = 0.4 + i * 0.7;
        return (
          <g key={q}>
            <Draw pts={[[130, 155], [180, y + 14], [372, y + 14]]} t={t} from={at} to={at + 0.5} stroke={C.primary} w={1.4} pen={false} />
            <T x={196} y={y + 6} s={13} f={C.secondary} o={easeOut(seg(t, at + 0.2, at + 0.5))}>
              {q}
            </T>
            <g opacity={easeOut(seg(t, at + 0.4, at + 0.7))}>
              <rect x={380} y={y - 6} width={196} height={40} rx={4} fill={C.panel} stroke={C.line} />
              <StoreIcon kind={i} x={388} y={y} />
              <T x={426} y={y + 19} s={13} f={C.primary}>
                {store}
              </T>
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · The orders table at the top; three derived stores below, dots flowing down into each, and a "derived" stamp
// landing on every one.
export function RevealOneDatasetThreeStores({ t }: StepCtx) {
  const STORES = ['key-value', 'columnar', 'search'];
  return (
    <Svg label="the shop's order data, served three ways at once — each tagged derived, none of them the system of record itself" h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={210} y={14} width={180} height={50} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
        <T x={300} y={44} s={14} f={C.focus} a="middle" w={600}>
          orders table
        </T>
      </g>
      {STORES.map((name, i) => {
        const cx = 110 + i * 190;
        const at = 0.5 + i * 0.3;
        return (
          <g key={name}>
            <Draw pts={[[300, 64], [cx, 120]]} t={t} from={at} to={at + 0.4} stroke={C.line} w={1.2} pen={false} />
            {t > at + 0.4 &&
              [0, 1, 2].map((d) => {
                const u = ((t - at) * 0.8 + d / 3) % 1;
                return <circle key={d} cx={lerp(300, cx, u)} cy={lerp(64, 120, u)} r={3} fill={C.primary} />;
              })}
            <g opacity={easeOut(seg(t, at + 0.3, at + 0.6))}>
              <rect x={cx - 75} y={120} width={150} height={56} rx={5} fill={C.panel} stroke={C.line} strokeDasharray="5 4" />
              <T x={cx} y={152} s={13} f={C.primary} a="middle">
                {name}
              </T>
            </g>
            {(() => {
              const k = easeOutBack(seg(t, 1.8 + i * 0.25, 2.1 + i * 0.25));
              if (k <= 0) return null;
              return (
                <g opacity={Math.min(1, k)} transform={`translate(${cx} 188) scale(${0.6 + 0.4 * k})`}>
                  <rect x={-38} y={-12} width={76} height={20} rx={10} fill={C.ink} stroke={C.secondary} />
                  <T x={0} y={3} s={13} f={C.secondary} a="middle">
                    derived
                  </T>
                </g>
              );
            })()}
          </g>
        );
      })}
      <T x={40} y={232} s={14} f={C.primary} o={easeOut(seg(t, 2.6, 2.9))}>
        orders table
      </T>
      <T x={575} y={232} s={14} f={C.primary} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        system of record
      </T>
      <T x={40} y={260} s={14} f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        three stores
      </T>
      <T x={575} y={260} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.5))}>
        all derived from it
      </T>
    </Svg>
  );
}

// 7 · One day on two timelines. Pre-aggregated: one build block at night, then every read is a thin instant tick
// while a staleness bar grows through the day. On-query: every read carries its own compute block; staleness stays
// at zero.
export function RevealPreaggVsOnQuery({ t }: StepCtx) {
  const X0 = 150, X1 = 570;
  const now = easeInOut(seg(t, 0.4, 3.4));
  const READS = [0.18, 0.3, 0.42, 0.5, 0.61, 0.7, 0.78, 0.88];
  return (
    <Svg label="the same query, answered two ways — instant but stale-bounded, or fresh but costly at every read" h={250}>
      {[
        ['pre-aggregated', 40],
        ['on-query', 130],
      ].map(([name, y], i) => (
        <g key={name as string} opacity={easeOut(seg(t, i * 0.15, i * 0.15 + 0.3))}>
          <T x={140} y={(y as number) + 24} s={13} f={i ? C.focus : C.primary} a="end">
            {name}
          </T>
          <line x1={X0} y1={(y as number) + 30} x2={X1} y2={(y as number) + 30} stroke={C.line} />
        </g>
      ))}
      {/* pre-agg: nightly build */}
      <rect x={X0} y={40} width={36 * easeOut(seg(t, 0.3, 0.7))} height={30} fill={C.primary} opacity={0.85} />
      <T x={X0} y={88} s={13} f={C.quiet} o={easeOut(seg(t, 0.4, 0.7))}>
        build, once
      </T>
      {READS.filter((r) => r <= now).map((r) => (
        <g key={r}>
          <line x1={lerp(X0, X1, r)} y1={50} x2={lerp(X0, X1, r)} y2={70} stroke={C.focus} strokeWidth={1.6} />
          <rect x={lerp(X0, X1, r) - 7} y={130} width={14} height={30} fill={C.second} opacity={0.85} />
        </g>
      ))}
      {/* staleness meter for the pre-agg */}
      <T x={X0} y={112} s={13} f={C.secondary} o={easeOut(seg(t, 0.8, 1.1))}>
        staleness
      </T>
      <rect x={X0 + 90} y={102} width={(X1 - X0 - 90) * now} height={8} fill={C.secondary} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={X0} y={186} s={13} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        compute at every read
      </T>
      <T x={40} y={216} s={14} f={C.primary} o={easeOut(seg(t, 2.2, 2.5))}>
        pre-aggregated
      </T>
      <T x={575} y={216} s={14} f={C.primary} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        instant, fixed shape
      </T>
      <T x={40} y={242} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        on-query compute
      </T>
      <T x={575} y={242} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        fresh, costs per read
      </T>
    </Svg>
  );
}

const MB = 1.25; // px per MB in the ledger

/** One option's ledger row: segments that extend in order, each labelled by its multiplier, total counted up. */
function LedgerRow({ y, name, segs, total, factor, t, at, lit = false }: { y: number; name: string; segs: [number, string, string][]; total: number; factor: string; t: number; at: number; lit?: boolean }) {
  let x = 160;
  const k = easeOut(seg(t, at, at + 0.3));
  if (k <= 0) return null;
  const done = easeInOut(seg(t, at + 0.2, at + 0.2 + segs.length * 0.35));
  return (
    <g opacity={k}>
      <T x={150} y={y + 15} s={13} f={lit ? C.focus : C.primary} a="end">
        {name}
      </T>
      {segs.map(([mb, label, f], i) => {
        const g = easeInOut(seg(t, at + 0.2 + i * 0.35, at + 0.5 + i * 0.35));
        const w = mb * MB * g;
        const rx = x;
        x += mb * MB;
        return (
          <g key={i}>
            <rect x={rx} y={y} width={Math.max(0, w)} height={20} fill={f} stroke={C.ink} strokeWidth={1} />
          </g>
        );
      })}
      <T x={575} y={y + 34} s={13} f={lit ? C.focus : C.primary} a="end" w={lit ? 700 : 500} o={done}>
        {Math.round(total * done)} MB · {factor}
      </T>
    </g>
  );
}

// 8 · The ledger: each option multiplies out from its logical bytes, segment by segment, to its physical bytes.
export function RevealAmplificationLedger({ t }: StepCtx) {
  return (
    <Svg label="the amplification ledger — logical bytes, replication, rewrite and compaction, summing to physical bytes" h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        {[
          ['logical', C.focus],
          ['× replicas', C.primary],
          ['× rewrite', C.secondary],
        ].map(([label, f], i) => (
          <g key={label}>
            <rect x={160 + i * 140} y={14} width={12} height={10} fill={f} />
            <T x={178 + i * 140} y={24} s={13} f={C.secondary}>
              {label}
            </T>
          </g>
        ))}
      </g>
      <LedgerRow y={50} name="OLAP" segs={[[50, 'logical', C.focus], [100, '×3', C.primary], [150, '×2', C.secondary]]} total={300} factor="6×" t={t} at={0.3} />
      <LedgerRow y={110} name="clustering" segs={[[50, 'logical', C.focus], [100, '×3', C.primary], [45, '', C.secondary]]} total={195} factor="3.9×" t={t} at={1.1} />
      <LedgerRow y={170} name="pre-agg" segs={[[2, '', C.focus], [50, 'rescan', C.secondary], [104, '', C.primary]]} total={156} factor="78×" t={t} at={1.9} lit />
      <T x={40} y={244} s={14} f={C.primary} o={easeOut(seg(t, 3.0, 3.3))}>
        logical bytes
      </T>
      <T x={575} y={244} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        the starting count
      </T>
      <T x={40} y={274} s={14} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
        physical bytes
      </T>
      <T x={575} y={274} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.4, 3.7))}>
        the real cost
      </T>
    </Svg>
  );
}

// 9 · The pre-aggregate alone: a tiny 2 MB box, then the nightly rescan of the whole 50 MB base table sweeps under it
// and the multiplier counts up to 78×, next to the clustering key's 3.9×.
export function RevealSurprisingMultiplier({ t }: StepCtx) {
  const scan = easeInOut(seg(t, 0.8, 2.0));
  const count = easeInOut(seg(t, 1.6, 3.0));
  return (
    <Svg label="the cheapest-looking option on paper has the largest physical-bytes bar once replication and rewrite are counted" h={262}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={60} y={40} width={16} height={16} fill={C.focus} />
        <T x={86} y={53} s={13} f={C.primary}>
          the pre-agg table: 2 MB
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.5, 0.8))}>
        <rect x={60} y={74} width={480} height={30} fill="none" stroke={C.line} />
        <T x={60} y={124} s={13} f={C.quiet}>
          base table, 50 MB, rescanned every night
        </T>
      </g>
      <rect x={60} y={74} width={480 * scan} height={30} fill={C.secondary} opacity={0.8} />
      {scan > 0 && scan < 1 && <line x1={60 + 480 * scan} y1={68} x2={60 + 480 * scan} y2={110} stroke={C.focus} strokeWidth={2} />}
      <T x={160} y={176} s={34} f={C.focus} a="middle" w={700} o={easeOut(seg(t, 1.5, 1.8))}>
        {Math.round(78 * count)}×
      </T>
      <T x={160} y={214} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        pre-agg, own size
      </T>
      <T x={430} y={176} s={34} f={C.secondary} a="middle" w={700} o={easeOut(seg(t, 2.2, 2.5))}>
        3.9×
      </T>
      <T x={430} y={214} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        clustering key
      </T>
      <Reticle x={160} y={182} w={176} h={92} t={t} at={3.0} />
      <T x={40} y={250} s={14} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        pre-agg, looks tiny: rewrites the whole table
      </T>
    </Svg>
  );
}

// 10 · Four captions, each arriving with a small mark: three gauges, an arrow out of a box, a build block versus
// read ticks, a ledger bar.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['engine choice', 'state, latency, skill'],
    ['serving store', 'follows the question'],
    ['pre-agg vs on-query', 'repetition, freshness'],
    ['amplification', 'physical, not logical'],
  ];
  return (
    <Svg label="three engine drivers, the question-shape-to-store map, pre-agg versus on-query, and the ledger that prices all three honestly" h={280}>
      {rows.map(([label, value], i) => {
        const y = 44 + i * 64;
        const at = 0.2 + i * 0.7;
        const k = easeOut(seg(t, at, at + 0.35));
        return (
          <g key={label} opacity={k}>
            <T x={100} y={y} s={14} f={i === 2 ? C.focus : C.primary}>
              {label}
            </T>
            <T x={575} y={y} s={14} f={i === 2 ? C.focus : C.secondary} a="end">
              {value}
            </T>
          </g>
        );
      })}
      {/* marks */}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={34 + i * 18} cy={39} r={6} fill="none" stroke={C.primary} strokeWidth={1.4} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <rect x={28} y={94} width={18} height={18} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <Draw pts={[[46, 103], [76, 103]]} t={t} from={1.0} to={1.3} stroke={C.primary} w={1.4} pen={false} />
      </g>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <rect x={28} y={158} width={12} height={16} fill={C.primary} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={50 + i * 10} y1={160} x2={50 + i * 10} y2={174} stroke={C.focus} strokeWidth={1.4} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        <rect x={28} y={226} width={50 * easeInOut(seg(t, 2.3, 3.0))} height={12} fill={C.secondary} />
        <rect x={28} y={226} width={8} height={12} fill={C.focus} />
      </g>
    </Svg>
  );
}

// 11 · The three fix cards and a "new breakdown" chip. After the pick, the clustering key takes the new question as is
// (same 195 MB), the pre-aggregate cracks and its whole 50 MB rescan runs again from zero.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const rebuild = on ? easeInOut(seg(s, 1.4, 2.6)) : 0;
  return (
    <Svg label="a new breakdown, asked tomorrow — which fix survives, and what does the ledger say about it?" h={290}>
      <g opacity={easeOut(seg(t, 0, 0.3))} transform={`translate(0 ${(1 - easeOutBack(seg(t, 0, 0.5))) * -16})`}>
        <rect x={220} y={8} width={160} height={28} rx={14} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <T x={300} y={27} s={13} f={C.focus} a="middle">
          new breakdown
        </T>
      </g>
      {OPTS.map((opt, i) => (
        <OptCard
          key={opt.name}
          x={20 + i * 190}
          y={50}
          opt={opt}
          k={1}
          dim={on && i === 0 ? 0.6 : 0}
          chosen={on && i === 2 && s > 0.6}
          lift={on && i === 2 ? easeOutBack(seg(s, 0.4, 0.9)) * 8 : 0}
          broken={on && i === 1 ? easeOut(seg(s, 1.0, 1.4)) : 0}
        />
      ))}
      {on && (
        <>
          <T x={485} y={196} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 0.6, 0.9))}>
            same 195 MB
          </T>
          <rect x={210} y={186} width={170} height={10} fill="none" stroke={C.line} opacity={easeOut(seg(s, 1.3, 1.5))} />
          <rect x={210} y={186} width={170 * rebuild} height={10} fill={C.bad} />
          <T x={295} y={214} s={13} f={C.badText} a="middle" o={easeOut(seg(s, 1.4, 1.7))}>
            rescan 50 MB again
          </T>
        </>
      )}
      {!on && (
        <T x={300} y={230} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
          which one survives untouched?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={248} s={14} f={C.focus} o={easeOut(seg(s, 0.8, 1.1))}>
            clustering key
          </T>
          <T x={575} y={248} s={14} f={C.focus} a="end" o={easeOut(seg(s, 0.9, 1.2))}>
            survives, same cost
          </T>
          <T x={40} y={278} s={14} f={C.badText} o={easeOut(seg(s, 2.0, 2.3))}>
            pre-agg table
          </T>
          <T x={575} y={278} s={14} f={C.badText} a="end" o={easeOut(seg(s, 2.1, 2.4))}>
            needs a full rebuild
          </T>
        </>
      )}
    </Svg>
  );
}
