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
    <Svg label="an executor holds cached data; a later task needs real working room. Same pool." h={200}>
      <Row y={70} label="cached data" value="in the pool" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="new task" value="also wants room" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPoolSplit({ t }: StepCtx) {
  return (
    <Svg label="measured: one pool, split by two settings, not two separate pots." h={200}>
      <Row y={70} label="unified pool" value="one region" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="split by" value="two settings" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictEvictionUnderPressure({ t }: StepCtx) {
  return (
    <Svg label="a cache well past the floor, under real pressure. Does it hold its ground?" h={200}>
      <Row y={70} label="cache past floor" value="pressure arrives" />
      <Row y={130} label="holds ground?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealEvictedAndSpilled({ t }: StepCtx) {
  return (
    <Svg label="measured: no. Fully evicted, and the task still has to spill anyway." h={200}>
      <Row y={70} label="cache after" value="fully evicted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="task still" value="spills to disk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateProtectedMinimum({ t }: StepCtx) {
  return (
    <Svg label="the same pressure, a smaller cache under the floor: completely untouched." h={200}>
      <Row y={70} label="cache under floor" value="same pressure" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="result" value="zero bytes moved" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictOomVsKill({ t }: StepCtx) {
  return (
    <Svg label="a heap error and a container kill. Do they look the same from the app's side?" h={200}>
      <Row y={70} label="heap error" value="vs. container kill" />
      <Row y={130} label="look the same?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOneTraceOneNothing({ t }: StepCtx) {
  return (
    <Svg label="measured: no. One leaves a real exception; the other leaves nothing at all." h={200}>
      <Row y={70} label="heap error" value="a real exception" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="container kill" value="no exception at all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateWhyDifferentFixes({ t }: StepCtx) {
  return (
    <Svg label="one watcher only sees its own heap; the other's walls are invisible to it." h={200}>
      <Row y={70} label="JVM watches" value="its own heap only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="container limit" value="covers more than that" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSideBySide({ t }: StepCtx) {
  return (
    <Svg label="measured: both failures, same root cause, side by side." h={260}>
      <Row y={60} label="heap error" value="exception, trace" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="container kill" value="process just gone" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="cause, either way" value="ran out of room" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one pool, one floor, two different kinds of running out of room." h={280}>
      <Row y={50} label="pool" value="execution, storage share" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="floor" value="protects a minimum" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="failures" value="need different fixes" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
