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
    <Svg label="a sealed segment never changes — the newer value lives in a separate overlay" h={200}>
      <Row y={70} label="sealed segment" value="untouched" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the newer value" value="a separate overlay" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a lakehouse table is one destination; this topic answers queries in milliseconds" h={200}>
      <Row y={70} label="a lakehouse table" value="batch-style queries" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="the other store" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSegmentOwner({}: StepCtx) {
  return (
    <Svg label="a partition feeds this store directly — who builds its queryable unit?" h={200}>
      <Row y={70} label="a partition" value="feeds the store" />
      <Row y={130} label="who builds" value="the segment?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealConsumerPerPartition({ t }: StepCtx) {
  return (
    <Svg label="one consuming task per partition, building that partition's own segment" h={200}>
      <Row y={70} label="one task" value="per partition" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each task" value="builds its segment" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAtomicCommit({ t }: StepCtx) {
  return (
    <Svg label="the offset and the segment commit together, in one atomic action" h={200}>
      <Row y={70} label="offset, segment" value="one commit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both or" value="neither" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNaiveMismatch({ t }: StepCtx) {
  return (
    <Svg label="commit the offset first, and a crash leaves it ahead of the segment" h={200}>
      <Row y={70} label="offset first" value="segment after" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a crash between" value="breaks that step" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictUpsertRewrite({}: StepCtx) {
  return (
    <Svg label="does a newer value require rewriting the sealed segment holding the old one?" h={200}>
      <Row y={70} label="a newer value" value="for the key" />
      <Row y={130} label="rewrite the segment?" value="or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealUpsertOverlay({ t }: StepCtx) {
  return (
    <Svg label="the sealed segment stays untouched; an overlay carries the newer value" h={200}>
      <Row y={70} label="sealed segment" value="stays untouched" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="an overlay" value="carries the update" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBuildVsBuy({ t }: StepCtx) {
  return (
    <Svg label="run the consumer yourself, or pay a managed service to run it instead" h={200}>
      <Row y={70} label="kafka engine" value="run it yourself" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="clickpipes" value="managed, instead" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSameShape({ t }: StepCtx) {
  return (
    <Svg label="three stores, the same per-partition segments and the same atomic commit" h={200}>
      <Row y={70} label="three stores" value="same segments" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same commit" value="different extras" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="each partition" value="its own segments" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a failed commit" value="stays in step" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="an overlay" value="answers, no rewrite" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="segments, exactly-once, upsert, build-versus-buy — all reused, none reinvented" h={260}>
      <Row y={50} label="segments" value="from this chapter" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="exactly-once" value="reused again" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="next" value="a bigger question" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
