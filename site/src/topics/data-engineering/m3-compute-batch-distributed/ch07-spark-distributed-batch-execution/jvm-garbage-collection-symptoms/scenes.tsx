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
    <Svg label="same work, built two ways. Which one makes the JVM clean up more?" h={200}>
      <Row y={70} label="same work" value="built two ways" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="JVM cleanup" value="which one, more?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaselineRealCost({ t }: StepCtx) {
  return (
    <Svg label="measured: the everyday-objects run genuinely pays a real cleanup cost." h={200}>
      <Row y={70} label="everyday objects" value="real cost" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="cleanup time" value="genuinely nonzero" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBinaryRows({ t }: StepCtx) {
  return (
    <Svg label="the same work, built from compact binary rows. Same cleanup cost?" h={200}>
      <Row y={70} label="binary rows" value="same work" />
      <Row y={130} label="cleanup cost?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealZeroCost({ t }: StepCtx) {
  return (
    <Svg label="measured: zero. The binary-row run pays no measured cleanup cost at all." h={200}>
      <Row y={70} label="binary rows" value="zero cost" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not smaller" value="genuinely none" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateFewerObjects({ t }: StepCtx) {
  return (
    <Svg label="cleanup cost tracks object count; binary rows need far fewer of them." h={200}>
      <Row y={70} label="cleanup cost" value="tracks object count" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="binary rows" value="far fewer objects" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictIsItBottleneck({ t }: StepCtx) {
  return (
    <Svg label="that run did pay a real cleanup cost. Is cleanup the bottleneck?" h={200}>
      <Row y={70} label="real cleanup cost" value="paid for real" />
      <Row y={130} label="the bottleneck?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTinySliver({ t }: StepCtx) {
  return (
    <Svg label="measured: no. That cost is a tiny sliver of the job's own total time." h={200}>
      <Row y={70} label="cleanup cost" value="real, but tiny" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="total job time" value="barely dented" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateCompareToTotal({ t }: StepCtx) {
  return (
    <Svg label="a nonzero cleanup cost only matters next to the job's own total time." h={200}>
      <Row y={70} label="nonzero" value="isn't automatic trouble" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="compare it" value="to the total time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSideBySide({ t }: StepCtx) {
  return (
    <Svg label="measured: both runs' own numbers, side by side." h={260}>
      <Row y={60} label="everyday objects" value="real cleanup cost" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="binary rows" value="zero cleanup cost" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="same work" value="same data, both runs" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="how work is built decides its cleanup cost; a nonzero number needs context." h={280}>
      <Row y={50} label="object count" value="decides cleanup cost" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="binary rows" value="avoid most of it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="nonzero" value="needs context to judge" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
