# FACT-CHECK: Progress guarantees and linearizability (`dsa.progress-guarantees-linearizability`)

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Two threads incrementing a shared counter with no synchronization lose an update; of 20 interleavings of two 3-step (read, add, write) threads, 18 end at one and 2 end at two | `CHAPTER.md`'s own arithmetic (enumeration) | Verified — `examples.py` enumerates and classifies exactly |
| 2 | A schedule is correct exactly when neither thread's read falls strictly between the other's own read and write | `CHAPTER.md`'s own arithmetic | Verified — `examples.py` checks this rule against all 20 outcomes and it coincides exactly with "ends at two" |
| 3 | Lock-free: "ensures only that some thread always makes progress" | Herlihy, Luchangco and Moir 2003 | Verified — quoted exactly; reproduced in `examples.py`'s adversarial CAS schedule |
| 4 | Obstruction-free: "guarantees progress for any thread that eventually executes in isolation," weaker than lock-freedom and wait-freedom | Herlihy, Luchangco and Moir 2003 | Verified — quoted exactly; named, not built on this chapter's counter (per `CHAPTER.md`'s own scope) |
| 5 | Obstruction-free's own livelock risk: "there is no progress requirement when any interference is detected" | Herlihy, Luchangco and Moir 2003 | Verified — quoted exactly |
| 6 | Wait-free: "any process can complete any operation in a finite number [of] steps, regardless of the execution speeds of the other processes" | Herlihy 1991 | Verified — quoted (across the two clean spans either side of a font-encoding glitch in the source PDF; see "Red team" below) |
| 7 | Bounded wait-free: a bound N on the number of another process's own steps any invocation can remain pending across | Herlihy 1991 | Verified — quoted exactly |
| 8 | Linearizability is a local property: "a system is linearizable if each individual object is linearizable" | Herlihy and Wing 1990 | Verified — quoted exactly |
| 9 | Linearizability is nonblocking: "processes invoking totally-defined operations are never forced to wait" | Herlihy and Wing 1990 | Verified — quoted exactly |
| 10 | The L1/L2 linearizability conditions (extend H to H′, complete(H′) equivalent to a legal sequential history, respecting real-time precedence) | Herlihy and Wing 1990 | Verified — quoted exactly, including the paper's own (PDF-garbled) rendering of the "⊆" symbol in L2 |
| 11 | Linearizability as "a special case of strict serializability where transactions are restricted to consist of a single operation applied to a single object" | Herlihy and Wing 1990 | Verified — quoted exactly |
| 12 | "Neither serializability nor strict serializability is a local property" | Herlihy and Wing 1990 | Verified — quoted exactly |
| 13 | Checking linearizability in general is NP-complete | Gibbons and Korach 1997 (citation) | Citation only — title, venue and the result's name checked; the paper's own exact statement not read, per `CHAPTER.md` |

## Currency check

All three primary papers are fixed, published results (TOPLAS 1990, TOPLAS 1991, ICDCS 2003) that
do not change. Read 2026-11-01.

## Red team

1. **Herlihy's 1991 "Wait-Free Synchronization" PDF has a broken font encoding that scrambles
   word order across a line when extracted with this project's usual tool, confirmed reproducible
   with a direct `pdftotext` extraction too** — ruling out a fetch-tool-specific bug and
   confirming it is the PDF's own character mapping, not a transient fetch failure.
   `pdftotext -layout` recovers correct reading order, but a few individual words still carry
   stray characters from the same broken encoding (e.g. "of' steps" for "of steps"). This topic's
   own quotes were chosen to fall either side of that one glitch, verified clean by
   `sources.mjs check` after seeding the re-extracted text into its own cache path. Documented in
   `SOURCES.md` and in project memory for any later topic that hits the same paper or a
   similarly old scanned PDF.
2. **This topic builds nothing of obstruction-freedom** beyond quoting its definition and its
   own livelock remark — `CHAPTER.md`'s own scope keeps the chapter's lock, CAS and atomic-add
   examples to the counter, which only demonstrates blocking, lock-free and wait-free directly.
   The reel and post-notes both say this explicitly rather than implying an obstruction-free
   version of the counter was built and measured.
3. **"An atomic add is wait-free" is stated only for the operation as Herlihy's paper defines
   it, never as a claim about any specific CPU's actual hardware instruction.** `CHAPTER.md`
   flags this explicitly as unverified for any particular machine, and this topic's own
   `examples.py` models the operation as indivisible by construction (a single Python statement
   standing in for a hardware guarantee), not as a benchmark of real hardware.
4. **The claim "lock-free is always faster than a lock" is not made anywhere in this topic.**
   The measured example (the lock-based schedule) is a scheduling trace, not a performance
   benchmark, and the post-notes state explicitly that whether lock-free beats a lock in
   practice depends on contention, which this topic does not measure.
5. **The linearizability checker in `examples.py` is a brute-force search over all orderings
   consistent with real-time precedence** (practical only for a handful of operations, which is
   exactly the scale this topic uses it at) — the NP-completeness of the general problem (claim
   13) is named, not demonstrated by this checker's own running time.

## Corrections applied

None needed beyond the PDF re-extraction above — every other quote matched cleanly on the first
`sources.mjs check` run (14/14), and `examples.py`'s own first draft reproduced `CHAPTER.md`'s
planning values for the lost-update count and both linearizability verdicts exactly.
