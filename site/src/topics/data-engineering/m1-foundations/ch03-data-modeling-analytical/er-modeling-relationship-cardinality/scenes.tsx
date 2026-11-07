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

type Mark = 'ring' | 'dash' | 'foot';

/** One ER end symbol on a horizontal line at `y`. For a crow's foot, `x` is the box edge it fans into and `dir`
 * points from the line toward that box (+1 right, -1 left); for a ring or dash, `x` is its centre. `k` draws it in. */
function Sym({ kind, x, y, dir = 1, k, f = C.focus }: { kind: Mark; x: number; y: number; dir?: number; k: number; f?: string }) {
  if (kind === 'dash') return <line x1={x} y1={y - 11 * k} x2={x} y2={y + 11 * k} stroke={f} strokeWidth={2.5} />;
  if (kind === 'ring') return <circle cx={x} cy={y} r={6.5 * k} fill={C.espresso} stroke={f} strokeWidth={2.5} />;
  return (
    <g>
      {[-11, 0, 11].map((d) => (
        <line key={d} x1={x - 20 * dir} y1={y} x2={x - 20 * dir + 20 * dir * k} y2={y + d * k} stroke={f} strokeWidth={2.5} />
      ))}
    </g>
  );
}

/** Two entity boxes and the line between them (box edges at 210 and 390, line at y 105). */
function Pair({ left, right, kb, kl }: { left: string; right: string; kb: number; kl: number }) {
  return (
    <g>
      <g opacity={kb} transform={`translate(${((1 - kb) * -20).toFixed(1)} 0)`}>
        <rect x={50} y={70} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
        <T x={130} y={112} s={17} f={C.crema} a="middle">
          {left}
        </T>
      </g>
      <g opacity={kb} transform={`translate(${((1 - kb) * 20).toFixed(1)} 0)`}>
        <rect x={390} y={70} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
        <T x={470} y={112} s={17} f={C.crema} a="middle">
          {right}
        </T>
      </g>
      <line x1={210} y1={105} x2={210 + 180 * kl} y2={105} stroke={C.mocha} strokeWidth={2} />
    </g>
  );
}

/** A small chip with a centred name. */
function Chip({ x, y, w, h = 34, label, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

// 1 · Opening. Two things and a line between them; a question mark lands at each end.
export function Opening({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.7));
  const q = easeOutBack(seg(t, 0.9, 1.3));
  return (
    <Svg label="how many of one thing relates to how many of another" h={210}>
      <Row y={40} label="every relationship" value="answers one question" k={easeOut(seg(t, 0.1, 0.5))} />
      <Chip x={25} y={70} w={130} label="this" o={k} />
      <Chip x={445} y={70} w={130} label="that" o={k} />
      <line x1={155} y1={87} x2={155 + 290 * easeInOut(seg(t, 0.5, 0.9))} y2={87} stroke={C.mocha} strokeWidth={2} />
      {[190, 410].map((x) => (
        <T key={x} x={x} y={80} s={16} f={C.focus} a="middle" o={clamp(q)}>
          ?
        </T>
      ))}
      <Row y={165} label="this refresher" value="reading it off a diagram" k={easeOut(seg(t, 1.3, 1.8))} />
    </Svg>
  );
}

// 2 · Three symbols. Ring, dash and crow's foot are drawn beside their meanings; then a ring and a crow's foot pair up on
// one end: a minimum and a maximum at once.
export function RevealThreeSymbols({ t }: StepCtx) {
  const syms: [Mark, string, string][] = [
    ['ring', 'ring', 'zero'],
    ['dash', 'dash', 'one'],
    ['foot', "crow's foot", 'many'],
  ];
  const p = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="three symbols, paired for minimum and maximum" h={250}>
      {syms.map(([kind, label, value], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.7 + i * 0.5));
        const y = 45 + i * 50;
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} valueColor={i === 2 ? C.second : C.crema} k={k} />
            <Sym kind={kind} x={kind === 'foot' ? 320 : 300} y={y - 5} k={easeOut(seg(t, 0.4 + i * 0.5, 0.9 + i * 0.5))} />
          </g>
        );
      })}
      <g opacity={p}>
        <line x1={230} y1={205} x2={400} y2={205} stroke={C.mocha} strokeWidth={2} />
        <rect x={400} y={188} width={70} height={34} rx={6} fill={C.cocoa} stroke={C.mocha} />
      </g>
      <Sym kind="ring" x={362} y={205} k={easeOut(seg(t, 2.8, 3.2))} />
      <Sym kind="foot" x={400} y={205} k={easeOut(seg(t, 3.1, 3.5))} />
      <T x={130} y={210} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        min · max
      </T>
    </Svg>
  );
}

// 3 · One-to-one. Customer and Loyalty card, a double dash drawn at each end: one, and mandatory, both ways.
export function RevealOneToOne({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.9, 1.3));
  const b = easeOut(seg(t, 1.2, 1.6));
  return (
    <Svg label="one customer, one card, mandatory both ends" h={210}>
      <Pair left="Customer" right="Loyalty card" kb={easeOut(seg(t, 0.1, 0.5))} kl={easeInOut(seg(t, 0.4, 0.9))} />
      <Sym kind="dash" x={226} y={105} k={a} />
      <Sym kind="dash" x={236} y={105} k={b} />
      <Sym kind="dash" x={374} y={105} k={a} />
      <Sym kind="dash" x={364} y={105} k={b} />
      <Row y={185} label="cardinality" value="one-to-one, both mandatory" k={easeOut(seg(t, 1.8, 2.3))} />
    </Svg>
  );
}

// 4 · Predict: where does the key live? One customer, many orders, drawn; then the question.
export function PredictForeignKeySide({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="which side holds the foreign key" h={210}>
      <Row y={40} label="one customer" value="many orders" k={easeOut(seg(t, 0.1, 0.5))} />
      <Chip x={25} y={62} w={130} label="Customer" o={k} />
      <Chip x={445} y={62} w={130} label="Order" o={k} />
      <line x1={155} y1={79} x2={155 + 290 * easeInOut(seg(t, 0.5, 0.9))} y2={79} stroke={C.mocha} strokeWidth={2} />
      <Sym kind="dash" x={172} y={79} k={easeOut(seg(t, 0.9, 1.2))} />
      <Sym kind="foot" x={445} y={79} k={easeOut(seg(t, 1.0, 1.3))} />
      <AnswerRow y={140} label="foreign key lives on" answer={answer} value="the order table" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="each order names just one customer" />
    </Svg>
  );
}

// 5 · Where the key sits. A list of orders won't fit in one customer row and is struck out; then each order row's
// single customer_id draws its pointer back to the one customer.
export function RevealForeignKeyOnMany({ t }: StepCtx) {
  const list = easeOut(seg(t, 0.6, 1.0)) * (1 - easeOut(seg(t, 1.9, 2.2)));
  const strike = easeInOut(seg(t, 1.2, 1.6));
  return (
    <Svg label="the order row holds a single customer id" h={240}>
      <Row y={40} label="customer row" value="can't hold a list of orders" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="order row" value="holds one customer id" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      <Chip x={25} y={150} w={150} label="customer" o={easeOut(seg(t, 0.2, 0.5))} />
      <g opacity={list}>
        <T x={250} y={172} s={13} f={C.cherryText} a="middle">
          [order, order, …]
        </T>
        <line x1={185} y1={167} x2={185 + 130 * strike} y2={167} stroke={C.cherryText} strokeWidth={2} />
      </g>
      {[0, 1, 2].map((i) => {
        const y = 115 + i * 38;
        const d = easeInOut(seg(t, 2.3 + i * 0.35, 2.9 + i * 0.35));
        return (
          <g key={i}>
            <g opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))}>
              <rect x={330} y={y} width={245} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} />
              <T x={345} y={y + 19} s={12} f={C.latte}>
                order
              </T>
              <rect x={445} y={y + 4} width={122} height={20} rx={3} fill="none" stroke={d > 0 ? C.focus : C.mocha} />
              <T x={506} y={y + 19} s={12} f={d > 0 ? C.focus : C.latte} a="middle">
                customer_id
              </T>
            </g>
            <path d={`M330 ${y + 14} C 260 ${y + 14} 240 167 175 167`} fill="none" stroke={C.focus} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d} />
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Many-to-many. Order and Product, a crow's foot drawn at both ends.
export function RevealManyToMany({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.3));
  return (
    <Svg label="crow's foot at both ends" h={210}>
      <Pair left="Order" right="Product" kb={easeOut(seg(t, 0.1, 0.5))} kl={easeInOut(seg(t, 0.4, 0.8))} />
      <Sym kind="foot" x={210} y={105} dir={-1} k={a} f={C.second} />
      <Sym kind="foot" x={390} y={105} k={easeOut(seg(t, 1.1, 1.6))} f={C.second} />
      <Row y={185} label="cardinality" value="many-to-many" k={easeOut(seg(t, 1.9, 2.4))} />
    </Svg>
  );
}

// 7 · The junction table. A third table drops in between, a key pointing to each side; then the two keys together
// are boxed as its own primary key.
export function RevealJunctionTable({ t }: StepCtx) {
  const s = easeOut(seg(t, 0.2, 0.6));
  const j = easeOut(seg(t, 0.7, 1.3));
  const fa = easeInOut(seg(t, 1.5, 2.1));
  const fb = easeInOut(seg(t, 1.8, 2.4));
  const pk = easeOut(seg(t, 2.8, 3.4));
  const side = (x: number, name: string, key: string) => (
    <g opacity={s}>
      <rect x={x} y={55} width={150} height={70} rx={6} fill={C.cocoa} stroke={C.mocha} />
      <T x={x + 75} y={80} s={14} f={C.crema} a="middle">
        {name}
      </T>
      <T x={x + 75} y={108} s={12} f={C.latte} a="middle">
        {key}
      </T>
    </g>
  );
  return (
    <Svg label="a third table, with a foreign key to each side" h={225}>
      {side(25, 'order', 'order_id')}
      {side(425, 'product', 'product_id')}
      <g opacity={j} transform={`translate(0 ${((1 - j) * -16).toFixed(1)})`}>
        <rect x={215} y={45} width={170} height={110} rx={6} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} />
        <T x={300} y={68} s={13} f={C.crema} a="middle">
          order_product
        </T>
        <line x1={215} y1={80} x2={385} y2={80} stroke={C.mocha} />
        <T x={300} y={106} s={12} f={C.latte} a="middle">
          order_id
        </T>
        <T x={300} y={136} s={12} f={C.latte} a="middle">
          product_id
        </T>
      </g>
      <path d="M255 102 C 230 102 200 104 175 104" fill="none" stroke={C.focus} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - fa} />
      <path d="M345 132 C 380 132 400 104 425 104" fill="none" stroke={C.focus} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - fb} />
      <rect x={235} y={88} width={130} height={58} rx={5} fill="none" stroke={C.focus} strokeDasharray="4 3" opacity={pk} />
      <T x={300} y={lerp(186, 180, pk)} s={13} f={C.focus} a="middle" o={pk}>
        both keys = primary key
      </T>
      <Row y={215} label="order_product table" value="both, as its own key" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · Optionality. Customer to Order is "one or many"; the inner dash on the Order end shrinks away and a ring grows in
// its place: now "zero or many". Nothing else moves.
export function RevealOptionality({ t }: StepCtx) {
  const out = 1 - easeInOut(seg(t, 1.0, 1.4));
  const ring = easeOutBack(seg(t, 1.4, 1.8));
  return (
    <Svg label="a ring at an end means optional there" h={250}>
      <Pair left="Customer" right="Order" kb={easeOut(seg(t, 0.1, 0.4))} kl={easeInOut(seg(t, 0.2, 0.5))} />
      <Sym kind="dash" x={226} y={105} k={easeOut(seg(t, 0.4, 0.7))} f={C.crema} />
      <Sym kind="dash" x={236} y={105} k={easeOut(seg(t, 0.4, 0.7))} f={C.crema} />
      <Sym kind="foot" x={390} y={105} k={easeOut(seg(t, 0.5, 0.8))} f={C.crema} />
      <Sym kind="dash" x={360} y={105} k={easeOut(seg(t, 0.5, 0.8)) * out} f={C.crema} />
      {ring > 0 && <Sym kind="ring" x={358} y={105} k={clamp(ring, 0, 1.2)} f={C.second} />}
      <Row y={180} label="dash at an end" value="mandatory there" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={225} label="ring at an end" value="optional there" valueColor={C.second} k={easeOut(seg(t, 1.7, 2.2))} />
    </Svg>
  );
}

// 9 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three symbols, many side keeps the key, M:N means a third table" h={200}>
      <Row y={60} label="symbols" value="paired, min and max" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={110} label="one-to-many" value="key on the many side" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={160} label="many-to-many" value="always a third table" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
    </Svg>
  );
}
