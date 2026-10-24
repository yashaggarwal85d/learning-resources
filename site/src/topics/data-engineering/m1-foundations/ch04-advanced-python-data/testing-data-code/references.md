Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`): a unit test, a Hypothesis property test, a real `pact-python` consumer contract
test against a real local mock server, an integration test against this sandbox's own live
PostgreSQL cluster, and a golden-output test run twice in the same process.

- Hypothesis, "Quickstart": [hypothesis.readthedocs.io](https://hypothesis.readthedocs.io/en/latest/quickstart.html). `@given`, strategies, the default 100-example run, `.filter()`/`assume()`, `@composite`.
- testcontainers-python documentation: [testcontainers-python.readthedocs.io](https://testcontainers-python.readthedocs.io/en/latest/). The `with PostgresContainer(...) as postgres:` pattern and the Docker-daemon requirement.
- Pact, "How Pact works": [docs.pact.io](https://docs.pact.io/getting_started/how_pact_works). Consumer/provider vocabulary, interactions, the two-sided consumer-test/provider-verification workflow.
- Sandro Mancuso, "Testing legacy code with Golden Master": [codurance.com](https://codurance.com/2012/11/11/testing-legacy-code-with-golden-master/). The fixed-seed record/diff technique and Approval Tests.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=testing-data-code:%20).
