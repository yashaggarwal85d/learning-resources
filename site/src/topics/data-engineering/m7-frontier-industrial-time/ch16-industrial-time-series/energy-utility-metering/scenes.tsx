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
    <Svg label="a line's daily energy total reads a normal figure most days and an astronomical one on a meter-swap day — a prior fix had already silently deleted a real reset" h={200}>
      <Row y={70} label="most days" value="a normal total" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="swap day" value="an astronomical one" valueColor={C.badText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCumulative({ t }: StepCtx) {
  return (
    <Svg label="a meter's own reading only ever goes up; consumption is a difference of two readings, which works until the register stops simply counting up" h={200}>
      <Row y={70} label="the register" value="only goes up" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="consumption" value="a difference" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictNegative({ t }: StepCtx) {
  return (
    <Svg label="a register's difference between two readings comes back negative — does that always mean the same failure happened?" h={200}>
      <Row y={70} label="negative diff" value="same failure?" />
      <Row y={130} label="three causes?" value="or just one?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRollover({ t }: StepCtx) {
  return (
    <Svg label="a register wraps at its own known, fixed width — knowing that width recovers the exact real consumption, with no uncertainty left" h={200}>
      <Row y={70} label="rollover" value="wraps at its width" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="known width" value="recovered, exactly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReset({ t }: StepCtx) {
  return (
    <Svg label="a device restart drops the register near zero; the lost consumption has no recovering formula, only an upper bound from elapsed time and a known maximum rate" h={200}>
      <Row y={70} label="reset" value="register near zero" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="true loss" value="bounded, not known" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOldFix({ t }: StepCtx) {
  return (
    <Svg label="the old fix drops a negative difference and reports zero; the honest bound reports a real, nonzero upper range for the same event" h={200}>
      <Row y={70} label="old fix" value="reports zero" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="honest bound" value="a real range" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSwap({ t }: StepCtx) {
  return (
    <Svg label="diffing straight across a meter swap gives a nonsensical huge number; splitting the series at the swap gives the real consumption on each side" h={200}>
      <Row y={70} label="diff across swap" value="nonsense" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="split at swap" value="the real numbers" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIntegration({ t }: StepCtx) {
  return (
    <Svg label="an irregularly-sampled power series, properly integrated into energy, against a naive unweighted average of the same readings multiplied by elapsed time" h={200}>
      <Row y={70} label="integrated" value="the real energy" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="naive average" value="a wrong number" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAllocation({ t }: StepCtx) {
  return (
    <Svg label="one header meter's total, allocated to one line by two different rules, with the gap between them converted into an actual currency spread" h={220}>
      <Row y={55} label="by hours" value="one figure" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="by count" value="a different one" valueColor={C.second} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="the spread" value="a real cost" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three distinct ways a difference breaks, a bounded reset, a split swap, integration over averaging, and a costed allocation spread" h={260}>
      <Row y={50} label="three failures" value="three fixes" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a reset" value="bounded, not hidden" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="power" value="integrated" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="allocation" value="a real cost" valueColor={C.badText} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a sustainability report needs one energy-per-good-unit figure for a shared-header-meter line — does the allocation rule change the reported number?" h={200}>
      <Row y={70} label="one KPI" value="energy per unit" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the rule behind it" value="changes the number" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
