<section data-section="outcomes">

## Outcomes

A type shell and two instance shells of one machine model, distinguished by the `assetKind`
attribute and linked by a `derived_from` reference, with each instance's own data (a serial
number) kept separate from the type's shared data (a technical specification defined once). A
semantic ID shown to resolve the same property across two suppliers who gave it two different
local names. A Digital Nameplate submodel read from a mock REST endpoint and from a mock AASX
package, confirmed byte-identical regardless of transport. A validation gate that rejects a
property with no semantic ID and a submodel missing a required one, while still passing a
structurally complete submodel carrying a wrong value — the gate was never a check on truth.

</section>

<section data-section="lab">

## Lab

`examples.py` runs four checks. `build_type_and_instances` builds one type shell
(`PressModelX200`) and two instance shells referencing it, confirming each instance keeps its own
serial number while sharing the type's own technical data. `mock_rest_get_submodel` and
`mock_aasx_extract_submodel` read the same Nameplate submodel through two different transports and
are asserted equal. `resolve_by_semantic_id`, given two suppliers who named a mass property
"Weight" and "Mass_kg" respectively, resolves both to the one semantic ID they share.
`validate_submodel_against_template` is asserted to raise on a property with an empty semantic ID
and on a submodel missing a required one, while a well-formed submodel with a deliberately wrong
value passes it cleanly — demonstrating directly that validation checks structure, not truth.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a validated AAS submodel as if it were verified data.** A submodel that passes its own
structural validation gate — every property present, every semantic ID matched — can still carry
a value nobody has checked against reality; validation is the entry ticket to being exchanged and
understood, never a claim about correctness.

**Re-deriving a type asset's shared data inside every instance.** A machine model's technical
specification belongs in the type shell once; duplicating it into every instance invites the two
copies to drift apart the moment one is updated and the other is not.

</section>

<section data-section="frontier">

## Frontier

IEC 63278-1:2023 and three parts of the IDTA's own AAS specification series (Part 1 metamodel,
Part 2 APIs, Part 5 AASX package format) were fetched directly and cleanly, all PDFs on the
IDTA's own domain. The planning-time guesses at their versions ("v3.1.1", "v3.0.1") did not match
what the fetched documents' own title pages state (Version 1.0RC03 for Part 1, schemas at V3.0.1
for Part 2, "version 3.0" for Part 5) — the real, fetched versions are used and the mismatch is
disclosed. The IDTA's own submodel catalogue shows the Digital Battery Passport as seven parts at
research time, not the four CHAPTER.md's planning text guessed by analogy; the real seven are
named. ISO's own "Digital product passports explained" page returns HTTP 403 on every attempt
(bot-blocked, not merely unreachable the way a client-rendered SPA is); GS1 Belgium & Luxembourg's
own page is used in its place. Regulation (EU) 2024/1781 (the ESPR)'s own text could not be
fetched through EUR-Lex by any route tried at research time (every variant returned an empty
HTTP 202), exactly as CHAPTER.md's own planning note anticipated; nothing is quoted from the
regulation directly, and its specific requirements are left to counsel. No real AAS server, API or
AASX tool was run; `examples.py` implements the mechanics directly from the specifications' own
described structure.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That closes the chapter, from a plant's hierarchy through the time series its machines produce to
the shell that describes them. One idea from it travels straight into the next: the as-of join
that attaches the right temperature to a pressure spike is the same join that attaches the right
feature to a label, and getting it wrong leaks the future into a model. The next chapter is the
data layer of machine learning and of language models, and it opens there: point-in-time correct
training data.

</section>
