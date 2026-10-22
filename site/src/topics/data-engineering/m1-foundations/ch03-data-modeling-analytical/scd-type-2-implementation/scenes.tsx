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
    <Svg label="overwrite the address, or keep both versions?" h={200}>
      <Row y={70} label="address changed" value="overwrite, or keep both?" />
      <Row y={130} label="past fact rows" value="which address is true then?" />
    </Svg>
  );
}

export function RevealSCD2Quote({ t }: StepCtx) {
  return (
    <Svg label="a new row, a new key, the old row untouched" h={200}>
      <Row y={70} label="type 2 change" value="a new row, not an overwrite" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="old row, old key" value="left alone" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSingleMerge({ t }: StepCtx) {
  return (
    <Svg label="expire the old row, insert the new — one statement?" h={200}>
      <Row y={70} label="expire old, insert new" value="one statement?" />
      <Row y={130} label="or" value="does it need two?" />
    </Svg>
  );
}

export function RevealMergeQuote({ t }: StepCtx) {
  return (
    <Svg label="one statement, conditional insert, update, or delete" h={200}>
      <Row y={70} label="merge" value="one statement" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="conditionally" value="insert, update, or delete" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMergeMeasured({ t }: StepCtx) {
  return (
    <Svg label="one real merge: expired, inserted, atomically" h={200}>
      <Row y={70} label="old row" value="expired, in place" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="new row" value="inserted, same statement" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictRerun({ t }: StepCtx) {
  return (
    <Svg label="the identical load, run twice — anything changes?" h={200}>
      <Row y={70} label="identical load" value="run a second time" />
      <Row y={130} label="anything" value="change?" />
    </Svg>
  );
}

export function RevealIdempotency({ t }: StepCtx) {
  return (
    <Svg label="run twice: nothing changes the second time" h={200}>
      <Row y={70} label="run twice" value="identical statement" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="second run" value="changes nothing at all" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealHashDiff({ t }: StepCtx) {
  return (
    <Svg label="one hash, instead of one check per column" h={200}>
      <Row y={70} label="one hash compared" value="catches any real change" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="instead of" value="a check per column" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictReplayOrder({ t }: StepCtx) {
  return (
    <Svg label="out of order, duplicated — still comes out right?" h={200}>
      <Row y={70} label="feed, out of order" value="plus a duplicate" />
      <Row y={130} label="final history" value="still correct?" />
    </Svg>
  );
}

export function RevealReplayMeasured({ t }: StepCtx) {
  return (
    <Svg label="duplicate removed, order rebuilt, correctly" h={200}>
      <Row y={70} label="fed out of order" value="one duplicate included" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="rebuilt chain" value="correctly ordered, deduped" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAsOf({ t }: StepCtx) {
  return (
    <Svg label="a date inside the window: the right version" h={200}>
      <Row y={70} label="as-of date" value="inside the middle window" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="result" value="the middle version, exactly" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="new row, atomic merge, order-independent" h={240}>
      <Row y={55} label="type 2" value="new row, new key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="merge load" value="atomic, provably idempotent" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="rebuilt chain" value="survives disorder, duplicates" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveFullDuplicateFeed({ t }: StepCtx) {
  return (
    <Svg label="the whole feed, duplicated start to finish" h={200}>
      <Row y={70} label="entire feed" value="arrives a second time" />
      <Row y={130} label="rebuild" value="still converges?" />
    </Svg>
  );
}
