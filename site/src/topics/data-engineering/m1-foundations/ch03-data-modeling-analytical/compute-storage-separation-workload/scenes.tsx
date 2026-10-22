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
    <Svg label="one cluster, two workloads, one shared storage layer underneath" h={200}>
      <Row y={70} label="one cluster" value="two teams' workloads" />
      <Row y={130} label="batch job starts" value="dashboard queries?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSeparationQuote({ t }: StepCtx) {
  return (
    <Svg label="storage and compute, separated — infrastructure and tuning get simpler" h={200}>
      <Row y={70} label="storage, compute" value="separated" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="tuning, infra" value="simpler" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSeparationEnough({ t }: StepCtx) {
  return (
    <Svg label="storage already separated — does that alone stop the slowdown?" h={200}>
      <Row y={70} label="storage separated" value="already" />
      <Row y={130} label="slowdown stopped?" value="by that alone?" />
    </Svg>
  );
}

export function RevealIndependentClustersQuote({ t }: StepCtx) {
  return (
    <Svg label="each cluster independent — no shared compute, no shared effect" h={200}>
      <Row y={70} label="each cluster" value="independent" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one cluster's load" value="no effect on others" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealElasticScalingQuote({ t }: StepCtx) {
  return (
    <Svg label="more clusters, same shared storage — added as simultaneous load rises" h={200}>
      <Row y={70} label="load rises" value="more clusters added" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="storage underneath" value="stays shared" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMoreClustersFasterQuery({ t }: StepCtx) {
  return (
    <Svg label="more clusters available — does one slow query speed up?" h={200}>
      <Row y={70} label="more clusters" value="now available" />
      <Row y={130} label="one slow query" value="faster now?" />
    </Svg>
  );
}

export function RevealScalingLimitQuote({ t }: StepCtx) {
  return (
    <Svg label="scaling helps concurrency; it does not speed up one slow query by itself" h={200}>
      <Row y={70} label="concurrency" value="helped" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one slow query" value="not helped" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNoisyNeighborFix({ t }: StepCtx) {
  return (
    <Svg label="one cluster per workload, one shared storage layer — nothing left to contend over" h={200}>
      <Row y={70} label="one cluster" value="per workload" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="contention" value="gone" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCacheFreeLunch({ t }: StepCtx) {
  return (
    <Svg label="a cache, seemingly all upside — any real cost worth naming?" h={200}>
      <Row y={70} label="a cache" value="seems all upside" />
      <Row y={130} label="real cost?" value="worth naming?" />
    </Svg>
  );
}

export function RevealCacheQuote({ t }: StepCtx) {
  return (
    <Svg label="running cluster, caching touched data — later queries skip rereading storage" h={200}>
      <Row y={70} label="running cluster" value="caches touched data" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="later queries" value="skip storage" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCacheCostQuote({ t }: StepCtx) {
  return (
    <Svg label="suspend the cluster, lose the cache — the next queries pay for it, until it rebuilds" h={200}>
      <Row y={70} label="cluster suspended" value="cache dropped" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="next queries" value="slower, until rebuilt" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="separation, then isolation; a cache re-coupled on purpose, paid for on suspend" h={260}>
      <Row y={60} label="separation" value="removes the bottleneck" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="per-workload clusters" value="remove contention" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="cache" value="re-coupled on purpose" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="suspend the moment it goes idle — what gets traded away?" h={200}>
      <Row y={70} label="suspend on idle" value="aggressively" />
      <Row y={130} label="traded away" value="what?" />
    </Svg>
  );
}
