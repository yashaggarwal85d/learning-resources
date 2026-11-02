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
    <Svg label="throughput collapses, nothing in the logs says why, and credits explain it" h={200}>
      <Row y={70} label="one slow operator" value="throughput collapses" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the logs" value="say nothing" valueColor={C.bad} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="correctness inside a step is one thing; the machine that runs it is another" h={200}>
      <Row y={70} label="so far" value="correctness, one step" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="the machine itself" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSlots({}: StepCtx) {
  return (
    <Svg label="ask for more parallelism than there are slots — what happens?" h={200}>
      <Row y={70} label="job asks for" value="more than available" />
      <Row y={130} label="runs anyway" value="just slower?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSlots({ t }: StepCtx) {
  return (
    <Svg label="a coordinator, a set of workers, and a hard ceiling on parallelism" h={200}>
      <Row y={70} label="jobmanager" value="schedules and tracks" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="taskmanagers, slots" value="a hard ceiling" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChaining({ t }: StepCtx) {
  return (
    <Svg label="fused operators skip the hop entirely; separate ones pay for it, every record" h={200}>
      <Row y={70} label="chained" value="no hop" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unchained" value="a hop, always" valueColor={C.bad} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBackpressure({ t }: StepCtx) {
  return (
    <Svg label="a receiver grants credits; run out, and the slowdown ripples backward" h={200}>
      <Row y={70} label="slow receiver" value="grants fewer credits" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the stall" value="ripples backward" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPerJobMode({}: StepCtx) {
  return (
    <Svg label="per-job mode is gone — what runs a job's own code now?" h={200}>
      <Row y={70} label="per-job mode" value="removed outright" />
      <Row y={130} label="in its place" value="what replaced it?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealApplicationMode({ t }: StepCtx) {
  return (
    <Svg label="one job's own code, run on the cluster itself, not shared with others" h={200}>
      <Row y={70} label="application mode" value="its own cluster" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="per-job mode" value="gone since two-oh" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAdaptiveBatch({ t }: StepCtx) {
  return (
    <Svg label="the same runtime runs both kinds of job; one of them sizes itself" h={200}>
      <Row y={70} label="batch, stream" value="one runtime, both" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="adaptive scheduling" value="sized from data" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="slots" value="a real ceiling" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="chaining, backpressure" value="measured, not guessed" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="adaptive scheduling" value="sized differently" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a coordinator, a ceiling, a fused hop, a silent slowdown, one runtime" h={260}>
      <Row y={50} label="jobmanager, slots" value="a hard ceiling" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="chaining, credits" value="skip, then signal" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="one runtime" value="both, one runtime" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
