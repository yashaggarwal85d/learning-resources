# Fact-check — de.data-classification-sensitive-data

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | "Personal data" is any information relating to an identified or identifiable natural person. | GDPR Art. 4 | Confirmed, quoted verbatim. |
| 2 | Processing data revealing racial/ethnic origin, health data, etc. ("special categories") is prohibited by default. | GDPR Art. 9 | Confirmed, quoted verbatim. |
| 3 | Amazon Macie combines machine learning and pattern matching to detect sensitive data via managed data identifiers. | AWS Macie docs | Confirmed, quoted verbatim. |
| 4 | A Macie custom data identifier is a regex plus optional keyword/proximity rules. | AWS Macie docs | Confirmed, quoted verbatim. |
| 5 | Macie's sensitive data discovery jobs automate discovery, logging and reporting across S3 buckets. | AWS Macie docs | Confirmed, quoted verbatim. |
| 6 | Purview's sensitive information types (SITs) are pattern-based classifiers; built-in ones can be copied and customized. | Microsoft Purview docs | Confirmed, quoted verbatim. |
| 7 | Databricks Data Classification uses an agent / "agentic AI system" to automatically classify and tag Unity Catalog tables. | Databricks docs | Confirmed, quoted verbatim. |
| 8 | Google Sensitive Data Protection uses infoTypes/infoType detectors to define what it scans for, and built-in detectors are not perfectly accurate. | Google Cloud docs | Confirmed, quoted verbatim. |
| 9 | The Luhn algorithm is a checksum that validates whether a sequence of digits (such as a card number) is internally consistent. | Standard algorithm, used in `examples.py`'s own implementation, not separately sourced (a well-known public-domain checksum, same treatment as the common-knowledge "declared" items in topics 1-3). | Standard algorithm; verified by `examples.py`'s own asserts against known valid/invalid test numbers. |

## Red-team: the predict question (step 2)

**Question:** does a model classifier close the free-text miss rate entirely, partly, or does a
genuine gap remain?

**Attack 1 — "surely an LLM reads prose perfectly."** No vendor source claims this. Google's own
infoType reference states built-in detectors "are not a perfectly accurate detection method,"
and nothing in the Macie, Purview or Databricks sources claims complete free-text coverage
either — the honest answer (a model closes much of the gap but not all of it) is the vendor-
documented one, not an invented caveat.

**Attack 2 — "then why discover at all if it's never complete?"** Because a partial reduction in
miss rate (near-perfect on structured columns, materially better but not perfect on free text)
is still the only lever available; the topic's own thesis (step 8) is that the resulting residual
risk must be carried forward as a known miss rate into every later policy decision, not treated
as zero.

**Attack 3 — "what if the synthetic test set in `examples.py` just isn't representative?"** True
in general; the example is a worked illustration of the mechanism (a regex scanner's recall drop
on free text relative to structured data), not a claim about any vendor's real-world recall
number, which this topic does not have access to and does not assert.
