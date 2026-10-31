<section data-section="internals">

## Internals: the voting restriction is the whole safety argument's only lever

`log_is_at_least_as_up_to_date` in `examples.py` is the single comparison the paper's entire proof
of Leader Completeness rests on: compare last term, and only fall back to log length when those
terms tie. `dropping_the_voting_restriction_breaks_leader_completeness` shows the restriction
denying a vote to a candidate that is missing a committed entry; without that one check, nothing
else in Raft's mechanism would stop that candidate from winning and then never catching up, since
Leader Append-Only forbids a leader from pulling entries in from elsewhere once elected. Every
other safety property in this topic (Log Matching, the commit rule, joint consensus) assumes
Leader Completeness already holds; this is the one mechanism that actually produces it.

## Message formats and conflict repair: left to the Rust track

Everything above is the safety argument: why each rule exists and what breaks without it. The
`RequestVote` and `AppendEntries` RPC payloads themselves, the optimization that lets a leader
skip rejected entries term by term instead of index by index, and a working implementation that
exercises all of it under real failures live in *Rust Systems Engineering* Chapter 26, where the
mechanism gets built, not just argued for.

</section>

<section data-section="lab">

## Lab: walking the paper's own counter-example literally

`figure_8_scenario` in `examples.py` runs the paper's five lettered steps as actual log states, not
a description of them: five servers' logs are built up and compared at each step with the same
`log_is_at_least_as_up_to_date` function used for the voting restriction. The pivot is step (d)
versus (e): at (d), an entry from an earlier term sits on a majority, and a candidate with a
higher last term can still pass the up-to-date check against every server in a different
majority and win — the function returns `True` for exactly this case. At (e), once the leader
replicates one entry from its own current term to a majority, that same candidate's up-to-date
check against the servers holding it now returns `False`. Nothing about the entry's position in
the log or how many copies exist changed between the two steps — only which term the newest
majority-held entry carries.

</section>

<section data-section="production">

## Production: the rule that makes commitment decidable without a special case

`committing_by_counting_replicas_is_unsafe_for_old_terms_only` states the production consequence
directly: a current-term entry and an old-term entry can sit on the identical majority, with the
identical replica count, and only one of them is safe to call committed. A real implementation
never needs to ask "was this entry ever on every server at some point" or reconstruct history —
it only needs to know which term the leader was in when it wrote the entry being counted, which
the paper calls out as the reason Raft accepts the extra complexity in its commit rule in exchange
for never having to renumber entries from old terms, unlike algorithms that do.

</section>

<section data-section="frontier">

## Frontier: why "simpler" is a real claim, not a marketing one

It's worth being precise about what "more understandable than Paxos" is a claim about, since it
sounds like a soft, subjective one. It isn't: the paper backs it with the decomposition itself —
leader election, log replication, and safety are presented and provable as three separable
pieces, each with its own mechanism, rather than one entangled proof. Multi-Paxos achieves the
identical result (the paper's own words: "equivalent to (multi-)Paxos") with a specification that
doesn't decompose this cleanly, which is why implementations of Paxos have historically diverged
from each other in ways Raft implementations do not. The claim is about the proof's structure,
not about the result being any different or any stronger.

</section>

<section data-section="where-next">

## Where this goes next

Raft guarantees there is at most one leader per term, full stop. It says nothing about a leader
from an earlier term that paused — a garbage-collection stall, a frozen VM, a slow disk — and
wakes up believing it still leads. A consensus protocol alone cannot fix that; something outside
it has to refuse that leader's writes. The next topic is exactly that: leases, fencing tokens, and
split brain.

</section>
