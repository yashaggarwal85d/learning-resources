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
    <Svg label="same data, same partition column. Only the task count changes. How many files?" h={200}>
      <Row y={70} label="same write" value="4 partitions" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="task count" value="changes only" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaseline({ t }: StepCtx) {
  return (
    <Svg label="measured: file count always equals tasks times partitions touched." h={200}>
      <Row y={70} label="2, 4, 8 tasks" value="8, 16, 32 files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rule" value="tasks x partitions" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMaxRecords({ t }: StepCtx) {
  return (
    <Svg label="is there a config that caps a file's own size, leaving task count alone?" h={200}>
      <Row y={70} label="cap file size" value="without tasks?" />
      <Row y={130} label="possible?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMaxRecordsWorks({ t }: StepCtx) {
  return (
    <Svg label="measured: maxRecordsPerFile splits each task's own output, no task change." h={200}>
      <Row y={70} label="2 tasks, capped" value="24 files, not 8" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every file" value="at or under cap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateMaxRecordsMechanism({ t }: StepCtx) {
  return (
    <Svg label="the cap never touches parallelism — it splits a task's own share after the fact." h={200}>
      <Row y={70} label="task count" value="unchanged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="split happens" value="inside one task" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRebalanceNoAqe({ t }: StepCtx) {
  return (
    <Svg label="can a plain hint shrink the file count with AQE left off?" h={200}>
      <Row y={70} label="REBALANCE hint" value="no AQE" />
      <Row y={130} label="file count drops?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRebalanceNoop({ t }: StepCtx) {
  return (
    <Svg label="measured: the hint is silently ignored without AQE — same file count either way." h={200}>
      <Row y={70} label="32 tasks, no AQE" value="128 files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="with the hint" value="still 128" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateRebalanceWithAqe({ t }: StepCtx) {
  return (
    <Svg label="with AQE on, REBALANCE coalesces the shuffle; REBALANCE(col) aligns it to partitions." h={200}>
      <Row y={70} label="REBALANCE, AQE on" value="128 to 16 files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="REBALANCE(k)" value="16 to 4 files" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSideBySide({ t }: StepCtx) {
  return (
    <Svg label="measured: the same write, three file counts, by nothing but a hint and AQE." h={260}>
      <Row y={60} label="no hint" value="128 files" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="REBALANCE" value="16 files" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="REBALANCE(k)" value="4 files" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two levers, two problem shapes: a per-file cap, and a per-job hint under AQE." h={280}>
      <Row y={50} label="too many files" value="REBALANCE, AQE" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="too-big files" value="maxRecordsPerFile" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="file count" value="tasks x partitions" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
