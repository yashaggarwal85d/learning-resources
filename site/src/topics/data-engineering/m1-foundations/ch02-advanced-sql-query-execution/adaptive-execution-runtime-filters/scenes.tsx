import { Bar, C, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, big = false }: { y: number; label: string; value: string; valueColor?: string; big?: boolean }) {
  return (
    <g>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A label above a bar, with its display value below — safe for long labels. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the same query's own plan, decided twice" h={200}>
      <Row y={70} label="Initial Plan" value="SortMergeJoin" valueColor={C.cherryText} />
      <Row y={130} label="Final Plan" value="BroadcastHashJoin" valueColor={C.focus} />
    </Svg>
  );
}

export function PredictWhyReplan({ t }: StepCtx) {
  return (
    <Svg label="a choice already made, before the query even ran" h={200}>
      <Row y={70} label="plan decided at compile time" value="SortMergeJoin" />
      <Row y={130} label="plan after the query ran" value="?" />
    </Svg>
  );
}

export function RevealStageBoundaries({ t }: StepCtx) {
  return (
    <Svg label="a stage finishes; everything past it can be redecided" h={200}>
      <Row y={70} label="a stage finishes" value="real stats known" valueColor={C.focus} />
      <Row y={130} label="everything still ahead" value="can be redecided" />
    </Svg>
  );
}

export function RevealCoalescing({ t }: StepCtx) {
  return (
    <Svg label="200 configured shuffle partitions, 50 tiny groups" h={200}>
      <Row y={70} label="coalescing off" value="200 partitions kept" valueColor={C.cherryText} />
      <Row y={130} label="coalescing on" value="1 real partition" valueColor={C.focus} />
    </Svg>
  );
}

export function HowSkewDetected({ t }: StepCtx) {
  return (
    <Svg label="a partition has to clear two gates to count as skewed" h={200}>
      <Row y={70} label="size vs. the median partition" value="factor × bigger" />
      <Row y={130} label="size vs. an absolute limit" value="also bigger" valueColor={C.focus} />
    </Svg>
  );
}

export function PredictSkewSpeedup({ t }: StepCtx) {
  return (
    <Svg label="splitting changes how the work is divided, not how much there is" h={200}>
      <Row y={70} label="one oversized task" value="split in pieces" />
      <Row y={130} label="total work either way" value="unchanged" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNoCleanWin({ t }: StepCtx) {
  return (
    <Svg label="same 4 cores, no spare capacity to give the split pieces" h={440}>
      {timeBar(30, 90, 9.233 / 11.091, '9.233 s', 'skew split off', C.latte)}
      {timeBar(30, 220, 11.091 / 11.091, '11.091 s', 'skew split on, run 1', C.cherryText)}
      {timeBar(30, 350, 8.611 / 11.091, '8.611 s', 'skew split on, run 2', C.focus)}
    </Svg>
  );
}

export function PredictSwitchStrategy({ t }: StepCtx) {
  return (
    <Svg label="a join planned before its input's real size was known" h={200}>
      <Row y={70} label="dim side's real size" value="known after its stage" />
      <Row y={130} label="the join plan below it" value="?" />
    </Svg>
  );
}

export function RevealSwitchedPlan({ t }: StepCtx) {
  return (
    <Svg label="10 rows, known only once its own stage finished" h={200}>
      <Row y={70} label="Initial Plan" value="SortMergeJoin" valueColor={C.cherryText} />
      <Row y={130} label="Final Plan" value="BroadcastHashJoin" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRuntimeFilter({ t }: StepCtx) {
  return (
    <Svg label="a small side's real keys, handed to the big side's own scan" h={200}>
      <Row y={70} label="small side's keys" value="folded into one filter" />
      <Row y={130} label="big side's scan" value="skips what can't match" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDynamicPruning({ t }: StepCtx) {
  return (
    <Svg label="the same idea, at the partition level — passed sideways" h={200}>
      <Row y={70} label="real join-key values" value="passed sideways" />
      <Row y={130} label="non-matching partitions" value="skipped entirely" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPgPruning({ t }: StepCtx) {
  return (
    <Svg label="Subplans Removed: 3 of 4 — one partition instead of all four" h={370}>
      {timeBar(30, 90, 90.854 / 237.522, '90.854 ms, pruning on', 'Subplans Removed: 3', C.focus)}
      {timeBar(30, 210, 237.522 / 237.522, '237.522 ms, pruning off', 'all 4 partitions scanned', C.cherryText)}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'a stage finishing hands real numbers to replan with',
    'that coalesces, splits skew, swaps a join strategy',
    'a runtime filter does the same trick at the row level',
    'dynamic partition pruning does it at the partition level',
  ];
  return (
    <Svg label="recap: one idea, four places it shows up" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveSwitchOrNot({ t }: StepCtx) {
  return (
    <Svg label="Initial Plan: SortMergeJoin → Final Plan: BroadcastHashJoin" h={200}>
      <Row y={70} label="what changed" value="the join operator" />
      <Row y={130} label="which AQE feature?" value="?" />
    </Svg>
  );
}

export function ProveSubplansRemoved({ t }: StepCtx) {
  return (
    <Svg label="Subplans Removed: 3 of 4" h={200}>
      <Row y={70} label="Subplans Removed" value="3 of 4" />
      <Row y={130} label="planning time or execution time?" value="?" />
    </Svg>
  );
}
