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
    <Svg label="every card number and email, found." h={200}>
      <Row y={70} label="structured tables" value="fully scanned" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="security" value="signs off" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="a phone and a card ending, in prose." h={200}>
      <Row y={70} label="free-text note" value="not yet scanned" />
      <Row y={130} label="model closes it?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTwoLabels({ t }: StepCtx) {
  return (
    <Svg label="a tier for handling. A category for rules." h={200}>
      <Row y={70} label="sensitivity tier" value="how carefully" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="category" value="which rules" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPatternChecksum({ t }: StepCtx) {
  return (
    <Svg label="shape plus checksum." h={260}>
      <Row y={50} label="pattern alone" value="catches a shape" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="plus checksum" value="a valid shape" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="structured columns" value="91% precision" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealVendorClassifiers({ t }: StepCtx) {
  return (
    <Svg label="four platforms, the same techniques." h={260}>
      <Row y={40} label="Macie" value="managed + custom" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={80} label="Purview" value="built-in + custom" o={easeOut(seg(t, 0.1, 0.35))} />
      <Row y={120} label="Databricks" value="agentic AI" o={easeOut(seg(t, 0.2, 0.45))} />
      <Row y={160} label="Google" value="infoType detectors" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealTagPropagation({ t }: StepCtx) {
  return (
    <Svg label="survives a hash. An aggregate can drop it." h={260}>
      <Row y={50} label="source column" value="tagged, readable" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="hashed column" value="tagged, unreadable" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="aggregate" value="tag gone" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealFalseNegatives({ t }: StepCtx) {
  return (
    <Svg label="three of six notes, missed." h={260}>
      <Row y={50} label="structured recall" value="100%" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="free-text recall" value="50%" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="notes missed" value="3 of 6" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealPolicyInput({ t }: StepCtx) {
  return (
    <Svg label="every later policy reads a tag." h={200}>
      <Row y={70} label="every policy" value="reads a tag" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a missed tag" value="a silent gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two labels, three techniques, a tag that travels." h={260}>
      <Row y={50} label="two labels" value="tier and category" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="pattern, model, agent" value="three techniques" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="free text" value="a real miss" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="half caught, a fifth truly sensitive." h={200}>
      <Row y={70} label="discovery recall" value="50%" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="sensitive and unprotected" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
