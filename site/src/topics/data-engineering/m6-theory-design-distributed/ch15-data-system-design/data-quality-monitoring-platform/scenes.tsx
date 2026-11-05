import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 21: the pipeline strip with check icons on each hop and a lineage graph beneath it; a failing
// root-cause table lights and the forty dependents it causes collapse into one grouped alert routed to one owner chip;
// an alert-precision gauge as the platform's own SLO; an incident state machine along the bottom. examples.py's numbers:
// orders_raw with forty downstream tables; a week of three failures is 3 x 41 = 123 alerts ungrouped, 3 grouped, 2 with
// day 2's planned window suppressed; check cost per million rows: full scan 1,000, incremental metric 500, metadata 0;
// at ten times the tables the same failure reaches 400 and still routes as one alert.

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

/** A half-dial gauge; p in 0..1 sets the needle. */
const Gauge = ({ cx, cy, r, p, lit = false, o = 1 }: { cx: number; cy: number; r: number; p: number; lit?: boolean; o?: number }) => {
  if (o <= 0) return null;
  const ang = Math.PI * (1 - Math.max(0, Math.min(1, p)));
  const ex = cx + Math.cos(ang) * r;
  const ey = cy - Math.sin(ang) * r;
  const nx = cx + Math.cos(ang) * r * 0.8;
  const ny = cy - Math.sin(ang) * r * 0.8;
  return (
    <g opacity={Math.min(1, o)}>
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={C.band} strokeWidth={8} />
      {p > 0.005 && <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none" stroke={lit ? C.focus : C.quiet} strokeWidth={8} />}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={lit ? C.focus : C.secondary} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={4} fill={lit ? C.focus : C.secondary} />
    </g>
  );
};

// 1 · A grid of checks runs; alerts fly off it one after another and pile into the channel. The channel goes muted and
// dims. Then one red alert, the stale source table, lands in the muted channel, and a day-long bar fills beneath it.
export function Hook({ t }: StepCtx) {
  const N = 14;
  const muted = easeOut(seg(t, 2.1, 2.5));
  const real = easeOutBack(seg(t, 2.7, 3.1));
  const day = easeInOut(seg(t, 3.2, 4.6));
  return (
    <Svg label="the checks were right; the team muted the channel" h={270}>
      {Array.from({ length: 60 }, (_, i) => {
        const cx = 30 + (i % 10) * 22;
        const cy = 40 + Math.floor(i / 10) * 22;
        const run = (t * 7 + i * 0.37) % 1;
        return <rect key={i} x={cx} y={cy} width={16} height={16} rx={2} fill={run < 0.18 && t > 0.3 ? C.quiet : C.band} stroke={C.line} opacity={easeOut(seg(t, i * 0.005, 0.3 + i * 0.005))} />;
      })}
      <T x={30} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        thousands of checks
      </T>
      <g opacity={easeOut(seg(t, 0.1, 0.4)) * (1 - muted * 0.55)}>
        <rect x={320} y={30} width={250} height={150} rx={6} fill="none" stroke={C.line} />
        {Array.from({ length: N }, (_, i) => {
          const at = 0.45 + i * 0.11;
          const p = easeInOut(seg(t, at, at + 0.3));
          if (p <= 0) return null;
          const sx = 30 + ((i * 7) % 10) * 22 + 3;
          const sy = 40 + ((i * 3) % 6) * 22 + 5;
          return <rect key={i} x={lerp(sx, 332, p)} y={lerp(sy, 168 - i * 8, p)} width={lerp(10, 226, p)} height={5} rx={1} fill={C.secondary} />;
        })}
      </g>
      <T x={332} y={50} s={13} f={muted > 0.5 ? C.quiet : C.primary} o={easeOut(seg(t, 0.1, 0.4))}>
        data alerts
      </T>
      {muted > 0 && (
        <g opacity={muted}>
          <T x={558} y={50} s={13} f={C.secondary} a="end">
            muted
          </T>
        </g>
      )}
      {real > 0 && <Box x={340} y={100} w={210} h={28} label="stale source table" fill={C.bad} stroke={C.badText} f={C.focus} o={Math.min(1, real)} />}
      <T x={570} y={200} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 1.2, 1.6))}>
        a flood of alerts
      </T>
      {day > 0 && (
        <g>
          <rect x={30} y={222} width={540} height={8} rx={2} fill={C.band} />
          <rect x={30} y={222} width={Math.max(0, 540 * day)} height={8} rx={2} fill={C.badText} />
          <T x={30} y={256} s={13} f={C.secondary}>
            in the muted channel
          </T>
          <T x={570} y={256} s={13} f={C.badText} a="end" o={easeOut(seg(t, 4.2, 4.6))}>
            unseen for a full day
          </T>
        </g>
      )}
    </Svg>
  );
}

// 2 · Twelve alerts and a gauge with no reading. After the answer the alerts sort into acted-on and ignored, and the
// gauge settles: a measured precision, the number week one never had.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const sort = on ? easeInOut(seg(s, 0.3, 1.0)) : 0;
  const lab = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const ACTED = [1, 6, 9];
  const wob = 0.5 + 0.32 * Math.sin(t * 4.2);
  const p = on ? lerp(wob, 0.25, sort) : wob;
  return (
    <Svg label="what did the design fail to treat as its own requirement?" h={210}>
      {Array.from({ length: 12 }, (_, i) => {
        const x = 30 + (i % 3) * 78;
        const y = 24 + Math.floor(i / 3) * 30;
        const acted = ACTED.includes(i);
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.06, 0.3 + i * 0.06)) * (on && !acted ? 1 - sort * 0.6 : 1)}>
            <rect x={x} y={y} width={68} height={20} rx={3} fill={on && acted ? C.panel : C.band} stroke={on && acted ? C.focus : C.line} strokeWidth={on && acted ? 1.6 : 1} />
            {on && acted && <Tick x={x + 34} y={y + 9} k={sort} />}
          </g>
        );
      })}
      <Gauge cx={440} cy={110} r={70} p={p} lit={on} o={easeOut(seg(t, 0.4, 0.8))} />
      {!on && (
        <T x={440} y={142} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
          ?
        </T>
      )}
      {lab > 0 && (
        <g opacity={lab}>
          <T x={440} y={140} s={14} f={C.focus} a="middle">
            alert precision
          </T>
          <T x={440} y={160} s={13} f={C.second} a="middle">
            share acted on
          </T>
        </g>
      )}
      {on ? (
        <Line2 y={196} l="fewer checks" r="trades away detection" lc={C.quiet} rc={C.quiet} o={easeOut(seg(s, 1.5, 1.9))} />
      ) : (
        <T x={30} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 1.0, 1.4))}>
          the checks were right every time
        </T>
      )}
    </Svg>
  );
}

// 3 · The pipeline strip. The rule layer's chips each compile to one query; the stats layer draws a learned band
// with one point outside it. Each kind of check gets its price per run, then its place: a gate on the strip or a
// dashed scan after publish.
export function RevealTwoLayers({ t }: StepCtx) {
  const rules = easeOut(seg(t, 0.3, 0.8));
  const stats = easeOut(seg(t, 1.2, 1.6));
  const band = easeInOut(seg(t, 1.4, 2.2));
  const out = easeOutBack(seg(t, 2.2, 2.5));
  const cost = easeInOut(seg(t, 2.6, 3.4));
  const place = easeOut(seg(t, 3.6, 4.0));
  const COSTS: [string, number][] = [
    ['full scan', 1000],
    ['incremental', 500],
    ['metadata', 0],
  ];
  const spark = Array.from({ length: 12 }, (_, i) => [110 + i * 22, 130 + Math.sin(i * 1.3) * 6] as [number, number]);
  return (
    <Svg label="declarative rules and statistical checks, each costed and placed" h={240}>
      {['land', 'transform', 'publish'].map((h, i) => (
        <Box key={h} x={30 + i * 200} y={14} w={140} h={28} label={h} o={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))} />
      ))}
      {[0, 1].map((i) => {
        const x = 170 + i * 200;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.2, 0.5))}>
            <line x1={x} y1={28} x2={x + 60} y2={28} stroke={C.line} />
            <rect x={x + 24} y={22} width={12} height={12} transform={`rotate(45 ${x + 30} 28)`} fill={place > 0 ? C.focus : C.panel} stroke={place > 0 ? C.focus : C.line} />
          </g>
        );
      })}
      {place > 0 && <rect x={436} y={48} width={128} height={6} rx={2} fill="none" stroke={C.focus} strokeDasharray="4 3" opacity={place} />}
      <T x={30} y={84} s={13} f={C.secondary} o={rules}>
        rules
      </T>
      <Box x={110} y={66} w={96} h={26} label="not null" o={rules} />
      <Box x={214} y={66} w={150} h={26} label="accepted values" o={easeOut(seg(t, 0.5, 0.9))} />
      <T x={30} y={134} s={13} f={C.secondary} o={stats}>
        stats
      </T>
      {band > 0 && <rect x={108} y={116} width={Math.max(0, 250 * band)} height={28} rx={3} fill={C.band} />}
      <Draw pts={spark} t={t} from={1.4} to={2.2} stroke={C.primary} w={1.5} pen={false} />
      {out > 0 && <circle cx={348} cy={106} r={4 * Math.min(1.3, out)} fill={C.badText} />}
      {place > 0 && (
        <g opacity={place}>
          <Box x={400} y={66} w={170} h={26} label="pipeline gate" lit />
          <Box x={400} y={116} w={170} h={26} label="post-hoc scan" dash="4 3" lit />
        </g>
      )}
      {COSTS.map(([l, v], i) => {
        const x = 30 + i * 190;
        const o = easeOut(seg(t, 2.5 + i * 0.15, 2.8 + i * 0.15));
        return (
          <g key={l} opacity={o}>
            <T x={x} y={186} s={13} f={C.secondary}>
              {l}
            </T>
            <rect x={x} y={194} width={150} height={8} rx={2} fill={C.band} />
            <rect x={x} y={194} width={Math.max(0, (v / 1000) * 150 * cost)} height={8} rx={2} fill={C.focus} />
            <T x={x} y={226} s={13} f={C.focus}>
              {Math.round(v * cost).toLocaleString('en-US')}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · orders_raw goes red; staleness runs down the lineage into forty dependents and the alert count climbs to 41.
// Then every dependent folds into one grouped alert, the count drops to 1, and it routes to the root's own owner.
export function RevealLineageRouting({ t }: StepCtx) {
  const root = easeOut(seg(t, 0.5, 0.8));
  const spread = seg(t, 0.9, 2.1);
  const fold = easeInOut(seg(t, 2.4, 3.3));
  const owner = easeOut(seg(t, 3.5, 3.9));
  const count = fold > 0 ? Math.round(lerp(41, 1, fold)) : Math.round(lerp(0, 41, spread));
  return (
    <Svg label="forty downstream tables collapse into one alert at the root" h={210}>
      <Box x={30} y={84} w={120} h={32} label="orders_raw" fill={root > 0.5 ? C.bad : undefined} stroke={root > 0.5 ? C.badText : undefined} f={root > 0.5 ? C.focus : undefined} o={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 40 }, (_, i) => {
        const c = i % 8;
        const r = Math.floor(i / 8);
        const x0 = 220 + c * 24;
        const y0 = 56 + r * 20;
        const lit = spread * 40 > c * 5 + r;
        const fx = lerp(x0, 470, fold);
        const fy = lerp(y0, 96, fold);
        return (
          <g key={i} opacity={easeOut(seg(t, 0.1, 0.4))}>
            {fold < 0.3 && <line x1={150} y1={100} x2={x0} y2={y0 + 5} stroke={lit ? C.badText : C.line} strokeWidth={0.6} opacity={(1 - fold / 0.3) * 0.6} />}
            {fold < 1 && <rect x={fx} y={fy} width={18} height={10} rx={2} fill={lit ? C.bad : C.band} stroke={lit ? C.badText : C.line} opacity={1 - fold * 0.8} />}
          </g>
        );
      })}
      {fold >= 1 && <Box x={455} y={84} w={120} h={32} label="one alert" lit />}
      {owner > 0 && (
        <g opacity={owner}>
          <line x1={515} y1={116} x2={515} y2={144} stroke={C.focus} strokeWidth={1.4} />
          <Box x={430} y={144} w={145} h={28} label="root's owner" lit />
        </g>
      )}
      <T x={575} y={36} s={14} f={fold > 0 ? C.focus : C.badText} a="end" o={easeOut(seg(t, 0.9, 1.1))}>
        {`alerts ${count}`}
      </T>
      <T x={220} y={36} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.6)) * (1 - fold)}>
        forty inherit it
      </T>
      <T x={30} y={198} s={13} f={C.secondary} o={easeOut(seg(t, 3.9, 4.3))}>
        not paged to everyone it reached
      </T>
    </Svg>
  );
}

// 5 · Three days, one failure each. Day 2's planned backfill gets a shaded window and its alert goes quiet: 3 alerts
// become 2. The fixed lower threshold flags every overnight dip until it bends with the schedule. Last, one owner's
// alerts queue against a rate limit.
export function RevealSuppression({ t }: StepCtx) {
  const win = easeOut(seg(t, 0.3, 0.8));
  const sup = easeOut(seg(t, 0.9, 1.3));
  const bend = easeInOut(seg(t, 2.0, 2.8));
  const rate = seg(t, 3.0, 4.4);
  const Y0 = 110;
  const curve = (x: number) => {
    const d = ((x - 30) / 180) % 1;
    const night = Math.exp(-Math.pow((d < 0.5 ? d : d - 1) / 0.08, 2));
    return Y0 - 30 + night * 26 + Math.sin(x / 9) * 2;
  };
  const pts = Array.from({ length: 55 }, (_, i) => [30 + i * 10, curve(30 + i * 10)] as [number, number]);
  const thr = (x: number) => {
    const d = ((x - 30) / 180) % 1;
    const night = Math.exp(-Math.pow((d < 0.5 ? d : d - 1) / 0.1, 2));
    return Y0 - 10 + night * 22 * bend;
  };
  const thrPts = Array.from({ length: 55 }, (_, i) => `${30 + i * 10},${thr(30 + i * 10)}`).join(' ');
  const dips = [210, 390];
  return (
    <Svg label="three named rules silence specific, expected noise" h={240}>
      {win > 0 && (
        <g opacity={win}>
          <rect x={210} y={30} width={180} height={96} fill={C.band} />
          <T x={300} y={46} s={13} f={C.secondary} a="middle">
            planned backfill
          </T>
        </g>
      )}
      <Draw pts={pts} t={t} from={0} to={0.6} stroke={C.primary} w={1.5} pen={false} />
      <polyline points={thrPts} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.6, 1.9))} />
      {dips.map((x) => {
        const fire = easeOut(seg(t, 1.8, 2.0)) * (1 - bend);
        return fire > 0 ? <circle key={x} cx={x} cy={curve(x)} r={4} fill={C.badText} opacity={fire} /> : null;
      })}
      {[0, 1, 2].map((d) => {
        const cx = 120 + d * 180;
        const quiet = d === 1 ? sup : 0;
        return (
          <g key={d} opacity={easeOut(seg(t, 0.1 + d * 0.1, 0.4 + d * 0.1))}>
            <rect x={cx - 9} y={62} width={18} height={14} rx={2} fill={quiet > 0.5 ? 'none' : C.focus} stroke={quiet > 0.5 ? C.quiet : C.focus} strokeDasharray={quiet > 0.5 ? '3 2' : undefined} />
            <T x={cx} y={146} s={13} f={C.secondary} a="middle">
              {`day ${d + 1}`}
            </T>
          </g>
        );
      })}
      <line x1={30} y1={126} x2={570} y2={126} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <Line2 y={176} l="backfill window" r={sup > 0.5 ? 'alerts 3 → 2' : 'alerts 3'} o={easeOut(seg(t, 0.8, 1.2))} />
      <Line2 y={202} l="overnight" r="threshold widens" rc={C.second} o={easeOut(seg(t, 2.0, 2.4))} />
      {rate > 0 && (
        <g>
          <Line2 y={228} l="per owner" r="rate limited" o={easeOut(seg(t, 3.0, 3.3))} />
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const k = easeOut(seg(rate, j * 0.12, j * 0.12 + 0.2));
            const held = j >= 3;
            return k > 0 ? <rect key={j} x={210 + j * 22} y={218} width={16} height={12} rx={2} fill={held ? 'none' : C.focus} stroke={held ? C.quiet : C.focus} opacity={k} /> : null;
          })}
          {rate > 0.4 && <line x1={275} y1={214} x2={275} y2={234} stroke={C.secondary} strokeWidth={2} />}
        </g>
      )}
    </Svg>
  );
}

// 6 · Left: an alert fires just outside a check's band; "noise" is marked and the band widens to hold it. Right: a
// failure starts, the old check catches it late, and a new check spawns right after the start.
export function RevealFeedbackLoop({ t }: StepCtx) {
  const mark = easeOutBack(seg(t, 0.8, 1.1));
  const widen = easeInOut(seg(t, 1.2, 1.9));
  const late = easeOut(seg(t, 2.4, 2.8));
  const spawn = easeInOut(seg(t, 3.2, 4.0));
  const spark = Array.from({ length: 11 }, (_, i) => [40 + i * 22, 90 + Math.sin(i * 1.1) * 5] as [number, number]);
  const half = lerp(18, 34, widen);
  return (
    <Svg label="marking noise tunes the check; a late catch spawns a new one" h={210}>
      <rect x={38} y={90 - half} width={222} height={half * 2} rx={3} fill={C.band} opacity={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={spark} t={t} from={0.1} to={0.6} stroke={C.primary} w={1.5} pen={false} />
      <circle cx={238} cy={64} r={4.5} fill={widen > 0.6 ? C.focus : C.badText} opacity={easeOut(seg(t, 0.5, 0.7))} />
      {mark > 0 && <Box x={60} y={134} w={150} h={26} label="this was noise" o={Math.min(1, mark)} lit={widen > 0} />}
      <T x={40} y={190} s={13} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        threshold widens
      </T>
      <line x1={330} y1={110} x2={570} y2={110} stroke={C.line} opacity={easeOut(seg(t, 1.9, 2.2))} />
      <circle cx={350} cy={110} r={5} fill={C.badText} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <T x={350} y={92} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        failure
      </T>
      {late > 0 && (
        <g opacity={late}>
          <rect x={354} y={106} width={Math.max(0, 186 * late)} height={8} fill={C.bad} opacity={0.6} />
          <circle cx={540} cy={110} r={6} fill="none" stroke={C.badText} strokeWidth={2} />
          <T x={570} y={92} s={13} f={C.badText} a="end">
            caught late
          </T>
        </g>
      )}
      {spawn > 0 && (
        <g>
          <circle cx={lerp(540, 380, spawn)} cy={110} r={6} fill={C.panel} stroke={C.focus} strokeWidth={2} />
          <T x={380} y={146} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
            a new, earlier check
          </T>
        </g>
      )}
    </Svg>
  );
}

// 7 · A token walks the five states; each one it reaches gets an owner and a clock. From reviewed, a path runs back
// into the check layer and writes the recorded cause there.
export function RevealIncidentWorkflow({ t }: StepCtx) {
  const ST = ['detected', 'triaged', 'contained', 'repaired', 'reviewed'];
  const walk = seg(t, 0.4, 3.0) * 4;
  const back = easeInOut(seg(t, 3.2, 4.0));
  const tok = Math.min(4, walk);
  const tokX = 30 + tok * 110 + 50;
  return (
    <Svg label="detected, triaged, contained, repaired, reviewed" h={240}>
      {ST.map((s, i) => {
        const x = 30 + i * 110;
        const reached = walk >= i - 0.05;
        const k = easeOut(seg(walk, i, i + 0.4));
        return (
          <g key={s}>
            <Box x={x} y={30} w={100} h={32} label={s} lit={reached} o={easeOut(seg(t, i * 0.08, 0.3 + i * 0.08))} />
            {i < 4 && <line x1={x + 100} y1={46} x2={x + 110} y2={46} stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.4))} />}
            {k > 0 && (
              <g opacity={k}>
                <T x={x + 50} y={90} s={13} f={C.secondary} a="middle">
                  owner
                </T>
                <circle cx={x + 50} cy={112} r={8} fill="none" stroke={C.focus} strokeWidth={1.3} />
                <line x1={x + 50} y1={112} x2={x + 50} y2={106} stroke={C.focus} strokeWidth={1.3} />
                <line x1={x + 50} y1={112} x2={x + 54} y2={114} stroke={C.focus} strokeWidth={1.3} />
              </g>
            )}
          </g>
        );
      })}
      {t > 0.4 && back < 1 && <circle cx={tokX} cy={30} r={5} fill={C.focus} />}
      <Box x={30} y={170} w={190} h={32} label="check layer" lit={back >= 1} o={easeOut(seg(t, 3.0, 3.3))} />
      <Draw pts={[[520, 126], [520, 186], [220, 186]]} t={t} from={3.2} to={4.0} stroke={C.focus} w={1.6} pen={false} />
      {back > 0 && back < 1 && <circle cx={back < 0.17 ? 520 : lerp(520, 220, (back - 0.17) / 0.83)} cy={back < 0.17 ? lerp(126, 186, back / 0.17) : 186} r={5} fill={C.focus} />}
      <T x={575} y={226} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.9, 4.3))}>
        a recorded cause, written back
      </T>
    </Svg>
  );
}

// 8 · The usual data SLO gauges, then precision slides in beside them, lit. Its own error budget burns down under it
// and its own burn-rate alert fires.
export function RevealPrecisionSLO({ t }: StepCtx) {
  const G: [string, number][] = [
    ['freshness', 0.82],
    ['volume', 0.74],
    ['precision', 0.42],
  ];
  const slide = easeInOut(seg(t, 0.8, 1.4));
  const burn = easeInOut(seg(t, 2.0, 3.2));
  const fire = easeOutBack(seg(t, 3.3, 3.6));
  return (
    <Svg label="precision sits beside the data SLOs, with its own burn rate" h={210}>
      {G.map(([l, p], i) => {
        const cx = 110 + i * 190;
        const isP = i === 2;
        const o = isP ? slide : easeOut(seg(t, i * 0.15, 0.4 + i * 0.15));
        const dx = isP ? lerp(60, 0, slide) : 0;
        return (
          <g key={l} transform={`translate(${dx} 0)`}>
            <Gauge cx={cx} cy={90} r={48} p={isP ? p * slide : p * easeOut(seg(t, 0.2, 0.8))} lit={isP} o={o} />
            <T x={cx} y={120} s={13} f={isP ? C.focus : C.secondary} a="middle" o={o}>
              {l}
            </T>
          </g>
        );
      })}
      {burn > 0 && (
        <g>
          <T x={420} y={153} s={13} f={C.secondary} a="end">
            error budget
          </T>
          <rect x={430} y={143} width={140} height={10} rx={2} fill={C.band} />
          <rect x={430} y={143} width={Math.max(0, 140 * (1 - 0.8 * burn))} height={10} rx={2} fill={burn > 0.7 ? C.badText : C.focus} />
        </g>
      )}
      {fire > 0 && <Box x={425} y={166} w={150} h={28} label="burn-rate alert" stroke={C.badText} f={C.badText} o={Math.min(1, fire)} />}
      <T x={30} y={186} s={13} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        a number for its own usefulness
      </T>
    </Svg>
  );
}

// 9 · Four rows, each drawn with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['two check layers', 'costed and placed'],
    ['lineage routing', 'one owner'],
    ['suppression', 'named, scoped', C.second],
    ['precision', 'its own SLO'],
  ];
  return (
    <Svg label="two check layers, grouped routing, suppression, and a precision SLO" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 50 + i * 65;
        const at = i * 0.8;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <rect x={30} y={y - 14} width={78} height={6} rx={2} fill={C.focus} />
                <rect x={30} y={y - 4} width={40} height={6} rx={2} fill={C.quiet} />
              </g>
            )}
            {i === 1 && (
              <g>
                {[0, 1, 2, 3].map((j) => (
                  <line key={j} x1={34} y1={y - 18 + j * 6} x2={96} y2={y - 8} stroke={C.line} />
                ))}
                <circle cx={100} cy={y - 8} r={5} fill={C.focus} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={52} y={y - 20} width={30} height={24} fill={C.band} />
                <line x1={30} y1={y - 8} x2={108} y2={y - 8} stroke={C.second} strokeDasharray="4 3" />
              </g>
            )}
            {i === 3 && (
              <g>
                <path d={`M40 ${y} A30 30 0 0 1 100 ${y}`} fill="none" stroke={C.band} strokeWidth={5} />
                <path d={`M40 ${y} A30 30 0 0 1 70 ${y - 30}`} fill="none" stroke={C.focus} strokeWidth={5} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · The forty dependents multiply to 400. After the answer: a walk sweeps the whole lineage graph, the 400 still
// fold into one alert, and the cost of that walk is named as the next bottleneck.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const grow = easeInOut(seg(t, 0.5, 1.8));
  const sweep = on ? easeInOut(seg(s, 0.3, 1.6)) : 0;
  const fold = on ? easeInOut(seg(s, 1.7, 2.4)) : 0;
  const name = on ? easeOut(seg(s, 2.4, 2.8)) : 0;
  const shown = Math.round(lerp(40, 400, grow));
  return (
    <Svg label="ten times the tables; the same failure now reaches many more" h={250}>
      <Box x={30} y={94} w={120} h={32} label="orders_raw" fill={C.bad} stroke={C.badText} f={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 400 }, (_, i) => {
        if (i >= shown) return null;
        const c = i % 20;
        const r = Math.floor(i / 20);
        const x0 = 196 + c * 11;
        const y0 = 32 + r * 8;
        const walked = on && c / 20 < sweep;
        if (fold >= 1) return null;
        return <rect key={i} x={lerp(x0, 490, fold)} y={lerp(y0, 106, fold)} width={7} height={5} fill={walked ? C.focus : C.bad} opacity={1 - fold * 0.8} />;
      })}
      {on && sweep > 0 && sweep < 1 && <line x1={196 + sweep * 220} y1={26} x2={196 + sweep * 220} y2={196} stroke={C.focus} strokeWidth={1.5} />}
      {fold >= 1 && <Box x={420} y={94} w={155} h={32} label="still one alert" lit />}
      <T x={575} y={44} s={14} f={C.focus} a="end" o={easeOut(seg(t, 0.4, 0.7)) * (1 - fold)}>
        {`${shown} downstream`}
      </T>
      {on ? (
        <T x={300} y={232} s={14} f={C.focus} a="middle" o={name}>
          next bottleneck: the lineage walk
        </T>
      ) : (
        <T x={300} y={232} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
          the same failure, ten times the reach
        </T>
      )}
    </Svg>
  );
}
