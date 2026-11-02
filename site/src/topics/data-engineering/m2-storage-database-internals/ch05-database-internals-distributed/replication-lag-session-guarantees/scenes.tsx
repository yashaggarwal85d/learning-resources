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
    <Svg label="write an order, read it back. What if the read hits another node?" h={200}>
      <Row y={70} label="write an order" value="then read it back" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="read on another node" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOwnWriteOnLaggingStandby({ t }: StepCtx) {
  return (
    <Svg label="the standby hasn't applied it yet. Does the read see it?" h={200}>
      <Row y={70} label="the standby" value="has not replayed it yet" />
      <Row y={130} label="the client's own read" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealReadYourWritesDefined({ t }: StepCtx) {
  return (
    <Svg label="a process's own write, visible to its own later read." h={200}>
      <Row y={70} label="a process writes" value="then reads again" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the later read" value="must see its own write" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBrokenMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real write, a real read. The row: missing." h={260}>
      <Row y={50} label="standby replay" value="paused" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="primary" value="write committed" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="standby read" value="row missing, measured" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLsnTokenBuilt({ t }: StepCtx) {
  return (
    <Svg label="the commit position, as a token. Polled, not guessed." h={200}>
      <Row y={70} label="commit position" value="captured as a token" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the standby" value="polled past the token" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFixedMeasured({ t }: StepCtx) {
  return (
    <Svg label="same write, same read. Visible once replay passes the token." h={260}>
      <Row y={50} label="standby replay" value="resumed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="replay position" value="passes the token" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="standby read" value="row visible, measured" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictMonotonicViolationNeeds({ t }: StepCtx) {
  return (
    <Svg label="reads never go backward here. What would it take?" h={200}>
      <Row y={70} label="one standby" value="reads never go backward" />
      <Row y={130} label="a real violation needs" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOtherTwoGuarantees({ t }: StepCtx) {
  return (
    <Svg label="reads never go back; effect never precedes cause." h={260}>
      <Row y={50} label="monotonic reads" value="never backward" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="consistent-prefix" value="effect needs its cause" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a real violation" value="needs a second replica" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLagUnderLoadMeasured({ t }: StepCtx) {
  return (
    <Svg label="2,000 writes. write_lag, flush_lag, replay_lag: measured." h={260}>
      <Row y={50} label="2,000 real writes" value="sent to the primary" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="pg_stat_replication" value="write/flush/replay lag" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="every number" value="real, server-measured" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three guarantees, one fix: a token naming the position." h={260}>
      <Row y={50} label="read-your-writes" value="broken, then token-fixed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the other two" value="hold on one replica" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the fix" value="wait for the exact position" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a lagging replica, mid-sale. What does the fix cost?" h={200}>
      <Row y={70} label="dashboard replica" value="running behind, mid-sale" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="token wait, everywhere" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
