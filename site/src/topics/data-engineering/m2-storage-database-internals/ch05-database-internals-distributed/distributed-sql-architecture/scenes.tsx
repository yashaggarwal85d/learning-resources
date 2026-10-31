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
    <Svg label="three mechanisms, already built. One system runs them together." h={200}>
      <Row y={70} label="sharding, consensus, 2PC" value="built separately" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="one real system" value="runs all three" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictNewMechanism({ t }: StepCtx) {
  return (
    <Svg label="a new mechanism, or pieces already covered?" h={200}>
      <Row y={70} label="distributed SQL" value="needs what, exactly?" />
      <Row y={130} label="the pattern" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealComposition({ t }: StepCtx) {
  return (
    <Svg label="two ranges, each committing on its own, then agreeing." h={260}>
      <Row y={50} label="range A" value="its own consensus group" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="range B" value="its own consensus group" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="both together" value="two-phase commit" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealHLC({ t }: StepCtx) {
  return (
    <Svg label="real clock skew, twice. Timestamps still only go up." h={260}>
      <Row y={50} label="physical clock" value="skews backward, twice" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="logical component" value="absorbs the skew" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="HLC timestamps" value="strictly increasing" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealCommitWait({ t }: StepCtx) {
  return (
    <Svg label="a commit waits out its own uncertainty." h={260}>
      <Row y={50} label="T1 commits" value="timestamp assigned" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="commit wait" value="uncertainty window elapses" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="T2 starts after" value="gets a later timestamp" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictOCCTiming({ t }: StepCtx) {
  return (
    <Svg label="two transactions, same row, no locks. When?" h={200}>
      <Row y={70} label="same row" value="no lock taken" />
      <Row y={130} label="conflict surfaces" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOCCMeasured({ t }: StepCtx) {
  return (
    <Svg label="both read, unlocked. First commits; second rejected." h={260}>
      <Row y={50} label="both transactions" value="read the same row" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="first to commit" value="succeeds outright" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the second" value="rejected, only now" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLatencyPrice({ t }: StepCtx) {
  return (
    <Svg label="single-node: no extra trip. Spread across ranges: several." h={260}>
      <Row y={50} label="single-node Postgres" value="zero extra round trips" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="distributed SQL" value="consensus plus 2PC" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="total cost" value="several round trips" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a composition, with a real, measured price." h={260}>
      <Row y={50} label="the Spanner pattern" value="sharding, consensus, 2PC" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="HLC, commit wait" value="buy external consistency" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="none of it" value="is free" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="data fits on one machine. Distributed SQL, or Postgres?" h={200}>
      <Row y={70} label="one machine" value="fits the whole dataset" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the right choice" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
