import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="two large tables, equi-joined, no hint. Which of two strategies does Spark pick on its own?" h={200}>
      <Row y={70} label="two large tables, no hint" value="which strategy?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the planner's own default" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSortMerge({ t }: StepCtx) {
  return (
    <Svg label="measured: a sort-merge join. A real Sort step sits above the shuffle on each side." h={200}>
      <Row y={70} label="unhinted default" value="sort-merge join" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sort step per side" value="2, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictHashHint({ t }: StepCtx) {
  return (
    <Svg label="a hint tells Spark to use the other strategy on one side. Does it still sort both sides first?" h={200}>
      <Row y={70} label="hint: use the hash strategy" value="sorts first?" />
      <Row y={130} label="sort steps in the plan" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealShuffledHash({ t }: StepCtx) {
  return (
    <Svg label="measured: a shuffled hash join. Zero Sort steps anywhere in the plan." h={200}>
      <Row y={70} label="hinted strategy" value="shuffled hash join" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sort steps in the plan" value="zero, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSkewedBuildSide({ t }: StepCtx) {
  return (
    <Svg label="the hash join's build side is made artificially huge. Same graceful behaviour as sort-merge?" h={200}>
      <Row y={70} label="build side made huge" value="same graceful fail?" />
      <Row y={130} label="what actually happens" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOomRisk({ t }: StepCtx) {
  return (
    <Svg label="sourced: the planner's own comment names a real OOM risk. Sort-merge has no equivalent." h={200}>
      <Row y={70} label="hash join, big build side" value="memory risk" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sort-merge's own fallback" value="spills to disk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="sort-merge is the default and degrades gracefully; a hint switches to hash, dropping every sort, at a real memory cost." h={280}>
      <Row y={50} label="unhinted default" value="sort-merge, 2 sorts" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="hash hint" value="zero sorts anywhere" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="big build side" value="hash risks OOM, sort spills" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
