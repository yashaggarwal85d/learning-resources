## OEE Calculation: Definitions, Formulas, and Examples

URL: https://www.oee.com/calculating-oee/
Version: oee.com (Vorne Industries), retrieved 2026-10-31

The three factors, in the source's own order.

> Availability is calculated as the ratio of Run Time to Planned Production Time:

> Run Time is simply Planned Production Time less Stop Time, where Stop Time is defined as all time where the manufacturing process was intended to be running but was not due to Unplanned Stops (e.g., Breakdowns) or Planned Stops (e.g., Changeovers).

> Performance takes into account anything that causes the manufacturing process to run at less than the maximum possible speed when it is running (including both Slow Cycles and Small Stops).

> Quality takes into account manufactured parts that do not meet quality standards, including parts that need rework.

The three-factor product and the identity it reduces to.

> OEE is calculated by multiplying the three OEE factors: Availability, Performance, and Quality.

> If the equations for Availability, Performance, and Quality are substituted in the above and reduced to their simplest terms, the result is:
OEE = (Good Count × Ideal Cycle Time) / Planned Production Time

The worked numeric example this topic's own identity check is modelled on.

> Example: 373 minutes / 420 minutes = 0.8881 (88.81%)

> Example: 0.8881 × 0.8611 × 0.9780 = 0.7479 (74.79%)

Contents: the simple and preferred OEE calculations; Availability, Performance and Quality each defined and formulated; a full worked shift example (shift length, breaks, downtime, ideal cycle time, total count, reject count) carried through to a final OEE figure by both the factored and the simple route, confirming they agree.

## Mean time between failures (Wikipedia)

URL: https://en.wikipedia.org/wiki/Mean_time_between_failures
Version: Wikipedia, retrieved 2026-10-31

The definition this topic's MTBF computation is checked against.

> Mean time between failures (MTBF) is the predicted elapsed time between inherent failures of a mechanical or electronic system during normal system operation.

The MTBF/MTTF distinction the topic states.

> The term is used for repairable systems while mean time to failure (MTTF) denotes the expected time to failure for a non-repairable system.

The MTTR/MDT distinction the topic states (no MTTR formula is given by this source; this topic computes MTTR as mean repair-interval duration, stated as course material, not a quoted claim).

> Usually, MDT is considered different from MTTR (Mean Time To Repair); in particular, MDT usually includes organizational and logistical factors (such as business days or waiting for components to arrive) while MTTR is usually understood as more narrow and more technical.

Contents: the MTBF definition and formula forms (arithmetic-mean, expected-value, constant-failure-rate); the MTBF/MTTF distinction; the MDT/MTTR distinction; worked numeric examples (not reused here; this topic's own numbers come from `examples.py`).

## ISO 22400-2 and ISA-95 Part 3 (not used; disclosed)

URL: https://www.iso.org/standard/56847.html
Version: no quotable full text fetchable (store page returns HTTP 403; ISA's own Part 3 document is commercial)

CHAPTER.md asks to "confirm at research time whether [ISO 22400-2] defines OEE and cite only what it states." The ISO store page (iso.org/standard/56847.html) returns HTTP 403 and exposes no quotable abstract text. A standards-reseller catalog preview (iteh.ai) suggests the standard does define OEE as a multiplicative formula, using "Effectiveness" rather than "Performance" as its middle term (Availability × Effectiveness × Quality ratio), with a second, alternative calculation in an annex — but the preview's content could not be independently re-fetched as clean, byte-exact text (it returned binary/compressed data on a direct fetch, not the plain text a verbatim quote requires), so this is named here as an unconfirmed pattern worth flagging, not asserted as a verbatim ISO quote anywhere in this topic's files. Likewise, ISA-95 Part 3's own standard page gives only the multi-part effort's general scope, not Part 3's specific production/maintenance activity model content, and ISA's standard documents themselves are commercial and not fetchable. Both are therefore **not cited or quoted** in this topic; the OEE formula and worked example come entirely from oee.com above, and the maintenance-event, reason-code-hierarchy and shift-boundary content is this topic's own data-modeling course material (not a claim about either standard's specific text), consistent with this chapter's established pattern for genuinely inaccessible primary sources (see `quality-data-spc/FACT-CHECK.md`'s Nelson-paper disclosure).
