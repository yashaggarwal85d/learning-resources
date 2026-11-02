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
    <Svg label="five jobs are slow. Same symptom from a distance, five different causes." h={200}>
      <Row y={70} label="five jobs" value="all slow" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one cause each" value="UI tells apart" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSkew({ t }: StepCtx) {
  return (
    <Svg label="measured: one task in an eight-task stage runs hundreds of times longer than the rest." h={200}>
      <Row y={70} label="eight tasks" value="one stage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one task" value="hundreds of times" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTaskTable({ t }: StepCtx) {
  return (
    <Svg label="what will the stage's own task-duration table show for this?" h={200}>
      <Row y={70} label="same stage" value="eight tasks" />
      <Row y={130} label="the table shows?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTableConfirms({ t }: StepCtx) {
  return (
    <Svg label="measured: one bar towers over the rest. Min, median and max tell it apart." h={200}>
      <Row y={70} label="min / median" value="close together" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="max" value="one huge outlier" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateSkewSignature({ t }: StepCtx) {
  return (
    <Svg label="skew's signature: uneven durations in the SAME stage, not across stages." h={200}>
      <Row y={70} label="same stage" value="uneven durations" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the culprit" value="partitioning, not hardware" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSpillShape({ t }: StepCtx) {
  return (
    <Svg label="a second job: real spill bytes on one task only, zero on the rest. What is it?" h={200}>
      <Row y={70} label="same shape" value="one task only" />
      <Row y={130} label="but this time?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSpillAndGC({ t }: StepCtx) {
  return (
    <Svg label="measured: spill (memory/disk) on one task; GC time nonzero only in the RDD job." h={260}>
      <Row y={60} label="spill" value="memory and disk" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="GC time" value="RDD only" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="both" value="metric columns" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealSmallFilesAndDriver({ t }: StepCtx) {
  return (
    <Svg label="measured: 2,000 tiny tasks where overhead beats the work; a gap with every executor idle." h={260}>
      <Row y={60} label="2,000 tasks" value="overhead beats work" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="between two jobs" value="every executor idle" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="neither" value="looks like skew" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function ElaborateTriageOrder({ t }: StepCtx) {
  return (
    <Svg label="a fixed order: task-duration spread, then spill/GC columns, then task count, then idle gaps." h={200}>
      <Row y={70} label="five symptoms" value="one fixed order" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each step" value="narrows the cause" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one triage order, five causes: duration spread, spill/GC columns, task count, idle gaps." h={280}>
      <Row y={50} label="skew" value="duration spread" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="spill / GC" value="metric columns" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="small files, driver" value="idle executors" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
