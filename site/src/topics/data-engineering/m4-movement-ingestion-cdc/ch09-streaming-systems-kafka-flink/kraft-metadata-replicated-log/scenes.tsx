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
    <Svg label="a broker cut off from the controller but not from the old coordination system, still answering with a stale view" h={200}>
      <Row y={70} label="old system" value="still reachable" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="controller" value="unreachable" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="two separate systems collapsing into the one kind of log this chapter keeps reusing" h={200}>
      <Row y={70} label="old shape" value="two systems" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="new shape" value="one log" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictPullPush({}: StepCtx) {
  return (
    <Svg label="every broker needs the current metadata — pushed out by the controller, or pulled in by each broker?" h={200}>
      <Row y={70} label="controller" value="pushes, or waits?" />
      <Row y={130} label="broker" value="pulls, or waits?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFetch({ t }: StepCtx) {
  return (
    <Svg label="a broker's own tracked position in the metadata log, fetching forward from it" h={200}>
      <Row y={70} label="broker's position" value="tracked locally" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="metadata log" value="fetched forward" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFencing({ t }: StepCtx) {
  return (
    <Svg label="a broker's time since its last fetch against the fencing threshold, twice — once under it, once well past it" h={200}>
      <Row y={70} label="under threshold" value="not fenced" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="past threshold" value="fenced" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDisruption({}: StepCtx) {
  return (
    <Svg label="a candidate that can never win, still disrupting the leader every time it reconnects — why?" h={200}>
      <Row y={70} label="candidate" value="can never win" />
      <Row y={130} label="leader" value="disrupted anyway" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPreVote({ t }: StepCtx) {
  return (
    <Svg label="the same rounds of reconnection, twice — epoch bumps and disruptions under a standard vote, against pre-vote" h={200}>
      <Row y={70} label="standard vote" value="disrupts every round" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pre-vote" value="never disrupts" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDynamicQuorum({ t }: StepCtx) {
  return (
    <Svg label="adding and removing controllers without a restart, and a second request rejected while one is still pending" h={200}>
      <Row y={70} label="one at a time" value="accepted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="while pending" value="rejected" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={50} label="fencing" value="past threshold" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="standard vote" value="disrupts every round" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="pre-vote" value="never disrupts" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="voter change" value="one at a time" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one log, a fencing heartbeat, a canvassing vote, and a quorum that changes one member at a time" h={260}>
      <Row y={50} label="metadata" value="one log now" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="heartbeat" value="fences the stale" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="vote" value="canvasses first" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
