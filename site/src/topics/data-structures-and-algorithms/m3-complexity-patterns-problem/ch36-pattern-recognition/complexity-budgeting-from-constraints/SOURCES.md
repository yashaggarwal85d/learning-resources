# Sources

## Antti Laaksonen, Competitive Programmer's Handbook

URL: https://cses.fi/book/book.pdf
Version: draft of 3 July 2018, Chapter 2 "Time complexity", §2.3 "Estimating efficiency", pages 20-21

> By calculating the time complexity of an algorithm, it is possible to check, before implementing the algorithm, that it is efficient enough for the problem. The starting point for estimations is the fact that a modern computer can perform some hundreds of millions of operations in a second.

> On the other hand, given the input size, we can try to guess the required time complexity of the algorithm that solves the problem. The following table contains some useful estimates assuming a time limit of one second.

> For example, if the input size is n = 105 , it is probably expected that the time complexity of the algorithm is O ( n) or O ( n log n). This information makes it easier to design the algorithm, because it rules out approaches that would yield an algorithm with a worse time complexity.

> Still, it is important to remember that a time complexity is only an estimate of efficiency, because it hides the constant factors. For example, an algorithm that runs in O ( n) time may perform n/2 or 5 n operations. This has an important effect on the actual running time of the algorithm.

Notes: the book's table (input size → required time complexity: n ≤ 10 → O(n!), n ≤ 20 → O(2^n), n ≤ 500 → O(n^3), n ≤ 5000 → O(n^2), n ≤ 10^6 → O(n log n) or O(n), "n is large" → O(1) or O(log n)) is reproduced from the PDF's own typeset table, not quoted as running prose (`sources.mjs check` quotes prose, not a table's cell layout); every number in it is computed and asserted directly in `examples.py`. The meet-in-the-middle arithmetic (2^40 at n=40 versus two halves of 2^20) and the binary-search-on-the-answer iteration counts (30 for a range of 10^9, 60 for 10^18) are plain arithmetic, computed and asserted in `examples.py`, and are not quoted from this or any other source.

Not quoted here, named for context only: the chapter's own measurement of sequential versus random access (reusing Chapter 1 topic 9's method, see `references.md`) is the builder's own timed experiment in `examples.py`, not a source quote.

## Time complexity (Wikipedia)

URL: https://en.wikipedia.org/wiki/Time_complexity
Version: fetched 2026-11-05

> In theoretical computer science, the time complexity is the computational complexity that describes the amount of computer time it takes to run an algorithm.

> Time complexity is commonly estimated by counting the number of elementary operations performed by the algorithm, supposing that each elementary operation takes a fixed amount of time to perform.

> Algorithmic complexities are classified according to the type of function appearing in the big O notation. For example, an algorithm with time complexity O(n) is a linear time algorithm and an algorithm with time complexity O(nα) for some constant 0

Notes: the last quote is cut at the page's own rendering of its inline math (the condition "α>0" renders as embedded markup in the fetched plain text, not as plain words), so the quote stops at the point common to both the source and the page as fetched; the clause it introduces ("...is a polynomial time algorithm") is restated in this topic's own words, not quoted past that point.
