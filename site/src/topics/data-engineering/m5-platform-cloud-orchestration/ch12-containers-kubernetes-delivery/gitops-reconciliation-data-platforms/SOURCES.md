## Argo CD documentation, Architectural Overview

URL: https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/
Version: stable, fetched 2026-10-30

> The application controller is a Kubernetes controller which continuously monitors running applications and compares the current, live state against the desired target state (as specified in

## Argo CD documentation, Automated Sync Policy

URL: https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/
Version: stable, fetched 2026-10-30

> By default, changes that are made to the live cluster will not trigger automated sync. To enable automatic sync when the live cluster's state deviates from the state defined in Git, run:

> By default (and as a safety mechanism), automated sync will not delete resources when Argo CD detects the resource is no longer defined in Git.

> By default (and as a safety mechanism), automated sync with prune have a protection from any automation/human errors when there are no target resources. It prevents application from having empty resources.

> An automated sync will only be performed if the application is OutOfSync. Applications in a Synced or error state will not attempt automated sync.

> Automated sync will only attempt one synchronization per unique combination of commit SHA1 and application parameters.

## Argo CD documentation, Sync Options

URL: https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/
Version: stable, fetched 2026-10-30

> You may wish to prevent an object from being pruned:

> argocd.argoproj.io/sync-options: Prune=false

Re-read 2026-11-08 for what a sync applies (the hook's answer):

> The default behavior when syncing your application is to apply every object in the application.

> By default, Argo CD executes the kubectl apply operation to apply the configuration stored in Git.

> However during the sync stage, the desired state is applied as-is. The patch is calculated using a 3-way-merge between the live state the desired state and the last-applied-configuration annotation.

> If the ServerSideApply=true sync option is set, Argo CD will use the kubectl apply --server-side --force-conflicts

## Kubernetes documentation, Declarative Management of Kubernetes Objects Using Configuration Files

URL: https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/
Version: fetched 2026-11-08

The three-way merge `kubectl apply` performs, which examples.py's `three_way_apply()` reproduces.

> Calculate the fields to delete. These are the fields present in last-applied-configuration and missing from the configuration file.

> Calculate the fields to add or set. These are the fields present in the configuration file whose values don't match the live configuration.

> The replicas field retains the value of 2 set by kubectl scale.

> This is possible because it is omitted from the configuration file.

## Argo CD documentation, Diff Customization

URL: https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/
Version: stable, fetched 2026-10-30

> The following sample application is configured to ignore differences in spec.replicas for all deployments:

> spec:
> ignoreDifferences:
> - group: apps
> kind: Deployment
> jsonPointers:
> - /spec/replicas

## Argo CD documentation, Helm

URL: https://argo-cd.readthedocs.io/en/stable/user-guide/helm/
Version: stable, fetched 2026-10-30

> Helm is only used to inflate charts with helm template. The lifecycle of the application is handled by Argo CD instead of Helm.

## Flux documentation, Core Concepts

URL: https://fluxcd.io/flux/concepts/
Version: fetched 2026-10-30

> GitOps is a way of managing your infrastructure and applications so that whole system is described declaratively and version controlled, and having an automated process that ensures that the deployed environment matches the state specified in one or more Git repositories.

> Gitless GitOps was pioneered by the Flux team

> with the introduction of the

> OCIRepository source type and

> Flux OCI Artifact media type.

> In the Gitless GitOps model, the Flux controllers are fully decoupled from Git, relying solely on container registries as the source of truth for the desired state of Kubernetes clusters.

## External Secrets Operator documentation, Overview

URL: https://external-secrets.io/latest/introduction/overview/
Version: latest, fetched 2026-10-30

> The External Secrets Operator extends Kubernetes with Custom Resources,

> which define where secrets live and how to synchronize them. The controller

> fetches secrets from an external API and creates Kubernetes

> secrets. If the

> secret from the external API changes, the controller will reconcile the state in

> the cluster and update the secrets accordingly.

## SOPS, README

URL: https://raw.githubusercontent.com/getsops/sops/main/README.rst
Version: fetched 2026-10-30, main branch

> **SOPS** is an editor of encrypted files that supports YAML, JSON, ENV, INI and BINARY

> formats and encrypts with AWS KMS, GCP KMS, Azure Key Vault, HuaweiCloud KMS, age, and PGP.

## Argo Rollouts documentation, Overview

URL: https://argo-rollouts.readthedocs.io/en/stable/
Version: stable, fetched 2026-10-30

> Argo Rollouts is a Kubernetes controller and set of CRDs which provide advanced deployment capabilities such as blue-green, canary, canary analysis, experimentation, and progressive delivery features to Kubernetes.
