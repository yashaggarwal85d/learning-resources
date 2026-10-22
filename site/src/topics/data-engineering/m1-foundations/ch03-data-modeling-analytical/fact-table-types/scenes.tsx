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
    <Svg label="transaction, snapshot, accumulating, factless" h={240}>
      <Row y={55} label="transaction" value="one row per event" />
      <Row y={115} label="periodic snapshot" value="one row per period" />
      <Row y={175} label="accumulating" value="one row, updated" />
    </Svg>
  );
}

export function RevealTransaction({ t }: StepCtx) {
  return (
    <Svg label="a row exists only if the event happened" h={200}>
      <Row y={70} label="transaction row" value="a measurement event" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="dense, or sparse" value="never padded" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictPeriodicSnapshot({ t }: StepCtx) {
  return (
    <Svg label="an idle account, an idle day — still a row?" h={200}>
      <Row y={70} label="account, no activity" value="still get a row?" />
      <Row y={130} label="the grain is" value="the period itself" />
    </Svg>
  );
}

export function RevealPeriodicMeasured({ t }: StepCtx) {
  return (
    <Svg label="every account, every day, active or not" h={200}>
      <Row y={70} label="two accounts" value="present every day" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="no balance moved" value="rows still inserted" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAccumulatingQuote({ t }: StepCtx) {
  return (
    <Svg label="inserted once, updated after" h={200}>
      <Row y={70} label="pipeline begins" value="row inserted once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="pipeline moves" value="same row, updated" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictAccumulatingRows({ t }: StepCtx) {
  return (
    <Svg label="ordered, shipped, delivered — row count now?" h={200}>
      <Row y={70} label="three milestones" value="how many rows?" />
      <Row y={130} label="guess" value="one, or three?" />
    </Svg>
  );
}

export function RevealAccumulatingMeasured({ t }: StepCtx) {
  return (
    <Svg label="one row, three milestones, two lags computed" h={240}>
      <Row y={55} label="row count" value="stayed at one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="order to ship" value="lag computed" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="ship to deliver" value="lag computed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function RevealFactlessQuote({ t }: StepCtx) {
  return (
    <Svg label="coverage minus activity finds what didn't happen" h={200}>
      <Row y={70} label="no numeric fact" value="just dimension keys" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="coverage - activity" value="what never happened" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFactlessMeasured({ t }: StepCtx) {
  return (
    <Svg label="three expected, two attended, one missing" h={200}>
      <Row y={70} label="coverage table" value="students expected" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="minus activity" value="one found missing" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictAdditivityVerdict({ t }: StepCtx) {
  return (
    <Svg label="a late correction — which type just re-sums?" h={200}>
      <Row y={70} label="late correction" value="which types absorb it?" />
      <Row y={130} label="which one" value="recomputes instead?" />
    </Svg>
  );
}

export function RevealAdditivityVerdict({ t }: StepCtx) {
  return (
    <Svg label="transaction, snapshot: re-sum. accumulating: recompute." h={200}>
      <Row y={70} label="transaction, snapshot" value="additive as usual" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="accumulating lags" value="recomputed, not summed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four types, measured" h={240}>
      <Row y={55} label="transaction" value="dense, or sparse" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="periodic snapshot" value="every entity, every period" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="accumulating" value="updated row" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveTicketPipeline({ t }: StepCtx) {
  return (
    <Svg label="opened, first response, closed — which type?" h={200}>
      <Row y={70} label="ticket pipeline" value="defined start and end" />
      <Row y={130} label="which fact table" value="fits this shape?" />
    </Svg>
  );
}
