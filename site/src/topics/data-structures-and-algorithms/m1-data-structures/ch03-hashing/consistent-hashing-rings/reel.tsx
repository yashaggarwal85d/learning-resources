import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A single machine's table can always grow. Consistent hashing asks the same question one level
// up: when a machine itself joins or leaves, how many keys have to move? Every number is in
// examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A single machine's table can always grow. Consistent hashing asks the same question one level up: when a machine itself joins or leaves, how many keys have to move?",
      body: (
        <>
          Last topic&rsquo;s whole question was about one table filling up. This one asks it one level up &mdash; what happens
          when a machine itself joins or leaves.
        </>
      ),
      duration: 3.6,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Hash both keys and machines onto the same ring. A key belongs to the first machine you find walking clockwise from the key's own position.",
      body: (
        <>
          Exactly the same hashing idea as every earlier topic &mdash; just applied to machines instead of slots in one array.
          Both land on the same ring, and a key belongs to whichever machine it meets first going clockwise.
        </>
      ),
      duration: 3.8,
      fig: 'RingPlacement',
      Visual: S.RingPlacement,
    },
    {
      title: 'A new machine joins the ring — how many of the keys actually have to move to it?',
      body: <>A new machine's dot lands on the ring. How many of the ring's keys actually have to move to it?</>,
      duration: 2,
      fig: 'JoinPredict',
      predict: {
        options: [
          { label: 'All of them, the same as a single-machine resize' },
          { label: 'About half of them' },
          { label: "Only the keys between the new machine's position and its clockwise neighbor", correct: true },
          { label: "None, until the ring itself needs to grow" },
        ],
        explain: (
          <>
            Only the short arc of keys between the new machine and its clockwise neighbor ever belonged to that neighbor in
            the first place. Every other key's owning machine never changes.
          </>
        ),
      },
      Visual: S.JoinPredictViz,
    },
    {
      title: 'Only the keys between a joining machine and its clockwise neighbor move — not the whole ring.',
      body: (
        <>
          Last topic, a resize moved every single key. Here, only that one short arc moves. Everyone else, on every other
          machine, stays exactly where they were.
        </>
      ),
      duration: 3.6,
      fig: 'MinimalRemapping',
      takeaway: 'Only the keys between a joining machine and its clockwise neighbor move — not the whole ring.',
      Visual: S.MinimalRemapping,
    },
    {
      title: "One point per machine isn't enough. Pure chance gives some machines a much larger arc of the ring than others.",
      body: (
        <>
          The ring's math is elegant. Here's where it falls apart in practice: hash each machine to exactly one point, and
          chance alone can hand one machine a huge share, and another almost nothing.
        </>
      ),
      duration: 3.6,
      fig: 'ImbalanceProblem',
      Visual: S.ImbalanceProblem,
    },
    {
      title: "What actually fixes one machine's unpredictable share of the ring?",
      body: <>One machine is carrying far more than its fair share. What actually fixes that?</>,
      duration: 2,
      fig: 'VirtualNodesPredict',
      predict: {
        options: [
          { label: 'Give the overloaded machine more memory' },
          { label: 'Hash each machine to many points on the ring instead of just one', correct: true },
          { label: "Pick each machine's ring position by hand instead of hashing it" },
          { label: "Shrink the ring's total range so there's less room to be uneven" },
        ],
        explain: (
          <>
            Hashing one machine to many points spreads its share across many small arcs instead of one big, unpredictable
            one &mdash; many small random shares average out far more evenly than a single big one.
          </>
        ),
      },
      Visual: S.VirtualNodesPredictViz,
    },
    {
      title: "A real production system's own count: two hundred fifty six points per node, under its older random-allocation scheme.",
      body: (
        <>
          Not a made-up number. A real, current, documented system assigned each machine two hundred fifty six points under
          its older allocation scheme, specifically to spread each machine's share evenly.
        </>
      ),
      duration: 3.8,
      fig: 'VirtualNodesReveal',
      takeaway: "Hashing each machine to many points on the ring evens out its share — verified against a real system's count.",
      Visual: S.VirtualNodesReveal,
    },
    {
      title: 'A real extension caps how overloaded any one machine can get, even under an adversarial key distribution.',
      body: (
        <>
          Plain consistent hashing balances well on average. A real, cited paper proves something stronger: a configurable
          cap on the worst machine's load, even if someone is deliberately trying to overload it.
        </>
      ),
      duration: 3.8,
      fig: 'BoundedLoads',
      takeaway: "Consistent hashing with bounded loads caps the worst machine's load at a guaranteed factor over the average, even adversarially.",
      Visual: S.BoundedLoads,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not drawn: a ring join moves a small fraction of the keys a single-machine resize would have moved, and
          many virtual points per machine measurably even out one machine's unpredictable share.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
