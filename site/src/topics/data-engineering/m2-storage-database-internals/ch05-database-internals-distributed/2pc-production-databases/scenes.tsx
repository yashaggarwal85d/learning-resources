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
    <Svg label="two databases, one order. Both commit, or neither." h={200}>
      <Row y={70} label="inventory database" value="must agree" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="payments database" value="or neither commits" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPhaseOnePrepare({ t }: StepCtx) {
  return (
    <Svg label="prepare asks a guarantee, not a promise to try." h={200}>
      <Row y={70} label="the coordinator" value="can you commit this?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each participant" value="records, then says yes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPhaseTwoCommit({ t }: StepCtx) {
  return (
    <Svg label="the decision is recorded first, the order comes after." h={200}>
      <Row y={70} label="the coordinator" value="records its decision" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="then, every participant" value="told to commit" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCoordinatorSilent({ t }: StepCtx) {
  return (
    <Svg label="both said yes. Then the coordinator goes silent." h={200}>
      <Row y={70} label="both participants" value="already prepared" />
      <Row y={130} label="what do they do now" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPreparedForReal({ t }: StepCtx) {
  return (
    <Svg label="prepared, invisible, until a different session commits." h={260}>
      <Row y={50} label="one session prepares" value="then disconnects" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a second session" value="sees no change yet" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a third session" value="commits it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealHoldsLocks({ t }: StepCtx) {
  return (
    <Svg label="a prepared transaction still holds its row." h={200}>
      <Row y={70} label="still prepared" value="still holding the row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a second writer" value="waits, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInDoubtNamed({ t }: StepCtx) {
  return (
    <Svg label="locks held, nothing resolved, until someone steps in." h={200}>
      <Row y={70} label="coordinator gone" value="no one resolves it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="left too long" value="can force a shutdown" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealXaInPractice({ t }: StepCtx) {
  return (
    <Svg label="one no vetoes everyone. One yes is a guarantee." h={200}>
      <Row y={70} label="any one negative reply" value="vetoes everyone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="an affirmative reply" value="is a real guarantee" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDistributedSqlConsensus({ t }: StepCtx) {
  return (
    <Svg label="the coordinator is a whole Paxos group now." h={200}>
      <Row y={70} label="a coordinator leader" value="backed by Paxos" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a participant leader" value="backed by Paxos too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ask the guarantee, then spend it. Shrink the gap." h={260}>
      <Row y={50} label="prepare" value="asks a guarantee" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="commit" value="spends it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the gap between" value="is what gets engineered" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="both said yes. The coordinator crashed before commit." h={200}>
      <Row y={70} label="payment, inventory" value="both prepared" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="both databases now" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
