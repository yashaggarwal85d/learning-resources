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
    <Svg label="halving the commit interval roughly doubles the file count, on the same volume" h={200}>
      <Row y={70} label="commit interval" value="cut in half" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="file count" value="about doubles" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="every engine's output has to land somewhere queryable, eventually" h={200}>
      <Row y={70} label="every engine" value="ends up somewhere" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="the first destination" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFileCount({}: StepCtx) {
  return (
    <Svg label="commit twice as often, same volume — what happens to the file count?" h={200}>
      <Row y={70} label="commit twice" value="as often" />
      <Row y={130} label="file count" value="does what?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCommitCadence({ t }: StepCtx) {
  return (
    <Svg label="twice the commit frequency, exactly twice the files, half the staleness" h={200}>
      <Row y={70} label="twice the commits" value="twice the files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="half the staleness" value="too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAutomatedVsHandbuilt({ t }: StepCtx) {
  return (
    <Svg label="automated materialisation or a hand-built sink, same destination either way" h={200}>
      <Row y={70} label="automated" value="tableflow, redpanda" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="hand-built" value="flink or spark" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSinkCheckpoint({ t }: StepCtx) {
  return (
    <Svg label="a sink's commit is tied to the processor's own checkpoint interval" h={200}>
      <Row y={70} label="a sink's commit" value="tied to checkpoint" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="exactly-once" value="same checkpoint" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictAbsorb({}: StepCtx) {
  return (
    <Svg label="shorter intervals always cost more files — what could absorb that without slowing down?" h={200}>
      <Row y={70} label="shorter interval" value="always costs more" />
      <Row y={130} label="what absorbs it" value="without slowing down" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLSMBuffer({ t }: StepCtx) {
  return (
    <Svg label="the same cadence, run through a buffer, lands far fewer files" h={200}>
      <Row y={70} label="same cadence" value="through a buffer" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="far fewer files" value="land" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStreamingFirstStorage({ t }: StepCtx) {
  return (
    <Svg label="paimon's lsm layer and fluss both answer the same trade-off from storage" h={200}>
      <Row y={70} label="paimon's lsm layer" value="absorbs small writes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="fluss" value="sits in front" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNoFreeSetting({ t }: StepCtx) {
  return (
    <Svg label="automated, hand-built, or streaming-first — the same trade-off gets paid somewhere" h={200}>
      <Row y={70} label="automated, hand-built" value="or streaming-first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same trade-off" value="paid somewhere" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="double the commits" value="double the files" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="same cadence" value="compacted, fewer files" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="freshness" value="unchanged either way" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="commit cadence sets freshness and file count together, three places to pay the cost" h={260}>
      <Row y={50} label="commit cadence" value="sets both" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="three places" value="pay the cost" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="next" value="the other destination" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
