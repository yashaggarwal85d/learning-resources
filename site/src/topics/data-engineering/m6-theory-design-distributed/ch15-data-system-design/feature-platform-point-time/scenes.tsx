import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 23: a timeline for one customer with a feature value that changes over time; the training row for
// a click draws a vertical line and the join picks the value to the left (correct, white) versus the latest value to
// the right (leakage, red); the two training sets scored against a held-out future, the leaking one's bar towering; a
// parity strip comparing online and offline values and flagging mismatches. examples.py (seed 11): 4,000 clicks, the
// as-of join scores 39.8% and the latest-value join 70.4%; parity: 14 of 500 sampled pairs disagree (2.8%); checking
// every entity costs 100 against 1 for a 1% sample, 1,000 against 10 at ten times; a 1,000,000-row backfill costs 50.

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

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

// 1 · The offline score bar climbs to 70.4%; the online lift stays a flat line. Below, one customer's timeline: the
// feature was computed from the table as it is now, and its bracket reaches past the click, so the orders placed after
// the click turn red: they were counted.
export function Hook({ t }: StepCtx) {
  const off = easeOut(seg(t, 0.2, 1.0));
  const on = easeOut(seg(t, 0.8, 1.2));
  const line = easeOut(seg(t, 1.4, 1.7));
  const br = seg(t, 2.3, 3.0);
  const red = easeOut(seg(t, 3.2, 3.6));
  const ORD = [90, 150, 290, 360, 470];
  const CLICK = 220;
  return (
    <Svg label="a strong offline score, a flat online lift" h={270}>
      <T x={30} y={40} s={14} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        offline score
      </T>
      <rect x={170} y={29} width={Math.max(0, 300 * 0.704 * off)} height={12} rx={2} fill={C.focus} />
      <T x={575} y={40} s={14} f={C.focus} a="end" o={off}>
        {`${(70.4 * off).toFixed(1)}%`}
      </T>
      <T x={30} y={80} s={14} f={C.secondary} o={on}>
        online lift
      </T>
      <line x1={170} y1={75} x2={470} y2={75} stroke={C.badText} strokeWidth={2} opacity={on} />
      <T x={575} y={80} s={14} f={C.badText} a="end" o={on}>
        none
      </T>
      <line x1={30} y1={170} x2={570} y2={170} stroke={C.line} opacity={line} />
      {line > 0 && (
        <g opacity={line}>
          <line x1={CLICK} y1={124} x2={CLICK} y2={180} stroke={C.focus} strokeWidth={1.6} />
          <T x={CLICK} y={118} s={13} f={C.focus} a="middle">
            click
          </T>
          <T x={560} y={196} s={13} f={C.secondary} a="middle">
            now
          </T>
        </g>
      )}
      {ORD.map((x, i) => {
        const after = x > CLICK;
        return <circle key={x} cx={x} cy={170} r={5} fill={after && red > 0 ? C.badText : C.primary} opacity={easeOut(seg(t, 1.6 + i * 0.1, 1.9 + i * 0.1))} />;
      })}
      {br > 0 && (
        <g>
          <path d={`M60 150 L60 144 L${lerp(60, 560, easeInOut(br))} 144 L${lerp(60, 560, easeInOut(br))} 150`} fill="none" stroke={C.second} strokeWidth={1.5} />
          <T x={60} y={136} s={13} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
            computed from now
          </T>
        </g>
      )}
      {red > 0 && <rect x={CLICK + 4} y={160} width={336} height={20} fill={C.bad} opacity={0.3 * red} />}
      <T x={30} y={236} s={13} f={C.badText} o={easeOut(seg(t, 3.6, 4.0))}>
        orders after the click, counted
      </T>
      <T x={30} y={258} s={13} f={C.secondary} o={easeOut(seg(t, 4.1, 4.5))}>
        the training row saw the future
      </T>
    </Svg>
  );
}

// 2 · A click on a feature's timeline, and a "?" for which value to join. After the answer: the future past the click
// shades in, the latest-value join is struck, and the as-of join lands on the value just left of the click.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fut = on ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const cut = on ? easeOut(seg(s, 0.7, 1.1)) : 0;
  const asof = on ? easeInOut(seg(s, 1.1, 1.7)) : 0;
  const STEPS: [number, number][] = [
    [30, 110],
    [130, 96],
    [250, 84],
    [380, 70],
    [480, 58],
  ];
  const path = STEPS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${i === 0 ? y : STEPS[i - 1][1]} L${x} ${y}`).join(' ') + ' L570 58';
  return (
    <Svg label="what single join rule prevents this?" h={210}>
      {fut > 0 && <rect x={300} y={40} width={270} height={90} fill={C.bad} opacity={0.25 * fut} />}
      {fut > 0 && (
        <T x={435} y={124} s={13} f={C.badText} a="middle" o={fut}>
          the future
        </T>
      )}
      <path d={path} fill="none" stroke={C.primary} strokeWidth={1.6} opacity={easeOut(seg(t, 0, 0.5))} />
      <line x1={300} y1={36} x2={300} y2={136} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={300} y={28} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        click
      </T>
      {!on && (
        <T x={300} y={160} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 0.9, 1.3))}>
          ?
        </T>
      )}
      {on && <circle cx={540} cy={58} r={6} fill="none" stroke={C.badText} strokeWidth={2} opacity={fut} />}
      <Cross x={540} y={84} k={cut} />
      {asof > 0 && (
        <g>
          <circle cx={lerp(300, 285, asof)} cy={84} r={6} fill={C.focus} />
          <Box x={110} y={140} w={190} h={28} label="as of the click" lit o={easeOut(seg(s, 1.5, 1.9))} />
        </g>
      )}
      <T x={30} y={198} s={14} f={on ? C.focus : C.secondary} o={on ? easeOut(seg(s, 1.8, 2.2)) : easeOut(seg(t, 1.2, 1.6))}>
        {on ? "never later than the event" : 'a strong score, a flat lift'}
      </T>
    </Svg>
  );
}

// 3 · Two copies of the feature, one for training and one for serving, disagree. They merge into one definition, which
// then compiles down two paths: batch over history into the offline store, incremental into the online store.
export function RevealOneDefinition({ t }: StepCtx) {
  const merge = easeInOut(seg(t, 0.9, 1.6));
  const paths = seg(t, 1.8, 3.2);
  const tok = seg(t, 3.3, 4.3);
  return (
    <Svg label="one feature definition, two computations" h={210}>
      {merge < 1 ? (
        <g>
          <Box x={lerp(30, 200, merge)} y={20} w={200} h={30} label="training version" o={easeOut(seg(t, 0, 0.3))} />
          <Box x={lerp(370, 200, merge)} y={20} w={200} h={30} label="serving version" o={easeOut(seg(t, 0.1, 0.4))} />
          {merge <= 0 && (
            <T x={300} y={40} s={16} f={C.badText} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
              ≠
            </T>
          )}
        </g>
      ) : (
        <Box x={200} y={20} w={200} h={30} label="one definition" lit />
      )}
      <Draw pts={[[260, 50], [260, 70], [140, 70], [140, 86]]} t={t} from={1.8} to={2.3} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[340, 50], [340, 70], [460, 70], [460, 86]]} t={t} from={1.8} to={2.3} stroke={C.line} w={1.4} pen={false} />
      <Box x={40} y={86} w={200} h={28} label="batch over history" o={easeOut(seg(t, 2.2, 2.5))} />
      <Box x={360} y={86} w={200} h={28} label="incremental" o={easeOut(seg(t, 2.3, 2.6))} />
      <Draw pts={[[140, 114], [140, 140]]} t={t} from={2.6} to={2.9} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[460, 114], [460, 140]]} t={t} from={2.6} to={2.9} stroke={C.line} w={1.4} pen={false} />
      <Box x={40} y={140} w={200} h={28} label="offline store" lit={paths >= 1} o={easeOut(seg(t, 2.8, 3.1))} />
      <Box x={360} y={140} w={200} h={28} label="online store" lit={paths >= 1} o={easeOut(seg(t, 2.9, 3.2))} />
      {tok > 0 && tok < 1 && (
        <g>
          <circle cx={tok < 0.5 ? lerp(260, 140, tok * 2) : 140} cy={tok < 0.5 ? 70 : lerp(70, 140, (tok - 0.5) * 2)} r={4} fill={C.focus} />
          <circle cx={tok < 0.5 ? lerp(340, 460, tok * 2) : 460} cy={tok < 0.5 ? 70 : lerp(70, 140, (tok - 0.5) * 2)} r={4} fill={C.focus} />
        </g>
      )}
      <T x={140} y={194} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        training reads
      </T>
      <T x={460} y={194} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        serving reads
      </T>
    </Svg>
  );
}

// 4 · Three features, each with its freshness need. A path chip slides in for each one: batch for the daily ones,
// stream for the per-event one. Then one shared logic bar spans both paths.
export function RevealFreshnessChoice({ t }: StepCtx) {
  const F: [string, string, string][] = [
    ['orders_30d', 'once a day', 'batch'],
    ['cart_value', 'every event', 'stream'],
    ['returns_90d', 'once a day', 'batch'],
  ];
  const same = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="batch or streaming, chosen per feature" h={210}>
      {['feature', 'needs', 'path'].map((h, i) => (
        <T key={h} x={[30, 210, 400][i]} y={22} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
          {h}
        </T>
      ))}
      {F.map(([n, need, p], i) => {
        const y = 52 + i * 42;
        const at = 0.4 + i * 0.8;
        const slide = easeOutBack(seg(t, at + 0.4, at + 0.8));
        return (
          <g key={n} opacity={easeOut(seg(t, at, at + 0.3))}>
            <T x={30} y={y + 5} s={14} f={C.primary}>
              {n}
            </T>
            <T x={210} y={y + 5} s={13} f={C.secondary}>
              {need}
            </T>
            {slide > 0 && <Box x={lerp(440, 400, Math.min(1, slide))} y={y - 13} w={150} h={26} label={p} lit={p === 'stream'}  />}
          </g>
        );
      })}
      {same > 0 && (
        <g opacity={same}>
          <path d="M552 52 L564 52 L564 136 L552 136 M552 94 L564 94" fill="none" stroke={C.second} strokeWidth={2} />
          <T x={30} y={196} s={13} f={C.second}>
            the same logic runs on both paths
          </T>
        </g>
      )}
    </Svg>
  );
}

// 5 · A feature's value steps up over time. The click drops a vertical line. The as-of join walks left and lands on the
// value known at the click; the latest-value join runs right into the shaded future and turns red.
export function RevealPointInTimeJoin({ t }: StepCtx) {
  const click = easeOut(seg(t, 0.6, 1.0));
  const asof = easeInOut(seg(t, 1.3, 2.1));
  const late = easeInOut(seg(t, 2.6, 3.4));
  const fut = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="join as of the event, never later" h={240}>
      {fut > 0 && <rect x={300} y={50} width={270} height={120} fill={C.bad} opacity={0.22 * fut} />}
      <Draw pts={[[30, 150], [130, 150], [130, 132], [250, 132], [250, 114], [380, 114], [380, 96], [480, 96], [480, 78], [570, 78]]} t={t} from={0} to={0.6} stroke={C.primary} w={1.6} pen={false} />
      <line x1={30} y1={170} x2={570} y2={170} stroke={C.line} />
      {click > 0 && (
        <g opacity={click}>
          <line x1={300} y1={44} x2={300} y2={176} stroke={C.focus} strokeWidth={1.6} />
          <T x={300} y={36} s={13} f={C.focus} a="middle">
            the event
          </T>
        </g>
      )}
      {asof > 0 && (
        <g>
          <line x1={300} y1={114} x2={lerp(300, 252, asof)} y2={114} stroke={C.focus} strokeWidth={2} />
          <circle cx={lerp(300, 252, asof)} cy={114} r={5} fill={C.focus} />
        </g>
      )}
      <T x={30} y={204} s={14} f={C.focus} o={easeOut(seg(t, 1.9, 2.3))}>
        as of the event
      </T>
      {late > 0 && (
        <g>
          <path d={`M300 128 L${lerp(300, 540, late)} 128`} fill="none" stroke={C.badText} strokeWidth={2} />
          <circle cx={lerp(300, 540, late)} cy={late < 1 ? 128 : 78} r={5} fill={C.badText} />
          {late >= 1 && <line x1={540} y1={128} x2={540} y2={82} stroke={C.badText} strokeWidth={2} />}
        </g>
      )}
      <T x={575} y={204} s={14} f={C.badText} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        latest value
      </T>
      <T x={575} y={228} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.7, 4.1))}>
        reaches into the future
      </T>
    </Svg>
  );
}

// 6 · 4,000 synthetic clicks, one planted feature, joined two ways. Against the held-out future the as-of join scores
// 39.8% and the latest-value join climbs to 70.4%; the bracket between them is the leak, 30.6 points.
export function RevealLeakageMeasured({ t }: StepCtx) {
  const g1 = easeInOut(seg(t, 0.5, 1.4));
  const g2 = easeInOut(seg(t, 1.4, 2.6));
  const gap = easeOut(seg(t, 2.9, 3.4));
  const Y = (p: number) => 170 - p * 1.4;
  const BAR = (x: number, v: number, k: number, bad: boolean) => (
    <g>
      <rect x={x} y={Y(v * k)} width={90} height={Math.max(0, v * k * 1.4)} rx={2} fill={bad ? C.bad : C.focus} stroke={bad ? C.badText : C.focus} />
      {k > 0.05 && (
        <T x={x + 45} y={Y(v * k) - 8} s={14} f={bad ? C.badText : C.focus} a="middle">
          {`${(v * k).toFixed(1)}%`}
        </T>
      )}
    </g>
  );
  return (
    <Svg label="the same feature, two joins, one score inflated" h={210}>
      <T x={30} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        4,000 clicks · scored on a held-out future
      </T>
      <line x1={30} y1={170} x2={330} y2={170} stroke={C.line} />
      {BAR(80, 39.8, g1, false)}
      {BAR(230, 70.4, g2, true)}
      <T x={125} y={192} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        as-of
      </T>
      <T x={275} y={192} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        latest value
      </T>
      {gap > 0 && (
        <g opacity={gap}>
          <line x1={330} y1={Y(39.8)} x2={350} y2={Y(39.8)} stroke={C.focus} strokeDasharray="3 2" />
          <line x1={330} y1={Y(70.4)} x2={350} y2={Y(70.4)} stroke={C.badText} strokeDasharray="3 2" />
          <line x1={350} y1={Y(39.8)} x2={350} y2={Y(70.4)} stroke={C.badText} strokeWidth={2} />
          <T x={364} y={Y(55) - 4} s={14} f={C.badText}>
            the leak
          </T>
          <T x={364} y={Y(55) + 16} s={14} f={C.badText}>
            30.6 points
          </T>
        </g>
      )}
    </Svg>
  );
}

// 7 · Sampled entities in two rows, online over offline. A sweep compares each pair; one in a few dozen disagrees and
// turns red, the count reaching 14 of 500. Below, the mismatch rate runs under its SLO line until an upstream change
// lifts it over, and the alert fires.
export function RevealParitySLO({ t }: StepCtx) {
  const sweep = seg(t, 0.3, 2.0);
  const MIS = [13, 33];
  const n = Math.round(14 * sweep);
  const chart = seg(t, 2.2, 3.8);
  const fire = easeOutBack(seg(t, 3.8, 4.2));
  const rate = (x: number) => (x < 380 ? 158 + Math.sin(x / 13) * 3 : lerp(158, 112, Math.min(1, (x - 380) / 30)) + Math.sin(x / 9) * 2);
  const pts = Array.from({ length: 45 }, (_, i) => [30 + i * 10, rate(30 + i * 10)] as [number, number]);
  const upTo = 30 + chart * 440;
  return (
    <Svg label="online and offline, sampled and watched" h={210}>
      <T x={30} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        online
      </T>
      <T x={30} y={48} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        offline
      </T>
      {Array.from({ length: 46 }, (_, i) => {
        const x = 110 + i * 10;
        const done = sweep * 46 > i;
        const bad = done && MIS.includes(i);
        return (
          <g key={i} opacity={easeOut(seg(t, 0, 0.3))}>
            <rect x={x} y={20} width={7} height={11} fill={bad ? C.badText : done ? C.focus : C.band} />
            <rect x={x} y={38} width={7} height={11} fill={bad ? C.bad : done ? C.quiet : C.band} />
          </g>
        );
      })}
      <Line2 y={76} l="mismatches" r={`${n} of 500 · ${((n / 500) * 100).toFixed(1)}%`} o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={30} y1={130} x2={470} y2={130} stroke={C.second} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.1, 2.4))} />
      <T x={30} y={124} s={13} f={C.second} o={easeOut(seg(t, 2.1, 2.4))}>
        SLO
      </T>
      {chart > 0 && <polyline points={pts.filter(([x]) => x <= upTo).map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={C.primary} strokeWidth={1.6} />}
      {chart > 0 && <polyline points={pts.filter(([x, y]) => x <= upTo && y < 130).map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={C.badText} strokeWidth={2} />}
      <T x={380} y={192} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        an upstream change
      </T>
      {fire > 0 && <Box x={480} y={104} w={95} h={28} label="alert" stroke={C.badText} f={C.badText} o={Math.min(1, fire)} />}
    </Svg>
  );
}

// 8 · Eight past training rows with their existing features. Turning the new feature on from today fills one cell; the
// rest stay empty. The backfill then reconstructs each one from raw history, bottom to top, and a shadow pass ticks
// them off before the column is trusted.
export function RevealBackfill({ t }: StepCtx) {
  const today = easeOut(seg(t, 0.8, 1.2));
  const back = seg(t, 1.6, 3.0);
  const shadow = seg(t, 3.2, 4.0);
  return (
    <Svg label="a new feature, reconstructed backward through history" h={210}>
      <T x={210} y={20} s={13} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        new
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const y = 28 + i * 18;
        const isToday = i === 7;
        const filled = isToday ? today > 0.5 : back * 7 > 6 - i;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.04, 0.3 + i * 0.04))}>
            {[0, 1, 2].map((c) => (
              <rect key={c} x={30 + c * 56} y={y} width={50} height={13} fill={C.band} stroke={C.line} />
            ))}
            <rect x={210} y={y} width={80} height={13} fill={filled ? C.focus : 'none'} stroke={filled ? C.focus : C.quiet} strokeDasharray={filled ? undefined : '3 2'} />
            <Tick x={306} y={y + 6} k={easeOut(seg(shadow, (7 - i) * 0.1, (7 - i) * 0.1 + 0.25))} />
          </g>
        );
      })}
      <T x={340} y={164} s={13} f={C.secondary} o={today}>
        on from today: one row
      </T>
      <rect x={400} y={30} width={170} height={26} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 1.3, 1.6))} />
      <T x={485} y={48} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        raw history
      </T>
      {back > 0 && back < 1 && (
        <line x1={400} y1={43} x2={292} y2={28 + Math.max(0, 6 - Math.floor(back * 7)) * 18 + 6} stroke={C.focus} strokeWidth={1.4} />
      )}
      {shadow > 0 && <Box x={400} y={80} w={170} h={26} label="shadow, validate" lit o={easeOut(seg(t, 3.2, 3.5))} />}
      <Line2 y={198} l="1,000,000 rows" r="backfill cost 50" o={easeOut(seg(t, 3.9, 4.3))} />
    </Svg>
  );
}

// 9 · Six rows, each with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['one definition', 'both stores'],
    ['freshness', 'chosen per feature'],
    ['as-of join', "the event's own time"],
    ['leakage', 'measured', C.badText],
    ['parity', 'a standing SLO', C.second],
    ['backfill', 'planned, shadowed'],
  ];
  return (
    <Svg label="one definition, a join rule, a measured leak, a watched parity" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 34 + i * 47;
        const at = i * 0.55;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g stroke={C.focus} strokeWidth={1.4} fill="none">
                <rect x={50} y={y - 18} width={36} height={8} fill={C.focus} />
                <path d={`M68 ${y - 10} L40 ${y + 2} M68 ${y - 10} L96 ${y + 2}`} />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 14} width={36} height={14} rx={2} fill="none" stroke={C.primary} />
                <rect x={72} y={y - 14} width={36} height={14} rx={2} fill="none" stroke={C.focus} strokeWidth={1.6} />
              </g>
            )}
            {i === 2 && (
              <g>
                <path d={`M30 ${y} L50 ${y} L50 ${y - 8} L80 ${y - 8} L80 ${y - 16} L108 ${y - 16}`} fill="none" stroke={C.primary} />
                <line x1={68} y1={y - 20} x2={68} y2={y + 4} stroke={C.focus} strokeWidth={1.6} />
                <circle cx={66} cy={y - 8} r={3} fill={C.focus} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={40} y={y - 10} width={22} height={10} fill={C.focus} />
                <rect x={70} y={y - 20} width={22} height={20} fill={C.bad} stroke={C.badText} />
              </g>
            )}
            {i === 4 && (
              <g>
                {[0, 1, 2, 3, 4, 5].map((j) => (
                  <rect key={j} x={30 + j * 13} y={y - 14} width={9} height={14} fill={j === 3 ? C.badText : C.quiet} />
                ))}
              </g>
            )}
            {i === 5 && [0, 1, 2].map((j) => <rect key={j} x={30} y={y - 18 + j * 7} width={78} height={5} fill={j === 2 ? C.focus : C.quiet} />)}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Ten times the features. The joins keep ticking correct; the parity check's cost climbs, every entity from 100 to
// 1,000 and a 1% sample from 1 to 10, and the alert volume rises with it. After the answer, those rows are boxed as the
// next bottleneck and "a bigger join" is struck.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const g = easeInOut(seg(t, 0.6, 2.4));
  const k = Math.round(lerp(1, 10, g));
  const box = on ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const cut = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="ten times the features; what actually moves?" h={250}>
      <Line2 y={30} l="features" r={`×${k}`} lc={C.primary} o={easeOut(seg(t, 0, 0.4))} />
      <Line2 y={72} l="joins" r="still correct" lc={C.primary} o={easeOut(seg(t, 0.2, 0.6))} />
      {Array.from({ length: k }, (_, i) => (
        <Tick key={i} x={200 + i * 20} y={66} k={1} />
      ))}
      <Line2 y={122} l="check every entity" r={Math.round(lerp(100, 1000, g)).toLocaleString('en-US')} lc={C.primary} rc={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
      <rect x={250} y={130} width={Math.max(0, 220 * lerp(0.1, 1, g))} height={6} rx={2} fill={C.badText} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <Line2 y={160} l="1% sample" r={`${Math.round(lerp(1, 10, g))}`} lc={C.primary} o={easeOut(seg(t, 0.6, 1.0))} />
      <Line2 y={198} l="alert volume" r="climbs" lc={C.primary} o={easeOut(seg(t, 0.8, 1.2))} />
      {box > 0 && <rect x={20} y={104} width={560} height={104} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={box} />}
      {on ? (
        <g>
          <T x={30} y={238} s={14} f={C.focus} o={box}>
            next bottleneck
          </T>
          <T x={575} y={238} s={13} f={C.secondary} a="end" o={cut}>
            a bigger join
          </T>
          {cut > 0 && <line x1={450} y1={233} x2={lerp(450, 577, cut)} y2={233} stroke={C.badText} strokeWidth={2} />}
        </g>
      ) : (
        <T x={300} y={238} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          what grows with the feature count?
        </T>
      )}
    </Svg>
  );
}
