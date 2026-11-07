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

const HOT = 1;
const W4 = [0, 1, 2, 3];

/** One worker's row at y: its piece of data as a bar (the hot piece long, the rest short) inside a dashed memory
 * outline of width `mem`; whatever runs past the outline turns cherry once `over` is on. `g` grows the piece. */
function Worker({ y, i, g, mem = 160, over = 0, k = 1 }: { y: number; i: number; g: number; mem?: number; over?: number; k?: number }) {
  const len = (i === HOT ? 420 : 46) * g;
  const inside = Math.min(len, mem);
  return (
    <g opacity={k}>
      <rect x={25} y={y} width={inside} height={22} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      {len > mem && <rect x={25 + mem} y={y} width={len - mem} height={22} fill={over > 0.5 ? C.bad : C.mocha} stroke={over > 0.5 ? C.cherryText : C.latte} strokeWidth={1.2} />}
      <rect x={22} y={y - 4} width={mem + 6} height={30} rx={3} fill="none" stroke={C.focus} strokeWidth={1.2} strokeDasharray="4 3" />
    </g>
  );
}

// 0 · Hook. Four workers' rows draw in, each a piece inside the same dashed memory outline; one piece grows far past the rest.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="four workers sort the same kind of data; one holds far more of it." h={230}>
      {W4.map((i) => (
        <Worker key={i} y={24 + i * 42} i={i} g={easeOut(seg(t, 0.4 + i * 0.2, 1.4 + i * 0.4))} k={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={25} y={212} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        which worker runs out of room first?
      </T>
    </Svg>
  );
}

// 1 · Measured. The big piece runs past its memory outline and the overflow turns cherry; then the spill is reported
// twice: a longer memory bar and a shorter disk bar.
export function RevealBaselineTwoNumbers({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.4, 2.2));
  const b = easeOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="measured: a real spill, reported as two different numbers." h={240}>
      <Worker y={30} i={HOT} g={1} over={seg(t, 0.4, 0.6)} />
      <T x={200} y={84} s={11} f={C.cherryText} o={easeOut(seg(t, 0.6, 1.0))}>
        ran short: a spill
      </T>
      <T x={25} y={120} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        memory spilled
      </T>
      <rect x={25} y={130} width={300 * a} height={14} fill={C.latte} />
      <T x={25} y={178} s={12} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        disk spilled
      </T>
      <rect x={25} y={188} width={210 * b} height={14} fill={C.second} />
      <T x={350} y={168} s={15} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        not the same
      </T>
    </Svg>
  );
}

// 2 · Predict. Four rows, one long piece; a disk box waits at the right with a question mark. How many write to it?
export function PredictHowManySpill({ t, answer }: StepCtx) {
  return (
    <Svg label="four workers, one skewed. How many actually spill?" h={240}>
      {W4.map((i) => (
        <Worker key={i} y={20 + i * 40} i={i} g={1} mem={140} />
      ))}
      <T x={300} y={190} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 0.6, 1.0)) : 0}>
        how many touch disk?
      </T>
      <Verdict answer={answer} y={225} text="only the one with the big piece" />
    </Svg>
  );
}

// 3 · Measured. The long piece's overflow turns cherry and the other three rows each get a zero at the right edge.
export function RevealOnlyOneSpills({ t }: StepCtx) {
  return (
    <Svg label="measured: exactly one. The other three never touch disk at all." h={230}>
      {W4.map((i) => (
        <g key={i}>
          <Worker y={20 + i * 40} i={i} g={1} mem={140} over={seg(t, 0.5, 0.7)} />
          {i !== HOT && (
            <T x={575} y={37 + i * 40} s={13} f={C.crema} a="end" o={easeOut(seg(t, 1.2 + i * 0.3, 1.5 + i * 0.3))}>
              0
            </T>
          )}
        </g>
      ))}
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        not less: nothing at all
      </T>
    </Svg>
  );
}

// 4 · Why the numbers differ. The memory figure's bar breaks into the data, page-rounding chunks and the sorter's
// bookkeeping; only the data slides down into the disk figure's bar.
export function ElaborateMemoryCountsMore({ t }: StepCtx) {
  const d = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="the memory figure counts rounding and bookkeeping the disk figure never does." h={230}>
      <T x={25} y={28} s={12} f={C.latte}>
        memory spilled
      </T>
      <rect x={25} y={40} width={240} height={24} fill={C.latte} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2, 3, 4].map((p) => (
        <rect key={p} x={25 + p * 60} y={40} width={60} height={24} fill="none" stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 0.7 + p * 0.1, 1.0 + p * 0.1))} />
      ))}
      <rect x={325} y={40} width={50} height={24} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 1.3, 1.6))} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        the data
      </T>
      <T x={180} y={90} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        rounded up to pages
      </T>
      <T x={395} y={57} s={11} f={C.latte} o={easeOut(seg(t, 1.5, 1.8))}>
        bookkeeping
      </T>
      <T x={25} y={128} s={12} f={C.second} o={easeOut(seg(t, 1.9, 2.2))}>
        disk spilled
      </T>
      {d > 0 && <rect x={25} y={140} width={240 * d} height={24} fill={C.second} />}
      <rect x={25} y={40} width={240} height={24} fill="none" stroke={C.second} strokeWidth={2.4} opacity={d > 0 && d < 1 ? 1 : 0} />
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        the extra never gets written out
      </T>
    </Svg>
  );
}

// 5 · Predict. The job's memory bar grows from 512 MB to four times that; will the struggling row's overflow shrink to a quarter?
export function PredictFourTimesMemory({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="give the whole job four times the memory. Does the spill shrink that much?" h={230}>
      <T x={25} y={28} s={12} f={C.latte}>
        {g < 0.5 ? 'the job: 512 MB' : 'the job: 2 GB'}
      </T>
      <rect x={25} y={40} width={lerp(130, 520, g)} height={22} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} />
      <Worker y={100} i={HOT} g={1} mem={140} over={1} />
      <T x={300} y={170} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.4, 1.8)) : 0}>
        a quarter of the spill?
      </T>
      <Verdict answer={answer} y={212} text="hardly at all" />
    </Svg>
  );
}

// 6 · Measured. Each worker's spill before (grey) and after quadrupling (pale blue): the struggling worker's two bars
// land almost the same length; the other three stay at zero.
export function RevealBarelyMoves({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.6, 2.5));
  return (
    <Svg label="measured: no. It barely moves. The other three stay exactly where they were." h={240}>
      <T x={25} y={22} s={11} f={C.latte}>
        512 MB
      </T>
      <T x={110} y={22} s={11} f={C.second}>
        2 GB
      </T>
      {W4.map((i) => (
        <g key={i}>
          <rect x={25} y={40 + i * 44} width={440} height={30} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
          {i === HOT ? (
            <g>
              <rect x={30} y={45 + i * 44} width={400 * a} height={9} fill={C.latte} />
              <rect x={30} y={58 + i * 44} width={385 * b} height={9} fill={C.second} />
            </g>
          ) : (
            <T x={575} y={60 + i * 44} s={13} f={C.crema} a="end" o={easeOut(seg(t, 2.6 + i * 0.15, 2.9 + i * 0.15))}>
              0, 0
            </T>
          )}
        </g>
      ))}
      <T x={25} y={232} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        still struggling, almost exactly as before
      </T>
    </Svg>
  );
}

// 7 · Even split. The extra memory block cuts into four equal shares that drop to the four rows: three sit unused;
// the one that mattered still falls far short of its piece's need.
export function ElaborateEvenSplitWastesIt({ t }: StepCtx) {
  const cut = easeOut(seg(t, 0.6, 1.0));
  const d = easeInOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="the extra memory was split evenly; only one worker ever needed any of it." h={240}>
      <T x={25} y={22} s={11} f={C.second} o={1 - d}>
        the extra room
      </T>
      {W4.map((i) => (
        <rect key={i} x={lerp(150 + i * (75 + 6 * cut), 25, d)} y={lerp(30, 70 + i * 40, d)} width={75} height={22} fill={C.cocoa} stroke={C.second} strokeWidth={1.6} />
      ))}
      <rect x={100} y={70 + HOT * 40} width={lerp(0, 460, easeOut(seg(t, 2.4, 3.2)))} height={22} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="5 3" />
      {W4.filter((i) => i !== HOT).map((i) => (
        <T key={i} x={115} y={86 + i * 40} s={11} f={C.latte} o={easeOut(seg(t, 2.3, 2.7))}>
          unused
        </T>
      ))}
      <T x={25} y={232} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>
        its share grew; it still fell short
      </T>
    </Svg>
  );
}

/** A four-bar spill chart at x: the struggling worker's bar of height h, the others a flat zero. */
function SpillBars({ x, h, f, k }: { x: number; h: number; f: string; k: number }) {
  return (
    <g>
      {W4.map((i) => (
        <rect key={i} x={x + i * 50} y={180 - (i === HOT ? h * k : 1)} width={34} height={i === HOT ? h * k : 1} fill={i === HOT ? f : C.mocha} />
      ))}
      <line x1={x - 6} y1={180} x2={x + 196} y2={180} stroke={C.mocha} strokeWidth={1.4} />
    </g>
  );
}

// 8 · Side by side. The two runs as small bar charts; a dashed ghost of the first run's tall bar lands over the
// second run's, almost exactly on top.
export function RevealSideBySide({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.4, 2.3));
  const g = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="measured: small memory and quadrupled memory, side by side." h={250}>
      <SpillBars x={40} h={140} f={C.latte} k={a} />
      <T x={40} y={204} s={11} f={C.latte}>
        512 MB
      </T>
      <SpillBars x={350} h={134} f={C.second} k={b} />
      <T x={350} y={204} s={11} f={C.second}>
        2 GB
      </T>
      {g > 0 && <rect x={lerp(90, 400, g)} y={40} width={34} height={140} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" />}
      <T x={25} y={240} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        almost on top of each other
      </T>
    </Svg>
  );
}

// 9 · Recap. Left: one spill, two bars of different length. Right: four equal shares against one long need.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="one metric, two numbers; more memory spread evenly rarely fixes one worker's own skew." h={250}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        one spill, two numbers
      </T>
      <rect x={25} y={50} width={220 * a} height={14} fill={C.latte} />
      <rect x={25} y={76} width={160 * a} height={14} fill={C.second} />
      <T x={315} y={30} s={12} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        an even split vs skew
      </T>
      {W4.map((i) => (
        <rect key={i} x={315} y={46 + i * 26} width={60} height={18} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 2.1 + i * 0.15, 2.4 + i * 0.15))} />
      ))}
      <rect x={380} y={46 + HOT * 26} width={lerp(0, 190, easeOut(seg(t, 2.8, 3.4)))} height={18} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="5 3" />
      <T x={300} y={220} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        read both numbers; fix the skew itself
      </T>
    </Svg>
  );
}
