# Fact-check — de.data-quality-frameworks

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A data test is a select statement that seeks failing rows; dbt ships four built-in generic data tests (unique, not_null, accepted_values, relationships). | dbt -- Add data tests to your DAG | Confirmed, quoted verbatim. |
| 2 | A singular data test placed in the tests directory runs automatically with `dbt test`; referencing it in a `.yml` file causes an error. | dbt -- Add data tests to your DAG | Confirmed, quoted verbatim. |
| 3 | A unit test validates a model's SQL transformation logic on small, static mocked inputs before the model is materialized; dbt currently only supports unit testing SQL models. | dbt -- Unit tests | Confirmed, quoted verbatim. |
| 4 | FICO and GX completed a definitive agreement for FICO to acquire GX Cloud and fold it into the FICO platform; GX Cloud stopped being publicly available on June 1. | Great Expectations's own stewardship announcement, dated May 06, 2026 | Confirmed, quoted verbatim. |
| 5 | Fivetran will become the new steward of the Great Expectations open source community and the GX Core project, which continues as an open source, community-driven project. | Great Expectations's own stewardship announcement | Confirmed, quoted verbatim. |
| 6 | A Soda data contract is a YAML document with a top-level `dataset:` key and a `checks:` block, verified against actual data. | Soda -- Contract Language reference | Confirmed, quoted verbatim. |
| 7 | The `soda-core` package's current released version is 4.29.0, confirming "Soda 4" as the live, current major version. | Soda, PyPI release metadata | Confirmed, verified directly against the package registry. |
| 8 | Deequ's VerificationSuite translates checks into Spark jobs that compute metrics, then evaluates assertions on those metrics; metrics can be persisted via a MetricsRepository and computed incrementally on partitioned, growing data. | Deequ's own README | Confirmed, quoted verbatim. |
| 9 | DQX offers 80-plus built-in checks for PySpark DataFrames and applies the same API to both batch and Spark Structured Streaming workloads. | Databricks Labs DQX's own README | Confirmed, quoted verbatim. |
| 10 | An incremental metric, merged partition by partition, equals a full rescan's count exactly; a small fixed-rate sample can miss the one bad row a full scan always finds. | This course's own measurement (`examples.py`) | Confirmed, asserts pass. |

## Red-team: the predict questions (steps 3 and 8)

**Question 1 (step 3):** should every check -- not-null, freshness, distribution drift -- be
pushed into the gate, since gating is strictly safer than letting bad data through?

**Attack -- "if the gate can block, just put everything in it and nothing bad ever ships."**
A gate only has what the in-flight run itself carries: the rows passing through right now. A
freshness check needs to know the actual current time from outside that run, and a
distribution-drift check needs a stored historical baseline to compare against -- neither
exists inside the run, so a gate attempting either one either can't actually check what it
claims to, or has to be fed state it was never designed to hold. `examples.py`'s own
distinction (a data test against real built data vs. a metric computed and compared over time)
reflects exactly this split.

**Question 2 (step 8):** since a sample is cheaper, isn't it just a smaller, proportionally
accurate version of a full scan?

**Attack -- "a 10 percent sample should still catch roughly 10 percent of any problem, so a
single bad row has good odds of being flagged eventually."** A single, one-time bad row is not
a rate to be sampled proportionally -- it either falls inside the sampled positions or it
doesn't, with no partial credit. `examples.py` plants exactly one bad row and shows a
fixed-rate sample missing it completely, not partially: the miss is binary, which is why a
sample's silence is never proof of correctness, only an absence of evidence at the rate it was
taken.

## Abandoned approaches

Running this topic's examples against real dbt, GX Core, Soda, Deequ and DQX installations was
considered first, matching each framework's own documented behavior exactly. Per this topic's
own CHAPTER.md ("Lab: none of its own... the frameworks' examples run on the shop's synthetic
data [...] Soda and DQX sourced from their documentation and disclosed"), a full install of
five separate frameworks (several requiring a JVM, a Spark session, or a hosted account) was
judged to cost far more sandbox setup than this topic's 15-minute scope allows. Instead,
`examples.py` builds the two mechanisms this topic's claims actually rest on -- a data test vs.
a unit test, and an incremental metric vs. a sample -- directly in Python, reproducing the
structural behavior each framework's own documentation describes (a select-for-failing-rows
test, mocked-input logic validation, and metric persistence/incremental computation) rather
than fabricating a number from a framework that never actually ran.
