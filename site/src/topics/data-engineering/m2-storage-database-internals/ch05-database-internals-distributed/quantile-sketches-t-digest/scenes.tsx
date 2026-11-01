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
    <Svg label="the same partitioned data, the same target percentile, two ways of computing it land on two different answers" h={200}>
      <Row y={70} label="average partitions" value="one answer" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="merge sketches" value="different answer" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictAveragingValid({ t }: StepCtx) {
  return (
    <Svg label="is averaging several partitions' own tail percentile a valid estimate of the whole dataset's real one?" h={200}>
      <Row y={70} label="average of parts" value="valid estimate?" />
      <Row y={130} label="true combined value" value="matches it?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCounterexample({ t }: StepCtx) {
  return (
    <Svg label="a real counterexample, computed on a real partitioned dataset, proves averaging wrong" h={200}>
      <Row y={70} label="real dataset" value="split in parts" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="exact value" value="computed directly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRankVsRelative({ t }: StepCtx) {
  return (
    <Svg label="a rank-error guarantee bounds a different thing entirely than a relative-error guarantee" h={200}>
      <Row y={70} label="rank error" value="bounds position" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="relative error" value="bounds the value" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMergedStaysValid({ t }: StepCtx) {
  return (
    <Svg label="a merged sketch stays a valid approximation of the true value; a naive average does not" h={200}>
      <Row y={70} label="naive average" value="drifts off" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="merged sketch" value="stays close" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMergeByDesign({ t }: StepCtx) {
  return (
    <Svg label="mergeability is a real, deliberate design choice named directly in these sketches' own papers" h={200}>
      <Row y={70} label="one sketch" value="combine, compress" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="built for this" value="not an accident" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRealEngines({ t }: StepCtx) {
  return (
    <Svg label="real engines and real tools each picked a different one of these sketches, named from their own sources" h={200}>
      <Row y={70} label="a warehouse" value="ships one sketch" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="an observability tool" value="ships another" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="averaging percentiles is wrong, rank error and relative error bound different things, mergeability is deliberate, real tools each picked one" h={260}>
      <Row y={50} label="averaging" value="measurably wrong" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="rank, relative error" value="bound different things" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a merged sketch" value="stays close" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="real tools" value="each picked one" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a dashboard averages each instance's own tail latency; users complain while the number looks fine — what's wrong?" h={200}>
      <Row y={70} label="averaged number" value="looks fine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one bad instance" value="hidden by average" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
