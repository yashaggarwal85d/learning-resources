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
    <Svg label="three speed claims so far, each measured alone — none checked side by side yet" h={200}>
      <Row y={70} label="three claims" value="each on its own" />
      <Row y={130} label="side by side" value="not yet checked" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDeterministicQuote({ t }: StepCtx) {
  return (
    <Svg label="every call and return monitored, with precise timing — real instrumentation, real cost" h={200}>
      <Row y={70} label="every call" value="monitored" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="precise timing" value="a real cost" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictAsyncAgain({ t }: StepCtx) {
  return (
    <Svg label="the same feed, four ways — does async win here the way it won its own topic's race?" h={200}>
      <Row y={70} label="same feed" value="four ways" />
      <Row y={130} label="async" value="wins again?" />
    </Svg>
  );
}

export function RevealFourWaysMeasured({ t }: StepCtx) {
  return (
    <Svg label="four ways, measured together — native engine wins big, async measured slowest of all" h={260}>
      <Row y={60} label="native engine" value="wins by far" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="multiprocessing" value="modest win" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="async" value="slowest of all" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCProfileMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real trace of the actual loop that ran — the real function, named directly" h={200}>
      <Row y={70} label="the actual loop" value="traced for real" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="real function" value="named directly" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTracemallocMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real peak heap size, loop vs native engine — an earlier wrong measurement caught and fixed" h={260}>
      <Row y={60} label="plain loop" value="real peak measured" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="native engine" value="real peak, lower" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="earlier attempt" value="wrong, then fixed" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictPyspyNames({ t }: StepCtx) {
  return (
    <Svg label="attach from outside, no code changed — real function names, or just addresses?" h={200}>
      <Row y={70} label="attach from outside" value="no code changed" />
      <Row y={130} label="real names" value="or just addresses?" />
    </Svg>
  );
}

export function RevealPyspyMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real live attach — the lab's own exact function, named directly from outside" h={200}>
      <Row y={70} label="live attach" value="a real process" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="exact function" value="named, from outside" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealScaleneMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real measured split — native time genuinely dominates, confirmed, not assumed" h={200}>
      <Row y={70} label="python time" value="a small share" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="native time" value="genuinely dominates" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealArrowHandoffMeasured({ t }: StepCtx) {
  return (
    <Svg label="querying in memory beats a real file round trip — the actual measured benefit" h={200}>
      <Row y={70} label="in-memory query" value="measured faster" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="file round trip" value="real cost skipped" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="real timing, a real live attach, a real split, four approaches finally settled together" h={260}>
      <Row y={60} label="deterministic" value="real timing" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="live attach" value="a real process" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="four approaches" value="settled together" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a pipeline 'feels slow' — cpu, memory, or a stall? which tool answers which?" h={200}>
      <Row y={70} label="feels slow" value="cpu, memory, stall?" />
      <Row y={130} label="which tool" value="answers which?" />
    </Svg>
  );
}
