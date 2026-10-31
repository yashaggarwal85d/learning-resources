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
    <Svg label="one worker dies; recovery time tracks the state it held, not the job's shape" h={200}>
      <Row y={70} label="a worker dies" value="state decides it" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="job complexity" value="doesn't matter" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a snapshot was taken — but what is it actually a snapshot of?" h={200}>
      <Row y={70} label="last topic" value="the snapshot itself" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="what's inside it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRescaleUnit({}: StepCtx) {
  return (
    <Svg label="a job rescales — what actually moves?" h={200}>
      <Row y={70} label="rescaling happens" value="something moves" />
      <Row y={130} label="singly, or blocks?" value="or something else?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealKeyGroups({ t }: StepCtx) {
  return (
    <Svg label="every key hashes into a fixed key group, set once, independent of parallelism" h={200}>
      <Row y={70} label="every key" value="hashed once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="groups, not keys" value="get assigned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRescaleBlocks({ t }: StepCtx) {
  return (
    <Svg label="rescaling slides whole key groups between instances, never splitting one" h={200}>
      <Row y={70} label="a key group" value="moves as one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every key inside" value="unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBackends({ t }: StepCtx) {
  return (
    <Svg label="heap state is fast and memory-bound; rocksdb is slower and disk-bound" h={200}>
      <Row y={70} label="heap" value="fast, memory-bound" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rocksdb" value="slower, disk-bound" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRecoveryDriver({}: StepCtx) {
  return (
    <Svg label="does a more complex job take longer to recover?" h={200}>
      <Row y={70} label="a complex job" value="more operators" />
      <Row y={130} label="recovery time" value="slower for that?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRecoveryDriver({ t }: StepCtx) {
  return (
    <Svg label="recovery time tracks the failed instance's state, nothing about the job itself" h={200}>
      <Row y={70} label="operator count" value="no difference" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="state held" value="the whole story" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTtlSchema({ t }: StepCtx) {
  return (
    <Svg label="idle state expires on its own; a changed schema follows real, narrow rules" h={200}>
      <Row y={70} label="state ttl" value="expires idle keys" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="schema evolution" value="narrow rules" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVersionBreak({ t }: StepCtx) {
  return (
    <Svg label="flink's own docs don't cover restoring a two-oh job from an old savepoint" h={200}>
      <Row y={70} label="old state" value="not carried forward" valueColor={C.bad} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real cause" value="a serializer rewrite" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="rescaling" value="whole groups move" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="recovery time" value="tracks state" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="heap, rocksdb" value="measured, not guessed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a fixed group, a block that moves, a backend trade, a version that breaks" h={260}>
      <Row y={50} label="key groups" value="fixed, not fluid" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="rescaling, recovery" value="both track state" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="old to new" value="a real break" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
