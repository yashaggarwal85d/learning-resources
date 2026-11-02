# Fact-check — de.e-commerce-warehouse-incremental

## Claims re-derived against the source

1. **Without a stated unique key, an incremental load degrades to append-only, producing
   duplicates on any re-run or resend.** SOURCES.md's first dbt quote supports this directly.
   Checked step 6's "silently becomes a duplicate" claim matches dbt's own stated default
   behavior exactly, without claiming this is universal across every incremental tool — it's
   presented as dbt's own documented default, used as the worked mechanism.

2. **A stated unique key lets a changed row replace its old version in a merge instead of
   appending a duplicate.** SOURCES.md's second dbt quote supports this directly. Checked step 6
   doesn't overclaim the exact update mechanics (dbt's own text notes these vary by database and
   strategy) — the claim stays at the level the quote actually supports: a unique key changes
   the outcome from append to replace.

3. **`MERGE` can delete rows, but only when the statement includes a clause that asks for it.**
   SOURCES.md's first PostgreSQL quote supports this directly. Checked step 4's
   deleted-source-row reveal doesn't claim incremental extracts are incapable of handling
   deletes in principle — only that a plain incremental extract, built to pull changed-or-new
   rows, never emits the signal a delete clause needs, which is the gap the hazard actually
   names.

4. **`WHEN NOT MATCHED BY SOURCE` detects a target row with no matching source row.**
   SOURCES.md's second PostgreSQL quote supports this directly. Checked step 4's "guard" framing
   names this exact clause as the mechanism, not an invented alternative.

5. **The grain-first model, the three-alternative decision card, and the full-versus-incremental
   crossover are this chapter's own established method.** Not an independent citation —
   `CHAPTER.md`'s own scope line states this directly, and Chapter 3's own grain-first topic is
   the in-course anchor, not re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("incremental loads are simply slower under heavy
  write load") is a genuine, plausible-sounding first guess — performance degradation is a real
  failure mode elsewhere in this chapter (topic 7's failure table) — but it produces staleness,
  not a permanent count gap, which rules it out once the hook's own symptom (short by a fixed
  count, not catching up) is checked. The correct option follows directly from the
  deleted-source-row mechanism this topic's own reveal establishes.
- **Predict 2 (step 10, "Prove it"):** checked that "which side of the crossover this table is
  on now" genuinely depends on the table's own current size and change rate, not on a feeling
  about which approach "has failed" — this follows directly from the crossover formula this
  topic's own `examples.py` computes, not a new citation.

## Illustrative numbers (figs for steps 1, 8, 10)

The hook's nine-hour rebuild time, the exact order-count shortfall, the crossover chart's
specific table sizes, and the second warehouse's exact overrun are illustrative, stated lab
numbers for the storyboard, not cited real-world figures — no claim is made about any specific
company's actual warehouse rebuild time or incident history.

## Outcome

No open findings. Every claim about unique keys or merge behavior traces to one of SOURCES.md's
four verbatim quotes across two sources (dbt, PostgreSQL); the grain-first method and the
crossover computation rest on `CHAPTER.md`'s own stated scope and Chapter 3's own prior topic,
not an unsourced factual claim; both predicts are checked against the chapter's own established
mechanisms rather than invented reasoning.
