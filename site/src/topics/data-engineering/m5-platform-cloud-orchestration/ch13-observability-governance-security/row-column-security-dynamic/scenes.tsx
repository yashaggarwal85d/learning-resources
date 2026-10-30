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
    <Svg label="masked column, three paths tried." h={200}>
      <Row y={70} label="masked column" value="email, for analysts" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which path leaked" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="three paths. Covered, or not?" h={260}>
      <Row y={50} label="masked query" value="covered?" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="derived table" value="covered?" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="direct file read" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealEngineVsApp({ t }: StepCtx) {
  return (
    <Svg label="enforced in the engine, not the app." h={200}>
      <Row y={70} label="app-side check" value="only its calls" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="engine-side policy" value="every caller" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRowPolicy({ t }: StepCtx) {
  return (
    <Svg label="the policy runs first, row by row." h={260}>
      <Row y={50} label="policy expression" value="runs before user's" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="leakproof functions" value="the one exception" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="owner, superuser" value="skip it entirely" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealFiveEngines({ t }: StepCtx) {
  return (
    <Svg label="five engines, one shared idea." h={260}>
      <Row y={50} label="Snowflake, Databricks" value="masks and filters" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="BigQuery, Lake Formation" value="row-level security" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="Trino, via OPA" value="one shared idea" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealPlanCost({ t }: StepCtx) {
  return (
    <Svg label="pushed down, or scanned in full." h={260}>
      <Row y={50} label="pushed to scan" value="fewer rows touched" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="not pushed down" value="scan then filter" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="cache, pre-mask" value="hands back unmasked" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealDerivedTable({ t }: StepCtx) {
  return (
    <Svg label="built before the mask, serving it still." h={200}>
      <Row y={70} label="view built earlier" value="before the mask" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the engine now" value="just another table" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealExtract({ t }: StepCtx) {
  return (
    <Svg label="exported once, carries what it carried then." h={200}>
      <Row y={70} label="export, taken earlier" value="just a copy" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the policy now" value="never governed it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDirectFile({ t }: StepCtx) {
  return (
    <Svg label="read the file, and no policy is asked." h={260}>
      <Row y={50} label="read the file" value="straight from storage" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="no query" value="skips the engine" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="encrypting the file" value="the one defence" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="enforced at every read; three paths outside it." h={260}>
      <Row y={50} label="engine, not app" value="covers every caller" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="five engines" value="same idea, costs" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="view, export, file" value="all outside it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="mask added today. Which copies leak?" h={200}>
      <Row y={70} label="export, last month" value="before the mask" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="view, refreshed yesterday" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
