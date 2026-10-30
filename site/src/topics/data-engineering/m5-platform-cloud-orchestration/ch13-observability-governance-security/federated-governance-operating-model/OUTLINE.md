# Outline — de.federated-governance-operating-model

## Syllabus clauses (4, each a literal substring of the syllabus line)

1. "domain teams own data products, a platform team supplies self-serve tooling, central policy is applied computationally"
2. "reverse Conway's law"
3. "what must stay human stewardship (criticality, retention exceptions, ambiguous PII classification) vs what to automate"
4. "links to §3.4 (data mesh) and §19.1 (team topology)"

## Concept ledger

**Introduces:** `federated-computational-governance`, `reverse-conways-law`,
`automate-vs-human-stewardship`, `self-serve-table-registration-gate`.

**Uses (confirmed live in `registry.ts`):** `data-mesh-four-principles`, `data-as-a-product`
(Chapter 3), `data-contract-specification`, `open-data-contract-standard` (Chapter 3),
`sensitivity-tier-and-category` (topic 4), `abac-tag-based-policy` (topic 7),
`row-column-policies-in-engine` (topic 8 — corrected: `CHAPTER.md`'s planning-time guess
`engine-enforced-row-column-security` does not exist anywhere in `registry.ts`; topic 8's own
entry was read directly and its real `introduces` array is
`['row-column-policies-in-engine', 'policy-pruning-caching-cost', 'policy-bypass-paths']`),
`technical-vs-business-catalog` (topic 10), `dq-gates-vs-posthoc-scans` (topic 12),
`discovery-false-negatives` (topic 4), `openlineage-run-job-dataset-events` (topic 11).

**Declared, with the gap logged:** `contract-enforcement-ci` (Chapter 11 §11.4 — checked directly:
no `section: '11.4'` entry exists anywhere in `registry.ts`, the same gap topics 11 and 12 logged
for their own Chapter 11 dependencies — this topic's registration flow uses a contract's required
fields (id, version, owner) as a stand-in for what CI would otherwise enforce, named in prose, not
claimed as a `uses` dependency); `compliance-regimes` (Chapter 10 §10.5 — checked directly: no
`section: '10.5'` entry exists anywhere in `registry.ts` either; the chapter's own lab text names
"two compliance regimes" without assuming the §10.5 material is built).

## Storyboard (10 steps)

1. **Hook** — three domain teams (orders, customers, marketing), a regulator asks for a list of
   every table holding restricted personal data and its owner within a day; a hand-maintained
   central list takes weeks and is wrong, no central rules means every domain answers differently.
2. **Predict** (within the first four) — central policy, central ownership, central tooling, or
   some split, is the smallest thing that must be unbypassable.
3. **Reveal: the data-mesh operating shape** — domain ownership, data as a product, a self-serve
   platform, and Dehghani's own fourth principle, federated computational governance: a central
   body sets policy once and the platform enforces it in code, so no domain can ship around it.
4. **Reveal: reverse Conway's law** — Conway's 1968 thesis in his own words (an organization that
   designs a system is constrained to copy its own communication structure in the design); the
   reverse is choosing the team split that produces the architecture wanted, so governance follows
   ownership boundaries instead of fighting them. *Takeaway.*
5. **Reveal: automate vs. human** — a rule over an attribute (mask a tagged column, block an
   ownerless table, fail a missing contract field) is automated; a judgement call (business
   criticality, a retention exception with a legal reason, an ambiguous free-text classification)
   stays human, with a named steward; backed by the real 3/3 split over six decisions in
   `examples.py`.
6. **Reveal: the self-serve registration gate, schema** — three gates run in order on every table
   that wants to become discoverable; the first checks every column has a name and a type.
7. **Reveal: the registration gate, contract and classification** — the second gate requires a
   contract with an id, a version and an owner; the third requires every column to carry a
   classification tag (a tier, and a category that may be `None` for a non-personal column);
   backed by the real `register_table()` run admitting one well-formed table and rejecting two
   malformed ones with the exact gate name in the reason. *Takeaway.*
8. **Reveal: what stewardship catches that a gate can't** — the gate cannot tell a critical table
   from a routine one, cannot grant a retention exception, and cannot classify a column its own
   scanner left untagged; each of those needs a named human, not a rule.
9. **Recap.**
10. **Prove it** (second predict) — given a seventh decision (a new domain team wants to change its
    own table's retention window inside the policy's stated limits), is it automated or human, and
    why.

## Research note: what this topic runs for real

Dehghani's own wording for the fourth data-mesh principle and Conway's own 1968 statement of what
became Conway's Law are both fetched directly from their primary sources (`SOURCES.md`), not
taken from a secondary summary. The self-serve registration gate (`check_schema`, `check_contract`,
`check_classification`, `register_table`) and the automate-vs-human decision split in `examples.py`
are real, asserted Python run against three synthetic table definitions and six synthetic
governance decisions matching the Outcomes line exactly ("decide for six given decisions whether
they are automated or human and name the steward"); there is no external tool to run here (the
gate is the shop's own policy code, which is the point: a real engine-run check, not a sourced
claim about a third-party product).
