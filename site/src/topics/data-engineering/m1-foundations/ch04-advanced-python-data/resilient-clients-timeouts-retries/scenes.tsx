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
    <Svg label="a pool decides how many connections exist — what happens when one of its calls fails?" h={200}>
      <Row y={70} label="a pool" value="how many connections" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a failed call" value="not yet handled" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTimeout({ t }: StepCtx) {
  return (
    <Svg label="a slow endpoint vs. a fast one, called through the same client timeout — measured directly" h={200}>
      <Row y={70} label="slow endpoint" value="client gives up" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="fast endpoint" value="returns, well under" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeadlinePropagation({ t }: StepCtx) {
  return (
    <Svg label="one shared deadline, handed down three hops — does the last hop still do the work?" h={220}>
      <Row y={55} label="hop one" value="ran, time left" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="hop two" value="ran, less left" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="hop three" value="skipped, deadline gone" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictJitter({ t }: StepCtx) {
  return (
    <Svg label="capped exponential backoff already spreads retries out — does adding randomness actually help more?" h={200}>
      <Row y={70} label="capped backoff" value="same schedule, every client" />
      <Row y={130} label="plus randomness" value="still helps?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealJitter({ t }: StepCtx) {
  return (
    <Svg label="a real client backing off with jitter, and a hundred synchronized clients with and without it" h={220}>
      <Row y={55} label="real retries, jittered" value="succeeds, bounded" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="a hundred, no jitter" value="cluster together" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the same, jittered" value="spread out, measured" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealRetryBudget({ t }: StepCtx) {
  return (
    <Svg label="a fixed number of retry tokens against a server that never recovers — what happens once they run out?" h={200}>
      <Row y={70} label="tokens available" value="client retries" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="tokens exhausted" value="fails fast, stops" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCircuitBreaker({ t }: StepCtx) {
  return (
    <Svg label="the same failing call, before and after the breaker trips open — measured elapsed time" h={200}>
      <Row y={70} label="closed, still failing" value="pays the full timeout" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="open, after it trips" value="fails in microseconds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIdempotency({ t }: StepCtx) {
  return (
    <Svg label="the identical write, sent three times with one key — one server-side effect, or three?" h={200}>
      <Row y={70} label="same key, three sends" value="one real effect" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no key at all" value="a new effect, each time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a measured timeout, a shared deadline, jitter that actually spreads retries, a budget, a breaker, and one real effect" h={260}>
      <Row y={50} label="timeout, deadline" value="measured, shared" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="backoff, jitter" value="clusters, then spreads" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="budget, breaker" value="two different fixes" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="idempotency key" value="one real effect" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a retried payment with no idempotency key and a reset deadline at every hop — what breaks, and why?" h={220}>
      <Row y={55} label="no idempotency key" value="charged twice" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="deadline reset per hop" value="work outlives caller" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the fix" value="shared key, shared deadline" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
