import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a weekend replication crosses a border nobody checked" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the whole events lake, replicated
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        "for performance," over a weekend
      </T>
      <Row y={150} label="monday" value="which rows crossed?" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="elsewhere" value="a region, lost" o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the catalog" value="missing from it" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which two decisions would have prevented both?" h={210}>
      <Row y={75} label="a faster tool" value="wrong problem" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a placement rule" value="and catalog backup" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPlacement({ t }: StepCtx) {
  return (
    <Svg label="personal data stops at the gate; an aggregate crosses freely" h={240}>
      <Row y={55} label="personal data" value="stays in region" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="an aggregate" value="crosses freely" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the gate" value="per dataset only" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealPriced({ t }: StepCtx) {
  return (
    <Svg label="replicate's recurring egress against federate's per-query cost" h={210}>
      <Row y={75} label="replicate" value="a recurring price" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="federate" value="a per-query price" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAggregateCompromise({ t }: StepCtx) {
  return (
    <Svg label="replicate the aggregate, never the rows, with a bounded paid lag" h={210}>
      <Row y={75} label="replicated" value="the aggregate only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the lag" value="bounded, paid for" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFailoverGaps({ t }: StepCtx) {
  return (
    <Svg label="the bucket survives; the catalog, the keys and the state do not" h={240}>
      <Row y={55} label="the bucket" value="replicated, survives" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="the catalog" value="missing" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the keys" value="missing too" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealRpoRto({ t }: StepCtx) {
  return (
    <Svg label="each data class gets its own recovery point and recovery time" h={210}>
      <Row y={75} label="per class" value="two clocks each" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="stated" value="not an afterthought" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStalestRegion({ t }: StepCtx) {
  return (
    <Svg label="the global figure's clock is pinned to the slowest region's clock" h={210}>
      <Row y={75} label="regions" value="combine into one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="freshness" value="the stalest region's" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a placement gate, a priced decision, a failover plan, one honest number" h={290}>
      <Row y={45} label="placement" value="by dataset tag" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="replicate vs federate" value="priced per query" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="failover" value="beyond the bucket" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="global metric" value="stalest region wins" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a third region backfills; what does the global number say meanwhile?" h={250}>
      <Row y={65} label="a new region" value="still backfilling" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the honest move" value="exclude, say so" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="not" value="blend it, unmarked" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
