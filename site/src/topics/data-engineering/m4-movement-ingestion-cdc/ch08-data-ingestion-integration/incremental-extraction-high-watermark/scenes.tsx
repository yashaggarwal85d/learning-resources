import { Bar, C, Svg, T } from '../../../../../reels/kit';
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

/** A transaction bar on a commit-order timeline: begin to commit, left to right. */
function TxBar({ y, from, to, t, start, end, color = C.crema }: { y: number; from: number; to: number; t: number; start: number; end: number; color?: string }) {
  const k = easeOut(seg(t, from, to));
  const x0 = 25 + start * 500;
  const w = (end - start) * 500 * k;
  return <Bar x={x0} y={y} w={w} h={16} full={500} fill={color} />;
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two counts side by side, a small gap between them, no error anywhere in the run log." h={200}>
      <Row y={70} label="source count" value="unchanged" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="warehouse count" value="short, quietly" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function PredictMissKind({ t }: StepCtx) {
  return (
    <Svg label="an updated_at cursor only asks for rows newer than its watermark. What can it never detect?" h={200}>
      <Row y={70} label="updated_at cursor" value="newer rows only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="blind spot" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMechanism({ t }: StepCtx) {
  return (
    <Svg label="transaction_timestamp is fixed at start. A slow transaction's own stamp sits behind the line it commits past." h={220}>
      <TxBar y={60} from={0} to={0.6} t={t} start={0.1} end={0.75} color={C.second} />
      <T x={25} y={50} s={13} f={C.taupe}>slow transaction, begin to commit</T>
      <Bar x={25 + 0.55 * 500} y={90} w={3} h={40} full={500} fill={C.focus} />
      <T x={25 + 0.55 * 500 - 60} y={145} s={12} f={C.focus}>watermark advances here</T>
    </Svg>
  );
}

export function RevealReproduced({ t }: StepCtx) {
  return (
    <Svg label="the real run: nothing found while open, watermark advances anyway, the commit lands behind it." h={220}>
      <Row y={60} label="cursor run, mid-transaction" value="finds nothing" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="transaction commits" value="stamped behind it" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="next strict run" value="never finds it" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealSequenceGaps({ t }: StepCtx) {
  return (
    <Svg label="a sequence value, once handed out, is never given back — even if its own transaction rolls back." h={200}>
      <Row y={70} label="nextval, then rollback" value="value stays spent" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="result" value="gaps, out-of-order commits" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealLookbackMerge({ t }: StepCtx) {
  return (
    <Svg label="a lookback window catches the late row; an idempotent merge, run three times, changes nothing." h={220}>
      <Row y={60} label="lookback re-read" value="catches it" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="merge, run once" value="one row" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="merge, run thrice" value="still one row" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealSizing({ t }: StepCtx) {
  return (
    <Svg label="the lookback margin has to cover the slowest transaction this source ever runs." h={200}>
      <Row y={70} label="margin too short" value="still misses it" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="margin sized right" value="catches it" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealHardDelete({ t }: StepCtx) {
  return (
    <Svg label="a row deleted outright leaves no updated_at behind — nothing for any cursor to find." h={220}>
      <Row y={60} label="source count" value="drops by one" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="cursor's next run" value="reports nothing" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="lookback, any size" value="still nothing" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four miss modes. Lookback plus merge fixes three. One it cannot touch." h={260}>
      <Row y={50} label="miss modes" value="four distinct causes" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the fix" value="lookback, idempotent merge" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="repeat-safe" value="measured, not assumed" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="can't fix" value="a hard delete" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a bulk UPDATE run directly against the database, never touching updated_at at all." h={200}>
      <Row y={70} label="bulk UPDATE" value="changes the row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="cursor catches it?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
