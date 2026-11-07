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

/** A two-sided join plan, drawn bottom-up: a scan and an Exchange per side, an optional Sort per side (`sortK`), and the join on top. */
function JoinPlan({ t, join, sortK, joinK = 1, joinStroke = C.focus }: { t: number; join: string; sortK: number; joinK?: number; joinStroke?: string }) {
  const side = (x: number, label: string, d: number) => (
    <g>
      <Cell x={x} y={150} w={160} h={26} label={label} o={easeOut(seg(t, 0.1 + d, 0.4 + d))} />
      <Cell x={x} y={108} w={160} h={26} label="Exchange" stroke={C.second} o={easeOut(seg(t, 0.4 + d, 0.7 + d))} />
      {sortK > 0.02 && (
        <g opacity={sortK}>
          <Cell x={x} y={66} w={160} h={26} label="Sort" stroke={C.focus} />
        </g>
      )}
      <line x1={x + 80} y1={sortK > 0.5 ? 64 : 106} x2={300} y2={44} stroke={C.mocha} strokeWidth={1.2} opacity={joinK} />
    </g>
  );
  return (
    <g>
      {side(40, 'scan big', 0)}
      {side(400, 'scan big2', 0.15)}
      <Cell x={200} y={14} w={200} h={30} label={join} stroke={joinStroke} o={joinK} />
    </g>
  );
}

// 1 · Hook. Two 200,000-row tables, each too big to copy; two strategy cards: sort then merge, or hash.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two large tables, equi-joined, no hint. Which of two strategies does Spark pick on its own?" h={200}>
      <Cell x={25} y={20} w={240} h={30} label="big · 200,000 rows" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={335} y={20} w={240} h={30} label="big2 · 200,000 rows" o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={300} y={84} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
        both too big to copy everywhere
      </T>
      <Cell x={95} y={110} w={180} h={30} label="sort, then merge" stroke={C.second} o={easeOut(seg(t, 1.6, 2.0))} />
      <Cell x={325} y={110} w={180} h={30} label="hash, then probe" stroke={C.second} o={easeOut(seg(t, 1.9, 2.3))} />
      <T x={300} y={180} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        left alone, which one?
      </T>
    </Svg>
  );
}

// 2 · Sort-merge, measured. The plan builds bottom-up: scans, Exchanges, a Sort on each side, SortMergeJoin on top.
export function RevealSortMerge({ t }: StepCtx) {
  return (
    <Svg label="measured: a sort-merge join. A real Sort step sits above the shuffle on each side." h={200}>
      <JoinPlan t={t} join="SortMergeJoin" sortK={easeOut(seg(t, 1.2, 1.7))} joinK={easeOut(seg(t, 2.0, 2.5))} />
      <T x={300} y={86} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        Sort × 2
      </T>
    </Svg>
  );
}

// 3 · Predict. A SHUFFLE_HASH hint lands on one side: are the Sorts still there?
export function PredictHashHint({ t, answer }: StepCtx) {
  return (
    <Svg label="a hint tells Spark to use the other strategy on one side. Does it still sort both sides first?" h={200}>
      <Cell x={25} y={24} w={250} h={30} label="/*+ SHUFFLE_HASH(big2) */" stroke={C.second} o={easeOut(seg(t, 0.1, 0.5))} />
      <T x={25} y={88} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        a hash table doesn't need order
      </T>
      <AnswerRow y={140} label="sort steps left" answer={answer} value="none at all" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="the whole mechanism changes" />
    </Svg>
  );
}

// 4 · Shuffled hash, measured. The same plan, but both Sort nodes fade out and the join box reads ShuffledHashJoin.
export function RevealShuffledHash({ t }: StepCtx) {
  const s = easeOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="measured: a shuffled hash join. Zero Sort steps anywhere in the plan." h={200}>
      <JoinPlan t={t + 2} join={s > 0.5 ? 'ShuffledHashJoin' : 'SortMergeJoin'} sortK={1 - s} joinStroke={s > 0.5 ? C.second : C.focus} />
      <T x={300} y={86} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
        Sort × 0
      </T>
    </Svg>
  );
}

// 5 · Predict. The build side's bar swells past a memory line.
export function PredictSkewedBuildSide({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="the hash join's build side is made artificially huge. Same graceful behaviour as sort-merge?" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the hash join's build side
      </T>
      <rect x={25} y={36} width={lerp(80, 500, g)} height={16} fill={g > 0.7 ? C.cherryText : C.second} />
      <line x1={380} y1={28} x2={380} y2={62} stroke={C.focus} strokeWidth={2} />
      <T x={380} y={80} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        memory
      </T>
      <AnswerRow y={130} label="degrades the same way?" answer={answer} value="no: it must fit" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="a hash table has nowhere to spill" />
    </Svg>
  );
}

// 6 · OOM risk, sourced. Sort-merge's overflow spills down to a disk shelf; the hash table's overflow has no shelf, marked red.
export function RevealOomRisk({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="sourced: the planner's own comment names a real OOM risk. Sort-merge has no equivalent." h={200}>
      <T x={25} y={22} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        sort-merge
      </T>
      <rect x={25} y={32} width={200} height={16} fill={C.latte} />
      <rect x={lerp(225, 120, sp)} y={lerp(32, 100, sp)} width={70} height={16} fill={C.second} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={25} y1={122} x2={260} y2={122} stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={146} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        disk: spill and keep going
      </T>
      <T x={330} y={22} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 2.0))}>
        shuffled hash build
      </T>
      <rect x={330} y={32} width={170} height={16} fill={C.latte} opacity={easeOut(seg(t, 1.6, 2.0))} />
      <rect x={500} y={32} width={70 * easeOut(seg(t, 2.2, 2.8))} height={16} fill={C.cherryText} />
      <T x={330} y={100} s={12} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>
        no shelf: out of memory
      </T>
      <T x={330} y={146} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        the planner's own comment
      </T>
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="sort-merge is the default and degrades gracefully; a hint switches to hash, dropping every sort, at a real memory cost." h={250}>
      <Row y={40} label="the default" value="sort-merge" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a hint" value="hash: no sorts" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="the trade" value="no spill safety net" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
