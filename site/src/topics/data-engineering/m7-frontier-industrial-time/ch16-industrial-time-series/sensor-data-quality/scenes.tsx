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
    <Svg label="a furnace's temperature reads the exact same value for hours, and the controller, the dashboard, and the SPC chart all agree nothing here looks wrong" h={200}>
      <Row y={70} label="furnace reading" value="exact same value" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every dashboard" value="says stable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFlatline({ t }: StepCtx) {
  return (
    <Svg label="a spike rule looks for a sudden jump and a range rule looks for an impossible value, but only a check on how much a reading moves over a window catches a signal that's stopped moving" h={260}>
      <Row y={50} label="spike rule" value="no jump, no fire" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="range rule" value="plausible, no fire" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="windowed variance" value="catches it" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

export function RevealRangeSpike({ t }: StepCtx) {
  return (
    <Svg label="a different sensor dips below what's physically possible, and a third throws isolated spikes a median-based detector catches without being thrown by its own outlier" h={200}>
      <Row y={70} label="range check" value="below possible" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="MAD spike check" value="robust to itself" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDelete({ t }: StepCtx) {
  return (
    <Svg label="a rule flags the furnace's frozen reading as bad — delete it outright, or keep it labeled in a quarantine table, does the choice matter to whoever investigates later?" h={200}>
      <Row y={70} label="flagged point" value="delete, or keep?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="post-mortem" value="needs which one?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChangePoint({ t }: StepCtx) {
  return (
    <Svg label="a firmware update re-scales a sensor's output so every reading after stays individually plausible, but the median shifts, caught as a change point rather than a spike" h={200}>
      <Row y={70} label="firmware update" value="rescales output" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="change point" value="median shifts" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDedupBackfill({ t }: StepCtx) {
  return (
    <Svg label="a gateway resends readings after an outage, an idempotent key collapses the replay back to one copy, and comparing two timestamps tells a late backfill from a broken clock" h={260}>
      <Row y={50} label="gateway replay" value="resent batch" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="idempotent key" value="collapses to one" valueColor={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="two timestamps" value="backfill vs clock fault" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

export function RevealQuarantine({ t }: StepCtx) {
  return (
    <Svg label="nothing is deleted — every flagged point keeps its place in the original series and also lands in a quarantine table with the rule that fired and a severity" h={200}>
      <Row y={70} label="original series" value="unchanged" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="quarantine table" value="flag + rule fired" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPrecisionCost({ t }: StepCtx) {
  return (
    <Svg label="across the fleet the rules catch almost every planted fault with few false alarms, and running every check costs a small fraction of the time each reading represents" h={200}>
      <Row y={70} label="precision, recall" value="measured" valueColor={C.second} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="check cost" value="keeps up with the plant" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a windowed variance check, a range check, a spike-robust detector, and a change-point check each catching a fault shape no other rule would, a dedup key, a quarantine that never deletes, and a measured cost that keeps up" h={260}>
      <Row y={50} label="four rules" value="four fault shapes" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="dedup key" value="collapses replays" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="quarantine" value="never deletes" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="measured cost" value="keeps up" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="given only that the furnace's reading never moves, which named rule actually catches it — the spike rule, the range rule, or the windowed variance check?" h={200}>
      <Row y={70} label="spike, range rules" value="nothing to flag" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="windowed variance" value="the one that fires" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
