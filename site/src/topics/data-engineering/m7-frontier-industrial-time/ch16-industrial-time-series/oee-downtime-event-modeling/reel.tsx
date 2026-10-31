import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed reconciliation against oee.com's own published worked example, a shift-
// boundary split, a double-count fix, a reason-code rollup, and MTBF/MTTR with a censored tail
// (examples.py). Every number below matches a literal figure examples.py computes or cites.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the same shift, two different OEE numbers',
      body: (
        <>
          A changeover spans a shift boundary. One plant's report assigns the whole thing to the
          shift it started in; another splits it at the boundary. A gateway replay also
          duplicates one downtime interval on top of that. Same shift, same machines, two
          different OEE numbers. Which one is right, and what actually produced the gap?
        </>
      ),
      duration: 5.4,
      fig: 'a changeover crosses a shift boundary and a gateway replay duplicates one interval — the same shift reports two different OEE numbers at two plants',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: OEE as availability times performance times quality',
      body: (
        <>
          Availability, Performance and Quality, multiplied together. Run the exact inputs from a
          published worked example through both the three-factor formula and its simplest
          reduced form, and they land on the identical answer: a real, external check on the
          arithmetic, not just a formula copied down.
        </>
      ),
      duration: 5.2,
      fig: "Availability × Performance × Quality, run against oee.com's own published worked example — both the factored and simplest forms land on the identical OEE figure",
      Visual: S.RevealOeeFormula,
    },
    {
      title: 'Reveal: a machine-state interval table, not stored directly',
      body: (
        <>
          A machine never reports "I was down for twelve minutes." It reports state changes:
          running, then down, then running again. The interval table a report actually reads
          from is derived by pairing up those raw events, the same way an earlier topic turned a
          change stream into sessions.
        </>
      ),
      duration: 4.8,
      fig: 'raw state-change events, paired up into a derived interval table — the interval table is never the thing actually stored',
      Visual: S.RevealIntervalTable,
    },
    {
      title: 'Predict: does a boundary split ever change a number?',
      body: (
        <>
          A changeover starts before a shift boundary and ends after it. Does assigning its
          whole duration to the shift it started in ever give a different number than splitting
          it at the boundary?
        </>
      ),
      duration: 4.0,
      fig: "a changeover crosses a shift boundary — does assigning it whole to one shift ever report a different number than splitting it?",
      predict: {
        options: [
          { label: 'No — the total downtime for the day is the same either way' },
          {
            label: "Yes — each shift's own reported downtime changes, even though the day's total doesn't",
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. The daily total is unchanged, but each shift's own report is exactly what asked
            the question, and that number genuinely differs depending on where the split falls.
          </>
        ),
      },
      Visual: S.PredictBoundary,
    },
    {
      title: 'Reveal: the shift-boundary split, computed for real',
      body: (
        <>
          Run the identical downtime interval through a real split function at the real
          boundary. It comes back in two exact pieces, one for each shift it actually crossed,
          and the two pieces add back up to the original, undivided duration.
        </>
      ),
      duration: 4.6,
      fig: 'the identical downtime interval, split at the real shift boundary, into two exact pieces that add back up to the original duration',
      takeaway: 'The same downtime interval split into two exact, different minute counts, one for each shift it actually crossed.',
      Visual: S.RevealSplit,
    },
    {
      title: 'Reveal: the double-count, and the fix',
      body: (
        <>
          A gateway replay sends one real downtime interval a second time, overlapping the
          original. Sum every recorded interval naively, and the overlap gets counted twice.
          Merge overlapping intervals into one before summing, and the real total comes back.
        </>
      ),
      duration: 5.0,
      fig: "a replayed, overlapping interval inflates the naive sum; merging overlapping intervals before summing recovers the real total",
      takeaway: 'A duplicated interval inflated the naive total; merging overlapping intervals before summing gave back the real one.',
      Visual: S.RevealMerge,
    },
    {
      title: 'Reveal: reason codes roll up; micro-stops hide in Performance',
      body: (
        <>
          A small hierarchy, category then reason then sub-reason, rolls individual stop codes
          up to a total anyone can read in one line. A stop too short for anyone to log a reason
          for doesn't vanish from the model. It counts against Performance instead.
        </>
      ),
      duration: 5.0,
      fig: 'reason codes roll up to category totals; a micro-stop too short to log a reason for still counts, inside Performance rather than Availability',
      Visual: S.RevealReasonCodes,
    },
    {
      title: 'Reveal: MTBF and MTTR, with one censored interval',
      body: (
        <>
          A synthetic run of failures and repairs over a window. The up-time before the first
          failure, and between each pair of failures, counts toward MTBF. The stretch after the
          last observed failure, right up to the window's end, doesn't: no second failure ever
          closed it, so it was never a complete observation.
        </>
      ),
      duration: 5.2,
      fig: "up-times between observed failures count toward MTBF; the stretch after the last failure, unclosed by a second failure, is excluded as censored",
      takeaway: "The stretch after the last observed failure was real time, but counting it would have overstated the machine's own reliability.",
      Visual: S.RevealMtbf,
    },
    {
      title: 'Reveal: the same downtime, two policies, two different Availability numbers',
      body: (
        <>
          The identical raw minutes of changeover and breakdown, classified one way, give one
          Availability figure. Classified the other way, with the changeover counted as
          unplanned instead of planned, they give a different one. Nothing about the machine
          changed between the two numbers.
        </>
      ),
      duration: 5.0,
      fig: 'the identical raw downtime minutes, classified under two different planned/unplanned policies, give two different Availability figures',
      Visual: S.RevealPolicy,
    },
    {
      title: 'Recap',
      body: (
        <>
          OEE reconciled exactly against a published example. A machine-state table derived, not
          stored. A boundary split, a double-count fixed by merging, reason codes rolled up with
          micro-stops inside Performance, MTBF and MTTR with a censored tail, and one policy
          choice that changes the number without changing a single machine.
        </>
      ),
      duration: 5.4,
      fig: "A×P×Q reconciled, a derived interval table, a boundary split, a merged double-count, rolled-up reason codes, MTBF/MTTR with a censored tail, and a policy that changes the number",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A plant manager decides, the day after reviewing this month's numbers, that changeovers
          should count as planned rather than unplanned. Does the plant's own machines or output
          change at all because of that decision?
        </>
      ),
      duration: 3.6,
      fig: "a plant manager reclassifies changeovers as planned, the day after reviewing this month's numbers — does the plant's machines or output change at all?",
      predict: {
        options: [
          { label: 'Yes — reclassifying changeovers changes how the machines actually ran that month' },
          {
            label: "No — nothing about the machines or the output changes; only the reported Availability number does",
            correct: true,
          },
        ],
        explain: (
          <>
            No. Not one machine ran differently. Only the number describing them did, which is
            exactly why the policy itself has to be stated alongside any Availability figure.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
