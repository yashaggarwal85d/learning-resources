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
    <Svg label="file size is only half of what makes a statistic useful -- this topic is the other half: layout." h={200}>
      <TallRow y={40} label="last topic" value="what small files cost, and compaction" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="are the rows inside laid out to prune?" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictSortOneColumnHelpsTwo({ t }: StepCtx) {
  return (
    <Svg label="a table is sorted by column A only -- does that help a predicate filtering on both A and B?" h={200}>
      <TallRow y={40} label="a table is sorted by column A only" value="a predicate filters on A and B" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does the sort help" value="fully, or only partly?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeLayoutsSameRows({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the same 256 rows, three different physical orders." h={230}>
      <TallRow y={40} label="the same real dataset" value="arrival order, linear sort, real Z-order" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="same 256 rows, genuinely different order" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealRowGroupBoundsComputed({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: row-group bounds computed directly from the real row data." h={230}>
      <TallRow y={40} label="sixteen real row groups per layout" value="min and max of A and B, per group" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="a linear sort's groups align to one A value" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPredicatePruningMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the identical two-column predicate, measured against each layout." h={230}>
      <TallRow y={40} label="the same predicate, three layouts" value="arrival order, linear sort, Z-order" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="16, then 4, then 1 group out of 16" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictLiquidClusteringRewritesEverything({ t }: StepCtx) {
  return (
    <Svg label="does liquid clustering rewrite the whole table every time new data arrives?" h={200}>
      <TallRow y={40} label="new data arrives into a clustered table" value="does clustering rewrite all of it?" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="always rewrite everything" value="or only what's needed?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeFormatsSameIdea({ t }: StepCtx) {
  return (
    <Svg label="Delta's, Iceberg's, and Hudi's own words: three formats, the same one idea." h={230}>
      <TallRow y={40} label="liquid clustering, sort orders, clustering" value="three formats' names for the same idea" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the idea" value="lay out rows by what a query filters on" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealIncrementalVsFullReclustering({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: incremental vs. full reclustering, measured by rows actually rewritten." h={230}>
      <TallRow y={40} label="new rows land in one existing group" value="incremental rewrites only that group" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="32 rows incremental, 272 rows full" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a linear sort prunes on its leading column; a real Z-order prunes on every column at once." h={300}>
      <TallRow y={35} label="a linear sort order" value="only prunes on its leading column" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a real Z-order" value="prunes on every column in the predicate" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="reclustering" value="can be incremental, or a full rewrite" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          layout decides whether a statistic
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          actually prunes a multi-column query
        </T>
      </g>
    </Svg>
  );
}
