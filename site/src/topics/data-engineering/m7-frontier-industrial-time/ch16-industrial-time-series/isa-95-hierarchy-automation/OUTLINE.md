# OUTLINE: ISA-95 hierarchy and the automation pyramid (`de.isa-95-hierarchy-automation`)

## Learning outcomes
1. Draw the five ISA-95 levels with the system of record and time horizon each one owns, and state where the primary source and common practitioner diagrams disagree on SCADA's level.
2. Model a two-plant equipment hierarchy as a type-2 slowly changing dimension keyed by a durable surrogate key, not by equipment_id or line name.
3. Show, with real computed numbers, why joining a reading to the equipment's *current* hierarchy row (rather than the row valid at the reading's own time) silently misattributes a measurable share of one line's output to another.
4. State why a tag name or equipment_id is not, by itself, a safe join key once a machine can move.

## Changes from the chapter plan
CHAPTER.md's hook illustrates the bug as "line 4 credited with May's slow press from January" (a stale-current-row framing). `examples.py` instead builds the cleanest, most general form of the identical SCD2-join bug: joining every event for an equipment to its *latest* dimension row (ignoring `valid_from`/`valid_to` and the event's own timestamp) drops the equipment's entire pre-move period from its old line and folds it into the new one. This is the textbook case the "join to today" phrase in the syllabus and chapter plan actually names, and it is the one `examples.py` can assert exactly. The reel's hook keeps the plan's dramatic shape (a performance number that looks wrong, traced to a moved machine) but the concrete figures are examples.py's own: line L4 understated by about 31 percent of its true total, line L6 overstated by the identical amount.

## Reel steps (storyboard)

1. **Hook** — fig: a line's own performance number looks right until you ask which machines actually ran on it. Visual: two Rows, "a line's number" / "looks solid" fading to "a machine moved mid-quarter" / "which total is real?". Narrator's line of thought: she doesn't open with ISA-95 at all — she opens with the number a plant manager actually stares at, and lets the discomfort of "which total is real" carry into the standard.
2. **Reveal: the five ISA-95 levels, by time horizon not by job title** — fig: level 0 (physical process) through level 4 (business planning), each with its system of record and how fast it has to react. Visual: five stacked Rows, level number as label, time-horizon word as value, built bottom-up. Takeaway: "ISA-95's five levels sort activities by how fast each one has to react, not by which department owns the system." Narrator explains *why* a microsecond-cycle control loop and a weekly planning run can never share one database, before naming which level is which.
3. **Reveal: the SCADA naming trap** — fig: ISA's own page places SCADA at level 3 alongside MES; many practitioner diagrams draw supervisory SCADA at level 2 with the PLCs. Visual: two small stacks side by side, SCADA's row highlighted in a different position on each. Narrator states both placements and the one idea that survives the disagreement: each level owns data with a different time horizon and a different system of record, regardless of exactly where a given box sits.
4. **Predict** — "A plant's hierarchy table says where every machine sits *right now*. A manager asks for last quarter's performance by line. Does looking the machine up in that same table answer the question correctly?" Options: Yes, a machine's current line is what matters / No, a reading has to join to whichever hierarchy row was valid when the reading happened (correct). Explain: a hierarchy that only remembers where things are now can't answer a question about where things were.
5. **Reveal: the hierarchy as a type-2 SCD, keyed durably** — fig: press7's two dimension rows, L4 then L6, each with its own surrogate key and a valid_from/valid_to pair. Visual: a small table-like Row stack showing both rows stacked, the surrogate keys called out. Takeaway: "The same physical machine gets two different surrogate keys across a move, on purpose — the move is a new version of the dimension row, not an edit to the old one."
6. **Reveal: the measured join bug** — fig: the real totals from examples.py, as-of join against current-row join, for line L4 and line L6. Visual: four Rows, as-of totals then current-row totals, the difference called out in focus colour. Takeaway: "Joining every reading to the equipment's latest row rather than the row valid at the reading's own time moved about a third of one line's true output onto the other line, with no change to a single physical reading."
7. **Reveal: why equipment_id or a tag name can't carry this alone** — fig: the natural key (equipment_id "press7") is the same across both rows; only the durable surrogate key and the valid-time window tell the join which row answers for which reading. Narrator connects this back to the predict step's answer: the lookup has to carry a *time*, not just an identity.
8. **Recap** — the five levels by time horizon, the naming trap, the hierarchy as a durably-keyed type-2 SCD, and the measured join bug.
9. **Prove it** — "A new dashboard caches 'each machine's current line' once a day and joins every incoming reading to that cache, no matter how old the reading is. Is a reading from three days ago, before today's cache refresh, guaranteed to land on the right line?" Options: Yes, the cache is only a day old so it's close enough / No, any reading from before the machine's last move will still land on the wrong line once the cache reflects the move (correct).

## Narrator's persona notes
Throughout, she teaches *why* the ordering matters (a control loop cannot wait for a business-planning query, a join without a time window cannot answer a historical question) rather than reading the labels on screen. Numbers are spoken in words; the exact figures live only in the drawing and in `examples.py`.

## Post-notes headings
- **Outcomes**: the five levels, the SCADA disagreement named and resolved, the real as-of-vs-current totals.
- **Lab**: `examples.py`'s own SQL, run against an in-memory SQLite dimension and fact table (the two-plant hierarchy-with-SCD-history leg of the §16.1 lab; the OEE leg is topic 4's).
- **Production**: the "current-row cache" failure mode (this topic's own Prove-it scenario) as something teams actually build by accident.
- **Frontier**: ISA-95's own Industry 4.0 position (a network-structured architecture can stay compliant without the pyramid) as a pointer past this topic's scope.
- **Where this goes next**: hands off to topic 2 (production entities and genealogy).

## Examples to execute and assert
`examples.py`: builds a type-2 SCD dimension for four pieces of equipment across two lines, one of which (press7) moves mid-window; generates a seeded synthetic count-event stream; computes the as-of join and the current-row join; asserts the current-row join exactly loses press7's pre-move total from L4 and gains it on L6; asserts the resulting understatement is in a realistic band; demonstrates the two different surrogate keys for the one physical machine.

## Bridge and handoff
- **Bridge** (from Chapter 15 topic 25's handoff): as in CHAPTER.md §16.1 topic 1 entry — "Chapter 15 ended by borrowing words it did not stop to teach... This chapter is that domain, and it opens where those designs started: the ISA-95 hierarchy and the automation pyramid that decides what a plant's data means."
- **Handoff** (to topic 2): as in CHAPTER.md — "The hierarchy says where a machine sits and which system owns which data. It says nothing yet about what the machines make. The next topic is the objects that move through that hierarchy: work orders, runs, batches and the lots whose parentage a recall depends on."

## Concept ledger
- **Introduces**: `isa95-levels-data-ownership`, `equipment-hierarchy-dimension`, `hierarchy-as-of-versioning`.
- **Uses**: `conformed-dimension`, `scd-type-2`, `key-types-natural-surrogate-durable-hash`, `idempotent-merge-load`, `as-of-join` — all confirmed live in `registry.ts`. CHAPTER.md's plan also lists `manufacturing-telemetry-platform-design` and `asset-context-join-early-vs-late` (Chapter 15 topic 24) in `uses`; Chapter 15 is planned but has zero built topics yet (confirmed: neither id appears anywhere in `registry.ts`), so per CHAPTER.md's own cross-chapter-id rule ("not guessed... the builder... logs the gap in OUTLINE.md") these two are dropped from this topic's actual `uses` and kept only in the bridge's prose, which doesn't require the id to exist. Logged here as the gap; nothing in Chapter 15 is actually used.
- **Declared**: basic familiarity with a PLC and a sensor as a device that produces numbers.

## Claims list
1. ISA-95's five levels (0-4) and what each owns — ISA's ISA-95 standard page. Confirmed.
2. The standard "primarily deals with the interface between levels 3 and 4" — ISA's ISA-95 standard page. Confirmed verbatim.
3. ISA places SCADA at level 3 alongside MES on its own standard page, while common practitioner diagrams (e.g. Siemens's explainer) place supervisory SCADA at level 2 with PLCs/DCSs — ISA's page (confirmed) and the practitioner-diagram pattern described generally, not quoted from a specific competitor page in SOURCES.md (kept as a stated pattern, not a verbatim-sourced claim).
4. The levels are divided "depending on the time horizon of the functionalities," independent of which systems implement them — Brandl & Johnsson, "Beyond the Pyramid" (ISA InTech, Oct 2021). Confirmed verbatim.
5. The pyramid is a traditional implementation choice, not a requirement of the standard; a network-structured architecture can stay ISA95-compliant — same source. Confirmed verbatim.
6. The Purdue Reference Model is what ISA-95 grew from — NIST SP 800-82r3 (Sept 2023). Confirmed verbatim (short form).
7. A type-2 SCD dimension row models "where a machine was" as a versioned fact with a valid-time window — course material (Chapter 3), applied here, not a claim about a real system.
8. The computed join-bug totals — this topic's own `examples.py`, executed and asserted.
