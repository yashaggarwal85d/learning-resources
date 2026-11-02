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
    <Svg label="one query, four plans: unresolved, resolved, optimised, chosen. What actually changes between them?" h={200}>
      <Row y={70} label="one query, written once" value="four plans" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what changes between them" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealParseAnalyze({ t }: StepCtx) {
  return (
    <Svg label="measured: the parsed plan marks every node unresolved with a tick. Analysis resolves each one against the catalog." h={200}>
      <Row y={70} label="parsed plan" value="'Filter, unresolved" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="analyzed plan" value="Filter, resolved (id#N)" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFilterOrder({ t }: StepCtx) {
  return (
    <Svg label="the query selects two columns, then filters. Does the optimizer run it in that written order, or move the filter?" h={200}>
      <Row y={70} label="written: select, filter" value="kept, or moved?" />
      <Row y={130} label="optimized order" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPushdown({ t }: StepCtx) {
  return (
    <Svg label="measured: the optimizer moves the filter below the select, closer to the scan — the written order doesn't survive." h={200}>
      <Row y={70} label="analyzed: filter, then select" value="as written" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="optimized: select, then filter" value="moved below it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealConstantFold({ t }: StepCtx) {
  return (
    <Svg label="same rule-based pass, a different trick: a literal 1 plus 2 is folded straight into 3, never computed per row." h={200}>
      <Row y={70} label="analyzed expression" value="(1 + 2) AS x" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="optimized expression" value="3 AS x" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSmallJoin({ t }: StepCtx) {
  return (
    <Svg label="join a huge table against a ten-row one. Every wide op so far has shuffled. Does this join shuffle too?" h={200}>
      <Row y={70} label="huge table, tiny table" value="usually shuffles" />
      <Row y={130} label="chosen strategy" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBroadcast({ t }: StepCtx) {
  return (
    <Svg label="measured: the physical plan picks BroadcastHashJoin. The tiny side is copied everywhere; the huge side never shuffles at all." h={200}>
      <Row y={70} label="chosen strategy" value="BroadcastHashJoin" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="shuffle on the huge side" value="none at all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDisableBroadcast({ t }: StepCtx) {
  return (
    <Svg label="disable broadcasting by hand, on the exact same join shape. Does the chosen strategy change, or stay the same?" h={200}>
      <Row y={70} label="same join" value="broadcast disabled" />
      <Row y={130} label="chosen strategy now" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSortMerge({ t }: StepCtx) {
  return (
    <Svg label="measured: with broadcasting off, the same join falls back to SortMergeJoin — a real Exchange shuffle on both sides now." h={200}>
      <Row y={70} label="broadcast allowed" value="no shuffle" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="broadcast disabled" value="2 Exchanges" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="parse, analyse, optimise, plan physically: four real stages, each one a real plan you can read with EXPLAIN FORMATTED." h={260}>
      <Row y={50} label="parse to analysis" value="unresolved to resolved" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="logical optimisation" value="pushdown, folding" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="physical planning" value="join strategy" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="reorder with real stats" value="ANALYZE TABLE" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
