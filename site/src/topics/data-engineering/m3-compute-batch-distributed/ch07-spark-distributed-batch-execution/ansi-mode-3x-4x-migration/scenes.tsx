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

/** A small on/off switch at (x, y) with a label to its right. */
function Switch({ x, y, on, label, k = 1 }: { x: number; y: number; on: number; label: string; k?: number }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={44} height={22} rx={11} fill={C.cocoa} stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.6} />
      <circle cx={lerp(x + 11, x + 33, on)} cy={y + 11} r={7} fill={on > 0.5 ? C.focus : C.latte} />
      <T x={x + 54} y={y + 15} s={11} f={on > 0.5 ? C.crema : C.latte}>
        {label}
      </T>
    </g>
  );
}

// 0 · Hook. A strip of the chapter's example runs, each with a small switch already on; then the one setting behind
// them all lights up.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="every example run so far in this chapter ran with ANSI mode already on." h={210}>
      <T x={25} y={24} s={11} f={C.latte}>
        this chapter's example runs
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))}>
          <rect x={25 + i * 92} y={36} width={80} height={44} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.3} />
          <circle cx={65 + i * 92} cy={58} r={6} fill={C.focus} opacity={easeOut(seg(t, 1.4 + i * 0.1, 1.6 + i * 0.1))} />
        </g>
      ))}
      <Switch x={25} y={120} on={1} label="spark.sql.ansi.enabled = true" k={easeOut(seg(t, 2.2, 2.6))} />
      <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        one setting, quietly on all along
      </T>
    </Svg>
  );
}

// 1 · The flip. Three ways a calculation goes wrong; the old answer, NULL, sits beside each; the switch flips on and
// each answer turns to an error.
export function RevealFlipsDefault({ t }: StepCtx) {
  const on = easeInOut(seg(t, 1.4, 1.9));
  const cases = ['an overflow', 'a bad cast', 'divide by zero'];
  return (
    <Svg label="ANSI mode flips the default answer to a bad value: error, not NULL." h={220}>
      <Switch x={25} y={20} on={on} label={on > 0.5 ? 'ANSI on' : 'ANSI off'} />
      {cases.map((c, i) => (
        <g key={c}>
          <T x={25} y={90 + i * 42} s={13} f={C.crema} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
            {c}
          </T>
          {on < 0.5 ? (
            <T x={575} y={90 + i * 42} s={13} f={C.latte} a="end" o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
              NULL, silently
            </T>
          ) : (
            <T x={575} y={90 + i * 42} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 1.9 + i * 0.3, 2.2 + i * 0.3))}>
              stops, with a reason
            </T>
          )}
        </g>
      ))}
    </Svg>
  );
}

// 2 · Predict. The largest 32-bit int, plus one, with the switch on. Error, or wrap?
export function PredictOverflow({ t, answer }: StepCtx) {
  return (
    <Svg label="an int overflow, ANSI mode on. Raises an error, or wraps to negative?" h={220}>
      <Switch x={25} y={20} on={1} label="ANSI on" />
      <T x={300} y={100} s={17} f={C.crema} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>
        2147483647 + 1
      </T>
      <T x={300} y={140} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 0.8, 1.2)) : 0}>
        error, or wrap?
      </T>
      <Verdict answer={answer} y={196} text="it raises an error" />
    </Svg>
  );
}

// 3 · Measured. With ANSI on, the result row reads ARITHMETIC_OVERFLOW in cherry; the switch flips off and the same
// expression's row reads the wrapped negative number.
export function RevealOverflowErrors({ t }: StepCtx) {
  const off = easeInOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="measured: raises an error under ANSI. Off, it wraps to a negative number." h={220}>
      <Switch x={25} y={20} on={1 - off} label={off > 0.5 ? 'ANSI off' : 'ANSI on'} />
      <T x={300} y={80} s={15} f={C.crema} a="middle">
        2147483647 + 1
      </T>
      <Row y={140} label="ANSI on" value="ARITHMETIC_OVERFLOW" valueColor={C.cherryText} k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={190} label="ANSI off" value="-2147483648" valueColor={C.latte} k={easeOut(seg(t, 2.6, 3.0))} />
    </Svg>
  );
}

// 4 · A separate knob. Two switches, far apart: one for operators, one for values stored into a table. A string headed
// into an INT column is decided by the second: LEGACY converts '1' to 1; ANSI refuses a non-number.
export function ElaborateStoreAssignment({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="store assignment is its own separate knob from the operator itself." h={230}>
      <Switch x={25} y={20} on={1} label="ansi.enabled: operators" k={easeOut(seg(t, 0.1, 0.4))} />
      <Switch x={325} y={20} on={0} label="storeAssignment" k={easeOut(seg(t, 0.6, 0.9))} />
      <T x={379} y={58} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        inserts into a table
      </T>
      <rect x={455} y={100} width={110} height={34} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      <T x={510} y={152} s={11} f={C.latte} a="middle">
        INT column
      </T>
      <T x={lerp(325, 480, m)} y={122} s={13} f={C.crema}>
        {m > 0.95 ? '1' : "'1'"}
      </T>
      <T x={25} y={122} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        LEGACY: converts
      </T>
      <T x={25} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>
        ANSI: a non-number raises
      </T>
      <T x={25} y={218} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        dialed apart from the main setting
      </T>
    </Svg>
  );
}

// 5 · Predict. CAST('a' AS INT) with the switch on. Error, or NULL?
export function PredictCast({ t, answer }: StepCtx) {
  return (
    <Svg label="casting the letter 'a' to INT, ANSI mode on. Raises an error, or returns NULL?" h={220}>
      <Switch x={25} y={20} on={1} label="ANSI on" />
      <T x={300} y={100} s={17} f={C.crema} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>
        CAST('a' AS INT)
      </T>
      <T x={300} y={140} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 0.8, 1.2)) : 0}>
        error, or NULL?
      </T>
      <Verdict answer={answer} y={196} text="it raises an error" />
    </Svg>
  );
}

// 6 · Measured. ANSI on: CAST_INVALID_INPUT in cherry. The switch flips off: the same cast reads NULL.
export function RevealCastErrors({ t }: StepCtx) {
  const off = easeInOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="measured: raises an error under ANSI. Off, the same cast returns NULL." h={220}>
      <Switch x={25} y={20} on={1 - off} label={off > 0.5 ? 'ANSI off' : 'ANSI on'} />
      <T x={300} y={80} s={15} f={C.crema} a="middle">
        CAST('a' AS INT)
      </T>
      <Row y={140} label="ANSI on" value="CAST_INVALID_INPUT" valueColor={C.cherryText} k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={190} label="ANSI off" value="NULL" valueColor={C.latte} k={easeOut(seg(t, 2.6, 3.0))} />
    </Svg>
  );
}

// 7 · The escape hatch. The switch stays on. The plain cast is crossed (it raises); try_cast and try_add each return
// NULL, one expression at a time.
export function ElaborateTryFunctions({ t }: StepCtx) {
  return (
    <Svg label="try_cast and try_add bring NULL-on-error back, one expression at a time." h={220}>
      <Switch x={25} y={20} on={1} label="ANSI on, all along" />
      <T x={25} y={90} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        CAST('a' AS INT)
      </T>
      <Cross x={560} y={85} k={easeOut(seg(t, 0.6, 0.9))} />
      <T x={25} y={140} s={13} f={C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        try_cast('a' AS INT)
      </T>
      <T x={575} y={140} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.9, 2.2))}>
        NULL
      </T>
      <T x={25} y={190} s={13} f={C.second} o={easeOut(seg(t, 2.6, 2.9))}>
        try_add(2147483647, 1)
      </T>
      <T x={575} y={190} s={13} f={C.second} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        NULL
      </T>
    </Svg>
  );
}

// 8 · The method. The same checks run under the old and the new behaviour; their outputs line up row by row; the one
// row that differs is marked, and an arrow points it at the cast behind it.
export function RevealMigrationMethod({ t }: StepCtx) {
  return (
    <Svg label="porting an older job: run both modes, diff the output, audit every cast the diff finds." h={250}>
      <Cell x={25} y={30} w={150} h={30} label="same checks" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={175} x2={225} y={45} k={easeOut(seg(t, 0.4, 0.7))} f={C.latte} />
      <T x={230} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        ANSI off
      </T>
      <T x={400} y={24} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        ANSI on
      </T>
      {[0, 1, 2, 3, 4].map((r) => (
        <g key={r}>
          <rect x={230} y={34 + r * 26} width={140} height={20} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.8 + r * 0.1, 1.1 + r * 0.1))} />
          <rect
            x={400}
            y={34 + r * 26}
            width={140}
            height={20}
            rx={2}
            fill={C.cocoa}
            stroke={r === 3 && t > 2.0 ? C.cherryText : C.mocha}
            strokeWidth={r === 3 && t > 2.0 ? 2 : 1.2}
            opacity={easeOut(seg(t, 1.0 + r * 0.1, 1.3 + r * 0.1))}
          />
        </g>
      ))}
      <T x={555} y={127} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.3))}>
        ≠
      </T>
      <Cell x={230} y={190} w={310} h={32} label="audit the cast behind it" stroke={C.focus} o={easeOut(seg(t, 3.0, 3.4))} />
      <Down x={470} y1={162} y2={188} k={easeOut(seg(t, 2.6, 3.0))} />
    </Svg>
  );
}

/** A downward arrow from (x, y1) to (x, y2), drawn by `k`. */
function Down({ x, y1, y2, k, f = C.latte }: { x: number; y1: number; y2: number; k: number; f?: string }) {
  const y = lerp(y1, y2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l-5 -8 h10 z`} fill={f} />
    </g>
  );
}

// 9 · Recap. The switch on; a bad value now stops with a reason; the named try_ functions opt one expression out.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one setting, flipped: a bad value now raises, unless you ask it not to." h={250}>
      <Switch x={25} y={30} on={easeInOut(seg(t, 0.3, 0.8))} label="spark.sql.ansi.enabled" />
      <T x={25} y={110} s={13} f={C.crema} o={easeOut(seg(t, 1.2, 1.6))}>
        a bad value
      </T>
      <T x={575} y={110} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        stops, with a reason
      </T>
      <T x={25} y={170} s={13} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
        try_cast, try_add
      </T>
      <T x={575} y={170} s={13} f={C.second} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        NULL, on purpose
      </T>
    </Svg>
  );
}
