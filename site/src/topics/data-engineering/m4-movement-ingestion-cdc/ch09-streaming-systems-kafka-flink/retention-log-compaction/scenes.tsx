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
    <Svg label="a compacted topic's old value, still readable a full day after the new one landed" h={200}>
      <Row y={70} label="new value" value="written" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="old value" value="still readable" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="the same partition strip, now governed by two different retention rules" h={200}>
      <Row y={70} label="delete rule" value="by age" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="compact rule" value="latest per key" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSegment({}: StepCtx) {
  return (
    <Svg label="retention kicks in — does it remove one record, or a whole segment at once?" h={200}>
      <Row y={70} label="one record" value="removed, or not?" />
      <Row y={130} label="whole segment" value="removed, or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSegment({ t }: StepCtx) {
  return (
    <Svg label="three segments, measured against a retention window: one deleted whole, two kept whole" h={260}>
      <Row y={50} label="oldest segment" value="deleted whole" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="middle segment" value="kept whole" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="newest segment" value="kept whole" o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function PredictDirty({}: StepCtx) {
  return (
    <Svg label="the cleaner and a superseded record — does it rewrite immediately, or wait for something?" h={200}>
      <Row y={70} label="cleaner" value="fires now, or waits?" />
      <Row y={130} label="superseded record" value="rewritten, or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDirty({ t }: StepCtx) {
  return (
    <Svg label="the dirty ratio, measured below and above its configured threshold" h={200}>
      <Row y={70} label="below threshold" value="cleaner off" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="above threshold" value="cleaner fires" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLagWindow({ t }: StepCtx) {
  return (
    <Svg label="a record measured at three ages: too fresh, forced eligible, and in between" h={260}>
      <Row y={50} label="too fresh" value="never eligible" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="past the ceiling" value="forced eligible" valueColor={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="in between" value="ratio decides" o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function RevealTombstone({ t }: StepCtx) {
  return (
    <Svg label="a tombstone, measured against a consumer that catches up in time and one that lags too far" h={200}>
      <Row y={70} label="fast catch-up" value="tombstone seen" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lagged too far" value="tombstone missed" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="segment check" value="deleted whole" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="dirty ratio" value="gate crossed" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="lag window" value="floor and ceiling" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="tombstone" value="seen, then missed" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="segment-granularity deletion, a dirty-ratio gate, a lag window, and a tombstone that expires on its own schedule" h={260}>
      <Row y={50} label="deletion" value="whole segments" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="compaction" value="dirty-ratio gated" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="tombstone" value="its own clock" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
