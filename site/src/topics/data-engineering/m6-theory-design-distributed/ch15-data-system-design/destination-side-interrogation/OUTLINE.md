# OUTLINE: Destination-side interrogation (`de.destination-side-interrogation`)

## Learning outcomes
1. Run a fifteen-minute requirements interview for a vague prompt and write down the five
   answers that most change the design.
2. Show the two designs those answers lead to (for "real-time dashboards for the plants," a
   fifteen-minute-refresh aggregate versus a sub-second operator display).
3. List every consumer of one dataset and the serving store each implies.
4. Recognise the answer that is a bet, not a fact, and mark it.

## Engagement arc
- Hook: step 1 (the plant operations lead says "we want real-time dashboards for the plants";
  one engineer builds a streaming sub-second display, another a fifteen-minute aggregate; both
  read the sentence faithfully).
- Predict: step 2, within the first four steps (which five questions, and what did the lead say
  about what they do the moment they see a number).
- Takeaways: step 4 (one dataset, several consumers, each with its own serving store), step 6
  (a bet is not a fact, and the design has to mark which answers are which), step 8 (an export
  path is a design input, not an afterthought).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the plant lead's sentence "we want real-time dashboards for the plants" above two
  pipelines: a sub-second operator display and a fifteen-minute refresh aggregate, both built
  from the same six words.
- **On screen:** one sentence, two pipelines, both faithful readings.

### 2. Predict
- **fig:** which five questions, asked in fifteen minutes, would have picked one design for the
  right reasons — and what does the lead do the moment they see a number?
- **Options:** (a) ask for more detail on what "real-time" means technically [wrong — the lead
  isn't an engineer and doesn't have a technical definition in mind; the question that actually
  forks the design is what they *do* with the number]; (b) ask what the lead does the instant
  they see the number on screen [correct].

### 3. Reveal — list every consumer, not just the one who asked
- **fig:** a consumer box for the plant lead flips to reveal three more consumers of the same
  data — a quality report, a maintenance model, a monthly compliance filing — each needing a
  different serving store.
- **Moves:** one box splits into four, each landing on its own store.

### 4. Reveal — one dataset, several consumers, several stores
- **fig:** the four consumers side by side with their own freshness, query frequency, and scan
  size, each implying a different serving-store choice.
- **takeaway:** "One dataset can have several consumers, and each one can need its own serving store."

### 5. Reveal — the sharp question: what do you do the moment you see it
- **fig:** the plant lead's own answer ("I walk the floor if the number crosses a line") makes
  the actual freshness need concrete — not "real time," but "before the next floor walk."
- **Narrator's line of thought:** she treats this question as doing real work — it turns a vague
  freshness demand into the one number that actually matters operationally.

### 6. Reveal — a bet is not a fact
- **fig:** five answer cards, four green (measured or stated directly by the lead) and one
  amber, marked "bet" — a guess about where the plant's tenant count goes next year.
- **takeaway:** "A bet is not a fact, and the design has to mark which answers are which."

### 7. Reveal — grain, concurrency, retention
- **fig:** the level of detail each consumer needs (per-machine, per-line, per-shift), how many
  concurrent viewers at the Monday-morning report run, and how far back the compliance filing
  needs to reprocess.
- **Narrator's line of thought:** she treats asking for the grain *before* building the model as
  the question that avoids rebuilding it when the first dashboard needs one level finer.

### 8. Reveal — export paths are a design input
- **fig:** a CSV download and a BI extract both flip red, because each one bypasses whatever
  access policy the engine itself enforces.
- **takeaway:** "An export path is a design input, not an afterthought — it bypasses whatever policy the engine enforces."

### 9. Recap
- **fig:** the four consumers and their stores, the sharp question's answer, the bet marked
  amber, grain and concurrency and retention, and the two export paths flagged red.

### 10. Prove it
- **fig:** a second vague prompt — "we want a single view of the customer" — and the five
  questions a candidate would ask to fork it into a real design.
- **predict options:** (a) start building the single view immediately, since the prompt already
  names the deliverable [wrong — "a single view" is exactly as vague as "real-time dashboards,"
  and skips every one of the same five questions]; (b) run the same five-question interview
  before building anything, since the prompt alone doesn't say who reads the view, how fresh, or
  what they do with it [correct].

## Post-notes headings
- **Internals:** none claimed independently — the design method's own answers (topics 1-9) and
  the source-side interview (topic 10) are already taught; this topic teaches only the
  destination-side questions and what each answer forks.
- **Lab:** hosts the §15.2 chapter lab — role-play a fifteen-minute requirements interview for
  "we want real-time dashboards for the plants," write down the five answers that most change
  the design, and show the two designs they lead to (the chosen one is built in topic 24);
  topic 10's source questions are included in the interview.
- **Production:** the hook's own two-pipelines-from-one-sentence scenario as the concrete shape
  "a vague prompt reads two faithful ways" takes in practice.
- **Frontier:** none claimed — a destination interview and critical-user-journey framing are
  established practice, not an emerging technique.
- **Where this goes next:** with the method and the questions in hand, the rest of the chapter
  runs them on real problems, one decision at a time; the first is clickstream and ad-click
  analytics at billions of events a day.

## Concept ledger
- **Introduces:** `destination-interrogation-checklist`, `five-answers-that-change-the-design`,
  `export-paths-as-design-input`.
- **Uses:** `source-interrogation-checklist`, `answers-as-measurements-not-adjectives` (this
  chapter, topic 10), `ask-to-slo-translation`, `six-dimension-requirement-checklist` (topic 1),
  `serving-store-by-query-shape`, `layout-from-dominant-access-path` (topics 3-4),
  `tiering-retention-designed-up-front`, `fact-grain` (Chapter 3's modelling topics).
- **Declared:** `abac-tag-based-policy`, `engine-enforced-row-column-security`,
  `policy-bypass-paths`, `schedule-aware-freshness-alert` (Chapter 13's access-control topics —
  CHAPTER.md's own `uses` list names them, but Chapter 13 is itself unplanned, confirmed via
  `grep` on `introduces` arrays across `registry.ts`).

## Changes from the chapter plan
`CHAPTER.md` names four Chapter 13 ids for `uses` (`abac-tag-based-policy`,
`engine-enforced-row-column-security`, `policy-bypass-paths`, `schedule-aware-freshness-alert`)
and states `Declared: none`. Confirmed via `grep` on `introduces` arrays: none of the four are
live, because Chapter 13 is itself unplanned (no topics in `registry.ts`). All four move to
`declared`, logged here rather than silently dropped, so a later topic that plans Chapter 13 can
reconcile them. No scope cut — this topic still leaves out source-side questions (topic 10), the
design method's own answers (topics 1-9), and the access-control mechanisms themselves (Chapter
13), per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. The same service's stated guarantees fit one consumer's use case and not another's — a
   photo-sharing site and an archival records system want opposite trade-offs from the same
   service. — SOURCES.md (SRE book).
2. Freshness is defined against a stated time threshold, and best measured weighted by actual
   user access, not just record count. — SOURCES.md (SRE workbook).
3. A critical user journey — a sequence of tasks core to one user's experience — is the unit an
   interview should organize its questions around, not a component in isolation. — SOURCES.md
   (SRE workbook).
4. The fifteen-minute destination interview and the "what do you do the moment you see it"
   question are this chapter's own established method (per `CHAPTER.md`'s own scope line), not
   an independent citation.
