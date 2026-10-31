import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="one engineer shows a diagram and an adjective, the other shows three priced alternatives and a revisit trigger" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        same pipeline, two presentations
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        only one isn't surprised later
      </T>
      <Row y={150} label="engineer one" value="a diagram, 'scalable'" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="engineer two" value="three costs, a trigger" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="six months on" value="load grows" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which fields of a record would have made the surprise predictable?" h={210}>
      <Row y={75} label="a fuller diagram" value="more of the same" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="costs and a trigger" value="a different artifact" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeAlternatives({ t }: StepCtx) {
  return (
    <Svg label="three alternatives, including 'do nothing' — each with its decisive cost stated in the same units" h={210}>
      <Row y={75} label="three cards" value="costs, same units" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="one chosen" value="lifts, stays visible" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOneOptionNotDecision({ t }: StepCtx) {
  return (
    <Svg label="a single-alternative 'decision' next to the three-alternative card — only one can say why it won" h={210}>
      <Row y={75} label="one option" value="can't say why" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="three options" value="says why it won" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFiveParts({ t }: StepCtx) {
  return (
    <Svg label="title, context, decision, status, consequences — the ADR unfolds to the right of the chosen card" h={240}>
      <Row y={55} label="context" value="forces, value-neutral" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="decision" value="active voice" o={easeOut(seg(t, 0.12, 0.4))} />
      <Row y={135} label="status" value="accepted, or superseded" o={easeOut(seg(t, 0.24, 0.5))} />
      <Row y={175} label="consequences" value="all of them, not just good" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.68))} />
      <Row y={215} label="title" value="a short noun phrase" o={easeOut(seg(t, 0.56, 0.85))} />
    </Svg>
  );
}

export function RevealChangeOurMind({ t }: StepCtx) {
  return (
    <Svg label="the chapter's two extra fields: alternatives' costs, and a testable observation that would reverse the choice" h={210}>
      <Row y={75} label="costs, stated" value="in common units" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="what changes our mind" value="a specific number" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSuperseded({ t }: StepCtx) {
  return (
    <Svg label="a later ADR marked 'supersedes ADR 3' — ADR 3 stays, marked superseded, not edited away" h={210}>
      <Row y={75} label="ADR 3" value="kept, marked superseded" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="ADR 4" value="supersedes ADR 3" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTenX({ t }: StepCtx) {
  return (
    <Svg label="the same pipeline redrawn with every arrow ten times thicker — the first box to overflow lights up, named" h={210}>
      <Row y={75} label="every arrow" value="ten times thicker" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="first to overflow" value="lit, named" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three priced alternatives, an ADR with its two extra fields, superseded not edited, the 10x frame finding the next bottleneck" h={290}>
      <Row y={45} label="alternatives" value="at least three, priced" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="ADR" value="decision, change our mind" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="reversed" value="superseded, not edited" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="10x frame" value="finds the bottleneck" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a candidate opens with a diagram before requirements — the clock shows later blocks running short as a result" h={250}>
      <Row y={65} label="an early diagram" value="eats the clock" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the budget" value="fixed, forty-five minutes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="later blocks" value="squeezed, not free" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
