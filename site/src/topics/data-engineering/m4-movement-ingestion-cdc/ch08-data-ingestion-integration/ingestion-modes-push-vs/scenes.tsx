import { Bar, C, Svg, T } from '../../../../../reels/kit';
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

/** One mode's delay bar: a track that fills toward the right as the example row's own delay grows. */
function DelayBar({ y, label, frac, t, from, to, fill = C.crema }: { y: number; label: string; frac: number; t: number; from: number; to: number; fill?: string }) {
  const k = easeOut(seg(t, from, to));
  return (
    <g>
      <T x={25} y={y - 8} s={13} f={C.taupe}>
        {label}
      </T>
      <Bar x={25} y={y} w={frac * k * 500} h={14} full={500} fill={fill} />
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the same orders stream, cut three ways. One row's own delay, counting up in each." h={220}>
      <DelayBar y={60} label="batch (an hourly cron)" frac={1} t={t} from={0} to={0.9} fill={C.badText} />
      <DelayBar y={110} label="micro-batch (every thirty seconds)" frac={0.18} t={t} from={0.1} to={0.7} fill={C.second} />
      <DelayBar y={160} label="streaming (continuous)" frac={0.02} t={t} from={0.2} to={0.5} fill={C.focus} />
    </Svg>
  );
}

export function RevealFourPositions({ t }: StepCtx) {
  const bufferOnSource = t < 0.5;
  return (
    <Svg label="source, buffer, sink, cursor. Who owns the buffer flips between pull and push." h={240}>
      <Row y={60} label="source" value="where truth lives" o={easeOut(seg(t, 0, 0.4))} />
      <Row
        y={110}
        label="buffer"
        value={bufferOnSource ? 'source holds it (pull)' : 'consumer holds it (push)'}
        valueColor={C.focus}
        o={easeOut(seg(t, 0.1, 0.5))}
      />
      <Row y={160} label="sink" value="landing table or topic" o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={210} label="cursor" value="how far it's got" o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function PredictSurprise({ t }: StepCtx) {
  return (
    <Svg label="batch does the most work per run. Which mode drops the most unplanned load?" h={200}>
      <Row y={70} label="batch, per run" value="most rows, own schedule" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="consumer's own risk" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMeasured({ t }: StepCtx) {
  return (
    <Svg label="average delay and rows per tick, measured across three hundred orders, three ways." h={260}>
      <DelayBar y={50} label="batch — average delay" frac={1} t={t} from={0} to={0.5} fill={C.badText} />
      <DelayBar y={95} label="micro-batch — average delay" frac={0.14} t={t} from={0.1} to={0.6} fill={C.second} />
      <DelayBar y={140} label="streaming — average delay" frac={0.02} t={t} from={0.2} to={0.7} fill={C.focus} />
      <Row y={190} label="rows per tick, batch" value="about a hundred" o={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={225} label="rows per tick, stream" value="well under one" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.9))} />
    </Svg>
  );
}

export function RevealMovingParts({ t }: StepCtx) {
  return (
    <Svg label="moving parts: one, two, three. Each buys lower latency, and its own new way to fail." h={260}>
      <Row y={50} label="batch: one part" value="late run, unnoticed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={105} label="micro-batch: two parts" value="many small files" o={easeOut(seg(t, 0.15, 0.55))} />
      <Row y={160} label="streaming: three parts" value="backlog, no shield" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four positions. Three cuts, measured. One failure mode each." h={260}>
      <Row y={50} label="positions" value="source, buffer, sink, cursor" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="cuts" value="batch, micro-batch, streaming" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="trade-off" value="latency against burst size" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="pick by" value="the failure you'll tolerate" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
