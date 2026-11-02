## Spark documentation, Running Spark on Kubernetes

URL: https://spark.apache.org/docs/4.2.0/running-on-kubernetes.html

> Spark creates a Spark driver running within a Kubernetes pod.
> The driver creates executors which are also running within Kubernetes pods and connects to them, and executes application code.
> When the application completes, the executor pods terminate and are cleaned up, but the driver pod persists
> logs and remains in "completed" state in the Kubernetes API until it's eventually garbage collected or manually cleaned up.

> Note that in the completed state, the driver pod does not use any computational or memory resources.

> If you run your Spark driver in a pod, it is highly recommended to set spark.kubernetes.driver.pod.name to the name of that pod.
> When this property is set, the Spark scheduler will deploy the executor pods with an
> OwnerReference, which in turn will
> ensure that once the driver pod is deleted from the cluster, all of the application's executor pods will also be deleted.

> Kubernetes allows defining pods from template files.
> Spark users can similarly use template files to define the driver or executor pod configurations that Spark configurations do not support.
> To do so, specify the spark properties spark.kubernetes.driver.podTemplateFile and spark.kubernetes.executor.podTemplateFile
> to point to files accessible to the spark-submit process.

> It is important to note that Spark is opinionated about certain pod configurations so there are values in the
> pod template that will always be overwritten by Spark.

## Spark documentation, Configuration

URL: https://spark.apache.org/docs/4.2.0/configuration.html

> Enables shuffle file tracking for executors, which allows dynamic allocation
> without the need for an external shuffle service. This option will try to keep alive executors
> that are storing shuffle data for active jobs.

> When decommission enabled, Spark will try its best to shut down the executor gracefully.
> Spark will try to migrate all the RDD blocks (controlled by spark.storage.decommission.rddBlocks.enabled)
> and shuffle blocks (controlled by spark.storage.decommission.shuffleBlocks.enabled) from the decommissioning
> executor to a remote executor when spark.storage.decommission.enabled is enabled.
> With decommission enabled, Spark will also decommission an executor instead of killing when spark.dynamicAllocation.enabled enabled.

> Whether to transfer shuffle blocks during block manager decommissioning. Requires a migratable shuffle resolver
> (like sort based shuffle).

## Apache Spark K8s Operator, README

URL: https://raw.githubusercontent.com/apache/spark-kubernetes-operator/master/README.md

> Apache Spark™ K8s Operator is a subproject of [Apache Spark](https://spark.apache.org/) and
> aims to extend K8s resource manager to manage Apache Spark applications via
> [Operator Pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

## Kubeflow Spark Operator, README

URL: https://raw.githubusercontent.com/kubeflow/spark-operator/master/README.md

> The Kubernetes Operator for Apache Spark aims to make specifying and running [Spark](https://github.com/apache/spark) applications as easy and idiomatic as running other workloads on Kubernetes. It uses
> [Kubernetes custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) for specifying, running, and surfacing status of Spark applications.

## Apache Celeborn, project home page

URL: https://celeborn.apache.org/

> Celeborn is an intermediate data service for Big Data compute engines (i.e. ETL, OLAP and Streaming engines)
> to boost performance, stability, and flexibility. Intermediate data typically include shuffle and spilled data.

## AWS documentation, What is Amazon EMR on EKS?

URL: https://docs.aws.amazon.com/emr/latest/EMR-on-EKS-DevelopmentGuide/emr-eks.html

> Amazon EMR on EKS provides a deployment option for Amazon EMR that allows you to run open-source big data
> frameworks on Amazon Elastic Kubernetes Service (Amazon EKS). With this deployment option, you can focus on running analytics
> workloads while Amazon EMR on EKS builds, configures, and manages containers for open-source
> applications.

## AWS documentation, Spot Instance interruption notices

URL: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html

> A Spot Instance interruption notice is a warning that is issued
> two minutes before Amazon EC2 stops or terminates your Spot Instance. If you specify hibernation
> as the interruption behavior, you receive an interruption notice, but you do not
> receive a two-minute warning because the hibernation process begins
> immediately.

## Google Cloud documentation, Managed Service for Apache Spark on GKE overview

URL: https://docs.cloud.google.com/managed-spark/docs/concepts/gke-overview

> "Managed Service for Apache Spark" is the new name for the product formerly known as "Dataproc on Compute Engine" (cluster deployment) and "Google Cloud Serverless for Apache Spark" (serverless deployment).

> Managed Service for Apache Spark on GKE deploys Managed Service for Apache Spark virtual clusters on
> a GKE cluster. Unlike
> Managed Service for Apache Spark on Compute Engine clusters,
> Managed Service for Apache Spark on GKE virtual clusters don't include separate
> master and worker VMs. Instead, when you create a Managed Service for Apache Spark on GKE virtual cluster,
> Managed Service for Apache Spark on GKE creates node pools within a GKE cluster. Managed Service for Apache Spark on GKE 
> jobs are run as pods on these node pools. The node pools and
> scheduling of pods on the node pools are managed by GKE.

## Kueue documentation, Overview

URL: https://kueue.sigs.k8s.io/docs/overview/

> Kueue is a kubernetes-native system that manages quotas and how jobs consume them. Kueue decides when a job should wait, when a job should be admitted to start (as in pods can be created) and when a job should be preempted (as in active pods should be deleted).
