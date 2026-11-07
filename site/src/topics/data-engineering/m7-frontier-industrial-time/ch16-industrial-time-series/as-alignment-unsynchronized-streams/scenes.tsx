import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// As-of alignment: sparse temperature over dense pressure, equal-time links against as-of links, a tolerance window
// squeezed under the clock offset, the null-rate curve, step against interpolation on a ramp, and two press lanes.

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

// examples.py's first three minutes: pressure every 10 s, temperature every 60 s, across x 60..540.
const sx = (sec: number) => 60 + sec * (480 / 180);
const PRESS = Array.from({ length: 19 }, (_, i) => i * 10);
const TEMP = [0, 60, 120, 180];
const lastTemp = (sec: number) => Math.floor(sec / 60) * 60;

/** The two series as rows of dots: temperature (sparse, top) and pressure (dense, bottom). */
function Rows({ ty, py, o, tempColor = C.second }: { ty: number; py: number; o: number; tempColor?: string }) {
  return o <= 0 ? null : (
    <g opacity={o}>
      <line x1={60} y1={ty} x2={540} y2={ty} stroke={C.line} />
      <line x1={60} y1={py} x2={540} y2={py} stroke={C.line} />
      {TEMP.map((s) => (
        <circle key={`t${s}`} cx={sx(s)} cy={ty} r={6} fill={tempColor} />
      ))}
      {PRESS.map((s) => (
        <circle key={`p${s}`} cx={sx(s)} cy={py} r={3} fill={C.primary} />
      ))}
    </g>
  );
}

// 1 · Equal timestamps first: only the four pressure dots that share a second with a temperature dot get a link; every
// other one gets a red null tick (7 of 40 matched over the full series). Then no tolerance: every dot links back to the
// last temperature, 40 of 40 — and the longest link lights up, its age never checked.
export function Hook({ t }: StepCtx) {
  const eq = easeOut(seg(t, 0.6, 1.4));
  const asof = easeInOut(seg(t, 2.6, 3.6));
  const old = easeOut(seg(t, 4.0, 4.5));
  return (
    <Svg label="a root-cause query joined on equal timestamps returns almost nothing; joined with no tolerance it returns a value for every row, one of them nearly an hour old" h={200}>
      <Rows ty={50} py={130} o={easeOut(seg(t, 0, 0.4))} />
      <T x={60} y={30} s={12} f={C.second} o={easeOut(seg(t, 0, 0.4))}>
        oven temperature
      </T>
      <T x={60} y={156} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        thickness readings
      </T>
      {PRESS.map((s) => {
        const hit = s % 60 === 0;
        if (asof > 0) {
          const k = Math.min(1, asof * 1.2);
          const lt = lastTemp(s);
          const isOld = s === 170;
          return (
            <line
              key={s}
              x1={sx(s)}
              y1={126}
              x2={lerp(sx(s), sx(lt), k)}
              y2={lerp(126, 56, k)}
              stroke={isOld && old > 0 ? C.badText : C.secondary}
              strokeWidth={isOld && old > 0 ? 2.2 : 1}
              opacity={0.8}
            />
          );
        }
        return hit ? (
          <line key={s} x1={sx(s)} y1={126} x2={sx(s)} y2={lerp(126, 56, eq)} stroke={C.focus} strokeWidth={1.6} />
        ) : (
          <T key={s} x={sx(s)} y={110} s={13} f={C.badText} a="middle" o={eq * (1 - easeOut(seg(t, 2.4, 2.6)))}>
            ∅
          </T>
        );
      })}
      <T x={575} y={186} s={14} f={asof > 0 ? C.focus : C.badText} a="end" o={easeOut(seg(t, 1.2, 1.6))}>
        {asof > 0.5 ? 'no tolerance: 40 of 40' : 'equal times: 7 of 40'}
      </T>
      <T x={30} y={186} s={12} f={C.badText} o={old}>
        age never checked
      </T>
    </Svg>
  );
}

// 2 · A cursor sweeps left to right. Each pressure dot it reaches sends a link back up to the last temperature at or
// before it; the links fan out from each temperature dot like a comb.
export function RevealAsofJoin({ t }: StepCtx) {
  const sweep = seg(t, 0.8, 3.8) * 180;
  return (
    <Svg label="for each dense pressure reading, the as-of join takes the last temperature reading at or before it — the same join mechanism, now matching two sensors" h={200}>
      <Rows ty={50} py={140} o={easeOut(seg(t, 0, 0.4))} />
      <T x={60} y={30} s={12} f={C.second} o={easeOut(seg(t, 0, 0.4))}>
        temperature, every 60 s
      </T>
      <T x={60} y={168} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        pressure, every 10 s
      </T>
      {PRESS.filter((s) => s <= sweep).map((s) => (
        <path key={s} d={`M${sx(s)} 136 C ${sx(s)} 96, ${sx(lastTemp(s))} 96, ${sx(lastTemp(s))} 56`} fill="none" stroke={C.focus} strokeWidth={1.2} opacity={0.75} />
      ))}
      {sweep > 0 && sweep < 180 && <line x1={sx(sweep)} y1={36} x2={sx(sweep)} y2={152} stroke={C.focus} strokeWidth={1} opacity={0.5} />}
      <T x={300} y={194} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        last value at or before
      </T>
    </Svg>
  );
}

// The tolerance window drawn behind one pressure dot: a band reaching back `tol` seconds.
const Window = ({ s, tol, y, color, o = 1 }: { s: number; tol: number; y: number; color: string; o?: number }) => (
  <rect x={sx(s - tol)} y={y} width={sx(s) - sx(s - tol)} height={14} fill={color} opacity={0.35 * o} />
);

// 3 · The two clocks disagree by 15 s: a pale-blue band shows the offset. The tolerance window behind a pressure
// reading at 75 s starts at 15 s wide and is squeezed to 14 s. After the answer, matches it could have made at 70 s
// and 80 s flicker out red — tighter only loses.
export function PredictTolerance({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const squeeze = easeInOut(seg(t, 1.6, 2.6));
  const tol = lerp(15, 14, squeeze);
  return (
    <Svg label="the two sensors' clocks disagree by a known offset — setting the tolerance tighter than that offset, does the join get more accurate?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={60} y={36} s={13} f={C.second}>
          clocks disagree by 15 s
        </T>
        <rect x={sx(60)} y={60} width={sx(75) - sx(60)} height={14} fill={C.second} opacity={0.5} />
        <line x1={60} y1={67} x2={540} y2={67} stroke={C.line} />
        <circle cx={sx(60)} cy={67} r={6} fill={C.second} />
        <circle cx={sx(120)} cy={67} r={6} fill={C.second} />
      </g>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <line x1={60} y1={120} x2={540} y2={120} stroke={C.line} />
        {PRESS.map((p) => (
          <circle key={p} cx={sx(p)} cy={120} r={3} fill={C.primary} />
        ))}
        <Window s={75} tol={tol} y={113} color={C.focus} />
        <circle cx={sx(75)} cy={120} r={5} fill={C.focus} />
      </g>
      <T x={sx(75)} y={150} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        {`tolerance ${tol.toFixed(0)} s`}
      </T>
      {!on ? (
        <T x={300} y={188} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
          more accurate?
        </T>
      ) : (
        <g>
          <T x={60} y={176} s={13} f={C.focus} o={easeOut(seg(s, 0.2, 0.5))}>
            15 s: 65% unmatched
          </T>
          <T x={540} y={176} s={13} f={C.badText} a="end" o={easeOut(seg(s, 0.5, 0.8))}>
            14 s: 65% unmatched
          </T>
          <T x={300} y={198} s={12} f={C.badText} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
            tighter only loses
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · Two runs side by side, tolerance 15 s (at the offset) and 14 s (under it). Each fills a null-rate bar: 65% and
// 65%. The under-offset bar never comes in lower — nothing gained, and the dots it dropped light red.
export function RevealBelowOffset({ t }: StepCtx) {
  const rows: [string, number][] = [
    ['at the offset, 15 s', 0.65],
    ['under it, 14 s', 0.65],
  ];
  return (
    <Svg label="a tolerance set under the clock offset excludes at least as many matches as one set at the offset — nothing gained, real matches lost" h={200}>
      <T x={30} y={28} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        rows left unmatched
      </T>
      {rows.map(([l, v], i) => {
        const y = 56 + i * 56;
        const k = easeInOut(seg(t, 0.6 + i * 1.0, 1.6 + i * 1.0));
        return (
          <g key={l} opacity={easeOut(seg(t, 0.2 + i * 1.0, 0.6 + i * 1.0))}>
            <T x={30} y={y + 5} s={14} f={C.primary}>
              {l}
            </T>
            <rect x={300} y={y - 9} width={200} height={18} fill={C.band} />
            <rect x={300} y={y - 9} width={200 * v * k} height={18} fill={C.badText} />
            <T x={575} y={y + 5} s={15} f={C.badText} a="end">
              {`${Math.round(65 * k)}%`}
            </T>
          </g>
        );
      })}
      <line x1={300 + 200 * 0.65} y1={36} x2={300 + 200 * 0.65} y2={132} stroke={C.focus} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.8, 3.2))} />
      <T x={300} y={180} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
        nothing gained
      </T>
    </Svg>
  );
}

// 5 · Null rate against tolerance, tolerance shrinking left to right: 120 s and 61 s at 0%, then 30 s 30%, 15 s 65%,
// 5 s 82.5%. A post marks the 60 s report period. A badge confirms pandas and DuckDB agree row for row.
const NR: [number, number][] = [
  [120, 0],
  [61, 0],
  [30, 0.3],
  [15, 0.65],
  [5, 0.825],
];
const nx = (tol: number) => 540 - (tol / 120) * 390;
const ny = (r: number) => 170 - r * 130;
export function RevealNullRate({ t }: StepCtx) {
  return (
    <Svg label="DuckDB and pandas agree on every joined row; as tolerance shrinks past the signal's own report period, the null rate climbs from zero" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={100} y1={170} x2={540} y2={170} stroke={C.line} />
        <line x1={100} y1={30} x2={100} y2={170} stroke={C.line} />
        <T x={92} y={174} s={12} f={C.quiet} a="end">
          0%
        </T>
        <T x={92} y={ny(0.825) + 4} s={12} f={C.quiet} a="end">
          82.5%
        </T>
        <T x={540} y={190} s={12} f={C.quiet} a="end">
          tolerance shrinks →
        </T>
      </g>
      <line x1={nx(60)} y1={30} x2={nx(60)} y2={170} stroke={C.second} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={nx(60) + 6} y={24} s={12} f={C.second} o={easeOut(seg(t, 0.4, 0.8))}>
        report period, 60 s
      </T>
      <Draw pts={NR.map(([a, b]) => [nx(a), ny(b)] as [number, number])} t={t} from={0.8} to={3.0} stroke={C.badText} w={2} pen={false} />
      {NR.map(([a, b], i) => (
        <g key={a} opacity={easeOutBack(seg(t, 0.8 + i * 0.5, 1.1 + i * 0.5))}>
          <circle cx={nx(a)} cy={ny(b)} r={5} fill={b > 0 ? C.badText : C.focus} />
          <T x={nx(a)} y={ny(b) - 10} s={12} f={C.secondary} a="middle">
            {`${a} s`}
          </T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 3.6, 4.0))}>
        <rect x={110} y={64} width={180} height={28} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={200} y={83} s={13} f={C.focus} a="middle">
          pandas = DuckDB
        </T>
      </g>
      <Tick x={306} y={78} k={easeOut(seg(t, 4.0, 4.4))} />
    </Svg>
  );
}

// 6 · A known ramp: 200 at 0 s, 205 at 60 s, 210 at 120 s. A query at 90 s. The backward match draws a flat step from
// 205; interpolation draws a line from 205 to 210 and lands on 207.5 — and a forward arrow shows the 30 s it had to see
// ahead.
const rx = (sec: number) => 60 + sec * 3.4;
const ry = (v: number) => 160 - (v - 198) * 9;
export function RevealStepVsInterpolated({ t }: StepCtx) {
  const ahead = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="on a known ramp, a backward match holds a flat stale value while interpolating between the sample before and after recovers the true value, at the cost of looking ahead" h={200}>
      <Draw
        pts={[
          [rx(0), ry(200)],
          [rx(140), ry(211.67)],
        ]}
        t={t}
        from={0}
        to={0.6}
        stroke={C.line}
        w={1.2}
        pen={false}
      />
      {[
        [0, 200],
        [60, 205],
        [120, 210],
      ].map(([s, v], i) => (
        <g key={s} opacity={easeOutBack(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))}>
          <circle cx={rx(s)} cy={ry(v)} r={6} fill={C.second} />
          <T x={rx(s)} y={ry(v) + 24} s={12} f={C.second} a="middle">
            {String(v)}
          </T>
        </g>
      ))}
      <line x1={rx(90)} y1={20} x2={rx(90)} y2={176} stroke={C.focus} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={rx(90)} y={192} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        query at 90 s
      </T>
      <Draw
        pts={[
          [rx(60), ry(205)],
          [rx(90), ry(205)],
        ]}
        t={t}
        from={1.2}
        to={1.8}
        stroke={C.primary}
        w={2.4}
        pen={false}
      />
      <T x={rx(90) + 10} y={ry(205) + 18} s={13} f={C.primary} o={easeOut(seg(t, 1.8, 2.1))}>
        step: 205
      </T>
      <Draw
        pts={[
          [rx(60), ry(205)],
          [rx(90), ry(207.5)],
        ]}
        t={t}
        from={2.4}
        to={3.0}
        stroke={C.focus}
        w={2.4}
        pen={false}
      />
      <circle cx={rx(90)} cy={ry(207.5)} r={5} fill={C.focus} opacity={easeOut(seg(t, 3.0, 3.2))} />
      <T x={rx(90) - 10} y={ry(207.5) - 8} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        interpolated: 207.5
      </T>
      {ahead > 0 && <path d={`M${rx(90)} ${ry(212) - 2} H${lerp(rx(90), rx(120), ahead)}`} stroke={C.badText} strokeWidth={2} />}
      {ahead > 0.9 && <path d={`M${rx(120)} ${ry(212) - 2} l-8 -5 v10 z`} fill={C.badText} />}
      <T x={rx(90) + 6} y={ry(212) - 10} s={13} f={C.badText} o={easeOut(seg(t, 4.0, 4.4))}>
        needs 30 s ahead
      </T>
    </Svg>
  );
}

// 7 · Two presses, two lanes. Without the key, the line-7 pressure reading at 50 s looks for the nearest earlier
// temperature anywhere — and grabs line 4's, a red link with no error. With the key, it reaches its own lane's: ticked.
export function RevealPartitionKey({ t }: StepCtx) {
  const bad = easeInOut(seg(t, 1.0, 1.8));
  const good = easeInOut(seg(t, 2.8, 3.6));
  const lanes: [string, number][] = [
    ['line 4', 50],
    ['line 7', 130],
  ];
  return (
    <Svg label="without a per-equipment partition key, one equipment's pressure reading can quietly borrow another equipment's nearest temperature value" h={200}>
      {lanes.map(([l, y]) => (
        <g key={l} opacity={easeOut(seg(t, 0, 0.4))}>
          <T x={30} y={y + 5} s={13} f={C.primary}>
            {l}
          </T>
          <line x1={110} y1={y} x2={560} y2={y} stroke={C.line} />
          <rect x={110 + 40 * 3.2} y={y - 8} width={14} height={14} rx={2} fill={C.second} transform={l === 'line 4' ? undefined : `translate(-60 0)`} />
        </g>
      ))}
      <circle cx={110 + 50 * 3.2 + 40} cy={130} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.8))} />
      {bad > 0 && <line x1={310} y1={124} x2={lerp(310, 245, bad)} y2={lerp(124, 54, bad)} stroke={C.badText} strokeWidth={1.8} strokeDasharray="5 3" opacity={1 - 0.6 * good} />}
      <T x={340} y={96} s={13} f={C.badText} o={easeOut(seg(t, 1.8, 2.2)) * (1 - 0.6 * good)}>
        borrowed, no error
      </T>
      {good > 0 && <line x1={310} y1={130} x2={lerp(310, 189, good)} y2={130} stroke={C.focus} strokeWidth={2} />}
      <T x={300} y={180} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        with the key: its own press
      </T>
      <Tick x={460} y={174} k={easeOut(seg(t, 3.9, 4.3))} />
    </Svg>
  );
}

// 8 · Four rows, each with a glyph: a backward link, a squeezed window, a forward look, and two lanes kept apart.
const GLYPH = [
  (k: number) => <path d={`M100 4 C 100 -10, ${lerp(100, 40, k)} -10, ${lerp(100, 40, k)} -14`} fill="none" stroke={C.focus} strokeWidth={1.6} />,
  (k: number) => (
    <g>
      <rect x={lerp(40, 60, k)} y={-12} width={lerp(60, 40, k)} height={12} fill={C.focus} opacity={0.35} />
      <circle cx={100} cy={-6} r={4} fill={C.focus} />
    </g>
  ),
  (k: number) => (
    <g>
      <circle cx={50} cy={-6} r={4} fill={C.focus} />
      <path d={`M50 -6 H${lerp(50, 100, k)}`} stroke={C.badText} strokeWidth={1.8} />
    </g>
  ),
  (k: number) => (
    <g>
      <line x1={30} y1={-12} x2={110} y2={-12} stroke={C.line} />
      <line x1={30} y1={2} x2={110} y2={2} stroke={C.line} />
      <path d={`M90 2 L${lerp(90, 50, k)} 2`} stroke={C.focus} strokeWidth={2} />
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = ['last value at or before', 'under the offset: no gain', 'interpolation looks ahead', 'the partition key is correctness'];
  return (
    <Svg label="an as-of join takes the last value at or before, a too-tight tolerance helps nothing, interpolation costs a look-ahead, and a partition key is required for correctness" h={260}>
      {rows.map((r, i) => {
        const a = 0.3 + i * 1.1;
        const o = easeOut(seg(t, a, a + 0.4));
        const k = easeOut(seg(t, a + 0.2, a + 0.9));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${50 + i * 56})`}>
            {GLYPH[i](k)}
            <T x={130} y={0} s={14} f={C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · A join with no tolerance and no key: every row links somewhere, the null counter sits at 0. After the answer the
// links that went stale or crossed presses turn red: zero nulls only because it could never say "no match".
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const red = on ? easeOut(seg(s, 0.3, 0.9)) : 0;
  const links = [
    [100, 60, false],
    [170, 140, false],
    [250, 140, true],
    [330, 300, false],
    [410, 300, true],
    [500, 300, true],
  ] as const;
  return (
    <Svg label="a pipeline's as-of join has no tolerance and no partition key and has never once returned a null — is that a sign the join is working well?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <line x1={60} y1={50} x2={540} y2={50} stroke={C.line} />
        <line x1={60} y1={130} x2={540} y2={130} stroke={C.line} />
        {[60, 140, 300].map((x) => (
          <circle key={x} cx={x} cy={50} r={6} fill={C.second} />
        ))}
      </g>
      {links.map(([x, to, wrong], i) => {
        const k = easeInOut(seg(t, 0.4 + i * 0.15, 0.8 + i * 0.15));
        return k <= 0 ? null : (
          <g key={x}>
            <circle cx={x} cy={130} r={4} fill={C.primary} />
            <line x1={x} y1={126} x2={lerp(x, to, k)} y2={lerp(126, 56, k)} stroke={wrong && red > 0 ? C.badText : C.secondary} strokeWidth={wrong && red > 0 ? 2 : 1.2} />
          </g>
        );
      })}
      <T x={575} y={24} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        nulls: 0
      </T>
      {on ? (
        <T x={300} y={180} s={13} f={C.badText} a="middle" o={easeOut(seg(s, 0.8, 1.2))}>
          it can never say no match
        </T>
      ) : (
        <T x={300} y={180} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
          working well?
        </T>
      )}
    </Svg>
  );
}
