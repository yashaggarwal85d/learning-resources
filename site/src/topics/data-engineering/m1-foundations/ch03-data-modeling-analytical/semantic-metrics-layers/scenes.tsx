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

/** The shop's star schema: the orders fact in the middle, product to its left, customer to its right; `j` lights joins. */
function Star({ y, k, jp = 0, jc = 0, hiFact = false }: { y: number; k: number; jp?: number; jc?: number; hiFact?: boolean }) {
  return (
    <g opacity={k}>
      <Cell x={25} y={y} w={150} h={30} label="product" stroke={jp >= 1 ? C.focus : C.mocha} />
      <Cell x={225} y={y} w={150} h={30} label="orders fact" stroke={hiFact ? C.focus : C.mocha} />
      <Cell x={425} y={y} w={150} h={30} label="customer" stroke={jc >= 1 ? C.focus : C.mocha} />
      <line x1={225} y1={y + 15} x2={lerp(225, 175, jp)} y2={y + 15} stroke={C.focus} strokeWidth={2} />
      <line x1={375} y1={y + 15} x2={lerp(375, 425, jc)} y2={y + 15} stroke={C.focus} strokeWidth={2} />
    </g>
  );
}

// 1 · Hook. One data source feeds two dashboards in two tools; their revenue bars come out at different heights; a not-equal
// sign lands between them.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.2, 2.0));
  const b = easeOut(seg(t, 1.6, 2.4));
  const ne = easeOutBack(seg(t, 2.6, 3.0));
  return (
    <Svg label="two dashboards, two tools, one month — two different revenue figures" h={250}>
      <Row y={40} label="same data, same month" value="two dashboards" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="two revenue figures" value="where from?" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <Cell x={225} y={205} w={150} h={30} label="same data" o={easeOut(seg(t, 0.4, 0.8))} />
      {[0, 1].map((i) => {
        const x = i === 0 ? 25 : 425;
        const h = i === 0 ? 70 * a : 52 * b;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
            <rect x={x} y={115} width={150} height={80} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
            <rect x={x + 55} y={190 - h} width={40} height={h} fill={i === 0 ? C.crema : C.second} opacity={0.7} />
            <T x={x + 75} y={222} s={11} f={C.latte} a="middle">
              {i === 0 ? 'finance' : 'marketing'}
            </T>
            <line x1={i === 0 ? 175 : 425} y1={155} x2={i === 0 ? 245 : 355} y2={205} stroke={C.latte} strokeWidth={1.2} />
          </g>
        );
      })}
      <T x={300} y={162} s={26} f={C.cherryText} a="middle" o={clamp(ne)}>
        ≠
      </T>
    </Svg>
  );
}

// 2 · What it does. One metric definition passes through a compiler and comes out as SQL, the same way, for three different
// dimensions.
export function RevealPurposeQuote({ t }: StepCtx) {
  const DIMS = ['by month', 'by category', 'by region'];
  return (
    <Svg label="one metric, compiled to SQL — the same way, across different dimensions" h={250}>
      <Row y={40} label="one metric definition" value="compiled to SQL" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the same way" value="whatever the dimension" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={155} w={150} h={34} label="revenue metric" o={easeOut(seg(t, 0.5, 0.9))} stroke={C.focus} />
      <line x1={175} y1={172} x2={lerp(175, 225, easeInOut(seg(t, 0.9, 1.3)))} y2={172} stroke={C.latte} strokeWidth={1.5} />
      <Cell x={225} y={155} w={110} h={34} label="compile" o={easeOut(seg(t, 1.1, 1.4))} />
      {DIMS.map((d, i) => {
        const l = easeInOut(seg(t, 1.5 + i * 0.4, 2.0 + i * 0.4));
        const y = 120 + i * 40;
        return (
          <g key={d}>
            <line x1={335} y1={172} x2={lerp(335, 405, l)} y2={lerp(172, y + 13, l)} stroke={C.focus} strokeWidth={1.5} />
            <Cell x={405} y={y} w={170} h={26} label={`SQL · ${d}`} o={l} />
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Predict: one fixed query? A single metric declaration; then the question.
export function PredictOneFixedQuery({ t, answer }: StepCtx) {
  return (
    <Svg label="one metric, declared once — only ever one fixed query?" h={210}>
      <Row y={40} label="declared once" value="one fixed query?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="revenue · declared" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      <line x1={225} y1={73} x2={lerp(225, 395, easeInOut(seg(t, 0.6, 1.2)))} y2={73} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <Cell x={395} y={60} w={180} h={26} label="query?" o={easeOut(seg(t, 1.0, 1.3))} />
      <AnswerRow y={140} label="one fixed query" answer={answer} value="no, one per question" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="each question compiles its own query" />
    </Svg>
  );
}

// 4 · One metric, declared once. The star schema draws; the revenue declaration settles on top of the orders fact; a ghost
// second copy is crossed out.
export function RevealLabOneMetric({ t }: StepCtx) {
  const d = easeOutBack(seg(t, 1.4, 2.0));
  const x = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="revenue, declared once — one measure, the shop's own star schema underneath it" h={250}>
      <Row y={40} label="revenue" value="declared once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="sitting on" value="the shop's star schema" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Star y={190} k={easeOut(seg(t, 0.5, 1.0))} hiFact={d > 0.5} />
      <g opacity={clamp(d * 2)} transform={`translate(0 ${lerp(-16, 0, clamp(d)).toFixed(1)})`}>
        <Cell x={195} y={125} w={210} h={30} label="revenue = sum(amount)" stroke={C.focus} f={C.focus} />
        <line x1={300} y1={155} x2={300} y2={190} stroke={C.focus} strokeWidth={1.5} />
      </g>
      <g opacity={easeOut(seg(t, 2.4, 2.7)) * 0.7}>
        <rect x={425} y={125} width={150} height={30} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
        <T x={500} y={144} s={11} f={C.latte} a="middle">
          a second copy
        </T>
      </g>
      <path d="M492 132 l16 16 m0 -16 l-16 16" stroke={C.cherryText} strokeWidth={2.5} opacity={x} />
    </Svg>
  );
}

// 5 · Two compiled queries. The same declaration asked for a monthly total compiles with no join (the fact alone lights);
// asked by day and category, the join to product draws itself; both tick against an independent total.
export function RevealLabTwoQueries({ t }: StepCtx) {
  const jp = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="same declaration — a plain monthly total, and a joined daily breakdown, both verified" h={250}>
      <Row y={40} label="monthly total" value="no join" k={easeOut(seg(t, 0.5, 1.0))} />
      <Row y={85} label="day by category" value="join added, automatically" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      <Star y={150} k={easeOut(seg(t, 0.3, 0.7))} hiFact={t > 0.8} jp={jp} />
      <T x={300} y={210} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        both match an independent total
      </T>
      <Tick y={196} k={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

// 6 · Predict: guess the join? Orders carries a product id; product carries a matching id; a dashed question mark between them.
export function PredictGuessJoin({ t, answer }: StepCtx) {
  return (
    <Svg label="matching column names — declare the relationship, or just guess it?" h={210}>
      <Row y={40} label="names match" value="guess the join?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="orders · product_id" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={375} y={60} w={200} h={26} label="product · product_id" o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={225} y1={73} x2={375} y2={73} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={300} y={68} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        ?
      </T>
      <AnswerRow y={140} label="just guess it" answer={answer} value="no, declare it" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="it joins because it's declared" />
    </Svg>
  );
}

// 7 · Entities. A declared entity key tags both tables and a solid join path draws between them; a merely similar-looking
// column elsewhere gets no path, and is crossed.
export function RevealEntitiesQuote({ t }: StepCtx) {
  const tg = easeOutBack(seg(t, 0.9, 1.4));
  const l = easeInOut(seg(t, 1.5, 2.2));
  const x = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="declared join keys — explicit traversal paths, never inferred from column names" h={250}>
      <Row y={40} label="entities" value="declared join keys" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="never inferred" value="from column names" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={135} w={200} h={30} label="orders" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={375} y={135} w={200} h={30} label="product" o={easeOut(seg(t, 0.5, 0.8))} />
      {[125, 475].map((cx) => (
        <g key={cx} opacity={clamp(tg * 2)} transform={`translate(0 ${lerp(-8, 0, clamp(tg)).toFixed(1)})`}>
          <Cell x={cx - 75} y={110} w={150} h={20} label="entity: product" stroke={C.focus} f={C.focus} />
        </g>
      ))}
      <line x1={225} y1={150} x2={lerp(225, 375, l)} y2={150} stroke={C.focus} strokeWidth={2.5} />
      <Cell x={375} y={200} w={200} h={28} label="supplier · id" o={easeOut(seg(t, 2.4, 2.7))} />
      <line x1={225} y1={160} x2={375} y2={212} stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.5, 2.8)) * (1 - 0.5 * x)} />
      <path d="M292 178 l14 14 m0 -14 l-14 14" stroke={C.cherryText} strokeWidth={2.5} opacity={x} />
    </Svg>
  );
}

// 8 · DRY. Scattered copies of the same definition fade away; one definition remains and its lines reach every place that uses it.
export function RevealDryQuote({ t }: StepCtx) {
  const USES = ['finance dashboard', 'marketing dashboard', 'notebook', 'API'];
  const f = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="minimize redundancy — one definition, used everywhere it possibly can" h={250}>
      <Row y={40} label="minimize redundancy" value="one definition" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="used" value="everywhere it can be" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={158} w={170} h={34} label="revenue, once" o={easeOut(seg(t, 0.4, 0.7))} stroke={C.focus} />
      {USES.map((u, i) => {
        const y = 115 + i * 32;
        const l = easeInOut(seg(t, 1.6 + i * 0.3, 2.1 + i * 0.3));
        return (
          <g key={u}>
            <rect x={245} y={y + 2} width={90} height={20} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1} strokeDasharray="3 3" opacity={(1 - f) * easeOut(seg(t, 0.4, 0.6))} />
            <line x1={195} y1={175} x2={lerp(195, 385, l)} y2={lerp(175, y + 12, l)} stroke={C.focus} strokeWidth={1.5} />
            <Cell x={385} y={y} w={190} h={24} label={u} o={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))} stroke={l >= 1 ? C.focus : C.mocha} />
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Predict: any date column? The orders table with its ordinary date column; then the question.
export function PredictDedicatedTimeTable({ t, answer }: StepCtx) {
  return (
    <Svg label="a date column, already there — a dedicated table needed, or does it just work?" h={210}>
      <Row y={40} label="a date column, there" value="good enough?" k={easeOut(seg(t, 0.1, 0.5))} />
      {['order id', 'order date', 'amount'].map((c, i) => (
        <Cell key={c} x={25 + i * 135} y={60} w={125} h={26} label={c} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} stroke={i === 1 ? C.second : C.mocha} />
      ))}
      <AnswerRow y={140} label="any date column" answer={answer} value="no, a time table" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a dedicated, declared time table first" />
    </Svg>
  );
}

// 10 · The time spine. A strip of consecutive days builds, every day present; order rows hook onto the days they fall on; the
// days then group into months.
export function RevealTimeSpineQuote({ t }: StepCtx) {
  const HITS = [1, 2, 4, 7, 8, 11];
  const g = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="a dedicated base table, built for time joins — not just any table with a date column" h={250}>
      <Row y={40} label="time spine" value="built for time joins" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="not just" value="any table with a date" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={25 + i * 46} y={170} width={40} height={22} rx={2} fill={C.cocoa} stroke={C.second} strokeWidth={1.2} opacity={easeOut(seg(t, 0.5 + i * 0.06, 0.7 + i * 0.06))} />
      ))}
      <T x={25} y={210} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        every day, no gaps
      </T>
      {HITS.map((d, i) => {
        const k = easeOutBack(seg(t, 1.4 + i * 0.15, 1.8 + i * 0.15));
        return <circle key={d} cx={45 + d * 46} cy={lerp(120, 158, clamp(k))} r={5} fill={C.crema} opacity={clamp(k * 2)} />;
      })}
      {[0, 1].map((m) => (
        <path key={m} d={`M${27 + m * 276} 222 v6 h${270 * g} v-6`} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={g} />
      ))}
      <T x={575} y={244} s={11} f={C.focus} a="end" o={g}>
        grouped by month
      </T>
    </Svg>
  );
}

// 11 · The bigger picture. Two other tools sit dashed, named only; this layer's lock opens to an open license; a line runs to
// the open standard, whose name tag slides to a new one as it matures.
export function RevealOtherToolsQuote({ t }: StepCtx) {
  const op = easeInOut(seg(t, 1.6, 2.2));
  const rn = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="other tools, named; an open license, an industry conference, a standard still renaming itself" h={250}>
      <Row y={40} label="other tools" value="named, not built here" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="this layer" value="open-licensed, on stage" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      {[0, 1].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
          <rect x={25} y={118 + i * 40} width={150} height={28} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" />
          <T x={100} y={137 + i * 40} s={12} f={C.latte} a="middle">
            another tool
          </T>
        </g>
      ))}
      <Cell x={225} y={135} w={150} h={34} label="this layer" o={easeOut(seg(t, 1.2, 1.5))} stroke={C.focus} />
      <g opacity={easeOut(seg(t, 1.2, 1.5))} transform="translate(300 195)">
        <path d={`M-7 0 v-6 a7 7 0 0 1 14 0 ${op > 0.5 ? 'v-4' : 'v6'}`} fill="none" stroke={C.focus} strokeWidth={2.5} transform={`translate(0 ${(-6 * op).toFixed(1)})`} />
        <rect x={-11} y={0} width={22} height={16} rx={3} fill={C.focus} />
      </g>
      <line x1={375} y1={152} x2={lerp(375, 425, easeInOut(seg(t, 2.4, 2.8)))} y2={152} stroke={C.focus} strokeWidth={1.5} />
      <Cell x={425} y={135} w={150} h={34} label="open standard" o={easeOut(seg(t, 2.6, 2.9))} />
      <rect x={445} y={lerp(185, 200, rn)} width={110} height={14} rx={3} fill={rn > 0.5 ? C.focus : C.latte} opacity={0.5 * easeOut(seg(t, 2.8, 3.0))} />
      <T x={500} y={230} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        since renamed
      </T>
    </Svg>
  );
}

// 12 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one declaration, many correct queries; declared joins; a required time table; an industry effort" h={240}>
      <Row y={40} label="one declaration" value="many correct queries" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="join keys" value="declared, not guessed" k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="time table" value="required, declared" k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="the whole idea" value="an industry effort" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 13 · Prove: by region now. The same declaration and the star; after the answer the join to customer draws itself, and the
// verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const jc = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="the same metric, a new breakdown by region — a brand-new definition needed?" h={230}>
      <Row y={40} label="same metric, by region" value="a new definition?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="needed" answer={answer} value="no, the same one" k={easeOut(seg(t, 0.4, 0.9))} />
      <Star y={118} k={easeOut(seg(t, 0.5, 0.9))} jc={jc} hiFact />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            same declaration, a new group-by
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={166} k={tick} />
        </>
      )}
    </Svg>
  );
}
