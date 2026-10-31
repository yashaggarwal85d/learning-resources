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
    <Svg label="restart mid-wait. the approval state is gone." h={200}>
      <Row y={70} label="approval sensor" value="waiting, day five" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="after the restart" value="state lost" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealShapes({ t }: StepCtx) {
  return (
    <Svg label="three shapes already taught. now: which one, when." h={260}>
      <Row y={40} label="batch dag" value="minutes to hours" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="asset graph" value="a data product" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="durable execution" value="days to months" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function PredictProperty({ t }: StepCtx) {
  return (
    <Svg label="what property actually decides?" h={200}>
      <Row y={70} label="candidate: task count" value="property of the dag" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real property" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDecisionRule({ t }: StepCtx) {
  return (
    <Svg label="duration. human-in-the-loop. data product. saga." h={260}>
      <Row y={40} label="duration" value="minutes/hours vs. months" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="human in the loop" value="a wait, not a task" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="data product, saga" value="two more questions" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function PredictHybrid({ t }: StepCtx) {
  return (
    <Svg label="does the whole pipeline have to move?" h={200}>
      <Row y={70} label="most of the pipeline" value="short batch tasks" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the long step" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHybridHandoff({ t }: StepCtx) {
  return (
    <Svg label="the dag hands off the long step. it does not model the wait." h={200}>
      <Row y={70} label="batch dag" value="runs, then hands off" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="durable workflow" value="owns the long wait" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDurableSurvival({ t }: StepCtx) {
  return (
    <Svg label="state lives in a durable history, not a process." h={200}>
      <Row y={70} label="where state used to live" value="a process's memory" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="where it lives instead" value="a durable event log" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three models. one rule. hand off the long step." h={260}>
      <Row y={40} label="three models" value="dag, asset, durable" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="one rule" value="duration, human, saga" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="the common case" value="hand off one step" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="same reschedule mode. does either survive a real restart?" h={200}>
      <Row y={70} label="polls durable state" value="a file on disk" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="polls in-process state" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
