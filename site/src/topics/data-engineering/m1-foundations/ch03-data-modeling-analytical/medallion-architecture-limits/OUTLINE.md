# OUTLINE — de.medallion-architecture-limits

## Learning outcomes

1. State each medallion layer's own quality contract precisely.
2. Recognize layer sprawl, copy cost/latency, and unclear silver-layer ownership as they actually appear in a real pipeline.
3. Decide when to collapse or reshape the three-layer convention for a given pipeline's own needs.

Running thread: each layer's contract is what justifies its own existence; every failure mode this topic names is what happens when a layer exists without actually honoring that contract, or exists at all without needing to.

## Steps and storyboard (13 steps)

1. **Hook.** The shop's own pipeline: raw orders land, get cleaned into a shared view, then get turned into a sales dashboard. Does that really need to be three separate layers, or could it be fewer?
2. **Reveal: medallion architecture itself, quoted directly.** A design pattern organizing data into Bronze, Silver, and Gold layers, to progressively improve quality and structure as data moves through them.
3. **Predict (index 2): does naming a layer "Silver" automatically give it a quality contract?** Wrong: yes, the name itself is the contract. Right: no — each layer's contract has to be stated and honored, not just implied by its name.
4. **Reveal: the Bronze contract, quoted directly.** Raw, as-is, with load metadata attached — audit and lineage, nothing more.
5. **Reveal: the Silver contract, quoted directly.** Conformed, "just-enough" cleansed, an enterprise view of key business entities — not yet project-specific.
6. **Reveal: the Gold contract, quoted directly.** Consumption-ready, denormalized, project-specific — the final layer, built for reporting.
7. **Predict: does forcing every pipeline through all three stages always improve its data?** Wrong: yes, more layers of refinement is always better. Right: no — a pipeline that doesn't need all three pays a real, named cost for passing through them anyway.
8. **Reveal: layer sprawl's cost, quoted directly.** Not every pipeline needs three transformation stages; forcing the pattern anyway causes unnecessary processing — showing up as added latency and added storage cost. **Takeaway.**
9. **Predict: whose job is it to fix a data-quality bug that surfaces in the Gold layer?** Wrong: obviously Gold's own team, since that's where it was found. Right: it depends, and that's exactly the problem.
10. **Reveal: fragmented silver-layer accountability, quoted directly.** Different teams apply transformations at different stages, so accountability for data quality becomes fragmented — nobody clearly owns correctness. **Takeaway.**
11. **Reveal: the Silver bottleneck, quoted directly.** Silver specifically bears the brunt of this: downstream consumers pull from aggregates built without their own input, creating a named bottleneck at exactly that layer. **Takeaway.**
12. **Recap.**
13. **Prove it.** A small pipeline with one source, one consumer, and no other team sharing any of its data. Does it need all three medallion layers, or should it be reshaped?

## Engagement arc

- Hook: step 1.
- First predict: step 3 (index 2).
- Three predicts: steps 3, 7, 9.
- Surprising count: step 10 (the bug found in Gold isn't necessarily Gold's own team's fault).
- Takeaways: steps 8, 10, 11.
- Recap: step 12.

## Post-notes headings

- **Outcomes.**
- **Internals:** how Spark Declarative Pipelines / Lakeflow actually wire bronze-to-silver-to-gold as incrementally-refreshed streaming tables and materialized views rather than three independently scheduled batch jobs — pointer to how this changes the copy-cost/latency tradeoff, without claiming this sandbox measured it.
- **Lab:** none of this topic's own (`CHAPTER.md`).
- **Production:** the real failure — a pipeline that grew a fourth, fifth, sixth "layer" over time with no new named contract for any of them, each one just another stop nobody can explain the purpose of.
- **Frontier:** the data-product / data-mesh critique this topic's second source makes in full: shifting the ownership question left, to whoever produces data, rather than fragmenting it across however many layers happen to transform it downstream.
- **Where this goes next:** topic 20, Lambda versus Kappa architecture — an older, still-relevant debate about how data gets into a pipeline in the first place, batch and streaming merged at serving or unified into one engine.

## Bridge and handoff (from CHAPTER.md)

- Bridge: "Every benefit here assumed a consistent layering convention for organizing data as it moves through separated storage and compute. This topic is medallion architecture, the layering convention lakehouses actually settled on, and its real failure modes."
- Handoff: "Medallion architecture settled how data moves through layers once it's already landed. Next: an older, still-relevant architectural debate about how data gets there in the first place — batch and streaming, merged at serving (Lambda) or unified into one stream-only engine (Kappa)."

## Concept ledger

- Introduces: `medallion-bronze-silver-gold`, `medallion-failure-modes`.
- Uses: `compute-storage-separation`, `warehouse-lake-lakehouse-history`.
- Declared: basic familiarity with ETL pipelines.

## Claims list

1. Medallion architecture organizes data into Bronze, Silver, and Gold layers, to progressively improve quality and structure. Source: Databricks.
2. Bronze's contract is raw, as-is data with load metadata, for audit and lineage. Source: Databricks.
3. Silver's contract is conformed, "just-enough" cleansed data, an enterprise view of key business entities. Source: Databricks.
4. Gold's contract is consumption-ready, denormalized, project-specific data for reporting. Source: Databricks.
5. Not every pipeline needs all three stages; forcing the pattern anyway causes unnecessary processing, showing up as added latency and added storage cost from duplicated data. Source: Modern Data 101.
6. Because different teams apply transformations at different stages, accountability for data quality becomes fragmented, and the Silver layer specifically becomes a named bottleneck from downstream consumers pulling against aggregates built without their input. Source: Modern Data 101.
