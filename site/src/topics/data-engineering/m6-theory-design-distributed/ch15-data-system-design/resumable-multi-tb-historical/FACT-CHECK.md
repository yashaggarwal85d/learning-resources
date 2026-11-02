# Fact-check — de.resumable-multi-tb-historical

## Claims re-derived against the source

1. **A backfill is naturally structured as running partitions independently, for each
   partition or a subset of partitions, rather than as one undifferentiated job.**
   SOURCES.md's first Dagster quote supports this directly. Checked step 3's "independent
   chunks" framing doesn't overclaim this as the only valid structure — the quote states it as
   the supported mechanism, which is exactly the level the reveal draws from.

2. **The default backfill behavior launches one separate run per partition covered, which is
   the concrete shape this topic's "independent chunks" decision takes.** SOURCES.md's second
   Dagster quote supports this directly, including the "N partitions, N separate runs" default
   it names explicitly. Checked the reveal doesn't claim every backfill tool defaults this way —
   it's presented as Dagster's own documented default, used as the worked mechanism.

3. **A backfill's writes can be performed on a separate branch, independent from the main
   table's history, before anything is promoted.** SOURCES.md's first Iceberg quote supports
   this directly. Checked step 7's "shadow table" framing doesn't claim Iceberg's branch
   mechanism is the only way to implement a shadow — the quote is used as the worked, named
   mechanism this design's own shadow-and-swap plan is built on.

4. **Promoting a validated branch to the live table is one atomic fast-forward operation, not a
   repair applied to the live table after the fact.** SOURCES.md's second Iceberg quote
   supports this directly. Checked step 7's "discard, not repair" claim follows from this exact
   mechanism — a fast-forward either happens or it doesn't, which is why a failed run can simply
   be dropped rather than unwound.

5. **The checkpoint-and-resume mechanism, the production-latency-driven throttle, and the
   data-diff acceptance rule are this chapter's own established method and this topic's own
   derived design.** Not an independent citation beyond claims 1–4 — `CHAPTER.md`'s own scope
   line states the throttle's back-off signal and the data-diff acceptance rule as this topic's
   own worked design, pointing to Chapter 11 §11.4's data-diff method by name without re-deriving
   its internals here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("just a bigger machine and a longer timeout") is a
  genuine, plausible-sounding first guess — more resources is a real lever the shop's own cost
  model (topic 8) would consider — but it's ruled out because a bigger single job is still one
  unit of work: it still dies all at once with nothing checkpointed, and it still contends with
  production the same way, only for a longer stretch. The correct option (chunking, idempotence,
  a checkpoint, a throttle, a shadow table) follows directly from the hook's own three distinct
  failures: no resume point, no production isolation, no safe rollback.
- **Predict 2 (step 10, "Prove it"):** checked that "re-enable the throttle immediately" follows
  directly from claim-adjacent reasoning this topic's own reveal establishes: the throttle's
  signal is production's own live latency, checked continuously, not a one-time gate applied
  only before the run started. "Let it keep running at full speed" is ruled out because it
  treats the throttle as a pre-flight check rather than the continuously-reacting mechanism this
  topic's own reveal shows it to be.

## Illustrative numbers (figs for steps 1, 4, 6, 10)

The hook's "fourteen months," "five years," and the first job's exact runtime and crash point,
the checkpoint simulation's specific chunk counts, the throttle simulation's exact latency and
concurrency numbers, and the second backfill's "already climbing" latency in step 10 are
illustrative, stated lab numbers for the storyboard and the simulation in `examples.py`, not
cited real-world incident figures — no claim is made about any specific company's actual
backfill duration or outage history.

## Outcome

No open findings. Every claim about Dagster's backfill-partition mechanism and Iceberg's
branch-and-fast-forward promotion traces to one of SOURCES.md's four verbatim quotes across two
sources; the checkpoint-and-resume mechanism, the production-aware throttle, and the data-diff
acceptance rule rest on `CHAPTER.md`'s own stated scope and Chapter 11 §11.4's own prior
material, not an unsourced factual claim; both predicts are checked against the chapter's own
established mechanisms rather than invented reasoning.
