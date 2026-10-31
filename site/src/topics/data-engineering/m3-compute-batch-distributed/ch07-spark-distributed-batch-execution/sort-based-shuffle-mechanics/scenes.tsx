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
    <Svg label="four map tasks write a shuffle. How many files land on disk?" h={200}>
      <Row y={70} label="4 map tasks, one groupBy" value="writes to disk" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="files written" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFourAndFour({ t }: StepCtx) {
  return (
    <Svg label="measured: four map tasks write four data files and four index files, one pair each." h={200}>
      <Row y={70} label="map tasks" value="4" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="data files, index files" value="4 data, 4 index" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictEightPartitions({ t }: StepCtx) {
  return (
    <Svg label="same million rows, now split across eight map tasks instead of four. More files, or the same four?" h={200}>
      <Row y={70} label="same rows, 8 map tasks" value="same data, more tasks" />
      <Row y={130} label="files written" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealEightAndEight({ t }: StepCtx) {
  return (
    <Svg label="measured: eight map tasks write eight data files and eight index files — the identical data." h={200}>
      <Row y={70} label="4 map tasks" value="4 data, 4 index" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="8 map tasks, same data" value="8 data, 8 index" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMapOutputTracker({ t }: StepCtx) {
  return (
    <Svg label="every reducer needs to know which executor holds which map task's block. The MapOutputTracker is that map." h={200}>
      <Row y={70} label="map task finishes" value="reports block locations" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reducer, before fetch" value="asks the tracker first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictReducePartitions({ t }: StepCtx) {
  return (
    <Svg label="instead of more map tasks, now there are more REDUCE partitions. Does the block count grow the same way?" h={200}>
      <Row y={70} label="4 map tasks, more buckets" value="M stays, R grows" />
      <Row y={130} label="logical blocks fetched" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMxR({ t }: StepCtx) {
  return (
    <Svg label="every map task's one file still covers every bucket — so the block count is M times R, not M plus R." h={200}>
      <Row y={70} label="4 map tasks x 97 buckets" value="388 logical blocks" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="grow R instead of M" value="blocks grow with it too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one sorted data file plus one index per map task; M times R small blocks fetched over the network; that is most of a job's real cost." h={260}>
      <Row y={50} label="per map task" value="one data file, one index" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="reducers find blocks via" value="the MapOutputTracker" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="logical block count" value="M times R, not M plus R" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="dominant cost" value="disk, network, small blocks" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
