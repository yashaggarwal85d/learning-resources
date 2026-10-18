Last verified against these sources: 2026-10-12, with every example run in `examples.py`. Fact-check record: `FACT-CHECK.md`. Expert sign-off: pending.

- Mareš et al., [Data Structures, chapter “Dynamization”](https://gitlab.kam.mff.cuni.cz/datovky/dsbook/-/raw/04bd1ec6c83d9dd651ca58197c83a4e44255de14/51-dynamize/dynamize.tex) (lecture text, LaTeX source, commit 04bd1ec): global rebuilding with its examples, local rebuilding, and the worst-case semi-dynamization.
- Jeff Erickson, [Algorithms, Lecture 9: Amortized Analysis](https://jeffe.cs.illinois.edu/teaching/algorithms/notes/09-amortize.pdf) (Fa’13 notes, © 2018, CC BY-NC-SA 4.0): the hash table’s global rebuilding rules (exercise 9) and Ehrlich’s Gray-code counter.
- Jeff Erickson, [Algorithms, Lecture 10: Scapegoat and Splay Trees](https://jeffe.cs.illinois.edu/teaching/algorithms/notes/10-scapegoat-splay.pdf) (Fa’13 notes): lazy deletions and global rebuilding in a binary search tree, partial rebuilding, and the history of scapegoat trees (Overmars, Andersson, Galperin and Rivest).
- Igal Galperin and Ronald L. Rivest, [Scapegoat Trees](https://people.csail.mit.edu/rivest/pubs/GR93.pdf) (SODA 1993, author PDF): the definitions, the algorithms, the potential argument and the experiments; the formulas were read from the page images, since the PDF’s text layer garbles them.
- Jeffrey Dean and Luiz André Barroso, [The Tail at Scale](https://www.barroso.org/publications/TheTailAtScale.pdf) (Communications of the ACM 56(2), 2013): tail latency, fan-out, the sources of variability and its remedies.
- Robert E. Tarjan and Uri Zwick, [Optimal resizable arrays](https://arxiv.org/pdf/2211.11009) (arXiv:2211.11009v2, 29 May 2023): background rebuilding for doubling, the allocation assumption, the space-optimal frontier.
- Chris Okasaki, [Purely Functional Data Structures](https://www.cs.cmu.edu/~rwh/students/okasaki.pdf) (PhD thesis, CMU-CS-96-177, 1996), Chapter 5: batched, global and lazy rebuilding, and Overmars’s attribution.
- The Java Language Specification, [Java SE 26 Edition, Chapter 15](https://docs.oracle.com/javase/specs/jls/se26/html/jls-15.html), §15.10.2: the initialization of array components, as language semantics only.
- Wikipedia, [Scapegoat tree](https://en.wikipedia.org/wiki/Scapegoat_tree): a lead only, checked against the paper; it differs from the paper on the delete trigger (≤ against &lt;) and the paper is followed.

Named but not opened: Mark H. Overmars, *The Design of Dynamic Data Structures* (LNCS 156, Springer, 1983), through Okasaki and Erickson; Arne Andersson (1989 and 1999), through Erickson; Brodnik et al. (WADS 1999) and Sitarski (1996), through Tarjan and Zwick; Cormen, Leiserson, Rivest and Stein, for framing only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=deamortization-global-rebuilding:%20).
