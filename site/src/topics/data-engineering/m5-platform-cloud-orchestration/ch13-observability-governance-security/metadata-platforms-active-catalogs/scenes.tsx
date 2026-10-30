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
    <Svg label="crawled Sunday, changed Wednesday." h={200}>
      <Row y={70} label="last crawl" value="Sunday" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Thursday's search" value="still shows old one" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="right within seconds. How?" h={260}>
      <Row y={50} label="crawl faster" value="closes the gap?" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="push events" value="closes the gap?" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="which one" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealGraphModel({ t }: StepCtx) {
  return (
    <Svg label="nodes and named edges. One graph." h={200}>
      <Row y={70} label="table, column, person" value="each a node" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="owns, derives from" value="named edges" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCrawlVsPush({ t }: StepCtx) {
  return (
    <Svg label="stale for an interval, or for none of it." h={200}>
      <Row y={70} label="crawl" value="stale, whole interval" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="push" value="stale, never" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDailyJobs({ t }: StepCtx) {
  return (
    <Svg label="find it, trust it, agree on it." h={260}>
      <Row y={50} label="search" value="ranked by usage" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="trust" value="counts, owners, freshness" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="glossary" value="agreed meaning" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealOpenVsEnterprise({ t }: StepCtx) {
  return (
    <Svg label="open source, and enterprise." h={200}>
      <Row y={70} label="DataHub, OpenMetadata" value="open source" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Collibra, Atlan, Alation" value="enterprise" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTechnicalVsBusiness({ t }: StepCtx) {
  return (
    <Svg label="where, and who may read. What it means." h={200}>
      <Row y={70} label="technical catalog" value="who may read" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="business catalog" value="what it means" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNameRetired({ t }: StepCtx) {
  return (
    <Svg label="the label went stale, not the page." h={200}>
      <Row y={70} label="syllabus says" value="low-activity" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the repo says" value="archived, for inactivity" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a graph; a staleness gap; two kinds of catalog." h={260}>
      <Row y={50} label="the catalog" value="a graph, searchable" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="crawl vs push" value="gap, or none" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="technical, business" value="different questions" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="tables pushed, dashboards still crawled." h={200}>
      <Row y={70} label="tables" value="push, current" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="dashboards" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
