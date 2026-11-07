---
id: dsa.pseudo-polynomial-time-strong
title: Pseudo-polynomial time and strong NP-hardness
---

<section data-section="outcomes">

## After this topic you can

- Explain why knapsack's O(n·W) dynamic program is "pseudo-polynomial" — polynomial in the value
  of the numbers in the input, exponential in the number of bits it takes to write them.
- Say what weak and strong NP-hardness mean, give an example of each, and say why a strongly
  NP-hard problem has no pseudo-polynomial algorithm unless P equals NP.
- Read an input's encoding carefully enough to tell whether "polynomial" means polynomial in the
  numbers' values or polynomial in their length.

</section>

<section data-section="internals">

## Into the internals

### One formula explains the whole gap

The knapsack dynamic program's cost is n times W cells, where W is the capacity's actual value.
Writing W in binary takes b = ceil(log2 W) bits, so the same cost is n times 2^b: polynomial in
b's *exponent* is exponential in b itself. The algorithm is only fast when W is small relative to
how many bits it would take a truly adversarial instance to encode it — which is exactly what
"pseudo-polynomial" names.

### Why the no-escape argument is not specific to bin packing

The argument that a strongly NP-hard problem has no pseudo-polynomial algorithm (assuming P does
not equal NP) uses nothing about bin packing in particular: if such an algorithm existed for any
strongly NP-hard problem, running it on the bounded-numbers instances that strong hardness
insists stay hard would finish in ordinary polynomial time, contradicting that those exact
instances are NP-hard. The argument is a one-line consequence of the definition, and it applies
to three-partition, bin packing, or any other strongly NP-hard problem alike.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the knapsack O(n·W) dynamic program
checked against brute force on twenty random instances, its cell count computed fresh at ten,
twenty and forty bits of capacity, a timed run showing the measured time roughly doubling with
each bit appended, the unary-against-binary length gap for a concrete capacity, a three-partition
backtracking solver whose call count grows sharply as more triples are added while every number
stays small, and the bin-packing table size for a fixed, small number of bins, confirmed against
an actual feasibility search. Re-run the timed knapsack loop at a wider range of bit lengths and
confirm the doubling pattern holds further out. Re-run the three-partition generator with a
different random seed and confirm the call count still climbs.

</section>

<section data-section="production">

## In production

**Reading the encoding carefully** is not an academic nicety: a knapsack-shaped problem where
the capacity is a dollar budget in cents, or a weight in milligrams, can turn a textbook-fast
dynamic program slow in practice, because the bit length of the capacity — not its "size" in any
everyday sense — is what the algorithm's cost actually depends on. The same caution applies in
reverse: a problem that looks intractable on paper can become easy in practice if its real-world
numbers happen to stay small, which is exactly the situation a weakly NP-hard problem offers and
a strongly NP-hard one never does.

</section>

<section data-section="frontier">

## The frontier

Garey and Johnson's 1978 paper and 1979 book are the origin of the strong/weak NP-hardness
distinction used throughout this topic; both are named, not read, consistent with the chapter
plan. Fine-grained complexity — conditional lower bounds built on conjectures like SETH, 3SUM,
and APSP, naming results such as Backurs and Indyk's subquadratic-edit-distance impossibility —
is the next layer beyond classical NP-hardness and is named once here as a pointer, not built.

</section>

<section data-section="next">

## Where this goes next

Weak or strong, an NP-hard problem's practical message is the same once an exact, fast algorithm
is ruled out: stop looking for one and ask a different question instead. Approximation ratios
and greedy set cover, next.

</section>
