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
    <Svg label="one commit inserts an order and its items; the consumer reads the items topic first, and a join drops all three items as orphans." h={220}>
      <Row y={60} label="one commit" value="order, then items" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the consumer" value="reads items first" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the join" value="drops all three" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="does order break the same way for one row's own changes as it does for a transaction spanning two tables, or differently?" h={200}>
      <Row y={70} label="row versus tables" value="not the same" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which one" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPerKeyMechanism({ t }: StepCtx) {
  return (
    <Svg label="every change event is keyed by its row's own primary key, and a stream ordered within a key keeps every change to that one row in order." h={200}>
      <Row y={70} label="every change" value="keyed by key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="order, per key" value="never scrambled" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealPerKeyMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: three keys updated three times each, deliberately interleaved; each key's own queue lists its values in exactly commit order." h={220}>
      <Row y={60} label="three keys" value="interleaved on purpose" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="each key's queue" value="in commit order" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealCrossTableMechanism({ t }: StepCtx) {
  return (
    <Svg label="each table goes to its own topic, so one commit across two tables becomes two separate deliveries a consumer can read in either order." h={200}>
      <Row y={70} label="two tables" value="two separate topics" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one commit" value="arrives in pieces" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCrossTableMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the identical commit, split into two queues; draining the items queue before the orders queue finds every item an orphan." h={220}>
      <Row y={60} label="items queue, drained" value="first, as usual" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="every item" value="an orphan, briefly" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealTransactionMetadata({ t }: StepCtx) {
  return (
    <Svg label="a begin and end event frame every commit; the end carries a total count and a count per table, built from the slot's own real position." h={200}>
      <Row y={70} label="begin and end" value="frame the commit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the end event" value="carries the counts" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealReassemblyMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a consumer buffers by transaction and waits for the end's own count before joining; the same split commit now joins with zero orphans." h={220}>
      <Row y={60} label="buffered, then released" value="at full count" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="orphans this time" value="none" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a key's own order survives on its own; a commit across tables does not, until a consumer buffers by transaction and waits for its own end count." h={260}>
      <Row y={50} label="one key" value="orders itself" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="one commit" value="splits across topics" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="buffering by transaction" value="puts it back" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="that bookkeeping" value="is the consumer's" o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a transaction spans several topics, and Kafka itself gives no guarantee across them. Whose job is it to make that transaction atomic again?" h={200}>
      <Row y={70} label="atomic again" value="whose job, exactly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
