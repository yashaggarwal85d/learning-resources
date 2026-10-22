# Chapter 3 plan: Data Modeling and Analytical Architecture (Data Engineering, Milestone 1)

This is the contract for every topic of Chapter 3. Builders keep to their own entry and read the entries next to theirs. Don't edit this file except to append the next topic's entry in syllabus order, immediately after drafting it.

- **Planned:** 22 October 2026, from `syllabus/data-engineering.md` §3.1–§3.4, continuing straight on from the shipped Chapter 2 (`site/src/topics/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/CHAPTER.md`).
- **Registry fields shared by every topic:** `domain: 'data-engineering'`, `milestone: { number: 1, title: 'Foundations' }`, `chapter: { number: 3, title: 'Data modeling and analytical architecture', section: '3.1' | '3.2' | '3.3' | '3.4' }`, `slug` = the folder below `site/src/topics/`. The registry `title` is the syllabus title unless the entry names a different **Registry title**; `syllabusTitle` is always the heading's title word for word. Every topic here ships `status: 'live'` directly on completion, per the owner's standing instruction (no held-batch model for this chapter).
- **Engine of record:** PostgreSQL 16.15/18.6 (the sandbox's existing instances) for every runnable relational example; dbt-core and DuckDB for the modern-modeling-layer topics (§3.4), since dbt's own CLI runs against a local DuckDB target without any cloud account. A topic names a cloud warehouse (Snowflake, Databricks) or a specific object-storage service only for a feature the sandbox genuinely cannot run, and discloses that honestly as sourced-only (this chapter's own continuation of Chapter 2's honest-gap pattern).

---

## The chapter

### The problem it solves

Chapter 2 priced and explained a query against a schema that already existed. This chapter is about deciding what that schema should be, and why: how to split business reality into conceptual, logical and physical layers; how to pick keys that survive the business changing under them; how a warehouse's own competing philosophies (Inmon's single integrated model vs Kimball's dimensional bus) trade time-to-value against long-term integration cost; how a Data Vault's hub/link/satellite split buys auditability at a real join-count price; how to build and evolve a star schema correctly under late-arriving, out-of-order, and slowly-changing data; how the physical home for all of this moved from a coupled warehouse to a lake to an open-table-format lakehouse, and what each stage still does best; and how a modern governance and transformation layer (data contracts, semantic layers, dbt) keeps all of the above correct and discoverable as more people touch it. The learner leaves able to model a real operational domain three competing ways, defend the choice with a real tradeoff rather than a slogan, and build the SCD2/star-schema machinery that keeps a warehouse's history correct under real-world data defects.

### Order of ideas, and why

1. **§3.1 Modeling foundations (topics 1–7).** Three refreshers first, since nothing else in the chapter means anything without them: the conceptual/logical/physical split (1) → why OLTP and OLAP shapes pull schema design in opposite directions (2) → ER modeling and cardinality, the notation the rest of the chapter draws with (3). Then the two structural decisions that cut across every later topic: functional dependencies and normalization, which gives the vocabulary for "correct" and for the anomalies denormalization reintroduces (4) → key design, since every later fact/dimension/hub needs a key that survives real change (5). The chapter then closes its foundations section by contrasting three competing philosophies for organizing all of this at warehouse scale: Inmon vs Kimball (6) → Data Vault 2.0, the auditability-first alternative to both (7).
2. **§3.2 Dimensional modeling at scale (8–15).** Topic 6 introduced Kimball's bus architecture by name; this section builds it for real, in the order Kimball's own methodology insists on: grain first, before a single column is drawn (8) → the four fact-table types that grain decision produces (9) → conformed dimensions, which is what lets facts of different grains drill across each other at all (10) → the dimension patterns (degenerate, role-playing, junk, outrigger) that keep dimension tables themselves honest (11) → bridge tables, the one place a star's clean one-to-many assumption breaks and must be repaired (12). Then the chapter's hardest and most tested mechanism: SCD Type 2, built once, carefully, with hash-diff detection and idempotent MERGE loads (13) → the full SCD 0–7 menu that 13's Type 2 is one point in, and when to pick a different point (14) → late-arriving facts and dimensions, the real-world defect that breaks a naive SCD2 implementation and that 13's design has to anticipate (15).
3. **§3.3 Warehouse vs lake vs lakehouse (16–20).** Zooms out from table design to platform design: the three-stage architectural history, warehouse → lake → lakehouse, and what each still does best (16) → the economics that actually drove that history, object storage's own billing model (17) → compute-storage separation, the architectural consequence of 17's economics (18) → medallion architecture, the layering convention lakehouses settled on, and its real failure modes (19) → Lambda vs Kappa, the older batch/streaming architectural debate that the lakehouse's unified engines mostly resolved (20).
4. **§3.4 Modern modeling and governance layer (21–25).** Last, the organizational and tooling layer that keeps everything above correct as more teams touch it: data mesh, the organizational response to a single team no longer being able to own every model (21) → data contracts, the enforcement mechanism a mesh's federated teams need at their own boundaries (22) → semantic and metrics layers, which compile one metric definition to SQL so different tools stop disagreeing about what "revenue" means (23) → dbt itself, the tool that actually builds models, tests and lineage graphs in most real warehouses today (24) → incremental models and snapshots, dbt's own practical answer to topic 13's SCD2 problem at pipeline scale (25). This hands off to Chapter 4 (Advanced Python for Data Systems), which starts from the control-plane language every one of these pipelines is actually written in.

### One running example: the shop's warehouse, modeled three ways

Same fictional online shop as Chapters 1–2 (no real company, no real person). Where Chapter 2 queried `orders`/`customers`/`products` as already-built OLTP tables, this chapter models that same business domain from scratch, three times, as the §3.1 lab requires: a normalized 3NF operational model, a Kimball star (`fact_orders` grained at one row per order line, `dim_customer`, `dim_product`, `dim_date`), and a Data Vault (hub_customer, hub_product, hub_order, link_order_product, satellites for descriptive history). `dim_customer` carries an address history (the SCD2 and Data Vault satellite running example for §3.1–§3.2); a topic may scale row counts up or down if it says how that relates to Chapter 2's fixed 100,000,000-row `orders` table. Every number shown on screen is computed or asserted in that topic's own code sample, following Chapter 2's practice of local measurement over assertion wherever the sandbox allows it, and explicit sourced-only disclosure where it doesn't (Snowflake/Databricks/cloud-object-storage claims).

### Shared notation and terms

- **Carries over from Chapters 1–2 unchanged:** PostgreSQL as the default engine and version-stated claims for any other engine; the chapter's own measured-vs-sourced-only disclosure habit from Chapter 2's `FACT-CHECK.md` convention; narration with no digits, symbols or code names, numbers spoken aloud.
- **ER notation** (topic 3 introduces, every later topic may use without re-explaining): crow's-foot cardinality (1:1, 1:N, M:N) and optionality (mandatory vs optional), drawn the same way for every entity relationship diagram in the chapter.
- **Normalization vocabulary** (topic 4 introduces, reused through the chapter): functional dependency (`A → B`), candidate key, attribute closure, 1NF/2NF/3NF/BCNF/4NF, lossless and dependency-preserving decomposition.
- **Dimensional vocabulary** (topics 8–9 introduce, reused through §3.2–§3.4): grain, fact, dimension, additive/semi-additive/non-additive measure, conformed dimension, degenerate/role-playing/junk/outrigger dimension, bridge table, SCD Type 0–7.
- **Data Vault vocabulary** (topic 7 introduces): hub, link, satellite, hash key, raw vault vs business vault, point-in-time (PIT) table, bridge table (Data-Vault sense, distinct from the dimensional bridge table of topic 12 — the chapter is explicit each time about which sense is meant).
- **Spoken numbers:** narration has no digits, symbols or code names (same automatic check as Chapters 1–2).
- **Versions to state, not assume:** dbt-core's current major version and release date; PostgreSQL 18's `PERIOD`/`WITHOUT OVERLAPS` syntax is named only where relevant background, since the bitemporal-modeling topic that would teach it directly is marked `(skipped)`; MetricFlow's Apache 2.0 open-sourcing date (October 2025); the Open Data Contract Standard's current version (v3.1).

### One visual language for the chapter's reels

Builds on Chapters 1–2's grammar (`crema`/`latte`/`taupe`/`caramel`/`cinnamon`/`cherry`, the same `Stack`/`Svg`/`T`/`Bar`/`C` kit) and adds the conventions this chapter needs:

- **An ER diagram uses crow's-foot notation drawn in the kit's line and box primitives**, mandatory relationships as a solid stroke and optional ones dashed, introduced in topic 3 and reused (with a Kimball-specific skin: dimensions as satellite boxes around a central fact box) from topic 8 on, and with a Data-Vault-specific skin (hubs as hexagons, links as diamonds, satellites as rounded rectangles) in topic 7.
- **A fact table's grain is drawn as the single row the whole diagram pivots around**, with every dimension's full key shown joining into it, so a reader can see directly whether a measure is additive across a given dimension.
- **An SCD Type 2 timeline is drawn as a horizontal row of version bars**, each with its own effective/expiry timestamps and a current-flag marker on the last bar, extended in topic 14 to a small gallery of the Type 0/1/3/4/5/6/7 variants side by side for direct comparison.
- **A medallion/lakehouse layer diagram is drawn as horizontal bands (bronze/silver/gold or raw/conformed/mart)**, consistent with how topic 19 and topic 16 both need to show the same kind of layered architecture.
- Full topics keep Chapters 1–2's reel shape (hook → predict → mechanism in steps → takeaways → recap → "Prove it"). Refreshers (topics 1–3, per the syllabus) keep the same shape at reduced length, about five minutes, one predict minimum, ending in a short "In one breath" recap rather than a closing quiz.

### The chapter labs: who hosts what

| Lab part (syllabus words) | Host topic, Deep dive section |
|---|---|
| §3.1 "model one operational domain... 3NF, star schema, Data Vault... compare load/query complexity and address-as-of-order-date" | Topic 7 (Data Vault) hosts the full three-way comparison, since it is the last topic of the section and the one whose own subject (auditability) the "address as of order date" question most directly tests; it previews the star schema only at the structural level topic 6 (Inmon vs Kimball) already introduced, not with §3.2's full dimensional machinery. |
| §3.2 "SCD Type 2 with MERGE in two engines... replay out of order and duplicates... prove idempotency... bridge table... double counting... fix with weights" | Topic 13 (SCD Type 2 implementation) hosts the MERGE/replay/idempotency parts directly, in its own subject; topic 12 (bridge tables) hosts the double-counting demonstration and its weighting fix. |
| §3.3 "store the same dataset as raw JSON, Parquet, and Iceberg or Delta... fixed query set from two engines... bytes scanned, requests, latency, projected cost" | Topic 17 (object storage and query economics) hosts this directly, since billing-model mechanics are its own subject. |
| §3.4 "build the §3.2 star in dbt with model contracts, unit tests and a microbatch incremental fact; define three metrics in MetricFlow; compare dbt Fusion vs SQLMesh" | Topic 25 (incremental models and snapshots in dbt) hosts the dbt build, contracts, tests and microbatch-incremental parts; topic 23 (semantic and metrics layers) hosts the MetricFlow metrics definition. The dbt Fusion vs. SQLMesh comparison is **not hosted**: both `dbt Fusion engine and SQL comprehension` and `SQLMesh plans and virtual environments` are marked `(skipped)` in the syllabus, so neither gets a reel to build that comparison inside; this is recorded here rather than silently dropped. |

---

## The topics, in syllabus order

Folder prefix for every topic: `site/src/topics/data-engineering/m1-foundations/ch03-data-modeling-analytical/`. Concept ids are kebab-case. A concept is in `uses` only if a topic above it (in this chapter or Chapters 1–2) introduces it, and `declared` lists knowledge every reader of this course already has.

---

### 1. Conceptual, logical and physical models (`de.conceptual-logical-physical-models`): refresher, §3.1

- **Folder:** `conceptual-logical-physical-models`. About 5 min.
- **Scope:** "what each level fixes (business entities, platform-neutral structure, engine-specific layout) and how decisions flow from one to the next" — the full syllabus line; this is the whole topic.
- **Outcomes:** Name what each of the three levels fixes and what it deliberately leaves open; trace one business decision (e.g. "a customer can have more than one address") down through all three levels to a concrete column.
- **Introduces:** `conceptual-logical-physical-split`. **Uses:** none. **Declared:** basic familiarity with "a schema."
- **Bridge:** "Chapter two priced and explained a query against a schema that already existed. This chapter starts from the decision before that: what the schema should even be, and why — starting with the three levels every one of those decisions passes through."
- **Handoff:** "The conceptual level fixed business entities; the physical level fixed engine-specific layout. Next: the two workload shapes, OLTP and OLAP, that pull physical-level decisions in opposite directions for the exact same conceptual model."
- **Prerequisites panel:** basic SQL (declared); none from earlier chapters strictly required, since this is the chapter's own starting point.
- **Visual idea:** one business fact ("a customer can have more than one address") shown dropping through three horizontal bands — conceptual (a box labeled Customer, a box labeled Address, a line between them), logical (an ER diagram with cardinality), physical (an actual `CREATE TABLE` with a foreign key) — the same fact, three different levels of commitment.
- **Lab:** none of its own.
- **Sources:** a standard data-modeling reference for the three-level split (to be fetched and quoted at research time — candidates: Kimball Group's own glossary, or a widely cited database-design textbook chapter available online).

### 2. OLTP vs OLAP workload shapes (`de.oltp-vs-olap-workload-shapes`): refresher, §3.1

- **Folder:** `oltp-vs-olap-workload-shapes`. About 5 min.
- **Scope:** "point reads/writes vs large scans and aggregates; normalization pressure, row vs column layout and indexing, and why one schema rarely serves both" — the full syllabus line.
- **Outcomes:** Contrast OLTP and OLAP by access pattern, not just by name; state why normalization pressure pulls OLTP schemas toward many small tables and OLAP schemas toward fewer, wider ones; name row vs column layout as the physical consequence.
- **Introduces:** `oltp-vs-olap-shape`. **Uses:** `conceptual-logical-physical-split`. **Declared:** basic SQL.
- **Bridge:** "The conceptual level fixed business entities; the physical level fixed engine-specific layout. This topic is the clearest case of that: the same business entities, physically laid out two completely different ways, for two different workloads." (Answers topic 1's handoff.)
- **Handoff:** "Point reads and large scans pull physical layout in opposite directions, but both still need the same underlying relationships named precisely. Next: the notation — ER diagrams and cardinality — that names those relationships the same way regardless of which workload ends up reading them."
- **Prerequisites panel:** topic 1 (Before this).
- **Visual idea:** two side-by-side layouts of the identical `orders` row set — a row-oriented strip (OLTP, one full row fetched at a time) and a column-oriented strip (OLAP, one column scanned across many rows) — with a single query type (a point lookup vs. a `SUM` over a column) highlighted against each, showing which layout it is cheap on and which it is expensive on.
- **Lab:** none of its own.
- **Sources:** Chapter 1's own I/O-cost and row-vs-column material (reused, not re-sourced), plus a current OLTP/OLAP reference for direct citation.

### 3. ER modeling and relationship cardinality (`de.er-modeling-relationship-cardinality`): refresher, §3.1

- **Folder:** `er-modeling-relationship-cardinality`. About 5 min.
- **Scope:** "1:1, 1:N, M:N and optionality; ER diagrams as a communication artifact; how cardinality drives junction tables and foreign-key placement" — the full syllabus line.
- **Outcomes:** Read and draw crow's-foot cardinality for 1:1, 1:N and M:N relationships, including optionality; state why an M:N relationship forces a junction table and where a 1:N relationship's foreign key actually lives.
- **Introduces:** `er-cardinality-notation`, `junction-table`. **Uses:** `conceptual-logical-physical-split`, `oltp-vs-olap-shape`. **Declared:** basic SQL foreign keys.
- **Bridge:** "Point reads and large scans pull physical layout in opposite directions, but both still need the same underlying relationships named precisely. This topic is that notation: cardinality, drawn the same way regardless of which workload ends up reading it." (Answers topic 2's handoff.)
- **Handoff:** "Cardinality decided where a foreign key lives and when a junction table is unavoidable. Next: a sharper question about the same tables — which columns actually determine which others, and what that implies about how far a table should be normalized."
- **Prerequisites panel:** topics 1–2 (Before this).
- **Visual idea:** three crow's-foot relationship diagrams side by side (1:1, 1:N, M:N), each with optionality marked, and the M:N one expanding to show its junction table appearing underneath it as the diagram is drawn.
- **Lab:** none of its own.
- **Sources:** a standard ER-modeling reference (crow's-foot notation) for direct citation.

### 4. Functional dependencies and normal forms (`de.functional-dependencies-normal-forms`): full, §3.1

- **Folder:** `functional-dependencies-normal-forms`. About 14 min.
- **Scope:**
  - "FDs, attribute closure and candidate keys": the formal definitions, with a worked closure computation over the shop's own `orders`/`customers` columns.
  - "1NF→BCNF (and 4NF for multivalued dependencies)": each normal form's exact additional guarantee over the one before it, not just a checklist.
  - "lossless and dependency-preserving decomposition": what a decomposition must preserve to be correct, and the classic case where both can't be had at once.
  - "deliberate denormalization for analytics and the update anomalies it brings back": ties directly to topic 2's OLAP-shape pressure, naming the anomalies normalization was removing in the first place.
  - Leaves key *design* (as opposed to key *discovery* via FDs) to topic 5.
- **Outcomes:** Compute an attribute closure and find candidate keys from a set of FDs; place a schema correctly on the 1NF–BCNF (and 4NF) ladder; decompose a schema losslessly and recognize when dependency preservation has to be sacrificed; name the specific anomaly a denormalization choice reintroduces.
- **Introduces:** `functional-dependency`, `attribute-closure`, `normal-forms-1nf-bcnf-4nf`, `lossless-decomposition`. **Uses:** `er-cardinality-notation`. **Declared:** basic SQL.
- **Bridge:** "Cardinality decided where a foreign key lives and when a junction table is unavoidable. This topic asks a sharper question about the same tables: which columns actually determine which others, and what that implies about how far a table should be normalized." (Answers topic 3's handoff.)
- **Handoff:** "Normalization fixed how far a schema's own structure should go. Next: a decision inside that structure that normalization doesn't settle at all — what a row's own key should actually be, and how to pick one that survives the business changing under it."
- **Prerequisites panel:** topics 1–3 (Before this); Chapter 2's relational algebra (topic 1) for set/bag vocabulary reused here.
- **Visual idea:** an attribute-closure computation drawn as a graph that lights up one determined attribute at a time as each FD fires, settling once no new attribute lights; a side-by-side of a 3NF table and its denormalized analytics equivalent, with the exact anomaly (an update that now has to touch N rows instead of one) called out directly.
- **Lab:** none of its own; feeds topic 7's three-way comparison lab with the 3NF side of that comparison.
- **Sources:** a standard normalization reference (Codd-derived definitions, available in open textbook form) for direct citation.

### 5. Key design: natural, surrogate, durable, hash (`de.key-design-natural-surrogate-durable-hash`): full, §3.1

- **Folder:** `key-design-natural-surrogate-durable-hash`. About 14 min.
- **Scope:**
  - "key stability over time, composite keys": why a natural key that looks stable can still break, with a worked example from the shop's own customer data.
  - "generating surrogates in distributed pipelines (sequences vs hash keys vs time-ordered UUIDv7)": measured directly where the sandbox allows (sequence generation vs UUIDv7 generation cost and resulting index locality).
  - "durable keys that survive SCD versions": previews topic 13's own SCD2 problem — a dimension's durable key must stay constant across every version while its surrogate key changes per version.
  - "hash-collision risk": the real, quantifiable risk of a hash key, not just a caveat.
- **Outcomes:** Distinguish natural, surrogate, durable and hash keys and state what each buys and costs; choose a surrogate-generation strategy for a distributed pipeline and justify it against sequence/hash/UUIDv7's real tradeoffs; explain why a dimension needs both a surrogate and a durable key once SCD2 arrives.
- **Introduces:** `key-types-natural-surrogate-durable-hash`, `uuidv7-time-ordered-key`. **Uses:** `functional-dependency`, `attribute-closure`. **Declared:** basic SQL.
- **Bridge:** "Normalization fixed how far a schema's own structure should go. This topic is a decision inside that structure normalization doesn't settle at all: what a row's own key should actually be, and how to pick one that survives the business changing under it." (Answers topic 4's handoff.)
- **Handoff:** "Every key type here assumed one single philosophy for organizing a whole warehouse around these tables. Next: two philosophies that disagree about that directly — Inmon's single integrated model and Kimball's dimensional bus — and what each actually costs."
- **Prerequisites panel:** topics 1–4 (Before this).
- **Visual idea:** a natural key (an email address) shown breaking when a real-world change (a customer changes their email) invalidates every row that referenced it, next to a surrogate key that doesn't; a UUIDv7's own bit layout drawn split into a time-ordered prefix and a random suffix, contrasted with a plain random UUID's index-locality cost.
- **Lab:** none of its own.
- **Sources:** PostgreSQL docs on sequences and `gen_random_uuid()`; the UUIDv7 RFC (RFC 9562) for the time-ordered layout, quoted directly.

### 6. Inmon vs Kimball warehouse philosophies (`de.inmon-vs-kimball-warehouse-philosophies`): full, §3.1

- **Folder:** `inmon-vs-kimball-warehouse-philosophies`. About 13 min.
- **Scope:**
  - "normalized enterprise warehouse feeding marts vs bus-architecture dimensional marts": the two reference architectures, drawn side by side.
  - "time to value, integration cost, tolerance to change": the three axes Inmon and Kimball actually trade against each other, not a vague "which is better."
  - "how ELT on columnar engines shifted the balance": ties directly to Chapter 2's columnar/analytical material and to this chapter's own §3.3 lakehouse material, naming the specific shift (cheap, fast transforms after load) that narrowed the original gap.
- **Outcomes:** Draw both reference architectures and place a given team's constraints (time pressure, integration need, expected rate of change) against the three axes to justify a choice; explain concretely how ELT on a columnar engine changed the calculus Inmon and Kimball originally argued over.
- **Introduces:** `inmon-enterprise-warehouse`, `kimball-dimensional-bus`. **Uses:** `key-types-natural-surrogate-durable-hash`. **Declared:** basic SQL.
- **Bridge:** "Every key type here assumed one single philosophy for organizing a whole warehouse around these tables. This topic is two philosophies that disagree about that directly: Inmon's single integrated model and Kimball's dimensional bus, and what each actually costs." (Answers topic 5's handoff.)
- **Handoff:** "Kimball's own bus architecture assumed a dimensional star was the right shape to build marts from. Next: a third philosophy that disagrees with both Inmon and Kimball about where auditability and source agility should live — Data Vault 2.0."
- **Prerequisites panel:** topics 1–5 (Before this).
- **Visual idea:** two architecture diagrams side by side — Inmon's single normalized warehouse feeding dependent marts downstream, Kimball's conformed bus matrix feeding independent dimensional marts directly — with the same three business scenarios (urgent deadline, multi-source integration, frequent schema change) dropped onto both and a verdict lighting up on whichever architecture actually serves that scenario better.
- **Lab:** none of its own; feeds topic 7's three-way comparison lab with the star-schema side of that comparison, at the structural level this topic introduces (not §3.2's full dimensional machinery).
- **Sources:** primary texts/summaries from Inmon's and Kimball's own published methodology (to be fetched and quoted at research time), plus a current source on ELT-on-columnar-engines' effect on warehouse architecture choices.

### 7. Data Vault 2.0 modeling (`de.data-vault-2-modeling`): full, §3.1

- **Folder:** `data-vault-2-modeling`. About 15 min. Hosts the §3.1 chapter lab.
- **Scope:**
  - "hubs (business keys), links (relationships), satellites (descriptive history)": the three core table types, built directly over the shop's own `customers`/`orders`/`products`.
  - "hash keys and insert-only parallel loading": why Data Vault prefers a hash of the business key over a sequence here specifically — parallel, insert-only loads with no cross-table lock contention.
  - "raw vs business vault, PIT and bridge tables for query speed": the layering Data Vault adds on top of hubs/links/satellites specifically to make querying it tolerable.
  - "when auditability and source agility are worth the join cost": the actual tradeoff, named and measured (join count/complexity) rather than asserted.
- **Outcomes:** Model a business domain as hubs, links and satellites; explain why hash keys enable insert-only parallel loading in a way sequence keys don't; use PIT and bridge tables to keep a Data Vault query tractable; judge when Data Vault's auditability is worth its join cost against the 3NF and star alternatives this topic's own lab measures directly.
- **Introduces:** `data-vault-hub-link-satellite`, `pit-bridge-table-data-vault`. **Uses:** `inmon-enterprise-warehouse`, `kimball-dimensional-bus`, `key-types-natural-surrogate-durable-hash`, `functional-dependency`. **Declared:** basic SQL.
- **Bridge:** "Kimball's own bus architecture assumed a dimensional star was the right shape to build marts from. This topic is a third philosophy that disagrees with both Inmon and Kimball about where auditability and source agility should live: Data Vault 2.0." (Answers topic 6's handoff.)
- **Handoff:** "Every philosophy in this section assumed grain, facts and dimensions were already decided elsewhere. Next: building a Kimball star for real, starting exactly where Kimball's own methodology insists — grain, before a single column is drawn."
- **Prerequisites panel:** topics 1–6 (Before this).
- **Visual idea:** the shop's `customers`/`orders`/`products` domain redrawn as hubs (hexagons, business keys), links (diamonds, relationships) and satellites (rounded rectangles, descriptive history attached to a hub or link) — then, for the lab, the same domain shown three times side by side (3NF, star, Data Vault) with a single query ("what was this customer's address on this order's date") run against all three and its real join count/complexity compared directly.
- **Lab:** hosts the full §3.1 chapter lab — modeling one domain three ways and comparing load complexity, query complexity, and the as-of-address answer across 3NF, star and Data Vault.
- **Sources:** Dan Linstedt's own Data Vault 2.0 methodology material (to be fetched and quoted at research time) for hub/link/satellite definitions and the hash-key/insert-only-loading rationale.

### 8. Grain-first dimensional design (`de.grain-first-dimensional-design`): full, §3.2

- **Folder:** `grain-first-dimensional-design`. About 13 min.
- **Scope:**
  - "the four-step process (business process, grain, dimensions, facts)": Kimball's own ordering, worked through end to end on the shop's order-line business process.
  - "declaring the most atomic grain": why "one row per order" is the wrong grain when line items exist, and what breaks if grain is declared too coarse.
  - "additive vs semi-additive vs non-additive measures": the three measure categories, each with a worked example (a sum that works across every dimension, a balance that doesn't sum across time, a ratio that doesn't sum at all).
- **Outcomes:** Run the four-step Kimball design process on a new business process; declare the most atomic grain available and explain the consequence of declaring it too coarse; classify a measure as additive, semi-additive or non-additive and state which dimensions each can be safely summed across.
- **Introduces:** `dimensional-design-four-step`, `fact-grain`, `measure-additivity-classes`. **Uses:** `kimball-dimensional-bus`, `er-cardinality-notation`. **Declared:** basic SQL aggregation.
- **Bridge:** "Every philosophy in the previous section assumed grain, facts and dimensions were already decided elsewhere. This topic is building a Kimball star for real, starting exactly where Kimball's own methodology insists: grain, before a single column is drawn." (Answers topic 7's handoff.)
- **Handoff:** "Grain decided what one fact row actually represents. Next: the four different shapes a fact table itself can take, depending on how that grain's own measures behave over time."
- **Prerequisites panel:** topics 1–7 (Before this).
- **Visual idea:** the shop's order-line fact table built live, one of Kimball's four steps at a time, with the grain step shown as a single highlighted row ("one order line") that the rest of the design pivots around; three measures (line total, account balance, a profit ratio) shown being summed across a time axis, with only the first two surviving correctly and the ratio visibly producing a wrong answer when naively summed.
- **Lab:** none of its own.
- **Sources:** Kimball Group's own dimensional modeling methodology material (to be fetched and quoted at research time) for the four-step process and measure-additivity classification.

### 9. Fact table types (`de.fact-table-types`): full, §3.2

- **Folder:** `fact-table-types`. About 14 min.
- **Scope:**
  - "transaction, periodic snapshot, accumulating snapshot and factless facts (event and coverage)": all four types, each built as a real table over the shop's order pipeline.
  - "how each absorbs late updates and which measures stay additive": the direct consequence of topic 8's additivity classes, applied per fact type.
- **Outcomes:** Identify which of the four fact-table types a given business process calls for; build an accumulating-snapshot fact table that updates in place as an order moves through its lifecycle; explain which fact types stay cleanly additive under late updates and which don't.
- **Introduces:** `fact-table-types-transaction-snapshot-accumulating-factless`. **Uses:** `fact-grain`, `measure-additivity-classes`. **Declared:** basic SQL.
- **Bridge:** "Grain decided what one fact row actually represents. This topic is the four different shapes a fact table itself can take, depending on how that grain's own measures behave over time." (Answers topic 8's handoff.)
- **Handoff:** "Every fact type here assumed its dimensions were already clean, single, conformed tables. Next: what actually lets two facts of different grains — built from different fact tables entirely — get compared in the same query without the join silently multiplying rows."
- **Prerequisites panel:** topics 1–8 (Before this).
- **Visual idea:** four small fact tables drawn side by side — a transaction fact (one immutable row per event), a periodic snapshot (one row per period, re-taken), an accumulating snapshot (one row per order, its own milestone columns overwritten in place as the order progresses), and a factless fact (a row with no measure at all, just a recorded event or coverage) — with the accumulating snapshot's own row shown visibly changing as the order moves through three lifecycle stages.
- **Lab:** none of its own.
- **Sources:** Kimball Group's own fact-table-type taxonomy (to be fetched and quoted at research time).

### 10. Conformed dimensions and drill-across (`de.conformed-dimensions-drill-across`): full, §3.2

- **Folder:** `conformed-dimensions-drill-across`. About 13 min.
- **Scope:**
  - "conformed dimensions and facts across business processes, the enterprise bus matrix": the actual mechanism that makes Kimball's "bus" a bus at all.
  - "drill-across queries that combine facts of different grains without fan-out": the specific join-fanout failure mode this topic exists to prevent, shown breaking and then fixed.
- **Outcomes:** Explain what it means for a dimension to be conformed across two fact tables; build and read an enterprise bus matrix; write a drill-across query correctly (aggregate-then-join, not join-then-aggregate) and explain why the naive join silently fans out rows.
- **Introduces:** `conformed-dimension`, `enterprise-bus-matrix`, `drill-across-fanout`. **Uses:** `fact-table-types-transaction-snapshot-accumulating-factless`, `fact-grain`. **Declared:** basic SQL joins and aggregation.
- **Bridge:** "Every fact type here assumed its dimensions were already clean, single, conformed tables. This topic is what actually lets two facts of different grains get compared in the same query without the join silently multiplying rows." (Answers topic 9's handoff.)
- **Handoff:** "Conforming dimensions assumed each dimension itself was already a clean, well-behaved table. Next: the dimension patterns — degenerate, role-playing, junk, outrigger — that exist specifically because real dimensions often aren't."
- **Prerequisites panel:** topics 1–9 (Before this).
- **Visual idea:** a bus matrix drawn as a grid, business processes down the rows and conformed dimensions across the columns, with checkmarks where a dimension is actually shared; a drill-across query shown two ways — joined directly (rows visibly multiplying, a wrong total) and aggregated first, then joined (the correct total) — side by side.
- **Lab:** none of its own.
- **Sources:** Kimball Group's own conformed-dimension and bus-matrix material (to be fetched and quoted at research time).

### 11. Special-purpose dimension patterns (`de.special-purpose-dimension-patterns`): full, §3.2

- **Folder:** `special-purpose-dimension-patterns`. About 13 min.
- **Scope:** "degenerate dimensions, role-playing dimensions (one date dimension, many roles), junk dimensions for low-cardinality flags, outriggers; when each simplifies and when it complicates" — all four patterns, each with a worked example from the shop's own fact tables, and an honest account of each pattern's own downside.
- **Outcomes:** Recognize when a degenerate dimension (an order number with no dimension table of its own) is the right call; use one date dimension in multiple roles (order date, ship date) without duplicating it; build a junk dimension for a cluster of low-cardinality flags; use an outrigger correctly and know when it's actually just a disguised snowflake.
- **Introduces:** `degenerate-dimension`, `role-playing-dimension`, `junk-dimension`, `outrigger-dimension`. **Uses:** `conformed-dimension`, `fact-grain`. **Declared:** basic SQL.
- **Bridge:** "Conforming dimensions assumed each dimension itself was already a clean, well-behaved table. This topic is the dimension patterns — degenerate, role-playing, junk, outrigger — that exist specifically because real dimensions often aren't." (Answers topic 10's handoff.)
- **Handoff:** "Every pattern here still assumed a fact row joins to exactly one row per dimension. Next: the one place that clean one-to-many assumption breaks on its own, and the bridge table that repairs it."
- **Prerequisites panel:** topics 1–10 (Before this).
- **Visual idea:** four small diagrams, one per pattern — a degenerate dimension shown as a plain column sitting directly in the fact table with no dimension table attached; one `dim_date` table with two separate foreign keys from the same fact table pointing into it, labeled "order date" and "ship date"; a cluster of boolean/low-cardinality flag columns collapsing into one small junk-dimension table; an outrigger dimension hanging off a dimension table the same way a dimension hangs off a fact table.
- **Lab:** none of its own.
- **Sources:** Kimball Group's own dimension-pattern material (to be fetched and quoted at research time).

### 12. Bridge tables and many-to-many (`de.bridge-tables-many-to-many`): full, §3.2

- **Folder:** `bridge-tables-many-to-many`. About 14 min. Hosts part of the §3.2 chapter lab.
- **Scope:**
  - "multivalued dimensions and ragged hierarchies through bridges": the two cases a bridge table actually solves, each built over the shop's own data (an order with multiple promo tags; a ragged product-category hierarchy).
  - "weighting factors against double counting": the exact mechanism, measured directly — the same aggregate query run with and without weights, with the double-counted wrong answer and the weighted correct one shown side by side.
  - "flattened vs recursive hierarchy bridges": the two implementation strategies for a ragged hierarchy bridge, and when each is preferable.
- **Outcomes:** Build a bridge table for a genuinely multivalued dimension; demonstrate double counting through a bridge without weights and fix it with a correctly normalized weighting factor; choose between a flattened and a recursive hierarchy bridge for a ragged hierarchy.
- **Introduces:** `bridge-table-multivalued-dimension`, `weighting-factor-double-counting-fix`. **Uses:** `degenerate-dimension`, `fact-grain`, `measure-additivity-classes`. **Declared:** basic SQL joins.
- **Bridge:** "Every pattern here still assumed a fact row joins to exactly one row per dimension. This topic is the one place that clean one-to-many assumption breaks on its own, and the bridge table that repairs it." (Answers topic 11's handoff.)
- **Handoff:** "Every pattern in this section so far assumed a dimension's own attributes don't change over time. Next: the mechanism — SCD Type 2 — for when they genuinely do, and how to keep every version of the truth without losing any of it."
- **Prerequisites panel:** topics 1–11 (Before this).
- **Visual idea:** a fact row joined through a bridge table to three promo tags at once, with the naive unweighted sum shown double- and triple-counting the same order's total, then the identical join shown again with each bridge row carrying a weight that sums to one, producing the correct total; a ragged category hierarchy shown as both a flattened bridge (one row per ancestor-descendant pair) and a ragged tree, side by side.
- **Lab:** hosts the §3.2 chapter lab's bridge-table/double-counting/weighting-fix part.
- **Sources:** Kimball Group's own bridge-table and weighting-factor material (to be fetched and quoted at research time).

### 13. SCD Type 2 implementation (`de.scd-type-2-implementation`): full, §3.2

- **Folder:** `scd-type-2-implementation`. About 15 min. Hosts part of the §3.2 chapter lab.
- **Scope:**
  - "effective/expiry timestamps, current flags, hash-diff change detection": the exact SCD2 row shape, built directly over the shop's `dim_customer` address history.
  - "MERGE-based loads, idempotent reloads": a real `MERGE` statement that expires the old version and inserts the new one atomically, measured for idempotency directly (running the identical load twice produces the identical result).
  - "correctness under out-of-order and duplicate changes": the chapter lab's own replay test, run and measured directly — the same change feed replayed out of order and with duplicates, checked against the correct as-of answer.
- **Outcomes:** Build an SCD Type 2 dimension with effective/expiry timestamps and a current flag; detect a real change with a hash-diff rather than a column-by-column comparison; write an idempotent `MERGE`-based load and prove idempotency by running it twice; keep SCD2 correct when a change feed arrives out of order or with duplicates.
- **Introduces:** `scd-type-2`, `hash-diff-change-detection`, `idempotent-merge-load`. **Uses:** `bridge-table-multivalued-dimension`, `key-types-natural-surrogate-durable-hash`. **Declared:** basic SQL `MERGE`/`UPSERT`.
- **Bridge:** "Every pattern in this section so far assumed a dimension's own attributes don't change over time. This topic is the mechanism — SCD Type 2 — for when they genuinely do, and how to keep every version of the truth without losing any of it." (Answers topic 12's handoff.)
- **Handoff:** "Type 2 was one specific point on a much larger menu of ways to handle a changing attribute. Next: the full SCD 0 through 7 menu that Type 2 is one point in, and how to choose a different point by query pattern and churn rate."
- **Prerequisites panel:** topics 1–12 (Before this).
- **Visual idea:** a single customer's address history drawn as a horizontal row of version bars, each with its own effective/expiry timestamp and the last one carrying a current-flag marker; the same change feed replayed twice, out of order and with a duplicate, with the resulting version bars shown converging to the identical correct history both times.
- **Lab:** hosts the §3.2 chapter lab's SCD2/MERGE/replay/idempotency parts.
- **Sources:** a current SCD Type 2 implementation reference (Kimball Group's own material, plus PostgreSQL's `MERGE` documentation for the exact syntax) for direct citation.

### 14. SCD types 0–7 and selection (`de.scd-types-0-7-selection`): full, §3.2

- **Folder:** `scd-types-0-7-selection`. About 14 min.
- **Scope:**
  - "Types 0/1/3 (retain, overwrite, limited prior value)": each built as a small worked variant of topic 13's own dimension.
  - "Type 4 mini-dimensions for rapidly changing attributes": the specific fix for an attribute that changes too often for Type 2 to stay small.
  - "hybrids 5/6/7": each named precisely as the specific combination it actually is (5 = 1+4, 6 = 1+2+3, 7 = 2 with a durable key join), not left vague.
  - "choosing by query pattern and attribute churn rate": the actual decision rule, applied to three concrete scenarios.
- **Outcomes:** Implement Types 0, 1 and 3 and state what each discards compared to Type 2; build a Type 4 mini-dimension for a rapidly changing attribute; name each hybrid type (5, 6, 7) as the specific combination of simpler types it is; choose the right SCD type for a given query pattern and churn rate.
- **Introduces:** `scd-types-0-1-3-4-5-6-7`. **Uses:** `scd-type-2`, `hash-diff-change-detection`. **Declared:** basic SQL.
- **Bridge:** "Type 2 was one specific point on a much larger menu of ways to handle a changing attribute. This topic is the full SCD 0 through 7 menu that Type 2 is one point in, and how to choose a different point by query pattern and churn rate." (Answers topic 13's handoff.)
- **Handoff:** "Every SCD type here assumed a dimension row's own data was itself correct and on time. Next: what happens when it genuinely isn't — facts that arrive before their own dimension row exists, or that arrive late enough to require mapping them onto a dimension's own historical versions."
- **Prerequisites panel:** topics 1–13 (Before this).
- **Visual idea:** a single gallery row showing the same underlying attribute change handled by Types 0, 1, 2, 3 and 4 side by side — Type 0 unchanged, Type 1 silently overwritten, Type 2's version bars from topic 13, Type 3 with one limited "previous value" column, Type 4 split out into its own small mini-dimension — making the real difference between them visible at a glance; the hybrids named as explicit combinations drawn from the same gallery.
- **Lab:** none of its own.
- **Sources:** Kimball Group's own SCD type-selection material (to be fetched and quoted at research time).

### 15. Late-arriving facts and dimensions (`de.late-arriving-facts-dimensions`): full, §3.2

- **Folder:** `late-arriving-facts-dimensions`. About 14 min.
- **Scope:**
  - "facts that arrive before their dimension rows (inferred members, later update)": the inferred-member pattern, built directly over a fact that references a `dim_customer` row that doesn't exist yet.
  - "backdated facts that must map to historical SCD2 versions": the specific join a late fact needs — not to the current dimension row, but to whichever SCD2 version was actually in effect on the fact's own event date.
  - "bounded reprocessing windows": the practical limit every late-arriving-data strategy needs, named and justified rather than left open-ended.
- **Outcomes:** Build and later-update an inferred dimension member for a fact that arrived first; join a backdated fact to the correct historical SCD2 version of its dimension, not the current one; justify a bounded reprocessing window for a real pipeline.
- **Introduces:** `inferred-dimension-member`, `backdated-fact-scd2-mapping`, `bounded-reprocessing-window`. **Uses:** `scd-type-2`, `fact-grain`. **Declared:** basic SQL.
- **Bridge:** "Every SCD type here assumed a dimension row's own data was itself correct and on time. This topic is what happens when it genuinely isn't: facts that arrive before their own dimension row exists, or that arrive late enough to require mapping them onto a dimension's own historical versions." (Answers topic 14's handoff.)
- **Handoff:** "Every topic in this section built tables assuming a warehouse's own physical home was already settled. Next: zooming out to that home itself — the architectural history from a coupled warehouse to a lake to an open-table-format lakehouse, and what each stage still does best." (The syllabus's bitemporal-modeling and wide-table/activity-schema entries that would otherwise sit here are marked `(skipped)`, so this handoff goes straight to §3.3.)
- **Prerequisites panel:** topics 1–14 (Before this).
- **Visual idea:** a fact row arriving with a foreign key pointing at a `dim_customer` row that is created on the spot as an inferred member (shown mostly blank, flagged inferred), then later filled in when the real dimension data arrives; a backdated fact's event date shown landing inside one specific version bar of topic 13's own SCD2 timeline, with the join resolving to that bar rather than the current one.
- **Lab:** none of its own.
- **Sources:** Kimball Group's own late-arriving-data material (to be fetched and quoted at research time).

### 16. From warehouse to lake to lakehouse (`de.warehouse-lake-lakehouse`): full, §3.3

- **Folder:** `warehouse-lake-lakehouse`. About 13 min.
- **Scope:** "coupled MPP columnar warehouses → cheap schema-on-read lakes without transactions (the 'swamp') → open table formats + catalogs + many engines over object storage (internals in Ch.6); what each still does best" — the full three-stage history, with each stage's own genuine strength named honestly (not just its successor's complaint about it).
- **Outcomes:** Explain what a coupled MPP warehouse actually buys (transactions, performance, governance) that a schema-on-read lake gave up, and why it still gave it up (cost, flexibility); explain how an open table format plus a catalog gets transactions back without recoupling storage to one engine; place a given workload correctly against which stage still serves it best.
- **Introduces:** `warehouse-lake-lakehouse-history`. **Uses:** `inmon-enterprise-warehouse`, `kimball-dimensional-bus`. **Declared:** basic familiarity with "a data warehouse."
- **Bridge:** "Every topic in the previous section built tables assuming a warehouse's own physical home was already settled. This topic is that home itself: the architectural history from a coupled warehouse to a lake to an open-table-format lakehouse, and what each stage still does best."
- **Handoff:** "Every stage of this history was actually driven by one thing underneath it: what object storage costs, and how it bills. Next: that billing model itself, in enough detail to predict a real bill from a real file layout."
- **Prerequisites panel:** topics 1–15 (Before this).
- **Visual idea:** a three-stage timeline, each stage drawn as a small architecture diagram — coupled warehouse (storage and compute as one box), lake (cheap storage, no transactions, labeled honestly as a swamp risk rather than a strawman), lakehouse (object storage plus an open table format plus a catalog, multiple engines reading the same files) — with one capability (ACID transactions) tracked across all three, disappearing and then reappearing.
- **Lab:** none of its own.
- **Sources:** a current lakehouse-architecture reference (e.g. the original Lakehouse paper, or current vendor-neutral documentation) for direct citation, cross-referenced to Chapter 6's own table-format internals as "detail deferred there."

### 17. Object storage and query economics (`de.object-storage-query-economics`): full, §3.3

- **Folder:** `object-storage-query-economics`. About 14 min. Hosts the §3.3 chapter lab.
- **Scope:**
  - "$/TB-month storage vs per-request vs egress charges, storage classes and retrieval latency": the actual billing dimensions, each named and, where the sandbox allows, measured against real file sizes this topic produces itself.
  - "bytes-scanned vs compute-time billing": the two query-engine billing models, contrasted directly.
  - "how file sizing and layout move the bill": measured directly — the same dataset stored as many small files vs fewer large ones, with the resulting request-count and bytes-scanned difference shown concretely.
- **Outcomes:** Name the distinct billing dimensions of object storage (storage, requests, egress) and of query engines (bytes-scanned vs compute-time); predict how a file-layout change (many small files vs fewer large ones) moves a real bill; run the chapter's own lab and tabulate projected cost under on-demand and capacity pricing for a real query set.
- **Introduces:** `object-storage-billing-model`, `bytes-scanned-vs-compute-time-billing`. **Uses:** `warehouse-lake-lakehouse-history`. **Declared:** basic familiarity with cloud storage.
- **Bridge:** "Every stage of this history was actually driven by one thing underneath it: what object storage costs, and how it bills. This topic is that billing model itself, in enough detail to predict a real bill from a real file layout." (Answers topic 16's handoff.)
- **Handoff:** "This billing model is exactly what made separating storage from compute economically attractive in the first place. Next: compute-storage separation itself, the architectural consequence of this topic's own economics."
- **Prerequisites panel:** topics 1–16 (Before this).
- **Visual idea:** a single dataset shown stored two ways — many small files and fewer large ones — with request-count and bytes-scanned bars measured directly against each; a billing-dimension breakdown (storage, requests, egress) drawn as separate meters that move independently depending on access pattern.
- **Lab:** hosts the §3.3 chapter lab — storing the same dataset as JSON, Parquet and an Iceberg/Delta table, running a fixed query set from two engines, and tabulating bytes scanned, requests, latency and projected cost.
- **Sources:** a current cloud object-storage pricing reference and a current query-engine billing-model reference (both to be fetched and quoted, with any claim about a specific cloud vendor's exact current pricing disclosed honestly if it can't be reproduced locally).

### 18. Compute–storage separation and workload isolation (`de.compute-storage-separation-workload-isolation`): full, §3.3

- **Folder:** `compute-storage-separation-workload-isolation`. About 13 min.
- **Scope:** "elastic stateless compute over shared storage, per-workload clusters and warehouses, caches that re-couple storage for speed, noisy neighbors and concurrency scaling" — the full syllabus line, with the caching tension (separation for elasticity vs. caching that quietly re-couples for speed) drawn out explicitly as the topic's own central idea.
- **Outcomes:** Explain what elastic stateless compute over shared storage actually buys over a coupled architecture; assign isolated per-workload compute to avoid noisy-neighbor contention; explain why a cache is a deliberate, partial re-coupling of storage and compute, done for speed, and what it costs when it goes stale.
- **Introduces:** `compute-storage-separation`, `noisy-neighbor-isolation`. **Uses:** `object-storage-billing-model`, `warehouse-lake-lakehouse-history`. **Declared:** basic familiarity with cloud compute.
- **Bridge:** "This billing model is exactly what made separating storage from compute economically attractive in the first place. This topic is compute-storage separation itself, the architectural consequence of that economics." (Answers topic 17's handoff.)
- **Handoff:** "Every benefit here assumed a consistent layering convention for organizing data as it moves through separated storage and compute. Next: medallion architecture, the layering convention lakehouses actually settled on, and its real failure modes."
- **Prerequisites panel:** topics 1–17 (Before this).
- **Visual idea:** one shared storage layer drawn underneath several separate, independently-scaling compute clusters, each serving a different workload (ETL, BI, ad hoc); a noisy-neighbor scenario shown as one workload's spike bleeding into another's latency under shared compute, then resolved by isolating them; a cache drawn as a thin, deliberately re-coupled layer sitting between compute and storage, going visibly stale when the underlying data changes underneath it.
- **Lab:** none of its own.
- **Sources:** a current compute-storage-separation architecture reference (a cloud warehouse vendor's own documentation on elastic/multi-cluster compute, cited and disclosed as sourced-only wherever this sandbox can't reproduce it).

### 19. Medallion architecture and its limits (`de.medallion-architecture-limits`): full, §3.3

- **Folder:** `medallion-architecture-limits`. About 14 min.
- **Scope:**
  - "bronze/silver/gold as quality contracts": each layer's actual contract (not just a name), built over the shop's own raw-to-conformed-to-mart pipeline.
  - "failure modes: layer sprawl, copy cost and latency, unclear ownership of 'silver'": each failure mode shown concretely, not just listed.
  - "when to collapse or reshape layers": the actual decision rule for when three layers is the wrong number.
- **Outcomes:** State each medallion layer's own quality contract precisely; recognize layer sprawl, copy cost/latency, and unclear silver-layer ownership as they actually appear in a real pipeline; decide when to collapse or reshape the three-layer convention for a given pipeline's own needs.
- **Introduces:** `medallion-bronze-silver-gold`, `medallion-failure-modes`. **Uses:** `compute-storage-separation`, `warehouse-lake-lakehouse-history`. **Declared:** basic familiarity with ETL pipelines.
- **Bridge:** "Every benefit here assumed a consistent layering convention for organizing data as it moves through separated storage and compute. This topic is medallion architecture, the layering convention lakehouses actually settled on, and its real failure modes." (Answers topic 18's handoff.)
- **Handoff:** "Medallion architecture settled how data moves through layers once it's already landed. Next: an older, still-relevant architectural debate about how data gets there in the first place — batch and streaming, merged at serving (Lambda) or unified into one stream-only engine (Kappa)."
- **Prerequisites panel:** topics 1–18 (Before this).
- **Visual idea:** three horizontal bands (bronze/silver/gold) with data visibly flowing upward and each layer's own contract labeled on its band; a layer-sprawl failure mode shown as a fourth, fifth, sixth band creeping in with no clear new contract; a copy-cost/latency failure mode shown as the same row of data sitting duplicated across all three bands with a visible lag between bronze's arrival and gold's availability.
- **Lab:** none of its own.
- **Sources:** a current medallion-architecture reference (the term's own originating vendor documentation, plus independent critique of its failure modes) for direct citation.

### 20. Lambda vs Kappa architectures (`de.lambda-vs-kappa-architectures`): full, §3.3

- **Folder:** `lambda-vs-kappa-architectures`. About 14 min.
- **Scope:**
  - "Lambda (batch + speed layers merged at serving; Marz) vs Kappa (stream-only, reprocess by replaying the log; Kreps)": both architectures, attributed to their actual originators and drawn precisely.
  - "the reprocessing and serving-merge trade-off": the specific cost each architecture pays — Lambda's dual-logic maintenance burden at the serving merge, Kappa's reprocessing-by-replay cost when logic changes.
  - "why the industry drifted to unified engines (one codebase, no dual-logic drift) and when a batch correction layer still earns its cost": the actual resolution, and the honest exception to it.
- **Outcomes:** Draw both Lambda and Kappa architectures and attribute them correctly; name the specific cost each one pays (dual-logic maintenance vs. replay-based reprocessing); explain why unified streaming engines reduced the need for Lambda's own dual-logic split, and identify the specific case where a batch correction layer is still worth keeping.
- **Introduces:** `lambda-architecture`, `kappa-architecture`. **Uses:** `medallion-bronze-silver-gold`, `compute-storage-separation`. **Declared:** basic familiarity with batch and streaming processing.
- **Bridge:** "Medallion architecture settled how data moves through layers once it's already landed. This topic is an older, still-relevant architectural debate about how data gets there in the first place: batch and streaming, merged at serving (Lambda) or unified into one stream-only engine (Kappa)." (Answers topic 19's handoff.)
- **Handoff:** "Every architecture in this section assumed a single team could still own the whole pipeline end to end. Next: the organizational response to that no longer being true at scale — data mesh, domain ownership, and data as a product." (This closes out §3.3 and hands into §3.4.)
- **Prerequisites panel:** topics 1–19 (Before this).
- **Visual idea:** Lambda drawn as two parallel pipelines (batch, speed) merging at a serving layer, with a visible seam where their logic has to agree; Kappa drawn as one stream-only pipeline with a replay arrow looping back to the start of the log when logic changes; a unified-engine resolution shown collapsing Lambda's two pipelines into Kappa's one, with the batch-correction-layer exception drawn as a small, explicitly justified side path still attached.
- **Lab:** none of its own.
- **Sources:** Nathan Marz's own Lambda architecture writing and Jay Kreps's own Kappa architecture writing (both to be fetched and quoted at research time) for direct attribution.

### 21. Data mesh and data products (`de.data-mesh-data-products`): full, §3.4

- **Folder:** `data-mesh-data-products`. About 13 min.
- **Scope:**
  - "domain ownership, data as a product, self-serve platform, federated computational governance": all four mesh principles, each defined precisely, not just named.
  - "organizational preconditions and the failure mode of mesh without platform maturity": the honest failure case — a mesh adopted before the self-serve platform that makes it workable actually exists.
  - "governance mechanics → §13.4": explicitly deferred, not silently skipped.
- **Outcomes:** Name all four data mesh principles and what each actually requires organizationally; recognize the specific failure mode of adopting domain ownership without a mature self-serve platform underneath it; explain data as a product as a concrete standard (discoverable, addressable, trustworthy, interoperable), not a slogan.
- **Introduces:** `data-mesh-four-principles`, `data-as-a-product`. **Uses:** `warehouse-lake-lakehouse-history`. **Declared:** basic familiarity with organizational data-team structures.
- **Bridge:** "Every architecture in the previous section assumed a single team could still own the whole pipeline end to end. This topic is the organizational response to that no longer being true at scale: data mesh, domain ownership, and data as a product." (Answers topic 20's handoff.)
- **Handoff:** "Federated governance assumed each domain team actually honors its own data's contract with the rest of the mesh. Next: data contracts themselves, the concrete artifact that enforcement actually happens against."
- **Prerequisites panel:** topics 1–20 (Before this).
- **Visual idea:** a mesh of domain-owned data products drawn as independent nodes, each labeled with the "data as a product" standard it has to meet (discoverable, addressable, trustworthy, interoperable), connected through one shared self-serve platform layer underneath all of them; a failure-mode variant shown with that platform layer missing and the same mesh fragmenting into incompatible, ungoverned domains.
- **Lab:** none of its own.
- **Sources:** Zhamak Dehghani's own data mesh writing (to be fetched and quoted at research time) for the four principles and the platform-maturity precondition.

### 22. Data contracts as a modeling artifact (`de.data-contracts-modeling-artifact`): full, §3.4

- **Folder:** `data-contracts-modeling-artifact`. About 13 min.
- **Scope:**
  - "what a contract specifies (schema, semantics, quality rules, SLAs, ownership)": each specified dimension, built as a real contract document over one of the shop's own data products.
  - "enforcement at the producer boundary": the specific point enforcement happens, not consumer-side validation after the fact.
  - "the Open Data Contract Standard (Bitol, Linux Foundation; v3.1)": the actual current standard, quoted directly from its own specification.
  - "versioning and breaking-change policy (CI enforcement → §11.4)": explicitly deferred, not silently skipped.
- **Outcomes:** Write a data contract specifying schema, semantics, quality rules, SLAs and ownership for a real data product; explain why enforcement belongs at the producer boundary rather than downstream; read and write a contract in the Open Data Contract Standard's own format; classify a schema change as breaking or non-breaking against a stated versioning policy.
- **Introduces:** `data-contract-specification`, `open-data-contract-standard`. **Uses:** `data-as-a-product`, `data-mesh-four-principles`. **Declared:** basic familiarity with API versioning.
- **Bridge:** "Federated governance assumed each domain team actually honors its own data's contract with the rest of the mesh. This topic is data contracts themselves, the concrete artifact that enforcement actually happens against." (Answers topic 21's handoff.)
- **Handoff:** "A contract specified what a data product's schema and semantics actually are. Next: the layer that compiles a business metric's own definition — built on top of exactly that schema — to SQL the same way for every tool that asks for it."
- **Prerequisites panel:** topics 1–21 (Before this).
- **Visual idea:** a data contract document drawn as a small structured form (schema, semantics, quality rules, SLAs, ownership, each its own labeled section) sitting directly at a producer's own boundary, with a schema change shown being checked against it and classified breaking or non-breaking before it's ever allowed to reach a consumer.
- **Lab:** none of its own.
- **Sources:** the Open Data Contract Standard's own specification (Bitol, Linux Foundation, v3.1), fetched and quoted directly.

### 23. Semantic and metrics layers (`de.semantic-metrics-layers`): full, §3.4

- **Folder:** `semantic-metrics-layers`. About 14 min. Hosts part of the §3.4 chapter lab.
- **Scope:**
  - "metric definitions compiled to SQL over declared entities, grain and time spines": the actual compilation mechanism, built directly over the shop's own star schema from §3.2.
  - "MetricFlow (open-sourced under Apache 2.0, Oct 2025), Cube, LookML, warehouse-native Snowflake semantic views and Databricks metric views": named precisely, with MetricFlow built hands-on (it runs locally) and the others named and sourced.
  - "the Open Semantic Interchange (OSI) spec": named and sourced.
  - "semantic layers as grounding for LLM text-to-SQL (BI boundary → Ch.17)": explicitly deferred, not silently skipped.
- **Outcomes:** Define a metric once, over declared entities/grain/time spine, and compile it to correct SQL with MetricFlow; explain why a semantic layer stops different BI tools from disagreeing about the same metric's definition; name the other semantic-layer tools (Cube, LookML, warehouse-native options) and the OSI spec's purpose, even without hands-on build time on each.
- **Introduces:** `semantic-layer-metric-compilation`, `time-spine`. **Uses:** `fact-grain`, `conformed-dimension`, `data-contract-specification`. **Declared:** basic SQL aggregation.
- **Bridge:** "A contract specified what a data product's schema and semantics actually are. This topic is the layer that compiles a business metric's own definition — built on top of exactly that schema — to SQL the same way for every tool that asks for it." (Answers topic 22's handoff.)
- **Handoff:** "A semantic layer defined what a metric means. Next: the tool that actually builds the models a semantic layer sits on top of, in most real warehouses today — dbt, its models, its tests, and the lineage graph it builds from them."
- **Prerequisites panel:** topics 1–22 (Before this).
- **Visual idea:** one metric ("revenue") defined once in MetricFlow's own declarative form, then shown compiling to two different SQL queries for two different grains/time windows, both correct and both traceable back to the single declared definition; a small gallery naming the other semantic-layer tools and the OSI spec, visually subordinate to the hands-on MetricFlow example.
- **Lab:** hosts the §3.4 chapter lab's "define three metrics in MetricFlow" part.
- **Sources:** MetricFlow's own documentation (open-sourced under Apache 2.0, October 2025) and the Open Semantic Interchange spec, both fetched and quoted directly.

### 24. dbt models, tests and lineage (`de.dbt-models-tests-lineage`): full, §3.4

- **Folder:** `dbt-models-tests-lineage`. About 15 min.
- **Scope:**
  - "models as SELECTs, the `ref()`-built DAG, Jinja macros, data and unit tests, exposures, docs and lineage": the whole dbt-core mental model, built hands-on against a local DuckDB target (no cloud account required).
  - "multi-project dbt Mesh with cross-project refs, model contracts, versions and access levels": dbt Mesh's own multi-project mechanics, named and sourced from dbt's own documentation, with the single-project mechanics above built hands-on first.
- **Outcomes:** Build a small dbt-core project with models, `ref()`-based dependencies, a Jinja macro, data and unit tests, and generated docs/lineage; read a dbt lineage graph and trace a column back to its source; explain what dbt Mesh adds for cross-project references, model contracts, versions and access levels.
- **Introduces:** `dbt-models-ref-dag`, `dbt-tests-data-unit`, `dbt-mesh-cross-project`. **Uses:** `data-contract-specification`, `semantic-layer-metric-compilation`. **Declared:** basic SQL, basic command-line use.
- **Bridge:** "A semantic layer defined what a metric means. This topic is the tool that actually builds the models a semantic layer sits on top of, in most real warehouses today: dbt, its models, its tests, and the lineage graph it builds from them." (Answers topic 23's handoff.)
- **Handoff:** "Every model built here assumed a full rebuild was an acceptable way to materialize it. Next: dbt's own practical answer to a dimension that needs history kept and a fact table too large to rebuild from scratch every run — incremental models and snapshots."
- **Prerequisites panel:** topics 1–23 (Before this).
- **Visual idea:** a dbt project's own DAG drawn live as models are added one at a time, each new model's `ref()` call drawing a new edge into the graph; a failing data test shown blocking a downstream model from building, and a passing unit test shown verifying a Jinja macro's own logic in isolation; the generated docs/lineage view shown as the same graph, now browsable.
- **Lab:** none of its own; feeds topic 25's lab directly as the project this chapter's §3.4 lab builds models, tests and an incremental fact inside of.
- **Sources:** dbt-core's own current documentation (models, tests, `ref()`, Jinja, exposures, docs) and dbt Mesh's own documentation, both fetched and quoted directly.

### 25. Incremental models and snapshots in dbt (`de.dbt-incremental-models-snapshots`): full, §3.4

- **Folder:** `dbt-incremental-models-snapshots`. About 15 min. Hosts part of the §3.4 chapter lab.
- **Scope:**
  - "strategies (append, merge, delete+insert, insert_overwrite, microbatch)": each strategy built and run directly against the shop's own star schema in the local dbt project topic 24 built.
  - "`is_incremental()` filters and late-data lookback, full-refresh drift, schema-change handling": each mechanism and failure mode shown concretely in the running project.
  - "snapshots as SCD2 via timestamp vs check strategies (→ §3.2)": explicitly tied back to topic 13's own SCD2 mechanism, as dbt's own practical implementation of it.
- **Outcomes:** Choose the right incremental materialization strategy (append, merge, delete+insert, insert_overwrite, microbatch) for a given fact table's own update pattern; use `is_incremental()` with a correct late-data lookback window; recognize and fix full-refresh drift and a schema change breaking an incremental model; build a dbt snapshot as a practical SCD2 implementation, choosing between the timestamp and check strategies.
- **Introduces:** `dbt-incremental-strategies`, `dbt-snapshot-scd2`. **Uses:** `dbt-models-ref-dag`, `dbt-tests-data-unit`, `scd-type-2`, `hash-diff-change-detection`. **Declared:** basic SQL.
- **Bridge:** "Every model built here assumed a full rebuild was an acceptable way to materialize it. This topic is dbt's own practical answer to a dimension that needs history kept and a fact table too large to rebuild from scratch every run: incremental models and snapshots." (Answers topic 24's handoff.)
- **Handoff:** "Every model, test and incremental strategy in this chapter was still written and run by a person, by hand, in SQL and Jinja. Next chapter starts from the language every one of these pipelines is actually glued together in — Python — and where its own costs hide."
- **Prerequisites panel:** topics 1–24 (Before this).
- **Visual idea:** the shop's own fact table shown materializing five different ways (append, merge, delete+insert, insert_overwrite, microbatch), with `is_incremental()`'s own late-data lookback window drawn as a small overlap zone at the edge of each incremental run; a dbt snapshot shown building topic 13's own SCD2 version bars automatically from a plain timestamp or check-cols strategy, without the hand-written `MERGE` topic 13 built directly.
- **Lab:** hosts the §3.4 chapter lab's dbt-build/model-contracts/unit-tests/microbatch-incremental parts. The lab's "compare dbt Fusion vs. SQLMesh" part is not hosted anywhere in this chapter, since both `dbt Fusion engine and SQL comprehension` and `SQLMesh plans and virtual environments` are marked `(skipped)` in the syllabus (see "The chapter labs: who hosts what," above).
- **Sources:** dbt-core's own current documentation on incremental materializations and snapshots, fetched and quoted directly.
