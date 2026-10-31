<section data-section="internals">

## Internals: what sequential consistency keeps, and what it throws away

`respects_program_order` in `examples.py` is the only ordering constraint sequential consistency
keeps from linearizability's L2: each process's own operations must appear, in the candidate total
order, in exactly the order that process issued them. `is_legal_sequential_history` is the same
L1 check as topic 5's — replay the candidate order against the register and see whether every read
matches. What's missing, compared to topic 5's `respects_real_time_order`, is any check at all
against invocation and response times. `sequential_consistency_drops_the_real_time_rule` shows
exactly what that absence buys: a write that finishes, followed by a read (on a different process)
that returns the OLD value, still has a legal sequential order — the one where the read is placed
*before* the write in the total order, which `respects_program_order` has no objection to, since
the two operations are on different processes and program order says nothing about operations
across processes. Linearizability would have rejected this outright (topic 5's `find_a_linearization`
returns `None` for the identical shape of history); sequential consistency accepts it, because the
total order it demands is allowed to disagree with real time.

</section>

<section data-section="lab">

## Lab: the chat example as a causal-order checker, and the four guarantees broken one at a time

`causally_related_pairs` builds the happens-before relation CHAPTER.md's chat example needs: same-
process program order, plus an explicit read-depends-on-write edge for "Barbarella read the
question before answering it." `chat_example_two_replies_may_swap_but_never_precede_the_question`
checks two different participants' views against that relation — Attiya's own view and a view
with the two replies swapped both pass `process_view_respects_causality`, because neither reply
causally depends on the other; a view with either reply moved before the question fails, because
that edge is causal, not concurrent. The four session-guarantee functions
(`read_your_writes_violated`, `monotonic_reads_violated`, `monotonic_writes_violated`,
`writes_follow_reads_violated`) each construct the smallest history that breaks exactly one
guarantee, confirming CHAPTER.md's claim that none of the four is stronger than any other: breaking
one says nothing about whether the other three still hold.

</section>

<section data-section="production">

## Production: where Chapter 5 already used three of these four

Chapter 5 topic 19 built read-your-writes, monotonic reads and consistent-prefix as an
implementation, using LSN tokens a client carries between requests and a routing layer that pins a
client to a replica at least as fresh as its token. That topic showed *how* a store keeps those
promises; this topic states *what* the promises mean, precisely enough to write a checker against,
and adds the fourth guarantee, writes-follow-reads (session causality), which Chapter 5 did not
cover. MongoDB's causally consistent sessions are a real-world instance of this same four-guarantee
bundle: its documentation (not fetched for this topic, named only as a pointer) ties all four to a
specific combination of read and write concerns, and is explicit that other combinations may or
may not deliver all four.

</section>

<section data-section="frontier">

## Frontier: the ceiling result, and the two conditions that make it true

Jepsen's own sentence states the result this topic leans on: "A slightly stronger version of causal
consistency, Real-Time Causal, is proven to be the strongest consistency model in an
always-available, one-way convergent system." Both conditions are load-bearing, not decoration.
Drop "always-available" and a system can wait out a partition, at which point sequential
consistency or linearizability become reachable again (that is the entire reason topics 5's
Attiya-Welch result and this topic's Jepsen result are not in tension: they describe systems under
different availability requirements). Drop "one-way convergent" — the requirement that once two
replicas have seen the same writes they agree, with no further coordination needed to reach that
agreement — and even causal consistency is not guaranteed to be the ceiling; a system could, in
principle, resolve conflicts with a side channel that costs it availability elsewhere. The report
behind this bound (Mahajan, Alvisi and Dahlin, cited in `references.md`) could not be fetched
directly for this topic — both of its usual hosts, `cs.utexas.edu` and `cs.cornell.edu`, returned a
broken TLS certificate chain, domain-wide, confirmed by testing their site roots and not just this
one PDF path — so the result here is quoted from Jepsen's own restatement of it, with the two
conditions kept intact, rather than dropped into the unqualified slogan CHAPTER.md warns against.

</section>

<section data-section="where-next">

## Where this goes next

Both models in this topic are about a single object — one register, one key. A database gives
transactions that touch many objects at once, and there the same two ideas, order and real time,
recombine into two more strengths with a famously confusing difference: serializability, which
allows a kind of time travel single-object models don't, and strict serializability, which adds
back the real-time rule. That difference is the next topic.

</section>
