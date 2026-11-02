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
    <Svg label="a dashboard assumes the wrong mode, and its total quietly runs away" h={200}>
      <Row y={70} label="dashboard assumes" value="accumulating mode" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="job is actually" value="discarding mode" valueColor={C.bad} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a window has a shape; now it has to say something, and say it honestly" h={200}>
      <Row y={70} label="prior topic" value="a window's shape" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this topic" value="what it says" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeFirings({ t }: StepCtx) {
  return (
    <Svg label="the same window, speaking at three different moments, each a real total" h={200}>
      <Row y={70} label="early" value="a partial answer" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="on time, late" value="the answer, corrected" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLateness({}: StepCtx) {
  return (
    <Svg label="once the allowed window closes, what happens to a record that shows up after?" h={200}>
      <Row y={70} label="allowed lateness" value="closes, eventually" />
      <Row y={130} label="a late record" value="then what?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDropped({ t }: StepCtx) {
  return (
    <Svg label="not queued, not retried — the pane's state is simply gone" h={200}>
      <Row y={70} label="lateness expires" value="pane state gone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a later record" value="dropped outright" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSumOfSums({}: StepCtx) {
  return (
    <Svg label="sum up every value a window emits — does that always work?" h={200}>
      <Row y={70} label="downstream" value="sums every value" />
      <Row y={130} label="every mode" value="same result?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDiscardingVsAccumulating({ t }: StepCtx) {
  return (
    <Svg label="discarding reports a delta each time; accumulating reports the whole total again" h={200}>
      <Row y={70} label="discarding" value="sum-of-sums works" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="accumulating" value="sum-of-sums breaks" valueColor={C.bad} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRetraction({ t }: StepCtx) {
  return (
    <Svg label="a retraction cancels the old value first, so the same naive sum works again" h={200}>
      <Row y={70} label="retraction" value="cancels old value" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sum-of-sums" value="correct again" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="three firings" value="measured, not guessed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="lateness boundary" value="drop point, exact" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="three modes" value="same ground truth" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three moments to speak, a bounded trade-off, and a mode that must be known" h={260}>
      <Row y={50} label="one window" value="three voices" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="allowed lateness" value="a deliberate bound" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="accumulation mode" value="never a detail" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
