<section data-section="outcomes">

## Outcomes

A toy heartbeat-fencing check confirms a broker five missed two-hundred-millisecond intervals
behind gets fenced past a nine-hundred-millisecond timeout, while one three intervals behind does
not — the same arithmetic the controller's own MetadataFetch-doubles-as-heartbeat rule runs. A
toy comparison of a flaky, unwinnable candidate reconnecting across twelve rounds shows a
standard vote bumping the epoch and disrupting the leader every single round, while pre-vote
bumps nothing and disrupts nothing across all twelve, because its canvass always fails for a
candidate that can never win. A toy controller-quorum admission model accepts three sequential
voter changes in a serialized timeline, then rejects a second request arriving while a first is
still pending — the one-voter-change-at-a-time rule, measured directly rather than asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own; it names the mandatory bridge-release sequencing as a
sourced fact for the deep dive instead. `examples.py` builds three small, independent
simulations — heartbeat fencing, standard-vote-versus-pre-vote disruption counts under a
repeatedly-partitioned candidate, and one-voter-change-at-a-time admission — and asserts every
number this topic's reel shows.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a reconnecting candidate is harmless because it can never win.** A standard vote
bumps the cluster epoch unconditionally, before anyone knows the outcome — so a flaky node that
can never actually win an election still disrupts the leader every time it reconnects, unless
pre-vote is in effect.

**Treating "3.9" as a confirmed, sourced bridge-release version.** No source fetchable in this
sandbox names a specific version for the mandatory bridge release — see `FACT-CHECK.md`'s
correction. This topic teaches the bridge-release concept itself, sourced to KIP-500 and
KIP-866, without asserting that unconfirmed version number.

**Forgetting the one-voter-change-at-a-time rule when scripting a quorum resize.** KIP-853 only
allows one pending AddVoter/RemoveVoter operation at a time; a second request issued before the
first completes is rejected outright, not queued.

</section>

<section data-section="frontier">

## Frontier

KIP-853's dynamic quorums and KIP-996's pre-vote are both already-shipped mechanisms this topic
measures directly, not frontier work — named here instead: the mandatory bridge-release path
itself (KIP-866) is the harder-to-source edge of this topic, disclosed above rather than taught
as a specific version number.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A partition's data is one thing; who is allowed to read it, together, as a group, and what
happens when that group's membership changes, is the next topic.

</section>
