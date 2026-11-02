# REVIEW — de.branches-tags-write-audit

## What this topic builds

A real tag (`released-v1`) and a real branch (`audit`), both created from the same snapshot in
this sandbox through pyiceberg (0.12.0)'s public `manage_snapshots()` API. A complete
write-audit-publish flow run twice: once staged on the branch, validated (a real duplicate-id
check), and fast-forwarded into `main` via `set_current_snapshot`; once staged, caught by the
same check, and discarded without ever touching `main`. Branch isolation is asserted directly
against `main`'s own snapshot id, not just claimed in narration.

Named from sourced documentation only, not built: Iceberg views (a separate catalog object, no
data of its own), and multi-table branching (a forward pointer to the catalog chapter, §6.3.4,
per CHAPTER.md's own scope note).

## Fixes made during the build

- `reel.tsx`'s own bridge/handoff framing needed no fix; however, the `narration.json` and
  `coverage.json` work was written against the reel's exact step titles, which caught itself on
  the first `check-all.mjs` build pass (see below).
- `coverage.json`'s syllabus clause failed the build's coverage check twice: first because the
  `(6.3.4)` reference was missing its `§` symbol (the syllabus line's `clean()` strips backticks
  but keeps `§`), and because the `at` entries used numeric step indices instead of the actual
  reel step titles the checker expects. Fixed both: copied the clause exactly (with `§`, without
  backticks, matching `syllabus.ts`'s `clean()` output), and switched every `at` entry to the
  real step title strings from `reel.tsx`.
  - Also needed matching `## heading`s in `post-notes.md` for every `{"deep": "..."}` reference
    in `coverage.json` (`Deep-dive`, `Production`, `Frontier`) — the original draft had
    `<section>` wrappers without headings, which the checker can't resolve.

## Checks run

- `narration-teaches.mjs`: clean, all 10 steps under threshold (max 6% description-overlap, max
  46 words/step).
- `check-all.mjs --skip reels,links,narration --topic branches-tags-write-audit`: locked, docs,
  sources, build all pass (after the coverage.json fixes above).
- `check-all.mjs --only links,narration --topic branches-tags-write-audit`: both pass (2141
  links, 0 broken; the 92 title mismatches are pre-existing across the whole site, unrelated to
  this topic).
- `check-all.mjs --only reels --topic .../branches-tags-write-audit`: reel smoke test passes at
  desktop and phone sizes. `test:editor` fails with its known pre-existing sandbox limitation
  (confirmed by multiple prior topics; not a regression from this topic).

## Screenshot review

All 24 screenshots (desktop 01-10, phone 01-10, plus the four `-q` predict-wait variants:
desktop/phone × step02/step05) reviewed by hand. No overflow, no layout issues, no text
truncation beyond the deliberate "MORE" affordance on phone. Predict steps render their two
options and explain block correctly in both pre-answer (`-q`) and post-answer states.

## Scope and sourcing

Three sources, 13 quotes verified word-for-word (`node scripts/sources.mjs check`): the Iceberg
table spec's snapshot-references section (branches and tags), the project's own Spark procedures
documentation (`fast_forward`, `publish_changes`, `wap_id`), and the Iceberg view spec. FACT-CHECK
discloses honestly that no official Iceberg page uses the literal phrase "write-audit-publish" as
a section heading — this topic cites only the project's own procedures documentation, which
describes the identical mechanism under its own names.

## Ships as

`status: 'held'`, §6.3.1 (closes the Iceberg arc). `registry.ts` and `renarration.json` entries
added. Next up: topic 27, `de.delta-transaction-log`, opening the Delta arc.
