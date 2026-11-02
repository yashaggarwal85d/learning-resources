# Outline — de.negotiating-data-contracts-slos

## Outcomes (from CHAPTER.md)

State what a data contract specifies and who it binds, cited from a real documented practice;
build three priced SLO tiers for a stated request, each with a measurable freshness/availability
number and a non-goal; name an error budget and assign a specific owner to a stated breach.

## 9-step storyboard (full, ~15 min)

1. **Hook.** A plant-operations stakeholder asks for "real-time dashboards for all plants."
   Engineering ships exactly that, at genuinely real-time freshness, at a cost that quietly
   consumes the entire quarter's infrastructure budget — a request fulfilled to the letter, and
   engineering still gets blamed.
2. **Predict: what went wrong, and what single document would have prevented it.** (Correct:
   nobody ever priced "real-time" against the alternatives, or wrote down who owns it if it
   breaks; a data contract with priced tiers would have forced that conversation before the
   build started, not after the bill arrived.)
3. **Reveal: what a data contract actually is.** An upfront, written set of guarantees about a
   dataset's shape and freshness that a producer makes to a consumer, not a verbal promise or an
   assumption either side quietly carries. No takeaway (reel test's reference step).
4. **Reveal: pricing three tiers on a cost curve.** "Real-time" is not one option; it's the top
   of a curve. The topic builds three concrete, priced tiers for the same request (fast and
   expensive, medium, slow and cheap), each a real choice a consumer can make with eyes open.
   Takeaway.
5. **Reveal: a non-goal is part of the contract too.** Stating plainly what a tier does not
   promise (e.g. "not guaranteed below the five-minute tier during a plant's own shift change")
   is as much a part of the agreement as what it does promise. Takeaway.
6. **Reveal: the error budget.** A quarterly error budget, jointly defined by both sides against
   a stated SLO, turns "how unreliable can this be" from a political argument into one agreed
   number everyone can check. Takeaway.
7. **Reveal: who owns a breach.** An error budget only works if spending it is somebody's
   specific, named responsibility, not a diffuse "the system failed" — the contract names an
   owner for the breach before it happens, not during the incident. Takeaway.
8. **Recap.**
9. **Prove it.** A stakeholder, offered three priced tiers, picks the fastest one without
   reading the non-goals or asking who owns a breach. What's actually missing from this
   negotiation? (Correct: nothing is technically wrong with picking the fast tier — the missing
   piece is that the stakeholder hasn't actually agreed to the contract's other terms yet, only
   to its price, so the negotiation isn't actually finished.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (dbt's own contract definition and breaking-change detection; the SRE book's
own error-budget definition and joint-ownership framing); Lab (the three priced SLO tiers and
their measurable acceptance criteria, built for the shop's own dashboard request); Production
(the hook's letter-perfect-but-wrong delivery, resolved); Frontier (why a non-goal is as load-
bearing as a goal in a contract that will be relied on later); Where this goes next (the chosen
tier still has to be explained to the stakeholder in their own terms).

## Bridge / handoff

Bridge (answers Chapter 18's handoff verbatim): "Every topic in this chapter built one piece of
an honest benchmark: a warmed-up target, a load generator that doesn't lie about its own worst
case, data shaped like real data, and the industry suites that apply all three at scale. None of
that method decides, by itself, when a capstone is actually done, or who outside engineering has
to agree the numbers mean what the team says they mean. This chapter is that half of the job:
writing the requirements and contracts that decide what 'done' even means, and communicating the
trade-off this chapter's own numbers represent to someone who will never read a percentile."

Handoff: "Three priced tiers on a cost curve are a negotiation finished, not a decision made —
someone outside engineering still has to actually pick one, and the next topic is how that choice
gets explained to them in the terms they use to decide, not the terms that built the curve."

## Concept ledger

Introduces: `data-contract`, `slo-tiering`, `error-budget-ownership`, `producer-consumer-negotiation`.
Uses: none (opens the chapter).
Declared: basic familiarity with a service-level agreement as a general idea. Builds on Chapter
11's own SLA/monitoring vocabulary (§11.3–§11.4, not live) and Chapter 3's schema-enforcement
material (§3.4, not live) in prose only.

## Claims list (for FACT-CHECK.md)

1. dbt's own documentation: a data contract is an upfront set of guarantees that define the
   shape of a model's returned dataset; dbt checks a previous project state for breaking changes
   that could impact downstream consumers.
2. Google's SRE book: an error budget is a quarterly, jointly-defined metric tied to a stated
   service level objective (SLO), and it aligns incentives through joint ownership between the
   team providing a service and the team consuming it.
3. (This course) a single vague request ("real-time dashboards") can be fulfilled exactly as
   asked while still being the wrong engineering decision, because the request's own cost and
   trade-offs were never priced or agreed before the build — illustrated through the hook's own
   worked scenario, not a measured claim.
4. (This course) the shop's own dashboard request is restated as three priced SLO tiers, each
   with a measurable freshness number and at least one explicit non-goal — built directly in this
   topic's own lab artifact.
