# Outline — Resizing and incremental rehashing

## Learning outcomes

1. State that a hash table's resize is the same amortized argument as a growable array's, applied to rehashing instead of copying.
2. Explain Redis `dict`'s incremental-migration design and why it trades peak memory for a smoother per-operation latency than doubling-and-rehash-all-at-once.
3. Say what changes about a hash table's behaviour under sustained memory pressure.

## Engagement arc

- **Hook (step 1):** every scheme in this chapter so far has worked inside a table of fixed size; none has said what happens when it fills up.
- **Predict (step 3):** "the one insert that triggers a from-scratch rehash of the whole table — how long does it take, next to a normal insert?"
- **Predict (step 5):** "Redis's own hash table migrates keys from the old table to the new one. Who does that work — a background thread, or something else?"
- **Surprising number:** doubling's one rehashing insert costs proportional to the *whole table*, while every incremental-migration insert costs the same small, bounded amount — measured directly.
- **Takeaways:** steps 2, 6, 7 (three).
- **Recap (step 8, "Prove it"):** both strategies insert the same final key count; one pays in one long pause, the other in many short ones.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** the three tables built so far (chaining, open addressing, Swiss Tables), each capped at a fixed-size array, with one more key arriving that doesn't fit.
- **Caption:** every scheme in this chapter has worked inside a table of fixed size. None of them has said what happens when that table fills up.
- **Narrator's line of thought:** "this isn't a new collision scheme — it's the one question all three previous topics quietly deferred."

### 2 — DoublingCost
- **fig:** `DoublingCost`
- **Visual idea:** a table at capacity, one more insert arriving, the whole array doubling in size with every existing entry rehashed into new slots in one single sweep.
- **Caption:** the simplest answer: when the table's full, allocate a table twice the size and rehash every entry into it, all at once.
- **Takeaway:** "Doubling pays for the whole rehash in one insert, proportional to the table's current size."
- **Narrator's line of thought:** "this is the exact same move a growable array makes when it runs out of room — just rehashing instead of copying."

### 3 — LatencyPredict (predict)
- **fig:** `LatencyPredict`
- **Visual idea:** a row of ordinary inserts, one highlighted insert where the doubling rehash actually happens, asking how its cost compares to its neighbors.
- **Predict options:**
  1. "About the same as any other insert"
  2. "A bit slower, but still roughly constant"
  3. **"Proportional to the whole table's current size — far slower than its neighbors"** (correct)
  4. "It depends only on how many collisions that one key has"
- **Explain:** that one insert has to rehash every existing entry into the new table before it can finish, so its cost scales with n, the table's current size — a single long pause, buried inside an otherwise-constant-time operation.
- **Narrator's line of thought:** "averaged over many inserts this is still O(1) amortized — but somebody has to actually experience that one slow insert."

### 4 — IncrementalIdea
- **fig:** `IncrementalIdea`
- **Visual idea:** two tables side by side, old and new, both live at once, with a migration-pointer marker sitting at the start of the old table.
- **Caption:** Redis's own `dict` answers differently: keep both the old and new table live, and migrate entries a few at a time instead of all at once.
- **Narrator's line of thought:** "same destination, different schedule — spread the one big cost across many small ones."

### 5 — MigrationPredict (predict)
- **fig:** `MigrationPredict`
- **Visual idea:** the migration pointer sitting idle between two tables, asking what actually makes it move forward.
- **Predict options:**
  1. "A dedicated background thread, migrating continuously"
  2. **"Piggybacked on every ordinary lookup or insert that touches the table"** (correct)
  3. "All at once, just delayed until the server is idle"
  4. "Only when the table detects memory pressure"
- **Explain:** Redis's own source calls a bounded rehash step from inside its ordinary lookup and insert paths — "the hash table automatically migrates from H1 to H2 while it is actively used" — no separate thread, no idle-time trigger, just a few buckets moved per real operation.
- **Narrator's line of thought:** "it rides along on work you were already doing. No thread, no scheduler, no separate cost center."

### 6 — BoundedStep
- **fig:** `BoundedStep`
- **Visual idea:** the migration pointer creeping a few slots further through the old table on each of several consecutive operations, old table shrinking, new table filling.
- **Caption:** each step moves a bounded number of entries — Redis's own implementation caps it, so no single operation pays for the whole migration.
- **Takeaway:** "Incremental migration's bound caps every single operation's cost, no matter how large the table."
- **Narrator's line of thought:** "the total work is the same as doubling's — what changes is who pays, and how much at once."

### 7 — MemoryTradeoff
- **fig:** `MemoryTradeoff`
- **Visual idea:** both tables' memory footprints stacked, their combined height held for many operations during incremental migration, versus doubling's combined height held for only the one rehashing insert.
- **Caption:** incremental migration trades a smoother latency for a real cost: both tables stay live, roughly doubling peak memory, for as long as the migration takes — not just for one insert.
- **Takeaway:** "Incremental migration keeps both tables live for many operations, not one — a real, sustained memory cost for a smoother latency."
- **Narrator's line of thought:** "no claim that one strategy is free — it's a trade, and a latency-sensitive server is the one making it."

### 8 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** both strategies' per-operation cost plotted across the same sequence of inserts, doubling's one tall spike versus incremental's flat, bounded line, both ending at the same final key count.
- **Caption:** same final table, same total work, two different schedules: one tall spike, or many small, bounded steps.
- **Narrator's line of thought:** recap — "the amortized average was always fine. The question this topic actually answers is who feels the cost, and when."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — the amortized-doubling argument is cited from Chapter 1/2, not re-derived; the real difference between doubling's momentary memory peak and incremental migration's sustained one.
- `lab` — none planned beyond this topic's own measurement; no syllabus Lab bullet names this topic specifically.
- `production` — Redis `dict`'s real incremental-migration design, cited from its own current source.
- `frontier` — shrinking a table under sustained memory pressure (Redis's own minimum-fill threshold); concurrent/lock-free resizing, named with no mechanism.
- `questions` — "Why does Redis migrate on ordinary lookups too, not just inserts?"; "What would happen to incremental migration's bound if a key's own chain were unusually long?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A real hash table built from scratch, supporting both resize strategies: doubling-and-rehash-all-at-once, and incremental migration with a small, fixed per-operation step bound.
2. A sequence of inserts crossing multiple resizes, measuring each individual operation's real cost (entries moved) under each strategy — the worst single operation, and the total/average.
3. A measurement of how many operations incremental migration takes to finish migrating from one size to the next, confirming it's spread across many operations, not paid in one.
4. Every number shown on screen (steps 2, 6, 7, 8) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "Every scheme so far has worked inside a table of fixed size. None of them has yet said what happens when that table fills up. Here is resizing, and the two real ways to pay for it."
- **Handoff** (word for word, matching `CHAPTER.md`): "A single machine's table can always grow to fit more keys. The next topics ask the same question one level up: what happens when the keys don't fit on one machine at all, or when you need to know two copies agree without comparing them whole."

## Concept ledger

- **Introduces:** `hash-table-resize`, `incremental-rehashing`, `migration-pointer`.
- **Uses:** `amortized-cost`, `aggregate-method`, `dynamic-array-doubling`, `growth-factor`, `load-factor`.
- **Declared:** `amortized-cost`, `aggregate-method` (Ch.1 topics 5–6; restated as the same argument this topic applies, not a new one).

## Claims list (claim → source)

1. Doubling pays for the whole rehash in one insert, proportional to the table's current size — the same amortized argument a growable array already proved (cited, not re-derived). → `dsa.aggregate-accounting-methods`, `dsa.dynamic-arrays-growth-policy`.
2. Redis `dict` keeps both the old and new table live and migrates entries a bounded number at a time, rather than all at once. → `SOURCES.md` § Redis `dict.c`.
3. Migration is piggybacked on ordinary lookup/insert operations, not a background thread or idle-time trigger. → `SOURCES.md` § Redis `dict.c`.
4. A single incremental-migration step is bounded (caps the number of buckets moved, and the number of empty buckets it will scan), so no one operation pays for the whole migration. → `SOURCES.md` § Redis `dict.c`.
5. Incremental migration keeps both tables live for the whole migration, roughly doubling peak memory for longer than doubling's single rehashing insert does. → `SOURCES.md` § Redis `dict.c`, `dict.h`.
6. Redis `dict` has a real, named minimum-fill threshold (1/8 occupancy) below which it's willing to shrink the table — a concrete number for "hash tables under memory pressure." → `SOURCES.md` § Redis `dict.h`.
7. Every number put on screen (steps 2, 6, 7, 8) is measured directly in `examples.py`.

## Changes from the chapter plan

Followed directly: the chapter plan's own visual idea (two runs — doubling vs. incremental migration — both ending at the same final entry count) is this topic's own `ProveIt` step. No syllabus clause is left unclaimed; the "Lab" bullet in §3.3 names topics 17–19's own implementations specifically and does not name this topic, so no reduced-lab section is needed here beyond `examples.py` itself.
