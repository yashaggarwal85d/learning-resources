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
    <Svg label="the average looked fine; the p99 blew the timeout" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        a comfortable average score time
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and a tail that ate the budget
      </T>
      <Row y={150} label="average" value="comfortably inside" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="the p99" value="blew past it" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the fallback" value="approve, every time" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="where did the p99 actually go?" h={210}>
      <Row y={75} label="a slower model" value="not the problem" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="one hop's tail" value="a recorded choice" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPipelineStrip({ t }: StepCtx) {
  return (
    <Svg label="event, features, lookup, model, decision — one boundary line" h={210}>
      <Row y={75} label="stream job" value="eventually consistent" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="request path" value="reads now" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLatencyBudget({ t }: StepCtx) {
  return (
    <Svg label="a budget bar, built at p99, hop by hop" h={240}>
      <Row y={55} label="network in" value="within budget" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="feature lookup" value="overflows, red" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="inference, rules" value="within budget" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealChainP99({ t }: StepCtx) {
  return (
    <Svg label="the sum of hop p99s is a ceiling, not the answer" h={210}>
      <Row y={75} label="sum of p99s" value="an upper bound" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the real chain" value="sits below it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStateSize({ t }: StepCtx) {
  return (
    <Svg label="per-card aggregates, sized by window length, placed in two stores" h={210}>
      <Row y={75} label="longer window" value="more state kept" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="outgrows memory" value="RocksDB on disk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFallbackADR({ t }: StepCtx) {
  return (
    <Svg label="three fallbacks, each with its own named error cost" h={240}>
      <Row y={55} label="approve" value="a false-approve cost" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="decline" value="a false-decline cost" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the choice" value="recorded, not default" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealScoreTimeLog({ t }: StepCtx) {
  return (
    <Svg label="features and decision, logged live, read by a label weeks later" h={210}>
      <Row y={75} label="scoring time" value="features logged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="weeks later" value="the log trains" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a p99 budget, a chain bound, sized state, a recorded fallback" h={290}>
      <Row y={45} label="budget" value="built at p99" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="chain p99" value="below the bound" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="fallback" value="a recorded choice" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="scoring log" value="trains the future" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten times the payments; what actually moves?" h={250}>
      <Row y={65} label="raise the timeout" value="fixes nothing" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="state and load" value="the real bottleneck" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="per-hop p99s" value="barely move" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
