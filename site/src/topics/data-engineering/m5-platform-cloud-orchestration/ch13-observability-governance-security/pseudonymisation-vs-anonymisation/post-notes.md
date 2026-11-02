<section data-section="outcomes">

## Outcomes

State what pseudonymisation does and does not change about a dataset's legal status; explain why
a plain hash falls to a dictionary attack while a keyed hash does not, and what secret a keyed
hash actually relies on; explain how a linkage attack re-identifies people using only
quasi-identifiers, without ever touching a key; and state the CJEU's relative-identifiability
holding in EDPS v SRB, including what the Digital Omnibus proposal would change about it and that
it is not yet law.

</section>

<section data-section="the-two-attacks">

## The two attacks

`examples.py`'s own three measurements isolate the two attacks this topic teaches so they can't
be confused with each other. The dictionary attack (claim 1 vs claim 2) holds the *target
population* fixed — the same 5,000 emails — and changes only the hash function, plain versus
keyed, to show the attack depends entirely on the function being public and deterministic.
Flipping to a keyed HMAC with a secret the attacker never has doesn't make the attack harder; it
makes it produce zero matches, because the attacker's guesses no longer land anywhere at all. The
linkage attack (claim 3) is a genuinely different mechanism: it never hashes anything and never
needs a secret. It re-identifies people purely because a handful of ordinary attributes, in
combination, are unique enough to match one row in an outside list to one row in the release.
The two attacks fail for different reasons and defend against differently — a secret key stops
the first, but does nothing for the second, which is why removing names is not the same thing as
removing identifiability.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "we hashed it" as "it's anonymous."** This topic's own hook is the exact production
incident: a plain, unkeyed hash of a known value space (an email list) is trivially reversed by
anyone who can guess the candidates, because the function itself is public and deterministic.
Hashing without a secret key doesn't anonymise anything — it just relabels the same personal data.

**Believing that removing direct identifiers (name, email) is enough.** The linkage-attack
measurement shows a release with no names at all still re-identifying a real, measurable share of
people, because quasi-identifiers in combination can be as identifying as a name once joined
against an outside list that already has one.

</section>

<section data-section="frontier">

## Frontier

This topic's own linkage attack works because the outside reference list and the pseudonymised
release share the exact same quasi-identifier values for the same individuals — a clean join `the
examples.py` builds by construction. In practice an attacker's outside list is rarely this clean,
and published linkage-attack success rates vary widely depending on how many quasi-identifiers
are available and how precisely they're recorded in both datasets being joined; this topic
measures the mechanism, not a guarantee about how well it generalises to messier, real-world
lists.

</section>
