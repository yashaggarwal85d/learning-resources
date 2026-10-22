# Fact-check — de.data-mesh-data-products

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a direct, word-for-word
quote from Zhamak Dehghani's own writing (`SOURCES.md`, verified by `scripts/sources.mjs check`).
No numeric claim is made beyond what the sources state qualitatively.

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Domain ownership reverses the flow: domains host and serve their own datasets instead of flowing data into a centrally owned lake | Dehghani, monolith-to-mesh, quote 1 | Confirmed |
| 2 | Data as a product requires a data registry/catalogue for discoverability | Dehghani, monolith-to-mesh, quote 2 | Confirmed |
| 3 | A data product needs a unique, programmatically accessible address | Dehghani, monolith-to-mesh, quote 3 | Confirmed |
| 4 | Trustworthiness requires an honest, stated quality guarantee, not ad hoc cleansing after the fact | Dehghani, monolith-to-mesh, quote 4 | Confirmed |
| 5 | Inter-operability requires shared standards for correlating data across domains | Dehghani, monolith-to-mesh, quote 5 | Confirmed |
| 6 | Decentralizing ownership without a shared platform costs every domain duplicated effort and specialized skill | Dehghani, monolith-to-mesh, quote 6 | Confirmed |
| 7 | The four principles — domain ownership, data as a product, self-serve platform, federated governance — are Dehghani's own named list | Dehghani, mesh-principles, quote 7 | Confirmed |
| 8 | The four principles are stated as collectively necessary and sufficient, not independently substitutable | Dehghani, mesh-principles, quote 8 | Confirmed |
| 9 | The self-serve platform principle exists specifically to remove the specialized infrastructure skill domain ownership would otherwise require in every domain | Dehghani, mesh-principles, quote 9 | Confirmed |
| 10 | Federated computational governance is domain-local autonomy plus a small set of globally enforced, platform-automated rules | Dehghani, mesh-principles, quote 10 | Confirmed |

## Red-team: the three predicts

- **Step 3** (does domain ownership alone make data trustworthy to everyone else?): the
  plausible wrong answer is "yes, since the domain that owns the data understands it best." The
  reveal at steps 4-5 corrects this — Dehghani's own data-product standard is a separate,
  explicit checklist (discoverable, addressable, trustworthy, inter-operable); ownership alone
  satisfies none of the four on its own.
- **Step 6** (does decentralizing cost nothing extra, since domains already run their own
  operational systems?): the plausible wrong answer is "no extra cost, since domains are already
  building infrastructure for their operational side." The reveal at step 7 corrects this with
  Dehghani's own words — analytical data infrastructure is a genuinely different, specialized
  skill set from operational services, and replicating it in every domain is a real, named cost.
- **Step 9** (does the mesh still work with domain ownership and data-as-a-product adopted, but
  no shared platform yet?): the plausible wrong answer is "yes, the organizational principles
  are what matter; the platform is just convenience tooling." The reveal at step 10 corrects
  this — Dehghani's own stated reason for the self-serve platform principle is that without it,
  the specialized infrastructure cost lands on every domain separately, which is exactly the
  failure mode CHAPTER.md's own scope line names.

## This topic's own closing claim (step 13, "Prove it")

The scenario (domain ownership and data-as-a-product rolled out before the self-serve platform
is ready) is this topic's own reasoned application of quote 6 and quote 9, not a new
primary-source claim: every domain pays the full specialized infrastructure cost on its own,
exactly the duplicated-effort problem Dehghani names as the self-serve platform principle's own
reason to exist. Flagged in `coverage.json`'s expert block as the topic's own reasoning.

## Checks run

- `node scripts/sources.mjs check` — 10/10 quotes verified word for word, 0 problems.
- `python3 examples.py` — pass.
