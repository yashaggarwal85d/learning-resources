# Fact-check — de.isolation-anomalies-beyond-ansi

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Dirty Write (P0): T1 modifies a data item, T2 further modifies it before T1 commits or rolls back, and a rollback by either leaves it unclear what the correct value should be. | Confirmed | `berenson.txt`, quoted in full. |
| 2 | Dirty Read (P1): T1 modifies a data item, T2 reads it before T1 commits or rolls back; if T1 rolls back, T2 read a value that never really existed. | Confirmed | `berenson.txt`, quoted in full. |
| 3 | Non-repeatable Read (P2): T1 reads a data item, T2 modifies or deletes it and commits, and a reread by T1 sees a different value or finds it gone. | Confirmed | `berenson.txt`, quoted in full. |
| 4 | Phantom (P3): T1 reads a set of rows matching a search condition; T2 inserts a row that also matches and commits; a reread by T1 with the same condition returns a different set. | Confirmed | `berenson.txt`, quoted in full (the full sentence spans a PDF page break in the source, quoted as two adjacent fragments exactly as the source text has them). |
| 5 | Lost Update (P4): T1 reads a data item, T2 updates it, then T1 (based on its own earlier, now-stale read) updates it and commits, silently discarding T2's own committed change. | Confirmed | `berenson.txt`, quoted in full. |
| 6 | Read Skew (A5A): T1 reads x, then T2 updates both x and y (which obey a constraint together) and commits, then T1 rereads y and sees an inconsistent pair. Non-repeatable Read is a degenerate case of Read Skew where x = y. | Confirmed | `berenson.txt`, quoted in full, including the explicit "Fuzzy Reads (P2) is a degenerate form of Read Skew where x=y" sentence. |
| 7 | Write Skew (A5B): T1 reads x and y (consistent with a constraint), T2 reads x and y, writes x, and commits; then T1 writes y; both commit, but the constraint between x and y might now be violated. | Confirmed | `berenson.txt`, quoted in full. |
| 8 | The ANSI SQL-92 definitions are genuinely ambiguous: Berenson et al.'s own paper shows two different, defensible readings of the same Dirty Read phenomenon (P1) — a narrow one (2.1) and a broad one (2.2) — that prohibit different sets of histories. | Confirmed | `berenson.txt`, both (2.1) and (2.2) quoted directly, with the paper's own explanation of why they differ. |
| 9 | Adya, Liskov and O'Neil's 2000 paper formalized isolation levels as proscribed behaviors over an abstract history, replacing phenomena stated in English with cycles over a Direct Serialization Graph (DSG); a G0 anomaly is a cycle made entirely of write dependencies. | Confirmed | `elle.txt`, both quotes verbatim — a direct restatement of Adya et al.'s own formalism, since their own paper could not be fetched (see Problem Solving). |
| 10 | The read-only transaction anomaly: a reader can see a database state that could not occur in any serial execution leading to the actual final state of the interleaved execution, even though the reader itself performs no writes. | Confirmed | `jorwekar-ssi-anomalies.txt`, quoted in full, itself citing Fekete et al.'s original discovery of the anomaly directly. |
| 11 | In this sandbox: a real, forced two-transaction lost-update timeline under Read Committed — T1 reads 100, writes and commits 110; T2 reads the same stale 100, writes and commits 120 after T1's commit — leaves the final balance at 120, discarding T1's own +10 entirely. | Confirmed, executed | `examples.py: lost_update_under_read_committed`, run three times, identical result each run. |
| 12 | In this sandbox: a real, forced two-transaction read-skew timeline under Read Committed — T1 reads x=50, then T2 updates both x and y to 80 and commits, then T1 rereads y and sees 80 — leaves T1 holding an inconsistent pair (x=50, y=80) inside one transaction. | Confirmed, executed | `examples.py: read_skew_under_read_committed`, run three times, identical result each run. |
| 13 | In this sandbox: a real second writer to the same row genuinely blocks (measured: roughly 0.3 seconds, matching the first transaction's own hold time) until the first transaction commits, rather than being allowed to dirty-write — PostgreSQL's real row-level locking excludes P0 structurally, at every isolation level, not only at its strictest. | Confirmed, executed | `examples.py: dirty_write_blocked_by_real_locking`, run three times, identical result each run (blocked ~0.30s, T2's value wins after T1 commits). |

## Currency check

- Berenson et al.'s 1995 anomaly vocabulary (P0–P4, A5A/A5B) is the field's own standing
  vocabulary, cited unchanged by every later paper this topic also cites (Adya et al. 2000, Fekete
  et al. 2004/2007). No currency risk.
- Adya et al.'s 2000 dependency-graph formalism and its DSG/G0/G1/G2 vocabulary is likewise
  standing, unrevised terminology, confirmed still in active use by a 2020 paper (Elle) built
  directly on it. No currency risk.
- The read-only transaction anomaly (2004) and its restatement in a 2007 paper are the most recent
  sources here; nothing about the anomaly itself has been revised since, and it remains the
  standard example cited whenever snapshot isolation's own limits are discussed. No currency risk.
- This sandbox's own Postgres is 16.15; nothing measured here (row-level locking, Read Committed's
  own snapshot-per-statement behavior) depends on a version-specific feature. No currency risk.

## Red team

1. **"Is reproducing lost update and read skew under Read Committed actually fair, given that a
   careful application could avoid both with `UPDATE ... SET x = x + 10` instead of a
   read-then-write pattern?"** Yes, and this is stated directly in the reel's own caption and
   narration, not glossed over: the point of this topic is not "Postgres is broken," it's that
   these anomalies are real, reachable behaviors of a real isolation level under an ordinary
   read-modify-write pattern, which is exactly the pattern application code uses whenever the new
   value depends on more than a single column's own arithmetic (e.g., "transfer $10 if the balance
   covers it"). The atomic-update escape hatch is named directly as a mitigation, not hidden.
2. **"Is `dirty_write_blocked_by_real_locking` actually about Dirty Writes, or just about
   ordinary row locking that has nothing to do with isolation levels?"** It is precisely
   Berenson et al.'s own point (claim 1, re-quoted again under Problem Solving): ANSI SQL-92's own
   definitions only exclude P0 at its strictest level, yet every real locking implementation
   (including Postgres at every isolation level) excludes it unconditionally via row locks. The
   experiment demonstrates exactly the gap the paper itself calls out — a real engine being
   *more* isolated than its own named ANSI level technically requires.
3. **"Could the lost-update experiment's outcome (T2 always 'winning') be an artifact of the
   `threading.Event` ordering rather than a genuine database-level anomaly?"** No: the anomaly is
   that *both* updates commit successfully (verified: `results["t1_wrote"] == 110` committed
   without error) and the database itself provides no mechanism under Read Committed to detect
   that T2's write was based on data T1 had already changed — the threading events only pin down
   *which* interleaving happens, deterministically, for a reproducible demo; they don't suppress
   any check the database would otherwise have performed. Held.
4. **"Is quoting the Elle paper instead of Adya et al.'s own paper actually equivalent, or does
   it risk misattributing or diluting Adya's own formalism?"** The quotes used name Adya, Liskov
   and O'Neil explicitly as the formalism's own authors ("Adya, Liskov, and O'Neil formalized..."),
   and the terminology quoted (DSG, G0, direct dependencies) is Adya et al.'s own vocabulary,
   restated rather than reinterpreted — Elle's own stated purpose is implementing a checker
   *against* Adya's formalism, not proposing a competing one. Attribution stays intact.
5. **"Phantom (P3) is named in the syllabus scope but not reproduced in `examples.py` — is that
   a real gap?"** No: the syllabus's own outcome line asks to "reproduce at least one real
   anomaly as an actual two-transaction timeline," not every anomaly named; three are reproduced
   here (lost update, read skew, and dirty-write prevention), more than the minimum. Phantom and
   write skew are both named, defined and quoted precisely (claims 4 and 7), with write skew's
   own real reproduction explicitly deferred to topic 12, which is built specifically around it
   (the "on-call doctors" pattern, per `CHAPTER.md`) — reproducing it here too would duplicate
   that topic's own lab content.

## Problem Solving

- **Adya, Liskov & O'Neil's own paper and dissertation (hosted only on
  `pmg.csail.mit.edu`) could not be fetched.** Every URL tried (the ICDE 2000 paper PDF, the PhD
  thesis PDF, both with and without `www`) returned either an HTTP 403 or a genuine TLS connection
  reset, confirmed independent of this session's own proxy via `curl -v` against the raw host.
  **Fixed** by substituting Kingsbury & Alvaro's "Elle" paper (VLDB 2020, freely hosted on arXiv),
  which restates Adya et al.'s own dependency-graph formalism directly and by name, per the
  skill's own source-substitution rule.
- **The read-only transaction anomaly is named in the syllabus scope but predates neither of the
  chapter plan's two named sources** (Berenson et al. 1995 is four years earlier than Fekete et
  al.'s 2004 discovery of it; Adya et al. 2000 doesn't name it either). The two papers that
  actually define it (Fekete et al.'s own short 2004 paper and the longer 2005 TODS paper) could
  not be fetched either (a genuine TLS failure on `cs.umb.edu`, matching the exact same failure
  mode already seen on that host for a different paper in topic 9; a 404 on a Berkeley course
  mirror of the TODS paper). **Fixed** by finding and fetching Jorwekar et al.'s VLDB 2007 paper,
  which states the anomaly's own precise definition and cites Fekete et al. directly by name.
- **The Phantom (P3) definition's full sentence is split across a PDF page break** in the
  fetched Berenson et al. text ("...Transaction T2" ends one extracted block; "then creates data
  items..." begins a separate one, with unrelated page-furniture text extracted in between by
  `pdftotext`). **Fixed** by quoting the two fragments as two separate `>` blocks in `SOURCES.md`,
  each verified independently, rather than trying to force one continuous quote across the PDF's
  own extraction artifact.
