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

// Every value here is examples.py's own: fct_orders's columns order_id, amount and updated_at, the planted 10% surcharge
// on amount, the pieces 42.38, 38.14 and 21.61 summed in two orders, bisection by 4, and the cost runs at 200, 2,000 and
// 20,000 rows. Rows scanned are computed, so they are drawn as lengths and plot positions, never printed.

/** A strip of `n` cells starting at x0; `stroke(i)` colours each one. */
function Strip({ x0, y, n, step, w, k, stroke }: { x0: number; y: number; n: number; step: number; w: number; k: number; stroke: (i: number) => string }) {
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x0 + i * step} y={y} width={w} height={18} rx={2} fill="none" stroke={stroke(i)} strokeWidth={1.3} />
      ))}
    </g>
  );
}

// 0 · A naive equality check piles up red row marks no one could review. Beside it, the column summary for the same change:
// one column moved, the other untouched.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="every row changed. or did it?" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        a naive equality check
      </T>
      {Array.from({ length: 120 }, (_, j) => (
        <rect
          key={j}
          x={25 + (j % 12) * 16}
          y={40 + Math.floor(j / 12) * 12}
          width={12}
          height={8}
          rx={1}
          fill="none"
          stroke={C.cherryText}
          strokeWidth={1.1}
          opacity={easeOut(seg(t, 0.2 + j * 0.012, 0.35 + j * 0.012))}
        />
      ))}
      {t > 1.8 && (
        <T x={25} y={176} s={11} f={C.cherryText} o={k(1.8)}>
          true, and impossible to review
        </T>
      )}
      <T x={300} y={30} s={11} f={C.taupe} o={k(2.2)}>
        a column-level summary
      </T>
      <Cell x={300} y={44} w={275} label="amount: one column moved" o={k(2.4)} stroke={C.cherryText} />
      <Cell x={300} y={84} w={275} label="updated_at: untouched" o={k(2.8)} stroke={C.focus} />
      {t > 3.8 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.8)}>
          same change; one report enables review
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Old and new as two strips of rows. Exact means reading every one? Once answered, a checksum box closes over
// most of both strips and they dim: matched, skipped, unread.
export function PredictExactMeansEveryRow({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const st = (i: number) => (i < 30 && v > 0.5 ? C.taupe : C.mocha);
  return (
    <Svg label="does exact mean every row?" h={250}>
      <Strip x0={25} y={60} n={40} step={13.5} w={10} k={k(0) * 1} stroke={st} />
      <Strip x0={25} y={100} n={40} step={13.5} w={10} k={k(0.2)} stroke={st} />
      <rect x={20} y={54} width={30 * 13.5} height={70} rx={4} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={v} />
      {v > 0.5 && (
        <T x={25} y={150} s={11} f={C.focus} o={v}>
          checksums match: skipped, unread
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={180} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: a checksum stands in for a range" y={222} />
    </Svg>
  );
}

// 2 · Old and new joined on order_id. A cursor sweeps every row on both sides; scanned rows outline, the one changed row
// turns red as it passes. Everything is read.
export function RevealJoinDiff({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const cx = lerp(66, 574, easeInOut(seg(t, 0.6, 3.2)));
  const st = (i: number) => {
    const x = 70 + i * 14;
    if (x + 10 > cx) return C.mocha;
    return i === 23 ? C.cherryText : C.caramel;
  };
  return (
    <Svg label="join on key. compare every column." h={250}>
      <T x={70} y={40} s={11} f={C.taupe} o={k(0)}>
        joined on order_id
      </T>
      <T x={25} y={74} s={12} f={C.crema} o={k(0.1)}>
        old
      </T>
      <T x={25} y={124} s={12} f={C.crema} o={k(0.1)}>
        new
      </T>
      <Strip x0={70} y={60} n={36} step={14} w={10} k={k(0.2)} stroke={st} />
      <Strip x0={70} y={110} n={36} step={14} w={10} k={k(0.2)} stroke={st} />
      {t > 0.6 && t < 3.3 && <line x1={cx} y1={52} x2={cx} y2={136} stroke={C.caramel} strokeWidth={2} />}
      {t > 3.6 && (
        <T x={25} y={176} s={12} f={C.cherryText} o={k(3.6)}>
          exact, complete, and every row read, every time
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={220} s={11} f={C.taupe} o={k(4.1)}>
          whether anything changed or not
        </T>
      )}
    </Svg>
  );
}

// 3 · The whole table's checksum mismatches, so it splits by 4. Three quarters match and dim, skipped; one mismatches and
// splits again; its mismatching piece is compared row by row, and the changed row turns red.
export function RevealChecksumBisection({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const col = (bad: boolean, at: number) => (t < at ? C.mocha : bad ? C.cherryText : C.focus);
  return (
    <Svg label="hash the range. split only on mismatch." h={250}>
      <rect x={25} y={30} width={550} height={20} rx={3} fill="none" stroke={col(true, 0.6)} strokeWidth={1.8} opacity={k(0.2)} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 139.5} y={80} width={132} height={20} rx={3} fill="none" stroke={col(i === 2, 1.4)} strokeWidth={1.8} opacity={k(1.0) * (i !== 2 && t > 1.6 ? 0.45 : 1)} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={304 + i * 34} y={130} width={28} height={20} rx={3} fill="none" stroke={col(i === 1, 2.2)} strokeWidth={1.8} opacity={k(1.8) * (i !== 1 && t > 2.4 ? 0.45 : 1)} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <line x1={352} y1={150} x2={lerp(352, 294 + i * 18, k(2.6))} y2={lerp(150, 178, k(2.6))} stroke={C.mocha} strokeWidth={1} opacity={k(2.6)} />
          <rect x={287 + i * 18} y={180} width={14} height={16} rx={2} fill="none" stroke={col(i === 5, 3.0)} strokeWidth={1.6} opacity={k(2.6)} />
        </g>
      ))}
      {t > 1.6 && (
        <T x={25} y={124} s={11} f={C.focus} o={k(1.6)}>
          matched: skipped, unread
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={232} s={11} f={C.crema} o={k(3.9)}>
          match: skip it unread. mismatch: split by 4 and recurse
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. The same three pieces summed in two orders land as two dots a hair apart on a number line. A regression?
// Once answered, a tolerance band closes around both.
export function PredictFloatDifferenceReal({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same pieces, different order." h={250}>
      <T x={25} y={60} s={12} f={C.crema} o={k(0)}>
        42.38 + 38.14 + 21.61
      </T>
      <T x={25} y={100} s={12} f={C.crema} o={k(0.2)}>
        21.61 + 38.14 + 42.38
      </T>
      <line x1={300} y1={140} x2={575} y2={140} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.4)} />
      <circle cx={435} cy={140} r={4} fill={C.crema} opacity={k(0.6)} />
      <circle cx={441} cy={140} r={4} fill={C.caramel} opacity={k(0.8)} />
      <rect x={418} y={128} width={40 * v} height={24} rx={3} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={v} />
      {v > 0.5 && (
        <T x={438} y={176} s={11} f={C.focus} a="middle" o={v}>
          inside the band
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={438} y={100} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: order alone moved the last digits" y={222} />
    </Svg>
  );
}

// 5 · A number line with the old amount, the reordered total a hair away, and the 10% bug far off. Exact compare flags
// both; a tolerance band then swallows the noise and still leaves the bug outside.
export function RevealTolerance({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const band = easeOut(seg(t, 2.2, 2.7));
  const banded = t > 2.2;
  return (
    <Svg label="one band. noise passes. the bug does not." h={250}>
      {!banded && (
        <T x={25} y={50} s={12} f={C.crema} o={k(0.3)}>
          exact: zero tolerance
        </T>
      )}
      {banded && (
        <T x={25} y={50} s={12} f={C.focus} o={k(2.2)}>
          a tolerance band
        </T>
      )}
      <line x1={60} y1={110} x2={560} y2={110} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <line x1={200} y1={102} x2={200} y2={118} stroke={C.crema} strokeWidth={1.6} opacity={k(0.1)} />
      <T x={200} y={136} s={11} f={C.taupe} a="middle" o={k(0.1)}>
        old
      </T>
      <rect x={200 - 18 * band} y={96} width={36 * band} height={28} rx={3} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={band} />
      <circle cx={204} cy={110} r={4} fill={banded ? C.focus : C.cherryText} opacity={k(0.5)} />
      <circle cx={420} cy={110} r={5} fill={C.cherryText} opacity={k(0.8)} />
      <T x={420} y={136} s={11} f={C.cherryText} a="middle" o={k(0.8)}>
        +10%, planted
      </T>
      {t > 1.3 && !banded && (
        <T x={25} y={176} s={11} f={C.cherryText} o={k(1.3)}>
          both flagged; no way to tell them apart
        </T>
      )}
      {t > 2.8 && (
        <T x={25} y={176} s={11} f={C.focus} o={k(2.8)}>
          the reordering passes clean
        </T>
      )}
      {t > 3.3 && (
        <T x={25} y={200} s={11} f={C.cherryText} o={k(3.3)}>
          the real bug: too big for the band
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(4.0)}>
          noise and a regression, told apart
        </T>
      )}
    </Svg>
  );
}

// 6 · The table's three columns as a grid. The planted changes light red only in amount; the summary card names that one
// column and its 10% move, and the other two columns are marked untouched.
export function RevealColumnSummary({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const cols = ['order_id', 'amount', 'updated_at'];
  return (
    <Svg label="one column named. the rest untouched." h={250}>
      {cols.map((c, ci) => (
        <g key={c}>
          <T x={25 + ci * 180} y={40} s={12} f={ci === 1 && t > 1.2 ? C.cherryText : C.crema} o={k(ci * 0.1)}>
            {c}
          </T>
          {Array.from({ length: 6 }, (_, r) => {
            const bad = ci === 1 && (r === 1 || r === 4) && t > 1.2;
            return (
              <rect
                key={r}
                x={25 + ci * 180}
                y={54 + r * 20}
                width={140}
                height={14}
                rx={2}
                fill="none"
                stroke={bad ? C.cherryText : C.mocha}
                strokeWidth={bad ? 2 : 1.2}
                opacity={k(0.3 + r * 0.05)}
              />
            );
          })}
        </g>
      ))}
      <Cell x={25} y={176} w={550} label="amount: the one column that moved, by 10%" o={k(2.2)} stroke={C.cherryText} />
      {t > 3.0 && (
        <T x={25} y={220} s={11} f={C.focus} o={k(3.0)}>
          order_id and updated_at: untouched
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={244} s={11} f={C.crema} o={k(3.8)}>
          the column, not just a row count
        </T>
      )}
    </Svg>
  );
}

// 7 · Rows read against table size, on log scales, at 200, 2,000 and 20,000 rows with the real changes held fixed. The
// join-diff line climbs with the table; the bisection line stays almost flat, and the gap widens.
export function RevealCostCurve({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const xs = [100, 330, 560];
  const join = [157, 101, 46];
  const bis = [176, 158, 158];
  const dj = easeInOut(seg(t, 0.4, 2.0));
  const db = easeInOut(seg(t, 2.2, 3.4));
  const path = (ys: number[]) => `M${xs[0]} ${ys[0]} L${xs[1]} ${ys[1]} L${xs[2]} ${ys[2]}`;
  return (
    <Svg label="same real changes. a bigger table." h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        rows read, log scale
      </T>
      <line x1={60} y1={190} x2={575} y2={190} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <line x1={60} y1={40} x2={60} y2={190} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {['200', '2,000', '20,000'].map((n, i) => (
        <T key={n} x={xs[i]} y={208} s={11} f={C.taupe} a="middle" o={k(0.2)}>
          {n}
        </T>
      ))}
      <path d={path(join)} fill="none" stroke={C.cherryText} strokeWidth={2.2} strokeDasharray="560" strokeDashoffset={560 * (1 - dj)} />
      {t > 2.0 && (
        <T x={540} y={40} s={11} f={C.cherryText} a="end" o={k(2.0)}>
          full join-diff
        </T>
      )}
      <path d={path(bis)} fill="none" stroke={C.focus} strokeWidth={2.2} strokeDasharray="520" strokeDashoffset={520 * (1 - db)} />
      {t > 3.4 && (
        <T x={560} y={146} s={11} f={C.focus} a="end" o={k(3.4)}>
          checksum bisection
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={238} s={12} f={C.crema} o={k(3.9)}>
          the table grows, the real changes stay fixed, the gap widens
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['join-diff: exact, reads all', 'bisection: exact, reads less', 'a tolerance band for noise', 'a column-level summary'];
  return (
    <Svg label="exact. tolerant. reviewable." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          exact, and choosing how much to read
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. The same table and bug through both strategies, both finding the same rows. Once answered, their rows-read
// bars grow: join-diff the full length, bisection a fraction of it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same table. same bug. how many rows?" h={250}>
      <T x={25} y={62} s={12} f={C.crema} o={k(0)}>
        full join-diff
      </T>
      <rect x={200} y={48} width={360 * v} height={18} rx={2} fill={C.cherryText} opacity={v > 0 ? 1 : 0} />
      <T x={25} y={112} s={12} f={C.crema} o={k(0.2)}>
        checksum bisection
      </T>
      <rect x={200} y={98} width={130 * v} height={18} rx={2} fill={C.focus} opacity={v > 0 ? 1 : 0} />
      <MiniTick x={25} y={150} k={k(0.5)} />
      <T x={45} y={158} s={11} f={C.focus} o={k(0.5)}>
        both find the same changed rows
      </T>
      {answer === null && t > 1.0 && (
        <T x={380} y={92} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="bisection reads far fewer rows" y={222} />
    </Svg>
  );
}
