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
    <Svg label="a comment vanishes on refresh then reappears; on another screen a reply to it appears before the comment itself — three anomalies from one always-available store" h={200}>
      <Row y={70} label="refresh" value="comment missing" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a friend's screen" value="reply before comment" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictModel({ t }: StepCtx) {
  return (
    <Svg label="for an always-available store, which weakest model forbids all three anomalies: sequential consistency, causal consistency, or linearizability?" h={200}>
      <Row y={70} label="always available" value="which weakest model?" />
      <Row y={130} label="forbids all three" value="anomalies?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSequential({ t }: StepCtx) {
  return (
    <Svg label="sequential consistency: one total order, every process's own program order respected inside it, but no requirement that the order track real time" h={200}>
      <Row y={70} label="one total order" value="program order kept" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="real time" value="dropped" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCausal({ t }: StepCtx) {
  return (
    <Svg label="causal consistency: everyone sees the question before either answer, since answering depends on reading the question; the two answers are concurrent and may be seen in either order" h={200}>
      <Row y={70} label="question, then answers" value="everywhere" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the two answers" value="free to swap order" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCeiling({ t }: StepCtx) {
  return (
    <Svg label="real-time causal consistency is proven to be the strongest model obtainable in a system that is always available and one-way convergent — both conditions are load-bearing" h={200}>
      <Row y={70} label="always available" value="one-way convergent" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="causal" value="the proven ceiling" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSessionGuarantees({ t }: StepCtx) {
  return (
    <Svg label="read-your-writes, monotonic reads, monotonic writes, and writes-follow-reads, each defined precisely and each breakable on its own, independently of the other three" h={260}>
      <Row y={50} label="read your writes" value="your next read sees it" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={100} label="monotonic reads" value="never regress" o={easeOut(seg(t, 0.1, 0.45))} />
      <Row y={150} label="monotonic writes" value="land in order" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={200} label="writes follow reads" value="never precede the read" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.65))} />
    </Svg>
  );
}

export function RevealWhatIsNotClaimed({ t }: StepCtx) {
  return (
    <Svg label="the hook's two anomalies map exactly to read-your-writes and writes-follow-reads broken; whether all four guarantees together amount to causal consistency is a claim this topic does not make" h={200}>
      <Row y={70} label="the hook's anomalies" value="two guarantees, broken" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="four guarantees = causal?" value="not claimed here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="sequential consistency drops real time; causal consistency orders only cause and effect and is the proven ceiling under always-available, one-way convergence; four session guarantees, each independently breakable" h={260}>
      <Row y={50} label="sequential" value="order kept, real time gone" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="causal" value="cause and effect, the ceiling" o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="four guarantees" value="each breakable alone" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="where a store sits" value="a provable claim" o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a store guarantees only read-your-writes and monotonic reads to its clients — does that make it causally consistent?" h={200}>
      <Row y={70} label="read your writes" value="plus monotonic reads" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="only" value="causally consistent?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
