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

/** A labelled chip: a rounded box with its name centred. */
function Chip({ x, y, w, h = 30, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** Two entity boxes and the line between them. `kb` brings the boxes in from the sides, `kl` draws the line. */
function Pair({ left, right, kb, kl, y = 70, line = C.mocha }: { left: string; right: string; kb: number; kl: number; y?: number; line?: string }) {
  return (
    <g>
      <g opacity={kb} transform={`translate(${((1 - kb) * -20).toFixed(1)} 0)`}>
        <rect x={60} y={y} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
        <T x={140} y={y + 42} s={17} f={C.crema} a="middle">
          {left}
        </T>
      </g>
      <g opacity={kb} transform={`translate(${((1 - kb) * 20).toFixed(1)} 0)`}>
        <rect x={380} y={y} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
        <T x={460} y={y + 42} s={17} f={C.crema} a="middle">
          {right}
        </T>
      </g>
      <line x1={220} y1={y + 35} x2={220 + 160 * kl} y2={y + 35} stroke={line} strokeWidth={2} />
    </g>
  );
}

// 1 · Opening. Three decisions as three chips, arriving left to right.
export function Opening({ t }: StepCtx) {
  const levels = ['conceptual', 'logical', 'physical'];
  return (
    <Svg label="three decisions every schema passes through" h={210}>
      <Row y={40} label="before a table exists" value="three decisions" k={easeOut(seg(t, 0.1, 0.5))} />
      {levels.map((l, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.3, 0.8 + i * 0.3));
        return (
          <g key={l}>
            <Chip x={25 + i * 190} y={lerp(82, 74, k)} w={170} h={36} label={l} o={k} />
            {i > 0 && <line x1={195 + (i - 1) * 190} y1={92} x2={195 + (i - 1) * 190 + 20 * k} y2={92} stroke={C.latte} strokeWidth={2} />}
          </g>
        );
      })}
      <Row y={165} label="this refresher" value="what each one fixes" k={easeOut(seg(t, 1.3, 1.8))} />
    </Svg>
  );
}

// 2 · Conceptual. Customer and Address arrive, the relationship is drawn and named; then the things this level leaves
// out on purpose are struck through.
export function RevealConceptual({ t }: StepCtx) {
  const missing = ['numbers', 'columns', 'database'];
  return (
    <Svg label="the conceptual level names entities and their relationship" h={250}>
      <Pair left="Customer" right="Address" kb={easeOut(seg(t, 0.1, 0.6))} kl={easeInOut(seg(t, 0.6, 1.2))} />
      <T x={300} y={97} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 1.1, 1.5))}>
        has more than one
      </T>
      {missing.map((m, i) => {
        const k = easeOut(seg(t, 1.7 + i * 0.25, 2.0 + i * 0.25));
        const st = easeInOut(seg(t, 2.6 + i * 0.15, 2.9 + i * 0.15));
        const x = 110 + i * 190;
        return (
          <g key={m}>
            <T x={x} y={182} s={13} f={C.latte} a="middle" o={k}>
              {m}
            </T>
            <line x1={x - 40} y1={177} x2={x - 40 + 80 * st} y2={177} stroke={C.cherryText} strokeWidth={2} />
          </g>
        );
      })}
      <Row y={230} label="level" value="conceptual: entities only" k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 3 · Predict: is the shape fixed yet? The named relationship, small; then the question.
export function PredictConceptualFixesShape({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.4, 0.8));
  return (
    <Svg label="is the shape and storage already fixed" h={210}>
      <Row y={40} label="fact named" value="more than one address" k={easeOut(seg(t, 0.1, 0.6))} />
      <Chip x={25} y={64} w={130} label="Customer" o={k} />
      <line x1={155} y1={79} x2={155 + 290 * easeInOut(seg(t, 0.7, 1.2))} y2={79} stroke={C.mocha} strokeWidth={2} />
      <Chip x={445} y={64} w={130} label="Address" o={k} />
      <AnswerRow y={140} label="shape and storage" answer={answer} value="not fixed yet" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="naming a relationship isn't fixing its shape" />
    </Svg>
  );
}

// 4 · Logical. The same pair gets its shape: a bar for exactly one at the Customer end, a crow's foot for many at
// the Address end; then the label.
export function RevealLogical({ t }: StepCtx) {
  const one = easeOut(seg(t, 0.6, 1.0));
  const foot = easeInOut(seg(t, 1.0, 1.7));
  return (
    <Svg label="the logical level adds cardinality and attributes" h={210}>
      <Pair left="Customer" right="Address" kb={easeOut(seg(t, 0.1, 0.4))} kl={easeInOut(seg(t, 0.2, 0.6))} />
      <line x1={238} y1={105 - 12 * one} x2={238} y2={105 + 12 * one} stroke={C.second} strokeWidth={2.5} />
      {[-12, 0, 12].map((d) => (
        <line key={d} x1={358} y1={105} x2={358 + 22 * foot} y2={105 + d * foot} stroke={C.second} strokeWidth={2.5} />
      ))}
      <T x={300} y={92} s={13} f={C.second} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        one — many
      </T>
      <Row y={185} label="level" value="logical: no engine yet" k={easeOut(seg(t, 2.4, 2.9))} />
    </Svg>
  );
}

// 5 · Physical. Now two real tables: their key columns appear, the foreign key is drawn from address.customer_id to
// customer.id, and an index lands under it.
export function RevealPhysical({ t }: StepCtx) {
  const kb = easeOut(seg(t, 0.2, 0.7));
  const cols = easeOut(seg(t, 0.8, 1.3));
  const fk = easeInOut(seg(t, 1.5, 2.3));
  const ix = easeOutBack(seg(t, 2.5, 2.9));
  const tables: [number, string, string][] = [
    [60, 'customer', 'id · PK'],
    [380, 'address', 'customer_id · FK'],
  ];
  return (
    <Svg label="the physical level is a real table with a foreign key" h={250}>
      {tables.map(([x, name, col]) => (
        <g key={name} opacity={kb}>
          <rect x={x} y={60} width={160} height={84} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
          <T x={x + 80} y={84} s={15} f={C.crema} a="middle">
            {name}
          </T>
          <line x1={x} y1={96} x2={x + 160} y2={96} stroke={C.mocha} />
          <T x={x + 80} y={124} s={12} f={C.latte} a="middle" o={cols}>
            {col}
          </T>
        </g>
      ))}
      <line x1={380} y1={120} x2={380 - 160 * fk} y2={120} stroke={C.focus} strokeWidth={2.5} />
      {fk > 0.95 && <path d="M228 114 l-8 6 l8 6" fill="none" stroke={C.focus} strokeWidth={2.5} />}
      <g opacity={clamp(ix)} transform={`translate(460 160) scale(${0.7 + 0.3 * clamp(ix)}) translate(-460 -160)`}>
        <rect x={415} y={150} width={90} height={22} rx={5} fill="none" stroke={C.focus} />
        <T x={460} y={166} s={12} f={C.focus} a="middle">
          index
        </T>
      </g>
      <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        foreign key, indexed
      </T>
      <Row y={238} label="level" value="physical: has to run" k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 6 · The decision flow. Each level lands in turn with what it fixes; then the warning about fixing too early.
export function RevealDecisionFlow({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['conceptual', 'fixes entities'],
    ['logical', 'fixes structure'],
    ['physical', 'fixes the layout'],
  ];
  const w = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="each level fixes what the one before it left open" h={250}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={45 + i * 50} label={label} value={value} k={easeOut(seg(t, 0.2 + i * 0.6, 0.7 + i * 0.6))} />
      ))}
      {[0, 1].map((i) => (
        <path key={i} d={`M 40 ${55 + i * 50} l 0 20 l -5 -6 m 5 6 l 5 -6`} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} />
      ))}
      <T x={300} y={lerp(228, 220, w)} s={14} f={C.cherryText} a="middle" o={w}>
        a type fixed too early closes a door
      </T>
    </Svg>
  );
}

// 7 · The boundary blurs. One engine: the logical chip slides into the physical one and merges. Two engines: one logical
// model feeds two physical ones.
export function RevealBoundaryBlurs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const m = easeInOut(seg(t, 1.0, 2.0));
  const b = easeOut(seg(t, 2.4, 2.8));
  const f = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="single-engine builds often merge logical and physical" h={250}>
      <Row y={40} label="single engine" value="logical, physical merge" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={85} label="kept separate" value="one logical, many engines" valueColor={C.second} k={easeOut(seg(t, 2.3, 2.8))} />
      <Chip x={25} y={110} w={150} label="conceptual" o={a} />
      <Chip x={lerp(215, 405, m)} y={110} w={150} label="logical" o={a * (1 - m)} />
      <Chip x={405} y={110} w={170} label="physical" o={a} stroke={m > 0.9 ? C.focus : C.mocha} />
      <Chip x={215} y={185} w={150} label="logical" o={b} stroke={C.second} />
      {[0, 1].map((i) => (
        <path key={i} d={`M365 200 C 385 200 385 ${172 + i * 56} 405 ${172 + i * 56}`} fill="none" stroke={C.second} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - f} />
      ))}
      <Chip x={405} y={160} w={170} h={26} label="engine A" o={easeOut(seg(t, 3.2, 3.6))} />
      <Chip x={405} y={214} w={170} h={26} label="engine B" o={easeOut(seg(t, 3.4, 3.8))} />
    </Svg>
  );
}

// 8 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three levels, three jobs" h={200}>
      <Row y={60} label="conceptual" value="what exists" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={110} label="logical" value="how it is shaped" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={160} label="physical" value="how it runs" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
    </Svg>
  );
}
