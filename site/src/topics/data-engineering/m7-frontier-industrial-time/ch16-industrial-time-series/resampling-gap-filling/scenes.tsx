import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Resampling and gap filling: a flat line across an outage, three signal types and their aggregates, two states
// averaged into a 1.5 that no lane holds, two fills that both bury a 240 °C excursion, and flagged five-minute cells.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

// examples.py's six hours, 00:00–06:00, across x 60..540 (80 px an hour). The outage runs 01:00–05:00.
const hx = (h: number) => 60 + h * 80;

/** The outage band with its label. */
function Outage({ y0, y1, o, label = true }: { y0: number; y1: number; o: number; label?: boolean }) {
  return o <= 0 ? null : (
    <g opacity={o}>
      <rect x={hx(1)} y={y0} width={hx(5) - hx(1)} height={y1 - y0} fill={C.band} />
      <line x1={hx(1)} y1={y0} x2={hx(1)} y2={y1} stroke={C.line} strokeDasharray="3 3" />
      <line x1={hx(5)} y1={y0} x2={hx(5)} y2={y1} stroke={C.line} strokeDasharray="3 3" />
      {label && (
        <T x={hx(3)} y={y0 + 16} s={12} f={C.quiet} a="middle">
          sensor offline, 01:00 to 05:00
        </T>
      )}
    </g>
  );
}

// 1 · The dashboard's line draws steady at 210 °C straight across six hours. Then the outage band rises behind it, and
// the four hours inside the band restyle as what they are: one reading, carried forward.
export function Hook({ t }: StepCtx) {
  const band = easeOut(seg(t, 2.0, 2.6));
  const restyle = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="an oven dashboard shows a flat line through a four-hour network outage — the sensor was down the whole time, and the flat line is the last known reading carried forward" h={200}>
      <Outage y0={40} y1={150} o={band} />
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={150} x2={540} y2={150} stroke={C.line} />
        {[0, 1, 2, 3, 4, 5, 6].map((h) => (
          <T key={h} x={hx(h)} y={168} s={12} f={C.quiet} a="middle">
            {`0${h}:00`}
          </T>
        ))}
        <T x={60} y={24} s={13} f={C.secondary}>
          oven, 210 °C
        </T>
      </g>
      <Draw
        pts={[
          [hx(0), 100],
          [hx(6), 100],
        ]}
        t={t}
        from={0.3}
        to={1.8}
        stroke={C.focus}
        w={2.4}
        pen={false}
      />
      {restyle > 0 && (
        <g opacity={restyle}>
          <line x1={hx(1)} y1={100} x2={hx(5)} y2={100} stroke={C.ink} strokeWidth={4} />
          <line x1={hx(1)} y1={100} x2={hx(5)} y2={100} stroke={C.second} strokeWidth={2} strokeDasharray="7 5" />
          <circle cx={hx(1)} cy={100} r={5} fill={C.focus} />
          <T x={hx(3)} y={90} s={13} f={C.second} a="middle">
            one reading, carried
          </T>
        </g>
      )}
      <T x={300} y={194} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.5))}>
        steady line, silent sensor
      </T>
    </Svg>
  );
}

// 2 · Three rows, three kinds of number: a wavy continuous trace, a stepped state code, a climbing counter. Each one
// draws, then an arrow lands it on its own aggregate: mean, last value, difference.
const WAVE: [number, number][] = Array.from({ length: 31 }, (_, i) => [160 + i * 7, -7 * Math.sin(i * 0.7)]);
const STEPS: [number, number][] = [
  [160, 4],
  [210, 4],
  [210, -8],
  [270, -8],
  [270, 4],
  [330, 4],
  [330, 10],
  [370, 10],
];
const RAMP: [number, number][] = [
  [160, 10],
  [370, -12],
];
export function RevealSignalType({ t }: StepCtx) {
  const rows: [string, [number, number][], string][] = [
    ['continuous', WAVE, 'mean'],
    ['state code', STEPS, 'last value'],
    ['counter', RAMP, 'difference'],
  ];
  return (
    <Svg label="a continuous reading, a machine-state code and an energy counter are three different kinds of number, each needing a different aggregate" h={220}>
      {rows.map(([l, pts, agg], i) => {
        const y = 44 + i * 66;
        const from = 0.3 + i * 1.1;
        return (
          <g key={l}>
            <T x={30} y={y + 5} s={14} f={C.primary} o={easeOut(seg(t, from - 0.2, from + 0.1))}>
              {l}
            </T>
            <Draw pts={pts.map(([x, dy]) => [x, y + dy] as [number, number])} t={t} from={from} to={from + 0.6} stroke={i === 0 ? C.focus : i === 1 ? C.primary : C.second} w={1.8} pen={false} />
            <Draw
              pts={[
                [385, y],
                [425, y],
              ]}
              t={t}
              from={from + 0.6}
              to={from + 0.8}
              stroke={C.line}
              w={1.4}
            />
            <Box x={430} y={y - 15} w={140} h={30} label={agg} lit o={easeOutBack(seg(t, from + 0.7, from + 1.0))} />
          </g>
        );
      })}
    </Svg>
  );
}

// State lanes: idle 0, running 1, fault 2.
const sy = (code: number) => 150 - code * 50;
function Lanes({ o }: { o: number }) {
  return (
    <g opacity={o}>
      {(['idle 0', 'running 1', 'fault 2'] as const).map((l, i) => (
        <g key={l}>
          <line x1={150} y1={sy(i)} x2={560} y2={sy(i)} stroke={C.line} strokeDasharray="4 4" />
          <T x={140} y={sy(i) + 5} s={13} f={C.secondary} a="end">
            {l}
          </T>
        </g>
      ))}
    </g>
  );
}

// 3 · The state lanes. A bucket box sits over 01:40–01:55; two event dots drop into it, one on fault 2 and one on
// running 1. Before the answer: "mean = ?". After it, the two dots slide together and meet at 1.5, between lanes, red.
export function PredictStateMean({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const meet = on ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="a bucket holds a state-1 reading and a state-2 reading — averaged like a temperature, what does the bucket report?" h={200}>
      <Lanes o={easeOut(seg(t, 0, 0.4))} />
      <rect x={300} y={34} width={140} height={132} rx={5} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={370} y={186} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        one bucket
      </T>
      <circle cx={lerp(330, 370, meet)} cy={lerp(sy(2), sy(1.5), meet)} r={7} fill={meet > 0.95 ? C.badText : C.focus} opacity={easeOutBack(seg(t, 1.2, 1.6))} />
      <circle cx={lerp(410, 370, meet)} cy={lerp(sy(1), sy(1.5), meet)} r={7} fill={meet > 0.95 ? C.badText : C.focus} opacity={easeOutBack(seg(t, 1.6, 2.0)) * (meet > 0.95 ? 0 : 1)} />
      {!on ? (
        <T x={455} y={sy(1.5) + 5} s={14} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
          mean = ?
        </T>
      ) : (
        <T x={455} y={sy(1.5) + 5} s={14} f={C.badText} o={easeOut(seg(s, 0.8, 1.2))}>
          1.5
        </T>
      )}
    </Svg>
  );
}

// 4 · The two codes as numbers, 2 and 1, add and halve into 1.5. The 1.5 drops onto the lanes, lands between running
// and fault where no lane exists, and is crossed out.
export function RevealWrongAggregate({ t }: StepCtx) {
  const drop = easeIn(seg(t, 1.8, 2.6));
  return (
    <Svg label="state 1 and state 2 land in the same bucket; their mean is 1.5, a state no machine was ever in" h={200}>
      <Lanes o={easeOut(seg(t, 0, 0.4))} />
      <T x={370} y={26} s={16} f={C.primary} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        (2 + 1) ÷ 2
      </T>
      <T x={505} y={26} s={16} f={C.badText} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        = 1.5
      </T>
      {drop > 0 && <circle cx={505} cy={lerp(30, sy(1.5), drop)} r={7} fill={C.badText} />}
      <Cross x={535} y={sy(1.5)} k={easeOutBack(seg(t, 2.8, 3.2))} />
      <T x={300} y={sy(1.5) + 5} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        no such state
      </T>
    </Svg>
  );
}

// 5 · Three buckets, three right answers. Six temperature samples at 240 settle into a mean bar: 240. A fault event
// carries its 2 forward across the bucket. The counter's two end readings, 100.0 and 100.4, bracket a difference of 0.4.
export function RevealRightAggregate({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.4, 1.4));
  const r2 = easeInOut(seg(t, 1.8, 2.8));
  const r3 = easeOut(seg(t, 3.2, 4.2));
  return (
    <Svg label="a continuous reading resamples to a mean, a state code carries forward its last value, a counter resamples to the difference of its end values" h={260}>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, i * 1.4, 0.4 + i * 1.4))}>
          <rect x={200} y={20 + i * 80} width={220} height={60} rx={5} fill="none" stroke={C.line} />
          <T x={30} y={55 + i * 80} s={14} f={C.primary}>
            {['temperature', 'state code', 'counter'][i]}
          </T>
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={220 + i * 36} cy={lerp(30 + (i % 3) * 12, 50, r1)} r={4} fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      {r1 >= 1 && <line x1={210} y1={50} x2={410} y2={50} stroke={C.focus} strokeWidth={2} />}
      <T x={575} y={56} s={15} f={C.focus} a="end" o={easeOut(seg(t, 1.2, 1.6))}>
        mean 240
      </T>
      <circle cx={214} cy={130} r={5} fill={C.primary} opacity={easeOut(seg(t, 1.6, 1.9))} />
      {r2 > 0 && <line x1={214} y1={130} x2={lerp(214, 410, r2)} y2={130} stroke={C.primary} strokeWidth={2} />}
      <T x={575} y={136} s={15} f={C.focus} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        last value 2
      </T>
      <g opacity={easeOut(seg(t, 3.0, 3.3))}>
        <circle cx={214} cy={222} r={5} fill={C.second} />
        <circle cx={406} cy={198} r={5} fill={C.second} />
        <T x={214} y={252} s={12} f={C.secondary} a="middle">
          100.0
        </T>
        <T x={406} y={190} s={12} f={C.secondary} a="middle">
          100.4
        </T>
      </g>
      {r3 > 0 && <path d={`M430 222 h8 v${-24 * r3} h-8`} fill="none" stroke={C.second} strokeWidth={1.6} />}
      <T x={575} y={216} s={15} f={C.second} a="end" o={easeOut(seg(t, 3.8, 4.2))}>
        diff 0.4
      </T>
    </Svg>
  );
}

// 6 · Two lanes over the same outage, each with the real 240 °C excursion (02:15–02:45) drawn as a pale ghost. Top:
// carry-forward holds 210 from the last reading. Bottom: interpolation joins 210 to 210. Both lines pass under the
// excursion; both get a ✕.
const ty = (top: number, v: number) => top + 70 - (v - 210) * 1.6;
export function RevealTwoFillsLie({ t }: StepCtx) {
  return (
    <Svg label="a real 30-degree excursion happens during the outage; carrying the last value forward and interpolating across the gap both independently hide it" h={220}>
      {[0, 1].map((i) => {
        const top = 10 + i * 104;
        const from = 0.6 + i * 1.6;
        const exc = easeOut(seg(t, 0.3, 0.7));
        return (
          <g key={i}>
            <Outage y0={top} y1={top + 90} o={easeOut(seg(t, 0, 0.3))} label={false} />
            <path d={`M${hx(2.25)} ${ty(top, 210)} V${ty(top, 240)} H${hx(2.75)} V${ty(top, 210)}`} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="4 3" opacity={exc} />
            <line x1={hx(0)} y1={ty(top, 210)} x2={hx(1)} y2={ty(top, 210)} stroke={C.focus} strokeWidth={2} opacity={exc} />
            <line x1={hx(5)} y1={ty(top, 210)} x2={hx(6)} y2={ty(top, 210)} stroke={C.focus} strokeWidth={2} opacity={exc} />
            {i === 0 ? (
              <Draw
                pts={[
                  [hx(1), ty(top, 210)],
                  [hx(5), ty(top, 210)],
                ]}
                t={t}
                from={from}
                to={from + 1.0}
                stroke={C.primary}
                w={2}
              />
            ) : (
              <g>
                <circle cx={hx(1)} cy={ty(top, 210)} r={4} fill={C.focus} opacity={easeOut(seg(t, from, from + 0.2))} />
                <circle cx={hx(5)} cy={ty(top, 210)} r={4} fill={C.focus} opacity={easeOut(seg(t, from, from + 0.2))} />
                <Draw
                  pts={[
                    [hx(1), ty(top, 210)],
                    [hx(5), ty(top, 210)],
                  ]}
                  t={t}
                  from={from + 0.3}
                  to={from + 1.0}
                  stroke={C.primary}
                  w={2}
                  pen={false}
                  dash="8 4"
                />
              </g>
            )}
            <T x={hx(0)} y={top + 30} s={13} f={C.primary} o={easeOut(seg(t, from, from + 0.3))}>
              {i === 0 ? 'carry forward' : 'interpolate'}
            </T>
            <T x={hx(2.5)} y={ty(top, 240) - 8} s={12} f={C.second} a="middle" o={exc}>
              real 240
            </T>
            <Cross x={hx(2.5)} y={ty(top, 210)} k={easeOutBack(seg(t, from + 1.1, from + 1.4))} />
            <T x={575} y={ty(top, 210) + 5} s={13} f={C.badText} a="end" o={easeOut(seg(t, from + 1.2, from + 1.5))}>
              210
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Six hours as 72 five-minute cells, each painted by its flag. Observed cells fill white; the short 00:10 gap fills
// pale blue; the outage's first 30 minutes (the max gap) fill pale blue, then everything past it stays an empty red
// outline: missing. A legend and the honest outage mean, NaN from 0 points, close it.
const CELL = (i: number) => 40 + i * 7.2;
const flagOf = (i: number) => (i === 2 || i === 3 ? 'filled' : i >= 12 && i <= 17 ? 'filled' : i >= 18 && i <= 59 ? 'missing' : 'observed');
export function RevealMaxGapFlag({ t }: StepCtx) {
  const paint = seg(t, 0.4, 3.2);
  const n = Math.floor(72 * paint);
  const brace = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="a fill only runs up to a stated maximum gap; past it, the bucket is marked missing, not filled, and every bucket carries an observed/filled/missing flag" h={220}>
      {Array.from({ length: 72 }, (_, i) => {
        const f = flagOf(i);
        const shown = i < n;
        return (
          <rect
            key={i}
            x={CELL(i)}
            y={60}
            width={5.6}
            height={40}
            rx={1}
            fill={!shown ? C.band : f === 'observed' ? C.primary : f === 'filled' ? C.second : 'none'}
            stroke={shown && f === 'missing' ? C.badText : 'none'}
            strokeWidth={1}
          />
        );
      })}
      {brace > 0 && (
        <g opacity={brace}>
          <path d={`M${CELL(12)} 52 v-8 H${CELL(18) - 1.6} v8`} fill="none" stroke={C.second} strokeWidth={1.4} />
          <T x={CELL(15)} y={36} s={13} f={C.second} a="middle">
            max gap 30 min
          </T>
        </g>
      )}
      <T x={40} y={124} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        00:00
      </T>
      <T x={560} y={124} s={12} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        06:00
      </T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <rect x={40} y={142} width={12} height={12} fill={C.primary} />
        <T x={58} y={153} s={13} f={C.primary}>
          observed
        </T>
        <rect x={210} y={142} width={12} height={12} fill={C.second} />
        <T x={228} y={153} s={13} f={C.second}>
          filled
        </T>
        <rect x={360} y={142} width={12} height={12} fill="none" stroke={C.badText} />
        <T x={378} y={153} s={13} f={C.badText}>
          missing
        </T>
      </g>
      <T x={40} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        02:05 to 02:55: 0 points used
      </T>
      <T x={575} y={196} s={15} f={C.focus} a="end" o={easeOut(seg(t, 4.0, 4.4))}>
        NaN
      </T>
    </Svg>
  );
}

// 8 · Three rows, one per idea, each with a glyph: a type tag choosing an aggregate, two states merging to a forbidden
// 1.5, and a row of flagged cells.
const GLYPH = [
  (k: number) => (
    <g>
      <rect x={30} y={-14} width={34} height={18} rx={3} fill="none" stroke={C.focus} />
      <path d={`M66 -5 h${30 * k}`} stroke={C.focus} strokeWidth={1.6} />
    </g>
  ),
  (k: number) => (
    <g>
      <circle cx={lerp(40, 70, k)} cy={lerp(-14, -5, k)} r={4} fill={k > 0.95 ? C.badText : C.focus} />
      <circle cx={lerp(100, 70, k)} cy={lerp(4, -5, k)} r={4} fill={k > 0.95 ? C.badText : C.focus} />
    </g>
  ),
  (k: number) => (
    <g>
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={30 + i * 8} y={-14} width={6} height={18} fill={i < 3 ? C.primary : i < 5 ? C.second : 'none'} stroke={i >= 5 ? C.badText : 'none'} opacity={i < 9 * k ? 1 : 0.2} />
      ))}
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = ['the type picks the aggregate', 'mean of states: no such state', 'a fill is a claim: bounded, flagged'];
  return (
    <Svg label="a signal type decides its aggregate, averaging a state code is meaningless, and a filled value is a bounded, flagged claim" h={260}>
      {rows.map((r, i) => {
        const a = 0.3 + i * 1.5;
        const o = easeOut(seg(t, a, a + 0.5));
        const k = easeOut(seg(t, a + 0.3, a + 1.1));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${60 + i * 70})`}>
            {GLYPH[i](k)}
            <T x={130} y={0} s={14} f={i === 1 ? C.badText : C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · A year of dashboard, one unbroken line. Before the answer: "never offline?". After it, flag chips appear under the
// line — but every chip reads "?", because a line with no flag column can't say which stretches were carried.
const YEAR: [number, number][] = Array.from({ length: 53 }, (_, i) => [40 + i * 10, 90 + 14 * Math.sin(i * 0.45) + 6 * Math.sin(i * 1.3)]);
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="a dashboard's line has never once shown a gap, for any sensor, in a year — is that evidence the sensors never went offline?" h={200}>
      <T x={40} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        a year, no gaps shown
      </T>
      <Draw pts={YEAR} t={on ? 99 : t} from={0.2} to={1.8} stroke={C.focus} w={2} pen={false} />
      {on ? (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} opacity={easeOutBack(seg(s, 0.2 + i * 0.12, 0.5 + i * 0.12))}>
              <rect x={70 + i * 100} y={128} width={40} height={22} rx={3} fill="none" stroke={C.line} strokeDasharray="3 2" />
              <T x={90 + i * 100} y={144} s={13} f={C.secondary} a="middle">
                ?
              </T>
            </g>
          ))}
          <T x={300} y={186} s={13} f={C.badText} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
            no flags, no way to tell
          </T>
        </g>
      ) : (
        <T x={300} y={186} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
          never offline?
        </T>
      )}
    </Svg>
  );
}
