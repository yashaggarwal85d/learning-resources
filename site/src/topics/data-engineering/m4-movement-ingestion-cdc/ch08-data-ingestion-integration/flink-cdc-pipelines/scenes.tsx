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
    <Svg label="a team runs Debezium, Kafka and a sink connector to copy one MySQL database into Iceberg, and spends more time on the middle than on the data." h={220}>
      <Row y={60} label="Debezium, Kafka, sink" value="five boxes" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="one source, one sink" value="two boxes, direct" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the time spent" value="mostly the middle" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="skipping Kafka and a broker entirely. Does that also mean giving up the lock-free, parallel snapshot read, or is that part independent of Kafka?" h={200}>
      <Row y={70} label="no Kafka, no broker" value="confirmed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lock-free parallel read" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealParallelSnapshot({ t }: StepCtx) {
  return (
    <Svg label="the source reads a snapshot in parallel, checkpoints at chunk granularity, and needs no global read lock before reading — the same watermark idea, generalized to parallel readers." h={220}>
      <Row y={60} label="snapshot read" value="in parallel" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="checkpoints" value="at chunk granularity" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="a global read lock" value="never needed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealPostgresExperimental({ t }: StepCtx) {
  return (
    <Svg label="for PostgreSQL, this same incremental snapshot reading is marked experimental and off by default — unlike MySQL, where it's already the standard path." h={200}>
      <Row y={70} label="MySQL" value="the standard path" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="PostgreSQL" value="experimental, off by default" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealEmbeddedBinlog({ t }: StepCtx) {
  return (
    <Svg label="the source embeds the connector engine directly inside a Flink source operator, reading the log in the job's own parallel readers, with Flink's own checkpoints holding the position." h={200}>
      <Row y={70} label="the connector engine" value="embedded, inside Flink" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the log position" value="held by a checkpoint" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealYamlPipeline({ t }: StepCtx) {
  return (
    <Svg label="a source, sink and pipeline block in one YAML file, submitted to a cluster, can write to a lakehouse, a warehouse, a search index or several other sinks directly." h={220}>
      <Row y={60} label="one YAML file" value="source, sink, pipeline" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="submitted" value="to a running cluster" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="sinks" value="a lakehouse, a warehouse" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealSchemaModes({ t }: StepCtx) {
  return (
    <Svg label="schema changes are handled by one of five named modes, chosen declaratively, rather than the manual column-by-column handling an earlier topic measured by hand." h={200}>
      <Row y={70} label="five named modes" value="chosen, not coded" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="manual handling" value="no longer required" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealWhatItGivesUp({ t }: StepCtx) {
  return (
    <Svg label="fewer moving parts, no broker to run — but no shared durable log either. A second consumer, a replay, or a different sink later means reading the source again." h={220}>
      <Row y={60} label="one job, one sink" value="fewer moving parts" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="a second consumer" value="reads the source again" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a lock-free parallel snapshot, a log read straight into Flink, one YAML file for the whole path, declarative schema handling — and no shared log for anyone else." h={260}>
      <Row y={50} label="the snapshot" value="lock-free, parallel" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the whole path" value="one YAML file" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="schema changes" value="five modes, declared" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="a second consumer" value="not included" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team wants two different sinks, a lakehouse and a search index, from the same source table. Under Flink CDC, what does adding the second sink actually require?" h={200}>
      <Row y={70} label="first sink" value="already running" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a second sink" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
