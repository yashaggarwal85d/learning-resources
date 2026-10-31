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
    <Svg label="picked because everyone uses it. wrong quadrant for the job." h={200}>
      <Row y={70} label="tool chosen" value="airflow, by default" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="ops hours a year" value="more than writing it took" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealGrid({ t }: StepCtx) {
  return (
    <Svg label="four axes, not one best tool." h={260}>
      <Row y={40} label="data-awareness" value="task, asset, or neither" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="operational burden" value="self-run vs. managed" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="ecosystem, cloud coupling" value="two more axes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function PredictWhichAxis({ t }: StepCtx) {
  return (
    <Svg label="which axis did the hook's team actually get wrong?" h={200}>
      <Row y={70} label="airflow, self-run" value="chosen by default" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the axis that bit them" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStandardExpress({ t }: StepCtx) {
  return (
    <Svg label="standard vs express, sourced from aws's own docs." h={200}>
      <Row y={70} label="standard" value="up to a year, exactly-once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="express" value="5 min, at-least-once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFanoutPrimitive({ t }: StepCtx) {
  return (
    <Svg label="does a serverless state machine have its own fan-out primitive?" h={200}>
      <Row y={70} label="airflow's answer" value="dynamic task mapping" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="step functions' answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDistributedMap({ t }: StepCtx) {
  return (
    <Svg label="distributed map: 10,000 parallel child executions, sourced." h={200}>
      <Row y={70} label="child executions" value="up to 10,000" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each child's history" value="separate" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTheField({ t }: StepCtx) {
  return (
    <Svg label="the rest of the field, placed on the same grid." h={260}>
      <Row y={40} label="dagster, prefect 3" value="python-native, dynamic" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="kestra" value="yaml-declarative" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="maestro, lakeflow jobs" value="named, sourced" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four axes, not one best tool." h={260}>
      <Row y={40} label="the grid" value="four axes" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="the hook's mistake" value="optimized for none" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="the real axis" value="familiarity, not fit" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a different workload. same grid, same tool?" h={200}>
      <Row y={70} label="new workload" value="short, high-volume" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="grid's answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
