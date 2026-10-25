# Sources: ACID guarantees, precisely stated (`de.acid-guarantees-precisely-stated`)

The original coinage, Härder & Reuter's "Principles of Transaction-Oriented Database Recovery"
(ACM Computing Surveys 15(4), 1983), is paywalled on the ACM Digital Library; no free mirror
could be fetched (every candidate course-site URL tried either 404'd or redirected to an
unrelated page). Per the skill's source-substitution rule, it is replaced below by two Wikipedia
articles that quote and cite it directly and state the same four properties and the consistency
split in their own right, plus PostgreSQL's own documentation for isolation and MVCC.

## ACID (Wikipedia)

URL: https://en.wikipedia.org/wiki/ACID
Version: retrieved 2026-10-24

> In 1983,[1] Andreas Reuter and Theo Härder coined the acronym ACID, building on earlier work by Jim Gray[2] who named atomicity, consistency, and durability, but not isolation, when characterizing the transaction concept.

> According to Gray and Reuter, the IBM Information Management System supported ACID transactions as early as 1973 (although the acronym was created later).

> Atomicity guarantees that each transaction is treated as a single "unit", which either succeeds completely or fails completely: if any of the statements constituting a transaction fails to complete, the entire transaction fails and the database is left unchanged. An atomic system must guarantee atomicity in each and every situation, including power failures, errors, and crashes.

> Consistency ensures that a transaction can only bring the database from one consistent state to another, preserving database invariants: any data written to the database must be valid according to all defined rules, including constraints, cascades, triggers, and any combination thereof.

> Isolation ensures that concurrent execution of transactions leaves the database in the same state that would have been obtained if the transactions were executed sequentially. Isolation is the main goal of concurrency control; depending on the isolation level used, the effects of an incomplete transaction might not be visible to other transactions.

> Durability guarantees that once a transaction has been committed, it will remain committed even in the case of a system failure (e.g., power outage or crash). This usually means that completed transactions (or their effects) are recorded in non-volatile memory.

> An example of an atomic transaction is a monetary transfer from bank account A to account B. It consists of two operations, withdrawing the money from account A and depositing it to account B. We would not want to see the amount removed from account A before we are sure it has also been transferred into account B.

Contents: the 1983 coinage and its ten-year-earlier real-world precedent (IBM IMS, 1973); the four properties' own precise definitions; the bank-transfer atomicity example this topic's own `examples.py` reproduces directly.

## Consistency (database systems) (Wikipedia)

URL: https://en.wikipedia.org/wiki/Consistency_(database_systems)
Version: retrieved 2026-10-24

> In database systems, consistency (or correctness) refers to the requirement that any given database transaction must change affected data only in allowed ways. Any data written to the database must be valid according to all defined rules, including constraints, cascades, triggers, and any combination thereof. This does not guarantee correctness of the transaction in all ways the application programmer might have wanted (that is the responsibility of application-level code) but merely that any programming errors cannot result in the violation of any defined database constraints.

Contents: the precise split this topic's own second half is built on — the engine enforces only its own declared rules; everything else the application meant by "correct" is the application's own responsibility, not the engine's.

## PostgreSQL docs: Transaction Isolation

URL: https://www.postgresql.org/docs/current/transaction-iso.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> The most strict is Serializable, which is defined by the standard in a paragraph which says that any concurrent execution of a set of Serializable transactions is guaranteed to produce the same effect as running them one at a time in some order.

Contents: the standard's own precise definition of the strictest isolation level, the one this topic's own `examples.py` leaves as a named frontier rather than measuring a third time.

## PostgreSQL docs: Concurrency Control Introduction

URL: https://www.postgresql.org/docs/current/mvcc-intro.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> Internally, data consistency is maintained by using a multiversion model (Multiversion Concurrency Control, MVCC). This means that each SQL statement sees a snapshot of data (a database version) as it was some time ago, regardless of the current state of the underlying data. This prevents statements from viewing inconsistent data produced by concurrent transactions performing updates on the same data rows, providing transaction isolation for each database session.

Contents: MVCC as the real engine mechanism this topic's own `examples.py` measures directly (Read Committed vs. Repeatable Read).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=acid-guarantees-precisely-stated:%20).
