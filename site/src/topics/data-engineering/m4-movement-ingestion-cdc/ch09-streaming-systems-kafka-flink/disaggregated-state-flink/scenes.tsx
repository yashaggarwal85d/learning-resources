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
    <Svg label="every backend so far kept its primary copy right next to the processing" h={200}>
      <Row y={70} label="the primary copy" value="always stayed local" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what if not" value="have to" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="heap and rocksdb both keep their primary copy on local disk" h={200}>
      <Row y={70} label="heap, rocksdb" value="local primary" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="moves it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCheckpointCost({}: StepCtx) {
  return (
    <Svg label="the primary copy moves off the machine — what happens to a checkpoint?" h={200}>
      <Row y={70} label="primary copy moves" value="off the machine" />
      <Row y={130} label="a checkpoint now" value="costs what?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealForSt({ t }: StepCtx) {
  return (
    <Svg label="forst is an lsm-tree store whose files live on remote storage" h={200}>
      <Row y={70} label="forst" value="an lsm-tree store" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="local disk" value="a cache now" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckpointsNearFree({ t }: StepCtx) {
  return (
    <Svg label="the primary copy is already durable, so a checkpoint barely has to move" h={200}>
      <Row y={70} label="already durable" value="off the machine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a checkpoint" value="near metadata only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSpeedups({ t }: StepCtx) {
  return (
    <Svg label="faster recovery, faster scale-in, faster scale-out, all from the same cause" h={200}>
      <Row y={70} label="recovery, scale-in" value="measurably faster" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="scale-out too" value="same root cause" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictAsyncAccess({}: StepCtx) {
  return (
    <Svg label="state access can now cross the network — what has to change?" h={200}>
      <Row y={70} label="state access" value="can go remote" />
      <Row y={130} label="processing a record" value="changes how?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAsyncStateApi({ t }: StepCtx) {
  return (
    <Svg label="a non-blocking state future lets other keys' round trips overlap" h={200}>
      <Row y={70} label="synchronous access" value="blocks and waits" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="asynchronous access" value="overlaps round trips" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPerKeyOrder({ t }: StepCtx) {
  return (
    <Svg label="same key stays strictly ordered; different keys are free to interleave" h={200}>
      <Row y={70} label="same key" value="strict order, always" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="different keys" value="free to interleave" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCacheTradeoff({ t }: StepCtx) {
  return (
    <Svg label="no cache costs real throughput; even a modest cache earns it back" h={200}>
      <Row y={70} label="no local cache" value="throughput drops" valueColor={C.bad} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a modest cache" value="earns it back" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="checkpoint cost" value="flat, not growing" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="async access" value="measured faster" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="cold cache" value="a real cost" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the primary copy moved; checkpoints paid that back; async hid the rest" h={260}>
      <Row y={50} label="primary copy" value="moved off-machine" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="checkpoints, recovery" value="both near-free now" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a cold cache" value="the real price" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
