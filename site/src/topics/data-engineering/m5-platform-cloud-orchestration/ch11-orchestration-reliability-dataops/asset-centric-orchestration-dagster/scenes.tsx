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
    <Svg label="a hand-kept lineage spreadsheet vs. asking the asset itself." h={200}>
      <Row y={70} label="lineage spreadsheet" value="hand-kept, stale" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="dagster's answer" value="asked for, live" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWiringMeasured({ t }: StepCtx) {
  return (
    <Svg label="same pipeline, two shapes. dependency lines counted for real." h={200}>
      <Row y={70} label="asset graph" value="3 wiring lines" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="airflow taskflow dag" value="4 wiring lines" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCheckBlocks({ t }: StepCtx) {
  return (
    <Svg label="does a failing check stop the rest of the pipeline?" h={200}>
      <Row y={70} label="asset check" value="fails on a bad row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rest of the run" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckLive({ t }: StepCtx) {
  return (
    <Svg label="an asset check, run live, with a bad row planted." h={200}>
      <Row y={70} label="bad row planted" value="check fails, catches it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="run itself" value="still succeeds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLineageTooling({ t }: StepCtx) {
  return (
    <Svg label="does a lineage graph need separate tooling to maintain?" h={200}>
      <Row y={70} label="transitive upstream" value="asked for directly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="extra tooling needed" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLineageFree({ t }: StepCtx) {
  return (
    <Svg label="lineage, asked for rather than hand-maintained." h={200}>
      <Row y={70} label="fct_orders upstream" value="raw_orders, stg_orders" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="extra lineage tooling" value="none" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealComponentsAndLimits({ t }: StepCtx) {
  return (
    <Svg label="components and dg, now ga. where the model fits poorly." h={200}>
      <Row y={70} label="components, dg cli" value="now ga" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="imperative side effects" value="no product to name" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="task graphs wire actions. asset graphs wire data products." h={260}>
      <Row y={40} label="task graph nodes" value="actions" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="asset graph nodes" value="data products" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="lineage" value="falls out for free" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="add a fourth stage. does deriving lineage change?" h={200}>
      <Row y={70} label="fourth asset added" value="declares its own deps" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="lineage derivation" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
