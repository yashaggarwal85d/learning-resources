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
    <Svg label="a small table, joined to a huge one. Copy the small one everywhere, or shuffle both?" h={200}>
      <Row y={70} label="small table joins large one" value="copy, or shuffle?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="actual shuffle at join time" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealUnderThreshold({ t }: StepCtx) {
  return (
    <Svg label="measured: zero shuffle Exchanges. The small side is copied whole to every executor." h={200}>
      <Row y={70} label="small side, under threshold" value="broadcast" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="large side's own cost" value="none at all" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictOverThreshold({ t }: StepCtx) {
  return (
    <Svg label="the same query, but the small table now grows past the threshold. Still copied everywhere?" h={200}>
      <Row y={70} label="small table grows past limit" value="still broadcast?" />
      <Row y={130} label="actual shuffle at join time" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFullFallback({ t }: StepCtx) {
  return (
    <Svg label="measured: no broadcast at all. A real shuffle join, on both sides, instead." h={200}>
      <Row y={70} label="over threshold" value="no broadcast at all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="join strategy now" value="sort-merge, 2 shuffles" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictNonEqui({ t }: StepCtx) {
  return (
    <Svg label="same small table, under threshold, but the join condition is non-equi now. Same mechanism?" h={200}>
      <Row y={70} label="small side, non-equi condition" value="same mechanism?" />
      <Row y={130} label="what actually matches rows" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNestedLoop({ t }: StepCtx) {
  return (
    <Svg label="measured: still no shuffle. But rows are matched pairwise now, not by a hash." h={200}>
      <Row y={70} label="non-equi, still broadcasts" value="zero shuffle still" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="matching mechanism" value="nested loop, not hash" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="under the threshold, broadcast and no shuffle; over it, a full fallback; non-equi changes the matching itself." h={280}>
      <Row y={50} label="under threshold" value="broadcast, zero shuffle" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="over threshold" value="full fallback, 2 shuffles" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="non-equi condition" value="broadcast, nested loop" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
