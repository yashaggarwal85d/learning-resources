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
    <Svg label="99% over 30 days. Stale for 6 hours." h={200}>
      <Row y={70} label="freshness SLO" value="99% / 30 days" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the source" value="stale, 6 hours" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="5 minutes, budget gone, or never?" h={200}>
      <Row y={70} label="this outage" value="not yet revealed" />
      <Row y={130} label="every night" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSymptomBased({ t }: StepCtx) {
  return (
    <Svg label="the symptom, not the cause." h={200}>
      <Row y={70} label="alert on" value="what readers see" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every page" value="must be actionable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBurnRate({ t }: StepCtx) {
  return (
    <Svg label="burn rate 1. Gone at day 30." h={200}>
      <Row y={70} label="burn rate" value="spend vs. SLO" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rate of 1" value="gone at day 30" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFixedThresholdFailures({ t }: StepCtx) {
  return (
    <Svg label="same detection either way. Won't stop firing." h={260}>
      <Row y={50} label="full outage" value="alerts in 1 hour" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="tiny outage" value="also 1 hour" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="reset time" value="~719 hours" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealMultiWindowFix({ t }: StepCtx) {
  return (
    <Svg label="a short window, a twelfth the length." h={260}>
      <Row y={50} label="long window" value="1 hour" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="short window" value="1/12th" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="reset time" value="~5 minutes" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealThresholdsAndLimit({ t }: StepCtx) {
  return (
    <Svg label="a full outage. Still under threshold." h={260}>
      <Row y={50} label="page threshold" value="2% in 1 hour" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="90% SLO, full outage" value="consumes 1.4%" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="does it page" value="never" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealScheduleAwareFreshness({ t }: StepCtx) {
  return (
    <Svg label="old before its run is normal." h={260}>
      <Row y={50} label="fixed threshold" value="10 false alarms" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="schedule-aware" value="0 false alarms" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the real outage" value="both still catch it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealDedupOwnerRouting({ t }: StepCtx) {
  return (
    <Svg label="one failure. Ten signals. One page." h={200}>
      <Row y={70} label="one upstream break" value="many downstream signals" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="grouped" value="one page, one owner" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealActionableTest({ t }: StepCtx) {
  return (
    <Svg label="one question per candidate." h={200}>
      <Row y={70} label="can someone" value="act right now?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="if not" value="ticket, or nothing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the symptom, two windows, a schedule, one page." h={260}>
      <Row y={50} label="the symptom" value="not every cause" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="two windows" value="a schedule, too" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="one page" value="only if actionable" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="fires on the outage. Fires on an ordinary night." h={200}>
      <Row y={70} label="the real outage" value="caught correctly" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the fix" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
