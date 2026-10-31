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
    <Svg label="a WAN outage ends, the gateway replays its buffer, and the platform shows some readings twice, a few out of order, and new live data arriving late because the replay saturated the link" h={200}>
      <Row y={70} label="replay" value="some readings twice" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="live data" value="arrives late" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMissing({ t }: StepCtx) {
  return (
    <Svg label="the buffer held every reading through the outage — what was missing from the replay, and what should have limited its speed?" h={200}>
      <Row y={70} label="buffer" value="held every reading" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="missing?" value="key, then throttle" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDurable({ t }: StepCtx) {
  return (
    <Svg label="every write is fsynced to a plain append-only file before it is acknowledged, a fresh process reading it back after a restart recovers all 50 points a prior one wrote, and a four-hour outage needs 24 times the bytes a ten-minute one does" h={200}>
      <Row y={70} label="fsynced write" value="survives a restart" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="4-hour outage" value="24x the bytes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSequence({ t }: StepCtx) {
  return (
    <Svg label="sparkplug's own sequence number wraps after 256 messages, far too narrow to dedupe a long replay, so a per-source key wide enough not to wrap recovers every real point exactly once, flags the one gap where a point never arrived, and fixes a reordering" h={200}>
      <Row y={70} label="sparkplug seq" value="wraps too soon" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="wider key" value="dedupes, flags gap" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCatchup({ t }: StepCtx) {
  return (
    <Svg label="a backlog drains at the replay rate minus the live rate, because live points keep arriving the whole time catch-up runs, and a throttle that leaves live traffic its own share of ingest capacity still drains the backlog in a bounded time" h={200}>
      <Row y={70} label="drain rate" value="replay minus live" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="throttle" value="bounded drain time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDropPolicy({ t }: StepCtx) {
  return (
    <Svg label="dropping the oldest or the newest point by age alone loses some of the buffer's own safety alarms along with everything else, dropping by priority first keeps every alarm, and the buffer's own write never blocks, whichever policy applies on read" h={200}>
      <Row y={70} label="drop by age" value="loses some alarms" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="drop by priority" value="keeps every alarm" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRollup({ t }: StepCtx) {
  return (
    <Svg label="a mergeable rollup records one aggregate per interval instead of every raw point, so the same four-hour outage that needs 72,000 raw points fits in 240 rolled-up records in the same fixed buffer" h={200}>
      <Row y={70} label="raw points" value="72,000" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rolled up" value="240 records" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealClock({ t }: StepCtx) {
  return (
    <Svg label="a device clock that drifted 90 seconds behind the gateway's own shows up as a shifting gap between the two recorded times, and the estimated offset, applied to the whole drifted batch, recovers exactly what the gateway's own clock would have stamped" h={200}>
      <Row y={70} label="drifted clock" value="90s behind" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="offset correction" value="recovers true time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a durable, sized buffer, an idempotent key wide enough to survive its own replay, a throttle sized by Little's law, drop by priority never by backpressure, a rollup that stretches the same buffer further, and a clock correction on reconnect" h={260}>
      <Row y={50} label="buffer, key" value="durable, wide enough" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="throttle" value="Little's law" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="drops" value="by priority" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="clock" value="corrected on reconnect" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the WAN is down for the whole outage — does the plant's own reading loop, independent of the gateway's uplink, keep running the entire time?" h={200}>
      <Row y={70} label="WAN" value="down" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="local readings" value="3,000, on schedule" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
