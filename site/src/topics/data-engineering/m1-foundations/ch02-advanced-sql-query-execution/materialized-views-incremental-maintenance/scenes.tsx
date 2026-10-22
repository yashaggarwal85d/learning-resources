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
    <Svg label="ten new rows, maintained two different ways" h={370}>
      {timeBar(30, 90, 6 / 994, '~6 ms', 'incremental update', C.focus)}
      {timeBar(30, 210, 994 / 994, '~994 ms', 'full refresh', C.cherryText)}
    </Svg>
  );
}

export function PredictFullRefreshScales({ t }: StepCtx) {
  return (
    <Svg label="ten rows changed out of three million" h={200}>
      <Row y={70} label="rows changed" value="ten, of three million" />
      <Row y={130} label="refresh gets cheaper" value="?" />
    </Svg>
  );
}

export function RevealWhatRefreshDoes({ t }: StepCtx) {
  return (
    <Svg label="old contents discarded, query reruns from scratch" h={200}>
      <Row y={70} label="old contents" value="discarded entirely" valueColor={C.cherryText} />
      <Row y={130} label="defining query" value="reruns from scratch" />
    </Svg>
  );
}

export function RevealFullRefreshFlat({ t }: StepCtx) {
  return (
    <Svg label="same refresh, before and after a tiny change" h={370}>
      {timeBar(30, 90, 974 / 994, '~974 ms', 'no change', C.crema)}
      {timeBar(30, 210, 994 / 994, '~994 ms', 'after ten new rows', C.cherryText)}
    </Svg>
  );
}

export function PredictIncrementalCheaper({ t }: StepCtx) {
  return (
    <Svg label="only the affected rows get touched" h={200}>
      <Row y={70} label="incremental touches" value="only affected rows" />
      <Row y={130} label="how much cheaper" value="?" />
    </Svg>
  );
}

export function RevealIncrementalResult({ t }: StepCtx) {
  return (
    <Svg label="same ten-row change, maintained incrementally" h={370}>
      {timeBar(30, 90, 6 / 994, '~6 ms', 'incremental update', C.focus)}
      {timeBar(30, 210, 994 / 994, '~994 ms', 'full refresh', C.cherryText)}
    </Svg>
  );
}

export function PredictConcurrentExists({ t }: StepCtx) {
  return (
    <Svg label="a plain refresh locks out readers" h={200}>
      <Row y={70} label="plain refresh" value="blocks concurrent reads" />
      <Row y={130} label="a non-blocking way exists" value="?" />
    </Svg>
  );
}

export function RevealConcurrentlyResult({ t }: StepCtx) {
  return (
    <Svg label="a reader, during two different kinds of refresh" h={370}>
      {timeBar(30, 90, 5 / 861, '~5 ms', 'during CONCURRENTLY', C.focus)}
      {timeBar(30, 210, 861 / 861, '~861 ms', 'during a plain refresh', C.cherryText)}
    </Svg>
  );
}

export function RevealConcurrentlyRequirement({ t }: StepCtx) {
  return (
    <Svg label="what CONCURRENTLY requires" h={200}>
      <Row y={70} label="required" value="a UNIQUE index, every row" valueColor={C.focus} />
      <Row y={130} label="not allowed" value="expression index, WHERE clause" valueColor={C.cherryText} />
    </Svg>
  );
}

export function PredictFloatSum({ t }: StepCtx) {
  return (
    <Svg label="SUM over a floating-point column" h={200}>
      <Row y={70} label="aggregate" value="SUM(float column)" />
      <Row y={130} label="still incremental" value="?" />
    </Svg>
  );
}

export function RevealFloatFix({ t }: StepCtx) {
  return (
    <Svg label="floating-point sums can force a full recompute" h={200}>
      <Row y={70} label="SUM / AVG on float" value="can force full recompute" valueColor={C.cherryText} />
      <Row y={130} label="cast to a fixed type" value="keeps it incremental" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealWarehouseChoosesByCost({ t }: StepCtx) {
  return (
    <Svg label="chosen automatically, by estimated cost" h={200}>
      <Row y={70} label="dynamic tables" value="incremental or full" />
      <Row y={130} label="materialized views" value="incremental or full" />
    </Svg>
  );
}

export function RevealStalenessTargetNotGuarantee({ t }: StepCtx) {
  return (
    <Svg label="a target the engine tries to keep" h={200}>
      <Row y={70} label="target lag" value="a goal, not a promise" valueColor={C.focus} />
      <Row y={130} label="a slow refresh" value="can exceed it" valueColor={C.cherryText} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'a full refresh costs the same, however little changed',
    'incremental maintenance tracks the change itself',
    'CONCURRENTLY trades a UNIQUE index for unblocked reads',
    'a staleness bound is a target, not a guarantee',
  ];
  return (
    <Svg label="recap: four separate tradeoffs" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveConcurrentSelectBlocks({ t }: StepCtx) {
  return (
    <Svg label="a SELECT lands mid-refresh, which is running CONCURRENTLY" h={200}>
      <Row y={70} label="refresh mode" value="CONCURRENTLY" />
      <Row y={130} label="SELECT has to wait" value="no — never blocked" valueColor={C.focus} />
    </Svg>
  );
}
