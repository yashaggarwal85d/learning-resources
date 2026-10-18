Last verified against these sources: 11 October 2026, with every example run in `examples.py`. Fact-check record: `FACT-CHECK.md`. Expert sign-off: pending.

- Cormen, Leiserson, Rivest and Stein, *Introduction to Algorithms*, 4th ed. (MIT Press, 2022), chapter 3 (asymptotic notation), chapter 2 (analysis of algorithms), chapter 7 (quicksort analysis).
- Donald Knuth, [Big Omicron and Big Omega and Big Theta](https://danluu.com/knuth-big-o.pdf), SIGACT News 8(2), 1976.
- Sedgewick and Wayne, [Algorithms, 4th ed., §1.4 Analysis of Algorithms](https://algs4.cs.princeton.edu/14analysis/).
- Mitzenmacher and Upfal, *Probability and Computing*, 2nd ed. (Cambridge University Press, 2017): Markov's inequality and randomized quicksort.
- Har-Peled, [Randomized Algorithms II](https://courses.grainger.illinois.edu/cs473/fa2023/lec/notes/09_rand_II.pdf), CS 473 lecture notes, University of Illinois, Fall 2023 (§9.1: quicksort recursion depth with high probability; §9.2: Markov's inequality).
- Garey and Johnson, *Computers and Intractability* (W. H. Freeman, 1979): the definition of pseudo-polynomial time.
- [libstdc++ `bits/stl_algo.h`](https://raw.githubusercontent.com/gcc-mirror/gcc/master/libstdc++-v3/include/bits/stl_algo.h) (introsort with `_S_threshold = 16` and a final insertion sort) and CPython's [timsort notes, `Objects/listsort.txt`](https://raw.githubusercontent.com/python/cpython/3.12/Objects/listsort.txt) (binary insertion sort for short runs).
- Spielman and Teng, [Smoothed Analysis of Algorithms: Why the Simplex Algorithm Usually Takes Polynomial Time](https://arxiv.org/abs/cs/0111050) (arXiv cs/0111050).
- Roughgarden (ed.), *Beyond the Worst-Case Analysis of Algorithms* (Cambridge University Press); introduction at [arXiv 2007.13241](https://arxiv.org/abs/2007.13241).
- Mitzenmacher and Vassilvitskii, [Algorithms with Predictions](https://arxiv.org/abs/2006.09123) (arXiv 2006.09123, a chapter of the same book).
- Rutanen, [O-notation in Algorithm Analysis](https://arxiv.org/pdf/1309.3210) (arXiv 1309.3210, 2013–2016); Howell, *On Asymptotic Notation with Multiple Variables* (2008).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=asymptotic-notation:%20).
