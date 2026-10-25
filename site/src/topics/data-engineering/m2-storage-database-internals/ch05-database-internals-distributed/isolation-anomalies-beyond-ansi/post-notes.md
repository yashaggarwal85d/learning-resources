<section data-section="outcomes">

## Outcomes

Name and distinguish eight anomalies precisely: dirty write (a second writer overwrites an
uncommitted change), dirty read (reading an uncommitted, possibly-doomed change), non-repeatable
read (a reread of the same single item sees a different value), read skew (a reread of a
*different*, constraint-linked item sees an inconsistent pair), lost update (a committed change
silently discarded by a later write based on stale data), write skew (two transactions each
individually valid, jointly violating a shared constraint), phantoms (a changing *set* of rows
matching a condition, not a changing value), and the read-only transaction anomaly (a reader that
writes nothing still seeing an impossible state). Explain why ANSI SQL-92's own English
definitions are genuinely ambiguous, per Berenson et al.'s own demonstration, and how Adya's
dependency-graph formalism replaces an arguable sentence with a checkable graph cycle. Three real
anomalies (lost update, read skew, dirty write) are reproduced as actual two-transaction timelines
against this sandbox's own Postgres cluster.

</section>

<section data-section="internals">

## The two-transaction timeline, as a tool

Every anomaly in this topic is shown the same way: two transactions, T1 and T2, with their reads,
writes and commit points placed in a specific order on one timeline. This is deliberate — it is
the same notation Berenson et al.'s own paper uses (`w1[x]...r2[x]...` and so on), and it is what
makes an anomaly falsifiable rather than a vague feeling that "concurrency did something wrong."
Given a timeline, you can mechanically check it against each isolation level's own rules and say
whether that level permits it. This topic's own `examples.py` builds three of these timelines for
real, using `threading.Barrier` and `threading.Event` to force the exact interleaving a
description can only draw.

</section>

<section data-section="production">

## Production failures this topic warns about

**Lost updates from a naive read-modify-write pattern.** Any code that reads a value, computes a
new value from it, and writes the new value back — without using an atomic update expression like
`SET balance = balance + 10` — is exposed to a real lost update under Read Committed, measured
directly in this topic. The database gives no error; the only sign is a number that doesn't add up
later.

**Treating "it compiled and committed" as "it's correct."** Write skew is the sharpest version of
this trap: two transactions, each individually consistent with every constraint it can see, commit
successfully, and only the two of them *together* violate the rule. Neither transaction's own
commit was wrong in isolation.

</section>

<section data-section="frontier">

## Frontier

Serializable, ANSI SQL-92's own strictest level, is defined to prohibit all of its own named
anomalies — but Berenson et al. note that the phenomenon-based approach still leaves the weaker
levels ambiguous about exactly which histories they permit, which is this topic's own central
point, not a footnote. The two real routes to closing every one of these gaps entirely (strict
two-phase locking, and Serializable Snapshot Isolation) are named here only as a destination; they
are topic 13's own subject, after topic 12 shows exactly which of these anomalies snapshot
isolation prevents by construction and which survive it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Snapshot isolation prevents most of these anomalies by construction — but not all of them. The
next topic is exactly which it prevents, which one survives, and the vendor-naming traps around
calling it "serializable."

</section>
