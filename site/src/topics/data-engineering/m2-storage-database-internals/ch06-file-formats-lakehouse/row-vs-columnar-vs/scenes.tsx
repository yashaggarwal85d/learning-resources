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

const ATTR = ['id', 'dept', 'age', 'salary'];

/** A row-major strip: `n` rows of four attribute blocks; `lit(r, a)` lights a block (0 → 1), salary blocks in focus. */
function Strip({ x0, y, n, lit, o = 1 }: { x0: number; y: number; n: number; lit: (r: number, a: number) => number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, r) =>
        [0, 1, 2, 3].map((a) => {
          const k = lit(r, a);
          return <rect key={`${r}-${a}`} x={x0 + r * 110 + a * 26} y={y} width={22} height={18} rx={2} fill={C.cocoa} stroke={k > 0 ? (a === 3 ? C.focus : C.latte) : C.mocha} strokeWidth={1.5 + k} />;
        }),
      )}
    </g>
  );
}

// 1 · Hook. A row-major strip of rows; a read bracket lands over one whole row: one contiguous slice, one read.
export function Hook({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="one row, one contiguous read: NSM's point lookup touches 32 bytes." h={210}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a row-major file: id, dept, age, salary, next row
      </T>
      <Strip x0={25} y={52} n={5} lit={(r) => (r === 2 ? b : 0)} o={easeOut(seg(t, 0.2, 0.6))} />
      <rect x={245} y={80} width={100 * b} height={3} fill={C.focus} />
      <Row y={130} label="point lookup" value="one read, 32 bytes" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.2))} />
      <T x={25} y={180} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        the default layout for decades
      </T>
    </Svg>
  );
}

// 2 · Predict. The same strip; the salary block of every row pulses, scattered across it; the answer: no.
export function PredictScan({ t, answer }: StepCtx) {
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <Svg label="row storage wins the point lookup. Does it also win a scan of one column?" h={200}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one column, every row
      </T>
      <Strip x0={25} y={55} n={5} lit={(r, a) => (a === 3 && t > 0.6 ? g : 0)} o={easeOut(seg(t, 0.2, 0.5))} />
      <AnswerRow y={140} label="row storage wins?" answer={answer} value="no" k={easeOut(seg(t, 0.9, 1.4))} />
      <Verdict answer={answer} y={184} text="every other attribute is in the way" />
    </Svg>
  );
}

// 3 · Row-major scan. A cursor sweeps two lines of rows; every block it passes lights, the salary ones in focus, the rest
// touched for nothing; the bytes-touched count runs to the whole file.
export function RevealNsmScan({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.5, 3.0));
  const at = (line: number, r: number, a: number) => (sw * 40 > line * 20 + r * 4 + a ? 1 : 0);
  return (
    <Svg label="every byte of every row is touched, even for one column." h={220}>
      <Row y={40} label="bytes touched" value={`${num(32000 * sw)} of 32,000`} k={easeOut(seg(t, 0.2, 0.5))} />
      <Strip x0={25} y={70} n={5} lit={(r, a) => at(0, r, a)} />
      <Strip x0={25} y={105} n={5} lit={(r, a) => at(1, r, a)} />
      <T x={25} y={152} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        … every row of 1,000
      </T>
      <T x={300} y={200} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        the whole file, for one column
      </T>
    </Svg>
  );
}

// 4 · Column files. Four separate files, one per attribute; the scan sweeps only the salary file. Then a lookup lifts one
// value out of each file and joins them back into a row.
export function RevealDsm({ t }: StepCtx) {
  const sc = easeInOut(seg(t, 0.5, 1.6));
  const j = easeInOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="DSM's scan touches a quarter of the bytes; its point lookup needs four separate reads." h={240}>
      {ATTR.map((a, i) => (
        <g key={a} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))}>
          <T x={25} y={68 + i * 30} s={12} f={C.latte}>
            {a}
          </T>
          <rect x={90} y={55 + i * 30} width={330} height={18} rx={3} fill={C.cocoa} stroke={i === 3 && sc > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
          {i === 3 && <rect x={92} y={57 + i * 30} width={326 * sc} height={14} rx={2} fill={C.focus} opacity={0.7} />}
          <rect
            x={lerp(200, 470 + i * 26, j)}
            y={lerp(57 + i * 30, 100, j)}
            width={22}
            height={14}
            rx={2}
            fill={C.cocoa}
            stroke={C.cherryText}
            strokeWidth={2}
            opacity={easeOut(seg(t, 2.4 + i * 0.1, 2.6 + i * 0.1))}
          />
        </g>
      ))}
      <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        scan: one file, 8,000 bytes, 75% less
      </T>
      <T x={25} y={220} s={13} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>
        lookup: 4 separate reads, then a join
      </T>
    </Svg>
  );
}

/** A page holding its rows, columns grouped into four minipage bands. `pg` lights the page, `band(i)` a band. */
function Page({ x, y, w, h, pg = 0, band, o = 1 }: { x: number; y: number; w: number; h: number; pg?: number; band: (i: number) => number; o?: number }) {
  const bh = (h - 10) / 4;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={pg > 0 ? C.focus : C.mocha} strokeWidth={1.5 + pg} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x + 5} y={y + 5 + i * bh} width={w - 10} height={bh - 3} rx={2} fill={i === 3 ? C.focus : C.latte} opacity={0.15 + 0.6 * clamp(band(i))} />
      ))}
    </g>
  );
}

// 5 · PAX. Three of the ten pages, each with four minipage bands. A lookup lights one page and threads through its four
// bands; a scan lights only the salary band of every page in turn.
export function RevealPax({ t }: StepCtx) {
  const lk = easeOut(seg(t, 0.8, 1.3));
  const th = easeInOut(seg(t, 1.2, 1.8));
  return (
    <Svg label="PAX groups columns inside a page: one page for a lookup, one minipage for a scan." h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        pages of 100 rows, columns grouped inside
      </T>
      {[0, 1, 2].map((p) => (
        <Page
          key={p}
          x={25 + p * 190}
          y={52}
          w={170}
          h={96}
          pg={p === 1 ? lk * (1 - easeOut(seg(t, 2.2, 2.5))) : 0}
          band={(i) => (i === 3 ? easeOut(seg(t, 2.6 + p * 0.3, 2.9 + p * 0.3)) : 0)}
          o={easeOut(seg(t, 0.2 + p * 0.1, 0.5 + p * 0.1))}
        />
      ))}
      <line x1={290} y1={57} x2={290} y2={57 + 86 * th} stroke={C.focus} strokeWidth={3} opacity={th > 0 ? 1 - easeOut(seg(t, 2.2, 2.5)) : 0} />
      <T x={25} y={180} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 2.0))}>
        lookup: one page
      </T>
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        scan: only the salary minipage
      </T>
    </Svg>
  );
}

// 6 · Same pages, less waste. Ten row-major pages open one by one, fully read; ten PAX pages open alongside, only a
// quarter band of each lit; the counts land equal, the useful share a quarter.
export function RevealSurprisingNumber({ t }: StepCtx) {
  const op = (i: number) => easeOut(seg(t, 0.4 + i * 0.13, 0.7 + i * 0.13));
  return (
    <Svg label="PAX still opens all ten pages to scan one column — same I/O as NSM, a quarter of the bytes." h={250}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        row-major: pages opened
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} opacity={op(i)}>
          <rect x={25 + i * 55} y={48} width={45} height={36} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
          <rect x={29 + i * 55} y={52} width={37} height={28} rx={2} fill={C.latte} opacity={0.5} />
        </g>
      ))}
      <T x={25} y={110} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        PAX: pages opened
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} opacity={op(i)}>
          <rect x={25 + i * 55} y={118} width={45} height={36} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
          <rect x={29 + i * 55} y={145} width={37} height={6} rx={1} fill={C.focus} opacity={0.85} />
        </g>
      ))}
      <Row y={195} label="pages opened" value="10 and 10" k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={235} label="useful per page" value="25%" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 7 · Parquet. A column-oriented file of four column chunks; each chunk shrinks by its own amount, encoded on its own.
export function RevealParquet({ t }: StepCtx) {
  const ws = [0.55, 0.3, 0.42, 0.75];
  return (
    <Svg label="Parquet is column-oriented and compresses per column — the payoff of a PAX-shaped page." h={225}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Parquet: a column-oriented file
      </T>
      <rect x={25} y={50} width={550} height={100} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      {ATTR.map((a, i) => {
        const k = easeInOut(seg(t, 1.0 + i * 0.3, 1.6 + i * 0.3));
        return (
          <g key={a} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))}>
            <T x={35 + i * 135} y={70} s={12} f={C.latte}>
              {a}
            </T>
            <rect x={35 + i * 135} y={80} width={125 * lerp(1, ws[i], k)} height={58} rx={3} fill={C.cocoa} stroke={k > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
          </g>
        );
      })}
      <T x={25} y={185} s={13} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        each column encoded and compressed on its own
      </T>
      <T x={25} y={212} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        because its values already sit together
      </T>
    </Svg>
  );
}

// 8 · Recap. Three layouts, one row per beat, then the next question.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three layouts, three trade-offs: NSM, DSM, PAX." h={240}>
      <Row y={45} label="row-major" value="wins lookup, loses scan" k={easeOut(seg(t, 0.5, 0.9))} />
      <Row y={95} label="by column" value="wins scan, loses lookup" k={easeOut(seg(t, 1.6, 2.0))} />
      <Row y={145} label="PAX" value="keeps both" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
      <T x={300} y={210} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        next: reader and writer disagree on the schema
      </T>
    </Svg>
  );
}
