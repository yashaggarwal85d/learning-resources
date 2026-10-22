# Outline — Data Vault 2.0 modeling

1. **Hook.** The same customer, order and product domain, modeled three ways — and a question
   ("what was this customer's address on this order's date") that every one of them can answer, at a
   very different cost.
2. **Reveal: hubs.** The business keys, and nothing else, quoted directly: low propensity to change,
   no descriptive attributes.
3. **Reveal: links.** The relationships between hubs, quoted directly: the grain of the
   relationship, captured in its own table.
4. **Reveal: satellites.** The descriptive, time-tracked attributes, quoted directly: append-only,
   every change preserved.
5. **Predict.** Hubs, links and satellites are loaded by separate processes, with no coordinator
   between them. Is that actually safe?
6. **Reveal: hash keys make it safe, computed.** Two independent loaders hash the same business key,
   with zero coordination, and land on the identical key — the real, computed property that enables
   parallel, insert-only loading, quoted and verified.
7. **Reveal: why a sequence couldn't do this.** A sequence key requires a lookup against the
   parent's already-assigned key before a child row can load — load-order dependency a hash key
   removes entirely.
8. **Reveal: the as-of-address query, three ways, same answer.** 3NF and the star schema each
   answer it in a single join; raw Data Vault needs four joins and a correlated as-of lookup —
   measured directly, not estimated.
9. **Reveal: raw vault's real cost.** Why: the hub/link/satellite split that makes loading easy
   makes querying expensive, exactly the tradeoff this chapter's own sources name directly.
10. **Reveal: PIT tables cut it back down, measured.** The same query against a PIT table that
    pre-resolves the as-of lookup at load time: one fewer join, and the correlated subquery is gone
    entirely.
11. **Reveal: bridge tables, for the other kind of cost.** What a PIT table does for one satellite's
    temporal joins, a bridge table does for a path crossing several links at once.
12. **Reveal: when the join cost is worth it.** Auditability (every change preserved, nothing
    deleted) and source agility (a new source adds hubs/links/satellites, not a redesign) are what
    the extra joins buy — measured against 3NF and the star, not merely asserted.
13. **Recap.** Hubs, links, satellites; hash keys for coordination-free loading; raw vault's join cost,
    measured; PIT and bridge tables buying it back down; the tradeoff is auditability and source
    agility, against a real, counted join cost.
14. **Prove it.** A new source system needs to join the warehouse next quarter, with a different
    definition of the same business key. Which of the three schemas absorbs that with the least
    redesign?
