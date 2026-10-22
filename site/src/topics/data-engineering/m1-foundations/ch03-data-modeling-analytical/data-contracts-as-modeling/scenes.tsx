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
    <Svg label="a schema, changed overnight — a dashboard, broken silently: a missing contract" h={200}>
      <Row y={70} label="schema" value="changed overnight" />
      <Row y={130} label="dashboard" value="broke silently" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealContractFormatQuote({ t }: StepCtx) {
  return (
    <Svg label="keys and values, under an open standard — not a wiki page, not a promise" h={200}>
      <Row y={70} label="keys, values" value="an open standard" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="not" value="a wiki page, a promise" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMustPickOne({ t }: StepCtx) {
  return (
    <Svg label="business meaning, physical layout — does a contract have to pick just one?" h={200}>
      <Row y={70} label="business meaning" value="physical layout" />
      <Row y={130} label="pick just one?" value="or both?" />
    </Svg>
  );
}

export function RevealSchemaBothQuote({ t }: StepCtx) {
  return (
    <Svg label="business representation, physical implementation — tied together, one field's own name" h={200}>
      <Row y={70} label="business, physical" value="tied together" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one field" value="its own business name" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealQualityTiedQuote({ t }: StepCtx) {
  return (
    <Svg label="quality rules, tightly linked to the schema — not floating free, disconnected" h={200}>
      <Row y={70} label="quality rules" value="named section" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="tied to" value="the schema itself" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictDownstreamEnoughCheck({ t }: StepCtx) {
  return (
    <Svg label="a check, run only downstream — late enough to still count as enforcement?" h={200}>
      <Row y={70} label="check" value="run only downstream" />
      <Row y={130} label="late enough?" value="still enforcement?" />
    </Svg>
  );
}

export function RevealProducerBoundaryQuote({ t }: StepCtx) {
  return (
    <Svg label="the point data is emitted — stopped there, before any consumer ever sees it" h={200}>
      <Row y={70} label="data emitted" value="stopped right there" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="before" value="any consumer sees it" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSlaQuote({ t }: StepCtx) {
  return (
    <Svg label="SLAs, a named section — a required, structured value, not loose prose" h={200}>
      <Row y={70} label="SLAs" value="named section" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="structured value" value="not loose prose" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOwnershipImplicit({ t }: StepCtx) {
  return (
    <Svg label="ownership, unwritten — fine, since the pipeline's builder is obviously assumed to own it?" h={200}>
      <Row y={70} label="ownership" value="unwritten" />
      <Row y={130} label="builder" value="obviously assumed owner?" />
    </Svg>
  );
}

export function RevealOwnershipRoleQuote({ t }: StepCtx) {
  return (
    <Svg label={'team, tracked in the contract — "Owner" named explicitly, in the standard\'s own example'} h={200}>
      <Row y={70} label="team" value="tracked in contract" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label='"Owner"' value="named explicitly" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealVersionQuote({ t }: StepCtx) {
  return (
    <Svg label="the spec's own current version — already past the one named earlier; it keeps evolving" h={200}>
      <Row y={70} label="spec's version" value="already moved past it" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="standard" value="keeps evolving" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a structured document; schema tying meaning to layout; named fields; ownership, explicit" h={260}>
      <Row y={60} label="a contract" value="structured, not a promise" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="schema" value="meaning, layout, tied" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="ownership" value="an explicit role" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a schema change, no updated contract — who catches it, and where does that happen?" h={200}>
      <Row y={70} label="schema change" value="contract not updated" />
      <Row y={130} label="who catches it" value="and where?" />
    </Svg>
  );
}
