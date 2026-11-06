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
function AnswerRow({ y, label, answer, value, k }: { y: number; label: string; answer: number | null; value: string; k: number }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? C.focus : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={C.focus} />}
    </g>
  );
}

// 1 · Hook. The initial plan, then the final one; under them a run line where the stage finishing is what
// triggers the replan.
export function Hook({ t }: StepCtx) {
  const line = easeInOut(seg(t, 1.6, 2.2));
  const dot = easeInOut(seg(t, 2.2, 3.6));
  const marks: [number, string][] = [
    [60, 'planned'],
    [300, 'stage done'],
    [535, 'replanned'],
  ];
  return (
    <Svg label="the same query's own plan, decided twice" h={220}>
      <Row y={60} label="Initial Plan" value="SortMergeJoin" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={115} label="Final Plan" value="BroadcastHashJoin" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.7))} />
      <line x1={60} y1={170} x2={60 + 475 * line} y2={170} stroke={C.mocha} strokeWidth={2} />
      {marks.map(([x, l], i) => (
        <g key={l} opacity={line}>
          <circle cx={x} cy={170} r={4} fill={dot * 475 + 60 >= x ? C.focus : C.mocha} />
          <T x={x} y={196} s={12} f={i === 2 ? C.focus : C.latte} a="middle">
            {l}
          </T>
        </g>
      ))}
      {dot > 0 && <circle cx={60 + 475 * dot} cy={170} r={7} fill={C.focus} />}
    </Svg>
  );
}

// 2 · Predict: why replan. After the answer the "?" becomes the answer and the verdict slides in.
export function PredictWhyReplan({ t, answer }: StepCtx) {
  return (
    <Svg label="a choice already made, before the query even ran" h={210}>
      <Row y={70} label="plan decided at compile time" value="SortMergeJoin" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="plan after the query ran" answer={answer} value="redecided" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="a real number arrived that wasn't knowable before" />
    </Svg>
  );
}

// 3 · Stage boundaries. Three stages split by shuffles; the first fills as it runs and turns solid with real
// stats; the dashed stages after it firm up as they get redecided.
export function RevealStageBoundaries({ t }: StepCtx) {
  const st = easeOut(seg(t, 0.4, 0.8));
  const run = easeInOut(seg(t, 0.8, 2.0));
  const firm = easeInOut(seg(t, 2.6, 3.4));
  const xs: [number, number][] = [
    [25, 160],
    [215, 160],
    [405, 170],
  ];
  return (
    <Svg label="a stage finishes; everything past it can be redecided" h={200}>
      <Row y={40} label="a stage finishes" value="real stats known" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={90} label="everything still ahead" value="can be redecided" k={easeOut(seg(t, 2.4, 2.9))} />
      {xs.map(([x, w], i) => (
        <g key={i} opacity={st}>
          {i === 0 && <rect x={x} y={120} width={w * run} height={40} rx={6} fill={C.focus} opacity={0.3} />}
          <rect
            x={x}
            y={120}
            width={w}
            height={40}
            rx={6}
            fill="none"
            stroke={i === 0 ? (run >= 1 ? C.focus : C.latte) : firm > 0 ? C.focus : C.mocha}
            strokeWidth={i === 0 && run >= 1 ? 2 : 1.5}
            strokeDasharray={i > 0 && firm < 1 ? '5 4' : undefined}
          />
          <T x={x + w / 2} y={145} s={13} f={C.latte} a="middle">
            stage {i + 1}
          </T>
          {i < 2 && <line x1={x + w + 8} y1={140} x2={x + w + 22} y2={140} stroke={C.latte} strokeWidth={2} />}
        </g>
      ))}
      <T x={300} y={185} s={12} f={C.taupe} a="middle" o={st}>
        shuffles split the stages
      </T>
    </Svg>
  );
}

// 4 · Coalescing. Two hundred configured partitions draw in as a row of slivers; with coalescing on, one block takes their place.
export function RevealCoalescing({ t }: StepCtx) {
  const n = Math.round(200 * easeInOut(seg(t, 0.5, 1.5)));
  const one = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="200 configured shuffle partitions, 50 tiny groups" h={190}>
      <Row y={40} label="coalescing off" value="200 partitions kept" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * 2.75} y={54} width={1.6} height={22} fill={C.cherryText} opacity={0.75} />
      ))}
      <Row y={125} label="coalescing on" value="1 real partition" valueColor={C.focus} k={easeOut(seg(t, 1.7, 2.2))} />
      <rect x={25} y={139} width={548 * one} height={22} rx={3} fill={C.focus} opacity={0.85} />
    </Svg>
  );
}

const SIZES = [30, 26, 34, 28, 150, 32, 24, 30];
// 5 · Skew detection. Partition sizes grow as bars; a median line, then the factor gate and the absolute gate
// draw across; only the tall bar clears both and turns red.
export function HowSkewDetected({ t }: StepCtx) {
  const base = 240;
  const med = easeInOut(seg(t, 1.4, 1.9));
  const fac = easeInOut(seg(t, 1.9, 2.4));
  const abs = easeInOut(seg(t, 2.8, 3.3));
  const red = t >= 3.4;
  return (
    <Svg label="a partition has to clear two gates to count as skewed" h={255}>
      <Row y={40} label="size vs. the median partition" value="factor × bigger" k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={85} label="size vs. an absolute limit" value="also bigger" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {SIZES.map((h, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.1, 0.8 + i * 0.1));
        return <rect key={i} x={50 + i * 58} y={base - h * k} width={40} height={h * k} rx={2} fill={i === 4 && red ? C.cherryText : C.crema} opacity={0.85} />;
      })}
      <line x1={40} y1={base - 29} x2={40 + 470 * med} y2={base - 29} stroke={C.latte} strokeDasharray="3 3" />
      <line x1={40} y1={base - 120} x2={40 + 470 * fac} y2={base - 120} stroke={C.focus} strokeWidth={1.5} />
      <line x1={40} y1={base - 100} x2={40 + 470 * abs} y2={base - 100} stroke={C.second} strokeWidth={1.5} />
      <T x={575} y={base - 116} s={11} f={C.focus} a="end" o={fac}>
        × median
      </T>
      <T x={575} y={base - 96} s={11} f={C.second} a="end" o={abs}>
        limit
      </T>
      <T x={575} y={base - 25} s={11} f={C.latte} a="end" o={med}>
        median
      </T>
    </Svg>
  );
}

// 6 · Predict: does splitting help? One long task bar splits into four; after the answer the verdict slides in.
export function PredictSkewSpeedup({ t, answer }: StepCtx) {
  const sp = easeInOut(seg(t, 0.8, 1.5));
  return (
    <Svg label="splitting changes how the work is divided, not how much there is" h={220}>
      <Row y={50} label="one oversized task" value="split in pieces" k={easeOut(seg(t, 0.1, 0.6))} />
      {[0, 1, 2, 3].map((i) => {
        const g = 10 * sp;
        const w = (550 - 3 * g) / 4;
        return <rect key={i} x={25 + i * (w + g)} y={64} width={w} height={12} rx={2} fill={C.cherryText} opacity={0.85} />;
      })}
      <Row y={140} label="total work either way" value="unchanged" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="only with spare cores to run the pieces" y={190} />
    </Svg>
  );
}

// 7 · No clean win. The three runs' bars grow in turn and land in no consistent order.
export function RevealNoCleanWin({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.0, 1.1 + i * 1.0));
  return (
    <Svg label="same 4 cores, no spare capacity to give the split pieces" h={440}>
      {timeBar(30, 90, 9.233 / 11.091, '9.233 s', 'skew split off', C.latte, k(0))}
      {timeBar(30, 220, 11.091 / 11.091, '11.091 s', 'skew split on, run 1', C.cherryText, k(1))}
      {timeBar(30, 350, 8.611 / 11.091, '8.611 s', 'skew split on, run 2', C.focus, k(2))}
    </Svg>
  );
}

// 8 · Predict: switch strategy. After the answer the "?" becomes the answer and the verdict slides in.
export function PredictSwitchStrategy({ t, answer }: StepCtx) {
  return (
    <Svg label="a join planned before its input's real size was known" h={210}>
      <Row y={70} label="dim side's real size" value="known after its stage" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="the join plan below it" answer={answer} value="can still change" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="rewritten once the real size arrives" />
    </Svg>
  );
}

// 9 · The switched plan. The initial join fades back as the dimension side's real row count counts down to 10;
// then the final join lands.
export function RevealSwitchedPlan({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const dim = easeInOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="10 rows, known only once its own stage finished" h={210}>
      <Row y={60} label="Initial Plan" value="SortMergeJoin" valueColor={C.cherryText} k={a * (1 - 0.6 * dim)} />
      <T x={300} y={110} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.2))}>
        dim side after its stage: 10 rows
      </T>
      <Row y={165} label="Final Plan" value="BroadcastHashJoin" valueColor={C.focus} big k={easeOut(seg(t, 2.4, 2.9))} />
      <rect x={575 - 230 * easeOut(seg(t, 3.0, 3.5))} y={178} width={230 * easeOut(seg(t, 3.0, 3.5))} height={3} fill={C.focus} />
    </Svg>
  );
}

const KEYS = [3, 7, 9];
const SCAN = [1, 3, 4, 7, 2, 9, 5, 3, 8, 6, 7, 0];
// 10 · Runtime filter. The small side's keys fold into one filter box; the big side's scan then runs past it,
// and every row the filter rules out drops away before the join.
export function RevealRuntimeFilter({ t }: StepCtx) {
  const fold = easeInOut(seg(t, 0.8, 1.6));
  const box = easeOut(seg(t, 1.3, 1.7));
  const scan = seg(t, 2.2, 3.8) * SCAN.length;
  return (
    <Svg label="a small side's real keys, handed to the big side's own scan" h={230}>
      <Row y={40} label="small side's keys" value="folded into one filter" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="big side's scan" value="skips what can't match" valueColor={C.focus} k={easeOut(seg(t, 1.9, 2.4))} />
      {KEYS.map((v, i) => (
        <g key={i} opacity={(1 - fold) * easeOut(seg(t, 0.3, 0.7))}>
          <rect x={lerp(25 + i * 46, 225, fold)} y={110} width={38} height={24} rx={3} fill={C.cocoa} stroke={C.focus} />
          {fold === 0 && (
            <T x={44 + i * 46} y={127} s={13} f={C.focus} a="middle">
              {v}
            </T>
          )}
        </g>
      ))}
      <g opacity={box}>
        <rect x={220} y={108} width={160} height={28} rx={6} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
        <T x={300} y={127} s={13} f={C.focus} a="middle">
          filter: 3, 7, 9
        </T>
      </g>
      {SCAN.map((v, i) => {
        const seen = scan > i + 0.5;
        const hit = KEYS.includes(v);
        const drop = seen && !hit ? easeOut(clamp(scan - i - 0.5)) : 0;
        return (
          <g key={i} opacity={easeOut(seg(t, 1.8, 2.2)) * (1 - 0.7 * drop)} transform={`translate(0 ${(drop * 10).toFixed(2)})`}>
            <rect x={25 + i * 46} y={168} width={38} height={24} rx={3} fill={C.cocoa} stroke={seen && hit ? C.focus : C.mocha} strokeWidth={seen && hit ? 2 : 1} />
            <T x={44 + i * 46} y={185} s={13} f={seen && hit ? C.focus : C.latte} a="middle">
              {v}
            </T>
          </g>
        );
      })}
      {scan > 0 && scan < SCAN.length && <rect x={25 + Math.min(scan, SCAN.length - 0.01) * 46} y={162} width={2} height={36} fill={C.focus} />}
    </Svg>
  );
}

// 11 · Dynamic partition pruning. The join side's real key values travel sideways to the other scan; three
// partitions that can't match grey out, and one stays lit.
export function RevealDynamicPruning({ t }: StepCtx) {
  const parts = easeOut(seg(t, 0.4, 0.9));
  const pass = easeInOut(seg(t, 1.4, 2.2));
  const prune = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="the same idea, at the partition level — passed sideways" h={240}>
      <Row y={40} label="real join-key values" value="passed sideways" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="non-matching partitions" value="skipped entirely" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <g opacity={parts}>
        <rect x={25} y={150} width={120} height={40} rx={6} fill={C.cocoa} stroke={C.focus} />
        <T x={85} y={175} s={13} f={C.focus} a="middle">
          join side
        </T>
      </g>
      <line x1={145} y1={170} x2={145 + 55 * pass} y2={170} stroke={C.focus} strokeWidth={2} />
      {pass > 0 && <path d={`M${145 + 55 * pass} 164 l8 6 l-8 6 z`} fill={C.focus} />}
      {[0, 1, 2, 3].map((i) => {
        const keep = i === 1;
        return (
          <g key={i} opacity={parts * (keep ? 1 : 1 - 0.65 * prune)}>
            <rect x={215 + i * 90} y={140} width={80} height={60} rx={6} fill={C.cocoa} stroke={keep && prune > 0 ? C.focus : C.mocha} strokeWidth={keep && prune > 0 ? 2 : 1} />
            <T x={255 + i * 90} y={175} s={13} f={keep && prune > 0 ? C.focus : C.latte} a="middle">
              p{i + 1}
            </T>
            {!keep && <line x1={225 + i * 90} y1={190} x2={225 + i * 90 + 60 * prune} y2={150 + 40 * (1 - prune)} stroke={C.cherryText} strokeWidth={2} opacity={prune > 0 ? 1 : 0} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 12 · Postgres pruning. The pruned run's bar stops at well under half; the unpruned one grows across.
export function RevealPgPruning({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="Subplans Removed: 3 of 4 — one partition instead of all four" h={370}>
      {timeBar(30, 90, 90.854 / 237.522, '90.854 ms, pruning on', 'Subplans Removed: 3', C.focus, k(0))}
      {timeBar(30, 210, 237.522 / 237.522, '237.522 ms, pruning off', 'all 4 partitions scanned', C.cherryText, k(1))}
    </Svg>
  );
}

// 13 · Recap. Four lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'a stage finishing hands real numbers to replan with',
    'that coalesces, splits skew, swaps a join strategy',
    'a runtime filter does the same trick at the row level',
    'dynamic partition pruning does it at the partition level',
  ];
  return (
    <Svg label="recap: one idea, four places it shows up" h={240}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.7 + i * 0.7));
        return (
          <T key={l} x={300} y={55 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 14 · Prove: which feature. After the answer the "?" becomes the answer, underlined.
export function ProveSwitchOrNot({ t, answer }: StepCtx) {
  return (
    <Svg label="Initial Plan: SortMergeJoin → Final Plan: BroadcastHashJoin" h={200}>
      <Row y={70} label="what changed" value="the join operator" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="which AQE feature?" answer={answer} value="join strategy switch" k={easeOut(seg(t, 0.5, 1.0))} />
    </Svg>
  );
}

// 15 · Prove: when. After the answer the "?" becomes the answer, underlined.
export function ProveSubplansRemoved({ t, answer }: StepCtx) {
  return (
    <Svg label="Subplans Removed: 3 of 4" h={200}>
      <Row y={70} label="Subplans Removed" value="3 of 4" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="planning time or execution time?" answer={answer} value="execution" k={easeOut(seg(t, 0.5, 1.0))} />
    </Svg>
  );
}
