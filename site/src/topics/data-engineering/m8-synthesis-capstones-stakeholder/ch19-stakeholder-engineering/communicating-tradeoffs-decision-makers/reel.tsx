import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Takes topic 1's own three priced tiers and translates the negotiation into the terms a
// decision-maker actually weighs, computed in examples.py's own cost-lever and document model.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two documents recommend the exact same decision, the medium freshness tier, to two
          different audiences. The one-page version gets the budget approved in a five-minute
          meeting. The twelve-page version, sent to the same meeting by mistake, gets the decision
          tabled for two weeks.
        </>
      ),
      duration: 3.8,
      fig: "the facts didn't change. The document did.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: why so different',
      body: (
        <>
          Why did the identical recommendation land so differently in the same room?
        </>
      ),
      duration: 3.0,
      fig: 'not the decision. Something about the document itself.',
      predict: {
        options: [
          { label: 'The twelve-page version must have contained different, more cautious facts' },
          { label: "Not the decision or the facts behind it — the document's own length and shape decided whether the room could act on it in the time it had", correct: true },
        ],
        explain: (
          <>
            Both documents recommended the same tier from the same numbers. A room with five
            minutes can act on a bottom line; a room with five minutes cannot act on twelve pages,
            whatever they say.
          </>
        ),
      },
      Visual: S.PredictWhyDifferent,
    },
    {
      title: 'Reveal: cost in business terms',
      body: (
        <>
          The same three tiers from the last topic, restated in dollars and in the risk of a
          wrong number reaching a plant manager — not the compute, storage and pipeline terms that
          built them.
        </>
      ),
      duration: 3.8,
      fig: 'the terms a decision-maker actually weighs.',
      Visual: S.RevealCostInBusinessTerms,
    },
    {
      title: 'Reveal: the one dominant cost lever',
      body: (
        <>
          Of everything that makes the fast tier expensive, one factor, how often the whole thing
          recomputes, drives nearly all of the gap — named explicitly, not buried in a list of
          five equally weighted factors.
        </>
      ),
      duration: 4.0,
      fig: 'one lever, named. Not a list of five equal factors.',
      takeaway: 'Naming the one lever that drives a cost gap teaches more than listing every factor that merely contributes to it.',
      Visual: S.RevealDominantLever,
    },
    {
      title: 'Reveal: justifying the boring choice',
      body: (
        <>
          The medium tier isn't the fastest option, and that's exactly the argument for
          recommending it, stated and defended in the terms a non-engineer weighs, cost and risk,
          rather than assumed as an engineering instinct nobody has to explain.
        </>
      ),
      duration: 4.0,
      fig: 'not the fastest option. That is the argument for it.',
      takeaway: "A boring choice defended in the room's own terms beats a fast choice nobody outside engineering actually agreed to.",
      Visual: S.RevealBoringChoice,
    },
    {
      title: 'Reveal: bottom-line-up-front vs. the deep dive',
      body: (
        <>
          A real, documented practice: write the conclusion first, in one page, for the room that
          has five minutes, and a separate, much longer document for the review that actually has
          to check the reasoning.
        </>
      ),
      duration: 4.0,
      fig: 'the conclusion first. The reasoning, kept separate.',
      takeaway: 'Writing the conclusion first is not skipping the reasoning; it is deciding which room reads which document.',
      Visual: S.RevealBluf,
    },
    {
      title: 'Reveal: what belongs in each document',
      body: (
        <>
          The one-pager carries the recommendation, the cost, and the one dominant lever. The deep
          dive carries the full tier comparison, every non-goal, and the error-budget math — the
          same decision, two documents, neither lying by omission to its own audience.
        </>
      ),
      duration: 4.2,
      fig: 'two documents, one decision. Neither one lying by omission.',
      takeaway: 'A one-pager that drops the dominant lever to save space has stopped being a summary and started being a guess.',
      Visual: S.RevealWhatBelongsWhere,
    },
    {
      title: 'Recap',
      body: (
        <>
          The same decision, restated in business terms, its one dominant lever named, a boring
          choice defended, and a one-page summary paired with the deep dive behind it.
        </>
      ),
      duration: 4.0,
      fig: 'four pieces. None of them optional.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A stakeholder reads only the one-pager's bottom line and approves the fast tier, because
          faster sounds strictly better. What's missing from the one-pager itself that would have
          stopped that?
        </>
      ),
      duration: 3.4,
      predict: {
        options: [
          { label: 'A longer document; the one-pager should have been the twelve-page deep dive instead' },
          { label: "Not more length — the one-pager itself still has to state the recommended tier and name the dominant cost lever, or a reader who stops at the first number approves the wrong one", correct: true },
        ],
        explain: (
          <>
            The fix is not abandoning the one-pager; it's making sure the one-pager itself still
            carries its own recommendation and its own dominant lever, so stopping at the bottom
            line still gives the right answer, not just a fast one.
          </>
        ),
      },
      fig: 'faster sounds better. The one-pager has to say otherwise.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
