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
    <Svg label="a full rebuild, every run — what happens once that table is far too large for it?" h={200}>
      <Row y={70} label="every run" value="full rebuild" />
      <Row y={130} label="table grows" value="too large for that?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealIsIncrementalQuote({ t }: StepCtx) {
  return (
    <Svg label="a macro, true under specific conditions — that condition is the whole mechanism" h={200}>
      <Row y={70} label="is_incremental()" value="true under conditions" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="that condition" value="is the mechanism" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictLookback({ t }: StepCtx) {
  return (
    <Svg label="an old-dated correction arrives late — does a wider lookback window catch it?" h={200}>
      <Row y={70} label="old-dated correction" value="arrives late" />
      <Row y={130} label="wider lookback" value="catches it?" />
    </Svg>
  );
}

export function RevealStrategies({ t }: StepCtx) {
  return (
    <Svg label="the same fact table, four real strategies — appended, deleted and reinserted, merged, batched" h={260}>
      <Row y={60} label="append" value="delete + insert" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="merge" value="microbatch" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="same fact table" value="four real strategies" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAdapterGap({ t }: StepCtx) {
  return (
    <Svg label="one named strategy, built for partitioned warehouses — this project's own database can't run it" h={200}>
      <Row y={70} label="insert_overwrite" value="built for partitions" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this adapter" value="can't run it" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMissedCorrection({ t }: StepCtx) {
  return (
    <Svg label="an old-dated correction, missed by every lookback strategy — caught only by a full rebuild" h={200}>
      <Row y={70} label="old-dated correction" value="missed, every strategy" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="caught only by" value="a full rebuild" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSchemaChange({ t }: StepCtx) {
  return (
    <Svg label="a new column, added to the select — does the next run just pick it up?" h={200}>
      <Row y={70} label="new column" value="added to select" />
      <Row y={130} label="next run" value="picks it up?" />
    </Svg>
  );
}

export function RevealSchemaStages({ t }: StepCtx) {
  return (
    <Svg label="ignore drops it silently; append adds it but leaves old rows empty; only a full rebuild backfills everything" h={260}>
      <Row y={60} label="ignore" value="drops it, silently" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="append new" value="old rows stay empty" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="full rebuild" value="backfills everything" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSnapshotStrategies({ t }: StepCtx) {
  return (
    <Svg label="the same real change, two snapshot strategies — one stamps the data's time, one stamps the run's own time" h={200}>
      <Row y={70} label="timestamp strategy" value="the data's own time" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="check strategy" value="the run's own time" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTimestampPreferred({ t }: StepCtx) {
  return (
    <Svg label="valid-from, valid-to — the exact columns an earlier topic in this chapter built by hand" h={200}>
      <Row y={70} label="valid-from, valid-to" value="the same columns" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="built once" value="by hand, this chapter" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="lookback catches recent corrections only; schema change is silent by default; a snapshot strategy decides what valid-from means" h={260}>
      <Row y={60} label="lookback" value="recent corrections only" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="schema change" value="silent by default" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="snapshot strategy" value="sets valid-from" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="append-only by nature, but occasional months-old corrections — which strategy actually handles both?" h={200}>
      <Row y={70} label="append-only" value="occasional old corrections" />
      <Row y={130} label="which strategy" value="handles both?" />
    </Svg>
  );
}
