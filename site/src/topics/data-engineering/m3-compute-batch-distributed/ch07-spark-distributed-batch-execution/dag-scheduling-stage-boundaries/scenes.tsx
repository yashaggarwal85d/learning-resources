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
    <Svg label="three chained operations: one stage, or three? What decides?" h={200}>
      <Row y={70} label="filter, select, filter" value="chained, in order" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="stages for this chain" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNarrowOneStage({ t }: StepCtx) {
  return (
    <Svg label="measured: filter, select, filter — three operations, one stage, no shuffle at all." h={200}>
      <Row y={70} label="filter → select → filter" value="three operations" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stages, shuffle" value="one stage, no Exchange" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGroupBy({ t }: StepCtx) {
  return (
    <Svg label="now group the same data by a derived key instead. Still one stage, or does something change?" h={200}>
      <Row y={70} label="same data, now groupBy" value="any row, any bucket" />
      <Row y={130} label="stages" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealWideTwoStages({ t }: StepCtx) {
  return (
    <Svg label="measured: the groupBy, alone, doubles the stage count and adds a real shuffle Exchange." h={200}>
      <Row y={70} label="narrow chain" value="one stage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one groupBy" value="two stages, Exchange" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWhyShuffleCuts({ t }: StepCtx) {
  return (
    <Svg label="why: any row could land in any bucket, so every output needs every input partition first." h={200}>
      <Row y={70} label="filter" value="needs its own partition" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="groupBy" value="needs every partition first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSecondShuffle({ t }: StepCtx) {
  return (
    <Svg label="measured: a second, independent groupBy on the already-grouped result adds a THIRD stage." h={200}>
      <Row y={70} label="one groupBy" value="two stages" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="groupBy, then groupBy again" value="three stages" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="narrow dependencies pipeline inside a stage; a wide dependency cuts a new one, every time." h={260}>
      <Row y={50} label="narrow ops" value="pipelined, same stage" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="wide ops" value="cuts a new stage" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="stage count" value="one more per shuffle" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="the cut itself" value="is the shuffle, materialised" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
