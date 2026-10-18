---
id: dsa.aggregate-accounting-methods
title: Aggregate and accounting methods
---

<section data-section="outcomes">

## After this topic you can

- Bound a sequence's total cost with the aggregate method: any n appends to the doubling vector from empty write fewer than 3n elements, n increments of a binary counter flip fewer than 2n bits (bit i flips ⌊n/2<sup>i</sup>⌋ times), and any n operations on a stack with multipop cost at most twice the pushes.
- Design accounting charges and prove the credit never goes negative: 3 per append, 2 per increment, 2 per push and 0 per pop and multipop; state the condition as Σĉᵢ ≥ Σcᵢ after **every** prefix, and find where a charge that is too low first fails.
- Compute the amortized copy cost of a growth factor g: fewer than g/(g − 1) copies per append (2 for g = 2, 3 for g = 1.5), approached just after a resize and never reached, and about 1/(g − 1) just before one; an accounting charge of 1 + g/(g − 1); and say why a fixed additive step is quadratic.
- Say what an amortized bound promises: a worst-case bound on the total of every sequence of n operations from the start state, divided by n. No probability, unlike the average-case and expected bounds of “Asymptotic notation and case analysis”; one operation can still be expensive; and it needs a single history from the start state.

</section>

<section data-section="internals">

## Into the internals

One cost unit throughout: **one element write** (an append without a resize costs 1; an append that resizes a vector holding n keys costs n + 1, n copies and the new write). The growth rule is the chapter's: an empty vector has capacity 0, the first append allocates 1, and an append to a full vector allocates ⌈g · cap⌉ (at least cap + 1), copies the keys, then writes. Allocation is not counted; “Deamortization and global rebuilding” and “Measuring the memory hierarchy” say what that hides. Every number below is an assertion in `examples.py`.

### The definition, exactly

- **Amortized cost.** For a sequence of n operations, the amortized cost per operation is the total cost of the sequence divided by n. Erickson states it as T(n)/n with T(n) the *worst-case* running time of a sequence of n operations (his "summation method"); Blum's CMU notes give the same as Definition 7.1. So the bound is a worst case over all sequences of length n starting from the start state, divided by n. With 100 operations of cost 1 and one of cost 100, the total is 200 over 101 operations: amortized cost 200/101 < 2, although one operation costs 100.
- **The accounting condition.** Give operation i an actual cost cᵢ and a charge ĉᵢ. If Σᵢ≤ₖ ĉᵢ ≥ Σᵢ≤ₖ cᵢ for **every** prefix k, then the charges are an upper bound on the running total at every point, and the amortized cost is at most max ĉᵢ. "At the end" is not enough: with a charge of 2 per append the bank is back to +1 after 16 appends and at every power of two, yet it is −2 after the 5th append and −524,286 at the 524,289th (Prove it 1). Blum: "it is very important in this analysis to prove that the bank account doesn't go negative."
- **Starting state and seeds.** An amortized bound is stated from a start state, here the empty vector and the counter at zero. Starting from some other state may need a *seed*: a bank that starts positive. Ten appends that each start from the same full 16-key vector cost 17 each, 170 in all, against 3 × 10 = 30; the first append alone costs 17, more than its charge of 3.
- **Not an average.** Erickson: "There is no probability involved; we are averaging over a sequence of operations, not the possible running times of a single operation." Blum: "we are not making any assumptions about the inputs being chosen at random, we are just averaging over time." The notation refresher's average case averages over an assumed input distribution and its expected time over the algorithm's own coins; an amortized bound does neither. The two can be combined, and then the bound says so: Sedgewick and Wayne's exercises ask for "constant expected amortized time" (randomized structures such as hash tables). So "amortized" alone means no probability and "expected amortized" means both.
- **What it does not say.** It bounds no single operation: the 524,289th append writes 524,289 elements, and "O(1)" for that call is the smell the notation refresher's "In code review" list names. It is also silent about the *order*: the same operations replayed from a different state (below) can cost far more.

### The doubling vector, both ways

- **Aggregate.** After n appends with doubling, the copies are 1 + 2 + 4 + … over the resizes so far. For n not a power of two the copies are 2<sup>k+1</sup> − 1 with 2<sup>k</sup> the largest power of two below n, so copies ≤ 2n − 3 < 2n; at a power of two they are exactly n − 1, and the total is 2n − 1 (31 at n = 16). Adding the n writes: the total is below 3n for every n (asserted for every n up to 2²⁰). The constant 3 is tight for this rule: just after a resize, at n = 2ᵏ + 1, the total is 3n − 3 (48 at n = 17, 3,145,728 at n = 2²⁰ + 1), so no smaller constant bounds every n. CMU's notes reach the same bound: the sum is at most 2n − 1, "we get a total cost &lt; 3n".
- **Accounting.** Charge 3 per append: 1 pays the write, 2 are banked. The scheme the reel draws: append i in the new half of the row leaves one coin on itself and one coin on the key i − cap/2 in the old half. After the row fills (cap/2 appends later) every key holds exactly one coin, and the next resize's copy of cap keys is paid cell by cell. The very first append has no old half, so its second banked unit is a **spare** coin that nothing spends. Simulated cell by cell to 2¹⁷ appends, the bank is 2n − cap + 1 after every append once cap ≥ 2: 2n − cap coins on cells plus the spare. It is exactly 3 just after every resize (appends 2, 3, 5, 9, …, 524,289), at least 2 after every append, and 524,289 just before the 524,289th append (2 coins from each of the 262,144 appends since the previous resize, plus the spare), which is what pays that append's 524,288 copies. Blum counts the same way: "after the last resizing, there were only L/2 elements in the array and so there must have been at least L/2 new pushes since then contributing $2 each." Under the chapter's rule the L/2 pushes include the resizing push itself (appends 5 to 8 for L = 8). His remark that "the potential is twice the number of elements in the array after the midpoint" is this bank without the spare; the next topic, “The potential method”, turns it into a potential function.
- **Amortized costs are not unique.** If the vector only grows and shrinks by pops that never shrink the array (a stack that keeps its capacity), the charges (3 per push, 1 per pop), (4, 0) and (5, −1) are all valid on every prefix of 3,000 seeded random sequences. The pair (3, −1) is **not**: push, push, pop, pop costs 1 + 2 + 1 + 1 = 5 against 3 + 3 − 1 − 1 = 4. (CMU's notes print "$3 per push and $−1 per successful pop"; that does not hold in their own cost model, so it is not used here.)
- **A textbook version.** Sedgewick and Wayne's resizing-array stack starts with an array of size 1 and doubles it when full ("We double the size of the array in push() if it is full"); that is this rule. Its halving at a quarter is the next topic's.

### Any growth factor g

- **The bound.** Right after a resize that copied c keys, the earlier resizes copied about c/g, c/g², …, so all copies so far are about c(1 + 1/g + 1/g² + …) = c · g/(g − 1), and n is about c. So the copies per append are at most about g/(g − 1): 2 for g = 2 and 3 for g = 1.5. Because capacities grow by a factor of at least g (rounding up only helps), the bound is strict: copies per append stay below g/(g − 1) at every n up to 10⁶ (largest 1.99999 and 2.99997). Just before the next resize the ratio has fallen to about 1/(g − 1): 1 for g = 2 and 2 for g = 1.5 (for n ≥ 1,024 it stays above 0.99 and 1.99).
- **Peaks and troughs.** For n ≥ 1,024 the peak (at a resizing append) is above 1.99 for g = 2 and above 2.98 for g = 1.5; the g = 1.5 peak is 2.9878 at append 1,066 and above 2.99 from append 1,599 on, because rounding up leaves a small gap at small capacities. The reel's sawtooth is this ratio plotted for every n.
- **At a million.** g = 2: 1,048,575 copies over 20 resizes, the last of 524,288 at append 524,289, final capacity 1,048,576; copies per append 1.05, not 2. g = 1.5: capacities 1, 2, 3, 5, 8, 12, 18, 27, 41, 62, …; 2,099,719 copies over 33 resizes, the last of 699,912 at append 699,913, final capacity 1,049,868; copies per append 2.10. The first n above 2¹⁹ at which doubling's copies per append fall below 1.5 is 699,051.
- **Charges.** The accounting charge is 1 + g/(g − 1): 3 for g = 2 and 4 for g = 1.5. Why it pays, epoch by epoch: a resize that copies c keys leaves capacity cap′ = ⌈g · c⌉ ≥ g · c, and the next resize copies cap′ keys. The appends from this resize (included) up to that one number cap′ − c ≥ cap′(g − 1)/g, and each banks g/(g − 1) beyond its own write, so together they bank at least cap′: the next copy is paid in full, and rounding up only adds slack. For g = 2 this is the reel's coins (c appends, 2 each, for 2c copies). A charge of 4 keeps the bank at 3 or more for g = 1.5 over a million appends, while a charge of 3 first goes negative at append 9 (−1) and drifts to −699,893 by append 699,913. The same formula, rounded up to whole units, holds for g = 5/4 (charge 6) and g = 3 (charge 2.5, three whole units).
- **Empty space.** Right after a resize the empty fraction of the capacity is 1 − 1/g: a half for g = 2, a third for g = 1.5 (within one slot for capacities of 8 or more). Which g a real library chooses, and the memory-reuse argument for 1.5, are Ch.2's "Dynamic arrays and growth policy".
- **Additive growth.** Growing by a fixed k slots instead: grow by one and append i copies i − 1 keys, so n appends cost n(n + 1)/2 = 500,000,500,000 at a million, (n + 1)/2 per append (Blum). Growing by 1,000 (the first allocation 1,000) costs 500,500,000, within 1% of n²/(2k) + n and still quadratic. Only a constant *factor* makes the copies a geometric series; a policy that mixes small steps with doublings can also be O(n), so what is proved is that a factor suffices and any fixed step does not.

### The binary counter

- **Aggregate.** Increment turns the k trailing 1s into 0s and the next 0 into a 1, so it costs Θ(k) bit flips and Θ(log n) in the worst case. Bit i flips on every 2<sup>i</sup>-th increment, so n increments flip bit i exactly ⌊n/2<sup>i</sup>⌋ times and the total is exactly 2n − (the number of 1 bits in n): 31 at n = 16, 1,999,993 at n = 1,000,000 (seven 1 bits). Multiplying the worst case by n gives only O(n log n); the total is Θ(n), O(1) amortized.
- **Accounting.** Charge 2 per increment (Erickson's "two-dollar increment tax"): every increment sets exactly one 0 to 1 (on the unbounded counter the reel uses), one unit pays for it and the other stays on the bit to pay for its later reset. The bank is the number of 1 bits, never negative, and 16 × 2 − 31 = 1 coin remains at 10000. Erickson's second tax schedule puts the charge on the bits instead of the steps: on every increment bit i collects 2<sup>−i</sup>, whether it flips or not; it flips once every 2<sup>i</sup> increments, so it holds exactly 1 each time it flips, and each increment pays 1 + ½ + ¼ + … < 2 (checked with exact fractions over 4,096 increments of a 12-bit counter). A fixed-width counter that wraps resets every bit and sets none, so its 2 stay in the bank and the bank is then the number of 1 bits plus 2 per wrap (checked for a 3-bit counter over 100 increments).
- **Both 31s.** 16 increments flip 31 bits and 16 appends cost 31; at every power of two 2ᵏ both totals are 2<sup>k+1</sup> − 1, a coincidence of two geometric series, asserted for k up to 20.
- **A heavier bit.** If flipping bit k costs 2ᵏ (CMU 7.6), the total for n increments is at most n(log₂ n + 1), exactly 80 = 16 · 5 at n = 16, and one increment can cost 2n − 1 (31 at the 16th). The amortized cost is then O(log n): the bound depends on the cost model, not only the operations.
- **Increment and decrement together.** The plain counter fails: alternate between 2ᵏ and 2ᵏ − 1 and every operation flips k bits (a 5-bit counter at 01111 flips 5 on each of 8 alternating operations, 40 in all; step "When the bound breaks"). Erickson's fix is a double counter (P, N), for which he finds summing directly awkward ("we don't know what the sequence of operations looks like") and uses taxation (at most 4 per operation) and the potential method (at most 2); the Gray code is not a fix in his notes: each step changes one bit, but finding that bit naively takes Θ(log n), and the constant-time algorithm (Ehrlich, 1973) handles increments only.

### The multipop stack

- **Operations and costs.** Push costs 1; pop costs 1; multipop(k) pops min(k, size) keys, so a k larger than the stack just empties it, and on an empty stack it costs 0 under the unit "one key in or out". One multipop can cost n − 1, and n operations of worst-case cost n each would suggest O(n²).
- **Aggregate.** Each key is popped at most once after it is pushed, so pops ≤ pushes and any n operations cost at most 2 × pushes ≤ 2n; for n ≥ 2 at most 2n − 2, reached by n − 1 pushes and one multipop (checked for 1,000 seeded random sequences, and for n = 50). If every call also cost 1 on top of the keys it moves, the total is calls + keys pushed + keys popped ≤ n + 2 × pushes ≤ 3n: the per-operation O(1) survives (charge 3 per push and 1 per pop or multipop, and the bank is again the keys on the stack), though "at most twice the pushes" does not (checked on the same sequences).
- **Accounting.** Charge 2 per push and 0 per pop and multipop: one pays the push, one stays on the key as the coin for its own removal. The bank equals the number of keys on the stack on every prefix, so it is never negative (asserted on the same sequences).
- **Related exercises.** Erickson's exercise 6 is the same phenomenon for a queue with the obvious algorithms: MultiPull alone is O(1) amortized (6a), and MultiPush with MultiPull forces Ω(n) amortized (6b). His 6c asks for a structure making both O(1) amortized, which is possible only because his MultiPush inserts k *copies* of one item (store the item once with a count). Here multipush writes k *given* keys, each must be written, and no representation saves it (Prove it 3).

### Choosing a method

- **Aggregate** when one total covers every sequence and all operations can get the same amortized cost: the vector's appends, the counter's increments. It is awkward when operations differ (push against multipop) or when the sequence's makeup is unknown.
- **Accounting (taxation)** when operations differ or when costs belong to specific components: Erickson, "Taxation and charging are useful when there is a convenient way to distribute costs to specific steps in the algorithm or components of the data structure." The coins sit on cells, bits and keys. Tight bounds come from schedules that "just barely stay in the black." The related **charging** argument charges each reset to the earlier operation that set the bit.
- **The next topic's potential method** keeps the bank as one number for the whole structure instead of coins on elements; Erickson notes "Many (perhaps even all) of these methods are logically equivalent, but different formulations are more natural for different problems."
- **Names.** Okasaki (thesis, 1996) credits Tarjan (1985) with the "banker's method" and the "physicist's method", the first with credits "associated with individual locations in the data structure" (this topic's coins) and the second a potential, and calls the two equivalent. Tarjan's paper was not opened for this topic, so the names are credited through Okasaki.
- **Why it is sound.** Charging cheap operations for expensive ones overestimates the total (Erickson: "we are overestimating the total cost of any sequence of operations, since we pay for some charges from future operations that may never actually occur"), so the bound holds for every sequence, including ones that end before the expensive operation arrives.

</section>

<section data-section="lab">

## Build, break, measure

Run `python3 examples.py` next to this topic's source. Then break it, one change at a time, and predict before you run:

1. Charge 2 per append: the bank first goes negative at append 5.
2. Keep the charge at 3 and set g = 1.5: negative at append 9, then drifting down.
3. Grow by a fixed 1,000 slots and count a million appends against doubling: 500,500,000 against 2,048,575.
4. Add decrement to the counter and alternate it with increment from 01111.
5. Add multipush to the stack and alternate it with multipop.

**Predictions for the chapter lab.** The chapter lab, part 2, in “Measuring the memory hierarchy”, measures time per append and total element copies for g = 2 and g = 1.5; the counts to reconcile against are copies per append at n = 1,000, 10,000, 100,000 and 1,000,000:

| n | g = 2: copies | per append | g = 1.5: copies | per append |
|---|---|---|---|---|
| 1,000 | 1,023 | 1.02 | 2,120 | 2.12 |
| 10,000 | 16,383 | 1.64 | 24,261 | 2.43 |
| 100,000 | 131,071 | 1.31 | 276,492 | 2.76 |
| 1,000,000 | 1,048,575 | 1.05 | 2,099,719 | 2.10 |

The sawtooth's peak is just under 2 (g = 2) and 3 (g = 1.5) at each resize and its trough about 1 and 2 just before the next. The lab itself lives in "Measuring the memory hierarchy", the chapter's last topic, which is where the measurement goes; it is not repeated here.

</section>

<section data-section="production">

## In production

Misreadings to catch in review, each with its numbers from this topic:

- "Amortized O(1)" read as "every call is O(1)": the 524,289th append writes 524,289 elements, and a request waiting on it waits (latency is the subject of “Deamortization and global rebuilding”).
- "About 2 copies per append" expected from a measurement at a single n: it is 1.05 at a million appends and 1.64 at ten thousand; the ratio is a sawtooth.
- The bound assumed from a state other than empty: a vector built by someone else, or restored from a snapshot, has no saved credit; ten appends to one full 16-key vector cost 170.
- An operation added later that undoes the setup: decrement on the counter, multipush on the stack.

Reserving capacity up front and real libraries' growth factors are Ch.2's. This topic makes no claim about how any production vector grows.

</section>

<section data-section="frontier">

## The frontier

Amortized bounds proved with saved credit are a statement about a single history. Okasaki: "Traditional methods of amortization break down when old versions of a data structure, not just the most recent, are available for further processing", because "savings can only be spent once". His thesis shows that lazy evaluation restores amortized bounds under persistence (Ch.13, "Amortization under persistence"), so "reusing an old version breaks the bound" is said here of credit proofs like this topic's, not of every amortized structure.

When a service is judged on its slowest operations rather than the total, an amortized bound is not enough, and the answer is a worst-case bound: deamortization, two topics on (“Deamortization and global rebuilding”). The classic small example is Ehrlich's 1973 loopless Gray-code algorithm, which, as Erickson presents it, "maintains a Gray code counter in constant worst-case time per increment" (increments only).

</section>

<section data-section="questions">

## More questions

1. **Prove it 1, 2 and 3** are the three questions at the end of the reel, with the worked answers above.
2. **A sum with spikes.** Let operation k cost n if k is a power of two and 1 otherwise (Erickson's exercise 1c). The total for n = 1,024 is 12,277: 11 powers of two at 1,024 each plus 1,013 ones. The amortized cost is 12,277 / 1,024 ≈ 11.99 per operation, about log₂ n + 1. Why does the aggregate method give O(log n) and not O(1)? Answer: there are ⌊log₂ n⌋ + 1 powers of two up to n and each costs n, so the total is n(⌊log₂ n⌋ + 1) + n − ⌊log₂ n⌋ − 1 = Θ(n log n). The spikes are not set up by the cheap operations (each spike costs n however few operations came before it), so there is nothing for the cheap ones to prepay, and dividing by n leaves Θ(log n).
3. **A queue from two stacks** (Sedgewick and Wayne, and Erickson's exercise 11a). Enqueue pushes onto the in-stack; dequeue pops the out-stack, first moving everything from the in-stack when the out-stack is empty. Each element is pushed and popped at most twice, 4 stack operations, so any n queue operations cost at most 4n: O(1) amortized by accounting. Charge 4 per enqueue and 0 per dequeue.
4. **When does doubling look like 1.5?** At which n between 2¹⁹ and 2²⁰ do doubling's copies per append first fall below 1.5? Answer: n = 699,051, because the copies stay at 1,048,575 from append 524,289 to 1,048,576.

</section>

<section data-section="next">

## Where this goes next

Credits on elements work while you can see where to store them. When the table can shrink too, keep the savings as one number for the whole structure: the potential.

</section>
