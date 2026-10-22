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
    <Svg label="three models, one question, three different costs" h={240}>
      <Row y={55} label="3NF" value="one join" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="star" value="one join" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="raw Data Vault" value="several joins" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function PredictHubContents({ t }: StepCtx) {
  return (
    <Svg label="a business key — descriptive data too?" h={200}>
      <Row y={70} label="a hub holds" value="the business key" />
      <Row y={130} label="descriptive data too" value="?" />
    </Svg>
  );
}

export function RevealHubs({ t }: StepCtx) {
  return (
    <Svg label="business key only, low propensity to change" h={200}>
      <Row y={70} label="a hub holds" value="the business key" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="never holds" value="descriptive attributes" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLinks({ t }: StepCtx) {
  return (
    <Svg label="the relationship between hubs, often many-to-many" h={200}>
      <Row y={70} label="a link holds" value="the relationship itself" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="its grain" value="defined by the hub keys" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSatellites({ t }: StepCtx) {
  return (
    <Svg label="descriptive attributes, append-only history" h={200}>
      <Row y={70} label="a satellite holds" value="descriptive attributes" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="every change" value="appended, not overwritten" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictParallelLoad({ t }: StepCtx) {
  return (
    <Svg label="separate loaders, no coordinator" h={200}>
      <Row y={70} label="hub, link, satellite" value="loaded separately" />
      <Row y={130} label="no coordinator" value="actually safe?" />
    </Svg>
  );
}

export function RevealHashDeterminism({ t }: StepCtx) {
  return (
    <Svg label="two loaders, zero coordination, identical key" h={200}>
      <Row y={70} label="loader A hashes" value="the same business key" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="loader B's hash" value="identical, unprompted" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSequenceDependency({ t }: StepCtx) {
  return (
    <Svg label="a sequence forces a lookup. a hash key doesn't." h={200}>
      <Row y={70} label="sequence key" value="look up the parent first" o={easeOut(seg(t, 0, 0.6))} valueColor={C.cherryText} />
      <Row y={130} label="hash key" value="nothing to look up" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealJoinCounts({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['3NF', 'one join'],
    ['star', 'one join'],
    ['raw Data Vault', 'four joins, one lookup'],
  ];
  return (
    <Svg label="the same query, measured, three schemas" h={240}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={60 + i * 65} label={label} value={value} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.6))} />
      ))}
    </Svg>
  );
}

export function RevealWhyExpensive({ t }: StepCtx) {
  return (
    <Svg label="split apart to load easily, rejoined to query" h={200}>
      <Row y={70} label="easy to load" value="kept in separate tables" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="expensive to query" value="same split, at read time" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPITImprovement({ t }: StepCtx) {
  return (
    <Svg label="resolved once, at load time, instead of every query" h={200}>
      <Row y={70} label="with a point-in-time table" value="three joins" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="correlated lookup" value="gone from the query" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBridgeTable({ t }: StepCtx) {
  return (
    <Svg label="one satellite's history vs. several links at once" h={200}>
      <Row y={70} label="point-in-time table" value="one satellite's history" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="bridge table" value="several links at once" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealWorthIt({ t }: StepCtx) {
  return (
    <Svg label="auditability and source agility, measured against the cost" h={200}>
      <Row y={70} label="every change" value="preserved, nothing deleted" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a new source" value="adds tables, not a redesign" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="hub, link, satellite; hash keys; a measured join cost" h={240}>
      <Row y={55} label="hub, link, satellite" value="key, relation, history" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="hash keys" value="no coordinator needed" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="the tradeoff" value="auditability vs. a counted cost" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveDataVaultChoice({ t }: StepCtx) {
  return (
    <Svg label="a new source, a different key — least redesign?" h={200}>
      <Row y={70} label="a new source" value="a different key definition" />
      <Row y={130} label="least redesign" value="?" />
    </Svg>
  );
}
