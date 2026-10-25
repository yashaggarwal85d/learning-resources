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
    <Svg label="the primary says committed. Is anyone else told yet?" h={200}>
      <Row y={70} label="the primary" value="says committed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the replica" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAsynchronous({ t }: StepCtx) {
  return (
    <Svg label="commit, tell the client, ship it later." h={200}>
      <Row y={70} label="the primary" value="commits, tells the client" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the replica" value="catches up later" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSynchronousCost({ t }: StepCtx) {
  return (
    <Svg label="remove the lost-commit risk. What do you pay?" h={200}>
      <Row y={70} label="no more lost commits" value="that risk is gone" />
      <Row y={130} label="what does it cost" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSynchronousMeasured({ t }: StepCtx) {
  return (
    <Svg label="commit, then wait. Measured locally, against this cluster." h={260}>
      <Row y={50} label="two hundred commits" value="run both ways" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="no wait" value="finishes faster" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="waits for confirmation" value="measurably slower" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealWhatSynchronousRisks({ t }: StepCtx) {
  return (
    <Svg label="the wait holds locks too." h={200}>
      <Row y={70} label="every commit" value="pays the wait" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a slow replica" value="stalls real writes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSemiSynchronous({ t }: StepCtx) {
  return (
    <Svg label="wait for just one reply, with a timeout." h={200}>
      <Row y={70} label="one replica replies" value="good enough" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="goes quiet too long" value="falls back to async" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFailoverPromotion({ t }: StepCtx) {
  return (
    <Svg label="the primary is gone. One command promotes." h={200}>
      <Row y={70} label="the primary fails" value="failover begins" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pg_ctl promote" value="the replica takes over" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="lose a commit, stall a write, or bet with a timer." h={260}>
      <Row y={50} label="asynchronous" value="risks a lost commit" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="synchronous" value="risks a stalled write" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="semi-synchronous" value="a bet, with a timer" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}
