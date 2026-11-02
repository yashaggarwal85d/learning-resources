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
    <Svg label="forty tasks, one unprotected source. it falls over." h={200}>
      <Row y={70} label="tasks" value="forty at once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="source" value="falls over" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPoolCap({ t }: StepCtx) {
  return (
    <Svg label="ten tasks, two slots. never more than two running." h={200}>
      <Row y={70} label="pool slots" value="two" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="running at once" value="never more than two" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPriorityOrder({ t }: StepCtx) {
  return (
    <Svg label="two high priority, eight low. who goes first?" h={200}>
      <Row y={70} label="priorities" value="two high, eight low" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="goes first" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPriorityMeasured({ t }: StepCtx) {
  return (
    <Svg label="both high-priority tasks finish before any low one starts." h={200}>
      <Row y={70} label="high priority" value="runs first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="low priority" value="waits its turn" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealQueueRouting({ t }: StepCtx) {
  return (
    <Svg label="tasks routed by queue name to specific workers." h={200}>
      <Row y={70} label="queue name" value="picks the worker" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="mechanism" value="different from pools" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStarvation({ t }: StepCtx) {
  return (
    <Svg label="high priority keeps arriving. what about the ones waiting?" h={200}>
      <Row y={70} label="high priority" value="keeps arriving" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="low priority" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStarvation({ t }: StepCtx) {
  return (
    <Svg label="the fair mechanism, left unbounded, becomes unfair." h={200}>
      <Row y={70} label="bounded" value="fair ordering" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unbounded" value="starvation" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="pool caps concurrency. priority decides order. multi-team is new." h={260}>
      <Row y={40} label="pool" value="caps concurrency" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="priority weight" value="decides order" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="multi-team" value="experimental" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="same collision, pool in place. does it fall over this time?" h={200}>
      <Row y={70} label="same collision" value="forty tasks again" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="source" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
