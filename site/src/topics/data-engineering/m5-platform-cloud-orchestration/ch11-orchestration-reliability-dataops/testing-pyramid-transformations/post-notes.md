<section data-section="outcomes">

## Outcomes

By the end of this topic you can: place a given test at the right pyramid layer and justify why; write a dbt unit test and a pytest test for the same kind of bug and say which layer catches it faster; design a property-based invariant for a transformation; diagnose a flaky test as an ordering, time or floating-point problem and fix it.

</section>

<section data-section="internals">

## Internals

dbt's own documentation is explicit about what a unit test actually checks: it lets you "validate your SQL modeling logic on a small set of static inputs before you materialize your full model in production," and currently "only support[s] unit testing SQL models," defined in a YML file. Apache Spark's own testing guide recommends the same bottom-rung shape for PySpark code: "we can also write our tests with pytest," sharing one Spark session across a test file via a fixture rather than starting a cluster per test. The decision rule that orders the four rungs -- fast and narrow at the bottom, slow and broad at the top -- is a cost argument, not a correctness argument: a unit test that ran as slowly as an in-pipeline check would still be correct, it would just be too expensive to run on every single change, which is the only reason it doesn't live at the top instead.

</section>

<section data-section="lab">

## Lab

This topic's own real tests run at every rung. A dbt-unit-test-style mocked input and expected output check the shop's `stg_orders` transform logic directly. A real local Spark session, driven through a real pytest-shaped test, checks a pure transformation function. A real `hypothesis` property search checks the invariant "a merge never decreases a total" against many generated inputs and finds a genuine counterexample in a deliberately buggy merge function -- then confirms the fixed version survives the same search. A golden-dataset snapshot, diffed whole, catches an unintended rounding regression that a narrow unit test on a round number never exercises. Finally, three real flaky-test causes -- an unordered comparison, a baked-in timestamp, and a floating-point sum that genuinely changes value by summation order -- are each shown failing under a naive assertion and passing once the assertion is written to match the actual claim.

</section>

<section data-section="production">

## Production

The hook's real cost wasn't the GROUP BY itself -- an unordered result is completely ordinary. It was an assertion that compared that result position by position, silently promising an ordering the transform never actually guaranteed. The practical fix generalizes past this one bug: a test's assertion should check exactly the claim being made, no more and no less, because a test can fail for reasons that have nothing to do with correctness, and pass for reasons that have nothing to do with correctness either.

</section>

<section data-section="frontier">

## Frontier

In-pipeline expectation tests get their full treatment -- real tooling, not just a named top rung -- later, in Chapter 13. This topic's own planted bugs and its four-rung ladder aren't thrown away once the topic ends: a later chapter-lab scorecard reuses this exact same set of bugs to measure which layer, from topics 15 through 17, actually catches each one and at what cost.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A unit test catches a known kind of bug on a small fixture. It says nothing about whether a real change to a real table, at full scale, actually changed the output the way intended. That comparison is the next topic.

</section>
