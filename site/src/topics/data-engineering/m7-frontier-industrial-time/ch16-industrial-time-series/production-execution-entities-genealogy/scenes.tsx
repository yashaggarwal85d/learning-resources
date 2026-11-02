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
    <Svg label="a recall query over a lot's genealogy runs cleanly and returns an answer with no error — what if that answer is simply too small, with nothing in its own output to say so?" h={200}>
      <Row y={70} label="the recall query" value="runs clean, no error" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the answer" value="too small?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealEntities({ t }: StepCtx) {
  return (
    <Svg label="a work order, a run, and the one exact recipe version a run actually points to, never 'the recipe' in general" h={220}>
      <Row y={55} label="work order" value="what was asked" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="run" value="what happened" valueColor={C.second} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="recipe" value="one exact version" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealTwoModels({ t }: StepCtx) {
  return (
    <Svg label="one standard nests the equipment six levels deep; a separate, related standard nests how a batch gets made four levels deep" h={200}>
      <Row y={70} label="equipment model" value="six levels" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="batch model" value="four levels" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLoop({ t }: StepCtx) {
  return (
    <Svg label="a rejected lot's material gets reworked back into an earlier stage, putting a real loop in the data — does a recursive query with no memory of visited lots ever finish on its own?" h={200}>
      <Row y={70} label="reworked material" value="loops back" />
      <Row y={130} label="no memory of visits" value="finishes on its own?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCycleClause({ t }: StepCtx) {
  return (
    <Svg label="the unprotected query, run for real with a hard depth cap, fills the entire cap rather than stopping short of it — exactly what never-converging looks like from the outside" h={220}>
      <Row y={55} label="unprotected, capped" value="fills the whole cap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="never stopped early" value="never converging" valueColor={C.badText} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="cycle protection" value="stops it for real" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealForward({ t }: StepCtx) {
  return (
    <Svg label="the cycle-protected query, run for real from one contaminated raw lot, returns every downstream lot, including the ones reached through the rework loop" h={200}>
      <Row y={70} label="one contaminated lot" value="traced forward" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every downstream lot" value="found, safely" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMissingEdge({ t }: StepCtx) {
  return (
    <Svg label="one real split edge deleted, the identical query run again — a smaller set returned, with two specific lots a recall would now miss, no warning and no error" h={220}>
      <Row y={55} label="all edges present" value="the true set" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="one edge missing" value="a smaller set" valueColor={C.badText} o={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={170} label="two real lots" value="silently dropped" valueColor={C.badText} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one recipe version per run, two standards named separately, an unprotected loop that never stops, and a recall silently short two lots when one edge is missing" h={260}>
      <Row y={50} label="a run" value="one recipe version" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="two standards" value="named separately" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="an unprotected loop" value="never stops" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="one missing edge" value="a silent, smaller recall" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a recall query re-run after someone manually adds a missing edge returns a bigger answer the second time — does the bigger answer mean the first one was merely incomplete but safe?" h={220}>
      <Row y={55} label="first run" value="a smaller answer" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="second run, fixed" value="a bigger answer" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the lots missed first" value="never recalled" valueColor={C.badText} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
