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
    <Svg label="treat every attribute like Type 2, and the dimension never stops growing" h={200}>
      <Row y={70} label="type 2, everywhere" value="new row, every time" />
      <Row y={130} label="the dimension" value="never stops growing" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealType0({ t }: StepCtx) {
  return (
    <Svg label="the value never changes, so there is nothing to track" h={200}>
      <Row y={70} label="type 0" value="retain original" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="value" value="never changes" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealType1({ t }: StepCtx) {
  return (
    <Svg label="overwrite in place — easy, but history is gone for good" h={200}>
      <Row y={70} label="type 1" value="overwrite" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="old value" value="gone for good" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOneColumn({ t }: StepCtx) {
  return (
    <Svg label="keep the old value, but without a whole new row — possible?" h={200}>
      <Row y={70} label="keep old value" value="no new row?" />
      <Row y={130} label="or" value="always needs one?" />
    </Svg>
  );
}

export function RevealType3({ t }: StepCtx) {
  return (
    <Svg label='a second column, an "alternate reality," beside the overwritten one' h={200}>
      <Row y={70} label="type 3" value="add new attribute" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="main column" value="overwritten" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealGallery({ t }: StepCtx) {
  return (
    <Svg label="one change, four treatments: row and column count, side by side" h={260}>
      <Row y={60} label="type 0, 1" value="one row" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="type 2" value="two rows" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="type 3" value="one row, new column" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMonsterDimension({ t }: StepCtx) {
  return (
    <Svg label="a fast-changing attribute group, shared by many rows — does Type 2 scale?" h={200}>
      <Row y={70} label="fast group" value="shared widely" />
      <Row y={130} label="type 2" value="still scale?" />
    </Svg>
  );
}

export function RevealType4({ t }: StepCtx) {
  return (
    <Svg label="nine possible combinations, five actually seen — the mini-dimension stays that small" h={200}>
      <Row y={70} label="possible" value="nine" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="mini-dim rows" value="five" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealType5({ t }: StepCtx) {
  return (
    <Svg label="Type 4, plus one overwritten pointer to the current profile — four plus one" h={200}>
      <Row y={70} label="type 5" value="type 4 plus 1" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="current" value="no fact join" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSixSeven({ t }: StepCtx) {
  return (
    <Svg label="same reporting, two hybrids — do they really cost different amounts?" h={200}>
      <Row y={70} label="type 6, 7" value="same report" />
      <Row y={130} label="cost" value="really differs?" />
    </Svg>
  );
}

export function RevealSixSevenMeasured({ t }: StepCtx) {
  return (
    <Svg label="six prior rows rewritten for Type 6; zero rewritten for Type 7" h={200}>
      <Row y={70} label="type 6" value="six rewritten" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="type 7" value="zero rewritten" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealChoosing({ t }: StepCtx) {
  return (
    <Svg label="one attribute, one decision each: type 0, type 1, and type 4 moving to type 5" h={260}>
      <Row y={60} label="signup channel" value="type 0" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="mistyped phone" value="type 1" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="fast, shared, current" value="type 4 to 5" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="zero through three: keep it or not; four: split it off; five, six, seven: combinations" h={260}>
      <Row y={60} label="zero, one, three" value="keep it, or not" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="four" value="split it off" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="five, six, seven" value="combinations" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="changes often, tracked alone, history always needed — which type?" h={200}>
      <Row y={70} label="tracked alone" value="history always needed" />
      <Row y={130} label="which type" value="fits?" />
    </Svg>
  );
}
