Last verified: 30 October 2026. Expert sign-off: pending. Three synthetic experiments run in
`examples.py` (real `hashlib`/`hmac` primitives over synthetic candidate lists, never real
personal data): a dictionary attack on a plain SHA-256 hash, the same attack against an
HMAC-keyed hash, and a linkage attack on quasi-identifiers that never touches the
pseudonymisation key — all asserts pass.

- GDPR, Article 4 — "Definitions": [gdpr-info.eu](https://gdpr-info.eu/art-4-gdpr/). The legal definition of pseudonymisation.
- GDPR, Recital 26 — "Not Applicable to Anonymous Data": [gdpr-info.eu](https://gdpr-info.eu/recitals/no-26/). Why pseudonymised data stays personal data.
- GDPR, Article 32 — "Security of processing": [gdpr-info.eu](https://gdpr-info.eu/art-32-gdpr/). Pseudonymisation named as a security measure.
- Court of Justice of the European Union, Press Release No 107/25, Case C-413/23 P, *EDPS v SRB*: [curia.europa.eu](https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250107en.pdf). The relative approach, and the controller's-perspective holding.
- European Data Protection Board, "Guidelines 01/2025 on Pseudonymisation" (version for public consultation, adopted 16 January 2025): [edpb.europa.eu](https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf). The dictionary-attack example and keyed-hash recommendation.
- European Commission, Proposal for a Regulation, COM(2025) 837 final, 19 November 2025 (Digital Omnibus), via Council document 15698/25: [data.consilium.europa.eu](https://data.consilium.europa.eu/doc/document/ST-15698-2025-INIT/en/pdf). The proposed relative-approach recital and new Article 41a.
- European Data Protection Board and European Data Protection Supervisor, Joint Opinion 2/2026 on the Digital Omnibus, 10 February 2026: [edpb.europa.eu](https://www.edpb.europa.eu/system/files/documents/2026-02/edpb_edps_jointopinion_202602_digitalomnibus_en.pdf). The regulators' objection to Article 41a.
- European Parliament, Legislative Train Schedule, "The Digital Omnibus Regulation Proposal" (updated 20/09/2026): [europarl.europa.eu](https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package). The proposal's current status.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=pseudonymisation-vs-anonymisation:%20).
