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

/** Three address windows on a time line, left to right, oldest first; `lit` picks one to light. */
function Windows({ y, k, lit = -1, f = C.focus }: { y: number; k: number; lit?: number; f?: string }) {
  return (
    <g>
      {['address A', 'address B', 'address C · now'].map((l, i) => {
        const on = i === lit;
        const kk = clamp(k * 3 - i, 0, 1);
        return (
          <g key={l}>
            <rect x={25 + i * 185} y={y} width={175 * kk} height={28} rx={3} fill={C.cocoa} stroke={on ? f : C.mocha} strokeWidth={on ? 2.5 : 1.5} />
            <T x={112 + i * 185} y={y + 18.5} s={12} f={on ? f : C.crema} a="middle" o={kk}>
              {l}
            </T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. An order's key reaches into the customer table and finds no row; thrown away, the order fades from every report.
export function Hook({ t }: StepCtx) {
  const l = easeInOut(seg(t, 0.9, 1.7));
  const q = easeOutBack(seg(t, 1.7, 2.1));
  const gone = easeOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="a fact, a dangling key — no dimension row to join to" h={240}>
      <Row y={40} label="an order" value="its customer isn't there" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="throw it away" value="the sale vanishes" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <g opacity={1 - 0.8 * gone} transform={`translate(0 ${(gone * 20).toFixed(1)})`}>
        <Cell x={25} y={150} w={170} h={30} label="order" o={easeOut(seg(t, 0.4, 0.8))} stroke={gone > 0 ? C.cherryText : C.mocha} />
        <line x1={195} y1={165} x2={lerp(195, 385, l)} y2={165} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="5 4" />
      </g>
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={385} y={120 + i * 32} w={190} h={26} label={i === 1 ? '' : 'a customer'} o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1)) * (i === 1 ? 0.4 : 1)} />
      ))}
      <T x={480} y={lerp(170, 162, clamp(q))} s={16} f={C.cherryText} a="middle" o={clamp(q)}>
        no match
      </T>
    </Svg>
  );
}

// 2 · The inferred member. A placeholder row slides into the empty slot: the unresolved key, then unknown values; the order's
// line now lands on it.
export function RevealInferredQuote({ t }: StepCtx) {
  const p = easeOut(seg(t, 0.8, 1.5));
  const u = easeOut(seg(t, 1.6, 2.2));
  const l = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a placeholder row, unresolved key, unknown values — enough to post the fact" h={240}>
      <Row y={40} label="inferred member" value="a placeholder row" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="enough to" value="post the order now" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={150} w={140} h={30} label="order" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={165} y1={165} x2={lerp(165, 235, l)} y2={165} stroke={C.focus} strokeWidth={2} />
      <g opacity={p} transform={`translate(${((1 - p) * 40).toFixed(1)} 0)`}>
        <Cell x={235} y={150} w={100} h={30} label="its key" stroke={C.focus} f={C.focus} />
      </g>
      {[0, 1].map((i) => (
        <rect key={i} x={345 + i * 120} y={150} width={110} height={30} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" opacity={u} />
      ))}
      {[0, 1].map((i) => (
        <T key={i} x={400 + i * 120} y={169.5} s={12} f={C.latte} a="middle" o={u}>
          unknown
        </T>
      ))}
    </Svg>
  );
}

// 3 · Measured. The placeholder row goes in first and is counted; the order loads against it second and is counted; the link
// between them draws.
export function RevealInferredMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.2));
  const b = easeOut(seg(t, 2.0, 2.6));
  const l = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="one placeholder row, one fact loaded against it, right away" h={240}>
      <Row y={40} label="placeholder rows" value={num(a)} big k={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={85} label="orders loaded" value={num(b)} valueColor={C.focus} big k={easeOut(seg(t, 1.8, 2.1))} />
      <T x={130} y={140} s={11} f={C.latte} a="middle" o={a}>
        first
      </T>
      <Cell x={25} y={150} w={210} h={30} label="placeholder customer" o={a} stroke={C.latte} />
      <T x={470} y={140} s={11} f={C.latte} a="middle" o={b}>
        then
      </T>
      <g opacity={b} transform={`translate(${((1 - b) * 30).toFixed(1)} 0)`}>
        <Cell x={365} y={150} w={210} h={30} label="order" stroke={C.focus} />
      </g>
      <line x1={365} y1={165} x2={lerp(365, 235, l)} y2={165} stroke={C.focus} strokeWidth={2} />
      <T x={300} y={220} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        no missing link anywhere
      </T>
    </Svg>
  );
}

// 4 · Predict: a new row or the same one? The placeholder row; the real data arrives above it; then the question.
export function PredictResolve({ t, answer }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="the real data arrives — a new row, or the same one, filled in?" h={210}>
      <Row y={40} label="real data lands" value="new row, or the same?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={250} h={26} label="placeholder · unknown" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.latte} />
      <Cell x={lerp(445, 325, a)} y={60} w={250} h={26} label="real customer data" o={a} stroke={C.focus} />
      <AnswerRow y={140} label="filling it in" answer={answer} value="same row, overwritten" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a stand-in is not a real version" />
    </Svg>
  );
}

// 5 · The resolve. Real values drop onto the placeholder's unknown cells, covering them in place; the row count reads 1
// before and 1 after.
export function RevealResolveMeasured({ t }: StepCtx) {
  const d = (i: number) => easeOutBack(seg(t, 1.3 + i * 0.3, 1.8 + i * 0.3));
  return (
    <Svg label="same row, overwritten in place — the row count never moves" h={240}>
      <Row y={40} label="rows before" value="1" big k={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={85} label="rows after" value="1" valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.2))} />
      <Cell x={25} y={150} w={150} h={30} label="its key" o={easeOut(seg(t, 0.4, 0.8))} />
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={185 + i * 200} y={150} width={190} height={30} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.4, 0.8))} />
          <T x={280 + i * 200} y={169.5} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.8)) * (1 - easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3)))}>
            unknown
          </T>
          <g opacity={t < 1.3 + i * 0.3 ? 0 : clamp(d(i) * 2)} transform={`translate(0 ${lerp(-40, 0, clamp(d(i))).toFixed(1)})`}>
            <Cell x={185 + i * 200} y={150} w={190} h={30} label={i === 0 ? 'real name' : 'real address'} stroke={C.focus} />
          </g>
        </g>
      ))}
      <T x={300} y={220} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        overwritten in place, never versioned
      </T>
    </Svg>
  );
}

// 6 · Retroactive. Two real versions with history; a correction adds a genuinely new row; the sales tied to the old value
// swing their lines over to it.
export function RevealRetroactiveQuote({ t }: StepCtx) {
  const n = easeOut(seg(t, 1.4, 2.0));
  const sw = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="a retroactive correction: a real new row, and facts restated to match" h={250}>
      <Row y={40} label="retroactive fix" value="a real new row" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="sales on the old value" value="restated to match" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={120} w={190} h={28} label="version 1" o={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={25} y={160} w={190} h={28} label="version 2" o={easeOut(seg(t, 0.5, 0.9))} />
      <g opacity={n} transform={`translate(${((1 - n) * -30).toFixed(1)} 0)`}>
        <Cell x={25} y={200} w={190} h={28} label="corrected version" stroke={C.focus} f={C.focus} />
      </g>
      {[0, 1, 2].map((i) => {
        const y = 125 + i * 40;
        return (
          <g key={i}>
            <line x1={385} y1={y + 12} x2={215} y2={lerp(174, 214, sw)} stroke={sw > 0 ? C.focus : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.8, 1.2))} />
            <Cell x={385} y={y} w={190} h={24} label="sale" o={easeOut(seg(t, 0.8 + i * 0.1, 1.1 + i * 0.1))} stroke={sw >= 1 ? C.focus : C.mocha} />
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Predict: which address? Three windows of history; a late sale lands inside the first; then the question.
export function PredictBackdated({ t, answer }: StepCtx) {
  const m = easeOutBack(seg(t, 1.0, 1.5));
  return (
    <Svg label="a sale from before the most recent move — which address attaches?" h={210}>
      <Row y={40} label="a late sale, moved since" value="which address?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Windows y={60} k={easeOut(seg(t, 0.2, 0.9))} />
      <circle cx={45} cy={lerp(52, 74, clamp(m))} r={6} fill={C.focus} opacity={clamp(m * 2)} />
      <AnswerRow y={140} label="it gets" answer={answer} value="the one true then" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the address on the sale's own date" />
    </Svg>
  );
}

// 8 · The late fact. The sale sits on its own date; a search starts at today, sweeps back through history, and stops on the
// window that was true then, lighting it.
export function RevealLateFactQuote({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.2, 2.6));
  const lit = sw >= 1;
  return (
    <Svg label="search the dimension for the keys effective back then, not now" h={240}>
      <Row y={40} label="a late sale" value="search back through history" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="for the version" value="true on its date" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Windows y={150} k={easeOut(seg(t, 0.4, 1.0))} lit={lit ? 0 : -1} />
      <circle cx={112} cy={135} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={112} y={124} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        sale date
      </T>
      {sw > 0 && <path d={`M575 192 H${lerp(575, 112, sw)}`} fill="none" stroke={C.focus} strokeWidth={2} />}
      {sw > 0 && <path d={`M${lerp(575, 112, sw) + 8} 186 l-8 6 l8 6`} fill="none" stroke={C.focus} strokeWidth={2} />}
      <T x={575} y={216} s={11} f={C.latte} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        from today
      </T>
    </Svg>
  );
}

// 9 · Two joins, one fact. The same sale joins once on today (lands on key 3, red) and once on its own date (lands on key 2).
export function RevealAsOfMeasured({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.8, 1.6));
  const b = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="same fact row, two joins, two different versions — only one is right" h={250}>
      <Row y={40} label="join on today" value="key 3, wrong" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={85} label="join on its date" value="key 2, right" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Cell x={25} y={160} w={150} h={30} label="the late sale" o={easeOut(seg(t, 0.3, 0.6))} />
      {[1, 2, 3].map((k, i) => (
        <Cell
          key={k}
          x={425}
          y={120 + i * 40}
          w={150}
          h={28}
          label={`key ${k}`}
          o={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))}
          stroke={k === 3 && a >= 1 ? C.cherryText : k === 2 && b >= 1 ? C.focus : C.mocha}
        />
      ))}
      <line x1={175} y1={170} x2={lerp(175, 425, a)} y2={lerp(170, 214, a)} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={175} y1={180} x2={lerp(175, 425, b)} y2={lerp(180, 174, b)} stroke={C.focus} strokeWidth={2} />
    </Svg>
  );
}

// 10 · Predict: search all of history? A long history bar; a search sweeps all the way back; then the question.
export function PredictWindow({ t, answer }: StepCtx) {
  const sw = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="always search all of history — is that the real answer?" h={210}>
      <Row y={40} label="every late sale" value="search all of history?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={64} width={550} height={18} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={lerp(575, 25, sw)} y={64} width={550 * sw} height={18} rx={3} fill={C.cherryText} opacity={0.4} />
      <AnswerRow y={140} label="search everything" answer={answer} value="no, name a limit" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="every real strategy names its limit" />
    </Svg>
  );
}

// 11 · The window. A bounded window sits at the recent end of the time line; one late event lands inside and is taken in;
// another lands past the horizon and is routed off another way; the window then closes for good.
export function RevealWindow({ t }: StepCtx) {
  const w = easeInOut(seg(t, 0.5, 1.1));
  const e1 = easeOutBack(seg(t, 1.4, 1.9));
  const e2 = easeOutBack(seg(t, 2.2, 2.7));
  const off = easeInOut(seg(t, 2.8, 3.4));
  const cl = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="a named horizon, past which a late event is handled another way" h={250}>
      <Row y={40} label="window for late data" value="open only so long" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="past the horizon" value="another, explicit path" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <line x1={25} y1={170} x2={575} y2={170} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={lerp(575, 375, w)} y={150} width={200 * w} height={40} rx={4} fill={C.focus} fillOpacity={0.15 * (1 - 0.6 * cl)} stroke={C.focus} strokeWidth={1.5} />
      <T x={375} y={208} s={11} f={C.focus} a="middle" o={w}>
        horizon
      </T>
      <T x={575} y={208} s={11} f={C.latte} a="end" o={w}>
        now
      </T>
      <circle cx={470} cy={lerp(120, 170, clamp(e1))} r={6} fill={C.focus} opacity={clamp(e1 * 2)} />
      <g transform={`translate(${lerp(0, -40, off).toFixed(1)} ${lerp(0, 50, off).toFixed(1)})`} opacity={clamp(e2 * 2)}>
        <circle cx={230} cy={lerp(120, 170, clamp(e2))} r={6} fill={C.cherryText} />
      </g>
      <T x={190} y={240} s={11} f={C.cherryText} a="middle" o={off}>
        handled another way
      </T>
      <T x={475} y={140} s={11} f={C.latte} a="middle" o={cl}>
        closed for good
      </T>
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="placeholder, resolved in place; as-of join; a named limit on all of it" h={220}>
      <Row y={50} label="no customer" value="placeholder, filled in" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="late sale" value="joins on its own date" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="lateness" value="a named limit" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: older than the window. The window at the recent end; a correction lands far to its left; after the answer it is
// routed to its own path and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const off = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.5, 0.9)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  const e = easeOutBack(seg(t, 0.8, 1.3));
  return (
    <Svg label="a correction, older than the window itself — what happens?" h={230}>
      <Row y={40} label="old correction" value="older than the window" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="ordinary search" answer={answer} value="no, its own path" k={easeOut(seg(t, 0.4, 0.9))} />
      <line x1={25} y1={140} x2={575} y2={140} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={375} y={126} width={200} height={28} rx={4} fill={C.focus} fillOpacity={0.15} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <g transform={`translate(0 ${lerp(0, 22, off).toFixed(1)})`}>
        <circle cx={80} cy={lerp(112, 140, clamp(e))} r={6} fill={C.cherryText} opacity={clamp(e * 2)} />
      </g>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            past the window: an explicit path
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={170} k={tick} />
        </>
      )}
    </Svg>
  );
}
