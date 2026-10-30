import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
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
    <Svg label='revenue column wrong. "derived from orders."' h={200}>
      <Row y={70} label="catalog says" value="derived from orders" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which inputs" value="not yet known" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="a CASE, a parameter name. Same columns?" h={200}>
      <Row y={70} label="SQL text alone" value="finds everything?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEventModel({ t }: StepCtx) {
  return (
    <Svg label="job, run, dataset. Start, then settle." h={260}>
      <Row y={50} label="job" value="the defined work" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="run" value="one occurrence" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="dataset" value="read or written" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealFacets({ t }: StepCtx) {
  return (
    <Svg label="named, optional, versioned." h={200}>
      <Row y={70} label="schema, lineage, SQL" value="each a facet" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unknown facet" value="safely skipped" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIntegrations({ t }: StepCtx) {
  return (
    <Svg label="who emits: Airflow, Spark, Flink, dbt." h={260}>
      <Row y={50} label="Airflow" value="its own provider" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Spark" value="a listener" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="Flink, dbt" value="their own emitters" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealConsumers({ t }: StepCtx) {
  return (
    <Svg label="who reads: one event, many readers." h={200}>
      <Row y={70} label="Marquez" value="the reference server" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="DataHub, cloud catalogs" value="same events" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealParentRun({ t }: StepCtx) {
  return (
    <Svg label="a run names its parent run." h={200}>
      <Row y={70} label="task's run" value="names its parent" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one failing node" value="one shared trigger" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealParseVsRuntime({ t }: StepCtx) {
  return (
    <Svg label="text finds names. The plan finds more." h={200}>
      <Row y={70} label="SQL text" value="names only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="resolved plan" value="condition and value" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="events, facets, emitters, readers, the plan." h={260}>
      <Row y={50} label="job, run, dataset" value="start, then settle" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="emit and read" value="one shared shape" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="text vs plan" value="plan sees more" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="table name built from the date." h={200}>
      <Row y={70} label="name changes daily" value="one, or many?" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
