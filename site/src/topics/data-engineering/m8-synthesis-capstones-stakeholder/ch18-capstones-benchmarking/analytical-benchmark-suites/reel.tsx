import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Closes the chapter lab: republishes topics one through three's own harness and generator,
// alongside this topic's own small, disclosed-scale join-order demonstration, from examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A database vendor publishes a benchmark report showing their engine beats a
          competitor's by a wide margin. Every number in that report is independently
          reproducible and true. A customer who adopts the engine on the strength of that report
          still finds it slower than the competitor on their own real workload.
        </>
      ),
      duration: 3.6,
      fig: 'true numbers. A comparison that still misleads.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: how can true numbers still mislead',
      body: (
        <>
          How can every published number be true and the comparison still mislead, and what,
          in several vendors' own licence terms, would have stopped the competitor from
          publishing a correction?
        </>
      ),
      duration: 3.4,
      fig: 'a report built from true numbers, chosen on purpose.',
      predict: {
        options: [
          { label: 'The vendor must have fabricated or altered a number somewhere in the report' },
          { label: "The published suite stressed exactly the query shapes the winning engine is strong on and avoided the ones it isn't; a licence term in the competitor's own agreement may have forbidden them from publishing a rebuttal at all", correct: true },
        ],
        explain: (
          <>
            Nothing in the report needs to be false. Choosing which true queries to publish, and
            which to leave out, is benchmarketing, not fabrication. And a licence term named for
            David DeWitt can forbid a competitor from publishing any benchmark result at all
            without the vendor's own prior approval, leaving a bad comparison uncorrected.
          </>
        ),
      },
      Visual: S.PredictHowCanBothBeTrue,
    },
    {
      title: 'Reveal: TPC-H and TPC-DS, what each stresses',
      body: (
        <>
          TPC-H's own eight-table schema and twenty-two queries stress broad ad hoc analytical
          SQL over a comparatively simple schema. TPC-DS extends that to a much larger, skewed
          snowflake schema and ninety-nine queries, closer to a real retail warehouse.
        </>
      ),
      duration: 4.0,
      fig: 'the same skew and scale lesson, built at industry size.',
      Visual: S.RevealTpcHTpcDs,
    },
    {
      title: 'Reveal: ClickBench and its own stated blind spot',
      body: (
        <>
          One single, wide table, forty-three queries, no joins at all. Fast to run and easy to
          compare across engines, at a cost ClickBench's own documentation states plainly: testing
          nothing about join performance or multi-table schema design.
        </>
      ),
      duration: 4.2,
      fig: 'disclosed by ClickBench itself, not an outside criticism.',
      takeaway: 'A benchmark that names its own blind spot is honest; a leaderboard read as a complete verdict is not.',
      Visual: S.RevealClickBench,
    },
    {
      title: 'Reveal: the Join Order Benchmark, for cardinality estimation and join ordering',
      body: (
        <>
          Built on a real, correlated movie dataset specifically because cardinality estimates
          computed on uniformity and independence assumptions are frequently wrong on real data —
          the exact failure mode this chapter's own correlated-column topic demonstrated earlier.
        </>
      ),
      duration: 4.4,
      fig: "this chapter's own correlated-column lesson, at industry scale.",
      takeaway: 'A synthetic, independence-assuming dataset cannot test what this benchmark exists to test: how badly real correlation breaks an estimator.',
      Visual: S.RevealJoinOrderBenchmark,
    },
    {
      title: 'Reveal: TPC-DI, the only TPC ETL specification, now obsolete',
      body: (
        <>
          TPC's own current specifications page lists TPC-DI, the only TPC benchmark aimed at
          data-integration workloads rather than query execution, under its own table of obsolete
          workloads.
        </>
      ),
      duration: 3.4,
      fig: 'the gap a standard suite never filled.',
      takeaway: 'An obsolete standard leaves a real gap behind it — modern pipeline benchmarking still has no single named successor.',
      Visual: S.RevealTpcDiObsolete,
    },
    {
      title: 'Reveal: benchmarketing and the DeWitt clause',
      body: (
        <>
          Benchmarketing is a vendor choosing which true queries, subset, or configuration to
          publish, so every shown number stays accurate while the overall comparison misleads. A
          DeWitt clause is a documented licence term that can forbid publishing any unsanctioned
          benchmark result at all.
        </>
      ),
      duration: 4.4,
      fig: 'true numbers chosen on purpose, and a licence that can silence a correction.',
      takeaway: "A reproducible harness matters even when a vendor's own number is true, because neither trick can block it.",
      Visual: S.RevealBenchmarketingDewitt,
    },
    {
      title: 'Recap',
      body: (
        <>
          TPC-H and TPC-DS, ClickBench, the Join Order Benchmark and TPC-DI each stress something
          real and skip something real. Benchmarketing and a DeWitt clause are the trap this
          chapter's own method, an independently reproducible harness, exists to resist.
        </>
      ),
      duration: 4.4,
      fig: 'five suites, five honest trade-offs, and the method that resists the trap.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This chapter's lab closes here: topic two's harness, topic three's seeded generator,
          and this topic's own small, disclosed-scale baseline, published together and re-run
          end to end from a single command. What does that bundle actually prove?
        </>
      ),
      duration: 3.4,
      predict: {
        options: [
          { label: 'That this classroom bundle is a sixth benchmark suite, comparable to the other five' },
          { label: 'That the chapter applied the same method industry suites use, at a disclosed classroom scale, as a reproducible stand-in rather than evidence about any real engine', correct: true },
        ],
        explain: (
          <>
            This bundle is small on purpose, and says so. It proves the method, not a verdict on
            any database engine: a warmed-up target, honest load generation, representative data,
            and a result anyone can re-run and check for themselves.
          </>
        ),
      },
      fig: 'the method, proven small — never a sixth suite.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
