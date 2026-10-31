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
    <Svg label="every row changed. or did it?" h={200}>
      <Row y={70} label="naive check" value="rows differ" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="column summary" value="one column moved" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictExactMeansEveryRow({ t }: StepCtx) {
  return (
    <Svg label="does exact mean every row?" h={200}>
      <Row y={70} label="full join-diff" value="exact" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every row read?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealJoinDiff({ t }: StepCtx) {
  return (
    <Svg label="join on key. compare every column." h={200}>
      <Row y={70} label="join-diff" value="reads both sides" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every row" value="always scanned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChecksumBisection({ t }: StepCtx) {
  return (
    <Svg label="hash the range. split only on mismatch." h={200}>
      <Row y={70} label="checksum match" value="range skipped" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checksum mismatch" value="split and recurse" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFloatDifferenceReal({ t }: StepCtx) {
  return (
    <Svg label="same pieces, different order." h={200}>
      <Row y={70} label="two totals" value="not equal" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a real change?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTolerance({ t }: StepCtx) {
  return (
    <Svg label="one band. noise passes. the bug does not." h={200}>
      <Row y={70} label="harmless noise" value="within tolerance" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="real bug" value="outside tolerance" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealColumnSummary({ t }: StepCtx) {
  return (
    <Svg label="one column named. the rest untouched." h={200}>
      <Row y={70} label="changed column" value="named directly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="other columns" value="untouched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCostCurve({ t }: StepCtx) {
  return (
    <Svg label="same real changes. a bigger table." h={260}>
      <Row y={40} label="join-diff cost" value="grows with table" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="bisection cost" value="grows far slower" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="the gap" value="keeps widening" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="exact. tolerant. reviewable." h={260}>
      <Row y={40} label="two strategies" value="both exact" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="tolerance band" value="ignores noise" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="column summary" value="actually reviewable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="same table. same bug. how many rows?" h={200}>
      <Row y={70} label="join-diff" value="reads it all" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="bisection" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
