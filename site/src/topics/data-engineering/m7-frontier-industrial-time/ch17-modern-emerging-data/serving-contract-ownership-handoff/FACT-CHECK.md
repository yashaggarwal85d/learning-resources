# Fact-check — de.serving-contract-ownership-handoff

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Minerva took fact and dimension tables as inputs, performed data denormalization, and served the aggregated data to downstream applications. | Vu Trinh (secondary, quoting/summarizing Airbnb's own Minerva posts) | Verified, quoted; attributed to a secondary source, not Airbnb's own primary post, per Problem Solving below |
| 2 | At the time of Airbnb's sharing, Minerva contained more than 12,000 metrics and 4,000 dimensions, with 200+ data producers across different functions and teams. | Vu Trinh (secondary) | Verified, quoted; attributed explicitly as a secondary-source number |
| 3 | Minerva ran on Airflow for workflow orchestration, Apache Hive and Spark for the compute engine, and Presto and Apache Druid for serving. | Vu Trinh (secondary) | Verified, quoted |
| 4 | The same architecture and the same 12,000-metrics/4,000-dimensions figures are corroborated independently by a second, unrelated secondary source. | StarRocks blog (secondary, independent of Vu Trinh's post) | Verified, quoted |
| 5 | Minerva's own stated design goal, per a secondary source: "define metrics once, use them everywhere," with data defined in a single place. | StarRocks blog (secondary) | Verified, quoted |
| 6 | A single underlying mart, queried two different ways, each syntactically correct on its own terms, produces two different totals when a join fans out across an undocumented grain. | This topic's own examples.py (measured) | Measured in this sandbox |
| 7 | The identical two "dashboards," made to call one compiled metric definition instead of writing their own SQL, produce identical results by construction. | This topic's own examples.py (measured) | Measured in this sandbox |

## Currency check

- Both secondary sources describe Minerva as of their own publication dates (Vu Trinh's post and
  the StarRocks blog post, both read live at research time, 30 October 2026); the specific
  12,000-metric figure is explicitly dated to "the time of Airbnb's sharing" in the first source,
  and this topic repeats that framing rather than presenting the number as current.
- CHAPTER.md's own instruction is followed exactly: "any number not stated directly in Airbnb's
  own post attributed to the secondary source that reports it" — since Airbnb's own post could
  not be fetched directly in this sandbox (see Problem Solving), every Minerva-specific number and
  architectural claim in this topic is attributed to the secondary sources that report it, never
  stated as this course's own verification of Airbnb's primary text.
- The two secondary sources independently agree on the same core numbers (12,000 metrics, 4,000
  dimensions) and the same technology stack (Airflow, Hive, Spark, Presto, Druid), which is read
  here as corroboration between two independent write-ups, not as a substitute for having fetched
  Airbnb's own post.

## Red team

1. **Is it acceptable to source the Minerva case study from two secondary write-ups instead of
   Airbnb's own blog post, when CHAPTER.md's own sourcing line asks for the latter?** This is a
   documented substitution (see Problem Solving), made because medium.com — where both of Airbnb's
   own Minerva posts are hosted — returns HTTP 403 to this sandbox's fetcher on every URL tried,
   a domain-wide limitation, not a problem specific to this one post. The substitution is flagged
   plainly in SOURCES.md's own source titles ("secondary write-up quoting and summarizing
   Airbnb's own Minerva posts"), in this FACT-CHECK, and in REVIEW.md, rather than silently
   presented as if Airbnb's post had been fetched directly.
2. **Could a secondary write-up have paraphrased Airbnb's own numbers inaccurately?** Two
   independent secondary sources (Vu Trinh's post and the unrelated StarRocks blog post) report
   the identical 12,000-metrics/4,000-dimensions figures and the identical five-system technology
   stack without having cited each other, which is evidence against either having simply
   miscopied the number from the other.
3. **Does the hook's two-dashboard scenario oversimplify real grain mismatches, which are usually
   subtler than a 2x fan-out?** The topic's own `examples.py` uses a small, legible fan-out (3
   bookings, one multi-night) specifically so the mechanism is visible at a glance; CHAPTER.md's
   own outcome asks the topic to "diagnose a double-counted dashboard as an undocumented-grain
   failure," which this example demonstrates mechanically rather than claiming the specific
   numbers generalize to any particular real-world mismatch's size.
4. **Does naming "analytics engineers" as the typical owner of metric definitions risk overstating
   a universal job-title convention?** CHAPTER.md's own scope line hedges this correctly
   ("typically"), and this topic follows that hedge rather than asserting it as a rule every
   organization follows; the actual claim this topic commits to is the division of skills (moving
   data at scale vs. defining a metric correctly for the business), not a specific title.
5. **Does the Prove It step's "bypassed the metric layer" scenario state a fact about SQL tooling
   that isn't actually testable?** The scenario's claim is organizational, not a tooling fact: an
   analyst who writes their own SQL instead of calling the compiled metric is, by definition,
   computing the metric a second, independent way — the failure mode this topic's own
   `examples.py` demonstrates directly with the booking-grain vs. line-item-grain queries.

## Problem Solving

Direct fetches of both of Airbnb's own Minerva Medium posts ("How Airbnb Achieved Metric
Consistency at Scale" and its architecture follow-up) returned HTTP 403 in this sandbox, as did a
third, unrelated Airbnb Engineering Medium post fetched as a control — confirming this is a
domain-wide `medium.com` limitation in this environment, not specific to the Minerva posts or to
Airbnb's blog. Medium's own RSS feed for the Airbnb Engineering publication fetched successfully
but does not carry posts this old. Substituted two independent, English-language secondary
sources (Vu Trinh's Substack write-up, which directly quotes and summarizes Airbnb's own posts,
and an unrelated StarRocks blog post that independently corroborates the same architecture and
figures) rather than a translated or AI-generated summary, and documented the substitution
explicitly rather than presenting either secondary source as if it were Airbnb's own primary text.
