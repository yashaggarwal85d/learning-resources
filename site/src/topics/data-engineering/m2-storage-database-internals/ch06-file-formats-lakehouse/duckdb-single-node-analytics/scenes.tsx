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
    <Svg label="a dedicated server, still a system to run. the opposite extreme: no server process at all. duckdb." h={200}>
      <TallRow y={40} label="a dedicated server, still a system to run" value="however fast, it's a second system to operate" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the opposite extreme" value="no server process at all" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictDataFrameExport({ t }: StepCtx) {
  return (
    <Svg label="a pandas dataframe sits in the same process. export it first, or query it directly?" h={200}>
      <TallRow y={40} label="a pandas dataframe, in the same process" value="already sitting right there" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="export it first, or query it directly?" value="which does duckdb need?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDataFrameInterop({ t }: StepCtx) {
  return (
    <Svg label="a real pandas sum and a real polars sum, both queried directly, for real, no export step." h={230}>
      <TallRow y={40} label="queried directly, for real" value="a real pandas sum, a real polars sum" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="no export step, no import step" value="a replacement scan reads the object itself" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealVectorizedMorsel({ t }: StepCtx) {
  return (
    <Svg label="the identical aggregation, real wall-clock time, four threads well ahead of one." h={230}>
      <TallRow y={40} label="a whole batch of values per operation" value="columnar, vectorized, not row by row" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the identical aggregation, real time measured" value="four threads well ahead of one, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictOverMemoryLimit({ t }: StepCtx) {
  return (
    <Svg label="a sort bigger than the configured memory limit. does the query fail, or finish anyway?" h={200}>
      <TallRow y={40} label="a sort bigger than the memory limit" value="configured on purpose, for real" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does the query fail, or finish anyway?" value="which happens?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOutOfCoreSpill({ t }: StepCtx) {
  return (
    <Svg label="real spill files land on disk, under the memory limit, and the full row count still comes back right." h={230}>
      <TallRow y={40} label="real spill files, written to disk" value="under a configured memory limit, for real" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the query still finishes" value="the full row count comes back correct" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealIcebergDirectQuery({ t }: StepCtx) {
  return (
    <Svg label="a real local iceberg table, queried directly -- the filter pushed into the parquet scan itself, for real." h={230}>
      <TallRow y={40} label="a real local iceberg table" value="no catalog server, no cluster, for real" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the filter pushed into the scan itself" value="a real plan, a real small slice of bytes read" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeltaDirectQuery({ t }: StepCtx) {
  return (
    <Svg label="the identical shape against a real local delta table -- no spark anywhere, same correct count." h={230}>
      <TallRow y={40} label="a real local delta table" value="no spark anywhere, for real" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the same direct, in-process query" value="the same correct filtered count" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDuckLakeCatalog({ t }: StepCtx) {
  return (
    <Svg label="two real writes become two real, independently queryable versioned snapshots -- the catalog is just sql." h={230}>
      <TallRow y={40} label="a catalog stored as ordinary sql tables" value="not a rest protocol, for real" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="two real writes" value="two real, independently queryable snapshots" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="in-process, vectorized, morsel-parallel, spills when it must, reads iceberg, delta and ducklake directly. next: snowflake." h={300}>
      <TallRow y={35} label="in-process, no server at all" value="vectorized, morsel-parallel, for real" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="spills to disk when it must" value="reads this chapter's own tables directly" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="every engine so far owns its table" value="the next one, this sandbox can't run at all" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          the cloud data warehouses, starting with --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          snowflake's own proprietary storage
        </T>
      </g>
    </Svg>
  );
}
