import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: P, NP, the certificate/verifier asymmetry, the self-reduction that turns a
// decision oracle into a witness-finder, the Karp reduction and its direction, one worked
// reduction checked by exhaustion (independent set to vertex cover), the vacuous wrong-direction
// mistake, and Cook-Levin as the one fact with no reduction behind it. Every figure is computed
// or asserted in examples.py: the candidate count and verify cost for independent set on sixty
// vertices, the self-reduction's call count on random graphs, the reduction checked on every
// graph of six vertices or fewer, the vacuous reduction from two-colourability, and the lab
// reduction from three-SAT to independent set checked against brute-force satisfiability.

const reel: Reel = {
  steps: [
    {
      title: "A graph has sixty vertices, and the question is whether any thirty of them can be chosen with no two connected. Hand someone a candidate set of thirty and they confirm or refuse it in a few hundred quick checks. Finding one means searching among more candidate sets than anyone could ever check one at a time.",
      body: <>Checking a candidate is fast. Finding one, nobody knows a fundamentally better way than searching.</>,
      duration: 5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Suppose you are handed a procedure that only answers yes or no to 'does an independent set of size thirty exist here?', nothing else. How many times must you call it to actually produce thirty vertices that form one?",
      body: <>One call to learn a set exists, one per vertex, or a number that grows with the candidate count itself.</>,
      duration: 2.5,
      fig: 'PredictSelfReduction',
      predict: {
        options: [
          { label: 'Exactly one call' },
          { label: 'One call, then one more per vertex', correct: true },
          { label: 'One call per candidate set' },
          { label: 'It cannot be done with only yes or no answers' },
        ],
        explain: (
          <>
            One call confirms a set exists at all. Then, one vertex at a time, delete it and ask
            again: if the answer survives, that vertex was never needed; if it does not, the
            vertex belongs in the witness. One pass over every vertex, plus the first call.
          </>
        ),
      },
      Visual: S.PredictSelfReduction,
    },
    {
      title: "A decision problem answers only yes or no. P is every decision problem some procedure solves in time bounded by a fixed power of the input's length. NP is every decision problem where a yes answer comes with a proof — a certificate — that a separate procedure can check in that same bounded time: a verifier.",
      body: <>P solves quickly. NP only promises that a yes can be checked quickly, once someone hands you the proof.</>,
      duration: 5.5,
      fig: 'PNPCertificateVerifier',
      Visual: S.PNPCertificateVerifier,
    },
    {
      title: "Every problem in P is already in NP, because solving it from scratch is itself a valid proof. Whether that containment runs the other way is the open question behind the field's most famous unanswered prize. The letters themselves name a kind of machine, not the word 'not': nondeterministic polynomial time.",
      body: <>P sits inside NP for a trivial reason. Whether NP sits inside P is the question nobody has answered.</>,
      duration: 5,
      fig: 'ConsequencesOfDefinitions',
      Visual: S.ConsequencesOfDefinitions,
    },
    {
      title: "The same bin-packing question comes in three shapes: decision asks only yes or no, search asks for an actual packing, and optimization asks for the fewest bins possible. The theory is built on the decision form, because yes or no is the simplest answer to compare and to build reductions out of.",
      body: <>Decision, search, optimization: three questions about the same packing, one of them simplest to theorize about.</>,
      duration: 5,
      fig: 'ThreeFlavors',
      Visual: S.ThreeFlavors,
    },
    {
      title: "Walking that self-reduction on a real graph: one call confirms a witness of the target size exists, then each vertex is tried for removal in turn. A vertex whose removal keeps the answer yes gets dropped for good; a vertex whose removal flips the answer to no stays, and belongs in the final set.",
      body: <>Exactly the predicted count, run for real: one call, then one decision per vertex, and a witness falls out.</>,
      duration: 5,
      fig: 'SelfReductionWalkthrough',
      takeaway: 'A yes/no oracle for a problem like this one can be turned into an actual witness-finder for free.',
      Visual: S.SelfReductionWalkthrough,
    },
    {
      title: "A Karp reduction from problem A to problem B is a function, computable quickly, that maps every yes-instance of A to a yes-instance of B and every no-instance to a no-instance. To show B is at least as hard as A, the function has to run from the already-known-hard problem toward the new one, never the other way.",
      body: <>The function runs from a known-hard problem to a new one — reversing that direction proves nothing about hardness.</>,
      duration: 5.5,
      fig: 'KarpReductionDefinition',
      Visual: S.KarpReductionDefinition,
    },
    {
      title: "One reduction, checked completely rather than merely argued: map a graph and a target size to the same graph and the vertex count minus that size. A set is independent exactly when its complement covers every edge, so the map sends every yes-instance to a yes-instance and every no-instance to a no-instance, confirmed on every small graph there is.",
      body: <>Independent set to vertex cover: the same graph, the complement count, checked exhaustively rather than merely argued.</>,
      duration: 5.5,
      fig: 'WorkedReductionISVC',
      Visual: S.WorkedReductionISVC,
    },
    {
      title: "A new problem is reduced the wrong way: instead of reducing a known-hard problem to it, someone reduces the new problem to a known-hard one. What does a reduction built in that direction actually establish about how hard the new problem is?",
      body: <>Everything about the new problem's hardness, nothing at all, or only that it is no harder than the known one.</>,
      duration: 2.5,
      fig: 'PredictWrongDirection',
      predict: {
        options: [
          { label: 'It proves the new problem is just as hard' },
          { label: 'It proves nothing useful either way' },
          { label: 'It shows only that the new problem is no harder than the known one', correct: true },
          { label: 'It is not a valid reduction at all' },
        ],
        explain: (
          <>
            A reduction from X to a known-hard A says a fast algorithm for A would give a fast
            algorithm for X — the wrong direction entirely for a hardness claim. It shows X is no
            harder than A, which is close to useless when A is already believed to be hard.
          </>
        ),
      },
      Visual: S.PredictWrongDirection,
    },
    {
      title: "That mistaken direction is not just unhelpful, it is vacuous: every problem solvable quickly reduces to almost any other problem at all, by solving the easy one first and then outputting one of two fixed, already-decided instances of the target. A reduction built this way carries no information about the target whatsoever.",
      body: <>Any easy problem reduces this way to almost anything — the reduction exists, and it says nothing.</>,
      duration: 5,
      fig: 'WrongDirectionVacuous',
      Visual: S.WrongDirectionVacuous,
    },
    {
      title: "A problem is NP-hard when every problem in NP reduces to it, by a Karp reduction, in the correct direction. A problem that is both NP-hard and itself in NP is NP-complete. Neither label says anything about particular easy instances — both are statements about the worst case, and about a gap nobody has ruled out closing.",
      body: <>NP-hard means at least as hard as everything in NP. NP-complete adds that the problem is itself in NP.</>,
      duration: 5,
      fig: 'NPHardNPComplete',
      takeaway: 'NP-hard and NP-complete are worst-case, conditional statements, never a claim about every instance.',
      Visual: S.NPHardNPComplete,
    },
    {
      title: "One fact in this whole chain has no reduction behind it: circuit satisfiability is NP-hard, a result with no known-hard problem standing behind it to reduce from. Every other NP-complete problem inherits its hardness from a chain of reductions built on that one fact, first assembled into a list of twenty-one such problems the following year.",
      body: <>One problem is proven hard directly. Every other one on the list inherits its hardness from a reduction to it.</>,
      duration: 5.5,
      fig: 'CookLevinProblemList',
      Visual: S.CookLevinProblemList,
    },
    {
      title: "Bin packing is one problem a reduction has actually shown hard. A query planner choosing the order to join many tables faces a search space that grows exponentially as the table count rises, which is exactly the kind of blow-up a planner has to work around rather than search exhaustively.",
      body: <>Bin packing and a growing join-order search space: two shapes of the same exponential wall.</>,
      duration: 5,
      fig: 'HidingInDataSystems',
      Visual: S.HidingInDataSystems,
    },
    {
      title: "This reel built one reduction fully and checked it by exhaustion rather than walking the whole chain of gadgets that makes every classic NP-complete problem hard. What to actually do about a problem shown hard this way — an approximation, a restriction on the input's structure, a search with pruning — is still ahead.",
      body: <>One reduction, built and checked. The full chain of gadgets, and what to do once a problem is hard, are not this reel's job.</>,
      duration: 5,
      fig: 'WhatThisDoesNot',
      takeaway: 'Knowing a problem is hard is the easy half; deciding what to do instead is a separate skill, still ahead.',
      Visual: S.WhatThisDoesNot,
    },
    {
      title: "A reduction transfers hardness in one direction, and the whole subject is knowing which. But every problem so far had numbers in it that were harmless: a vertex count, a clause count. Give a problem real numbers and a new question appears: does 'polynomial' mean fast in the number's value, or only in how many digits it takes to write.",
      body: <>Direction settled. Next: what happens once a problem's numbers are not just counts, but real quantities.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
