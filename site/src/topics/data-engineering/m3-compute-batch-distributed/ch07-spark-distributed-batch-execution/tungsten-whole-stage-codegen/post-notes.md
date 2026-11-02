<section data-section="outcomes">

## Outcomes

Read the generated code for a fused stage and point directly to the loop that replaced its
operators, using the shared `*(N)` marker to find which nodes it covers. Recognise a codegen
fallback from the plan's own markers — or their silent absence — and confirm it against Spark's
own codegen report rather than guessing from plan shape alone.

</section>

<section data-section="internals">

## Janino and the generated method

Spark hands its generated Java source to Janino, a small, fast, embedded compiler built for
exactly this kind of runtime compilation rather than a full `javac` invocation. This topic's own
measurement confirms the generated source and the fusion it produces; it does not independently
profile Janino's own compile step, which is named here as the mechanism behind "compiled... at
runtime" rather than measured directly.

## ORC's own vectorised reader

ORC follows the same columnar-exception shape this topic measures for Parquet: a batched, vectorised
read reporting no stage marker of its own, bridged into the fused, row-based rest of the plan by a
separate node. This topic's own `examples.py` writes and reads Parquet specifically; ORC's version
of the same mechanism is named here, not independently re-measured.

## Huge methods, the other fallback trigger

`spark.sql.codegen.maxFields` is one documented fallback trigger, and the one this topic forces
deterministically. The other is a generated method's own bytecode exceeding the JVM's 64-kilobyte
limit per method — a limit a sufficiently wide or deeply nested query can hit on its own, with no
config change needed, producing the identical symptom: markers disappear, and the report agrees.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a slow stage is "just Python," when it's actually a fallback.** A stage that silently
drops out of codegen for exceeding `spark.sql.codegen.maxFields` looks, in isolation, like any
other slow native stage. A team that only checks for Python UDFs when hunting slowdowns will miss
this one; checking for the marker directly, as this topic does, catches it.

**Reading the plan's absence of a marker as "codegen never ran here."** The vectorised reader's own
missing marker is not a fallback — it's the intended columnar exception, confirmed by `Batched:
true` and a bridging `ColumnarToRow` node right above it. Treating every unmarked node as broken
codegen misreads a design choice as a failure.

</section>

<section data-section="frontier">

## Frontier

Codegen fusion stops at any operator that doesn't implement Spark's own codegen-support interface
— a sort in some configurations, or a user-defined function's own exec node — splitting one plan
into several independently fused subtrees rather than one. This topic's own measured query fuses
cleanly end to end; a plan with a genuine break point reports more than one subtree number, each
its own separately generated method.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Codegen is the fast, common path, and it just fused Spark's own operators into one native loop. The
very next topic is the one execution path that loop cannot touch at all — a pickled Python UDF —
and exactly why leaving the JVM for it costs so much more.

</section>
