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
    <Svg label="a team unwraps a Debezium topic to simplify it for a sink; the op field goes with it, and a re-snapshot read event now looks exactly like a real insert." h={220}>
      <Row y={60} label="full card" value="before, after, source, op" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="unwrapped" value="only the after values" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="read vs insert" value="now indistinguishable" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="unwrapping a change event keeps only its column values. Can a consumer still tell a re-snapshot read apart from a genuine insert once that happens?" h={200}>
      <Row y={70} label="unwrapped record" value="columns only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="read or insert" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeShapes({ t }: StepCtx) {
  return (
    <Svg label="Debezium deploys three ways: a Kafka Connect connector, the standalone Debezium Server streaming straight to a messaging system, or the Debezium Engine embedded as a library." h={220}>
      <Row y={60} label="Kafka Connect" value="a connector" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="Debezium Server" value="standalone, no Kafka" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="Debezium Engine" value="a library, embedded" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealEnvelopeMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a real insert and a real update, each rebuilt by hand into the full envelope; the insert's own before is empty, the update carries both before and after." h={200}>
      <Row y={70} label="insert, rebuilt" value="before is empty" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="update, rebuilt" value="before and after" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealUnwrapMechanism({ t }: StepCtx) {
  return (
    <Svg label="the unwrap transform extracts only the after field from an envelope and replaces the whole record with it; before, op and source are gone unless a variant adds them back." h={200}>
      <Row y={70} label="unwrap keeps" value="after, only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unwrap drops" value="before, op, source" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealUnwrapMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: unwrapping a real envelope keeps only its column values; a real delete, unwrapped, carries its last-known columns plus a deleted marker instead of vanishing." h={220}>
      <Row y={60} label="update, unwrapped" value="columns, nothing else" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="delete, unwrapped" value="columns plus a marker" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealUpsertMechanism({ t }: StepCtx) {
  return (
    <Svg label="a JDBC sink configured for upsert mode makes writes idempotent: replaying an event always produces the same final row state, because an upsert updates an existing key instead of duplicating it." h={200}>
      <Row y={70} label="upsert mode" value="update, or insert" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a replayed event" value="same final state" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealUpsertMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: applying the identical unwrapped record twice, by a real upsert, leaves the row in the exact same state both times, and never inserts a second row." h={200}>
      <Row y={70} label="applied twice" value="identical final row" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="row count" value="never doubled" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three deployment shapes, one envelope card, an unwrap transform that trades fields for simplicity, and a sink that only stays safe to replay if it upserts." h={260}>
      <Row y={50} label="three shapes" value="one event, carried" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the envelope" value="before, after, source, op" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="unwrap" value="trades fields for less" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="a sink" value="safe only if it upserts" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team configures a JDBC sink without ever setting insert mode to upsert. Is replaying one already-applied event still guaranteed to leave the table in the same state?" h={200}>
      <Row y={70} label="insert mode" value="never set to upsert" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="replayed event" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
