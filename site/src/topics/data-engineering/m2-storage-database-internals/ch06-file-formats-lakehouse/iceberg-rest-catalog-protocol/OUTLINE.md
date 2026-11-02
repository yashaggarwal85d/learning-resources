# OUTLINE — de.iceberg-rest-catalog-protocol

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** A minimal catalog proved the idea; this topic is the real, vendor-neutral protocol
   for it, built for real right here: a real local REST catalog in this sandbox, speaking the
   exact contract real engines use.
2. **Predict.** A client wants to talk to a REST catalog it's never seen before. Does it just
   start sending requests with its own assumed config, or does something happen first?
3. **Reveal.** Config negotiation: a real first call, a real server response the client must
   apply over its own config, in the spec's own defaults-then-client-then-overrides order.
4. **Reveal + takeaway.** Demo: a real load over real HTTP, then two engines read the same table
   and race to commit with a requirement assertion naming the exact snapshot they read.
5. **Predict.** One engine's requirement no longer matches the server's real state by the time its
   commit lands. What does the server do?
6. **Reveal + takeaway.** A real 409, naming exactly which requirement failed -- not a generic
   error. The loser reloads and retries successfully against the new state.
7. **Reveal.** Named, sourced, not built: multi-table transactions, the views and register
   endpoints -- real spec features, out of this script's own scope.
8. **Reveal.** Credential vending and remote signing, named precisely: the `X-Iceberg-Access-Delegation`
   header, sourced-only since this sandbox can't issue real cloud credentials.
9. **Reveal + takeaway.** Server-side scan planning (new in Iceberg 1.11) and SQL UDFs as current
   protocol features; the built-in OAuth2 token endpoint is deprecated for removal, in favor of
   external identity providers.
10. **Recap.** A real REST catalog, speaking a real subset of the real protocol. Handoff: every
    mechanism this section needed now exists -- next, the practical question these topics served:
    which format and catalog do you actually pick?
