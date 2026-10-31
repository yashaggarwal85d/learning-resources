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
    <Svg label="a real cluster could run a task right where its data sits, or wait for a better slot. Which does it choose?" h={200}>
      <Row y={70} label="a task, its data's location" value="match, or wait?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the scheduler's choice" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLocalityTrivial({ t }: StepCtx) {
  return (
    <Svg label="measured: every task here reports PROCESS_LOCAL. One JVM is both driver and only executor, so there's never a worse slot to wait for." h={200}>
      <Row y={70} label="this local[4] run" value="one JVM, one executor" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every task's locality" value="PROCESS_LOCAL, always" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBareRDD({ t }: StepCtx) {
  return (
    <Svg label="a bare RDD, no partition count given, no parent RDD. How many partitions does it get?" h={200}>
      <Row y={70} label="sc.parallelize, no hints" value="some partition count" />
      <Row y={130} label="partitions" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDefaultParallelism({ t }: StepCtx) {
  return (
    <Svg label="measured: the bare RDD gets exactly 4 partitions — this session's own core count, nothing else." h={200}>
      <Row y={70} label="local[4] session" value="4 cores" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="bare RDD partitions" value="4, matching the cores" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGroupByPartitions({ t }: StepCtx) {
  return (
    <Svg label="same 4-partition data, now a groupBy shuffle, no override. Same 4 output partitions, or something else?" h={200}>
      <Row y={70} label="4-partition data, groupBy" value="no override" />
      <Row y={130} label="output partitions" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealShufflePartitions({ t }: StepCtx) {
  return (
    <Svg label="measured: the groupBy writes out 200 partitions — spark.sql.shuffle.partitions's own default, not the 4 cores." h={200}>
      <Row y={70} label="bare RDD partitions" value="4 (the cores)" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="groupBy output" value="200 (SQL default)" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSetEight({ t }: StepCtx) {
  return (
    <Svg label="set spark.sql.shuffle.partitions to 8 by hand. Does a later bare RDD's partition count move too, or stay at 4?" h={200}>
      <Row y={70} label="set shuffle.partitions = 8" value="then a fresh RDD" />
      <Row y={130} label="fresh RDD's partitions" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealIndependentBothWays({ t }: StepCtx) {
  return (
    <Svg label="measured: the groupBy now writes 8 partitions. A fresh bare RDD, made right after, still gets 4 — untouched." h={200}>
      <Row y={70} label="groupBy, after the change" value="8 partitions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="fresh bare RDD" value="still 4, unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two independent knobs: default parallelism from the cores, shuffle partitions from spark.sql.shuffle.partitions. Locality waits and FIFO/FAIR pools place and share the tasks these knobs size." h={260}>
      <Row y={50} label="default parallelism" value="from the core count" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="shuffle partitions" value="from its own SQL setting" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the two knobs" value="fully independent, both ways" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="placing tasks" value="locality waits, FIFO/FAIR" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
