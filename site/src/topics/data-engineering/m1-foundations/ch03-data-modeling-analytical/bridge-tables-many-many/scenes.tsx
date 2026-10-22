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
    <Svg label="one order, three promo tags, one bridge" h={200}>
      <Row y={70} label="one order" value="three promo tags at once" />
      <Row y={130} label="joined and summed" value="what total comes out?" />
    </Svg>
  );
}

export function RevealMultivaluedQuote({ t }: StepCtx) {
  return (
    <Svg label="one group key, one row per simultaneous value" h={200}>
      <Row y={70} label="multivalued" value="more than one value at once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="attaches through" value="a bridge, by group key" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictBridgeSum({ t }: StepCtx) {
  return (
    <Svg label="join through the bridge, sum — the real total?" h={200}>
      <Row y={70} label="order's own amount" value="joined through the bridge" />
      <Row y={130} label="summed" value="still the real total?" />
    </Svg>
  );
}

export function RevealDoubleCount({ t }: StepCtx) {
  return (
    <Svg label="unweighted: the amount, three times over" h={200}>
      <Row y={70} label="three tags" value="amount duplicated each time" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="summed unweighted" value="far past the real total" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWeightingQuote({ t }: StepCtx) {
  return (
    <Svg label="an allocation factor, assigned to each row" h={200}>
      <Row y={70} label="grouping, unweighted" value="over-counts the metric" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="fix" value="a weighting factor per row" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWeightingMeasured({ t }: StepCtx) {
  return (
    <Svg label="weights sum to one; the true total, back" h={200}>
      <Row y={70} label="three weights" value="sum to exactly one" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="weighted sum" value="the order's real total" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRaggedQuote({ t }: StepCtx) {
  return (
    <Svg label="indeterminate depth, hard to model directly" h={200}>
      <Row y={70} label="one branch" value="three levels deep" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="another branch" value="a single leaf" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictFlattenedRecursion({ t }: StepCtx) {
  return (
    <Svg label="built once — still needs recursion to read?" h={200}>
      <Row y={70} label="bridge built once" value="every path, pre-computed" />
      <Row y={130} label="reading it" value="still recursive?" />
    </Svg>
  );
}

export function RevealFlattenedBridge({ t }: StepCtx) {
  return (
    <Svg label="read with a flat filter, no recursion" h={200}>
      <Row y={70} label="every path" value="pre-computed, once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="reading it" value="a flat filter, no recursion" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRecursiveCheck({ t }: StepCtx) {
  return (
    <Svg label="walked independently, same categories back" h={200}>
      <Row y={70} label="raw tree, walked" value="a fresh recursive query" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="result" value="matches the bridge exactly" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="bridge, weighted, flattened — measured" h={240}>
      <Row y={55} label="multivalued" value="one row per value" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="weights" value="sum to one, fix the total" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="ragged bridge" value="recursion paid once" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveProductTags({ t }: StepCtx) {
  return (
    <Svg label="two overlapping tags, an unweighted sum" h={200}>
      <Row y={70} label="product, two tags" value="unweighted revenue sum" />
      <Row y={130} label="trust it" value="or fix it first?" />
    </Svg>
  );
}
