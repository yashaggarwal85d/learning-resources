# Outline — de.blameless-postmortems-incident-communication

## Outcomes (from CHAPTER.md)

Write a complete, timestamped incident timeline; quantify a simulated incident's impact in data
terms rather than infrastructure metrics; write a blameless post-mortem naming contributing
factors and owned action items, with no individual blamed; state what a live stakeholder update
says that a post-mortem does not.

## 9-step storyboard (full, ~16 min)

1. **Hook.** Two companies suffer the identical stale-data incident. One's post-mortem names and
   disciplines the engineer who pushed the bad config, and the same mistake recurs eight months
   later from someone else. The other's post-mortem names the contributing factors instead, and
   the gap in their own deploy process gets closed for good.
2. **Predict: why one fix held and the other didn't.** (Correct: not luck, and not how smart
   either engineer was — naming a person as the cause closes the investigation at "don't do that
   again"; naming the contributing factors closes it at "the process let that happen," which is
   the only version that actually prevents a repeat.)
3. **Reveal: the timeline.** A real, timestamped timeline for the shop's own simulated incident —
   the medium tier's dashboard going stale for an hour — from first detection to resolution. No
   takeaway (reel test's reference step).
4. **Reveal: impact in data terms.** Not CPU or error rate — a number of stale rows, and a named
   list of plant decisions actually made on them, the terms the plant-operations stakeholder from
   topic 1 can actually judge the incident by. Takeaway.
5. **Reveal: contributing factors, not blame.** Why Etsy's own postmortem process and Google's SRE
   book both look for the conditions that let an incident happen, not the person who triggered it
   — because a person who expects to be blamed won't tell you what really happened. Takeaway.
6. **Reveal: tracked, owned action items.** Every contributing factor gets a specific action item
   with a specific owner and a date, not a vague "we'll be more careful" — the difference between
   a postmortem that changes something and one that just gets filed. Takeaway.
7. **Reveal: the live update isn't the post-mortem.** What gets told to the plant-operations
   stakeholder while the incident is still live (what's broken, what's being done, when to expect
   an update) is a different document from the post-mortem written after — naming Chapter 11's own
   incident-command material for how that live channel is actually staffed. Takeaway.
8. **Recap.**
9. **Prove it.** A post-mortem names "the on-call engineer deployed a bad config" as its only
   contributing factor and closes with one action item: "retrain the engineer." What's missing?
   (Correct: a contributing-factors list of one that is itself a person, with an action item that
   blames rather than fixes — the real question, what let a bad config reach production
   undetected, is never asked, so the same gap is still open for the next person.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the Etsy postmortem practice's own contributing-conditions framing; the SRE
book's own blameless definition and action-item tracking); Lab (the timestamped timeline, the
data-terms impact figure, the blameless post-mortem and its owned action items); Production (the
hook's disciplined-engineer-vs-fixed-process contrast, resolved); Frontier (why a contributing-
factors list of one person is a sign the postmortem didn't go deep enough); Where this goes next
(this closes the course's own technical arc).

## Bridge / handoff

Bridge (answers topic 3's handoff verbatim): "A decision written down and dated is still only
tested the day it breaks. This topic is what happens next: naming the impact in the terms the
chapter already taught, writing it down the way the chapter already taught, without naming a
person to blame for it."

Handoff: "This closes the course's own technical arc: a schema, a query, a model, a pipeline, a
benchmark, and now the contract, the trade-off, the decision and the incident that together decide
whether any of it actually worked for the person who asked for it. What's left (Appendix A and B)
is the assessment bank and career guidance — not reel topics, but the standing exercises this
whole course now has the vocabulary to actually answer."

## Concept ledger

Introduces: `blameless-postmortem-structure`, `impact-in-data-terms`, `contributing-factor-vs-blame`,
`incident-communication-cadence`. Uses: `data-contract`, `error-budget-ownership` (topic 1);
`slo-tiering` (topic 1, as the thing that breached). Declared: none beyond topics 1–3's own
declared knowledge. Builds on Chapter 11's own incident-command material (§11.3, not live) in
prose only.

## Claims list (for FACT-CHECK.md)

1. The originating Etsy postmortem practice (Daniel Schauenberg's own account): the process
   focuses on the conditions and context that influenced decisions and actions, not on the action
   itself as the most prominent thing people point to as the cause.
2. Google's SRE book: writing a postmortem is not punishment but a learning opportunity; a
   blameless postmortem identifies contributing causes without indicting any individual or team,
   assuming everyone involved had good intentions.
3. (This course) a simulated one-hour staleness incident on the medium tier is built with a
   timestamped timeline, a computed count of stale rows, and a named list of affected plant
   decisions — computed directly, not asserted.
4. (This course) a blameless post-mortem for the simulated incident lists multiple contributing
   factors (none of them a named person) with a tracked, owned action item for each, checked
   mechanically in examples.py against a single-person-only post-mortem that fails the same check.
