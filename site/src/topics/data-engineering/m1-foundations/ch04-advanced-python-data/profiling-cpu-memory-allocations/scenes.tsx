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

/** One horizontal timing bar with its name on the left; the bar's length is a schematic share, never a figure. */
function Lane({ y, label, frac, k, f = C.crema }: { y: number; label: string; frac: number; k: number; f?: string }) {
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <T x={25} y={y + 9} s={12} f={C.latte} o={clamp(k * 3)}>
        {label}
      </T>
      <rect x={190} y={y} width={Math.max(3, 360 * frac * k)} height={12} rx={2} fill={f} opacity={0.8} />
    </g>
  );
}

// 1 · Hook. Three claims from three earlier topics sit in three separate boxes; a dashed frame tries to hold them side by side,
// and its question mark stays open.
export function Hook({ t }: StepCtx) {
  const f = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="three speed claims so far, each measured alone — none checked side by side yet" h={230}>
      <Row y={40} label="three claims" value="each measured alone" k={easeOut(seg(t, 0.3, 0.8))} />
      {['object overhead', 'the GIL', 'async'].map((l, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.5, 1.1 + i * 0.5));
        return <Cell key={l} x={40 + i * 180} y={lerp(100, 82, k)} w={150} label={l} o={k} />;
      })}
      <rect x={30} y={72} width={530} height={48} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="6 5" opacity={f} />
      <Row y={170} label="side by side" value="not yet checked" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 2 · Deterministic profiling. A call timeline: each call and each return gets its own mark as it happens, and the
// watched run comes out longer than the bare one.
export function RevealDeterministicQuote({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.6, 2.6));
  const c = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="every call and return monitored, with precise timing — real instrumentation, real cost" h={250}>
      <Row y={40} label="every call, every return" value="watched" k={easeOut(seg(t, 0.3, 0.8))} />
      <line x1={25} y1={130} x2={25 + 525 * p} y2={130} stroke={C.mocha} strokeWidth={2} />
      {Array.from({ length: 8 }, (_, i) => {
        const x = 40 + i * 66;
        const on = 25 + 525 * p > x;
        return (
          <g key={i} opacity={on ? 1 : 0}>
            <rect x={x} y={112} width={30} height={14} rx={2} fill={C.second} opacity={0.7} />
            <line x1={x} y1={106} x2={x} y2={142} stroke={C.focus} strokeWidth={1.5} />
            <line x1={x + 30} y1={106} x2={x + 30} y2={142} stroke={C.focus} strokeWidth={1.5} />
          </g>
        );
      })}
      <T x={25} y={162} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        each call and return, marked
      </T>
      <T x={25} y={192} s={11} f={C.latte} o={c}>
        bare
      </T>
      <rect x={110} y={184} width={300 * c} height={8} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={214} s={11} f={C.latte} o={c}>
        watched
      </T>
      <rect x={110} y={206} width={300 * c} height={8} rx={2} fill={C.crema} opacity={0.6} />
      <rect x={410} y={206} width={110 * easeOut(seg(t, 3.3, 3.9))} height={8} rx={2} fill={C.cherryText} opacity={0.8} />
      <T x={575} y={240} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 3.7, 4.1))}>
        precise, at a real cost
      </T>
    </Svg>
  );
}

// 3 · Predict: does async win again? The same feed fans out to four ways of processing it; then the question.
export function PredictAsyncAgain({ t, answer }: StepCtx) {
  return (
    <Svg label="the same feed, four ways — does async win here the way it won its own topic's race?" h={210}>
      <Row y={40} label="same feed, four ways" value="async wins again?" k={easeOut(seg(t, 0.1, 0.5))} />
      {['plain loop', '4 processes', 'async', 'native engine'].map((l, i) => (
        <Cell key={l} x={25 + i * 140} y={64} w={130} label={l} o={easeOut(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15))} stroke={i === 2 ? C.focus : C.mocha} />
      ))}
      <AnswerRow y={140} label="async wins again" answer={answer} value="no, wrong workload" f={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="parsing is computing, not waiting" f={C.cherryText} />
    </Svg>
  );
}

// 4 · All four, measured together. Four timing bars grow in turn: the plain loop, four processes a little shorter, async the
// longest of all, and the native engine barely a sliver.
export function RevealFourWaysMeasured({ t }: StepCtx) {
  return (
    <Svg label="four ways, measured together — native engine wins big, async measured slowest of all" h={260}>
      <Row y={40} label="one feed" value="200,000 rows" k={easeOut(seg(t, 0.2, 0.7))} />
      <Lane y={70} label="plain loop" frac={0.72} k={easeOut(seg(t, 0.5, 1.2))} />
      <Lane y={102} label="4 processes" frac={0.55} k={easeOut(seg(t, 1.0, 1.7))} f={C.second} />
      <Lane y={134} label="async" frac={1} k={easeOut(seg(t, 1.5, 2.3))} f={C.cherryText} />
      <Lane y={166} label="Polars + DuckDB" frac={0.012} k={easeOut(seg(t, 2.3, 2.6))} f={C.focus} />
      <Tick y={172} k={easeOut(seg(t, 2.7, 3.1))} />
      <Row y={225} label="async" value="slowest of the four" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 5 · cProfile on the plain loop. A sorted report draws in line by line, and the real function it watched rises to the top.
export function RevealCProfileMeasured({ t }: StepCtx) {
  const h = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="a real trace of the actual loop that ran — the real function, named directly" h={250}>
      <Row y={40} label="cProfile, plain loop" value="sorted by time" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={82} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        report, top 5
      </T>
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={i}
          x={25}
          y={94 + i * 22}
          width={(i === 0 ? 300 : 260 - i * 40) * easeOut(seg(t, 0.8 + i * 0.2, 1.3 + i * 0.2))}
          height={14}
          rx={2}
          fill={i === 0 ? C.cocoa : C.mocha}
          stroke={i === 0 ? C.focus : undefined}
          strokeWidth={i === 0 ? 1.5 + 1.5 * h : undefined}
          opacity={i === 0 ? 1 : 0.6}
        />
      ))}
      <T x={35} y={105} s={12} f={C.crema} o={h}>
        process_plain_loop
      </T>
      <Tick y={100} k={easeOut(seg(t, 2.8, 3.2))} />
      <Row y={225} label="named directly" value="the real function" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 6 · tracemalloc. Two heap traces climb: the plain loop's peak stands high, the native engine's stays low, each with a
// dashed high-water mark. Beneath, the earlier, wrong comparison is crossed out.
export function RevealTracemallocMeasured({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.8));
  const b = easeInOut(seg(t, 1.4, 2.4));
  const loop = (x: number) => 200 - 70 * Math.sin(Math.PI * x) ** 0.6;
  const nat = (x: number) => 200 - 26 * Math.sin(Math.PI * x) ** 0.6;
  const path = (fn: (x: number) => number, x0: number, k: number) =>
    'M' +
    Array.from({ length: 21 }, (_, i) => i / 20)
      .filter((x) => x <= k)
      .map((x) => `${(x0 + x * 220).toFixed(1)} ${fn(x).toFixed(1)}`)
      .join(' L');
  return (
    <Svg label="a real peak heap size, loop vs native engine — an earlier wrong measurement caught and fixed" h={260}>
      <Row y={40} label="peak heap" value="loop higher than native" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      <line x1={25} y1={200} x2={565} y2={200} stroke={C.mocha} strokeWidth={1} />
      {a > 0 && <path d={path(loop, 25, a)} fill="none" stroke={C.cherryText} strokeWidth={2} />}
      {b > 0 && <path d={path(nat, 345, b)} fill="none" stroke={C.focus} strokeWidth={2} />}
      <line x1={25} y1={130} x2={245} y2={130} stroke={C.cherryText} strokeWidth={1} strokeDasharray="4 4" opacity={easeOut(seg(t, 1.8, 2.1))} />
      <line x1={345} y1={174} x2={565} y2={174} stroke={C.focus} strokeWidth={1} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={135} y={218} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        plain loop
      </T>
      <T x={455} y={218} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        Polars + DuckDB
      </T>
      <T x={25} y={248} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        earlier: counted after the call
      </T>
      <Cross x={330} y={244} k={easeOut(seg(t, 3.4, 3.7))} />
      <T x={575} y={248} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.7, 4.1))}>
        now: the peak
      </T>
    </Svg>
  );
}

// 7 · Predict: names, or addresses? A process runs on its own inside a box; a probe arrives from outside without touching its
// code; then the question.
export function PredictPyspyNames({ t, answer }: StepCtx) {
  const p = easeInOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="attach from outside, no code changed — real function names, or just addresses?" h={210}>
      <Row y={40} label="attach from outside" value="names or addresses?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={300} y={58} width={260} height={48} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={315 + ((i * 40 + t * 60) % 220)} y={78} width={20} height={8} rx={1} fill={C.second} opacity={0.7 * easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <line x1={40} y1={82} x2={40 + 250 * p} y2={82} stroke={C.focus} strokeWidth={2} />
      <T x={40} y={72} s={11} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        py-spy
      </T>
      <AnswerRow y={140} label="raw addresses only" answer={answer} value="no, real names" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="it reads the live process's own memory" />
    </Svg>
  );
}

// 8 · py-spy for real. The workload runs in its own process; py-spy attaches from outside after 0.8 s, and the dump it brings
// back names the stack: the workload script, then the lab's own function.
export function RevealPyspyMeasured({ t }: StepCtx) {
  const p = easeInOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="a real live attach — the lab's own exact function, named directly from outside" h={250}>
      <Row y={40} label="workload, its own process" value="attached at 0.8 s" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={300} y={62} width={260} height={40} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={315 + ((i * 40 + t * 60) % 220)} y={78} width={20} height={8} rx={1} fill={C.second} opacity={0.7 * easeOut(seg(t, 0.3, 0.6))} />
      ))}
      <line x1={40} y1={82} x2={40 + 260 * p} y2={82} stroke={C.focus} strokeWidth={2} />
      <T x={40} y={72} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        py-spy dump
      </T>
      <Cell x={25} y={124} w={330} label="<module>  _profiling_lab_workload.py" o={easeOut(seg(t, 2.0, 2.4))} />
      <Cell x={45} y={160} w={310} label="process_plain_loop  examples.py" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))} />
      <Tick y={172} k={easeOut(seg(t, 3.1, 3.5))} />
      <Row y={225} label="exact function" value="named, from outside" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Scalene on the native leg. One bar of the leg's CPU time fills, then splits into its Python part and its native part,
// and the native part is the larger.
export function RevealScaleneMeasured({ t }: StepCtx) {
  const f = easeOut(seg(t, 0.6, 1.6));
  const s = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="a real measured split — native time genuinely dominates, confirmed, not assumed" h={230}>
      <Row y={40} label="Scalene, native leg" value="where did time go?" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={82} width={550 * f} height={26} rx={3} fill={C.mocha} opacity={1 - s} />
      <rect x={25} y={82} width={110 * s} height={26} rx={3} fill={C.second} opacity={s} />
      <rect x={25 + 116 * s} y={82} width={434 * s} height={26} rx={3} fill={C.focus} opacity={0.8 * s} />
      <T x={25} y={130} s={12} f={C.second} o={easeOut(seg(t, 2.5, 2.8))}>
        Python
      </T>
      <T x={575} y={130} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        native
      </T>
      <Row y={185} label="native time" value="at least Python's" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 10 · The Arrow handoff. First test: does the output share the input's buffer address? Crossed out. Then the real comparison:
// a direct query on the table in memory against a trip out to a CSV file and back, and the direct bar finishes first.
export function RevealArrowHandoffMeasured({ t }: StepCtx) {
  const d = easeOut(seg(t, 2.0, 2.5));
  const c = easeInOut(seg(t, 2.0, 3.4));
  return (
    <Svg label="querying in memory beats a real file round trip — the actual measured benefit" h={250}>
      <Row y={40} label="same buffer address?" value="no, honestly" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Cross x={555} y={70} k={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={25} y={100} w={110} label="Arrow table" o={easeOut(seg(t, 1.3, 1.6))} />
      <line x1={135} y1={114} x2={135 + 290 * d} y2={114} stroke={C.focus} strokeWidth={2} />
      <Cell x={430} y={100} w={130} label="direct query" stroke={C.focus} f={C.focus} o={d} />
      <path d="M80 128 V170 H200" fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="200" strokeDashoffset={200 * (1 - clamp(c * 3))} />
      <Cell x={200} y={156} w={100} label="CSV file" o={easeOut(seg(t, 2.4, 2.7))} />
      <path d="M300 170 H430" fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="130" strokeDashoffset={130 * (1 - clamp((c - 0.5) * 2))} />
      <Cell x={430} y={156} w={130} label="read back" o={easeOut(seg(t, 3.2, 3.5))} />
      <Row y={230} label="direct vs CSV trip" value="direct is faster" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 11 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="real timing, a real live attach, a real split, four approaches finally settled together" h={240}>
      <Row y={40} label="every call" value="timed for real" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={95} label="live attach" value="the true call stack" valueColor={C.focus} k={easeOut(seg(t, 1.5, 2.0))} />
      <Row y={150} label="time split" value="Python or native" k={easeOut(seg(t, 2.4, 2.9))} />
      <Row y={205} label="four approaches" value="settled side by side" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 12 · Prove: which tool answers which? Three questions in three cells; after the answer each takes its own tool beneath it,
// and the stall gets no answer from either timing or memory.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.25, 0.5 + i * 0.25)) : 0);
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="a pipeline 'feels slow' — cpu, memory, or a stall? which tool answers which?" h={230}>
      <Row y={40} label="feels slow" value="cpu, memory, stall?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="one tool for all three" answer={answer} value="no, one each" k={easeOut(seg(t, 0.4, 0.9))} />
      {['CPU time', 'memory', 'a stall'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={110} w={170} label={l} o={easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))} />
      ))}
      {['cProfile', 'tracemalloc', 'neither'].map((l, i) => (
        <T key={l} x={110 + i * 190} y={lerp(168, 160, k(i))} s={12} f={i === 2 ? C.cherryText : C.focus} a="middle" o={k(i)}>
          {l}
        </T>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            each tool answers its own question
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
