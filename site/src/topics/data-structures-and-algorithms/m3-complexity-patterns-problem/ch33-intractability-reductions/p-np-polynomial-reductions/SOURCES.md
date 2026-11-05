# Sources — dsa.p-np-polynomial-reductions

## 1. Erickson, *Algorithms* (2019), Chapter "NP-Hardness"

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/12-nphard.pdf
Local copy: `sources/erickson-nphard.txt`

Fetched as a PDF from `jeffe.cs.illinois.edu`; `pdftotext` renders the chapter's set-notation
symbols (∈, Σ*, the blackboard-bold letters for languages) as garbled glyphs. Every quote below
is chosen from the chapter's clean prose sentences, avoiding lines containing those glyphs.

> P is the set of decision problems that can be solved in polynomial time.

> NP is the set of decision problems with the following property: If the answer is Y , then
> there is a proof of this fact that can be checked in polynomial time.

> Every decision problem in P is also in NP.

> NP is an abbreviation for Nondeterministic Polynomial-time.

> Researchers in complexity theory prefer to define NP-hardness in terms of polynomial-time
> many-one reductions, which are also called Karp reductions.

> many-one reductions apply only to decision problems (or more formally, to languages);
> formally, no optimization or construction problem is Karp-NP-hard.

> The Cook-Levin Theorem. Circuit satisfiability is NP-hard.

> I is an independent set in a graph G = (V, E) if and only if its complement V \ I is a vertex
> cover of the same graph G.

> The graph G contains exactly 3k
> vertices, one for each literal in . Two vertices in G are connected by an
> edge if and only if either ( ) they correspond to literals in the same clause, or
> ( ) they correspond to a variable and its inverse.

> Each independent set in G contains at most one vertex from each clause triangle, because any
> two vertices in each triangle are connected.

> The Clay Mathematics Institute lists
> P-versus-NP as the first of its seven Millennium Prize Problems, offering a

## 2. PostgreSQL 18 Documentation, "14.3. Controlling the Planner with Explicit JOIN Clauses"

URL: https://www.postgresql.org/docs/current/explicit-joins.html
Local copy: `sources/postgres-explicit-joins.txt`

> the number of possible join orders grows exponentially as the number of tables expands.
> Beyond ten or so input tables it's no longer practical to do an exhaustive search of all the
> possibilities, and even for six or seven tables planning might take an annoyingly long time.

(The chapter plan named the Genetic Query Optimizer page, §61.1, for this fact; that page's own
body text did not render through the fetcher — only its table of contents did — so the builder
uses this page instead, which the GEQO chapter itself points back to for the underlying
join-order growth problem and states the same fact about query-plan search space growth.)

## 3. Wikipedia, "Bin packing problem"

URL: https://en.wikipedia.org/wiki/Bin_packing_problem
Local copy: `sources/wiki-binpacking.txt`

> Computationally, the problem is NP-hard, and the corresponding decision problem, deciding if
> items can fit into a specified number of bins, is NP-complete.

> The bin packing problem is strongly NP-complete. This can be proven by reducing the strongly
> NP-complete 3-partition problem to bin packing.

## 4. Wikipedia, "Cook–Levin theorem"

URL: https://en.wikipedia.org/wiki/Cook%E2%80%93Levin_theorem
Local copy: `sources/wiki-cook-levin.txt`

> In 1971, Stephen Cook published his paper "The complexity of theorem proving procedures"

> in conference proceedings of the newly founded ACM Symposium on Theory of Computing. Richard
> Karp's subsequent paper, "Reducibility among
> combinatorial problems",

> generated renewed interest in Cook's paper by providing a list of 21 NP-complete problems. Karp also introduced the notion of completeness used in the current definition of NP-completeness (i.e., by polynomial-time many-one reduction). Cook and Karp each received a Turing Award for this work.

## 5. Wikipedia, "Karp's 21 NP-complete problems"

URL: https://en.wikipedia.org/wiki/Karp%27s_21_NP-complete_problems
Local copy: `sources/wiki-karp21.txt`

> In his 1972 paper, "Reducibility Among Combinatorial Problems",

> Richard Karp used Stephen Cook's 1971 theorem that the Boolean satisfiability problem is NP-complete

> (also called the Cook–Levin theorem) to show that there is a polynomial time many-one reduction from the Boolean satisfiability problem to each of 21 combinatorial and graph theoretical computational problems, thereby showing that they are all NP-complete.

(Named as a pointer only, per CHAPTER.md: the primary 1972 paper itself is not read, and no
specific problem from Karp's list beyond independent set and vertex cover — already covered by
Erickson — is taught on screen.)

**Named, not read:**

Cook, "The complexity of theorem-proving procedures" (STOC 1971), and Karp, "Reducibility among
combinatorial problems" (1972): their existence, dates, titles and the headline result (Cook
proved SAT is NP-hard; Karp's paper supplied the 21-problem list and the many-one-reduction
notion of completeness) are confirmed above via the Cook–Levin Wikipedia page and the Karp's-21
Wikipedia page, both of which cite the original papers; the original papers themselves are not
opened, and no claim beyond what those two tertiary sources state is made about their contents.
Garey and Johnson, *Computers and Intractability* (1979), and Kleinberg and Tardos, *Algorithm
Design*, ch. 8: cited by the chapter plan as alongside-references, not opened, no claim sourced
from them. CLRS 4th ed.: not opened, not cited for any claim.

**Read directly, not fetched:**

Chapter 32 topic 106's own handoff (quoted word for word in the registry and in this topic's
`OUTLINE.md` bridge) and CHAPTER.md's own handoff text for this topic are read directly from the
repository, not fetched as a web source.
