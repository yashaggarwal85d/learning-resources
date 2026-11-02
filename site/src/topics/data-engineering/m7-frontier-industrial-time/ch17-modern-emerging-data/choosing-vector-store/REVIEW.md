# Review — de.choosing-vector-store

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): pgvector/pgvectorscale inside Postgres
  (Reveal: pgvector and pgvectorscale), dedicated engines (Reveal: the dedicated engines), search
  engines vs lakehouse/object-store options (Reveal: search engines and lakehouse-native options),
  the six-axis decision procedure (Reveal: the six axes; Reveal: walking the six axes on the
  shop's own corpus; Reveal: the same procedure on a different corpus), not by benchmark marketing
  (Reveal: the dedicated engines; Prove it).
- All claims in FACT-CHECK.md are grounded in each vendor's own live documentation (pgvector,
  pgvectorscale, Milvus, Qdrant, Weaviate, Pinecone), one independent dated comparison write-up
  labelled explicitly as secondary, or this topic's own `examples.py`, which codes the six-axis
  procedure as a real function and runs it against three distinct corpora, reaching three
  distinct, justified recommendations.
- Following CHAPTER.md's own instruction, no vendor's comparative latency/recall number is
  repeated anywhere in this topic — only each vendor's own architectural description of what its
  system is built for. Several uncredentialed, repeated-but-unmethodical latency figures found
  during research were deliberately excluded, documented in FACT-CHECK's red team.
- The reel's engagement arc holds: two predicts (step 2 and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step), five takeaways (steps 4, 5, 6, 7, 8).
- Narration (verified via `narration-teaches.mjs`): zero lines over the 50-word floor after
  splitting two over-long lines (steps 5 and 9) during the pre-check.
- No takeaways exceeded the 20-word limit this time.
- Bridge answers topic 6's handoff verbatim per CHAPTER.md; handoff leads into topic 8 (serving
  contract and ownership handoff) exactly as planned. This closes §17.1.1.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- The first run failed on phone with three overlap issues, all from the same `Row` component's
  one-line label+value layout running into itself at phone's larger text scale when either the
  label or value text was long (step 4's "pgvectorscale's disk-backed index" / "closes the scale
  gap", step 6's "a text-search engine, vectors added" / "hybrid-first need" and "lakehouse-native
  vectors" / "no new database, slower queries") — fixed by converting both scenes from the
  side-by-side `Row` layout to stacked label/value blocks (the same fix pattern used for `Recap`
  scenes on earlier topics), rather than trying to shorten the labels further.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic choosing-vector-store` run: `test:reels`
passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with "a save did
not open a new GitHub issue" — the same known, pre-existing, topic-independent Playwright/Chromium
sandbox limitation documented on topics 1-6's REVIEW.md, not caused by this topic and not a
shipping blocker.
