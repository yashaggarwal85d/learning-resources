# Fact-check — de.federated-governance-operating-model

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Data mesh's four principles -- domain ownership, data as a product, a self-serve platform, federated computational governance -- are intended to be collectively necessary and sufficient. | Dehghani -- Data Mesh Principles and Logical Architecture | Confirmed, quoted verbatim. |
| 2 | Many practices of pre-data-mesh, centralized governance no longer apply under the data-mesh paradigm. | Dehghani -- Data Mesh Principles and Logical Architecture | Confirmed, quoted verbatim. |
| 3 | A domain dataset becomes a data product only after local quality assurance, but domains must comply with quality and SLO modeling defined by a global, federated governance team and automated by the platform. | Dehghani -- Data Mesh Principles and Logical Architecture | Confirmed, quoted verbatim. |
| 4 | Conway's own 1968 thesis: organizations that design systems are constrained to produce designs that copy their own communication structures, giving a criterion for structuring a design organization around communication needs. | Conway -- How Do Committees Invent? (1968) | Confirmed, quoted verbatim, from the paper's own "Conclusion" section. |
| 5 | A data contract defines the agreement between a data producer and its consumers; the Open Data Contract Standard was formerly PayPal's own data-contract template. | Open Data Contract Standard -- Home | Confirmed, quoted verbatim. |
| 6 | A table-registration gate checking schema, contract and classification-tag rules admits a compliant table and rejects one missing exactly its classification tag, naming that rule in the rejection. | This course's own measurement (`examples.py`) | Confirmed, asserts pass. |

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** shouldn't all three -- policy, ownership and tooling -- just be
centralized, so one team controls the whole answer and nothing falls through the cracks?

**Attack -- "centralizing ownership can't make the answer worse, and it removes the
coordination problem entirely."** Centralizing *who answers for* a table doesn't change *who
actually understands* that table -- the domain still has the context a central team would
have to re-derive from scratch, slower and with more error, every single time a question comes
up. Dehghani's own article states plainly that "centralized custodianship of data" is
pre-mesh governance's aspect, contrasted explicitly with "federated custodianship of data by
domains" as the mesh's replacement -- the move is deliberate, not an oversight.

**Question 2 (step 6):** isn't a legal retention exception also just a rule -- "is there a
legal basis" -- so why can't a machine evaluate it the same way it evaluates a tag?

**Attack -- "if the legal team writes down the criteria for a valid exception, a machine can
just check a submission against that checklist too."** A checklist can verify that *a reason
was given*, but not that the specific reason given actually holds up as a matter of law for
this specific table in this specific circumstance -- that's an interpretive judgment, not a
membership test against a fixed set of values the way a classification tag is. `examples.py`'s
own gate checks exactly the kind of rule that is a membership test (is a required tag present)
and stops there on purpose, leaving the legal judgment to a named human.

## Abandoned approaches

Building a real, multi-service governance platform (a policy engine, a catalog integration, an
actual CI gate wired into a real repository) was considered first, to demonstrate the
registration gate inside a full self-serve platform the way a real organization would deploy
it. Per this topic's own CHAPTER.md scope ("build and run the self-serve registration check
[...] that blocks an unregistered table from becoming discoverable"), the claim that actually
needs demonstrating is narrower: that an automated check can admit a compliant submission and
reject a non-compliant one by name, without a human in the loop. `examples.py` builds exactly
that mechanism directly in Python, which is sufficient to verify the claim without the
sandbox cost of standing up a full platform stack.
