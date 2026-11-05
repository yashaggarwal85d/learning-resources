import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 12: the pipeline strip (sdk → collector → log → lake → warehouse → dashboards) with a dashed
// correctness boundary after the log; a streaming bar and a batch bar for one day's clicks differing by the
// late-event sliver (red dots that land in the log but not in the stream's result); the batch bar overriding in the
// billed column; the estimate sheet and the failure table. Every number is examples.py's: six events, the sixth late
// past the watermark, so the stream counts 5 and the batch 6; a 30-minute session gap; a bot past 5 clicks a second;
// 50,000 events a second at 500 bytes, 2.16 TB a day, about 194 TB for 30 days at three replicas; cost lines 900,
// 400 and 300; the four-row failure table.

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
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
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

/** One day's click count as a bar: the stream reaches 5 of 6, the batch all 6. */
const BX = 130;
const BW = 300;
const unit = BW / 6;

// 1 · Two bars for yesterday's clicks grow side by side; the stream stops one sliver short of the batch. Both get a
// check (no bug), the sliver gets a bracket, and an invoice tag pins itself to the larger bar.
export function Hook({ t }: StepCtx) {
  const sGrow = easeOut(seg(t, 0.4, 1.4));
  const bGrow = easeOut(seg(t, 0.8, 2.0));
  const gap = easeOut(seg(t, 2.2, 2.6));
  const inv = easeOutBack(seg(t, 3.0, 3.5));
  return (
    <Svg label="an ad partner paid per click; two correct pipelines disagree by a small gap" h={270}>
      <T x={300} y={30} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        yesterday's clicks, one ad partner
      </T>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={BX - 12} y={80} s={14} f={C.primary} a="end">
          stream
        </T>
        <T x={BX - 12} y={140} s={14} f={C.primary} a="end">
          batch
        </T>
        <rect x={BX} y={62} width={BW} height={26} fill={C.band} />
        <rect x={BX} y={122} width={BW} height={26} fill={C.band} />
      </g>
      <rect x={BX} y={62} width={Math.max(0, unit * 5 * sGrow)} height={26} fill={C.primary} />
      <rect x={BX} y={122} width={Math.max(0, unit * 6 * bGrow)} height={26} fill={C.focus} />
      {gap > 0 && (
        <g opacity={gap}>
          <rect x={BX + unit * 5} y={62} width={unit} height={26} fill="none" stroke={C.secondary} strokeDasharray="3 3" />
          <path d={`M${BX + unit * 5} 93 L${BX + unit * 5} 98 L${BX + unit * 6} 98 L${BX + unit * 6} 93`} fill="none" stroke={C.focus} />
          <T x={BX + unit * 6 + 8} y={104} s={13} f={C.focus}>
            gap
          </T>
        </g>
      )}
      <Tick x={BX + BW + 22} y={74} k={easeOut(seg(t, 2.6, 2.9))} />
      <Tick x={BX + BW + 22} y={134} k={easeOut(seg(t, 2.7, 3.0))} />
      {inv > 0 && (
        <g opacity={Math.min(1, inv)} transform={`translate(0 ${(1 - Math.min(1, inv)) * -12})`}>
          <rect x={BX + BW + 44} y={121} width={100} height={28} rx={4} fill={C.panel} stroke={C.focus} />
          <T x={BX + BW + 94} y={140} s={13} f={C.focus} a="middle">
            invoice
          </T>
        </g>
      )}
      <Line2 y={200} l="stream" r="the dashboard" o={easeOut(seg(t, 1.4, 1.8))} />
      <Line2 y={226} l="batch" r="the invoice" o={easeOut(seg(t, 3.2, 3.6))} />
      <Line2 y={252} l="both pipelines" r="no bug" o={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

const CAUSES = ['late events', 'duplicates', 'bot filter'];

// 2 · Three cause chips under the two bars, stream short. After the pick, the duplicates chip shows an arrow pushing
// the stream up (wrong way) and dims; the late-events chip lights and its dot lands in the log but misses the window.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const dup = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const late = on ? easeOut(seg(s, 1.0, 1.5)) : 0;
  const dot = on ? easeInOut(seg(s, 1.4, 2.2)) : 0;
  return (
    <Svg label="late events, duplicates, or bot filtering — which explains the gap, and which side is right?" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={120} y={36} s={13} f={C.secondary} a="end">
          stream
        </T>
        <T x={120} y={66} s={13} f={C.secondary} a="end">
          batch
        </T>
        <rect x={130} y={24} width={unit * 5 * 0.8} height={16} fill={C.primary} />
        <rect x={130} y={54} width={unit * 6 * 0.8} height={16} fill={C.focus} />
        <T x={380} y={36} s={13} f={C.secondary}>
          smaller
        </T>
      </g>
      {CAUSES.map((c, i) => {
        const x = 30 + i * 185;
        const lit = i === 0 && late > 0.5;
        const dim = (i === 1 && dup > 0.5) || (i === 2 && late > 0.5);
        return (
          <g key={c} opacity={easeOut(seg(t, 0.4 + i * 0.2, 0.8 + i * 0.2)) * (dim ? 0.4 : 1)}>
            <Box x={x} y={100} w={160} label={c} lit={lit} />
          </g>
        );
      })}
      {dup > 0 && (
        <g opacity={dup * (late > 0.5 ? 0.5 : 1)}>
          <path d={`M295 155 L295 ${lerp(155, 140, dup)}`} stroke={C.secondary} strokeWidth={1.6} />
          <path d={`M289 ${lerp(155, 140, dup) + 6} L295 ${lerp(155, 140, dup)} L301 ${lerp(155, 140, dup) + 6}`} fill="none" stroke={C.secondary} strokeWidth={1.6} />
          <T x={305} y={154} s={13} f={C.secondary}>
            pushes up
          </T>
        </g>
      )}
      {late > 0 && (
        <g opacity={late}>
          <circle cx={lerp(60, 150, dot)} cy={160} r={5} fill={C.badText} />
          <line x1={175} y1={145} x2={175} y2={175} stroke={C.focus} strokeWidth={2} />
          <T x={110} y={195} s={13} f={C.focus} a="middle">
            misses the window
          </T>
        </g>
      )}
    </Svg>
  );
}

const STRIP: { label: string; x: number; y: number }[] = [
  { label: 'sdk', x: 30, y: 26 },
  { label: 'collector', x: 225, y: 26 },
  { label: 'log', x: 420, y: 26 },
  { label: 'lake', x: 420, y: 118 },
  { label: 'warehouse', x: 225, y: 118 },
  { label: 'dashboards', x: 30, y: 118 },
];
const STRIP_PATH: [number, number][] = [
  [105, 43],
  [495, 43],
  [495, 135],
  [105, 135],
];
function stripAt(p: number): [number, number] {
  const lens = [390, 92, 390];
  let d = p * 872;
  for (let i = 0; i < 3; i++) {
    if (d <= lens[i]) {
      const [x0, y0] = STRIP_PATH[i];
      const [x1, y1] = STRIP_PATH[i + 1];
      const k = d / lens[i];
      return [lerp(x0, x1, k), lerp(y0, y1, k)];
    }
    d -= lens[i];
  }
  return STRIP_PATH[3];
}

// 3 · The six hops build one after another in a snake, events flowing through them; under each hop a decision card of
// three options lands with one picked.
export function RevealPipelineStrip({ t }: StepCtx) {
  return (
    <Svg label="sdk, collector, log, lake, warehouse, dashboards — a decision card at each hop" h={240}>
      <Draw pts={STRIP_PATH} t={t} from={0.2} to={2.4} stroke={C.line} w={1.4} pen={false} />
      {t > 2.4 &&
        [0, 1, 2, 3, 4].map((i) => {
          const p = (((t - 2.4) * 0.35 + i / 5) % 1);
          const [x, y] = stripAt(p);
          return <circle key={i} cx={x} cy={y} r={3.5} fill={C.focus} />;
        })}
      {STRIP.map((b, i) => {
        const at = 0.2 + i * 0.4;
        const card = easeOutBack(seg(t, at + 0.3, at + 0.7));
        return (
          <g key={b.label}>
            <Box x={b.x} y={b.y} w={150} h={34} label={b.label} o={easeOut(seg(t, at, at + 0.3))} lit={i === 2 && t > 1.4} />
            {card > 0 &&
              [0, 1, 2].map((j) => (
                <rect
                  key={j}
                  x={b.x + 45 + j * 22}
                  y={b.y + 44 + (1 - Math.min(1, card)) * -8}
                  width={16}
                  height={12}
                  rx={2}
                  fill={j === i % 3 ? C.focus : C.panel}
                  stroke={j === i % 3 ? C.focus : C.line}
                  opacity={Math.min(1, card)}
                />
              ))}
          </g>
        );
      })}
      <T x={300} y={222} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        three options at every hop, one picked
      </T>
    </Svg>
  );
}

// 4 · A user's clicks on a timeline. Fixed clock edges appear, then fade; instead the session closes where the gap
// passes 30 minutes. Below, a bot's dense burst is boxed red past 5 clicks a second, with the cost of either mistake.
export function RevealSessionGap({ t }: StepCtx) {
  const X = (s: number) => 40 + s * 0.2;
  const ticks = [0, 100, 200, 2200, 2300];
  const clock = easeOut(seg(t, 0.5, 0.9)) * (1 - 0.8 * easeOut(seg(t, 1.4, 1.8)));
  const ses = easeOut(seg(t, 1.6, 2.1));
  const bot = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a session closes on a gap of inactivity, not a fixed clock; a bot run flags red" h={210}>
      <line x1={30} y1={60} x2={560} y2={60} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {ticks.map((s, i) => (
        <line key={i} x1={X(s)} y1={50} x2={X(s)} y2={70} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.3 + i * 0.1))} />
      ))}
      {clock > 0 && (
        <g opacity={clock}>
          {[160, 280, 400].map((x) => (
            <line key={x} x1={x} y1={34} x2={x} y2={80} stroke={C.secondary} strokeDasharray="3 3" />
          ))}
          <T x={280} y={26} s={13} f={C.secondary} a="middle">
            clock edges
          </T>
        </g>
      )}
      {ses > 0 && (
        <g opacity={ses} fill="none" stroke={C.focus} strokeWidth={1.4}>
          <path d={`M${X(0) - 4} 44 L${X(0) - 4} 38 L${X(200) + 4} 38 L${X(200) + 4} 44`} />
          <path d={`M${X(2200) - 4} 44 L${X(2200) - 4} 38 L${X(2300) + 4} 38 L${X(2300) + 4} 44`} />
          <path d={`M${X(200) + 6} 80 L${X(200) + 6} 86 L${X(2200) - 6} 86 L${X(2200) - 6} 80`} stroke={C.secondary} />
        </g>
      )}
      <T x={(X(200) + X(2200)) / 2} y={104} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.9, 2.3))}>
        gap over 30 min · session closes
      </T>
      {/* a bot burst */}
      <g opacity={easeOut(seg(t, 2.2, 2.5))}>
        <line x1={30} y1={140} x2={560} y2={140} stroke={C.line} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={180 + i * 4} y1={132} x2={180 + i * 4} y2={148} stroke={bot > 0.5 ? C.badText : C.primary} strokeWidth={1.5} />
        ))}
      </g>
      {bot > 0 && (
        <g opacity={bot}>
          <rect x={172} y={126} width={60} height={28} rx={3} fill="none" stroke={C.badText} strokeWidth={1.4} />
          <T x={246} y={145} s={13} f={C.badText}>
            over 5 clicks a second · bot?
          </T>
        </g>
      )}
      <Line2 y={180} l="person flagged" r="a real cost" o={easeOut(seg(t, 3.2, 3.5))} />
      <Line2 y={202} l="bot let through" r="a real cost" o={easeOut(seg(t, 3.5, 3.8))} />
    </Svg>
  );
}

// 5 · Events flow from the log, across the dashed correctness boundary, into the stream's window; the window fires
// with 5. Then a sixth event arrives: it lands in the log (6 there) but meets a closed window, and drops red.
export function RevealLateEventSliver({ t }: StepCtx) {
  const fire = easeOut(seg(t, 2.2, 2.5));
  const late = seg(t, 2.8, 3.8);
  return (
    <Svg label="a dashed correctness boundary after the log; a late dot lands after the window fires" h={210}>
      <Box x={30} y={50} w={150} h={50} label="" o={easeOut(seg(t, 0, 0.3))} />
      <T x={105} y={42} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        log
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const inLog = i < 5 ? easeOut(seg(t, 0.3 + i * 0.15, 0.5 + i * 0.15)) : easeOut(seg(t, 2.8, 3.1));
        return inLog > 0 ? <circle key={i} cx={50 + i * 22} cy={75} r={6} fill={i === 5 ? C.badText : C.focus} opacity={inLog} /> : null;
      })}
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <line x1={210} y1={20} x2={210} y2={130} stroke={C.focus} strokeDasharray="5 4" strokeWidth={1.4} />
        <T x={210} y={150} s={13} f={C.secondary} a="middle">
          correctness boundary
        </T>
      </g>
      <rect x={260} y={50} width={150} height={50} rx={4} fill={C.panel} stroke={fire > 0.5 ? C.focus : C.line} strokeWidth={fire > 0.5 ? 2 : 1} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={335} y={42} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        {fire > 0.5 ? 'window · fired' : 'window'}
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = easeInOut(seg(t, 0.9 + i * 0.2, 1.4 + i * 0.2));
        if (p <= 0) return null;
        const x = lerp(50 + i * 22, 280 + i * 22, p);
        return <circle key={i} cx={fire > 0.5 ? lerp(x, 470, easeInOut(seg(t, 2.3, 2.7))) : x} cy={75} r={5} fill={C.primary} opacity={fire > 0.5 ? 1 - easeOut(seg(t, 2.5, 2.7)) : 1} />;
      })}
      <Box x={440} y={50} w={130} h={50} label={fire > 0.5 ? 'stream: 5' : 'result'} lit={fire > 0.5} o={easeOut(seg(t, 0.5, 0.8))} />
      {late > 0 && (
        <circle cx={late < 0.6 ? lerp(160, 252, late / 0.6) : 252} cy={late < 0.6 ? 75 : lerp(75, 120, (late - 0.6) / 0.4)} r={6} fill={C.badText} />
      )}
      <T x={40} y={186} s={14} f={C.badText} o={easeOut(seg(t, 3.6, 3.9))}>
        log: 6 · dropped from the result
      </T>
      <T x={40} y={206} s={13} f={C.secondary} o={easeOut(seg(t, 4.0, 4.3))}>
        unless lateness is allowed
      </T>
    </Svg>
  );
}

// 6 · The stream bar fills fast with keyed upserts; the batch bar fills slowly from the log on a schedule. In the
// billed column the batch's 6 slides in and the stream's 5 fades out.
export function RevealStreamVsBatch({ t }: StepCtx) {
  const sF = easeOut(seg(t, 0.3, 0.9));
  const bF = easeInOut(seg(t, 1.2, 2.4));
  const slide = easeInOut(seg(t, 2.7, 3.4));
  const W = 250;
  return (
    <Svg label="idempotent upserts on one side, a scheduled batch recount on the other, overriding the billed figure" h={210}>
      <T x={30} y={66} s={14} f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        stream
      </T>
      <T x={110} y={44} s={13} f={C.secondary} o={easeOut(seg(t, 0.1, 0.4))}>
        idempotent upserts
      </T>
      <rect x={110} y={52} width={W} height={22} fill={C.band} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={110 + i * (W / 6)} y={52} width={W / 6 - 2} height={22} fill={C.primary} opacity={easeOut(seg(sF, i * 0.15, i * 0.15 + 0.3))} />
      ))}
      <T x={30} y={126} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        batch
      </T>
      <T x={110} y={104} s={13} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        recount from the log
      </T>
      <rect x={110} y={112} width={W} height={22} fill={C.band} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <rect x={110} y={112} width={Math.max(0, W * bF)} height={22} fill={C.focus} />
      <g opacity={easeOut(seg(t, 2.2, 2.6))}>
        <rect x={420} y={30} width={150} height={120} rx={6} fill={C.panel} stroke={C.focus} />
        <T x={495} y={52} s={13} f={C.secondary} a="middle">
          billed
        </T>
      </g>
      {slide > 0 && (
        <g>
          <T x={lerp(370, 495, slide)} y={lerp(70, 100, slide)} s={16} f={C.primary} a="middle" o={1 - slide}>
            5
          </T>
          <T x={lerp(370, 495, slide)} y={lerp(130, 106, slide)} s={22} f={C.focus} a="middle">
            6
          </T>
        </g>
      )}
      <Line2 y={176} l="stream" r="fast, approximate" o={easeOut(seg(t, 1.0, 1.4))} />
      <Line2 y={200} l="batch" r="number of record" o={easeOut(seg(t, 3.4, 3.8))} />
    </Svg>
  );
}

// 7 · One transform box copies itself into the stream engine and the batch engine, both v2. The stream's copy bumps to
// v3, the batch's doesn't, and their two output lines (white and pale blue) peel apart: drift.
export function RevealDualLogicDrift({ t }: StepCtx) {
  const split = easeInOut(seg(t, 0.4, 1.1));
  const bump = easeOut(seg(t, 1.6, 1.9));
  const drift = easeInOut(seg(t, 2.2, 3.4));
  const line = (dy: number): [number, number][] => [
    [40, 150],
    [180, 150],
    [300, 150],
    [300 + 130 * drift, 150 + dy * drift],
    [300 + 260 * drift, 150 + dy * 1.4 * drift],
  ];
  return (
    <Svg label="the same logic written twice; a drift gap opens the moment only one copy is updated" h={210}>
      {split < 1 && <Box x={200} y={20} w={200} label="transform · v2" o={easeOut(seg(t, 0, 0.3)) * (1 - split)} />}
      {split > 0 && (
        <g>
          <Box x={lerp(200, 40, split)} y={lerp(20, 50, split)} w={200} label={bump > 0.5 ? 'stream · v3' : 'stream · v2'} lit={bump > 0.5} />
          <Box x={lerp(200, 360, split)} y={lerp(20, 50, split)} w={200} label="batch · v2" stroke={C.second} f={C.second} />
        </g>
      )}
      <T x={300} y={30} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        written twice
      </T>
      {t > 1.0 && (
        <g fill="none" strokeWidth={1.8} opacity={easeOut(seg(t, 1.0, 1.4))}>
          <polyline points={line(-14).map((p) => p.join(',')).join(' ')} stroke={C.focus} />
          <polyline points={line(10).map((p) => p.join(',')).join(' ')} stroke={C.second} />
        </g>
      )}
      {drift > 0.6 && (
        <g opacity={easeOut(seg(t, 2.9, 3.3))}>
          <path d="M572 132 L578 132 L578 164 L572 164" fill="none" stroke={C.focus} />
          <T x={565} y={120} s={13} f={C.focus} a="end">
            drift
          </T>
        </g>
      )}
      <T x={30} y={198} s={14} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        an ongoing cost, budgeted for
      </T>
    </Svg>
  );
}

const COSTS: [string, number][] = [
  ['lake scan', 900],
  ['replication', 400],
  ['compute', 300],
];
const FAILS: [string, string, boolean][] = [
  ['collector down', 'buffered at sdk', false],
  ['poison event', 'one partition', false],
  ['retry storm', 'absorbed', false],
  ['region loss', 'every hop', true],
];

// 8 · The estimate sheet fills line by line; three cost bars grow and the largest gets the reticle; the failure table
// fills row by row, the region-loss row red.
export function RevealEstimateFailure({ t }: StepCtx) {
  const EST: [string, string][] = [
    ['peak', '50,000/s'],
    ['per day', '2.16 TB'],
    ['×3, 30 days', '194 TB'],
  ];
  return (
    <Svg label="the estimate sheet, the dominant cost lever, and the failure table, side by side" h={240}>
      {EST.map(([k, v], i) => {
        const o = easeOut(seg(t, 0.1 + i * 0.35, 0.4 + i * 0.35));
        return o <= 0 ? null : (
          <g key={k} opacity={o}>
            <T x={25} y={30 + i * 26} s={13} f={C.secondary}>
              {k}
            </T>
            <T x={265} y={30 + i * 26} s={14} f={i === 2 ? C.focus : C.primary} a="end">
              {v}
            </T>
          </g>
        );
      })}
      {COSTS.map(([k, v], i) => {
        const g = easeOut(seg(t, 1.3 + i * 0.2, 1.9 + i * 0.2));
        return (
          <g key={k} opacity={easeOut(seg(t, 1.2 + i * 0.2, 1.4 + i * 0.2))}>
            <T x={400} y={30 + i * 26} s={13} f={i === 0 ? C.focus : C.secondary} a="end">
              {k}
            </T>
            <rect x={410} y={19 + i * 26} width={Math.max(0, (v / 900) * 160 * g)} height={14} fill={i === 0 ? C.focus : C.line} />
          </g>
        );
      })}
      <Reticle x={490} y={26} w={170} h={22} t={t} at={2.3} />
      <line x1={25} y1={104} x2={575} y2={104} stroke={C.line} opacity={easeOut(seg(t, 2.4, 2.7))} />
      {FAILS.map(([k, v, bad], i) => (
        <Line2 key={k} y={130 + i * 26} l={k} r={v} lc={C.primary} rc={bad ? C.badText : C.secondary} o={easeOut(seg(t, 2.6 + i * 0.3, 2.9 + i * 0.3))} />
      ))}
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line: the six hops, the session gap, the late sliver,
// the batch override, two lines drifting.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['six hops', 'three options each'],
    ['session', 'a gap, not a clock'],
    ['late event', 'misses a fired window', C.badText],
    ['batch', 'number of record'],
    ['two paths', 'drift, budgeted', C.second],
  ];
  return (
    <Svg label="the strip, the session gap, the late sliver, the stream-batch override, drift, estimate and failures" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        const k = easeOut(seg(t, at, at + 0.4));
        return (
          <g key={l} opacity={k}>
            {i === 0 && [0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={30 + j * 14} y={y - 12} width={10} height={10} fill={j === 2 ? C.focus : C.primary} />)}
            {i === 0 && <line x1={71} y1={y - 16} x2={71} y2={y + 2} stroke={C.focus} strokeDasharray="2 2" />}
            {i === 1 && (
              <g stroke={C.focus} strokeWidth={1.6}>
                {[30, 36, 42, 98, 104].map((x) => (
                  <line key={x} x1={x} y1={y - 14} x2={x} y2={y} />
                ))}
                <path d={`M46 ${y + 4} L46 ${y + 8} L94 ${y + 8} L94 ${y + 4}`} fill="none" stroke={C.secondary} strokeWidth={1} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={30} y={y - 12} width={65} height={12} fill={C.primary} />
                <rect x={96} y={y - 12} width={13} height={12} fill={C.bad} stroke={C.badText} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 16} width={65} height={7} fill={C.line} />
                <rect x={30} y={y - 6} width={78} height={7} fill={C.focus} />
              </g>
            )}
            {i === 4 && (
              <g fill="none" strokeWidth={1.6}>
                <polyline points={`30,${y - 6} 60,${y - 6} 108,${y - 14}`} stroke={C.focus} />
                <polyline points={`30,${y - 6} 60,${y - 6} 108,${y + 2}`} stroke={C.second} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · The two bars disagree again, "last time: late events" waiting below. After the pick, that chip dims; a retry
// storm bursts duplicates at both bars: the stream's keys absorb them, the batch bar briefly grows a red overhang.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const old = on ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const burst = on ? seg(s, 0.6, 1.6) : 0;
  const over = on ? easeOut(seg(s, 1.5, 1.9)) * (1 - easeOut(seg(s, 2.8, 3.3))) : 0;
  const W = 260;
  return (
    <Svg label="a second billing dispute, a different partner, the same three candidate causes" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={110} y={56} s={14} f={C.primary} a="end">
          stream
        </T>
        <T x={110} y={106} s={14} f={C.primary} a="end">
          batch
        </T>
        <rect x={120} y={40} width={(W * 5) / 6} height={22} fill={C.primary} />
        <rect x={120} y={90} width={W} height={22} fill={C.focus} />
      </g>
      {over > 0 && <rect x={120 + W} y={90} width={Math.max(0, (W / 6) * over)} height={22} fill={C.bad} stroke={C.badText} />}
      {burst > 0 &&
        burst < 1 &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const toStream = i % 2 === 0;
          const tx = toStream ? 120 + ((W * 5) / 6) * 0.5 : 120 + W;
          const ty = toStream ? 51 : 101;
          const p = easeInOut(Math.min(1, burst * 1.3 - i * 0.05));
          return <circle key={i} cx={lerp(560, tx, p)} cy={lerp(30 + i * 14, ty, p)} r={4} fill={C.focus} opacity={1 - p * 0.6} />;
        })}
      {on && (
        <g>
          <T x={120 + (W * 5) / 6 + 10} y={56} s={13} f={C.focus} o={easeOut(seg(s, 1.6, 2.0))}>
            absorbed
          </T>
          {over > 0.3 && (
            <T x={120 + W + 50} y={106} s={13} f={C.badText} o={over}>
              counted twice
            </T>
          )}
        </g>
      )}
      <Box x={30} y={150} w={250} label="last time: late events" dash="4 3" o={easeOut(seg(t, 0.6, 1.0)) * (1 - 0.6 * old)} />
      <Box x={320} y={150} w={250} label="this time: retry storm" lit o={on ? easeOut(seg(s, 2.0, 2.4)) : 0} />
      <T x={300} y={226} s={14} f={C.secondary} a="middle" o={on ? easeOut(seg(s, 2.6, 3.0)) : easeOut(seg(t, 1.2, 1.6))}>
        {on ? 'same symptom, a different cause' : 'the same symptom again'}
      </T>
    </Svg>
  );
}
