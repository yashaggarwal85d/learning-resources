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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** A one-line ratio caption that rises into place under two bars. */
function Ratio({ text, k, y = 310 }: { text: string; k: number; y?: number }) {
  return (
    <T x={300} y={lerp(y + 8, y, k)} s={16} f={C.crema} a="middle" o={k}>
      {text}
    </T>
  );
}

// 1 · Hook. The full rebuild grows to ~994 ms; the incremental update lands as a sliver at ~6 ms; then the ratio.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="ten new rows, maintained two different ways" h={250}>
      {timeBar(30, 45, 6 / 994, '~6 ms', 'incremental update', C.focus, easeOut(seg(t, 2.9, 3.6)))}
      {timeBar(30, 140, 994 / 994, '~994 ms', 'full refresh', C.cherryText, easeOut(seg(t, 1.0, 2.6)))}
      <Ratio text="about 180 times cheaper" y={232} k={easeOut(seg(t, 3.8, 4.4))} />
    </Svg>
  );
}

// 2 · Predict: does a rebuild scale with the change? A big table, ten thin changed rows lighting up; then the question.
const CHANGED = [37, 81, 122, 166, 203, 249, 288, 331, 377, 412];
export function PredictFullRefreshScales({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.6));
  return (
    <Svg label="ten rows changed out of three million" h={210}>
      <Row y={40} label="rows changed" value="ten, of three million" k={easeOut(seg(t, 0.1, 0.6))} />
      <rect x={25} y={62} width={550} height={40} rx={4} fill={C.cocoa} stroke={C.mocha} opacity={k} />
      {CHANGED.map((x, i) => (
        <rect key={i} x={25 + x * 1.2} y={62} width={2} height={40} fill={C.focus} opacity={easeOut(seg(t, 0.6 + i * 0.05, 0.9 + i * 0.05))} />
      ))}
      <AnswerRow y={140} label="refresh gets cheaper" answer={answer} value="no" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="it reruns the whole defining query" f={C.cherryText} />
    </Svg>
  );
}

// 3 · What a full rebuild does. The stored result's rows are thrown away; the defining query runs and rebuilds every one.
export function RevealWhatRefreshDoes({ t }: StepCtx) {
  const gone = easeInOut(seg(t, 0.8, 1.6));
  const q = easeOut(seg(t, 1.9, 2.3));
  const arrow = easeOut(seg(t, 2.1, 2.5));
  return (
    <Svg label="old contents discarded, query reruns from scratch" h={230}>
      <Row y={40} label="old contents" value="discarded entirely" valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="defining query" value="reruns from scratch" k={easeOut(seg(t, 1.8, 2.3))} />
      <g opacity={q}>
        <rect x={25} y={130} width={150} height={60} rx={6} fill={C.cocoa} stroke={C.focus} />
        <T x={100} y={165} s={13} f={C.crema} a="middle">
          query
        </T>
      </g>
      <line x1={180} y1={160} x2={180 + 30 * arrow} y2={160} stroke={C.focus} strokeWidth={2} />
      <rect x={220} y={118} width={355} height={84} rx={6} fill="none" stroke={C.mocha} />
      {[0, 1, 2, 3, 4].map((i) => {
        const re = easeOut(seg(t, 2.5 + i * 0.3, 2.9 + i * 0.3));
        const y = 126 + i * 15;
        return (
          <g key={i}>
            <rect x={230} y={y + gone * 14} width={335} height={10} rx={2} fill={C.cherryText} opacity={(1 - gone) * 0.7} />
            <rect x={230} y={y} width={335 * re} height={10} rx={2} fill={C.focus} opacity={re > 0 ? 0.8 : 0} />
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Rebuild twice. Untouched table ~974 ms, then after ten new rows ~994 ms: within a hair of each other.
export function RevealFullRefreshFlat({ t }: StepCtx) {
  return (
    <Svg label="same refresh, before and after a tiny change" h={370}>
      {timeBar(30, 90, 974 / 994, '~974 ms', 'no change', C.crema, easeOut(seg(t, 0.5, 1.7)))}
      {timeBar(30, 210, 994 / 994, '~994 ms', 'after ten new rows', C.cherryText, easeOut(seg(t, 1.9, 3.1)))}
      <Ratio text="within about 20 ms of each other" k={easeOut(seg(t, 3.3, 3.9))} />
    </Svg>
  );
}

// 5 · Predict: how much cheaper? A stored summary where only one row is affected lights up; then the question.
export function PredictIncrementalCheaper({ t, answer }: StepCtx) {
  return (
    <Svg label="only the affected rows get touched" h={210}>
      <Row y={40} label="incremental touches" value="only affected rows" k={easeOut(seg(t, 0.1, 0.6))} />
      {Array.from({ length: 8 }, (_, i) => {
        const hit = i === 3;
        const h = easeOut(seg(t, 0.8, 1.2));
        return (
          <rect key={i} x={25 + i * 69} y={66} width={62} height={30} rx={3} fill={hit && h > 0 ? C.focus : C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.2, 0.6)) * (hit ? 1 : 1 - 0.5 * h)} />
        );
      })}
      <AnswerRow y={140} label="how much cheaper" answer={answer} value="dramatically" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="cost tracks the change, not the table" />
    </Svg>
  );
}

// 6 · Incremental result. A new order updates one summary row; the full rebuild's ~994 ms bar grows; the targeted
// update's ~6 ms lands as a sliver; then the ratio.
export function RevealIncrementalResult({ t }: StepCtx) {
  const fly = easeInOut(seg(t, 0.3, 1.0));
  return (
    <Svg label="same ten-row change, maintained incrementally" h={390}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + i * 69} y={20} width={62} height={22} rx={3} fill={i === 3 ? C.focus : C.cocoa} stroke={C.mocha} opacity={i === 3 ? 0.5 + 0.5 * seg(t, 1.0, 1.2) : 0.6} />
      ))}
      <circle cx={232} cy={lerp(-6, 31, fly)} r={5} fill={C.crema} opacity={fly > 0 && fly < 1 ? 1 : 0} />
      {timeBar(30, 120, 6 / 994, '~6 ms', 'incremental update', C.focus, easeOut(seg(t, 2.6, 3.2)))}
      {timeBar(30, 240, 994 / 994, '~994 ms', 'full refresh', C.cherryText, easeOut(seg(t, 1.4, 2.4)))}
      <Ratio text="about 180 times cheaper" y={340} k={easeOut(seg(t, 3.5, 4.1))} />
    </Svg>
  );
}

// 7 · Predict: a non-blocking way? A plain rebuild runs; a reader waits at its edge; then the question.
export function PredictConcurrentExists({ t, answer }: StepCtx) {
  const r = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="a plain refresh locks out readers" h={210}>
      <Row y={40} label="plain refresh" value="blocks concurrent reads" k={easeOut(seg(t, 0.1, 0.6))} />
      <rect x={25} y={70} width={430} height={22} rx={3} fill="none" stroke={C.mocha} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={25} y={70} width={430 * r} height={22} rx={3} fill={C.cherryText} opacity={0.7} />
      <line x1={470} y1={62} x2={470} y2={100} stroke={C.cherryText} strokeWidth={3} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <circle cx={lerp(575, 495, easeOut(seg(t, 0.8, 1.3)))} cy={81} r={7} fill={C.crema} opacity={easeOut(seg(t, 0.8, 1.0))} />
      <AnswerRow y={140} label="non-blocking way" answer={answer} value="yes, concurrent mode" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a rebuild and reads can run side by side" />
    </Svg>
  );
}

// 8 · A read during each kind of rebuild. During a plain refresh it waits ~861 ms, the bar crawling across;
// during a concurrent one it is back in ~5 ms.
export function RevealConcurrentlyResult({ t }: StepCtx) {
  return (
    <Svg label="a reader, during two different kinds of refresh" h={370}>
      {timeBar(30, 90, 5 / 861, '~5 ms', 'during CONCURRENTLY', C.focus, easeOut(seg(t, 3.3, 3.8)))}
      {timeBar(30, 210, 861 / 861, '~861 ms', 'during a plain refresh', C.cherryText, seg(t, 0.6, 2.8))}
    </Svg>
  );
}

// 9 · The requirement. Every stored row gets its own unique key, one by one; with every row covered, the concurrent
// mode unlocks.
export function RevealConcurrentlyRequirement({ t }: StepCtx) {
  const un = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="what CONCURRENTLY requires" h={240}>
      <Row y={40} label="required" value="a UNIQUE index, every row" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="not allowed" value="expression index, WHERE clause" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      {Array.from({ length: 6 }, (_, i) => {
        const key = easeOutBack(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15));
        const x = 25 + i * 92;
        return (
          <g key={i}>
            <rect x={x} y={118} width={84} height={28} rx={3} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.3, 0.6))} />
            <line x1={x + 42} y1={146} x2={x + 42} y2={146 + 10 * key} stroke={C.focus} strokeWidth={2} />
            <circle cx={x + 42} cy={162} r={6 * key} fill="none" stroke={C.focus} strokeWidth={2} />
          </g>
        );
      })}
      <T x={300} y={lerp(222, 214, un)} s={15} f={C.focus} a="middle" o={un}>
        CONCURRENTLY now available
      </T>
    </Svg>
  );
}

// 10 · Predict: a float SUM. Values flow into a running total; then the question.
export function PredictFloatSum({ t, answer }: StepCtx) {
  return (
    <Svg label="SUM over a floating-point column" h={210}>
      <Row y={40} label="aggregate" value="SUM(float column)" k={easeOut(seg(t, 0.1, 0.6))} />
      {[0, 1, 2, 3, 4].map((i) => {
        const m = easeInOut(seg(t, 0.4 + i * 0.15, 0.9 + i * 0.15));
        return <circle key={i} cx={lerp(45 + i * 60, 500, m)} cy={82} r={6} fill={C.latte} opacity={1 - m * 0.9} />;
      })}
      <rect x={470} y={64} width={105} height={36} rx={5} fill="none" stroke={C.focus} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={522} y={88} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        Σ
      </T>
      <AnswerRow y={140} label="still incremental" answer={answer} value="not reliably" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a float total can drift with addition order" f={C.cherryText} />
    </Svg>
  );
}

// 11 · Why, and the fix. On a float column the grouping of the same additions can change the total; that forces a
// full rebuild; on a fixed-precision type the two groupings agree.
export function RevealFloatFix({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.0));
  const b = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="floating-point sums can force a full recompute" h={240}>
      <Row y={40} label="SUM / AVG on float" value="can force full recompute" valueColor={C.cherryText} k={easeOut(seg(t, 1.7, 2.2))} />
      <Row y={85} label="cast to a fixed type" value="keeps it incremental" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <T x={300} y={lerp(158, 150, a)} s={15} f={C.cherryText} a="middle" o={a}>
        float: (a + b) + c ≠ a + (b + c)
      </T>
      <T x={300} y={lerp(208, 200, b)} s={15} f={C.focus} a="middle" o={b}>
        numeric: (a + b) + c = a + (b + c)
      </T>
    </Svg>
  );
}

// 12 · Chosen by cost. For each stored table or view, the two strategies' estimated costs grow side by side;
// the cheaper one gets the tick and runs.
export function RevealWarehouseChoosesByCost({ t }: StepCtx) {
  const c = easeOut(seg(t, 1.5, 2.6));
  const pick = easeOut(seg(t, 3.2, 3.8));
  const opts: [string, number][] = [
    ['incremental', 0.35],
    ['full rebuild', 0.9],
  ];
  return (
    <Svg label="chosen automatically, by estimated cost" h={250}>
      <Row y={40} label="dynamic tables" value="incremental or full" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="materialized views" value="incremental or full" k={easeOut(seg(t, 0.5, 1.0))} />
      {opts.map(([l, w], i) => {
        const y = 135 + i * 55;
        const win = i === 0;
        return (
          <g key={l} opacity={easeOut(seg(t, 1.2, 1.6)) * (win ? 1 : 1 - 0.6 * pick)}>
            <T x={25} y={y} s={13} f={C.latte}>
              {l}
            </T>
            <rect x={25} y={y + 10} width={470 * w * c} height={14} rx={3} fill={win && pick > 0 ? C.focus : C.mocha} />
          </g>
        );
      })}
      <Tick y={150} k={pick} />
    </Svg>
  );
}

// 13 · A target, not a guarantee. Staleness climbs and resets at each refresh, staying under the target line, until one
// slow refresh lets it climb past it.
const LAG = 'M25 195 L105 155 L105 195 L185 155 L185 195 L265 155 L265 195 L455 100 L455 195 L535 155 L535 195 L575 175';
export function RevealStalenessTargetNotGuarantee({ t }: StepCtx) {
  const p = seg(t, 1.0, 3.8);
  const tl = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="a target the engine tries to keep" h={210}>
      <defs>
        <clipPath id="mv-over">
          <rect x={0} y={0} width={600} height={135} />
        </clipPath>
      </defs>
      <Row y={40} label="target lag" value="a goal, not a promise" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="a slow refresh" value="can exceed it" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <line x1={25} y1={195} x2={575} y2={195} stroke={C.mocha} />
      <line x1={25} y1={135} x2={25 + 550 * tl} y2={135} stroke={C.focus} strokeWidth={2} strokeDasharray="6 5" />
      <path d={LAG} pathLength={1} fill="none" stroke={C.latte} strokeWidth={2} strokeDasharray="1" strokeDashoffset={1 - p} />
      <path d={LAG} pathLength={1} fill="none" stroke={C.cherryText} strokeWidth={3} strokeDasharray="1" strokeDashoffset={1 - p} clipPath="url(#mv-over)" />
    </Svg>
  );
}

// 14 · Recap. Four lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'a full refresh costs the same, however little changed',
    'incremental maintenance tracks the change itself',
    'CONCURRENTLY trades a UNIQUE index for unblocked reads',
    'a staleness bound is a target, not a guarantee',
  ];
  return (
    <Svg label="recap: four separate tradeoffs" h={240}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.0, 0.7 + i * 1.0));
        return (
          <T key={l} x={300} y={55 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 15 · Prove: does the read wait? A concurrent rebuild runs; after the answer the read passes straight through and the
// verdict lands with a tick.
export function ProveConcurrentSelectBlocks({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const go = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const r = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="a SELECT lands mid-refresh, which is running CONCURRENTLY" h={230}>
      <Row y={40} label="refresh mode" value="CONCURRENTLY" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={90} label="SELECT has to wait" answer={answer} value="no, never blocked" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={120} width={550} height={22} rx={3} fill="none" stroke={C.mocha} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <rect x={25} y={120} width={330 * r} height={22} rx={3} fill={C.focus} opacity={0.4} />
      <circle cx={lerp(25, 575, go)} cy={131} r={7} fill={C.crema} opacity={easeOut(seg(t, 0.6, 0.9)) * (go < 1 ? 1 : 0)} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={16} f={C.focus} a="middle" o={k}>
            the read is back in ~5 ms
          </T>
          <rect x={170} y={202} width={260 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
