import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} a="end" s={17} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

function TwoLine({ y, l1, l2, color = C.quiet, s = 13 }: { y: number; l1: string; l2: string; color?: string; s?: number }) {
  return (
    <g>
      <T x={25} y={y} s={s} f={color}>
        {l1}
      </T>
      <T x={25} y={y + 20} s={s} f={color}>
        {l2}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="currency is missing from the written record; the reader's schema gives it a default." h={220}>
      <Row y={40} label="written record" value="order_id, amount_cents" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={85} label="reader asks for" value="+ currency, default USD" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={140} label="resolved currency" value='"USD"' valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function PredictDefault({ t }: StepCtx) {
  return (
    <Svg label="a default saved the last field. Does a required field with no default get the same pass?" h={200}>
      <Row y={50} label="reader asks for" value="+ currency, default USD" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="reader asks for" value="+ discount_cents, no default" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNoDefault({ t }: StepCtx) {
  return (
    <Svg label="no default, no matching writer field: the spec calls this an error, not a guess." h={200}>
      <Row y={50} label="discount_cents" value="not in the writer's record" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="resolution" value="error" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealProtobufIntro({ t }: StepCtx) {
  return (
    <Svg label="Protobuf doesn't match fields by name at all — only by number, on the wire." h={200}>
      <Row y={50} label="Avro matches fields by" value="name" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="Protobuf matches fields by" value="number" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictFieldReuse({ t }: StepCtx) {
  return (
    <Svg label="field 2 (a string) is deleted; a new int field takes number 2 without reserving it." h={220}>
      <Row y={40} label="old field 2" value="customer_name, a string" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={90} label="new field 2" value="total_cents, an int" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={140} label="decoding an old record's field 2" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealSurprisingNumber({ t }: StepCtx) {
  return (
    <Svg label="the old string's bytes decode as a specific, valid-looking int — no parse error at all." h={220}>
      <Row y={40} label='old field 2, "customer_name"' value='"Alice"' o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={90} label="same bytes, read as the new field 2" value="1,667,853,377" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.8))} />
      <TwoLine y={165} l1="reserving field 2 would have made this" l2="a compile-time error instead" o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealParquetIntro({ t }: StepCtx) {
  return (
    <Svg label="one schema change, read back three ways: by name, by position, by field ID." h={220}>
      <Row y={40} label="change" value="rename cust_id, insert region" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={90} label="by name" value="?" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={130} label="by position" value="?" o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={170} label="by field ID" value="?" o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealByPosition({ t }: StepCtx) {
  return (
    <Svg label="inserting one column shifts every later slot — by-position reads each one's wrong data." h={220}>
      <Row y={40} label="by name: renamed column" value="missing (safe)" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={90} label="by position: region reads" value="4,599" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={140} label="by position: amount_cents reads" value='"USD"' valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.9))} />
    </Svg>
  );
}

export function RevealByFieldId({ t }: StepCtx) {
  return (
    <Svg label="matched by field ID, every real column resolves correctly, renamed or not." h={220}>
      <Row y={40} label="by field ID: customer_id" value="4,017 (correct)" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={90} label="by field ID: amount_cents" value="4,599 (correct)" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={140} label="by field ID: region (new)" value="missing (correct)" valueColor={C.focus} o={easeOut(seg(t, 0.45, 0.9))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one shared shape: every safe evolution move still needs a stable identity to match against." h={330}>
      <TallRow y={35} label="Avro" value="matches by name, needs a default" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="Protobuf" value="matches by number, guards it with reserved" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="Parquet" value="can match by a stable field ID" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a safe rename needs a stable ID,
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          not just a new name or position
        </T>
      </g>
    </Svg>
  );
}
