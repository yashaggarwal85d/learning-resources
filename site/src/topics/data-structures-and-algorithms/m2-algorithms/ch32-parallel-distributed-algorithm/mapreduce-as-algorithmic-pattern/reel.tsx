import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: map, shuffle and reduce as an algorithm (not a framework), the combiner's
// exact algebraic requirement (associativity and commutativity, derived from a concrete failing
// counter-example), and round complexity in the Massively Parallel Communication model. Every
// number is in examples.py: a word count's shuffle record counts with and without a combiner,
// a broken-mean counter-example and its fix, and a tiny simulated cluster's round/replication
// figures for a chain join against a triangle query.

const reel: Reel = {
  steps: [
    {
      title: 'A word count over a gigabyte of text ships one record per word across the network — hundreds of thousands of records just for the word "the" — though the answer only needs the distinct words. A one-line change collapses that; a different one-line change makes the answer wrong.',
      body: <>Every occurrence crosses the network, though only the distinct words matter.</>,
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Apply that same early-combining trick to a sum rewritten as an average. Does the answer come out too high, too low, or still exactly right?',
      body: <>Still right, too high always, too low always, or wrong in an unpredictable direction.</>,
      duration: 2.5,
      fig: 'PredictCombinedMean',
      predict: {
        options: [
          { label: 'Still exactly right' },
          { label: 'Too high, always' },
          { label: 'Too low, always' },
          { label: 'Wrong, in an unpredictable direction', correct: true },
        ],
        explain: (
          <>
            The mean of several groups' own means is not the mean of everything pooled together — it drifts in
            whichever direction the group sizes happen to push it, not a fixed, discoverable bias.
          </>
        ),
      },
      Visual: S.PredictCombinedMean,
    },
    {
      title: 'Map applies a function to each input record independently, emitting key-value pairs. The shuffle moves every pair to the reduce task that owns its key, by a partition function — the key’s hash, taken modulo the reduce-task count, by default. Reduce is called once per key with every value that landed there.',
      body: <>Map, shuffle, reduce — three phases, one partition function between them.</>,
      duration: 5,
      fig: 'MapShuffleReduce',
      Visual: S.MapShuffleReduce,
    },
    {
      title: 'The map function emits each word plus a count of one; the reduce function sums every count that arrives for the same word. Map and reduce are each embarrassingly parallel — the exchange in between is the one step where every map task talks to every reduce task.',
      body: <>Map and reduce run free; the exchange between them is where every task meets every other.</>,
      duration: 4.5,
      fig: 'WordCountWalkthrough',
      Visual: S.WordCountWalkthrough,
    },
    {
      title: 'Each phase, alone, has a span of one task — the work-span lesson already given. The shuffle is different: it is the step that forces every map task’s output toward every reduce task that might own a piece of it, and that all-to-all exchange is what a MapReduce job actually pays for.',
      body: <>The computation is free; the exchange between the two sides is the real cost.</>,
      duration: 5,
      fig: 'WhyShuffleIsTheCost',
      takeaway: 'The shuffle, not the map or the reduce, is where a MapReduce job actually spends its budget.',
      Visual: S.WhyShuffleIsTheCost,
    },
    {
      title: 'When a reduce function is commutative and associative, it may run early — on one map task’s own output, before the exchange — merging duplicate keys into one record per map task instead of one record per occurrence. A common word, following a Zipf distribution, makes this collapse dramatic.',
      body: <>Merge duplicates before they ever cross the network.</>,
      duration: 4.5,
      fig: 'CombinerIntro',
      Visual: S.CombinerIntro,
    },
    {
      title: 'The same word count, shuffled with and without a combiner: far fewer records cross the network with one, and both runs land on the identical final answer — a combiner changes how much moves, never what the answer is, when the algebra actually holds.',
      body: <>Fewer records cross; the final counts come out identical either way.</>,
      duration: 4.5,
      fig: 'CombinerMeasured',
      Visual: S.CombinerMeasured,
    },
    {
      title: 'A combiner’s output must combine further, in any grouping and in any order, because the framework decides neither how work splits among map tasks nor what order partial results arrive in. That is exactly associativity and commutativity — not a convenience, a requirement.',
      body: <>Any grouping, any order: that demand is the algebra itself, not an extra rule.</>,
      duration: 5,
      fig: 'CombinerAlgebra',
      takeaway: 'A combiner is legal only because the framework already promises neither order nor grouping.',
      Visual: S.CombinerAlgebra,
    },
    {
      title: 'A reduce function that computes the mean of its values is asked to double as a combiner. Combine three groups’ own means, then average those three numbers — is that the same as the mean of every value pooled together?',
      body: <>Always the same, a small fixed gap, a gap that depends on the split, or only when the groups match in size.</>,
      duration: 2.5,
      fig: 'PredictMeanCombiner',
      predict: {
        options: [
          { label: 'Always exactly the same' },
          { label: 'Always different, by a small fixed amount' },
          { label: 'Different, by an amount that depends on how the groups split', correct: true },
          { label: 'The same only when every group is the same size' },
        ],
        explain: (
          <>
            The mean of means equals the true mean only when every group happens to be the same size — otherwise
            the gap depends on exactly how the values are split, which the framework never promises to control.
          </>
        ),
      },
      Visual: S.PredictMeanCombiner,
    },
    {
      title: 'A concrete example settles it: three groups’ own means, averaged, land far from the true pooled mean. The fix combines sum-and-count pairs instead of means, and divides only once, in the final reduce — a combinable representation exists even when the obvious one does not.',
      body: <>Combine sum and count, not the mean itself, and divide only at the very end.</>,
      duration: 5,
      fig: 'BrokenMeanFix',
      Visual: S.BrokenMeanFix,
    },
    {
      title: 'A round is one local computation phase followed by one all-to-all exchange. The Massively Parallel Communication model counts exactly two things: how many rounds a computation takes, and the most data any one server receives in any round — nothing about an actual framework’s engineering enters the cost at all.',
      body: <>Rounds and per-server load: the only two numbers this model counts.</>,
      duration: 5,
      fig: 'MPCModelReveal',
      Visual: S.MPCModelReveal,
    },
    {
      title: 'A two-relation join finishes in one round with no replication, by partitioning on the shared join column. A three-relation join among the same kind of relations needs real replication to finish in that same one round — the query’s own shape, not its size, decides the replication needed.',
      body: <>Two relations need no replication for one round; three relations do.</>,
      duration: 5,
      fig: 'JoinShapesMeasured',
      Visual: S.JoinShapesMeasured,
    },
    {
      title: 'A chain of dependent steps needs a number of rounds that grows with the chain’s own length, under any scheme that only doubles its reach each round — no fixed round count, however many servers help, changes that.',
      body: <>A long enough dependency chain outgrows any fixed round budget.</>,
      duration: 4.5,
      fig: 'TransitiveClosureLimit',
      Visual: S.TransitiveClosureLimit,
    },
    {
      title: 'A reduce-side equi-join is map-with-a-tag, shuffle on the join key, reduce emitting the matching pairs for each key — the same partitioning idea a hash join used on one machine’s memory, now applied across a network. A skewed key sending most of its records to one reducer is the same hot-partition problem, paid for in network time instead of disk time.',
      body: <>The same partitioning idea, moved from one machine’s memory to a whole network.</>,
      duration: 5,
      fig: 'JoinAsShuffle',
      takeaway: 'A shuffle join and a partitioned hash join are the same idea, costed in two different currencies.',
      Visual: S.JoinAsShuffle,
    },
    {
      title: 'A few rounds of independent work finish in a few rounds, however many machines join in — and a problem whose best algorithm takes exponential time stays exponential no matter how many machines divide it. Next: what makes a problem exponential in the first place, and how to recognize one in advance.',
      body: <>Many machines buy rounds, never an escape from exponential work.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
