import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is measured against a real local Apache Spark 4.0.1 session (examples.py):
// a filter→select→filter chain on a four-partition range pipelines into one stage with no
// shuffle Exchange in its plan; grouping the same data by a derived key doubles that to two
// stages and adds a real Exchange; a second, independent groupBy chained after the first adds a
// third stage. Actions use collect(), since count() always adds its own merge stage regardless.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Filter, then select, then filter again. Three operations, chained in order. How many
          stages does the scheduler actually cut this into?
        </>
      ),
      duration: 4.5,
      fig: 'three chained operations. One stage for all three, or three separate ones?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a narrow chain, one stage',
      body: (
        <>
          Measured directly: filter, select and filter again, chained, run as exactly one stage.
          No shuffle happens anywhere in this plan at all.
        </>
      ),
      duration: 4.8,
      fig: 'three operations, one stage, zero Exchange nodes in the plan — pipelined end to end.',
      Visual: S.RevealNarrowOneStage,
    },
    {
      title: 'Predict: the same data, grouped',
      body: (
        <>
          Same source, same four partitions. Instead of filtering, group every row by a derived
          key. Does that still pipeline into one stage, or does something fundamentally change?
        </>
      ),
      duration: 2.8,
      fig: 'the same data, grouped by key instead of filtered. One stage still, or more?',
      predict: {
        options: [
          { label: 'Still one stage — grouping is just another operation on the same rows' },
          { label: 'More than one — a group needs rows from every partition before it can answer', correct: true },
        ],
        explain: (
          <>
            A filter can answer instantly from the one partition in front of it. A group cannot:
            any row, from any partition, might belong to the bucket it's building. It has to wait
            for all of them, and that wait is exactly where a stage boundary gets cut.
          </>
        ),
      },
      Visual: S.PredictGroupBy,
    },
    {
      title: 'Reveal: a wide dependency, two stages',
      body: (
        <>
          Measured: the identical data, grouped instead of filtered, doubles the stage count to
          two, and this time the plan shows a real shuffle Exchange.
        </>
      ),
      duration: 4.8,
      fig: 'narrow chain: one stage. One groupBy alone: two stages, with an Exchange in the plan.',
      takeaway: 'A stage boundary tracks shuffles, never operation count. One more shuffle is always one more stage.',
      Visual: S.RevealWideTwoStages,
    },
    {
      title: 'Reveal: why the cut happens there',
      body: (
        <>
          A filter decides row by row, using only the partition already in front of it. A group
          cannot decide anything until every partition's rows have been redistributed by key —
          that redistribution is the shuffle, and the shuffle is the stage boundary.
        </>
      ),
      duration: 4.8,
      fig: "filter: needs only its own partition. groupBy: needs every partition, first.",
      takeaway: 'A stage boundary is a materialisation point: the shuffle made real, not a theoretical split in the lineage.',
      Visual: S.RevealWhyShuffleCuts,
    },
    {
      title: 'Predict: group, then group again',
      body: (
        <>
          Take that grouped result and group it again, by a different derived key. Does the
          stage count stay at two, since it's the same kind of grouping, or does it grow again?
        </>
      ),
      duration: 2.8,
      fig: 'group the grouped result again. Still two stages, or a third one?',
      predict: {
        options: [
          { label: "Still two — it's the same operation, just run twice on similar data" },
          { label: 'Three — a second independent shuffle cuts a second new boundary', correct: true },
        ],
        explain: (
          <>
            Nothing about the first shuffle's output makes the second group free. It is its own
            wide dependency, needing every partition of the first group's result — a new wait,
            and a new stage boundary, exactly like the first one.
          </>
        ),
      },
      Visual: S.RevealWideTwoStages,
    },
    {
      title: 'Reveal: a second shuffle, a third stage',
      body: (
        <>
          Measured: grouping the already-grouped result by a new key adds exactly one more
          stage. Two shuffles, three stages — every wide dependency cuts its own boundary.
        </>
      ),
      duration: 4.8,
      fig: 'one shuffle: two stages. A second, independent shuffle, chained after it: three stages.',
      takeaway: 'Stage count is never fixed by the job. It is one plus the number of shuffles the plan actually contains.',
      Visual: S.RevealSecondShuffle,
    },
    {
      title: 'Recap',
      body: (
        <>
          Narrow dependencies — filter, select, map — pipeline inside one stage, free. A wide
          dependency — group, join, repartition — cuts a new stage every single time, because
          that cut is the shuffle itself, made real.
        </>
      ),
      duration: 4.8,
      fig: 'narrow: pipelined, same stage. Wide: a new stage, every time, one per shuffle.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
