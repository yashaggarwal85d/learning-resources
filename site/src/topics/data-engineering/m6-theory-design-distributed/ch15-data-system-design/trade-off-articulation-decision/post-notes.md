<section data-section="outcomes">

## Outcomes

Every topic so far produced one piece of a design. This topic is the skill of defending them. A
decision card holds at least three alternatives, each with a decisive cost in the same units,
including "do nothing" — a choice with one option considered is not a decision. An ADR's five
parts (Title, Context, Decision, Status, Consequences) record a decision in a form a future reader
can act on, with two extra fields: the alternatives' own costs, and a specific, testable
observation that would reverse the decision — the record's real power sits there, not in the
decision itself. A reversed decision is marked superseded, never edited away, so what the team
used to believe stays visible alongside what replaced it. The 10× frame redraws a pipeline with
every arrow ten times thicker and finds the first component to overflow — the honest answer to
"will this scale." A forty-five-minute whiteboard session runs against a fixed budget, so time
lost early to an unstated requirement shows up as a squeeze later, usually in the deep dives.

</section>

<section data-section="internals">

## Internals

None claimed independently here. This topic doesn't re-derive the individual method steps
(topics 1-8) — it uses them only as the template's own sections, already taught in their own
right.

</section>

<section data-section="lab">

## Lab

Hosts the chapter's own §15.1 lab: apply the full method to one of topics 12-25 and produce a
two-page design document (an estimate sheet, a failure-mode table, three ADRs), then have a peer
attack it for twenty minutes and record what changed. This topic's own `examples.py` is the
method's own lab: `decision_card()` rejects fewer than three alternatives and picks the cheapest
feasible one; `supersede()` marks an old ADR superseded rather than editing it; `ten_x_frame()`
finds the first component to overflow; `session_budget_after_overrun()` shows a fixed time
budget forcing an early overrun out of a later block.

</section>

<section data-section="production">

## Production failures this topic warns about

**A diagram presented as a decision.** The hook is this failure exactly: a diagram and an
adjective look like a design decision but carry none of what a decision record needs — the
alternatives considered, their costs, and what would reverse the choice. Six months later, only
the team with the real record isn't surprised.

**Editing a reversed decision instead of superseding it.** Erasing a past decision when it's
reversed destroys the evidence a future reader needs to understand what the team used to believe
and why it changed — the fix is marking it superseded and keeping it in the record.

</section>

<section data-section="frontier">

## Frontier

None claimed. Architecture decision records (Nygard, 2011) and the 10× scaling frame are
established practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The method so far assumed the requirements were already known. They never are. They live in
other people's heads, and the right questions decide how good the design can be. The next topic
is where that starts: asking the source of the data what it really sends.

</section>
