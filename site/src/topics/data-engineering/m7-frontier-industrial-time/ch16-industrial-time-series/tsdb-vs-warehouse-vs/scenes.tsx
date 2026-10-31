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
    <Svg label="a vendor demo shows one engine handling every query a plant could ask, but the plant's own workload splits into access paths no single demo query shape covers" h={200}>
      <Row y={70} label="vendor demo" value="one engine, everything" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="plant's traffic" value="four access paths" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMatrix({ t }: StepCtx) {
  return (
    <Svg label="a last-value lookup, a range scan, a cross-series aggregation, and a join to business data, all measured against the same synthetic week of the plant's own series count" h={260}>
      <Row y={50} label="last value" value="measured" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="range scan" value="measured" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="cross-series agg." value="measured" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="join to business" value="measured" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function RevealPrometheusRow({ t }: StepCtx) {
  return (
    <Svg label="Prometheus-style engines are built for this write rate and query shape, but their own documentation names the limitation: not clustered, not replicated, not durable against a node outage" h={200}>
      <Row y={70} label="metrics row" value="Prometheus-style wins" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="own docs say" value="not clustered, not durable" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictJoinCost({ t }: StepCtx) {
  return (
    <Svg label="a join to business data runs against one week of history today — as the plant keeps years of history instead of weeks, does the join get cheaper, or more expensive, to run?" h={200}>
      <Row y={70} label="history grows" value="weeks to years" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="join cost" value="cheaper or pricier?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHighRateEngines({ t }: StepCtx) {
  return (
    <Svg label="ClickHouse's sparse primary key, QuestDB's three-tier storage, and InfluxDB 3's in-memory cache are three different names for the same bet: make the common lookup cheap" h={260}>
      <Row y={50} label="ClickHouse" value="sparse primary key" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="QuestDB" value="three-tier storage" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="InfluxDB 3" value="in-memory cache" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={190} label="same bet" value="cheap common lookup" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function RevealLakehouseJoin({ t }: StepCtx) {
  return (
    <Svg label="the join to a synthetic work-order table runs successfully against the full history in DuckDB, the same engine a table format over object storage would use underneath" h={200}>
      <Row y={70} label="join to business data" value="runs on full history" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lakehouse engine" value="same one underneath" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCapacityChain({ t }: StepCtx) {
  return (
    <Svg label="series count times sampling rate times retention times bytes per point, priced at a documented $0.02 per gigabyte, gives a two-week hot tier and a three-year lakehouse tier two different numbers" h={200}>
      <Row y={70} label="hot tier, 2 weeks" value="priced at $0.02/GB" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lakehouse, 3 years" value="priced the same way" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTierBoundary({ t }: StepCtx) {
  return (
    <Svg label="exporting the hot tier to the lakehouse after a lag leaves a window where a point sits in both tiers at once, and a reading that arrives after its day's export already ran reaches only the hot tier" h={200}>
      <Row y={70} label="export lag window" value="duplicated points" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="late reading" value="hot tier only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a decision matrix measured on the same data, Prometheus-style engines owning the metrics row, three high-rate engines sharing one shortcut, the lakehouse owning the join, a cost chain, and a tiering boundary that duplicates or drops" h={260}>
      <Row y={50} label="matrix" value="measured, same data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="metrics, high-rate" value="each own their row" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="join" value="the lakehouse's case" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="tiering" value="duplicates or drops" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="given only an access path and a retention window, not a vendor name, can the matrix alone say which tier a workload belongs on, without guessing at any engine's marketing claim?" h={200}>
      <Row y={70} label="access path + retention" value="named, not a vendor" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="matrix's own rows" value="pick the tier" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
