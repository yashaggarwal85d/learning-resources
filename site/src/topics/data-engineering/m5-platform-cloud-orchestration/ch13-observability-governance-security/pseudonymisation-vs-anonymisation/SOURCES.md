# Sources: Pseudonymisation vs anonymisation (`de.pseudonymisation-vs-anonymisation`)

GDPR's own text (Article 4, Recital 26, Article 32), the CJEU's press release for case
C-413/23 P (the official full judgment text is not reachable as static text in this sandbox;
the press release is the Court's own official summary, exactly as CHAPTER.md's own naming
allows), the EDPB's Guidelines 01/2025 on Pseudonymisation, and the EDPB-EDPS Joint Opinion
2/2026 on the Digital Omnibus proposal are all fetched directly.

## Art. 4 GDPR — Definitions (gdpr-info.eu)

URL: https://gdpr-info.eu/art-4-gdpr/
Version: retrieved 2026-11-01

> 'pseudonymisation' means the processing of personal data in such a manner that the personal data can no longer be attributed to a specific data subject without the use of additional information, provided that such additional information is kept separately and is subject to technical and organisational measures to ensure that the personal data are not attributed to an identified or identifiable natural person;

Contents: the Article 4(5) definition of pseudonymisation itself -- the "legal and technical
line" clause of this topic's own scope line, word for word from the Regulation's own text.

## Recital 26 — Not Applicable to Anonymous Data (gdpr-info.eu)

URL: https://gdpr-info.eu/recitals/no-26/
Version: retrieved 2026-11-01

> Personal data which have undergone pseudonymisation, which could be attributed to a natural person by the use of additional information should be considered to be information on an identifiable natural person.

> To determine whether a natural person is identifiable, account should be taken of all the means reasonably likely to be used, such as singling out, either by the controller or by another person to identify the natural person directly or indirectly.

> The principles of data protection should therefore not apply to anonymous information, namely information which does not relate to an identified or identifiable natural person or to personal data rendered anonymous in such a manner that the data subject is not or no longer identifiable.

Contents: pseudonymised data remains identifiable information unless anonymised outright, and
the "all the means reasonably likely to be used" identifiability test -- the same test the
CJEU later applies relative to a given recipient in C-413/23 P.

## Art. 32 GDPR — Security of processing (gdpr-info.eu)

URL: https://gdpr-info.eu/art-32-gdpr/
Version: retrieved 2026-11-01

> the pseudonymisation and encryption of personal data;

Contents: pseudonymisation named as one of GDPR's own listed technical security measures,
distinct from encryption -- grounding why this topic treats pseudonymisation as a security
control that does not, by itself, change a dataset's legal status.

## Press Release No 107/25 — Judgment in Case C-413/23 P, EDPS v SRB (Court of Justice of the EU)

URL: https://curia.europa.eu/site/upload/docs/application/pdf/2025-09/cp250107en.pdf
Version: 4 September 2025

Note on source naming: the full judgment text (ECLI:EU:C:2025:645) is not reachable as static,
fetchable text in this sandbox (EUR-Lex and InfoCuria both serve it as JavaScript-rendered
pages here); CHAPTER.md's own instruction allows the Court's press release as "the official
summary" in this case, and this is that press release, the Court's own official account of
what it decided.

> the Court of Justice has confirmed that the General Court was correct in so far as it held that pseudonymised data must not be regarded as constituting, in all cases and for every person, personal data for the purposes of the application of Regulation 2018/1725. It follows from the provisions of that regulation as interpreted in case-law that pseudonymisation may, depending on the circumstances of the case, effectively prevent persons other than the controller from identifying the data subject in such a way that, for them, the data subject is not or is no longer identifiable.

> the relevant perspective for assessing the identifiable nature of the data subject depends, in essence, on the circumstances of the processing of the data in each individual case. With regard to that obligation to provide information, the Court of Justice notes that that obligation is part of the legal relationship between the data subject and the controller and, therefore, it concerns the information in relation to that data subject as it was transmitted to that controller, thus before any potential transfer to a third party. Accordingly, the Court of Justice has found that the identifiable nature of the data subject must be assessed at the time of collection of the data and from the point of view of the controller.

> Hearing an appeal brought by the EDPS, the Court of Justice has set aside the judgment of the General Court and referred the case back to it.

Contents: the relative (recipient-dependent) approach to identifiability the CJEU confirmed,
and the controller's transparency duty being judged from the controller's own position at
collection time, not the recipient's -- the full "CJEU's relative approach" clause of this
topic's own scope line. Note on the case's actual outcome, confirmed by reading the press
release itself rather than secondary commentary: the Court set aside the General Court's
judgment overall (on a separate point, about whether personal opinions "relate to" their
author), while specifically confirming the General Court's own relative-identifiability
reasoning as correct -- a case decided under Regulation (EU) 2018/1725 (the EU institutions'
own data-protection regulation), not the GDPR directly, as CHAPTER.md's own scope notes.

## Guidelines 01/2025 on Pseudonymisation (EDPB, version for public consultation)

URL: https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf
Version: adopted 16 January 2025, version for public consultation

> It should not be possible within the pseudonymisation domain to attribute pseudonymised data relating to a data subject whose identifiers are known. This could be done by applying the pseudonymisation transformation to those identifiers, obtaining the pseudonym, and locating the pseudonymised data attached to that pseudonym.

> For instance, if you know the transformation is merely a SHA256 hash of a name, you could apply this to all names you have elsewhere and then see which hashes match in the pseudonymised dataset.

> The secret parameter(s) or key(s) involved in the cryptographic algorithms will be the pseudonymisation secrets.

> Preference should generally be given to one-way functions due to the difficulty of their reversal even when the secret parameters are known.

Contents: the exact mechanism of a dictionary attack against a plain hash (computing the same
hash over a known candidate list and matching), and the pseudonymisation secret (key) as what
makes a keyed one-way function resistant to that same attack -- the "keyed hashing (HMAC) vs
plain hashing (dictionary attacks...)" clause of this topic's own scope line.

## EDPB-EDPS Joint Opinion 2/2026 on the Digital Omnibus proposal

URL: https://www.edpb.europa.eu/system/files/documents/2026-02/edpb_edps_jointopinion_202602_digitalomnibus_en.pdf
Version: adopted 10 February 2026

Note on source naming: CHAPTER.md names this opinion's EUR-Lex reference for the underlying
Digital Omnibus proposal as "52025PC0837"; this document itself, quoting the proposal directly
in its own footnotes, consistently cites it as "COM(2025) 836 final" -- this topic uses the
number this primary document itself gives, not CHAPTER.md's.

> The Proposal would add a new paragraph under Article 4(1) GDPR and Article 3(1) EUDPR to the definition of personal data as follows: 'Information relating to a natural person is not necessarily personal data for every other person or entity, merely because another entity can identify that natural person. Information shall not be personal for a given entity where that entity cannot identify the natural person to whom the information relates, taking into account the means reasonably likely to be used by that entity. Such information does not become personal for that entity merely because a potential subsequent recipient has means reasonably likely to be used to identify the natural person to whom the information relates'

> The proposed amendments 'seek to codify interpretations of the Court of Justice of the European Union (CJEU), such as with regard to pseudonymisation of personal data'

> the EDPB and the EDPS strongly urge the co-legislators to not adopt the proposed changes to the definition of personal data.

> A newly proposed Article 41a GDPR would empower the Commission to adopt implementing acts to specify means and criteria to determine whether data resulting from pseudonymisation no longer constitute personal data for certain entities

Contents: the Digital Omnibus's own proposed text (a new Article 4(1) paragraph making
personal-data status relative to a given recipient's own means, and a new Article 41a letting
the Commission specify by implementing act when pseudonymised data stops being personal data
for certain entities), presented as a pending proposal with the EDPB/EDPS's own recommendation
against it -- the "pending GDPR changes in the Digital Omnibus" clause of this topic's own
scope line, with its actual legislative status as of this opinion's own adoption date.
