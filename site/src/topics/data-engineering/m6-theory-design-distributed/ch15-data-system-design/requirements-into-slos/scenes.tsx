import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). */
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

/** One chip of the requirements ledger: a short question, landing then settling into its answer. */
function Chip({ y, question, answer, t, at }: { y: number; question: string; answer?: string; t: number; at: number }) {
  const k = easeOut(seg(t, at, at + 0.35));
  const answered = answer ? easeOut(seg(t, at + 0.35, at + 0.65)) : 0;
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={14} f={answered > 0.5 ? C.quiet : C.secondary}>
        {question}
      </T>
      {answer && (
        <T x={575} y={y} s={15} f={C.focus} a="end" w={600} o={answered}>
          {answer}
        </T>
      )}
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the shop's head of marketing wants real-time, accurate revenue on the executive dashboard — what did those two words actually specify?" h={220}>
      <T x={300} y={60} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the ask, quoted
      </T>
      <T x={300} y={110} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.7))}>
        "real-time, accurate revenue on the dashboard"
      </T>
      <Row y={175} label="engineering vs. finance" value="two percent apart" valueColor={C.cherryText} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which one unstated choice made the two teams' figures differ — how fast the number arrived, or what the number counted?" h={200}>
      <Row y={70} label="how fast it arrived" value="a latency question" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what it counted" value="a completeness question" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFiveQuestions({ t }: StepCtx) {
  return (
    <Svg label="five fixed questions turn 'real-time' into one row of the requirements ledger: for whom, measured where, which percentile, which window, what on a miss" h={290}>
      <Chip y={40} question="for whom" answer="the board, live" t={t} at={0} />
      <Chip y={75} question="measured where" answer="the dashboard's own total" t={t} at={0.3} />
      <Chip y={110} question="which percentile" answer="the one number shown" t={t} at={0.6} />
      <Chip y={145} question="which window" answer="fifteen minutes" t={t} at={0.9} />
      <Chip y={180} question="what on a miss" answer="the board loses trust in it" t={t} at={1.2} />
      <Row y={245} label="resolved SLO" value="fifteen minutes, max staleness" valueColor={C.focus} o={easeOut(seg(t, 1.6, 2.1))} />
    </Svg>
  );
}

export function RevealSixDimensions({ t }: StepCtx) {
  const dims: [string, string, boolean][] = [
    ['freshness', 'fifteen minutes', false],
    ['latency', 'renders in two seconds', false],
    ['completeness', 'left silent by the ask', true],
    ['correctness', 'left silent by the ask', true],
    ['availability', 'not needed here', false],
    ['retention', 'not needed here', false],
  ];
  return (
    <Svg label="the six dimensions, ticked for this ask: the two the hook's sentence never specified are exactly where the teams disagreed" h={260}>
      {dims.map(([label, value, hot], i) => (
        <Row key={label} y={30 + i * 38} label={label} value={value} valueColor={hot ? C.cherryText : C.crema} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.4))} />
      ))}
    </Svg>
  );
}

export function RevealFourDefinitions({ t }: StepCtx) {
  const defs: [string, string][] = [
    ['exactly-once effect', 'idempotent writes'],
    ['eventual completeness', 'a correction window'],
    ['bounded error', 'a sampling estimator'],
    ['at-most-once', 'cheapest, wrong for revenue'],
  ];
  return (
    <Svg label="the same ask, run through four different definitions of correct, each a different system with a different one-line cost" h={380}>
      {defs.map(([label, cost], i) => (
        <Row key={label} y={55 + i * 80} label={label} value={cost} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.45))} />
      ))}
    </Svg>
  );
}

export function RevealChosenDefinition({ t }: StepCtx) {
  return (
    <Svg label="the dashboard's own consequence is a board meeting, not a bill — which of the four definitions does that actually select?" h={200}>
      <Row y={70} label="the consequence" value="a board meeting, not a bill" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="selected definition" value="bounded error" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReject({ t }: StepCtx) {
  return (
    <Svg label="a second ask, 'make it reliable', run through the same five questions — none of them resolves, because no indicator was even proposed" h={240}>
      <T x={300} y={40} s={15} f={C.crema} a="middle" serif italic o={easeOut(seg(t, 0, 0.4))}>
        "make it reliable"
      </T>
      <Chip y={90} question="for whom" t={t} at={0.3} />
      <Chip y={120} question="measured where" t={t} at={0.45} />
      <Chip y={150} question="which percentile" t={t} at={0.6} />
      <Chip y={180} question="which window" t={t} at={0.75} />
      <Chip y={210} question="what on a miss" t={t} at={0.9} />
    </Svg>
  );
}

export function Predict2({ t }: StepCtx) {
  return (
    <Svg label="is 'make it reliable' already an SLO, once everyone agrees what 'reliable' means?" h={200}>
      <Row y={70} label="room agrees on the word" value="an SLO yet?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="indicator, target, window" value="still missing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the full ledger for the dashboard ask: five questions resolved, six dimensions valued, correct defined, and the rejected unmeasurable ask beside it" h={260}>
      <Row y={40} label="five questions" value="resolved to one SLO" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={85} label="six dimensions" value="valued or 'not needed'" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={130} label="correct, defined first" value="bounded error, chosen" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={175} label="'make it reliable'" value="rejected, unmeasurable" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new ask: the warehouse must never show a customer someone else's order — which dimension, and which definition of correct, does its consequence force?" h={220}>
      <Row y={60} label="the new ask" value="never another customer's order" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="which dimension" value="correctness" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={170} label="which definition" value="closer to exactly-once" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
