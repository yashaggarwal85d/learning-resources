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

/** A plan node: a cocoa box with mono-ish label at (x, y). */
function PNode({ x, y, label, k = 1, stroke = C.latte, w = 200 }: { x: number; y: number; label: string; k?: number; stroke?: string; w?: number }) {
  return <Cell x={x} y={y} w={w} h={28} label={label} stroke={stroke} o={k} />;
}

/** The big side as four task boxes in a column at x; the small side as one short box. */
function JoinSides({ t, x = 25 }: { t: number; x?: number }) {
  return (
    <g>
      <T x={x} y={20} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        big · 100,000 rows · 4 tasks
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x} y={30 + i * 34} width={180} height={26} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} />
      ))}
      <T x={430} y={20} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        small · 10 rows
      </T>
      <rect x={430} y={30} width={40} height={26} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.6, 0.9))} />
    </g>
  );
}

// 1 · Hook. One query card; it moves through four plan stages left to right, each a slot that lights as the query passes.
export function Hook({ t }: StepCtx) {
  const st = ['unresolved', 'resolved', 'optimised', 'chosen'];
  const p = easeInOut(seg(t, 1.0, 3.4));
  return (
    <Svg label="one query, four plans: unresolved, resolved, optimised, chosen. What actually changes between them?" h={200}>
      {st.map((s, i) => (
        <g key={s}>
          <Cell x={25 + i * 140} y={80} w={130} h={34} label={s} stroke={p * 4 > i + 0.5 ? C.focus : C.mocha} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} />
          {i < 3 && <line x1={155 + i * 140} y1={97} x2={165 + i * 140} y2={97} stroke={C.mocha} strokeWidth={1.6} />}
        </g>
      ))}
      <rect x={lerp(40, 460, p)} y={36} width={100} height={24} rx={3} fill="none" stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={lerp(90, 510, p)} y={52} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        one query
      </T>
      <T x={300} y={160} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        what changes, first to last?
      </T>
    </Svg>
  );
}

// 2 · Parse, then analyze. The parsed tree's nodes carry a tick ('Filter, 'Project); analysis checks each against the catalog and the
// ticks fall away, attribute ids appearing.
export function RevealParseAnalyze({ t }: StepCtx) {
  const r = easeOut(seg(t, 2.0, 2.6));
  const tk = r > 0.5;
  return (
    <Svg label="measured: the parsed plan marks every node unresolved with a tick. Analysis resolves each one against the catalog." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        {tk ? 'analyzed plan' : 'parsed plan'}
      </T>
      <PNode x={25} y={34} label={tk ? 'Filter (a#n > 10)' : "'Filter (a > 10)"} stroke={tk ? C.focus : C.cherryText} k={easeOut(seg(t, 0.2, 0.5))} />
      <PNode x={45} y={74} label={tk ? 'Project [a#n, b#n]' : "'Project [a, b]"} stroke={tk ? C.focus : C.cherryText} k={easeOut(seg(t, 0.4, 0.7))} />
      <PNode x={65} y={114} label="Range" k={easeOut(seg(t, 0.6, 0.9))} />
      <T x={300} y={52} s={11} f={C.cherryText} o={easeOut(seg(t, 0.9, 1.3)) * (1 - r)}>
        ' = not checked yet
      </T>
      <Cell x={360} y={100} w={160} h={30} label="catalog" stroke={C.second} o={easeOut(seg(t, 1.4, 1.8))} />
      <line x1={358} y1={115} x2={lerp(358, 270, r)} y2={lerp(115, 88, r)} stroke={C.second} strokeWidth={1.4} opacity={r > 0 ? 1 : 0} />
      <T x={25} y={180} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        resolved: every name checked, ticks gone
      </T>
    </Svg>
  );
}

// 3 · Predict. The tree as written: Filter on top of Project, Project on the scan. Keep that order?
export function PredictFilterOrder({ t, answer }: StepCtx) {
  return (
    <Svg label="the query selects two columns, then filters. Does the optimizer run it in that written order, or move the filter?" h={200}>
      <PNode x={25} y={14} label="Filter (a > 10)" stroke={C.second} k={easeOut(seg(t, 0.1, 0.4))} />
      <PNode x={45} y={52} label="Project [a, b]" k={easeOut(seg(t, 0.3, 0.6))} />
      <PNode x={65} y={90} label="Range (the scan)" k={easeOut(seg(t, 0.5, 0.8))} />
      <AnswerRow y={150} label="the filter" answer={answer} value="moves near the scan" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={190} text="fewer rows reach anything above" />
    </Svg>
  );
}

// 4 · Pushdown, measured. Filter and Project swap places: the filter slides down below the project, next to the scan.
export function RevealPushdown({ t }: StepCtx) {
  const s1 = easeInOut(seg(t, 0.8, 1.3));
  const s2 = easeInOut(seg(t, 1.3, 1.9));
  const s3 = easeInOut(seg(t, 1.9, 2.4));
  const fx = s3 > 0 ? lerp(300, 45, s3) : lerp(25, 300, s1);
  return (
    <Svg label="measured: the optimizer moves the filter below the select, closer to the scan — the written order doesn't survive." h={200}>
      <PNode x={fx} y={lerp(14, 52, s2)} label="Filter (a > 10)" stroke={C.second} />
      <PNode x={lerp(45, 25, s2)} y={lerp(52, 14, s2)} label="Project [a, b]" w={180} />
      <PNode x={65} y={90} label="Range (the scan)" />
      <T x={300} y={110} s={12} f={C.second} o={easeOut(seg(t, 2.4, 2.8))}>
        filter, right on the scan
      </T>
      <T x={25} y={170} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        optimized: the written order didn't survive
      </T>
    </Svg>
  );
}

// 5 · Constant folding. A "(1 + 2)" chip in the expression squeezes into a plain "3" at planning time.
export function RevealConstantFold({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="same rule-based pass, a different trick: a literal 1 plus 2 is folded straight into 3, never computed per row." h={200}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        select(
      </T>
      <rect x={95} y={22} width={lerp(90, 34, f)} height={28} rx={3} fill={C.cocoa} stroke={f > 0.5 ? C.focus : C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={95 + lerp(90, 34, f) / 2} y={41} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        {f > 0.5 ? '3' : '(1 + 2)'}
      </T>
      <T x={lerp(195, 139, f)} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        ) AS x
      </T>
      <T x={25} y={100} s={11} f={C.second} o={easeOut(seg(t, 0.6, 1.0)) * (1 - f)}>
        analyzed: (1 + 2)
      </T>
      <T x={25} y={130} s={11} f={C.focus} o={easeOut(seg(t, 2.0, 2.4))}>
        optimized: 3 AS x
      </T>
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>
        no task ever adds one and two
      </T>
    </Svg>
  );
}

// 6 · Predict. The big side's four task boxes against a ten-row side: does this join shuffle?
export function PredictSmallJoin({ t, answer }: StepCtx) {
  return (
    <Svg label="join a huge table against a ten-row one. Every wide op so far has shuffled. Does this join shuffle too?" h={200}>
      <JoinSides t={t} />
      <AnswerRow y={176} label="does it shuffle?" answer={answer} value="no: tiny side copied" k={easeOut(seg(t, 1.4, 1.9))} />
    </Svg>
  );
}

// 7 · Broadcast, measured. Copies of the small side fly to each of the big side's four tasks; no Exchange bar appears.
export function RevealBroadcast({ t }: StepCtx) {
  return (
    <Svg label="measured: the physical plan picks BroadcastHashJoin. The tiny side is copied everywhere; the huge side never shuffles at all." h={200}>
      <JoinSides t={t + 1} />
      {[0, 1, 2, 3].map((i) => {
        const q = easeInOut(seg(t, 0.6 + i * 0.3, 1.3 + i * 0.3));
        return <rect key={i} x={lerp(430, 160, q)} y={lerp(30, 30 + i * 34, q)} width={40} height={26} rx={3} fill="none" stroke={C.second} strokeWidth={1.4} opacity={q > 0 ? 1 : 0} />;
      })}
      <T x={260} y={110} s={13} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))}>
        BroadcastHashJoin
      </T>
      <T x={260} y={140} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        no Exchange on the big side
      </T>
    </Svg>
  );
}

// 8 · Predict. The broadcast switch flips off; the same two sides wait: what does the planner pick now?
export function PredictDisableBroadcast({ t, answer }: StepCtx) {
  const sw = easeInOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="disable broadcasting by hand, on the exact same join shape. Does the chosen strategy change, or stay the same?" h={200}>
      <T x={25} y={36} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        broadcasting
      </T>
      <rect x={140} y={20} width={60} height={26} rx={13} fill={C.cocoa} stroke={sw > 0.5 ? C.cherryText : C.focus} strokeWidth={1.6} />
      <circle cx={lerp(187, 153, sw)} cy={33} r={9} fill={sw > 0.5 ? C.cherryText : C.focus} />
      <T x={215} y={38} s={12} f={sw > 0.5 ? C.cherryText : C.focus}>
        {sw > 0.5 ? 'off' : 'on'}
      </T>
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        same two tables, same join
      </T>
      <AnswerRow y={140} label="the strategy" answer={answer} value="a real shuffle join" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="no shortcut left: both sides move" />
    </Svg>
  );
}

// 9 · Sort-merge, measured. Exchange bars rise on both sides; the label reads SortMergeJoin, Exchange × 2.
export function RevealSortMerge({ t }: StepCtx) {
  const e = easeOut(seg(t, 0.8, 1.5));
  return (
    <Svg label="measured: with broadcasting off, the same join falls back to SortMergeJoin — a real Exchange shuffle on both sides now." h={200}>
      <JoinSides t={t + 1} />
      <rect x={212} y={24} width={12} height={140 * e} rx={2} fill={C.second} />
      <rect x={485} y={24} width={12} height={36 * e} rx={2} fill={C.second} />
      <T x={250} y={110} s={13} f={C.focus} o={easeOut(seg(t, 1.8, 2.2))}>
        SortMergeJoin
      </T>
      <T x={250} y={140} s={11} f={C.second} o={easeOut(seg(t, 2.2, 2.6))}>
        Exchange × 2, one per side
      </T>
    </Svg>
  );
}

// 10 · Recap. The four plan stages again, each with its one job under it.
export function Recap({ t }: StepCtx) {
  const st: [string, string][] = [
    ['parse', 'unresolved'],
    ['analyze', 'resolved'],
    ['optimize', 'pushdown, folding'],
    ['plan', 'a strategy, by cost'],
  ];
  return (
    <Svg label="parse, analyse, optimise, plan physically: four real stages, each one a real plan you can read with EXPLAIN FORMATTED." h={250}>
      {st.map(([a, b], i) => (
        <Row key={a} y={35 + i * 50} label={a} value={b} valueColor={i === 3 ? C.focus : C.crema} k={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} />
      ))}
      <T x={25} y={230} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        each one readable with EXPLAIN FORMATTED
      </T>
    </Svg>
  );
}
