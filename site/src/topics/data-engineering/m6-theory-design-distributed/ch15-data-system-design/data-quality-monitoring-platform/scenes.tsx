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
    <Svg label="the checks were right; the team muted the channel" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        thousands of checks, a flood of alerts
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and a real failure, muted for a day
      </T>
      <Row y={150} label="alerts, week one" value="a flood" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="the channel" value="muted by Wednesday" o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="a real failure" value="sat ignored" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="what did the design fail to treat as its own requirement?" h={210}>
      <Row y={75} label="fewer checks" value="trades away detection" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="alert precision" value="a measured number" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTwoLayers({ t }: StepCtx) {
  return (
    <Svg label="declarative rules and statistical checks, each costed and placed" h={240}>
      <Row y={55} label="declarative rules" value="cheap, exact" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="statistical checks" value="learned baseline" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="each one" value="placed and costed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealLineageRouting({ t }: StepCtx) {
  return (
    <Svg label="forty downstream tables collapse into one alert at the root" h={210}>
      <Row y={75} label="one table fails" value="forty inherit it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="grouped alert" value="one owner, named" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSuppression({ t }: StepCtx) {
  return (
    <Svg label="three named rules silence specific, expected noise" h={240}>
      <Row y={55} label="a backfill window" value="shaded, suppressed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="schedule-aware" value="widens overnight" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="rate limit" value="per owner" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealFeedbackLoop({ t }: StepCtx) {
  return (
    <Svg label="marking noise tunes the check; a late catch spawns a new one" h={210}>
      <Row y={75} label="marked noise" value="threshold widens" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="caught too late" value="a new check" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIncidentWorkflow({ t }: StepCtx) {
  return (
    <Svg label="detected, triaged, contained, repaired, reviewed" h={240}>
      <Row y={55} label="detected" value="an owner named" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="triaged" value="a human decides" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="reviewed" value="cause feeds back" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealPrecisionSLO({ t }: StepCtx) {
  return (
    <Svg label="precision sits beside the data SLOs, with its own burn rate" h={210}>
      <Row y={75} label="precision gauge" value="its own SLO" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="no number" value="flying blind" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two check layers, grouped routing, suppression, and a precision SLO" h={290}>
      <Row y={45} label="checks" value="rules plus stats" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="routing" value="grouped by cause" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="suppression" value="named, scoped" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="precision" value="its own number" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten times the tables; the same failure now reaches many more" h={250}>
      <Row y={65} label="page every owner" value="the old flood" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="grouping already" value="collapses it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="next bottleneck" value="lineage compute itself" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
