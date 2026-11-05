import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 17: two pipeline strips, Kappa (one path, a replay arrow looping back through the log) and Lambda
// (two paths merging at serving); a drift panel running both paths over one stream and diverging at the planted
// edge case (the gap counted up, red); a decision card of the four conditions with the shop's numbers against each
// threshold. examples.py's stream: refunds p1 10, p1 5 after midnight, p2 20, so Kappa gives p1 −15 and the batch
// −10 (gap 5, p2 equal); replay at 50 a day against a flat 2,000 batch crosses at 40 days; thresholds are a late-data
// tail over 7 days, reprocessing over 90 days, a huge-dimension join, a compliance restatement; a 10-day tail meets one.

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

const REFUNDS = [
  { label: 'p1 −10', x: 60, late: false },
  { label: 'p2 −20', x: 160, late: false },
  { label: 'p1 −5', x: 380, late: true },
];

// 1 · Three refunds arrive, the last one after a dashed midnight line. Each drops into the stream lane; the batch lane
// takes the first two but pushes the late one off to "next day". Then the two p1 totals sit side by side, unequal.
export function Hook({ t }: StepCtx) {
  const tot = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="streaming and batch disagree on one product's revenue for days" h={270}>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <line x1={300} y1={14} x2={300} y2={170} stroke={C.secondary} strokeDasharray="4 4" />
        <T x={306} y={24} s={13} f={C.secondary}>
          midnight
        </T>
      </g>
      <T x={30} y={104} s={13} f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        stream
      </T>
      <line x1={30} y1={110} x2={560} y2={110} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={30} y={154} s={13} f={C.second} o={easeOut(seg(t, 0, 0.3))}>
        batch
      </T>
      <line x1={30} y1={160} x2={560} y2={160} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {REFUNDS.map((r, i) => {
        const at = 0.4 + i * 0.5;
        const k = easeOut(seg(t, at, at + 0.3));
        const dropS = easeInOut(seg(t, at + 0.3, at + 0.7));
        const dropB = easeInOut(seg(t, at + 0.5, at + 0.9));
        if (k <= 0) return null;
        return (
          <g key={r.label}>
            <Box x={r.x} y={36} w={80} h={24} label={r.label} o={k} lit={r.late} />
            {dropS > 0 && <rect x={r.x + 30} y={lerp(62, 104, dropS)} width={20} height={12} rx={2} fill={C.focus} />}
            {dropB > 0 &&
              (r.late ? (
                <g opacity={dropB}>
                  <rect x={r.x + 30 + 50 * dropB} y={154} width={20} height={12} rx={2} fill="none" stroke={C.second} strokeDasharray="3 2" />
                  <T x={r.x + 40 + 50 * dropB} y={186} s={13} f={C.second} a="middle">
                    next day
                  </T>
                </g>
              ) : (
                <rect x={r.x + 30} y={lerp(62, 154, dropB)} width={20} height={12} rx={2} fill={C.second} />
              ))}
          </g>
        );
      })}
      {tot > 0 && (
        <g opacity={tot}>
          <T x={575} y={104} s={14} f={C.focus} a="end">
            p1: −15
          </T>
          <T x={575} y={154} s={14} f={C.second} a="end">
            p1: −10
          </T>
        </g>
      )}
      <Line2 y={226} l="for several days" r="two answers" rc={C.badText} o={easeOut(seg(t, 3.2, 3.6))} />
      <Line2 y={252} l="which is right?" r="nobody could say" rc={C.badText} o={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

const GAUGES = [
  { l: 'late-data tail', v: 1, max: 7, unit: 'days' },
  { l: 'reprocessing', v: 5, max: 90, unit: 'days' },
];

// 2 · A Lambda strip with its batch lane marked "cut?". After the pick, two threshold rows show when pure streaming is
// enough (a tail and a reprocessing volume under their lines, checked), and a third row turns red: a restatement past the log's reach is impossible.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="is ripping out the batch layer always right?" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={30} y={30} s={13} f={C.primary}>
          stream
        </T>
        <line x1={100} y1={26} x2={350} y2={44} stroke={C.focus} strokeWidth={1.6} />
        <T x={30} y={66} s={13} f={C.second}>
          batch
        </T>
        <line x1={100} y1={62} x2={350} y2={48} stroke={C.second} strokeWidth={1.6} strokeDasharray={on ? '4 3' : undefined} />
        <Box x={350} y={30} w={90} h={32} label="serve" />
      </g>
      <T x={575} y={66} s={13} f={C.badText} a="end" o={easeOut(seg(t, 0.6, 1.0)) * (on ? 0.4 : 1)}>
        cut it?
      </T>
      {on &&
        GAUGES.map((g, i) => {
          const k = easeOut(seg(s, 0.2 + i * 0.5, 0.6 + i * 0.5));
          const y = 100 + i * 32;
          const W = 200;
          return (
            <g key={g.l} opacity={k}>
              <T x={30} y={y + 12} s={13} f={C.primary}>
                {g.l}
              </T>
              <rect x={180} y={y} width={W} height={14} fill={C.band} />
              <rect x={180} y={y} width={Math.max(0, (W * g.v * k) / g.max)} height={14} fill={C.focus} />
              <line x1={180 + W} y1={y - 4} x2={180 + W} y2={y + 18} stroke={C.secondary} strokeWidth={2} />
              <T x={555} y={y + 12} s={13} f={C.focus} a="end">
                {`under ${g.max} ${g.unit}`}
              </T>
              <Tick x={570} y={y + 6} k={easeOut(seg(s, 0.6 + i * 0.5, 0.9 + i * 0.5))} />
            </g>
          );
        })}
      {on && (
        <g opacity={easeOut(seg(s, 1.6, 2.0))}>
          <T x={30} y={186} s={13} f={C.primary}>
            restatement past the log
          </T>
          <T x={575} y={186} s={13} f={C.badText} a="end">
            impossible
          </T>
        </g>
      )}
    </Svg>
  );
}

// 3 · Design A draws first: log, stream job, serve, and a replay arrow looping from the job back through the log.
// Design B draws below: a stream path and a lake-and-batch path merging at one serve box. Each grows three chips:
// estimate, failure table, cost.
export function RevealTwoDesigns({ t }: StepCtx) {
  const loop = easeInOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="design A, Kappa, one path; design B, Lambda, two paths merged" h={240}>
      <T x={30} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        A · Kappa
      </T>
      <Box x={30} y={34} w={80} h={30} label="log" o={easeOut(seg(t, 0.1, 0.4))} />
      <Box x={150} y={34} w={100} h={30} label="stream" lit o={easeOut(seg(t, 0.3, 0.6))} />
      <Box x={290} y={34} w={80} h={30} label="serve" o={easeOut(seg(t, 0.5, 0.8))} />
      <Draw pts={[[110, 49], [150, 49]]} t={t} from={0.4} to={0.6} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[250, 49], [290, 49]]} t={t} from={0.6} to={0.8} stroke={C.line} w={1.4} pen={false} />
      {loop > 0 && (
        <g>
          <path d={`M200 64 C200 ${64 + 26 * loop} 70 ${64 + 26 * loop} 70 66`} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" />
          <T x={135} y={98} s={13} f={C.focus} a="middle" o={loop}>
            replay
          </T>
        </g>
      )}
      <T x={30} y={126} s={13} f={C.secondary} o={easeOut(seg(t, 1.6, 1.9))}>
        B · Lambda
      </T>
      <Box x={30} y={136} w={80} h={30} label="log" o={easeOut(seg(t, 1.7, 2.0))} />
      <Box x={150} y={136} w={100} h={30} label="stream" o={easeOut(seg(t, 1.8, 2.1))} />
      <Box x={30} y={184} w={80} h={30} label="lake" o={easeOut(seg(t, 2.0, 2.3))} />
      <Box x={150} y={184} w={100} h={30} label="batch" stroke={C.second} f={C.second} o={easeOut(seg(t, 2.1, 2.4))} />
      <Box x={290} y={150} w={80} h={50} label="serve" o={easeOut(seg(t, 2.3, 2.6))} />
      <Draw pts={[[110, 151], [150, 151]]} t={t} from={2.0} to={2.2} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[110, 199], [150, 199]]} t={t} from={2.2} to={2.4} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[250, 151], [290, 165]]} t={t} from={2.4} to={2.6} stroke={C.focus} w={1.4} pen={false} />
      <Draw pts={[[250, 199], [290, 185]]} t={t} from={2.5} to={2.7} stroke={C.second} w={1.4} pen={false} />
      {['estimate', 'failure table', 'cost'].map((c, i) => (
        <g key={c}>
          <Box x={420} y={20 + i * 28} w={150} h={22} label={c} o={easeOut(seg(t, 2.8 + i * 0.15, 3.1 + i * 0.15))} />
          <Box x={420} y={128 + i * 28} w={150} h={22} label={c} o={easeOut(seg(t, 3.3 + i * 0.15, 3.6 + i * 0.15))} />
        </g>
      ))}
    </Svg>
  );
}

const KX = (d: number) => 60 + (d / 120) * 480;
const KY = (c: number) => 160 - (c / 6000) * 130;

// 4 · Kappa's replay cost rises at 50 a day of retained log; Lambda's batch rerun sits flat at 2,000. A marker runs
// along the retention axis and the counter climbs to where the lines cross: 40 days.
export function RevealCrossover({ t }: StepCtx) {
  const run = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="kappa's replay cost and lambda's batch cost cross at a computed length" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))} stroke={C.line}>
        <line x1={60} y1={160} x2={540} y2={160} />
        <line x1={60} y1={24} x2={60} y2={160} />
      </g>
      <T x={66} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        cost to recompute
      </T>
      <Draw pts={[[KX(0), KY(0)], [KX(120), KY(6000)]]} t={t} from={0.3} to={1.2} stroke={C.focus} w={2} />
      <Draw pts={[[KX(0), KY(2000)], [KX(120), KY(2000)]]} t={t} from={0.9} to={1.8} stroke={C.second} w={2} />
      <T x={400} y={50} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        kappa replay · 50 a day
      </T>
      <T x={540} y={KY(2000) + 20} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        lambda batch · 2,000
      </T>
      {run > 0 && (
        <g>
          <circle cx={KX(40 * run)} cy={160} r={4} fill={C.focus} />
          <line x1={KX(40 * run)} y1={160} x2={KX(40 * run)} y2={KY(50 * 40 * run)} stroke={C.secondary} strokeDasharray="3 3" />
          <T x={KX(40)} y={180} s={14} f={run > 0.98 ? C.focus : C.primary} a="middle">
            {`${Math.round(40 * run)} days`}
          </T>
        </g>
      )}
      <Reticle x={KX(40)} y={KY(2000)} w={16} h={16} t={t} at={3.0} />
      <T x={540} y={180} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        retention
      </T>
      <T x={30} y={204} s={13} f={C.secondary} o={easeOut(seg(t, 3.3, 3.7))}>
        below 40 days, replay is cheaper
      </T>
    </Svg>
  );
}

const DX = (v: number) => 120 + v * 12;

// 5 · The same three refunds run through both paths into paired bars per product. p2's bars match at 20. p1's Kappa
// bar reaches 15 and the batch bar stops at 10; the red gap between them counts up to 5: the after-midnight refund.
export function RevealDriftMeasured({ t }: StepCtx) {
  const g1 = easeOut(seg(t, 0.4, 1.4));
  const g2 = easeOut(seg(t, 0.8, 1.8));
  const gap = easeOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="one planted rule difference; the two paths diverge exactly there" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={360} y={14} width={14} height={10} fill={C.focus} />
        <T x={380} y={24} s={13} f={C.secondary}>
          kappa
        </T>
        <rect x={450} y={14} width={14} height={10} fill={C.second} />
        <T x={470} y={24} s={13} f={C.secondary}>
          lambda
        </T>
      </g>
      <T x={30} y={66} s={14} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        p1 refunds
      </T>
      <rect x={120} y={46} width={Math.max(0, 15 * 12 * g1)} height={14} fill={C.focus} />
      <rect x={120} y={64} width={Math.max(0, 10 * 12 * g1)} height={14} fill={C.second} />
      {gap > 0 && (
        <g opacity={gap}>
          <rect x={DX(10)} y={64} width={Math.max(0, 5 * 12 * gap)} height={14} fill={C.bad} stroke={C.badText} />
          <T x={DX(15) + 12} y={76} s={13} f={C.badText}>
            {`gap ${Math.round(5 * gap)}`}
          </T>
          <T x={120} y={98} s={13} f={C.badText}>
            the after-midnight refund
          </T>
        </g>
      )}
      <T x={30} y={136} s={14} f={C.primary} o={easeOut(seg(t, 0.6, 0.9))}>
        p2 refunds
      </T>
      <rect x={120} y={116} width={Math.max(0, 20 * 12 * g2)} height={14} fill={C.focus} />
      <rect x={120} y={134} width={Math.max(0, 20 * 12 * g2)} height={14} fill={C.second} />
      <Tick x={DX(20) + 16} y={128} k={easeOut(seg(t, 1.8, 2.1))} />
      <T x={30} y={194} s={13} f={C.secondary} o={easeOut(seg(t, 3.0, 3.4))}>
        nothing else diverges
      </T>
    </Svg>
  );
}

// 6 · One program box sends its code down to a streaming mode and a batch mode; both produce bars of the same length
// on bounded input and get a match check. Then the batch mode's outline turns dashed pale blue: still a second mode.
export function RevealUnifiedEngine({ t }: StepCtx) {
  const r = easeOut(seg(t, 1.2, 2.0));
  const second = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="one program, two modes, matching results — still two modes to maintain" h={210}>
      <Box x={225} y={14} w={150} label="one program" lit o={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={[[280, 46], [160, 84]]} t={t} from={0.4} to={0.7} stroke={C.secondary} w={1.4} pen={false} />
      <Draw pts={[[320, 46], [440, 84]]} t={t} from={0.5} to={0.8} stroke={C.secondary} w={1.4} pen={false} />
      <Box x={60} y={84} w={200} label="streaming mode" o={easeOut(seg(t, 0.6, 0.9))} />
      <Box x={340} y={84} w={200} label="batch mode" o={easeOut(seg(t, 0.7, 1.0))} stroke={second > 0.5 ? C.second : undefined} dash={second > 0.5 ? '5 3' : undefined} f={second > 0.5 ? C.second : undefined} />
      <rect x={60} y={132} width={Math.max(0, 180 * r)} height={14} fill={C.focus} />
      <rect x={340} y={132} width={Math.max(0, 180 * r)} height={14} fill={second > 0.5 ? C.second : C.focus} />
      <Tick x={300} y={136} k={easeOut(seg(t, 2.0, 2.3))} />
      <T x={300} y={170} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        matching on bounded input
      </T>
      <T x={300} y={198} s={13} f={C.second} a="middle" o={second}>
        still a second path to keep correct
      </T>
    </Svg>
  );
}

const CONDS: [string, string][] = [
  ['late-data tail', 'over 7 days'],
  ['reprocessing', 'over 90 days'],
  ['huge dimension join', 'needed?'],
  ['compliance restatement', 'required?'],
];

// 7 · Four condition cards drop into a two-by-two grid, each showing its threshold.
export function RevealFourConditions({ t }: StepCtx) {
  return (
    <Svg label="four named cases, checked against this pipeline's own numbers" h={210}>
      {CONDS.map(([n, th], i) => {
        const k = easeOutBack(seg(t, 0.3 + i * 0.45, 0.7 + i * 0.45));
        if (k <= 0) return null;
        const x = 30 + (i % 2) * 280;
        const y = 20 + Math.floor(i / 2) * 75 + (1 - Math.min(1, k)) * -12;
        return (
          <g key={n} opacity={Math.min(1, k)}>
            <rect x={x} y={y} width={260} height={60} rx={4} fill={C.panel} stroke={C.focus} />
            <T x={x + 14} y={y + 24} s={13} f={C.primary}>
              {n}
            </T>
            <T x={x + 14} y={y + 46} s={14} f={C.focus}>
              {th}
            </T>
          </g>
        );
      })}
      <T x={300} y={196} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        any one met keeps the batch layer
      </T>
    </Svg>
  );
}

const CARD: [string, string, boolean][] = [
  ['late-data tail', '10 days, over 7', true],
  ['reprocessing', '5 days, under 90', false],
  ['dimension join', 'not needed', false],
  ['restatement', 'not required', false],
];

// 8 · A decision card fills row by row: each condition, this pipeline's number, and a check where it is met. One row
// is met, so the verdict lights: the batch layer stays.
export function RevealDecisionCard({ t }: StepCtx) {
  return (
    <Svg label="a decision card checks each of the four conditions against this pipeline" h={210}>
      <rect x={30} y={14} width={540} height={150} rx={6} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {CARD.map(([n, v, met], i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.5, 0.7 + i * 0.5));
        const y = 44 + i * 32;
        return (
          <g key={n} opacity={k}>
            <T x={46} y={y} s={13} f={C.primary}>
              {n}
            </T>
            <T x={520} y={y} s={13} f={met ? C.focus : C.secondary} a="end">
              {v}
            </T>
            {met ? <Tick x={548} y={y - 5} k={easeOut(seg(t, 0.7 + i * 0.5, 1.0 + i * 0.5))} /> : <line x1={541} y1={y - 5} x2={555} y2={y - 5} stroke={C.line} strokeWidth={2} opacity={k} />}
          </g>
        );
      })}
      <Line2 y={196} l="one condition met" r="the batch layer stays" o={easeOut(seg(t, 2.6, 3.0))} />
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['two designs', 'each priced'],
    ['crossover', '40 days'],
    ['drift', 'measured at the planted case', C.badText],
    ['unified engine', 'still a second mode', C.second],
    ['batch layer', 'four conditions'],
  ];
  return (
    <Svg label="two priced designs, a crossover, measured drift, a unified engine, four conditions" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <line x1={30} y1={y - 12} x2={108} y2={y - 12} stroke={C.focus} strokeWidth={2} />
                <line x1={30} y1={y - 2} x2={70} y2={y - 2} stroke={C.second} strokeWidth={2} />
                <line x1={70} y1={y - 2} x2={108} y2={y - 10} stroke={C.second} strokeWidth={2} />
              </g>
            )}
            {i === 1 && (
              <g strokeWidth={1.6}>
                <line x1={30} y1={y + 2} x2={108} y2={y - 18} stroke={C.focus} />
                <line x1={30} y1={y - 8} x2={108} y2={y - 8} stroke={C.second} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={30} y={y - 16} width={78} height={7} fill={C.focus} />
                <rect x={30} y={y - 6} width={52} height={7} fill={C.second} />
                <rect x={82} y={y - 6} width={26} height={7} fill={C.bad} stroke={C.badText} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 14} width={34} height={16} rx={2} fill="none" stroke={C.focus} />
                <rect x={74} y={y - 14} width={34} height={16} rx={2} fill="none" stroke={C.second} strokeDasharray="3 2" />
              </g>
            )}
            {i === 4 && [0, 1, 2, 3].map((j) => <rect key={j} x={30 + j * 20} y={y - 14} width={16} height={16} rx={2} fill={j === 0 ? C.focus : C.panel} stroke={C.line} />)}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · A short retained-log window beside a huge historical dimension; the join arrow between them fails red. Before
// the pick a dashed "extend retention?" chip waits. After, the window stretches, still nowhere near, and dims; then the
// decision card's dimension-join row lights as met and the "check the four conditions" chip takes over.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const stretch = on ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const dim = on ? easeOut(seg(s, 1.1, 1.4)) : 0;
  const row = on ? easeOut(seg(s, 1.5, 1.9)) : 0;
  const w = lerp(110, 180, stretch);
  return (
    <Svg label="a huge-dimension join; check the four conditions, don't extend retention" h={250}>
      <T x={30} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        retained log
      </T>
      <rect x={30} y={34} width={w} height={30} rx={3} fill={C.primary} opacity={easeOut(seg(t, 0, 0.3)) * (1 - 0.5 * dim)} />
      {stretch > 0.3 && (
        <T x={30} y={84} s={13} f={C.badText} o={easeOut(seg(s, 0.6, 0.9)) * (1 - dim)}>
          storage and throughput
        </T>
      )}
      <T x={300} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        historical dimension
      </T>
      <rect x={300} y={34} width={270} height={70} rx={3} fill={C.band} stroke={C.focus} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={30 + w + 6} y1={49} x2={294} y2={60} stroke={C.badText} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={250} y={56} k={easeOut(seg(t, 1.0, 1.3))} />
      {row > 0 && (
        <g opacity={row}>
          <rect x={30} y={120} width={540} height={30} rx={4} fill={C.panel} stroke={C.focus} />
          <T x={46} y={140} s={13} f={C.primary}>
            huge dimension join
          </T>
          <T x={530} y={140} s={13} f={C.focus} a="end">
            met
          </T>
          <Tick x={552} y={135} k={easeOut(seg(s, 1.8, 2.1))} />
        </g>
      )}
      <Box x={30} y={176} w={250} label="extend retention?" dash="4 3" o={easeOut(seg(t, 1.2, 1.6)) * (1 - 0.6 * dim)} />
      <Box x={320} y={176} w={250} label="check the four conditions" lit o={on ? easeOut(seg(s, 2.0, 2.4)) : 0} />
      <T x={300} y={238} s={13} f={C.secondary} a="middle" o={on ? easeOut(seg(s, 2.3, 2.7)) : 0}>
        a threshold that already exists
      </T>
    </Svg>
  );
}
