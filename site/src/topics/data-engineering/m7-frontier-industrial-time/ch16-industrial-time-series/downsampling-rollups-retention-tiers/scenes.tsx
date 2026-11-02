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
    <Svg label="a daily mean built from averaging hourly means disagrees with the raw mean, because a restart hour's tiny sample count was weighted equally with every full hour" h={200}>
      <Row y={70} label="restart hour" value="few samples" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="daily mean" value="weighted wrong" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMergeableAggregates({ t }: StepCtx) {
  return (
    <Svg label="a minimum, a maximum, a sum and a count can each be merged from two rollups into the rollup of their union; a quantile can't be merged this way at all" h={220}>
      <Row y={55} label="min, max" value="merge cleanly" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="sum, count" value="merge cleanly" valueColor={C.second} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="a quantile" value="no merge rule" valueColor={C.badText} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictMerge({ t }: StepCtx) {
  return (
    <Svg label="two hourly rollups, storing sum and count instead of an average, are merged into one — does the merged result equal computing directly from every raw reading?" h={200}>
      <Row y={70} label="merge two rollups" value="matches raw?" />
      <Row y={130} label="or" value="close, not exact?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMergedExactly({ t }: StepCtx) {
  return (
    <Svg label="the merged sum and count equal the raw total and count exactly, so the derived mean matches — the naive average of hourly averages does not come close" h={200}>
      <Row y={70} label="merged sum, count" value="exact match" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="average of averages" value="far off" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLateData({ t }: StepCtx) {
  return (
    <Svg label="a reading arriving after its bucket was already materialized changes that bucket's max, count and mean — only the one affected bucket is recomputed" h={200}>
      <Row y={70} label="late reading" value="reopens its bucket" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="other buckets" value="untouched" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeTiers({ t }: StepCtx) {
  return (
    <Svg label="raw for days, minute rollups for months, hour rollups for years; a short query reads raw, a long one reads the coarsest tier, and a spanning query stitches both" h={260}>
      <Row y={50} label="raw" value="days" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="minute rollup" value="months" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="hour rollup" value="years" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={190} label="spanning query" value="stitches tiers" valueColor={C.second} o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function RevealSpike({ t }: StepCtx) {
  return (
    <Svg label="a single real spike in one bucket barely moves that bucket's mean, while the same bucket's max shows the spike exactly" h={200}>
      <Row y={70} label="the mean" value="barely moves" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the max" value="shows it exactly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="only mergeable aggregates survive a rollup, a late reading reopens its bucket, a spanning query stitches tiers, and a mean and a max keep different truths" h={260}>
      <Row y={50} label="mergeable only" value="survives a rollup" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="late reading" value="reopens bucket" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="spanning query" value="stitches tiers" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="mean, max" value="different truths" valueColor={C.badText} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a dashboard reports a daily mean with no record of how many samples went into each hour behind it — is that daily number trustworthy on its own?" h={200}>
      <Row y={70} label="daily mean" value="no counts shown" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="thin, full hour" value="look the same" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
