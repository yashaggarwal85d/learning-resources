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
    <Svg label="one select statement — no CREATE TABLE, no schema name, no connection string" h={200}>
      <Row y={70} label="model file" value="one select statement" />
      <Row y={130} label="becomes" value="a real table?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealModelQuote({ t }: StepCtx) {
  return (
    <Svg label="a select statement — dbt wraps it in the warehouse's own DDL and DML" h={200}>
      <Row y={70} label="a model" value="a select statement" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="dbt wraps it" value="in the warehouse's DDL" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictTableName({ t }: StepCtx) {
  return (
    <Svg label="one model selects another by its table name — does dbt see that as a dependency?" h={200}>
      <Row y={70} label="table name" value="written directly" />
      <Row y={130} label="a dependency?" value="dbt sees it?" />
    </Svg>
  );
}

export function RevealLabRef({ t }: StepCtx) {
  return (
    <Svg label="the lab's fact model — three joins, every one of them through ref()" h={200}>
      <Row y={70} label="fct_orders" value="joins three models" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="every join" value="through ref()" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDag({ t }: StepCtx) {
  return (
    <Svg label="the DAG — read from dbt's own manifest after a real build, not hand-drawn" h={200}>
      <Row y={70} label="the DAG" value="read from the manifest" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="after" value="a real build" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMacroEdit({ t }: StepCtx) {
  return (
    <Svg label="one macro, called from one model's SQL — change it everywhere it's called?" h={200}>
      <Row y={70} label="one macro" value="called from one model" />
      <Row y={130} label="change it" value="everywhere it's called?" />
    </Svg>
  );
}

export function RevealMacroQuote({ t }: StepCtx) {
  return (
    <Svg label="reused code, not repeated — the lab's own cents-to-dollars macro, called once" h={200}>
      <Row y={70} label="macros" value="reused, not repeated" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="cents to dollars" value="called once" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictFailBlocks({ t }: StepCtx) {
  return (
    <Svg label="a failing data test, one bad row — does dbt still build what's downstream?" h={200}>
      <Row y={70} label="data test fails" value="one bad row" />
      <Row y={130} label="downstream" value="still builds?" />
    </Svg>
  );
}

export function RevealTestBlocks({ t }: StepCtx) {
  return (
    <Svg label="a dangling id, a failing relationships test — everything downstream skipped, nothing built" h={200}>
      <Row y={70} label="dangling id" value="relationships test fails" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="downstream" value="skipped, not built" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealUnitTest({ t }: StepCtx) {
  return (
    <Svg label="fixed, fabricated rows — the macro's own logic checked before any real data loads" h={200}>
      <Row y={70} label="unit test" value="fixed, fabricated rows" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="checked" value="before real data loads" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDocsMesh({ t }: StepCtx) {
  return (
    <Svg label="generated docs — model code, the DAG, column tests; dbt Mesh named across projects" h={260}>
      <Row y={60} label="docs" value="model code, the DAG" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="column tests" value="the same graph, browsable" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="dbt Mesh" value="named, across projects" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ref() is the only dependency dbt sees; one macro; one failing test, a hard stop; the same graph, browsable" h={260}>
      <Row y={60} label="ref()" value="the only dependency dbt sees" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="one macro" value="one failing test, a hard stop" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="docs" value="the same graph, browsable" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new model, table names instead of ref(), built with several threads at once — what happens?" h={200}>
      <Row y={70} label="table names" value="instead of ref()" />
      <Row y={130} label="several threads" value="what happens?" />
    </Svg>
  );
}
