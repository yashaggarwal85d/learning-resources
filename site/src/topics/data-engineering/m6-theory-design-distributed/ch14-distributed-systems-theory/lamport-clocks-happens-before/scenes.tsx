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
    <Svg label="three services, each with its own disagreeing clock, must produce one global log that never shows a shipment before the payment that caused it, without using the clocks" h={200}>
      <Row y={70} label="three clocks" value="disagree" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the log" value="must still get it right" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLogOrderMeaning({ t }: StepCtx) {
  return (
    <Svg label="the log places a genuinely independent order before the shipment — does that placement mean the independent order really happened first?" h={200}>
      <Row y={70} label="independent order" value="placed before shipment" />
      <Row y={130} label="does that mean" value="it happened first?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealHappensBefore({ t }: StepCtx) {
  return (
    <Svg label="happens-before: same-service order, a send linked to its matching receipt, and a chain of such steps; anything outside that chain is concurrent" h={200}>
      <Row y={70} label="same service, or a message" value="happens-before" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no such chain, either way" value="concurrent" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealScalarClock({ t }: StepCtx) {
  return (
    <Svg label="a counter incremented between events and bumped past any incoming message timestamp guarantees a cause always gets a smaller number than what it caused" h={200}>
      <Row y={70} label="bump before every event" value="local rule" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="jump past a message's number" value="on receipt" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSkewDoesNotMatter({ t }: StepCtx) {
  return (
    <Svg label="the scalar clock's guarantee holds along the causal chain regardless of injected physical-clock skew, because it never reads a physical clock at all" h={200}>
      <Row y={70} label="physical clocks" value="skewed, injected" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the counters" value="never asked" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTieBreak({ t }: StepCtx) {
  return (
    <Svg label="tied counter values are broken by a fixed ordering of the services themselves, producing one total order that never contradicts the causal chain it extends" h={200}>
      <Row y={70} label="two equal numbers" value="a real tie" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="break it by identity" value="one definite line" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealConverseFails({ t }: StepCtx) {
  return (
    <Svg label="the converse fails: a smaller number never proves a cause, so two independent events still receive some order, with no meaning behind it" h={200}>
      <Row y={70} label="smaller number" value="never proves a cause" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="two strangers" value="ordered anyway" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="happens-before is local order plus message links; a counter respects it regardless of physical clocks; a tie-broken total order extends it usably, but cannot reveal which pairs were concurrent" h={260}>
      <Row y={50} label="happens-before" value="local order, message links" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="the counter" value="respects it, any skew" o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="the total order" value="usable, never backwards" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="concurrency" value="still invisible to it" valueColor={C.cherryText} o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a system reads request B's larger counter value as proof that B depends on A — is that conclusion always safe?" h={200}>
      <Row y={70} label="B's number" value="larger than A's" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="does that prove" value="B depends on A?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
