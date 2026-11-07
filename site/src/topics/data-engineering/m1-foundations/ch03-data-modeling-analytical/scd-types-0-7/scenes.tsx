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

/** A small lock: a body and a shackle, drawn by `k`. */
function Lock({ x, y, k }: { x: number; y: number; k: number }) {
  return (
    <g opacity={k} transform={`translate(${x} ${y}) scale(${(0.6 + 0.4 * k).toFixed(3)})`}>
      <path d="M-7 0 v-6 a7 7 0 0 1 14 0 v6" fill="none" stroke={C.focus} strokeWidth={2.5} />
      <rect x={-11} y={0} width={22} height={16} rx={3} fill={C.focus} />
    </g>
  );
}

// 1 · Hook. Type 2 on every attribute: forty customer rows, then every one of their changes adds another, and the block of
// rows keeps growing to 160.
export function Hook({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.4, 3.6));
  const n = Math.round(40 + 120 * c);
  return (
    <Svg label="treat every attribute like Type 2, and the dimension never stops growing" h={250}>
      <Row y={40} label="type 2 everywhere" value="new row per change" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the dimension" value={`${num(n)} rows`} valueColor={c > 0.5 ? C.cherryText : C.crema} big k={easeOut(seg(t, 0.8, 1.2))} />
      {Array.from({ length: 160 }, (_, i) => (
        <rect
          key={i}
          x={25 + (i % 16) * 34.5}
          y={110 + Math.floor(i / 16) * 11}
          width={31}
          height={8}
          rx={1.5}
          fill={i < 40 ? C.latte : C.cherryText}
          opacity={(i < n ? 1 : 0) * (i < 40 ? easeOut(seg(t, 0.6, 1.1)) : 0.75)}
        />
      ))}
      <T x={25} y={238} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        40 customers, 3 changes each
      </T>
    </Svg>
  );
}

// 2 · Type 0. The original value sits locked; a change arrives from the right, stops at the lock and falls away.
export function RevealType0({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.4, 2.2));
  const off = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="the value never changes, so there is nothing to track" h={230}>
      <Row y={40} label="type 0" value="retain the original" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="to version" value="nothing at all" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={135} w={270} h={34} label="original credit score" o={easeOut(seg(t, 0.5, 0.9))} stroke={C.focus} />
      <Lock x={318} y={144} k={easeOutBack(seg(t, 0.9, 1.3))} />
      <g opacity={(a > 0 ? 1 : 0) * (1 - off)} transform={`translate(0 ${(off * 40).toFixed(1)})`}>
        <Cell x={lerp(445, 345, a)} y={137} w={130} h={30} label="a change" stroke={C.cherryText} f={C.cherryText} />
      </g>
    </Svg>
  );
}

// 3 · Type 1. One row; the old value drops out of it and is gone; the new value slides in; the row count stays at one.
export function RevealType1({ t }: StepCtx) {
  const out = easeIn2(seg(t, 1.4, 2.1));
  const inn = easeOut(seg(t, 2.1, 2.7));
  return (
    <Svg label="overwrite in place — easy, but history is gone for good" h={240}>
      <Row y={40} label="type 1" value="overwrite in place" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="old value" value="gone for good" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      <rect x={25} y={130} width={300} height={34} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={175} y={lerp(152, 222, out)} s={13} f={out > 0 ? C.cherryText : C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.8)) * (1 - out)}>
        old value
      </T>
      <T x={lerp(260, 175, inn)} y={152} s={13} f={C.focus} a="middle" o={inn}>
        new value
      </T>
      <T x={575} y={152} s={13} f={C.latte} a="end" o={easeOut(seg(t, 3.3, 3.8))}>
        still 1 row
      </T>
    </Svg>
  );
}

/** An ease that starts slow and speeds up, for something falling away. */
function easeIn2(x: number) {
  return x * x;
}

// 4 · Predict: one row, both values? Overwrite loses it; a new row keeps it; the middle box asks; then the question.
export function PredictOneColumn({ t, answer }: StepCtx) {
  return (
    <Svg label="keep the old value, but without adding a whole new row — possible?" h={210}>
      <Row y={40} label="between the two" value="one row, both values?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={175} h={26} label="overwrite: lost" o={easeOut(seg(t, 0.3, 0.6))} stroke={C.cherryText} />
      <Cell x={400} y={60} w={175} h={26} label="new row: kept" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={212} y={60} w={176} h={26} label="?" o={easeOut(seg(t, 0.9, 1.2))} stroke={C.focus} f={C.focus} />
      <AnswerRow y={140} label="one row, both" answer={answer} value="yes, a second column" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a second column on the same row" />
    </Svg>
  );
}

// 5 · Type 3. Two columns on one row; the old value slides across into the alternate-reality column, the new value lands
// in the main one.
export function RevealType3({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.4, 2.2));
  const inn = easeOut(seg(t, 2.2, 2.8));
  const hd = easeOut(seg(t, 0.4, 0.8));
  return (
    <Svg label="a second column, an alternate reality, beside the overwritten one" h={230}>
      <Row y={40} label="type 3" value="a second column" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="either value" value="can be reported on" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      <T x={160} y={128} s={11} f={C.latte} a="middle" o={hd}>
        main, overwritten
      </T>
      <T x={440} y={128} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        alternate reality
      </T>
      <rect x={25} y={138} width={270} height={34} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={hd} />
      <rect x={305} y={138} width={270} height={34} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.4))} />
      <T x={lerp(160, 440, mv)} y={160} s={13} f={mv > 0 ? C.second : C.crema} a="middle" o={hd}>
        old value
      </T>
      <T x={160} y={lerp(140, 160, inn)} s={13} f={C.focus} a="middle" o={inn}>
        new value
      </T>
      <T x={300} y={200} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        still 1 row, now 2 columns
      </T>
    </Svg>
  );
}

const GALLERY: { type: string; rows: number; cols: number; kept: string; f: string }[] = [
  { type: 'type 0', rows: 1, cols: 1, kept: 'none kept', f: C.latte },
  { type: 'type 1', rows: 1, cols: 1, kept: 'none kept', f: C.latte },
  { type: 'type 2', rows: 2, cols: 1, kept: 'new row', f: C.focus },
  { type: 'type 3', rows: 1, cols: 2, kept: 'new column', f: C.second },
];

// 6 · The gallery. The same change under four treatments, one after another: each draws its rows and columns, then its
// count and what it kept.
export function RevealGallery({ t }: StepCtx) {
  return (
    <Svg label="one change, four treatments: row count and column count, side by side" h={240}>
      <Row y={40} label="one change" value="four treatments, counted" k={easeOut(seg(t, 0.2, 0.7))} />
      {GALLERY.map((g, i) => {
        const x = 25 + i * 140;
        const k = easeOut(seg(t, 0.7 + i * 0.6, 1.2 + i * 0.6));
        const cw = g.cols === 2 ? 58 : 120;
        return (
          <g key={g.type} opacity={k}>
            <T x={x + 60} y={82} s={12} f={C.crema} a="middle">
              {g.type}
            </T>
            {Array.from({ length: g.rows * g.cols }, (_, j) => (
              <rect key={j} x={x + (j % g.cols) * (cw + 4)} y={94 + Math.floor(j / g.cols) * 28} width={cw} height={22} rx={3} fill={C.cocoa} stroke={j > 0 ? g.f : C.mocha} strokeWidth={1.5} />
            ))}
            <T x={x + 60} y={174} s={12} f={C.latte} a="middle">
              {`${g.rows} row${g.rows > 1 ? 's' : ''}`}
            </T>
            <T x={x + 60} y={192} s={12} f={C.latte} a="middle">
              {`${g.cols} col${g.cols > 1 ? 's' : ''}`}
            </T>
            <T x={x + 60} y={220} s={12} f={g.f} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
              {g.kept}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Predict: a fast, shared group. One wide row copied again and again, piling up; then the question.
export function PredictMonsterDimension({ t, answer }: StepCtx) {
  return (
    <Svg label="a fast-changing attribute group, shared by many rows — does Type 2 scale?" h={210}>
      <Row y={40} label="fast, shared group" value="changes constantly" k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={25 + i * 8}
          y={58 + i * 10}
          width={460}
          height={14}
          rx={2}
          fill={C.cocoa}
          stroke={i > 0 ? C.cherryText : C.mocha}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35))}
        />
      ))}
      <AnswerRow y={140} label="type 2 at scale" answer={answer} value="no, rows pile up" f={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} text="every change copies the whole wide row" f={C.cherryText} />
    </Svg>
  );
}

const SEEN = [0, 2, 4, 5, 7];

// 8 · Type 4. The fast pair slides out of the customer box into its own table; its nine possible combinations are laid out,
// and only five light up as rows.
export function RevealType4({ t }: StepCtx) {
  const sl = easeInOut(seg(t, 0.8, 1.6));
  const g = easeOut(seg(t, 1.6, 2.0));
  const lit = (j: number) => easeOut(seg(t, 2.2 + SEEN.indexOf(j) * 0.25, 2.5 + SEEN.indexOf(j) * 0.25));
  const c = easeOut(seg(t, 2.2, 3.5));
  return (
    <Svg label="nine possible combinations, five actually seen — the mini-dimension stays that small" h={250}>
      <Row y={40} label="possible" value="3 tiers × 3 channels = 9" k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={85} label="rows that exist" value={num(5 * c)} valueColor={C.focus} big k={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={25} y={140} w={160} h={60} label="customer" o={easeOut(seg(t, 0.2, 0.6))} />
      <Cell x={lerp(35, 230, sl)} y={lerp(176, 112, sl)} w={lerp(140, 327, sl)} h={20} label="income · channel" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      {Array.from({ length: 9 }, (_, j) => {
        const on = SEEN.includes(j) ? lit(j) : 0;
        return (
          <rect
            key={j}
            x={230 + (j % 3) * 111}
            y={140 + Math.floor(j / 3) * 28}
            width={105}
            height={22}
            rx={3}
            fill={on > 0 ? C.focus : C.cocoa}
            fillOpacity={on > 0 ? 0.2 + 0.4 * on : 1}
            stroke={on > 0 ? C.focus : C.mocha}
            strokeWidth={1.2}
            opacity={g}
          />
        );
      })}
    </Svg>
  );
}

// 9 · Type 5. The customer row gains a current-profile pointer into the mini-dimension; the profile changes, and the
// pointer is simply overwritten to the new row; the fact table is never touched.
export function RevealType5({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.9, 1.5));
  const mv = easeInOut(seg(t, 2.4, 3.0));
  const yTo = lerp(133, 193, mv);
  return (
    <Svg label="Type 4, plus one overwritten pointer to the current profile — four plus one" h={250}>
      <Row y={40} label="type 5" value="type 4, plus 1 pointer" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="current profile" value="read with no fact join" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      <Cell x={25} y={128} w={210} h={30} label="customer · current →" o={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={25} y={196} w={210} h={30} label="fact table" o={0.4 * easeOut(seg(t, 0.4, 0.8))} />
      {['profile a', 'profile b', 'profile c'].map((l, i) => (
        <Cell key={l} x={385} y={120 + i * 30} w={190} h={26} label={l} o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} stroke={(i === 0 && mv < 1) || (i === 2 && mv >= 1) ? C.focus : C.mocha} />
      ))}
      <line x1={235} y1={143} x2={lerp(235, 385, p)} y2={lerp(143, yTo, p)} stroke={C.focus} strokeWidth={2} />
      <T x={300} y={236} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        pointer overwritten, type 1 style
      </T>
    </Svg>
  );
}

// 10 · Predict: same report, same cost? Two hybrids, each promising then-and-now; then the question.
export function PredictSixSeven({ t, answer }: StepCtx) {
  return (
    <Svg label="same reporting, two hybrids — do they really cost different amounts?" h={210}>
      <Row y={40} label="type 6, type 7" value="same report" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={260} h={26} label="type 6 · then and now" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={315} y={60} w={260} h={26} label="type 7 · then and now" o={easeOut(seg(t, 0.6, 0.9))} />
      <AnswerRow y={140} label="same cost" answer={answer} value="no, it differs" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="one rewrites history, one never does" />
    </Svg>
  );
}

// 11 · The update cost. A customer's current value changes: under Type 6 a sweep rewrites all six prior rows, counted;
// under Type 7 the six rows stay untouched and a second key reaches the current row.
export function RevealSixSevenMeasured({ t }: StepCtx) {
  const sw = seg(t, 0.9, 2.4);
  const c = easeOut(seg(t, 0.9, 2.4));
  const k7 = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="six prior rows rewritten for Type 6; zero rewritten for Type 7" h={250}>
      <Row y={40} label="type 6" value={`${num(6 * c)} rewritten`} valueColor={C.cherryText} big k={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={85} label="type 7" value="0 rewritten" valueColor={C.focus} big k={easeOut(seg(t, 2.6, 3.0))} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const hit = sw * 6 > i;
        return (
          <g key={i}>
            <rect
              x={25}
              y={112 + i * 19}
              width={240}
              height={14}
              rx={2}
              fill={hit ? C.cherryText : C.cocoa}
              fillOpacity={hit ? 0.5 : 1}
              stroke={hit ? C.cherryText : C.mocha}
              strokeWidth={1.2}
              opacity={easeOut(seg(t, 0.2, 0.6))}
            />
            <rect x={335} y={112 + i * 19} width={240} height={14} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2, 0.6))} />
          </g>
        );
      })}
      <rect x={335} y={230} width={240} height={14} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <path d={`M320 ${lerp(119, 237, k7)} h${10 * Math.min(1, k7 * 4)}`} fill="none" stroke={C.focus} strokeWidth={2} opacity={k7 > 0 ? 1 : 0} />
      <line x1={320} y1={119} x2={320} y2={lerp(119, 237, k7)} stroke={C.focus} strokeWidth={2} opacity={k7 > 0 ? 1 : 0} />
      <T x={145} y={240} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        six prior rows
      </T>
    </Svg>
  );
}

const CHOICES: [string, string, string][] = [
  ['signup channel', 'type 0', C.latte],
  ['mistyped phone', 'type 1', C.latte],
  ['fast shared pair', 'type 4, then 5', C.focus],
];

// 12 · Choosing. One attribute at a time, a line runs from the attribute to the type its churn and use earn.
export function RevealChoosing({ t }: StepCtx) {
  return (
    <Svg label="one attribute, one decision each: Type 0, Type 1, and Type 4 moving to Type 5" h={240}>
      <Row y={40} label="per attribute" value="a question, not a formula" k={easeOut(seg(t, 0.3, 0.8))} />
      {CHOICES.map(([a, ty, f], i) => {
        const y = 90 + i * 48;
        const k = easeOut(seg(t, 1.0 + i * 1.0, 1.4 + i * 1.0));
        const l = easeInOut(seg(t, 1.3 + i * 1.0, 1.8 + i * 1.0));
        return (
          <g key={a}>
            <Cell x={25} y={y} w={210} h={30} label={a} o={k} />
            <line x1={235} y1={y + 15} x2={lerp(235, 365, l)} y2={y + 15} stroke={f} strokeWidth={1.5} opacity={k} />
            <Cell x={365} y={y} w={210} h={30} label={ty} o={l} stroke={f} f={f} />
          </g>
        );
      })}
    </Svg>
  );
}

// 13 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="zero through three: keep it or not; four: split it off; five, six, seven: combinations" h={220}>
      <Row y={50} label="types 0 to 3" value="does the old value survive" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="type 4" value="split the fast group off" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="types 5 to 7" value="combinations, trading cost" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 14 · Prove: changes often, tracked alone, the value at sale time. After the answer the plain case is named with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="changes often, tracked alone, history always needed — which type?" h={230}>
      <Row y={40} label="tracked alone" value="its value at each sale" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="which type" answer={answer} value="type 2" k={easeOut(seg(t, 0.4, 0.9))} />
      {['changes often', 'tracked alone', 'value at sale'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={115} w={170} h={26} label={l} o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            the plain case: a new row per change
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
