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
    <Svg label="last topic was how far back a table lets you go -- this topic is what's underneath it." h={200}>
      <TallRow y={40} label="last topic" value="how far back a table lets you go" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="what if its files are small, and many?" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictSmallFilesCostExtra({ t }: StepCtx) {
  return (
    <Svg label="a streaming job commits one small file per micro-batch -- does that cost anything beyond the bytes?" h={200}>
      <TallRow y={40} label="one small file per micro-batch" value="same total bytes, many more files" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does that cost anything" value="beyond the bytes themselves?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealStreamingProducesManySmallFiles({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a streaming pattern writes 200 real small files for one partition." h={230}>
      <TallRow y={40} label="a real streaming micro-batch pattern" value="200 real small files written" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="400,000 bytes of data, one partition" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealMoreFilesMoreMetadata({ t }: StepCtx) {
  return (
    <Svg label="Iceberg's own words: more files means more metadata and slower file opens." h={230}>
      <TallRow y={40} label="more data files" value="more metadata stored in manifest files" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="and" value="less efficient queries from file open costs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealMetadataAndOpenCostMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: 200 small files cost real extra manifest bytes and real extra open overhead." h={230}>
      <TallRow y={40} label="a real fixed-width manifest entry" value="per file, a real fixed open cost" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="40,000 manifest bytes, 10,000 open-cost units" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealBinPackCompaction({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a bin-pack compaction repacks the same 200 files' real bytes into 10." h={230}>
      <TallRow y={40} label="the same 200 files' real bytes" value="repacked into 10 target-sized files" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="every byte survives, same order" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCostsCollapse({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: manifest bytes and open overhead collapse together -- the data never changes." h={230}>
      <TallRow y={40} label="file count drops 200 to 10" value="manifest bytes and open cost both" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="both collapse; data stays 400,000 bytes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictCompactingLivePartition({ t }: StepCtx) {
  return (
    <Svg label="a streaming job is still actively writing to a partition -- is compacting it right now a free action?" h={200}>
      <TallRow y={40} label="a streaming job is still writing" value="to the very partition being compacted" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="is compacting it right now" value="a free action, or a real conflict?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCompressionWorse({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the same bytes compress worse split into 200 files than as one stream." h={230}>
      <TallRow y={40} label="the same bytes, compressed" value="once per small file, or once as a whole" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="real measured result" value="split compresses worse than whole" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSchedulingAndManagedOfferings({ t }: StepCtx) {
  return (
    <Svg label="AWS's and Databricks' own words: compaction runs itself today, or it's a job someone schedules." h={230}>
      <TallRow y={40} label="managed, no manual intervention" value="S3 Tables, Databricks predictive optimization" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="self-run" value="Iceberg rewriteDataFiles, Delta OPTIMIZE" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="file count alone drives metadata and open cost; compaction collapses both without touching the data." h={300}>
      <TallRow y={35} label="many small files" value="cost real metadata and open overhead" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a bin-pack compaction" value="collapses both, byte for byte" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="today" value="it runs itself, or someone schedules it" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          file count is its own cost
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          independent of the data inside it
        </T>
      </g>
    </Svg>
  );
}
