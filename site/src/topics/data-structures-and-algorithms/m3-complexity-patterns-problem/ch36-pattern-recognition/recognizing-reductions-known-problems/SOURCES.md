# Sources

## Jeff Erickson, Algorithms

URL: http://jeffe.cs.illinois.edu/teaching/algorithms/book/12-nphard.pdf
Version: 1st edition, June 2019, Chapter 12 "NP-Hardness", §12.7 "Hamiltonian Cycle"

> A Hamiltonian cycle in a graph is a cycle that visits every vertex exactly once. (This is very different from an Euler circuit, which is a closed walk that traverses every edge exactly once; Euler circuits are easy to find and construct in linear time using depth-first search.) Here we consider two different proofs that the Hamiltonian cycle problem in directed graphs is NP-hard.

Notes: this quote was already fetched and verified for topic 115 (`dsa.modelling-problems-as-graphs`); reused here for the shortest-path shape's near-miss (a shortest path required to visit every vertex is the Hamiltonian-cycle family, not a plain shortest path).

## 2-satisfiability (Wikipedia)

URL: https://en.wikipedia.org/wiki/2-satisfiability
Version: fetched 2026-11-05

> In terms of the implication graph, two literals belong to the same strongly connected component whenever there exist chains of implications from one literal to the other and vice versa.

> As Aspvall et al. showed, this is a necessary and sufficient condition: a 2-CNF formula is satisfiable if and only if there is no variable that belongs to the same strongly connected component as its negation.

> Nevertheless, even this smaller time bound was greatly improved by the later linear time algorithms of Even, Itai & Shamir (1976) and Aspvall, Plass & Tarjan (1979).

Notes: the primary paper (Aspvall, Plass and Tarjan, "A linear-time algorithm for testing the truth of certain quantified boolean formulas", *Information Processing Letters* 8(3), 1979) is attributed here from this Wikipedia page's own citation, exactly as the chapter plan's own sourcing note requires ("the attribution is from the Wikipedia 2-satisfiability page... the paper is not read, and the title and venue are from memory and to be verified"); this topic does not claim to have read the primary paper itself, only the Wikipedia page's statement of it.
