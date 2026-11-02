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
    <Svg label="a snapshot has been treated as one thing to reach for -- it is actually a tree." h={200}>
      <TallRow y={40} label="so far" value="a snapshot, reached for as one thing" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="opening the tree a scan actually walks" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictOpenAllManifests({ t }: StepCtx) {
  return (
    <Svg label="five partitions, one day each -- does a reader open every manifest to find one day's rows?" h={200}>
      <TallRow y={40} label="a table with 5 day-partitions" value="a reader wants just one day's rows" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does it have to open" value="every manifest to find out which match?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRealTree({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a real pyiceberg table's metadata.json, manifest list, and manifests." h={230}>
      <TallRow y={40} label="metadata.json" value="schemas, partition specs, sort orders, refs" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="points to a manifest list" value="which points to manifests" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSequenceNumbers({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: every manifest and file inherits its snapshot's sequence number." h={230}>
      <TallRow y={40} label="5 real commits, read back" value="sequence numbers 1, 2, 3, 4, 5" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="in order, no gaps" value="every change has a total order" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealManifestSummaries({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: per-manifest partition summaries, per-file partition tuples and column metrics." h={230}>
      <TallRow y={40} label="the manifest list" value="carries a summary for each manifest" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="each manifest" value="carries a partition tuple and metrics per file" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictPruningReal({ t }: StepCtx) {
  return (
    <Svg label="does planning actually skip manifests outside the target partition, or filter rows after opening all of them?" h={200}>
      <TallRow y={40} label="scale the question up" value="filter a scan to one day's partition" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does planning skip manifests" value="or open all five and filter after?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPruningMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: planning prunes manifests by partition summary before any file is touched." h={230}>
      <TallRow y={40} label="real measured result" value="unfiltered: 5 files planned" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="filtered to one day" value="exactly 1 file planned, 4 manifests pruned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealManifestBloat({ t }: StepCtx) {
  return (
    <Svg label="small streaming-style commits leave one manifest each -- bloat, one level up the tree." h={230}>
      <TallRow y={40} label="one small commit at a time" value="each leaves its own one-manifest snapshot" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="as many manifests as commits" value="the same bloat, one level up the tree" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealRewriteManifests({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a real rewrite_manifests merges five one-manifest commits into one." h={230}>
      <TallRow y={40} label="real measured result" value="5 manifests before the rewrite" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="after the real rewrite" value="1 manifest, same rows, new live snapshot" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a snapshot is a tree; planning prunes it level by level before any file is read." h={300}>
      <TallRow y={35} label="metadata.json to manifest list to manifests" value="a real tree, not one flat thing" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="planning prunes manifests first" value="then files, by partition and column metrics" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="many small commits" value="bloat the tree one manifest at a time" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a query prunes this tree by partition tuple,
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          as long as it never has to name the column
        </T>
      </g>
    </Svg>
  );
}
