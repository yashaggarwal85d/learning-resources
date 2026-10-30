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
    <Svg label="two nodes, both reporting themselves synchronised by NTP, accept a pair of writes a short moment apart in the correct real-time order — the store keeps the earlier one. Whose write just vanished, and how?" h={200}>
      <Row y={70} label="both nodes" value="report: synchronised" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="later write" value="vanished anyway" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWhichWriteLost({ t }: StepCtx) {
  return (
    <Svg label="is the discarded write always the one from the node with the faster clock, always the write that happened later in real time, or neither?" h={200}>
      <Row y={70} label="faster clock" value="loses, or wins?" />
      <Row y={130} label="later write" value="safe, or gone?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDriftAndNtp({ t }: StepCtx) {
  return (
    <Svg label="a quartz oscillator's continuous drift adds up to real seconds over a day, and NTP's own correction for it is only as accurate as the network path is symmetric" h={200}>
      <Row y={70} label="quartz drift" value="real seconds, daily" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="NTP's own fix" value="only as good as symmetric" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLeapSmear({ t }: StepCtx) {
  return (
    <Svg label="a clock that smears a leap second gradually over a day and a clock that steps it abruptly disagree with each other for that whole day, even though both are behaving exactly as designed" h={200}>
      <Row y={70} label="smeared clock" value="gradual, all day" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stepped clock" value="disagrees, all day" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWallVsMonotonic({ t }: StepCtx) {
  return (
    <Svg label="a wall clock can jump when corrected; a monotonic clock never jumps but means nothing on another machine; and a paused process can hold either reading stale for an unbounded stretch" h={260}>
      <Row y={50} label="wall clock" value="can jump, corrected" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={100} label="monotonic clock" value="never jumps, local only" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={150} label="a paused process" value="holds either, stale" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealBoundedClock({ t }: StepCtx) {
  return (
    <Svg label="a bounded-error clock hands back a range instead of a single instant, so two overlapping ranges honestly say the clock cannot order those two events, rather than silently guessing one" h={200}>
      <Row y={70} label="a point reading" value="a confident guess" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a bounded range" value="an honest don't know" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLabComparison({ t }: StepCtx) {
  return (
    <Svg label="last-write-wins reads the skewed pair and confidently keeps the wrong write with no sign anything went wrong; a bounded-error clock reads the identical pair and honestly flags it as unorderable" h={200}>
      <Row y={70} label="last-write-wins" value="wrong, and silent" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="bounded-error clock" value="flagged, honestly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a crystal drifts continuously with its own error bar on the correction; a leap second is a full day of disagreement, not an instant; no clock orders events across machines; and a bounded clock admits what it doesn't know instead of guessing" h={260}>
      <Row y={50} label="drift" value="continuous, bounded fix" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="a leap second" value="a day of disagreement" o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="neither clock" value="orders across machines" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="a bounded clock" value="admits, doesn't guess" o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a lease is sized to last month's typical measured clock skew between two machines — is that length safe to rely on?" h={220}>
      <Row y={55} label="typical skew" value="measured, last month" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="the lease" value="sized to typical" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the worst skew" value="is what breaks it" valueColor={C.cherryText} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
