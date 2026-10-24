import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own five test layers (examples.py): a unit test on one
// minimal fixture; a Hypothesis property test checking a replay/dedup invariant across a
// hundred generated sequences; a real pact-python consumer contract test whose mock
// provider actually serves a real local HTTP response to a real client call; an
// integration test run directly against the sandbox's own real PostgreSQL cluster, with
// Testcontainers' own container-orchestration mechanism disclosed as unavailable (no
// Docker daemon, confirmed via a real failing docker info call); and a golden-output test
// that records a deterministic report once and diffs a second run against it in the same
// process. No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: five kinds of test, five different questions',
      body: (
        <>
          The last topic built a retry client that's correct on the happy path: a timeout, a
          shared deadline, backoff with jitter, a retry budget, a circuit breaker, an
          idempotency key. None of that proves the client is actually correct. What does?
        </>
      ),
      duration: 4.8,
      fig: "a retry client that looks correct — which test actually catches the bug that isn't on the happy path?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a unit test on a minimal fixture',
      body: (
        <>
          One minimal input — a single dict with the smallest shape that still exercises the
          function — not a full dataset. One call, one assertion on the shape it returns.
          That's the whole test, and it's enough to catch the one thing it claims to check.
        </>
      ),
      duration: 4.8,
      fig: 'one minimal input, not a full dataset — does the function do the one thing it claims?',
      Visual: S.RevealUnitTest,
    },
    {
      title: 'Reveal: a property test runs the same check on a hundred generated inputs',
      body: (
        <>
          The same dedup rule from the previous topic's idempotency key, checked a hundred
          times against a hundred different generated sequences of write attempts — varying
          length, varying key reuse. Every single one holds: the number of real effects
          recorded always equals the number of distinct keys used.
        </>
      ),
      duration: 4.8,
      fig: 'one generated sequence of write attempts, a hundred times — does the invariant hold every time?',
      takeaway: 'A property test generates a hundred inputs and checks the same invariant against every one.',
      Visual: S.RevealPropertyTest,
    },
    {
      title: 'Predict: does a hand-picked example catch what a generated one does?',
      body: (
        <>
          A handwritten test with three retries on the same key already checks that repeating
          a key doesn't double the effect. Does generating a hundred more sequences actually
          find anything that handwritten test misses?
        </>
      ),
      duration: 2.8,
      fig: 'a handwritten replay test with three retries — does a generated test find anything it misses?',
      predict: {
        options: [
          { label: 'No — three hand-picked retries already cover the dedup logic' },
          { label: "Yes — a generated test finds sequences a handwritten one didn't think to try", correct: true },
        ],
        explain: (
          <>
            Yes. A handwritten test only ever exercises the exact sequence someone thought to
            type. A generated test searches a much larger space of the same rule, including
            key-reuse patterns nobody sat down and wrote by hand.
          </>
        ),
      },
      Visual: S.PredictGenerated,
    },
    {
      title: 'Reveal: a contract test runs against a real mock provider',
      body: (
        <>
          The interaction — one request, one minimal response — is defined once. From that
          single definition, a real local server is built. The consumer's own client code,
          with no special knowledge of the test, makes a real call against that server and
          gets back exactly the response the interaction described.
        </>
      ),
      duration: 4.8,
      fig: "a consumer client, calling a mock provider that was built from the exact interaction it's expected to send",
      takeaway: "A contract test runs the consumer's real code against a real server built from the agreed interaction.",
      Visual: S.RevealContractTest,
    },
    {
      title: 'Reveal: an integration test against a real dependency',
      body: (
        <>
          The same insert-then-read, run against this sandbox's own real, already-running
          database — not an in-memory stub that can only ever agree with itself. The
          orchestration tool built to make that database disposable per test needs a Docker
          daemon this sandbox doesn't have, disclosed directly rather than faked; the real
          dependency underneath it is still right here, and the test runs against it for real.
        </>
      ),
      duration: 4.8,
      fig: 'the same insert-then-read, run against an in-memory stub vs. a real running database',
      takeaway: "An integration test's point is a dependency that can actually disagree — making it disposable is a separate, honestly-unavailable layer.",
      Visual: S.RevealIntegrationTest,
    },
    {
      title: 'Reveal: a golden-output test records once, then diffs forever',
      body: (
        <>
          A deterministic report, generated from a fixed random seed, recorded to a file the
          first time it's run. Run it again in the same process: no new output is derived,
          only a diff against the file already on disk — and that diff comes back empty.
        </>
      ),
      duration: 4.8,
      fig: 'the same deterministic report, generated twice — does it still match the file recorded the first time?',
      takeaway: "A golden-output test diffs against the answer it already recorded, not a freshly re-derived one.",
      Visual: S.RevealGoldenMaster,
    },
    {
      title: 'Reveal: the five layers, run together',
      body: (
        <>
          Unit, property, contract, integration, golden — all five run end to end against the
          same client from the previous topic. Each one passes, and each one was checking a
          different claim: none of the other four would have caught what it catches.
        </>
      ),
      duration: 4.8,
      fig: 'the same client from five angles — unit, property, contract, integration, golden — run end to end',
      Visual: S.RevealFiveLayers,
    },
    {
      title: 'Recap',
      body: (
        <>
          A unit test earns its keep on the smallest fixture that still exercises the
          function. A property test checks the same invariant across a hundred generated
          inputs, catching what a hand-picked example can't. A contract test runs the
          consumer's real code against a mock server built from the agreed interaction. An
          integration test's whole point is a dependency that can actually disagree — this
          sandbox ran that part for real, disclosing only the disposable-container mechanism
          as unavailable. And a golden-output test records once and diffs forever.
        </>
      ),
      duration: 4.8,
      fig: 'five layers: a minimal fixture, a hundred generated cases, a real mock provider, a real dependency, a recorded diff',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team has only hand-picked unit tests on their retry client. All of them pass.
          They ship, and a replay produces two effects for one idempotency key — a dedup bug a
          Hypothesis test would have found on its very first generated run. What's actually
          missing, and why doesn't a passing unit-test suite catch it?
        </>
      ),
      duration: 2.8,
      fig: 'a team ships on all-green unit tests and still ships a dedup bug a property test would have caught — what was missing?',
      predict: {
        options: [
          { label: 'Nothing was missing — the bug was just unlucky and no test layer would have caught it' },
          { label: "A property test was missing; a hand-picked unit test only ever checks the sequence someone wrote, not the space of sequences that can break the rule", correct: true },
        ],
        explain: (
          <>
            A property test was missing. A unit test proves the function is correct on the
            specific input it was given. It can't prove the invariant holds on inputs nobody
            thought to write — that's exactly the gap a generated property test closes.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
