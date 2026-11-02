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
    <Svg label="one malformed record blocks every record behind it, retried in place, forever" h={200}>
      <Row y={70} label="poison record" value="retried in place" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="everything behind" value="frozen" valueColor={C.bad} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="some records never can be processed; retrying one in place blocks everything ordered behind it" h={200}>
      <Row y={70} label="dedup assumes" value="eventually works" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="some records" value="never can" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDivert({}: StepCtx) {
  return (
    <Svg label="the poison record is diverted to a separate retry topic instead of retried in place" h={200}>
      <Row y={70} label="poison record" value="diverted away" />
      <Row y={130} label="main partition" value="keeps moving?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDivert({ t }: StepCtx) {
  return (
    <Svg label="the main flow processes everything behind the poison record immediately" h={200}>
      <Row y={70} label="main flow" value="keeps moving" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="poison record" value="routed aside" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOrdering({ t }: StepCtx) {
  return (
    <Svg label="not guaranteed to be processed in the same sequence — the named, accepted cost" h={200}>
      <Row y={70} label="later records" value="arrive first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="diverted record" value="arrives last" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTiers({}: StepCtx) {
  return (
    <Svg label="a record keeps failing through every tiered retry lane — what happens to it?" h={200}>
      <Row y={70} label="tiered lanes" value="all exhausted" />
      <Row y={130} label="record then" value="goes where?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDLQ({ t }: StepCtx) {
  return (
    <Svg label="a separate topic, carrying the original payload plus metadata, for diagnosis and replay" h={200}>
      <Row y={70} label="exhausted record" value="dead-letter topic" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="record carries" value="payload, metadata" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTooling({ t }: StepCtx) {
  return (
    <Svg label="two current, named mechanisms: Connect's error tolerance, and Streams' own DLQ handler" h={200}>
      <Row y={70} label="Kafka Connect" value="errors.tolerance" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Kafka Streams" value="DLQ handler" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="in-place retry" value="blocked cold" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="non-blocking flow" value="kept moving" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="DLQ record" value="real metadata" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="poison records, non-blocking tiers, the ordering cost, and DLQ metadata and tooling" h={260}>
      <Row y={50} label="poison record" value="can't block, now" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="tiered retry" value="order sacrificed" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="dead-letter queue" value="diagnose, replay" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
