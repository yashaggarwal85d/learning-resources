import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed Monte Carlo WECO simulation, a tool-stratification demo, a Cp/Cpk demo and a
// SQLite inspection/non-conformance/CAPA schema (examples.py). Every number below matches a
// literal figure examples.py computes or cites in a comment (371, 91.75, the rule counts).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a chart that cries wolf, until it's split by tool",
      body: (
        <>
          A coating-thickness chart trips a run rule four times in one week, and the supervisors
          stop believing it. Split by which tool made each reading, the same data turns into two
          machines, each perfectly in control, centred a real distance apart. What did the
          missing tool column cost, and why does a chart that catches more also cry wolf more?
        </>
      ),
      duration: 5.2,
      fig: "a coating-thickness chart trips a run rule four times in a week — split by tool, it's two in-control machines, not one unstable one",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: control limits vs. specification limits',
      body: (
        <>
          A control limit asks whether a process is behaving the way it usually does. A
          specification limit asks whether the part it just made will actually work. These are
          two different questions about the same measurement, answered by two different numbers.
        </>
      ),
      duration: 4.8,
      fig: 'control limits ask whether the process is stable; specification limits ask whether the product will work',
      Visual: S.RevealLimits,
    },
    {
      title: 'Reveal: in control and out of spec, at once',
      body: (
        <>
          Run the real numbers: one coating measurement sits comfortably inside the process's own
          historical band, well within what it usually does. The same measurement sits above the
          customer's own upper limit. The process is stable. The part still doesn't meet spec.
        </>
      ),
      duration: 5.0,
      fig: "one real coating measurement sits inside the process's own control band and outside the customer's spec limit, at the same time",
      takeaway: "A single real measurement sat inside the process's own control limits while sitting outside the specification limits, at once.",
      Visual: S.RevealInSpec,
    },
    {
      title: 'Predict: does adding more zone rules ever cost anything?',
      body: (
        <>
          Western Electric's zone rules catch patterns a lone three-sigma check misses: two of
          the last three points past the second band, four of the last five past the first. Does
          adding rules like these to a chart ever cost anything?
        </>
      ),
      duration: 4.0,
      fig: "Western Electric's zone rules catch patterns a lone three-sigma check misses — does adding rules like these to a chart ever cost anything?",
      predict: {
        options: [
          { label: 'No — more rules just mean more real drift caught, for free' },
          {
            label: 'Yes — a chart sensitive enough to signal on more patterns also signals falsely more often',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. Any rule sensitive enough to catch a real drift sooner is also sensitive enough
            to misfire on an ordinary run of noise sooner. There's no sensitivity gained for free.
          </>
        ),
      },
      Visual: S.PredictRules,
    },
    {
      title: 'Reveal: the measured price, matching NIST',
      body: (
        <>
          Simulate it for real: the three-sigma rule alone gives a false alarm roughly every 371
          points, matching NIST's own stated figure almost exactly. Add Western Electric's zone
          rules, and that gap shortens to about 91.75 points — again matching NIST's own number.
        </>
      ),
      duration: 5.2,
      fig: 'simulated false-alarm gaps: about 371 points for the three-sigma rule alone, about 91.75 once the zone rules are added, matching NIST almost exactly',
      takeaway: "Western Electric's zone rules cut the measured false-alarm gap from about 371 to about 91.75, matching NIST almost exactly.",
      Visual: S.RevealPrice,
    },
    {
      title: "Reveal: the eighth rule's own, separate cost",
      body: (
        <>
          NIST's 91.75 figure turns out to belong to exactly three rules, not every rule on the
          list. Add the eighth zone rule, eight consecutive points on one side, and the same
          simulation's false-alarm gap shortens again, measurably, on top of the first three.
        </>
      ),
      duration: 5.0,
      fig: "NIST's 91.75 belongs to exactly three zone rules; adding the eighth consecutive-points rule shortens the measured false-alarm gap again, on top of that",
      takeaway: 'Adding the eighth zone rule caught more drift but shortened the false-alarm gap again, a real cost, not smoothed away.',
      Visual: S.RevealEighth,
    },
    {
      title: 'Reveal: Cp and Cpk, the centring trap',
      body: (
        <>
          Two synthetic processes, the identical spread. One centred on the middle of the spec
          window; one shifted toward the upper limit. Their Cp numbers land close together. The
          shifted process's Cpk trails its own Cp by a real margin the centred process never shows.
        </>
      ),
      duration: 5.2,
      fig: 'two processes of identical spread: close Cp values, but the off-centre process\'s Cpk trails its own Cp by a real, measured margin',
      takeaway: 'A high Cp with a low Cpk is a centring problem, not a spread problem.',
      Visual: S.RevealCpCpk,
    },
    {
      title: 'Reveal: one chart, split by tool, becomes two',
      body: (
        <>
          Mix two tools' readings into one chart, with no tool column, and the combined series
          trips several run rules. Split the identical data by which tool made it, and each
          tool's own series, on its own, trips far fewer. Nothing about the parts changed.
        </>
      ),
      duration: 5.0,
      fig: 'the mixed series trips several run rules; split by tool, each tool\'s own series trips far fewer — the same measurements, a different grouping',
      takeaway: 'Splitting the same chart by tool turned one out-of-control signal into two honestly in-control processes.',
      Visual: S.RevealStratify,
    },
    {
      title: 'Reveal: non-conformances and CAPAs, keyed to context',
      body: (
        <>
          The out-of-spec inspection creates a non-conformance record, keyed to that inspection.
          A CAPA record, cause, action, owner, due date, references the non-conformance by key,
          and starts unverified. None of this is analyzable without the run's own recipe version,
          tool and shift attached to the inspection in the first place.
        </>
      ),
      duration: 5.4,
      fig: 'an inspection carries its recipe version, tool and shift; a non-conformance keys to the inspection; a CAPA keys to the non-conformance and starts unverified',
      Visual: S.RevealCapa,
    },
    {
      title: 'Recap',
      body: (
        <>
          Control limits and spec limits ask two different questions. The WECO rules' real price,
          matching NIST. The eighth rule's own, separate further cost. Cp and Cpk's centring
          trap. And a chart that becomes two in-control ones the moment it's split by tool.
        </>
      ),
      duration: 5.2,
      fig: 'control vs. spec limits, the measured WECO price matching NIST, the eighth rule\'s own cost, the Cp/Cpk centring trap, and a chart split in two by tool',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A supervisor turns off the chart's extra zone rules, keeping only the lone three-sigma
          check, because the zone rules "cry wolf too often." Does turning them off make the
          three-sigma rule's own signal any less trustworthy than it already was?
        </>
      ),
      duration: 3.6,
      fig: 'a supervisor turns off the extra zone rules, keeping only the three-sigma check — does that make the three-sigma rule itself any less trustworthy?',
      predict: {
        options: [
          { label: 'Yes — fewer rules watching the chart means the remaining one is weaker' },
          {
            label: "No — the three-sigma rule's own false-alarm rate doesn't depend on which other rules sit beside it",
            correct: true,
          },
        ],
        explain: (
          <>
            No. Each rule's false-alarm rate is a property of that rule alone. Turning off the
            zone rules removes their own signals; it changes nothing about the three-sigma rule's.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
