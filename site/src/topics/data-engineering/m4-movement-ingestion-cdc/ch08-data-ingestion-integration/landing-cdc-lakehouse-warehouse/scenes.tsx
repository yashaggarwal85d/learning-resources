import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
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
    <Svg label="a replayed batch and a live event for the same order arrive in opposite order, and the lakehouse keeps the older value." h={200}>
      <Row y={70} label="replayed batch, older LSN" value="arrives second" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the table's final value" value="the older one" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="does landing by append-then-MERGE protect against this on its own, or can the same arrival-order bug still reach it?" h={200}>
      <Row y={70} label="append-then-merge" value="waits before merging" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="protected from this bug?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAppendMerge({ t }: StepCtx) {
  return (
    <Svg label="every change lands in an append-only table first; every few minutes, MERGE takes the latest change per key into the current-state table." h={220}>
      <Row y={60} label="every change" value="appended, in order" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="every few minutes" value="MERGE the latest per key" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="freshness" value="bounded by the interval" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealStreamingUpsert({ t }: StepCtx) {
  return (
    <Svg label="a streaming upsert writes each change as a new data file plus a marker for whatever row it replaces, current within seconds, merged at read time until compaction." h={220}>
      <Row y={60} label="each change" value="a data file plus a marker" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="current value" value="within seconds" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the cost" value="merged again at read time" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealLsnOrdering({ t }: StepCtx) {
  return (
    <Svg label="the MERGE compares source LSN, not arrival order; an older event never overwrites a newer row, in either order it's replayed." h={200}>
      <Row y={70} label="winner of two changes" value="the greater source LSN" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="replayed in reverse" value="same final answer" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCompactionCost({ t }: StepCtx) {
  return (
    <Svg label="a table whose rows change often produces proportionally more files for compaction to rewrite; append-then-merge's own current table never grows with update rate." h={220}>
      <Row y={60} label="low update rate" value="few superseded rows" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="high update rate" value="proportionally more" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the current table itself" value="same size either way" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealWarehouseNative({ t }: StepCtx) {
  return (
    <Svg label="BigQuery accepts UPSERT and DELETE on a declared primary key; Snowpipe Streaming's Named Channels give ordered, exactly-once ingestion by offset token." h={220}>
      <Row y={60} label="BigQuery" value="UPSERT, DELETE, a key" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="Snowpipe Streaming" value="ordered, exactly-once" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="latency, vendor figure" value="as low as five seconds" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealTopicToTable({ t }: StepCtx) {
  return (
    <Svg label="a third way to the same table: turning a change topic directly into one, without a team writing the merge by hand at all." h={200}>
      <Row y={70} label="append-then-merge, streaming upsert" value="written by hand" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="topic-to-table" value="the merge, managed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="append-then-merge, streaming upserts, the LSN tiebreak, compaction's own cost, and two warehouse-native paths — all one choice, made several ways." h={260}>
      <Row y={50} label="two landing strategies" value="different freshness, cost" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the winner of two changes" value="decided by LSN" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="compaction cost" value="scales with update rate" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="a warehouse's own path" value="the same choice, hosted" o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a table's rows now change fifty times a day each, and the team never runs compaction. Which cost grows without bound?" h={200}>
      <Row y={70} label="current-state table size" value="not yet revealed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="superseded rows awaiting compaction" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
