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
    <Svg label="a leader is partitioned away; the remaining nodes elect a new leader that accepts and completes a write; a client still talking to the old leader reads the register afterward and gets the old value" h={200}>
      <Row y={70} label="new leader" value="write completes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="old leader's read" value="returns the old value" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLinearizable({ t }: StepCtx) {
  return (
    <Svg label="is a read-from-the-leader register linearizable, not linearizable because the read was stale, or linearizable because the system is only eventually consistent?" h={200}>
      <Row y={70} label="one leader" value="linearizable?" />
      <Row y={130} label="or the stale read" value="breaks it?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealInstant({ t }: StepCtx) {
  return (
    <Svg label="each operation appears to take effect at a single instant between its invocation and response, and that instant must respect real time: an earlier response means an earlier point" h={200}>
      <Row y={70} label="one instant" value="inside each operation" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="earlier response" value="earlier point, always" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLocality({ t }: StepCtx) {
  return (
    <Svg label="linearizable objects compose: a system is linearizable if each individual object is, verified independently; and no pending operation is ever forced to block another" h={200}>
      <Row y={70} label="verify each object" value="alone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a pending op" value="never blocks another" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckerWorks({ t }: StepCtx) {
  return (
    <Svg label="a checker searching every candidate ordering for one that obeys the register and respects real time finds a linearization immediately for a correctly ordered history" h={200}>
      <Row y={70} label="search every ordering" value="for a legal one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a correct history" value="finds one, fast" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckerFails({ t }: StepCtx) {
  return (
    <Svg label="the same checker fed the stale-leader history finds no ordering that both obeys the register and respects real time — that absence is the proof the history is not linearizable" h={200}>
      <Row y={70} label="every ordering" value="breaks one rule" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no legal order" value="exists at all" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCost({ t }: StepCtx) {
  return (
    <Svg label="a quorum-confirmed read removes the stale-leader anomaly, but costs a full round trip under synchronized clocks and, once clock uncertainty is real, roughly that uncertainty on every operation, provably" h={200}>
      <Row y={70} label="quorum-confirmed read" value="removes the anomaly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the fix" value="costs a round trip" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="linearizability is a property of a history — instantaneous effect, real-time order, local composability; the stale-leader read has no legal order, the fixed one does, and neither comes free" h={260}>
      <Row y={50} label="a history" value="instant, real time, local" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="stale-leader read" value="no legal order" valueColor={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="quorum read" value="a legal order exists" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="the fix" value="proven, not free" o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a leader that has never yet been deposed in production serves reads with no quorum check — does that history of good luck make its reads linearizable?" h={200}>
      <Row y={70} label="never yet deposed" value="no quorum check" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="does that history" value="prove linearizability?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
