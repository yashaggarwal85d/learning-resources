# Sources

## Jeff Erickson, Algorithms

URL: http://jeffe.cs.illinois.edu/teaching/algorithms/book/12-nphard.pdf
Version: 1st edition, June 2019, Chapter 12 "NP-Hardness", §12.7 "Hamiltonian Cycle"

> A Hamiltonian cycle in a graph is a cycle that visits every vertex exactly once. (This is very different from an Euler circuit, which is a closed walk that traverses every edge exactly once; Euler circuits are easy to find and construct in linear time using depth-first search.) Here we consider two different proofs that the Hamiltonian cycle problem in directed graphs is NP-hard.

## Word ladder (Wikipedia)

URL: https://en.wikipedia.org/wiki/Word_ladder
Version: fetched 2026-11-05 (revision oldid 1381629340)

> A word ladder puzzle begins with two words, and to solve the puzzle one must find a chain of other words to link the two, in which two adjacent words (that is, words in successive steps) differ by exactly one letter.

> Lewis Carroll says that he invented the game on Christmas in 1877.

> The first mention of the game in Carroll's diary was on 12 March 1878, which he originally called "Word-links", and described as a two-player game.

> As each step changes only one letter, the number of steps must be at least the Hamming distance between the two words

Notes: the page attributes the Christmas 1877 invention claim to Haunsperger and Kennedy's *The Edge of the Universe* (2006), p. 22 (not independently fetched here); the diary entry of 12 March 1878 is the game's first mention in Carroll's diary under the name "Word-links," not necessarily the day of invention, and this topic states both dates with that distinction, as the Wikipedia page itself does. The Hamming-distance quote's own worked example on the page ("four in the above example," for the word pair in that section) is not reused verbatim here; this topic instead computes and asserts its own ladder's Hamming distance directly in `examples.py`.
