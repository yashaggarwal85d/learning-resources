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
    <Svg label="a fact table, partitioned by region. A dimension filter wants just a few regions. How much gets read?" h={200}>
      <Row y={70} label="fact table partitions" value="100, by region" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="regions the filter wants" value="3 of 100" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaseline({ t }: StepCtx) {
  return (
    <Svg label="measured: forced off, the join reads every partition regardless of the filter." h={200}>
      <Row y={70} label="DPP forced off" value="files read: 400" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="partitions read" value="100 of 100" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPartitionAlone({ t }: StepCtx) {
  return (
    <Svg label="the fact table is partitioned by the exact join column. Is that enough on its own?" h={200}>
      <Row y={70} label="partitioned by join key" value="enough alone?" />
      <Row y={130} label="pruning fires?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNeedsBroadcast({ t }: StepCtx) {
  return (
    <Svg label="measured: no. The plan has to choose a broadcast join first; partitioning alone changes nothing." h={200}>
      <Row y={70} label="partitioning alone" value="no pruning" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="also needs" value="a broadcast join" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateReuse({ t }: StepCtx) {
  return (
    <Svg label="the dimension side is never scanned twice for the join itself; its own broadcast gets reused." h={200}>
      <Row y={70} label="dimension table" value="broadcast once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pruning filter" value="reuses it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictUnpartitioned({ t }: StepCtx) {
  return (
    <Svg label="now the fact table was never partitioned at all. Does the same filter still cut down what's scanned?" h={200}>
      <Row y={70} label="fact table" value="not partitioned" />
      <Row y={130} label="pruning still fires?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNoPartitionsToPrune({ t }: StepCtx) {
  return (
    <Svg label="measured: no dynamic pruning expression anywhere in the plan. Nothing to prune." h={200}>
      <Row y={70} label="unpartitioned fact table" value="no pruning filter" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="plan shows" value="full scan, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateSubqueryDuplicate({ t }: StepCtx) {
  return (
    <Svg label="EXPLAIN FORMATTED names it directly: a Subqueries section, its own scan, separate from the join." h={200}>
      <Row y={70} label="plan's own section" value="Subqueries" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="inside it" value="dim table, scanned again" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBothConditions({ t }: StepCtx) {
  return (
    <Svg label="measured: both conditions together, side by side. Files read drops by over thirty times." h={200}>
      <Row y={70} label="both conditions met" value="files: 12, not 400" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="partitions" value="3, not 100" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two conditions, one mechanism: a partitioned fact table and a broadcastable filter, visible in the plan itself." h={280}>
      <Row y={50} label="needs" value="partitioned fact table" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="needs" value="a broadcast join" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="check it" value="plan's own Subqueries" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
