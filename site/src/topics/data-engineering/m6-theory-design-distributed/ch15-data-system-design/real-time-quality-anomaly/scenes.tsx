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
    <Svg label="a false alarm ignored, a real fault missed" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        a normal ramp, flagged again and again
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        then a real drift that never fired at all
      </T>
      <Row y={150} label="the ramp" value="flagged, then ignored" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="the drift" value="adapted in, silent" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the design" value="wrong both ways" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="what did the design get wrong, in both directions?" h={210}>
      <Row y={75} label="loosen the limit" value="fixes neither" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="suppress the ramp" value="fix the baseline" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDashboardDetector({ t }: StepCtx) {
  return (
    <Svg label="two consumers, two different needs" h={210}>
      <Row y={75} label="the dashboard" value="windowed, tolerant" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the detector" value="per-event, urgent" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBaselineFamilies({ t }: StepCtx) {
  return (
    <Svg label="three baselines, three ways to fail" h={240}>
      <Row y={55} label="EWMA" value="adapts into drift" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="seasonal" value="needs history" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="SPC rule" value="assumes steady" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealStateSizing({ t }: StepCtx) {
  return (
    <Svg label="one baseline per series, churn and a cold start" h={210}>
      <Row y={75} label="per series" value="its own state" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="too new" value="stays quiet" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDedupGrouping({ t }: StepCtx) {
  return (
    <Svg label="one condition, one cause, one alert" h={240}>
      <Row y={55} label="repeated fires" value="one alert, timed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="shared cause" value="grouped together" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="a changeover" value="suppressed on purpose" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealPrecisionMetric({ t }: StepCtx) {
  return (
    <Svg label="measured by precision, not by how often it fires" h={210}>
      <Row y={75} label="precision" value="a tracked target" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="acted on" value="the real measure" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBacktest({ t }: StepCtx) {
  return (
    <Svg label="replayed over history, scored on a later period" h={210}>
      <Row y={75} label="tune" value="on one period" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="test" value="a later period" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two consumers, three baselines, sized state, grouped alerts" h={290}>
      <Row y={45} label="consumers" value="dashboard, detector" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="baselines" value="named failure modes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="alerts" value="grouped, suppressed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="backtest" value="proven before live" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten times the series; what actually moves?" h={250}>
      <Row y={65} label="each baseline" value="still accurate" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="state and churn" value="the real bottleneck" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="memory" value="climbs tenfold" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
