<section data-section="outcomes">

## Outcomes

A toy sticky reassignment of 24 partitions across an eight-member group growing to nine moves
only a minority of members' assignments — the rest keep exactly what they already had. A direct
comparison shows the classic eager protocol pausing the full nine-member group regardless, while
cooperative/incremental reconciliation pauses only the members that reassignment actually
touched. A toy static-membership check confirms a fast restart under a configured
`group.instance.id` never triggers a rebalance, while the same restart without one, or one that
runs past the session timeout, triggers one every time.

</section>

<section data-section="lab">

## Lab

This topic hosts the classic-vs-KIP-848 rebalance-pause comparison leg of the 9.1 chapter lab.
`examples.py` builds a sticky-reassignment model, a direct eager-versus-cooperative paused-member
count, and a static-membership rebalance-trigger check, and asserts every number this topic's
reel shows.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a scale-up event always means a stop-the-world pause.** Only the classic eager
protocol behaves that way. Cooperative-sticky and the newer KIP-848 protocol pause only the
members whose assignment actually changed — a scale-up on a modern cluster is far cheaper than
the classic protocol's behavior suggests.

**Restarting a stateful consumer without static membership.** Without a configured
`group.instance.id`, every restart — however brief — gets a fresh, ephemeral member id and
triggers a full rebalance, which is exactly the unnecessary churn static membership exists to
avoid.

**Assuming Kafka Streams automatically gets KIP-848's benefits.** The Streams rebalance protocol
(KIP-1071) is a separate, broker-driven protocol with its own stated limited feature set — it
isn't simply KIP-848 reused unchanged.

</section>

<section data-section="frontier">

## Frontier

KIP-1071's own "What's Not Supported in This Version" list names concrete gaps this topic does
not measure or teach in full: no in-place topology updates (a changed topology needs a new
streams group), no built-in rack-aware assignment beyond the default sticky assignor, and no
online migration between the classic and new streams protocols.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A log keeps every record forever unless something decides otherwise. What a log throws away, and
what it keeps forever by a different rule, is the next topic: retention and compaction.

</section>
