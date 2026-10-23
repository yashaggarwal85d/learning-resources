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
    <Svg label="two dashboards, two tools, one month — two different revenue figures" h={200}>
      <Row y={70} label="finance" value="one revenue figure" />
      <Row y={130} label="marketing" value="a different figure" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPurposeQuote({ t }: StepCtx) {
  return (
    <Svg label="one metric, compiled to SQL — the same way, across different dimensions" h={200}>
      <Row y={70} label="one metric" value="compiled to SQL" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="same way" value="different dimensions" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOneFixedQuery({ t }: StepCtx) {
  return (
    <Svg label="one metric, declared once — only ever one fixed query?" h={200}>
      <Row y={70} label="metric" value="declared once" />
      <Row y={130} label="one fixed query?" value="forever?" />
    </Svg>
  );
}

export function RevealLabOneMetric({ t }: StepCtx) {
  return (
    <Svg label="revenue, declared once — one measure, the shop's own star schema underneath it" h={200}>
      <Row y={70} label="revenue" value="declared once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="underneath" value="the shop's star schema" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLabTwoQueries({ t }: StepCtx) {
  return (
    <Svg label="same declaration — a plain monthly total, and a joined daily breakdown, both verified" h={200}>
      <Row y={70} label="monthly total" value="no join" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="daily, by category" value="joined, verified" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictGuessJoin({ t }: StepCtx) {
  return (
    <Svg label="matching column names — declare the relationship, or just guess it?" h={200}>
      <Row y={70} label="columns match" value="by name" />
      <Row y={130} label="declare it" value="or just guess?" />
    </Svg>
  );
}

export function RevealEntitiesQuote({ t }: StepCtx) {
  return (
    <Svg label="declared join keys — explicit traversal paths, never inferred from column names" h={200}>
      <Row y={70} label="entities" value="declared join keys" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="explicit" value="never inferred" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDryQuote({ t }: StepCtx) {
  return (
    <Svg label="minimize redundancy — one definition, used everywhere it possibly can" h={200}>
      <Row y={70} label="DRY" value="minimize redundancy" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one definition" value="used everywhere" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictDedicatedTimeTable({ t }: StepCtx) {
  return (
    <Svg label="a date column, already there — a dedicated table needed, or does it just work?" h={200}>
      <Row y={70} label="date column" value="already there" />
      <Row y={130} label="dedicated table?" value="or just works?" />
    </Svg>
  );
}

export function RevealTimeSpineQuote({ t }: StepCtx) {
  return (
    <Svg label="a dedicated base table, built for time joins — not just any table with a date column" h={200}>
      <Row y={70} label="time spine" value="a dedicated table" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="not" value="any date column" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOtherToolsQuote({ t }: StepCtx) {
  return (
    <Svg label="other tools, named; an open license, an industry conference, a standard still renaming itself" h={200}>
      <Row y={70} label="other tools" value="named, not built" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="open license" value="a standard, maturing" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one declaration, many correct queries; declared joins; a required time table; an industry effort" h={260}>
      <Row y={60} label="one declaration" value="many correct queries" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="entities, time spine" value="declared, required" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="an industry effort" value="not one vendor's trick" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the same metric, a new breakdown by region — a brand-new definition needed?" h={200}>
      <Row y={70} label="same metric" value="new breakdown" />
      <Row y={130} label="new definition?" value="needed?" />
    </Svg>
  );
}
