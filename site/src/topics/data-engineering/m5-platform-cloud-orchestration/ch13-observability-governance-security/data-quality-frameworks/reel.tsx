import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed in examples.py: a real dbt build fails one real data test and
// passes one real unit test; a real Great Expectations suite catches the same null plus a range
// check dbt's generic tests don't cover; a full rescan and an incremental metric agree exactly;
// a 1-in-10 sample on the same data misses a known null completely.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop adds twelve checks to its orders pipeline. Runtime doubles overnight. Two weeks
          later a bad partition still reaches the dashboard — the one check that would have caught
          it ran after the data was already published.
        </>
      ),
      duration: 6.4,
      fig: 'twelve checks. runtime doubled. still reached the dashboard.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: where should each check run?',
      body: (
        <>
          A not-null check, a freshness check, a drift check. Place each one before publish or
          after — and which choice is actually what doubled the pipeline's cost?
        </>
      ),
      duration: 6.4,
      fig: 'not-null, freshness, drift. Before publish, or after?',
      predict: {
        options: [
          { label: 'Running every check before publish is what doubled the cost' },
          { label: 'A full post-hoc rescan is the expensive one; a gate can be cheap', correct: true },
        ],
        explain: (
          <>
            A gate checks data already in flight — cheap. A post-hoc scan re-reads the whole table
            after it lands. The expensive habit is scanning everything, not checking early.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: where a check runs, and what it costs',
      body: (
        <>
          A gate sits before publish and can block — cheap, because it only touches data already
          moving through the pipeline. A post-hoc scan runs after landing, can't block anything,
          and costs a full read of whatever it covers.
        </>
      ),
      duration: 6.4,
      fig: 'gate: before, can block, cheap. scan: after, cannot block.',
      Visual: S.RevealGateVsPosthoc,
    },
    {
      title: "Reveal: dbt's two kinds of test",
      body: (
        <>
          A data test queries data already built and looks for failing rows — on this run it
          actually caught a missing customer id. A unit test checks a model's logic against fixed,
          made-up rows before anything is built at all — and it passed.
        </>
      ),
      duration: 6.8,
      fig: 'data test: caught a real gap. unit test: checked the logic, passed.',
      takeaway: 'A data test checks what was built; a unit test checks the logic before anything is built.',
      Visual: S.RevealDbtTests,
    },
    {
      title: 'Reveal: an expectation suite',
      body: (
        <>
          A suite groups named, declarative assertions and runs them against one batch of data. On
          the same rows, it caught the same missing id — and one more thing dbt's four built-in
          tests never checked at all: a negative amount.
        </>
      ),
      duration: 6.8,
      fig: 'same missing id, caught again — plus a negative amount, missed before.',
      Visual: S.RevealGxSuite,
    },
    {
      title: 'Reveal: the rest of the landscape, named',
      body: (
        <>
          A contracts-first engine checks data against a published contract. A library built on
          Spark turns checks into jobs that compute metrics, then tests the metrics. A framework
          built for one platform's own pipelines. Named here, not run — none of their machinery is
          available on this build.
        </>
      ),
      duration: 6.8,
      fig: 'a contracts engine, a Spark metrics library, a platform framework.',
      takeaway: 'Different engines compute a check differently — a contract, a metric, a row — answering the same question.',
      Visual: S.RevealLandscape,
    },
    {
      title: 'Reveal: incremental metrics',
      body: (
        <>
          Compute a metric on each new partition and merge it with what's already stored, instead
          of rescanning everything every time. Run both ways on the same data here, and they agree
          exactly — the incremental total costs far less to produce.
        </>
      ),
      duration: 6.4,
      fig: 'merge each new partition. same answer as a full rescan — less work.',
      Visual: S.RevealIncremental,
    },
    {
      title: 'Reveal: sampling, and what it misses',
      body: (
        <>
          A cheap sample estimates a rate instead of reading every row. On the exact same shop
          data, a one-in-ten sample landed on the same relative row every time — and missed a
          known bad row completely, reporting zero where the real count was nonzero.
        </>
      ),
      duration: 6.8,
      fig: 'a real miss: sample said zero. the actual count was not zero.',
      takeaway: 'A sample estimates a rate cheaply — and can miss a single rare bad row completely, not just undercount it.',
      Visual: S.RevealSampling,
    },
    {
      title: 'Recap',
      body: (
        <>
          A gate blocks early and stays cheap; a post-hoc scan can't block and costs a full read.
          A data test checks what's built, a unit test checks the logic. A suite groups named
          assertions. Other engines check the same thing their own way. An incremental metric
          matches a full rescan for far less; a sample is cheaper still, and can miss entirely.
        </>
      ),
      duration: 6.8,
      fig: 'gate vs scan; data test vs unit test; incremental vs sample.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A gate scans every row of an ever-growing table before each publish — not a sample, not
          an incremental merge, the whole table, every single run. As the table keeps growing, does
          that gate's own cost per run stay flat, or does it keep climbing — and why?
        </>
      ),
      duration: 6.8,
      fig: 'a full-table gate, growing data. flat cost, or climbing?',
      predict: {
        options: [
          { label: "Flat — it's a gate, and gates are the cheap option" },
          { label: 'Climbing — a full scan costs the size of the table, whatever sits before it', correct: true },
        ],
        explain: (
          <>
            Being a gate only means it runs before publish and can block. It does not make a full
            scan cheap — this gate rescans the whole table every run, so its cost grows with it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
