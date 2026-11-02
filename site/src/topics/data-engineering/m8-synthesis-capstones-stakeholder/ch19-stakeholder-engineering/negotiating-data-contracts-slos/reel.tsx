import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Opens Chapter nineteen's own running example: a vague dashboard request turned into a priced,
// owned contract, computed in examples.py's own disclosed cost model.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A plant-operations stakeholder asks for real-time dashboards for all plants.
          Engineering ships exactly that, at genuinely real-time freshness, at a cost that quietly
          consumes the entire quarter's infrastructure budget — fulfilled to the letter, and
          engineering still gets blamed.
        </>
      ),
      duration: 3.6,
      fig: 'fulfilled to the letter. Still the wrong decision.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what went wrong',
      body: (
        <>
          What actually went wrong here, and what single document, written before the build
          started, would have prevented it?
        </>
      ),
      duration: 3.0,
      fig: 'the request was followed exactly. Something else was missing.',
      predict: {
        options: [
          { label: 'Nothing went wrong; "real-time" was delivered exactly as requested' },
          { label: 'Nobody ever priced real-time against the alternatives or wrote down who owns it if it breaks; a data contract with priced tiers would have forced that conversation first', correct: true },
        ],
        explain: (
          <>
            Delivering exactly what was asked is not the same as delivering the right thing. A
            data contract with priced tiers makes the cost of "real-time" visible before the
            build starts, so the stakeholder is choosing a trade-off on purpose instead of
            discovering one by accident.
          </>
        ),
      },
      Visual: S.PredictWhatWentWrong,
    },
    {
      title: 'Reveal: what a data contract actually is',
      body: (
        <>
          An upfront, written set of guarantees a producer makes to a consumer about a dataset's
          shape and freshness — not a verbal promise or an assumption either side quietly
          carries.
        </>
      ),
      duration: 3.6,
      fig: 'written down, upfront — not assumed by either side.',
      Visual: S.RevealWhatAContractIs,
    },
    {
      title: 'Reveal: pricing three tiers on a cost curve',
      body: (
        <>
          Real-time is not one option; it's the top of a curve. The same dashboard request
          becomes three concrete, priced tiers — fast and expensive, medium, slow and cheap —
          each a real choice a consumer can make with eyes open.
        </>
      ),
      duration: 4.0,
      fig: "real-time is the top of a curve, not the only option.",
      takeaway: 'A single freshness number is not a contract; a priced curve the consumer can actually choose from is.',
      Visual: S.RevealPricingTiers,
    },
    {
      title: 'Reveal: a non-goal is part of the contract too',
      body: (
        <>
          Stating plainly what a tier does not promise is as much a part of the agreement as
          what it does promise — the gap a contract that only lists guarantees always leaves
          open.
        </>
      ),
      duration: 3.4,
      fig: "what it doesn't promise, stated as plainly as what it does.",
      takeaway: "A contract that lists only what it guarantees is still missing half of what a consumer needs to agree to.",
      Visual: S.RevealNonGoal,
    },
    {
      title: 'Reveal: the error budget',
      body: (
        <>
          A quarterly error budget, jointly defined by both sides against a stated SLO, turns
          how unreliable this is allowed to be from a political argument into one number
          everyone can check.
        </>
      ),
      duration: 3.8,
      fig: 'one jointly agreed number, instead of an argument every quarter.',
      takeaway: 'An error budget works only because both sides defined it together, before anything broke.',
      Visual: S.RevealErrorBudget,
    },
    {
      title: 'Reveal: who owns a breach',
      body: (
        <>
          An error budget only works if spending it is somebody's specific, named
          responsibility — the contract names an owner for the breach before it happens, not
          during the incident.
        </>
      ),
      duration: 3.8,
      fig: 'a named owner, agreed first — not decided mid-incident.',
      takeaway: "Naming a breach's owner during the incident is too late; the contract has to name one in advance.",
      Visual: S.RevealBreachOwner,
    },
    {
      title: 'Recap',
      body: (
        <>
          A data contract is written guarantees, priced tiers, a stated non-goal, a jointly
          agreed error budget, and a named owner for the day it breaks.
        </>
      ),
      duration: 4.0,
      fig: 'five pieces. None of them optional.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A stakeholder, offered three priced tiers, picks the fastest one without reading the
          non-goals or asking who owns a breach. What's actually missing from this negotiation?
        </>
      ),
      duration: 3.2,
      predict: {
        options: [
          { label: 'Nothing — picking a priced tier is the whole negotiation' },
          { label: "The stakeholder has only agreed to the price, not to the tier's non-goals or its named breach owner, so the negotiation isn't actually finished", correct: true },
        ],
        explain: (
          <>
            Picking a price is not the same as agreeing to a contract. Until the non-goals and
            the breach owner are also agreed, the stakeholder has only priced the request, not
            actually accepted its terms.
          </>
        ),
      },
      fig: 'a price picked. The rest of the contract, still unread.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
