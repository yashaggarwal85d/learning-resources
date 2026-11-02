# Fact-check — de.pseudonymisation-vs-anonymisation

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Pseudonymisation means personal data can no longer be attributed to a data subject without additional information, kept separately and protected. | GDPR Art. 4(5) | Confirmed, quoted verbatim. |
| 2 | Pseudonymised data attributable by additional information should be considered information on an identifiable natural person; identifiability is judged by all means reasonably likely to be used. | GDPR Recital 26 | Confirmed, quoted verbatim. |
| 3 | Pseudonymisation and encryption are both named as security-of-processing measures. | GDPR Art. 32 | Confirmed, quoted verbatim. |
| 4 | The Court of Justice confirmed that pseudonymised data must not be regarded as personal data in all cases and for every person; pseudonymisation may effectively prevent identification by someone other than the controller. | CJEU Press Release No 107/25, C-413/23 P | Confirmed, quoted verbatim. |
| 5 | The identifiable nature of the data subject is assessed at the time of collection, from the controller's point of view, for the controller's own transparency duty. | CJEU Press Release No 107/25, C-413/23 P | Confirmed, quoted verbatim. |
| 6 | Hashing all known candidate names with the same (known) plain hash function and matching outputs recovers the pseudonymised dataset. | EDPB Guidelines 01/2025 on Pseudonymisation | Confirmed, quoted verbatim. |
| 7 | The secret parameters or keys in a cryptographic algorithm are the pseudonymisation secrets; one-way functions are preferred even when the secret parameters are known. | EDPB Guidelines 01/2025 on Pseudonymisation | Confirmed, quoted verbatim. |
| 8 | The Digital Omnibus proposal would add a paragraph to Article 4(1) GDPR making information not personal for an entity that cannot identify the natural person by means reasonably likely to be used by that entity. | EDPB-EDPS Joint Opinion 2/2026 | Confirmed, quoted verbatim. |
| 9 | A proposed Article 41a would let the Commission specify by implementing act the means and criteria for when pseudonymised data stops being personal data for certain entities. | EDPB-EDPS Joint Opinion 2/2026 | Confirmed, quoted verbatim. |
| 10 | The EDPB and EDPS strongly urge the co-legislators not to adopt the proposed changes to the definition of personal data. | EDPB-EDPS Joint Opinion 2/2026 | Confirmed, quoted verbatim. |
| 11 | A dictionary attack hashing a known candidate email list with the same plain function recovers the large majority of a synthetic pseudonymised table. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 12 | The identical attack against the same emails under keyed HMAC, without the secret key, recovers none of them. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 13 | A linkage attack joining quasi-identifiers from a pseudonymised release against an outside reference list re-identifies a real, measurable fraction of individuals never named in the release. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |

## Note on the judgment's actual outcome

The CJEU's judgment in C-413/23 P was a mixed result, not a clean win for either side: hearing
the EDPS's appeal, the Court **set aside** the General Court's judgment overall, on a separate
point about whether personal opinions expressed in free-text comments "relate to" their author.
What the Court specifically **confirmed as correct** was the General Court's own
relative-identifiability reasoning — the one holding this topic measures and teaches. The reel
presents only the confirmed holding; it does not claim the Court upheld the General Court's
ruling as a whole, and `SOURCES.md` documents this distinction explicitly. The case was also
decided under Regulation (EU) 2018/1725 (the EU institutions' own data-protection regulation),
not the GDPR directly — named in `coverage.json`'s `expert` items, since the Court's own press
release and the Digital Omnibus's own explanatory memorandum both treat the reasoning as
applicable to the GDPR's structurally identical Article 4(1).

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** given a pseudonymised table built from a plain hash, does hashing a
known candidate list with the same function recover most of the table?

**Attack — "a hash output looks random, so there shouldn't be a matching candidate."** This
confuses a hash's *output appearance* with its *determinism*. A plain hash gives the identical
output for the identical input every time, so anyone who can guess or already knows the
candidate values gets the exact same hashes the table holds. `examples.py`'s own measurement
recovers the large majority of a 5,000-entry synthetic table this way, confirming the EDPB's own
stated mechanism rather than just restating it.

**Question 2 (step 6):** does a release with no direct identifiers, only quasi-identifiers,
stay anonymous once joined against an outside list?

**Attack — "no names were released, so nobody can be re-identified."** The linkage-attack
measurement directly refutes this: a real, measurable fraction of individuals get matched back
to a name purely from the combination of quasi-identifiers (postcode, birth year, product
category), without the key or a dictionary ever being touched. Removing direct identifiers
reduces identifiability; it does not, by itself, produce anonymisation.

## Abandoned approaches

Measuring the linkage attack against an irregular, partially-overlapping outside list (closer to
a real-world attacker's list) was considered, but produces a re-identification rate that depends
heavily on the exact overlap chosen rather than illustrating the mechanism cleanly; the clean,
fully-overlapping outside list used instead isolates the mechanism, with the generalisation
caveat recorded explicitly in `coverage.json`'s `{"deep": "Frontier"}` item and in
`post-notes.md`.
