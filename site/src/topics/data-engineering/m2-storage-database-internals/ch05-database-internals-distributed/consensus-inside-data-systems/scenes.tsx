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
    <Svg label="five nodes, two go dark. The other three keep writing." h={200}>
      <Row y={70} label="five nodes" value="two go dark" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the other three" value="keep accepting writes" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMajorityVsUnanimity({ t }: StepCtx) {
  return (
    <Svg label="two of five unreachable. Does the write need everyone?" h={200}>
      <Row y={70} label="two of five" value="unreachable" />
      <Row y={130} label="commit needs" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealMajorityMeasured({ t }: StepCtx) {
  return (
    <Svg label="three of five: majority commits. Unanimity already refused." h={260}>
      <Row y={50} label="reachable nodes" value="three of five" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="majority rule" value="commits" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="unanimous rule" value="already refused" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLosingQuorum({ t }: StepCtx) {
  return (
    <Svg label="below a majority, the group refuses. It doesn't guess." h={260}>
      <Row y={50} label="reachable nodes" value="two of five" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="below a majority" value="write attempted" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="result" value="refused" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealGlobalVsPerRange({ t }: StepCtx) {
  return (
    <Svg label="one group: everything halts. Many groups: one range does." h={260}>
      <Row y={50} label="one global group" value="quorum lost" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="every key" value="stops accepting writes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="ten per-range groups" value="nine stay writable" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictCrossRangeCost({ t }: StepCtx) {
  return (
    <Svg label="one group: one round trip. Two groups, same cost?" h={200}>
      <Row y={70} label="one group" value="one round trip" />
      <Row y={130} label="two groups" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRoundTripCost({ t }: StepCtx) {
  return (
    <Svg label="one round trip, single group. Several, across two." h={260}>
      <Row y={50} label="single group" value="one round trip" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="two groups" value="prepare, then commit" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="total cost" value="several round trips" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealRealSystems({ t }: StepCtx) {
  return (
    <Svg label="Kafka's controllers, etcd's one group, per-range groups." h={260}>
      <Row y={50} label="Kafka" value="controller quorum" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="etcd" value="one global group" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="CockroachDB, TiKV" value="one group per range" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="majority commits. Losing quorum refuses. Boundaries cost trips." h={260}>
      <Row y={50} label="majority, not everyone" value="enough to commit" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="losing quorum" value="refuses, never guesses" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="group boundaries" value="cost real round trips" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one hundred groups. A rack failure touches ten." h={200}>
      <Row y={70} label="one hundred groups" value="a rack loses power" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the whole cluster" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
