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
    <Svg label="two parallel mini-timelines, one per crash window, each marked by a lightning-bolt crash icon" h={200}>
      <Row y={70} label="producer side" value="duplicate payment" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="consumer side" value="duplicate order" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="three semantics, stated as promises about the effect, not the delivery attempt" h={200}>
      <Row y={70} label="at-most-once" value="may drop it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="exactly-once" value="effect, once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictProducerRetry({}: StepCtx) {
  return (
    <Svg label="a batch is sent, the broker commits it, the ack is lost on the way back" h={200}>
      <Row y={70} label="batch sent" value="broker commits" />
      <Row y={130} label="ack" value="never arrives" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealProducerRetry({ t }: StepCtx) {
  return (
    <Svg label="seeing no ack, the producer retries — without idempotence, the retry duplicates the write" h={200}>
      <Row y={70} label="producer" value="retries blind" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="log" value="duplicate written" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictConsumerCrash({}: StepCtx) {
  return (
    <Svg label="a consumer processes a record, writes its effect, and crashes before committing its offset" h={200}>
      <Row y={70} label="record" value="processed" />
      <Row y={130} label="offset commit" value="never happens" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealConsumerCrash({ t }: StepCtx) {
  return (
    <Svg label="on restart, the consumer starts from the old offset and reprocesses the same record" h={200}>
      <Row y={70} label="restart" value="old offset" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="downstream" value="duplicated effect" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIncompleteClaim({ t }: StepCtx) {
  return (
    <Svg label="the broker's own guarantee stops at the sink's own door" h={200}>
      <Row y={70} label="broker guarantee" value="at-least-once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="non-idempotent sink" value="duplicates anyway" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEffectCount({ t }: StepCtx) {
  return (
    <Svg label="the same crash, counted three different ways depending on which semantics applied" h={200}>
      <Row y={70} label="at-most-once" value="zero effects" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="at-least-once" value="two effects" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.55))} />
      <Row y={160} label="exactly-once" value="one effect" o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="producer retry" value="duplicate confirmed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="consumer crash" value="reprocess confirmed" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="effect count" value="zero, two, one" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three semantics, two crash windows, and why exactly-once names a boundary, not a broker feature" h={260}>
      <Row y={50} label="three semantics" value="effect counts" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="two crash windows" value="producer, consumer" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="exactly-once" value="an end-to-end claim" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
