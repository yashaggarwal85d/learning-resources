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
    <Svg label="two thousand users, ten shards. One shard still drowns." h={200}>
      <Row y={70} label="distinct users" value="plenty of cardinality" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one shard" value="almost half the work" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCardinalityAlone({ t }: StepCtx) {
  return (
    <Svg label="thousands of distinct values, uniformly hashed. Even load?" h={200}>
      <Row y={70} label="shard key" value="thousands of values" />
      <Row y={130} label="load across shards" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCardinalityMeasured({ t }: StepCtx) {
  return (
    <Svg label="the celebrity's own shard: nearly half, alone." h={260}>
      <Row y={50} label="two thousand users" value="ten shards, hashed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="fair share per shard" value="one tenth" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="celebrity's own shard" value="nearly half" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealSalting({ t }: StepCtx) {
  return (
    <Svg label="one key, several salted sub-keys. Its load spreads out." h={260}>
      <Row y={50} label="the celebrity key" value="split into sub-keys" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="everyone else" value="untouched" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="hottest shard, after" value="close to fair share" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealSecondaryIndexes({ t }: StepCtx) {
  return (
    <Svg label="local: ask every shard. Global: ask only the ones that matter." h={260}>
      <Row y={50} label="local index" value="scoped to one shard" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="no partition key" value="must ask every shard" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="global index" value="asks only its own shards" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictPauseWindow({ t }: StepCtx) {
  return (
    <Svg label="a split happens, writes keep arriving. No pause." h={200}>
      <Row y={70} label="a shard splits" value="writes keep coming" />
      <Row y={130} label="writes in flight" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPauseMeasured({ t }: StepCtx) {
  return (
    <Svg label="no pause: half misroute. A brief pause: zero do." h={260}>
      <Row y={50} label="writes in flight" value="measured directly" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="no pause window" value="over half misrouted" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="with a brief pause" value="zero misrouted" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealRealSystems({ t }: StepCtx) {
  return (
    <Svg label="Vitess reshards. CockroachDB splits ranges. DynamoDB isolates hot items." h={260}>
      <Row y={50} label="Vitess" value="reshards a keyspace" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="CockroachDB" value="splits a range in two" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="DynamoDB" value="isolates a hot item" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="cardinality isn't load. Salting, index scope, the pause: all matter." h={260}>
      <Row y={50} label="cardinality" value="not the same as load" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="salting, index scope" value="fix specific failures" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="moving data" value="costs a real pause" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="millions of customer IDs, uniformly hashed. One is a chain." h={200}>
      <Row y={70} label="customer IDs" value="millions, hashed evenly" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="one massive chain" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
