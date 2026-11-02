import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Writes the design doc and the ADR that make the chosen tier's decision survive the people
// who made it, computed and checked in examples.py's own disclosed design-doc and ADR model.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Six months after the medium tier was chosen, a new engineer asks "why didn't we just
          pick the fast tier," and nobody in the room was there for the original decision. The
          only thing that answers the question is a document, not a person's memory.
        </>
      ),
      duration: 3.8,
      fig: "only a document answers this now, not a memory.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: what survives',
      body: (
        <>
          What would have survived everyone who made this decision leaving the room?
        </>
      ),
      duration: 3.0,
      fig: 'not a meeting. Something written, and dated.',
      predict: {
        options: [
          { label: 'A slide deck from the meeting where the tier was chosen' },
          { label: "A design doc written before the decision, and a dated record of the decision itself, built specifically to survive the people who wrote them leaving", correct: true },
        ],
        explain: (
          <>
            A slide deck summarizes a meeting for the people in it. A design doc and a dated
            decision record are written for someone who wasn't there, which is exactly the reader
            this hook's own new engineer turned out to be.
          </>
        ),
      },
      Visual: S.PredictWhatSurvives,
    },
    {
      title: "Reveal: the design doc's five sections",
      body: (
        <>
          Context, goals and non-goals, alternatives, estimates, risks — a real, documented
          structure, filled in here for the shop's own dashboard request.
        </>
      ),
      duration: 3.8,
      fig: 'five sections. Every one of them filled in.',
      Visual: S.RevealDesignDocSections,
    },
    {
      title: 'Reveal: a non-goal is not a negated goal',
      body: (
        <>
          "ACID compliance" as a non-goal doesn't mean the system must not be ACID compliant. It
          means the team chose, on purpose, not to make it a goal, leaving room to get it anyway
          if it comes free.
        </>
      ),
      duration: 4.0,
      fig: 'not forbidden. Just not promised.',
      takeaway: 'A non-goal is a choice the team made on purpose, not a rule the design is forbidden to break.',
      Visual: S.RevealNonGoalNotNegated,
    },
    {
      title: 'Reveal: what cross-team RFC review adds',
      body: (
        <>
          A design doc read by one team can still miss a consequence another team would catch. An
          RFC adds a time-boxed, widely advertised review period where every affected team has to
          sign off before the decision is final.
        </>
      ),
      duration: 4.0,
      fig: 'every affected team signs off. Not just one.',
      takeaway: "One team's own careful review still misses what only a different team would have caught.",
      Visual: S.RevealRfcReview,
    },
    {
      title: 'Reveal: the Nygard-style ADR',
      body: (
        <>
          Four parts: context, decision, status, consequences — one ADR for the shop's own chosen
          tier, written as a conversation with a future developer who wasn't in the room.
        </>
      ),
      duration: 4.0,
      fig: "four parts. Written for someone who wasn't there.",
      takeaway: 'An ADR is written for the one reader guaranteed to be missing: whoever reads it next.',
      Visual: S.RevealAdr,
    },
    {
      title: 'Reveal: superseded, not deleted',
      body: (
        <>
          When a later decision reverses an earlier one, the old ADR stays in the repository with
          its status changed to "superseded by," not deleted — the record of what the team
          believed, and why, at the time.
        </>
      ),
      duration: 4.0,
      fig: 'the old decision stays. Only its status changes.',
      takeaway: 'Marking a decision superseded preserves the question it answered; deleting it erases that the question was ever asked.',
      Visual: S.RevealSuperseded,
    },
    {
      title: 'Recap',
      body: (
        <>
          A design doc's five sections, a non-goal that's a real choice, what an RFC's review
          adds, a four-part ADR, and the superseded-not-deleted convention.
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
          A team deletes an old ADR after a decision changes, reasoning that the old decision is
          now wrong and shouldn't confuse anyone. What's actually lost by deleting it instead of
          marking it superseded?
        </>
      ),
      duration: 3.4,
      predict: {
        options: [
          { label: 'Nothing; a wrong decision only confuses future readers if it stays on record' },
          { label: "The record that the old decision was reasonable given what was known then — without it, the next person can't tell whether this trade-off was already tried and rejected, or never considered at all", correct: true },
        ],
        explain: (
          <>
            Deleting the old ADR doesn't just remove a wrong answer; it removes the evidence that
            the question was ever asked, which is exactly what the next person hitting the same
            trade-off needs.
          </>
        ),
      },
      fig: 'deleted it. And with it, the evidence it was ever tried.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
