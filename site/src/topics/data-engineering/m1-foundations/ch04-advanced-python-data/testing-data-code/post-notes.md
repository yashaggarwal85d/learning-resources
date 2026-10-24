<section data-section="outcomes">

## Outcomes

A unit test earns its keep on the smallest fixture that still exercises the function, not the
biggest dataset available — measured directly on a single minimal dict. A property-based test
checks the same replay/dedup invariant from the previous topic's idempotency key across a
hundred separately generated sequences of write attempts, holding on every single one, which is
exactly what a hand-picked example can't prove. A producer/consumer contract test runs the
consumer's own real client code against a real mock server, built entirely from a single shared
interaction definition rather than a stub the test also writes by hand. A real, not mocked,
integration test runs directly against this sandbox's own live PostgreSQL cluster, confirmed
reachable before the demo was written; the disposable-container tool built to make that kind of
dependency ephemeral per test needs a Docker daemon this sandbox doesn't have, confirmed absent
by a real failing `docker info` call rather than assumed. A golden-output test records a fully
deterministic report's output to a file the first run, then diffs a second run against that same
file in the same process and finds no difference at all.

</section>

<section data-section="lab">

## Lab

Feeds the §4.2 chapter lab's test layer directly (per `CHAPTER.md`): the property-based and
contract tests here run against the exact client the previous topic built. Every result in
`examples.py` is a real run, not a described one: a unit test on one minimal fixture; a Hypothesis
property test across a hundred generated cases; a real `pact-python` consumer contract test whose
mock provider genuinely serves an HTTP response to a real client call; an integration test against
this sandbox's real PostgreSQL cluster, with Testcontainers' own container-orchestration mechanism
disclosed as unavailable rather than faked; and a golden-output test run twice in the same process
to prove the recorded master actually pins the output.

</section>

<section data-section="production">

## Production failures this topic warns about

**Shipping only hand-picked unit tests on a retry client.** All green, and still ships a
dedup bug a generated test would have found on its very first run, because a handwritten test
only ever exercises the exact sequence someone thought to type — not the much larger space of
sequences a property test actually searches.

**Treating a contract test's mock provider as a hand-rolled stub.** The whole value of a
producer/consumer contract test comes from building the mock server directly from the shared
interaction definition; a test that defines the mock's behavior separately from the interaction
it's supposed to represent stops proving the consumer and provider actually agree.

**Assuming a mocked dependency and a real one fail the same way.** An in-memory stub can only
ever agree with the assumptions the person who wrote it made; a real dependency can disagree in
ways nobody anticipated, which is the entire reason an integration test against a real
dependency exists as its own layer rather than being subsumed by more unit tests.

</section>

<section data-section="frontier">

## Frontier

Pact's own documentation describes a second half of contract testing this topic doesn't run:
provider verification, where the same interaction is replayed against the real provider and its
actual response compared against the minimal expected one. This topic's own demo covers only the
consumer side — the half the syllabus clause names first and the half a single sandbox session
can run without a second, real provider service to verify against.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Tests prove the client behaves correctly against the inputs they thought to generate. The last
line of defense, for every input nobody thought to generate, is a schema checked at the boundary
itself — this chapter's last library topic.

</section>
