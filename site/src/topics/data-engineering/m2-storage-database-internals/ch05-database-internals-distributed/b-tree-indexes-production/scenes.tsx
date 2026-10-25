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
    <Svg label="every mechanism so far assumed one path to a row: a direct page read. What finds the right page fast?" h={200}>
      <Row y={70} label="many pages" value="which one?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a direct read" value="doesn't scale" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFanout({ t }: StepCtx) {
  return (
    <Svg label="a real index, fifty thousand rows: how many levels deep does it actually stay?" h={200}>
      <Row y={70} label="fifty thousand rows" value="a two-level tree" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lookup cost" value="bounded, not linear" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPageSplit({ t }: StepCtx) {
  return (
    <Svg label="a leaf page fills up. What happens to the tuple that doesn't fit?" h={200}>
      <Row y={70} label="leaf page, full" value="split in two" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="parent page" value="new downlink, may split too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFillfactor({ t }: StepCtx) {
  return (
    <Svg label="should a new index pack its pages as full as possible, or leave room?" h={200}>
      <Row y={70} label="pack every page full" value="or leave room?" />
      <Row y={130} label="the real trade-off" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFillfactorMeasurement({ t }: StepCtx) {
  return (
    <Svg label="the same mid-range inserts, two fillfactors: how many pages does each index actually grow by?" h={200}>
      <Row y={70} label="fillfactor 100, tight" value="grew by real pages" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="fillfactor 10, loose" value="grew by none" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeduplicationMeasurement({ t }: StepCtx) {
  return (
    <Svg label="an index on a column with only ten distinct values: how much smaller with deduplication on?" h={200}>
      <Row y={70} label="deduplication on" value="far fewer pages" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="deduplication off" value="far more pages" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLehmanYao({ t }: StepCtx) {
  return (
    <Svg label="a search is reading a page exactly when it splits underneath it. What stops that from reading garbage?" h={200}>
      <Row y={70} label="every page" value="a right-link to its sibling" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a split, mid-search" value="follow the link" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProductionFeatures({ t }: StepCtx) {
  return (
    <Svg label="two features production systems actually use: a smarter multicolumn lookup, and a different engine's own trade-off." h={200}>
      <Row y={70} label="a skipped column" value="PG18 still uses it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a secondary lookup" value="one engine's extra hop" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="fanout bounds depth, fillfactor and deduplication measured directly, and concurrency without a whole-tree lock." h={260}>
      <Row y={50} label="fanout" value="depth bounded, measured" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="fillfactor" value="a real, measured trade-off" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="deduplication" value="shrinks a duplicate column" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="concurrency" value="no whole-tree lock needed" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team removes the duplication from a heavily duplicated index column. What happens to deduplication's own benefit?" h={220}>
      <Row y={55} label="duplication, removed" value="by a schema change" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="deduplication's benefit" value="still the same?" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="really" value="shrinks, or disappears" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
