# Outline — de.data-contracts-as-modeling

13-step plan, no lab of its own. First predict within the first four steps.

1. **Hook.** A domain's schema changed overnight with no warning, and a downstream dashboard
   broke silently. What was actually missing wasn't a schema — it was a contract.
2. **Reveal: the contract's own format, quoted directly.** A structured YAML document of keys
   and values, not a wiki page or a verbal promise, under the Open Data Contract Standard
   (quote 1).
3. **Predict.** Does a contract need to pick between describing the data's business meaning and
   describing its physical layout? (within the first four steps)
4. **Reveal: schema as both business and physical, quoted directly.** Schema in ODCS ties a
   business representation and a physical implementation together in one artifact (quote 3),
   shown concretely with a field's own `businessName` (quote 4).
5. **Reveal: quality rules tied to schema, quoted directly.** Quality rules are a named section,
   explicitly linked to the schema they check, not a separate, disconnected concern (quotes 5,
   6). Takeaway: a contract's quality rules only mean something because they're pinned to a
   specific schema field, not floating free.
6. **Predict.** If quality checks run after data lands in a downstream warehouse, is that late
   enough to still count as real enforcement?
7. **Reveal: enforcement at the producer boundary.** This topic's own reasoned claim
   (flagged, not sourced): a check that only runs downstream lets bad data already reach every
   consumer before anyone notices; the contract's job is to stop that at the point the producer
   emits the data. Takeaway: where a check runs changes what it actually protects.
8. **Reveal: SLAs as enumerated, checkable fields, quoted directly.** SLA properties
   (availability, latency, retention, and others) are a named standard list with required
   structured values, not prose (quotes 7, 8).
9. **Predict.** Is "ownership" something a data contract leaves implicit, assumed from whoever
   wrote the pipeline?
10. **Reveal: ownership as a named role, quoted directly.** Team membership and history are
    tracked in the contract itself, with "Owner" appearing as an explicit, named role in the
    standard's own worked example (quotes 9, 10). Takeaway: ownership that isn't written into
    the contract is ownership nobody can actually point to later.
11. **Reveal: the version this topic is teaching against, quoted directly.** The standard's own
    fetched default version, and the honest disclosure that it's moved past the version named in
    this chapter's own scope line (quote 2).
12. **Recap.** A contract is a structured document, not a promise; its schema carries both
    business meaning and physical layout together; quality rules and SLAs are named, checkable
    fields pinned to that schema; ownership is a role the contract names explicitly, not an
    assumption.
13. **Prove it.** A producer ships a schema change with no updated contract and no new quality
    rule for the changed field. Who, specifically, is supposed to catch that before it reaches a
    consumer — and where in the pipeline does that catch actually have to happen?
