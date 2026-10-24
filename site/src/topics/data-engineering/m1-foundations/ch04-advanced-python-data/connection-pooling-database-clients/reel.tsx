import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own PostgreSQL cluster and two live PgBouncer instances
// (examples.py): fresh-connect vs. reused-connection cost; Little's Law pool sizing fed a
// measured hold time against a disclosed simulated workload; the transaction-pooling
// prepared-statement caveat reproduced deterministically (same physical backend PID throughout,
// reset by a second client, then denied to a third); the identical test surviving under session
// pooling; a server-side cursor's lower peak RSS against fetchall() on the same result; three
// bulk-load paths (executemany, COPY, ADBC) timed against the same rows. No literal digits
// anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: does opening a connection actually cost something real?',
      body: (
        <>
          Arrow, pandas and Polars all stayed in-process so far — nothing in this chapter has
          left the process to talk to another service. A real database connection is the first
          thing that does. Does opening one actually cost something real, or is that just a
          rumor engineers repeat?
        </>
      ),
      duration: 4.8,
      fig: 'arrow, pandas and polars all stayed in-process — does a real connection actually cost something?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: connection setup cost',
      body: (
        <>
          The same query, run two ways against this sandbox's own PostgreSQL cluster: a fresh
          connection opened and torn down each time, and one connection opened once and reused.
          Measured directly, the fresh connection is dramatically slower every single time — a
          pool's whole reason to exist is this one gap, measured rather than assumed.
        </>
      ),
      duration: 4.8,
      fig: "a fresh connection vs. reusing one already open — measured on this sandbox's own cluster",
      Visual: S.RevealSetupCost,
    },
    {
      title: "Reveal: Little's Law pool sizing",
      body: (
        <>
          A pool size isn't a guess. Little's Law says pool size equals throughput times how
          long one connection is held. Feeding it a real measured hold time and a chosen target
          throughput gives a concrete number, not a round one picked by habit.
        </>
      ),
      duration: 4.8,
      fig: "a measured hold time, fed into one formula, gives a concrete pool size",
      takeaway: "A pool size isn't a guess — it's a measured hold time times a target throughput.",
      Visual: S.RevealLittlesLaw,
    },
    {
      title: "Predict: does a prepared statement survive into a client's next request, under transaction pooling?",
      body: (
        <>
          One client prepares a statement, then later asks to run it again, under transaction
          pooling. The client's own connection to the pool never changes. Does the prepared
          statement survive into that later request?
        </>
      ),
      duration: 2.8,
      fig: 'the same client, prepares now, asks again later — does transaction pooling remember?',
      predict: {
        options: [
          { label: "Yes — it's the same client's own connection the whole time" },
          { label: 'No — a different request can land on a different backend', correct: true },
        ],
        explain: (
          <>
            No. Transaction pooling hands the physical backend back to the pool the moment a
            transaction ends, and the next transaction — even the same client's own next one —
            is not guaranteed that same backend.
          </>
        ),
      },
      Visual: S.PredictPreparedStatement,
    },
    {
      title: 'Reveal: the prepared-statement caveat, reproduced',
      body: (
        <>
          One client prepares a statement on a shared physical backend. A second client reuses
          that same backend and clears its state. The first client's statement is now gone — a
          third request on that same physical backend fails, reproduced directly, end to end.
        </>
      ),
      duration: 4.8,
      fig: 'prepared here, cleared by someone else, denied here — the exact failure, reproduced',
      takeaway: "A prepared statement lives on the physical backend, not the logical client — transaction pooling is what exposes that difference.",
      Visual: S.RevealPreparedStatementCaveat,
    },
    {
      title: 'Reveal: session pooling, the same test, survives',
      body: (
        <>
          The identical prepare-then-execute test, run again, this time over session pooling
          instead of transaction pooling. One backend stays assigned to the client for its whole
          session, so the same statement that failed before now succeeds every time.
        </>
      ),
      duration: 4.8,
      fig: 'the identical test, over session pooling instead — the statement survives',
      Visual: S.RevealSessionPoolingSurvives,
    },
    {
      title: 'Reveal: server-side cursor, a tuned fetch size',
      body: (
        <>
          The same large result, pulled two ways: fetched whole in one call, and pulled through a
          server-side cursor in tuned batches. Measured in an isolated process both times, the
          batched fetch peaks measurably lower in client memory.
        </>
      ),
      duration: 4.8,
      fig: 'the same large result, pulled whole vs. pulled in batches — measured peak memory',
      takeaway: 'A server-side cursor trades server-side state for client-side memory, worth it for a result too big to hold at once.',
      Visual: S.RevealServerCursor,
    },
    {
      title: 'Reveal: three bulk-load paths, measured',
      body: (
        <>
          The same rows, loaded three different ways against this sandbox's own cluster:
          row-by-row inserts, a direct bulk-copy path, and an Arrow-native driver. Measured
          directly, row-by-row is by far the slowest, and the Arrow-native driver tracks the
          bulk-copy path closely — because by its own documentation, it runs that same path
          underneath.
        </>
      ),
      duration: 4.8,
      fig: 'the same rows, loaded three ways — row-by-row, a bulk-copy path, and an arrow-native driver',
      takeaway: "An Arrow-native bulk driver isn't a different wire protocol — by its own documentation, it's the bulk-copy path underneath.",
      Visual: S.RevealBulkLoad,
    },
    {
      title: 'Recap',
      body: (
        <>
          A fresh connection measurably costs more than a reused one, which is the whole reason a
          pool exists. Little's Law turns a measured hold time into a concrete pool size.
          Transaction pooling's prepared-statement caveat is real and reproducible, and session
          pooling avoids it at the cost of a dedicated backend. A server-side cursor trades
          server memory for client memory on a result too big to hold at once, and an
          Arrow-native bulk driver runs the same fast path a plain bulk copy does.
        </>
      ),
      duration: 4.8,
      fig: 'a real setup cost, a formula for pool size, a reproduced caveat and its fix, and three measured bulk paths',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A service pools its database connections through PgBouncer in transaction mode, and
          relies on a prepared statement surviving across separate requests from the same client.
          It starts failing intermittently in production. What's actually happening, and what's
          the fix?
        </>
      ),
      duration: 2.8,
      fig: 'a service pools in transaction mode and relies on a prepared statement surviving — what breaks, and why?',
      predict: {
        options: [
          { label: 'Nothing is wrong — the database must be flaky' },
          { label: "Transaction pooling hands the statement's backend to someone else between requests; fix by enabling PgBouncer's prepared-statement tracking or switching that path to session pooling", correct: true },

        ],
        explain: (
          <>
            The prepared statement was never guaranteed to survive on a shared backend under
            transaction pooling, so it intermittently lands on a backend that never saw it. The
            fix is enabling PgBouncer's own prepared-statement tracking, or moving that specific
            workload to session pooling.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
