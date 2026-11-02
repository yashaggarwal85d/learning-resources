import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="sizing decided how many pieces. This decides which row actually lands in which piece." h={200}>
      <Row y={70} label="group by, versus sort" value="same partitioner?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="which row lands where" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTwoPartitioners({ t }: StepCtx) {
  return (
    <Svg label="measured: a group-by's own shuffle is tagged one way. A sort's own shuffle is tagged entirely differently." h={200}>
      <Row y={70} label="group by's own shuffle" value="hash partitioning" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sort's own shuffle" value="range partitioning" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSameKeyWindows({ t }: StepCtx) {
  return (
    <Svg label="two window steps, back to back, partitioned by the same key. Does the second one pay for its own shuffle too?" h={200}>
      <Row y={70} label="two steps, same key" value="two shuffles?" />
      <Row y={130} label="actual shuffle count" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSharedExchange({ t }: StepCtx) {
  return (
    <Svg label="measured: one shuffle covers both steps. The second step's own requirement was already satisfied." h={200}>
      <Row y={70} label="two steps, same key" value="one shuffle, shared" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the second step's own cost" value="none at all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDifferentKeyWindows({ t }: StepCtx) {
  return (
    <Svg label="the same two steps, but now partitioned by two different keys. Still just the one shared shuffle?" h={200}>
      <Row y={70} label="two steps, different keys" value="still shared?" />
      <Row y={130} label="actual shuffle count" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTwoExchanges({ t }: StepCtx) {
  return (
    <Svg label="measured: two genuinely separate shuffles this time. Sharing only happens when the requirement is already met." h={200}>
      <Row y={70} label="two steps, different keys" value="two real shuffles" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="confirms the sharing above" value="is a real decision" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDirectoryPruning({ t }: StepCtx) {
  return (
    <Svg label="data is laid out in Hive-style directories, one per value. Does filtering on that value skip entire directories, or just rows after reading them?" h={200}>
      <Row y={70} label="filter on that column" value="skips dirs?" />
      <Row y={130} label="what the scan actually does" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPartitionFilters({ t }: StepCtx) {
  return (
    <Svg label="measured: the scan's own plan names the exact directory filter. The same filter on a flat layout has nothing to name." h={200}>
      <Row y={70} label="Hive-style layout" value="a real directory filter" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="flat layout, same filter" value="nothing to name" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="which partitioner, whether a shuffle is skipped, and whether a filter prunes whole directories — all readable directly." h={260}>
      <Row y={50} label="group by" value="hash partitioning" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="sort" value="range partitioning" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="matching requirement" value="shuffle reused, free" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="Hive-style layout" value="whole directories skipped" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
