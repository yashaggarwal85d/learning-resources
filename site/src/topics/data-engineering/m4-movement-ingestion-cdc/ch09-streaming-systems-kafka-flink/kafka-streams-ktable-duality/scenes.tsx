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
    <Svg label="a library, not a cluster — what changes with no separate cluster at all?" h={200}>
      <Row y={70} label="a library" value="no cluster" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what changes" value="with none" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="sql formalised streams as tables, run by a separate cluster" h={200}>
      <Row y={70} label="sql, so far" value="a separate cluster" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="no cluster" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictParallelism({}: StepCtx) {
  return (
    <Svg label="no cluster of its own — what decides its parallelism, then?" h={200}>
      <Row y={70} label="no cluster" value="of its own" />
      <Row y={130} label="parallelism" value="decided how?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTasksPerPartition({ t }: StepCtx) {
  return (
    <Svg label="one task per partition, fixed forever — bounded by partition count" h={200}>
      <Row y={70} label="one task" value="per partition" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the assignment" value="never changes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIdleInstances({ t }: StepCtx) {
  return (
    <Svg label="more instances than partitions just wait, ready to take over" h={200}>
      <Row y={70} label="excess instances" value="sit idle" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ready, waiting" value="for a failure" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChangelogBacked({ t }: StepCtx) {
  return (
    <Svg label="a compacted topic durably backs every local store, same mechanism" h={200}>
      <Row y={70} label="a local store" value="on the task" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="backed durably" value="by a topic" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStandbyValue({}: StepCtx) {
  return (
    <Svg label="what does a standby replica actually buy on failover?" h={200}>
      <Row y={70} label="a standby" value="a warm copy" />
      <Row y={130} label="on failover" value="buys what?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStandbyRecovery({ t }: StepCtx) {
  return (
    <Svg label="a warm standby means no full replay from scratch" h={200}>
      <Row y={70} label="no standby" value="full replay" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a warm standby" value="just the gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDuality({ t }: StepCtx) {
  return (
    <Svg label="a stream becomes a table; a table reads back out as a stream" h={200}>
      <Row y={70} label="a stream" value="becomes a table" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a table" value="becomes a stream" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealExactlyOnceRebalance({ t }: StepCtx) {
  return (
    <Svg label="v two is more efficient; the newer rebalance protocol still has real gaps" h={200}>
      <Row y={70} label="exactly-once, v two" value="more efficient" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the rebalance protocol" value="real gaps remain" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="task assignment" value="capped by partitions" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a table" value="rebuilt from it" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a warm standby" value="recovers much faster" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="no cluster, a task per partition, state on a changelog, duality at the center" h={260}>
      <Row y={50} label="no cluster" value="just a library" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="state" value="backed, durably" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="stream, table" value="one thing, twice" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
