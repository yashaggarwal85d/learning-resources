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
    <Svg label="a new sink is bootstrapped from a compacted topic days after a customer was deleted; the delete's own marker was already cleaned up, and the customer comes back." h={220}>
      <Row y={60} label="a customer, deleted" value="days ago" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the delete's marker" value="already cleaned up" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="a new sink" value="customer reappears" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="a delete produces two records sharing one key, one after the other. Does compaction's keep-the-latest rule keep both, or only the newest of the two?" h={200}>
      <Row y={70} label="two records" value="same key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="kept by compaction" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBeforeImageMechanism({ t }: StepCtx) {
  return (
    <Svg label="a delete's before field answers to the same REPLICA IDENTITY setting an update's before field does: DEFAULT carries only the key, FULL carries the whole row." h={200}>
      <Row y={70} label="default identity" value="key only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="full identity" value="whole row" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealBeforeImageMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the identical delete against a table at its default identity, then against one set to full; the first before-image carried only the key, the second the whole row." h={220}>
      <Row y={60} label="default, measured" value="key only, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="full, measured" value="whole row, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealSoftHardMechanism({ t }: StepCtx) {
  return (
    <Svg label="a soft delete is just another update, so a cursor query polling for recent changes sees it like any other row; a hard delete leaves the log as its only trace." h={200}>
      <Row y={70} label="soft delete" value="an ordinary update" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="hard delete" value="only the log" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealSoftHardMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a cursor query sees the soft-deleted row show up like any update; the same cursor query never finds the hard-deleted row, with no trace at all." h={220}>
      <Row y={60} label="soft delete, seen" value="by the cursor" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="hard delete, missed" value="no trace" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealMergeMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: one MERGE statement applied to a real landing table removes exactly the deleted row's own key, leaving every other row untouched." h={200}>
      <Row y={70} label="one MERGE" value="one row removed" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every other row" value="left untouched" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealRetentionRaceMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a consumer resuming before the retention window closes still finds the tombstone and applies the delete; one resuming after finds nothing at all and stays stale." h={220}>
      <Row y={60} label="resumed in time" value="delete applied" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="resumed too late" value="row resurrected" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a delete's before-image follows REPLICA IDENTITY; soft deletes stay visible to a cursor and hard ones don't; a MERGE carries one into a table; and a tombstone outlives a delete only for so long." h={260}>
      <Row y={50} label="before-image" value="follows the identity" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="soft vs hard" value="cursor-visible, or not" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="carried by MERGE" value="into a table" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="the tombstone" value="outlives it, briefly" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="nothing stops a team from avoiding this race entirely. What's the one number a sink's own maximum lag has to stay under?" h={200}>
      <Row y={70} label="a sink's lag" value="bounded by what" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
