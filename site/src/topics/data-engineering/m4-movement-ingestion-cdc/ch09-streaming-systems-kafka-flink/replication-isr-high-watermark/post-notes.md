<section data-section="outcomes">

## Outcomes

A toy replica column with a leader offset of two hundred and two followers lagging twenty and
fifty positions behind measures a high watermark of one hundred fifty — the slower follower's
own position, never the leader's own two hundred, confirming the high watermark is a minimum
across the whole in-sync set, not a leader-only number. A direct reimplementation of KIP-101's
own worked example shows a two-message follower log losing its second message when truncated to
its own recorded high watermark, and keeping that same message when truncated to the current
leadership period's end position instead — the exact mechanism that makes raw high-watermark
truncation unsafe on its own. A toy durability gate rejects every write attempted while the
in-sync set sits below the configured minimum and accepts every write once the set meets or
exceeds it, modeling `min.insync.replicas` directly. Finally, a toy "last replica standing" run
compares two rules for letting the high watermark move once the in-sync set shrinks to one
replica: a rule that only checks the set isn't empty lets new writes through during the shrink,
all of which are later lost to an unclean shutdown on that sole replica; a rule that also checks
the set's size against the configured minimum accepts none of those writes, and so loses none of
them — a direct, measured illustration of the gap KIP-966 proposes closing.

</section>

<section data-section="lab">

## Lab

This topic hosts the leader-kill leg of the 9.1 chapter lab (`CHAPTER.md`), building on topic
2's producer-side baseline. `examples.py` builds four small, independent simulations — a
high-watermark-as-minimum model, a `min.insync.replicas` durability gate, a direct
reimplementation of KIP-101's leader-epoch-truncation example, and a classic-versus-gated
last-replica-standing comparison — and asserts every number this topic's reel shows, rather than
printing a value that was never checked.

</section>

<section data-section="production">

## Production failures this topic warns about

**Leaving `min.insync.replicas` at its default.** The topic configuration reference's own
default is one in-sync replica, which means a single caught-up replica is already enough for an
`acks=all` write to succeed — the exact "last replica standing" exposure this topic's hook
measures, not a hypothetical misconfiguration. Raising it costs availability during failures in
exchange for closing that gap.

**Assuming epoch-based truncation alone makes unclean election safe.** The leader-epoch
mechanism fixes a specific, narrower problem — a follower losing a message that was never
actually divergent. KIP-101 itself states this proposal does not protect against log divergence
for clusters that allow unclean election; that is a separate failure mode this topic's last
reveal addresses on its own terms.

**Treating Eligible Leader Replicas as already default-on.** No source found while researching
this topic confirms a specific Kafka version where ELR becomes the default — the KIP's own
feature flag defaults to off, with no committed version for turning it on. Configuring for the
safer last-replica-standing protection this topic's last reveal measures means deliberately
enabling the feature, not assuming a newer cluster already has it.

</section>

<section data-section="frontier">

## Frontier

Unclean Recovery (named in KIP-966, governed by a feature flag this topic does not configure)
replaces a purely random pick during an unclean leader election with a more deliberate recovery
process that tries to minimize data loss — named here as a real, more careful alternative to the
classic unclean-election strategy this topic contrasts against, not measured or taught in full.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Kafka's own cluster metadata — which broker leads which partition, which replicas are in sync —
used to live in ZooKeeper, replicated by a completely different system. Kafka 4.0 replaced it
with the same kind of log this chapter has been building. That's next.

</section>
