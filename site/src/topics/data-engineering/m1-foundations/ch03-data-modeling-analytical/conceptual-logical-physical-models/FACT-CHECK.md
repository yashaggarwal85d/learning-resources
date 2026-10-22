# Fact-check — Conceptual, logical and physical models

No runnable system backs this topic: it is a refresher on a definitional framework, not a measured system behaviour.
Every claim is sourced to Wikipedia's "Data modeling" article or G. Everest's (University of Minnesota) "Conceptual
vs. Logical vs. Physical Data Models" lecture page (both fetched 2026-10-22), or is a worked example traced by hand
from those sourced definitions — never an independent measurement.

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Three model types are produced progressing from requirements to database: conceptual, logical, physical, in that order. | Confirmed, quoted directly. | Wikipedia, "Data modeling" |
| 2 | The conceptual model is a technology-independent specification used to discuss requirements with business stakeholders. | Confirmed, quoted directly. | Wikipedia, "Data modeling" |
| 3 | The logical model documents structures that can be implemented in databases; one conceptual model may require multiple logical models. | Confirmed, quoted directly. | Wikipedia, "Data modeling" |
| 4 | The physical model organizes data into tables and accounts for access, performance and storage details. | Confirmed, quoted directly. | Wikipedia, "Data modeling" |
| 5 | In many environments, the distinction between logical and physical is blurred. | Confirmed, quoted directly. | Wikipedia, "Data modeling" |
| 6 | The conceptual model is commonly presented to executives for an initial, high-level understanding. | Confirmed, quoted directly. | G. Everest, "Conceptual vs. Logical vs. Physical Data Models" |
| 7 | The physical model is how data is actually stored in a DBMS or NoSQL tool. | Confirmed, quoted directly. | G. Everest, "Conceptual vs. Logical vs. Physical Data Models" |
| 8 | The worked example (a customer can have more than one address, shown at all three levels with crow's-foot cardinality at the logical level and a `CREATE TABLE` with a foreign key at the physical level) is this topic's own illustration, not a sourced claim about any real system. | Not a factual claim — a worked example built from claims 1–4. | — |

Red-team on the predict step (step 3): the plausible wrong answer is that the conceptual level, because it already
states "a customer can have more than one address," has implicitly fixed the one-to-many cardinality. The source
text draws the line at a different place — cardinality and structure belong to the logical model (claim 3), and
claim 2 says the conceptual model only names entities and their relationships, not their shape. The predict is
built directly against that distinction.

No claim here needed a primary-source fetch beyond the one Wikipedia article: the three-level framework is a
standard framing with no vendor-specific or version-specific behaviour to verify against a running system.
