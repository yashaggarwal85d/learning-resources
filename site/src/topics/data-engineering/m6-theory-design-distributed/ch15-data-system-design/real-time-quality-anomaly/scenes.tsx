import { useEffect, useState } from 'react';
import { C, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 25: a series chart with a planted step and a planted slow drift; three baselines (EWMA adapting
// into the drift and missing it, a seasonal profile quiet on the normal ramp, a fixed control limit firing on the
// step); a grouping strip folding repeated alerts into one with a duration, a changeover window suppressing the ramp; a
// backtest scored against labelled incidents with a time-split marker. examples.py (seed 5): the ramp, step, drift,
// EWMA (lambda 0.2) and seasonal profile below, rounded; a fixed limit of 3 fires on the ramp at points 8, 19, 30, 33
// and 47; 200,000 series at 256 bytes is 51.2 MB, 512 MB at ten times; a series arms after 24 points; the held-out
// backtest's precision is 1.0.

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

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

// examples.py, seed 5, rounded to one decimal.
const RAMP = [-1.2, -0.9, 1.2, -1.5, 0.9, -1.0, 2.6, 2.0, 3.4, 1.7, 2.9, 2.5, -0.7, 0.4, -0.8, 0.4, 1.7, 1.3, 1.1, 3.9, 2.1, 1.7, 2.7, 2.2, -0.4, -0.1, 2.5, 0.8, 1.2, 1.9, 3.5, 1.5, 1.4, 4.7, 1.0, 2.4, 0.7, 2.5, -0.4, -1.7, 1.7, 0.7, 1.1, 2.2, 2.2, 2.5, 2.1, 4.0, 1.5, 0.3, 0.0, 1.5, 1.5, 0.2, 1.0, 2.8, 1.9, 1.9, 2.7, 2.7];
const SPC_ON_RAMP = [8, 19, 30, 33, 47]; // a fixed limit of 3 around a centre of 0.03
const DRIFT = [1.0, 0.4, 0.3, 1.4, 2.7, 1.2, 2.3, 3.0, -0.1, 0.6, 2.0, -0.4, 1.2, 2.9, 2.7, 2.4, 0.0, 4.4, 2.7, 3.0, 2.9, 0.8, 1.2, 1.5, 4.8, 2.2, 2.9, 3.0, 3.9, 4.0, 3.9, 2.5, 0.7, 4.1, 4.3, 5.4, 4.2, 3.8, 5.0, 3.1, 3.8, 3.9, 5.3, 7.3, 6.0, 6.5, 5.8, 5.9, 5.3, 5.6, 3.6, 4.9, 5.0, 7.2, 7.1, 7.7, 8.3, 6.5, 8.0, 9.0, 7.2, 8.4, 7.3, 5.9, 7.8, 7.0, 8.0, 7.6, 8.5, 6.1, 10.5, 9.9, 8.3, 7.9, 8.9, 9.7, 9.5, 9.6, 7.4, 8.3];
const EWMA_D = [0.0, 0.2, 0.2, 0.2, 0.5, 0.9, 1.0, 1.2, 1.6, 1.3, 1.1, 1.3, 1.0, 1.0, 1.4, 1.6, 1.8, 1.4, 2.0, 2.2, 2.3, 2.5, 2.1, 1.9, 1.9, 2.4, 2.4, 2.5, 2.6, 2.9, 3.1, 3.2, 3.1, 2.6, 2.9, 3.2, 3.6, 3.8, 3.8, 4.0, 3.8, 3.8, 3.8, 4.1, 4.8, 5.0, 5.3, 5.4, 5.5, 5.5, 5.5, 5.1, 5.1, 5.0, 5.5, 5.8, 6.2, 6.6, 6.6, 6.9, 7.3, 7.3, 7.5, 7.5, 7.2, 7.3, 7.2, 7.4, 7.4, 7.6, 7.3, 8.0, 8.3, 8.3, 8.2, 8.4, 8.6, 8.8, 9.0, 8.7];
const PROFILE = [0.0, 0.4, 0.5, -0.1, 1.4, 0.6, 1.9, 2.5, 2.2, 2.5, 2.3, 2.8];
const STABLE = [-1.2, -1.1, 0.7, -2.3, -0.1, -2.3, 1.1, 0.2, 1.4, -0.5, 0.4, -0.3, -0.7, 0.1, -1.3, -0.4, 0.7, 0.1, -0.4, 2.2];
const STEP = [8.0, 6.1, 9.7, 8.2, 7.1];

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

// 1 · The changeover ramp draws on the left against a fixed limit; each point past it fires red, five times, and the
// first one stops the line. The badges go grey: ignored. On the right the slow drift climbs while the moving baseline
// climbs right under it, and nothing fires.
export function Hook({ t }: StepCtx) {
  const Y = (v: number) => 196 - (v + 2) * 12;
  const ramp = seg(t, 0.2, 1.6);
  const nR = Math.floor(ramp * 60);
  const ign = easeOut(seg(t, 1.8, 2.2));
  const drift = seg(t, 2.3, 4.2);
  const nD = Math.floor(drift * 80);
  const RX = (i: number) => 30 + i * 4.4;
  const DX = (i: number) => 316 + i * 3.2;
  const fired = SPC_ON_RAMP.filter((i) => i < nR).length;
  return (
    <Svg label="a false alarm ignored, a real fault missed" h={270}>
      <line x1={30} y1={Y(3.03)} x2={296} y2={Y(3.03)} stroke={C.secondary} strokeDasharray="5 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={30} y={102} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        fixed limit
      </T>
      {nR > 1 && <polyline points={poly(RAMP.slice(0, nR).map((v, i) => [RX(i), Y(v)]))} fill="none" stroke={C.primary} strokeWidth={1.3} />}
      {SPC_ON_RAMP.filter((i) => i < nR).map((i) => (
        <circle key={i} cx={RX(i)} cy={Y(RAMP[i])} r={5} fill={ign > 0.5 ? C.quiet : C.badText} stroke={C.focus} strokeWidth={0.8} />
      ))}
      <T x={30} y={222} s={13} f={ign > 0.5 ? C.quiet : C.badText} o={easeOut(seg(t, 0.6, 0.9))}>
        {ign > 0.5 ? `fired ${fired} times · ignored` : `stop the line · fired ${fired}`}
      </T>
      <line x1={306} y1={30} x2={306} y2={200} stroke={C.line} opacity={easeOut(seg(t, 2.2, 2.4))} />
      {nD > 1 && <polyline points={poly(EWMA_D.slice(0, nD).map((v, i) => [DX(i), Y(v)]))} fill="none" stroke={C.second} strokeWidth={6} opacity={0.35} />}
      {nD > 1 && <polyline points={poly(DRIFT.slice(0, nD).map((v, i) => [DX(i), Y(v)]))} fill="none" stroke={C.primary} strokeWidth={1.3} />}
      {nD > 1 && <polyline points={poly(EWMA_D.slice(0, nD).map((v, i) => [DX(i), Y(v)]))} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 3" />}
      <T x={316} y={222} s={13} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
        the baseline follows it
      </T>
      <T x={575} y={252} s={14} f={C.badText} a="end" o={easeOut(seg(t, 4.0, 4.4))}>
        the real drift never fires
      </T>
    </Svg>
  );
}

// 2 · Two red failure cards, a false alarm and a missed fault, each over an empty "?" slot. After the answer the slots
// fill with suppression for the ramp and a baseline that does not adapt into the fault; "a looser threshold" is struck.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const a = on ? easeOut(seg(s, 0.3, 0.7)) : 0;
  const b = on ? easeOut(seg(s, 0.9, 1.3)) : 0;
  const cut = on ? easeOut(seg(s, 1.5, 1.9)) : 0;
  const HEAD = ['false alarm', 'missed fault'];
  const FIX = ['suppress the ramp', 'a baseline that holds'];
  return (
    <Svg label="what did the design get wrong, in both directions?" h={210}>
      {[0, 1].map((i) => {
        const x = 30 + i * 280;
        const k = i === 0 ? a : b;
        return (
          <g key={i}>
            <Box x={x} y={24} w={260} h={30} label={HEAD[i]} stroke={C.badText} f={C.badText} o={easeOut(seg(t, i * 0.3, 0.3 + i * 0.3))} />
            {k < 1 && <Box x={x} y={70} w={260} h={34} label="?" dash="4 3" o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2)) * (1 - k)} />}
            {k > 0 && <Box x={x} y={70} w={260} h={34} label={FIX[i]} lit o={k} />}
          </g>
        );
      })}
      {on ? (
        <g opacity={easeOut(seg(s, 1.3, 1.6))}>
          <T x={30} y={150} s={14} f={C.quiet}>
            a looser threshold
          </T>
          <T x={575} y={150} s={14} f={C.quiet} a="end">
            fixes neither
          </T>
          {cut > 0 && <line x1={28} y1={145} x2={lerp(28, 190, cut)} y2={145} stroke={C.badText} strokeWidth={2} />}
        </g>
      ) : (
        <T x={300} y={150} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          not the same mistake twice
        </T>
      )}
      <T x={300} y={192} s={13} f={on ? C.focus : C.secondary} a="middle" o={on ? easeOut(seg(s, 1.9, 2.3)) : easeOut(seg(t, 1.8, 2.2))}>
        {on ? 'a backtest would have shown both' : 'what would a backtest show?'}
      </T>
    </Svg>
  );
}

// 3 · One event stream splits. The upper path collects readings into a window and hands the dashboard a bar, unhurried;
// the lower path flags one out-of-spec reading the moment it arrives and lights the operator, whose action prices the
// alarm.
export function RevealDashboardDetector({ t }: StepCtx) {
  const flow = seg(t, 0.6, 3.0);
  const bars = Math.floor(flow * 4);
  const flag = easeOutBack(seg(t, 2.6, 3.0));
  const op = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="two consumers, two different needs" h={210}>
      <Box x={30} y={84} w={90} h={30} label="events" o={easeOut(seg(t, 0, 0.3))} />
      <path d="M120 99 L145 99 L145 45 L170 45 M145 99 L145 145 L170 145" fill="none" stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <Box x={170} y={30} w={150} h={30} label="window" o={easeOut(seg(t, 0.3, 0.6))} />
      <Box x={170} y={130} w={150} h={30} label="detector" lit={flag > 0.5} o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={320} y1={45} x2={400} y2={45} stroke={C.line} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <line x1={320} y1={145} x2={400} y2={145} stroke={flag > 0.5 ? C.badText : C.line} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <rect x={400} y={20} width={170} height={52} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={412} y={38} s={13} f={C.secondary} o={easeOut(seg(t, 0.5, 0.8))}>
        dashboard
      </T>
      {[0, 1, 2, 3].map((i) => (i < bars ? <rect key={i} x={500 + i * 16} y={62 - [14, 20, 12, 18][i]} width={11} height={[14, 20, 12, 18][i]} fill={C.focus} /> : null))}
      <Box x={400} y={130} w={170} h={30} label="operator" lit={op > 0.5} stroke={op > 0.5 ? C.badText : undefined} o={easeOut(seg(t, 0.6, 0.9))} />
      {flow > 0 &&
        flow < 1 &&
        [0, 1, 2].map((i) => {
          const p = (flow * 5 + i / 3) % 1;
          return <circle key={i} cx={lerp(145, 170, p)} cy={45} r={3} fill={C.primary} />;
        })}
      {flag > 0 && <circle cx={lerp(170, 360, Math.min(1, flag))} cy={145} r={5} fill={C.badText} />}
      <T x={170} y={88} s={13} f={C.secondary} o={easeOut(seg(t, 1.6, 2.0))}>
        tolerates seconds
      </T>
      <T x={170} y={186} s={13} f={C.badText} o={easeOut(seg(t, 2.8, 3.2))}>
        flags as it arrives
      </T>
      <T x={575} y={104} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        the action sets the cost
      </T>
    </Svg>
  );
}

// 4 · Three small charts, one per baseline. The EWMA line climbs into the drift and earns a red "miss"; the seasonal
// profile rides the ramp and nothing fires; the fixed control limit sits still and every point of the step fires.
export function RevealBaselineFamilies({ t }: StepCtx) {
  const r1 = seg(t, 0.2, 1.4);
  const r2 = seg(t, 1.6, 2.8);
  const r3 = seg(t, 3.0, 4.2);
  const n1 = Math.floor(r1 * 80);
  const n2 = Math.floor(r2 * 60);
  const n3 = Math.floor(r3 * 25);
  const Y1 = (v: number) => 74 - (v + 1) * 5;
  const Y2 = (v: number) => 148 - (v + 2) * 7;
  const Y3 = (v: number) => 226 - (v + 3) * 4.5;
  const S3 = [...STABLE, ...STEP];
  return (
    <Svg label="three baselines, three ways to fail" h={240}>
      {n1 > 1 && <polyline points={poly(DRIFT.slice(0, n1).map((v, i) => [30 + i * 4.3, Y1(v)]))} fill="none" stroke={C.primary} strokeWidth={1.1} />}
      {n1 > 1 && <polyline points={poly(EWMA_D.slice(0, n1).map((v, i) => [30 + i * 4.3, Y1(v)]))} fill="none" stroke={C.second} strokeWidth={1.8} />}
      <T x={400} y={36} s={14} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        EWMA
      </T>
      <T x={400} y={58} s={13} f={C.badText} o={easeOut(seg(t, 1.2, 1.5))}>
        adapts into drift
      </T>
      {n2 > 1 && <polyline points={poly(Array.from({ length: n2 }, (_, i) => [30 + i * 5.8, Y2(PROFILE[i % 12])]))} fill="none" stroke={C.second} strokeWidth={1.8} />}
      {n2 > 1 && <polyline points={poly(RAMP.slice(0, n2).map((v, i) => [30 + i * 5.8, Y2(v)]))} fill="none" stroke={C.primary} strokeWidth={1.1} />}
      <T x={400} y={112} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        seasonal
      </T>
      <T x={400} y={134} s={13} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        ramp looks normal
      </T>
      {r3 > 0 && (
        <g>
          <line x1={30} y1={Y3(3.03)} x2={380} y2={Y3(3.03)} stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" />
          <line x1={30} y1={Y3(-2.97)} x2={380} y2={Y3(-2.97)} stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" />
        </g>
      )}
      {n3 > 1 && <polyline points={poly(S3.slice(0, n3).map((v, i) => [30 + i * 14, Y3(v)]))} fill="none" stroke={C.primary} strokeWidth={1.1} />}
      {S3.slice(0, n3).map((v, i) => (i >= 20 ? <circle key={i} cx={30 + i * 14} cy={Y3(v)} r={4} fill={C.focus} /> : null))}
      <T x={400} y={188} s={14} f={C.primary} o={easeOut(seg(t, 3.0, 3.3))}>
        control chart
      </T>
      <T x={400} y={210} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.3))}>
        catches the step
      </T>
      <line x1={30} y1={84} x2={570} y2={84} stroke={C.line} opacity={0.5} />
      <line x1={30} y1={160} x2={570} y2={160} stroke={C.line} opacity={0.5} />
    </Svg>
  );
}

// 5 · A grid of series, each with its own state block: 200,000 × 256 B = 51.2 MB. A few expire on TTL; new ones arrive
// empty and quiet. One fills its 24-point history and arms; another borrows a neighbour's baseline.
export function RevealStateSizing({ t }: StepCtx) {
  const ttl = easeOut(seg(t, 1.8, 2.3));
  const born = easeOut(seg(t, 2.4, 2.8));
  const hist = seg(t, 2.9, 4.0);
  const borrow = easeInOut(seg(t, 3.4, 4.0));
  const EXP = [5, 22, 41];
  const NEW = [5, 41];
  return (
    <Svg label="one baseline per series, churn and a cold start" h={210}>
      {Array.from({ length: 54 }, (_, i) => {
        const x = 30 + (i % 9) * 30;
        const y = 24 + Math.floor(i / 9) * 22;
        const dead = EXP.includes(i);
        const isNew = NEW.includes(i) && born > 0;
        const armed = i === 5 && hist >= 1;
        if (dead && isNew) {
          const fillW = i === 5 ? 22 * Math.min(1, hist) : 0;
          return (
            <g key={i} opacity={born}>
              <rect x={x} y={y} width={22} height={14} rx={2} fill="none" stroke={armed ? C.focus : C.quiet} strokeDasharray={armed ? undefined : '3 2'} />
              {fillW > 0 && <rect x={x} y={y} width={fillW} height={14} rx={2} fill={armed ? C.focus : C.quiet} />}
              {i === 41 && borrow > 0 && <rect x={x} y={y} width={22} height={14} rx={2} fill={C.second} opacity={borrow} />}
            </g>
          );
        }
        return <rect key={i} x={x} y={y} width={22} height={14} rx={2} fill={C.quiet} opacity={easeOut(seg(t, 0, 0.5)) * (dead ? 1 - ttl : 1)} />;
      })}
      {borrow > 0 && <path d={`M${30 + 4 * 30 + 11} ${24 + 4 * 22 + 7} L${lerp(30 + 4 * 30 + 11, 30 + 5 * 30 + 4, borrow)} ${24 + 4 * 22 + 7}`} stroke={C.second} strokeWidth={2} />}
      <Line2 y={40} l="series" r="200,000" lx={330} o={easeOut(seg(t, 0.6, 0.9))} />
      <Line2 y={68} l="× state" r="256 B" lx={330} o={easeOut(seg(t, 0.9, 1.2))} />
      <line x1={330} y1={80} x2={575} y2={80} stroke={C.line} opacity={easeOut(seg(t, 1.2, 1.4))} />
      <Line2 y={104} l="keyed state" r="51.2 MB" lx={330} lc={C.focus} o={easeOut(seg(t, 1.2, 1.5))} />
      <Line2 y={140} l="churn" r="state TTL" lx={330} o={ttl} />
      <Line2 y={168} l="arm after" r={`${Math.round(24 * Math.min(1, hist))} points`} lx={330} o={easeOut(seg(t, 2.9, 3.2))} />
      <T x={30} y={192} s={13} f={C.second} o={easeOut(seg(t, 3.7, 4.1))}>
        or borrow a neighbour's
      </T>
    </Svg>
  );
}

// 6 · One condition fires over and over, then folds into one alert bar with a duration. Three machines' alerts slide
// under their shared line. A changeover window shades in and its ramp firings go quiet.
export function RevealDedupGrouping({ t }: StepCtx) {
  const fold = easeInOut(seg(t, 0.9, 1.5));
  const group = easeInOut(seg(t, 2.0, 2.7));
  const sup = easeOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="one condition, one cause, one alert" h={240}>
      <T x={30} y={28} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        one condition
      </T>
      {fold < 1 &&
        Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={lerp(160 + i * 34, 160, fold)} y={16} width={8} height={16} fill={C.badText} opacity={easeOut(seg(t, i * 0.05, 0.2 + i * 0.05)) * (1 - fold * 0.5)} />
        ))}
      {fold > 0 && <rect x={160} y={18} width={Math.max(0, 382 * fold)} height={12} rx={2} fill={C.bad} stroke={C.badText} />}
      <T x={575} y={54} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.4, 1.7))}>
        one alert, with a duration
      </T>
      {[0, 1, 2].map((i) => {
        const x0 = 30 + i * 130;
        return <Box key={i} x={lerp(x0, 250, group)} y={lerp(80, 120, group)} w={120} h={26} label={`machine ${i + 1}`} stroke={group > 0.9 ? C.line : C.badText} f={group > 0.9 ? C.primary : C.badText} o={easeOut(seg(t, 1.8 + i * 0.1, 2.0 + i * 0.1)) * (group > 0.9 && i > 0 ? 0 : 1)} />;
      })}
      {group > 0.9 && (
        <g opacity={easeOut(seg(t, 2.7, 3.0))}>
          <rect x={240} y={112} width={330} height={42} rx={6} fill="none" stroke={C.badText} strokeWidth={1.6} />
          <T x={380} y={137} s={13} f={C.secondary}>
            + 2 more
          </T>
          <T x={575} y={104} s={13} f={C.badText} a="end">
            one cause: the same line
          </T>
        </g>
      )}
      <line x1={30} y1={210} x2={570} y2={210} stroke={C.line} opacity={easeOut(seg(t, 2.8, 3.0))} />
      {sup > 0 && <rect x={200} y={176} width={200} height={34} fill={C.band} opacity={sup} />}
      {[220, 260, 300, 340, 380].map((x, i) => (
        <rect key={x} x={x} y={190} width={8} height={18} fill={sup > 0.5 ? C.quiet : C.badText} opacity={easeOut(seg(t, 2.9 + i * 0.05, 3.1 + i * 0.05)) * (sup > 0.5 ? 0.4 : 1)} />
      ))}
      <T x={300} y={232} s={13} f={C.secondary} a="middle" o={sup}>
        changeover: suppressed
      </T>
    </Svg>
  );
}

// 7 · A row of alerts. As first built, most go unanswered and the precision needle sits low beside its target. With
// grouping and suppression the row thins, nearly every alert gets acted on, and the needle and the acted-on bar climb.
export function RevealPrecisionMetric({ t }: StepCtx) {
  const fix = easeInOut(seg(t, 2.2, 3.2));
  const ACT0 = [2, 7];
  const ACT1 = [0, 1, 2, 3];
  const p = lerp(0.2, 0.9, fix);
  const cx = 470;
  const cy = 120;
  const r = 70;
  const ang = Math.PI * (1 - p);
  return (
    <Svg label="measured by precision, not by how often it fires" h={210}>
      {Array.from({ length: 10 }, (_, i) => {
        const keep = i < 4;
        const acted = fix > 0.5 ? ACT1.includes(i) : ACT0.includes(i);
        const o = easeOut(seg(t, i * 0.06, 0.3 + i * 0.06)) * (keep ? 1 : 1 - fix);
        return o > 0 ? (
          <g key={i} opacity={o}>
            <rect x={30 + (i % 5) * 64} y={40 + Math.floor(i / 5) * 40} width={54} height={26} rx={3} fill={acted ? C.panel : C.band} stroke={acted ? C.focus : C.line} />
            {acted && <path d={`M${50 + (i % 5) * 64} ${53 + Math.floor(i / 5) * 40} l5 5 l10 -11`} fill="none" stroke={C.focus} strokeWidth={2} />}
          </g>
        ) : null;
      })}
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={C.band} strokeWidth={8} />
        <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + Math.cos(ang) * r} ${cy - Math.sin(ang) * r}`} fill="none" stroke={fix > 0.5 ? C.focus : C.badText} strokeWidth={8} />
        <line x1={cx} y1={cy} x2={cx + Math.cos(Math.PI * 0.2) * (r + 8)} y2={cy - Math.sin(Math.PI * 0.2) * (r + 8)} stroke={C.second} strokeWidth={2} />
        <line x1={cx} y1={cy} x2={cx + Math.cos(ang) * r * 0.8} y2={cy - Math.sin(ang) * r * 0.8} stroke={C.focus} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={4} fill={C.focus} />
        <T x={cx} y={146} s={14} f={C.focus} a="middle">
          precision
        </T>
        <T x={cx + 64} y={58} s={13} f={C.second} a="middle">
          target
        </T>
      </g>
      <Line2 y={178} l="acted on" r={fix > 0.5 ? 'nearly all' : 'few'} lc={C.secondary} rc={fix > 0.5 ? C.focus : C.badText} o={easeOut(seg(t, 1.2, 1.6))} lx={30} />
      <T x={30} y={204} s={13} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        untrusted is worse than none
      </T>
    </Svg>
  );
}

// 8 · History on one axis with labelled incidents. A split line divides a tuning period from a later test period. In
// tuning, a threshold slides into place; then the replay crosses the test period, and its flag lands on the labelled
// step with nothing else fired: precision 1.0 on the held-out segment.
export function RevealBacktest({ t }: StepCtx) {
  const tune = easeInOut(seg(t, 0.8, 1.8));
  const replay = seg(t, 2.2, 3.6);
  const SPLIT = 330;
  const INC = [120, 230, 450];
  const thrY = lerp(70, 92, tune);
  const sx = SPLIT + replay * 240;
  return (
    <Svg label="replayed over history, scored on a later period" h={210}>
      <rect x={SPLIT} y={30} width={240} height={110} fill={C.band} opacity={easeOut(seg(t, 0.4, 0.7)) * 0.6} />
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        tune
      </T>
      <T x={SPLIT + 10} y={24} s={13} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        test, untouched
      </T>
      <line x1={SPLIT} y1={20} x2={SPLIT} y2={150} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={30} y1={140} x2={570} y2={140} stroke={C.line} />
      {INC.map((x, i) => (
        <path key={x} d={`M${x} 140 l-6 12 l12 0 z`} fill={C.badText} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <line x1={30} y1={thrY} x2={SPLIT} y2={thrY} stroke={C.second} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.8, 1.0))} />
      {replay > 0 && <line x1={SPLIT} y1={thrY} x2={sx} y2={thrY} stroke={C.second} strokeDasharray="5 4" />}
      {replay > 0 && replay < 1 && <line x1={sx} y1={30} x2={sx} y2={140} stroke={C.focus} strokeWidth={1.4} />}
      {sx > 446 && (
        <g>
          <line x1={446} y1={thrY} x2={446} y2={136} stroke={C.focus} strokeWidth={2} />
          <circle cx={446} cy={thrY} r={5} fill={C.focus} />
          <T x={438} y={thrY - 10} s={13} f={C.focus} a="end">
            flagged early
          </T>
        </g>
      )}
      <Line2 y={182} l="labelled incidents" r={replay >= 1 ? 'precision 1.0' : 'scoring…'} lc={C.secondary} o={easeOut(seg(t, 2.2, 2.6))} />
      <T x={575} y={204} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 3.8, 4.2))}>
        on the later period
      </T>
    </Svg>
  );
}

// 9 · Six rows, each with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['two consumers', 'each its own need'],
    ['three baselines', 'three failure modes', C.second],
    ['per-series state', 'sized, cold-started'],
    ['alerts', 'deduped, grouped'],
    ['precision', "the detector's metric"],
    ['backtest', 'before go-live'],
  ];
  return (
    <Svg label="two consumers, three baselines, sized state, grouped alerts" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 34 + i * 47;
        const at = i * 0.55;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && <path d={`M30 ${y - 8} L60 ${y - 8} M60 ${y - 8} L80 ${y - 16} L108 ${y - 16} M60 ${y - 8} L80 ${y} L108 ${y}`} fill="none" stroke={C.focus} strokeWidth={1.5} />}
            {i === 1 && <polyline points={poly(DRIFT.slice(0, 26).map((v, j) => [30 + j * 3, y - 2 - v * 3]))} fill="none" stroke={C.second} strokeWidth={1.4} />}
            {i === 2 && [0, 1, 2, 3, 4].map((j) => <rect key={j} x={30 + j * 16} y={y - 14} width={12} height={12} rx={2} fill={j === 4 ? 'none' : C.quiet} stroke={j === 4 ? C.quiet : 'none'} strokeDasharray="2 2" />)}
            {i === 3 && <rect x={30} y={y - 12} width={78} height={10} rx={2} fill={C.bad} stroke={C.badText} />}
            {i === 4 && (
              <g>
                <path d={`M40 ${y} A30 30 0 0 1 100 ${y}`} fill="none" stroke={C.band} strokeWidth={5} />
                <path d={`M40 ${y} A30 30 0 0 1 92 ${y - 15}`} fill="none" stroke={C.focus} strokeWidth={5} />
              </g>
            )}
            {i === 5 && (
              <g>
                <line x1={30} y1={y - 4} x2={108} y2={y - 4} stroke={C.line} />
                <line x1={70} y1={y - 18} x2={70} y2={y} stroke={C.focus} strokeWidth={1.6} />
                <rect x={70} y={y - 18} width={38} height={14} fill={C.band} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Ten times the series. Each baseline stays as accurate (ticks hold); the keyed state climbs from 51.2 MB to 512 MB
// and the cold-start cells multiply. After the answer, those rows are boxed as the next bottleneck and "less accurate
// baselines" is struck.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const g = easeInOut(seg(t, 0.6, 2.4));
  const k = Math.round(lerp(1, 10, g));
  const mb = lerp(51.2, 512, g);
  const box = on ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const cut = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const cold = Math.round(lerp(2, 20, g));
  return (
    <Svg label="ten times the series; what actually moves?" h={250}>
      <Line2 y={34} l="series" r={`×${k}`} lc={C.primary} o={easeOut(seg(t, 0, 0.4))} />
      <Line2 y={80} l="each baseline" r="as accurate" lc={C.primary} o={easeOut(seg(t, 0.2, 0.6))} />
      <Line2 y={130} l="keyed state" r={`${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`} lc={C.primary} o={easeOut(seg(t, 0.4, 0.8))} />
      <rect x={200} y={120} width={Math.max(0, 200 * (mb / 512))} height={10} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <Line2 y={174} l="cold starts" r="climb" lc={C.primary} o={easeOut(seg(t, 0.6, 1.0))} />
      {Array.from({ length: cold }, (_, i) => (
        <rect key={i} x={200 + (i % 10) * 20} y={160 + Math.floor(i / 10) * 9} width={14} height={7} rx={1} fill="none" stroke={C.quiet} strokeDasharray="2 2" />
      ))}
      {box > 0 && <rect x={20} y={108} width={560} height={82} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={box} />}
      {on ? (
        <g>
          <T x={30} y={228} s={14} f={C.focus} o={box}>
            next bottleneck
          </T>
          <T x={575} y={228} s={13} f={C.secondary} a="end" o={cut}>
            less accurate baselines
          </T>
          {cut > 0 && <line x1={360} y1={223} x2={lerp(360, 577, cut)} y2={223} stroke={C.badText} strokeWidth={2} />}
        </g>
      ) : (
        <T x={300} y={228} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          what grows with the series count?
        </T>
      )}
    </Svg>
  );
}
