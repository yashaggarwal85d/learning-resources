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
    <Svg label="the same math, a loop and a vectorized call — what is the loop actually paying for?" h={200}>
      <Row y={70} label="same arithmetic" value="loop vs vectorized" />
      <Row y={130} label="loop pays for" value="what, exactly?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPyObjectHeader({ t }: StepCtx) {
  return (
    <Svg label="a reference count and a type pointer, before a single byte of the value itself" h={200}>
      <Row y={70} label="refcount" value="type pointer" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="before any" value="value at all" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictBoxedVsPacked({ t }: StepCtx) {
  return (
    <Svg label="a list of plain integers vs. a packed buffer — about the same, or dramatically more?" h={200}>
      <Row y={70} label="list of ints" value="vs packed buffer" />
      <Row y={130} label="same memory" value="or far more?" />
    </Svg>
  );
}

export function RevealBoxedVsPackedMeasured({ t }: StepCtx) {
  return (
    <Svg label="the same values, boxed and packed, measured byte for byte on this sandbox" h={200}>
      <Row y={70} label="boxed list" value="far more bytes" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="packed buffer" value="measured, smaller" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSlotsMeasured({ t }: StepCtx) {
  return (
    <Svg label="the same object, with and without its own dictionary — measured, not estimated" h={200}>
      <Row y={70} label="plain instance" value="own dictionary" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="__slots__" value="no dictionary" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSpecialization({ t }: StepCtx) {
  return (
    <Svg label="does the bytecode stay fixed regardless of type, or does the interpreter rewrite it?" h={200}>
      <Row y={70} label="same bytecode" value="for every type?" />
      <Row y={130} label="or rewritten" value="once it adapts?" />
    </Svg>
  );
}

export function RevealSpecializationDisassembled({ t }: StepCtx) {
  return (
    <Svg label="the same function's bytecode, generic before any call and type-specific after warm-up" h={260}>
      <Row y={60} label="before any call" value="generic op" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="after warm-up" value="type-specific op" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="same function" value="rewritten bytecode" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSpecializationQuote({ t }: StepCtx) {
  return (
    <Svg label="speculative and adaptive — specializes to what it sees, adapts when that changes" h={200}>
      <Row y={70} label="speculative" value="specializes to types" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="adaptive" value="re-adapts on change" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealJitDisclosure({ t }: StepCtx) {
  return (
    <Svg label="hot bytecode compiled to machine code — but only in a build configured for it, which this sandbox is not" h={200}>
      <Row y={70} label="jit compiles" value="hot bytecode" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this sandbox" value="not built with it" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLoopVsVectorized({ t }: StepCtx) {
  return (
    <Svg label="the interpreter sped up, but a vectorized call is still measured far ahead of it" h={200}>
      <Row y={70} label="interpreter" value="specializes, jits" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="vectorized call" value="still far ahead" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="boxed values carry real overhead; the interpreter adapts, at a cost; neither closes the vectorized gap" h={260}>
      <Row y={60} label="boxed values" value="real header cost" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="interpreter" value="adapts, at a cost" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="vectorized gap" value="still not closed" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="millions of calls, but a genuine mix of int and float arguments — does specialization still help?" h={200}>
      <Row y={70} label="mixed int/float" value="millions of calls" />
      <Row y={130} label="still helps" value="but how much?" />
    </Svg>
  );
}
