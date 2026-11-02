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
    <Svg label="a manifest's column metrics were already read, straight off the file, as if they were exact." h={200}>
      <TallRow y={40} label="already read" value="a manifest's lower and upper bounds" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="they aren't always exact" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictBoundsTruncated({ t }: StepCtx) {
  return (
    <Svg label="a real column value is longer than iceberg stores in a bound. what happens to the bound?" h={200}>
      <TallRow y={40} label="a real column value" value="longer than the stored bound" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="stored in full, or truncated?" value="which one?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBoundsTruncatedForReal({ t }: StepCtx) {
  return (
    <Svg label="truncated, for real: a 200-byte value's bound is stored as 16 bytes, the upper bound's last byte bumped." h={230}>
      <TallRow y={40} label="real pyiceberg manifest" value="lower and upper bounds, both 16 bytes" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the real value" value="up to 200 bytes long" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSpecConfirmsTruncation({ t }: StepCtx) {
  return (
    <Svg label="the spec says it directly: string and binary bounds are never tight, because they may be truncated." h={230}>
      <TallRow y={40} label="the spec, directly" value="string and binary bounds are never tight" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a manifest bound" value="a safe range, not the real min/max" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictTableLevelNdv({ t }: StepCtx) {
  return (
    <Svg label="per-file stats are this limited. how does a planner get a real table-wide distinct count?" h={200}>
      <TallRow y={40} label="per-file stats are this limited" value="truncated, scattered across manifests" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="a table-wide distinct count" value="where does that come from?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPuffinSketchBuilt({ t }: StepCtx) {
  return (
    <Svg label="a real Puffin file, byte-exact to spec, holding a real sketch -- registered on the table for real." h={230}>
      <TallRow y={40} label="a real sidecar file" value="Magic, blob, footer -- byte-exact" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="registered on the table" value="through pyiceberg's own real API" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealReadBackAgainstTruth({ t }: StepCtx) {
  return (
    <Svg label="read back independently from raw bytes, and checked against the table's real distinct count." h={230}>
      <TallRow y={40} label="read back independently" value="raw bytes, no help from pyiceberg" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="checked against the truth" value="close, not exact" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPartitionStatsNamed({ t }: StepCtx) {
  return (
    <Svg label="partition statistics files are the same idea, one level down -- named here, not built." h={230}>
      <TallRow y={40} label="the same idea, one level down" value="partition statistics files" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="equally optional" value="a reader may ignore them too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOptimizerDependsOnIt({ t }: StepCtx) {
  return (
    <Svg label="a cost-based optimizer leans on exactly this: missing or wrong stats can pick the wrong join plan." h={230}>
      <TallRow y={40} label="a cost-based optimizer" value="picks a join order from these stats" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="stale or missing" value="a weaker plan, or a genuinely bad one" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="per-file stats are already there, truncated; a real sidecar file carries the whole-table picture instead." h={300}>
      <TallRow y={35} label="per-file column metrics" value="already in every manifest, truncated" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="whole-table statistics" value="a real Puffin sidecar, built and verified" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="partition statistics" value="the same idea, one level down" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          snapshots are already addressable by id;
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          next is giving some of them names
        </T>
      </g>
    </Svg>
  );
}
