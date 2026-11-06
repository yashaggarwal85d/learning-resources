import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Sensor data quality, drawn on examples.py's own fleet (20 sensors, 2,160 points each, four planted faults): the
// frozen 47.3, the −283.15 dive, three +40 spikes, the ×1.8 + 32 firmware step, the 60 → 50 replay dedup, and the
// 3,084-entry quarantine. Per-point timings are machine-dependent and are not shown.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

type Pt = readonly [number, number];

// examples.py's fleet (random.seed(20261031)), every 24th of 2,160 points (one per two minutes over three hours).
// Sensor 0 freezes at 47.3 from point 400 to 1,399; sensor 1 carries three +40 spikes (at 300, 900, 1,700); sensor 2
// reads −283.15 °C from 600 to 619; sensor 3's firmware re-scales it ×1.8 + 32 from point 1,080.
// prettier-ignore
const S0 = [49.8, 50.3, 51.0, 51.4, 52.5, 52.1, 52.8, 52.9, 52.6, 52.7, 52.0, 51.2, 51.1, 49.7, 49.2, 48.3, 47.7, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 47.3, 52.2, 52.8, 51.9, 50.8, 50.4, 49.5, 48.8, 48.6, 47.6, 47.4, 47.2, 46.9, 47.3, 47.6, 47.6, 48.5, 49.4, 49.1, 50.0, 50.4, 52.2, 52.6, 52.5, 53.2, 53.3, 52.3, 52.1, 51.3, 50.8, 50.3, 49.8];
// prettier-ignore
const S1 = [54.4, 54.6, 55.6, 56.3, 56.8, 57.4, 57.2, 57.4, 57.3, 56.9, 56.6, 55.3, 55.5, 53.5, 54.4, 52.9, 52.0, 52.3, 51.5, 51.5, 51.1, 51.4, 51.9, 52.3, 52.7, 53.9, 54.8, 55.7, 55.1, 56.9, 56.6, 57.5, 56.6, 57.2, 56.6, 56.1, 56.0, 55.1, 53.8, 53.4, 53.5, 52.1, 52.3, 51.8, 50.7, 51.4, 51.6, 52.3, 52.5, 53.2, 53.0, 54.4, 56.1, 55.3, 56.3, 56.6, 57.5, 57.9, 57.0, 57.1, 56.8, 56.0, 55.5, 55.5, 54.5, 52.8, 53.0, 52.4, 51.4, 51.1, 51.5, 51.3, 52.4, 52.8, 52.5, 54.3, 53.6, 54.3, 55.4, 56.7, 56.5, 57.8, 57.1, 56.9, 56.8, 56.8, 56.2, 56.0, 54.7, 54.1];
// prettier-ignore
const S2 = [54.6, 55.3, 55.4, 57.0, 57.5, 57.4, 56.9, 57.1, 57.1, 57.2, 56.4, 55.7, 55.3, 54.1, 54.4, 53.8, 52.3, 52.1, 51.3, 52.0, 51.7, 51.7, 52.7, 53.3, 53.4, -283.1, 55.4, 55.5, 56.6, 56.7, 57.5, 58.4, 57.4, 57.4, 56.5, 57.0, 56.0, 55.0, 54.5, 53.3, 52.5, 52.7, 52.3, 51.0, 51.3, 51.5, 52.0, 51.4, 52.4, 53.5, 54.4, 55.1, 55.1, 55.7, 56.6, 57.4, 56.9, 57.3, 57.6, 56.9, 56.3, 56.7, 56.0, 54.5, 54.3, 53.3, 52.8, 52.2, 51.4, 52.1, 52.0, 52.1, 51.7, 52.3, 52.8, 53.9, 55.2, 55.2, 56.9, 56.1, 57.2, 57.4, 56.9, 57.8, 57.7, 57.0, 57.0, 56.2, 54.7, 54.6];
// prettier-ignore
const S3 = [51.1, 51.6, 51.9, 51.6, 53.5, 53.5, 53.9, 54.0, 53.8, 53.2, 52.6, 52.0, 51.2, 50.7, 49.9, 48.9, 48.6, 48.2, 48.5, 47.5, 48.4, 48.5, 48.0, 48.9, 49.4, 50.5, 50.7, 52.3, 53.1, 53.7, 53.5, 53.7, 53.4, 53.9, 52.3, 52.0, 51.7, 52.1, 51.3, 49.7, 48.9, 48.7, 48.1, 47.3, 48.5, 116.8, 118.1, 118.9, 121.3, 120.9, 122.7, 123.4, 125.0, 125.7, 127.7, 128.4, 128.4, 129.7, 127.5, 128.0, 127.8, 126.2, 124.8, 124.4, 123.1, 121.2, 121.0, 118.7, 118.0, 117.9, 117.9, 118.6, 117.3, 118.9, 120.7, 120.4, 124.0, 125.0, 125.4, 126.3, 128.0, 129.2, 128.5, 128.6, 130.3, 129.8, 127.0, 125.7, 123.5, 124.0];

/** Points for one series on a plot box. `i` is the sample index (0–2,159); the arrays hold every 24th. */
const plot = (vals: number[], x0: number, w: number, y0: number, h: number, lo: number, hi: number): Pt[] =>
  vals.map((v, j) => [x0 + (j / (vals.length - 1)) * w, y0 + h - ((v - lo) / (hi - lo)) * h] as const);
const ix = (i: number, x0: number, w: number) => x0 + (i / 2159) * w;

// 0 · The furnace line draws itself across three hours; in the middle it goes perfectly flat at 47.3. Beside it, the
// controller, the dashboard and the SPC chart each tick in turn: all three call it stable.
export function Hook({ t }: StepCtx) {
  const pts = plot(S0, 30, 360, 40, 110, 45, 55);
  return (
    <Svg label="a furnace's temperature reads the exact same value for hours, and the controller, the dashboard, and the SPC chart all agree nothing here looks wrong" h={200}>
      <Draw pts={pts} t={t} from={0} to={2.6} stroke={C.focus} w={2} />
      <T x={ix(900, 30, 360)} y={144} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        47.3, unchanged
      </T>
      <T x={30} y={186} s={11} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        furnace, 3 hours
      </T>
      {['controller', 'dashboard', 'SPC chart'].map((l, i) => {
        const a = 2.8 + i * 0.6;
        return (
          <g key={l} opacity={easeOut(seg(t, a, a + 0.3))}>
            <T x={420} y={66 + i * 36} s={13} f={C.primary}>
              {l}
            </T>
            <Tick x={560} y={61 + i * 36} k={easeOutBack(seg(t, a + 0.2, a + 0.5))} />
          </g>
        );
      })}
      <T x={575} y={186} s={13} f={C.focus} a="end" o={easeOut(seg(t, 4.6, 5.0))}>
        all say stable
      </T>
    </Svg>
  );
}

// 1 · The same line on top. Three rules run beneath it. The spike rule scans and finds no jump: silent. The range rule
// lays its −273.15 … 200 band and finds the value inside: silent. Then a 20-point variance window slides along the line;
// its readout says var > 0 until it enters the flat stretch, where it reads var = 0 and the stretch turns red: 1,000
// points flagged.
export function RevealFlatline({ t }: StepCtx) {
  const pts = plot(S0, 30, 540, 20, 90, 45, 55);
  const slide = seg(t, 2.6, 4.4);
  const wi = lerp(100, 1300, slide);
  const inFlat = wi >= 420 && wi <= 1399;
  const flagged = easeOut(seg(t, 4.4, 4.8));
  return (
    <Svg
      label="a spike rule looks for a sudden jump and a range rule looks for an impossible value, but only a check on how much a reading moves over a window catches a signal that's stopped moving"
      h={260}
    >
      <Draw pts={pts} t={t} from={0} to={0.5} stroke={C.focus} w={1.8} pen={false} />
      <rect x={ix(400, 30, 540)} y={64} width={ix(1399, 30, 540) - ix(400, 30, 540)} height={22} fill="none" stroke={C.badText} strokeWidth={1.8} opacity={flagged} />
      {slide > 0 && slide < 1 && <rect x={ix(wi, 30, 540) - 10} y={14} width={20} height={100} fill={C.second} opacity={0.22} stroke={C.second} strokeWidth={1} />}

      <T x={25} y={150} s={13} f={C.primary} o={easeOut(seg(t, 0.6, 0.9))}>
        spike rule
      </T>
      <T x={575} y={150} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        silent
      </T>
      <T x={25} y={186} s={13} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        range rule
      </T>
      <T x={240} y={186} s={12} f={C.quiet} o={easeOut(seg(t, 1.6, 1.9))}>
        −273.15 to 200
      </T>
      <T x={575} y={186} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
        silent
      </T>
      <T x={25} y={222} s={13} f={C.second} w={600} o={easeOut(seg(t, 2.4, 2.7))}>
        variance, 20 points
      </T>
      {slide > 0 && slide < 1 && (
        <T x={330} y={222} s={13} f={inFlat ? C.badText : C.secondary}>
          {inFlat ? 'var = 0' : 'var > 0'}
        </T>
      )}
      <T x={575} y={222} s={13} f={C.badText} a="end" w={600} o={flagged}>
        1,000 flagged
      </T>
      <T x={300} y={252} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 4.7, 5.1))}>
        only movement gives it away
      </T>
    </Svg>
  );
}

// 2 · Left: sensor 2 dives through a red dashed line at absolute zero (−273.15 °C) to −283.15; the range check flags all
// 20 readings. Right: sensor 1 with three spikes of +40. At each spike, brackets take the ten neighbours either side —
// the spike itself left out — and their median sits at the normal level, so each spike stands six MADs clear: 3 of 3.
export function RevealRangeSpike({ t }: StepCtx) {
  const lp = plot(S2, 30, 250, 30, 120, -300, 70);
  const zeroY = 30 + 120 - ((-273.15 + 300) / 370) * 120;
  const rp = plot(S1, 320, 250, 40, 110, 40, 100);
  const sy = (v: number) => 40 + 110 - ((v - 40) / 60) * 110;
  const spikes = [
    { i: 300, v: 94.5, base: 54.7 },
    { i: 900, v: 94.5, base: 54.5 },
    { i: 1700, v: 91.7, base: 52.0 },
  ];
  return (
    <Svg label="a different sensor dips below what's physically possible, and a third throws isolated spikes a median-based detector catches without being thrown by its own outlier" h={200}>
      <line x1={30} y1={zeroY} x2={280} y2={zeroY} stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.0, 1.4))} />
      <T x={280} y={zeroY - 6} s={11} f={C.badText} a="end" o={easeOut(seg(t, 1.0, 1.4))}>
        absolute zero
      </T>
      <Draw pts={lp} t={t} from={0} to={1.4} stroke={C.focus} w={1.6} pen={false} />
      <circle cx={lp[25][0]} cy={lp[25][1]} r={5} fill="none" stroke={C.badText} strokeWidth={1.8} opacity={easeOutBack(seg(t, 1.6, 2.0))} />
      <T x={lp[25][0] + 12} y={lp[25][1] + 18} s={12} f={C.badText} o={easeOut(seg(t, 1.8, 2.2))}>
        −283.15
      </T>
      <T x={30} y={192} s={13} f={C.badText} w={600} o={easeOut(seg(t, 2.2, 2.6))}>
        20 flagged
      </T>

      <Draw pts={rp} t={t} from={2.4} to={3.4} stroke={C.focus} w={1.6} pen={false} />
      {spikes.map((p, j) => {
        const a = 3.3 + j * 0.45;
        const x = ix(p.i, 320, 250);
        const k = easeOut(seg(t, a, a + 0.3));
        return (
          <g key={j}>
            <line x1={x} y1={sy(p.base)} x2={x} y2={sy(p.base) - (sy(p.base) - sy(p.v)) * easeOut(seg(t, 2.6 + j * 0.3, 2.9 + j * 0.3))} stroke={C.focus} strokeWidth={1.6} />
            <path d={`M${x - 16} ${sy(p.base) + 10} h12 M${x + 4} ${sy(p.base) + 10} h12`} stroke={C.second} strokeWidth={2} opacity={k} />
            <line x1={x - 18} y1={sy(p.base)} x2={x + 18} y2={sy(p.base)} stroke={C.second} strokeWidth={1.2} strokeDasharray="2 2" opacity={k} />
            <circle cx={x} cy={sy(p.v)} r={5} fill="none" stroke={C.badText} strokeWidth={1.8} opacity={easeOutBack(seg(t, a + 0.25, a + 0.55))} />
          </g>
        );
      })}
      <T x={320} y={192} s={12} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        median, spike left out
      </T>
      <T x={575} y={30} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.8, 5.2))}>
        3 of 3
      </T>
    </Svg>
  );
}

// 3 · The frozen stretch, flagged red, lifts off the line. Two destinations wait: a bin (delete) and a table
// (quarantine). Before the answer it hovers between them with "?". After it, the left copy of the timeline shows the
// hole a deletion leaves — "post-mortem: ?" in red — while the right copy keeps the line whole and files a labelled row.
export function PredictDelete({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const lift = easeOut(seg(t, 1.0, 1.8));
  const k = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const left = plot(S0, 30, 240, 90, 70, 45, 55);
  const right = plot(S0, 330, 240, 90, 70, 45, 55);
  const a0 = Math.floor(400 / 24);
  const a1 = Math.ceil(1399 / 24);
  return (
    <Svg label="a rule flags the furnace's frozen reading as bad — delete it outright, or keep it labeled in a quarantine table, does the choice matter to whoever investigates later?" h={200}>
      {!on ? (
        <g>
          <Draw pts={plot(S0, 150, 300, 90, 70, 45, 55)} t={t} from={0} to={0.8} stroke={C.focus} w={1.8} pen={false} />
          <rect x={ix(400, 150, 300)} y={lerp(140, 70, lift)} width={ix(1399, 150, 300) - ix(400, 150, 300)} height={8} fill={C.bad} opacity={easeOut(seg(t, 0.8, 1.1))} />
          <T x={60} y={40} s={13} f={C.primary} o={easeOut(seg(t, 1.8, 2.1))}>
            delete
          </T>
          <T x={540} y={40} s={13} f={C.primary} a="end" o={easeOut(seg(t, 1.8, 2.1))}>
            quarantine
          </T>
          <T x={300} y={40} s={18} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 2.3, 2.7))}>
            ?
          </T>
        </g>
      ) : (
        <g opacity={k}>
          <T x={30} y={40} s={13} f={C.badText} w={600}>
            deleted
          </T>
          <polyline
            points={left
              .slice(0, a0 + 1)
              .map((p) => p.join(','))
              .join(' ')}
            fill="none"
            stroke={C.focus}
            strokeWidth={1.8}
          />
          <polyline
            points={left
              .slice(a1)
              .map((p) => p.join(','))
              .join(' ')}
            fill="none"
            stroke={C.focus}
            strokeWidth={1.8}
          />
          <T x={150} y={190} s={12} f={C.badText} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
            post-mortem: ?
          </T>
          <T x={330} y={40} s={13} f={C.focus} w={600}>
            quarantined
          </T>
          <polyline points={right.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.focus} strokeWidth={1.8} />
          <rect x={ix(400, 330, 240)} y={146} width={ix(1399, 330, 240) - ix(400, 330, 240)} height={6} fill={C.bad} />
          <T x={450} y={190} s={12} f={C.second} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
            kept, with its label
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · Sensor 3 before and after its firmware update: every reading stays plausible, but the level jumps. Two 60-point
// median windows slide along either side of a split; when the split reaches point 1,080 their medians read 47.8 and
// 118.7. The first split with a shift over 3 is point 1,050, and from there on the series is flagged as a level change.
export function RevealChangePoint({ t }: StepCtx) {
  const x0 = 30;
  const W = 540;
  const pts = plot(S3, x0, W, 30, 110, 40, 140);
  const vy = (v: number) => 30 + 110 - ((v - 40) / 100) * 110;
  const split = lerp(300, 1080, easeInOut(seg(t, 1.2, 3.0)));
  const win = ix(60, 0, W);
  const at = seg(t, 3.0, 3.1) > 0;
  const flag = easeOut(seg(t, 3.8, 4.4));
  return (
    <Svg label="a firmware update re-scales a sensor's output so every reading after stays individually plausible, but the median shifts, caught as a change point rather than a spike" h={200}>
      <rect x={ix(1050, x0, W)} y={24} width={x0 + W - ix(1050, x0, W)} height={122} fill={C.second} opacity={0.14 * flag} />
      <Draw pts={pts} t={t} from={0} to={1.0} stroke={C.focus} w={1.8} pen={false} />
      <g opacity={easeOut(seg(t, 1.1, 1.4))}>
        <rect x={ix(split, x0, W) - win} y={22} width={win} height={126} fill="none" stroke={C.secondary} strokeWidth={1} strokeDasharray="3 3" />
        <rect x={ix(split, x0, W)} y={22} width={win} height={126} fill="none" stroke={C.second} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={ix(split, x0, W)} y1={18} x2={ix(split, x0, W)} y2={152} stroke={C.focus} strokeWidth={1.2} />
      </g>
      {at && (
        <g>
          <line x1={ix(1080, x0, W) - win} y1={vy(47.8)} x2={ix(1080, x0, W)} y2={vy(47.8)} stroke={C.focus} strokeWidth={2.4} />
          <line x1={ix(1080, x0, W)} y1={vy(118.7)} x2={ix(1080, x0, W) + win} y2={vy(118.7)} stroke={C.focus} strokeWidth={2.4} />
          <T x={ix(1080, x0, W) - win - 8} y={vy(47.8) + 5} s={13} f={C.focus} a="end" w={600}>
            47.8
          </T>
          <T x={ix(1080, x0, W) - 8} y={vy(118.7) + 5} s={13} f={C.focus} a="end" w={600}>
            118.7
          </T>
        </g>
      )}
      <T x={25} y={170} s={12} f={C.secondary} o={easeOut(seg(t, 0.6, 1.0))}>
        each reading plausible
      </T>
      <T x={575} y={194} s={13} f={C.second} a="end" w={600} o={flag}>
        level change from 1,050
      </T>
    </Svg>
  );
}

// 5 · Fifty readings (seq 0–49) arrive, then the gateway's replay of seq 10–19 piles ten pale-blue duplicates on the
// end. The key (series, device time, seq) matches each duplicate to its original; they fly back and vanish: 60 → 50.
// Below, two timestamps against the gateway's receipt at 900: device time 500 is a backfill; 950, later than the
// gateway ever saw it, is a clock fault.
export function RevealDedupBackfill({ t }: StepCtx) {
  const cw = 7;
  const cx = (i: number) => 130 + i * cw;
  const fly = easeInOut(seg(t, 1.8, 2.8));
  const gx = (v: number) => 100 + ((v - 400) / 600) * 440;
  return (
    <Svg label="a gateway resends readings after an outage, an idempotent key collapses the replay back to one copy, and comparing two timestamps tells a late backfill from a broken clock" h={260}>
      <T x={25} y={34} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        arrived
      </T>
      {Array.from({ length: 50 }, (_, i) => (
        <rect key={i} x={cx(i) + 0.5} y={22} width={cw - 1} height={16} fill={i >= 10 && i < 20 && fly > 0.9 ? C.focus : C.secondary} opacity={easeOut(seg(t, i * 0.012, 0.2 + i * 0.012))} />
      ))}
      {Array.from({ length: 10 }, (_, j) => {
        const from = 50 + j;
        const x = lerp(cx(from), cx(10 + j), fly);
        const y = lerp(22, 22, fly) + (fly > 0 && fly < 1 ? -Math.sin(Math.PI * fly) * 18 : 0);
        return <rect key={j} x={x + 0.5} y={y} width={cw - 1} height={16} fill={C.second} opacity={easeOut(seg(t, 0.8 + j * 0.05, 1.0 + j * 0.05)) * (1 - seg(t, 2.7, 2.9))} />;
      })}
      <T x={575} y={62} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 2.8, 3.2))}>
        60 → 50
      </T>
      <T x={25} y={70} s={12} f={C.quiet} o={easeOut(seg(t, 1.2, 1.6))}>
        key = series, device time, seq
      </T>

      <g opacity={easeOut(seg(t, 3.2, 3.5))}>
        <line x1={gx(400)} y1={180} x2={gx(1000)} y2={180} stroke={C.line} strokeWidth={1.2} />
        <line x1={gx(900)} y1={150} x2={gx(900)} y2={190} stroke={C.focus} strokeWidth={1.6} />
        <T x={gx(900)} y={142} s={12} f={C.focus} a="middle">
          gateway got it: 900
        </T>
      </g>
      <circle cx={gx(500)} cy={180} r={6} fill={C.second} opacity={easeOutBack(seg(t, 3.7, 4.1))} />
      <T x={gx(500)} y={210} s={12} f={C.second} a="middle" o={easeOut(seg(t, 3.9, 4.3))}>
        device 500
      </T>
      <T x={gx(500)} y={230} s={13} f={C.second} a="middle" w={600} o={easeOut(seg(t, 4.1, 4.5))}>
        backfill
      </T>
      <circle cx={gx(950)} cy={180} r={6} fill={C.badText} opacity={easeOutBack(seg(t, 4.5, 4.9))} />
      <T x={gx(950)} y={210} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 4.7, 5.1))}>
        device 950
      </T>
      <T x={gx(950)} y={230} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.9, 5.3))}>
        clock fault
      </T>
    </Svg>
  );
}

// 6 · The frozen furnace line stays drawn, whole, its count reading 2,160 before and after. The red flagged stretch
// copies downward into a quarantine table: rows with the sensor, the index, the rule and the flag. The total lands:
// 3,084 entries — 1,219 bad, 1,865 suspect — and 0 deleted.
export function RevealQuarantine({ t }: StepCtx) {
  const pts = plot(S0, 30, 300, 24, 60, 45, 55);
  const copy = easeInOut(seg(t, 1.0, 1.8));
  const rows = [
    ['sensor 0', 'pt 400', 'flatline', 'bad'],
    ['sensor 2', 'pt 600', 'range', 'bad'],
    ['sensor 3', 'pt 1,050', 'change', 'suspect'],
  ];
  return (
    <Svg label="nothing is deleted — every flagged point keeps its place in the original series and also lands in a quarantine table with the rule that fired and a severity" h={200}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={ix(400, 30, 300)} y={lerp(64, 104, copy)} width={ix(1399, 30, 300) - ix(400, 30, 300)} height={6} fill={C.bad} opacity={easeOut(seg(t, 0.6, 0.9)) * (1 - seg(t, 1.8, 2.0))} />
      <T x={575} y={44} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 0.3, 0.6))}>
        2,160 points
      </T>
      <T x={575} y={68} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.3, 4.7))}>
        0 deleted
      </T>
      {rows.map((r, i) => (
        <g key={i} opacity={easeOut(seg(t, 1.8 + i * 0.35, 2.1 + i * 0.35))}>
          {r.map((c, j) => (
            <T key={j} x={[30, 140, 260, 380][j]} y={112 + i * 22} s={12} f={j === 3 ? (c === 'bad' ? C.badText : C.second) : C.primary}>
              {c}
            </T>
          ))}
        </g>
      ))}
      <line x1={25} y1={98} x2={470} y2={98} stroke={C.line} strokeWidth={1} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <T x={30} y={192} s={12} f={C.primary} o={easeOut(seg(t, 3.4, 3.8))}>
        3,084 entries: 1,219 bad, 1,865 suspect
      </T>
    </Svg>
  );
}

// 7 · Two bars. Truth: the 1,023 planted faults; the flags fill it completely — recall 1.000, no misses. Flags: 1,219
// of them, 1,023 real and 196 false alarms in grey — precision 0.839. Then the cost: a full bar for one second of plant
// data, and the compute to check it all drawn as a sliver at its start: far under a second.
export function RevealPrecisionCost({ t }: StepCtx) {
  const W = 240;
  const sc = W / 1219;
  const tr = easeOut(seg(t, 0.4, 1.4));
  const fl = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="across the fleet the rules catch almost every planted fault with few false alarms, and running every check costs a small fraction of the time each reading represents" h={200}>
      <T x={25} y={36} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        planted
      </T>
      <rect x={120} y={24} width={1023 * sc} height={14} fill="none" stroke={C.secondary} strokeWidth={1} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={120} y={24} width={1023 * sc * tr} height={14} fill={C.focus} />
      <T x={575} y={36} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 1.2, 1.6))}>
        recall 1.000
      </T>
      <T x={25} y={76} s={13} f={C.secondary} o={easeOut(seg(t, 1.4, 1.7))}>
        flagged
      </T>
      <rect x={120} y={64} width={1023 * sc * fl} height={14} fill={C.focus} />
      <rect x={120 + 1023 * sc} y={64} width={196 * sc * fl} height={14} fill={C.quiet} />
      <T x={575} y={76} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 2.4, 2.8))}>
        precision 0.839
      </T>
      <T x={120 + 1023 * sc + 4} y={98} s={11} f={C.quiet} o={easeOut(seg(t, 2.4, 2.8))}>
        196 false
      </T>

      <T x={25} y={146} s={13} f={C.secondary} o={easeOut(seg(t, 3.2, 3.5))}>
        1 s of data
      </T>
      <rect x={120} y={134} width={W * easeOut(seg(t, 3.3, 4.0))} height={14} fill={C.line} />
      <rect x={120} y={156} width={3} height={14} fill={C.second} opacity={easeOut(seg(t, 4.1, 4.4))} />
      <T x={25} y={168} s={13} f={C.second} o={easeOut(seg(t, 4.1, 4.4))}>
        checking it
      </T>
      <T x={180} y={168} s={13} f={C.second} w={600} o={easeOut(seg(t, 4.5, 4.9))}>
        far under 1 s
      </T>
    </Svg>
  );
}

// 8 · Four rule lanes, each with the fault shape it alone catches — a flat line, a dive past a floor, a lone spike, a
// level step — then a fifth lane where a flagged red piece files into a table instead of a bin.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 32 + i * 50;
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const texts = [
    { l: 'variance window', r: 'stopped moving', c: C.focus },
    { l: 'range check', r: 'impossible', c: C.focus },
    { l: 'median detector', r: 'lone spikes', c: C.focus },
    { l: 'change point', r: 'level shift', c: C.second },
    { l: 'quarantine', r: 'never delete', c: C.badText },
  ];
  const g: Pt[][] = [
    [
      [25, lane(0)],
      [55, lane(0) - 8],
      [70, lane(0)],
      [135, lane(0)],
    ],
    [
      [25, lane(1) - 8],
      [70, lane(1) - 8],
      [80, lane(1) + 12],
      [90, lane(1) - 8],
      [135, lane(1) - 8],
    ],
    [
      [25, lane(2) + 6],
      [75, lane(2) + 6],
      [80, lane(2) - 12],
      [85, lane(2) + 6],
      [135, lane(2) + 6],
    ],
    [
      [25, lane(3) + 8],
      [80, lane(3) + 8],
      [80, lane(3) - 8],
      [135, lane(3) - 8],
    ],
  ];
  return (
    <Svg
      label="a windowed variance check, a range check, a spike-robust detector, and a change-point check each catching a fault shape no other rule would, a dedup key, a quarantine that never deletes, and a measured cost that keeps up"
      h={260}
    >
      {g.map((p, i) => (
        <Draw key={i} pts={p} t={t} from={i * 1.0} to={i * 1.0 + 0.6} stroke={C.focus} w={1.6} pen={false} />
      ))}
      <line x1={25} y1={lane(1) + 4} x2={135} y2={lane(1) + 4} stroke={C.badText} strokeWidth={1} strokeDasharray="3 3" opacity={k(1)} />
      <g opacity={k(4)}>
        <rect x={25} y={lane(4) - 6} width={60} height={6} fill={C.bad} />
        <rect x={95} y={lane(4) - 12} width={40} height={20} fill="none" stroke={C.second} strokeWidth={1.2} />
        <line x1={95} y1={lane(4) - 2} x2={135} y2={lane(4) - 2} stroke={C.second} strokeWidth={1} />
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={160} y={lane(i) + 5} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 5} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · The furnace's flat line and three rule names. Before the answer: "which fires?". After it, the spike rule and
// the range rule are crossed out — silent — and the variance window lights the flat stretch red with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const pts = plot(S0, 30, 300, 30, 70, 45, 55);
  const rules = ['spike rule', 'range rule', 'variance window'];
  return (
    <Svg label="given only that the furnace's reading never moves, which named rule actually catches it — the spike rule, the range rule, or the windowed variance check?" h={200}>
      <Draw pts={pts} t={t} from={0} to={1.0} stroke={C.focus} w={1.8} pen={false} />
      {on && <rect x={ix(400, 30, 300)} y={76} width={ix(1399, 30, 300) - ix(400, 30, 300)} height={20} fill="none" stroke={C.badText} strokeWidth={1.8} opacity={easeOut(seg(s, 1.0, 1.4))} />}
      {rules.map((r, i) => {
        const y = 54 + i * 40;
        const hit = i === 2;
        return (
          <g key={r} opacity={easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3))}>
            <T x={350} y={y} s={13} f={on && hit ? C.focus : C.primary} w={on && hit ? 600 : 400}>
              {r}
            </T>
            {on && (hit ? <Tick x={562} y={y - 5} k={easeOutBack(seg(s, 1.0, 1.4))} /> : <Cross x={562} y={y - 5} k={easeOutBack(seg(s, 0.3 + i * 0.25, 0.6 + i * 0.25))} />)}
          </g>
        );
      })}
      {!on ? (
        <T x={300} y={186} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
          which fires?
        </T>
      ) : (
        <T x={300} y={186} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 1.4, 1.8))}>
          only the window sees it stop
        </T>
      )}
    </Svg>
  );
}
