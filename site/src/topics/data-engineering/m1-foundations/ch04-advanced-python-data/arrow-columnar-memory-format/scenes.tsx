import { Bar, C, Svg, T } from '../../../../../reels/kit';
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

/** A labeled bar: a name on the left, a bar sized to `frac` of `maxW` on the right. */
function LabeledBar({ y, label, frac, maxW = 420, color = C.focus, o = 1 }: { y: number; label: string; frac: number; maxW?: number; color?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y - 8} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={25} y={y} w={Math.max(3, maxW * frac)} h={14} full={maxW} fill={color} />
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a native engine win and a handoff win, neither one asking how the bytes agree at all" h={200}>
      <Row y={70} label="two engines" value="both measured fast" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="same bytes?" value="never asked" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealArrayIsBuffers({ t }: StepCtx) {
  return (
    <Svg label="a real array, shown as its own separate buffers — a bitmap and a data buffer, not one blob" h={220}>
      <Row y={55} label="one array" value="two buffers" o={easeOut(seg(t, 0, 0.5))} />
      <LabeledBar y={100} label="validity bitmap" frac={0.18} color={C.latte} o={easeOut(seg(t, 0.2, 0.7))} />
      <LabeledBar y={150} label="data buffer" frac={0.82} color={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictZeroNullBitmap({ t }: StepCtx) {
  return (
    <Svg label="zero nulls — is a bitmap buffer still allocated anyway, or skipped entirely?" h={200}>
      <Row y={70} label="zero nulls" value="no exceptions seen" />
      <Row y={130} label="bitmap buffer" value="allocated or skipped?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealChunkedArray({ t }: StepCtx) {
  return (
    <Svg label="several batches, one logical column — no copy, just a list of where each one already lives" h={240}>
      <Row y={50} label="batch one" value="stays in place" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={100} label="batch two" value="stays in place" o={easeOut(seg(t, 0.15, 0.5))} />
      <Row y={150} label="batch three" value="stays in place" o={easeOut(seg(t, 0.3, 0.65))} />
      <Row y={200} label="one column" value="no copy at all" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealDictionaryEncoding({ t }: StepCtx) {
  return (
    <Svg label="repeated values become small integer indices — a real measured size reduction" h={220}>
      <LabeledBar y={70} label="plain values" frac={1} color={C.latte} o={easeOut(seg(t, 0, 0.5))} />
      <LabeledBar y={130} label="dictionary-encoded" frac={0.57} color={C.focus} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={185} label="repeats anywhere" value="shrink either way" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealRunEndEncoding({ t }: StepCtx) {
  return (
    <Svg label="real runs compress far harder than dictionary encoding — but values that only alternate defeat it" h={260}>
      <LabeledBar y={55} label="plain values" frac={1} color={C.latte} o={easeOut(seg(t, 0, 0.4))} />
      <LabeledBar y={110} label="run-end, real runs" frac={0.03} color={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <LabeledBar y={165} label="run-end, alternating" frac={1.4} color={C.cocoa} o={easeOut(seg(t, 0.5, 0.9))} />
      <Row y={220} label="alternating case" value="worse than plain" valueColor={C.focus} o={easeOut(seg(t, 0.75, 1))} />
    </Svg>
  );
}

export function RevealStringView({ t }: StepCtx) {
  return (
    <Svg label="short strings inlined directly; long strings keep only a prefix plus where the rest lives" h={220}>
      <Row y={55} label="short string" value="inlined, no buffer" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="long string" value="prefix kept inline" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={165} label="rest of it" value="one buffer away" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealNestedTypes({ t }: StepCtx) {
  return (
    <Svg label="a list's own buffers are exactly a bitmap and offsets — nesting needs no new buffer kind" h={200}>
      <Row y={70} label="list's own buffers" value="bitmap + offsets" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="child array" value="same old primitives" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealComputeKernel({ t }: StepCtx) {
  return (
    <Svg label="the identical sum, vectorized kernel versus a python loop — a real measured gap" h={220}>
      <LabeledBar y={70} label="vectorized kernel" frac={0.04} color={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <LabeledBar y={130} label="python loop" frac={1} color={C.latte} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={185} label="same result" value="never boxed a value" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealInterchangeLayer({ t }: StepCtx) {
  return (
    <Svg label="one table, handed to two different engines directly — no conversion step, same answer from both" h={240}>
      <Row y={50} label="one table" value="one place in memory" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={100} label="engine one" value="reads it directly" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={150} label="engine two" value="reads it directly" o={easeOut(seg(t, 0.35, 0.75))} />
      <Row y={200} label="both answers" value="identical" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="buffers not a blob, chunks not copies, two specialists, one view layout, one shared table" h={260}>
      <Row y={50} label="buffers" value="not a blob" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="batches" value="chunk, not copy" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="dictionary / run-end" value="two specialists" o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="one table" value="two engines, no copy" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="country codes, sorted timestamps, free text — which layout fits each, and what breaks if you guess wrong?" h={240}>
      <Row y={55} label="country codes" value="dictionary" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={105} label="sorted timestamps" value="run-end" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={155} label="free-text comments" value="string-view" o={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={205} label="guess wrong" value="pay for the mismatch" valueColor={C.focus} o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}
