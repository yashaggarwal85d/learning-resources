import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 (local[2]) sessions (examples.py): object-heavy RDD code
// (a groupByKey shuffle over per-row tuples) produces real, nonzero JVM garbage-collection
// time; the identical aggregation over the same data via a DataFrame, routed through
// Tungsten's binary row format, produces zero measured GC time. The object-heavy run's own GC
// time, while real, is less than five percent of that job's total executor run time --
// demonstrating that reading GC against total time, not reacting to any nonzero number alone,
// is what judging a bottleneck actually requires.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The exact same aggregation, built two different ways under the hood. Does the JVM's
          own cleanup notice the difference?
        </>
      ),
      duration: 4.5,
      fig: 'the same aggregation, built two ways. Does the JVM notice the difference?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the baseline -- the everyday-objects run pays real cleanup cost',
      body: (
        <>
          Measured: built from everyday objects, the aggregation genuinely makes the JVM pay a
          real, nonzero cleanup cost.
        </>
      ),
      duration: 4.8,
      fig: 'everyday objects: a real, nonzero cleanup cost.',
      Visual: S.RevealBaselineRealCost,
    },
    {
      title: "Predict: the same work, built from binary rows. Same cleanup cost?",
      body: (
        <>
          Build the identical aggregation from Spark's own compact binary row format instead.
          Does the JVM still pay that same cleanup cost?
        </>
      ),
      duration: 2.8,
      fig: 'the same aggregation, built from compact binary rows. Same cost?',
      predict: {
        options: [
          { label: 'Yes — the same work should cost the JVM the same either way' },
          { label: 'No — the cost drops close to nothing', correct: true },
        ],
        explain: (
          <>
            A binary row format is built to need far fewer separate objects in the first
            place, so there's far less for the JVM to clean up.
          </>
        ),
      },
      Visual: S.PredictBinaryRows,
    },
    {
      title: 'Reveal: zero -- the binary-row run pays no measured cleanup cost',
      body: (
        <>
          Measured: the binary-row version of the identical aggregation pays no measured
          cleanup cost at all — not a smaller number, genuinely zero.
        </>
      ),
      duration: 4.8,
      fig: 'binary rows: zero measured cleanup cost, not just a smaller one.',
      Visual: S.RevealZeroCost,
    },
    {
      title: 'Elaborate: why -- cleanup cost tracks object count',
      body: (
        <>
          Cleanup cost tracks how many separate little objects there are to look through, and
          the binary row format was built specifically to need far fewer of them.
        </>
      ),
      duration: 4.8,
      fig: 'cleanup cost tracks object count; binary rows need far fewer.',
      takeaway: 'Garbage-collection cost tracks the number of separate objects a job creates; a binary row format needs far fewer of them.',
      Visual: S.ElaborateFewerObjects,
    },
    {
      title: 'Predict: that run paid a real cleanup cost. Is cleanup the bottleneck?',
      body: (
        <>
          The everyday-objects run really did make the JVM pay a nonzero cleanup cost. Does
          that mean cleanup is actually what's slowing that job down?
        </>
      ),
      duration: 2.8,
      fig: "a real cleanup cost was paid. Is that the job's actual bottleneck?",
      predict: {
        options: [
          { label: 'Yes — any real, measured cleanup cost is a real bottleneck' },
          { label: "No — it's real, but tiny next to the job's total time", correct: true },
        ],
        explain: (
          <>
            A nonzero number on its own doesn't say much — it only means something once it's
            measured against how long the whole job actually took.
          </>
        ),
      },
      Visual: S.PredictIsItBottleneck,
    },
    {
      title: "Reveal: no -- a tiny sliver of the job's own total time",
      body: (
        <>
          Measured: that cleanup cost, while genuinely real, is a tiny sliver of the job's
          total run time — nowhere close to dominating it.
        </>
      ),
      duration: 4.8,
      fig: "real, but a tiny sliver of the job's own total run time.",
      Visual: S.RevealTinySliver,
    },
    {
      title: 'Elaborate: why -- a nonzero cost only matters next to the total',
      body: (
        <>
          A real, nonzero cleanup cost isn't automatically a problem by itself — it only
          matters once it's compared against how much total time the job spent running.
        </>
      ),
      duration: 5,
      fig: 'nonzero isn\'t automatic trouble; compare it to the total time.',
      takeaway: "A nonzero GC time isn't automatically a bottleneck; judge it against the job's own total run time.",
      Visual: S.ElaborateCompareToTotal,
    },
    {
      title: "Reveal: both runs' own numbers, side by side",
      body: (
        <>
          Measured together: the same work, the same data — one version paying a real cleanup
          cost, the other paying nothing measurable at all.
        </>
      ),
      duration: 5,
      fig: 'same work, same data: one real cleanup cost, one none at all.',
      Visual: S.RevealSideBySide,
    },
    {
      title: 'Recap',
      body: (
        <>
          How a piece of work is built decides how much cleanup it costs the JVM, and a
          nonzero cleanup cost only matters once it's measured against the whole job's own
          time.
        </>
      ),
      duration: 5,
      fig: 'how work is built decides its cost; a nonzero number needs context.',
      takeaway: 'Object-heavy code pays a real JVM cleanup cost that Tungsten binary rows avoid almost entirely for the same work.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
