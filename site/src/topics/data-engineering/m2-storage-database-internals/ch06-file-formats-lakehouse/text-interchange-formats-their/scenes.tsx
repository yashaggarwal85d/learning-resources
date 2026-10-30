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

/** A label stacked above its value (for a value too long to sit beside the label on one line). */
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

/** A monospace line of raw text, for showing an actual CSV/JSON fragment. */
function Raw({ y, text, color = C.primary, o = 1, s = 15 }: { y: number; text: string; color?: string; o?: number; s?: number }) {
  return (
    <T x={25} y={y} s={s} f={color} w={500} o={o}>
      {text}
    </T>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label='one row, one comma inside a name — a naive reader sees 4 fields, not 3.' h={240}>
      <Raw y={40} text='"Smith, John",42,Mumbai' color={C.focus} s={16} />
      <Row y={100} label="naive split(',')" value="4 fields" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={150} label="a real CSV parser" value="3 fields" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function PredictQuoting({ t }: StepCtx) {
  return (
    <Svg label="quoting fixes the comma. What about a quote inside the field?" h={240}>
      <Raw y={40} text='"Smith, John",42,Mumbai' color={C.quiet} s={15} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={90} label="quoted field" value="3 fields, correct" o={easeOut(seg(t, 0.15, 0.55))} />
      <Raw y={150} text='"O?Brien",7' color={C.focus} s={16} o={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={200} label="a quote inside the field" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealEmbeddedQuote({ t }: StepCtx) {
  return (
    <Svg label={'a backslash reads back as O\\Brien". RFC 4180’s doubled quote reads back as O"Brien.'} h={260}>
      <Raw y={40} text='"O\\"Brien",7' color={C.quiet} />
      <Row y={85} label="backslash escape" value='O\\Brien"' o={easeOut(seg(t, 0.1, 0.55))} />
      <Raw y={150} text='"O""Brien",7' color={C.primary} />
      <Row y={195} label="doubled quote" value='O"Brien' valueColor={C.focus} o={easeOut(seg(t, 0.45, 0.95))} />
    </Svg>
  );
}

export function RevealEmbeddedNewline({ t }: StepCtx) {
  return (
    <Svg label="naive line-split sees 3 records; a real CSV parser sees 2." h={260}>
      <Raw y={40} text='"123 Main St' color={C.quiet} />
      <Raw y={62} text={'Apt 4",Chicago'} color={C.quiet} />
      <Row y={110} label="naive split on newline" value="3 records" o={easeOut(seg(t, 0.15, 0.6))} />
      <Row y={165} label="a real CSV parser" value="2 records, address intact" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealSurprisingNumber({ t }: StepCtx) {
  return (
    <Svg label="order_id 9,007,199,254,740,993 — a double-precision parser returns 9,007,199,254,740,992." h={280}>
      <TallRow y={70} label="order_id in the file" value="9,007,199,254,740,993" o={easeOut(seg(t, 0.1, 0.55))} />
      <TallRow y={170} label="read by a double-precision parser" value="9,007,199,254,740,992" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealBom({ t }: StepCtx) {
  return (
    <Svg label="a byte order mark at the front of the file: a parser that doesn't tolerate it raises before it reads a single field." h={260}>
      <Raw y={40} text='EF BB BF { "status": "ok" }' color={C.quiet} />
      <Row y={90} label="parsed as-is" value="fails to parse" o={easeOut(seg(t, 0.1, 0.55))} />
      <Raw y={150} text='{ "status": "ok" }' color={C.primary} o={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={195} label="BOM stripped first" value="parses correctly" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealNoTypes({ t }: StepCtx) {
  return (
    <Svg label="CSV, JSON, XML: three formats, zero of them typed." h={300}>
      <Row y={40} label="CSV" value="no type system" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={85} label="JSON / JSONL" value="no columnar pushdown" o={easeOut(seg(t, 0.15, 0.5))} />
      <Row y={130} label="XML" value="schema lives outside the file" o={easeOut(seg(t, 0.3, 0.65))} />
      <TallRow y={200} label="all three" value="accepted at the edge, converted immediately" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five traps, one rule: accept them at the edge, convert immediately." h={340}>
      <Row y={35} label="unquoted comma" value="4 fields → 3" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={70} label="embedded quote" value="backslash → doubled" o={easeOut(seg(t, 0.1, 0.35))} />
      <Row y={105} label="embedded newline" value="3 records → 2" o={easeOut(seg(t, 0.2, 0.45))} />
      <Row y={140} label="JSON precision" value="…993 → …992" o={easeOut(seg(t, 0.3, 0.55))} />
      <Row y={175} label="leading BOM" value="fails → parses" o={easeOut(seg(t, 0.4, 0.65))} />
      <TallRow y={250} label="the rule" value="accept at the edge, convert immediately" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}
