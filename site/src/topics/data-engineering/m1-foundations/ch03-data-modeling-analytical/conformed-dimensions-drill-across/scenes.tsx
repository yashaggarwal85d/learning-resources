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
    <Svg label="orders fact + tickets fact, same shared date" h={200}>
      <Row y={70} label="orders fact" value="joined on shared date" />
      <Row y={130} label="tickets fact" value="joined on shared date" />
    </Svg>
  );
}

export function RevealConformedDimension({ t }: StepCtx) {
  return (
    <Svg label="same column names, same domain contents" h={200}>
      <Row y={70} label="conformed dimension" value="same names, same domain" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="only then" value="fact tables comparable" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictDirectJoin({ t }: StepCtx) {
  return (
    <Svg label="a conformed date, joined directly — safe?" h={200}>
      <Row y={70} label="date is conformed" value="safe to join and sum?" />
      <Row y={130} label="grains" value="do they even match?" />
    </Svg>
  );
}

export function RevealDrillAcross({ t }: StepCtx) {
  return (
    <Svg label="two queries, aligned by sort-merge, never joined" h={200}>
      <Row y={70} label="drilling across" value="two separate queries" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="aligned by" value="sort-merge, not a join" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBusMatrix({ t }: StepCtx) {
  return (
    <Svg label="processes down, conformed dimensions across" h={200}>
      <Row y={70} label="rows" value="business processes" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="columns" value="conformed dimensions" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFanOut({ t }: StepCtx) {
  return (
    <Svg label="joined directly: rows multiply, sum inflates" h={200}>
      <Row y={70} label="joined directly" value="row count multiplies" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="order total" value="comes out inflated" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAggregateFirst({ t }: StepCtx) {
  return (
    <Svg label="summarize each table first, then join the summaries" h={200}>
      <Row y={70} label="each fact table" value="summed to shared grain" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="then joined" value="one row meets one row" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictWhichIsCorrect({ t }: StepCtx) {
  return (
    <Svg label="two totals came out — which one is real?" h={200}>
      <Row y={70} label="fanned-out total" value="or" />
      <Row y={130} label="aggregate-first total" value="which is correct?" />
    </Svg>
  );
}

export function RevealIndependentConfirmation({ t }: StepCtx) {
  return (
    <Svg label="each fact table, summed alone, confirms it" h={200}>
      <Row y={70} label="summed alone" value="no join involved" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="matches" value="the aggregate-first figure" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="conformed, planned, aggregated before joining" h={240}>
      <Row y={55} label="conformed dimension" value="makes facts comparable" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="bus matrix" value="where it gets planned" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="drilling across" value="aggregate, then join" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveThirdFactTable({ t }: StepCtx) {
  return (
    <Svg label="a third fact table, same conformed date" h={200}>
      <Row y={70} label="third fact table" value="join directly, or first?" />
      <Row y={130} label="same date dimension" value="still conformed" />
    </Svg>
  );
}
