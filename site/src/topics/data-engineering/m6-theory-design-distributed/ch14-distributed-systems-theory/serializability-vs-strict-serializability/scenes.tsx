import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label='a customer sees "confirmed" then refreshes and the new order is missing, on a store documented as serializable with no bug' h={200}>
      <Row y={70} label="order placed" value="confirmed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="refresh" value="order missing" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictForbidden({ t }: StepCtx) {
  return (
    <Svg label="does the serializable definition forbid the missing-order refresh, allow it outright, or allow it only through a lagging replica?" h={200}>
      <Row y={70} label="serializable" value="forbids this?" />
      <Row y={130} label="or allows it" value="only via a replica?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSerializable({ t }: StepCtx) {
  return (
    <Svg label="serializability places every transaction, not operation, in one legal total order with no real-time rule; the hook's history has a legal order with the refresh placed before the order" h={200}>
      <Row y={70} label="one total order" value="whole transactions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="legal order exists" value="refresh before order" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStrict({ t }: StepCtx) {
  return (
    <Svg label="strict serializability adds one rule, if a transaction finished before another began the serial order must agree; run on the identical hook history, no order satisfies both rules" h={200}>
      <Row y={70} label="same database" value="one rule added" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the hook's history" value="no legal order exists" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMeasured({ t }: StepCtx) {
  return (
    <Svg label="measured on a real PostgreSQL server: a non-overlapping transaction saw a sibling commit; an already-open transaction did not see a sibling that committed mid-flight, even on a later read" h={260}>
      <Row y={50} label="fresh transaction" value="saw the commit" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="already-open transaction" value="missed the commit" valueColor={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="real psql" value="not a diagram" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealMap({ t }: StepCtx) {
  return (
    <Svg label="the two-axis map: single/multi-object by ordering strength, with etcd's strict-serializable claim, Spanner's external-consistency claim, and Postgres's own serializable-not-strict wording, each quoted from its own documentation" h={260}>
      <Row y={50} label="etcd" value="strict serializable" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="Spanner" value="external consistency" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="Postgres" value="serializable, not strict" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealReverse({ t }: StepCtx) {
  return (
    <Svg label="a transaction starting after an unrelated write finishes, and never reading that object, can legally be placed before it in the serial order — no causal link forces either order" h={200}>
      <Row y={70} label="unrelated write, then read" value="no causal link" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="serial order" value="free to reverse them" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="serializability is one legal total order with no real-time rule; strict serializability adds real time back; measured directly on Postgres; placed on the two-axis map from documented claims" h={260}>
      <Row y={50} label="serializable" value="one order, no clock" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="strict" value="same check, real time back" o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="measured" value="on a real database" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="placed" value="from documentation, not blogs" o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a database runs every transaction to completion, one at a time, before the next starts — is that database strictly serializable?" h={200}>
      <Row y={70} label="truly serial" value="no concurrency at all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="is it" value="strictly serializable?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
