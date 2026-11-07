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

/** The JVM / Python boundary: a vertical dashed wall at x, with the two sides labelled. */
function Wall({ x = 300, y1 = 10, y2 = 150, k = 1 }: { x?: number; y1?: number; y2?: number; k?: number }) {
  return (
    <g opacity={k}>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.second} strokeWidth={2} strokeDasharray="6 4" />
      <T x={x - 12} y={y1 + 14} s={11} f={C.latte} a="end">
        JVM
      </T>
      <T x={x + 12} y={y1 + 14} s={11} f={C.latte}>
        Python process
      </T>
    </g>
  );
}

// 1 · Hook. The fused box from last topic; one of its three operators swaps for a Python function chip, and the box's outline cracks.
export function Hook({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.4, 2.2));
  const cr = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="codegen just fused three operators into one loop. What happens the moment one of them is your own Python function?" h={200}>
      <rect
        x={25}
        y={30}
        width={400}
        height={60}
        rx={6}
        fill="none"
        stroke={C.focus}
        strokeWidth={1.8}
        strokeDasharray={cr > 0 ? `${180} ${30 * cr} 400` : undefined}
        opacity={easeOut(seg(t, 0.1, 0.4))}
      />
      {['Range', 'Filter', 'Project'].map((n, i) => (
        <Cell
          key={n}
          x={38 + i * 130}
          y={46}
          w={115}
          h={28}
          label={i === 1 && sw > 0.5 ? 'my_python_fn' : n}
          stroke={i === 1 && sw > 0.5 ? C.second : C.mocha}
          o={i === 1 ? 1 - Math.abs(1 - 2 * sw) * 0 : 1}
        />
      ))}
      <T x={450} y={66} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        one fused loop
      </T>
      <T x={25} y={140} s={12} f={C.second} o={easeOut(seg(t, 3.2, 3.6))}>
        does the loop keep going?
      </T>
    </Svg>
  );
}

// 2 · Predict. Codegen writes Java source; a Python function's body is a blank it cannot read.
export function PredictCanFuse({ t, answer }: StepCtx) {
  return (
    <Svg label="Catalyst fuses operators it understands. Can it fuse a plain Python function the same way?" h={200}>
      <rect x={25} y={16} width={250} height={70} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={38} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        generated Java source
      </T>
      <rect x={38} y={52} width={100} height={8} fill={C.latte} opacity={easeOut(seg(t, 0.3, 0.6)) * 0.6} />
      <rect x={38} y={66} width={160} height={8} fill={C.latte} opacity={easeOut(seg(t, 0.4, 0.7)) * 0.6} />
      <rect x={330} y={16} width={200} height={70} rx={4} fill="none" stroke={C.second} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.8, 1.2))} />
      <T x={430} y={56} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
        my_python_fn: ?
      </T>
      <AnswerRow y={130} label="can codegen fuse it?" answer={answer} value="no: it's opaque" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="fusion stops cold at a Python function" />
    </Svg>
  );
}

// 3 · Opaque, from the source. Rows leave the JVM one at a time, each wrapped (pickled) before it crosses the wall.
export function RevealOpaque({ t }: StepCtx) {
  const p = seg(t, 0.8, 4.0);
  return (
    <Svg label="measured: the pickled UDF's own path pickles every row, one at a time, to send it to a separate process." h={200}>
      <Wall k={easeOut(seg(t, 0.1, 0.4))} />
      {Array.from({ length: 6 }, (_, i) => {
        const q = clamp(p * 3 - i * 0.35);
        return <rect key={i} x={lerp(60, 480, q)} y={70} width={20} height={20} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      <T x={25} y={130} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 2.0))}>
        one row, pickled, one crossing
      </T>
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        from Spark's own source for this path
      </T>
    </Svg>
  );
}

// 4 · Three timings, as shapes only (the seconds are machine-dependent): built-in shortest, Arrow several times longer, pickled longest.
export function RevealThreeTimes({ t }: StepCtx) {
  const rows: [string, number, string, number][] = [
    ['built-in', 0.12, C.focus, 0.4],
    ['Arrow UDF', 0.55, C.second, 1.2],
    ['pickled UDF', 1, C.cherryText, 2.0],
  ];
  return (
    <Svg label="measured: the identical doubling computation, timed three ways on the same three million rows." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        same 3,000,000 rows · wall time
      </T>
      {rows.map(([l, w, f, s], i) => (
        <g key={l}>
          <T x={25} y={62 + i * 44} s={12} f={C.crema} o={easeOut(seg(t, s - 0.2, s))}>
            {l}
          </T>
          <rect x={150} y={50 + i * 44} width={410 * w * easeOut(seg(t, s, s + 1.0))} height={16} fill={f} />
        </g>
      ))}
      <T x={25} y={192} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        only the built-in never leaves the JVM
      </T>
    </Svg>
  );
}

// 5 · Predict. Both UDFs cross the wall; one is far faster. Why?
export function PredictWhyArrowFaster({ t, answer }: StepCtx) {
  return (
    <Svg label="both UDFs leave the JVM for Python. Why is the Arrow one still so much faster than the pickled one?" h={200}>
      <Wall y2={100} k={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={120} x2={480} y={56} k={easeInOut(seg(t, 0.4, 1.2))} label="Arrow UDF" f={C.second} />
      <Req x1={120} x2={480} y={88} k={easeInOut(seg(t, 0.6, 1.4))} label="pickled UDF" f={C.cherryText} />
      <AnswerRow y={140} label="the difference" answer={answer} value="crossings per batch" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="not the format: how often you pay" />
    </Svg>
  );
}

// 6 · Batch versus row. Upper lane: one big batch block crosses the wall once. Lower lane: the same rows cross one tiny box at a time.
export function RevealBatchVsRow({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.4));
  const p = seg(t, 0.6, 4.2);
  return (
    <Svg label="measured: Arrow crosses the boundary once per batch of rows. Pickling crosses it once per single row." h={200}>
      <Wall y2={160} k={1} />
      <T x={25} y={56} s={11} f={C.second}>
        Arrow
      </T>
      <rect x={lerp(80, 400, a)} y={42} width={120} height={22} rx={3} fill="none" stroke={C.second} strokeWidth={1.8} />
      <T x={25} y={116} s={11} f={C.cherryText}>
        pickled
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const q = clamp(p * 2.2 - i * 0.12);
        return <rect key={i} x={lerp(80, 480, q)} y={104} width={10} height={14} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      <T x={25} y={186} s={12} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))}>
        one crossing per batch, versus one per row
      </T>
    </Svg>
  );
}

// 7 · Recap. The three, in the order to reach for them.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three real speeds for the identical computation, and the one structural reason behind the whole gap." h={250}>
      <Row y={40} label="1st: built-in" value="stays fused" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="2nd: Arrow UDF" value="once per batch" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="last: pickled UDF" value="once per row" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.6))} />
      <T x={25} y={220} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        keep a pickled UDF off anything that runs often
      </T>
    </Svg>
  );
}
