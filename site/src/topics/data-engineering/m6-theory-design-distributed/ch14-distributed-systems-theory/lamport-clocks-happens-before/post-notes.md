<section data-section="internals">

## Internals: the three conditions and the clock condition's proof sketch

Lamport's own definition (quoted in `SOURCES.md`) is the smallest relation satisfying three
conditions: events on the same process ordered by program order, a message's send linked to
its matching receipt, and transitivity closing the chain. Two events with no chain between them
either way are concurrent — not "unrelated" or "unknown," a precise third category the relation
itself defines. The paper is explicit that happens-before "is therefore only a partial
ordering," and that this is a fact about the system, not a gap in the model to be patched.

The Clock Condition (`a → b ⇒ C(a) < C(b)`) follows from two simpler local conditions the paper
calls C1 and C2: same-process events get increasing numbers, and a message's receipt gets a
number larger than its send. Two implementation rules guarantee both: IR1 says increment the
counter between any two successive events; IR2 says stamp every outgoing message with the
counter's current value, and on receipt, set the counter to one past the larger of its own value
and the incoming stamp. The paper's own "tick line" picture makes this intuitive: draw a dashed
line through every process at each integer tick, and IR1 guarantees a tick line falls between
any two events on one process, while IR2 guarantees every message line crosses at least one tick
line — together, exactly the Clock Condition's pictorial meaning.

The paper is equally direct about why the converse can't hold: if `C(a) < C(b)` always implied
`a → b`, two genuinely concurrent events would be forced into a causal relationship they don't
have — a contradiction the paper states outright using its own Figure 1. It goes further with the
Strong Clock Condition (`a ⇒ b ⇒ C(a) < C(b)`, for a relation `⇒` capturing precedence information
*external* to the system, such as a phone call made outside it) and its own anomalous-behavior
example: a person issues request A on one computer, then telephones a friend who issues request
B on a different one; nothing inside the system's own events can know A actually preceded B, so
the total order built purely from `→` can legally put B first. The paper names two fixes — carry
the external precedence information back into the system explicitly, or use physical clocks
synchronized tightly enough to satisfy the Strong Clock Condition — and the second is exactly
topic 2's subject, already covered.

</section>

<section data-section="lab">

## Lab: a scalar clock under injected physical skew

`examples.py`'s `happens_before_is_acyclic` builds the hook's four-event graph directly from
Lamport's own three conditions (program order plus linked send/receipt pairs) and confirms no
event ever reaches itself through the chain — the paper's own claim that `→` is an irreflexive
partial order, made executable. `concurrent_pairs` then finds every pair with no chain either
way, and the unrelated customer's order comes back concurrent with the shipment, exactly as the
hook sets up.

`clock_condition_holds_on_the_causal_chain` runs the IR1/IR2 update rule along the real causal
chain (order → payment → shipment) and checks each step's stamp is strictly larger than its
cause's. `scalar_clock_survives_injected_physical_skew` is the chapter's point made small: the
same guarantee holds on a two-event send/receive pair with no physical clock involved at all,
because the scalar clock's rule never reads one — skew injected anywhere else in the simulator
has nothing to disturb. `converse_fails_for_the_independent_order` and
`tie_broken_total_order_respects_causality` are the other two directions: a concurrent pair still
gets two different, comparable numbers with no causal meaning behind the difference, and a
constructed tie between two unrelated processes' counters resolves into one definite total order
once a fixed process-identifier ordering breaks it.

</section>

<section data-section="production">

## Production: the request that looked causal and wasn't

Lamport's phone-call anomaly has a direct modern shape. A distributed event log or message queue
assigns each event a Lamport-style sequence number so consumers can process events "in order."
A user performs an action in one service, then — through a side channel the event log never
sees, a support call, a manual API request from a different client, a cross-team Slack message
— triggers a second action in an unrelated service. Nothing in the log's own events records that
the first action caused the second; the log's sequence numbers can legally place the second
action's number lower than the first's, and a consumer that reads "lower sequence number, so it
happened first" draws exactly the wrong conclusion the 1978 paper already named. The fix is also
the paper's own: either carry the external precedence information into the system explicitly (a
causal token, an idempotency key referencing the first action), or stop trusting sequence numbers
alone for causality and track real happens-before edges — the subject topic 4's vector clocks
takes further.

</section>

<section data-section="frontier">

## Frontier: from one number to detecting concurrency

A single scalar number fundamentally cannot distinguish "ordered by a real cause" from "ordered
only because every pair needs some order." Detecting genuine concurrency — the thing last-write-
wins (topic 2) and a naive event log (above) both get wrong — needs a data structure that can
say "neither of us knows about the other's write" rather than just handing back a number. That
means tracking more than one counter: one per process, watched by every replica, so that two
version stamps can be compared componentwise instead of as a single total order. Named here,
built in topic 4: the vector clock.

</section>

<section data-section="where-next">

## Where this goes next

A Lamport clock never contradicts causality, but it also can't tell you when two events were
independent: it orders everything, whether or not an order was ever earned. A store that has to
detect conflicting concurrent writes — two customers editing the same cart offline, two replicas
accepting writes during a partition — needs a clock that can say "neither saw the other" instead
of just picking a winner. That is the vector clock.

</section>
