# References

- Open Data Contract Standard v3.1 Documentation, "Definition: Open Data Contract Standard (ODCS)": https://bitol-io.github.io/open-data-contract-standard/v3.1.0/
- Open Data Contract Standard v3.1 Documentation, "Schema": https://bitol-io.github.io/open-data-contract-standard/v3.1.0/schema/
- Open Data Contract Standard v3.1 Documentation, "Data Quality": https://bitol-io.github.io/open-data-contract-standard/v3.1.0/data-quality/
- Open Data Contract Standard v3.1 Documentation, "Service-Level Agreement (SLA)": https://bitol-io.github.io/open-data-contract-standard/v3.1.0/service-level-agreement/
- Open Data Contract Standard v3.1 Documentation, "Team": https://bitol-io.github.io/open-data-contract-standard/v3.1.0/team/
- PayPal, "Template for Data Contract" (README): https://raw.githubusercontent.com/paypal/data-contract-template/main/README.md
- Andrew Jones, "Data contracts" (the original GoCardless Tech Blog post's author, on his own site): https://andrew-jones.com/blog/data-contracts/

Last verified: 2026-10-31. Expert sign-off: pending.

Source substitution: CHAPTER.md's stated scope named GoCardless's and PayPal's own published engineering write-ups as sources. GoCardless's posts are published on Medium under the GoCardless Tech Blog, which returns a Cloudflare block in this sandbox; substituted with the same post's own author, GoCardless engineer Andrew Jones, republishing the identical argument on his own personal site, a reachable primary account by the person who actually built the pattern there. PayPal's own Medium engineering post on data contracts was similarly unreachable; substituted with PayPal's own open-sourced `data-contract-template` GitHub repository (the direct predecessor project that became ODCS), read from its README via raw.githubusercontent.com.

Software run in this sandbox: Python 3 standard library for a real ODCS-conformant contract dictionary, a breaking-change classifier reused as a producer-side CI gate, a runtime enforcement check against the same contract, and automated downstream-owner notification driven by a real lineage graph -- all run against a synthetic contract and table modeled on the shop's own `fct_orders`. Every quote is verified word for word against the fetched source text.
