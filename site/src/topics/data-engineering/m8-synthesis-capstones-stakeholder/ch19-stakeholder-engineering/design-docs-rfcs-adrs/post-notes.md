<section data-section="outcomes">

## Outcomes

Write a complete design doc (all five syllabus-named sections) for a stated request; name what
cross-team RFC review adds over a single-team design doc; write a Nygard-style four-part ADR for a
stated decision; state the superseded-not-deleted convention and why it matters for a later
reader.

</section>

<section data-section="internals">

## Internals

Michael Nygard's 2011 post states the ADR format directly: "We will use a format with just a few
parts, so each document is easy to digest" — context, decision, status, consequences — and its
own superseded convention: "If a later ADR changes or reverses a decision, it may be marked as
'deprecated' or 'superseded' with a reference to its replacement." Malte Ubl's account of Google's
own design-doc practice states the non-goal distinction directly: "non-goals aren't negated goals
like 'The system shouldn't crash,' but rather things that could reasonably be goals, but are
explicitly chosen not to be goals." That source's own sections don't include "estimates" or
"risks" by name; this topic's own worked design doc adds those two sections itself, disclosed as
this course's own addition in FACT-CHECK.md. The Rust RFC process's own README states what a
cross-team review adds: "Before actually entering FCP, all members of the subteam must sign off,"
with the comment period itself lasting "ten calendar days."

</section>

<section data-section="lab">

## Lab

A written artifact, not a measured number: this chapter has no system under test (see
CHAPTER.md's own "Engine of record" note). `examples.py` builds a design doc checked
structurally against its own five required sections, a Nygard-style four-part ADR for the
medium-tier decision from topics 1 and 2, and a second ADR that reverses the first — checking
mechanically that the first ADR's own status changes to "superseded by" rather than being removed
from the record.

</section>

<section data-section="production">

## Production failures this topic warns about

**A decision that only lives in the memory of the people who made it.** The hook's own failure is
not a bad decision; the medium tier may well have been the right call. The failure is that six
months later, nothing written down can say why.

**Deleting a superseded decision instead of marking it.** The Prove It step's own scenario checks
this directly: deleting an old ADR removes not just a wrong answer, but the evidence that the
question was ever asked and considered.

</section>

<section data-section="frontier">

## Frontier

A non-goal is easy to read as a limitation, something the design can't do. It's the opposite: a
non-goal is a choice the team made on purpose, which is exactly what makes "ACID compliance" as a
non-goal different from "the system must not be ACID compliant" as a rule.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A decision written down and dated is still only tested the day it breaks. The last topic in this
chapter, and this course, is what happens next: naming the impact in the terms this chapter
already taught, writing it down the way this topic already taught, without naming a person to
blame for it.

</section>
