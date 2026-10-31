# Outline — de.communicating-tradeoffs-decision-makers

## Outcomes (from CHAPTER.md)

Restate a priced SLO tier's own cost in business rather than engineering terms; name the one
dominant cost lever behind a stated price difference; write a one-page, bottom-line-up-front
executive summary and a separate engineering deep dive recommending the same tier, and state what
belongs in each.

## 9-step storyboard (full, ~15 min)

1. **Hook.** Two documents recommend the exact same decision — the medium freshness tier — to two
   different audiences. The one-page version gets the budget approved in a five-minute meeting.
   The twelve-page version, sent to the same meeting by mistake, gets the decision tabled for two
   weeks.
2. **Predict: why did the same recommendation land so differently.** (Correct: not the decision
   itself, and not the facts behind it — the length and shape of the document decided whether the
   room could act on it in the time it had.)
3. **Reveal: cost in the terms a decision-maker weighs.** The same three tiers from the last topic,
   restated in dollars and in the risk of a wrong number reaching a plant manager — not in the
   compute, storage and pipeline terms that built them. No takeaway (reel test's reference step).
4. **Reveal: the one dominant cost lever.** Of everything that makes the fast tier expensive, one
   factor (how often the whole thing recomputes) drives most of the difference — named explicitly,
   not buried in a list of five equally-weighted factors. Takeaway.
5. **Reveal: justifying the boring choice.** The medium tier isn't the fastest option, and that's
   exactly the argument for recommending it — stated and defended in terms a non-engineer weighs
   (cost, risk) rather than assumed as an engineering instinct nobody has to explain. Takeaway.
6. **Reveal: bottom-line-up-front vs. the deep dive.** A real, documented practice: write the
   conclusion first, in one page, for the room that has five minutes — and a separate, much longer
   document for the review that actually has to check the reasoning. Takeaway.
7. **Reveal: what belongs in each document.** The one-pager carries the recommendation, the cost,
   and the one dominant lever; the deep dive carries the three tiers' full comparison, the
   non-goals, and the error-budget math — the same decision, two documents, neither one lying by
   omission to its own audience. Takeaway.
8. **Recap.**
9. **Prove it.** A stakeholder reads only the one-pager's bottom line and skips straight to
   approving the fast tier, since faster sounds strictly better. What's missing from the one-pager
   itself that would have stopped that? (Correct: not more length — the one-pager still has to
   name the dominant cost lever and the recommended tier's own justification, or a reader who
   stops at the first number will approve the wrong one.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (Amazon's own six-page-narrative practice, cited for the bottom-line-up-front
vs. deep-dive split; this topic's own one-page/deep-dive split as the worked, disclosed,
classroom-scale example); Lab (the one-page executive summary and the cost-per-tier comparison for
the shop's own chosen tier); Production (the hook's same-decision-different-document failure,
resolved); Frontier (why naming the dominant lever matters more than listing every contributing
factor); Where this goes next (the decision still has to survive the person who made it leaving
the room).

## Bridge / handoff

Bridge (answers topic 1's handoff verbatim): "Three priced tiers on a cost curve are a negotiation
finished, not a decision made — someone outside engineering still has to actually pick one, and
this topic is how that choice gets explained to them in the terms they use to decide, not the
terms that built the curve."

Handoff: "A tier gets chosen, and the one-page summary that got it chosen is read once and then
forgotten the moment the meeting ends. The decision itself — which tier, why, and what would
change the team's mind later — still has to survive the person who made it leaving the room, which
is the next topic's own subject."

## Concept ledger

Introduces: `cost-per-freshness-tier`, `dominant-cost-lever`, `executive-summary-vs-deep-dive`.
Uses: `slo-tiering`, `data-contract` (topic 1). Declared: none beyond topic 1's own declared
knowledge.

## Claims list (for FACT-CHECK.md)

1. Amazon's own 2017 letter to shareholders: Amazon does not use slide-oriented presentations;
   instead it writes narratively structured six-page memos, and a meeting opens with everyone
   silently reading one of them before discussion starts.
2. (This course) the shop's own three priced tiers (built in topic 1) are restated in business
   terms — dollars per day and the risk of a wrong number reaching a plant manager — rather than
   the compute/storage/pipeline terms that built them, computed directly from topic 1's own cost
   model, not re-derived or invented.
3. (This course) of the cost difference between the fast tier and the other two, one factor (the
   recompute frequency, amplified further by the streaming surcharge) accounts for most of the gap
   — shown as a computed share of the total difference, not asserted.
4. (This course) a one-page executive summary and a separate engineering deep dive are both
   written for the identical recommended tier, each checked against a stated word/length ceiling
   and a stated list of what it must include, so the two documents differ in length and audience,
   never in which tier they recommend.
