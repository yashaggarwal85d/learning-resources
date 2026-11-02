<section data-section="outcomes">

## Outcomes

Write a complete, timestamped incident timeline; quantify a simulated incident's impact in data
terms rather than infrastructure metrics; write a blameless post-mortem naming contributing
factors and owned action items, with no individual blamed; state what a live stakeholder update
says that a post-mortem does not.

</section>

<section data-section="internals">

## Internals

Daniel Schauenberg's own account of Etsy's postmortem practice states the reasoning directly:
"This is why we focus not on the action itself... but on exploring the conditions and context
that influenced decisions and actions." Google's SRE book states the blameless definition and its
own reason for it: "Writing a postmortem is not punishment—it is a learning opportunity for the
entire company," and "it must focus on identifying the contributing causes of the incident
without indicting any individual or team." This reel builds the post-mortem and the live-update
distinction; incident-command staffing itself (Chapter 11's own material) is named but not taught
here.

</section>

<section data-section="lab">

## Lab

A written artifact, not a measured number: this chapter has no system under test (see
CHAPTER.md's own "Engine of record" note). `examples.py` builds a timestamped timeline for a
simulated one-hour staleness incident on the medium tier, quantifies its impact as a computed
stale-row count and a named list of affected plant decisions, and checks a blameless post-mortem's
own contributing-factors list and action items mechanically against a person-blaming post-mortem
that fails the identical check (fewer than two factors, a factor naming a person, an action item
targeting a person rather than a system).

</section>

<section data-section="production">

## Production failures this topic warns about

**Closing an investigation at "don't do that again."** The hook's own failed company names a
person as the cause; the fix doesn't survive that person leaving, and the same mistake recurs from
someone else entirely.

**A contributing-factors list of exactly one, naming a person.** The Prove It step's own scenario
checks this directly: a post-mortem with one factor and a retrain-the-person action item has
stopped at the first plausible answer instead of asking what let the mistake through undetected.

</section>

<section data-section="frontier">

## Frontier

A blameless post-mortem is easy to mistake for kindness toward the person involved. It isn't; it's
the only method that reliably gets the honest account of what happened, because a person who
expects to be blamed won't volunteer the details that actually explain the incident.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This closes the course's own technical arc: a schema, a query, a model, a pipeline, a benchmark,
and now the contract, the trade-off, the decision and the incident that together decide whether
any of it actually worked for the person who asked for it.

</section>
