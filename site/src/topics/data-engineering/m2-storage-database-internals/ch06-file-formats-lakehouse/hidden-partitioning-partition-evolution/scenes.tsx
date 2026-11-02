import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the tree already prunes by partition tuple -- but only if the query never has to name the column." h={200}>
      <TallRow y={40} label="the tree prunes by partition tuple" value="as long as a query never names the column" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="hidden partitioning, built and evolved for real" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictFilterOnSourceColumn({ t }: StepCtx) {
  return (
    <Svg label="a table partitioned by day(event_time) -- a query filters on event_time directly, never the partition." h={200}>
      <TallRow y={40} label="partitioned by day(event_time)" value="a query filters on event_time itself" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does it still prune" value="or does it have to scan everything?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTransformsHidePartitionColumn({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: Iceberg derives the partition value by a transform it tracks itself." h={230}>
      <TallRow y={40} label="identity, bucket[N], truncate[W], day, hour" value="derived from a real column, tracked by Iceberg" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the query" value="never has to name the derived column at all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSpecEvolvedMidLife({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a table's partition spec evolved mid-life, from day(ts) to hour(ts) plus a bucket." h={230}>
      <TallRow y={40} label="real measured result" value="spec changes to an hour and a bucket rule" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="without rewriting" value="a single existing file" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOldDataUntouched({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the old era's files are still on disk, still tagged with the old spec id." h={230}>
      <TallRow y={40} label="real measured result" value="old-era files still tagged with the old spec id" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="evolving the spec" value="touched zero existing data" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictOldEraPruning({ t }: StepCtx) {
  return (
    <Svg label="a query by id, never naming any transform -- the match lives in the old era, under the old spec. still prunes?" h={200}>
      <TallRow y={40} label="a query asks for one row by id" value="the match lives in the old era" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="written under the old spec" value="does it still prune to one file?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBothErasPrune({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a source-column query prunes to one file, in either era, under its own spec." h={230}>
      <TallRow y={40} label="real measured result" value="1 file planned in the old era, 1 in the new" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="each manifest" value="planned under its own real spec" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealV3MultiArgument({ t }: StepCtx) {
  return (
    <Svg label="v3 extends this with multi-argument transforms -- more than one source column, one partition field." h={230}>
      <TallRow y={40} label="v3 adds multi-argument transforms" value="more than one source column, one field" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="named here" value="as the current extension, not built" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealFullScanBothEras({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a full scan across both eras reads every row correctly." h={230}>
      <TallRow y={40} label="real measured result" value="every row read correctly, across both eras" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the tree doesn't care" value="that a manifest's spec is no longer the default" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="hidden partitioning: the query names a column, never a transform -- and evolution never rewrites old data." h={300}>
      <TallRow y={35} label="Iceberg derives the partition value" value="a query names the column, not the transform" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a spec evolves mid-life" value="without rewriting a single old file" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="each manifest" value="planned under the spec it was written with" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          hidden partitioning prunes whole files;
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          a single file's own rows need deletes
        </T>
      </g>
    </Svg>
  );
}
