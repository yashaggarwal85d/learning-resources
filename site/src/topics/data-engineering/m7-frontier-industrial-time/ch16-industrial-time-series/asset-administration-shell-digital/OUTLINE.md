# Outline — Asset Administration Shell digital twins

## Registry gaps

None. All 12 ids in CHAPTER.md's own `uses` list were confirmed present in some shipped topic's
`introduces` array via grep/python before being written into `registry.ts` — the second clean
topic in this chapter after topic 18.

## Version discrepancies between planning and research time

CHAPTER.md's own planning text flagged version numbers "to be re-confirmed at research time" for
the IDTA specification series. At research time, the fetched documents' own title pages state:

- Part 1 (metamodel): Version 1.0RC03, IDTA Number 01001-3-0 — not the planning guess "v3.1.1".
- Part 2 (API): schemas published at V3.0.1, IDTA Number 01002-3-0 — close to, but not literally,
  the planning guess "v3.1.1".
- Part 5 (AASX): "version 3.0" per Part 2's own cross-reference, IDTA Number 01005-3-0 — not the
  planning guess "v3.0.1".

The IDTA's own numbering distinguishes the document's IDTA number (e.g. `01001-3-0`, where `3-0`
names the specification's major.minor edition) from the schema's own semantic version (e.g.
`V3.0.1`) — these are two different version strings for related but distinct things, which is
likely the source of the planning-time guess's mismatch. The real, fetched numbers are used
throughout this topic rather than silently corrected to the guess.

## Digital Battery Passport: seven parts, not four

CHAPTER.md's planning text named four battery-passport parts (Nameplate, Handover Documentation,
Product Carbon Footprint, Technical Data) by analogy with concepts already familiar from earlier
chapter topics. The IDTA's own submodel catalogue at research time lists seven parts (adding
Product Condition, Material Composition, and Circularity). This topic states the real seven,
per CHAPTER.md's own instruction to name submodels "as the IDTA catalogue lists them at research
time," and discloses the planning guess's undercount in `SOURCES.md` rather than silently
reconciling the two.

## Two disclosed unreachable sources

ISO's own "Digital product passports explained" page returns HTTP 403 on every URL variant tried
at research time — a bot-blocking wall on the `iso.org` domain, not a missing or client-rendered
page. GS1 Belgium & Luxembourg's own page on the digital product passport, fetched cleanly, is
used in its place.

Regulation (EU) 2024/1781 (the ESPR)'s own text could not be fetched through EUR-Lex by any route
tried at research time (the standard content URL, its PDF and HTML variants, and its ELI-identifier
PDF link all returned an empty HTTP 202) — confirming CHAPTER.md's own planning-time note. No
alternate full-text mirror was found fetchable either. Nothing is quoted from the regulation
directly; the topic states only what GS1's and Catena-X's own pages say about the ESPR and leaves
the regulation's specific requirements to counsel, exactly as CHAPTER.md's own scope note directs.

## `examples.py` design

Four checks, each isolating one clause of the syllabus line: (1) type vs. instance shells,
distinguished by `assetKind` and linked by `derived_from`; (2) a semantic ID resolving one
property across two suppliers' differently-chosen local names; (3) a REST read and an AASX
package returning byte-identical content for the same submodel, modelling the "pull via API or
ingest via file" choice CHAPTER.md names; (4) a validation gate rejecting a missing semantic ID
and a missing required property, while still passing a structurally valid submodel carrying a
deliberately wrong value — the final assertion is the hook's own answer, made executable rather
than merely argued.
