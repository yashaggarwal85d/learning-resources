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
    <Svg label="one thousand real records, two producers — one at linger.ms zero, one at Kafka's own default — how many requests does each send?" h={200}>
      <Row y={70} label="linger.ms zero" value="1,000 requests" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="linger.ms five" value="500 requests" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="one partition's accumulator — a byte-limit line and a linger clock, both still empty" h={200}>
      <Row y={70} label="batch.size line" value="not reached yet" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="linger clock" value="still ticking" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBatchClose({}: StepCtx) {
  return (
    <Svg label="the linger clock just ran out, and the buffer is still under its byte limit — what happens to the batch?" h={200}>
      <Row y={70} label="the buffer" value="under the limit" />
      <Row y={130} label="the linger clock" value="just ran out" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBatchRace({ t }: StepCtx) {
  return (
    <Svg label="the same one thousand records, run twice — fewer, larger batches at the real default linger setting" h={200}>
      <Row y={70} label="requests, linger zero" value="1,000" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="requests, linger five" value="500, half as many" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCompression({ t }: StepCtx) {
  return (
    <Svg label="the same compressor, run once on a lone record and once on a full batch of the same shape" h={200}>
      <Row y={70} label="one record, compressed" value="1.3x smaller" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a full batch, compressed" value="12.8x smaller" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStickyPartition({}: StepCtx) {
  return (
    <Svg label="no key, three partitions — sticking to one partition per batch instead of round-robin: bigger batches, or smaller?" h={200}>
      <Row y={70} label="round-robin" value="scatters every record" />
      <Row y={130} label="sticky" value="bigger, or smaller?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStickyFill({ t }: StepCtx) {
  return (
    <Svg label="the identical nine hundred keyless records, routed two ways into the same three partitions" h={200}>
      <Row y={70} label="round-robin, avg batch" value="2.0 records" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sticky, avg batch" value="5.0 records" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAcksCrash({ t }: StepCtx) {
  return (
    <Svg label="a toy leader crash — how many records each acks level believed were safe, and how many it actually kept" h={200}>
      <Row y={70} label="acks=1, lost" value="8 of 201 believed safe" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="acks=all, lost" value="0 of 193 believed safe" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={50} label="requests, linger zero vs five" value="1,000 vs 500" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="zstd ratio, record vs batch" value="1.3x vs 12.8x" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="avg batch, round-robin vs sticky" value="2.0 vs 5.0" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="records lost, acks=1 vs acks=all" value="8 vs 0" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an accumulator that races a byte limit against a clock, compression that rewards batching, a sticky partitioner, and an acks level that decides what durable means" h={260}>
      <Row y={50} label="a batch" value="races two limits, real" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="compression" value="rewards bigger batches" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="sticky partitioning" value="fewer, fuller batches" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="acks" value="decides what 'durable' means" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}
