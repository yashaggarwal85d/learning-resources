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
    <Svg label="the replica needs everything. What does that mean to ship?" h={200}>
      <Row y={70} label="the primary" value="has everything" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the replica" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPhysicalExactBytes({ t }: StepCtx) {
  return (
    <Svg label="exact bytes, block for block. One version, both sides." h={200}>
      <Row y={70} label="physical replication" value="exact block bytes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both sides" value="same major version" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLogicalDecodedChanges({ t }: StepCtx) {
  return (
    <Svg label="decoded row changes, not bytes. Readable across versions." h={200}>
      <Row y={70} label="logical replication" value="decoded row changes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="different versions" value="still readable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStalledConsumer({ t }: StepCtx) {
  return (
    <Svg label="a consumer stops reading. What happens to the data?" h={200}>
      <Row y={70} label="the consumer" value="stops reading" />
      <Row y={130} label="the unread WAL" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealReplicationSlotsNamed({ t }: StepCtx) {
  return (
    <Svg label="a slot is a promise. Keep the WAL until it is read." h={200}>
      <Row y={70} label="a replication slot" value="the primary's promise" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the WAL it covers" value="kept, not removed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStalledSlotMeasured({ t }: StepCtx) {
  return (
    <Svg label="real writes, nothing consuming. Real WAL retained." h={260}>
      <Row y={50} label="a real slot" value="created, nothing reads it" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="thousands of real writes" value="keep landing" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="WAL retained" value="measured, growing" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealOutageAndFixMeasured({ t }: StepCtx) {
  return (
    <Svg label="left too long, it fills the disk. Caught up, it clears." h={260}>
      <Row y={50} label="left unconsumed" value="fills the disk" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the same slot" value="a real consumer arrives" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="WAL retained now" value="measured, back to none" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealFailoverSafeLogicalSlots({ t }: StepCtx) {
  return (
    <Svg label="a logical slot can now survive its own failover." h={200}>
      <Row y={70} label="before" value="a slot lost on failover" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="now" value="a slot that survives it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSameIdeaElsewhere({ t }: StepCtx) {
  return (
    <Svg label="not the statement that ran. Every row it changed." h={200}>
      <Row y={70} label="a row-based binary log" value="not the statement" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every row changed" value="logged separately" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="bytes or changes. A promise, and its cost." h={260}>
      <Row y={50} label="physical" value="exact bytes" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="logical" value="decoded changes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a slot's promise" value="paid when ignored" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="down for hours, double the writes. What happens?" h={200}>
      <Row y={70} label="the consumer" value="down for hours" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="restarting it alone" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
