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
    <Svg label="a field quietly dropped, a dashboard broken three days later" h={200}>
      <Row y={70} label="field dropped" value="silently allowed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="consumers see" value="null, unnoticed" valueColor={C.bad} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a record's fields still mean what they meant when it was first written" h={200}>
      <Row y={70} label="a replay trusts" value="fields unchanged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the contract" value="a registry" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGate({}: StepCtx) {
  return (
    <Svg label="the same field removal, checked under a stricter compatibility mode" h={200}>
      <Row y={70} label="same evolution" value="stricter gate" />
      <Row y={130} label="still allowed" value="through?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealModes({ t }: StepCtx) {
  return (
    <Svg label="backward, forward, full, and transitive — four modes, two directions" h={200}>
      <Row y={70} label="backward" value="new reads old" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="transitive" value="checks every version" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGates({ t }: StepCtx) {
  return (
    <Svg label="the same removal passes backward, but a required addition fails it" h={200}>
      <Row y={70} label="field removed" value="passes backward" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="field required" value="fails backward" valueColor={C.bad} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFormats({}: StepCtx) {
  return (
    <Svg label="the same renamed field, checked by three different schema formats" h={200}>
      <Row y={70} label="field renamed" value="same meaning" />
      <Row y={130} label="which format" value="catches a break?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFormats({ t }: StepCtx) {
  return (
    <Svg label="Avro resolves by name, Protobuf by number, JSON Schema natively by neither" h={200}>
      <Row y={70} label="Avro" value="name, with default" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Protobuf" value="number, not name" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWire({ t }: StepCtx) {
  return (
    <Svg label="a naming strategy sets the check scope; the wire record carries only a schema id" h={200}>
      <Row y={70} label="subject strategy" value="sets check scope" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="wire record" value="carries small id" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="compat checker" value="matched the rules" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="field reuse" value="caught, unsafe" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="wire round trip" value="id round-trips clean" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="pick the mode, know the format, pick the strategy, and what a contract adds" h={260}>
      <Row y={50} label="mode" value="matches upgrade order" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="format rules" value="differ by design" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="data contract" value="adds meaning too" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
