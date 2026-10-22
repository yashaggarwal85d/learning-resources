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

/** Two boxes with a connecting line, labelled above and below — the shared diagram shape for all three levels. */
function Pair({ leftLabel, rightLabel, rel, relColor = C.crema, o = 1 }: { leftLabel: string; rightLabel: string; rel: string; relColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={60} y={70} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
      <T x={140} y={112} s={17} f={C.crema} a="middle">
        {leftLabel}
      </T>
      <line x1={220} y1={105} x2={380} y2={105} stroke={C.mocha} strokeWidth={2} />
      <T x={300} y={92} s={13} f={relColor} a="middle">
        {rel}
      </T>
      <rect x={380} y={70} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
      <T x={460} y={112} s={17} f={C.crema} a="middle">
        {rightLabel}
      </T>
    </g>
  );
}

export function Opening({ t }: StepCtx) {
  return (
    <Svg label="three decisions every schema passes through" h={200}>
      <Row y={70} label="before a table exists" value="three decisions" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this refresher" value="what each one fixes" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealConceptual({ t }: StepCtx) {
  return (
    <Svg label="the conceptual level names entities and their relationship" h={200}>
      <Pair leftLabel="Customer" rightLabel="Address" rel="has more than one" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={170} label="level" value="conceptual — business entities only" o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function PredictConceptualFixesShape({ t }: StepCtx) {
  return (
    <Svg label="is the shape and storage already fixed" h={200}>
      <Row y={70} label="fact named" value="more than one address" />
      <Row y={130} label="shape and storage" value="?" />
    </Svg>
  );
}

export function RevealLogical({ t }: StepCtx) {
  return (
    <Svg label="the logical level adds cardinality and attributes" h={200}>
      <Pair leftLabel="Customer" rightLabel="Address" rel="one — many" relColor={C.second} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={170} label="level" value="logical — structure, no engine yet" o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealPhysical({ t }: StepCtx) {
  return (
    <Svg label="the physical level is a real table with a foreign key" h={200}>
      <Pair leftLabel="customer (table)" rightLabel="address (table)" rel="foreign key, indexed" relColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={170} label="level" value="physical — the one that has to run" o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealDecisionFlow({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['conceptual', 'fixes entities'],
    ['logical', 'fixes structure'],
    ['physical', 'fixes the layout'],
  ];
  return (
    <Svg label="each level fixes what the one before it left open" h={240}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={60 + i * 65} label={label} value={value} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.6))} />
      ))}
    </Svg>
  );
}

export function RevealBoundaryBlurs({ t }: StepCtx) {
  return (
    <Svg label="single-engine builds often merge logical and physical" h={200}>
      <Row y={70} label="single engine" value="logical, physical often merge" />
      <Row y={130} label="kept separate" value="one model, many logical ones" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three levels, three jobs" h={200}>
      <Row y={60} label="conceptual" value="what exists" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="logical" value="how it is shaped" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={160} label="physical" value="how it runs" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}
