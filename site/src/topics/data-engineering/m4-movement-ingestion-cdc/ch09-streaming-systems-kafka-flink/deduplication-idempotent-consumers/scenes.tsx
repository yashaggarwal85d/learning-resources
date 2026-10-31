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
    <Svg label="an ever-growing id set runs out of memory; a bounded window holds it flat" h={200}>
      <Row y={70} label="unbounded set" value="memory climbs" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="bounded window" value="memory flat" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="one sink's deterministic id generalizes to any consumer, no transaction needed" h={200}>
      <Row y={70} label="one sink" value="deterministic id" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="any consumer" value="remember, bounded" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWindow({}: StepCtx) {
  return (
    <Svg label="the same id arrives again, but only after the dedup window has already passed" h={200}>
      <Row y={70} label="first seen" value="long ago" />
      <Row y={130} label="redelivered" value="window passed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealWindow({ t }: StepCtx) {
  return (
    <Svg label="an id outside the window is forgotten on purpose, a stated and accepted gap" h={200}>
      <Row y={70} label="inside window" value="caught" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="outside window" value="treated as new" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBound({ t }: StepCtx) {
  return (
    <Svg label="a wall-clock TTL or a stream-relative watermark — the same trade-off, different clock" h={200}>
      <Row y={70} label="TTL bound" value="wall clock" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="watermark bound" value="stream progress" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictBloom({}: StepCtx) {
  return (
    <Svg label="a Bloom filter says an id might be present — can that answer ever be wrong?" h={200}>
      <Row y={70} label="filter says" value="might contain" />
      <Row y={130} label="actual answer" value="sometimes wrong?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBloom({ t }: StepCtx) {
  return (
    <Svg label="never a false negative — only, rarely, a false positive, measured directly" h={200}>
      <Row y={70} label="inserted id" value="always found" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unseen id" value="rarely flagged" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDerived({ t }: StepCtx) {
  return (
    <Svg label="a derived event's id, recomputed identically, lets the next stage dedup the same way" h={200}>
      <Row y={70} label="derived id" value="same, each time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="next stage" value="dedups it too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="inside window" value="duplicate caught" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Bloom filter" value="measured rate" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="derived id" value="caught downstream" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="source ids, a bounded window, a one-directional filter error, and ids that propagate" h={260}>
      <Row y={50} label="event id" value="set at source" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="dedup window" value="bounded, on purpose" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="derived id" value="propagates dedup" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
