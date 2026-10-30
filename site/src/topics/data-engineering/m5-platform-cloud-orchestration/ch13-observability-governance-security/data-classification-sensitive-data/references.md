Last verified: 30 October 2026. Expert sign-off: pending. Five synthetic experiments run in
`examples.py` (pure Python, synthetic shop data, no real email, phone or card number used): the
Luhn checksum, a structured-column pattern-and-checksum scanner, a free-text miss-rate
measurement, a toy lineage-tag-propagation graph, and the unprotected-fraction calculation — all
asserts pass.

- GDPR, Article 4 — Definitions: [gdpr-info.eu](https://gdpr-info.eu/art-4-gdpr/). What "personal data" means as a fact about content.
- GDPR, Article 9 — Processing of special categories of personal data: [gdpr-info.eu](https://gdpr-info.eu/art-9-gdpr/). The legal basis for a stricter default on health, biometric and similar data.
- Amazon Macie, "Using managed data identifiers": [docs.aws.amazon.com](https://docs.aws.amazon.com/macie/latest/user/managed-data-identifiers.html). Pattern matching plus machine learning.
- Amazon Macie, "Building custom data identifiers": [docs.aws.amazon.com](https://docs.aws.amazon.com/macie/latest/user/custom-data-identifiers.html). Regex plus proximity rules.
- Amazon Macie, "Running sensitive data discovery jobs": [docs.aws.amazon.com](https://docs.aws.amazon.com/macie/latest/user/discovery-jobs.html). Automated discovery jobs over S3.
- Microsoft Purview, "Learn about sensitive information types": [learn.microsoft.com](https://learn.microsoft.com/en-us/purview/sit-sensitive-information-type-learn-about). Pattern-based classifiers, built-in and custom.
- Databricks, "Data Classification": [docs.databricks.com](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-classification). The vendor's own "agentic AI system" phrase.
- Google Cloud, "InfoType detector reference": [cloud.google.com](https://cloud.google.com/sensitive-data-protection/docs/infotypes-reference). InfoTypes, and the vendor's own accuracy caveat.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-classification-sensitive-data:%20).
