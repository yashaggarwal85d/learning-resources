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
    <Svg label="a replica is promoted; the connector reconnects with a file-and-offset position that means nothing there, but the GTID still matches." h={220}>
      <Row y={60} label="primary's offset" value="one byte address" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="replica's offset" value="a different address" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the GTID" value="matches on both" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="the connector above just reconnected using only the old file-and-offset position. Does it notice it landed in the wrong place?" h={200}>
      <Row y={70} label="reconnects with" value="old offset alone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="notices the mismatch" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRowFormat({ t }: StepCtx) {
  return (
    <Svg label="a statement-format entry logs only the SQL text; a row-format entry logs the actual column values a statement changed." h={200}>
      <Row y={70} label="statement format" value="just SQL text" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="row format" value="real column values" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealRowImageMeasured({ t }: StepCtx) {
  return (
    <Svg label="the same update, logged under a minimal image and a full image; only one of them keeps every old column." h={220}>
      <Row y={60} label="minimal image" value="missing a column" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="full image" value="every old column" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealPositionIsLocal({ t }: StepCtx) {
  return (
    <Svg label="the identical transaction's byte position is only ever meaningful on the server that wrote it." h={200}>
      <Row y={70} label="one transaction" value="two byte offsets" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each offset" value="local, one server" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealGtidMeasured({ t }: StepCtx) {
  return (
    <Svg label="the same transaction's GTID, compared against both servers' own byte positions for it." h={220}>
      <Row y={60} label="byte positions" value="differ by server" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the GTID" value="the identical name" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRetentionContrast({ t }: StepCtx) {
  return (
    <Svg label="a stopped consumer's own binlog segment gets purged; nothing on the MySQL side was pinning it, unlike a PostgreSQL slot." h={200}>
      <Row y={70} label="binlog retention" value="purges on schedule" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a slot, instead" value="pins the log" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealRetentionMeasured({ t }: StepCtx) {
  return (
    <Svg label="a short downtime still finds its position; a downtime past the retention window does not." h={220}>
      <Row y={60} label="short downtime" value="position still found" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="long downtime" value="position gone" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="row image deciding what a row event carries, a GTID surviving a failover, retention expiry with nothing pinning the log." h={260}>
      <Row y={50} label="row image" value="sets what's logged" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="GTID" value="survives a failover" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="retention" value="purges on schedule" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="unlike a slot" value="nothing pins it" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="none of this says how an old row event, logged by column position, gets read correctly after the schema changes." h={200}>
      <Row y={70} label="shown so far" value="row, GTID, retention" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="an old event" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
