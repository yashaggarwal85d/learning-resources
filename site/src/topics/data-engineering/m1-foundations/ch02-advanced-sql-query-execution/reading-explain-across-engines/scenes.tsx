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
    <Svg label="same command, two versions apart" h={200}>
      <Row y={70} label="PostgreSQL 16" value="no Buffers line" valueColor={C.cherryText} />
      <Row y={130} label="PostgreSQL 18" value="Buffers: shared hit=896" valueColor={C.focus} />
    </Svg>
  );
}

export function PredictWhyMore({ t }: StepCtx) {
  return (
    <Svg label="same query, same command — why more output?" h={200}>
      <Row y={70} label="what changed in the query" value="nothing" />
      <Row y={130} label="what changed in the output" value="?" />
    </Svg>
  );
}

export function RevealBuffersDefault({ t }: StepCtx) {
  return (
    <Svg label="a version-dated default, not a trick of this query" h={200}>
      <Row y={70} label="ANALYZE before PG 18" value="BUFFERS off" valueColor={C.cherryText} />
      <Row y={130} label="ANALYZE from PG 18 on" value="BUFFERS on" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealEstVsActual({ t }: StepCtx) {
  return (
    <Svg label="the planner's guess vs. what actually ran" h={200}>
      <Row y={70} label="estimated rows" value="1,012" />
      <Row y={130} label="actual rows" value="2,000" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSpillRecap({ t }: StepCtx) {
  return (
    <Svg label="did this operator run out of its memory budget?" h={200}>
      <Row y={70} label="already measured" value="Batches, spill (topic 23)" />
      <Row y={130} label="every engine" value="answers this somewhere" valueColor={C.focus} />
    </Svg>
  );
}

export function PredictWhatFirst({ t }: StepCtx) {
  return (
    <Svg label="five formats, one question to start with" h={200}>
      <Row y={70} label="five engines, five vocabularies" value="all different" />
      <Row y={130} label="worth checking first" value="?" />
    </Svg>
  );
}

export function RevealSparkPlanEstimate({ t }: StepCtx) {
  return (
    <Svg label="printed right in the plan text itself" h={200}>
      <Row y={70} label="cost-mode plan" value="Statistics(...)" />
      <Row y={130} label="rowCount" value="1.00E+6" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSparkUiActual({ t }: StepCtx) {
  return (
    <Svg label="a measured contrast: comfortable vs. constrained" h={370}>
      {timeBar(30, 90, 0, '0 MB spilled', 'comfortable run', C.focus)}
      {timeBar(30, 210, 388 / 388, '388 MB mem, 198 MB disk', 'constrained run', C.cherryText)}
    </Svg>
  );
}

export function ProveShuffleVsSpill({ t }: StepCtx) {
  return (
    <Svg label="shuffle bytes vs. spilled bytes" h={200}>
      <Row y={70} label="shuffle-write bytes" value="normal, always present" />
      <Row y={130} label="spilled bytes" value="only under pressure" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTrino({ t }: StepCtx) {
  return (
    <Svg label="inline in the plan text, no separate UI needed" h={200}>
      <Row y={70} label="CPU time" value="per stage" />
      <Row y={130} label="relative cost" value="per plan node" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSnowflake({ t }: StepCtx) {
  return (
    <Svg label="named panes for pruning and spilling" h={200}>
      <Row y={70} label="Pruning pane" value="scanned / total" />
      <Row y={130} label="Spilling pane" value="local / remote bytes" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBigQuery({ t }: StepCtx) {
  return (
    <Svg label="the estimate lives on the edges, not the boxes" h={200}>
      <Row y={70} label="stages" value="drawn as boxes" />
      <Row y={130} label="estimated rows exchanged" value="on the edges" valueColor={C.focus} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'the biggest estimate-vs-actual gap first',
    'then a high loop count on a small cost',
    'then spill or memory pressure',
    'then the single slowest operator',
  ];
  return (
    <Svg label="recap: one fixed order, five vocabularies" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveBadEstimate({ t }: StepCtx) {
  return (
    <Svg label="a node's estimate, far from what ran" h={200}>
      <Row y={70} label="estimated" value="500" />
      <Row y={130} label="actual" value="50,000" valueColor={C.cherryText} />
    </Svg>
  );
}

export function ProveZeroSpill({ t }: StepCtx) {
  return (
    <Svg label="a large shuffle, a spill field at zero" h={200}>
      <Row y={70} label="bytes shuffled" value="large" />
      <Row y={130} label="bytes spilled" value="0" valueColor={C.focus} />
    </Svg>
  );
}
