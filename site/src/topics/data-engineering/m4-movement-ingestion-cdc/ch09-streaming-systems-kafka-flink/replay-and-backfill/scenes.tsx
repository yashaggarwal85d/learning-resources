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
    <Svg label="a two-week-old bug, replayed to a new version to diff against the original" h={200}>
      <Row y={70} label="bug found" value="two weeks late" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="replay target" value="new version" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="jump a consumer straight to the first offset at or after a given time" h={200}>
      <Row y={70} label="one record fixed" value="at a time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reset by" value="timestamp" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictScope({}: StepCtx) {
  return (
    <Svg label="replay the whole topic, or just the part that was actually wrong?" h={200}>
      <Row y={70} label="whole topic" value="from the start?" />
      <Row y={130} label="or just" value="what broke?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealScope({ t }: StepCtx) {
  return (
    <Svg label="scoped to one partition, or a bounded time range, not the whole topic" h={200}>
      <Row y={70} label="one partition" value="or time range" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="not" value="whole topic" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSource({ t }: StepCtx) {
  return (
    <Svg label="still in Kafka within tiered storage's retention, otherwise rebuilt from the lakehouse" h={200}>
      <Row y={70} label="aged past" value="hot log" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pulled from" value="tiered storage" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictVersion({}: StepCtx) {
  return (
    <Svg label="a buggy replay overwrites the original metric in place — what's lost?" h={200}>
      <Row y={70} label="replay writes" value="over original" />
      <Row y={130} label="what's left" value="to compare?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOverwrite({ t }: StepCtx) {
  return (
    <Svg label="the original value is simply gone, with nothing left to diff the replay against" h={200}>
      <Row y={70} label="original value" value="overwritten" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="nothing left" value="to diff" valueColor={C.bad} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVersioned({ t }: StepCtx) {
  return (
    <Svg label="a new, separately labeled version, plus a flag that suppresses the side effect" h={200}>
      <Row y={70} label="replay writes" value="new version" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="side effect" value="suppressed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="offset lookup" value="jumped clean" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="overwrite sink" value="lost original" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="versioned sink" value="kept both" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="reset by time, scope the replay, pick the source, keep it safe to repeat" h={260}>
      <Row y={50} label="reset by" value="timestamp" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="scoped replay" value="not whole topic" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="safe replay" value="versioned, gated" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
