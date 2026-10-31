Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
topic's own in-process raw layer and silver table: a correction appended as a new record, two
silver builds checksummed against each other, a buggy-versus-fixed currency transform rebuilt
and diffed row by row, and an erasure request measured against both a plaintext and a tokenized
raw layer.

- Databricks docs, "What is a Medallion Architecture?": [www.databricks.com](https://www.databricks.com/blog/what-is-medallion-architecture). The bronze-layer definition this topic's own raw layer implements.
- GDPR text, Article 17(1): [gdpr-info.eu](https://gdpr-info.eu/art-17-gdpr/). The erasure obligation this topic's own measurement answers.
- GDPR text, Article 5(1)(e): [gdpr-info.eu](https://gdpr-info.eu/art-5-gdpr/). The storage-limitation duty this topic's retention tension is built around.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=raw-bronze-landing-layer:%20).
