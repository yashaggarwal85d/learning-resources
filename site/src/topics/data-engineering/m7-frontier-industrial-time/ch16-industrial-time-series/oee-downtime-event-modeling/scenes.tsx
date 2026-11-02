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
    <Svg label="a changeover crosses a shift boundary and a gateway replay duplicates one interval — the same shift reports two different OEE numbers at two plants" h={200}>
      <Row y={70} label="one shift" value="same machines" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="two reports" value="two OEE numbers" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOeeFormula({ t }: StepCtx) {
  return (
    <Svg label="Availability × Performance × Quality, run against oee.com's own published worked example — both the factored and simplest forms land on the identical OEE figure" h={220}>
      <Row y={55} label="availability" value="run time" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="performance" value="ideal speed" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={170} label="quality" value="good parts" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealIntervalTable({ t }: StepCtx) {
  return (
    <Svg label="raw state-change events, paired up into a derived interval table — the interval table is never the thing actually stored" h={200}>
      <Row y={70} label="raw events" value="state changes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="interval table" value="derived, not stored" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBoundary({ t }: StepCtx) {
  return (
    <Svg label="a changeover crosses a shift boundary — does assigning it whole to one shift ever report a different number than splitting it?" h={200}>
      <Row y={70} label="one changeover" value="crosses midnight" />
      <Row y={130} label="assign, or split?" value="same number?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSplit({ t }: StepCtx) {
  return (
    <Svg label="the identical downtime interval, split at the real shift boundary, into two exact pieces that add back up to the original duration" h={200}>
      <Row y={70} label="before boundary" value="one piece" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="after boundary" value="a second piece" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMerge({ t }: StepCtx) {
  return (
    <Svg label="a replayed, overlapping interval inflates the naive sum; merging overlapping intervals before summing recovers the real total" h={220}>
      <Row y={55} label="real interval" value="one real stop" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="replayed duplicate" value="overlaps it" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="merged first" value="the real total" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealReasonCodes({ t }: StepCtx) {
  return (
    <Svg label="reason codes roll up to category totals; a micro-stop too short to log a reason for still counts, inside Performance rather than Availability" h={200}>
      <Row y={70} label="reason codes" value="roll up" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="micro-stops" value="inside Performance" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMtbf({ t }: StepCtx) {
  return (
    <Svg label="up-times between observed failures count toward MTBF; the stretch after the last failure, unclosed by a second failure, is excluded as censored" h={220}>
      <Row y={55} label="between failures" value="counted" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="after last failure" value="unclosed" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="censored tail" value="excluded" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealPolicy({ t }: StepCtx) {
  return (
    <Svg label="the identical raw downtime minutes, classified under two different planned/unplanned policies, give two different Availability figures" h={200}>
      <Row y={70} label="policy one" value="one availability" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="policy two" value="a different one" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="A×P×Q reconciled, a derived interval table, a boundary split, a merged double-count, rolled-up reason codes, MTBF/MTTR with a censored tail, and a policy that changes the number" h={260}>
      <Row y={50} label="OEE formula" value="reconciled exactly" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="boundary + replay" value="both bugs fixed" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="MTBF, MTTR" value="censored tail excluded" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="one policy choice" value="changes the number" valueColor={C.badText} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a plant manager reclassifies changeovers as planned, the day after reviewing this month's numbers — does the plant's machines or output change at all?" h={200}>
      <Row y={70} label="policy changes" value="on paper" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the machines" value="unchanged, either way" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
