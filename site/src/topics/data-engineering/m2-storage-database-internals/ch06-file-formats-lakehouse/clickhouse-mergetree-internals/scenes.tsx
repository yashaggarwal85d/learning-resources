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
    <Svg label="trino owns no storage of its own. what if the engine owned it directly? clickhouse." h={200}>
      <TallRow y={40} label="trino owns no storage of its own" value="every byte belongs to someone else's format" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="what if the engine owned it directly?" value="clickhouse's own mergetree" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictPartsOrRewrite({ t }: StepCtx) {
  return (
    <Svg label="two separate inserts land on a table. one growing file, or two separate files?" h={200}>
      <TallRow y={40} label="two separate inserts land" value="on the same mergetree table" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="one growing file, or two separate ones?" value="which is it?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealImmutableParts({ t }: StepCtx) {
  return (
    <Svg label="two separate, immutable parts, for real. a real merge collapses them to one, same row count." h={230}>
      <TallRow y={40} label="two separate, immutable parts" value="confirmed for real, via chdb" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a real merge collapses them to one" value="the row count never changes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSparsePrimaryIndex({ t }: StepCtx) {
  return (
    <Svg label="an hour-wide range over two hundred thousand rows reads one of twenty-four granules, for real." h={230}>
      <TallRow y={40} label="an hour-wide range, real data" value="two hundred thousand rows total" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="one of twenty-four granules read" value="the sparse primary index, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictNonSortedColumn({ t }: StepCtx) {
  return (
    <Svg label="a filter on a column that isn't the sort key. scan everything, or still skip most of it?" h={200}>
      <TallRow y={40} label="a filter on a column" value="that isn't the sort key at all" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="scan everything, or still skip most of it?" value="which happens?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMinmaxSkipIndex({ t }: StepCtx) {
  return (
    <Svg label="a real minmax index still prunes most granules, on a column the sort order never touches." h={230}>
      <TallRow y={40} label="a real minmax index" value="on the non-sorted column" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="most granules pruned anyway" value="a second, independent skip mechanism" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealMaterializedView({ t }: StepCtx) {
  return (
    <Svg label="a materialized view fires as a real insert trigger -- no query needed against the source." h={230}>
      <TallRow y={40} label="insert into the source table" value="no query runs against it at all" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the aggregate target updates itself" value="a real insert trigger, not a refresh" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealReplacingMergeTree({ t }: StepCtx) {
  return (
    <Svg label="two versions of one row both stay visible until a real merge collapses them to the latest." h={230}>
      <TallRow y={40} label="two versions of the same row" value="both visible, before any merge" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a real merge collapses them" value="the latest version survives" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealLightweightDelete({ t }: StepCtx) {
  return (
    <Svg label="a real lightweight delete drops the row count immediately, by marking rows, not rewriting the table." h={230}>
      <TallRow y={40} label="a real lightweight delete" value="the row count drops immediately" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="rows are marked, not rewritten" value="the physical rewrite waits for a merge" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real engine owning its own storage: parts, two skip mechanisms, an insert trigger, real merges. next: duckdb." h={300}>
      <TallRow y={35} label="a real engine, owning its own storage" value="immutable parts, two skip mechanisms" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="an insert-triggered view" value="real merge semantics throughout" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="a dedicated server, still a system to run" value="the next engine has no server at all" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          no server process at all --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          duckdb runs inside the query itself
        </T>
      </g>
    </Svg>
  );
}
