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
    <Svg label="an answer in seconds, exactly right by day's end — one stream, or two?" h={200}>
      <Row y={70} label="answer in seconds" value="exactly right by day's end" />
      <Row y={130} label="one stream" value="or two?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLambdaQuote({ t }: StepCtx) {
  return (
    <Svg label="batch and stream, run in parallel, merged at query time" h={200}>
      <Row y={70} label="batch, stream" value="run in parallel" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="results" value="merged at query time" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMergeDisagree({ t }: StepCtx) {
  return (
    <Svg label="two systems, two answers, merged — can they disagree?" h={200}>
      <Row y={70} label="two systems" value="two answers" />
      <Row y={130} label="merged" value="can they disagree?" />
    </Svg>
  );
}

export function RevealRealtimeStackQuote({ t }: StepCtx) {
  return (
    <Svg label="incremental algorithms, read/write databases — not the batch layer's plain functions" h={200}>
      <Row y={70} label="realtime layer" value="incremental algorithms" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="batch layer" value="plain functions on data" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBatchAlwaysWinsQuote({ t }: StepCtx) {
  return (
    <Svg label="realtime layer's output — always overridden by the batch layer, eventually" h={200}>
      <Row y={70} label="realtime output" value="eventually overridden" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="batch layer" value="always has final say" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictWhichCostsMore({ t }: StepCtx) {
  return (
    <Svg label="the same logic, written twice — or the merge at query time: which costs more?" h={200}>
      <Row y={70} label="same logic" value="written twice" />
      <Row y={130} label="or the merge" value="which costs more?" />
    </Svg>
  );
}

export function RevealDualLogicCostQuote({ t }: StepCtx) {
  return (
    <Svg label="logic implemented twice, in two systems — a cost its own describer calls not fixable" h={200}>
      <Row y={70} label="logic" value="implemented twice" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the real cost" value="called not fixable" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealReprocessingQuote({ t }: StepCtx) {
  return (
    <Svg label="code changes — output must be re-derived, a problem both architectures must answer" h={200}>
      <Row y={70} label="code changes" value="output re-derived" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="reprocessing" value="often ignored" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictStreamOnlyReprocess({ t }: StepCtx) {
  return (
    <Svg label="every input kept, replayable from the start — can streaming alone reprocess it?" h={200}>
      <Row y={70} label="every input kept" value="replayable" />
      <Row y={130} label="streaming alone" value="can it reprocess?" />
    </Svg>
  );
}

export function RevealKappaQuote({ t }: StepCtx) {
  return (
    <Svg label='retain the log, replay from the start, switch over — named "Kappa" by its own creator' h={200}>
      <Row y={70} label="retain, replay" value="switch over" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="named by its creator" value='"Kappa"' valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealHonestTradeQuote({ t }: StepCtx) {
  return (
    <Svg label="efficiency — roughly even either way; the real win is one framework, not speed" h={200}>
      <Row y={70} label="efficiency" value="roughly even" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="real advantage" value="one framework" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="duplicate logic, merged at serving — versus one pipeline, replayed from a retained log" h={260}>
      <Row y={60} label="Lambda" value="duplicate logic, merged" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="Kappa" value="one pipeline, replayed" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="real reason" value="simplicity, not speed" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a log too large to replay quickly — does one pipeline still replace the batch layer?" h={200}>
      <Row y={70} label="log too large" value="to replay quickly" />
      <Row y={130} label="one pipeline" value="still replaces batch?" />
    </Svg>
  );
}
