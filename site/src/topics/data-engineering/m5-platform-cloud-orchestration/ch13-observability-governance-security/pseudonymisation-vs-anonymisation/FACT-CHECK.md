# Fact-check — de.pseudonymisation-vs-anonymisation

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | GDPR Article 4(5): pseudonymisation is processing that leaves data no longer attributable to a specific subject without additional information, kept separate and protected. | GDPR, Article 4 | Confirmed, quoted verbatim. |
| 2 | GDPR Recital 26: pseudonymised data attributable to a person by additional information is still "information on an identifiable natural person." | GDPR, Recital 26 | Confirmed, quoted verbatim. |
| 3 | GDPR Recital 26: identifiability is assessed against "all objective factors," including cost and time, given available technology. | GDPR, Recital 26 | Confirmed, quoted verbatim. |
| 4 | GDPR Recital 26: anonymous information is outside the Regulation's scope entirely. | GDPR, Recital 26 | Confirmed, quoted verbatim. |
| 5 | GDPR Article 32 names "the pseudonymisation and encryption of personal data" as an appropriate security measure. | GDPR, Article 32 | Confirmed, quoted verbatim. |
| 6 | CJEU, *EDPS v SRB* (C-413/23 P): pseudonymised data "must not be regarded as constituting, in all cases and for every person, personal data." | CJEU Press Release No 107/25 | Confirmed, quoted verbatim. |
| 7 | Same judgment: pseudonymisation may "effectively prevent persons other than the controller from identifying the data subject." | CJEU Press Release No 107/25 | Confirmed, quoted verbatim. |
| 8 | Same judgment: the controller's transparency duty is assessed "at the time of collection of the data and from the point of view of the controller." | CJEU Press Release No 107/25 | Confirmed, quoted verbatim. |
| 9 | The judgment is decided under Regulation (EU) 2018/1725, not the GDPR directly; the press release does not discuss GDPR Article 4(1) by name. | CJEU Press Release No 107/25, footnote 1 | Confirmed by reading the full press release text; no GDPR Article 4(1) reference found anywhere in it. |
| 10 | EDPB Guidelines 01/2025: a pseudonymisation secret needs sufficient entropy to limit brute-force/dictionary searching. | EDPB Guidelines 01/2025 | Confirmed, quoted verbatim. |
| 11 | EDPB Guidelines 01/2025's own worked example: hashing every candidate name with the same (unkeyed) function and matching against the pseudonymised dataset is a real dictionary attack. | EDPB Guidelines 01/2025, footnote 23 | Confirmed, quoted verbatim. |
| 12 | EDPB Guidelines 01/2025 recommends keyed, pre-image-resistant one-way functions (HMACs) as a suitable building block. | EDPB Guidelines 01/2025 | Confirmed, quoted verbatim. |
| 13 | The Digital Omnibus proposal (COM(2025) 837 final) would write the relative approach into the GDPR's recitals: additional information enabling identification does not, by itself, make pseudonymised data personal data "in all cases and for every person or entity." | COM(2025) 837 final, via Council doc 15698/25 | Confirmed, quoted verbatim. |
| 14 | The same proposal adds Article 41a, empowering the Commission to specify by implementing act when pseudonymised data stops being personal data for certain entities. | COM(2025) 837 final, via Council doc 15698/25 | Confirmed, quoted verbatim. |
| 15 | EDPB-EDPS Joint Opinion 2/2026: an implementing act under Article 41a "could de facto affect the material scope of EU data protection law." | EDPB-EDPS Joint Opinion 2/2026 | Confirmed, quoted verbatim. |
| 16 | The same opinion recommends "deleting proposed Article 41a GDPR from the Proposal." | EDPB-EDPS Joint Opinion 2/2026 | Confirmed, quoted verbatim. |
| 17 | EP Legislative Train tracker (updated 20/09/2026): the co-rapporteurs left the personal-data definition to later committee negotiation. | EP Legislative Train, "The Digital Omnibus Regulation Proposal" | Confirmed, quoted verbatim. |
| 18 | Same tracker: the Council's negotiating-mandate vote (scheduled 26 June) was cancelled; work continues under the Irish Council Presidency. | EP Legislative Train, "The Digital Omnibus Regulation Proposal" | Confirmed, quoted verbatim. |

## Red-team: the predict question (step 2)

**Question:** a list of ten million known email addresses, hashed with the same function as a
table of "hashed, so it's anonymous" customer emails, matches 90 percent of the table back to
named people. What single change would have made that attack fail — and would the result then be
anonymous, or only pseudonymised?

**Attack 1 — "a hash is a hash; SHA-256 is cryptographically strong, so this shouldn't work."**
The strength of the hash function is not the vulnerability — determinism and a small, guessable
input space are. The EDPB's own guidelines give exactly this attack as the worked example (footnote
23: "if you know the transformation is merely a SHA256 hash of a name, you could apply this to all
names you have elsewhere"). `examples.py`'s `dictionary_attack_on_plain_hash` makes this concrete:
the same unkeyed SHA-256, applied to a candidate list, reproduces the pseudonymised table's hashes
exactly, with no brute-forcing of the hash function itself required.

**Attack 2 — "so HMAC fixes it, and the data is now anonymous."** HMAC fixes the dictionary
attack (`hmac_resists_without_the_key` shows zero matches without the secret), but the result is
still pseudonymisation, not anonymisation: Article 4(5)'s own test is attribution *without
additional information*, and the HMAC key is exactly that additional information — kept
separately, not destroyed. The data is still personal data for whoever holds the key. Only
destroying the key (or never generating a reversible structure at all) crosses into anonymisation,
and even then only if no other means of re-identification remains reasonably likely — which the
topic's own linkage-attack reveal (step 9) shows is a separate, further question.

**Attack 3 — "if HMAC resists the dictionary attack, the data can't be re-identified at all."**
False, and the topic's own linkage-attack reveal and `examples.py`'s
`linkage_attack_on_quasi_identifiers` demonstrate it directly: a perfectly keyed pseudonym gives up
nothing to a dictionary attack, but quasi-identifiers (postcode, birth date, product mix) carried
alongside the pseudonym can be joined to an outside list and re-identify a measurable fraction of
the table without the key ever being used or needed.

## Red-team: the legal claims (steps 6–8)

**Claim — "*EDPS v SRB* means pseudonymised data is never personal data for a third party."**
Overstated. The Court's own language is conditional: data "must not be regarded as constituting,
in all cases and for every person, personal data" — meaning the opposite extreme (always personal
data for everyone) is wrong, not that pseudonymised data is categorically non-personal for anyone
without the key. The recipient's *actual* means of re-identification remain a question of fact in
each case, which `OUTLINE.md`'s clause 2 and the reel's own step 6 both state explicitly.

**Claim — "the judgment settles this under GDPR too."** The judgment is decided under Regulation
(EU) 2018/1725 — the EU institutions' own data-protection regulation — and its press release does
not cite GDPR Article 4(1) anywhere in its text (confirmed by reading the full 6322-character
release). The topic states this caveat directly rather than silently assuming the holding
transfers, consistent with `CHAPTER.md`'s explicit instruction to check how far the Court ties its
own reasoning to the GDPR before claiming it carries over.

**Claim — "the Digital Omnibus has already changed the law."** It has not: as of the EP
Legislative Train's own 20/09/2026 update, the Council's negotiating-mandate vote was cancelled
and the personal-data definition was left to committee negotiation — a proposal under active,
contested negotiation, not an adopted change. The topic states the proposal's date and status and
builds no reveal that assumes it is law.
