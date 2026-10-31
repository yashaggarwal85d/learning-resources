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
    <Svg label="a recurring commit conflict on the same partitions; an audit snapshot already expired" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        compaction and the CDC merge, colliding
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and a snapshot the auditor needed is gone
      </T>
      <Row y={150} label="the conflict" value="every few nights" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="the audit" value="snapshot expired" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="one decision" value="prevents both" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which single decision prevents both the conflict and the lost snapshot?" h={210}>
      <Row y={75} label="faster retries" value="same files, still" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="disjoint, tagged" value="collision gone" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAtomicSwap({ t }: StepCtx) {
  return (
    <Svg label="three writer lanes converge on one pointer; a swap lands, or it doesn't" h={240}>
      <Row y={55} label="cdc merge" value="one lane" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="backfill, compaction" value="two more lanes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the pointer" value="swap, or hold" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealPartitionWriters({ t }: StepCtx) {
  return (
    <Svg label="overlapping partitions collide; disjoint partitions make the collision vanish" h={210}>
      <Row y={75} label="same partitions" value="collide, retry" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="disjoint partitions" value="no collision" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSchemaPolicy({ t }: StepCtx) {
  return (
    <Svg label="a schema change passes review; old-schema writers keep running without breaking" h={210}>
      <Row y={75} label="new column" value="review gate" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="old writers" value="keep running" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRetentionTag({ t }: StepCtx) {
  return (
    <Svg label="an expiry sweep clears snapshots; a tagged one survives it untouched" h={210}>
      <Row y={75} label="the sweep" value="clears the rest" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the tag" value="survives it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMaintenanceWriter({ t }: StepCtx) {
  return (
    <Svg label="compaction, expiry, and orphan removal all attempt the same pointer swap" h={210}>
      <Row y={75} label="maintenance" value="a writer too" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="unscheduled" value="can starve ingest" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMaintenanceSchedule({ t }: StepCtx) {
  return (
    <Svg label="a maintenance window timed clear of the ingest window beside it" h={210}>
      <Row y={75} label="the window" value="sized to stream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the timing" value="clear of ingest" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one atomic swap, disjoint partitions, a schema policy, a tag, a maintenance schedule" h={290}>
      <Row y={45} label="commit" value="one atomic swap" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="writers" value="laid out disjoint" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="retention" value="tag, then policy" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="maintenance" value="scheduled, not loose" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new writer about to share partitions with compaction; check overlap first" h={250}>
      <Row y={65} label="new writer" value="shares partitions" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the fix" value="checked, not guessed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="not" value="wait and see" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
