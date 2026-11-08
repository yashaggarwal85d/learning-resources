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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** A star schema in miniature: a fact square with four dimension squares around it. */
function Star({ cx, cy, k, f = C.crema, sc = 1 }: { cx: number; cy: number; k: number; f?: string; sc?: number }) {
  return (
    <g opacity={k} transform={`translate(${cx} ${cy}) scale(${(sc * (0.7 + 0.3 * k)).toFixed(3)}) translate(${-cx} ${-cy})`}>
      {[
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ].map(([dx, dy], i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + dx * 22} y2={cy + dy * 22} stroke={C.mocha} strokeWidth={1.5} />
          <rect x={cx + dx * 22 - 5} y={cy + dy * 22 - 5} width={10} height={10} rx={2} fill={C.cocoa} stroke={f} />
        </g>
      ))}
      <rect x={cx - 9} y={cy - 9} width={18} height={18} rx={3} fill={f} opacity={0.85} />
    </g>
  );
}

/** One normalized enterprise model: a box of linked entities, filled in by `k`. */
function Model({ x, y, w, h, k, f = C.focus }: { x: number; y: number; w: number; h: number; k: number; f?: string }) {
  const n = 6;
  return (
    <g opacity={clamp(k * 3)}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
      {Array.from({ length: n }, (_, i) => {
        const ex = x + (w / (n + 1)) * (i + 1);
        const ey = y + h / 2 + (i % 2 ? 7 : -7);
        const kk = seg(k, i / n, (i + 1) / n);
        return (
          <g key={i}>
            {i > 0 && <line x1={x + (w / (n + 1)) * i} y1={y + h / 2 + ((i - 1) % 2 ? 7 : -7)} x2={ex} y2={ey} stroke={f} strokeWidth={1} opacity={kk} />}
            <rect x={ex - 5} y={ey - 5} width={10} height={10} rx={2} fill={f} opacity={kk} />
          </g>
        );
      })}
    </g>
  );
}

/** An arrow drawn from (x1,y1) to (x2,y2) by `k`, with a head once it arrives. */
function Arrow({ x1, y1, x2, y2, k, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.5} />
      {k > 0.95 && (
        <path
          d={`M${x2} ${y2} l${(-7 * Math.cos(a - 0.5)).toFixed(1)} ${(-7 * Math.sin(a - 0.5)).toFixed(1)} M${x2} ${y2} l${(-7 * Math.cos(a + 0.5)).toFixed(1)} ${(-7 * Math.sin(a + 0.5)).toFixed(1)}`}
          stroke={f}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}

/** A department mart box. */
function Mart({ x, y, w = 60, k, f = C.mocha }: { x: number; y: number; w?: number; k: number; f?: string }) {
  return <rect x={x} y={y} width={w} height={24} rx={4} fill={C.cocoa} stroke={f} opacity={k} />;
}

// 1 · Hook. Left, top-down: one model is built first and then feeds three marts. Right, bottom-up: stars ship one at a
// time, joined along a shared bus.
export function Hook({ t }: StepCtx) {
  const m = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="one model built first. one bus, built incrementally." h={240}>
      <Model x={45} y={20} w={220} h={46} k={m} />
      {[0, 1, 2].map((i) => {
        const a = easeInOut(seg(t, 1.4 + i * 0.15, 1.8 + i * 0.15));
        return (
          <g key={i}>
            <Arrow x1={155} y1={66} x2={75 + i * 80} y2={106} k={a} />
            <Mart x={45 + i * 80} y={106} k={a} />
          </g>
        );
      })}
      <line x1={330} y1={120} x2={330 + 230 * easeInOut(seg(t, 1.6, 3.0))} y2={120} stroke={C.second} strokeWidth={2} />
      {[0, 1, 2].map((i) => {
        const k = easeOutBack(seg(t, 1.6 + i * 0.55, 2.0 + i * 0.55));
        return (
          <g key={i}>
            <Star cx={360 + i * 85} cy={60} k={clamp(k)} />
            <line x1={360 + i * 85} y1={87} x2={360 + i * 85} y2={87 + 33 * clamp(k)} stroke={C.second} strokeWidth={1.5} />
          </g>
        );
      })}
      <Row y={180} label="Inmon" value="normalized model, built first" k={easeOut(seg(t, 2.9, 3.4))} />
      <Row y={225} label="Kimball" value="bus of stars, built bit by bit" k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 2 · Inmon. One enterprise-wide normalized model fills in entity by entity; only then does it feed each department.
export function RevealInmonDefinition({ t }: StepCtx) {
  return (
    <Svg label="top-down: the model first, marts fed from it" h={250}>
      <Row y={40} label="Inmon's own definition" value="the warehouse itself" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="his direction" value="top-down" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      <Model x={25} y={110} w={550} h={50} k={easeOut(seg(t, 0.6, 2.0))} />
      {[0, 1, 2].map((i) => {
        const a = easeInOut(seg(t, 2.4 + i * 0.25, 2.9 + i * 0.25));
        return (
          <g key={i}>
            <Arrow x1={300} y1={160} x2={115 + i * 185} y2={205} k={a} />
            <Mart x={70 + i * 185} y={205} w={90} k={a} />
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Kimball. One business process gets a star, shipped; the next reuses its shared dimensions along the bus; then
// the next.
export function RevealKimballBus({ t }: StepCtx) {
  const bus = easeInOut(seg(t, 1.2, 3.4));
  return (
    <Svg label="bottom-up: process by process, conformed dimensions reused" h={240}>
      <Row y={40} label="Kimball's own bus" value="incremental, by process" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="his direction" value="bottom-up" valueColor={C.second} k={easeOut(seg(t, 2.6, 3.1))} />
      <line x1={25} y1={210} x2={25 + 550 * bus} y2={210} stroke={C.second} strokeWidth={2.5} />
      {[0, 1, 2].map((i) => {
        const k = easeOutBack(seg(t, 1.0 + i * 0.9, 1.5 + i * 0.9));
        const d = easeOut(seg(t, 1.4 + i * 0.9, 1.7 + i * 0.9));
        return (
          <g key={i}>
            <Star cx={120 + i * 180} cy={150} k={clamp(k)} />
            <line x1={120 + i * 180} y1={177} x2={120 + i * 180} y2={177 + 33 * d} stroke={C.second} strokeWidth={1.5} />
          </g>
        );
      })}
      {[210, 390].map((x, i) => (
        <rect key={x} x={x - 6} y={204} width={12} height={12} rx={2} fill={C.second} opacity={easeOut(seg(t, 2.2 + i * 0.9, 2.5 + i * 0.9))} />
      ))}
    </Svg>
  );
}

// 4 · Predict: a hard deadline. One source, a deadline bar draining; then the question.
export function PredictDeadline({ t, answer }: StepCtx) {
  const d = seg(t, 0.4, 2.4);
  return (
    <Svg label="urgent deadline, one source system" h={210}>
      <Row y={40} label="urgent deadline" value="one source system" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={64} width={550} height={8} rx={4} fill={C.cocoa} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <rect x={25} y={64} width={550 * (1 - 0.7 * d)} height={8} rx={4} fill={C.cherryText} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <AnswerRow y={140} label="fastest to value" answer={answer} value="process-first" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="one star schema, shipped" />
    </Svg>
  );
}

// 5 · Time to value. On the bus lane a star ships and goes live at "now"; on the model lane the design has only
// reached "now", the rest still ahead in outline.
export function RevealTimeToValue({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.6, 1.8));
  const live = easeOutBack(seg(t, 1.8, 2.2));
  const now = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="one star schema, live, while the model is still mid-design" h={200}>
      <Row y={40} label="Kimball's bus" value="one star schema, live" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={54} width={200 * p} height={8} rx={4} fill={C.second} />
      <Star cx={250} cy={58} k={clamp(live)} f={C.focus} sc={0.7} />
      <Row y={115} label="Inmon's model" value="still mid-design" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <rect x={25} y={129} width={550} height={8} rx={4} fill="none" stroke={C.mocha} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={25} y={129} width={200 * p} height={8} rx={4} fill={C.focus} opacity={0.7} />
      <line x1={225} y1={30} x2={225} y2={160} stroke={C.latte} strokeDasharray="3 3" opacity={now} />
      <T x={225} y={180} s={12} f={C.latte} a="middle" o={now}>
        now
      </T>
    </Svg>
  );
}

// 6 · Predict: a dozen sources, one customer. Twelve source dots each draw a line to one shared definition; then the question.
export function PredictIntegration({ t, answer }: StepCtx) {
  return (
    <Svg label="a dozen sources, one shared definition of customer" h={210}>
      <Row y={40} label="a dozen sources" value="one shared customer" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 30 + i * 22;
        const d = easeInOut(seg(t, 0.3 + i * 0.05, 0.8 + i * 0.05));
        return (
          <g key={i}>
            <circle cx={x} cy={84} r={4} fill={C.latte} opacity={easeOut(seg(t, 0.2 + i * 0.04, 0.4 + i * 0.04))} />
            <line x1={x} y1={84} x2={lerp(x, 445, d)} y2={84} stroke={C.mocha} strokeWidth={1} opacity={d > 0 ? 0.8 : 0} />
          </g>
        );
      })}
      <rect x={445} y={70} width={130} height={28} rx={5} fill={C.cocoa} stroke={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={510} y={88} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        customer
      </T>
      <AnswerRow y={140} label="handles it better" answer={answer} value="the single model" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="one definition, agreed once" />
    </Svg>
  );
}

// 7 · The integration cost. In the model, one customer definition feeds every mart, settled once. Mart by mart, each
// one settles its own customer again, one after another.
export function RevealIntegrationCost({ t }: StepCtx) {
  const c = easeOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="one model, one definition, settled once" h={240}>
      <Row y={40} label="Inmon's model" value="one definition, settled once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="mart by mart" value="settled again, every time" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      <rect x={300} y={106} width={140} height={26} rx={5} fill={C.cocoa} stroke={C.focus} opacity={c} />
      <T x={370} y={123} s={12} f={C.crema} a="middle" o={c}>
        customer
      </T>
      <T x={25} y={162} s={12} f={C.latte} o={c}>
        one model
      </T>
      <T x={25} y={222} s={12} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        mart by mart
      </T>
      {[0, 1, 2].map((i) => {
        const a = easeInOut(seg(t, 1.0 + i * 0.2, 1.5 + i * 0.2));
        const r = easeOut(seg(t, 2.8 + i * 0.4, 3.2 + i * 0.4));
        const x = 160 + i * 140;
        return (
          <g key={i}>
            <Arrow x1={370} y1={132} x2={x + 40} y2={150} k={a} f={C.focus} />
            <Mart x={x} y={150} w={80} k={a} f={C.focus} />
            <Mart x={x} y={208} w={80} k={easeOut(seg(t, 2.5, 2.8))} f={r > 0 ? C.cherryText : C.mocha} />
            <T x={x + 40} y={lerp(203, 199, r)} s={11} f={C.cherryText} a="middle" o={r}>
              customer?
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Predict: a rule that keeps changing. The rule's outline shakes; then the question.
export function PredictChangeTolerance({ t, answer }: StepCtx) {
  const sh = seg(t, 0.4, 1.6);
  const dx = sh > 0 && sh < 1 ? Math.sin(sh * Math.PI * 10) * 4 : 0;
  return (
    <Svg label="a business rule that keeps changing" h={210}>
      <Row y={40} label="a rule keeps changing" value="which takes it better?" k={easeOut(seg(t, 0.1, 0.5))} />
      <g transform={`translate(${dx.toFixed(2)} 0)`}>
        <rect x={225} y={64} width={150} height={30} rx={5} fill={C.cocoa} stroke={sh > 0 && sh < 1 ? C.second : C.mocha} opacity={easeOut(seg(t, 0.2, 0.4))} />
        <T x={300} y={84} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.2, 0.4))}>
          business rule
        </T>
      </g>
      <AnswerRow y={140} label="one, cleanly" answer={answer} value="depends on the change" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="it depends what kind of change" />
    </Svg>
  );
}

// 9 · Contested. A new process snaps onto the bus as one more star; a changed rule is fixed once in the model and flows
// down to every mart.
export function RevealChangeContested({ t }: StepCtx) {
  const ns = easeOut(seg(t, 0.8, 1.4));
  const drop = easeOut(seg(t, 1.4, 1.7));
  const rule = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="a new process vs. a changed rule — different wins" h={240}>
      <Row y={40} label="new process" value="the bus absorbs it" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="changed rule" value="the model absorbs it" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.7))} />
      <line x1={25} y1={215} x2={285} y2={215} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {[70, 160].map((x) => (
        <g key={x}>
          <Star cx={x} cy={155} k={easeOut(seg(t, 0.2, 0.5))} sc={0.8} />
          <line x1={x} y1={177} x2={x} y2={215} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
        </g>
      ))}
      <g transform={`translate(${((1 - ns) * 40).toFixed(1)} 0)`}>
        <Star cx={250} cy={155} k={ns} sc={0.8} f={C.focus} />
      </g>
      <line x1={250} y1={177} x2={250} y2={177 + 38 * drop} stroke={C.focus} strokeWidth={1.5} />
      <Model x={315} y={115} w={260} h={36} k={easeOut(seg(t, 0.2, 0.6))} f={C.mocha} />
      <rect x={315} y={115} width={260} height={36} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={rule} />
      {[0, 1, 2].map((i) => {
        const a = easeInOut(seg(t, 2.8 + i * 0.25, 3.2 + i * 0.25));
        return (
          <g key={i}>
            <Arrow x1={445} y1={151} x2={360 + i * 85} y2={192} k={a} f={C.second} />
            <Mart x={330 + i * 85} y={192} k={easeOut(seg(t, 0.3, 0.6))} f={a > 0.95 ? C.second : C.mocha} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Three axes. Each axis lands, and its marker slides toward the side it favours: speed to the bus, agreement to
// the model, change wavering in the middle.
export function RevealThreeAxes({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['time to value', 'the bus wins', 0],
    ['integration cost', 'the model wins', 1],
    ['tolerance to change', 'contested, by kind', 0.5],
  ];
  return (
    <Svg label="three axes, three different verdicts" h={220}>
      <T x={25} y={20} s={12} f={C.second} o={easeOut(seg(t, 0.4, 0.8))}>
        bus
      </T>
      <T x={575} y={20} s={12} f={C.focus} a="end" o={easeOut(seg(t, 0.4, 0.8))}>
        model
      </T>
      {rows.map(([label, value, side], i) => {
        const k = easeOut(seg(t, 1.2 + i * 0.8, 1.7 + i * 0.8));
        const m = easeInOut(seg(t, 1.5 + i * 0.8, 2.2 + i * 0.8));
        const y = 60 + i * 60;
        const wob = side === 0.5 ? Math.sin(seg(t, 3.0, 4.2) * Math.PI * 4) * 60 * (1 - seg(t, 3.0, 4.2)) : 0;
        const x = lerp(300, 25 + 550 * side, m) + wob;
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} k={k} />
            <line x1={25} y1={y + 16} x2={575} y2={y + 16} stroke={C.mocha} opacity={k} />
            <circle cx={clamp(x, 31, 569)} cy={y + 16} r={6} fill={side === 0 ? C.second : side === 1 ? C.focus : C.crema} opacity={k} />
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · The ELT shift. Storage cost shrinks and compute speed grows; then transform slides past load: the pipeline
// becomes extract, load, transform.
export function RevealELTShift({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.0, 2.0));
  const sw = easeInOut(seg(t, 2.6, 3.4));
  const k = easeOut(seg(t, 2.2, 2.6));
  const chip = (x: number, y: number, l: string, f: string) => (
    <g opacity={k}>
      <rect x={x} y={y} width={170} height={30} rx={5} fill={C.cocoa} stroke={f} />
      <T x={x + 85} y={y + 20} s={12} f={C.crema} a="middle">
        {l}
      </T>
    </g>
  );
  return (
    <Svg label="storage cheaper, compute faster, transform after load" h={230}>
      <Row y={40} label="cloud" value="storage cheap, compute fast" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="transform now happens" value="after load, not before" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      {chip(25, 110, 'extract', C.mocha)}
      {chip(lerp(215, 405, sw), 110 - Math.sin(sw * Math.PI) * 14, 'transform', C.focus)}
      {chip(lerp(405, 215, sw), 110 + Math.sin(sw * Math.PI) * 14, 'load', C.mocha)}
      <g opacity={easeOut(seg(t, 0.8, 1.1))}>
        <T x={25} y={185} s={12} f={C.latte}>
          storage cost
        </T>
        <rect x={25} y={195} width={250 * (1 - 0.75 * c)} height={10} rx={3} fill={C.cherryText} />
        <T x={325} y={185} s={12} f={C.latte}>
          compute speed
        </T>
        <rect x={325} y={195} width={250 * (0.25 + 0.75 * c)} height={10} rx={3} fill={C.focus} />
      </g>
    </Svg>
  );
}

// 12 · Narrowed. Stars ship first along the bus; later an integration model folds in above them and links them all.
export function RevealGapNarrowed({ t }: StepCtx) {
  const m = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="start incremental, fold in integration later" h={240}>
      <Row y={40} label="start with" value="Kimball's incremental marts" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="fold in later" value="Inmon-style integration" valueColor={C.second} k={easeOut(seg(t, 2.4, 2.9))} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Star cx={120 + i * 180} cy={200} k={clamp(easeOutBack(seg(t, 0.8 + i * 0.4, 1.2 + i * 0.4)))} />
          <Arrow x1={300} y1={150} x2={120 + i * 180} y2={176} k={easeInOut(seg(t, 3.1 + i * 0.15, 3.5 + i * 0.15))} f={C.second} />
        </g>
      ))}
      <g transform={`translate(0 ${((1 - m) * -12).toFixed(1)})`}>
        <Model x={150} y={115} w={300} h={35} k={m} f={C.second} />
      </g>
    </Svg>
  );
}

// 13 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="top-down vs. bottom-up; three axes; narrowed, not erased" h={220}>
      <Row y={50} label="Inmon vs. Kimball" value="top-down vs. bottom-up" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={110} label="the real choice" value="three axes, not one verdict" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={170} label="ELT's effect" value="narrowed, not erased" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 14 · Prove: a new source every cycle. Two stars on the bus; after the answer a third snaps on, and the verdict lands
// with a tick.
export function ProveBusChoice({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const ns = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const base = easeOut(seg(t, 0.6, 1.0));
  return (
    <Svg label="a new source every cycle, no agreed model yet" h={230}>
      <Row y={40} label="a new source, often" value="no model agreed yet" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the better fit is" answer={answer} value="process-first" k={easeOut(seg(t, 0.4, 0.9))} />
      <line x1={25} y1={158} x2={575} y2={158} stroke={C.second} strokeWidth={2} opacity={base} />
      {[100, 220].map((x) => (
        <Star key={x} cx={x} cy={128} k={base} sc={0.7} />
      ))}
      <g transform={`translate(${((1 - ns) * 40).toFixed(1)} 0)`}>
        <Star cx={340} cy={128} k={ns} sc={0.7} f={C.focus} />
      </g>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            one more star per new source
          </T>
          <rect x={170} y={202} width={260 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
