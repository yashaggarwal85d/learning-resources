# Review — de.schema-evolution-rules-across

## Content review, self-review

- Claims table in FACT-CHECK.md cross-checked against the three quoted sources (Avro spec schema resolution, Protobuf proto3 language guide, Parquet's `parquet.thrift` `SchemaElement`); all 10 claims traced to a quote.
- Red-team items addressed: confirmed `pyarrow`/`fastavro` are not installed in this sandbox, so `examples.py` hand-rolls each format's resolution rule in pure Python rather than depending on either library; the Protobuf "reused field number decodes as a specific wrong value" claim is backed by an actual computed byte decode (`int.from_bytes` on `"Alice"`'s UTF-8 bytes), not an assertion of a guessed number — the first guessed value (1,702,194,753) was wrong and was replaced with the real computed result (1,667,853,377) after `python3 examples.py` raised `AssertionError`.
- `python3 examples.py` — all asserts pass (Avro resolution with/without default, Protobuf field-number reuse decode, Parquet by-name/by-position/by-field-ID matching).
- `node scripts/check-all.mjs --skip reels,links --topic schema-evolution-rules-across` — all green (locked, docs, sources, build, narration).
- `node scripts/check-links.mjs .../prerequisites.mdx` — 3/3 links ok.
- Coverage: 6 syllabus clauses, 3 sources with quoted items, 10 expert items, no open gaps.

## Looks review, self-review

- `node scripts/check-all.mjs --only reels --topic schema-evolution-rules-across` passed on the second attempt ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes") after fixing two phone-only overlap bugs found by the first run:
  - Step 6 (Reveal: the surprising number) — "same bytes, read as the new field 2" ran into "1,667,853,377" on phone width; converted the second `Row` to a `TallRow` (label above, value below) and shifted the following note down.
  - Step 10 (Recap) — the "Protobuf" row's long value overlapped its label on phone width; converted all three summary rows (Avro/Protobuf/Parquet) to `TallRow` and moved "the rule" block down, increasing the scene's `Svg h` from 280 to 330.
- Manually viewed all 22 screenshots in `site/test-results/` (10 desktop steps + 2 predict-question frames, 10 phone steps — the predict-question frames render identically on phone and desktop layout so only the desktop `-q` frames were captured): no text overflow, no overlapping elements, predict-question cards render cleanly, takeaway italics wrap without collision, Recap's four stacked rows read clearly at both sizes.
