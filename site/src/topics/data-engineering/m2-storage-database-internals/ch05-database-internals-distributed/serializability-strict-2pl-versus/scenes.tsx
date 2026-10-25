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
    <Svg label="same scenario, one isolation level stricter." h={200}>
      <Row y={70} label="doctor one commits" value="no error" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="doctor two commits" value="not this time" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealStrict2PL({ t }: StepCtx) {
  return (
    <Svg label="lock on touch, hold until commit, block the rest." h={200}>
      <Row y={70} label="lock what you touch" value="held until commit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a blocking cycle" value="deadlock, rolled back" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSSIMechanism({ t }: StepCtx) {
  return (
    <Svg label="snapshot isolation, unchanged. One thing watched, concurrently." h={200}>
      <Row y={70} label="reads and writes" value="never block" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="read-write conflicts" value="watched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSameCost({ t }: StepCtx) {
  return (
    <Svg label="same guarantee, both routes. Same cost to get there?" h={200}>
      <Row y={70} label="both routes" value="full serializability" />
      <Row y={130} label="same cost" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDangerousStructure({ t }: StepCtx) {
  return (
    <Svg label="two rw-conflicts, chained through a pivot in the middle." h={200}>
      <Row y={70} label="in reads what pivot writes" value="rw-conflict" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pivot reads what out writes" value="rw-conflict" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCatchesDoctors({ t }: StepCtx) {
  return (
    <Svg label="the exact rerun, measured, under SERIALIZABLE." h={200}>
      <Row y={70} label="doctor one commits" value="succeeds" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="doctor two commits" value="serialization failure" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRetrySucceeds({ t }: StepCtx) {
  return (
    <Svg label="retry, fresh snapshot, the real count." h={200}>
      <Row y={70} label="retry, fresh snapshot" value="count: the real one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the check, rerun" value="stays on call, correctly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThroughputFalsePositives({ t }: StepCtx) {
  return (
    <Svg label="the real cost on each side." h={260}>
      <Row y={50} label="strict locking" value="blocks, can deadlock" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="SSI" value="never blocks" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="SSI, sometimes" value="aborts for nothing" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealAbortRateContention({ t }: StepCtx) {
  return (
    <Svg label="the same contention, scaled. A real, measured rise." h={200}>
      <Row y={70} label="two transactions, one rule" value="about half aborted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="six transactions, one rule" value="most aborted" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one guarantee, two routes, two different bills." h={260}>
      <Row y={50} label="one guarantee" value="full serializability" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="strict locking" value="pays in blocking" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="SSI" value="pays in retries" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="heavy contention, a few hot rows. Which route?" h={200}>
      <Row y={70} label="hot rows, heavy contention" value="two real routes" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the better fit" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
