<section data-section="outcomes">

## Outcomes

Lambda runs a batch and a stream-processing system in parallel on the same input, merging their
results at query time, with the batch layer always eventually overriding the realtime layer so
any disagreement is temporary. Its real, named cost isn't that merge arithmetic — it's
maintaining the same transformation logic correctly in two separate, complex distributed
systems, which Kreps calls not fixable. Both architectures ultimately answer the same shared
problem: reprocessing, re-deriving output after the code that produces it changes. Kappa answers
it with one stream-only pipeline, replaying a fully-retained log through a second instance of the
same job. The industry's real reason to prefer that is operating a single framework, not raw
efficiency — the efficiency trade-off itself comes out roughly even. A system where replaying the
full log can't finish inside the latency actually needed still has a reason to keep a separate,
slower, independently-correct batch layer.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a quote from each
architecture's own originator — Nathan Marz for Lambda, Jay Kreps for both his own restatement of
Lambda and his own proposed Kappa (`SOURCES.md`).

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that built Lambda's two pipelines, then let their transformation logic silently drift
apart over time.** Each fix or feature gets written into one system first, and ported to the
other "later" — which is exactly the dual-logic cost Kreps names as not fixable: the two outputs
quietly disagree until someone notices.

**A team that adopted Kappa, then discovered their retained log was too large to replay inside
any useful latency.** Reprocessing by replay only works as a full substitute for a batch layer
when the replay itself finishes fast enough to matter — past that point, the batch layer's own
reason for existing (a slower, separately-correct layer to lean on) is still there.

</section>

<section data-section="frontier">

## Frontier

Kreps's own post stops short of claiming Kappa eliminates Lambda's problem space entirely — he
frames it as "a reasonable alternative architecture" for systems built today, not a universal
replacement. Modern unified streaming engines (the subject of earlier topics in this chapter's
own compute-storage-separation line) extend Kappa's core idea further: checkpointed, exactly-once
stream processing over retained logs, with batch-style backfills expressed as just another replay
of the same job. Evaluating those engines' own specific guarantees is outside this topic's scope,
but the underlying trade this topic names — one framework's operational simplicity versus a
separately-correct layer's cost — is the same one they still have to answer.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every architecture in this section assumed a single team could still own the whole pipeline end
to end. Next: the organizational response to that no longer being true at scale — data mesh,
domain ownership, and data as a product.

</section>
