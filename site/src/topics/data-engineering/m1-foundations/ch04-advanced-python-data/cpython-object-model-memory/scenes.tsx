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

/** One boxed Python int: a refcount strip, a type-pointer strip, then the value itself, each revealed by its own `k`. */
function Boxed({ x, y, w = 40, k = [1, 1, 1], o = 1 }: { x: number; y: number; w?: number; k?: number[]; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={8} rx={1} fill={C.cherryText} opacity={0.75 * k[0]} />
      <rect x={x} y={y + 10} width={w} height={8} rx={1} fill={C.second} opacity={0.8 * k[1]} />
      <rect x={x} y={y + 20} width={w} height={8} rx={1} fill={C.crema} opacity={0.8 * k[2]} />
    </g>
  );
}

// 1 · Hook. The same six numbers go two ways: on the loop path each one travels as a tall boxed object, one at a time; on the
// vectorized path they cross together as one thin packed strip and finish first.
export function Hook({ t }: StepCtx) {
  const v = easeInOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="the same math, a loop and a vectorized call — what is the loop actually paying for?" h={250}>
      <Row y={40} label="same arithmetic" value="two paths" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the difference" value="what each number carries" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      <T x={25} y={125} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        loop
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const p = easeInOut(seg(t, 1.0 + i * 0.45, 1.5 + i * 0.45));
        return <Boxed key={i} x={lerp(80 + i * 26, 360 + i * 36, p)} y={112} w={22} o={easeOut(seg(t, 0.5, 0.8))} />;
      })}
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        vectorized
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={lerp(110, 300, v) + i * 36} y={180} width={32} height={10} rx={1} fill={C.focus} opacity={0.8 * easeOut(seg(t, 0.5, 0.8))} />
      ))}
      <Tick y={180} k={easeOut(seg(t, 1.7, 2.1))} />
    </Svg>
  );
}

// 2 · The PyObject header. One object assembles: the reference count, then the type pointer, and only then the value itself.
export function RevealPyObjectHeader({ t }: StepCtx) {
  const k = [easeOut(seg(t, 0.8, 1.2)), easeOut(seg(t, 1.6, 2.0)), easeOut(seg(t, 2.6, 3.0))];
  return (
    <Svg label="a reference count and a type pointer, before a single byte of the value itself" h={250}>
      <Row y={40} label="every object" value="refcount + type pointer" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="all before" value="a byte of its value" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {['reference count', 'type pointer', 'the value'].map((l, i) => (
        <g key={l} opacity={k[i]} transform={`translate(${((1 - k[i]) * 20).toFixed(1)} 0)`}>
          <rect x={25} y={118 + i * 38} width={300} height={30} rx={4} fill={C.cocoa} stroke={[C.cherryText, C.second, C.crema][i]} strokeWidth={1.5} />
          <T x={175} y={138 + i * 38} s={12} f={[C.cherryText, C.second, C.crema][i]} a="middle">
            {l}
          </T>
        </g>
      ))}
      <path d={`M345 118 h10 v68 h-10`} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k[1]} />
      <T x={365} y={157} s={11} f={C.latte} o={k[1]}>
        every object's header
      </T>
    </Svg>
  );
}

// 3 · Predict: about the same? A list of boxed ints beside the same values packed into one buffer; then the question.
export function PredictBoxedVsPacked({ t, answer }: StepCtx) {
  return (
    <Svg label="a list of plain integers vs. a packed buffer — about the same, or dramatically more?" h={210}>
      <Row y={40} label="boxed list vs packed" value="about the same?" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 6 }, (_, i) => (
        <Boxed key={i} x={25 + i * 34} y={58} w={28} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={345 + i * 38} y={76} width={34} height={10} rx={1} fill={C.focus} opacity={0.8 * easeOut(seg(t, 0.9, 1.2))} />
      ))}
      <AnswerRow y={140} label="same footprint" answer={answer} value="no, far bigger" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="every one carries its own header" f={C.cherryText} />
    </Svg>
  );
}

// 4 · Boxed vs packed, measured. The list's footprint (its pointer array plus every int's own header) grows past three times
// the packed buffer's bar; cached small ints are counted once.
export function RevealBoxedVsPackedMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 2.2));
  const b = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="the same values, boxed and packed, measured byte for byte on this sandbox" h={250}>
      <Row y={40} label="boxed list" value="pointers + every header" valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="vs packed buffer" value="over 3× the bytes" valueColor={C.cherryText} big k={easeOut(seg(t, 2.4, 2.9))} />
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        boxed
      </T>
      <rect x={100} y={119} width={110 * a} height={16} rx={2} fill={C.second} opacity={0.7} />
      <rect x={210} y={119} width={365 * clamp(a * 1.4 - 0.4)} height={16} rx={2} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={165} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        packed
      </T>
      <rect x={100} y={154} width={140 * b} height={16} rx={2} fill={C.focus} opacity={0.7} />
      <line x1={240} y1={145} x2={240} y2={178} stroke={C.focus} strokeWidth={1.5} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.4, 1.7))} />
      <T x={25} y={210} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        cached small ints counted once, not twice
      </T>
    </Svg>
  );
}

// 5 · __slots__. An ordinary object with its own attribute dictionary hanging off it; the slots version's dictionary fades and
// is crossed out; its footprint bar shrinks to under half.
export function RevealSlotsMeasured({ t }: StepCtx) {
  const g = easeOut(seg(t, 1.6, 2.2));
  const sh = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="the same object, with and without its own dictionary — measured, not estimated" h={250}>
      <Row y={40} label="ordinary object" value="carries a __dict__" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="with __slots__" value="no __dict__ at all" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Cell x={25} y={125} w={150} h={30} label="object" o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={175} y1={140} x2={225} y2={140} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.7, 1.0)) * (1 - g)} />
      <Cell x={225} y={125} w={150} h={30} label="__dict__" o={easeOut(seg(t, 0.7, 1.0)) * (1 - 0.7 * g)} stroke={g > 0 ? C.cherryText : C.mocha} />
      <Cross x={395} y={140} k={g} />
      <rect x={25} y={185} width={lerp(550, 250, sh)} height={16} rx={2} fill={sh > 0 ? C.focus : C.latte} opacity={0.6 * easeOut(seg(t, 0.5, 0.9))} />
      <T x={25} y={226} s={11} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        more than 2× smaller per instance
      </T>
    </Svg>
  );
}

// 6 · Predict: same bytecode always? One generic instruction; calls arrive, all ints; then the question.
export function PredictSpecialization({ t, answer }: StepCtx) {
  return (
    <Svg label="does the bytecode stay fixed regardless of type, or does the interpreter rewrite it?" h={210}>
      <Row y={40} label="int, int, int, …" value="same instruction?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="BINARY_OP" o={easeOut(seg(t, 0.2, 0.5))} />
      {Array.from({ length: 5 }, (_, i) => {
        const p = easeInOut(seg(t, 0.5 + i * 0.2, 0.9 + i * 0.2));
        return <circle key={i} cx={lerp(575, 235, p)} cy={73} r={5} fill={C.crema} opacity={p > 0 && p < 1 ? 1 : 0} />;
      })}
      <AnswerRow y={140} label="same bytecode always" answer={answer} value="no, it rewrites" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="it adapts once a type repeats" />
    </Svg>
  );
}

const DIS: [string, string, string][] = [
  ['cold, never called', 'BINARY_OP', C.latte],
  ['warm, int + int', 'BINARY_OP_ADD_INT', C.focus],
  ['warm, str + str', 'BINARY_OP_ADD_UNICODE', C.second],
];

// 7 · Disassembled. Three lines: the cold function's generic instruction; the int-warmed copy's int add; the str-warmed copy's
// str add.
export function RevealSpecializationDisassembled({ t }: StepCtx) {
  return (
    <Svg label="the same function's bytecode, generic before any call and type-specific after warm-up" h={250}>
      <Row y={40} label="same function" value="disassembled, cold and warm" k={easeOut(seg(t, 0.3, 0.8))} />
      {DIS.map(([l, op, f], i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.9, 1.2 + i * 0.9));
        const w = easeInOut(seg(t, 1.1 + i * 0.9, 1.6 + i * 0.9));
        return (
          <g key={l} opacity={k}>
            <T x={25} y={100 + i * 50} s={13} f={C.latte}>
              {l}
            </T>
            <rect x={275} y={82 + i * 50} width={300 * w} height={28} rx={4} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
            <T x={290} y={101 + i * 50} s={12} f={f} o={w}>
              {op}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Speculative and adaptive. The instruction guesses int; int calls stream through and match; then a str call arrives,
// misses, and the guess re-forms around the new type at a small cost.
export function RevealSpecializationQuote({ t }: StepCtx) {
  const miss = easeOut(seg(t, 2.4, 2.8));
  const re = easeOut(seg(t, 2.9, 3.4));
  return (
    <Svg label="speculative and adaptive — specializes to what it sees, adapts when that changes" h={250}>
      <Row y={40} label="speculative" value="guesses the type ahead" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="adaptive" value="re-guesses when it shifts" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <rect x={225} y={140} width={150} height={40} rx={5} fill={C.cocoa} stroke={miss > 0 ? C.cherryText : C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.5, 0.8)) * (1 - 0.5 * re)} />
      <T x={300} y={165} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.5, 0.8)) * (1 - 0.5 * re)}>
        guess: int
      </T>
      <g opacity={re} transform={`translate(${((1 - re) * -20).toFixed(1)} 0)`}>
        <rect x={405} y={140} width={150} height={40} rx={5} fill={C.cocoa} stroke={C.second} strokeWidth={2} />
        <T x={480} y={165} s={13} f={C.second} a="middle">
          guess: str
        </T>
      </g>
      {Array.from({ length: 4 }, (_, i) => {
        const p = easeInOut(seg(t, 0.9 + i * 0.3, 1.3 + i * 0.3));
        return <circle key={i} cx={lerp(25, 225, p)} cy={160} r={5} fill={C.focus} opacity={p > 0 && p < 1 ? 1 : 0} />;
      })}
      <circle cx={lerp(25, 225, easeInOut(seg(t, 2.0, 2.4)))} cy={160} r={6} fill={C.second} opacity={t > 2.0 && t < 2.9 ? 1 : 0} />
      <T x={25} y={210} s={11} f={C.cherryText} o={miss * (1 - 0.5 * re)}>
        a wrong guess: a small cost
      </T>
    </Svg>
  );
}

// 9 · The JIT. Bytecode, then specialized bytecode, then machine code; the last stage is dashed, needing a JIT build, and this
// sandbox's check comes back crossed.
export function RevealJitDisclosure({ t }: StepCtx) {
  const S = ['bytecode', 'specialized', 'machine code'];
  return (
    <Svg label="hot bytecode compiled to machine code — but only in a build configured for it, which this sandbox is not" h={250}>
      <Row y={40} label="hot code" value="compiled to machine code" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="this sandbox's build" value="has no JIT" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      {S.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 0.6 + i * 0.5, 1.0 + i * 0.5))}>
          {i > 0 && <line x1={i * 190 + 5} y1={150} x2={i * 190 + 25} y2={150} stroke={C.latte} strokeWidth={1.5} />}
          <rect x={25 + i * 190} y={135} width={170} height={30} rx={4} fill={C.cocoa} stroke={i === 2 ? C.latte : C.mocha} strokeWidth={1.5} strokeDasharray={i === 2 ? '5 4' : undefined} />
          <T x={110 + i * 190} y={155} s={12} f={i === 2 ? C.latte : C.crema} a="middle">
            {s}
          </T>
        </g>
      ))}
      <T x={490} y={188} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        needs a JIT build
      </T>
      <T x={25} y={225} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        sys._jit, checked on this sandbox
      </T>
      <Cross x={555} y={221} k={easeOut(seg(t, 2.8, 3.1))} />
    </Svg>
  );
}

// 10 · Still behind the vectorized call. The loop's time bar, made of boxed items still carrying headers, runs long; the
// vectorized bar is a short sliver; the gap is marked at least ten times.
export function RevealLoopVsVectorized({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 2.2));
  const b = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="the interpreter sped up, but a vectorized call is still measured far ahead of it" h={250}>
      <Row y={40} label="interpreter, sped up" value="still per-object" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="vectorized call" value="at least 10× ahead" valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.3))} />
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        loop
      </T>
      {Array.from({ length: 14 }, (_, i) => (
        <Boxed key={i} x={100 + i * 34} y={116} w={30} o={a * 14 > i ? 1 : 0} />
      ))}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        vectorized
      </T>
      <rect x={100} y={170} width={44 * b} height={12} rx={2} fill={C.focus} opacity={0.8} />
      <T x={25} y={225} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        every header still paid in the loop
      </T>
    </Svg>
  );
}

// 11 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="boxed values carry real overhead; the interpreter adapts, at a cost; neither closes the vectorized gap" h={220}>
      <Row y={50} label="every value" value="pays for its header" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="the interpreter" value="adapts, at a cost" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="vectorized" value="skips that cost entirely" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 12 · Prove: a mix of types. Calls alternate int and float; after the answer the alternating lane's bar runs longer than the
// consistent one, and the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const b = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="millions of calls, but a genuine mix of int and float arguments — does specialization still help?" h={230}>
      <Row y={40} label="int, float, int, float" value="still helps?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="it helps" answer={answer} value="less, measurably" k={easeOut(seg(t, 0.4, 0.9))} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={40 + i * 24} cy={124} r={5} fill={i % 2 ? C.second : C.crema} opacity={easeOut(seg(t, 0.5 + i * 0.05, 0.7 + i * 0.05))} />
      ))}
      <rect x={300} y={114} width={200 * b} height={8} rx={2} fill={C.crema} opacity={0.6} />
      <rect x={300} y={128} width={250 * b} height={8} rx={2} fill={C.second} opacity={0.8} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            the mix costs over 1.1× as much
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={160} k={tick} />
        </>
      )}
    </Svg>
  );
}
