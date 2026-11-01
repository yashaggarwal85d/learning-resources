# OUTLINE: Master data management styles (`de.master-data-management-styles`)

## Learning outcomes
1. Place a company's customer, product and plant data on the four MDM styles and defend the
   choice by who must write and how fresh the master must be.
2. Draw a match-merge pipeline with its stewardship queue.
3. Say what each style gives up in consistency.

## Engagement arc
- Hook: step 1 (a customer with two keys and two credit limits across a CRM and an ERP, double
  counted in a report).
- Predict: step 2 (does fixing this mean rewriting a source); step 10 (which style fits a team
  that wants every source still writing but one clean reporting copy).
- Takeaways: step 6 (the more control a style demands, the less freedom it leaves a source),
  step 7 (the stewardship queue exists because some pairs need a person), step 9 (recap: every
  style answers who writes and where the master lives).

## Steps (storyboard)

### 1. Hook
- **fig:** a customer with two keys and two credit limits across a CRM and an ERP, double
  counted in a report.

### 2. Predict
- **fig:** does fixing this mean rewriting a source, or can a style fix it without touching
  either one?
- **Options:** (a) always requires rewriting a source [wrong]; (b) a style can resolve it
  entirely outside both sources [correct].

### 3. Reveal — registry
- **fig:** cross-references keys across sources without changing them; no master copy, sources
  stay authoritative.

### 4. Reveal — consolidation
- **fig:** a golden copy assembled from the sources for reporting; sources stay authoritative,
  nothing written back.

### 5. Reveal — coexistence
- **fig:** a master copy synced back to the sources, which stay writable.

### 6. Reveal — centralised
- **fig:** the hub is the only place master data is created or changed.
- **takeaway:** "The more control a style demands over writes, the less freedom it leaves a
  source to run its own business."

### 7. Reveal — match-merge pipeline and stewardship queue
- **fig:** standardise, match, merge by survivorship, publish; unresolved pairs wait in a
  steward's queue.
- **takeaway:** "A match-merge pipeline automates the easy matches; the queue exists because
  some pairs need a person to decide."

### 8. Reveal — the same entity across ERP and CRM
- **fig:** the same customer, product or plant in both systems at once; each style gives a
  different kind of consistency.

### 9. Recap
- **fig:** all four styles, side by side.
- **takeaway:** "Every style answers two questions differently: who may write, and where the
  one true copy lives."

### 10. Prove it
- **fig:** every order system keeps writing, but the company wants one de-duplicated reporting
  list.
- **predict options:** (a) centralised [wrong]; (b) consolidation [correct].

## Post-notes headings
- **Internals:** no lab of its own; the four styles and the pipeline shape are named and quoted
  from documentation.
- **Production:** picking a style by name instead of by who needs to write; assuming a style
  fixes meaning, not just location.
- **Frontier:** record linkage, blocking, clustering, survivorship algorithms, golden-record
  construction, named only (the skipped topics).
- **Where this goes next:** choosing a style decides location, not meaning — semantic
  integration is next.

## Concept ledger
- **Introduces:** `mdm-styles`.
- **Uses:** `query-vs-log-cdc`, `cdc-landing-strategies`, `conformed-dimension`, `scd-type-2` —
  all confirmed live.
- **Declared:** basic familiarity with ERP and CRM systems.

## Changes from the chapter plan
No lab exists for this topic, exactly as CHAPTER.md's own "Lab" line states: the 8.3 lab's
record-linkage half is not hosted, since matching and survivorship algorithms are three skipped
syllabus topics. No vendor-neutral primary architecture reference was reachable (Microsoft's
Azure architecture MDM page still returns HTTP 404, re-checked at build time); Wikipedia's own
named list is read secondary, backed by a vendor's own description (Profisee), both disclosed.

## Claims list (for fact-check)
1. The four named styles — SOURCES.md (Wikipedia); named directly across four reveal steps.
2. Who writes and where the master copy lives, per style — SOURCES.md (Profisee); named
   directly across the same four reveal steps.
3. The match-merge pipeline's own four steps and the stewardship queue — CHAPTER.md's own named
   shape; taught directly in the reveal step.
4. The SAP/master-data cross-reference's own section number is a syllabus typo (§10.5 for
   §10.6) — CHAPTER.md's own "Notes for the release run"; disclosed, not corrected on screen.
