# Fact-check — de.data-contracts-as-modeling

This topic has no lab of its own (`CHAPTER.md`). Every sourced claim traces to a direct,
word-for-word quote from the Open Data Contract Standard's own specification (`SOURCES.md`,
verified by `scripts/sources.mjs check`). One claim (enforcement at the producer boundary) is
this topic's own reasoned argument, not a direct ODCS quote, and is flagged as such below and in
`coverage.json`.

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A data contract is a structured YAML document of keys and values under ODCS | ODCS definition page, quote 1 | Confirmed |
| 2 | ODCS's own current default version is v3.2.0, not the v3.1 CHAPTER.md's scope line names | ODCS fundamentals page, quote 2 | Confirmed — version drift disclosed |
| 3 | Schema ties a business representation and a physical implementation together in one artifact | ODCS schema page, quote 3 | Confirmed |
| 4 | A schema field can carry its business name directly, alongside its physical type (`businessName`) | ODCS schema page, quote 4 | Confirmed |
| 5 | Quality rules are a named, specified section of the contract | ODCS data-quality page, quote 5 | Confirmed |
| 6 | Quality rules are explicitly tied to the schema they check, not a separate concern | ODCS data-quality page, quote 6 | Confirmed |
| 7 | SLAs are their own named, specified section | ODCS SLA page, quote 7 | Confirmed |
| 8 | Each SLA property has a required, structured value from an enumerated list | ODCS SLA page, quote 8 | Confirmed |
| 9 | Ownership is tracked as part of the contract's own team structure | ODCS team page, quote 9 | Confirmed |
| 10 | The standard's own worked example names a team member's role explicitly as "Owner" | ODCS team page, quote 10 | Confirmed |

## This topic's own reasoned claim (step 7, enforcement at the producer boundary)

CHAPTER.md's own scope line names "enforcement at the producer boundary" as a required clause,
but no fetched ODCS page states this as a rule in so many words — the standard specifies *what*
a contract contains, not *where* in a pipeline it must be checked. This topic argues the point
rather than quoting it: a check that only runs after data has already reached a downstream
warehouse has let every consumer between the producer and that check already see the bad data,
so enforcement has to happen at the point the producer emits the data to actually prevent that,
not merely detect it afterward. Flagged in `coverage.json`'s expert block as the topic's own
reasoning, not a primary-source quote.

## Red-team: the three predicts

- **Step 3** (must a contract pick between business meaning and physical layout?): the
  plausible wrong answer is "yes, those need separate documents since they serve different
  audiences." The reveal at step 4 corrects this with ODCS's own words — schema explicitly ties
  both together in the same artifact.
- **Step 6** (is a downstream check late enough to count as enforcement?): the plausible wrong
  answer is "yes, catching it anywhere before a human looks at a report is enforcement." The
  reveal at step 7 corrects this with this topic's own reasoned argument — a downstream-only
  check has already let every intermediate consumer see the bad data, so it detects rather than
  prevents.
- **Step 9** (does a contract leave ownership implicit?): the plausible wrong answer is "yes,
  whoever wrote the pipeline is assumed to own it, so it doesn't need to be written down." The
  reveal at step 10 corrects this with ODCS's own worked example — "Owner" is a named, explicit
  role in the contract's team structure, not an assumption left outside it.

## Checks run

- `node scripts/sources.mjs check` — 11/11 quotes verified word for word, 0 problems.
- `python3 examples.py` — pass.
