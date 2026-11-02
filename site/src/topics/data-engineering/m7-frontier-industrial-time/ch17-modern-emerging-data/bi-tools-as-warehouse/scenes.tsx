import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a dashboard moves from extract to live mode; the warehouse's query cost triples overnight." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        before: extract mode
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        same dashboard, same query
      </T>
      <T x={25} y={120} s={13} f={C.latte}>
        after: live mode
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        warehouse query cost: tripled
      </T>
      <T x={300} y={200} s={12} f={C.taupe} a="middle">
        nothing about the dashboard itself changed
      </T>
    </Svg>
  );
}

export function PredictWhichModeWouldHaveWorked({ t }: StepCtx) {
  return (
    <Svg label="which mode gives fresh data without that cost?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        fresher data, without the cost
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealToolsByCategory({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['Looker / LookML', 'commercial, modeling layer'],
    ['Power BI', 'commercial, dashboarding'],
    ['Tableau', 'commercial, dashboarding'],
    ['Superset', 'open-source, dashboarding'],
    ['Metabase', 'open-source, dashboarding'],
  ];
  return (
    <Svg label="five tools, by category: commercial or open-source, modeling layer or plain dashboarding." h={300}>
      {rows.map(([name, cat], i) => (
        <g key={name} opacity={easeOut(seg(t, 0.05 + i * 0.12, 0.3 + i * 0.12))}>
          <T x={25} y={35 + i * 52} s={14} f={C.focus}>
            {name}
          </T>
          <T x={25} y={58 + i * 52} s={13} f={C.taupe}>
            {cat}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealImportExtract({ t }: StepCtx) {
  return (
    <Svg label="a copy of the data lives inside the tool; the warehouse is hit only on refresh." h={180}>
      <T x={25} y={50} s={14} f={C.latte}>
        a copy lives inside the tool
      </T>
      <T x={25} y={75} s={15} f={C.crema}>
        fast dashboards
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        the warehouse is hit
      </T>
      <T x={25} y={150} s={15} f={C.focus}>
        only on refresh
      </T>
    </Svg>
  );
}

export function RevealLiveQuery({ t }: StepCtx) {
  return (
    <Svg label="every interaction re-queries the warehouse directly; freshness is perfect, load scales with usage." h={180}>
      <T x={25} y={50} s={14} f={C.latte}>
        every interaction
      </T>
      <T x={25} y={75} s={15} f={C.crema}>
        re-queries the warehouse directly
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        freshness is perfect
      </T>
      <T x={25} y={150} s={15} f={C.cherryText}>
        load scales with usage
      </T>
    </Svg>
  );
}

export function RevealDirectLake({ t }: StepCtx) {
  return (
    <Svg label="Direct Lake loads Delta tables from OneLake on demand, per column, the first time it's queried." h={230}>
      <T x={25} y={40} s={14} f={C.latte}>
        on demand, per column
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        "transcoding," not a separate import step
      </T>
      <T x={25} y={115} s={14} f={C.latte}>
        import-like speed
      </T>
      <T x={25} y={140} s={15} f={C.focus}>
        without an import's staleness
      </T>
      <T x={25} y={190} s={13} f={C.taupe}>
        falls back to DirectQuery when it can't load directly
      </T>
    </Svg>
  );
}

export function RevealHeadlessBI({ t }: StepCtx) {
  const tools = ['Looker', 'Power BI', 'Tableau', 'Superset', 'Metabase'];
  return (
    <Svg label="one compiled metric; any of these tools reads the same one." h={240}>
      <T x={300} y={35} s={14} f={C.focus} a="middle">
        one compiled metric
      </T>
      {tools.map((tool, i) => (
        <g key={tool} opacity={easeOut(seg(t, 0.15 + i * 0.1, 0.4 + i * 0.1))}>
          <circle cx={90 + i * 100} cy={140} r={5} fill={C.crema} />
          <line x1={300} y1={60} x2={90 + i * 100} y2={135} stroke={C.taupe} strokeWidth={1} opacity={0.6} />
          <T x={90 + i * 100} y={165} s={12} f={C.latte} a="middle">
            {tool}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three query modes, one load-vs-freshness trade-off each. One compiled metric, many tools." h={260}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>import / extract</T>
        <T x={25} y={62} s={15} f={C.crema}>fast, warehouse hit only on refresh</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>live-query</T>
        <T x={25} y={122} s={15} f={C.crema}>always fresh, load scales with usage</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>Direct Lake</T>
        <T x={25} y={182} s={15} f={C.crema}>on-demand transcoding, Fabric-specific</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>headless BI</T>
        <T x={25} y={242} s={15} f={C.crema}>one compiled metric, many tools</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a week later, Metabase and Looker disagree on the same active-users number. What's the first thing to check?" h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        two tools, one warehouse
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        numbers drift apart
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        first thing to check
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
