# FACT-CHECK: Workload identity and least privilege

Self-review, fact-check and red team, 2026-10-30. Each row re-derives the claim from the fetched
source text in `sources/`, checks the quote actually supports it, and tries to break it with an
edge case.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | IRSA maps an IAM role to a Kubernetes service account via an OIDC provider; the private signing key rotates every 7 days. | Confirmed | `sources/aws-irsa.txt`: "you associate an IAM role with a Kubernetes service account"; "the private key rotates every 7 days." |
| 2 | EKS Pod Identity is OIDC-free and uses one reusable IAM principal (`pods.eks.amazonaws.com`) instead of a per-cluster OIDC provider. | Confirmed | `sources/aws-pod-identity.txt`: "EKS Pod Identity is a simpler method than IAM roles for service accounts, as this method doesn't use OIDC identity providers"; "EKS Pod Identity uses a single IAM principal instead of the separate principals for each cluster that IAM roles for service accounts use," with the quoted trust-policy JSON block. |
| 3 | GKE Workload Identity Federation creates a fixed per-project workload identity pool (`PROJECT_ID.svc.id.goog`); enabling it alone grants no IAM permissions. | Confirmed | `sources/gke-workload-identity.txt`: "Creates a fixed workload identity pool for the cluster's Google Cloud project with the following format: PROJECT_ID.svc.id.goog"; "Enabling Workload Identity Federation for GKE on the cluster doesn't grant your workloads any additional IAM permissions." |
| 4 | Entra workload identity federation names Kubernetes (including non-Azure clusters) as a supported external-workload scenario, and the token-exchange workflow is the same across every supported scenario. | Confirmed | `sources/entra-workload-id-federation.txt`: "Workloads running on any Kubernetes cluster (Azure Kubernetes Service (AKS), Amazon Web Services EKS, Google Kubernetes Engine (GKE), or on-premises)"; "The workflow for exchanging an external token for an access token is the same, however, for all scenarios," followed by the 6-step workflow, each step quoted. |
| 5 | A permissions boundary limits but never grants permissions; effective permissions are the intersection of an identity-based policy and the boundary. | Confirmed | `sources/aws-permission-boundaries.txt`: "When you use a policy to set the permissions boundary for a user, it limits the user's permissions but does not provide permissions on its own"; "The effective permissions are the intersection of both policy types." Red-team check: re-derived the Shirley worked example directly in `examples.py` rather than only citing the prose, to confirm the intersection rule holds on a concrete action (`iam:CreateUser`), not just as a general statement. |
| 6 | An SCP never grants permissions either, and restricts even a member account's root user; it does not apply to the organization's management account. | Confirmed | `sources/aws-scp.txt`: "SCPs do not grant permissions... No permissions are granted by an SCP"; "An SCP restricts permissions for IAM users and roles in member accounts, including the member account's root user"; "SCPs don't affect users or roles in the management account." |
| 7 | `iam:PassRole` is the specific, documented mechanism AWS names for the escalation where a principal that can create a resource and pass it an over-permissioned role gains that role's permissions by proxy; scoping the Resource element of the PassRole statement is AWS's own named fix. | Confirmed | `sources/aws-passrole.txt`: the Alice/Amazon-S3 worked example quoted verbatim ("If Alice could pass a role to a service that allows Amazon S3 actions, the service could perform Amazon S3 actions on behalf of Alice"); "To limit the user to passing only approved roles, you can filter the iam:PassRole permission with the Resources element of the IAM policy statement." |

## Red team on the predict question (step 2)

Edge case tried: could a learner object that encryption-at-rest or a firewall on the stolen
laptop would have been just as effective as a short-lived scoped credential? Checked against the
hook's own framing: the theft already happened in both halves — the laptop's defenses already
failed. The only variable left that determined the blast radius is a property of the credential
itself (lifetime and scope), not of the device it was stolen from. The wrong options were worded
to tempt exactly the device-hardening instinct, and the explain text names the distinction
directly rather than just stating the correct answer.

## Red team on step 6's reproduction

Edge case tried: is Resource-scoping on PassRole a complete fix, or does it just narrow the
attack surface? Checked against the source's own wording: AWS frames it as "limit the user to
passing only approved roles" — a scoping control, not a claim of total elimination. The topic's
own step 9 (prove it) deliberately reopens the gap with a policy that looks safe at write-time
but isn't, so the topic does not overclaim that Resource-scoping alone makes the escalation path
disappear forever; it only closes the specific gap demonstrated in step 6.

## Outcome

No claim dropped. All five `examples.py` reproductions ran and their asserted values are the
ones shown on screen. The PassRole escalation, the permission-boundary cap and the SCP cap are
each a local policy-evaluator simulation, not a real AWS account — disclosed in OUTLINE.md's
"Changes from the chapter plan" (which records that nothing changed, since CHAPTER.md's own plan
already called for a local simulation here).
