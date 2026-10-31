# OUTLINE: Trade-off articulation and decision records (`de.trade-off-articulation-decision`)

## Learning outcomes
1. Write three ADRs for one design, each with at least three alternatives, costs in common
   units, a decision, and a "what would change our mind".
2. Draw the 10× frame for a design and name the first component that overflows.
3. Run a 45-minute whiteboard session against the clock and say what belongs in each block.
4. Produce a two-page design document (requirements as SLOs, estimate sheet, failure-mode table,
   three ADRs) and have a peer attack it for twenty minutes.

## Engagement arc
- Hook: step 1 (two engineers present the same pipeline; one shows only a diagram and a
  justification by adjective, the other shows three priced alternatives and a named revisit
  trigger; only the second isn't surprised six months later).
- Predict: step 2, within the first four steps (which fields of a record would have made the
  surprise predictable).
- Takeaways: step 4 (a choice with one option considered is not a decision), step 6 (a decision
  record's power is in "what would change our mind", not in the decision itself), step 8 (the
  10× frame finds the next bottleneck before the load does).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** two engineers present the same pipeline; one shows a diagram and says "we used Kafka,
  Flink and Iceberg because they're scalable"; the other shows three alternatives, their costs
  per thousand orders, the one chosen, and a stated revisit trigger. Six months on, the load
  grows and only the second isn't surprised.
- **On screen:** a diagram and an adjective next to three priced alternatives and a trigger.

### 2. Predict
- **fig:** which fields of a record would have made the surprise predictable?
- **Options:** (a) a more detailed architecture diagram, with every component labeled [wrong —
  the first engineer already had a diagram; more detail in the same kind of artifact doesn't
  record a *decision*, only a picture]; (b) the alternatives considered, their costs, and a
  stated observation that would reverse the choice [correct].

### 3. Reveal — three alternatives, including the one you don't like
- **fig:** a decision card with three alternatives (including "do nothing"), each with a decisive
  cost stated in the same units — the chapter's own topics 3 and 5 decision-card pattern reused
  here as the method's own template.
- **Moves:** three cards lay out side by side, one lifting as "chosen", the other two staying
  down but visible.

### 4. Reveal — a choice with one option is not a decision
- **fig:** a single-alternative "decision" (just the diagram and the adjective) next to the
  three-alternative card — only the second one can say why it beat anything.
- **takeaway:** "A choice with one option considered is not a decision."

### 5. Reveal — the ADR's five parts
- **fig:** the chosen card's ADR unfolding to the right: Title, Context (value-neutral forces),
  Decision (active voice), Status (accepted, or superseded by a later ADR), Consequences (every
  effect, not just the favorable ones).
- **Narrator's line of thought:** she treats "stated in full sentences, active voice" as doing
  real work — a decision recorded as a sentence, not a bullet fragment, is one a future reader can
  actually act on.

### 6. Reveal — "what would change our mind" is the record's real power
- **fig:** the chapter's own two extra fields highlighted on the unfolding ADR: the alternatives'
  costs, and a specific, testable observation (a number crossing a threshold, a price change, a
  new SLO) that would reverse the decision.
- **takeaway:** "A decision record's power is in what would change our mind, not in the decision
  itself."

### 7. Reveal — superseded, not edited
- **fig:** a later ADR marked "supersedes ADR 3", with ADR 3 itself left untouched and marked
  superseded — the record of what the team used to believe stays intact, next to what replaced
  it.
- **Narrator's line of thought:** she treats editing a past decision away as destroying the
  evidence a future reader would need to ask "what changed, and when."

### 8. Reveal — the 10× frame finds the next bottleneck first
- **fig:** the same pipeline redrawn with every arrow ten times thicker; the first box that
  overflows lights up and is named — the honest answer to "will this scale."
- **takeaway:** "The 10× frame finds the next bottleneck before the load does."

### 9. Recap
- **fig:** three priced alternatives, an ADR with its two extra fields, the superseded-not-edited
  rule, and the 10× frame — four pieces of the same defending-a-design method, plus the
  45-minute session's own four timed blocks (requirements, high level, deep dives, wrap-up)
  shown as a clock strip.

### 10. Prove it
- **fig:** a candidate runs the 45-minute session but opens with a detailed diagram before
  stating requirements; the clock shows requirements and high level both running late as a
  result.
- **predict options:** (a) the lost time doesn't matter, since the diagram covers requirements
  implicitly anyway [wrong — a diagram is not the same artifact as a stated, priced requirement,
  and the clock shows deep dives and wrap-up both getting squeezed as a direct result]; (b) the
  lost time shows up later in the session, since every block's budget is fixed and an early
  overrun has to come from somewhere [correct].

## Post-notes headings
- **Internals:** none claimed independently — this topic doesn't re-derive the individual method
  steps (topics 1-8), which it uses only as the template's own sections, already taught.
- **Lab:** hosts the §15.1 chapter lab — apply the full method to one of topics 12-25 and produce
  a two-page design document (an estimate sheet, a failure-mode table, three ADRs), then have a
  peer attack it for twenty minutes and record what changed; the template is this topic's own
  `post-notes.md` section.
- **Production:** the hook's own two-engineers scenario as the concrete shape "a diagram isn't a
  decision record" takes in practice.
- **Frontier:** none claimed — ADRs (Nygard, 2011) and the 10× scaling frame are established
  practice, not an emerging technique.
- **Where this goes next:** hands off to requirements gathering (topic 10), since the method so
  far assumed the requirements were already known, and they never are — they live in other
  people's heads.

## Concept ledger
- **Introduces:** `three-alternatives-with-costs`, `adr-with-change-our-mind`,
  `ten-x-next-bottleneck`, `design-session-pacing`.
- **Uses:** `ask-to-slo-translation`, `capacity-estimate-chain` (this chapter, topics 1, 2),
  `data-flow-shape-decision`, `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`
  (this chapter, topics 3-5), `failure-table-blast-radius`, `cost-waterfall-dominant-lever`
  (this chapter, topics 7-8), `data-contract-specification` (Chapter 3).
- **Declared:** none — every id `CHAPTER.md`'s own chapter plan names for this topic is already
  live in `registry.ts`, confirmed via `grep` on `introduces` arrays.

## Changes from the chapter plan
None. Unlike topics 1-8, this topic's entire `uses` list resolves directly against ids already
live in `registry.ts` — all eight ids confirmed live via `grep` on `introduces` arrays before
finalizing, so `declared` stays empty, matching `CHAPTER.md`'s own stated `Declared: none.` No
scope cut — this topic still leaves out the individual method steps, requirements gathering, the
worked designs, and interview-behavioural coaching, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. Large, valueless specification documents go unread and unmaintained; small, modular records
   have a better chance of staying current. — SOURCES.md (Nygard).
2. An ADR's five parts (Title, Context, Decision, Status, Consequences) each have a stated
   purpose, and a reversed decision is marked superseded rather than edited away. — SOURCES.md
   (Nygard).
3. An Architectural Decision Record captures a single architectural decision and its rationale,
   including its trade-offs and consequences. — SOURCES.md (ADR GitHub organization).
4. The three-alternatives-with-costs decision card and the 10× scaling frame are this chapter's
   own established method (per `CHAPTER.md`'s own scope line), not an independent citation.
