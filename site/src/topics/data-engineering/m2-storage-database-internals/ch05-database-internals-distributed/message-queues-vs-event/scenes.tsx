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
    <Svg label="the identical message, delivered two ways: a queue acknowledges and it's gone, a log advances a marker but keeps it" h={200}>
      <Row y={70} label="the queue" value="message now gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the log" value="message stays put" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCanGetItBack({ t }: StepCtx) {
  return (
    <Svg label="once a second reader needs a message the queue already delivered, can it get it back?" h={200}>
      <Row y={70} label="from the queue" value="can it return?" />
      <Row y={130} label="from the log" value="can it return?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealQueueDeletes({ t }: StepCtx) {
  return (
    <Svg label="a queue deletes on acknowledgement; a negative ack discards, dead-letters, or requeues it — never both" h={200}>
      <Row y={70} label="acked" value="marked for deletion" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not acked" value="redelivered instead" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLogOffset({ t }: StepCtx) {
  return (
    <Svg label="a log tracks a position, not a deletion: the message's own offset never changes" h={200}>
      <Row y={70} label="consumer position" value="one small number" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="message offset" value="never changes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReplayLine({ t }: StepCtx) {
  return (
    <Svg label="replay is the real dividing line: a log lets a fixed bug re-consume the past, a queue already deleted it" h={200}>
      <Row y={70} label="a log" value="bug fixed, replay" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a queue" value="already deleted it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOrderingFanout({ t }: StepCtx) {
  return (
    <Svg label="a log's partitions give real ordering and let many independent readers each read the whole stream" h={200}>
      <Row y={70} label="a log" value="many readers" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a queue" value="one destination each" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealShareGroups({ t }: StepCtx) {
  return (
    <Svg label="Kafka's own share groups, production-ready, layer per-record acknowledgement onto a log without owning a partition" h={200}>
      <Row y={70} label="share groups" value="production-ready now" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="per-record ack" value="layered on top" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a queue deletes on ack, a log tracks a rewindable offset, replay and fan-out favor the log, share groups blur the line" h={260}>
      <Row y={50} label="a queue" value="deletes on ack" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a log" value="tracks an offset" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="replay, fan-out" value="favor the log" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="share groups" value="blur that line" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="many independent teams, each at their own pace, one replaying last week after a bug fix — which system?" h={200}>
      <Row y={70} label="a queue" value="already gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a log" value="still there" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
