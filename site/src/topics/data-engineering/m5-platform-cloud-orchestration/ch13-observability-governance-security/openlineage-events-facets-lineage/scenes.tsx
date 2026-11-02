import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a column in daily_revenue is wrong. Which inputs, which transforms, produced it?" h={200}>
      <Row y={70} label="catalog says" value="derived from orders" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="SQL parse vs plan" value="same answer?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealObjectModel({ t }: StepCtx) {
  return (
    <Svg label="OpenLineage's own model: a Job, a Run, a Dataset" h={240}>
      <Row y={70} label="Job" value="defined piece of work" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Run" value="one occurrence" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={185} label="Dataset" value="what it reads or writes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStartComplete({ t }: StepCtx) {
  return (
    <Svg label="START, then later COMPLETE. Does COMPLETE already know the output at START?" h={200}>
      <Row y={70} label="START event" value="output known?" />
      <Row y={130} label="COMPLETE event" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAdditiveEvents({ t }: StepCtx) {
  return (
    <Svg label="measured: no -- START has no output; COMPLETE adds it later, same run id" h={200}>
      <Row y={70} label="START" value="no outputs, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="COMPLETE, same run" value="output added later" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateFacets({ t }: StepCtx) {
  return (
    <Svg label="facets: optional, versioned attachments -- schema, column lineage, quality, SQL" h={200}>
      <Row y={70} label="facets" value="schema, lineage, quality, SQL" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unknown facet" value="consumer just ignores it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSqlVsPlan({ t }: StepCtx) {
  return (
    <Svg label="a CASE, a UDF, a dynamic table name. Does SQL text find the same lineage as the plan?" h={200}>
      <Row y={70} label="SQL-text parse" value="same edges as plan?" />
      <Row y={130} label="runtime plan" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSqlMissesEdges({ t }: StepCtx) {
  return (
    <Svg label="measured: no -- text parse misses the UDF's hidden input and the dynamic table" h={200}>
      <Row y={70} label="SQL-text parse" value="misses UDF input, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="runtime plan" value="sees both, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateIntegrations({ t }: StepCtx) {
  return (
    <Svg label="Airflow's integration is now built in; Spark, Flink, dbt each emit the same shape" h={200}>
      <Row y={70} label="Airflow" value="now a built-in provider" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Spark, Flink, dbt" value="same event shape" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMarquezConsumers({ t }: StepCtx) {
  return (
    <Svg label="Marquez: the reference implementation, open-sourced by WeWork" h={200}>
      <Row y={70} label="Marquez" value="reference server, WeWork" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="also consume it" value="DataHub, cloud catalogs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateStaticLineageGaps({ t }: StepCtx) {
  return (
    <Svg label="static lineage misses: anything decided at runtime, anything that leaves the system" h={200}>
      <Row y={70} label="decided at runtime" value="a UDF, a dynamic name" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="leaves the system" value="an export nothing tracks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Job/Run/Dataset events, additive; facets attach meaning; SQL parse misses what a plan sees" h={280}>
      <Row y={50} label="events" value="Job, Run, Dataset, additive" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="facets" value="optional, versioned" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="lineage" value="plan sees more than SQL text" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
