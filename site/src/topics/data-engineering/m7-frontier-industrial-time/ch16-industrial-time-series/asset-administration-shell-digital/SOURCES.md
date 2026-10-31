# Sources

## IEC 63278-1:2023 (IEC webstore page)

URL: https://webstore.iec.ch/en/publication/65628
Version: IEC 63278-1:2023, retrieved 2026-10-31

> IEC 63278-1:2023 defines the structure of a standardized digital representation of an asset, called Asset Administration Shell (AAS). The Asset Administration Shell gives uniform access to information and services.

Contents: the standard's own definition of the Asset Administration Shell this topic builds on
directly — a standardized digital representation of an asset, giving uniform access to
information and services.

## Specification of the Asset Administration Shell — Part 1: Metamodel (IDTA)

URL: https://industrialdigitaltwin.org/en/wp-content/uploads/sites/2/2023/04/IDTA-01001-3-0_SpecificationAssetAdministrationShell_Part1_Metamodel.pdf
Version: Version 1.0RC03, IDTA Number 01001-3-0, April 2023, retrieved 2026-10-31

> Type assets and instance assets are distinguished by the attribute "AssetInformation/assetKind".

> Every submodel element needs a semantic definition (semanticId in HasSemantics) to have a well-defined meaning. The submodel element might either refer directly to a corresponding semantic definition provided by an external reference (e.g. to an ECLASS or IEC CDD property definition) or it may indirectly reference a concept description (ConceptDescription).

Contents: the type-vs-instance distinction (`assetKind`) and the semantic-ID mechanism
(`HasSemantics`), both this topic implements directly in `examples.py`. The planning-time guess of
"v3.1.1" for Part 1 does not match the fetched document's own title page (Version 1.0RC03, IDTA
Number 01001-3-0, dated April 2023) — disclosed below rather than silently corrected to the
planning guess.

## Specification of the Asset Administration Shell — Part 2: Application Programming Interfaces (IDTA)

URL: https://industrialdigitaltwin.org/en/wp-content/uploads/sites/2/2023/06/IDTA-01002-3-0_SpecificationAssetAdministrationShell_Part2_API_.pdf
Version: IDTA Number 01002-3-0, June 2023, schemas at V3.0.1, retrieved 2026-10-31

> This document specifies the interfaces as well as the APIs in selected technologies for the Asset Administration Shells and its submodels.

> Part 5: Package File Format (AASX) in version 3.0

Contents: the document's own scope statement for the REST API this topic's `examples.py` models
as a mock read endpoint, and a cross-reference confirming Part 5's own real version (3.0, not the
"3.0.1" guessed at planning).

## Specification of the Asset Administration Shell — Part 5: Package File Format (AASX) (IDTA)

URL: https://industrialdigitaltwin.org/en/wp-content/uploads/sites/2/2023/04/IDTA-01005-3-0_SpecificationAssetAdministrationShell_Part5_AASXPackageFileFormat.pdf
Version: IDTA Number 01005-3-0, April 2023, retrieved 2026-10-31

> the exchange file format for the transport of information from one partner in the value chain to the next.

Contents: the AASX package's own stated purpose — a file format for exchanging an AAS and its
supporting files between partners, which this topic models as an alternative to the REST API for
reading a submodel.

## IDTA submodel catalogue — Digital Nameplate for Industrial Equipment

URL: https://industrialdigitaltwin.org/en/content-hub/submodels
Version: IDTA 02006, Version 3.0.1, status Published, retrieved 2026-10-31

> This Submodel template aims to provide asset nameplate information to the respective Asset Administration Shells in an interoperable manner. Central element is the provision of properties [7], ideally interoperable by the means of dictionaries such as ECLASS and IEC CDD (Common Data Dictionary).

Contents: the Digital Nameplate submodel template this topic's mock endpoint returns, with its
real current catalogue entry (IDTA 02006, v3.0.1, Published) — a newer v4.0 is listed as "In
Development" (not yet published) at research time, and is not used.

## IDTA submodel catalogue — Digital Battery Passport (seven parts, not four)

URL: https://industrialdigitaltwin.org/en/content-hub/submodels
Version: IDTA-02035-1 through -7, Version 1.0, status Published, retrieved 2026-10-31

> The battery passport consists of the following 7 parts:

> Digital Battery Passport – Part 7: Circularity (IDTA-02035-7)

Contents: CHAPTER.md's planning text named four battery-passport parts (Nameplate, Handover
Documentation, Product Carbon Footprint, Technical Data) by analogy with the chapter's own
earlier topics; the real catalogue at research time has seven. This topic names the real seven
and discloses the planning-time guess undercounted it, per CHAPTER.md's own instruction to state
submodel names "as the IDTA catalogue lists them at research time" rather than assert unread
contents.

## Catena-X (own site)

URL: https://catena-x.net/en/
Version: retrieved 2026-10-31

> Exchange data with your direct business partners across the supply chain – for use cases like PCF tracking, Digital Product Passports, Quality Management, and more.

> An industry joint test to prepare automotive and battery enterprises for the EU Battery Passport requirement effective 18 February 2027

Contents: Catena-X's own description of the data-space use cases this topic names (PCF tracking,
Digital Product Passports, Quality Management), and its own stated battery-passport deadline. The
18 February 2027 date is corroborated against multiple independent secondary descriptions of
Regulation (EU) 2023/1542 (the Battery Regulation) at research time, since the regulation's own
EUR-Lex text could not be fetched (see the disclosed gap below) — not repeated from Catena-X's
page alone, per CHAPTER.md's own instruction.

## GS1 Belgium & Luxembourg: "The Digital Product Passport (DPP)"

URL: https://gs1belu.org/en/digital-product-passport
Version: retrieved 2026-10-31

> The Digital Product Passport is part of the Ecodesign for Sustainable Products Regulation (ESPR).

> A Digital Product Passport could be compared to a travel passport for people, only this one is for physical products. The passport gathers and stores a variety of different data, such as the product's composition, its ecological footprint, how the product can be repaired/recycled/processed, etc. The passport can then be consulted by every stakeholder in the supply chain by way of a QR code for instance.

Contents: a real, fetchable description of the digital product passport and its tie to the ESPR,
used in place of ISO's own explainer (see the disclosed gap below).

## Disclosed: ISO's "Digital product passports explained" could not be fetched

URL: (none)

ISO's own page (`https://www.iso.org/insights/digital-product-passports-explained`) returns HTTP
403 on every attempt at research time (confirmed on several URL variants on the `iso.org` domain),
consistent with a bot-blocking wall rather than a missing page. GS1 Belgium & Luxembourg's own
page on the digital product passport (above) is used in its place and the substitution is
disclosed; nothing is quoted from ISO's page as though it had been fetched.

## Disclosed: Regulation (EU) 2024/1781 (the ESPR)'s own text could not be fetched

URL: (none)

CHAPTER.md's own planning note anticipated this: "EUR-Lex returned no text through the fetch tool
at planning, so the regulation's wording is fetched by another route at research time." At
research time, EUR-Lex was tried again directly (`eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1781`,
its PDF and HTML variants, and its ELI-identifier PDF link) — every attempt returned an HTTP 202
with an empty body, confirming the page is rendered client-side and not fetchable by this
project's tooling. No alternate full-text mirror of the regulation's own wording was found
fetchable either. Nothing is quoted from the regulation directly; this topic states only what
GS1's and Catena-X's own pages (above) say about the ESPR and the digital product passport, and
leaves the regulation's specific requirements to counsel, per CHAPTER.md's own scope note.
