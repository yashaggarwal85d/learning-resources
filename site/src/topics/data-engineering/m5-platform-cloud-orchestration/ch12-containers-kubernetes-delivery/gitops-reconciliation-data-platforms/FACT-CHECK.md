# Fact-check — `de.gitops-reconciliation-data-platforms`

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | Argo CD's application controller continuously compares live state against the desired target state, taken from Git | Argo CD Architectural Overview | ✅ quoted |
| 2 | Flux defines GitOps as declaratively describing and version-controlling the whole system, with an automated process that keeps the deployed environment matching Git | Flux Core Concepts | ✅ quoted |
| 3 | Flux's newer "Gitless GitOps" direction uses an `OCIRepository` source type so an OCI-compliant registry, not only Git, can be the source of truth | Flux Core Concepts | ✅ quoted |
| 4 | Helm is used only to render ("inflate") charts with `helm template`; Argo CD, not Helm, manages the application's lifecycle | Argo CD Helm docs | ✅ quoted |
| 5 | By default, automated sync does not react to live cluster changes; self-heal must be explicitly enabled | Argo CD Automated Sync Policy docs | ✅ quoted |
| 6 | By default, automated sync will not delete (prune) resources no longer in Git, and pruning-to-empty has its own separate guard | Argo CD Automated Sync Policy docs | ✅ quoted |
| 7 | An automated sync only runs when the application is `OutOfSync`; an application already `Synced` or in an error state will not be auto-synced | Argo CD Automated Sync Policy docs | ✅ quoted |
| 8 | `Prune=false` as a per-resource annotation opts a specific resource out of pruning | Argo CD Sync Options docs | ✅ quoted |
| 9 | `ignoreDifferences` on `spec.replicas` for Deployments is Argo CD's own worked example for a field another controller (an autoscaler) legitimately owns | Argo CD Diff Customization docs | ✅ quoted |
| 10 | External Secrets Operator's custom resources define where secrets live and sync them from an external API, reconciling the cluster's Secret when the source changes | External Secrets Operator Overview | ✅ quoted |
| 11 | SOPS encrypts files with AWS KMS, GCP KMS, Azure Key Vault, HuaweiCloud KMS, age, and PGP | SOPS README | ✅ quoted |
| 12 | Argo Rollouts is a controller and CRD set providing blue-green, canary, canary analysis, experimentation, and progressive delivery | Argo Rollouts Overview | ✅ quoted |
| 13 | Chapter 10 §10.4 (IaC/FinOps) and Chapter 11 §11.4 (CI/CD, write-audit-publish) don't exist yet in `registry.ts` | direct `registry.ts` inspection | ✅ confirmed by grep, see OUTLINE.md |

## Red-team notes

- Did not claim SOPS itself protects against a decrypted Secret already applied to the cluster being read by anyone with cluster access — CHAPTER.md's own clause says this explicitly ("each with what it protects and what it still exposes"), and the README gives no further guarantee here either, so the topic states the exposure plainly rather than implying SOPS solves it.
- The "a deployment that restarts a stateful job from empty state is a data incident" claim in step 10 is explicitly design reasoning drawn from topic 7's already-sourced upgrade-mode facts (stateless mode starts from nothing), not a new claim attributed to Argo Rollouts' own documentation — Argo Rollouts' docs don't discuss Flink specifically. Marked as reasoning, not sourced, per CHAPTER.md's own instruction for this clause.
- Checked that `flink-operator-upgrade-modes` and `statefulset-stable-identity-storage` (both needed for `uses`) are genuinely `introduces`d by `de.stateful-streaming-on-kubernetes` in `registry.ts` before using them, rather than assuming topic 7 introduced them under different names.
- Did not fabricate a specific Argo CD reconciliation-interval default beyond what the docs state (120s with up to 60s jitter) — not used in this topic's on-screen claims since it's not central to the scope clauses, but checked against the Automated Sync Policy page in case a number was needed; none was used, so no digit-check concern.
