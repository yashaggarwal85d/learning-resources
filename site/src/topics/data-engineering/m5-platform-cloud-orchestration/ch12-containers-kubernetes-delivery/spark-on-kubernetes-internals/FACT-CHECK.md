# Fact-check — `de.spark-on-kubernetes-internals`

| # | Claim in the reel | Source | Verified |
|---|---|---|---|
| 1 | `spark-submit` against a `k8s://` master starts a driver pod, which creates executor pods and connects to them | Spark docs, Running Spark on Kubernetes | yes — quoted verbatim |
| 2 | When the application completes, executor pods terminate and are cleaned up, but the driver pod persists in "completed" state, using no resources | Spark docs, Running Spark on Kubernetes | yes — quoted verbatim |
| 3 | Setting `spark.kubernetes.driver.pod.name` makes Spark deploy executor pods with an `OwnerReference` to the driver, so the driver's deletion removes them | Spark docs, Running Spark on Kubernetes (Client Mode Executor Pod Garbage Collection) | yes — quoted verbatim |
| 4 | `spark.dynamicAllocation.shuffleTracking.enabled` keeps alive executors holding shuffle data for active jobs, without needing an external shuffle service | Spark configuration docs | yes — quoted verbatim |
| 5 | `spark.dynamicAllocation.shuffleTracking.timeout` defaults to infinity | Spark configuration docs | yes — quoted verbatim ("infinity" is the documented default value, not a narration embellishment) |
| 6 | `spark.decommission.enabled` tries to shut an executor down gracefully, migrating RDD and shuffle blocks to another executor | Spark configuration docs | yes — quoted verbatim |
| 7 | `spark.storage.decommission.shuffleBlocks.enabled` requires a migratable shuffle resolver (sort-based shuffle) | Spark configuration docs | yes — quoted verbatim |
| 8 | A Spot Instance interruption notice is issued two minutes before AWS stops or terminates the instance (except hibernation, which gets no two-minute lead) | AWS documentation, Spot Instance interruption notices | yes — quoted verbatim |
| 9 | `podTemplateFile` carries configuration Spark's own properties don't support, but values Spark is opinionated about are always overwritten by Spark regardless of the template | Spark docs, Running Spark on Kubernetes (Pod Template) | yes — quoted verbatim |
| 10 | The Apache Spark K8s Operator is a subproject of Apache Spark, extending Kubernetes via the Operator Pattern, with `SparkApplication` and `SparkCluster` custom resources | Apache Spark K8s Operator README | yes — subproject/operator-pattern line quoted verbatim; `sparkapp`/`sparkcluster` kubectl commands confirmed directly in the README's own worked example (not separately quoted, since they're CLI output, not prose) |
| 11 | The Kubeflow Spark Operator is a separate project using Kubernetes custom resources to make running Spark applications as idiomatic as other Kubernetes workloads | Kubeflow Spark Operator README | yes — quoted verbatim |
| 12 | Apache Celeborn is an intermediate data service for shuffle and spilled data, decoupling that data from the compute engine's own executors | Apache Celeborn project page | yes — quoted verbatim |
| 13 | EMR on EKS runs EMR-managed open-source big data frameworks (including Spark) on an existing Amazon EKS cluster | AWS documentation, What is Amazon EMR on EKS? | yes — quoted verbatim |
| 14 | Google's current name for the GKE Spark offering is "Managed Service for Apache Spark on GKE," which creates node pools inside an existing GKE cluster rather than separate master/worker VMs | Google Cloud documentation, Managed Service for Apache Spark on GKE overview | yes — both the rename and the architecture claim quoted verbatim |

## Red-team notes

- The reel never claims Kubernetes "cannot" run an external shuffle service — the sourced claim is narrower: dynamic allocation on Kubernetes needs shuffle tracking *because* no such service is wired in by default, which is what the `shuffleTracking.enabled` doc text actually supports. The stronger "Kubernetes doesn't support an external shuffle service at this time" phrasing from an earlier (unverifiable) draft of this claim was dropped rather than guessed into the quote.
- The hook's spot-interruption framing uses AWS's own two-minute figure, but the reel doesn't claim Spark's decommission window is exactly two minutes in general — only that the shop's hypothetical runs on spot nodes carrying that AWS-documented warning, and decommissioning is Spark's own mechanism for using whatever warning time it's given.
- `shuffleTracking.timeout`'s infinity default is presented as a genuine operational cost (an executor may never idle out on its own), not as a bug — the doc's own next sentence says Spark relies on the shuffle being garbage collected instead, which the reel's framing matches.
- The operators step keeps the Apache Spark K8s Operator and the Kubeflow Spark Operator named as two separate, real projects with separate custom-resource APIs (`SparkApplication`/`SparkCluster` under `spark.apache.org` vs. `SparkApplication` under `sparkoperator.k8s.io`) — neither is presented as superseding the other, since both are active per their own repositories.
