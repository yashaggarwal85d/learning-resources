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
    <Svg label="the pipeline finished. the report was still stale." h={200}>
      <Row y={70} label="pipeline's own dashboard" value="on time, all month" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="customer-facing report" value="stale for days" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDimensions({ t }: StepCtx) {
  return (
    <Svg label="six dimensions. now: numbers, not vibes." h={260}>
      <Row y={40} label="freshness, completeness" value="already taught" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="validity, uniqueness" value="already taught" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="consistency, accuracy" value="now: slis, slos" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function PredictReadPoint({ t }: StepCtx) {
  return (
    <Svg label="where should freshness actually be measured?" h={200}>
      <Row y={70} label="candidate: pipeline finish" value="always on schedule" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real measuring point" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReadPoint({ t }: StepCtx) {
  return (
    <Svg label="measured at the read, not the write." h={200}>
      <Row y={70} label="pipeline's own finish" value="says: on time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="consumer's read point" value="says: stale" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTiers({ t }: StepCtx) {
  return (
    <Svg label="does every table deserve the same target?" h={200}>
      <Row y={70} label="customer-facing table" value="high stakes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="internal exploration table" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTiersBudget({ t }: StepCtx) {
  return (
    <Svg label="tighter target for tier one. the slack is a budget." h={260}>
      <Row y={40} label="tier one" value="tight freshness target" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="tier three" value="looser target" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="the slack" value="an error budget" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealBurnRate({ t }: StepCtx) {
  return (
    <Svg label="short window, high burn rate: page. longer window: ticket." h={200}>
      <Row y={70} label="short window, fast burn" value="page" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="longer window, slow burn" value="ticket" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="read point. tiered target. spend on purpose. alert on burn rate." h={260}>
      <Row y={40} label="measure at" value="the read point" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="target by" value="tier" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="spend the budget" value="on purpose" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="same outage. does the finish-time sli ever notice?" h={200}>
      <Row y={70} label="finish-time sli" value="not yet revealed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="read-point sli" value="catches it" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
