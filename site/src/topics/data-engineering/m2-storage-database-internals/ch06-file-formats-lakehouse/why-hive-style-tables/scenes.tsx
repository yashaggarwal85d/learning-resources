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
    <Svg label="a Hive-style table isn't a thing you commit to -- it's whatever a directory listing returns right now." h={200}>
      <TallRow y={40} label="the shop's order history" value="one directory per date, on disk" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="what is 'the table,' exactly?" value="just whatever LIST returns" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="is that ever wrong?" value="this topic reproduces the failure" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictValidation({ t }: StepCtx) {
  return (
    <Svg label="a writer inserts a row with event_date='2024-01-01' into the wrong partition directory -- does Hive catch it?" h={200}>
      <TallRow y={40} label="writer supplies a partition value" value="by hand, every insert" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does Hive check it against the row?" value="validated, or just trusted?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDirectoryPartition({ t }: StepCtx) {
  return (
    <Svg label="Hive's own example: table T, partitioned on ds and ctry, lands in /wh/T/ds=20090101/ctry=US." h={230}>
      <TallRow y={40} label="a partition is a sub-directory" value="named by column=value" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the writer supplies that value" value="trusted, never validated" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealStaleMetastore({ t }: StepCtx) {
  return (
    <Svg label="add or drop files on disk, and the metastore doesn't know -- until a sync." h={230}>
      <TallRow y={40} label="files change on disk" value="metastore metadata: unchanged" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a reader trusts stale metadata" value="until MSCK REPAIR TABLE runs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictAtomicCommit({ t }: StepCtx) {
  return (
    <Svg label="a write touches two partitions at once -- does it commit as one atomic unit?" h={200}>
      <TallRow y={40} label="an insert spans two partitions" value="date=2024-01-01 and date=2024-01-02" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="can a reader see one done, one not?" value="atomic across both, or not?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPartialWriteReproduced({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a listing taken mid-write sees partition A whole, partition B half-written." h={230}>
      <TallRow y={40} label="partition A: 4 files written" value="listing sees all 4" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="partition B: paused mid-write" value="listing sees 2 of 4 files" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDirtyReadMotivation({ t }: StepCtx) {
  return (
    <Svg label="this is exactly Hive's own documented reason for adding ACID: streaming writers, dirty reads, too many small files." h={230}>
      <TallRow y={40} label="streaming into a live partition" value="readers get dirty reads" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="many small files per partition" value="pressure on the NameNode" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealListingCost({ t }: StepCtx) {
  return (
    <Svg label="a real listing call gets slower as a directory fills with files -- measured at 100, 1,000 and 5,000." h={230}>
      <TallRow y={40} label="100 files, then 1000, then 5000" value="each listing call, timed for real" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="listing cost grows with file count" value="MSCK REPAIR scales the same way" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFixShape({ t }: StepCtx) {
  return (
    <Svg label="every problem traces back to one choice: using a LIST call as the table's state." h={230}>
      <TallRow y={40} label="no validation, stale metadata" value="symptoms of the same root cause" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="no atomic commit, slow listing" value="replace LIST with explicit state" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="directory-as-partition, no atomic multi-partition commit, listing cost that grows -- fixed by an explicit, versioned table state." h={300}>
      <TallRow y={35} label="a partition" value="a directory, named by value" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a commit" value="not atomic across partitions" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="table state" value="whatever LIST returns" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a mutable table on an immutable store
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          needs explicit state, not a directory listing
        </T>
      </g>
    </Svg>
  );
}
