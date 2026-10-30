# Outline: Text interchange formats and their traps (`de.text-interchange-formats-their`)

## Learning outcomes

1. Reproduce a real CSV misparse caused by an unquoted comma, an embedded quote escaped the wrong way, and an embedded newline, and state RFC 4180's actual rule for each.
2. Reproduce a real JSON number silently losing precision once a double-precision parser is involved, and explain why RFC 8259 warns about it.
3. Reproduce a real parse failure caused by a leading byte order mark, and fix it.
4. State why none of CSV, JSON or XML carries a schema or types, and why they are still accepted at the edge and converted immediately rather than stored long-term.

## Reel steps (storyboard)

All real numbers below are asserted in `examples.py` and executed with `python3 examples.py`.

1. **Hook.** fig: "one row, one comma inside a name — a naive reader sees 4 fields, not 3." Visual: the raw text `"Smith, John",42,Mumbai` drawn as a single line, then a naive `split(",")` decode sweeping left to right landing on 4 boxes (one of them visibly broken across the comma), while a second pass with a real CSV parser lands on 3 correct boxes. Moves: Decode for the naive split's 4 tokens, then a second Decode row for the correct 3. Body: a transfer/order record with a comma in the customer's own name — "Smith, John" — fed to two readers. Caption states both counts. No takeaway (hook).
2. **Predict: does wrapping it in quotes fix everything?** fig: "quoting fixes the comma. What about a quote *inside* the field?" predict options: "Yes — once it's quoted, nothing inside it can break it" / "No — a quote inside the field still needs its own escape, correct: true". Visual: the quoted field `"Smith, John"` shown correctly tokenizing (3 boxes, calm), then the question posed over a second field containing an embedded quote (`O"Brien`) with a `?` where the escape would go. explain: quoting handles the comma; an embedded quote is the separate problem the next step answers.
3. **Reveal: the embedded quote.** fig: "a backslash reads back as `O\\Brien"`. RFC 4180's doubled quote reads back as `O"Brien`." Visual: the same field written two ways — `"O\"Brien",7` (backslash escape) and `"O""Brien",7` (doubled quote) — each decoded by a real CSV parser, the backslash version resolving to the corrupted `O\Brien"` in Reticle-locked red-adjacent emphasis (no red; just focus/quiet contrast per DESIGN colour rule — actually use C.focus vs C.quiet, no red since this isn't a "bad outcome" per se, it's a wrong-but-successful parse) and the doubled-quote version resolving to the correct `O"Brien`. takeaway: "An embedded quote is escaped by doubling it, never by a backslash — RFC 4180's one rule for it."
4. **Reveal: the embedded newline.** fig: "naive line-split sees 3 records; a real CSV parser sees 2." Visual: a two-row file where one field is a multi-line address; a naive reader's "split on \n" sweep landing on 3 line-boxes (one cut mid-address), then the real parser's sweep landing on the correct 2 record-boxes, the address field shown intact with its embedded line break still inside one box. takeaway: "A legal CSV field can contain its own line break — a reader that splits on newline instead of quotes counts the wrong number of records."
5. **Reveal: the surprising number (JSON precision).** fig: "order_id 9,007,199,254,740,993 — a double-precision parser returns 9,007,199,254,740,992." Visual: the same 16-digit order id Count-ing into place twice, side by side: the exact value (Python's own arbitrary-precision parse) holding steady, the double-precision parse landing one digit lower at its last place — a huge number, off by exactly one, which is the surprise. takeaway: "An integer this large looks exact in a JSON file. Once a double-precision parser reads it, it silently comes back one smaller."
6. **Reveal: the BOM trap.** fig: "a byte order mark at the front of the file: the parser raises before it reads a single field." Visual: the raw bytes `EF BB BF` drawn in front of the real JSON text `{"status": "ok"}`, a decode sweep hitting the BOM and stopping (parse fails), then the same bytes with the BOM stripped decoding cleanly to the object. takeaway: "A byte order mark carries no byte-order meaning in UTF-8 at all — it's pure signature, and an unstripped one is read as the first character of the file."
7. **Reveal: no types, no schema, and still the front door.** fig: "CSV, JSON, XML: three formats, zero of them typed." Visual: the three format names in a row, each with a small "type: none" tag, next to a funnel shape narrowing down to a single typed Parquet-shaped box at the far right labeled "converted immediately." Body names XML briefly as the third, more verbose format in the same boat. No takeaway (sets up recap).
8. **Recap.** fig: "five traps, one rule: accept them at the edge, convert immediately." Visual: the five numbers from steps 1–6 redrawn as a small scoreboard (4→3, backslash→doubled, 3→2, 993→992, fail→ok), closing on the funnel from step 7. Body restates the handoff to row-vs-columnar layout.

## Engagement arc

- Hook: step 1 (a real, surprising miscount from one ordinary comma).
- Predict: step 2, within the first four steps (the only predict a refresher needs).
- Surprising number: step 5 (a 16-digit id off by exactly one).
- Takeaways (3, each on its own step, none doubled up): steps 3, 4, 6.
- Recap: step 8.

## Narrator's line of thought (beyond the description)

1. Hook: she doesn't just read "four fields instead of three" — she asks the viewer to notice that the naive reader isn't broken software, it's correct software applied to the wrong assumption (that a comma always separates fields).
2. Predict: she poses the question as a trap a confident learner falls into — "quoting looks like it solved everything" — before revealing it only solved the comma.
3. Embedded quote: she names *why* a backslash fails here specifically — CSV has no escape character at all, so a backslash is just another ordinary byte to a correct CSV parser, which is the opposite of what every other text format trains you to expect.
4. Embedded newline: she connects this back to the hook's lesson — the same "naive reader's assumption breaks" shape, now with the assumption being "a newline always ends a record."
5. JSON precision: she asks the viewer to predict, half a second before the reveal, whether a number this exact-looking could possibly be wrong — then shows the double landing one short, and says plainly that nothing in the file was corrupted; the *parser* chose to approximate.
6. BOM: she frames it as the most confusing trap of the five, because the file "looks empty of any issue" to a human eye reading it in an editor, while the first machine-readable character is already wrong.
7. No types: she pulls back to the general shape — every trap so far was a reader guessing at structure the format itself refuses to state — and that's the reason none of these formats is where data actually lives.
8. Recap: she restates the handoff in her own words, not read from the step body.

## Post-notes headings

- **Internals**: RFC 4180's own ABNF grammar for `escaped`/`non-escaped` fields; RFC 8259's number grammar and its silence on size limits; the BOM's role (U+FEFF) across UTF-8/16/32.
- **Lab**: the §6.1 chapter lab's schema-evolution half (hosted here) — add/rename/widen a column across CSV, JSON and (named, not built) Avro/Parquet, recording which readers break.
- **Production**: a real CSV-ingestion incident shape (a vendor export with an unescaped comma silently corrupting a downstream load) and a real JSON precision-loss incident shape (a 64-bit id truncated by a JavaScript-based pipeline); both framed from the mechanisms this topic already demonstrated, not asserted as unverified anecdotes.
- **Frontier**: why this exact set of traps is the reason every lakehouse format from here forward is binary and typed.
- **Where this goes next**: row vs columnar vs hybrid layouts (topic 2).

## Examples to execute

`examples.py` (already run, all asserts pass): `csv_unquoted_comma_breaks_naive_split`, `csv_embedded_quote_needs_doubling`, `csv_embedded_newline_breaks_naive_line_reader`, `json_number_precision_loss`, `json_leading_bom_breaks_the_parser`.

## Bridge and handoff

- **Bridge** (from Chapter 5 topic 32): "This chapter opened at the single physical page an engine reads and writes and closed at a sketch that approximates an entire distribution in a few kilobytes. The next chapter turns to the files these engines and sketches actually read and write at rest, starting with the oldest and most trap-ridden of them: plain-text interchange formats like CSV and JSON."
- **Handoff** (to topic 2): "A text format with no types and no schema is still, underneath, either a row at a time or a column at a time. The next question is that choice itself: row-oriented versus columnar layout."

## Concept ledger

- **Introduces:** `text-format-traps`.
- **Uses:** none.
- **Declared:** a file as bytes on disk (Chapters 1 and 5).

## Claims list

1. RFC 4180 rule 5–7: a field is quoted when it contains a comma, CRLF or quote, with an embedded quote escaped by doubling. Source: RFC 4180 §2.
2. CSV has no backslash-escape mechanism; a backslash is ordinary data to a conformant parser. Source: RFC 4180 §2 (silence on backslash: rule 7 names doubling as the only escape).
3. An embedded newline inside a quoted CSV field is legal data, not a record separator. Source: RFC 4180 §2 rule 6.
4. JSON's grammar has one numeric type with no built-in magnitude/precision limit, but real double-precision parsers lose exactness outside ±(2^53 − 1). Source: RFC 8259 §6.
5. JSON must be encoded UTF-8 per RFC 8259 §8.1; a leading BOM is not part of the JSON grammar and breaks a strict parser. Source: RFC 8259 §8.1, Unicode BOM FAQ.
6. A BOM (U+FEFF) in UTF-8 carries no byte-order meaning — it's purely a signature. Source: Unicode BOM FAQ.
7. JSON Lines is a convention on top of JSON (one value per line, UTF-8, no BOM, `\n` terminator), not something RFC 8259 defines. Source: jsonlines.org.
8. None of CSV, JSON or XML carries a schema or column types; XML pairs with an external schema (XSD/DTD) when one exists. Source: RFC 4180, RFC 8259 (both silent on types/schema beyond "number"/"string"/"object"); XML named per the syllabus line without a dedicated primary source fetched (syllabus gives it one clause, no mechanism to verify beyond naming it).

## Progress

Research done (`SOURCES.md`, `coverage.json` → `expert`). Content plan done (this file). `examples.py` written and passing. Next: fact-check (section 5), then build `reel.tsx`/`scenes.tsx`/`post-notes.md`/`pre-notes.md`/`references.md`/`prerequisites.mdx`/`narration.json`/registry entry (section 7).
