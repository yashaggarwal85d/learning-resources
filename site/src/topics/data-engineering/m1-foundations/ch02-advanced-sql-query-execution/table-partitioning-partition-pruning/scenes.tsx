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

/** A row of n partition cells; `fill(i)` picks each cell's colour and `o(i)` its opacity. */
function Parts({ y, n, fill, o, h = 22 }: { y: number; n: number; fill: (i: number) => string; o?: (i: number) => number; h?: number }) {
  const w = 550 / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * w} y={y} width={w - 2} height={h} rx={2} fill={fill(i)} opacity={o ? o(i) : 1} />
      ))}
    </g>
  );
}

// 1 · Hook. With pruning, 5 buffers is a sliver; without, 300 grows across.
export function Hook({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="same query, same data, same filter — pruning on vs. off" h={210}>
      {timeBar(30, 45, 5 / 300, '5 buffers', 'pruning on', C.focus, k(0))}
      {timeBar(30, 140, 300 / 300, '300 buffers', 'pruning off', C.cherryText, k(1))}
    </Svg>
  );
}

// 2 · Predict: why scan them all. After the answer the "?" fills in and the verdict slides in.
export function PredictWhyScanAll({ t, answer }: StepCtx) {
  return (
    <Svg label="the filter is a literal, known before anything runs" h={210}>
      <Row y={70} label="filter value" value="a literal, known upfront" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="partitions it can't match" answer={answer} value="never scanned" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="once pruning is on, they're left out of the plan" />
    </Svg>
  );
}

// 3 · Partition types. Three small panels: a range cut into intervals, a list of values grouped, a hash's numbered buckets.
export function RevealPartitionTypes({ t }: StepCtx) {
  const p = (i: number) => easeOut(seg(t, 1.2 + i * 0.8, 1.6 + i * 0.8));
  const cut = easeInOut(seg(t, 1.5, 2.1));
  return (
    <Svg label="three boundary shapes, three predicate shapes" h={210}>
      <Row y={40} label="range" value="an ordered interval" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="list / hash" value="values / a bucket number" k={easeOut(seg(t, 0.6, 1.1))} />
      <g opacity={p(0)}>
        <rect x={25} y={110} width={170} height={84} rx={6} fill="none" stroke={C.mocha} />
        <T x={37} y={130} s={12} f={C.taupe}>
          range
        </T>
        <line x1={40} y1={165} x2={180} y2={165} stroke={C.latte} strokeWidth={2} />
        {[40, 87, 134, 180].map((x, i) => (
          <line key={i} x1={x} y1={165 - 10 * cut} x2={x} y2={165 + 10 * cut} stroke={C.focus} strokeWidth={2} />
        ))}
      </g>
      <g opacity={p(1)}>
        <rect x={215} y={110} width={170} height={84} rx={6} fill="none" stroke={C.mocha} />
        <T x={227} y={130} s={12} f={C.taupe}>
          list
        </T>
        {['a', 'b', 'c'].map((v, i) => (
          <g key={v}>
            <rect x={227 + i * 52} y={152} width={46} height={24} rx={4} fill={C.cocoa} stroke={C.focus} />
            <T x={250 + i * 52} y={169} s={11} f={C.crema} a="middle">
              {v}
            </T>
          </g>
        ))}
      </g>
      <g opacity={p(2)}>
        <rect x={405} y={110} width={170} height={84} rx={6} fill="none" stroke={C.mocha} />
        <T x={417} y={130} s={12} f={C.taupe}>
          hash
        </T>
        {[0, 1, 2, 3].map((b) => (
          <g key={b}>
            <rect x={417 + b * 38} y={152} width={32} height={24} rx={4} fill={C.cocoa} stroke={C.focus} />
            <T x={433 + b * 38} y={169} s={11} f={C.crema} a="middle">
              {b}
            </T>
          </g>
        ))}
      </g>
    </Svg>
  );
}

// 4 · Plan-time pruning. With pruning, 5 buffers is a sliver; without, 300 grows across.
export function RevealPlanTimePruning({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="proven before any scan starts" h={370}>
      {timeBar(30, 90, 5 / 300, '5 buffers, 0.146 ms', 'pruning on', C.focus, k(0))}
      {timeBar(30, 210, 300 / 300, '300 buffers, 3.633 ms', 'pruning off', C.cherryText, k(1))}
    </Svg>
  );
}

// 5 · Predict: a run-time value. After the answer the "?" fills in and the verdict slides in.
export function PredictRuntimeValue({ t, answer }: StepCtx) {
  return (
    <Svg label="a parameter, not a literal — not known until execution" h={210}>
      <Row y={70} label="value known at" value="execution, not planning" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="pruning still possible" answer={answer} value="yes, at run time" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="checked the moment the value is known" />
    </Svg>
  );
}

// 6 · Run-time pruning. All sixty partitions sit in the plan; once execution begins, fifty-nine grey out as the
// removed count climbs, leaving one.
export function RevealRuntimePruning({ t }: StepCtx) {
  const r = seg(t, 1.2, 3.0) * 59;
  const order = (i: number) => (i < 41 ? i : i - 1);
  return (
    <Svg label="EXPLAIN reports it directly" h={190}>
      <Row y={40} label="Subplans Removed" value={num(Math.min(59, r))} valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="pruned when" value="once execution began" k={easeOut(seg(t, 3.0, 3.5))} />
      <Parts y={120} n={60} fill={(i) => (i === 41 ? C.focus : C.mocha)} o={(i) => (i === 41 ? 1 : order(i) < r ? 0.2 : 0.9)} h={30} />
    </Svg>
  );
}

// 7 · Two signals. Left, plan-time: three partitions vanish from the plan entirely. Right, run-time: they stay listed,
// struck through as removed subplans.
export function RevealTwoSignals({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.8, 1.2));
  const gone = easeInOut(seg(t, 1.4, 2.0));
  const strike = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="two moments, two different signals in EXPLAIN" h={210}>
      <Row y={40} label="plan-time pruning" value="missing from the plan" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="run-time pruning" value="Subplans Removed" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <g opacity={g}>
        <rect x={25} y={110} width={265} height={90} rx={6} fill="none" stroke={C.mocha} />
        {[0, 1, 2, 3].map((i) => {
          const keep = i === 2;
          const w = keep ? 60 : 60 * (1 - gone);
          const x = keep ? lerp(37 + i * 62, 37, gone) : 37 + i * 62;
          return w > 0.5 ? <rect key={i} x={x} y={140} width={w} height={30} rx={3} fill={keep ? C.focus : C.cocoa} stroke={C.mocha} /> : null;
        })}
        <rect x={310} y={110} width={265} height={90} rx={6} fill="none" stroke={C.mocha} />
        {[0, 1, 2, 3].map((i) => {
          const keep = i === 2;
          return (
            <g key={i}>
              <rect x={322 + i * 62} y={140} width={60} height={30} rx={3} fill={keep && strike > 0 ? C.focus : C.cocoa} stroke={C.mocha} opacity={keep ? 1 : 1 - 0.5 * strike} />
              {!keep && <line x1={322 + i * 62} y1={155} x2={322 + i * 62 + 60 * strike} y2={155} stroke={C.cherryText} strokeWidth={2} />}
            </g>
          );
        })}
      </g>
    </Svg>
  );
}

// 8 · Predict: partitions still cost. After the answer the "?" fills in and the verdict slides in.
export function PredictPartitionCost({ t, answer }: StepCtx) {
  return (
    <Svg label="no filter at all — every partition genuinely needed" h={210}>
      <Row y={70} label="partitions needed" value="all of them" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="still a cost here" answer={answer} value="yes, planning" f={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="every partition adds planning work" />
    </Svg>
  );
}

// 9 · Partition overhead. Sixty partitions' planning grows across; the unpartitioned table's is a sliver.
export function RevealPartitionOverhead({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="same data, more partitions to plan around" h={370}>
      {timeBar(30, 90, 3.875 / 3.875, '3.875 ms, 791 buffers', '60 partitions', C.cherryText, k(0))}
      {timeBar(30, 210, 0.107 / 3.875, '0.107 ms, 4 buffers', 'unpartitioned', C.focus, k(1))}
    </Svg>
  );
}

// 10 · Predict: DROP or DELETE. After the answer each "?" resolves and the verdict slides in.
export function PredictDropVsDelete({ t, answer }: StepCtx) {
  const a = answer !== null;
  return (
    <Svg label="remove a year of old data — two ways to do it" h={210}>
      <Row y={70} label="DROP the partition" value={a ? 'one object, instantly' : 'one object, instantly — ?'} valueColor={a ? C.focus : C.crema} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="DELETE the rows" value={a ? 'a bulk operation' : 'a bulk operation — ?'} valueColor={a ? C.cherryText : C.crema} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="dropping the partition is far faster" />
    </Svg>
  );
}

// 11 · DROP vs DELETE. DROP is a short bar; DELETE grows across.
export function RevealDropVsDelete({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="1,000,000 rows, two ways to remove them" h={370}>
      {timeBar(30, 90, 15.44 / 584.947, '15.440 ms', 'DROP TABLE', C.focus, k(0))}
      {timeBar(30, 210, 584.947 / 584.947, '584.947 ms', 'DELETE', C.cherryText, k(1))}
    </Svg>
  );
}

// 12 · One key, two jobs. Twelve monthly partitions: a query's filter lights one; then retention drops the oldest three whole.
export function RevealKeyChoice({ t }: StepCtx) {
  const cells = easeOut(seg(t, 0.4, 0.8));
  const q = t >= 1.2;
  const drop = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="one key, two jobs" h={200}>
      <Row y={40} label="partition key prunes" value="queries, by predicate" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="same key drops" value="old data, by retention" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      {Array.from({ length: 12 }, (_, i) => {
        const old = i < 3;
        return (
          <rect
            key={i}
            x={25 + i * 45.8}
            y={125 + (old ? 30 * drop : 0)}
            width={42}
            height={30}
            rx={3}
            fill={q && i === 8 ? C.focus : C.cocoa}
            stroke={old && drop > 0 ? C.cherryText : C.mocha}
            opacity={cells * (old ? 1 - drop : 1)}
          />
        );
      })}
      {q && <path d={`M${25 + 8 * 45.8 + 21 - 6} ${112 - 4 * easeOut(seg(t, 1.2, 1.6))} l6 8 l6 -8 z`} fill={C.focus} />}
    </Svg>
  );
}

// 13 · Clustering contrast. Left: separate partition objects with gaps between them. Right: one table whose storage
// blocks sort themselves into order, shade by shade.
export function RevealClusteringContrast({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.6, 1.1));
  const r = easeOut(seg(t, 2.0, 2.4));
  const sort = easeInOut(seg(t, 2.4, 3.4));
  const shades = [5, 1, 7, 3, 0, 6, 2, 4];
  return (
    <Svg label="physical objects vs. sorted storage blocks" h={200}>
      <Row y={40} label="partitioning" value="separate physical objects" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="warehouse clustering" value="sorted storage blocks" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 66} y={125} width={56} height={40} rx={4} fill={C.cocoa} stroke={C.latte} opacity={l} />
      ))}
      <rect x={310} y={125} width={265} height={40} rx={4} fill="none" stroke={C.latte} opacity={r} />
      {shades.map((v, i) => {
        const pos = lerp(i, v, sort);
        return <rect key={i} x={316 + pos * 32} y={131} width={29} height={28} rx={2} fill={C.focus} opacity={r * (0.2 + v * 0.1)} />;
      })}
    </Svg>
  );
}

// 14 · Recap. Five lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'match the partitioning method to the predicate',
    'plan-time pruning proves exclusions early',
    'run-time pruning proves them once a value is known',
    'more partitions cost real planning time',
    'DROP a partition beats deleting its rows',
  ];
  return (
    <Svg label="recap: what partitioning actually buys" h={280}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.55, 0.7 + i * 0.55));
        return (
          <T key={l} x={300} y={50 + i * 40 + (1 - k) * 8} s={13} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 15 · Prove: how many scanned. Twenty-four partitions; after the answer twenty-three grey out and the verdict lands with a tick.
export function ProvePartitionCount({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const pr = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="24 partitions, one literal match — how many scanned?" h={230}>
      <Row y={50} label="total partitions" value="24" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={100} label="matches the filter" value="1 — rest pruned" valueColor={C.focus} k={easeOut(seg(t, 0.4, 0.9))} />
      <Parts y={122} n={24} fill={(i) => (i === 9 && pr > 0 ? C.focus : C.mocha)} o={(i) => (i === 9 ? 1 : 1 - 0.75 * pr) * easeOut(seg(t, 0.6, 1.0))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(200, 190, k)} s={16} f={C.focus} a="middle" o={k}>
            1 scanned, 23 pruned at plan time
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
