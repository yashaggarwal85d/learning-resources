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
    <Svg label="raw orders, a shared view, a dashboard — three layers, or fewer?" h={200}>
      <Row y={70} label="raw orders" value="shared view, dashboard" />
      <Row y={130} label="three layers" value="or fewer?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMedallionQuote({ t }: StepCtx) {
  return (
    <Svg label="Bronze, Silver, Gold — quality and structure improving, layer by layer" h={200}>
      <Row y={70} label="Bronze, Silver, Gold" value="three layers" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="quality, structure" value="improve layer by layer" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictNameIsContract({ t }: StepCtx) {
  return (
    <Svg label='a layer named "Silver" — does the name alone set the contract?' h={200}>
      <Row y={70} label='layer named "Silver"' value="" />
      <Row y={130} label="contract set" value="by the name alone?" />
    </Svg>
  );
}

export function RevealBronzeQuote({ t }: StepCtx) {
  return (
    <Svg label="raw, as-is, load metadata attached — audit and lineage, nothing more" h={200}>
      <Row y={70} label="Bronze" value="raw, as-is" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="purpose" value="audit, lineage" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSilverQuote({ t }: StepCtx) {
  return (
    <Svg label='"just-enough" cleansed, an enterprise view — not yet project-specific' h={200}>
      <Row y={70} label="Silver" value="just-enough cleansed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="purpose" value="enterprise view" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealGoldQuote({ t }: StepCtx) {
  return (
    <Svg label="consumption-ready, denormalized, project-specific — built for reporting" h={200}>
      <Row y={70} label="Gold" value="consumption-ready" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="purpose" value="one project's reporting" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMoreLayersBetter({ t }: StepCtx) {
  return (
    <Svg label="every pipeline, all three stages — always strictly better?" h={200}>
      <Row y={70} label="every pipeline" value="all three stages" />
      <Row y={130} label="always better?" value="for everyone?" />
    </Svg>
  );
}

export function RevealLayerSprawlQuote({ t }: StepCtx) {
  return (
    <Svg label="stages it doesn't need — added latency, added storage cost, no matching benefit" h={200}>
      <Row y={70} label="unneeded stages" value="added latency" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="data copied" value="added storage cost" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictWhoOwnsTheBug({ t }: StepCtx) {
  return (
    <Svg label="a bug found in Gold — obviously Gold's own job to fix?" h={200}>
      <Row y={70} label="bug found" value="in Gold" />
      <Row y={130} label="Gold's job" value="to fix, obviously?" />
    </Svg>
  );
}

export function RevealFragmentedAccountabilityQuote({ t }: StepCtx) {
  return (
    <Svg label="different teams, different stages — accountability fragmented, no clear owner" h={200}>
      <Row y={70} label="different teams" value="different stages" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="accountability" value="fragmented" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSilverBottleneckQuote({ t }: StepCtx) {
  return (
    <Svg label="downstream teams pulling from aggregates built without their input — a named bottleneck" h={200}>
      <Row y={70} label="downstream teams" value="pull, no input given" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="Silver" value="a named bottleneck" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a contract behind every name; unneeded stages still cost; Silver bears the brunt" h={260}>
      <Row y={60} label="a layer's name" value="needs a real contract" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="unneeded stages" value="cost real latency, storage" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="Silver" value="bears the brunt" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one source, one consumer, nothing shared — still three layers?" h={200}>
      <Row y={70} label="one source" value="one consumer" />
      <Row y={130} label="still three layers?" value="or reshape?" />
    </Svg>
  );
}
