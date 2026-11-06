import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The serving contract and the ownership handoff, drawn from examples.py's own mart: three bookings by three users
// with 3, 1 and 2 nights, so COUNT(DISTINCT user_id) at booking grain gives 3 while COUNT(*) after the line-item join
// gives 6 — two correct queries, two totals, because the grain was never written down. Minerva's stack (Airflow; Hive
// and Spark; Presto and Druid) is the FACT-CHECK's quoted secondary source; no other numbers are drawn.

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
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

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
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** An arrow from (x1, y1) to (x2, y2), drawn up to fraction k. */
const Arrow = ({ x1, y1, x2, y2, k = 1, c = C.secondary, dash }: { x1: number; y1: number; x2: number; y2: number; k?: number; c?: string; dash?: string }) => {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g stroke={c} strokeWidth={1.4} fill="none">
      <line x1={x1} y1={y1} x2={x} y2={y} strokeDasharray={dash} />
      {k > 0.95 && <path d={`M${x - 7 * Math.cos(a - 0.5)} ${y - 7 * Math.sin(a - 0.5)} L${x} ${y} L${x - 7 * Math.cos(a + 0.5)} ${y - 7 * Math.sin(a + 0.5)}`} />}
    </g>
  );
};

/** A dashboard tile: a title and one big number. */
const Dash = ({ x, y, w, l, v, c = C.focus, o = 1 }: { x: number; y: number; w: number; l: string; v: string; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={64} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
      <T x={x + 12} y={y + 20} s={12} f={C.secondary}>
        {l}
      </T>
      <T x={x + 12} y={y + 52} s={24} f={c}>
        {v}
      </T>
    </g>
  );

// examples.py's mart: three bookings by three users in 2026-10; their stays are 3, 1 and 2 nights, so the line-item
// table holds 6 rows. COUNT(DISTINCT user_id) at booking grain gives 3; COUNT(*) after joining line items gives 6.
const NIGHTS = [3, 1, 2];

// 0 · One mart feeds two dashboards. Each query arrives with its own ✓ — correct on its own terms — and the two tiles
// read 3 and 6 for the same question. A ≠ settles between them.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two dashboards, the same mart, two different totals for active users this month." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={88} w={140} h={40} label="the mart" />
      </g>
      <Arrow x1={165} y1={100} x2={320} y2={52} k={easeInOut(seg(t, 0.3, 0.8))} />
      <Arrow x1={165} y1={116} x2={320} y2={164} k={easeInOut(seg(t, 0.5, 1.0))} />
      <Dash x={330} y={20} w={200} l="active users" v="3" o={easeOut(seg(t, 0.8, 1.1))} />
      <Dash x={330} y={132} w={200} l="active users" v="6" o={easeOut(seg(t, 1.0, 1.3))} />
      <Tick x={552} y={52} k={easeOut(seg(t, 1.4, 1.7))} />
      <Tick x={552} y={164} k={easeOut(seg(t, 1.6, 1.9))} />
      <T x={430} y={115} s={18} f={C.badText} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        ≠
      </T>
    </Svg>
  );
}

// 1 · Inside the mart: three booking rows, and their nights fanning out into six line items. Before the answer the
// grain reads "one row = ?". After it, one count lands per grain — per booking 3, per night 6 — and the missing fact
// is written in: one row = one booking, never written down.
export function PredictWhatWasMissing({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  let li = 0;
  return (
    <Svg label="what was never written down, and whose job should it have been?" h={200}>
      {NIGHTS.map((n, b) => {
        const by = 30 + b * 50;
        const o = easeOut(seg(t, 0.1 + b * 0.2, 0.4 + b * 0.2));
        const rows = Array.from({ length: n }, () => li++);
        return (
          <g key={b} opacity={o}>
            <rect x={25} y={by} width={110} height={26} rx={3} fill={C.panel} stroke={on && s > 0.6 ? C.focus : C.line} strokeWidth={1.2} />
            <T x={80} y={by + 18} s={12} f={C.primary} a="middle">
              {`booking ${b + 1}`}
            </T>
            {rows.map((r) => {
              const y = 22 + r * 24;
              return (
                <g key={r}>
                  <line x1={135} y1={by + 13} x2={210} y2={y + 9} stroke={C.line} strokeWidth={1} />
                  <rect x={210} y={y} width={70} height={18} rx={2} fill={C.panel} stroke={on && s > 1.0 ? C.second : C.line} strokeWidth={1.1} />
                  <T x={245} y={y + 13} s={11} f={C.secondary} a="middle">
                    night
                  </T>
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={575} y={70} s={14} f={C.focus} a="end" o={on ? easeOut(seg(s, 0.6, 0.9)) : 0}>
        per booking: 3
      </T>
      <T x={575} y={110} s={14} f={C.second} a="end" o={on ? easeOut(seg(s, 1.0, 1.3)) : 0}>
        per night: 6
      </T>
      <T x={575} y={186} s={13} f={on ? C.badText : C.focus} a="end" o={easeOut(seg(t, 1.0, 1.4))}>
        {on && s > 1.5 ? 'one row = one booking, unwritten' : 'one row = ?'}
      </T>
    </Svg>
  );
}

// 2 · A dashed boundary. Left of it the conformed mart and, in front, the semantic layer holding one metric. Compiled
// queries pulse across to three different tools. Then the two things that never cross: a raw table, a finished dashboard.
export function RevealWhatGetsHandedOff({ t }: StepCtx) {
  const tools = ['BI tool', 'notebook', 'app'];
  const pulse = seg(t, 1.6, 3.0);
  return (
    <Svg label="a conformed mart behind a semantic layer that compiles one metric to SQL for every tool." h={220}>
      <line x1={320} y1={10} x2={320} y2={160} stroke={C.line} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <Box x={25} y={24} w={150} label="conformed mart" />
      </g>
      <g opacity={easeOut(seg(t, 0.7, 1.1))}>
        <Box x={25} y={96} w={260} label="one metric, compiled" lit />
        <line x1={100} y1={56} x2={100} y2={96} stroke={C.line} strokeWidth={1.2} />
      </g>
      {tools.map((l, i) => {
        const y = 24 + i * 46;
        const k = pulse > 0 ? easeOut(seg(t, 1.3 + i * 0.15, 1.6 + i * 0.15)) : 0;
        const p = (pulse * 2 + i * 0.3) % 1;
        return (
          <g key={l}>
            <line x1={285} y1={112} x2={420} y2={y + 16} stroke={C.line} strokeWidth={1} opacity={k} />
            {pulse > 0 && pulse < 1 && <circle cx={lerp(285, 420, p)} cy={lerp(112, y + 16, p)} r={3} fill={C.second} />}
            <Box x={420} y={y} w={155} label={l} o={k} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 3.1, 3.4))}>
        <Box x={25} y={180} w={150} label="raw table" stroke={C.badText} f={C.secondary} />
        <Box x={330} y={180} w={150} label="dashboard" stroke={C.badText} f={C.secondary} />
      </g>
      <Cross x={190} y={196} k={easeOut(seg(t, 3.4, 3.6))} />
      <Cross x={495} y={196} k={easeOut(seg(t, 3.5, 3.7))} />
    </Svg>
  );
}

// 3 · A contract card crosses the boundary and two lines are written into it: grain, freshness. Then the third,
// unwritten case: "unspoken" turns into "assumed", and "assumed" into a red "breaks".
export function RevealGrainAndFreshness({ t }: StepCtx) {
  const slide = easeInOut(seg(t, 0, 0.6));
  const w1 = seg(t, 0.8, 1.6);
  const w2 = seg(t, 1.7, 2.5);
  const g1 = 'grain: one row per booking';
  const g2 = 'freshness: allowed staleness';
  return (
    <Svg label="the mart's grain and freshness SLA are facts a consumer must be told, in writing." h={230}>
      <g transform={`translate(${lerp(-60, 0, slide)} 0)`} opacity={slide}>
        <rect x={25} y={20} width={420} height={104} rx={5} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={41} y={42} s={12} f={C.quiet}>
          in writing
        </T>
        <T x={41} y={74} s={13} f={C.focus}>
          {g1.slice(0, Math.round(g1.length * w1))}
        </T>
        <T x={41} y={104} s={13} f={C.focus}>
          {g2.slice(0, Math.round(g2.length * w2))}
        </T>
      </g>
      <Tick x={470} y={70} k={w1 >= 1 ? 1 : 0} />
      <Tick x={470} y={100} k={w2 >= 1 ? 1 : 0} />
      <g opacity={easeOut(seg(t, 2.8, 3.1))}>
        <Box x={25} y={160} w={130} label="unspoken" dash="4 3" f={C.secondary} />
      </g>
      <Arrow x1={160} y1={176} x2={215} y2={176} k={easeOut(seg(t, 3.0, 3.3))} />
      <g opacity={easeOut(seg(t, 3.2, 3.5))}>
        <Box x={222} y={160} w={130} label="assumed" f={C.secondary} />
      </g>
      <Arrow x1={357} y1={176} x2={412} y2={176} k={easeOut(seg(t, 3.5, 3.8))} c={C.badText} />
      <g opacity={easeOut(seg(t, 3.7, 4.0))}>
        <Box x={420} y={160} w={130} label="breaks" stroke={C.badText} f={C.badText} />
      </g>
    </Svg>
  );
}

// 4 · Two lanes either side of the boundary. Left, data engineers: a pipe with data streaming through. Right, analytics
// engineers. The metric-definition token leaves the left lane and settles on the right. Two skills, two owners.
export function RevealAnalyticsEngineerOwnership({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.4, 2.4));
  const flow = t * 0.6;
  return (
    <Svg label="past this handoff, metric definitions are typically owned by analytics engineers." h={200}>
      <line x1={300} y1={10} x2={300} y2={150} stroke={C.line} strokeWidth={1.2} strokeDasharray="5 4" />
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={26} s={12} f={C.secondary}>
          data engineers
        </T>
        <rect x={25} y={40} width={250} height={22} rx={11} fill="none" stroke={C.line} strokeWidth={1.2} />
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <circle key={j} cx={35 + ((flow * 230 + j * 40) % 230)} cy={51} r={3.5} fill={C.secondary} />
        ))}
        <T x={25} y={86} s={12} f={C.quiet}>
          move data at scale
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <T x={325} y={26} s={12} f={C.secondary}>
          analytics engineers
        </T>
        <rect x={325} y={40} width={250} height={60} rx={5} fill="none" stroke={mv > 0.9 ? C.focus : C.line} strokeWidth={1.2} />
        <T x={325} y={124} s={12} f={C.quiet} o={easeOut(seg(t, 2.4, 2.8))}>
          define the metric
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <Box x={lerp(50, 340, mv)} y={lerp(100, 54, mv)} w={220} label="metric definition" lit />
      </g>
      <T x={300} y={180} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        two different skills
      </T>
    </Svg>
  );
}

// 5 · A loop that keeps turning: request, who may change it, resolve, publish — a dot circling it the whole time. On
// the left a written-once document is filed away and struck.
export function RevealNegotiation({ t }: StepCtx) {
  const cx = 430;
  const cy = 90;
  const r = 56;
  const nodes: [string, number, number, 'start' | 'middle' | 'end'][] = [
    ['who may change?', cx, cy - r - 12, 'middle'],
    ['resolve', cx + r + 10, cy + 5, 'start'],
    ['publish', cx, cy + r + 22, 'middle'],
    ['request', cx - r - 10, cy + 5, 'end'],
  ];
  const a = -Math.PI / 2 + Math.max(0, t - 0.8) * 2.4;
  const loop = easeOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="who may change a shared metric, and how a conflicting request gets resolved — the ongoing mechanism." h={180}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.line} strokeWidth={1.4} opacity={loop} />
      {nodes.map(([l, x, y, an], i) => (
        <T key={l} x={x} y={y} s={12} f={C.primary} a={an} o={easeOut(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25))}>
          {l}
        </T>
      ))}
      {t > 0.8 && <circle cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={5} fill={C.focus} />}
      <g opacity={easeOut(seg(t, 2.4, 2.7)) * (1 - 0.5 * easeOut(seg(t, 3.2, 3.6)))}>
        <rect x={40} y={50} width={70} height={86} rx={3} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        {[0, 1, 2, 3, 4].map((j) => (
          <rect key={j} x={50} y={64 + j * 13} width={j === 4 ? 30 : 50} height={4} rx={1} fill={C.line} />
        ))}
        <T x={75} y={160} s={12} f={C.secondary} a="middle">
          written once
        </T>
      </g>
      <Cross x={75} y={93} k={easeOut(seg(t, 3.2, 3.5))} />
    </Svg>
  );
}

// 6 · Minerva's one path, top to bottom: a metric defined once, Airflow orchestrating, Hive and Spark computing, Presto
// and Druid serving. One token travels the whole path, then fans out to every consumer.
export function RevealMinerva({ t }: StepCtx) {
  const stack = ['Minerva: defined once', 'Airflow — orchestration', 'Hive and Spark — compute', 'Presto and Druid — serving'];
  const drop = easeInOut(seg(t, 1.6, 3.0));
  const fan = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="Airbnb's own metric platform: every metric defined in exactly one place." h={220}>
      <line x1={40} y1={30} x2={40} y2={30 + 3 * 50 * Math.min(1, seg(t, 0.2, 1.6))} stroke={C.line} strokeWidth={1.4} />
      {stack.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 0.2 + i * 0.35, 0.5 + i * 0.35))}>
          <circle cx={40} cy={30 + i * 50} r={5} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
          <T x={60} y={35 + i * 50} s={13} f={i === 0 ? C.focus : C.primary}>
            {s}
          </T>
        </g>
      ))}
      {drop > 0 && fan < 1 && <circle cx={40} cy={30 + 150 * drop} r={5} fill={C.focus} />}
      {[0, 1, 2].map((j) => (
        <g key={j} opacity={fan}>
          <line x1={420} y1={180} x2={lerp(420, 520, fan)} y2={lerp(180, 150 + j * 30, fan)} stroke={C.second} strokeWidth={1.2} />
          <circle cx={lerp(420, 528, fan)} cy={lerp(180, 150 + j * 30, fan)} r={4} fill={C.second} />
        </g>
      ))}
      <line x1={398} y1={180} x2={420} y2={180} stroke={C.second} strokeWidth={1.2} opacity={fan} strokeDasharray="3 3" />
      <T x={575} y={135} s={12} f={C.second} a="end" o={fan}>
        every tool
      </T>
    </Svg>
  );
}

// 7 · A course line along the top: earlier · here · next · later. Each left-out piece appears at "here" and a marker
// slides to the place it is actually taught, its row lighting with that destination.
export function RevealWhatThisLeavesOut({ t }: StepCtx) {
  const marks: [string, number][] = [
    ['earlier', 70],
    ['here', 220],
    ['next', 370],
    ['later', 520],
  ];
  const items: [string, number][] = [
    ['how the layer compiles', 0],
    ['which BI tool reads it', 2],
    ['engine serving many tools', 3],
    ['the full negotiation', 3],
  ];
  return (
    <Svg label="each left-out piece named forward to where it is actually taught." h={220}>
      <line x1={50} y1={34} x2={545} y2={34} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      {marks.map(([l, x], i) => (
        <g key={l} opacity={easeOut(seg(t, 0.1, 0.4))}>
          <line x1={x} y1={28} x2={x} y2={40} stroke={i === 1 ? C.focus : C.secondary} strokeWidth={1.4} />
          <T x={x} y={20} s={12} f={i === 1 ? C.focus : C.secondary} a="middle">
            {l}
          </T>
        </g>
      ))}
      {items.map(([l, d], i) => {
        const st = 0.6 + i * 0.85;
        const mv = easeInOut(seg(t, st + 0.3, st + 0.8));
        const dx = marks[d][1];
        return (
          <g key={l} opacity={easeOut(seg(t, st, st + 0.3))}>
            <circle cx={lerp(220, dx, mv)} cy={34} r={4} fill={C.focus} opacity={1 - easeOut(seg(t, st + 0.85, st + 1.0)) * 0.7} />
            <T x={25} y={76 + i * 38} s={13} f={C.primary}>
              {l}
            </T>
            <T x={575} y={76 + i * 38} s={13} f={C.focus} a="end" o={mv}>
              {['← earlier', '', '→ next', '→ later'][d]}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Four lines, each with its picture: the mart and one metric crossing the boundary; the two written lines; the
// token moving lanes; the loop still turning.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['what crosses', 'a conformed mart, one metric'],
    ['grain and freshness', 'written down, never assumed'],
    ['ownership', 'analytics engineers, past here'],
    ['negotiation', 'ongoing; one metric, once'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  const a = -Math.PI / 2 + Math.max(0, t - 3.0) * 2.4;
  return (
    <Svg label="a mart and a compiled metric, handed off. Grain and freshness, documented. Ownership, negotiated." h={300}>
      {L.map(([x, y], i) => (
        <g key={x} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {x}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {y}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <line x1={510} y1={20} x2={510} y2={66} stroke={C.line} strokeDasharray="4 3" />
        <rect x={lerp(450, 520, easeInOut(seg(t, 0.6, 1.2)))} y={32} width={40} height={20} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.3} />
      </g>
      <g opacity={k(1)}>
        <rect x={470} y={90} width={90} height={46} rx={3} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
        <rect x={480} y={102} width={70 * seg(t, 1.3, 1.8)} height={5} rx={1} fill={C.focus} />
        <rect x={480} y={118} width={56 * seg(t, 1.6, 2.1)} height={5} rx={1} fill={C.focus} />
      </g>
      <g opacity={k(2)}>
        <line x1={515} y1={160} x2={515} y2={206} stroke={C.line} strokeDasharray="4 3" />
        <circle cx={lerp(480, 550, easeInOut(seg(t, 2.3, 2.9)))} cy={183} r={6} fill={C.focus} />
      </g>
      <g opacity={k(3)}>
        <circle cx={515} cy={255} r={22} fill="none" stroke={C.line} strokeWidth={1.3} />
        <circle cx={515 + 22 * Math.cos(a)} cy={255 + 22 * Math.sin(a)} r={4} fill={C.focus} />
      </g>
    </Svg>
  );
}

// 9 · The mart and the shared metric feed dashboards one and two, both reading 3. A third dashboard's path skips the
// metric and goes straight to the mart by hand: "?". After the answer the mart and the layer each get ✓ unchanged,
// and the bypass turns red: the same metric, computed a second time.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="a third dashboard reports yet another number; the analyst wrote the SQL by hand." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={20} w={120} label="mart" />
        <Box x={25} y={84} w={120} label="metric" />
        <line x1={85} y1={52} x2={85} y2={84} stroke={C.line} strokeWidth={1.2} />
      </g>
      <Arrow x1={145} y1={96} x2={330} y2={40} k={easeOut(seg(t, 0.3, 0.7))} />
      <Arrow x1={145} y1={104} x2={330} y2={104} k={easeOut(seg(t, 0.4, 0.8))} />
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <Box x={340} y={24} w={200} label="dashboard 1: 3" />
        <Box x={340} y={88} w={200} label="dashboard 2: 3" />
      </g>
      <Arrow x1={145} y1={36} x2={330} y2={168} k={easeOut(seg(t, 1.2, 1.7))} c={on && s > 1.2 ? C.badText : C.secondary} dash="4 3" />
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <Box x={340} y={152} w={200} label="dashboard 3: ?" stroke={on && s > 1.2 ? C.badText : C.line} f={on && s > 1.2 ? C.badText : C.focus} />
      </g>
      <T x={232} y={136} s={12} f={on && s > 1.2 ? C.badText : C.secondary} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        by hand
      </T>
      {on && (
        <g>
          <Tick x={160} y={33} k={easeOut(seg(s, 0.2, 0.5))} />
          <Tick x={160} y={97} k={easeOut(seg(s, 0.5, 0.8))} />
          <T x={25} y={190} s={12} f={C.badText} o={easeOut(seg(s, 1.4, 1.8))}>
            the same metric, computed a second time
          </T>
        </g>
      )}
    </Svg>
  );
}
