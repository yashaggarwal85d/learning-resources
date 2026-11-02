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
    <Svg label="an event seen out of order, for any key touched by a scale-out that already happened" h={200}>
      <Row y={70} label="cancellation" value="seen first" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="creation" value="seen second" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="several partition lanes side by side, with no synchronizing line between them" h={200}>
      <Row y={70} label="within a lane" value="ordered" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="across lanes" value="no link" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCrossPartition({}: StepCtx) {
  return (
    <Svg label="two records, two different keys, two different partitions — any guaranteed order between them?" h={200}>
      <Row y={70} label="key one" value="partition A" />
      <Row y={130} label="key two" value="partition B" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealScope({ t }: StepCtx) {
  return (
    <Svg label="one partition, totally ordered; a second partition, totally ordered — and nothing linking the two" h={200}>
      <Row y={70} label="partition A" value="totally ordered" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="partition B" value="totally ordered" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRetry({}: StepCtx) {
  return (
    <Svg label="a failed batch retried, racing a later batch that succeeded immediately — which lands first?" h={200}>
      <Row y={70} label="first batch" value="failed, retried" />
      <Row y={130} label="second batch" value="succeeded instantly" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealIdempotence({ t }: StepCtx) {
  return (
    <Svg label="the same two batches, delivered order measured with and without idempotence" h={200}>
      <Row y={70} label="without idempotence" value="second lands first" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="with idempotence" value="order preserved" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFiveLimit({ t }: StepCtx) {
  return (
    <Svg label="the documented ceiling on in-flight requests for the ordering guarantee to hold" h={200}>
      <Row y={70} label="in-flight requests" value="up to five" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="order" value="preserved" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRepartition({ t }: StepCtx) {
  return (
    <Svg label="the same two keys, one moved and one unmoved, measured across a real partition-count change" h={200}>
      <Row y={70} label="one key" value="new partition" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="another key" value="same partition" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="without idempotence" value="reorders" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="with idempotence" value="preserved" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="repartition" value="one key moved" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="repartition" value="one key stayed" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="order within a partition, none across partitions, and a key-to-partition mapping that can quietly move" h={260}>
      <Row y={50} label="within a partition" value="total order" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="across partitions" value="no order" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="repartitioning" value="mapping can move" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
