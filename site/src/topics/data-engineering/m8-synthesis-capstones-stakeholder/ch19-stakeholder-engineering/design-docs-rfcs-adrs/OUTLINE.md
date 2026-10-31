# Outline — de.design-docs-rfcs-adrs

## Outcomes (from CHAPTER.md)

Write a complete design doc (all five syllabus-named sections) for a stated request; name what
cross-team RFC review adds over a single-team design doc; write a Nygard-style four-part ADR for a
stated decision; state the superseded-not-deleted convention and why it matters for a later
reader.

## 9-step storyboard (full, ~16 min)

1. **Hook.** Six months after the medium tier was chosen, a new engineer asks "why didn't we just
   pick the fast tier," and nobody in the room was there for the original decision. The only thing
   that answers the question is a document, not a person's memory.
2. **Predict: what would have survived everyone leaving the room.** (Correct: not a slide deck or
   a meeting note — a design doc written before the decision, and a dated ADR recording it, are
   the two documents built specifically to survive the people who wrote them leaving.)
3. **Reveal: the design doc's five sections.** Context, goals and non-goals, alternatives,
   estimates, risks — a real, documented structure, filled in for the shop's own dashboard
   request. No takeaway (reel test's reference step).
4. **Reveal: a non-goal is not a negated goal.** "ACID compliance" as a non-goal doesn't mean "the
   system must not be ACID compliant" — it means the team chose, on purpose, not to make it a
   goal, leaving room to get it anyway if it comes free. Takeaway.
5. **Reveal: what cross-team RFC review adds.** A design doc read by one team can still miss a
   consequence another team would catch; an RFC adds a time-boxed, widely advertised review
   period where every affected team has to sign off before the decision is final. Takeaway.
6. **Reveal: the Nygard-style ADR.** Four parts — context, decision, status, consequences — one
   ADR for the shop's own chosen tier, written as a conversation with a future developer who
   wasn't in the room. Takeaway.
7. **Reveal: superseded, not deleted.** When a later decision reverses an earlier one, the old ADR
   stays in the repository with its status changed to "superseded by," not deleted — the record
   of what the team believed, and why, at the time. Takeaway.
8. **Recap.**
9. **Prove it.** A team deletes an old ADR after a decision changes, reasoning that the old
   decision is now wrong and shouldn't confuse anyone. What's lost by deleting it instead of
   marking it superseded? (Correct: the record that the old decision was reasonable given what was
   known then — without it, the next person who hits the same trade-off has no way to tell
   whether it was already tried and rejected, or never considered at all.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (Nygard's own four-part ADR format and superseded convention; Google's own
design-doc structure and non-goal distinction; the Rust RFC process's own final comment period);
Lab (the design doc and the ADR recording the shop's own chosen tier); Production (the hook's
no-one-remembers-why failure, resolved); Frontier (why a superseded ADR is worth more than a
deleted one); Where this goes next (a decision written down is only tested the day it breaks).

## Bridge / handoff

Bridge (answers topic 2's handoff verbatim): "A tier gets chosen, and the one-page summary that
got it chosen is read once and then forgotten the moment the meeting ends. The decision itself —
which tier, why, and what would change the team's mind later — still has to survive the person who
made it leaving the room, which is this topic's own subject."

Handoff: "A decision written down and dated is still only tested the day it breaks. The last topic
in this chapter, and this course, is what happens next: naming the impact in the terms topic 2
taught, writing it down the way this topic taught, without naming a person to blame for it."

## Concept ledger

Introduces: `design-doc-structure`, `cross-team-rfc-review`, `adr-context-decision-consequences`,
`superseded-decision-marking`. Uses: `slo-tiering`, `cost-per-freshness-tier`,
`dominant-cost-lever` (topics 1–2). Declared: none beyond topics 1–2's own declared knowledge.

## Claims list (for FACT-CHECK.md)

1. Michael Nygard's 2011 blog post: an ADR has four parts (title aside) — context, decision,
   status, consequences; a decision may be "proposed" or "accepted"; a reversed decision is marked
   "superseded" rather than deleted, and all consequences (positive, negative, neutral) are listed.
2. Google's own design-doc practice (Malte Ubl's account): a design doc's sections include context
   and scope, goals and non-goals, the design itself, and alternatives considered; a non-goal is
   not a negated goal but something deliberately excluded from the goal list.
3. The Rust RFC process's own README: the process exists so all stakeholders can be confident about
   a project's direction; the final comment period lasts ten calendar days and every relevant
   sub-team member must sign off before it starts.
4. (This course) the shop's own design doc adds "estimates" and "risks" sections beyond the cited
   source's own named sections, disclosed explicitly as this course's own addition rather than
   attributed to Google's own practice.
5. (This course) the shop's own worked ADR and design doc are built for the medium-tier decision
   from topics 1–2, checked in examples.py to contain each of their own required sections.
