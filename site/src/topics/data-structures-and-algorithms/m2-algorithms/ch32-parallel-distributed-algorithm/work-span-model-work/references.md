Last verified: 2026-11-05.

- Robert D. Blumofe, "Executing Multithreaded Programs Efficiently" (MIT-LCS-TR-677, 1995) —
  the greedy-scheduling theorem, the fully strict computation definition, the work-stealing
  deque's rules, and the space/time/communication bounds for randomized work stealing; the same
  joint research with Charles Leiserson later published as "Scheduling Multithreaded
  Computations by Work Stealing" (Journal of the ACM 46(5), 1999). [source](https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/mit/lcs/tr/MIT-LCS-TR-0677.pdf)
- Wikipedia, "Analysis of parallel algorithms" — the work law, the span law, and Brent's law's
  citation. [source](https://en.wikipedia.org/wiki/Analysis_of_parallel_algorithms)
- OpenCilk project homepage — the language this algorithm was designed for. [source](https://www.opencilk.org/)
- Rayon documentation, `join` (docs.rs, version 1.12.0) — work stealing as a real, documented
  Rust API, including its deadlock warning. [source](https://docs.rs/rayon/1.12.0/rayon/fn.join.html)

Named for attribution only, not read directly (per the chapter plan): Cormen, Leiserson,
Rivest and Stein, *Introduction to Algorithms*, 4th ed. (the work–span chapter, framing only);
Brent, "The Parallel Evaluation of General Arithmetic Expressions," Journal of the ACM 21(2),
1974, pp. 201–206; Graham, "Bounds for certain multiprocessing anomalies," The Bell System
Technical Journal 45, 1966, pp. 1563–1581, and "Bounds on multiprocessing timing anomalies,"
SIAM Journal on Applied Mathematics 17(2), 1969, pp. 416–429.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=work-span-model-work:%20).
