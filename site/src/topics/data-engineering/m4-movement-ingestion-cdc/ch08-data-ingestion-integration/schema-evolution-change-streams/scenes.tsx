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
    <Svg label="a column is retyped to carry a fraction on a Friday; the sink's own column keeps its old shape, and every fractional amount since arrives rounded away, with nothing raising an error." h={220}>
      <Row y={60} label="the column" value="retyped, fractional now" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the sink's column" value="never updated" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="every fraction since" value="rounded away, silently" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="a dropped column stops appearing in the stream entirely. Does a consumer that expects it get an error, or does nothing happen at all?" h={200}>
      <Row y={70} label="a column, dropped" value="vanished entirely" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="loud, or silent" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNoDDLEvent({ t }: StepCtx) {
  return (
    <Svg label="an ALTER TABLE statement decodes to an empty transaction: a begin and a commit, with nothing between them. Logical decoding carries no event for the DDL itself." h={200}>
      <Row y={70} label="one ALTER statement" value="its own transaction" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="begin, then commit" value="nothing in between" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealAddDropMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a new column appears only on the row event that actually carries it, and a dropped column disappears the same way, with no announcement either time." h={220}>
      <Row y={60} label="a column, added" value="shows up there" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="a column, dropped" value="disappears silently too" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRetypeMechanism({ t }: StepCtx) {
  return (
    <Svg label="a retyped column is nothing special to the stream: still one row event, now carrying a different type tag beside the same column name." h={200}>
      <Row y={70} label="a column, retyped" value="still one event" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="only the tag" value="actually changes" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealWideningMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a column widened to hold a value no smaller type ever could; a sink that widened to match stored that exact value, nothing lost." h={220}>
      <Row y={60} label="widened at source" value="too big before" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="sink widened too" value="stored exactly" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealNarrowingMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a column retyped to carry a fraction; the sink, left at its old narrower type, accepted the write anyway and rounded the fraction away with no error." h={220}>
      <Row y={60} label="retyped, fractional value" value="arrives at sink" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="sink's old type" value="rounded away silently" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealReSnapshot({ t }: StepCtx) {
  return (
    <Svg label="when a retyped column's own old rows can't be reinterpreted under the new shape at all, widening or reapplying a type isn't enough; only a fresh incremental snapshot of that table repairs it." h={220}>
      <Row y={60} label="old rows" value="sometimes unreadable" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the real fix" value="snapshot it again" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an added or dropped column shows up or vanishes only on its own row event, never announced; a widened type survives a reader that keeps up, a narrowed one punishes a reader that doesn't." h={260}>
      <Row y={50} label="add or drop" value="learned per row" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="kept up with" value="survives cleanly" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="fallen behind" value="corrupts silently" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="unreadable rows" value="need a snapshot" o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new column shows up in a stream your sink has never seen before. Something has to decide if this is even allowed before anyone writes a row. Whose job is that?" h={200}>
      <Row y={70} label="allowed or not" value="whose call, exactly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
