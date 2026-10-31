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
    <Svg label="one file, eleven thousand files. the cluster slows down." h={200}>
      <Row y={70} label="expected" value="one file" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="actual" value="many files" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealExpandPartial({ t }: StepCtx) {
  return (
    <Svg label="fan-out count decided at run time, not write time." h={200}>
      <Row y={70} label="discovered" value="five files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="task instances" value="five, mapped" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTruncateOrFail({ t }: StepCtx) {
  return (
    <Svg label="too many files. clipped, or refused outright?" h={200}>
      <Row y={70} label="too many files" value="past the limit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="outcome" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealExactBoundary({ t }: StepCtx) {
  return (
    <Svg label="one more file than the limit. the run fails." h={200}>
      <Row y={70} label="at the limit" value="all succeed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one over" value="whole run fails" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOverheadScaling({ t }: StepCtx) {
  return (
    <Svg label="ten, a hundred, five hundred, a thousand files. timed." h={260}>
      <Row y={40} label="small fan-out" value="fast" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="medium fan-out" value="slower" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="large fan-out" value="much slower" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealEngineContrast({ t }: StepCtx) {
  return (
    <Svg label="one instance per file, or one job with partitions." h={200}>
      <Row y={70} label="per-file tasks" value="heavy overhead" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="engine partitions" value="far lighter" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="decided at run time. a hard limit. engine is cheaper." h={260}>
      <Row y={40} label="fan-out count" value="decided at run time" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="past the limit" value="refused outright" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="scheduler cost" value="far more" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function PredictZeroLength({ t }: StepCtx) {
  return (
    <Svg label="zero files discovered. mapped over nothing." h={200}>
      <Row y={70} label="discovered" value="zero files" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="mapped task" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="thousands want to run. how many actually do?" h={200}>
      <Row y={70} label="mapped instances" value="thousands, waiting" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="running at once" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
