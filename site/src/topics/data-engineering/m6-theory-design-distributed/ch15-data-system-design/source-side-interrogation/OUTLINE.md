# OUTLINE: Source-side interrogation (`de.source-side-interrogation`)

## Learning outcomes
1. Run a fifteen-question source interview and record each answer as a measurement or an
   explicit unknown.
2. Turn the answers into inputs for the estimate (rate, peak, growth), the shape decision (push
   or pull), and the correctness plan (late, duplicate, lost).
3. List the three answers that most change a design.
4. Recognise the question that exposes a hidden constraint (a quota, a residency rule).

## Engagement arc
- Hook: step 1 (a payments partner whose events "arrive in real time"; three weeks after launch
  the pipeline double-counts revenue on retries, drops events during maintenance, breaks on an
  unannounced field rename).
- Predict: step 2, within the first four steps (which five questions would each have prevented
  one of the three failures, and which one the partner would have been unable to answer).
- Takeaways: step 4 (a measurement beats an adjective), step 6 (a resend without an id is a
  duplicate waiting to happen), step 8 (a quota is a hidden ceiling until someone asks for the
  number).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a payments partner box labeled "events arrive in real time"; three weeks later three
  cracks appear: double-counted revenue on retry, dropped events during the partner's hourly
  maintenance window, a broken pipeline after the partner renames a field with a day's notice.
- **On screen:** "real time" next to three cracks, each dated.

### 2. Predict
- **fig:** which five questions, asked in the first meeting, would each have prevented one
  crack — and which one would the partner not have been able to answer?
- **Options:** (a) ask for a more detailed architecture diagram of the partner's system [wrong —
  a diagram doesn't say whether they resend, what they do when down, or who owns the schema];
  (b) ask whether they resend, what happens when they're down, and who owns the schema and
  gives notice [correct].

### 3. Reveal — the source box and its question cards
- **fig:** a source box on the left, a stack of question cards on the right; each card flips to
  show the design decision its answer changes ("do you ever resend?" lands on the dedup box,
  "what happens when you're down?" on the buffer, "who owns the schema?" on the contract).
- **Moves:** cards flip one at a time, each landing on the box it feeds.

### 4. Reveal — a measurement beats an adjective
- **fig:** "real time" crossed out, replaced by "p99 event delay 40 seconds, measured over the
  last quarter" — the answers panel contrasting an adjective with a number.
- **takeaway:** "A measurement beats an adjective, every time one is available."

### 5. Reveal — origin, format, schema ownership and evolution
- **fig:** who owns the data and the right to change it; the format it arrives in; a contract's
  own stated `status` and `version` fields answering "how much notice do I get."
- **Narrator's line of thought:** she treats a contract that states its own version and status
  as doing real work — a source that can't say what version it's on can't say when it changed,
  either.

### 6. Reveal — delivery reliability: late, duplicate, lost, resent
- **fig:** the four facts the design plans for (late, duplicate, lost, corrupted), plus the
  resend card landing on the dedup box: an event ID beats a timestamp, because two events can
  share a timestamp and a resend doesn't carry a new one.
- **takeaway:** "A resend without an event ID to key on is a duplicate waiting to happen."

### 7. Reveal — volume, rate, protocol, auth, quotas
- **fig:** the estimate's own inputs (average rate, peak, the shape of the yearly curve, the
  burst that caused the partner's last incident) and the connection facts (protocol, auth, rate
  limit) landing on the capacity-estimate and resilient-client boxes.
- **Narrator's line of thought:** she treats "how fast has the volume grown" as the question
  that catches an estimate before it's six months stale.

### 8. Reveal — the question that exposes a hidden constraint
- **fig:** a quota card flips over red — the partner can't answer "what's our daily cap" — next
  to a residency card, also red, for "where must this data stay."
- **takeaway:** "A quota is a hidden ceiling until someone asks for the number."

### 9. Recap
- **fig:** the source box, its flipped question cards landing on the dedup box, the buffer, the
  contract, the estimate, and the resilient client, plus the answers panel's adjective-versus-
  measurement contrast.

### 10. Prove it
- **fig:** a new source interview for a different partner; two of the fifteen questions come
  back red (unanswerable), and the design has to plan for both as explicit unknowns rather than
  assumptions.
- **predict options:** (a) proceed with the design as if the unanswered questions don't apply,
  since the partner didn't raise them [wrong — an unanswered question is an unknown, not a
  guarantee of "never happens," and the design has to plan for it anyway]; (b) record both as
  explicit unknowns and design for the worst case the question was asking about [correct].

## Post-notes headings
- **Internals:** none claimed independently — the design method's own answers to these questions
  (topics 1-9) are already taught; this topic teaches only the questions and what each answer
  feeds.
- **Lab:** none of its own as a syllabus lab leg (the interview lab is topic 11's); the source
  checklist applied to the shop's payments partner is this topic's worked example, with the five
  highest-impact answers computed into estimate changes.
- **Production:** the hook's own payments-partner scenario as the concrete shape "asking the
  wrong five questions" takes in practice.
- **Frontier:** none claimed — a source interview and measurement-over-adjective are established
  practice, not an emerging technique.
- **Where this goes next:** hands off to the destination side (topic 11) — the consumer
  interview, which most changes the design: who reads it, how fresh, how often, how big a query,
  who may see which part.

## Concept ledger
- **Introduces:** `source-interrogation-checklist`, `answers-as-measurements-not-adjectives`,
  `connector-growth-cost`.
- **Uses:** `ask-to-slo-translation`, `six-dimension-requirement-checklist`,
  `capacity-estimate-chain` (this chapter, topics 1, 2), `push-pull-source-boundary`,
  `replay-backfill-as-first-class-path` (this chapter, topics 3, 6), `data-contract-specification`
  (Chapter 3), `open-data-contract-standard` (Chapter 3's data-contracts topic), `resilient-client-
  patterns` (Chapter 4).
- **Declared:** `sensitivity-tier-and-category`, `openlineage-run-job-dataset-events` (Chapter
  13, not yet live), plus `ingestion-pull-connector-patterns` and `cdc-log-based-capture`
  (Chapter 8 §8.1/§8.2, not yet planned or built) and `eu-regulatory-residency-architecture`
  (Chapter 10 §10.5, not yet planned or built) as placeholder ids for the gaps `CHAPTER.md`
  names but `registry.ts` can't yet resolve.

## Changes from the chapter plan
`CHAPTER.md` names `sensitivity-tier-and-category` and `openlineage-run-job-dataset-events`
(Chapter 13) and asks this topic to "look up their `introduces` ids in `registry.ts`" for
Chapter 8 §8.1/§8.2 and Chapter 10 §10.5. Confirmed via `grep` on `introduces` arrays: neither
Chapter 13 id is live, and Chapter 8 and Chapter 10 are themselves unplanned (no `CHAPTER.md`,
no topics built), so none of their ids exist anywhere in `registry.ts` yet. All five move to
`declared`, with placeholder ids chosen for the Chapter 8/10 material and logged here so a later
topic that plans those chapters can reconcile the names. No scope cut — this topic still leaves
out the design method's own answers (topics 1-9), destination-side questions (topic 11), and
ingestion/CDC/contract/classification mechanics themselves, per `CHAPTER.md`'s own "Leaves out"
line.

## Claims list (for fact-check)
1. A data contract can state keys and values in a structured document, per the Open Data
   Contract Standard. — SOURCES.md (ODCS overview).
2. A data contract's own `status` and `version` fields give a checkable answer to how much
   notice a consumer gets before a source changes. — SOURCES.md (ODCS fundamentals).
3. Stripe's webhook delivery doesn't guarantee event order, can deliver the same event more than
   once, and names event ID (not timestamp) as the field to dedup on. — SOURCES.md (Stripe
   webhooks).
4. Stripe retries failed webhook deliveries for up to three days with exponential backoff in
   live mode. — SOURCES.md (Stripe webhooks).
5. The fifteen-question source checklist and the "measurement beats adjective" framing are this
   chapter's own established method (per `CHAPTER.md`'s own scope line), not an independent
   citation.
