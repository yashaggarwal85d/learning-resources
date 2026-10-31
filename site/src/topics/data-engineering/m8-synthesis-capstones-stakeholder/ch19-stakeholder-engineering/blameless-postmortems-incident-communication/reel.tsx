import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Closes the chapter and the course's own technical arc: the shop's own simulated staleness
// incident, written up in the terms this chapter already taught, computed and checked in
// examples.py's own disclosed timeline and post-mortem model.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two companies suffer the identical stale-data incident. One's post-mortem names and
          disciplines the engineer who pushed the bad config, and the same mistake recurs eight
          months later from someone else. The other's post-mortem names the contributing factors
          instead, and the gap in their own deploy process gets closed for good.
        </>
      ),
      duration: 4.0,
      fig: 'the identical incident. Two very different outcomes.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: why one fix held',
      body: (
        <>
          Why did one company's fix hold, while the other's own fix didn't?
        </>
      ),
      duration: 3.0,
      fig: 'not luck. Not how smart either engineer was.',
      predict: {
        options: [
          { label: "The company that disciplined its engineer simply had a stricter process afterward" },
          { label: "Naming a person as the cause closes the investigation at \"don't do that again\"; naming the contributing factors closes it at \"the process let that happen,\" which is the only version that actually prevents a repeat", correct: true },
        ],
        explain: (
          <>
            Disciplining a person answers "who," which the next person at the keyboard can't act
            on. Naming the contributing factors answers "what let this happen," which is the only
            answer that survives the person who hit it leaving.
          </>
        ),
      },
      Visual: S.PredictWhyOneHeld,
    },
    {
      title: 'Reveal: the timeline',
      body: (
        <>
          A real, timestamped timeline for the shop's own simulated incident, the medium tier's
          dashboard going stale for an hour, from first detection to resolution.
        </>
      ),
      duration: 3.8,
      fig: 'every minute, timestamped. From detection to resolution.',
      Visual: S.RevealTimeline,
    },
    {
      title: 'Reveal: impact in data terms',
      body: (
        <>
          Not CPU or error rate. A number of stale rows, and a named list of plant decisions
          actually made on them — the terms the plant-operations stakeholder from topic one can
          actually judge this incident by.
        </>
      ),
      duration: 4.0,
      fig: 'not a server metric. A decision someone actually made.',
      takeaway: "An incident's impact is only real to its stakeholder once it's counted in terms they actually use.",
      Visual: S.RevealImpactInDataTerms,
    },
    {
      title: 'Reveal: contributing factors, not blame',
      body: (
        <>
          A person who expects to be blamed won't tell you what really happened. Looking for the
          conditions that let an incident happen, rather than the person who triggered it, is what
          actually gets the honest version on the record.
        </>
      ),
      duration: 4.2,
      fig: "blame gets silence. Conditions get the truth.",
      takeaway: "A blameless post-mortem isn't kindness; it's the only method that reliably gets the honest version of what happened.",
      Visual: S.RevealContributingFactors,
    },
    {
      title: 'Reveal: tracked, owned action items',
      body: (
        <>
          Every contributing factor gets a specific action item with a specific owner and a date,
          not a vague "we'll be more careful" — the difference between a post-mortem that changes
          something and one that just gets filed away.
        </>
      ),
      duration: 4.0,
      fig: 'one owner, one fix, per factor. Never a vague promise.',
      takeaway: 'A contributing factor with no owned action item attached to it is a finding that will happen again.',
      Visual: S.RevealActionItems,
    },
    {
      title: "Reveal: the live update isn't the post-mortem",
      body: (
        <>
          What gets told to the plant-operations stakeholder while the incident is still live,
          what's broken, what's being done, when to expect an update, is a different document from
          the post-mortem written after. Chapter eleven's own incident-command material covers how
          that live channel actually gets staffed and run.
        </>
      ),
      duration: 4.2,
      fig: 'live, you need an update. Afterward, you need the record.',
      takeaway: "A stakeholder waiting on a live incident needs an update, not a finished analysis the post-mortem provides later.",
      Visual: S.RevealLiveUpdate,
    },
    {
      title: 'Recap',
      body: (
        <>
          A timestamped timeline, impact in data terms, contributing factors instead of blame,
          owned action items, and a live update that isn't the same document as the post-mortem.
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
          A post-mortem names one contributing factor, "the on-call engineer deployed a bad
          config," and closes with one action item: "retrain the engineer." What's actually
          missing?
        </>
      ),
      duration: 3.4,
      predict: {
        options: [
          { label: "Nothing; a bad config really was the cause, so retraining the person who deployed it is the right fix" },
          { label: "A contributing-factors list of exactly one, naming a person's action as the cause, with an action item that blames rather than fixes — the real question, what let a bad config reach production undetected, is never asked", correct: true },
        ],
        explain: (
          <>
            Retraining one engineer doesn't change what let a bad config reach production in the
            first place. The next person who makes the same reasonable-at-the-time mistake will
            hit the exact same undetected gap.
          </>
        ),
      },
      fig: 'one person blamed. The actual gap, never found.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
