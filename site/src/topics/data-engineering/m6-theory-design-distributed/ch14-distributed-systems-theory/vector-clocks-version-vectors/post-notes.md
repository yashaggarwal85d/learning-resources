<section data-section="internals">

## Internals: the comparison rule, and why Dynamo's own worked example is the whole mechanism

Dynamo's own text (quoted in `SOURCES.md`) states the comparison rule directly: "if the counters
on the first object's clock are less-than-or-equal to all of the nodes in the second clock, then
the first is an ancestor of the second and can be forgotten. Otherwise, the two changes are
considered to be in conflict." That single sentence is the entire algorithm — no global state,
no coordination, just an elementwise comparison of two small lists.

The paper's own Figure 3 example, reproduced in `examples.py`, is worth walking slowly because it
contains every case the rule has to handle. Sx writes D1 (`[(Sx, 1)]`), then D2 (`[(Sx, 2)]`) —
D2 dominates D1, so D1 can be forgotten. From D2, two different coordinators each handle a later
write: Sy produces D3 (`[(Sx, 2), (Sy, 1)]`), and separately, Sz produces D4
(`[(Sx, 2), (Sz, 1)]`). Comparing D3 and D4: D3 has no entry for Sz, and D4 has no entry for Sy,
so neither dominates — concurrent, exactly as the paper states: "there are changes in D3 and D4
that are not reflected in each other. Both versions of the data must be kept." A client's read
of both returns a context that merges the two clocks (`[(Sx, 2), (Sy, 1), (Sz, 1)]`), and when Sx
coordinates the reconciling write, it only increments its own entry, producing D5
(`[(Sx, 3), (Sy, 1), (Sz, 1)]`), which now dominates both D3 and D4 at once.

</section>

<section data-section="lab">

## Lab: a same-coordinator write a plain version vector cannot tell apart

`examples.py`'s `vector_clock_detects_concurrency_a_scalar_clock_cannot` is the hook's predict
made concrete: two vectors, `{"P": 1, "Q": 0}` and `{"P": 0, "Q": 1}`, where neither dominates —
exactly the shape a scalar clock's single number can never represent, since a scalar always
produces some order, right or wrong.

`truncation_can_mistake_an_ordered_pair_for_concurrent` builds a genuinely dominating pair, then
drops the oldest entries from both past a fixed threshold (Dynamo's own named scheme) and
re-compares what's left. When the dropped entry was the only one proving the earlier version's
history was included in the later one, the truncated pair compares as concurrent even though the
original pair never was — the paper's own stated risk, made to actually happen.

`same_coordinator_falsely_merges_without_a_dot` is the Dotted Version Vectors paper's own anomaly
in miniature: two clients write through the identical coordinator, which bumps its entry the same
way both times, so a plain version vector cannot register them as two separate events at all —
comparing the two results returns "equal," not "concurrent," hiding the fact that two different
writes happened. A dot (an event identifier distinct from the vector itself) is what tells them
apart, which is exactly what Riak's documentation states a plain vector clock structurally cannot
do.

</section>

<section data-section="production">

## Production: sibling explosion, and the three settings that cause it

Riak's own causal-context documentation (quoted) is explicit about the setting that creates this
topic's central tradeoff: with `allow_mult` set to true, "all non-CRDT writes to that bucket type
will create siblings in the case of concurrent writes," while `allow_mult` set to false falls back
to "simple timestamp resolution to decide which value 'wins,'" silently losing whichever version
loses the comparison — the exact failure mode topic 2 named for last-write-wins under clock skew.
The documentation's own recommendation is to always set `allow_mult` to true and build a real
merge function, precisely because the alternative is this topic's hook happening silently in
production.

Sibling explosion is the cost of getting that choice right without also controlling for delivery
order: the documentation states plainly that "vector clocks can detect concurrent updates to the
same object but they can't identify which value was associated with each update," so five
clients writing concurrently through delivery paths that duplicate updates can produce far more
than five siblings. Dotted version vectors fix exactly this, "identify[ing] each value with the
update that created it" so that "the number of sibling values will be proportional to the number
of concurrent updates" rather than to how many times a duplicate happened to arrive.

</section>

<section data-section="frontier">

## Frontier: from siblings to a merge the application never has to write

Siblings and dots solve the problem of detecting and bounding conflicting versions correctly, but
the application still has to write the merge logic itself — the shopping-cart reconciliation this
topic's lab builds by hand. A CRDT (conflict-free replicated data type) removes that last step by
defining the data type's own merge function in advance, so that two concurrent versions of a
CRDT-typed object always combine into one correct result with no application code involved at
all. Riak's own documentation names CRDT-typed buckets as an alternative path to `allow_mult`
siblings for exactly this reason. Named here, not built: CRDTs are the *(skipped)* syllabus topic
this chapter's exactly-once topic (topic 13) revisits in its own Deep dive.

</section>

<section data-section="where-next">

## Where this goes next

Vector clocks and version vectors say precisely which writes were ordered and which were
concurrent, with no trusted clock involved at all. But none of that says what a client reading
the store is allowed to see. The next question is the one a client actually asks: what may a
read return? The strongest possible answer — the one that makes a replicated register behave
like a single ordinary variable — is linearizability.

</section>
