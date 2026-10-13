# What an expert must know: the potential method (blind review)

Sources opened and read via sources.mjs (local text in /tmp/blind-*.txt):
- T = Tarjan 1985, https://courses.cs.duke.edu/fall11/cps234/reading/Tarjan85_AmortizedComplexity.pdf
- S = Saia CS362 L12, https://cs.unm.edu/~saia/classes/362-s06/lec/ho-lec12.pdf
- P = Temple CIS9615, https://cis.temple.edu/~wangp/9615-AA/Lecture/08-Amortized.htm
- F = O'Kane CSCE750 Fibonacci heap notes, https://www.cse.sc.edu/~fenner/csce750/OKane-Fall-2020/notes-fibheap.pdf

1. Definition: amortized cost a_i = c_i + Φ(D_i) − Φ(D_{i−1}); Φ maps a whole configuration to a real.
   T: "We define the amortized time of an operation to be" actual time "+Φ(D')−Φ(D)". Placement: here.
2. Telescoping identity: total actual time = total amortized time + (Φ_0 − Φ_m).
   T: "the total time of the operations equals the sum of their amortized times plus the net decrease in potential from the initial to the final configuration." Placement: here.
3. Validity conditions: Φ_0 = 0 (or minimal) and Φ ≥ 0 always, so amortized sum upper-bounds true cost.
   T: "In most cases of interest, the initial potential is zero and the potential is always nonnegative. In such a situation the total amortized time is an upper bound on the total time." Placement: here.
4. Φ is free to choose and is a proof artifact, not stored; a better Φ gives tighter amortized bounds.
   T: "We are free to choose the potential function in any way we wish; the more astute the choice, the more informative the amortized times will be." Placement: here.
5. Equivalence of credit (banker) and potential (physicist) views; potential = credit on the whole structure; the physicist view is Sleator's.
   T: "The banker's and physicist's views of amortization are entirely equivalent". P: "uses a 'potential' defined on the whole data structure, rather than 'credits' on individual data objects." Placement: here.
6. Warm-up potentials from the previous topic: stack Φ = size; binary counter Φ = number of 1s.
   P: "For a binary counter, define the potential as the number of 1s in it." Placement: here (as recap bridge).
7. Expansion-only table: Φ = 2·num − size; zero initially, nonnegative, amortized insert cost 3.
   S: "Φi = 2 ∗ numi − sizei" and "amortized cost per operation is 3". Placement: here.
8. Two-piece Φ for expand/contract: 2·num − size if α ≥ 1/2, size/2 − num if α < 1/2; why it is continuous (0 at α = 1/2) and nonnegative.
   S: "Φ(t) = 2 ∗ T.num − T.size if α(T) ≥ 1/2; T.size/2 − T.num if α(T) < 1/2" and "when α = 1/2, the potential is 0". Placement: here.
9. Intuition check: Φ = num at full (pays for copy on expansion) and Φ = num at α = 1/4 (pays for copy on contraction).
   S: "When the load factor is 1/4, T.size = 4∗T.num, which means Φ(T) = T.num, so the potential can pay for a contraction". Placement: here.
10. Full case analysis: insert (α_{i−1} ≥ 1/2, < 1/2 with two subcases) and delete (no contraction, contraction, α ≥ 1/2), giving amortized cost ≤ 3 for insert and 2 or 1 on the delete cases. The contraction case uses size_i/2 = size_{i−1}/4 = num_i + 1.
    S: "ai = 1 + (sizei/2 − numi) − (sizei−1/2 − numi−1) ... = 1" (contraction case). Placement: here.
11. Thrashing at 1/2: with grow-at-full / shrink-below-half, the sequence I, D, D, I, I, D, D... after filling to n/2 forces a Θ(n) resize every 2 ops, so Θ(n²) total.
    S: "The cost of each expansion and deletion is Θ(n) and there are Θ(n) of them. Thus the total cost of n operations is Θ(n²)". Placement: here.
12. Why 1/4 works: after a resize the table is exactly half full, so Θ(size) ops are needed before the next resize (hysteresis gap between grow and shrink thresholds); load factor stays within [1/4, 1].
    S: "After an expansion, we don't perform enough deletions to pay for the contraction (and vice versa)"; "the load factor never drops below 1/4". P: "better to set different load-factor thresholds ... to avoid frequent expansion-contraction cycle." Placement: here.
13. Potential method yields per-operation bounds for any interleaving, while aggregate gives only an average; amortized is worst-case over sequences, not probabilistic average.
    T: "average the running time per operation over a (worst-case) sequence of operations". Placement: here.
14. Splay trees: Φ = Σ log w(x), w(x) = subtree size; gives O(log n) amortized access (needs the access lemma, not table-style arithmetic).
    T: "we define the potential of a splay tree to be the sum over all internal nodes x of log w(x)". Placement: a later syllabus topic (Splay trees).
15. Union-find: O(m α(m,n)) bound via potential/credits-and-debits; proof is hard, so a syllabus line should only cite it.
    T: "The set union algorithm with both heuristics is extremely hard to analyze ... Tarjan's proof is a complicated amortized analysis that uses debits as well as credits." Placement: a later syllabus topic (Union–find).
16. Fibonacci heaps: Φ = t(H) + 2m(H) (roots + 2 × marked nodes); insert +1, meld 0, decrease-key with cascading cuts amortizes to O(1) as 4 − c cancels actual cost c.
    F: "Φ(H) = t(H) + 2m(H)" and "Φ(H′) − Φ(H) = c − 2(c − 2) = 4 − c". Placement: a later syllabus topic (Fibonacci heaps).
17. Fibonacci heap extract-min: amortized O(D(n)) = O(lg n) needs the structural lemma size(x) ≥ F_{k+2} (degree bound), separate from the potential argument.
    F: "Lemma: Let x be a node in a Fibonacci heap with degree k. Then size(x) ≥ Fk+2". Placement: a later syllabus topic (Fibonacci heaps).
18. Potential-method limits: the amortized bound holds only for sequences starting from the Φ_0 state; Φ arguments do not handle persistence or worst-case-per-op needs (a single op can still cost Θ(n)), which motivates deamortization.
    T: "amortized rather than a worst-case" (efficient algorithms "in an amortized rather than a worst-case sense"). Placement: a later syllabus topic (Deamortization; persistence caveat: Persistence).

Caveat: item 18's persistence point is my own inference. The sources do not state it, and only the deamortization link is loosely supported by T.
