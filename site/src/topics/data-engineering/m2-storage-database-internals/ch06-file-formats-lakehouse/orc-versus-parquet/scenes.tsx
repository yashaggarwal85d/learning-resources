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
    <Svg label="one immutable Parquet file, and the one rival that made nearly every choice differently." h={200}>
      <TallRow y={40} label="Parquet" value="row groups, column chunks, pages" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="ORC" value="stripes, streams, a built-in row index" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="same 100,000 rows" value="does the layout change what a query reads?" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictRowIndex({ t }: StepCtx) {
  return (
    <Svg label="no configuration on either side — does ORC's own row index prune finer than Parquet's bare row-group stats?" h={200}>
      <TallRow y={40} label="ORC row index" value="10,000 rows per entry, always present" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="Parquet row-group stats" value="finer, the same, or coarser by default?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealStripeLayout({ t }: StepCtx) {
  return (
    <Svg label="each ORC column is several named streams, index streams first, data streams after." h={230}>
      <TallRow y={40} label="PRESENT, DATA streams" value="one column, placed next to each other" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="index streams" value="always first — skipped on a plain scan" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOrcIndex({ t }: StepCtx) {
  return (
    <Svg label="100,000 rows, a selective query: ORC's fixed row index reads 10,000, Parquet's bare row-group stats read 25,000." h={230}>
      <TallRow y={40} label="ORC row index (10,000/entry)" value="10,000 rows read" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="Parquet row-group stats (25,000/group)" value="25,000 rows read" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictPageIndex({ t }: StepCtx) {
  return (
    <Svg label="can Parquet still beat ORC's fixed 10,000-row granularity?" h={200}>
      <TallRow y={40} label="ORC's fixed default" value="10,000 rows, no configuration" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="Parquet's own page index" value="opt-in — can it go finer?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPageIndexFiner({ t }: StepCtx) {
  return (
    <Svg label="Parquet's page index, once turned on, prunes to 2,500 rows — finer than ORC's fixed default." h={230}>
      <TallRow y={40} label="Parquet page index (2,500/page)" value="2,500 rows read" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="the cost" value="4x ORC's row-index metadata bytes" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMeasuredSynthesis({ t }: StepCtx) {
  return (
    <Svg label="rows read and index bytes, measured, all three ways." h={260}>
      <TallRow y={35} label="ORC row index" value="10,000 rows read, 200 index bytes" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="Parquet, row-group only" value="25,000 rows read, 80 index bytes" o={easeOut(seg(t, 0.25, 0.6))} />
      <TallRow y={165} label="Parquet, page index on" value="2,500 rows read, 800 index bytes" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealAcidHistory({ t }: StepCtx) {
  return (
    <Svg label="Hive's own zero-point-thirteen release added row-level ACID transactions — but only ORC got the integration work." h={230}>
      <TallRow y={40} label="before that release" value="only partition-level atomicity/durability" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="row-level ACID, from that release on" value="shipped only for ORC" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealWhyParquetWon({ t }: StepCtx) {
  return (
    <Svg label="Parquet was built to be used by any framework — and the lakehouse table formats chose it first." h={230}>
      <TallRow y={40} label="Parquet's own design goal" value='"used by anyone," no framework favored' o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="ORC today" value="legacy Hive tables, some Trino estates" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ORC's fixed index beats a bare row-group default; Parquet's own opt-in index beats ORC's fixed one; the ecosystem picked Parquet anyway." h={300}>
      <TallRow y={35} label="ORC" value="stripes, streams, a fixed 10,000-row index" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="Parquet" value="row groups, an opt-in, finer page index" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="why Parquet won the lakehouse" value="framework-neutral, chosen first" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a fixed index needs no configuration —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          an opt-in one can still prune finer
        </T>
      </g>
    </Svg>
  );
}
