import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

const MEDAL = ['bronze', 'silver', 'gold'];
const SX = [25, 215, 405];

/** Three stage boxes with arrows between them; `k(i)` reveals each, `f(i)` colours each outline. */
function Stages({ y, k, labels = MEDAL, f = () => C.mocha, h = 40 }: { y: number; k: (i: number) => number; labels?: string[]; f?: (i: number) => string; h?: number }) {
  return (
    <g>
      {labels.map((l, i) => (
        <g key={l} opacity={k(i)}>
          <Cell x={SX[i]} y={y} w={170} h={h} label={l} stroke={f(i)} />
          {i > 0 && <path d={`M${SX[i] - 18} ${y + h / 2} h14 m-6 -5 l6 5 l-6 5`} fill="none" stroke={C.latte} strokeWidth={1.5} />}
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. The shop's pipeline: raw orders, one shared view, a dashboard, drawn as three stops; then a dashed path that
// skips the middle asks whether fewer would do.
export function Hook({ t }: StepCtx) {
  const sk = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="raw orders, a shared view, a dashboard — three layers, or fewer?" h={240}>
      <Row y={40} label="a small shop" value="raw, shared, dashboard" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="three stops" value="or fewer?" k={easeOut(seg(t, 3.0, 3.5))} />
      <Stages y={150} labels={['raw orders', 'shared view', 'dashboard']} k={(i) => easeOut(seg(t, 0.6 + i * 0.6, 1.0 + i * 0.6))} />
      <path d={`M110 150 C 110 ${lerp(150, 118, sk)}, 490 ${lerp(150, 118, sk)}, 490 150`} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 4" opacity={sk} />
    </Svg>
  );
}

// 2 · Medallion. Bronze, silver, gold appear in turn; a quality bar under each steps up higher than the last.
export function RevealMedallionQuote({ t }: StepCtx) {
  return (
    <Svg label="Bronze, Silver, Gold — quality and structure improving, layer by layer" h={250}>
      <Row y={40} label="three named stages" value="bronze, silver, gold" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="each one" value="better than the last" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Stages y={118} k={(i) => easeOut(seg(t, 0.6 + i * 0.5, 1.0 + i * 0.5))} />
      {[0, 1, 2].map((i) => {
        const h = 22 + i * 26;
        const k = easeOut(seg(t, 1.8 + i * 0.4, 2.3 + i * 0.4));
        return <rect key={i} x={SX[i] + 45} y={236 - h * k} width={80} height={h * k} rx={2} fill={C.focus} opacity={0.25 + 0.2 * i} />;
      })}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        quality, structure
      </T>
    </Svg>
  );
}

// 3 · Predict: does the name set the contract? A messy box; a "silver" tag drops onto it; the mess is still there; the question.
export function PredictNameIsContract({ t, answer }: StepCtx) {
  const d = easeOutBack(seg(t, 0.6, 1.1));
  const MESS = [
    [40, 68],
    [72, 80],
    [110, 64],
    [150, 82],
    [190, 70],
    [230, 78],
  ];
  return (
    <Svg label='a layer named "Silver" — does the name alone set the contract?' h={210}>
      <Row y={40} label="named silver" value="already polished?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={58} width={250} height={34} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {MESS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={18} height={6} rx={1} fill={C.cherryText} opacity={0.7 * easeOut(seg(t, 0.2, 0.5))} transform={`rotate(${((i * 37) % 50) - 25} ${x + 9} ${y + 3})`} />
      ))}
      <g opacity={clamp(d * 2)} transform={`translate(0 ${lerp(-20, 0, clamp(d)).toFixed(1)})`}>
        <Cell x={300} y={62} w={100} h={26} label="silver" stroke={C.latte} />
      </g>
      <AnswerRow y={140} label="the name alone" answer={answer} value="no, a stated contract" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="stated, and actually honored" />
    </Svg>
  );
}

// 4 · Bronze. The source's own uneven record shape is copied into bronze exactly as-is; a load-metadata tag clips onto it.
export function RevealBronzeQuote({ t }: StepCtx) {
  const c = easeInOut(seg(t, 0.9, 1.7));
  const m = easeOut(seg(t, 2.0, 2.5));
  const SHAPE = [60, 110, 40, 90];
  return (
    <Svg label="raw, as-is, load metadata attached — audit and lineage, nothing more" h={250}>
      <Row y={40} label="bronze" value="as the source sent it" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="built for" value="audit and lineage" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        source
      </T>
      <T x={335} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        bronze
      </T>
      <rect x={325} y={128} width={250} height={100} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.1))} />
      {SHAPE.map((w, i) => (
        <g key={i}>
          <rect x={25} y={134 + i * 20} width={w} height={14} rx={2} fill={C.latte} opacity={0.6 * easeOut(seg(t, 0.4, 0.7))} />
          <rect x={lerp(25, 335, c)} y={134 + i * 20} width={w} height={14} rx={2} fill={C.latte} opacity={0.6 * (c > 0 ? 1 : 0)} />
        </g>
      ))}
      <g opacity={m} transform={`translate(${((1 - m) * 20).toFixed(1)} 0)`}>
        <Cell x={465} y={134} w={100} h={22} label="load info" stroke={C.focus} f={C.focus} />
      </g>
      <T x={450} y={214} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        nothing cleaned yet
      </T>
    </Svg>
  );
}

// 5 · Silver. Bronze's uneven rows straighten into aligned, conformed rows; they gather into one shared view that several
// teams can read.
export function RevealSilverQuote({ t }: StepCtx) {
  const al = easeInOut(seg(t, 0.9, 1.9));
  const tm = (i: number) => easeInOut(seg(t, 2.4 + i * 0.25, 2.8 + i * 0.25));
  const SHAPE = [60, 110, 40, 90];
  return (
    <Svg label='"just-enough" cleansed, an enterprise view — not yet project-specific' h={250}>
      <Row y={40} label="silver" value="cleaned just enough" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="one shared view" value="not one project's" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <rect x={25} y={124} width={250} height={100} rx={5} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {SHAPE.map((w, i) => (
        <rect key={i} x={35} y={134 + i * 20} width={lerp(w, 230, al)} height={14} rx={2} fill={al >= 1 ? C.focus : C.latte} opacity={0.5} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={275} y1={174} x2={lerp(275, 405, tm(i))} y2={lerp(174, 134 + i * 36, tm(i))} stroke={C.latte} strokeWidth={1.5} />
          <Cell x={405} y={122 + i * 36} w={170} h={24} label={`team ${i + 1}`} o={tm(i)} />
        </g>
      ))}
    </Svg>
  );
}

// 6 · Gold. From the shared view, one wide, denormalized table is built for one dashboard, and the dashboard reads it directly.
export function RevealGoldQuote({ t }: StepCtx) {
  const w = easeInOut(seg(t, 1.0, 1.8));
  const d = easeInOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="consumption-ready, denormalized, project-specific — built for reporting" h={250}>
      <Row y={40} label="gold" value="shaped for one project" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="ready to" value="read directly" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={140} w={130} h={40} label="silver" o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={155} y1={160} x2={lerp(155, 185, w)} y2={160} stroke={C.latte} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={185 + i * 46 * w} y={140} width={42} height={40} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} opacity={w > 0 ? 1 : 0} />
      ))}
      <T x={300} y={200} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
        one wide table
      </T>
      <line x1={415} y1={160} x2={lerp(415, 445, d)} y2={160} stroke={C.focus} strokeWidth={2} />
      <Cell x={445} y={140} w={130} h={40} label="one dashboard" o={d} stroke={C.focus} />
    </Svg>
  );
}

// 7 · Predict: always better? A tiny pipeline pushed through all three stages; then the question.
export function PredictMoreLayersBetter({ t, answer }: StepCtx) {
  const p = seg(t, 0.8, 2.0);
  return (
    <Svg label="every pipeline, all three stages — always strictly better?" h={210}>
      <Row y={40} label="all three, always" value="strictly better?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Stages y={60} h={28} k={(i) => easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} />
      {p > 0 && p < 1 && <circle cx={lerp(110, 490, p)} cy={74} r={5} fill={C.crema} />}
      <AnswerRow y={140} label="always better" answer={answer} value="no, it costs anyway" f={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="unneeded stages still cost" f={C.cherryText} />
    </Svg>
  );
}

// 8 · The sprawl cost. A record crawls through all three stages while a latency bar grows; a copy of it is left behind in every
// stage it passes.
export function RevealLayerSprawlQuote({ t }: StepCtx) {
  const p = seg(t, 0.8, 3.0);
  const lat = easeInOut(seg(t, 0.8, 3.0));
  return (
    <Svg label="stages it doesn't need — added latency, added storage cost, no matching benefit" h={250}>
      <Row y={40} label="added latency" value="before anyone uses it" valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Row y={85} label="added storage" value="a copy in every stage" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Stages y={128} k={(i) => easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} />
      {p > 0 && p < 1 && <circle cx={lerp(110, 490, p)} cy={190} r={6} fill={C.crema} />}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={SX[i] + 60} y={176} width={50} height={8} rx={2} fill={C.cherryText} opacity={p * 3 > i + 0.3 ? 0.7 : 0} />
      ))}
      <rect x={25} y={215} width={550 * lat} height={8} rx={3} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={243} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        time until usable
      </T>
    </Svg>
  );
}

// 9 · Predict: whose bug? A bug lights in gold; a trace line runs back through silver and bronze; then the question.
export function PredictWhoOwnsTheBug({ t, answer }: StepCtx) {
  const tr = easeInOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="a bug found in Gold — obviously Gold's own job to fix?" h={210}>
      <Row y={40} label="bug found in gold" value="gold's job to fix?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Stages y={60} h={28} k={(i) => easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} f={(i) => (i === 2 ? C.cherryText : C.mocha)} />
      <path d={`M490 96 H${lerp(490, 110, tr)}`} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
      <AnswerRow y={140} label="obviously gold's" answer={answer} value="it depends" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="and that uncertainty is the problem" />
    </Svg>
  );
}

// 10 · Fragmented accountability. A team attaches to each stage with its own transformation; one ownership bar beneath splits
// into thin slices, and no slice is the owner.
export function RevealFragmentedAccountabilityQuote({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="different teams, different stages — accountability fragmented, no clear owner" h={250}>
      <Row y={40} label="different teams" value="different stages" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="who owns correctness" value="no one, clearly" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <Stages y={112} h={30} k={(i) => easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.9 + i * 0.35, 1.3 + i * 0.35))}>
          <line x1={SX[i] + 85} y1={142} x2={SX[i] + 85} y2={160} stroke={C.latte} strokeWidth={1.5} />
          <Cell x={SX[i] + 25} y={160} w={120} h={24} label={`team ${i + 1}`} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={lerp(25 + i * 183.3, SX[i] + 70, sp)}
          y={206}
          width={lerp(183.3, 30, sp)}
          height={12}
          rx={2}
          fill={sp > 0.5 ? C.cherryText : C.latte}
          opacity={0.6 * easeOut(seg(t, 1.8, 2.2))}
        />
      ))}
      <T x={25} y={240} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        ownership
      </T>
    </Svg>
  );
}

// 11 · The silver bottleneck. Downstream teams all pull from one silver box built without their input; their requests pile up
// in front of it.
export function RevealSilverBottleneckQuote({ t }: StepCtx) {
  const pile = clamp(seg(t, 1.8, 3.4) * 7);
  return (
    <Svg label="downstream teams pulling from aggregates built without their input — a named bottleneck" h={250}>
      <Row y={40} label="every team pulls" value="from one shared view" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="built without" value="their input" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Cell x={25} y={140} w={170} h={50} label="silver" o={easeOut(seg(t, 0.4, 0.8))} stroke={pile > 4 ? C.cherryText : C.mocha} />
      {[0, 1, 2, 3].map((i) => {
        const k = easeInOut(seg(t, 0.8 + i * 0.2, 1.3 + i * 0.2));
        const y = 118 + i * 30;
        return (
          <g key={i}>
            <line x1={405} y1={y + 11} x2={lerp(405, 195, k)} y2={lerp(y + 11, 165, k)} stroke={C.latte} strokeWidth={1.2} />
            <Cell x={405} y={y} w={170} h={22} label={`downstream ${i + 1}`} o={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))} />
          </g>
        );
      })}
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={210 + (i % 4) * 16} cy={152 + Math.floor(i / 4) * 16} r={5} fill={C.cherryText} opacity={pile > i ? 1 : 0} />
      ))}
      <T x={110} y={220} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        a traffic jam
      </T>
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a contract behind every name; unneeded stages still cost; Silver bears the brunt" h={220}>
      <Row y={50} label="a stage's name" value="empty without a contract" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="unneeded stages" value="still cost" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="silver" value="serves all, asks none" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: one source, one consumer. Three stages; after the answer the middle one folds away into a single stop, and the
// verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const f = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.5, 0.9)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="one source, one consumer, nothing shared — still three layers?" h={230}>
      <Row y={40} label="one source, one team" value="still three stages?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="all three" answer={answer} value="no, collapse them" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={115} w={170} h={28} label="source" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={215} y={115 + f * 20} w={170} h={28} label="shared view" o={easeOut(seg(t, 0.5, 0.8)) * (1 - f)} />
      <Cell x={lerp(405, 215, f)} y={115} w={170} h={28} label="one team's table" o={easeOut(seg(t, 0.6, 0.9))} stroke={f > 0 ? C.focus : C.mocha} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            shape the layers to the need
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
