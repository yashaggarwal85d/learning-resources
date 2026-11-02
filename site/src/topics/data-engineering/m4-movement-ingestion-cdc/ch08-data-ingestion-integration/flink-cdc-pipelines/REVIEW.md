# Review — de.flink-cdc-pipelines

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 20's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (Landing
CDC in lakehouse and warehouse).

1. **Flow.** The bridge and handoff are copied verbatim from `CHAPTER.md`'s own Bridge/Handoff
   lines for this topic, which answer topic 20's own handoff (everything so far assumed a Kafka
   cluster in the middle) and set up the next topic (whichever way the changes get here, an
   analytical table still has to apply them). Checked all four named `uses` ids via
   `grep -n "introduces: \[.*'<id>'"` against `registry.ts`: `watermark-window-incremental-
   snapshot`, `debezium-architecture-envelope`, `cdc-schema-evolution-resnapshot` and
   `cdc-exactly-once-caveats` all resolve live.
2. **Pre-notes.** 7 bullets (Flink job, checkpoint, source operator, YAML pipeline, schema
   evolution, sink, parallelism — `CHAPTER.md`'s own syllabus terms for this topic), each under
   the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 521) splits at its
   own two semicolons into three clauses: Flink CDC 3.x as the Kafka-less path; YAML-defined
   end-to-end pipelines with schema-change propagation; and when it beats Debezium plus Kafka
   and what it gives up. `coverage.json`'s `syllabus` array matches this three-clause breakdown
   exactly, copied word for word from the raw syllabus file. The expert list has 10 items on
   the first draft, meeting the required minimum without needing a second pass.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording, not invented reasoning: the first against the
   MySQL CDC Source page's own separation of the source's read behavior from whatever sits
   downstream of it, the second against the complete absence of a durable log component
   anywhere in the architecture this topic itself described.
5. **Engagement.** Hook (step 1, a team running Debezium, Kafka and a sink connector to copy
   one database, spending more time on the middle than on the data); predict within the first
   four steps (step 2, whether skipping Kafka also skips the lock-free parallel snapshot read);
   three takeaways (steps 4, 8, 9 — meeting the build's own minimum-of-three rule); "Prove it"
   (step 10) generalizes the no-shared-log tradeoff to a second sink, directly reusing the
   mechanism from step 8 to rule out the wrong answer.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* the measurement or documented
   behavior comes out the way it does (why the parallel read stays intact regardless of what's
   downstream; why a second consumer has no durable log to attach to) rather than reading the
   figure's own on-screen labels or restating the predict question verbatim. Code-style tokens
   such as `server-id`, `schema.change.behavior` and `flink-cdc.sh` are spoken in narration as
   "a unique id," "a small handful of named behaviors," or "the YAML file" rather than read
   literally. The build's own narration-teaches check passed on the first attempt. No digits
   and no underscored identifiers appear in `reel.tsx`'s or `scenes.tsx`'s visible text or in
   `narration.json` — one digit-bearing leading comment in `reel.tsx` was caught by the build's
   own check (which scans the whole file, comments included) and reworded; every narration
   line is confirmed at or under the 50-word-per-line ceiling by a Python script (longest line:
   40 words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's usual
   one-to-three-word guideline per side; `grep` for digits in visible text returns no matches in
   the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text: all three takeaways passed, none needed trimming. The reel's
   first draft had only two takeaways; the build's own minimum-of-three-takeaways check caught
   this and a third was added to the PostgreSQL-experimental reveal step
   ("The same source family can mature at two different speeds inside the exact same release.").
3. This topic has no `examples.py`, per `CHAPTER.md`'s own "Lab" line: a Flink CDC run is
   sourced-only without a running Flink cluster, and the lock-free chunked read it would
   otherwise measure is already reproduced by topic 14's own implementation against this
   sandbox's real PostgreSQL cluster. This absence is disclosed in the reel's own leading
   comment, in `SOURCES.md`, in `coverage.json`'s expert list, and here, rather than left
   unexplained — confirmed as deliberate rather than an oversight by checking precedent
   elsewhere in the repo for topics whose own chapter plan names them as sourced-only (for
   example `inmon-vs-kimball-warehouse` and `cross-cloud-data-service-mapping`).
4. No source substitution was needed for this topic: every source CHAPTER.md implies (Flink
   CDC's own documentation site) was reachable directly as plain HTML, unlike the Apache Kafka
   pages substituted in earlier topics this chapter. `node scripts/sources.mjs check <folder>`
   passed 9/9 quotes word for word, after one structural fix: the Data Pipeline and Iceberg
   connector pages were originally listed under one `##` heading with two `URL:` lines, which
   the checker rejects (exactly one `URL:` line per heading block) — fixed by splitting into
   two separate heading blocks.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   Flink cluster, so every claim in this topic is named or quoted directly from Flink CDC's own
   current documentation rather than measured against a running job, with the one overlapping
   mechanism (the lock-free parallel chunked snapshot) already measured directly elsewhere in
   this chapter by topic 14's own implementation.

Final build: `cd site && npm run build` completed clean (238 pages), after two fixes during
development — a digit-bearing leading comment in `reel.tsx` (the build's digit check scans the
whole file, including comments, not just visible reel text) reworded to remove all digits, and
a reel that initially carried only two takeaways, below the build's own minimum of three, fixed
by adding a third. `node scripts/sources.mjs check <folder>` passed (9/9 quotes word for word,
after the URL-per-heading fix above). `PREVIEW_HELD=1 npm run build` completed clean; the
held-topic reel smoke test was run with `REEL_DEVICES=desktop` and passed, reporting both
desktop and phone sizes.
