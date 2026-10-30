<section data-section="internals">

## Internals: the Ll/L2 conditions, and what the checker is actually searching for

Herlihy and Wing's own definition (quoted in `SOURCES.md`) states that a history `H` is
linearizable if it can be extended to some history `H'` such that `complete(H')` is equivalent to
some legal sequential history `S` (condition L1), and the real-time precedence order `<H` is a
subset of the order `S` imposes (condition L2). `examples.py`'s `find_a_linearization` is exactly
this search, specialized to the chapter's single-register object: `is_legal_sequential_history`
checks L1 (does replaying this candidate order against the register produce the values every read
actually saw), and `respects_real_time_order` checks L2 (does the candidate order ever place an
operation before one that, in real time, had already finished before it started).

`a_legal_history_is_linearizable` is the easy case: a write, a non-overlapping read that sees it,
and a second non-overlapping write. The search finds the obvious ordering on the first or second
candidate it tries, because the real-time order and a legal sequential order happen to coincide.
The stale-leader history is the opposite case, and it is worth being precise about why: with only
two operations (the write and the read), there are only two possible orders to try. Placing the
write first satisfies L2 (the write really did finish before the read began) but fails L1 (the
register, replayed in that order, says the read should see the new value, and it reports the
old one). Placing the read first satisfies L1 trivially but fails L2 outright (the write's
response came before the read's invocation; no candidate order may place the read earlier).
Neither of the only two orders works — which is the formal content of "this history is not
linearizable," not a search that simply ran out of time.

</section>

<section data-section="lab">

## Lab: a stale-leader read with no legal order, and the fix that gives it one

`stale_leader_read_is_not_linearizable` plants CHAPTER.md's hook directly: a write that sets the
register to a new value and completes, followed by a read that starts after the write's response
and returns the register's old value. `find_a_linearization` returns `None` — no ordering
survives both checks.

`quorum_confirmed_read_is_linearizable` is the fix run through the identical checker: the same
two operations, same timing, but the read's value is now the fresh one a quorum-confirming leader
would actually return. The checker now finds a linearization immediately (write, then read),
because the only thing that changed is which value the deposed leader was allowed to hand back —
nothing about the real-time shape of the history changed at all. That is the entire content of
"confirm leadership with a quorum before answering": it does not reorder anything, it only
prevents the read from completing with a value that could never be placed legally.

</section>

<section data-section="production">

## Production: Jepsen, and the tools built to find exactly this

CHAPTER.md names a specific toolchain for checking real histories at scale, because a brute-force
search over every permutation (the simulator's own approach, fine for a handful of operations)
does not scale to a real production trace with thousands of concurrent operations. Jepsen is the
testing framework that injects real faults — partitions, clock skew, process kills — into a real
cluster and records the resulting history. Knossos is Jepsen's own linearizability checker, built
on the same Herlihy-and-Wing definition this topic teaches, but using a far more efficient search
than brute-force permutation. Porcupine is a later, faster linearizability checker built around
the same idea. Elle checks a stronger, transactional property (not single-object linearizability)
by exploiting dependency cycles in a recorded history. None of these are built in this topic's
lab; they are named here as the production-grade versions of the exact mechanism `examples.py`
implements by hand, at a scale a classroom example was never meant to reach.

</section>

<section data-section="frontier">

## Frontier: the Attiya-Welch bound, stated precisely

The syllabus's own shorthand, "linearizability costs at least a round trip," is a simplification
the paper's actual theorems earn more carefully. Attiya and Welch's own model (quoted) defines
`d` as the worst-case message delay between any pair of processes, and `u` as the worst-case
clock/delay uncertainty, with `0 ≤ u < d`. Under the strong assumption of perfectly synchronized
clocks (`u = 0`), the paper proves that for sequential consistency, the sum of the worst-case
response times of a read and a write is at least `d` — and gives a matching algorithm where one
operation answers instantly and the other costs exactly `d`, so the "round trip" language applies
to the sum across both operation types, not to every individual operation. Once clocks carry real
uncertainty (`u > 0`), the paper's stronger result is that no linearizable implementation can do
better than roughly `u` on every single operation — a per-operation floor, not a one-time cost,
and the paper's main conclusion is exactly that this makes linearizability strictly more expensive
than sequential consistency under those realistic, imperfect-clock assumptions.

</section>

<section data-section="where-next">

## Where this goes next

Linearizability is the strongest single-object answer to what a client's read may return, and by
the Attiya-Welch result, the most expensive one a system can offer. Most systems choose something
weaker on purpose, for exactly that reason. The next topic states the two main weaker models:
sequential consistency, which keeps one shared total order but drops the real-time rule, and
causal consistency, which drops almost everything except cause and effect.

</section>
