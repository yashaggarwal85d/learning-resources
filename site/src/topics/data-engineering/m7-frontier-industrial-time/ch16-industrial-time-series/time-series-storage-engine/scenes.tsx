import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a crashed server replays its write-ahead log for over ten minutes before it's ready, while a second server restored from a file-copy backup is missing hours no WAL could replay" h={200}>
      <Row y={70} label="WAL replay" value="long restart" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="file-copy backup" value="hours missing" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHeadWal({ t }: StepCtx) {
  return (
    <Svg label="Prometheus keeps the current block in memory secured by a write-ahead log, and the documented capacity formula run against the plant's own series count gives the disk this needs" h={200}>
      <Row y={70} label="head block" value="in memory" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="capacity formula" value="disk needed" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCompaction({ t }: StepCtx) {
  return (
    <Svg label="compaction merges a full block with its neighbors into one longer block, and every block's own time range lets a query decide whether to read it at all" h={200}>
      <Row y={70} label="compaction" value="merges blocks" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="time range" value="skips the rest" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWindow({ t }: StepCtx) {
  return (
    <Svg label="widening the out-of-order window accepts older stray samples that were dropped before — does that remove the rejection rule, or only move where it falls?" h={200}>
      <Row y={70} label="wider window" value="accepts more" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rule gone?" value="or just moved?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWindow({ t }: StepCtx) {
  return (
    <Svg label="with the default window any late sample is rejected; widening it accepts a sample within the new window while one still older is rejected exactly as before" h={200}>
      <Row y={70} label="within window" value="accepted" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="older still" value="rejected" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChunks({ t }: StepCtx) {
  return (
    <Svg label="a hypertable splits data into time-partitioned chunks instead of blocks, and a query naming one day's range touches only that day's chunk, not the whole table" h={200}>
      <Row y={70} label="hypertable" value="time chunks" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one day's query" value="one chunk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInfluxPipeline({ t }: StepCtx) {
  return (
    <Svg label="a write lands in a memory buffer, reaches the WAL within a second, stays queryable for several minutes, then the oldest part is persisted to Parquet on a fixed clock" h={260}>
      <Row y={50} label="write buffer" value="in memory" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="WAL" value="within a second" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="queryable buffer" value="minutes long" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={190} label="Parquet" value="on a clock" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function RevealScaledOut({ t }: StepCtx) {
  return (
    <Svg label="Thanos, Mimir and VictoriaMetrics describe different architectures in their own words, but all three push the same block format to object storage behind a stateless query layer" h={200}>
      <Row y={70} label="three backends" value="different words" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same pattern" value="object storage" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a head block in memory, a WAL for crash safety, blocks pruned by time range, a shifting late-data window, and three engines agreeing the memory/object-storage line is where the architecture lives" h={260}>
      <Row y={50} label="head, WAL" value="memory, crash-safe" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="blocks, chunks" value="pruned by time" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="late-data window" value="shifts, not gone" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="scaled-out" value="one shared line" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="given the hook's two servers, can what each one lost be stated exactly from the structure alone, without guessing at either server's configuration?" h={200}>
      <Row y={70} label="WAL replay" value="recovers the head" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="file-copy backup" value="skips WAL entirely" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
