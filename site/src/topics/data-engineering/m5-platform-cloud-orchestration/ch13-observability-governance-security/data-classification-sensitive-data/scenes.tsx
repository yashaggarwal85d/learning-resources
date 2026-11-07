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
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own: the Luhn card 4242424242424242 and its transposed twin, the 16-digit decoy order ref,
// the support notes' own phone numbers and card endings, the customers.email lineage and its restricted-pii tag, and the 0.20
// sensitive fraction. Precision, recall and the unprotected fraction are computed, so they are drawn as lengths and marks.

// 0 · Hook. A structured table of email and card cells; the scanner's line sweeps down it and every cell it passes lights as
// found. Then the report is signed off.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sy = lerp(40, 196, easeInOut(seg(t, 0.6, 2.6)));
  return (
    <Svg label="every card number and email, found." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        email
      </T>
      <T x={225} y={30} s={11} f={C.taupe} o={k(0)}>
        card
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 40 + i * 30;
        const hit = sy > y + 12;
        return (
          <g key={i} opacity={k(0.1 + i * 0.06)}>
            <rect x={25} y={y} width={180} height={22} rx={3} fill={C.cocoa} stroke={hit ? C.second : C.mocha} strokeWidth={1.3} />
            <rect x={33} y={y + 8} width={110 + (i % 3) * 18} height={6} rx={2} fill={hit ? C.second : C.latte} />
            <rect x={225} y={y} width={150} height={22} rx={3} fill={C.cocoa} stroke={hit ? C.second : C.mocha} strokeWidth={1.3} />
            <rect x={233} y={y + 8} width={130} height={6} rx={2} fill={hit ? C.second : C.latte} />
          </g>
        );
      })}
      <line x1={20} y1={sy} x2={380} y2={sy} stroke={C.focus} strokeWidth={1.6} opacity={k(0.6) * (1 - k(2.7))} />
      <Cell x={430} y={100} w={130} label="signed off" o={k(3.0)} stroke={C.focus} />
      <MiniTick x={490} y={152} k={k(3.3)} />
    </Svg>
  );
}

const NOTE1 = 'call me on 0151 822 4567 instead';
const NOTE2 = 'my card ends 4242, no need to call';

// 1 · Predict. A support note types itself out, a phone number and a card ending in ordinary prose, inside an export no
// scanner was ever pointed at. Once answered, "closes it completely" is crossed and "a miss rate remains" is ticked.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const n1 = Math.round(NOTE1.length * clamp((t - 0.3) / 1.2));
  const n2 = Math.round(NOTE2.length * clamp((t - 1.6) / 1.2));
  return (
    <Svg label="a phone and a card ending, in prose." h={250}>
      <rect x={25} y={30} width={360} height={64} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      <T x={37} y={54} s={11} f={C.crema}>
        {NOTE1.slice(0, n1)}
      </T>
      <T x={37} y={80} s={11} f={C.crema}>
        {NOTE2.slice(0, n2)}
      </T>
      <Hole x={20} y={24} w={370} h={76} o={k(3.0)} stroke={C.taupe} />
      {t > 3.0 && (
        <T x={400} y={66} s={11} f={C.taupe} o={k(3.0)}>
          never scanned
        </T>
      )}
      <Cell x={25} y={124} w={300} label="a model closes it completely" o={k(3.4)} stroke={a > 0.5 ? C.cherryText : C.mocha} f={a > 0.5 ? C.taupe : C.crema} />
      <Cross x={345} y={138} k={a} />
      <Cell x={25} y={166} w={300} label="a miss rate remains" o={k(3.6)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={340} y={180} k={a} />
      <Verdict answer={answer} text="a model helps; a real miss rate stays" y={228} />
    </Svg>
  );
}

const TIERS = ['public', 'internal', 'confidential', 'restricted'];
const CATS = ['personal data', 'health', 'payment'];

// 2 · Two labels. One column. A tier ladder builds and a marker settles on restricted: a judgment. A category list builds
// beside it and a second marker lands on personal data: a fact. Both, on the same column, independently.
export function RevealTwoLabels({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a tier for handling. A category for rules." h={250}>
      <Cell x={25} y={92} w={170} label="customers.email" o={k(0)} />
      {TIERS.map((n, i) => (
        <Cell key={n} x={240} y={30 + i * 32} w={150} h={26} label={n} o={k(0.6 + i * 0.12)} stroke={i === 3 && t > 1.8 ? C.second : C.mocha} />
      ))}
      <Fan x1={195} y1={106} x2={238} y2={139} k={k(1.8)} f={C.second} />
      {t > 2.0 && (
        <T x={240} y={180} s={11} f={C.second} o={k(2.0)}>
          tier: a judgment
        </T>
      )}
      {CATS.map((n, i) => (
        <Cell key={n} x={425} y={30 + i * 32} w={150} h={26} label={n} o={k(2.4 + i * 0.12)} stroke={i === 0 && t > 3.2 ? C.focus : C.mocha} />
      ))}
      <path d={`M195 100 C 300 10, 380 10, ${lerp(195, 423, k(3.2))} 43`} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(3.2)} />
      {t > 3.4 && (
        <T x={425} y={180} s={11} f={C.focus} o={k(3.4)}>
          category: a fact
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={224} s={12} f={C.crema} o={k(4.0)}>
          one column, both labels, independently
        </T>
      )}
    </Svg>
  );
}

const CANDS: [string, string, boolean][] = [
  ['4242424242424242', 'a real card', true],
  ['4242424242424224', 'two digits swapped', false],
];

// 3 · Pattern and checksum. Two 16-digit strings: both pass the shape test, ticked. Then the checksum runs; the real card keeps
// its tick, the swapped one is crossed. Below, precision and recall grow as lengths: nearly full, and full.
export function RevealPatternChecksum({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="shape plus checksum." h={250}>
      <T x={330} y={30} s={11} f={C.taupe} o={k(0.8)}>
        shape
      </T>
      <T x={420} y={30} s={11} f={C.taupe} o={k(2.0)}>
        checksum
      </T>
      {CANDS.map(([n, l, ok], i) => (
        <g key={n}>
          <T x={25} y={54 + i * 44} s={12} f={C.crema} o={k(0.2 + i * 0.2)}>
            {n}
          </T>
          <T x={25} y={72 + i * 44} s={11} f={C.taupe} o={k(0.4 + i * 0.2)}>
            {l}
          </T>
          <MiniTick x={335} y={48 + i * 44} k={k(1.0 + i * 0.2)} f={C.second} />
          {ok ? <MiniTick x={440} y={48 + i * 44} k={k(2.2)} /> : <Cross x={446} y={50 + i * 44} k={k(2.4)} />}
        </g>
      ))}
      <T x={25} y={150} s={11} f={C.latte} o={k(3.2)}>
        precision
      </T>
      <rect x={140} y={138} width={Math.max(0, 400 * 0.909 * easeOut(seg(t, 3.4, 4.4)))} height={16} rx={2} fill={C.second} />
      <T x={25} y={186} s={11} f={C.latte} o={k(3.4)}>
        recall
      </T>
      <rect x={140} y={174} width={Math.max(0, 400 * easeOut(seg(t, 3.6, 4.6)))} height={16} rx={2} fill={C.focus} />
      <line x1={540} y1={130} x2={540} y2={198} stroke={C.taupe} strokeWidth={1} strokeDasharray="3 3" opacity={k(3.2)} />
      {t > 4.6 && (
        <T x={140} y={222} s={11} f={C.focus} o={k(4.6)}>
          every real card found
        </T>
      )}
    </Svg>
  );
}

const VENDORS: [string, string][] = [
  ['Macie', 'managed identifiers'],
  ['Purview', 'built-in types, copied'],
  ['Databricks', 'an agentic AI system'],
  ['Google', 'infoType'],
];
const TECH = ['pattern', 'trained model', 'language model'];

// 4 · Vendors. Four platforms arrive one by one, each with its own name for the step. Then the three techniques appear on the
// right and every vendor fans into the same three.
export function RevealVendorClassifiers({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="four platforms, the same techniques." h={250}>
      {VENDORS.map(([v, n], i) => (
        <g key={v}>
          <T x={25} y={40 + i * 50} s={12} f={C.crema} o={k(0.3 + i * 0.9)}>
            {v}
          </T>
          <T x={25} y={60 + i * 50} s={11} f={C.taupe} o={k(0.5 + i * 0.9)}>
            {n}
          </T>
          {TECH.map((_, j) => (
            <Fan key={j} x1={230} y1={50 + i * 50} x2={398} y2={64 + j * 54} k={k(4.0 + i * 0.1)} f={C.mocha} />
          ))}
        </g>
      ))}
      {TECH.map((n, j) => (
        <Cell key={n} x={400} y={50 + j * 54} w={175} label={n} o={k(3.7 + j * 0.1)} stroke={t > 4.6 ? C.focus : C.mocha} />
      ))}
    </Svg>
  );
}

const NODES = ['customers.email', 'customers.email_hash', 'daily_revenue.customer_count'];

// 5 · Tag propagation. Three columns down a lineage chain. The restricted-pii tag sits on the email, slides down to the hash
// and stays (readable is crossed there), then slides on toward the count and dies on the way, crossed: nothing per person left.
export function RevealTagPropagation({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const m1 = easeInOut(seg(t, 1.4, 2.2));
  const m2 = easeInOut(seg(t, 3.0, 3.8));
  const ty = lerp(lerp(40, 110, m1), 180, m2 * 0.5);
  return (
    <Svg label="survives a hash. An aggregate can drop it." h={250}>
      <T x={500} y={28} s={11} f={C.taupe} o={k(0.2)}>
        readable
      </T>
      {NODES.map((n, i) => (
        <g key={n}>
          <Cell x={25} y={40 + i * 70} w={280} label={n} o={k(i * 0.3)} />
          {i < 2 && <line x1={60} y1={68 + i * 70} x2={60} y2={68 + i * 70 + 42 * k(0.4 + i * 0.3)} stroke={C.latte} strokeWidth={1.4} />}
        </g>
      ))}
      <MiniTick x={515} y={52} k={k(0.6)} />
      <Cross x={524} y={124} k={k(2.4)} />
      <MiniTick x={515} y={192} k={k(3.4)} />
      <Cell x={330} y={ty} w={140} label="restricted-pii" o={k(0.4) * (1 - easeOut(seg(t, 3.4, 3.8)))} stroke={C.second} />
      <Cross x={400} y={194} k={k(3.8)} />
      {t > 4.0 && (
        <T x={330} y={234} s={11} f={C.cherryText} o={k(4.0)}>
          a count: no tag left
        </T>
      )}
    </Svg>
  );
}

const NOTES = ['0151 822 4567', '0161 905 2210', '0161 905 2210', 'oh-one-five-one', 'ends 4242', 'ends in 7781'];

// 6 · False negatives in free text. Structured recall fills its bar; free-text recall stops at half. Then the six notes with
// real PII are scanned in turn: the three standard phone numbers are caught, the spelled-out one and both card endings missed.
export function RevealFalseNegatives({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="three of six notes, missed." h={250}>
      <T x={25} y={44} s={11} f={C.latte} o={k(0)}>
        structured
      </T>
      <rect x={140} y={32} width={Math.max(0, 400 * easeOut(seg(t, 0.4, 1.2)))} height={16} rx={2} fill={C.focus} />
      <T x={25} y={76} s={11} f={C.latte} o={k(1.2)}>
        free text
      </T>
      <rect x={140} y={64} width={Math.max(0, 400 * 0.5 * easeOut(seg(t, 1.6, 2.4)))} height={16} rx={2} fill={C.cherryText} />
      <rect x={140} y={64} width={400} height={16} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} strokeDasharray="3 3" opacity={k(1.6)} />
      {NOTES.map((n, i) => {
        const x = 25 + (i % 3) * 190;
        const y = 118 + Math.floor(i / 3) * 56;
        const d = 2.8 + i * 0.25;
        const caught = i < 3;
        return (
          <g key={i}>
            <Cell x={x} y={y} w={170} label={n} o={k(2.6)} stroke={t > d ? (caught ? C.focus : C.cherryText) : C.mocha} />
            {caught ? <MiniTick x={x + 78} y={y + 40} k={k(d)} /> : <Cross x={x + 85} y={y + 42} k={k(d)} />}
          </g>
        );
      })}
    </Svg>
  );
}

const POLICIES = ['masking', 'erasure', 'access rule'];

// 7 · Every later policy's input. One tag fans out to three policies and each one runs, ticked. Then the tag is missed, a
// dashed hole: the fans vanish and every policy quietly reads "never ran".
export function RevealPolicyInput({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const miss = k(3.2);
  return (
    <Svg label="every later policy reads a tag." h={250}>
      <Cell x={25} y={110} w={120} label="tag" o={k(0) * (1 - miss)} stroke={C.second} />
      <Hole x={25} y={110} w={120} o={miss} stroke={C.cherryText} />
      {t > 3.4 && (
        <T x={25} y={164} s={11} f={C.cherryText} o={k(3.4)}>
          missed tag
        </T>
      )}
      {POLICIES.map((n, i) => {
        const d = 0.6 + i * 0.6;
        return (
          <g key={n}>
            <Fan x1={145} y1={124} x2={298} y2={54 + i * 70} k={k(d) * (1 - miss)} f={C.second} />
            <Cell x={300} y={40 + i * 70} w={140} label={n} o={k(d)} stroke={miss > 0.5 ? C.mocha : t > d + 0.3 ? C.focus : C.mocha} f={miss > 0.5 ? C.taupe : C.crema} />
            <T x={460} y={59 + i * 70} s={11} f={miss > 0.5 ? C.cherryText : C.focus} o={k(d + 0.3)}>
              {miss > 0.5 ? 'never ran' : 'ran'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

const RECAP = ['two labels: a tier and a category', 'pattern and checksum, then a model', 'a tag that follows lineage', 'free text: a real miss rate', 'every later policy reads the tag'];

// 8 · Recap. The five lines of the topic land in order, each ticked.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="two labels, three techniques, a tag that travels." h={250}>
      {RECAP.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={40 + i * 42} k={k(0.4 + i * 0.85)} />
          <T x={50} y={46 + i * 42} s={12} f={C.crema} o={k(0.3 + i * 0.85)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · Prove it. A grid of columns; a fifth of them light as sensitive, and half of those get tagged. Once answered, the
// sensitive, untagged half glows red: a tenth of every column. "None slip" is crossed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const cells = [];
  for (let c = 0; c < 10; c++)
    for (let r = 0; r < 10; r++) {
      const sens = c < 2;
      const tagged = c === 0;
      const f = sens ? (tagged ? (t > 1.6 ? C.focus : C.second) : a > 0.5 ? C.cherryText : C.second) : C.mocha;
      cells.push(<rect key={c * 10 + r} x={25 + c * 16} y={36 + r * 16} width={12} height={12} rx={2} fill={f} opacity={k(r * 0.04) * (sens || t < 0.9 ? 1 : 0.7)} />);
    }
  return (
    <Svg label="half caught, a fifth truly sensitive." h={250}>
      {cells}
      {t > 0.9 && (
        <T x={220} y={44} s={11} f={C.second} o={k(0.9)}>
          a fifth sensitive; half of those tagged
        </T>
      )}
      <Cell x={220} y={70} w={300} label="none slip through" o={k(2.0)} stroke={a > 0.5 ? C.cherryText : C.mocha} f={a > 0.5 ? C.taupe : C.crema} />
      <Cross x={540} y={84} k={a} />
      <Cell x={220} y={114} w={300} label="a tenth: sensitive, untagged" o={k(2.2)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={535} y={128} k={a} />
      <Verdict answer={answer} text="half of a fifth: one column in ten" y={228} />
    </Svg>
  );
}
