# Outline — de.data-classification-sensitive-data

**Kind:** full, §13.2. About 15 minutes. No lab of its own.

## Scope (full syllabus line, five clauses)

"classification schemes (public → restricted; PII, PHI, PCI), automated discovery (pattern, ML
and LLM classifiers in Macie, Purview, Unity Catalog, Sensitive Data Protection), tag propagation
along lineage, false negatives in free text; classification as the input every later policy
depends on."

- Clause 1: two orthogonal labels — a sensitivity tier (public, internal, confidential,
  restricted: how carefully to handle it) and a category (PII, PHI, PCI: which rules apply,
  a fact about the content, grounded in GDPR Article 4's definition of personal data and Article
  9's special categories).
- Clause 2: automated discovery's three techniques (pattern/checksum, trained ML models,
  LLM/agentic classifiers) as each of the four named vendor products documents its own: Macie's
  managed and custom data identifiers and its discovery jobs; Purview's built-in versus custom
  sensitive information types; Databricks' agentic-AI Data Classification; Google's Sensitive
  Data Protection infoType detectors. The runnable stand-in is a pattern-plus-Luhn-checksum
  scanner run on synthetic data.
- Clause 3: tag propagation along lineage — a tag set on one column should reach every column
  derived from it; what a hash and an aggregate each do to the tag's meaning.
- Clause 4: false negatives in free text — the `support_notes` column, where a customer's own
  phone number and partial card number sit in a sentence; measured miss rate of the pattern
  scanner versus what a model closes.
- Clause 5: classification as the input every later policy depends on — the topic's own thesis
  and recap.

## Outcomes

Assign a tier and a category to each column of the shop's `customers`, `orders` and
`support_notes` and justify each; run a pattern-and-checksum scanner on the synthetic data and
report its precision, recall and what it misses; describe how a tag should propagate through a
hash, a join and an aggregate; explain why a policy that protects only tagged columns fails open
when discovery misses a column.

## Concept ledger

- **Introduces:** `sensitivity-tier-and-category`, `automated-sensitive-data-discovery`,
  `tag-propagation-lineage`, `discovery-false-negatives`.
- **Uses:** `pipeline-golden-signals`, `structured-logs-correlation-ids` (topic 1, live in this
  chapter), `data-contract-specification`, `open-data-contract-standard` (Chapter 3, confirmed
  live under `de.data-contract-specification` in `registry.ts`).
- **Declared (gap, logged per `CHAPTER.md` §"Cross-chapter ids"):** Chapter 10 §10.5 (EU
  regulatory architecture) and §10.2 (cloud discovery products) — Chapter 10 is unplanned beyond
  its own `CHAPTER.md` (confirmed: no topic folders under
  `data-engineering/m5-platform-cloud-orchestration/ch10-cloud-data-architecture`), so
  `data-eu-regulatory-architecture-ch10` and `data-cloud-discovery-products-ch10` are declared,
  not `uses`, named as the gap here and in `post-notes.md` rather than claimed as resolved ids.
  Also declared per `CHAPTER.md`'s own topic entry: the idea that personal data is regulated
  (topic 6 draws the pseudonymisation/anonymisation line; this topic treats "personal data is
  regulated" as background the reader already has).

## Storyboard (10 steps)

1. **Hook.** The shop's scanner finds every card number and email in its structured tables;
   security signs off. Then a support agent's free-text note — a phone number and a partial card
   number typed into a sentence — sits in a nightly export nobody scanned.
2. **Predict:** does a model classifier close that miss rate entirely, partly, or does free text
   stay a genuine gap no classifier closes completely?
3. **Reveal: two labels, not one.** A sensitivity tier (how carefully) and a category (which
   rules) are orthogonal: `customers.email` is restricted and PII; `orders.total` might be
   confidential and no special category at all.
4. **Reveal: pattern and checksum detection.** Regular expressions catch a shape; a checksum
   (Luhn, for card numbers) catches a shape that's also internally consistent, cutting false
   positives on structured columns to nearly zero.
5. **Reveal: ML and LLM classifiers, by vendor.** Macie's managed identifiers add trained
   detection to pattern matching; Purview's sensitive information types are the same pattern
   core with keyword proximity; Databricks' Data Classification and Google's Sensitive Data
   Protection add a model or an agent for text a regex alone can't parse.
6. **Reveal: tag propagation along lineage.** A tag on `customers.email` should reach every
   derived column; a hash keeps the tag (still personal data) but breaks direct readability; an
   aggregate (a customer count) genuinely loses it.
7. **Reveal: false negatives in free text, measured.** The pattern scanner's precision and
   recall on `support_notes`, against the `customers`/`orders` structured columns: near-perfect
   on structured data, a real gap on free text.
8. **Reveal: classification as every later policy's input.** A missed tag isn't a missed label —
   it's a policy from topic 7, 8, 9 or 13 silently not applied to that column.
9. **Recap.**
10. **Prove it:** given a masking policy that protects only tagged columns, and a discovery
    report with a known miss rate, what fraction of restricted data actually stays unprotected?

## Visual idea

The tag flood on the chapter's pipeline strip: a restricted chip on `customers.email` spreading
downstream, turning pale at a hash, vanishing at an aggregate. A precision-recall bar pair:
structured columns near the top, free text with a visible gap, in red, with the missed rows
named.

## `examples.py` plan

Synthetic (reuses the shop's `customers` and `support_notes` columns `CHAPTER.md` names for this
chapter, generated locally, no real email or phone number):

1. `luhn_checksum_valid`: the Luhn check itself, applied to a few synthetic card numbers (some
   valid, some with a transposed digit), to show why a checksum catches what a bare pattern
   can't.
2. `pattern_and_checksum_scanner`: a regex-plus-Luhn scanner run over the structured columns,
   reporting true/false positives and negatives.
3. `free_text_miss_rate`: the same scanner run over synthetic `support_notes` strings (some with
   an embedded phone number or partial card number in prose, some without), measuring precision
   and recall versus the structured-column run.
4. `tag_propagation_through_hash_and_aggregate`: a toy lineage graph (source column → hashed
   column → aggregate) showing the tag surviving the hash and disappearing at the aggregate.
5. `unprotected_fraction_from_miss_rate`: given a masking policy that only acts on tagged
   columns and a discovery miss rate, compute the fraction of truly sensitive data left
   unprotected — the "Prove it" step's own calculation.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 3's handoff verbatim): "Observability tells you
  the platform is healthy. It says nothing about what the platform holds. Before anything can be
  protected, masked or deleted, someone has to know which columns are personal data. This topic
  is classification, and it is where the governance half of this chapter starts."
- **Handoff** (to topic 5, verbatim): "Once a column is classified restricted, the first
  protection is that it cannot be read by anyone who steals the disk. How a key hierarchy
  delivers that, and what rotating or deleting a key really does to the data, is the next topic:
  envelope encryption."

## Changes from the chapter plan

One gap, logged rather than guessed: `CHAPTER.md` cites Chapter 10 §10.5 (EU regulatory
architecture) and §10.2 (cloud discovery products) as `uses` sources for this topic. Chapter 10
is unbuilt (confirmed: only a `CHAPTER.md` plan exists under
`m5-platform-cloud-orchestration/ch10-cloud-data-architecture`, no topic folders), so both are
`declared`, not `uses`, and the gap is named here and in `post-notes.md`'s "Where this goes
next" rather than silently dropped.
