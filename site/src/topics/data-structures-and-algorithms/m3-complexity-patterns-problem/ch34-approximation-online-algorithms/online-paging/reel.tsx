import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the fourth kind of promise in this chapter, and the first that admits the
// whole input is never in front of the algorithm. The adversary argument that bounds every
// deterministic online paging policy's worst case at a ratio of k; Bélády's offline optimum
// as the unreachable benchmark; LRU as a marking algorithm against FIFO, which is not one;
// and Bélády's own anomaly, computed directly, where more memory makes FIFO worse, not
// better. Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A cache holds four pages. The request stream cycles through five pages, endlessly, and every single request lands on the one page the cache just evicted. Over two thousand such requests, the cache faults on every one of them.',
      body: <>Four cache slots, five pages cycling through, every request landing on the one just evicted.</>,
      duration: 5,
      fig: 'CyclicTrace',
      Visual: S.CyclicTrace,
    },
    {
      title: 'An online algorithm decides with only the past: on a fault, it must choose what to evict right now, with no knowledge of what gets requested next. An offline algorithm, by contrast, sees the entire request stream in advance before deciding anything.',
      body: <>One side decides with only the past. The other sees the whole future first.</>,
      duration: 4.5,
      fig: 'OnlineConstraint',
      Visual: S.OnlineConstraint,
    },
    {
      title: "Here is why no deterministic online policy can ever do better than this: with a cache of k pages, an adversary needs only k plus one distinct pages. It always asks for exactly the one page the policy just evicted — the one page guaranteed not to be sitting in the cache.",
      body: <>An adversary with k plus one pages always asks for the one page just thrown out.</>,
      duration: 5,
      fig: 'AdversaryArgument',
      Visual: S.AdversaryArgument,
    },
    {
      title: 'Every deterministic policy, whatever its rule, faults on every single request of a trace built this way. Before naming what actually changes this picture: could a cleverer deterministic rule dodge this particular trap, or does escaping it take something else entirely?',
      body: <>Stuck faulting every time. Could any cleverer deterministic rule dodge this, or does it take something else?</>,
      duration: 4,
      fig: 'PredictEscape',
      predict: {
        options: [
          { label: 'Yes — a cleverer deterministic eviction rule could still dodge this particular trap' },
          { label: 'No deterministic rule can escape it, because the adversary is built from the rule’s own choices', correct: true },
          { label: 'Yes, but only by using more memory than the adversary assumes' },
          { label: 'No — nothing at all, deterministic or otherwise, can ever do better than this' },
        ],
        explain: (
          <>
            No deterministic rule escapes, because the adversary's whole construction is built from whatever that
            rule just did — it always has an answer ready. What changes the picture is randomization: a policy that
            sometimes decides differently even facing the identical request history gives the adversary nothing
            fixed to target in advance.
          </>
        ),
      },
      Visual: S.PredictEscape,
    },
    {
      title: "Bélády's offline optimum: on a fault, evict whichever cached page's next use lies furthest in the future. It cannot be implemented in any real system, because no real system knows the future — it exists purely as the benchmark no online policy is measured against.",
      body: <>Evict whichever page is needed furthest away. Unimplementable — it exists only as the benchmark.</>,
      duration: 5,
      fig: 'BeladyOptimum',
      Visual: S.BeladyOptimum,
    },
    {
      title: 'Mark a page the moment it is first requested in the current stretch of distinct pages; never evict a marked page before the stretch ends and the marks clear. LRU always obeys this rule. FIFO does not — it can and does evict a page marked only moments ago.',
      body: <>LRU never evicts a marked page in its own stretch. FIFO can, and does.</>,
      duration: 5,
      fig: 'MarkingAlgorithm',
      takeaway: 'LRU is a marking algorithm; FIFO is not — the same worst-case ratio, reached by genuinely different rules.',
      Visual: S.MarkingAlgorithm,
    },
    {
      title: 'One more question before the next measured result: does giving a cache more memory ever make its own fault count go up instead of down?',
      body: <>Can more cache memory ever cause more faults instead of fewer?</>,
      duration: 3.5,
      fig: 'PredictAnomaly',
      predict: {
        options: [
          { label: 'No — more memory can only ever reduce or hold steady the number of faults' },
          { label: 'Yes, for some policies — more memory can genuinely increase fault counts', correct: true },
          { label: 'Yes, but only for the offline optimum, never for an online policy' },
          { label: 'No — fault counts never depend on memory size at all once a trace is fixed' },
        ],
        explain: (
          <>
            Yes, and this is a named, documented phenomenon — Bélády's anomaly. On a specific reference string,
            computed directly, FIFO's own fault count actually rises when its cache grows from three frames to four.
            LRU and the true optimum never do this: both are monotone, provably, on every sequence.
          </>
        ),
      },
      Visual: S.PredictAnomaly,
    },
    {
      title: "On the classic reference string, computed directly: FIFO faults nine times with three frames, and ten times with four — more memory, more faults. LRU faults ten times and then eight; the true optimum faults seven times and then six. Both of those are monotone, exactly as claimed.",
      body: <>FIFO: nine faults, then ten, with more memory. LRU and the optimum only ever go down.</>,
      duration: 5.5,
      fig: 'BeladyAnomaly',
      takeaway: "Bélády's anomaly is real, computed: FIFO's fault count can rise with more memory; LRU and the optimum never do.",
      Visual: S.BeladyAnomaly,
    },
    {
      title: "LRU's proven worst-case ratio of k and its excellent practical behavior do not contradict each other. The ratio is a worst case over every possible adversarial sequence; an ordinary real request trace was never built by an adversary, and sits far below that ceiling in practice.",
      body: <>The worst-case ceiling sits far above where a real trace actually lands.</>,
      duration: 4.5,
      fig: 'ConnectingToPractice',
      takeaway: "A worst-case ratio describes the worst possible input, not the one actually in front of an engineer.",
      Visual: S.ConnectingToPractice,
    },
    {
      title: "A competitive ratio of k is a promise about every possible input, and the best deterministic cache can promise only k — which says a cleverer deterministic policy is not where the next real gain sits. Every guarantee in this chapter has had that same character: true of the worst input, which is rarely the one actually in front of you.",
      body: <>A ratio of k says what a cleverer deterministic policy cannot fix. Next: reading a problem's own shape first.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
