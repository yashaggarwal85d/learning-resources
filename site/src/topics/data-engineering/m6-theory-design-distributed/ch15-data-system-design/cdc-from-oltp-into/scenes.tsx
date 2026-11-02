import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a CDC connector pauses for the weekend; the source disk gauge climbs through the week" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        healthy for the better part of a year
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        then nobody restarted it
      </T>
      <Row y={150} label="connector" value="stopped, dark" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="source disk" value="nearly full" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the cause" value="not a leak" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="what single setting bounds the slot, and what does the bound cost?" h={210}>
      <Row y={75} label="a code leak" value="doesn't fit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the slot" value="keeps it all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPipelineStrip({ t }: StepCtx) {
  return (
    <Svg label="log, slot, connector, topic, merge; the correctness boundary sits at the merge" h={240}>
      <Row y={55} label="log, slot" value="source side" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="connector, topic" value="in transit" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the merge" value="boundary here" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealGuaranteeIsHazard({ t }: StepCtx) {
  return (
    <Svg label="the slot keeps every unconfirmed byte; that guarantee is also the hazard" h={210}>
      <Row y={75} label="the guarantee" value="protects, always" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="stopped connector" value="fills the disk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCapAndCost({ t }: StepCtx) {
  return (
    <Svg label="a cap bounds the slot; past it, a forced re-snapshot; a heartbeat holds quiet tables short" h={210}>
      <Row y={75} label="past the cap" value="forced re-snapshot" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a heartbeat" value="holds it short" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSnapshotHandover({ t }: StepCtx) {
  return (
    <Svg label="snapshot then stream, or a lock-free interleaved handover; no gap, no overlap" h={210}>
      <Row y={75} label="snapshot first" value="then stream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="interleaved" value="no lock taken" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeleteSchema({ t }: StepCtx) {
  return (
    <Svg label="a tombstone applied as a delete; a column rolled out as expand, then contract" h={210}>
      <Row y={75} label="a delete" value="applied, not guessed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a new column" value="expand, contract" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCompactionStall({ t }: StepCtx) {
  return (
    <Svg label="small files pile up; a stalled compaction stalls the merge, and the slot grows" h={210}>
      <Row y={75} label="small files" value="pile up" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="stalled merge" value="slot keeps growing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the strip, the slot-and-cap trade, the handover, deletes and schema, compaction and slot" h={290}>
      <Row y={45} label="boundary" value="at the merge" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="the slot" value="guarantee, capped" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="handover" value="gap-free handover" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="compaction" value="feeds the slot" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second slot, well past half its cap, still climbing" h={250}>
      <Row y={65} label="this slot" value="already past half" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the fix" value="compute, don't add" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="the answer" value="this slot's rate" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
