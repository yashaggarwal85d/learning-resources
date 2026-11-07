# Sources — dsa.work-span-model-work

Fetched at research time (2026-11-05) into `sources/`. Checked with
`node scripts/sources.mjs check work-span-model-work`.

**Note on the Blumofe–Leiserson paper.** The chapter plan names the canonical journal
publication (Blumofe and Leiserson, "Scheduling Multithreaded Computations by Work Stealing,"
*Journal of the ACM* 46(5), 1999, pp. 720–748). The ACM page itself is paywalled (403 at
research time), and a third-party PDF mirror (scispace.com) returned only an unreliable
lecture-slide-style summary, not the paper's own text, so it is not used or quoted. Blumofe's
MIT technical report "Executing Multithreaded Programs Efficiently" (MIT-LCS-TR-677, 1995,
his PhD thesis, fetched from an open mirror) is the same joint research with Leiserson
(explicitly credited in the report's text) and states every theorem this topic needs in full,
rigorous form, so it is used as the primary quoted source in its place.

## 1. Blumofe, "Executing Multithreaded Programs Efficiently" (MIT-LCS-TR-677, 1995)

URL: https://ftp.mirrorservice.org/sites/www.bitsavers.org/pdf/mit/lcs/tr/MIT-LCS-TR-0677.pdf
Local copy: `sources/blumofe-leiserson-tr.txt`

> A computer with P processors can execute at most P instructions per step, and since the
> computation has T1 instructions, we have the lower bound TP  T1 =P. And, of course, we also
> have the lower bound TP  T∞ . Early independent work by Brent [16, Lemma 2] and Graham [48,
> 49] yields the upper bound TP  T1 =P + T∞ .

> Theorem 2.1 (The greedy-scheduling theorem) For any multithreaded computation with work T1
> and critical path length T∞ and for any number P of processors, any greedy P-processor
> execution schedule X achieves T (X )  T1 =P + T∞ .

> First, the time bound given by the theorem says that any greedy schedule yields an execution
> time that is within a factor of 2 of an optimal schedule, which follows because T1 =P + T∞ 
> 2 maxfT1 =P; T∞ g and TP  maxfT1 =P; T∞ g.

> Specifically, when the number P of processors is no more than T1 =T∞ , then T1 =P  T∞ ,
> which implies that for a greedy schedule X , we have T (X )  2T1 =P.

> In a fully strict computation, every dependency goes from a thread to its parent. The strict
> computation in Figure 3.1(b) is also fully strict. Fully strict computations are
> "well-structured" in that all dependencies from a subcomputation emanate from the
> subcomputation's root thread.

> each processor maintains a ready deque data structure of threads. The ready deque has two
> ends: a top and a bottom. Threads can be inserted on the bottom and removed from either end.
> A processor treats its ready deque like a call stack, pushing and popping from the bottom.
> Threads that are migrated to other processors are removed from the top.

> If the ready deque is empty, however, the processor begins work stealing: it steals the
> topmost thread from the ready deque of a randomly chosen processor and begins work on it.

> When a processor begins work stealing, it operates as follows. The processor becomes
> a thief and attempts to steal work from a victim processor chosen uniformly at random.

> thief queries the ready deque of the victim, and if it is nonempty, the thief removes and
> begins work on the top thread. If the victim’s ready deque is empty, however, the thief tries
> again, picking another victim at random.

> Theorem 4.2 For any fully strict multithreaded computation with stack depth S1, the WorkStealing Algorithm run on a computer with P processors uses at most S1 P space.

> Theorem 4.10 Consider the execution of any fully strict multithreaded computation with
> work T1 and critical path length T∞ by the Work-Stealing Algorithm on a parallel computer
> with P processors. The expected running time, including scheduling overhead, is O(T1 =P +
> T∞ ).

> Theorem 4.11 Consider the execution of any fully strict multithreaded computation with
> critical path length T∞ by the Work-Stealing Algorithm on a parallel computer with P processors. Then, the total number of bytes communicated has expectation O(PT∞ (1 + nd )Smax )

Note: this report uses P where the topic (following the syllabus) writes p; quoted exactly as
printed. The report's own text identifies the work as joint with Leiserson ("The research
reported in this chapter is joint work with Charles Leiserson of MIT's Laboratory for Computer
Science and was first published in [14]"), confirming it is the same result the chapter plan
attributes to "Blumofe and Leiserson."

## 2. Wikipedia, "Analysis of parallel algorithms"

URL: https://en.wikipedia.org/wiki/Analysis_of_parallel_algorithms
Local copy: `sources/analysis-parallel-algorithms.txt`

> A result called Brent's law states that one can perform such a "simulation" in time

> Work law. The cost is always at least the work:

> This follows from the fact that p processors can perform at most p operations in parallel.

> Span law. A finite number p of processors cannot outperform an infinite number, so that

> 1 2 Brent, Richard P. (1974-04-01). "The Parallel Evaluation of General Arithmetic
> Expressions". Journal of the ACM. 21 (2): 201–206. doi:10.1145/321812.321815. ISSN
> 0004-5411. S2CID 16416106.

Note: used only for Brent's citation and the sharper T∞ + (T1 − T∞)/p form of the bound, per
the chapter plan ("Brent... citation checked on Wikipedia's analysis-of-parallel-algorithms
page, paper not read"); Brent's own 1974 paper is not read.

## 3. OpenCilk project homepage

URL: https://www.opencilk.org/
Local copy: `sources/opencilk.txt`

> Provably efficient scheduling tunes each execution of your OpenCilk program to its host
> environment.

## 4. Rayon documentation, `rayon::join` (docs.rs, version 1.12.0)

URL: https://docs.rs/rayon/1.12.0/rayon/fn.join.html
Local copy: `sources/rayon-join.txt`

> The underlying technique is called "work stealing": the Rayon runtime uses a fixed pool of
> worker threads and attempts to only execute code in parallel when there are idle CPUs to
> handle it.

> It will begin by executing closure A (on the current thread). While it is doing that, it
> will advertise closure B as being available for other threads to execute. Once closure A
> has completed, the current thread will try to execute closure B; if however closure B has
> been stolen, then it will look for other work while waiting for the thief to fully execute
> closure B.

> The assumption is that the closures given to join() are CPU-bound tasks that do not perform
> I/O or other blocking operations. If you do perform I/O, and that I/O should block (e.g.,
> waiting for a network request), the overall performance may be poor. Moreover, if you cause
> one closure to be blocked waiting on another (for example, using a channel), that could lead
> to a deadlock.

**Named, not read** (the chapter plan's own framing citations, not opened for this topic):

- Cormen, Leiserson, Rivest and Stein, *Introduction to Algorithms*, 4th ed. (the work–span
  chapter; cited for framing only, per the chapter plan).
- Brent, Richard P., "The Parallel Evaluation of General Arithmetic Expressions," *Journal of
  the ACM* 21(2), 1974, pp. 201–206 — DOI `10.1145/321812.321815` (citation checked via the
  Wikipedia source above; the paper itself not opened).
- Graham, R. L., "Bounds for certain multiprocessing anomalies," *The Bell System Technical
  Journal* 45, 1966, pp. 1563–1581, and "Bounds on multiprocessing timing anomalies," *SIAM
  Journal on Applied Mathematics* 17(2), 1969, pp. 416–429 — both named in the Blumofe TR's own
  attribution of the greedy-scheduling bound; not opened independently.

**Within this repo, read directly (not "fetched," already on disk):**

- The chapter plan (`CHAPTER.md`, this folder's parent) supplies topic 105's bridge text
  directly, since Chapter 31 (the topic this bridges from) is not yet published to the
  registry — see `OUTLINE.md` → "Changes from the chapter plan."
