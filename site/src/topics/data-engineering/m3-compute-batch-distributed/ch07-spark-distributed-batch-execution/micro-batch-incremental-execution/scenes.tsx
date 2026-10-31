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
    <Svg label="every topic so far ran one plan once. This one runs it over and over." h={200}>
      <Row y={70} label="one plan" value="run once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="same plan" value="run per trigger" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOneTriggerOneBatch({ t }: StepCtx) {
  return (
    <Svg label="measured: one offset-log entry, one commit-log entry, per batch." h={200}>
      <Row y={70} label="each batch" value="one offset entry" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each batch" value="one commit entry" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLatencyFloor({ t }: StepCtx) {
  return (
    <Svg label="trigger interval forced to zero, almost no data. How fast can a batch run?" h={200}>
      <Row y={70} label="interval" value="zero" />
      <Row y={130} label="batch speed?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNotMilliseconds({ t }: StepCtx) {
  return (
    <Svg label="measured: not single-digit milliseconds. A real floor, a few hundred." h={200}>
      <Row y={70} label="almost no data" value="still not instant" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the floor" value="hundreds of ms" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateFloorIsPlanning({ t }: StepCtx) {
  return (
    <Svg label="the floor is planning and committing, not data volume." h={200}>
      <Row y={70} label="the cost" value="planning, committing" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not" value="row count" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBackToBack({ t }: StepCtx) {
  return (
    <Svg label="a three-second trigger, batches finish in under a second. Back-to-back, or spaced apart?" h={200}>
      <Row y={70} label="batch itself" value="under a second" />
      <Row y={130} label="next batch starts?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSpacedApart({ t }: StepCtx) {
  return (
    <Svg label="measured: three seconds apart, every time -- the engine waits for the boundary." h={200}>
      <Row y={70} label="batch itself" value="under a second" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="next batch starts" value="three seconds later" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateLogsNotGuess({ t }: StepCtx) {
  return (
    <Svg label="the commit log never runs ahead of the offset log." h={260}>
      <Row y={60} label="offset log" value="written first" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="commit log" value="never ahead" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="resuming" value="replays, no guessing" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealTriggerTypes({ t }: StepCtx) {
  return (
    <Svg label="two trigger types, side by side: a fixed wait, and run-until-empty." h={260}>
      <Row y={60} label="fixed interval" value="waits for clock" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="available-now" value="stops when empty" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="both" value="one batch only" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one plan, run per trigger: a real floor, a real wait, a real log." h={280}>
      <Row y={50} label="the floor" value="planning, not data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="the wait" value="clock, not batch" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="the log" value="replayed, never guessed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
