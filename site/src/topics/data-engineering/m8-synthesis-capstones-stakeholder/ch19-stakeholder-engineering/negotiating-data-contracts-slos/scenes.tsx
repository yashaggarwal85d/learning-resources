import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a stakeholder asks for real-time dashboards for all plants; engineering ships exactly that, at a cost that consumes the whole quarter's budget." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        the ask
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        real-time dashboards, all plants
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        delivered exactly as asked
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        the quarter's whole budget, gone
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        fulfilled to the letter. Still the wrong decision.
      </T>
    </Svg>
  );
}

export function PredictWhatWentWrong({ t }: StepCtx) {
  return (
    <Svg label="what went wrong, and what single document would have prevented it?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        what went wrong
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealWhatAContractIs({ t }: StepCtx) {
  return (
    <Svg label="a written set of guarantees a producer makes to a consumer, not a verbal promise either side quietly assumes." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        the producer's own promise
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        written down, upfront
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        not a verbal assumption
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        either side quietly carries
      </T>
    </Svg>
  );
}

export function RevealPricingTiers({ t }: StepCtx) {
  const rows = [
    'fast — expensive',
    'medium — moderate',
    'slow — cheap',
  ];
  return (
    <Svg label="real-time is the top of a curve, not the only option; three priced tiers for the same request." h={220}>
      {rows.map((r, i) => (
        <g key={r} opacity={easeOut(seg(t, 0.05 + i * 0.2, 0.3 + i * 0.2))}>
          <rect x={30} y={20 + i * 65} width={30 + (2 - i) * 70} height={24} fill={C.focus} opacity={0.5} />
          <T x={30} y={62 + i * 65} s={14} f={C.crema}>
            {r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealNonGoal({ t }: StepCtx) {
  return (
    <Svg label="stating what a tier does not promise is as much a part of the agreement as what it does promise." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        the tier's own promise
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        what it guarantees
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        the tier's own non-goal
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        what it plainly does not
      </T>
    </Svg>
  );
}

export function RevealErrorBudget({ t }: StepCtx) {
  return (
    <Svg label="a jointly defined quarterly error budget turns how unreliable can this be from an argument into one agreed number." h={200}>
      <T x={25} y={50} s={14} f={C.latte}>
        jointly defined, one quarter
      </T>
      <T x={25} y={80} s={16} f={C.focus}>
        one agreed number
      </T>
      <T x={25} y={140} s={13} f={C.taupe}>
        removes the politics from how unreliable is allowed
      </T>
    </Svg>
  );
}

export function RevealBreachOwner({ t }: StepCtx) {
  return (
    <Svg label="an error budget only works if spending it is somebody's specific, named responsibility, agreed before the breach happens." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        the error budget
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        spent by a real breach
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        named before it happens
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        not during the incident
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a contract is written guarantees, priced tiers, a stated non-goal, a jointly agreed budget, and a named owner for the day it breaks." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>a contract, written down</T>
        <T x={25} y={62} s={15} f={C.crema}>not a verbal promise either side assumes</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>priced tiers</T>
        <T x={25} y={122} s={15} f={C.crema}>the top of a curve, not the only option</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>the non-goal matters too</T>
        <T x={25} y={182} s={15} f={C.crema}>what a tier doesn't promise</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>a named owner, agreed first</T>
        <T x={25} y={242} s={15} f={C.crema}>not decided during the incident</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a stakeholder picks the fastest tier without reading the non-goals or asking who owns a breach. What's missing?" h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the fast tier, picked on price alone
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        what's actually missing
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        is the negotiation finished
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
