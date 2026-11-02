<section data-section="outcomes">

## Outcomes

State what a data contract specifies and who it binds, cited from a real documented practice;
build three priced SLO tiers for a stated request, each with a measurable freshness/availability
number and a non-goal; name an error budget and assign a specific owner to a stated breach.

</section>

<section data-section="internals">

## Internals

dbt's own documentation states a data contract directly: "It's better to define a set of upfront
'guarantees' that define the shape of your model. We call this set of guarantees a 'contract.'"
dbt checks a project's previous state for changes "that could impact downstream consumers" before
allowing a breaking change through. Google's SRE book states an error budget's own definition:
"the two teams jointly define a quarterly error budget based on the service's service level
objective, or SLO," and states its purpose plainly: "An error budget aligns incentives and
emphasizes joint ownership between SRE and product development." This reel is the negotiation
only — enforcement (schema checks at write time, SLO alerting, access boundaries) is named but
taught in Chapters 3, 11 and 13, not here.

</section>

<section data-section="lab">

## Lab

A written artifact, not a measured number: this chapter has no system under test (see
CHAPTER.md's own "Engine of record" note). `examples.py` computes three priced SLO tiers for the
shop's own dashboard request from a simple, disclosed, illustrative cost model — not sourced real
pricing — showing the fast tier costing dramatically more than the medium tier once a streaming
surcharge is added, confirms every tier states its own non-goal and names a specific breach owner,
and computes a quarterly error budget in the SRE book's own worked style, showing one disclosed
breach consuming part, but not all, of that budget.

</section>

<section data-section="production">

## Production failures this topic warns about

**Delivering exactly what was asked, without ever pricing the alternatives.** The hook's own
failure is not a technical mistake — the dashboard genuinely is real-time, exactly as requested.
The failure is that nobody negotiated a contract before the cost was already spent.

**Treating a contract as only its guarantees.** A contract that states what it promises but never
what it doesn't, or never names who owns a breach, leaves exactly the gap this topic's own lab
checks for mechanically.

</section>

<section data-section="frontier">

## Frontier

A non-goal is easy to treat as an afterthought, something a contract gets around to stating once
the guarantees are written. It is not load-bearing until later — the day a consumer relies on
behavior the contract never promised, and the only thing that saves the producer from blame is
having written the non-goal down in advance.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Three priced tiers on a cost curve are a negotiation finished, not a decision made — someone
outside engineering still has to actually pick one. The next topic is how that choice gets
explained to them in the terms they use to decide, not the terms that built the curve.

</section>
