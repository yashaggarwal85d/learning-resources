## Dynamic Task Mapping

URL: https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/dynamic-task-mapping.html
Version: Apache Airflow 3.3.2 documentation

> Dynamic Task Mapping allows a way for a workflow to create a number of tasks at runtime based upon current data, rather than the Dag author having to know in advance how many tasks would be needed.

> Unlike a Python for-loop executed at DAG parse time, dynamic task mapping defers task creation until runtime, allowing the scheduler to determine the exact number of task instances based on upstream task outputs.

> As well as passing arguments that get expanded at run-time, it is possible to pass arguments that don’t change—in order to clearly differentiate between the two kinds we use different functions, expand() for mapped arguments, and partial() for unmapped ones.

> The make_list task runs as a normal task and must return a list or dict (see What data types can be expanded?), and then the consumer task will be called four times, once with each value in the return of make_list.

> The [core] max_map_length config option is the maximum number of tasks that expand can create – the default value is 1024.

> If a source task (make_list in our earlier example) returns a list longer than this it will result in that task failing.

> If the input is empty (zero length), no new tasks will be created and the mapped task will be marked as SKIPPED.

Note: this topic's own real demo (examples.py, FACT-CHECK.md) confirms the exact boundary against a live Airflow 3.3.2 install — 1024 mapped task instances succeed, 1025 is rejected — and reads the actual rejection error directly (`reason: unmappable_return_value_length`), which the quoted doc describes only as "that task failing," not by the specific error payload.

## RDD Programming Guide

URL: https://spark.apache.org/docs/latest/rdd-programming-guide.html
Version: Apache Spark 4.3.0 documentation

> One important parameter for parallel collections is the number of partitions to cut the dataset into. Spark will run one task for each partition of the cluster.

Note: this is the "pushing parallelism into the compute engine" side of this topic's contrast — Spark's own partitioning splits work internally within a single Spark job, rather than the orchestrator creating one task instance per unit of work. This topic's own scheduling-overhead measurement (examples.py) is Airflow's side of that contrast, not Spark's; the Spark-side overhead figure used for the comparison is a stated estimate, disclosed as such in FACT-CHECK.md.
