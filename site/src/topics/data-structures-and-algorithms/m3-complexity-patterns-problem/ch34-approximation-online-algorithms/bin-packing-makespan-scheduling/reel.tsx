import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the chapter's shared trick (bound your answer against a computable
// lower bound on OPT) applied to two more NP-hard problems (declared, same fallback as
// the chapter's first topic), with a new proof shape: First-Fit Decreasing's asymptotic
// bin-packing ratio (eleven ninths of OPT plus a constant, Dosa) and LPT's absolute
// makespan ratio (four thirds minus one over three m, Graham), contrasted against plain
// list scheduling's own two-minus-one-over-m bound on the identical jobs. A real
// system's source (Apache Spark) is read directly for a related, not identical,
// algorithm. Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "The chapter's first topic bounded two NP-hard problems against a computable lower bound on their own optimum. These two problems are NP-hard too, and the trick returns — but this time the guarantee comes in a new shape entirely: not a flat ratio, not one that grows without end, but a ratio with a fixed extra amount added on top.",
      body: <>Same trick, a new shape: a ratio plus a constant, instead of a ratio alone.</>,
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Bin packing: fit every item into as few fixed-size bins as possible. First-Fit Decreasing's rule is almost the simplest one imaginable — sort every item from largest to smallest, then drop each one into the first bin that still has room, opening a new bin only when nothing fits.",
      body: <>Largest item first, every time. The first bin that still has room, nothing cleverer.</>,
      duration: 4,
      fig: 'FirstFitDecreasing',
      Visual: S.FirstFitDecreasing,
    },
    {
      title: "Dosa proved in 2007 exactly how far this simple rule can drift: the number of bins it uses is never more than eleven ninths of the true optimum, plus six ninths on top. Reproducing the standard tight construction directly — thirty items in four carefully chosen sizes — the rule uses eleven bins where the total volume alone already demands at least nine.",
      body: <>Eleven bins used, against a volume floor of nine. Consistent with the published bound, not a proof that nine is the true optimum.</>,
      duration: 5,
      fig: 'TightFamily',
      Visual: S.TightFamily,
    },
    {
      title: 'Here is a second, smaller instance, small enough to check every possible arrangement completely: eight items, capacity twelve, and First-Fit Decreasing reaches for four bins. Does checking every arrangement confirm that four bins is already the best anyone could do?',
      body: <>Four bins used on this small case. Does checking every arrangement confirm that's already optimal?</>,
      duration: 3.5,
      fig: 'PredictSmallInstance',
      predict: {
        options: [
          { label: 'Yes — four bins is already the true optimum here', correct: false },
          { label: 'No — checking every arrangement finds a three-bin packing instead', correct: true },
          { label: 'No — checking every arrangement needs five bins, worse than the rule' },
          { label: 'No — no packing under six bins exists for these items' },
        ],
        explain: (
          <>
            Checking every possible arrangement finds three bins suffice. First-Fit Decreasing's four bins, while a
            valid answer, is strictly worse than the true optimum on this particular instance.
          </>
        ),
      },
      Visual: S.PredictSmallInstance,
    },
    {
      title: "That volume floor isn't the same as a proved optimum, so here is the proof on this instance: eight items, and brute force proves three bins suffice, where the simple rule reaches for a fourth.",
      body: <>Small enough to check completely: the rule's four bins against a brute-force-proven three.</>,
      duration: 4,
      fig: 'SmallInstanceProved',
      Visual: S.SmallInstanceProved,
    },
    {
      title: 'A second NP-hard problem, declared the same way: makespan scheduling. A fixed number of machines, a set of jobs, each job runs whole on one machine, and the goal is to finish as early as possible — which means minimizing whichever machine finishes last.',
      body: <>However the jobs get spread across the machines, one of them finishes last. That one decides everything.</>,
      duration: 4,
      fig: 'MakespanIntro',
      Visual: S.MakespanIntro,
    },
    {
      title: 'Longest-Processing-Time-first sorts the jobs from longest to shortest before assigning each one to whichever machine currently has the least work. Plain list scheduling does the identical assignment step, but skips the sorting — it takes the jobs in whatever order they already arrive in. Does that one difference, sorted or not, actually change the worst-case guarantee?',
      body: <>Same assignment rule, one difference: does sorting first actually change the worst case?</>,
      duration: 3,
      fig: 'PredictOrderMatters',
      predict: {
        options: [
          { label: 'No — the assignment rule alone decides the worst case either way' },
          { label: 'Yes — sorting first gives a strictly better worst-case guarantee', correct: true },
          { label: 'Yes — but sorting first makes the worst case strictly worse' },
          { label: 'No — order only matters once there are more machines than jobs' },
        ],
        explain: (
          <>
            Sorting first (Longest-Processing-Time) guarantees four thirds minus one over three times the
            machine count. Left unsorted, the identical assignment rule only guarantees two minus one over the
            machine count — a strictly worse bound that gets closer to double the optimum as the machine count
            grows, while the sorted version never does.
          </>
        ),
      },
      Visual: S.PredictOrderMatters,
    },
    {
      title: "Graham's own tight family, reproduced and checked against a true, brute-force-proven optimum at every machine count from two through five: ratios of seven sixths, eleven ninths, five fourths and nineteen fifteenths — each one landing exactly on four thirds minus one over three times the machine count, to the decimal place.",
      body: <>Not approached in some limit — Graham's own family hits the exact bound at every machine count checked.</>,
      duration: 5,
      fig: 'GrahamFamily',
      takeaway: "LPT's bound isn't approached in a limit — Graham's family hits it exactly, every machine count checked.",
      Visual: S.GrahamFamily,
    },
    {
      title: "Now the classic worst case for the unsorted version: enough unit-sized jobs to fill every machine evenly, submitted first, then one large job arriving last and landing on whichever machine happens to be least loaded — which, by then, is every machine equally. The result is a finishing time of nearly double the true optimum, brute-force-verified exactly. Sort those identical jobs first instead, and the same assignment rule lands precisely on the optimum.",
      body: <>Unsorted, the big job lands last on an already-full machine. Sorted first, the same rule lands on the true optimum.</>,
      duration: 5.5,
      fig: 'ListSchedWorstCase',
      takeaway: 'Same machines, same jobs, one difference in order moves the guarantee from nearly double down to four thirds.',
      Visual: S.ListSchedWorstCase,
    },
    {
      title: "Apache Spark's own file-splitting code names its algorithm directly in a comment: Next Fit Decreasing. Read closely, it only ever checks the single most recently opened partition for room — never any earlier one — closing it and starting fresh the moment the next file would overflow it. That is a cheaper relative of First-Fit-Decreasing, not the identical algorithm, and the eleven-ninths guarantee proved for First-Fit does not automatically carry over to it.",
      body: <>Only the newest partition gets checked. Every earlier one is already closed for good.</>,
      duration: 5,
      fig: 'SparkAlgorithm',
      takeaway: "A real system often runs a cheaper relative of a textbook algorithm — name the difference, don't assume it survives.",
      Visual: S.SparkAlgorithm,
    },
    {
      title: "Two more guarantees, two more shapes of the identical trick: an asymptotic ratio with a fixed constant on top for packing, an absolute flat ratio for scheduling, both still measured against a computable lower bound on the optimum neither algorithm ever actually computes. The next topic gives up that proof entirely, on purpose, the first time in this chapter, for a search space too vast and an objective that is only ever an estimate anyway. Local search and metaheuristics, next.",
      body: <>Two different shapes, the identical trick underneath both. Next: giving up the proof on purpose.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
