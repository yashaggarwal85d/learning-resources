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
    <Svg label="an extractor crashes between writing rows and saving its checkpoint; the restart duplicates every row." h={220}>
      <Row y={50} label="rows written" value="before the crash" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="checkpoint saved" value="never" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={150} label="after restart" value="every row, twice" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="the output write and the checkpoint advance can happen in either order. Which order loses data?" h={200}>
      <Row y={70} label="two orderings" value="checkpoint, or output first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which one loses data" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckpointFirst({ t }: StepCtx) {
  return (
    <Svg label="the checkpoint is marked done, then the crash happens before the output is ever written." h={200}>
      <Row y={70} label="checkpoint" value="marked done" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="output write" value="never happens" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealOrderingsMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run of all three orderings: checkpoint-first loses data, output-first duplicates, atomic is consistent." h={240}>
      <Row y={50} label="checkpoint, then output" value="data lost" valueColor={C.badText} o={easeOut(seg(t, 0, 0.35))} />
      <Row y={100} label="output, then checkpoint" value="batch duplicated" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={150} label="both, atomically" value="stays consistent" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealBatchIdConcept({ t }: StepCtx) {
  return (
    <Svg label="a batch id derived from the input range itself, not a counter or the wall clock." h={200}>
      <Row y={70} label="id derived from" value="the input range" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not derived from" value="a counter, or clock" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealBatchIdMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a range-derived id overwrites on a re-run; a counter-derived id piles up beside it." h={220}>
      <Row y={60} label="range-derived id" value="re-run overwrites" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="counter-derived id" value="re-run appends" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealRecipeNamed({ t }: StepCtx) {
  return (
    <Svg label="at-least-once delivery plus an idempotent, keyed write is the recipe for an exactly-once effect." h={200}>
      <Row y={70} label="at-least-once delivery" value="redeliveries allowed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="plus idempotent write" value="exactly-once effect" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealDiffMeasured({ t }: StepCtx) {
  return (
    <Svg label="a batch crashes partway, is re-run in full, and is checked byte for byte against one clean run." h={220}>
      <Row y={60} label="crashed, then re-run" value="batch completes" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="versus one clean run" value="byte-identical" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three commit orderings, one batch-id choice, one recipe — the property every source in this chapter needed." h={260}>
      <Row y={50} label="commit ordering" value="atomic, or it fails" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="batch id" value="from the range" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="recipe" value="at-least-once, idempotent" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="shared property" value="safely re-runnable" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a broker redelivers the identical message twice. Does that violate exactly-once delivery, effect, both, or neither?" h={200}>
      <Row y={70} label="message delivered" value="twice" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which guarantee breaks" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
