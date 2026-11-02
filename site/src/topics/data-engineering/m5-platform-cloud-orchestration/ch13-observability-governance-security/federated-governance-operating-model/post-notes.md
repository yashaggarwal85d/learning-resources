<section data-section="outcomes">

## Outcomes

Divide a governance rule set between the central body, the platform and the domain team for
the shop's three domains; state reverse Conway's law with its source and apply it to a
proposed team split; decide for six given decisions whether they are automated or human and
name the steward; build and run the self-serve registration check (schema, contract,
classification tags) that blocks an unregistered table from becoming discoverable and show it
rejecting a table with a missing tag.

</section>

<section data-section="running-the-registration-gate">

## Running the registration gate

`examples.py` builds a `TableRegistrationGate` that checks a proposed table's schema fields,
contract fields and classification tags against three centrally-defined rule sets, with no
human review in the loop -- exactly the "platform enforces a centrally-written policy
automatically" mechanism this topic's own reveal describes. A table meeting every rule is
admitted outright; a table missing its classification tag is rejected, and the rejection names
the specific missing rule rather than returning a bare refusal, which is what lets a domain
team actually fix the problem instead of guessing at it.

</section>

<section data-section="production">

## Production failures this topic warns about

**Centralizing ownership along with policy.** The Hook's own scenario -- a central team
hand-maintaining a list of every restricted table -- fails not because centralizing is wrong in
general, but because ownership is a fact about who actually understands a given dataset, and
moving that fact to a team that doesn't touch the data daily doesn't make the list any more
accurate.

**Writing policy without a platform that enforces it.** A rule that exists only as a document
is optional in practice: `examples.py`'s own measurement only matters because the registration
gate actually runs against every submission, not because the rule was written down somewhere.

</section>

<section data-section="frontier">

## Frontier

A reverse-Conway team split can itself create new communication gaps at the seams between the
new teams -- exactly the problem Team Topologies (Chapter 19 §19.1, named but not taught here)
addresses with its own framework of team types and interaction modes, a reorganization
question this topic's own two-paragraph summary of Conway's law doesn't attempt to solve.

</section>
