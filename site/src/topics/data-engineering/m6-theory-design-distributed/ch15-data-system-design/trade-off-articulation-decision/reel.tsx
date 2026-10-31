import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The decision-card, ADR-chain and 10x-frame simulations are asserted in examples.py's own
// decision_card(), supersede() and ten_x_frame(). The ADR structure and superseded-not-edited
// rule trace to Nygard's own 2011 post and the ADR GitHub organization's site, quoted verbatim
// in SOURCES.md and checked step by step in FACT-CHECK.md. No literal digits appear below; the
// duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: only one of them is not surprised later',
      body: (
        <>
          Two engineers present the same pipeline. One shows a diagram and says it was built
          this way because the pieces are scalable. The other shows three alternatives, what
          each costs, the one chosen, and exactly what would make the team revisit it. Months
          later, the load grows — and only the second one isn't surprised.
        </>
      ),
      duration: 5.0,
      fig: 'a diagram and an adjective, next to three priced alternatives and a stated trigger',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which fields of a record would have made the surprise predictable?',
      body: (
        <>
          The first engineer already had a diagram. Adding more detail to the same kind of
          artifact wouldn't change what it is. So what's actually missing from it?
        </>
      ),
      duration: 4.4,
      predict: {
        options: [
          { label: 'a more detailed architecture diagram, with every component labeled' },
          {
            label: 'the alternatives considered, their costs, and a stated observation that would reverse the choice',
            correct: true,
          },
        ],
        explain: (
          <>
            A diagram, however detailed, is still a picture of what was built — not a record of
            why it was chosen over anything else. What the second engineer has that the first
            doesn't is a comparison with costs, and a named condition under which the team would
            change its mind.
          </>
        ),
      },
      fig: 'which of these would have made the surprise predictable?',
      Visual: S.Predict1,
    },
    {
      title: "Reveal: three alternatives, including the one you don't like",
      body: (
        <>
          A decision card holds at least three alternatives, each priced in the same units,
          including "do nothing." The one chosen lifts off the card — but the others stay
          visible, because a decision that can't say why it beat the alternatives hasn't been
          tested.
        </>
      ),
      duration: 4.8,
      fig: 'three alternative cards, each priced, one lifting as chosen',
      Visual: S.RevealThreeAlternatives,
    },
    {
      title: "Reveal: a choice with one option isn't a decision",
      body: (
        <>
          Next to the three-alternative card, a single-option "decision" — just a diagram and an
          adjective. Only the card with alternatives can actually say why it won.
        </>
      ),
      duration: 4.4,
      takeaway: "A choice with one option considered is not a decision.",
      fig: "a single-option 'decision' next to a three-alternative card",
      Visual: S.RevealOneOptionNotDecision,
    },
    {
      title: "Reveal: the ADR's five parts",
      body: (
        <>
          The chosen alternative's record unfolds: a short title, context stated as value-neutral
          forces, a decision written in active voice, a status, and consequences — every one of
          them, not just the favorable ones.
        </>
      ),
      duration: 5.0,
      fig: 'the chosen card\'s ADR unfolding into its five labeled parts',
      Visual: S.RevealFiveParts,
    },
    {
      title: "Reveal: what would change our mind is the record's real power",
      body: (
        <>
          Two fields the chapter adds to the standard ADR: the alternatives' costs, stated in
          common units, and a specific, testable observation that would reverse the decision —
          not a vague "if things change," but a number crossing a line.
        </>
      ),
      duration: 4.8,
      takeaway: "A decision record's power is in what would change our mind, not in the decision itself.",
      fig: "the ADR's two extra fields highlighted: costs, and the reversing observation",
      Visual: S.RevealChangeOurMind,
    },
    {
      title: 'Reveal: superseded, not edited',
      body: (
        <>
          A later decision that reverses an earlier one doesn't erase it. The old record stays,
          marked superseded, right next to the new one that replaced it — so a future reader can
          still see what the team used to believe, and why it changed.
        </>
      ),
      duration: 4.6,
      fig: 'an old ADR marked superseded, beside the new one that supersedes it',
      Visual: S.RevealSuperseded,
    },
    {
      title: 'Reveal: the 10× frame finds the next bottleneck first',
      body: (
        <>
          Redraw the same pipeline with every arrow ten times thicker. One box lights up first —
          the one that overflows before anything else does. That's the honest answer to "will
          this scale," and it names what to build next.
        </>
      ),
      duration: 4.6,
      takeaway: 'The 10× frame finds the next bottleneck before the load does.',
      fig: 'the pipeline redrawn with thicker arrows; one box lights up first',
      Visual: S.RevealTenX,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three priced alternatives make a decision real. An ADR's "what would change our mind"
          field is where its real power sits. A reversed decision is superseded, never edited
          away. And the 10× frame finds the next bottleneck before the load ever does.
        </>
      ),
      duration: 4.6,
      fig: 'the decision card, the ADR, the superseded chain, and the 10x frame, side by side',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: an early diagram eats the clock',
      body: (
        <>
          A candidate runs the forty-five-minute session but opens with a detailed diagram
          before stating any requirement. Does that lost time just vanish, or does it show up
          somewhere later in the session?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "the lost time doesn't matter, since the diagram covers requirements implicitly anyway" },
          {
            label: "the lost time shows up later, since every block's budget is fixed and an early overrun has to come from somewhere",
            correct: true,
          },
        ],
        explain: (
          <>
            A diagram isn't the same artifact as a stated, priced requirement — it doesn't
            substitute for the block it skipped. With a fixed total budget, time lost early comes
            directly out of whichever block runs last, which is exactly where candidates feel the
            squeeze.
          </>
        ),
      },
      fig: 'an early diagram eating minutes; the later blocks running short as a direct result',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
