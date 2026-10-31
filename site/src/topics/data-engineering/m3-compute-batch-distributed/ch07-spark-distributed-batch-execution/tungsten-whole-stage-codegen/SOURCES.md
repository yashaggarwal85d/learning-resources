## WholeStageCodegenExec.scala (Apache Spark source, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/WholeStageCodegenExec.scala
Version: v4.0.0 tag

> WholeStageCodegen compiles a subtree of plans that support codegen together into single Java

> function.

Contents (item by item):
1. The class-level scaladoc states directly what this topic's `examples.py` measures via the shared `*(1)` marker: a *subtree* of operators compiled together into *one* Java function — not one generated function per operator.

## Apache Spark as a Compiler: Joining a Billion Rows per Second on a Laptop (Databricks Engineering Blog)

URL: https://www.databricks.com/blog/2016/05/23/apache-spark-as-a-compiler-joining-a-billion-rows-per-second-on-a-laptop.html
Fetched: 2026-10-31

> The goal is to leverage whole-stage code generation so the engine can achieve the performance of hand-written code, yet provide the functionality of a general purpose engine. Rather than relying on operators for processing data at runtime, these operators together generate code at runtime and collapse each fragment of the query, where possible, into a single function and execute that generated code instead.

> In this model, a query consists of multiple operators, and each operator presents an interface, next(), that returns a tuple at a time to the next operator in the tree.

Contents (item by item):
1. Names the mechanism directly: operators collapse into a single generated function at runtime, rather than each contributing its own interpreted step — the fusion this topic's `examples.py` confirms via the shared codegen-stage marker and the generated Java source itself.
2. Names the alternative this topic's bridge text contrasts against: the old Volcano iterator model's per-row virtual `next()` call between operators, which whole-stage codegen replaces with one fused loop.
