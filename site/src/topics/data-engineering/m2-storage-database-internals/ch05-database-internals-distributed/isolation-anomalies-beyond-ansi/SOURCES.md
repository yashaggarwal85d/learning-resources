# Sources: Isolation anomalies beyond ANSI (`de.isolation-anomalies-beyond-ansi`)

Adya's own dissertation and the "Generalized Isolation Level Definitions" paper (the chapter
plan's second named source) are hosted only on MIT's `pmg.csail.mit.edu`, which this sandbox
cannot reach (a genuine TLS connection reset, confirmed with `curl -v` independent of this
session's own proxy, on every URL tried). Per the skill's source-substitution rule, it is
replaced below by Kingsbury & Alvaro's "Elle" paper (VLDB 2020), which restates Adya's own
dependency-graph formalism directly, with the same vocabulary (Direct Serialization Graph, G0/G1/
G2), and cites Adya, Liskov & O'Neil's original 2000 paper by name. The read-only transaction
anomaly (named in the syllabus line but not in Berenson et al.'s 1995 paper, which predates its
2004 discovery) is sourced from Jorwekar et al.'s VLDB 2007 paper, which states it and cites
Fekete et al.'s own original paper directly.

## A Critique of ANSI SQL Isolation Levels (Berenson, Bernstein, Gray, Melton, O'Neil, O'Neil; SIGMOD 1995)

URL: https://arxiv.org/pdf/cs/0701157
Version: 2007 arXiv posting of Microsoft Research technical report MSR-TR-95-51, retrieved 2026-10-24

> P1 (Dirty Read): Transaction T1 modifies a data item. Another transaction T2 then reads that data item before T1 performs a COMMIT or ROLLBACK. If T1 then performs a ROLLBACK, T2 has read a data item that was never committed and so never really existed.

> P2 (Non-repeatable or Fuzzy Read): Transaction T1 reads a data item. Another transaction T2 then modifies or deletes that data item and commits. If T1 then attempts to reread the data item, it receives a modified value or discovers that the data item has been deleted.

> (2.1) w1[x] . . . r2[x] . . . (a1 and c2 in either order)

> (2.2) w1[x]...r2[x]...((c1 or a1) and (c2 or a2) in any order) Forbidding the (2.2) variant of P1 disallows any history where T1 modifies a data item x, then T2 reads the data item before T1 commits or aborts. It does not insist that T1 aborts or that T2 commits. Definition (2.2) is a much broader interpretation of P1 than (2.1), since it prohibits all four possible commit-abort pairs by transactions T1 and T2, while (2.1) only prohibits two of

> P0 (Dirty Write): Transaction T1 modifies a data item. Another transaction T2 then further modifies that data item before T1 performs a COMMIT or ROLLBACK. If T1 or T2 then performs a ROLLBACK, it is unclear what the correct data value should be.

> P4 (Lost Update): The lost update anomaly occurs when transaction T1 reads a data item and then T2 updates the data item (possibly based on a previous read), then T1 (based on its earlier read value) updates the data item and commits.

> A5A Read Skew Suppose transaction T1 reads x, and then a second transaction T2 updates x and y to new values and commits. If now T1 reads y, it may see an inconsistent state, and therefore produce an inconsistent state as output.

> A5B Write Skew Suppose T1 reads x and y, which are consistent with C(), and then a T2 reads x and y, writes x, and commits. Then T1 writes y. If there were a constraint between x and y, it might be violated.

> Fuzzy Reads (P2) is a degenerate form of Read Skew where x=y.

> P3 (Phantom): Transaction T1 reads a set of data items satisfying some <search condition>. Transaction T2

> then creates data items that satisfy T1's <search condition> and commits. If T1 then repeats its read with the same <search condition>, it gets a set of data items different from the first read.

Contents: the full P0–P4, A5A/A5B and phantom anomaly vocabulary (dirty write, dirty read,
non-repeatable read, lost update, read skew, write skew, phantom), the broad-vs-narrow
interpretation (2.1 vs. 2.2) that is itself the paper's own demonstration of the ANSI
definitions' ambiguity, and Read Skew's own relationship to Non-repeatable Read as a degenerate
case.

## Elle: Inferring Isolation Anomalies from Experimental Observations (Kingsbury & Alvaro; VLDB 2020)

URL: https://arxiv.org/pdf/2003.10554
Version: retrieved 2026-10-24

> In their 2000 paper "Generalized Isolation Level Definitions", Adya, Liskov, and O'Neil formalized a variety of transactional isolation levels in terms of proscribed behaviors in an abstract history H.

> The direct serialization graph DSG(H) is a graph over transactions in some history H, whose edges are given by these dependencies. A G0 anomaly is a cycle in the DSG comprised entirely of write dependencies. G1c anomalies include read dependencies. Instances of G2 involve at least one anti-dependency (those with exactly one are G-single).

Contents: Adya, Liskov and O'Neil's own dependency-graph formalization, restated directly (the
Direct Serialization Graph, and anomalies defined as cycles over it rather than as English-
language phenomena) — the formal answer to the same ambiguity Berenson et al.'s paper
demonstrates informally.

## Automating the Detection of Snapshot Isolation Anomalies (Jorwekar, Fekete, Ramamritham, Sudarshan; VLDB 2007)

URL: https://www.vldb.org/conf/2007/papers/industrial/p1263-jorwekar.pdf
Version: retrieved 2026-10-24

> Fekete et al. [7] also describe another kind of anomaly that they call a read-only-transaction anomaly. This involves a reader seeing a state that could not occur in any serial execution that leads to the actual final state of the interleaved execution.

Contents: the read-only transaction anomaly's own precise definition, citing Fekete et al.'s
original discovery of it directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=isolation-anomalies-beyond-ansi:%20).
