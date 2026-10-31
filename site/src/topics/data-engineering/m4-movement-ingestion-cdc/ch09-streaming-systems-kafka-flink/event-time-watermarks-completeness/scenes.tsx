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
    <Svg label="one silent partition, and the whole pipeline's watermark simply stops" h={200}>
      <Row y={70} label="one partition" value="goes silent" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="whole pipeline" value="frozen" valueColor={C.bad} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="two needles on one axis, free to drift apart under delay and backlog" h={200}>
      <Row y={70} label="event time" value="when it happened" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="processing time" value="when seen" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGuarantee({}: StepCtx) {
  return (
    <Svg label="would a real system's watermark ever actually be wrong?" h={200}>
      <Row y={70} label="watermark says" value="no more data" />
      <Row y={130} label="is that" value="a guarantee?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealHeuristic({ t }: StepCtx) {
  return (
    <Svg label="a claim, almost always heuristic, generated separately per partition" h={200}>
      <Row y={70} label="watermark" value="a heuristic claim" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="generated" value="per partition" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSelfFix({}: StepCtx) {
  return (
    <Svg label="without an explicit timeout, does the stalled watermark ever recover?" h={200}>
      <Row y={70} label="idle partition" value="stays silent" />
      <Row y={130} label="watermark" value="recovers alone?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealIdleFix({ t }: StepCtx) {
  return (
    <Svg label="a timeout excludes the silent partition, and the global watermark moves again" h={200}>
      <Row y={70} label="idle timeout" value="excludes it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="watermark" value="advances again" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAlignment({ t }: StepCtx) {
  return (
    <Svg label="a fast partition's watermark is capped, bounding the buffer it forces downstream" h={200}>
      <Row y={70} label="fast partition" value="held back" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="drift" value="bounded" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTradeoff({ t }: StepCtx) {
  return (
    <Svg label="tighter means faster but less complete; looser means slower but more complete" h={200}>
      <Row y={70} label="tight bound" value="fast, less complete" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="loose bound" value="slow, more complete" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="idle fix" value="watermark freed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="alignment" value="drift bounded" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="trade-off" value="measured, not guessed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two needles, a heuristic claim, two necessary fixes, and a measured trade-off" h={260}>
      <Row y={50} label="event vs processing" value="free to drift" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="idle, alignment" value="not edge cases" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="bound" value="latency vs completeness" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
