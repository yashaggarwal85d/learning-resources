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
    <Svg label="a year of a temperature tag, extracted and averaged, comes out several degrees off the plant's own reported average — nothing in the archive is actually broken" h={200}>
      <Row y={70} label="extracted mean" value="several degrees off" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="archive" value="nothing broken" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMean({ t }: StepCtx) {
  return (
    <Svg label="the historian kept only the points needed to reconstruct the curve within a stated error band — what would have given the right mean, and what should the extraction have recorded?" h={200}>
      <Row y={70} label="kept points" value="within an error band" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="right mean?" value="time-weighted + flag" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealException({ t }: StepCtx) {
  return (
    <Svg label="a simple deadband applied at the interface passes a value only once it moves past a stated threshold, so nearly every point in a flat stretch never reaches the archive" h={200}>
      <Row y={70} label="deadband" value="simple threshold filter" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="flat stretch" value="almost nothing passes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSwingingDoor({ t }: StepCtx) {
  return (
    <Svg label="two doors pivot on the last stored point, swinging open as values arrive, and a knee is recorded the moment the doors can no longer stay parallel" h={200}>
      <Row y={70} label="two doors" value="pivot, swing open" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="knee" value="doors can't stay parallel" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealErrorBand({ t }: StepCtx) {
  return (
    <Svg label="every stored knee stays within the stated compression deviation of the line it approximates, and the point count falls by more than 80%" h={200}>
      <Row y={70} label="every knee" value="within CompDev" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="point count" value="falls sharply" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBias({ t }: StepCtx) {
  return (
    <Svg label="a long quiet hold collapses to almost nothing while a short volatile stretch forces many knees, and a plain average over the stored knees weighs them equally anyway" h={200}>
      <Row y={70} label="quiet hold" value="almost no knees" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="volatile stretch" value="many knees" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTimeWeighted({ t }: StepCtx) {
  return (
    <Svg label="weighting by time instead of by row, or interpolating a value at every original timestamp, tracks the true average far more closely than the plain knee average does" h={200}>
      <Row y={70} label="knee average" value="biased" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="time-weighted" value="tracks the truth" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStep({ t }: StepCtx) {
  return (
    <Svg label="drawing a straight line between two knees across a genuine step badly misreads the value just before it moves, while holding the last recorded value reads it exactly" h={200}>
      <Row y={70} label="straight line" value="badly misreads a step" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="step interpolation" value="reads it exactly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="exception filtering before compression, swinging-door knees within a stated error band, a plain knee average that misleads, a time-weighted fix, and step series that need step interpolation" h={260}>
      <Row y={50} label="exception, swinging door" value="filter, then compress" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="error band" value="holds, measured" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="knee average" value="misleads" valueColor={C.badText} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="time-weighted, step mode" value="the fix" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="an extraction carries only values, no flag and no compression deviation — can a later analyst tell a recorded point from an interpolated one?" h={200}>
      <Row y={70} label="values only" value="no flag, no CompDev" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="recorded vs interpolated" value="indistinguishable" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
