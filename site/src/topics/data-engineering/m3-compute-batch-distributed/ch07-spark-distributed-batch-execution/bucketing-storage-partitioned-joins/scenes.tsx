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
    <Svg label="two tables, already split the same way at write time. Does the join skip the shuffle entirely?" h={200}>
      <Row y={70} label="both tables, same key, pre-split" value="free join?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="actual shuffle at join time" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMatchedBuckets({ t }: StepCtx) {
  return (
    <Svg label="measured: zero Exchange at all. Both scans are tagged as a bucketed read." h={200}>
      <Row y={70} label="same key, same bucket count" value="zero shuffle" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both sides' own scan" value="tagged bucketed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMismatchedCount({ t }: StepCtx) {
  return (
    <Svg label="same join key, but the two tables don't agree on how many buckets. Still free?" h={200}>
      <Row y={70} label="same key, different bucket count" value="still free?" />
      <Row y={130} label="actual shuffle at join time" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMismatchDisablesBoth({ t }: StepCtx) {
  return (
    <Svg label="measured: one real shuffle. The side that still matches on its own loses its bucketed read too." h={200}>
      <Row y={70} label="bucket counts disagree" value="one real shuffle" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="still-matching side's scan" value="bucketing disabled" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDsv2Table({ t }: StepCtx) {
  return (
    <Svg label="a DSv2 table, like Iceberg, partitioned the same way. Same bucketing mechanism underneath, or something else?" h={200}>
      <Row y={70} label="DSv2 table, own partitioning" value="same mechanism?" />
      <Row y={130} label="what avoids the shuffle" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStoragePartitionedJoin({ t }: StepCtx) {
  return (
    <Svg label="sourced: a different mechanism entirely. The table's own reported layout, not a bucketBy call." h={200}>
      <Row y={70} label="storage-partitioned join" value="reuses own layout" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no bucketBy call anywhere" value="still zero Exchange" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="bucketing pre-splits at write time; the match has to be exact; SPJ generalises the same idea to a table's own layout." h={280}>
      <Row y={50} label="matching buckets" value="zero shuffle" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="mismatched count" value="one shuffle, both lose it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="SPJ" value="own layout, no bucketBy" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
