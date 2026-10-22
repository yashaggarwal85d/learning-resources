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

/** Two boxes with a connecting line and end symbols — the shared ER diagram shape for every cardinality. */
function Pair({ leftLabel, rightLabel, leftMark, rightMark, markColor = C.focus, o = 1 }: { leftLabel: string; rightLabel: string; leftMark: string; rightMark: string; markColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={50} y={70} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
      <T x={130} y={112} s={17} f={C.crema} a="middle">
        {leftLabel}
      </T>
      <line x1={210} y1={105} x2={390} y2={105} stroke={C.mocha} strokeWidth={2} />
      <T x={225} y={92} s={14} f={markColor} a="middle">
        {leftMark}
      </T>
      <T x={375} y={92} s={14} f={markColor} a="middle">
        {rightMark}
      </T>
      <rect x={390} y={70} width={160} height={70} rx={10} fill={C.cocoa} stroke={C.mocha} strokeWidth={2} />
      <T x={470} y={112} s={17} f={C.crema} a="middle">
        {rightLabel}
      </T>
    </g>
  );
}

export function Opening({ t }: StepCtx) {
  return (
    <Svg label="how many of one thing relates to how many of another" h={200}>
      <Row y={70} label="every relationship" value="answers one question" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this refresher" value="reading it off a diagram" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeSymbols({ t }: StepCtx) {
  return (
    <Svg label="three symbols, paired for minimum and maximum" h={220}>
      <Row y={55} label="ring" value="zero" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={105} label="dash" value="one" o={easeOut(seg(t, 0.15, 0.65))} />
      <Row y={155} label="crow's foot" value="many" valueColor={C.second} o={easeOut(seg(t, 0.3, 0.8))} />
    </Svg>
  );
}

export function RevealOneToOne({ t }: StepCtx) {
  return (
    <Svg label="one customer, one card, mandatory both ends" h={200}>
      <Pair leftLabel="Customer" rightLabel="Loyalty card" leftMark="dash" rightMark="dash" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={170} label="cardinality" value="one-to-one, both mandatory" o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function PredictForeignKeySide({ t }: StepCtx) {
  return (
    <Svg label="which side holds the foreign key" h={200}>
      <Row y={70} label="one customer" value="many orders" />
      <Row y={130} label="foreign key lives on" value="?" />
    </Svg>
  );
}

export function RevealForeignKeyOnMany({ t }: StepCtx) {
  return (
    <Svg label="the order row holds a single customer id" h={200}>
      <Row y={70} label="customer row" value="cannot hold a list of orders" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="order row" value="holds one customer id" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealManyToMany({ t }: StepCtx) {
  return (
    <Svg label="crow's foot at both ends" h={200}>
      <Pair leftLabel="Order" rightLabel="Product" leftMark="crow's foot" rightMark="crow's foot" markColor={C.second} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={170} label="cardinality" value="many-to-many" o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealJunctionTable({ t }: StepCtx) {
  return (
    <Svg label="a third table, with a foreign key to each side" h={220}>
      <Row y={55} label="order table" value="order id" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={105} label="product table" value="product id" o={easeOut(seg(t, 0.15, 0.65))} />
      <Row y={155} label="order_product table" value="both, as its own key" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.9))} />
    </Svg>
  );
}

export function RevealOptionality({ t }: StepCtx) {
  return (
    <Svg label="a ring at an end means optional there" h={200}>
      <Row y={70} label="dash at an end" value="mandatory there" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="ring at an end" value="optional there" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three symbols, many side keeps the key, M:N means a third table" h={200}>
      <Row y={60} label="symbols" value="paired, min and max" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="one-to-many" value="key on the many side" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={160} label="many-to-many" value="always a third table" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}
