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
    <Svg label="crawled Sunday. Wednesday: drop, create, rename. Thursday's search finds the old one, certified." h={200}>
      <Row y={70} label="last crawl" value="Sunday" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="Thursday search" value="finds the stale one" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMetadataGraph({ t }: StepCtx) {
  return (
    <Svg label="a metadata graph: tables, columns, a glossary term, an owner, a tag -- as nodes and edges" h={200}>
      <Row y={70} label="nodes" value="table, column, term, owner" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="edges" value="owns, derives, tagged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCrawlVsPush({ t }: StepCtx) {
  return (
    <Svg label="Wednesday's rename. Crawl-based or push-based: which shows it first on Thursday?" h={200}>
      <Row y={70} label="crawl-based catalog" value="Thursday: ?" />
      <Row y={130} label="push-based catalog" value="Thursday: ?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPushWinsImmediately({ t }: StepCtx) {
  return (
    <Svg label="measured: push shows it at once; crawl waits for its next scheduled run" h={200}>
      <Row y={70} label="push, Thursday" value="renamed, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="crawl, Thursday" value="still old name" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateDailyUses({ t }: StepCtx) {
  return (
    <Svg label="search, usage statistics and a glossary: what a catalog is used for day to day" h={200}>
      <Row y={70} label="find it" value="search, by usage" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="trust it, name it" value="stats, glossary" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCreateDropBetweenCrawls({ t }: StepCtx) {
  return (
    <Svg label="a table created and dropped between two crawls. Does the crawl-based catalog ever see it?" h={200}>
      <Row y={70} label="created, then dropped" value="both between crawls" />
      <Row y={130} label="crawl ever sees it?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCrawlNeverSeesIt({ t }: StepCtx) {
  return (
    <Svg label="measured: no -- the crawl-based catalog never learns it existed at all" h={200}>
      <Row y={70} label="crawl-based" value="never saw it, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="push-based" value="saw create and drop" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateTechnicalVsBusiness({ t }: StepCtx) {
  return (
    <Svg label="a technical catalog answers where files are; a business catalog answers what a column means" h={200}>
      <Row y={70} label="technical catalog" value="files, who may read" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="business catalog" value="meaning, owner, origin" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOpenSourceSplit({ t }: StepCtx) {
  return (
    <Svg label="Unity Catalog OSS, Polaris: technical. DataHub, OpenMetadata: business. Collibra, Atlan, Alation: enterprise" h={200}>
      <Row y={70} label="technical" value="Unity Catalog OSS, Polaris" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="business, enterprise" value="DataHub, Collibra, Atlan" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStatusFacts({ t }: StepCtx) {
  return (
    <Svg label="Polaris: top-level ASF project, Feb 2026. Amundsen: archived for inactivity, Sept 2026" h={200}>
      <Row y={70} label="Polaris" value="top-level, Feb 2026" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Amundsen" value="archived, Sept 2026" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a graph of nodes and edges, kept current by push, not crawl; technical vs business catalogs differ in question" h={280}>
      <Row y={50} label="metadata graph" value="nodes, edges" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="push vs crawl" value="push wins, measured" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="technical vs business" value="different questions" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
