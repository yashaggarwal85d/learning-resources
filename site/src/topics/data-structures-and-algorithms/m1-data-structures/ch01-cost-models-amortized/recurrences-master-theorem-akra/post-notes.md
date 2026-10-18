---
id: dsa.recurrences-master-theorem-akra
title: "Recurrences: Master theorem and Akra–Bazzi"
---

<section data-section="outcomes">

## After this topic you can

- Draw the recursion tree of a divide-and-conquer recurrence, read each level's total off it, and say which end of the column dominates.
- Apply the Master theorem in its three cases, including the regularity condition for case 3, and recognise a recurrence it does not cover (a gap between cases, a non-constant number of subproblems, a full-history recurrence).
- Solve an unequal-split recurrence with Akra–Bazzi: find p from Σ aᵢ·bᵢ<sup>p</sup> = 1 (numerically when needed), evaluate the integral for f(n) = n, and see why deterministic selection is linear.
- Prove a guessed bound by substitution with explicit constants, avoid the drifting-constant false proof, and strengthen a right guess that fails by subtracting a lower-order term.

</section>

<section data-section="internals">

## A little deeper

### A recurrence is a program's step count

- **What T(n) counts.** On the word-RAM of the previous topic, T(n) is the number of word operations a recursive procedure performs on an input of size n: the work of the call itself, f(n), plus the work of the calls it makes. The recurrence is a definition of T by T at smaller sizes, plus base cases. The examples file uses T(1) = 1 (and T(0) = 1 where a floor reaches 0: the selection counts 6,532 and 8,832,605 depend on that choice, and with T(0) = 0 they are 6,394 and 8,788,161).
- **Only an asymptotic answer is possible.** The constant inside f(n) is never known exactly, so the recurrence is given only asymptotically, and so is its solution. Erickson: "we can safely assume that T(1) = Θ(1), or even that T(n) = Θ(1) for all n ≤ 10<sup>100</sup>". The base value changes only the constant, except in degenerate cases: T(n) = 2T(n/2) with T(1) = 0 is identically 0, with T(1) = 1 it is n.
- **Shorthand.** "T(n) = 2T(n/2) + n" is shorthand for the version with ⌈n/2⌉ and ⌊n/2⌋; Erickson: "When n is odd, then the recurrence calls for us to sort a fractional number of elements!" The next sections say why that does not matter.

### The recursion tree, in full

- **The level sums.** Level i has aⁱ nodes of size n/bⁱ and total aⁱ·f(n/bⁱ). The depth is L = log<sub>b</sub> n and the leaf level has a<sup>L</sup> = n<sup>log<sub>b</sub> a</sup> nodes, the watershed. T(n) is the sum of the column. Only the largest term of a geometric series matters (it is a constant times its largest term), so there are three easy cases: decreasing, equal, increasing.
- **Erickson's form and the textbook form.** Erickson states the theorem by comparing a·f(n/b) with f(n): equal to κ·f(n) with κ &lt; 1 gives Θ(f(n)); equal to f(n) gives Θ(f(n)·log<sub>b</sub> n); equal to K·f(n) with K &gt; 1 gives Θ(n<sup>log<sub>b</sub> a</sup>). "If none of these three cases apply, you're on your own." The CLRS form compares f(n) with the watershed instead, with an ε in cases 1 and 3 and, in case 2, either f = Θ(n<sup>log<sub>b</sub> a</sup>) (the reel's statement, k = 0) or the extended form with a factor log<sup>k</sup> n (k ≥ 0), which closes the n log n gap of step 6. The 4th edition (2022) states it for a &gt; 0 with a nonnegative "driving function" and floors and ceilings built in (per A. Dillhoff's restatement of its Theorem 4.1; the book itself was not opened). Sources number the cases differently: CMU 15-451 calls the root-dominated case 1, the reverse of CLRS. This page names cases by what wins (leaves, tie, root) as well as by number.
- **Case 2 below k = 0.** From the Akra–Bazzi integral: for −1 &lt; k &lt; 0 the case-2 formula Θ(n<sup>log<sub>b</sub> a</sup>·log<sup>k+1</sup> n) still holds (f = n/√log n gives Θ(n·√log n)); k = −1 gives Θ(n<sup>log<sub>b</sub> a</sup>·log log n) (Prove it 2), and k &lt; −1 gives Θ(n<sup>log<sub>b</sub> a</sup>).
- **Regularity.** Automatic for f = n<sup>d</sup> above the watershed (c = a/b<sup>d</sup>), and needed in general. Take T(n) = T(n/2) + f(n) with f(n) = n at n = 4<sup>j</sup> and n² at the other powers of 2: f is Ω(n<sup>0+1</sup>) but fails regularity, and T(4<sup>j</sup>) tends to 4n²/15 although f(n) = n there (`examples.py`). The MIT 6.046 handout's T(n/2) + n·(2 − cos n) ("We are in Case 3, but the regularity condition is violated", with c ≥ 3/2) shows the theorem falling silent rather than giving a wrong answer: n ≤ f(n) ≤ 3n, so T(n) = Θ(n) anyway. Some lecture statements drop "c &lt; 1", which makes the condition empty.
- **a &lt; 1.** The handout (a ≥ 1 form) says 0.5·T(n/2) + 1/n "Does not apply (a &lt; 1)", but the CLRS 4th edition form (a &gt; 0) covers it: watershed n<sup>−1</sup> = f, case 2, Θ((log n)/n), which is also Leighton's Akra–Bazzi example (n·T(n) = log₂ n + 1 exactly for powers of two).
- **What the theorem does not cover.** The gaps (n log n above, n/log n below the watershed); a non-constant number of subproblems (√n·T(√n) + n has depth log log n, every level n, so Θ(n log log n)); f that is not positive; and full-history recurrences such as the quicksort recurrence stated and checked in the first topic's Deep dive. The tree is a way to generate a guess; the proof is substitution, or a theorem whose hypotheses were checked.

### Floors, ceilings and small shifts

- **Do they matter?** No: Erickson, "the short version is that they don't matter". The exact merge sort count M(n) = M(⌈n/2⌉) + M(⌊n/2⌋) + n is 672 at n = 100 and 9,976 at 1,000 (with M(1) = 0) against n·log₂ n = 664 and 9,966, within 2 % of n log₂ n for n from 100 to 10<sup>6</sup>.
- **Domain transformation.** Overestimate T(n) ≤ 2T(n/2 + 1) + n, set S(n) = T(n + 2), and S is a clean recurrence: "So T(n) = Θ(n log n) after all, just as though we had ignored the floors and ceilings from the beginning!"
- **Monotone sandwich.** If T is nondecreasing, T(n) lies between T at the powers of b just below and just above n, which differ by a constant factor when f grows polynomially. This assumes T is monotone, which a recurrence with a wild f need not be.
- **Leighton's general answer.** The perturbations hᵢ(n) leave the solution unchanged when |hᵢ(n)| ≤ n/log<sup>1+ε</sup> n for some ε &gt; 0 (his Theorem 2); a ceiling is hᵢ(x) = ⌈bᵢx⌉ − bᵢx, and −√x and x/log² x are allowed too. The bound is nearly tight: T(x) = 2T(x/2 + x/log x) + x solves to x·log<sup>Θ(1)</sup> x, not Θ(x log x) (brute force: T(x)/(x log₂ x) grows from 3.7 to 28.6 over x = 2<sup>10</sup> … 2<sup>50</sup> while T(x)/(x log₂² x) stays between 0.37 and 0.57).
- **Discrete versions.** Roura's Discrete Master Theorem builds floors and ceilings into the statement and theorems "free us almost completely from technicalities like floors and ceilings".

### Akra–Bazzi, stated and used

- **The statement** (Leighton's Equation 1 and Theorem 1). T(x) = 1 for 1 ≤ x ≤ x₀ and T(x) = Σ aᵢ·T(bᵢx) + g(x) for x &gt; x₀, with x ≥ 1 real; x₀ ≥ 1/bᵢ and x₀ ≥ 1/(1 − bᵢ); aᵢ &gt; 0; bᵢ in (0, 1); k ≥ 1 constant; and g nonnegative with the polynomial-growth condition: g(u) is within constant factors of g(x) for every u in [bᵢx, x]. Then T(x) = Θ(x<sup>p</sup>·(1 + ∫₁ˣ g(u)/u<sup>p+1</sup> du)) where p is the unique real with Σ aᵢ·bᵢ<sup>p</sup> = 1. (When f is undefined near u = 1, as u/log u is, start the integral at any constant above 1; the Θ is unchanged.) x<sup>α</sup>·log<sup>β</sup> x satisfies the condition for large x; 2<sup>x</sup> does not, and if g grows faster than any polynomial then T(x) = Θ(g(x)) and the theorem need not hold. The condition is on f's growth, not on its size: f(n) = n at powers of 2 and n² elsewhere stays between n and n², yet T(n) = T(n/2) + f(n) is Θ(n) at powers of 2 while the integral is Θ(n²).
- **Leighton's examples**, with the second corrected: 4T(x/2) + Θ(x) gives p = 2, Θ(x²); T(x/2) + Θ(log x) gives p = 0, Θ(log² x); ½T(x/2) + Θ(1/x) gives p = −1, Θ((log x)/x); 2T(x/4) + 3T(x/6) + Θ(x log x) gives p = 1, Θ(x log² x); and 2T(x/2) + (8/9)T(3x/4) + Θ(x²/log x) gives p = 2, **Θ(x² log log x)**. The notes print Θ(x²/log log x), a misprint: the integral of (u²/log u)/u³ is Θ(log log x), and brute force has T(x)/x² rising 2.06 → 3.90 over x = 2<sup>10</sup> … 2<sup>40</sup>. Each is re-derived numerically in `examples.py` where a brute-force evaluation is possible.
- **The Master theorem is the one-term case.** a·(1/b)<sup>p</sup> = 1 gives p = log<sub>b</sub> a, the watershed, and the integral with f = n<sup>d</sup>·log<sup>k</sup> n reproduces the three cases and their gaps. Akra–Bazzi needs no regularity condition because its polynomial-growth hypothesis already forbids the f that regularity exists to exclude.
- **Finding p.** φ(p) = Σ aᵢ·bᵢ<sup>p</sup> is decreasing, so p is unique and a bisection finds it. For (1/5)<sup>p</sup> + (7/10)<sup>p</sup> = 1 there is "no analytical solution" (Erickson: "ρ ≈ 0.83978, but why bother?"). Often only the side of a threshold matters: Σ aᵢ·bᵢ = 9/10 &lt; 1 puts p below 1, and for f(u) = u the integral is Θ(n<sup>1−p</sup>), so T(n) = Θ(n). The parameters need not be integers, "or even rationals".
- **Selection, with its exact constants.** Erickson: T(n) ≤ T(n/5) + T(7n/10) + 8n/5 counting comparisons; the CS374 slides: |A<sub>greater</sub>| ≤ 7n/10 + 6. The recurrence is an inequality, so the theorem bounds it from above through the equal recurrence. Why 5: "5 is the smallest odd block size that gives us exponential decay"; groups of 3 give T(n/3) + T(2n/3) + O(n), which this analysis cannot show better than sorting. That is a statement about the analysis: Chen and Dumitrescu show the usual argument that the algorithm itself is Ω(n log n) "fall[s] short", and give variants with groups of 3 that run in linear time (Ch.16).
- **What it still cannot do.** √n·T(√n) + n (Erickson: "where we have to fall back on recursion trees"), and it looks like magic, so simpler techniques are usually enough.

### Substitution, done right

- **The method.** "Guess the answer, and then prove it correct by induction." Where the guess comes from is irrelevant; a failed proof refines the guess. Keep the same constant throughout, so "≤ c·n + n" proves nothing. Subtract a lower-order term for a right guess that fails: 2T(n/2) + 1 with c·n − d, and 4T(n/2) + n with c₁·n² − c₂·n.
- **Base cases are the induction's, not the recurrence's.** Pick n₀, check the small n, and choose the constants to cover them (Erickson on Fibonacci: the base cases "must determine the value of the coefficient"). For selection with floors, ⌊n/5⌋ is 0 for n &lt; 5 and T(0) = 1 &gt; k·0, so the small n are checked directly; `examples.py` asserts T(n) ≤ 10n for every 1 ≤ n ≤ 10<sup>7</sup>.
- **Tight or loose.** A proof that goes through for every constant, however small, signals a loose bound ("The proof worked for any constant a, no matter how small. This strongly suggests that our upper bound T(n) = O(n log n) is not tight"); one that needs a constraint on the constant signals a tight one. Lower bounds use the same induction with ≥.
- **Stanford CS161's selection proof** uses a fat base case (n ≤ 100 handled directly), k = 10c for the floor recurrence and a larger k = 50c for the exact ceiling recurrence T(⌈n/5⌉) + T(⌈7n/10 + 6⌉) + cn: 8k + cn − kn/10 = 400c − 4cn is at most 0 exactly when n ≥ 100, the deck's base-case cut-off.

### Change of variables: the van Emde Boas recurrence

- **The recurrence.** Topic 2's structure halves the key's bits each step; on the universe size u that is T(u) = T(√u) + O(1). Substitute u = 2<sup>w</sup> (Erickson's domain transformation, "t(k) = T(2<sup>k</sup>)"): S(w) = S(w/2) + O(1) = Θ(log w) by case 2 with watershed 1, so T(u) = Θ(log log u). For u = 2<sup>64</sup> the exponent goes 64 → 32 → 16 → 8 → 4 → 2 → 1: six halvings, the picture topic 2 drew (`examples.py` asserts both the halving count and that ⌈log₂ log₂ u⌉ = 6).
- **Two more uses of the trick** (Erickson): the ham-sandwich recurrence T(n) = T(n/2) + T(n/4) + 1 becomes t(k) = t(k − 1) + t(k − 2) + 1, giving Θ(n<sup>log₂ φ</sup>), about Θ(n<sup>0.694</sup>); and the range transformation U(n) = n·T(n) turns the random-BST recurrence into U(n/4) + U(3n/4) + n.

</section>

<section data-section="lab">

## Try it

Run `python3 examples.py` next to this topic's source. Then change it: change the fractions of the selection recurrence (1/5 and 7/10 → 1/7 and 5/7, then 1/3 and 2/3) and watch p and T(n)/n; change f to n·log₂ n in the merge-sort recurrence and watch the column's ratios drift; try the substitution with c·n² and with c₁·n² − c₂·n on 4T(n/2) + n. Every number in the reel is an assertion in that file.

</section>

<section data-section="production">

## In code review

- "It recurses twice, so it's n log n": the fractions decide (steps 7 and 8). Median of medians recurses twice and is linear.
- Case 3 applied without checking regularity.
- Case 1 or 2 applied across a log-factor gap (n/log n, n log n).
- An "O(n)" proof whose constant drifts (step 10).
- A Θ claimed for a recurrence whose number of subproblems is not constant.
- Dropping the "+ 6" and the ceilings in a write-up without saying why it is allowed (Leighton's hᵢ, or a domain transformation).
- Quoting the Master theorem for a full-history recurrence.

</section>

<section data-section="frontier">

## The frontier

- **Sharper than Θ.** Roura's Discrete and Continuous Master Theorems (J. ACM 2001) handle sublogarithmic factors in the toll function, floors and ceilings in the statement, and stochastic (quicksort-type) recurrences. Akra and Bazzi's original 1998 paper rests on "a special functional transform that they call the 'order transform'".
- **What none of these give** is the exact constant in front, which depends on the base cases and on how the sizes round, and which can oscillate: Drmota and Szpankowski (J. ACM 2013) show the exact solution of the discrete recurrence oscillates when the log bᵢ are rationally related. Our own example, computed in `examples.py`: the exact merge sort count M(n) = M(⌈n/2⌉) + M(⌊n/2⌋) + n with M(1) = 0 is n⌈log₂ n⌉ + n − 2<sup>⌈log₂ n⌉</sup> for every n ≤ 10<sup>6</sup>, so (M(n) − n log₂ n)/n is a periodic function of log₂ n, between 0 (at powers of two) and 1 − (1 + ln ln 2)/ln 2 ≈ 0.0861.

</section>

<section data-section="next">

## Where this goes next

A recurrence bounds what one algorithm costs. Next: how to prove that no algorithm can do better.

</section>
