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
    <Svg label="two plants buy the same machine tool — one ends up with a tag list and an unmaintained spreadsheet, the other's machine publishes a typed model with names, units and a hierarchy already attached" h={200}>
      <Row y={70} label="plant A" value="tag list, spreadsheet" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="plant B" value="typed model" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictModel({ t }: StepCtx) {
  return (
    <Svg label="one plant onboards the machine in days, the other in months — what exactly did the typed model carry that a raw address never could?" h={200}>
      <Row y={70} label="days vs months" value="same machine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what carried it?" value="the typed model" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAddressSpace({ t }: StepCtx) {
  return (
    <Svg label="nodes are joined by typed references, and browsing from the machine down through its monitoring and spindle objects reaches one variable, already carrying its own unit and data type" h={260}>
      <Row y={50} label="MachineTool" value="Object" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Monitoring → Spindle" value="typed references" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="Speed" value="Variable, unit + type" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

export function RevealCompanionSpec({ t }: StepCtx) {
  return (
    <Svg label="a companion specification standardizes that exact path for a domain, so any machine tool built to it exposes the same object types and a client never needs a per-vendor tag map" h={200}>
      <Row y={70} label="companion spec" value="standard path" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="per-vendor tag map" value="not needed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeadband({ t }: StepCtx) {
  return (
    <Svg label="a monitored item's absolute deadband only reports a change past a stated threshold, and measured against polling every sample it sends a small fraction of the messages" h={200}>
      <Row y={70} label="polling" value="every sample" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="deadband" value="a small fraction" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPubSub({ t }: StepCtx) {
  return (
    <Svg label="client/server gives every subscriber its own session so its notification traffic scales with how many are listening, but PubSub decouples publisher from subscriber so its own message count doesn't" h={200}>
      <Row y={70} label="client/server" value="scales with subscribers" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="PubSub" value="doesn't scale" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSecurity({ t }: StepCtx) {
  return (
    <Svg label="the specification's own default isn't None, it's an invalid value specifically so no security is never chosen by accident — finding it set to None in a plant is a finding to raise" h={200}>
      <Row y={70} label="spec's default" value="invalid, not None" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="mode: None" value="a finding" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="typed nodes and references, a companion specification that standardizes a path across vendors, a deadband that cuts notification volume, PubSub that decouples cost from subscriber count, and a security default built to never be an accident" h={260}>
      <Row y={50} label="nodes, references" value="typed, browsable" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="companion spec" value="standardized path" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="deadband, PubSub" value="cut the traffic" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="security default" value="never an accident" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="given only the fields a browsed variable node carries, can the plant's whole equipment hierarchy be rebuilt from the model alone?" h={200}>
      <Row y={70} label="node's own fields" value="name, type, unit" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="hierarchy" value="already encoded" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
