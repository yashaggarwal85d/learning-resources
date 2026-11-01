# Fact-check — de.master-data-management-styles

## Claims against sources

1. **"There are several models for implementing a technology solution for master data
   management"**, naming registry, consolidation, coexistence and transaction/centralized.
   Source: Wikipedia, Master data management (SOURCES.md quote 1). Direct match. Named across
   the four reveal steps on the four styles.

2. **"Data consolidation – The process of capturing master data from multiple sources and
   integrating it into a single hub (operational data store) for replication to other
   destination systems."**
   Source: Wikipedia, Master data management (SOURCES.md quote 2). Direct match. Named directly
   in the reveal step "consolidation, a golden copy for reporting."

3. **"Source systems continue to manage their own data, while downstream applications rely on
   master data in the MDM platform for golden records."**
   Source: Profisee (SOURCES.md quote 3). Direct match. Named directly in the reveal step
   "registry, a cross-reference with no master copy."

4. **"Updates are not pushed back to source systems in a Consolidation style."**
   Source: Profisee (SOURCES.md quote 4). Direct match. Named directly in the reveal step
   "consolidation, a golden copy for reporting."

5. **"Master data resides in the hub, but source systems retain operational data and handle
   transactions."**
   Source: Profisee (SOURCES.md quote 5). Direct match. Named directly in the reveal step
   "coexistence, synced both ways."

6. **"All transactions and updates occur within the hub, and data is then distributed to
   operational systems."**
   Source: Profisee (SOURCES.md quote 6). Direct match. Named directly in the reveal step
   "centralised, the hub and only the hub."

## Predict questions red-teamed

- **Step 2** ("does fixing this mean rewriting a source"): the wrong option claims fixing a
  duplicate always requires rewriting one of the two sources. Checked against the four styles'
  own descriptions directly: registry only cross-references, and consolidation only assembles a
  separate golden copy — neither one ever writes back to a source, confirmed against Profisee's
  own "updates are not pushed back" statement for consolidation and the registry's own "source
  systems continue to manage their own data" statement.

- **Step 10** ("Prove it"): the wrong option claims centralized is the right fit for "one clean
  list, every source keeps writing." Checked against the centralized style's own defining
  property directly: "all transactions and updates occur within the hub" is the opposite of
  every order system continuing to write its own orders, which the scenario explicitly requires
  — ruling centralized out by its own documented definition, not by elimination.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own two semicolons into three clauses: the
four named styles; match-merge pipelines and stewardship workflows; and customer, product and
plant master consistency across ERP and CRM (naming a cross-reference to "the SAP/master-data
note in Ch.10.5"). All three are covered — the first by four reveal steps, the second by one
reveal step on the pipeline and its queue, the third by the Hook and the "same entity across ERP
and CRM" reveal step. The §10.5 reference is CHAPTER.md's own disclosed syllabus bug (its real
section is §10.6, per CHAPTER.md's own "Notes for the release run"); `coverage.json` copies the
raw syllabus clause verbatim, including the typo, and no claim in this topic's reel or narration
depends on which section number is correct. No claim here depends on record linkage, blocking,
clustering, survivorship algorithms or golden-record construction — the three skipped syllabus
topics this chapter's Deep dive names — nor on SAP's own extraction paths, data ownership and
governance, or the plant data model, all named in CHAPTER.md's own "Leaves out" line. This
topic's own disclosed scope decision — no lab exists, since the 8.3 lab's record-linkage half
is skipped — is recorded in `SOURCES.md` and `REVIEW.md` rather than left unexplained, as is the
absence of a vendor-neutral primary architecture reference (Microsoft's Azure architecture MDM
page still returns HTTP 404, re-checked directly at build time).
