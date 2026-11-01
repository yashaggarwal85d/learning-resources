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
    <Svg label="ANSI mode changed how existing types behave. This type never existed before." h={200}>
      <Row y={70} label="existing types" value="changed by ANSI" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="brand new" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTwoBadOptions({ t }: StepCtx) {
  return (
    <Svg label="semi-structured data used to force a choice between two bad options." h={200}>
      <Row y={70} label="JSON string" value="opaque, re-parsed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="inferred struct" value="breaks on drift" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictExtractSpeed({ t }: StepCtx) {
  return (
    <Svg label="extracting one field, over and over. JSON string, or VARIANT: which is faster?" h={200}>
      <Row y={70} label="same field" value="extracted repeatedly" />
      <Row y={130} label="string, or VARIANT?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealVariantFaster({ t }: StepCtx) {
  return (
    <Svg label="measured: the string column is slower. VARIANT was parsed once already." h={200}>
      <Row y={70} label="JSON string" value="re-parses, slower" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="VARIANT" value="already parsed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateSelfDescribing({ t }: StepCtx) {
  return (
    <Svg label="VARIANT is self-describing binary, not text -- extraction is pointer arithmetic." h={200}>
      <Row y={70} label="a header byte" value="per value" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="field names" value="one shared dictionary" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStructDrift({ t }: StepCtx) {
  return (
    <Svg label="a field whose type varies row to row, cast into a fixed struct. Every row survives?" h={200}>
      <Row y={70} label="mixed types" value="one fixed struct" />
      <Row y={130} label="every row survives?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStructDrops({ t }: StepCtx) {
  return (
    <Svg label="measured: the mismatched row quietly becomes NULL. VARIANT keeps every value." h={200}>
      <Row y={70} label="struct cast" value="mismatched row: NULL" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="VARIANT" value="every row intact" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateOneTypeChosen({ t }: StepCtx) {
  return (
    <Svg label="a struct picks one type per field before any data arrives." h={200}>
      <Row y={70} label="the struct" value="commits early" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="real data" value="doesn't always agree" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealShreddingSourced({ t }: StepCtx) {
  return (
    <Svg label="shredding buys the struct's own speed back, for the fields that earn it -- a later release." h={260}>
      <Row y={60} label="a hot field" value="its own column" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="the rest" value="stays tolerant" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="GA'd" value="a later release" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one type, three shapes of cost: a string's re-parsing, a struct's early commitment, VARIANT's binary." h={280}>
      <Row y={50} label="JSON string" value="re-parsed, slow" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="inferred struct" value="fast, but brittle" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="VARIANT" value="tolerant, then fast" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
