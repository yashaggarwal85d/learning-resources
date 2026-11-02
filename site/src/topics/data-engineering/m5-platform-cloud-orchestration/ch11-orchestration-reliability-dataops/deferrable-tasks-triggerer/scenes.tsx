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
    <Svg label="a hundred sensors, a hundred slots, almost all idle." h={200}>
      <Row y={70} label="sensors waiting" value="a hundred" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="worker slots used" value="a hundred, idle" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWorkerOccupancy({ t }: StepCtx) {
  return (
    <Svg label="same wait, same cap. poke holds the worker the whole time." h={200}>
      <Row y={70} label="poke mode" value="worker held, full wait" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="deferred mode" value="worker freed almost at once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMidWait({ t }: StepCtx) {
  return (
    <Svg label="ten seconds into the wait, who still holds a worker?" h={200}>
      <Row y={70} label="elapsed" value="ten seconds in" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="worker held by" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTriggererScaling({ t }: StepCtx) {
  return (
    <Svg label="the triggerer: one process, many coroutines, scaled on its own." h={200}>
      <Row y={70} label="triggerer" value="separate from workers" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="scaling" value="independent, its own capacity" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSerialization({ t }: StepCtx) {
  return (
    <Svg label="a trigger holds something unpicklable. what happens?" h={200}>
      <Row y={70} label="trigger init arg" value="can't survive a round trip" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="outcome" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSerializationCorruption({ t }: StepCtx) {
  return (
    <Svg label="serialize never raised. the lock came back as a string." h={200}>
      <Row y={70} label="a live lock" value="serialized, no error" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="read back" value="a string, not a lock" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSaturation({ t }: StepCtx) {
  return (
    <Svg label="default capacity: a thousand triggers per triggerer host." h={200}>
      <Row y={70} label="capacity, default" value="one thousand" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="over capacity" value="some triggers delayed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a pool bounds how many run. the triggerer gives the worker back." h={260}>
      <Row y={40} label="pool" value="bounds concurrency" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="deferral" value="frees the worker itself" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="HITL, deadlines" value="reuse the same mechanism" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="switch the hundred sensors to deferrable. what happens to worker-hours?" h={200}>
      <Row y={70} label="same hundred sensors" value="now deferrable" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="worker-hours" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
