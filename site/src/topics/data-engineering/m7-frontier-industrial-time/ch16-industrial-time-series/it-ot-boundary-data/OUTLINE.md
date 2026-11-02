# OUTLINE: IT/OT boundary and data ownership (`de.it-ot-boundary-data`)

## Learning outcomes
1. State the Purdue/ISA-95 segmentation model as a network boundary, and name where a data-platform extraction path crosses it.
2. Compute a read-only extraction's load against a PLC's stated capacity, and show that polling every tag once a second breaches it even before any subscription filtering.
3. Show that a change-of-value subscription cuts load dramatically but can still breach a tight budget, and that the real fix is reading from a system built to absorb the work (a historian or replica), not the PLC.
4. Show a bounded buffer absorbing a stalled consumer by dropping its own oldest item, so a slow consumer never blocks or backpressures the producer side.
5. Assign ownership of the operational copy, the analytical copy, and a field's own definition, and show the definition's owner does not change when the bytes move to a new system.
6. Show a tag rename breaking a reader keyed only on the current name, and an alias-contract reader (expand/contract) surviving the same rename.

## Changes from the chapter plan
CHAPTER.md asks this topic to recap §10.6 (Chapter 10's IT/OT topic) and Chapter 11 §11.3's
schema-change expand/contract material "by name," looking up their `introduces` ids in
`registry.ts` rather than guessing them. Chapter 10's registry entries checked at build time
only go up through section 10.1 (three topics, none titled an IT/OT boundary topic), and Chapter
11's only through section 11.1 (five orchestration/reliability topics, no §11.3 schema-change
topic). Neither §10.6 nor §11.3 exists yet in `registry.ts`. Per CHAPTER.md's own rule ("the
builder looks up that topic's `introduces` in `registry.ts`, or puts the idea in `declared` and
logs the gap in `OUTLINE.md`"), this topic puts the Purdue/DMZ segmentation recap and the
expand/contract tag-rename pattern in its own words, sourced directly from NIST SP 800-82r3 for
the segmentation half and built as a from-scratch worked example for the rename half, and lists
both as a **declared** gap rather than a cross-chapter `uses` id. If §10.6 or §11.3 ship before
this topic goes live, a later pass can replace the recap with the real ids.

CHAPTER.md also names the ISA/IEC 62443 series as "the security-standard family." ISA's own
standards pages state a site-wide prohibition on feeding their content into any AI tool
(confirmed on three separate isa.org pages during this chapter's research — see SOURCES.md).
This topic names ISA/IEC 62443 bibliographically only, with no fetch or quote, and relies on
NIST SP 800-82r3 (a U.S. government publication with no such restriction) for every verbatim
claim about segmentation, DMZs and unidirectional gateways. This same finding also affects this
chapter's topics 1 and 2, already shipped before the restriction was noticed; flagged separately
to the project owner, outside this topic's own files.

CHAPTER.md's hook describes an analyst polling 3,000 tags once a second against a PLC. The PLC's
stated 500-messages-per-second budget in `examples.py` is this topic's own invented illustration
(CHAPTER.md: "the planner's invented illustration of a fictional two-plant manufacturer, not a
measurement"), not a real vendor figure for any PLC. `examples.py` goes one step further than the
hook asks and shows that even a change-of-value subscription (the textbook fix for a naive poll)
still breaches this fictional plant's tight budget, so the topic's real lesson is "read from a
system built to absorb the load," not merely "subscribe instead of poll."

## Reel steps (storyboard)

1. **Hook** — fig: an analyst points a script at the PLC's tags to build a dashboard, polling three thousand tags once a second; the PLC's scan time stretches and a conveyor faults; nobody wrote anything to the PLC, the read load alone disturbed control.
2. **Reveal: the plant floor is segmented on purpose** — fig: the Purdue/ISA-95 levels as zones with a DMZ band between the plant floor and the rest of the company, recapping the boundary Chapter 10 already named; every extraction path has to cross it somewhere.
3. **Predict** — "A read-only script never writes to the PLC. Can it still disturb control?" Options: No, a read can't disturb a system it never writes to / Yes, the read load itself can stretch the PLC's own scan time (correct). Explain: a PLC's scan loop has to answer every request on top of its control work, so enough requests slow the loop that runs the actual process.
4. **Reveal: the load budget, computed** — fig: polling three thousand tags once a second against a PLC rated for five hundred requests a second; the load is six times the budget before a single value has even changed.
5. **Reveal: a subscription is better, and still not enough** — fig: switching to a change-of-value subscription over the same tag mix cuts the load sharply, and it is still well over this plant's own tight budget. Takeaway: "Subscribing instead of polling cut the load by more than half, and it still wasn't enough to fit the budget."
6. **Reveal: read from the thing built to absorb it** — fig: the same tags read from the historian or a replica instead of the PLC itself; the load on the PLC drops to the full budget, untouched. Takeaway: "The fix isn't polling less often — it's reading from a system whose job is already to absorb that load, not from the controller."
7. **Reveal: a slow consumer can't block the producer** — fig: a bounded buffer between the extractor and a stalled downstream consumer; once it's full it drops its own oldest item instead of refusing the next one, so the producer side never once stalls. Takeaway: "A full buffer dropped its own oldest reading — the producer side never stalled, and nothing it fed ever blocked."
8. **Reveal: ownership is assigned, not inferred** — fig: the operational copies (the PLC's tag, the historian's archive, the MES record) and the analytical copy (the lakehouse row) each with an owner attached; the definition of a field ("good count") keeps the operational side's owner even once the bytes live in the analytical copy.
9. **Reveal: a rename breaks the naive reader, not the contract reader** — fig: a sensor's tag renamed after a firmware re-scale; a reader keyed only on the new name misses every reading taken under the old one, an alias-contract reader catches both. Takeaway: "The reader that only knew the new tag name silently lost every reading taken before the rename — the one built on an alias caught both."
10. **Recap** — a plant floor is segmented on purpose, a read load can still disturb control, the fix is reading from a system built to absorb it, a buffer protects the producer from a stalled consumer, ownership of the bytes and of a definition are assigned, and a rename only breaks the reader that wasn't told about it.
11. **Prove it** — "A new consumer wants to subscribe straight to the PLC's own OPC UA server for live tag values. Is that the same risk as the dashboard script that polled it?" Options: No, a subscription is passive so it carries no load risk / Yes, the subscription still asks the PLC to do the work of noticing every change, so the same budget question applies (correct).

## Narrator's persona notes
She teaches the budget as a real constraint a read-only script can still violate, not a trick
question about writes; she treats "subscribe instead of poll" as a half-fix the numbers
disprove, and lands on "read from the system built to absorb it" as the actual lesson. Exact
figures (the budget, the load, the buffer's drop count) live in the drawing and in `examples.py`.

## Post-notes headings
- **Outcomes**: the segmentation recap, the load-budget computation, the subscription-still-not-enough result, reading from a historian/replica instead of the PLC, a bounded buffer protecting the producer, ownership assignment, and the tag-rename contract pattern.
- **Lab**: `examples.py`'s own load-budget, buffer and rename computations (this topic has no lab of its own per CHAPTER.md).
- **Production**: a dashboard script polling a PLC's tags directly instead of subscribing through, or reading from, a system built to absorb that load; a pipeline keyed on a tag's current name with no alias path for a rename plant engineering already shipped.
- **Frontier**: the ISA/IEC 62443 series, named as a pointer only (ISA's own AI-ingestion restriction, see SOURCES.md); Chapter 10 §10.6 and Chapter 11 §11.3, not yet built at this topic's build time (see "Changes from the chapter plan").
- **Where this goes next**: hands off to topic 7 (timestamps, clocks and time zones in telemetry).

## Examples to execute and assert
`examples.py`: computes a direct-poll load against a PLC's stated budget and asserts it's
exceeded; computes the same tag mix's change-of-value subscription load and asserts it's lower
but still exceeded; computes a historian-replica read's load on the PLC and asserts it's zero;
pushes 250 items through a 100-item bounded buffer and asserts exactly 150 were dropped and the
producer's own pushes never failed; asserts the shared definition of "good count" keeps plant
engineering as its owner even though the lakehouse row that stores it is owned by the data
platform; asserts a naive reader keyed on a tag's old name raises `KeyError` after a rename, and
an alias-contract reader reads both the pre- and post-rename reading correctly.

## Bridge and handoff
- **Bridge** (from topic 5's handoff): as in CHAPTER.md — "The meter, the PLC and the MES each hold a piece of the plant's data, and each sits in a network that must never be disturbed by a data platform. This topic is the boundary between the plant floor and the rest of the company: who owns each copy, how to read without touching control, and how a change on the floor reaches the data team before it breaks a pipeline."
- **Handoff** (to topic 7): as in CHAPTER.md — "That closes the model of the plant: its hierarchy, what it makes, how well it makes it, what it consumes and who owns what. Everything so far assumed a reading arrives with its time attached. The next section is about that time. It starts with the first thing that goes wrong: three clocks, none of them right."

## Concept ledger
- **Introduces**: `operational-vs-analytical-copy-ownership`, `read-only-extraction-load-budget`, `ot-change-management-tag-contract`.
- **Uses**: `isa95-levels-data-ownership` (topic 1), `data-contract-specification`, `data-as-a-product` (Chapter 3) — confirmed live in `registry.ts`.
- **Declared**: basic familiarity with a firewall and a network zone; the Purdue/ISA-95 segmentation recap and the expand/contract pattern (CHAPTER.md's Chapter 10 §10.6 and Chapter 11 §11.3 ids, not yet built — see "Changes from the chapter plan").

## Claims list
1. Restricting logical access to the OT network may include unidirectional gateways and a DMZ with firewalls preventing traffic passing directly between corporate and OT networks — NIST SP 800-82r3, September 2023. Confirmed verbatim.
2. A DMZ can be incorporated as an enforcement boundary between network segments — same source. Confirmed verbatim.
3. A unidirectional gateway permits authorized communication in only one direction and can protect lower levels from a cybersecurity event at higher ones — same source. Confirmed verbatim.
4. Organizations may use an industry-recognized model for OT segmentation, naming the Purdue model, ISA-95 levels, and the three-tier IIoT architecture together — same source. Confirmed verbatim.
5. Firewall rules should prevent higher-level devices from directly communicating with lower-level ones, in both Purdue and ISA/IEC 62443 architectures — same source. Confirmed verbatim.
6. The ISA/IEC 62443 series — named bibliographically only; ISA's own pages prohibit AI-tool ingestion. See SOURCES.md.
7. The load budget, the subscription load, the historian-replica load, the buffer's drop count, the ownership assignment, and the naive-vs-contract reader behaviour on a tag rename — this topic's own `examples.py`, executed and asserted.
