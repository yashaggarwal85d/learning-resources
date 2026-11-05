import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: merging intervals, the earliest-finish-time greedy proof, minimum rooms by a
// min-heap of end times (and the equivalent +1/-1 sweep), and weighted interval scheduling by
// DP. Every number is in examples.py: ten real bookings, a separate eight-interval trap for
// the fewest-conflicts rule, three rooms, and 29 against 28 for the weighted sting.

const reel: Reel = {
  steps: [
    {
      title: 'Text was a sequence you scanned for a pattern. A booking, a session or a lease is two numbers, and the question "which of these collide" looks quadratic until you sort the endpoints.',
      body: <>Ten bookings want one room, and you may keep only the ones that never overlap.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Consider bookings in some order, keeping each one that is still compatible with the ones already kept. Which rule always keeps the most bookings?',
      body: <>Earliest start, shortest first, fewest conflicts, or earliest finish — one of these always wins.</>,
      duration: 2.5,
      fig: 'PredictBestRule',
      predict: {
        options: [
          { label: 'Earliest start time first' },
          { label: 'Shortest booking first' },
          { label: 'Fewest conflicts first' },
          { label: 'Earliest finish time first', correct: true },
        ],
        explain: (
          <>
            Earliest-start and shortest-first both lose on these ten bookings, and fewest-conflicts loses on a
            smaller, separate set. Only earliest-finish-first is provably safe, by an exchange argument, next.
          </>
        ),
      },
      Visual: S.PredictBestRule,
    },
    {
      title: 'Earliest-start-time-first keeps three of the ten bookings: the long early booking it takes first blocks four shorter ones that would otherwise fit.',
      body: <>Starting first does not mean finishing in time to let anything else through.</>,
      duration: 4,
      fig: 'EarliestStartFails',
      Visual: S.EarliestStartFails,
    },
    {
      title: 'Shortest-booking-first keeps four of the ten: a short booking can still sit exactly where it blocks two longer, more useful ones.',
      body: <>Taking less room does not mean leaving the right room free.</>,
      duration: 4,
      fig: 'ShortestFirstFails',
      Visual: S.ShortestFirstFails,
    },
    {
      title: 'Earliest-finish-time-first keeps five of the ten, the most of any rule tried. A smaller, separate eight-booking set traps a fourth rule, fewest-conflicts-first, at three kept against earliest-finish’s four.',
      body: <>Every other rule can be made to fail by some input. Earliest-finish-first survives both traps.</>,
      duration: 5,
      fig: 'EarliestFinishWinsAndTrap',
      takeaway: 'Earliest finish time is the only rule that survives both traps.',
      Visual: S.EarliestFinishWinsAndTrap,
    },
    {
      title: 'The proof: take any optimal schedule and swap its first booking for the earliest-finishing one. It finishes no later, so nothing after it can newly collide; repeat down the rest by induction and the greedy set is reached without ever losing a booking.',
      body: <>Any optimal set can become the greedy set one swap at a time, each swap never making it worse.</>,
      duration: 4.5,
      fig: 'ExchangeProof',
      Visual: S.ExchangeProof,
    },
    {
      title: 'Merging: sort the intervals by start, then walk them once. Extend the current merged interval when the next one starts before it ends; otherwise start a new one. Everything left of the sweep is already final.',
      body: <>Sort by start, then one pass: extend the open interval, or start a new one.</>,
      duration: 4,
      fig: 'MergeSweep',
      takeaway: 'Everything left of the sweep is already final — that invariant is the whole proof.',
      Visual: S.MergeSweep,
    },
    {
      title: 'Inserting one new interval into an already-merged list finds the first interval ending after the new one starts, absorbs every interval it overlaps, and splices the result: a linear scan costs O(n); finding the place by binary search costs O(log n + r), but the shifting itself is still O(n).',
      body: <>Binary search finds the place faster. The array still has to shift to make room.</>,
      duration: 4.5,
      fig: 'InsertIntoMerged',
      Visual: S.InsertIntoMerged,
    },
    {
      title: 'Apache Flink’s session windows run exactly this merge: every arriving record starts its own window, and windows merge together whenever they sit closer than the configured gap.',
      body: <>A real stream processor, merging windows the same way step six just merged intervals.</>,
      duration: 4,
      fig: 'FlinkSessionWindows',
      Visual: S.FlinkSessionWindows,
    },
    {
      title: 'How many rooms do the ten bookings need at minimum, so that no two bookings in the same room overlap?',
      body: <>Somewhere a moment has the most bookings open at once. That moment sets the answer.</>,
      duration: 2.5,
      fig: 'PredictMinRooms',
      predict: {
        options: [
          { label: 'Two rooms' },
          { label: 'Three rooms', correct: true },
          { label: 'Four rooms' },
          { label: 'Ten rooms, one per booking' },
        ],
        explain: (
          <>
            Three bookings are open at the busiest moment, and no schedule can use fewer rooms than that. The
            heap algorithm, next, always meets this bound exactly.
          </>
        ),
      },
      Visual: S.PredictMinRooms,
    },
    {
      title: 'Sort bookings by start; keep a min-heap of the end times of rooms in use. Reuse the room whose booking has already ended; otherwise open a new one. The heap’s final size, three, equals the depth — the busiest moment’s own booking count — because opening a room only ever happens when every open room is still genuinely busy.',
      body: <>Reuse a free room if one exists; otherwise open a new one. The heap peaks at three.</>,
      duration: 5,
      fig: 'MinHeapRooms',
      takeaway: 'Depth is a hard lower bound on rooms, and the heap algorithm always meets it.',
      Visual: S.MinHeapRooms,
    },
    {
      title: 'The same answer comes from a simpler walk: turn every start into +1 and every end into −1, sort the endpoints, and track the running total’s peak. Same three, reached without a heap at all — a method with a name, coming next.',
      body: <>Sort the endpoints, walk them once, track only the running total. Same peak of three.</>,
      duration: 4,
      fig: 'PlusMinusSweep',
      Visual: S.PlusMinusSweep,
    },
    {
      title: 'Does earliest-finish-time-first still win once every booking carries a weight, not just a slot to fill?',
      body: <>Every rule comparison so far went to earliest-finish. Does that hold once weight, not count, is the goal?</>,
      duration: 2.5,
      fig: 'PredictWeightedSting',
      predict: {
        options: [
          { label: 'Yes, it is still always safe' },
          { label: 'No, a weighted set can beat it', correct: true },
        ],
        explain: (
          <>
            A concrete weighted set beats the greedy set by one unit, 29 against 28. Counting bookings and
            valuing them are different goals, and only a DP table is safe for the second.
          </>
        ),
      },
      Visual: S.PredictWeightedSting,
    },
    {
      title: 'The earliest-finish greedy set is still worth only twenty-eight. The table OPT of j, equal to the larger of OPT of j minus one and the weight of j plus OPT of p of j, fills left to right over the finish-sorted bookings and reaches twenty-nine — a different, larger-value set, with p of j found by binary search.',
      body: <>Twenty-eight from the greedy set. The table reaches twenty-nine with a different set.</>,
      duration: 5,
      fig: 'WeightedTable',
      takeaway: 'Weights break every greedy rule just proved safe; only the DP table is safe once value is the goal.',
      Visual: S.WeightedTable,
    },
    {
      title: 'Every program here sorted the endpoints once and walked them, keeping only what is open right now: a running count, a heap of end times, a table over the sorted order. That is not a trick for intervals. It is a method with a name, and it handles far more than a count: the height of a skyline, the area of a union of rectangles, every crossing among a thousand segments. The method is the sweep line, next.',
      body: <>Merge, greedy choice, heap, table: four passes, one sorted order underneath all of them.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
