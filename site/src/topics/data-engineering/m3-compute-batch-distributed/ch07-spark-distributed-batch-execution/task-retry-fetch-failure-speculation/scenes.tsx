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
    <Svg label="one task keeps failing. Does the job die the first time, or get more tries?" h={200}>
      <Row y={70} label="one task" value="keeps failing" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the job" value="dies, or tries again?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaselineRecovers({ t }: StepCtx) {
  return (
    <Svg label="measured: given enough tries, the flaky task comes through, job finishes." h={200}>
      <Row y={70} label="enough tries" value="given" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the job" value="finishes normally" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLowerLimit({ t }: StepCtx) {
  return (
    <Svg label="fewer tries than it needs. Does the job still recover?" h={200}>
      <Row y={70} label="same task" value="far fewer tries" />
      <Row y={130} label="still recovers?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealGivesUp({ t }: StepCtx) {
  return (
    <Svg label="measured: it gives up. Same task, same failures, job aborts this time." h={200}>
      <Row y={70} label="same failures" value="same task" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the job" value="aborts, this time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateFixedChances({ t }: StepCtx) {
  return (
    <Svg label="a retry limit is a fixed number of chances, not an unlimited one." h={200}>
      <Row y={70} label="retry limit" value="fixed chances" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="spend them" value="job dies anyway" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLostPiece({ t }: StepCtx) {
  return (
    <Svg label="a finished piece of work goes missing. Just that piece redone, or more?" h={200}>
      <Row y={70} label="finished piece" value="goes missing" />
      <Row y={130} label="redone?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFarMore({ t }: StepCtx) {
  return (
    <Svg label="measured: far more. The entire earlier stage reruns, not just one piece." h={200}>
      <Row y={70} label="not one piece" value="the whole stage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reruns" value="every task in it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateNoPartialFix({ t }: StepCtx) {
  return (
    <Svg label="once that work is gone, there's no partial fix available." h={200}>
      <Row y={70} label="work is gone" value="no partial fix" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="only option" value="rerun all of it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSideBySide({ t }: StepCtx) {
  return (
    <Svg label="measured: both failures, side by side." h={260}>
      <Row y={60} label="task failure" value="bounded retry count" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="lost piece" value="drags back a stage" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="same job" value="two very different costs" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a retry limit is bounded; a lost piece can cost far more than one task." h={280}>
      <Row y={50} label="retry limit" value="bounded chances" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="lost work" value="no partial recovery" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="one missing piece" value="can cost a whole stage" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
