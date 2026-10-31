# OUTLINE: Requirements into SLOs (`de.requirements-into-slos`)

## Learning outcomes
1. Turn a vague stakeholder ask into an SLI/SLO/SLA with an indicator, a measurement point, a target, a window and a consequence.
2. Apply the six-dimension checklist (freshness, latency, completeness, correctness, availability, retention) and mark each dimension valued or explicitly "not needed".
3. For one ask, state four different definitions of "correct" and say which system and cost each produces.
4. Reject a requirement that cannot be measured, and say what is missing.

## Engagement arc
- Hook: step 1 (the marketing ask, the 2% mismatch).
- Predict 1: step 2, within the first four steps (what caused the mismatch — latency or completeness).
- Predict 2: step 8 ("make it reliable" — is that already an SLO?).
- Surprising number: the mismatch is not a speed problem at all — "real-time" and "accurate" left completeness and correctness completely unstated, so the two teams built two different systems from one sentence without knowing it.
- Takeaways: step 4 (six-dimension checklist), step 6 ("correct" is a specification, not a feeling), step 8 (an SLO needs all five parts or it is not one).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop's head of marketing wants "real-time, accurate" revenue on the executive dashboard — what did those two words actually specify, and why did two teams who both met them disagree by two percent?
- **On screen:** the requirements ledger, empty, with the ask sitting at the top as a quoted line.
- **Moves:** the ask fades in (`easeOut`), nothing else yet — this step is a question, not an answer.
- **Narrator's line of thought:** she doesn't explain the ask, she interrogates it out loud — "real-time" for whom, "accurate" compared to what — and leaves both open, which is the hook.
- **Caption:** the ask, quoted, with the 2% gap named but not yet explained.

### 2. Predict
- **fig:** which one unstated choice made the two teams' revenue figures differ — how fast the number arrived, or what the number counted?
- **Options:** (a) latency — the streaming job answered slower than finance's batch job [wrong, tempting because "real-time" sounds like a speed word]; (b) completeness — "real-time" quietly meant counting orders that hadn't finished settling yet, and "accurate" never said by when a number must be final [correct].
- **Narrator's line of thought:** she names why (a) is tempting — the word "real-time" is a latency word on its face — then asks what "accurate" was actually silent about.

### 3. Reveal — five questions turn an adjective into a number
- **fig:** the five question chips (for whom, measured where, which percentile, which window, what happens on a miss) landing on "real-time" one at a time, each resolving part of it; the last chip resolves the freshness SLO.
- **Moves:** five chips `Plot`-style landing one per beat, the fifth lighting and the resolved SLO counted onto the ledger.
- **Values:** the resolved SLO from `examples.py` (freshness target in minutes, computed not assumed), stated as a row.
- **Narrator's line of thought:** she walks the five questions as the fixed habit — not "what does real-time mean" in the abstract, but this exact checklist, every time.
- **Caption:** "real-time" resolved into one row of the ledger: an indicator, a target, a window, a consequence.

### 4. Reveal — the six-dimension checklist
- **fig:** the six dimensions (freshness, latency, completeness, correctness, availability, retention) as six rows, each ticking to a value or an explicit "not needed" for the dashboard ask.
- **Moves:** six rows ticking in sequence; the two rows the hook's ask left silent (completeness, correctness) light in focus colour since they are the two the mismatch came from.
- **takeaway:** "A requirement is not done until every one of the six dimensions has a value or an explicit 'not needed' — the two the hook's ask left silent are exactly where the teams disagreed."

### 5. Reveal — "correct" is a specification
- **fig:** the same ask, "daily revenue dashboard", run through four different definitions of correct — exactly-once effect, eventual completeness by T+1, bounded error, at-most-once — each producing a different small pipeline strip with a different cost.
- **Moves:** four pipeline strips appearing one at a time under their definition's label, each with its one decisive cost named beside it (not drawn in depth — this chapter's rule: name the mechanism, don't re-teach it).
- **Values:** the costs are the planning values from `examples.py` (relative, not literal digits in the reel text).

### 6. Reveal — which definition the shop actually needs, and why
- **fig:** of the four, which one the dashboard's actual consequence (a board meeting, not a bill) implies, and what it would cost to get the stricter one anyway.
- **takeaway:** "'Correct' is a specification you choose before building anything, not a feeling you discover afterward — the four definitions are four different systems, not four phrasings of one."

### 7. Reveal — rejecting a requirement that cannot be measured
- **fig:** a second ask, "make it reliable", run through the same five questions and failing at the first one (for whom, measured how) — nothing to tick yet.
- **Moves:** the five question chips from step 3 reappear and all five stay dim — none resolves, because there is no indicator proposed at all.

### 8. Predict
- **fig:** is "make it reliable" already an SLO, once we agree what "reliable" means?
- **Options:** (a) yes, once everyone agrees on a meaning, it's an SLO [wrong, tempting because it feels like just a vocabulary gap]; (b) no — an SLO needs an indicator, a target, a window and a consequence, not just an agreed meaning, and none of those four exist yet [correct].
- **takeaway:** "An SLO is five things together (an indicator, where it's measured, a target, a window, a consequence) — agreeing on a word is none of them."

### 9. Recap
- **fig:** the full ledger for the dashboard ask: the five questions resolved, the six dimensions valued, the chosen definition of correct, and the rejected unmeasurable ask beside it for contrast.

### 10. Prove it
- **fig:** a new ask arrives — "the warehouse must never show a customer someone else's order" — apply the six-dimension checklist and the four-definitions test to it: which dimension does it name directly, and which definition of "correct" does its consequence actually force?
- **predict options:** (a) it's a correctness requirement, and its consequence (a privacy incident, not a wrong total) forces something closer to an exactly-once-effect guarantee on access, not a bounded-error one [correct]; (b) it's an availability requirement, since showing the wrong order looks like downtime from the user's side [wrong, tempting because the user experience is the same "something's broken" feeling].

## Narrator's line of thought (beyond the description, per step)
Throughout, the narrator is an MIT professor walking through *why* each move is forced: why five fixed questions instead of free-form discussion (so two different askers get comparable answers), why six dimensions instead of however many come to mind (so nothing is silently skipped), why four definitions of correct rather than "it depends" (because "it depends" is not a specification an implementer can build from). She never reads the ledger back; she argues for the method that produced it.

## Post-notes headings
- **Internals:** the SRE book's SLI/SLO/SLA vocabulary in full, and why SRE deliberately keeps SLA out of its own job (business/legal, not engineering).
- **Lab:** none of its own (method's lab is topic 9's) — exercise: take a real ask from the reader's own work and run it through the five questions and six dimensions.
- **Production:** the SRE Workbook's critical-user-journey framing, and the "five or fewer SLI types" discipline, as the practiced version of the five-questions habit.
- **Frontier:** none claimed — this is a stable, decades-old practice; the topic does not invent anything new here.
- **Where this goes next:** hands off into capacity estimation (topic 2), which needs the SLOs this topic produces as its inputs (the freshness SLO sets the design rate's floor).

## Examples to execute (`examples.py`)
- `five_questions_to_slo(ask)`: given the shop's dashboard ask, assert the resolved freshness target (a concrete number, computed from a stated reasoning, not invented on screen).
- `six_dimension_checklist(ask)`: assert which of the six dimensions get a value vs "not needed" for the dashboard ask, and that the two silent ones in the hook are completeness and correctness.
- `four_definitions_of_correct(ask)`: assert the four definitions as data (name, guarantee, one named cost) and which one the dashboard's actual consequence selects.
- `reject_unmeasurable(ask)`: assert that "make it reliable" fails the five-questions check (returns which parts are missing).

## Concept ledger
- **Introduces:** `ask-to-slo-translation`, `six-dimension-requirement-checklist`, `correctness-as-specification`.
- **Uses:** `latency-percentiles` (Chapter 1, live). `error-budget-burn-rate`, `schedule-aware-freshness-alert`, `actionable-page-test`, `end-to-end-argument`, `at-least-once-plus-idempotence`, `cap-theorem-formal-statement`, `consistency-model-map` — all named by the chapter plan as Chapter 11/13/14 concepts, **but none of Chapters 11, 13 or 14 has a single live topic in `registry.ts` yet** (confirmed by reading the registry: no `chapter: { number: 11 }`, `13` or `14` entries for `data-engineering` exist). Per `make-topic/SKILL.md` §1 ("Cross-chapter ids... not guessed... if it is not there, puts it in `declared` and logs the gap"), every one of these moves to `declared` for now, with this gap logged here. A seam pass must revisit `uses` once those chapters are built.
- **Declared:** `error-budget-burn-rate`, `schedule-aware-freshness-alert`, `actionable-page-test`, `end-to-end-argument`, `at-least-once-plus-idempotence`, `cap-theorem-formal-statement`, `consistency-model-map` (gap: not yet resolvable against `registry.ts`, see above).

## Changes from the chapter plan
- The chapter plan's `Uses` list names several Chapter 11/13/14 concept ids to look up in `registry.ts`. None of those chapters has any live topic yet (chapters 11 and 13 have no `CHAPTER.md`/folder at all for Chapter 11; Chapter 13 has a folder but 0 live topics; Chapter 14 the same). Moved all of them to `declared` rather than guessing ids, per SKILL.md §1. No scope was cut — only the `uses`/`declared` split moved.

## Bridge / handoff
Taken verbatim from `CHAPTER.md`'s entry 1 (bridge answers Chapter 14's quoted handoff; handoff hands to topic 2's capacity estimation).

## Claims list (for fact-check)
1. SRE book: SLI defined as "a carefully defined quantitative measure of some aspect of the level of service that is provided." — SOURCES.md §1.
2. SRE book: SLO defined with the `SLI ≤ target` / bound structure, worked latency example. — SOURCES.md §1.
3. SRE book: SLA defined, with the "what happens if the SLOs aren't met" test and the common SLA/SLO conflation. — SOURCES.md §1.
4. SRE book: percentiles preferred over the mean because of skew and worst-case visibility (p99/p99.9 vs median). — SOURCES.md §1.
5. SRE book: correctness named as a system-health indicator, and flagged as usually not SRE's own responsibility to meet (a data-correctness property, not an infra one). — SOURCES.md §1.
6. SRE book: "start from what users care about, not what's easy to measure" as the practical order of derivation. — SOURCES.md §1.
7. SRE Workbook: the worksheet method (list user interactions, draw the architecture, group by category) for deriving SLIs for a real system. — SOURCES.md §2.
8. SRE Workbook: "five or fewer" SLI types recommended per critical function. — SOURCES.md §2.
9. SRE Workbook: critical user journeys as the recommended unit to define SLOs around. — SOURCES.md §2.
10. SRE Workbook: a component's reliability ceiling bounds the journey that depends on it. — SOURCES.md §2.
