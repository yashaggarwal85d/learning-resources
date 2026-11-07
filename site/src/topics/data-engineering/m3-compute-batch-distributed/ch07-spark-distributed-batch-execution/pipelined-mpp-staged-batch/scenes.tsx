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

/** One lane of three stage cells at y: with `writes`, a small disk block sits between stages (written before moving
 * on); `tok` (0..1) moves a pale-blue token along the lane, pausing at each write. `bad` marks every stage cherry. */
function Lane({ y, writes, tok = -1, bad = 0, fail = -1, spool = 0 }: { y: number; writes: boolean; tok?: number; bad?: number; fail?: number; spool?: number }) {
  const xs = [25, 215, 405];
  const tx = writes ? lerp(60, 520, tok) : lerp(60, 520, tok);
  return (
    <g>
      {xs.map((x, i) => (
        <rect key={x} x={x} y={y} width={150} height={30} rx={4} fill={C.cocoa} stroke={bad > 0.5 ? C.cherryText : i === fail ? C.cherryText : C.mocha} strokeWidth={1.5} />
      ))}
      {[175, 365].map((x) => (
        <g key={x}>
          <line x1={x} y1={y + 15} x2={x + 40} y2={y + 15} stroke={C.mocha} strokeWidth={1.4} />
          {writes && <rect x={x + 10} y={y + 36} width={20} height={14} rx={2} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />}
          {spool > 0 && <rect x={x + 10} y={y + 36} width={20} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="3 2" opacity={spool} />}
        </g>
      ))}
      {tok >= 0 && tok <= 1 && <rect x={tx - 7} y={y - 14} width={14} height={10} rx={2} fill={C.second} />}
    </g>
  );
}

/** Token progress for a staged lane: moves, then holds for a moment at each write. */
function staged(u: number) {
  if (u < 0.28) return (u / 0.28) * 0.3;
  if (u < 0.4) return 0.3;
  if (u < 0.68) return 0.3 + ((u - 0.4) / 0.28) * 0.35;
  if (u < 0.8) return 0.65;
  return 0.65 + ((u - 0.8) / 0.2) * 0.35;
}

// 0 · Hook. The chapter's model as a lane of stages, each one writing its output down before the next; beside it, two
// dashed neighbours fade in: what it chose not to be.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="this chapter's one model, named by what it chose not to be." h={220}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        this chapter: cut at every shuffle, write it down
      </T>
      <g opacity={easeOut(seg(t, 0.3, 0.8))}>
        <Lane y={40} writes />
      </g>
      {[0, 1].map((i) => (
        <rect
          key={i}
          x={25 + i * 290}
          y={130}
          width={260}
          height={40}
          rx={4}
          fill="none"
          stroke={C.latte}
          strokeWidth={1.4}
          strokeDasharray="5 4"
          opacity={easeOut(seg(t, 1.8 + i * 0.4, 2.2 + i * 0.4))}
        />
      ))}
      <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        and what it isn't
      </T>
    </Svg>
  );
}

// 1 · The trade. Two lanes run the same work: the staged one's token pauses at every write; the pipelined one's token
// never stops and reaches the end first.
export function RevealTradeLatencyForRecovery({ t }: StepCtx) {
  const u = seg(t, 0.4, 3.6);
  return (
    <Svg label="Spark trades latency for recoverability -- every stage writes to disk first." h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        writes, then moves on
      </T>
      <Lane y={44} writes tok={staged(u)} />
      <T x={25} y={130} s={11} f={C.second}>
        never stops to write
      </T>
      <Lane y={150} writes={false} tok={Math.min(1, u * 1.5)} />
      <T x={25} y={214} s={12} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        faster, but with nothing written down
      </T>
    </Svg>
  );
}

// 2 · Predict. Many rows in one call, or one row per loop turn. Which is faster per row?
export function PredictBatchVsRow({ t, answer }: StepCtx) {
  const a = seg(t, 0.3, 1.5);
  return (
    <Svg label="the same computation, large batches vs one row at a time. Which is faster, per row?" h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        one big batch
      </T>
      <rect x={25} y={34} width={240} height={60} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={40 + (i % 10) * 23} cy={48 + Math.floor(i / 10) * 11} r={3} fill={C.second} />
      ))}
      <T x={315} y={24} s={11} f={C.latte}>
        one row at a time
      </T>
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={330 + i * 23} cy={64} r={3} fill={C.latte} opacity={clamp(a * 10 - i, 0.2, 1)} />
      ))}
      <path d={`M${330 + Math.floor(a * 9.99) * 23} 78 v8`} stroke={C.focus} strokeWidth={2} />
      <T x={300} y={150} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.6, 2.0)) : 0}>
        faster per row?
      </T>
      <Verdict answer={answer} y={205} text="the batch: one call, many rows" />
    </Svg>
  );
}

// 3 · Measured. Per-row time as two bars: the loop's long, the batch's under a third of it.
export function RevealBatchFaster({ t }: StepCtx) {
  return (
    <Svg label="measured: the batched version is faster, by a wide margin, per row." h={200}>
      <T x={25} y={40} s={12} f={C.latte}>
        one row at a time
      </T>
      <rect x={25} y={52} width={480 * easeOut(seg(t, 0.3, 1.5))} height={18} fill={C.latte} />
      <T x={25} y={110} s={12} f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
        large batches
      </T>
      <rect x={25} y={122} width={110 * easeOut(seg(t, 1.9, 2.6))} height={18} fill={C.second} />
      <T x={25} y={180} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        per row, by a real margin
      </T>
    </Svg>
  );
}

// 4 · No boundary. A pipelined lane; one stage's task fails (crossed); with nothing written down to retry from, every
// stage turns cherry: the whole job fails.
export function ElaborateGiveUpOnFailure({ t }: StepCtx) {
  const f = easeOut(seg(t, 1.0, 1.3));
  const all = seg(t, 2.2, 2.4);
  return (
    <Svg label="that speed is what a row-at-a-time exchange gives up on failure." h={220}>
      <T x={25} y={24} s={11} f={C.second}>
        pipelined, nothing written down
      </T>
      <Lane y={44} writes={false} tok={t < 1.0 ? seg(t, 0.2, 1.0) * 0.5 : -1} fail={f > 0.5 ? 1 : -1} bad={all} />
      <Cross x={290} y={59} k={f} />
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>
        nothing to retry from
      </T>
      <T x={25} y={180} s={13} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        by default: one failure fails the job
      </T>
    </Svg>
  );
}

// 5 · Predict. Two pipelines: rows pass through one and vanish; in the other they pile up in a box. Whose memory grows?
export function PredictMemoryGrowth({ t, answer }: StepCtx) {
  const a = seg(t, 0.2, 2.0);
  return (
    <Svg label="streaming row by row vs materialising the whole result. Whose memory grows with row count?" h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        use it, then drop it
      </T>
      {[0, 1, 2].map((i) => {
        const u = (a * 3 + i / 3) % 1;
        return <circle key={i} cx={40 + u * 220} cy={52} r={4} fill={C.second} opacity={1 - u} />;
      })}
      <T x={315} y={24} s={11} f={C.latte}>
        keep every result
      </T>
      <rect x={315} y={34} width={240} height={60} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={330 + (i % 10) * 23} cy={84 - Math.floor(i / 10) * 13} r={4} fill={C.latte} opacity={clamp(a * 30 - i, 0, 1)} />
      ))}
      <T x={300} y={150} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 2.0, 2.4)) : 0}>
        whose memory grows?
      </T>
      <Verdict answer={answer} y={205} text="the one that keeps every result" />
    </Svg>
  );
}

// 6 · Measured. Rows jump from 50,000 to 5,000,000; the materialising pipeline's memory bar grows with them; the
// streaming one's barely moves.
export function RevealMemoryGrows({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.8, 2.4));
  return (
    <Svg label="measured: materialising grows with row count. Streaming stays flat." h={220}>
      <Row y={40} label="rows" value={g < 0.5 ? '50,000' : '5,000,000'} valueColor={g > 0.5 ? C.focus : C.crema} k={easeOut(seg(t, 0.1, 0.5))} />
      <T x={25} y={96} s={11} f={C.latte}>
        keep every result: peak memory
      </T>
      <rect x={25} y={106} width={lerp(12, 500, g)} height={16} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      <T x={25} y={160} s={11} f={C.second}>
        use and drop: peak memory
      </T>
      <rect x={25} y={170} width={lerp(30, 40, g)} height={16} fill={C.second} />
      <T x={300} y={200} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        a hundred times the rows
      </T>
    </Svg>
  );
}

// 7 · Spooling on purpose. The pipelined lane spools its exchange data into dashed pale-blue blocks; a stage fails,
// and this time it is retried from what was spooled and ticks, instead of failing the job.
export function ElaborateFTEConverges({ t }: StepCtx) {
  const sp = easeOut(seg(t, 0.4, 1.0));
  const f = easeOut(seg(t, 1.4, 1.7));
  const r = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="fault-tolerant execution is the convergence point -- spooling exchange data on purpose." h={220}>
      <T x={25} y={24} s={11} f={C.second}>
        pipelined, spooling its exchange data
      </T>
      <Lane y={44} writes={false} spool={sp} fail={f > 0.5 && r < 0.5 ? 1 : -1} />
      {r < 0.5 && <Cross x={290} y={59} k={f} />}
      <path d={`M${385} 100 q -60 30 -95 -20`} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.0, 2.5))} />
      <MiniTick x={284} y={59} k={r} f={C.second} />
      <T x={25} y={160} s={12} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>
        retried from what was saved, not the whole job
      </T>
    </Svg>
  );
}

// 8 · Three models. Three columns, each a system, its picture, and where it pays.
export function RevealThreeModels({ t }: StepCtx) {
  const cols: [string, string, string][] = [
    ['Spark', 'recoverable, slower', C.latte],
    ['Trino', 'fast, risks the job', C.cherryText],
    ['Ray Data', 'streamed, bounded', C.second],
  ];
  return (
    <Svg label="three real models, three different trades." h={250}>
      {cols.map(([n, d, f], i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        const x = 25 + i * 190;
        return (
          <g key={n} opacity={k}>
            <T x={x} y={34} s={13} f={C.crema}>
              {n}
            </T>
            <rect x={x} y={50} width={170} height={110} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.3} />
            {i === 0 && [0, 1, 2].map((s) => <rect key={s} x={x + 12 + s * 54} y={70} width={40} height={24} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />)}
            {i === 0 && [0, 1].map((s) => <rect key={s} x={x + 46 + s * 54} y={110} width={20} height={14} rx={2} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />)}
            {i === 1 && <rect x={x + 12} y={82} width={146} height={24} rx={3} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.3} />}
            {i === 2 && [0, 1, 2, 3].map((s) => <circle key={s} cx={x + 30 + s * 36} cy={94} r={5} fill={C.second} opacity={1 - s * 0.22} />)}
            <T x={x} y={188} s={11} f={f}>
              {d}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Recap. The chapter's model in the middle, a neighbour on either side; each names what it gives up.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one chapter, one model -- now named against two others, by what each gives up." h={250}>
      <Cell x={200} y={60} w={200} h={40} label="staged: this chapter" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Cell x={25} y={150} w={160} h={36} label="pipelined" stroke={C.cherryText} o={easeOut(seg(t, 1.2, 1.6))} />
      <Cell x={415} y={150} w={160} h={36} label="streamed" stroke={C.second} o={easeOut(seg(t, 2.2, 2.6))} />
      <line x1={230} y1={100} x2={lerp(230, 140, easeOut(seg(t, 1.0, 1.4)))} y2={lerp(100, 148, easeOut(seg(t, 1.0, 1.4)))} stroke={C.latte} strokeWidth={1.4} />
      <line x1={370} y1={100} x2={lerp(370, 460, easeOut(seg(t, 2.0, 2.4)))} y2={lerp(100, 148, easeOut(seg(t, 2.0, 2.4)))} stroke={C.latte} strokeWidth={1.4} />
      <T x={25} y={210} s={11} f={C.cherryText} o={easeOut(seg(t, 1.6, 2.0))}>
        gives up recovery
      </T>
      <T x={575} y={210} s={11} f={C.second} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        bounds what it holds
      </T>
    </Svg>
  );
}
