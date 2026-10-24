# Outline — de.testing-data-code

## Learning outcomes

1. Write a unit test on a minimal fixture, not a full dataset.
2. Write a property-based test with Hypothesis that checks an invariant across generated
   inputs, including the replay/dedup invariant the previous topic's client needs.
3. Write a producer/consumer contract test against a real mock provider.
4. Explain Testcontainers' ephemeral-dependency pattern, and say honestly where this sandbox
   can and can't run it directly.
5. Write a golden-output test, named against the pipeline-CI topic it previews.

## Reel steps (storyboard)

1. **Hook: five kinds of test, five different questions**
   - `fig`: "a retry client that looks correct — which test actually catches the bug that isn't on the happy path?"
   - Visual: "one client" / "five test layers" vs. "which one catches a replay bug".
   - Narrator's line: names the real handoff (the previous topic built a client that's correct on the happy path; this topic is what actually proves the rest).

2. **Reveal: a unit test on a minimal fixture**
   - `fig`: "one minimal input, not a full dataset — does the function do the one thing it claims?"
   - Visual: "one dict, one call" / "one assertion" vs. "a full dataset" / "not needed here".
   - Takeaway: a unit test earns its keep on the smallest input that still exercises the function, not the biggest.

3. **Reveal: a property test runs the same check on a hundred generated inputs**
   - `fig`: "one generated sequence of write attempts, a hundred times — does the invariant hold every time?"
   - Visual: "a hundred generated sequences" / "one dedup rule checked each time" vs. "one hand-picked example" / "proves only itself".
   - Takeaway: a property test doesn't pick the input — it generates a hundred and checks the same rule on all of them.

4. **Predict: does a hand-picked example catch what a generated one does?** (within first four ✓)
   - `fig`: "a handwritten replay test with three retries — does a generated test find anything it misses?"
   - Options: "No — three hand-picked retries already cover the dedup logic" / "Yes — a generated test finds edge cases a handwritten one didn't think to try" (correct).
   - Explain: Hypothesis doesn't just repeat the case you'd have written by hand — it searches for the sequence of keys and payloads that breaks the rule, including ones nobody thought to type in.

5. **Reveal: a contract test runs against a real mock provider**
   - `fig`: "a consumer client, calling a mock provider that was built from the exact interaction it's expected to send"
   - Visual: "the interaction defined once" / "a real mock server built from it" vs. "the consumer's real call" / "checked against that same server".
   - Takeaway: a contract test isn't a guess about what the real provider does — it's the consumer's real code, checked against a real server built from the agreed interaction.

6. **Reveal: an integration test against a real dependency**
   - `fig`: "the same insert-then-read, run against an in-memory stub vs. a real running database"
   - Visual: "a stub" / "always agrees with itself" vs. "a real Postgres cluster" / "the actual thing that can disagree".
   - Takeaway: an integration test's whole point is a dependency that can actually fail the way the mock never will; Testcontainers' job is making that dependency disposable, not making it fake — this sandbox has no Docker daemon to run it, so this demo runs the same honest test directly against the sandbox's own already-running cluster instead.

7. **Reveal: a golden-output test records once, then diffs forever**
   - `fig`: "the same deterministic report, generated twice — does it still match the file recorded the first time?"
   - Visual: "first run" / "output recorded to a file" vs. "every later run" / "diffed against that same file".
   - Takeaway: a golden-output test doesn't re-derive the right answer — it diffs against the answer it already recorded, so any change is either identical or visibly different.

8. **Reveal: the five layers, run together**
   - `fig`: "the same client from five angles — unit, property, contract, integration, golden — run end to end"
   - Visual: "unit" / "passed" and "property" / "passed" vs. "contract" / "passed" and "integration" / "passed" and "golden" / "passed".
   - Takeaway: no single layer proves the client correct — each one answers a question none of the others ask.

9. **Recap**
10. **Prove it** — a production scenario: a team has only unit tests on their retry client, all green, and ships a dedup bug that a property test would have found in the first generated run. What's missing, and why does a hand-picked unit test not catch it?

## Engagement arc

- Hook names the real question: five test layers exist because they ask five different questions, not because more tests are always better.
- Early predict (step 4) tests the intuition that a handwritten example is as good as a generated one — it isn't, and the reveal shows why directly.
- Steps 2–7 build the five layers one at a time, each with a real pass/fail outcome, not a described one.
- Step 6 is the one layer this sandbox can't run as specified (no Docker daemon) — disclosed honestly rather than faked, while still proving the underlying claim (a real, not mocked, dependency) a different way.
- Recap ties the five layers back to the question each one answers; Prove It makes the cost of skipping property tests concrete.

## Post-notes headings

- Outcomes
- Lab
- Production failures this topic warns about
- Frontier
- Where this goes next

## Claims (drawn from the four verified sources)

1. `@given` is the Hypothesis entrypoint; it takes a strategy and the test runs as a normal pytest/unittest function. (Hypothesis quickstart)
2. Hypothesis generates 100 random inputs by default, controlled by `max_examples`. (Hypothesis quickstart)
3. `.filter()` and `assume()` narrow generated cases; `@composite` builds dependent generation from `draw`. (Hypothesis quickstart)
4. `with PostgresContainer(...) as postgres:` spins up a real, throwaway database container for the test's duration. (testcontainers-python)
5. Running Testcontainers from inside a container requires a docker client plus access to the daemon (mounting the socket or `DOCKER_HOST`). (testcontainers-python)
6. A pact is a collection of interactions, each an expected request plus a minimal expected response. (How Pact works)
7. Consumer testing drives a real request against a mock provider built from the interaction; provider verification later replays the same interaction against the real provider. (How Pact works)
8. Pairing consumer test and provider verification fully tests the contract without spinning up both services together. (How Pact works)
9. Golden Master testing: generate inputs with a fixed random seed, record the output once, then diff every later run against that recorded file. (Codurance, Testing legacy code with Golden Master)
10. Approval Tests automates the record/diff file handling for Golden Master testing. (Codurance)
