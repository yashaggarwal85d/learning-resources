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
    <Svg label="an oven dashboard shows a flat line through a four-hour network outage — the sensor was down the whole time, and the flat line is the last known reading carried forward" h={200}>
      <Row y={70} label="the dashboard" value="a flat line" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the sensor" value="was down" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSignalType({ t }: StepCtx) {
  return (
    <Svg label="a continuous reading, a machine-state code and an energy counter are three different kinds of number, each needing a different aggregate" h={220}>
      <Row y={55} label="temperature" value="continuous" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="machine state" value="a code" valueColor={C.second} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="energy" value="a counter" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictStateMean({ t }: StepCtx) {
  return (
    <Svg label="a bucket holds a state-1 reading and a state-2 reading — averaged like a temperature, what does the bucket report?" h={200}>
      <Row y={70} label="two states" value="averaged?" />
      <Row y={130} label="the result" value="a real state?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealWrongAggregate({ t }: StepCtx) {
  return (
    <Svg label="state 1 and state 2 land in the same bucket; their mean is 1.5, a state no machine was ever in" h={200}>
      <Row y={70} label="the mean" value="comes back 1.5" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="state 1.5" value="never existed" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRightAggregate({ t }: StepCtx) {
  return (
    <Svg label="a continuous reading resamples to a mean, a state code carries forward its last value, a counter resamples to the difference of its end values" h={260}>
      <Row y={50} label="continuous" value="mean" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="state code" value="last value" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="counter" value="diff of ends" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={190} label="one mean" value="fits none" valueColor={C.badText} o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function RevealTwoFillsLie({ t }: StepCtx) {
  return (
    <Svg label="a real 30-degree excursion happens during the outage; carrying the last value forward and interpolating across the gap both independently hide it" h={220}>
      <Row y={55} label="real excursion" value="30 degrees" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="carried forward" value="hides it" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="interpolated" value="hides it too" valueColor={C.badText} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealMaxGapFlag({ t }: StepCtx) {
  return (
    <Svg label="a fill only runs up to a stated maximum gap; past it, the bucket is marked missing, not filled, and every bucket carries an observed/filled/missing flag" h={220}>
      <Row y={55} label="within max gap" value="filled" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="past max gap" value="missing" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="every bucket" value="carries a flag" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a signal type decides its aggregate, averaging a state code is meaningless, and a filled value is a bounded, flagged claim" h={260}>
      <Row y={50} label="signal type" value="decides aggregate" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="state mean" value="meaningless" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a fill" value="is a claim" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="the flag" value="bounds the claim" valueColor={C.second} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a dashboard's line has never once shown a gap, for any sensor, in a year — is that evidence the sensors never went offline?" h={200}>
      <Row y={70} label="no gap ever" value="a full year" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="every sensor" value="zero downtime?" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
