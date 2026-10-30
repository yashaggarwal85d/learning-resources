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
    <Svg label="three systems. Each logs perfectly. None sees the others." h={200}>
      <Row y={70} label="one order" value="wrong somewhere" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="three systems" value="three separate logs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="one query, not three greps. How?" h={200}>
      <Row y={70} label="chain, shared id," value="or links" />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSignalsCollector({ t }: StepCtx) {
  return (
    <Svg label="one export. The Collector decides where it goes." h={200}>
      <Row y={70} label="traces, metrics," value="logs, baggage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the Collector" value="routes them" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTraceparent({ t }: StepCtx) {
  return (
    <Svg label="injected at produce. Extracted at consume." h={260}>
      <Row y={50} label="traceparent" value="4 fixed parts" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the Kafka hop" value="no HTTP request" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the header" value="carries it instead" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLinksNotParent({ t }: StepCtx) {
  return (
    <Svg label="five producers, one parent field. Only the last survives." h={260}>
      <Row y={50} label="5 producers" value="one span" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="as a parent" value="only 1 survives" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="as links" value="all 5 survive" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLinkLimit({ t }: StepCtx) {
  return (
    <Svg label="a million in. One hundred twenty-eight kept." h={260}>
      <Row y={50} label="batch size" value="1,000,000" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="link limit" value="128" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="dropped" value="999,872" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealSemanticConventions({ t }: StepCtx) {
  return (
    <Svg label="one vocabulary. Kafka or database, queried alike." h={200}>
      <Row y={70} label="a Kafka span" value="destination, partition" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a database span" value="same attribute names" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCdcBreak({ t }: StepCtx) {
  return (
    <Svg label="three hops automatic. One hop, only if you pass it." h={260}>
      <Row y={50} label="Kafka, Spark," value="warehouse: automatic" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the database write" value="the one real seam" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="skip passing it" value="trace id lost there" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealOtelVsOpenLineage({ t }: StepCtx) {
  return (
    <Svg label="two questions, two shapes. A run id is all they share." h={260}>
      <Row y={50} label="OpenTelemetry" value="what happened" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="OpenLineage" value="what was read/written" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="shared" value="only a run id" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a header, a link, one honest seam, two standards." h={260}>
      <Row y={50} label="a header" value="crosses the hop" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="links" value="where parent can't" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="one seam" value="named, not hidden" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a million in, one row out. 128 links shown." h={200}>
      <Row y={70} label="links kept" value="128 of 1,000,000" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the data itself" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
