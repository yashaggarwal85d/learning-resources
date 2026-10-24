# Fact-check — de.snapshot-isolation-write-skew

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Snapshot isolation's own mechanism: a transaction operates on a personal snapshot taken at its start; it commits only if nothing it updated has been changed externally since that snapshot, and a genuine write-write conflict aborts the transaction. | Confirmed | `en_wikipedia_org...txt`, quoted in full. |
| 2 | Postgres's own `REPEATABLE READ` is implemented using the technique known in the academic literature as Snapshot Isolation. | Confirmed | `www_postgresql_org...txt`, quoted verbatim. |
| 3 | Under Postgres's `REPEATABLE READ`, a second transaction whose own update target row was already committed-changed by a first updater is rolled back with a serialization error, rather than silently proceeding — Postgres's own stated first-updater-wins behavior. | Confirmed | `www_postgresql_org...txt`, quoted verbatim (the `ERROR: could not serialize access...` sentence and its surrounding paragraph). |
| 4 | Postgres's own documented example: two `SERIALIZABLE` transactions that would both be allowed to commit under `REPEATABLE READ` (no row-level conflict) can still produce a result inconsistent with any serial order — stated by Postgres's own docs as the reason `REPEATABLE READ` alone is not enough for true serializability. | Confirmed | `www_postgresql_org...txt`, the `mytab`/`class`/`SUM` example quoted verbatim. |
| 5 | Oracle's own `SERIALIZABLE` isolation level is in fact snapshot isolation: a transaction sees only data committed before it began, and a serializable transaction is permitted to modify a row only if the row's own prior changes by others were already committed before the serializable transaction began (first-committer-wins), raising an error otherwise. | Confirmed | `docs_oracle_com...txt`, both quotes verbatim. |
| 6 | MySQL InnoDB's own `REPEATABLE READ` mixes two different read behaviors in one transaction: plain (nonlocking) `SELECT` reads a snapshot taken at the first read, while locking reads (`SELECT ... FOR UPDATE`, `UPDATE`, `DELETE`) use the most recent committed state — and MySQL's own docs recommend `SERIALIZABLE` instead of mixing the two inside one `REPEATABLE READ` transaction. | Confirmed | `dev_mysql_com...txt`, both quotes verbatim (the real, current text of MySQL's own live documentation page). |
| 7 | Write skew: two transactions concurrently read an overlapping data set, make disjoint updates, and both commit without having seen each other's update — an anomaly serializability would forbid (one transaction would have to be visible to the other) but snapshot isolation permits, since the two updates never conflict on the same row. | Confirmed | `en_wikipedia_org...txt`, quoted in full, including the two-balance ("Phil") canonical example. |
| 8 | Oracle itself sometimes calls its own `SERIALIZABLE` level "serializable," even though it is snapshot isolation and therefore permits write skew — a real vendor-naming trap, not an invented one. | Confirmed | `en_wikipedia_org...txt`, quoted verbatim ("snapshot isolation is sometimes referred to as serializable by Oracle"). |
| 9 | In this sandbox: rerunning topic 11's own read-skew scenario under `REPEATABLE READ` instead of Read Committed, both of T1's reads land on the same pre-update snapshot (x=50, y=50), so the inconsistent pair topic 11 produced under Read Committed cannot appear here. | Confirmed, executed | `examples.py: repeatable_read_prevents_read_skew`, run three times, identical result each run. |
| 10 | In this sandbox: two `REPEATABLE READ` transactions reading and then both trying to update the same row produce a real `psycopg2.errors.SerializationFailure` for the second committer, with the first committer's own value standing afterward — first-committer-wins, measured directly rather than only read from documentation. | Confirmed, executed | `examples.py: repeatable_read_write_write_conflict_first_committer_wins`, run three times, identical outcome each run. |
| 11 | In this sandbox: the "on-call doctors" write-skew pattern — two doctors, an invariant requiring at least one to stay on call, both independently read a count of 2 from their own snapshot and both commit "go off call" on their own disjoint row — leaves zero doctors on call, with Postgres's own `REPEATABLE READ` never detecting a conflict, since the two committed writes touch different rows. | Confirmed, executed | `examples.py: write_skew_on_call_doctors`, run three times, identical result (final count 0) each run. |

## Currency check

- Snapshot isolation's own mechanism (snapshot-at-start, first-committer-wins) is a standing,
  decades-old definition, confirmed identically by three independent vendors' own current
  documentation (Postgres 18, Oracle 19c, and the MySQL 8.0 manual's InnoDB chapter) plus
  Wikipedia's own current article. No currency risk.
- The vendor-naming traps named in the syllabus (Postgres `REPEATABLE READ` = SI, Oracle
  `SERIALIZABLE` = SI, MySQL InnoDB's mixed-read `REPEATABLE READ`) are read directly off each
  vendor's own current, live documentation retrieved today (2026-10-24), not from a secondary
  summary of an older version. No currency risk.
- Write skew itself and the "on-call doctors"/two-balance canonical examples are the field's
  own standing teaching example, unrevised since Fekete et al.'s original discovery; nothing
  about the anomaly's own definition has changed. No currency risk.
- This sandbox's own Postgres is 16.15; nothing measured here (REPEATABLE READ's snapshot
  behavior, the `SerializationFailure` on a write-write conflict) depends on a version-specific
  feature beyond what topic 11 already established. No currency risk.

## Red team

1. **"Is `repeatable_read_write_write_conflict_first_committer_wins` really about snapshot
   isolation's own conflict rule, or just an ordinary row-lock wait like topic 11's dirty-write
   experiment?"** No: unlike topic 11's `dirty_write_blocked_by_real_locking`, where T2's
   `UPDATE` *blocks* and then succeeds once T1 releases its lock, here T2's own `UPDATE` is
   allowed to execute (REPEATABLE READ doesn't block readers or writers against each other the
   way row locking does) but then *fails outright* with a real `SerializationFailure` once it
   tries to commit against a row its own snapshot no longer matches. The mechanism and the
   outcome are both different from topic 11's, and the reel's own caption states this contrast
   directly rather than reusing topic 11's framing.
2. **"Is the on-call doctors scenario a fair example of write skew, or does it depend on bad
   application logic (checking `>= 2` instead of re-checking after a lock)?"** It is exactly the
   point, stated directly in the reel's caption and `post-notes.md`: the application code here is
   not unusually careless — "count how many are on call, go off call if more than one remains" is
   an entirely ordinary way to write this check, and it is precisely the pattern snapshot
   isolation's own guarantees do not protect. The mitigation (`SELECT ... FOR UPDATE` to force a
   real conflict, i.e. "materializing the conflict," per the Wikipedia source's own Workarounds
   section) is named directly as the fix, not hidden.
3. **"Could `write_skew_on_call_doctors`'s outcome be an artifact of the `threading.Barrier`
   forcing a particular interleaving, rather than a genuine property of snapshot isolation?"**
   No: the barrier only pins down *when* each transaction takes its own snapshot (both before
   either commits), which is required for write skew to be reachable at all; it does not suppress
   any conflict-detection Postgres would otherwise perform. The assertion that both commits
   actually succeed (`results["doctor_1"] == results["doctor_2"] == "went_off_call"`), with no
   `SerializationFailure` raised by either, is the actual evidence that no conflict was ever
   detected on these two disjoint rows. Held.
4. **"Is quoting MySQL's own live documentation page fair, given the direct fetch from this
   sandbox got an HTTP 403?"** Yes: the 403 is a bot-protection response to this sandbox's own
   fetch tooling (confirmed with a direct `curl` carrying a browser user-agent, still 403), not a
   sign the page itself is unreachable or that its content was invented — the quotes in
   `SOURCES.md` are the real, current text of that live page, retrieved through this session's
   own browsing tool and cached for the automated quote check exactly as fetched. Documented
   directly in `SOURCES.md`'s own header note rather than silently worked around.
5. **"Phantom reads and the read-only transaction anomaly, both named in topic 11, aren't
   reproduced again here — is that a real gap?"** No: this topic's own syllabus scope is
   snapshot isolation's specific mechanism, which anomalies it prevents, and write skew (plus the
   read-only anomaly, named but not re-reproduced, since topic 11 already reproduced the anomalies
   that generalize to SI and this topic's own lab is specifically the write-skew reproduction
   named in `CHAPTER.md`). Reproducing phantom or the read-only anomaly again here would duplicate
   topic 11's own already-completed lab content rather than adding anything this topic's scope
   requires.

## Problem Solving

- **Fekete et al.'s own paper ("Making Snapshot Isolation Serializable"), the chapter plan's
  named source for write skew's formal treatment, could not be fetched.** The primary mirror
  (`www-users.cselabs.umn.edu`) fails with a genuine TLS certificate error ("unable to get local
  issuer certificate"), confirmed independent of this session's own proxy via a direct `curl -v`
  against the raw host; a second course mirror (`courses.cs.washington.edu`) redirects to an
  institutional identity-provider login wall rather than serving the PDF. **Fixed** by
  substituting Wikipedia's own "Snapshot isolation" article, which states the identical
  write-skew mechanism and the same canonical two-balance example this paper is normally cited
  for, with Fekete et al.'s own paper named directly among the article's citations, per the
  skill's source-substitution rule.
- **MySQL's own InnoDB isolation-levels documentation page returned HTTP 403 to this sandbox's
  direct fetch tooling**, confirmed with a second attempt using an explicit browser user-agent
  string (still 403) — a bot-protection response rather than the page being genuinely offline.
  **Fixed**, without substituting a different source, by retrieving the same live page's real
  text through this session's own browsing tool (which reaches it successfully) and caching that
  real text for the automated word-for-word quote check, documented directly in `SOURCES.md`'s
  own header note.
