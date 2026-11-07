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

/** A contract document: a page outline with `lines` key lines, each revealed by `k(i)` and coloured by `f(i)`. */
function Doc({ x, y, w, lines, k, f = () => C.crema, o = 1 }: { x: number; y: number; w: number; lines: string[]; k: (i: number) => number; f?: (i: number) => string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={20 + lines.length * 24} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      {lines.map((l, i) => (
        <T key={l} x={x + 14} y={y + 30 + i * 24} s={12} f={f(i)} o={k(i)}>
          {l}
        </T>
      ))}
    </g>
  );
}

/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 8} ${y - 8} l16 16 m0 -16 l-16 16`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

// 1 · Hook. A producer's schema feeds a dashboard; overnight a field shifts and goes red; the dashboard goes blank with no
// error; an empty dashed slot marks what was missing, a contract.
export function Hook({ t }: StepCtx) {
  const ch = easeOut(seg(t, 1.2, 1.7));
  const bl = easeOut(seg(t, 2.0, 2.6));
  const slot = easeOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="a schema, changed overnight — a dashboard, broken silently: a missing contract" h={250}>
      <Row y={40} label="schema changed" value="overnight, no warning" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="dashboard" value="broke silently" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.7))} />
      <Cell x={25} y={135} w={150} h={30} label="producer" o={easeOut(seg(t, 0.4, 0.7))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={205} y={125 + i * 18 + (i === 1 ? ch * 6 : 0)} width={110} height={14} rx={2} fill={i === 1 && ch > 0 ? C.cherryText : C.latte} opacity={0.6 * easeOut(seg(t, 0.5, 0.8))} />
      ))}
      <line x1={315} y1={150} x2={425} y2={150} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <rect x={425} y={120} width={150} height={60} rx={4} fill={C.cocoa} stroke={bl > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={440 + i * 42} y={170 - (14 + i * 10) * (1 - bl)} width={30} height={(14 + i * 10) * (1 - bl)} fill={C.focus} opacity={0.6 * easeOut(seg(t, 0.6, 0.9))} />
      ))}
      <rect x={205} y={200} width={110} height={36} rx={4} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 4" opacity={slot} />
      <T x={260} y={223} s={12} f={C.focus} a="middle" o={slot}>
        a contract?
      </T>
    </Svg>
  );
}

// 2 · The format. A wiki page and a spoken promise are crossed out; a structured document builds line by line, key by key.
export function RevealContractFormatQuote({ t }: StepCtx) {
  return (
    <Svg label="keys and values, under an open standard — not a wiki page, not a promise" h={250}>
      <Row y={40} label="keys and values" value="an open standard" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="not" value="a wiki page, a promise" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Doc x={25} y={112} w={260} lines={['schema:', 'quality:', 'SLAs:', 'team:']} k={(i) => easeOut(seg(t, 0.8 + i * 0.35, 1.1 + i * 0.35))} />
      {['wiki page', 'a promise'].map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, 2.2 + i * 0.2, 2.5 + i * 0.2))}>
          <Cell x={345} y={130 + i * 50} w={190} h={30} label={l} f={C.latte} />
          <Cross x={555} y={145 + i * 50} k={easeOut(seg(t, 2.8 + i * 0.3, 3.1 + i * 0.3))} />
        </g>
      ))}
    </Svg>
  );
}

// 3 · Predict: pick one? Two separate documents, business meaning and physical layout; then the question.
export function PredictMustPickOne({ t, answer }: StepCtx) {
  return (
    <Svg label="business meaning, physical layout — does a contract have to pick just one?" h={210}>
      <Row y={40} label="meaning or layout" value="pick just one?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={250} h={26} label="business meaning" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={325} y={60} w={250} h={26} label="physical layout" o={easeOut(seg(t, 0.5, 0.8))} />
      <AnswerRow y={140} label="pick one" answer={answer} value="no, both, in one" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="one schema ties them together" />
    </Svg>
  );
}

// 4 · Schema as both. The two separate documents slide together into one field row: its business name beside its physical type.
export function RevealSchemaBothQuote({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.9, 1.9));
  const r = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="business representation, physical implementation — tied together, one field's own name" h={250}>
      <Row y={40} label="one schema" value="business and physical" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="one field" value="both, side by side" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <T x={lerp(25, 115, m)} y={128} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        business name
      </T>
      <T x={lerp(345, 315, m)} y={128} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        physical type
      </T>
      <rect x={lerp(25, 115, m)} y={136} width={lerp(230, 190, m)} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={lerp(345, 315, m)} y={136} width={lerp(230, 170, m)} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={210} y={156} s={13} f={C.crema} a="middle" o={r}>
        customer email
      </T>
      <T x={400} y={156} s={13} f={C.crema} a="middle" o={r}>
        text
      </T>
      <rect x={105} y={130} width={390 * easeOut(seg(t, 2.6, 3.1))} height={42} rx={6} fill="none" stroke={C.focus} strokeWidth={2} />
      <T x={300} y={200} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        one field, one row
      </T>
    </Svg>
  );
}

// 5 · Quality tied to schema. Schema fields on the left; the quality section on the right; a line pins each rule to the field
// it checks.
export function RevealQualityTiedQuote({ t }: StepCtx) {
  const FIELDS = ['order id', 'amount', 'email'];
  const RULES = ['never empty', 'never negative', 'valid format'];
  return (
    <Svg label="quality rules, tightly linked to the schema — not floating free, disconnected" h={250}>
      <Row y={40} label="quality rules" value="their own section" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="pinned to" value="the schema they check" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        schema
      </T>
      <T x={375} y={122} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        quality
      </T>
      {FIELDS.map((f, i) => {
        const l = easeInOut(seg(t, 1.8 + i * 0.4, 2.3 + i * 0.4));
        return (
          <g key={f}>
            <Cell x={25} y={130 + i * 36} w={170} h={26} label={f} o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} stroke={l >= 1 ? C.focus : C.mocha} />
            <Cell x={375} y={130 + i * 36} w={200} h={26} label={RULES[i]} o={easeOut(seg(t, 1.1 + i * 0.1, 1.4 + i * 0.1))} stroke={l >= 1 ? C.focus : C.mocha} />
            <line x1={375} y1={143 + i * 36} x2={lerp(375, 195, l)} y2={143 + i * 36} stroke={C.focus} strokeWidth={1.5} />
          </g>
        );
      })}
    </Svg>
  );
}

const HOPS = ['producer', 'queue', 'warehouse', 'reports'];

/** A row of pipeline hops at `y`, each a small cell, joined by lines. */
function Hops({ y, k, f = () => C.mocha }: { y: number; k: number; f?: (i: number) => string }) {
  return (
    <g opacity={k}>
      {HOPS.map((h, i) => (
        <g key={h}>
          {i > 0 && <line x1={25 + i * 142 - 22} y1={y + 13} x2={25 + i * 142} y2={y + 13} stroke={C.latte} strokeWidth={1.2} />}
          <Cell x={25 + i * 142} y={y} w={120} h={26} label={h} stroke={f(i)} />
        </g>
      ))}
    </g>
  );
}

// 6 · Predict: is a downstream check real enforcement? A bad record travels past the producer and the queue before a check in
// the warehouse; then the question.
export function PredictDownstreamEnoughCheck({ t, answer }: StepCtx) {
  const p = seg(t, 0.5, 1.5);
  return (
    <Svg label="a check, run only downstream — late enough to still count as enforcement?" h={210}>
      <Row y={40} label="check in the warehouse" value="enforcement?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Hops y={60} k={easeOut(seg(t, 0.1, 0.4))} f={(i) => (i === 2 ? C.focus : C.mocha)} />
      {p > 0 && <circle cx={lerp(85, 369, p)} cy={98} r={5} fill={C.cherryText} />}
      <AnswerRow y={140} label="real enforcement" answer={answer} value="no, too late" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="everyone in between already saw it" f={C.cherryText} />
    </Svg>
  );
}

// 7 · The producer boundary. A bad record leaves the producer and hits a gate right at its edge; it bounces back, and nothing
// downstream ever sees it.
export function RevealProducerBoundaryQuote({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.8, 1.2));
  const p = seg(t, 1.4, 2.0);
  const b = easeOut(seg(t, 2.0, 2.6));
  const x = p < 1 ? lerp(85, 148, p) : lerp(148, 100, b);
  return (
    <Svg label="the point data is emitted — stopped there, before any consumer ever sees it" h={240}>
      <Row y={40} label="check at emit" value="stopped right there" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="before" value="any consumer sees it" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Hops y={150} k={easeOut(seg(t, 0.4, 0.7))} f={(i) => (i === 0 ? C.focus : C.mocha)} />
      <rect x={152} y={138} width={5} height={50} rx={2} fill={C.focus} opacity={g} />
      {p > 0 && <circle cx={x} cy={128} r={6} fill={C.cherryText} opacity={1 - 0.6 * b} />}
      <T x={420} y={214} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        nothing downstream touched
      </T>
    </Svg>
  );
}

// 8 · SLAs. A loose sentence of prose is crossed out; an SLA section fills with fields from a standard list, each taking a
// required, structured value.
export function RevealSlaQuote({ t }: StepCtx) {
  const SLA = ['availability', 'latency', 'retention'];
  return (
    <Svg label="SLAs, a named section — a required, structured value, not loose prose" h={250}>
      <Row y={40} label="SLAs" value="their own section" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="each one" value="a structured value" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={125} w={230} h={30} label="'it should be fast…'" f={C.latte} o={easeOut(seg(t, 0.5, 0.9))} />
      <Cross x={275} y={140} k={easeOut(seg(t, 1.1, 1.4))} />
      {SLA.map((s, i) => {
        const k = easeOut(seg(t, 1.5 + i * 0.4, 1.9 + i * 0.4));
        const v = easeOutBack(seg(t, 1.9 + i * 0.4, 2.3 + i * 0.4));
        return (
          <g key={s} opacity={k}>
            <T x={325} y={140 + i * 36} s={13} f={C.crema}>
              {s}
            </T>
            <rect x={475} y={126 + i * 36} width={100 * clamp(v)} height={22} rx={4} fill={C.focus} fillOpacity={0.25} stroke={C.focus} strokeWidth={1.2} />
          </g>
        );
      })}
      <T x={525} y={240} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        required
      </T>
    </Svg>
  );
}

// 9 · Predict: ownership assumed? A pipeline with its builder beside it; the owner field stays an empty question; then the
// question.
export function PredictOwnershipImplicit({ t, answer }: StepCtx) {
  return (
    <Svg label="ownership, unwritten — fine, since the pipeline's builder is obviously assumed to own it?" h={210}>
      <Row y={40} label="owner, unwritten" value="assume the builder?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="pipeline · its builder" o={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={265} y={60} width={200} height={26} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={365} y={78} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        owner: ?
      </T>
      <AnswerRow y={140} label="assume it" answer={answer} value="no, state it" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="ownership is a named role" />
    </Svg>
  );
}

// 10 · Ownership as a role. The team section lists members along a time line, joining and leaving; one is tagged Owner,
// explicitly.
export function RevealOwnershipRoleQuote({ t }: StepCtx) {
  const M: [number, number, string][] = [
    [0, 0.55, 'member'],
    [0.2, 1, 'Owner'],
    [0.5, 1, 'member'],
  ];
  return (
    <Svg label="team, tracked in the contract — Owner named explicitly, in the standard's own example" h={250}>
      <Row y={40} label="team and its history" value="in the contract" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label='"Owner"' value="named explicitly" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <line x1={25} y1={225} x2={575} y2={225} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={575} y={243} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        time
      </T>
      {M.map(([a, b, role], i) => {
        const k = easeInOut(seg(t, 0.8 + i * 0.5, 1.6 + i * 0.5));
        const own = role === 'Owner';
        const x0 = 130 + a * 445;
        return (
          <g key={i}>
            <T x={25} y={133 + i * 30} s={12} f={own ? C.focus : C.latte} o={easeOut(seg(t, 0.8 + i * 0.5, 1.1 + i * 0.5))}>
              {role}
            </T>
            <rect x={x0} y={122 + i * 30} width={(b - a) * 445 * k} height={14} rx={3} fill={own ? C.focus : C.latte} opacity={own ? 0.7 : 0.45} />
          </g>
        );
      })}
      <rect x={20} y={146} width={90 * easeOut(seg(t, 2.6, 3.0))} height={3} fill={C.focus} />
    </Svg>
  );
}

// 11 · The version. A time line of the spec: the version this course names elsewhere, and the current default already ahead
// of it; the head keeps moving on.
export function RevealVersionQuote({ t }: StepCtx) {
  const h = easeInOut(seg(t, 1.2, 2.4));
  const drift = 20 * easeInOut(seg(t, 2.8, 4.4));
  return (
    <Svg label="the spec's own current version — already past the one named earlier; it keeps evolving" h={240}>
      <Row y={40} label="the spec's default" value="already moved past" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a living standard" value="keeps evolving" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <line x1={25} y1={170} x2={575} y2={170} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <circle cx={200} cy={170} r={7} fill={C.crema} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={200} y={196} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        named in this course
      </T>
      <circle cx={lerp(200, 420, h) + drift} cy={170} r={7} fill={C.focus} opacity={easeOut(seg(t, 1.2, 1.4))} />
      <T x={lerp(200, 420, h) + drift} y={152} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.2, 1.4))}>
        current default
      </T>
    </Svg>
  );
}

// 12 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a structured document; schema tying meaning to layout; named fields; ownership, explicit" h={240}>
      <Row y={40} label="a contract" value="a structured document" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="its schema" value="meaning tied to layout" k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="quality, SLAs" value="named, pinned fields" k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="ownership" value="explicit, never assumed" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 13 · Prove: a schema change, no updated contract. A changed record heads out of the producer; after the answer the
// producer's own gate stops it, and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const g = answer !== null ? easeOut(seg(s, 0.1, 0.4)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a schema change, no updated contract — who catches it, and where does that happen?" h={230}>
      <Row y={40} label="schema change" value="contract not updated" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="who catches it" answer={answer} value="the producer's check" k={easeOut(seg(t, 0.4, 0.9))} />
      <Hops y={115} k={easeOut(seg(t, 0.4, 0.7))} f={(i) => (i === 0 && g > 0 ? C.focus : C.mocha)} />
      <rect x={152} y={108} width={5} height={40} rx={2} fill={C.focus} opacity={g} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            at the point it's about to be emitted
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
