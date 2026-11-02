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
    <Svg label="same events, same nodes. One way overloads one; one doesn't." h={200}>
      <Row y={70} label="range partitioned" value="one node does most work" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="hash partitioned" value="spread evenly" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictNewestWriteUnderRange({ t }: StepCtx) {
  return (
    <Svg label="events arrive in order. Where does the newest one land?" h={200}>
      <Row y={70} label="events" value="arrive in timestamp order" />
      <Row y={130} label="the newest write" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRangePartitioning({ t }: StepCtx) {
  return (
    <Svg label="ordered scans in one sweep. Every new write hits the tail." h={200}>
      <Row y={70} label="a range scan" value="one ordered sweep" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every new write" value="lands on the tail" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHotTailMeasured({ t }: StepCtx) {
  return (
    <Svg label="the last five hundred writes: one partition, every time." h={260}>
      <Row y={50} label="ten thousand writes" value="ten range partitions" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="most recent writes" value="measured directly" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="partitions touched" value="exactly one" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealHashPartitioning({ t }: StepCtx) {
  return (
    <Svg label="no order left, but the same recent writes spread out." h={260}>
      <Row y={50} label="the same writes" value="hashed instead" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="order" value="gone entirely" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="partitions touched" value="nearly all of them" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictNaiveResizeCost({ t }: StepCtx) {
  return (
    <Svg label="one node joins a ten-node cluster. How much data moves?" h={200}>
      <Row y={70} label="naive modulo hashing" value="a node joins" />
      <Row y={130} label="keys that must move" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealConsistentAndRendezvous({ t }: StepCtx) {
  return (
    <Svg label="naive remaps almost all. Ring and HRW move a fair share." h={260}>
      <Row y={50} label="naive modulo hashing" value="remaps almost everything" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="consistent hash ring" value="moves a fair share" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="rendezvous (HRW)" value="moves a fair share too" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealRoutingAndIndependentAxis({ t }: StepCtx) {
  return (
    <Svg label="client, proxy, or coordinator routes it. Replicas: separate." h={260}>
      <Row y={50} label="routing" value="client, proxy, coordinator" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="partitioning" value="which node owns a key" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="replication" value="a separate question" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="range orders, hash spreads. Naive breaks on resize." h={260}>
      <Row y={50} label="range vs hash" value="order vs spread" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="naive vs smart" value="breaks vs survives resize" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="partitioning, replication" value="independent axes" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="range-partitioned order IDs, heavy traffic. Then what?" h={200}>
      <Row y={70} label="order IDs" value="traffic spikes" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="adding more nodes" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
