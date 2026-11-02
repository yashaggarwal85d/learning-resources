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
    <Svg label="a well-laid-out table of snapshots is still just a sequence of point-in-time states." h={200}>
      <TallRow y={40} label="so far" value="a table of point-in-time snapshots" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="reading that sequence itself as data" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictCompactionZeroOrSpurious({ t }: StepCtx) {
  return (
    <Svg label="a compaction merges two files, touching no row's value -- does a changelog scan report zero changes?" h={200}>
      <TallRow y={40} label="a compaction merges two files" value="touches no row's value" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does a changelog scan report" value="zero changes, or a pile of deletes and inserts?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRowLineageFields({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a stable _row_id and a _last_updated_sequence_number that only moves on change." h={230}>
      <TallRow y={40} label="every row gets" value="a stable _row_id, assigned once" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="_last_updated_sequence_number" value="moves only when the value actually changes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealNaiveScanOnUpdate({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a naive changelog scan on a real copy-on-write update." h={230}>
      <TallRow y={40} label="ten-row file, one real value change" value="a naive scan diffs by file, not by row" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="10 deletes and 10 inserts, for 1 real change" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealLineageScanOnUpdate({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the same update, scanned by matching _row_id instead of by file." h={230}>
      <TallRow y={40} label="match rows by _row_id" value="not by which file they happen to live in" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="exactly 1 real change found, the rest filtered" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictCompactionScaleUp({ t }: StepCtx) {
  return (
    <Svg label="scale it up: the same naive scan on a real compaction merging two ten-row files." h={200}>
      <TallRow y={40} label="two ten-row files compact into one" value="zero values change" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="the naive, file-diffing scan" value="how many changes does it report?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCompactionMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: compaction, measured by both scans." h={230}>
      <TallRow y={40} label="real measured result" value="naive scan: 40 changes for zero real ones" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="row-lineage scan" value="0 -- every row recognized as a carry-over" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDeltaHudiSameIdea({ t }: StepCtx) {
  return (
    <Svg label="Delta's Change Data Feed and Hudi's incremental queries: the same idea, their own vocabulary." h={230}>
      <TallRow y={40} label="Delta Change Data Feed" value="tags every change by its real kind" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="Hudi hudi_table_changes" value="a full-history mode, and a cheaper one" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealIncrementalScanAppendOnly({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: Iceberg's own plain incremental scan, appends only." h={230}>
      <TallRow y={40} label="start snapshot, exclusive" value="end snapshot, inclusive" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="reads appends; raises on a compaction" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a naive scan sees every rewritten row as changed; row identity tells a rewrite from a real change." h={300}>
      <TallRow y={35} label="a stable _row_id" value="tells a rewrite from a real change" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a naive, file-diffing scan" value="reports every rewritten row as changed" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="Delta and Hudi" value="name the same idea in their own vocabulary" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          downstream CDC needs row identity,
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          not just a before-and-after diff
        </T>
      </g>
    </Svg>
  );
}
