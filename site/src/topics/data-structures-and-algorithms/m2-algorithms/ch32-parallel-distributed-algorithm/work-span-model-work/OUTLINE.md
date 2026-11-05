# Storyboard — dsa.work-span-model-work

**Learning outcomes** (from CHAPTER.md):
1. Compute the work, the span and the parallelism of a small computation DAG and of a
   divide-and-conquer recurrence, and say which of two algorithms scales on many cores.
2. State and apply Brent's bound: given work, span and a worker count, give the guaranteed
   running time, and say when speed-up is linear.
3. Describe work stealing in four sentences (deque, run the child, steal the oldest from a
   random victim, why steals are rare), state its expected-time bound and the class of
   computation it applies to, and name Cilk, Rayon and Tokio's relation to it.

**Running data** (all computed/asserted in `examples.py`):
- The sum DAG: 16 numbers summed by a balanced binary tree of additions has work 15, span 4,
  parallelism 3.75; the same 15 additions as a left-to-right chain has span 15, parallelism 1.
- Brent's bound (both the sharper T∞ + (T1 − T∞)/p form and the looser T1/p + T∞ form) against
  a real greedy schedule's step count on that DAG, for worker counts 1, 2, 4, 8, 16: the real
  step count always falls between the span-and-work lower bound and the sharper Brent bound, and
  at 16 workers the schedule bottoms out exactly at the span (4 steps): more workers cannot beat
  the longest chain of dependencies.
- A parallel merge sort with a sequential merge: span grows linearly in the input size (doubling
  the input almost exactly doubles the span, read off the recurrence T∞(n) = T∞(n/2) + n), while
  work grows faster than linearly (its own doubling ratio stays above 2 and climbs); parallelism
  (work over span) itself keeps growing as the input grows, reaching about 8 at 65,536 items.
- A discrete-event simulation of randomized work stealing on a bigger tree (16,384 leaves):
  at 1 worker there are zero steals (nobody to steal from); the fraction of work completed by a
  steal rises as workers are added (about 7% at 2 workers to about 15% at 16), but even at 16
  workers steals account for well under a quarter of the total work — most work is still done
  locally, not relayed by a steal.

**Engagement arc:** 16 steps, full topic, ~16 min. Two predicts (steps 2 and 10; the first
within the first four). Three takeaways (steps 6, 9, 15; none immediately after a predict's own
reveal).

## Per-step storyboard

1. **Opening/hook.** The same program, run on one core and on sixteen cores, finishes about
   fourteen times faster. The same-sized sum written as a left-to-right loop gets no faster at
   all, on any number of cores. Nothing about the machine differs between the two runs — only
   the shape of what depends on what.
2. **Predict.** The sum of sixteen numbers, added as a balanced tree, runs on unlimited workers.
   How many steps does it take, and what is the most any machine could ever speed it up by?
   Options: fifteen steps, unlimited speed-up; four steps, and at most 3.75 times faster,
   however many workers; four steps, unlimited speed-up; fifteen steps, four times faster at
   most. (Correct: four steps, at most 3.75 times faster — the tree's longest chain is four
   additions deep, and that chain is the ceiling no worker count lifts.)
3. **Reveal — work, span and parallelism.** Work is the total number of additions (every
   addition, on one worker, takes that many steps). Span is the longest chain of additions that
   has to happen in order, however many workers wait. Parallelism is work divided by span: the
   most speed-up any number of workers can ever buy. (No takeaway — right after step 2's
   reveal.)
4. **The same work, redrawn as a chain.** The identical fifteen additions, done one after
   another instead of as a tree, has span fifteen — equal to its own work. Parallelism is one.
   Nothing about the operations changed; only the dependency structure did.
5. **Reading a span off a recurrence.** A divide-and-conquer algorithm whose two halves run
   side by side has a span that adds the combine step's own cost to the span of one half (not
   both — they run together): span(n) = span(n/2) + combine(n). A merge sort with a sequential
   merge has span that grows the same way the combine step does — and the combine step here
   costs one pass over the whole merged run.
6. **The sort's span, measured.** Doubling the input almost exactly doubles the span (the
   signature of a cost that grows in a straight line with n), while the total work's own
   doubling ratio stays above two and keeps climbing (the signature of the extra log factor) —
   so parallelism itself keeps growing as the input grows, not capped at a small constant.
   Takeaway here.
7. **The two laws.** No schedule, however clever, beats two hard floors: workers can finish no
   faster than work divided by their count (more workers, less work each, but never less than
   that share), and no schedule — not even with infinitely many workers — beats the span
   itself, because that chain has to happen in order regardless.
8. **Brent's bound.** A greedy schedule — one that never leaves a worker idle while a ready
   task waits — finishes within work divided by workers, plus the span. That is provably within
   a factor of two of the best any schedule could do, for any number of workers.
9. **Brent's bound, measured.** The sum DAG's own greedy schedule, run on one, two, four, eight
   and sixteen workers: the real step count always lands between the two-law floor and Brent's
   bound, and at sixteen workers it bottoms out exactly at the span — four steps — because
   beyond that point, no worker count helps at all. Takeaway here.
10. **Predict.** A scheduler with no central queue — every worker keeps its own list of ready
    tasks — has to get idle workers more work from somewhere. When a worker's own list runs
    empty, what should it do? Options: wait for the next task to be handed to it; shut down
    until the whole computation restarts; pick another worker at random and take a task from
    it; always take from the worker that started the computation. (Correct: pick another worker
    at random and take a task from it — this is work stealing.)
11. **Reveal — the work-stealing scheduler.** Each worker owns a deque of its own ready tasks:
    it pushes and pops from one end, like a call stack, running depth-first exactly as a single
    worker would. An idle worker becomes a thief: it picks another worker uniformly at random
    and removes a task from the *other* end of that worker's deque — the oldest task there,
    which tends to carry the most remaining work. (No takeaway — right after step 10's reveal.)
12. **Why steal the oldest, and what the bound says.** For a fully strict computation — every
    dependency returning straight to its parent, the shape a plain recursive fork-and-join
    program has — the expected running time on many workers is work divided by workers, plus a
    constant times the span: the same shape as Brent's bound, reached without any central
    coordination at all.
13. **Steals, simulated.** A bigger version of the same tree, run through a discrete-event
    simulation of this exact protocol: with one worker, zero steals (nobody to steal from); as
    workers are added, the fraction of the work completed by a steal rises, but even at sixteen
    workers it stays well under a quarter of the total — most work is still done locally, and
    steals grow with the worker count and the span, not with the size of the job itself.
14. **Cilk, Rayon and Tokio.** Cilk is the language this algorithm was designed for; OpenCilk's
    own scheduler is tuned to the machine it runs on. Rayon's `join` runs this exact protocol in
    Rust: start one half directly, advertise the other half as available to steal, and if it
    *was* stolen, look for other work while waiting — with its own warning that blocking inside
    `join` can deadlock. Tokio's scheduler also steals from per-worker queues, but for a
    different kind of task — one that waits on network and disk, not a fork-and-join chain of
    pure computation — so this chapter's bound is not claimed for it.
15. **What this chapter did not build.** The race between a deque's owner and a thief for the
    very last task is a real synchronization problem, solved with compare-and-swap — a later
    chapter's territory, named here and not built. Takeaway here.
16. **Recap and handoff.** Work, span and parallelism say how fast any number of cores on one
    machine can possibly go; work stealing is the scheduler that gets there with no central
    queue at all. Handoff to MapReduce.

**Post-notes headings:** outcomes; internals (why the span law and the work law are each
unconditional floors, and why Brent's bound is the sharpest statement that holds for *every*
greedy schedule without assuming anything about how tasks are assigned); lab (a work-stealing
computation over a recursive reduction, speed-up measured from one worker to all of them,
against the Brent curve); production (Cilk/OpenCilk, Rayon, Tokio, each only as far as its own
documentation states); frontier (parallel prefix sum and parallel merge, named only, as the two
algorithms whose spans are usually taught first); next (MapReduce).

**Bridge:** the chapter plan's own fallback text, used because Chapter 31 (topic 104,
"Partitioned hash joins: Grace and hybrid") is not yet published to the registry: "A join can be
cut into partitions that are independent of each other, so that each one is small enough to fit
in memory. That independence is exactly what you would need to give the pieces to different
cores, and it raises the question this chapter asks first: when pieces are independent, how much
faster can p cores actually go, and what in the algorithm decides it? The work–span model, and
the scheduler that meets it, next."

**Handoff** (word for word, from CHAPTER.md): "Work and span say what any number of cores on
one machine can do, and work stealing is the scheduler that gets there without a central queue.
But the machine this reel assumed has one memory that every core can read for free. When the
data does not fit on one machine, or the cores are in different ones, moving a record costs more
than computing with it, and the question changes from 'how long is the longest chain' to 'how
many times must everyone exchange data'. MapReduce is the pattern built around that question."

**Concept ledger:** introduces `computation-dag`, `work-t1`, `span-t-infinity`,
`parallelism-ratio`, `work-law-span-law`, `brent-greedy-bound`, `work-stealing-scheduler`,
`fully-strict-computation`. Uses Chapter 1's `recurrence-relations`, `recursion-tree`,
`master-theorem`, `big-o-theta-omega`, `expected-vs-average`, `with-high-probability`; Chapter
2's `deque`. Declares `thread` (used without a prior introducing topic, per CHAPTER.md's
instruction).

**Changes from the chapter plan:**
- Chapter 31 (topic 104, "Partitioned hash joins: Grace and hybrid") is not yet published to
  the registry, exactly as CHAPTER.md anticipated. This topic's bridge uses the plan's own
  supplied fallback text verbatim, as instructed, instead of quoting a live handoff. A seam pass
  must replace it once Chapter 31 ships.
- The canonical Blumofe and Leiserson *Journal of the ACM* 1999 paper was not directly
  readable at research time (the ACM page 403s; a third-party PDF mirror returned only an
  unreliable summary, not the paper's own text — see `SOURCES.md`'s note). Blumofe's MIT
  technical report (MIT-LCS-TR-677, 1995), the same joint research, explicitly credited to
  Leiserson in its own text, is used in its place for every theorem this topic states; nothing
  is claimed that the TR does not itself say.
- The real Rayon or process-pool speed-up measurement CHAPTER.md names as optional ("shown only
  if `examples.py` measures it") is not included: a real multi-core timing measurement is not
  reproducible or meaningful inside this build sandbox's resource limits, so the topic relies
  on the discrete-event simulation and the greedy-schedule computation instead, both fully
  deterministic and asserted.
- The chapter plan's running-example table suggests simulating the sort's span "from a
  simulated DAG at n = 2^16"; this topic instead computes the span and work directly from the
  stated recurrences at every power of two up to 2^16, which is equivalent (the recurrence is
  exactly what a node-level DAG simulation would compute) and tractable to run in the build.
