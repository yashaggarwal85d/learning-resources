# Fact-check — de.zero-etl-replication

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | AWS's own Redshift documentation: the following sources are currently supported for zero-ETL integrations — Aurora MySQL, Aurora PostgreSQL, DynamoDB, RDS for MySQL/Oracle/PostgreSQL, Oracle Database@AWS, plus named SaaS applications and self-managed databases. | AWS, Zero-ETL integrations (Redshift) | Verified, quoted |
| 2 | AWS's own Redshift documentation: to create a zero-ETL integration, you specify a source and a Redshift warehouse as target; after an initial data load, the integration replicates data from source to target. | AWS, Zero-ETL integrations (Redshift) | Verified, quoted |
| 3 | AWS's own DynamoDB developer guide: on activation, the integration exports the full DynamoDB table, then incrementally replicates updates every 15–30 minutes using DynamoDB's own incremental exports. | AWS, DynamoDB zero-ETL integration with Amazon Redshift | Verified, quoted |
| 4 | AWS's own DynamoDB developer guide: a zero-ETL integration requires the source DynamoDB table to have point-in-time recovery (PITR) enabled. | AWS, DynamoDB zero-ETL integration with Amazon Redshift | Verified, quoted |
| 5 | Microsoft's own Fabric documentation: mirroring for a SQL database in Fabric starts upon creation with no user action required, with no settings to configure. | Microsoft Fabric, Overview of Mirroring for SQL database | Verified, quoted |
| 6 | Microsoft's own Fabric documentation: mirrored data is stored as Delta Parquet files in OneLake. | Microsoft Fabric, Overview of Mirroring for SQL database | Verified, quoted |
| 7 | (This course) every "zero-ETL" integration is log-based CDC running inside a vendor's managed infrastructure. | This topic's own central claim, built on this course's prior CDC mechanism (named forward, not yet live) | Stated as this course's own synthesis, not attributed to either vendor's documentation |
| 8 | (This course) a sandbox reproduction of a managed zero-ETL integration's cadence and prerequisites, executed for real against this sandbox's own Postgres. | This topic's own examples.py (measured) | Measured in this sandbox |
| 9 | (This course) three named costs of giving up pipeline control: schema-change timing, filtering limits, vendor billing. | This topic's own synthesis, drawn from the documented mechanism's own implications | This course's own connecting claim |
| 10 | (This course) a documented 15–30 minute window cannot reliably meet a stated freshness requirement that falls inside its own range. | This topic's own worked scenario, a direct arithmetic consequence of claim 3's documented range | This course's own synthesis of claim 3 |

## Currency check

- All three vendor documentation quotes (AWS Redshift, AWS DynamoDB, Microsoft Fabric) are read
  from each project's own live documentation page at research time (30 October 2026), not from a
  cached or historical snapshot.
- CHAPTER.md's own scope line is explicit that this topic reproduces "the shape of this (not the
  managed service itself, which needs an AWS account)" — this topic follows that instruction by
  running a real initial-load-then-incremental-window reproduction against this sandbox's own
  Postgres (claim 8), never claiming to have exercised AWS's or Microsoft's actual managed
  service, and labeling the reproduction as a model of the documented cadence throughout
  post-notes.md and the reel itself.
- The streaming-lakehouse convergence ideas the syllabus marks *(skipped)* in the rest of §17.9
  (streams-as-tables, declarative incremental tables) are named only as "the same subsection, not
  taught here," per CHAPTER.md's own "Leaves out" line, and are not claimed or quoted anywhere in
  this topic.

## Red team

1. **Is reproducing "the shape" of DynamoDB's zero-ETL cadence on Postgres instead of DynamoDB
   itself a bait-and-switch — teaching one system's mechanism while claiming to model another's?**
   No — CHAPTER.md explicitly instructs this substitution ("not the managed service itself, which
   needs an AWS account... treating the managed service's own documented cadence and prerequisites
   as the thing being modeled"), and this topic's examples.py and post-notes.md both state plainly
   that the reproduction models the documented *cadence and prerequisite shape* (initial load, then
   a fixed incremental window, with a continuous-retention prerequisite), not DynamoDB's own
   internal incremental-export mechanism, which this sandbox cannot run.
2. **Does naming "zero-ETL is managed log-based CDC" risk overstating certainty about
   implementation details AWS and Microsoft don't publish?** The claim is scoped carefully: it
   names the category of mechanism (log-based CDC, the course's own already-taught vocabulary),
   not a specific undisclosed implementation detail of either vendor's actual production system;
   neither vendor's documentation is quoted as confirming this directly, and FACT-CHECK states the
   claim as this course's own synthesis (claim 7), not an AWS- or Microsoft-sourced fact.
3. **Is the Prove It step's "twenty-minute requirement, 15–30 minute window" arithmetic actually
   sound, or does it assume worst-case behavior that may not reflect real-world performance?** The
   reasoning is conservative by design: AWS's own documentation states the window as a range
   ("every 15-30 minutes"), not a guaranteed upper or lower bound; a requirement inside that range
   cannot be certified as met without a tighter guarantee than the vendor actually publishes, which
   is exactly the lesson (don't trust a cadence inside its own documented uncertainty).
4. **Could the hook's "missing fraud for up to half an hour at a time" number be read as an AWS
   figure rather than a hook-framing device?** It's explicitly a scenario, built directly from
   DynamoDB's own documented 15–30 minute window (claim 3) applied to a worst case, not a separate
   cited statistic; it does not appear in coverage.json's expert items or this fact-check's claims
   table as an independent sourced claim.
5. **Does treating Redshift's zero-ETL and Fabric's mirroring as "the comparable pattern" risk
   conflating two differently-engineered systems?** CHAPTER.md's own phrasing already frames
   Fabric mirroring as "the comparable pattern on Microsoft's platform," and this topic's claims
   about each (claims 1-4 for AWS, 5-6 for Microsoft) are kept separate and sourced individually
   from each vendor's own documentation — the shared category is "managed CDC into an analytics
   engine," not a claim that their specific mechanisms are identical.

## Problem Solving

All three sources fetched cleanly on the first URL tried, with one wrinkle on the DynamoDB page:
the slug guessed from CHAPTER.md's generic phrasing ("the DynamoDB developer guide's zero-ETL
page") was not the actual path; the correct slug (`RedshiftforDynamoDB-zero-etl.html`) was found
and fetched cleanly once confirmed. No content substitution was needed anywhere in this topic;
only one URL guess needed correcting.
