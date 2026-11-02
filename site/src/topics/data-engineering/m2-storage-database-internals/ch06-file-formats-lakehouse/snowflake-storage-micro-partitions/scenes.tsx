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
    <Svg label="every engine so far reads a table this chapter owns. the first one this sandbox can't run at all: snowflake." h={200}>
      <TallRow y={40} label="every engine so far" value="read a table this chapter built and owns itself" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the first one this sandbox can't run at all" value="snowflake's own proprietary storage" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictPartitionDefinition({ t }: StepCtx) {
  return (
    <Svg label="a table's rows: split into partitions a person defines, or something else entirely?" h={200}>
      <TallRow y={40} label="every table has to be split up somehow" value="rows grouped into storage units" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="defined by a person up front, or something else?" value="which is it, in snowflake?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMicroPartitions({ t }: StepCtx) {
  return (
    <Svg label="immutable micro-partitions, fifty to five hundred megabytes uncompressed, derived automatically, never defined by hand." h={230}>
      <TallRow y={40} label="immutable, columnar, fifty to five hundred megabytes" value="snowflake's own unit of storage" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="derived automatically" value="never defined by a person" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPruning({ t }: StepCtx) {
  return (
    <Svg label="per-column metadata on every micro-partition lets a query skip the ones it doesn't need at all." h={230}>
      <TallRow y={40} label="per-column metadata, kept for every micro-partition" value="snowflake's own documentation, word for word" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="precise pruning at query run time" value="whole micro-partitions skipped, not scanned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealClusteringAutomatic({ t }: StepCtx) {
  return (
    <Svg label="clustering depth measures the overlap; automatic clustering reclusters in the background, on its own." h={230}>
      <TallRow y={40} label="clustering depth" value="how much overlap is left to prune around" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="automatic clustering" value="reclusters in the background" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictPointLookup({ t }: StepCtx) {
  return (
    <Svg label="a point lookup on a high-cardinality column. does pruning and clustering alone make it fast?" h={200}>
      <TallRow y={40} label="a point lookup, one needle in a huge table" value="on a column with countless distinct values" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="pruning and clustering alone, or something else?" value="which handles it?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSearchOptimization({ t }: StepCtx) {
  return (
    <Svg label="a separate service: search optimization, built for point lookups, not range scans." h={230}>
      <TallRow y={40} label="something else: the search optimization service" value="a different mechanism" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="point-lookup and substring queries" value="snowflake's own documentation, word for word" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealTimeTravelFailSafe({ t }: StepCtx) {
  return (
    <Svg label="because micro-partitions are never overwritten, old versions survive -- time travel, then a last-resort fail-safe window." h={230}>
      <TallRow y={40} label="micro-partitions are never overwritten in place" value="the old version simply survives, unchanged" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="time travel, then fail-safe" value="a window, then a last resort" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCloneAndShare({ t }: StepCtx) {
  return (
    <Svg label="a clone and a share both point at the same immutable files -- no bytes copied, nothing moved." h={230}>
      <TallRow y={40} label="a zero-copy clone" value="shares the source's own underlying storage" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="secure data sharing" value="no actual data copied or transferred, ever" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one immutable design: pruning, clustering, time travel, cloning and sharing, all consequences of it. next: bigquery." h={300}>
      <TallRow y={35} label="one design: the immutable micro-partition" value="sourced entirely from snowflake's own docs" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="pruning and clustering read it" value="time travel, cloning and sharing all lean on it" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="a second engine built on infrastructure" value="this sandbox can only read about, not run" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a second proprietary storage design --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          bigquery's dremel execution over colossus
        </T>
      </g>
    </Svg>
  );
}
