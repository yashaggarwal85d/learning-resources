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
    <Svg label="a payment request succeeds but its acknowledgement is lost; the client retries believing it failed, and the customer is charged twice" h={200}>
      <Row y={70} label="first request" value="succeeds, ack lost" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="retry" value="charged a second time" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFix({ t }: StepCtx) {
  return (
    <Svg label="is the pipeline's exactly-once guarantee broken here, or does it simply not cover this failure — and what value would make the retry harmless?" h={200}>
      <Row y={70} label="broker covers this?" value="or a different fix?" />
      <Row y={130} label="one value, with the retry" value="makes it harmless?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealE2E({ t }: StepCtx) {
  return (
    <Svg label="a function correct only with the application's own knowledge can be implemented only at the endpoints; a lower layer's reliability is at best a performance optimisation" h={200}>
      <Row y={70} label="needs app knowledge" value="only endpoints can do it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lower layer" value="optimisation, not a fix" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAtLeastOnce({ t }: StepCtx) {
  return (
    <Svg label="on a lossy link, retrying risks a duplicate; not retrying risks losing the message; there is no third option" h={200}>
      <Row y={70} label="retry" value="risks a duplicate" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="don't retry" value="risks losing it" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealShopCharge({ t }: StepCtx) {
  return (
    <Svg label="the identical retry run twice: without a key both requests charge; with the same key on both, the second is recognized as a repeat" h={200}>
      <Row y={70} label="no idempotency key" value="charged twice" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same key, both attempts" value="second is a no-op" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEffect({ t }: StepCtx) {
  return (
    <Svg label="delivery stays at-least-once throughout; applying the message twice now has the same effect as once, which is what exactly-once actually names" h={200}>
      <Row y={70} label="delivery" value="still at-least-once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="twice applied" value="same effect as once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAtomicCommit({ t }: StepCtx) {
  return (
    <Svg label="Kafka transactions commit output and offsets as one atomic unit; Flink's two-phase-commit sink pre-commits at a checkpoint and commits once it succeeds" h={260}>
      <Row y={50} label="Kafka transaction" value="output + offset, atomic" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="Flink's sink" value="pre-commit at checkpoint" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="commits" value="once checkpoint succeeds" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealBoundary({ t }: StepCtx) {
  return (
    <Svg label="a table-format commit is the third atomic-commit route; none of the three reach an effect already outside the pipeline's own transaction" h={200}>
      <Row y={70} label="table commit" value="third atomic route" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="email sent, card charged" value="outside the boundary" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team adds an idempotency key to every write and declares every retry safe everywhere — is that true?" h={200}>
      <Row y={70} label="idempotency key everywhere" value="every retry safe?" />
      <Row y={130} label="email, checked by nothing" value="still fires twice" valueColor={C.cherryText} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="delivery is at-least-once at best; exactly-once is that plus an idempotent write; an atomic commit closes the crash window inside the pipeline, not outside it" h={260}>
      <Row y={50} label="delivery" value="at-least-once, at best" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="exactly-once" value="that, plus idempotence" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="atomic commit" value="closes the window inside" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
