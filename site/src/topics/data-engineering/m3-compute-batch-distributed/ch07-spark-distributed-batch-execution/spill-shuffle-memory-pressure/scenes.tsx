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
    <Svg label="four workers sort the same kind of data; one holds far more of it." h={200}>
      <Row y={70} label="four workers" value="one holds more" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="runs out of room" value="first?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaselineTwoNumbers({ t }: StepCtx) {
  return (
    <Svg label="measured: a real spill, reported as two different numbers." h={200}>
      <Row y={70} label="spill happens" value="two numbers" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="memory, disk" value="not the same" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictHowManySpill({ t }: StepCtx) {
  return (
    <Svg label="four workers, one skewed. How many actually spill?" h={200}>
      <Row y={70} label="four workers" value="uneven pieces" />
      <Row y={130} label="how many spill?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOnlyOneSpills({ t }: StepCtx) {
  return (
    <Svg label="measured: exactly one. The other three never touch disk at all." h={200}>
      <Row y={70} label="one worker" value="spills" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="other three" value="zero, always" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateMemoryCountsMore({ t }: StepCtx) {
  return (
    <Svg label="the memory figure counts rounding and bookkeeping the disk figure never does." h={200}>
      <Row y={70} label="memory number" value="counts overhead" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="disk number" value="only the write" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFourTimesMemory({ t }: StepCtx) {
  return (
    <Svg label="give the whole job four times the memory. Does the spill shrink that much?" h={200}>
      <Row y={70} label="four times memory" value="whole job" />
      <Row y={130} label="spill shrinks?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBarelyMoves({ t }: StepCtx) {
  return (
    <Svg label="measured: no. It barely moves. The other three stay exactly where they were." h={200}>
      <Row y={70} label="skewed worker" value="barely changes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="other three" value="still zero" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateEvenSplitWastesIt({ t }: StepCtx) {
  return (
    <Svg label="the extra memory was split evenly; only one worker ever needed any of it." h={200}>
      <Row y={70} label="extra memory" value="split evenly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="only one worker" value="needed it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSideBySide({ t }: StepCtx) {
  return (
    <Svg label="measured: small memory and quadrupled memory, side by side." h={260}>
      <Row y={60} label="small memory" value="worker spills" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="4x memory" value="barely different" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="other workers" value="unaffected, both runs" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one metric, two numbers; more memory spread evenly rarely fixes one worker's own skew." h={280}>
      <Row y={50} label="spill" value="memory, disk differ" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="isolated" value="to the skewed task" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="more memory" value="weak fix for skew" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
