# Review — de.orc-versus-parquet

## Build fixes

- `check-all.mjs --skip reels,links` initially failed: `reel.tsx` showed the literal digits
  "0.13" (Hive's version number) in both its comment and a step's body/fig text, which
  `topic-checks.ts`'s own number check correctly flagged since `examples.py` never computes or
  asserts that value. Fixed by spelling the version out in words ("Hive's own zero-point-thirteen
  release") in both `reel.tsx` and `scenes.tsx`, consistent with how every other number in this
  topic is either a real computed/asserted value from `examples.py` or written out as prose.
- `sources.mjs check` initially failed on 4 of 15 quotes: the ORC spec's raw markdown fetch
  (`raw.githubusercontent.com/apache/orc/main/...`) silently dropped the entire "Stripes" section
  — the known diagram/table-stripping bug (an unclosed `<` in a `1 <= x <= 24` table row eats
  everything up to the next real `>` character, over 150 lines later). Fixed by citing
  `orc.apache.org`'s own rendered specification page instead, which serves the same content
  without the raw markdown characters that trigger the bug. A second quote (Parquet's list of
  implementations) failed because the checker's cached text has each list item on its own line,
  not comma-joined as I'd written it — fixed by quoting the clean sentence before the list
  instead.

## Reels check

First `--only reels` run flagged two phone-only overflow failures: step 8's value line ("built
for any format with a row id — only shipped for ORC", 13 words) and step 10's recap value
("framework-neutral design, table formats chose it first", 8 words) both ran outside the drawing
on phone width. Shortened both to "shipped only for ORC" and "framework-neutral, chosen first".
Second run passed clean: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes."

All 10 steps' desktop and phone screenshots reviewed by eye in `site/test-results/`: no
overlapping or cut-off text, predict step (2 and 5) options and explanations render correctly,
takeaways (steps 4, 7, 9) display correctly, recap (step 10) renders all four rows cleanly on
both sizes.

`test:editor` failed with its known, topic-independent sandbox limitation ("a save did not open a
new GitHub issue") — reproduced against the unmodified `de.b-trees-vs-lsm` topic in prior
sessions, unrelated to this topic's own files.

## Links

`check-links.mjs`: 0 broken links; this topic introduced no new title-mismatch entries (all
flagged mismatches are pre-existing, unrelated topics).

## Content notes

`examples.py` hand-rolls both ORC's row-index layout and Parquet's row-group/page-index layout
(no DuckDB available in this sandbox), measured against a real 100,000-row dataset and one
selective query, with every on-screen number backed by a real `assert`. The ACID-history and
"why Parquet won" claims are narrative, sourced directly from the Hive wiki and Parquet's own
project documentation rather than computed — consistent with this topic having no lab of its own
per `CHAPTER.md`.
