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
    <Svg label="the same update, decoded three times under three REPLICA IDENTITY settings; the before row fills in, shrinks, or stays empty." h={220}>
      <Row y={60} label="identity: default" value="key only" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={110} label="identity: full" value="every column" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={160} label="identity: nothing" value="empty" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="the same unconfirmed slot, peeked twice. Does the second peek come back empty, or identical to the first?" h={200}>
      <Row y={70} label="first peek" value="one change" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="second peek" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDecodingOrder({ t }: StepCtx) {
  return (
    <Svg label="two transactions start out of order; decoding reports them in the order they committed, not the order they began." h={200}>
      <Row y={70} label="started first" value="committed second" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="decoded order" value="by commit order" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealBeforeImageMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: one row's key changed three times, once under each REPLICA IDENTITY setting, on this sandbox's own PostgreSQL." h={220}>
      <Row y={60} label="default's before row" value="key column alone" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="full's before row" value="every old column" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealSlotPromise({ t }: StepCtx) {
  return (
    <Svg label="a slot's own position is written to disk only at a checkpoint; between checkpoints it lives only in memory." h={200}>
      <Row y={70} label="position written" value="only at checkpoint" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="between checkpoints" value="memory only" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealRepeatsMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the identical unconfirmed slot, peeked twice, on this sandbox's own PostgreSQL." h={220}>
      <Row y={60} label="first peek's data" value="one change" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="second peek's data" value="the identical change" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealTwoPositions({ t }: StepCtx) {
  return (
    <Svg label="restart_lsn is the oldest WAL the server still can't discard for this slot; confirmed_flush_lsn is what the consumer has acknowledged." h={200}>
      <Row y={70} label="restart point" value="oldest WAL kept" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="confirmed point" value="what's acknowledged" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealPositionsMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: both positions read from pg_replication_slots, before and after a confirmed read, on this sandbox's own PostgreSQL." h={220}>
      <Row y={60} label="confirmed point" value="moves forward" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="restart point" value="stays behind" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the before-image REPLICA IDENTITY allows, a slot's tolerance for repeats, and its two separate positions." h={260}>
      <Row y={50} label="before-image" value="set by identity" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="unconfirmed reads" value="can repeat" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="confirmed point" value="moves on ack" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="restart point" value="lags, holding WAL" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one slot on one server is what's been shown. What does a consumer need to survive a real failover?" h={200}>
      <Row y={70} label="a single slot" value="shown so far" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="surviving a failover" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
