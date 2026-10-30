## GDPR, Article 4 — Definitions

URL: https://gdpr-info.eu/art-4-gdpr/
Version: General Data Protection Regulation, Article 4(5) (fetched 2026-10-30)

> ‘pseudonymisation’ means the processing of personal data in such a manner that the personal data can no longer be attributed to a specific data subject without the use of additional information, provided that such additional information is kept separately and is subject to technical and organisational measures to ensure that the personal data are not attributed to an identified or identifiable natural person;

Contents:
1. The Article 4(5) legal definition of pseudonymisation, verbatim: the test is attribution without additional information, and that additional information must be kept separate and protected.

## GDPR, Recital 26 — Not Applicable to Anonymous Data

URL: https://gdpr-info.eu/recitals/no-26/
Version: General Data Protection Regulation, Recital 26 (fetched 2026-10-30)

> Personal data which have undergone pseudonymisation, which could be attributed to a natural person by the use of additional information should be considered to be information on an identifiable natural person.

> To ascertain whether means are reasonably likely to be used to identify the natural person, account should be taken of all objective factors, such as the costs of and the amount of time required for identification, taking into consideration the available technology at the time of the processing and technological developments.

> The principles of data protection should therefore not apply to anonymous information, namely information which does not relate to an identified or identifiable natural person or to personal data rendered anonymous in such a manner that the data subject is not or no longer identifiable.

Contents:
1. The recital's own statement that pseudonymised data remains personal data for whoever can attribute it with additional information.
2. The "reasonably likely" identifiability test, including the cost-and-time factors that make it a case-by-case, not absolute, question.
3. The boundary: anonymous information (truly non-identifiable) falls outside the Regulation entirely.

## GDPR, Article 32 — Security of Processing

URL: https://gdpr-info.eu/art-32-gdpr/
Version: General Data Protection Regulation, Article 32 (fetched 2026-10-30)

> the pseudonymisation and encryption of personal data;

Contents:
1. Pseudonymisation named, alongside encryption, as an example of an appropriate technical measure under the Article 32 security obligation — the engineering consequence of pseudonymised data still being personal data.

## Court of Justice of the European Union — Press Release No 107/25 (Case C-413/23 P, EDPS v SRB)

URL: https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250107en.pdf
Version: Press Release No 107/25, Luxembourg, 4 September 2025 (fetched 2026-10-30)

> the Court of Justice has confirmed that the General Court was correct in so far as it held that pseudonymised data must not be regarded as constituting, in all cases and for every person, personal data for the purposes of the application of Regulation 2018/1725.

> pseudonymisation may, depending on the circumstances of the case, effectively prevent persons other than the controller from identifying the data subject in such a way that, for them, the data subject is not or is no longer identifiable.

> the relevant perspective for assessing the identifiable nature of the data subject depends, in essence, on the circumstances of the processing of the data in each individual case.

> that obligation is part of the legal relationship between the data subject and the controller and, therefore, it concerns the information in relation to that data subject as it was transmitted to that controller, thus before any potential transfer to a third party.

> the Court of Justice has found that the identifiable nature of the data subject must be assessed at the time of collection of the data and from the point of view of the controller.

Contents:
1. The Court's own statement of the "relative approach" holding: pseudonymised data is not personal data in all cases for every person.
2. The mechanism: pseudonymisation can make a data subject non-identifiable for a recipient who lacks the means to re-identify.
3. The companion holding this topic must also carry: the controller's transparency duty is judged from the controller's own position at the time of collection, not the recipient's, so pseudonymising data for a third party does not retroactively excuse the controller's own information duty.
4. **Caveat the topic states explicitly:** this judgment is decided under Regulation (EU) 2018/1725 (the EU institutions' own data-protection regulation), not the GDPR directly; the press release does not discuss GDPR Article 4(1) by name, so the topic treats the holding as persuasive for the GDPR's identical "identifiable natural person" wording rather than as a GDPR ruling itself.

## EDPB — Guidelines 01/2025 on Pseudonymisation (version for public consultation)

URL: https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf
Version: Adopted 16 January 2025, version for public consultation (fetched 2026-10-30)

> Only possession of the secret information should enable the computation of the pseudonym given the identifier. In order to limit the likelihood of a successful guess or brute-force searching, the secrets should have sufficient entropy.

> For instance, if you know the transformation is merely a SHA256 hash of a name, you could apply this to all names you have elsewhere and then see which hashes match in the pseudonymised dataset.

> For pseudonymisation to be effective, it must not be possible with reasonable effort to reverse the chosen pseudonymising transformation based on its output alone.

> When using cryptographic algorithms, suitable building blocks include (keyed) pre-image

Contents:
1. The guidelines' own requirement that a pseudonymisation secret have sufficient entropy, framed directly against brute-force/dictionary searching.
2. The guidelines' own worked example of a dictionary-style attack on a plain, unkeyed hash — matching this topic's hook almost verbatim.
3. The guidelines' recommendation of keyed constructions (HMACs) as the building block that resists reversal, versus an unkeyed one-way function.

## Council of the European Union — Proposal for a Regulation Simplifying the Digital Legislative Framework (Digital Omnibus), COM(2025) 837 final

URL: https://data.consilium.europa.eu/doc/document/ST-15698-2025-INIT/en/pdf
Version: Council document 15698/25, transmitting COM(2025) 837 final of 19 November 2025 (fetched 2026-10-30)

> The existence of additional information enabling the data subject to be identified does not, in itself, mean that pseudonymised data must be regarded as constituting, in all cases and for every person or entity, personal data for the purposes of the application of Regulation (EU) 2016/679. In particular, it should be clarified that information is not to be considered personal data for a given entity where that entity does not have means reasonably likely to be used to identify the natural person to whom the information relates.

> The Commission may adopt implementing acts to specify means and criteria to determine whether data resulting from pseudonymisation no longer constitutes personal data for certain entities.

Contents:
1. The proposal's own recital language codifying the relative approach — tracing directly to the *EDPS v SRB* holding — into the GDPR's definition of personal data.
2. The new Article 41a this proposal would add, empowering the Commission to specify by implementing act when pseudonymised data stops being personal data for certain entities. **Status, stated in the topic:** a proposal, not law, dated 19 November 2025.

## EDPB-EDPS — Joint Opinion 2/2026 on the Proposal for a Regulation (Digital Omnibus)

URL: https://www.edpb.europa.eu/system/files/documents/2026-02/edpb_edps_jointopinion_202602_digitalomnibus_en.pdf
Version: Joint Opinion 2/2026, dated 10 February 2026 (fetched 2026-10-30)

> An implementing act as proposed could de facto affect the material scope of EU data protection law, effectively redefining the scope of when and for whom information is considered personal data. The EDPB and the EDPS consider that it should be the competence of supervisory authorities, under the control of the competent courts, to apply the definitions of the GDPR in an independent manner

> For all the above reasons, the EDPB and the EDPS therefore suggest deleting proposed Article 41a GDPR from the Proposal.

Contents:
1. The two regulators' own stated objection to Article 41a: an implementing act deciding the scope of "personal data" risks sitting with the Commission rather than supervisory authorities and courts.
2. Their explicit recommendation: delete Article 41a from the proposal.

## European Parliament — Legislative Train Schedule, "The Digital Omnibus Regulation Proposal"

URL: https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package
Version: Information updated as of 20/09/2026 (fetched 2026-10-30)

> Redefining "personal data" to allow AI companies greater flexibility in using such data. Pseudonymised data would not be considered personal data for an entity that does not have the means to re-identify the natural person to whom the information relates.

> The co-rapporteurs didn't propose key amendments on the GDPR and ePrivacy Directive (e.g. personal data definition or provisions on cookies), leaving them for committees' negotiations.

> The vote in COREPER II to approve the Council negotiating mandate prepared by the Cypriot Council Presidency, which was scheduled for 26 June was ultimately cancelled after agreement on some open issues could not be found. Work in the Council will now continue under the Irish Council Presidency.

Contents:
1. The tracker's own summary of the personal-data redefinition, confirming the topic's description of the proposal's effect.
2. Confirmation that the Parliament's own co-rapporteurs left the personal-data definition for later committee negotiation — the point is still open, not settled.
3. The specific status this topic states with its date: the Council's negotiating mandate vote was cancelled, not merely delayed to a later date without explanation.
