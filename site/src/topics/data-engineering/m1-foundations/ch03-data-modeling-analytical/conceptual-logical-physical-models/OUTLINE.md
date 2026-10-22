# Outline — Conceptual, logical and physical models

Refresher, about five minutes. Scope (CHAPTER.md): what each level fixes (business entities, platform-neutral
structure, engine-specific layout) and how decisions flow from one to the next.

Running example, shared with the rest of the chapter: a shop's customer can have more than one address.

1. **Opening.** "Three levels, in five minutes." Frame: every schema passes through three decisions before a table
   exists. Swipe-on framing, as a refresher.
2. **Reveal: the conceptual level.** Business entities only, no structure yet: a customer, an address, and the fact
   that one can have more than one of the other. No cardinality notation, no columns — just what the business agrees
   exists. Stakeholder-facing.
3. **Predict.** Does the conceptual level say how many addresses a customer can have, or how that's stored? Plausible
   wrong answer: yes, it already fixes the cardinality, since the fact itself mentions "more than one."
4. **Reveal: the answer.** The conceptual level names the fact, not its shape — it doesn't yet say one-to-many vs.
   many-to-many, and it says nothing about storage at all. That's the logical level's job. Takeaway: the conceptual
   level fixes which business entities exist and relate, not how.
5. **Reveal: the logical level.** The same fact, now as an entity-relationship diagram with explicit cardinality
   (crow's foot: one customer to many addresses) and attributes, but still no engine, no data types, no indexes —
   platform-neutral structure that could be implemented in more than one database product. Takeaway: the logical
   level fixes structure and cardinality without committing to any one engine.
6. **Reveal: the physical level.** The same fact again, now as an actual `CREATE TABLE` statement with a foreign key,
   concrete column types, and the engine-specific choices (an index, a constraint) that make it run. Takeaway: the
   physical level is the only one of the three that has to work on a real machine.
7. **Reveal: the flow between levels.** Each level fixes something the one before it left open on purpose, and a
   decision made too early (locking in a foreign key at the conceptual stage) forecloses options a later stakeholder
   conversation might need. The quoted blurred-boundary line: in practice, logical and physical often merge for a
   single target engine, but keeping them separate on paper is what lets one conceptual model drive more than one
   logical model.
8. **Recap ("In one breath").** Three levels, three jobs: what exists, how it's shaped, how it runs. Swipe on to the
   next refresher: the two workload shapes that pull the physical level in opposite directions for the same
   conceptual model.

Predict lands on step 3, within the first four steps. Three takeaways, on steps 4, 5 and 6, each on a reveal that
states what that level — and only that level — fixes.
