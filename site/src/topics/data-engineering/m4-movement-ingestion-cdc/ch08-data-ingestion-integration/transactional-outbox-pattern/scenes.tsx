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
    <Svg label="an order service commits the order and crashes before publishing OrderPlaced; the warehouse never hears about the order, and it exists only in the database." h={220}>
      <Row y={60} label="order committed" value="in the database" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="publish step" value="never runs" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="the warehouse" value="never hears about it" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="the order was committed, and the separate publish step crashed before it ever ran. Is that event recoverable anywhere, or is it simply gone?" h={200}>
      <Row y={70} label="publish" value="never ran" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the event" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOutboxMechanism({ t }: StepCtx) {
  return (
    <Svg label="an outbox writes the event in the exact same transaction as the state change, so both exist or neither does; CDC, not the application, does the publishing." h={200}>
      <Row y={70} label="order row, outbox row" value="one transaction" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="publishing" value="CDC's job, not the app's" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealDualWriteMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a crash after commit but before a separate publish leaves nothing decodable to recover; an outbox row written in the same transaction as the order is always there to decode." h={220}>
      <Row y={60} label="separate publish, crashed" value="nothing to decode" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="outbox, same transaction" value="always there" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRouterMechanism({ t }: StepCtx) {
  return (
    <Svg label="the router routes by aggregatetype to its own topic, and the outbox row's own id becomes the message's dedup key; a delete on the outbox table is filtered out automatically." h={220}>
      <Row y={60} label="aggregatetype" value="names the topic" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the row's own id" value="the dedup key" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="a delete on outbox" value="filtered out" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealRouterMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: two real decoded outbox inserts of different aggregate types route to two different topics, each carrying its own row's own id as a dedup key." h={200}>
      <Row y={70} label="order event" value="routed to its own topic" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="shipment event" value="a different topic" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealOrderingMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: two aggregates' own events, written interleaved, still come apart cleanly by aggregateid into each one's own correctly ordered sequence." h={200}>
      <Row y={70} label="interleaved writes" value="one decoded stream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="by aggregateid" value="each in its own order" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCleanupMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the slot captures the insert first; the later delete on the outbox table produces no routed event at all, confirming cleanup is both invisible and already safe." h={220}>
      <Row y={60} label="captured first" value="before any cleanup" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the cleanup delete" value="no event, at all" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the outbox turns publish into commit; the router routes by aggregatetype and dedups by id; aggregateid keeps order; and cleanup is safe only once the slot has already moved past a row." h={260}>
      <Row y={50} label="publish" value="becomes commit" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the router" value="routes, and dedups" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="aggregateid" value="keeps order" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="cleanup" value="safe only once captured" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team deletes old outbox rows the moment they're written, without ever checking whether the slot has actually captured them yet. Is that cleanup still safe?" h={200}>
      <Row y={70} label="cleanup" value="runs immediately" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="safe, or not" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
