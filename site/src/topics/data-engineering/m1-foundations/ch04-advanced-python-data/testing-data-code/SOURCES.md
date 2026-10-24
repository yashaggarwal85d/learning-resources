## Quickstart (Hypothesis)

URL: https://hypothesis.readthedocs.io/en/latest/quickstart.html
Version: Hypothesis 6.170.9 docs (fetched 2026-10-24)

> @given is the standard entrypoint to Hypothesis. It takes a strategy, which describes the type of inputs you want the decorated function to accept.

> By default, Hypothesis generates 100 random inputs. You can control this with the max_examples setting.

> A Hypothesis test is still a regular python function, which means pytest or unittest will pick it up and run it in all the normal ways.

> You may want an input to depend on the value of another input. For instance, you might want to generate two integers n1 and n2 where n1 <= n2.

> @composite lets you define a new strategy which is itself built by drawing values from other strategies, using the automatically-passed draw function.

Contents: `@given` as the entrypoint, strategies (`st.integers()`, `st.text()`, `st.lists()`) describing an input domain; the 100-example default and `max_examples`; `.filter()` and `assume()` for narrowing generated cases; `@composite` for dependent generation; plain pytest/unittest compatibility.

## testcontainers-python

URL: https://testcontainers-python.readthedocs.io/en/latest/
Version: testcontainers 2.0.0 docs (fetched 2026-10-24)

> testcontainers-python facilitates the use of Docker containers for functional and integration testing.

> The snippet above will spin up the current latest version of a postgres database in a container. The get_connection_url() convenience method returns a sqlalchemy compatible url (using the psycopg2 driver per default) to connect to the database and retrieve the database version.

> By default, Testcontainers will search for the container via the gateway IP. You can manually specify your own IP with the environment variable TESTCONTAINERS_HOST_OVERRIDE.

> The container has to have access to the docker daemon which can be achieved by mounting /var/run/docker.sock or setting the DOCKER_HOST environment variable as part of your docker run command.

Contents: the `with PostgresContainer(...) as postgres:` context-manager pattern that spins up a real, throwaway database container for the duration of a test; per-service extras (`testcontainers[postgres]`); the Docker-daemon requirement, including what's needed to run Testcontainers itself from inside a container (a docker client plus access to the daemon).

## How Pact works

URL: https://docs.pact.io/getting_started/how_pact_works
Version: Pact Docs (fetched 2026-10-24)

> Consumer: An application that makes use of the functionality or data from another application to do its job.

> Provider: An application (often called a service) that provides functionality or data for other applications to use, often via an API.

> A contract between a consumer and provider is called a pact. Each pact is a collection of interactions.

> Consumer Pact tests operate on each interaction described earlier to say "assuming the provider returns the expected response for this request, does the consumer code correctly generate the request and handle the expected response?".

> Once all of the interactions have been tested on the consumer side, the Pact framework generates a pact file, which describes each interaction

> In provider verification, each request is sent to the provider, and the actual response it generates is compared with the minimal expected response described in the consumer test.

> If we pair the consumer test and provider verification process for each interaction, the contract between the consumer and provider is fully tested without having to spin up the services together.

Contents: consumer/provider vocabulary; a pact as a collection of interactions (expected request, minimal expected response); the two-sided workflow (consumer test against a mock provider generates the pact file; provider verification replays it against the real provider); the stated payoff — contract tested without spinning up both services together.

## Testing legacy code with Golden Master

URL: https://codurance.com/2012/11/11/testing-legacy-code-with-golden-master/
Version: Sandro Mancuso, Codurance (fetched 2026-10-24)

> Create X number of random inputs, always using the same random seed, so you can generate always the same set over and over again.

> Bombard the class or system under test with these random inputs.

> When you run it for the first time, record the outputs in a file (or database, etc). From then on, you can start changing your code, run the test and compare the execution output with the original output data you recorded. If they match, keep refactoring, otherwise, revert back your change and you should be back to green.

> An easy way to do Golden Master testing in Java (also available to C# and Ruby) is to use Approval Tests. It does all the file handling for you, storing and comparing it.

Contents: the Golden Master technique as a named approach (record a system's real output once, then diff every later run against that recorded file); a fixed random seed so the same generated inputs reproduce exactly; the stated payoff for refactoring legacy code — a change is safe exactly when the diff is empty.
