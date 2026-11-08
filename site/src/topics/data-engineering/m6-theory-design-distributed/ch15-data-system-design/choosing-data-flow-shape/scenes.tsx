import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's decision card for the first time (CHAPTER.md, topic 3): four cards in a row, each with its latency
// floor drawn as a bar on a log axis against the freshness SLO line; a card whose floor pokes above the line turns
// red at the overshoot and dims; the cheapest survivor lifts, with "what would change our mind" underneath; Lambda,
// Kappa and the unified engine arrive as small tags on the cards they belong to. Floors and cost ranks are
// examples.py's DECISION_CARD (batch 60 min, micro-batch 5 min, streaming 0.05 min, hybrid 1 min; cost ranks 1–4),
// the SLO is fifteen minutes, tightened to thirty seconds in "Prove it".

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

type Shape = { name: string; floor: number; floorLabel: string; cost: number };
const BATCH: Shape = { name: 'batch', floor: 60, floorLabel: '60 min', cost: 1 };
const MICRO: Shape = { name: 'micro-batch', floor: 5, floorLabel: '5 min', cost: 2 };
const STREAM: Shape = { name: 'streaming', floor: 0.05, floorLabel: '3 s', cost: 3 };
const HYBRID: Shape = { name: 'hybrid', floor: 1, floorLabel: '1 min', cost: 4 };
const FOUR = [BATCH, MICRO, STREAM, HYBRID];

const CW = 112; // card width
const LO = 0.03, HI = 100; // minutes, the log axis every card shares

/** The vertical scale inside a card whose top is `y` and height `h`: minutes → y. */
const scale = (y: number, h: number) => (v: number) => {
  const r0 = y + 56, r1 = y + h - 34;
  return r1 - ((Math.log10(v) - Math.log10(LO)) / (Math.log10(HI) - Math.log10(LO))) * (r1 - r0);
};

/** One decision card: name, floor, a floor bar against the shared axis (red where it overshoots the SLO), cost. */
function Card({
  x,
  y,
  h = 200,
  shape,
  slo,
  grow = 1,
  dim = 0,
  lift = 0,
  chosen = false,
  costK = 1,
  o = 1,
}: {
  x: number;
  y: number;
  h?: number;
  shape: Shape;
  slo: number;
  grow?: number;
  dim?: number;
  lift?: number;
  chosen?: boolean;
  costK?: number;
  o?: number;
}) {
  if (o <= 0) return null;
  const yOf = scale(y, h);
  const base = y + h - 34;
  const top = lerp(base, yOf(shape.floor), grow);
  const line = yOf(slo);
  const cx = x + CW / 2;
  return (
    <g opacity={o * (1 - 0.65 * dim)} transform={`translate(0 ${-lift})`}>
      <rect x={x} y={y} width={CW} height={h} rx={5} fill={C.panel} stroke={chosen ? C.focus : C.line} strokeWidth={chosen ? 1.8 : 1} />
      <T x={cx} y={y + 22} s={13} f={chosen ? C.focus : C.primary} a="middle" w={600}>
        {shape.name}
      </T>
      <T x={cx} y={y + 42} s={13} f={C.secondary} a="middle">
        {shape.floorLabel}
      </T>
      <rect x={cx - 12} y={Math.max(top, line)} width={24} height={Math.max(0, base - Math.max(top, line))} fill={chosen ? C.focus : C.primary} opacity={0.85} />
      {top < line && <rect x={cx - 12} y={top} width={24} height={line - top} fill={C.bad} stroke={C.badText} strokeWidth={1} />}
      {costK > 0 && (
        <T x={cx} y={y + h - 12} s={14} f={chosen ? C.focus : C.secondary} a="middle" o={costK}>
          {'$'.repeat(shape.cost)}
        </T>
      )}
    </g>
  );
}

/** The SLO line across a row of cards, labelled in the left gutter. */
function SloLine({ y, h, slo, label, t, from, o = 1 }: { y: number; h: number; slo: number; label: string; t: number; from: number; o?: number }) {
  const ly = scale(y, h)(slo);
  return (
    <g opacity={o}>
      <Draw pts={[[18, ly], [580, ly]]} t={t} from={from} to={from + 0.5} stroke={C.focus} w={1.4} pen={false} dash="6 4" />
      <T x={18} y={ly - 8} s={13} f={C.focus} o={easeOut(seg(t, from + 0.3, from + 0.6))}>
        SLO
      </T>
      <T x={18} y={ly + 18} s={13} f={C.focus} o={easeOut(seg(t, from + 0.3, from + 0.6))}>
        {label}
      </T>
    </g>
  );
}

const cardX = (i: number) => 88 + i * 124;

// 1 · Three teams' cards rise against the fifteen-minute line: streaming far under, hourly batch through it in red,
// micro-batch under it with a cheaper price tag.
export function Hook({ t }: StepCtx) {
  const Y = 20, H = 200;
  const three: [Shape, string, string][] = [
    [STREAM, 'clears easily', C.primary],
    [{ ...BATCH, name: 'hourly batch' }, 'far too slow', C.badText],
    [MICRO, 'wins on cost?', C.focus],
  ];
  return (
    <Svg label="three teams propose three shapes for the shop's own fifteen-minute SLO — streaming, hourly batch, five-minute micro-batch" h={270}>
      {three.map(([shape, verdict, f], i) => {
        const x = 110 + i * 150;
        const at = 0.2 + i * 0.35;
        return (
          <g key={shape.name}>
            <Card x={x} y={Y} h={H} shape={shape} slo={15} grow={easeInOut(seg(t, at + 0.2, at + 1.0))} o={easeOut(seg(t, at, at + 0.3))} costK={easeOut(seg(t, 2.6 + i * 0.15, 2.9 + i * 0.15))} chosen={i === 2 && t > 3.4} />
            <T x={x + CW / 2} y={Y + H + 26} s={13} f={f} a="middle" o={easeOut(seg(t, 1.8 + i * 0.25, 2.1 + i * 0.25))}>
              {verdict}
            </T>
          </g>
        );
      })}
      <SloLine y={Y} h={H} slo={15} label="15 min" t={t} from={1.4} />
    </Svg>
  );
}

// 2 · Streaming's bar with a bracket of "room to spare" under the line and an always-on meter spinning; micro-batch
// beside it. After the pick, the price tags land, micro-batch lifts, and the reprocessing caveat appears beneath.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const Y = 14, H = 196;
  const yOf = scale(Y, H);
  const sx = 170, mx = 330;
  const lift = on ? easeOutBack(seg(s, 0.6, 1.1)) * 10 : 0;
  return (
    <Svg label="which proposal clears the SLO at the lowest cost, and what reprocessing question could flip the answer?" h={290}>
      <Card x={sx} y={Y} h={H} shape={STREAM} slo={15} grow={easeOut(seg(t, 0, 0.5))} costK={on ? easeOut(seg(s, 0, 0.4)) : 0} dim={on ? easeOut(seg(s, 0.6, 1.0)) * 0.6 : 0} />
      <Card x={mx} y={Y} h={H} shape={MICRO} slo={15} grow={easeOut(seg(t, 0.1, 0.6))} costK={on ? easeOut(seg(s, 0.2, 0.6)) : 0} chosen={on && s > 0.8} lift={lift} />
      <SloLine y={Y} h={H} slo={15} label="15 min" t={t} from={0.2} />
      {/* room to spare: a bracket from streaming's bar top up to the line */}
      <g opacity={easeOut(seg(t, 0.7, 1.1)) * (on ? 1 - easeOut(seg(s, 0, 0.5)) : 1)}>
        <line x1={sx + CW + 10} y1={yOf(15) + 2} x2={sx + CW + 10} y2={yOf(0.05) - 2} stroke={C.secondary} strokeWidth={1.4} />
        <line x1={sx + CW + 4} y1={yOf(15) + 2} x2={sx + CW + 16} y2={yOf(15) + 2} stroke={C.secondary} strokeWidth={1.4} />
        <line x1={sx + CW + 4} y1={yOf(0.05) - 2} x2={sx + CW + 16} y2={yOf(0.05) - 2} stroke={C.secondary} strokeWidth={1.4} />
      </g>
      {/* the always-on meter */}
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <circle cx={115} cy={Y + H - 60} r={16} fill="none" stroke={C.secondary} strokeWidth={1.4} />
        <line x1={115} y1={Y + H - 60} x2={115 + 12 * Math.cos(t * 4)} y2={Y + H - 60 + 12 * Math.sin(t * 4)} stroke={C.secondary} strokeWidth={1.6} />
      </g>
      {!on && (
        <T x={300} y={250} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          most room to spare = best?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={244} s={14} f={C.primary} o={easeOut(seg(s, 0.4, 0.8))}>
            fastest shape
          </T>
          <T x={575} y={244} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.5, 0.9))}>
            not free
          </T>
          <T x={40} y={272} s={14} f={C.focus} o={easeOut(seg(s, 1.1, 1.5))}>
            cheapest, clears
          </T>
          <T x={575} y={272} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.6, 2.0))}>
            unless reprocessing flips
          </T>
        </>
      )}
    </Svg>
  );
}

// 3 · All four cards; the line is drawn, batch's bar overshoots it in red and the card dims; three survive.
export function RevealDecisionCard({ t }: StepCtx) {
  const Y = 30, H = 220;
  const out = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="four shapes, each with its own latency floor against the fifteen-minute line — any floor above the line dims" h={330}>
      <T x={300} y={18} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        latency floor, log scale
      </T>
      {FOUR.map((shape, i) => (
        <Card
          key={shape.name}
          x={cardX(i)}
          y={Y}
          h={H}
          shape={shape}
          slo={15}
          grow={easeInOut(seg(t, 0.3 + i * 0.2, 1.1 + i * 0.2))}
          o={easeOut(seg(t, i * 0.15, i * 0.15 + 0.3))}
          costK={0}
          dim={i === 0 ? out : 0}
        />
      ))}
      <SloLine y={Y} h={H} slo={15} label="15 min" t={t} from={1.6} />
      <T x={cardX(0) + CW / 2} y={Y + H + 26} s={13} f={C.badText} a="middle" o={out}>
        can't meet it
      </T>
      <T x={cardX(2) + CW / 2} y={Y + H + 26} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        three survive
      </T>
      <Draw pts={[[cardX(1), Y + H + 10], [cardX(3) + CW, Y + H + 10]]} t={t} from={3.0} to={3.5} stroke={C.focus} w={1.4} pen={false} />
    </Svg>
  );
}

// 4 · The three survivors with their price tags counted on; micro-batch lifts, the others dim, and the card's
// second line writes itself: what would change our mind.
export function RevealSurvivorsCompared({ t }: StepCtx) {
  const Y = 20, H = 180;
  const pick = easeOutBack(seg(t, 2.0, 2.5));
  const three: [Shape, string][] = [
    [MICRO, 'every 5 min'],
    [STREAM, 'always on'],
    [HYBRID, 'two systems'],
  ];
  return (
    <Svg label="of the shapes that clear the floor, compare operational burden and replay ease — the cheapest survivor lifts" h={300}>
      {three.map(([shape, burden], i) => {
        const x = 110 + i * 150;
        const isMicro = i === 0;
        return (
          <g key={shape.name}>
            <Card x={x} y={Y} h={H} shape={shape} slo={15} costK={easeOut(seg(t, 0.4 + i * 0.3, 0.8 + i * 0.3))} chosen={isMicro && pick > 0.5} lift={isMicro ? pick * 12 : 0} dim={isMicro ? 0 : easeOut(seg(t, 2.1, 2.5))} />
            <T x={x + CW / 2} y={Y + H + 22} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6 + i * 0.3, 1.0 + i * 0.3)) * (isMicro ? 1 : 1 - 0.5 * easeOut(seg(t, 2.1, 2.5)))}>
              {burden}
            </T>
          </g>
        );
      })}
      <SloLine y={Y} h={H} slo={15} label="15 min" t={t} from={0} />
      <T x={40} y={250} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 2.0))}>
        streaming, hybrid
      </T>
      <T x={575} y={250} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.1))}>
        cost more
      </T>
      <T x={40} y={276} s={14} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))}>
        micro-batch
      </T>
      <T x={575} y={276} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.5, 2.9))}>
        cheapest, wins
      </T>
      <T x={300} y={298} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        what would change our mind: reprocessing cost
      </T>
    </Svg>
  );
}

/** A small tag that flies down onto a card. */
function Tag({ x, y, label, k, f = C.primary }: { x: number; y: number; label: string; k: number; f?: string }) {
  if (k <= 0) return null;
  const w = label.length * 9 + 20;
  return (
    <g opacity={Math.min(1, k)} transform={`translate(0 ${(1 - k) * -24})`}>
      <rect x={x - w / 2} y={y - 15} width={w} height={22} rx={11} fill={C.ink} stroke={f} strokeWidth={1.3} />
      <T x={x} y={y + 1} s={13} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

// 5 · Two cards, hybrid and streaming. Lambda lands on hybrid and two lanes draw beneath it (batch and speed); Kappa
// lands on streaming and a single lane draws over a log tape with a replay loop; the unified engine tag lands beside
// Kappa, one lane, its replay built in.
export function RevealLambdaKappaUnified({ t }: StepCtx) {
  const lx = 150, kx = 450; // card centres
  const tagL = easeOutBack(seg(t, 0.3, 0.7));
  const tagK = easeOutBack(seg(t, 1.6, 2.0));
  const tagU = easeOutBack(seg(t, 3.0, 3.4));
  const loop = easeInOut(seg(t, 2.2, 2.9));
  return (
    <Svg label="Lambda sits on the hybrid card, Kappa sits on the streaming card, a unified engine gets Kappa's shape without hand-rolling replay" h={300}>
      {[
        [lx, 'hybrid'],
        [kx, 'streaming'],
      ].map(([x, name]) => (
        <g key={name as string} opacity={easeOut(seg(t, 0, 0.3))}>
          <rect x={(x as number) - 130} y={20} width={260} height={196} rx={5} fill={C.panel} stroke={C.line} />
          <T x={x as number} y={44} s={13} f={C.primary} a="middle" w={600}>
            {name}
          </T>
        </g>
      ))}
      <Tag x={lx} y={72} label="Lambda" k={tagL} />
      {/* Lambda: a batch lane and a speed lane merging at serve */}
      <Draw pts={[[40, 120], [200, 120], [240, 150]]} t={t} from={0.6} to={1.2} stroke={C.primary} w={2} pen={false} />
      <Draw pts={[[40, 180], [200, 180], [240, 150]]} t={t} from={0.8} to={1.4} stroke={C.second} w={2} pen={false} />
      <T x={44} y={112} s={13} f={C.primary} o={easeOut(seg(t, 0.8, 1.1))}>
        batch code
      </T>
      <T x={44} y={200} s={13} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        speed code
      </T>
      <circle cx={244} cy={150} r={5} fill={C.focus} opacity={easeOut(seg(t, 1.3, 1.5))} />
      {/* Kappa: one log tape, one lane, replay = run the same job again from the start of the log */}
      <Tag x={kx} y={72} label="Kappa" k={tagK} />
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={340 + i * 18} y={170} width={14} height={14} fill="none" stroke={C.secondary} strokeWidth={1} />
        ))}
        <T x={340} y={204} s={13} f={C.secondary}>
          retained log
        </T>
      </g>
      <Draw pts={[[340, 130], [560, 130]]} t={t} from={1.9} to={2.4} stroke={C.primary} w={2} pen={false} />
      <T x={340} y={120} s={13} f={C.primary} o={easeOut(seg(t, 2.0, 2.3))}>
        one job
      </T>
      {loop > 0 && (
        <path
          d={`M ${lerp(560, 350, loop)} 166 Q 450 ${lerp(166, 148, loop)} 560 140`}
          fill="none"
          stroke={C.focus}
          strokeWidth={1.6}
          strokeDasharray="4 3"
        />
      )}
      <T x={560} y={160} s={13} f={C.focus} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        replay
      </T>
      <Tag x={kx} y={250} label="unified engine" k={tagU} f={C.focus} />
      <T x={kx} y={284} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        one path, with replay
      </T>
      <T x={lx} y={250} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.3, 1.7))}>
        two code paths
      </T>
    </Svg>
  );
}

// 6 · Left, Lambda's two code columns: one side gets edited, the twin line turns red until it is re-synced, again
// and again. Right, Kappa's output storage: v1 full, v2 filling beside it during a replay, the pair reaching twice
// the usual, then v1 released.
export function RevealRealCosts({ t }: StepCtx) {
  const cyc = (t % 1.6) / 1.6;
  const edited = Math.floor(t / 1.6) % 4;
  const drift = cyc > 0.15 && cyc < 0.7;
  const v2 = easeInOut(seg(t, 1.2, 2.8));
  const drop = easeInOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="Lambda's cost is keeping two systems' logic in sync, not compute — Kappa's cost is a real, temporary doubling of output storage" h={260}>
      {/* Lambda */}
      <T x={150} y={26} s={14} f={C.primary} a="middle" w={600} o={easeOut(seg(t, 0, 0.3))}>
        Lambda
      </T>
      {[0, 1].map((side) => (
        <g key={side} opacity={easeOut(seg(t, 0.1, 0.4))}>
          <rect x={40 + side * 120} y={42} width={100} height={130} rx={4} fill={C.panel} stroke={C.line} />
          <T x={90 + side * 120} y={190} s={13} f={side ? C.second : C.secondary} a="middle">
            {side ? 'speed' : 'batch'}
          </T>
          {[0, 1, 2, 3].map((r) => {
            const bad = side === 1 && r === edited && drift && t > 0.4;
            const len = [70, 52, 62, 44][r];
            return <rect key={r} x={52 + side * 120} y={58 + r * 28} width={len} height={8} rx={2} fill={bad ? C.badText : side ? C.second : C.secondary} opacity={0.85} />;
          })}
        </g>
      ))}
      <Draw pts={[[140, 100], [160, 100]]} t={t} from={0.4} to={0.6} stroke={C.focus} w={1.6} pen={false} />
      <T x={150} y={226} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        cost: keeping in sync
      </T>
      <T x={150} y={248} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
        not compute
      </T>
      {/* Kappa */}
      <T x={450} y={26} s={14} f={C.primary} a="middle" w={600} o={easeOut(seg(t, 0, 0.3))}>
        Kappa
      </T>
      <line x1={340} y1={172} x2={560} y2={172} stroke={C.line} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={340} y1={102} x2={575} y2={102} stroke={C.quiet} strokeDasharray="3 4" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={575} y={96} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0.9, 1.2))}>
        usual
      </T>
      <rect x={380} y={102 + 70 * drop} width={60} height={70 * (1 - drop)} fill={C.primary} opacity={easeOut(seg(t, 0.9, 1.2)) * 0.85} />
      <T x={410} y={190} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.9, 1.2)) * (1 - drop)}>
        v1
      </T>
      <rect x={460} y={172 - 70 * v2} width={60} height={70 * v2} fill={C.focus} opacity={0.85} />
      <T x={490} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        v2
      </T>
      <T x={450} y={226} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        cost: storage, doubled
      </T>
      <T x={450} y={248} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        during each replay
      </T>
      <Reticle x={450} y={137} w={140} h={84} t={t} at={2.6} />
    </Svg>
  );
}

/** A pager badge that rings when `ring` is on. */
const Pager = ({ x, y, ring, k }: { x: number; y: number; ring: number; k: number }) => (
  <g opacity={k} transform={`translate(${x} ${y}) rotate(${Math.sin(ring * 40) * 10 * (ring > 0 ? 1 : 0)})`}>
    <rect x={-12} y={-9} width={24} height={18} rx={3} fill="none" stroke={C.focus} strokeWidth={1.5} />
    <line x1={-6} y1={-2} x2={6} y2={-2} stroke={C.focus} strokeWidth={1.4} />
    <line x1={-6} y1={3} x2={2} y2={3} stroke={C.focus} strokeWidth={1.4} />
  </g>
);

// 7 · Two lanes between a source and the pipeline. Push: the source throws packets across and the pager sits with the
// source. Pull: the pipeline reaches over with a hook and drags packets back, and the pager moves to the pipeline.
export function RevealPushPull({ t }: StepCtx) {
  const packets = (y: number, dir: 1 | -1, from: number) =>
    [0, 1, 2].map((i) => {
      const u = ((t - from) * 0.7 + i / 3) % 1;
      if (t < from) return null;
      const x = dir === 1 ? lerp(150, 430, u) : lerp(430, 150, u);
      return <rect key={i} x={x - 6} y={y - 6} width={12} height={12} fill={C.primary} />;
    });
  const reach = easeInOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="at each source boundary, someone pushes and owns the schema, or is pulled from and the pipeline owns extraction" h={250}>
      {[60, 160].map((y) => (
        <g key={y} opacity={easeOut(seg(t, 0, 0.3))}>
          <rect x={40} y={y - 28} width={100} height={56} rx={4} fill={C.panel} stroke={C.line} />
          <T x={90} y={y + 5} s={13} f={C.primary} a="middle">
            source
          </T>
          <rect x={440} y={y - 28} width={120} height={56} rx={4} fill={C.panel} stroke={C.line} />
          <T x={500} y={y + 5} s={13} f={C.primary} a="middle">
            pipeline
          </T>
        </g>
      ))}
      {/* push */}
      <T x={290} y={30} s={14} f={C.primary} a="middle" w={600} o={easeOut(seg(t, 0.2, 0.5))}>
        push
      </T>
      {packets(60, 1, 0.4)}
      <Pager x={90} y={16} ring={t > 1.0 && t < 1.6 ? t : 0} k={easeOut(seg(t, 0.9, 1.2))} />
      <T x={290} y={104} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        source owns it
      </T>
      {/* pull */}
      <T x={290} y={130} s={14} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 1.6, 1.9))}>
        pull
      </T>
      {reach > 0 && (
        <g>
          <line x1={440} y1={160} x2={lerp(440, 146, reach)} y2={160} stroke={C.focus} strokeWidth={1.6} />
          <path d={`M ${lerp(440, 146, reach)} 160 l 0 -10 l 8 0`} fill="none" stroke={C.focus} strokeWidth={1.6} />
        </g>
      )}
      {reach > 0.98 && packets(160, -1, 2.4)}
      <Pager x={500} y={216} ring={t > 3.0 && t < 3.6 ? t : 0} k={easeOut(seg(t, 2.9, 3.2))} />
      <T x={290} y={206} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        pipeline owns it
      </T>
      <T x={300} y={244} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        the pager moves with the choice
      </T>
    </Svg>
  );
}

// 8 · Two pull logs side by side, a silent source and a quiet day, each ending "ok · 0 rows". After the pick, an
// equals sign joins them, and beneath, a freshness clock climbs past its threshold: only that alarm tells them apart.
export function Predict2({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const clock = on ? easeInOut(seg(s, 0.8, 2.4)) : 0;
  return (
    <Svg label="a pulled source goes silent, zero new rows today — does that look different from a genuinely quiet day?" h={290}>
      {[
        [40, 'source went silent'],
        [320, 'a quiet day'],
      ].map(([x, title], i) => (
        <g key={title as string} opacity={easeOut(seg(t, i * 0.2, i * 0.2 + 0.4))}>
          <rect x={x as number} y={20} width={240} height={110} rx={4} fill={C.panel} stroke={C.line} />
          <T x={(x as number) + 14} y={44} s={13} f={C.secondary}>
            {title}
          </T>
          <T x={(x as number) + 14} y={74} s={14} f={C.primary}>
            pull job: ok
          </T>
          <T x={(x as number) + 14} y={100} s={14} f={C.primary} o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
            rows today: 0
          </T>
        </g>
      ))}
      {!on && (
        <T x={300} y={180} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          same, or different?
        </T>
      )}
      {on && (
        <>
          <T x={300} y={84} s={22} f={C.focus} a="middle" w={700} o={easeOut(seg(s, 0, 0.4))}>
            =
          </T>
          <T x={40} y={168} s={13} f={C.secondary} o={easeOut(seg(s, 0.5, 0.8))}>
            hours since fresh data
          </T>
          <rect x={40} y={180} width={520} height={14} fill="none" stroke={C.line} opacity={easeOut(seg(s, 0.5, 0.8))} />
          <rect x={40} y={180} width={520 * clock} height={14} fill={clock > 0.6 ? C.bad : C.primary} />
          <line x1={40 + 520 * 0.6} y1={174} x2={40 + 520 * 0.6} y2={200} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(s, 0.6, 0.9))} />
          <T x={40 + 520 * 0.6} y={216} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 0.6, 0.9))}>
            freshness alert
          </T>
          <T x={40} y={250} s={14} f={C.primary} o={easeOut(seg(s, 1.0, 1.4))}>
            a loud error
          </T>
          <T x={575} y={250} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 1.1, 1.5))}>
            tempting, wrong
          </T>
          <T x={40} y={278} s={14} f={C.focus} o={easeOut(seg(s, 2.2, 2.6))}>
            a quiet day
          </T>
          <T x={575} y={278} s={14} f={C.focus} a="end" o={easeOut(seg(s, 2.4, 2.8))}>
            only alert catches it
          </T>
        </>
      )}
    </Svg>
  );
}

// 9 · The card comes back small with micro-batch lifted, the Lambda and Kappa tags on their cards, and the pager
// beside the pull arrow; each caption writes under its picture.
export function Recap({ t }: StepCtx) {
  const Y = 16, H = 150;
  return (
    <Svg label="the decision card with the SLO line, cheapest-that-clears, Lambda and Kappa placed on it, and push versus pull's different failure visibility" h={300}>
      {FOUR.map((shape, i) => (
        <Card
          key={shape.name}
          x={cardX(i)}
          y={Y}
          h={H}
          shape={shape}
          slo={15}
          grow={easeOut(seg(t, 0.1 + i * 0.1, 0.5 + i * 0.1))}
          costK={0}
          dim={i === 0 ? 1 : i === 1 ? 0 : 0.4}
          chosen={i === 1}
          lift={i === 1 ? easeOutBack(seg(t, 0.6, 1.0)) * 8 : 0}
          o={easeOut(seg(t, i * 0.08, i * 0.08 + 0.3))}
        />
      ))}
      <SloLine y={Y} h={H} slo={15} label="15 min" t={t} from={0.3} />
      <Tag x={cardX(3) + CW / 2} y={Y + H + 2} label="Lambda" k={easeOutBack(seg(t, 1.3, 1.6))} />
      <Tag x={cardX(2) + CW / 2} y={Y + H + 2} label="Kappa" k={easeOutBack(seg(t, 1.5, 1.8))} />
      <T x={40} y={210} s={14} f={C.primary} o={easeOut(seg(t, 0.9, 1.2))}>
        decision card
      </T>
      <T x={575} y={210} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        cheapest that clears
      </T>
      <T x={40} y={236} s={14} f={C.primary} o={easeOut(seg(t, 1.7, 2.0))}>
        Lambda, Kappa
      </T>
      <T x={575} y={236} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.8, 2.1))}>
        each pays its own cost
      </T>
      <T x={40} y={262} s={14} f={C.primary} o={easeOut(seg(t, 2.4, 2.7))}>
        push vs pull
      </T>
      <T x={575} y={262} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        owns the failure
      </T>
      <T x={40} y={288} s={14} f={C.primary} o={easeOut(seg(t, 3.0, 3.3))}>
        silent pull
      </T>
      <T x={575} y={288} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        looks quiet
      </T>
    </Svg>
  );
}

// 10 · The full card at fifteen minutes; the question hangs on the line. After the pick, the line slides down to
// thirty seconds, micro-batch and hybrid overshoot it in red and dim, streaming alone stays under and lifts.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const Y = 20, H = 210;
  const drop = on ? easeInOut(seg(s, 0.3, 1.3)) : 0;
  const slo = Math.pow(10, lerp(Math.log10(15), Math.log10(0.5), drop));
  const after = on ? easeOut(seg(s, 1.3, 1.7)) : 0;
  return (
    <Svg label="the SLO tightens from fifteen minutes to thirty seconds for a fraud-review ask — which shapes survive the card now?" h={330}>
      {FOUR.map((shape, i) => (
        <Card
          key={shape.name}
          x={cardX(i)}
          y={Y}
          h={H}
          shape={shape}
          slo={slo}
          costK={0}
          grow={easeOut(seg(t, 0, 0.5))}
          dim={i === 0 ? 1 : i === 2 ? 0 : after}
          chosen={i === 2 && after > 0.5}
          lift={i === 2 ? after * 10 : 0}
        />
      ))}
      <SloLine y={Y} h={H} slo={slo} label={drop > 0.5 ? '30 s' : '15 min'} t={t} from={0.2} />
      {!on && (
        <T x={300} y={280} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
          fraud review: thirty seconds?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={266} s={14} f={C.primary} o={easeOut(seg(s, 1.4, 1.7))}>
            micro-batch, hybrid
          </T>
          <T x={575} y={266} s={14} f={C.badText} a="end" o={easeOut(seg(s, 1.5, 1.8))}>
            no longer clear
          </T>
          <T x={40} y={294} s={14} f={C.focus} o={easeOut(seg(s, 2.0, 2.3))}>
            streaming only
          </T>
          <T x={575} y={294} s={14} f={C.focus} a="end" o={easeOut(seg(s, 2.1, 2.4))}>
            no fallback left
          </T>
          <T x={300} y={318} s={13} f={C.secondary} a="middle" o={easeOut(seg(s, 2.6, 3.0))}>
            reprocessing cost now matters more
          </T>
        </>
      )}
    </Svg>
  );
}
