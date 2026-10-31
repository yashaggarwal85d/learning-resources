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
    <Svg label="a routine backfill triples a managed pipeline's bill; the row count barely moved." h={200}>
      <Row y={70} label="row count" value="barely moved" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="monthly bill" value="tripled" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="an identical backfill hits a small table and a much larger one. Which costs more under MAR pricing?" h={200}>
      <Row y={70} label="small table" value="every row touched" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="which costs more" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealKeyBilling({ t }: StepCtx) {
  return (
    <Svg label="a key is counted once it's touched this month, no matter how many more times it changes." h={200}>
      <Row y={70} label="key touched once" value="billed" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="touched again, same month" value="no extra charge" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealMarMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a small, fully reprocessed table against a huge, rarely touched one, billed by the identical rule." h={220}>
      <Row y={60} label="small table" value="fully reprocessed" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="large table" value="barely touched" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="smaller table's bill" value="higher" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealDriftModes({ t }: StepCtx) {
  return (
    <Svg label="the identical new column, met four different ways: let it through, reject it, drop the row, drop the value." h={220}>
      <Row y={55} label="evolve" value="let it through" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="freeze" value="reject the batch" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={145} label="discard row" value="drop the row" o={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={190} label="discard value" value="drop the field" o={easeOut(seg(t, 0.45, 0.75))} />
    </Svg>
  );
}

export function RevealDriftMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the identical drifted record met by all four modes in turn." h={220}>
      <Row y={60} label="evolve, freeze" value="opposite extremes" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="discard row, value" value="a smaller sacrifice" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealFailureModeList({ t }: StepCtx) {
  return (
    <Svg label="a dozen named problems this chapter's own topics each solved by hand — a managed tool's real price." h={200}>
      <Row y={70} label="cursors, pagination, limits" value="each solved once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="commit protocols, batch ids" value="each solved once" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealFailureModeMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real count: twelve distinct problems, from parallel reads to raw-layer metadata." h={200}>
      <Row y={70} label="failure modes counted" value="a dozen" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each one" value="its own named fix" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="MAR pricing, the four drift modes, and the dozen failure modes — all feeding one decision." h={260}>
      <Row y={50} label="pricing" value="billed by active key" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="drift" value="four named trade-offs" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="maintenance" value="a dozen solved problems" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="the decision" value="build, or buy" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a regulated, low-volume, sovereignty-constrained source shows up. Build or buy?" h={200}>
      <Row y={70} label="volume" value="low" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="decision" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
