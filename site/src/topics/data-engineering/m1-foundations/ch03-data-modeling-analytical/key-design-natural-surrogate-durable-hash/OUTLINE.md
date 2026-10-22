# Outline — key design: natural, surrogate, durable, hash

1. **Hook.** Same email-change event, two schemas: a foreign-key-enforced natural key blocks the
   update outright; a surrogate key absorbs it in one row.
2. **Predict.** If a customer's email address is the primary/foreign key everywhere it's
   referenced, what happens when they change it?
3. **Reveal: natural key breaks.** The measured FK-constraint error — the natural key can't even be
   updated without first touching (or cascading into) every row that references it.
4. **Reveal: surrogate key absorbs it.** Same event, surrogate `customer_id` untouched, one row in
   `customers` changes, every order still resolves.
5. **Define: natural vs. surrogate.** A natural key is a business attribute; a surrogate key is a
   system-generated identifier with no business meaning, chosen specifically so it never has a
   reason to change.
6. **Predict.** In a pipeline where multiple writers generate rows independently (no central
   coordinator), is an auto-increment sequence still a safe choice?
7. **Reveal: sequences don't coordinate across writers.** PostgreSQL's own sequence docs: `nextval`
   calls are never rolled back, so gapless assignment isn't available from a sequence, and a cache
   greater than one makes the *order* of values across sessions no longer purely sequential —
   exactly the single-writer assumption that breaks in a distributed pipeline.
8. **Reveal: measured generation cost.** Sequence vs. UUIDv7 vs. UUIDv4, 100,000 inserts each,
   same pre-built index: a sequence is fastest, UUIDv7 next, UUIDv4 slowest.
9. **Reveal: measured index locality.** `pgstatindex()` on the same three tables: the sequence and
   UUIDv7 indexes keep nearly the same leaf-page density (fewer, fuller pages); UUIDv4's random
   insert order leaves the index visibly more bloated — this is RFC 9562's own "poor database-index
   locality" claim, reproduced, not just quoted.
10. **Reveal: why UUIDv7 keeps locality.** The bit layout: 48 bits of millisecond timestamp first,
    so consecutive values share a byte-for-byte-comparable prefix — confirmed directly on this
    sandbox's two consecutive `uuidv7()` calls.
11. **Define: durable key.** Previews SCD2 (topic 13): a dimension's *durable* key must stay
    constant across every version of a row, even as its own surrogate key changes per version —
    the two solve different problems and neither can stand in for the other.
12. **Predict.** Is a 128-bit hash of a business key (Data Vault's own hash-key pattern) ever at
    real risk of a collision?
13. **Reveal: the birthday bound, computed.** A real combinatorial computation, not a caveat: a
    32-bit hash collides by 50% odds at well under 100,000 rows; a 64-bit hash still carries a few
    percent collision risk at a billion rows; a full 128-bit hash doesn't, by a margin of orders of
    magnitude.
14. **Recap.** Natural keys break on real-world change; surrogates absorb it. Sequences are
    fast and dense but need a single coordinator; UUIDv7 keeps most of that density without one;
    UUIDv4 trades locality for no coordination at all. Durable and surrogate keys solve different
    problems. Hash-key width is a quantifiable risk, not a shrug.
