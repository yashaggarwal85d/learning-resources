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
    <Svg label="one click: 'application', 'job', 'stage', 'task'. Which number does each actually fix?" h={200}>
      <Row y={70} label="four words" value="application, job, stage, task" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one click" value="how many of each?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOneJob({ t }: StepCtx) {
  return (
    <Svg label="one action, four partitions, no shuffle: one job, one stage, four tasks." h={200}>
      <Row y={70} label="one action, count()" value="one job" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="four partitions" value="four tasks, one stage" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSecondAction({ t }: StepCtx) {
  return (
    <Svg label="the same DataFrame, a second count(). Same job again, or a new one?" h={200}>
      <Row y={70} label="same DataFrame" value="count() a second time" />
      <Row y={130} label="job id" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNewJob({ t }: StepCtx) {
  return (
    <Svg label="measured: the second count() got a brand new job id, not the first one again." h={200}>
      <Row y={70} label="first count()" value="job id N" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="second count()" value="a different job id" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRepartitionTasks({ t }: StepCtx) {
  return (
    <Svg label="repartition(8), then count(): the task count followed the partition count, to eight." h={200}>
      <Row y={70} label="four partitions" value="four tasks" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="repartition(8)" value="eight tasks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDriverExecutor({ t }: StepCtx) {
  return (
    <Svg label="Spark's own glossary: the driver runs main() and owns SparkContext; executors run the tasks." h={200}>
      <Row y={70} label="driver" value="runs main(), owns SparkContext" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="executors" value="a set per app, run tasks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="application holds jobs, a job holds stages cut at a shuffle, a stage holds one task per partition." h={260}>
      <Row y={50} label="application" value="your whole program" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="job" value="one per action" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="stage" value="cut at a shuffle" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="task" value="one per partition" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
