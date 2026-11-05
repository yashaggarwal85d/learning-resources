# Outline: Complexity budgeting from constraints (`dsa.complexity-budgeting-from-constraints`)

Full topic, chapter 36 §36.1, ~15 minutes, following `CHAPTER.md`'s plan for topic 113.

## Storyboard (9 steps)

1. **Hook.** A statement: n ≤ 100,000, time limit one second, find the pair with the largest difference of a certain kind. The obvious double loop is ten billion steps, about a hundred seconds — the limit has already answered before the problem is even understood.
2. **The rule of thumb.** A modern computer does on the order of a hundred million simple operations a second (Laaksonen). A time limit becomes an operation budget by multiplying by that rate.
3. **The table, derived not recited.** n² at n = 100,000 is ten billion operations — about a hundred seconds, too slow. n log₂ n at the same n is about 1,660,964 operations — about seventeen thousandths of a second. The full table (n ≤ 10 → n!, n ≤ 20 → 2ⁿ, n ≤ 500 → n³, n ≤ 5000 → n², n ≤ a million → n log n or n, large n → constant or log n) falls out of the same division repeated. (Predict step — within the first 4.)
4. **Predict: the meet-in-the-middle exception.** At n = 20, trying all 2²⁰ subsets of each half and combining is cheap even though 2⁴⁰ outright is not. Does shrinking n to 20 just forbid algorithms, or does it also permit ones that were hopeless at a hundred thousand?
5. **The cache-friendly correction.** At n ≤ 10⁸ the work must be a single sequential pass, because a random access per element is a cache miss and the rule of thumb's "operation" assumed a cache hit — measured directly: the same count of reads done sequentially and in random order, and the random pass is reliably slower.
6. **Signal words, each a hint with a failure rate.** "sorted" points at binary search or two pointers; "k-th" points at a heap or quickselect; "all pairs" asks whether n² is affordable at all; "minimum maximum" points at binary search on the answer, a monotone predicate. Each demonstrated against a brute force on small inputs.
7. **Predict: what the budget cannot say.** An over-budget exact algorithm for a hard problem is not just "too slow" — it is often a sign the problem is NP-hard on purpose, and the exit is approximation or a heuristic, not a faster exact algorithm.
8. **Takeaway: necessary, not sufficient.** The budget rules algorithms out; it never proves one in. Fitting the budget says nothing about correctness.
9. **Recap and the three-question routine.** What is n and what are the values? What does the limit allow? What do the signal words point at? Handoff to topic 114.

## Outcomes

- From a statement's n, value range and time limit, compute the budget and say which growth rates fit, without a memorized table.
- Say why n ≤ 10⁸ forces a sequential pass, and measure that claim.
- For each of four signal words, name the technique it points at and one way the signal misleads.

## Concept ledger

- **Introduces:** `constraint-budget`, `operation-count-budget`, `value-range-as-parameter`, `signal-word-recognition`, `meet-in-the-middle-threshold`.
- **Uses:** `big-o-theta-omega`, `best-worst-average-case`, `word-ram`, `cache-miss`, `latency-percentiles` (Chapter 1); `pseudo-polynomial` (Chapter 1, extended by Chapter 33 topic 108); `np-hard-np-complete` (Chapter 33); `approximation-ratio`, `heuristic-without-guarantee` (Chapter 34); `binary-heap` (Chapter 6 topic 30); `sweep-line` (Chapter 28 topic 94).
- **Declared:** `logarithms` (no earlier live DSA topic introduces it at the time this was built; declared here for itself, one line, matching Chapter 29 topic 95's own declaration elsewhere).

## Bridge / handoff

Bridge (word for word, Chapter 34 topic 112's handoff): "A competitive ratio is a promise about every possible input, and the best deterministic cache can promise only k, which says that a cleverer policy is not where the next gain is. Every guarantee in this chapter has had that character: true of the worst input, and the worst input is rarely the one in front of you. What you are actually handed is one problem with a size, a time limit and a shape, and the first skill, before any of these algorithms, is reading those off the statement to see which algorithms are even allowed. Complexity budgeting from constraints, next."

Handoff: "The budget tells you how much work you may do, and it narrows the field: n squared is out, n log n is in. It says nothing about how to organise the data so that the work is that cheap. That depends on what you will do with the data, and how often: look one thing up, ask for a range, take the smallest, test membership, group. Each of those has a structure that is best at it, and the same data can need a different structure under a different mix of operations. Choosing the structure for the operation mix, next."

## Changes from the chapter plan

- The plan's running example mentions "value ranges as a second parameter" and ties it to Chapter 33 topic 108's pseudo-polynomial warning; this topic names that connection in one sentence (the "what the budget cannot say" step) rather than building a second worked example with a value-bounded table, since the chapter's own worked arithmetic table (the budget) already carries the step's screen time and a second table would repeat the same lesson in a different costume.
- The "all pairs" signal is demonstrated with counting pairs at a fixed difference (sorted array + two-pointer scan) rather than a different all-pairs example, because it reuses the `sweep-line`/two-pointer vocabulary already used for "sorted" and keeps the step's arithmetic small enough to brute-force-check on screen.
- Laaksonen's own book was fetched directly (`cses.fi/book/book.pdf`, via `pdftotext`) and every quoted sentence and the table verified against the fetched text — not read only "at planning time" as the chapter plan's own notes assumed when written (the chapter plan was written before this topic's actual build).
- Skiena's *Algorithm Design Manual* and CLRS are named in `references.md` for framing only, per the chapter plan; neither was opened.
- A public contest judge's rule for what a time limit means was not separately sourced; the topic relies on Laaksonen's own stated rule of thumb instead, which is itself sourced from a contest-programming context.
