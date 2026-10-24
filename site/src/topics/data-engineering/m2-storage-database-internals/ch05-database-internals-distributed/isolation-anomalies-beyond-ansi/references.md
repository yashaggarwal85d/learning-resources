Last verified: 24 October 2026. Three real two-transaction timelines run in this sandbox
(`examples.py`, against this sandbox's own Postgres cluster): a lost update under Read Committed,
a read skew under Read Committed, and a dirty write genuinely blocked by real row-level locking.
Adya, Liskov & O'Neil's own paper and dissertation (MIT's `pmg.csail.mit.edu`) could not be
fetched — a genuine TLS connection reset on every URL tried, independent of this session's own
proxy — and are replaced below by a 2020 paper that restates their own formalism directly and by
name. The read-only transaction anomaly (Fekete et al., 2004/2005) is likewise unreachable at its
own original hosts and is sourced from a 2007 paper that states it and cites Fekete et al. by name.

- Berenson, Bernstein, Gray, Melton, O'Neil, O'Neil, "A Critique of ANSI SQL Isolation Levels" (SIGMOD 1995): [arxiv.org](https://arxiv.org/pdf/cs/0701157). The full P0–P4, A5A/A5B and phantom anomaly vocabulary, and the paper's own demonstration of the ANSI definitions' ambiguity.
- Kingsbury & Alvaro, "Elle: Inferring Isolation Anomalies from Experimental Observations" (VLDB 2020): [arxiv.org](https://arxiv.org/pdf/2003.10554). Restates Adya, Liskov & O'Neil's own dependency-graph formalism (the Direct Serialization Graph, G0 as a write-only cycle) directly.
- Jorwekar, Fekete, Ramamritham, Sudarshan, "Automating the Detection of Snapshot Isolation Anomalies" (VLDB 2007): [vldb.org](https://www.vldb.org/conf/2007/papers/industrial/p1263-jorwekar.pdf). The read-only transaction anomaly's own precise definition, citing Fekete et al.'s original discovery directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=isolation-anomalies-beyond-ansi:%20).
