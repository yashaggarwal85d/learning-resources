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
    <Svg label="a connector pod is killed between producing five thousand change events and committing their offsets; on restart it emits them again, and a downstream counter that sums amount is now five thousand orders too high." h={220}>
      <Row y={60} label="produced" value="not yet committed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the crash" value="lands right here" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="on restart" value="emitted again" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="the offset was never committed before the crash. Does the restart skip the batch it already produced, or emit the identical batch again?" h={200}>
      <Row y={70} label="offset" value="never committed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="on restart" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTwoPositions({ t }: StepCtx) {
  return (
    <Svg label="a connector tracks a source position and a Kafka offset, stored in different places; Kafka Connect commits the source position to its own topic periodically, not per record." h={220}>
      <Row y={60} label="source position" value="an LSN or GTID" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="Kafka offset" value="its own topic" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="committed" value="periodically, not per record" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealCrashMeasured({ t }: StepCtx) {
  return (
    <Svg label="run directly against this sandbox's real PostgreSQL: peeking the decoded batch twice without ever advancing the slot returns the identical batch both times, and advancing right after producing leaves nothing for the next peek to find." h={220}>
      <Row y={60} label="peeked twice" value="identical batch twice" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="advanced right after" value="nothing left behind" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealNoDedupLayer({ t }: StepCtx) {
  return (
    <Svg label="Debezium does not implement an internal deduplication layer of its own, and provides at-least-once delivery by default; recovering from a fault can emit some duplicate change events." h={200}>
      <Row y={70} label="dedup layer" value="not Debezium's own" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="by default" value="at least once" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealDedupMeasured({ t }: StepCtx) {
  return (
    <Svg label="run against the duplicated batch from the crash above: a reader that only sums what it sees comes out double the true total; one that dedupes by each change's own log position matches it exactly." h={220}>
      <Row y={60} label="naive reader" value="double the true total" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="dedup by position" value="the true total" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealExactlyOnce({ t }: StepCtx) {
  return (
    <Svg label="Kafka Connect's own exactly-once source support writes records and offsets atomically in one transaction, and fences out old task generations; an existing cluster enables it across two rolling upgrades, preparing then enabled." h={220}>
      <Row y={60} label="records plus offsets" value="one transaction" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="old task" value="fenced out" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="existing cluster" value="preparing, then enabled" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealPurgedMeasured({ t }: StepCtx) {
  return (
    <Svg label="run directly against the real database: dropping a slot and reading from its own name raises an error immediately; only a brand-new slot lets the pipeline run again." h={200}>
      <Row y={70} label="slot dropped" value="read raises an error" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a fresh slot" value="runs again" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two positions, two stores, committed on different schedules; a crash before the commit replays; Debezium offers no dedup of its own; a transaction can close that gap; a purged position closes the account entirely." h={260}>
      <Row y={50} label="two positions" value="two stores" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a crash before commit" value="replays the batch" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="no dedup layer" value="of its own" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="a purged position" value="only restarts clean" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a source connector just enabled exactly-once source support successfully. Does that alone guarantee the consumer downstream can never double-count a record?" h={200}>
      <Row y={70} label="exactly-once source" value="now enabled" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the consumer itself" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
