## AWS: IAM roles for service accounts (IRSA)

URL: https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
Version: fetched 2026-10-30

> IAM roles for service accounts (IRSA) provide the ability to manage credentials for your applications, similar to the way that Amazon EC2 instance profiles provide credentials to Amazon EC2 instances. Instead of creating and distributing your AWS credentials to the containers or using the Amazon EC2 instance's role, you associate an IAM role with a Kubernetes service account and configure your Pods to use the service account.

> Least privilege – You can scope IAM permissions to a service account, and only Pods that use that service account have access to those permissions. This feature also eliminates the need for third-party solutions such as kiam or kube2iam.

> In 2014, AWS Identity and Access Management added support for federated identities using OpenID Connect (OIDC). This feature allows you to authenticate AWS API calls with supported identity providers and receive a valid OIDC JSON web token (JWT). You can pass this token to the AWS STS AssumeRoleWithWebIdentity API operation and receive IAM temporary role credentials.

> Each JWT token is signed by a signing key pair. The keys are served on the OIDC provider managed by Amazon EKS and the private key rotates every 7 days.

Contents: how IRSA maps a Kubernetes service account to an IAM role via an OIDC provider; the credential-isolation, least-privilege and auditability benefits; the note that containers are not a security boundary even with IRSA enabled.

## AWS: EKS Pod Identity

URL: https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html
Version: fetched 2026-10-30

> EKS Pod Identities provide the ability to manage credentials for your applications, similar to the way that Amazon EC2 instance profiles provide credentials to Amazon EC2 instances. Instead of creating and distributing your AWS credentials to the containers or using the Amazon EC2 instance's role, you associate an IAM role with a Kubernetes service account and configure your Pods to use the service account.

> EKS Pod Identity is a simpler method than IAM roles for service accounts, as this method doesn't use OIDC identity providers.

> Independent operations – In many organizations, creating OIDC identity providers is a responsibility of different teams than administering the Kubernetes clusters. EKS Pod Identity has clean separation of duties, where all configuration of EKS Pod Identity associations is done in Amazon EKS and all configuration of the IAM permissions is done in IAM.

> Reusability – EKS Pod Identity uses a single IAM principal instead of the separate principals for each cluster that IAM roles for service accounts use.

Contents: EKS Pod Identity as a newer, OIDC-free alternative to IRSA with the same least-privilege/credential-isolation/auditability benefits; a single IAM principal (`pods.eks.amazonaws.com`) reusable across clusters instead of one OIDC provider per cluster; the EKS Pod Identity Agent running as a per-node DaemonSet.

## Google Cloud: Workload Identity Federation for GKE

URL: https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
Version: fetched 2026-10-30

> Workload Identity Federation for GKE lets you use IAM policies to grant Kubernetes workloads in your GKE cluster access to specific Google Cloud APIs without needing manual configuration or less secure methods like service account key files. Using Workload Identity Federation for GKE lets you assign distinct, fine-grained identities and authorization for each application in your cluster.

> When you enable Workload Identity Federation for GKE on a cluster, GKE does the following: Creates a fixed workload identity pool for the cluster's Google Cloud project with the following format: PROJECT_ID.svc.id.goog

> Note: Enabling Workload Identity Federation for GKE on the cluster doesn't grant your workloads any additional IAM permissions.

Contents: Workload Identity Federation for GKE replacing long-lived service account key files with a per-cluster workload identity pool; how an IAM allow policy grants access to a principal corresponding to a specific Kubernetes ServiceAccount, scoped via `principal://iam.googleapis.com/.../workloadIdentityPools/PROJECT_ID.svc.id.goog/subject/ns/NAMESPACE/sa/SERVICEACCOUNT`; enabling the feature alone grants no permissions by itself.

## Microsoft Entra: Workload identity federation

URL: https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation
Version: fetched 2026-10-30

> For a software workload running outside of Azure, or those running in Azure but use app registrations for their identities, you need to use application credentials (a secret or certificate) to access Microsoft Entra protected resources (such as Azure, Microsoft Graph, Microsoft 365, or third-party resources). These credentials pose a security risk and have to be stored securely and rotated regularly. You also run the risk of service downtime if the credentials expire.

> You use workload identity federation to configure a user-assigned managed identity or app registration in Microsoft Entra ID to trust tokens from an external identity provider (IdP), such as GitHub or Google.

> Once that trust relationship is created, your external software workload exchanges trusted tokens from the external IdP for access tokens from Microsoft identity platform.

> Workloads running on any Kubernetes cluster (Azure Kubernetes Service (AKS), Amazon Web Services EKS, Google Kubernetes Engine (GKE), or on-premises). Establish a trust relationship between your user-assigned managed identity or app in Microsoft Entra ID and a Kubernetes workload (described in the workload identity overview).

> The external workload (such as a GitHub Actions workflow) requests a token from the external IdP (such as GitHub).

> The external IdP issues a token to the external workload.

> The external workload (the sign in action in a GitHub workflow, for example) sends the token to Microsoft identity platform and requests an access token.

> Microsoft identity platform checks the trust relationship on the user-assigned managed identity or app registration and validates the external token against the OpenID Connect (OIDC) issuer URL on the external IdP.

> When the checks are satisfied, Microsoft identity platform issues an access token to the external workload.

Contents: the token-exchange workflow shared by every workload identity federation scenario (external IdP token traded for a Microsoft Entra access token after trust-relationship validation); Kubernetes (including non-Azure clusters like EKS and GKE) named as a supported external workload scenario; eliminating the need to manage a stored secret or certificate.

## AWS: Permissions boundaries for IAM entities

URL: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html
Version: fetched 2026-10-30

> A permissions boundary is an advanced feature for using a managed policy to set the maximum permissions that an identity-based policy can grant to an IAM entity. An entity's permissions boundary allows it to perform only the actions that are allowed by both its identity-based policies and its permissions boundaries.

> When you use a policy to set the permissions boundary for a user, it limits the user's permissions but does not provide permissions on its own.

> Identity-based policies are inline or managed policies that are attached to a user, group of users, or role. Identity-based policies grant permission to the entity, and permissions boundaries limit those permissions. The effective permissions are the intersection of both policy types. An explicit deny in either of these policies overrides the allow.

Contents: a worked example (the "Shirley" user) showing a permissions boundary blocking `iam:CreateUser` even though a separate identity-based policy allows it, because effective permissions are the intersection of the two; permissions boundaries never grant access by themselves.

## AWS: Grant a user permissions to pass a role to an AWS service (`iam:PassRole`)

URL: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_passrole.html
Version: fetched 2026-10-30

> To pass a role (and its permissions) to an AWS service, a user must have permissions to pass the role to the service. This helps administrators ensure that only approved users can configure a service with a role that grants permissions.

> When setting the PassRole permission, you should make sure that a user doesn't pass a role where the role has more permissions than you want the user to have. For example, Alice might not be allowed to perform any Amazon S3 actions. If Alice could pass a role to a service that allows Amazon S3 actions, the service could perform Amazon S3 actions on behalf of Alice when executing the job.

> A user can pass a role ARN as a parameter in any API operation that uses the role to assign permissions to the service. The service then checks whether that user has the iam:PassRole permission.

Contents: the exact escalation shape named by AWS itself — a principal with `iam:PassRole` plus the ability to launch a resource that assumes a role ends up with that role's permissions by proxy, demonstrated with the Alice/Amazon S3 example; the `iam:PassedToService` condition key as the documented way to scope which service a role may be passed to.

## AWS: Service control policies (SCPs)

URL: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html
Version: fetched 2026-10-30

> SCPs offer central control over the maximum available permissions for the IAM users and IAM roles in your organization.

> SCPs do not grant permissions to the IAM users and IAM roles in your organization. No permissions are granted by an SCP. An SCP defines a permission guardrail, or sets limits, on the actions that the IAM users and IAM roles in your organization can perform.

> An SCP restricts permissions for IAM users and roles in member accounts, including the member account's root user. Any account has only those permissions permitted by every parent above it.

> SCPs don't affect users or roles in the management account. They affect only the member accounts in your organization.

Contents: an SCP as the same ceiling-not-grant mechanism as a permissions boundary, applied at the organization/account level instead of to one entity, restricting even a member account's root user; the management account itself sits outside any SCP's reach.
