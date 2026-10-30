## GDPR, Article 4 — Definitions

URL: https://gdpr-info.eu/art-4-gdpr/
Version: General Data Protection Regulation, Article 4 (fetched 2026-10-30)

> 'personal data' means any information relating to an identified or identifiable natural person ('data subject'); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person

Contents:
1. Primary legal text for what "personal data" is as a fact about content, independent of any
   sensitivity tier a platform assigns to it.

## GDPR, Article 9 — Processing of special categories of personal data

URL: https://gdpr-info.eu/art-9-gdpr/
Version: General Data Protection Regulation, Article 9 (fetched 2026-10-30)

> Processing of personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or trade union membership, and the processing of genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health or data concerning a natural person's sex life or sexual orientation shall be prohibited.

Contents:
1. The legal basis for a category like PHI being handled under a stricter default than ordinary
   personal data.

## Amazon Macie — Using managed data identifiers

URL: https://docs.aws.amazon.com/macie/latest/user/managed-data-identifiers.html
Version: Amazon Macie User Guide (fetched 2026-10-30)

> Amazon Macie uses a combination of criteria and techniques, including machine learning and pattern matching, to detect sensitive data in Amazon Simple Storage Service (Amazon S3) objects.

Contents:
1. Macie's own description of combining pattern matching and machine learning for its managed
   data identifiers.

## Amazon Macie — Building custom data identifiers

URL: https://docs.aws.amazon.com/macie/latest/user/custom-data-identifiers.html
Version: Amazon Macie User Guide (fetched 2026-10-30)

> A custom data identifier is a set of criteria that you define to detect sensitive data in Amazon Simple Storage Service (Amazon S3) objects. The criteria consist of a regular expression (regex) that defines a text pattern to match and, optionally, character sequences and a proximity rule that refine the results.

Contents:
1. Macie's custom data identifiers as regex-plus-proximity rules, the pattern technique this
   topic's own runnable scanner stands in for.

## Amazon Macie — Running sensitive data discovery jobs

URL: https://docs.aws.amazon.com/macie/latest/user/discovery-jobs.html
Version: Amazon Macie User Guide (fetched 2026-10-30)

> With Amazon Macie, you can create and run sensitive data discovery jobs to automate discovery, logging, and reporting of sensitive data in Amazon Simple Storage Service (Amazon S3) general purpose buckets.

Contents:
1. Macie's discovery jobs as the automated scanning mechanism the syllabus names.

## Microsoft Purview — Learn about sensitive information types

URL: https://learn.microsoft.com/en-us/purview/sit-sensitive-information-type-learn-about
Version: Microsoft Purview documentation (fetched 2026-10-30)

> Sensitive information types (SITs) are pattern-based classifiers. They detect sensitive information like social security, credit card, or bank account numbers to identify sensitive items

> If the preconfigured sensitive information types don't meet your needs, you can create your own custom sensitive information types that you fully define or you can copy one of the built-in ones and modify it.

Contents:
1. Purview's own pattern-based classifier definition for sensitive information types.
2. Purview's built-in versus custom sensitive information types, the vendor-named split the
   syllabus's "built-in system classifications and custom classifications" clause draws on.

## Databricks — Data Classification

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-classification
Version: Databricks on AWS documentation (fetched 2026-10-30)

> To address this problem, Databricks Data Classification uses an agent to automatically classify and tag tables in your catalog.

> Classify data: The engine uses an agentic AI system to automatically classify and tag any tables in Unity Catalog.

Contents:
1. Databricks' own statement that an agent automatically classifies and tags Unity Catalog
   tables.
2. The vendor's own phrase "agentic AI system," the third classification technique (LLM-based
   agents) this topic names alongside pattern matching and trained models.

## Google Cloud — InfoType detector reference (Sensitive Data Protection)

URL: https://cloud.google.com/sensitive-data-protection/docs/infotypes-reference
Version: Google Cloud Sensitive Data Protection documentation (fetched 2026-10-30)

> Sensitive Data Protection uses information types—or infoTypes—to define what it scans for. An infoType is a type of sensitive data, such as a name, email address, telephone number, identification number, or credit card number.

> Built-in infoType detectors are not a perfectly accurate detection method. For example, they can't guarantee compliance with regulatory requirements.

Contents:
1. Vendor source for the fourth product the syllabus names (Google's Sensitive Data Protection
   infoType detectors).
2. The vendor's own admission of a detection miss rate, which this topic's false-negatives clause
   builds on.

---

Last verified 2026-10-30. All eight sources checked clean (0 problems) with
`node scripts/sources.mjs check`.
