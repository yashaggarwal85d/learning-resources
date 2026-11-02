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
    <Svg label="a group of consumers, all paused, after only one new member joined" h={200}>
      <Row y={70} label="new member" value="just joined" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="whole group" value="paused" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a consumer group's committed offsets, living in the same kind of log as everything else" h={200}>
      <Row y={70} label="committed offset" value="one log record" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="partitions" value="divided up" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPause({}: StepCtx) {
  return (
    <Svg label="a membership change — does it pause every member, or only the ones whose partitions moved?" h={200}>
      <Row y={70} label="every member" value="pauses, or not?" />
      <Row y={130} label="only movers" value="pause, or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealReassignment({ t }: StepCtx) {
  return (
    <Svg label="a real toy reassignment: most members' partitions never move at all" h={200}>
      <Row y={70} label="group size" value="eight to nine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="members moved" value="a few" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPauseCompare({ t }: StepCtx) {
  return (
    <Svg label="the same membership change, measured under both protocols side by side" h={200}>
      <Row y={70} label="eager" value="whole group" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="cooperative" value="just the movers" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStatic({}: StepCtx) {
  return (
    <Svg label="a brief restart under a persistent configured identity — does it still force a rebalance?" h={200}>
      <Row y={70} label="persistent identity" value="restarts briefly" />
      <Row y={130} label="rebalance" value="forced, or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStatic({ t }: StepCtx) {
  return (
    <Svg label="three restarts, measured: no identity, a fast restart with one, and a slow restart with one" h={260}>
      <Row y={50} label="no identity" value="rebalances" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="fast, with identity" value="no rebalance" valueColor={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="slow, with identity" value="rebalances" o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function RevealBrokerSide({ t }: StepCtx) {
  return (
    <Svg label="assignment computed on the broker, for ordinary consumers and for Kafka Streams alike" h={200}>
      <Row y={70} label="consumers" value="broker-assigned" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="streams" value="broker-assigned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="affected members" value="a few" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="eager pause" value="whole group" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="cooperative pause" value="just the movers" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="fast restart" value="no rebalance" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="offsets as a log, a rebalance that no longer stalls everyone, and one shape reaching Streams too" h={260}>
      <Row y={50} label="offsets" value="one log" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="rebalance" value="just the movers" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="streams" value="same shape" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
