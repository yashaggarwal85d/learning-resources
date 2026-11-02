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
    <Svg label="a battery supplier must hand over a nameplate, technical data, a carbon footprint and handover documents, and the data arrives as PDFs, spreadsheets and several incompatible JSON shapes" h={200}>
      <Row y={70} label="supplier data" value="PDFs, spreadsheets" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="JSON shapes" value="incompatible" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictShape({ t }: StepCtx) {
  return (
    <Svg label="what does a shared shape with semantic ids buy the carmaker's pipeline, and what does it still not guarantee about a value?" h={200}>
      <Row y={70} label="shared shape" value="buys structure" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="value truth?" value="not guaranteed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTypeInstance({ t }: StepCtx) {
  return (
    <Svg label="a machine model's own data is described once, in a type shell, and each serial number gets its own instance shell, distinguished by one attribute, each referencing the type it derives from" h={200}>
      <Row y={70} label="type shell" value="described once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="instance shell" value="references type" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSemanticId({ t }: StepCtx) {
  return (
    <Svg label='one supplier names a property "weight," another names the same property "mass," and both carry the same semantic id, so a query matching by meaning finds both' h={200}>
      <Row y={70} label="local names" value="weight, mass" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="semantic ID" value="same meaning" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTransport({ t }: StepCtx) {
  return (
    <Svg label="the same submodel, read live over an api or unpacked from an exchanged file, returns identical content either way, so the transport changes but the submodel does not" h={200}>
      <Row y={70} label="REST read" value="identical content" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="AASX file" value="identical content" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealValidationCatches({ t }: StepCtx) {
  return (
    <Svg label="a property with no semantic id at all cannot be matched to anything, a submodel missing a property the template requires fails the same gate, and neither reaches the lakehouse" h={200}>
      <Row y={70} label="no semantic ID" value="rejected" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="missing property" value="rejected" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealValidationBlind({ t }: StepCtx) {
  return (
    <Svg label="a submodel with a wrong serial number, but a complete, correctly tagged structure, still passes the identical gate, because the structure was never the claim that needed checking" h={200}>
      <Row y={70} label="wrong value" value="still passes" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="structure" value="correctly tagged" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one type shell, instances that reference it, a semantic id that outlasts a supplier's own naming, a rest read and a packaged file that agree, and a validation gate strict on structure, silent on truth" h={260}>
      <Row y={50} label="shells" value="type, instances" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="semantic ID" value="outlasts naming" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="transport" value="REST, AASX agree" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="validation" value="structure, not truth" valueColor={C.badText} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a supplier's carbon-footprint submodel is complete, correctly tagged, and passes validation cleanly — does that mean the carbon-footprint figure inside it is actually correct?" h={200}>
      <Row y={70} label="submodel" value="passes cleanly" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the figure" value="still unverified" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
