# OUTLINE — de.catalogs-as-commit-coordinators

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Both Iceberg and Delta exist as real, fully built arcs now, each committing by its
   own atomic pointer move. This topic names that pointer's own home: the catalog, built for real
   right here.
2. **Predict.** A catalog obviously tracks the current-metadata pointer. Is that the whole job, or
   does it do more?
3. **Reveal.** Four real jobs: namespace, the current-metadata pointer moved by compare-and-swap,
   access control, and credential issuance.
4. **Reveal + takeaway.** Demo 1: register a real table, race two engines for the pointer's next
   version with the exact put-if-absent CAS this chapter has used since topic 13 -- one wins, one
   gets a real conflict and retries.
5. **Predict.** Before that CAS attempt is even allowed to run, should an unauthorized caller's
   request reach it at all?
6. **Reveal + takeaway.** No -- demo 3's real access-control check rejects an unauthorized
   principal's pointer update before the CAS is ever attempted.
7. **Reveal.** Demo 4: credential issuance, for real -- a scoped, time-limited credential naming
   exactly one table's storage prefix, issued only to a principal with real access.
8. **Reveal.** The legacy options, named with their real limits: Hive Metastore's thrift API is
   schema/location only; Glue Data Catalog needs Lake Formation bolted on for the same access
   control and credentials this catalog built directly; a JDBC catalog is a CAS row and nothing
   more.
9. **Reveal + takeaway.** Why this matters for a multi-engine, multi-cloud estate: vendor lock-in,
   no credential vending, single region or account -- three real, named limits, not vague
   complaints.
10. **Recap.** A minimal catalog, for real, doing all four jobs. Handoff: a real, vendor-neutral
    protocol for talking to one is next -- the Iceberg REST catalog.
