# Fact-check — de.concurrent-writer-lakehouse-time

## Claims re-derived against the source

1. **Every change to table state replaces the old metadata file with a new one through an
   atomic swap, and that swap is what provides the basis for serializable isolation.**
   SOURCES.md's Iceberg specification quote supports this directly. Checked step 3's
   "every commit is one atomic swap of a single pointer" framing doesn't overclaim beyond this —
   the quote names serializable isolation as the consequence of the swap itself, which is
   exactly the mechanism the reveal draws.

2. **A tag can retain an important historical snapshot specifically for auditing purposes, past
   whatever general expiry policy the table otherwise runs.** SOURCES.md's Iceberg
   branching-and-tagging quote supports this directly. Checked step 6's "the tag survives
   expiry; the policy still runs on everything else" takeaway doesn't claim a tag changes the
   table's general retention policy — only that it exempts the one tagged snapshot, which is all
   the quote itself states.

3. **A concurrent operation that adds files in the same partition your own operation reads
   throws a named conflict exception (`ConcurrentAppendException`), regardless of which
   statement caused it.** SOURCES.md's first Delta Lake quote supports this directly. Checked
   step 4's compaction-versus-merge collision doesn't claim this exception is Iceberg's own
   mechanism — the reveal's general "writers succeed, retry, or fail" framing stays at the
   atomic-swap level common to both table formats, and the exception itself is named as Delta's
   own documented behavior.

4. **Partitioning a table by the same columns used in two operations' own conditions can make
   their file sets disjoint, avoiding the conflict those operations would otherwise cause.**
   SOURCES.md's second Delta Lake quote supports this directly. Checked step 4's
   "re-layout... makes the collision vanish" doesn't claim partitioning eliminates every
   possible conflict — the quote's own qualifier ("in all cases marked 'can conflict'") is
   respected by keeping the claim to the specific overlapping-partition case the hook presents.

5. **The partition-writers plan, the maintenance-as-conflicting-writer framing, and the
   writer-conflict simulation are this chapter's own established method and this topic's own
   derived design.** Not an independent citation beyond claims 1–4 — `CHAPTER.md`'s own scope
   line states the maintenance-conflicts-with-ingest framing and the writer-conflict simulation
   as this topic's own worked design, not re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a faster retry loop on every writer") is a genuine,
  plausible-sounding first guess — retries are a real part of the design, named in
  `CHAPTER.md`'s own scope line as what a writer does when a conflict is survivable — but it's
  ruled out because a retry only repeats the same collision between the same two overlapping
  writers; it doesn't change which files they touch, which is the actual cause claim 4's
  partitioning advice addresses.
- **Predict 2 (step 10, "Prove it"):** checked that "check this new writer's partition overlap
  against every existing writer before it ships" follows directly from the same
  disjoint-partitioning mechanism as claim 4, applied proactively rather than reactively — "let
  it run and see" is ruled out because the design's own method (stated in this topic's reveals)
  is to check overlap before shipping a writer, not to treat a conflict in production as the
  first signal.

## Illustrative numbers (figs for steps 1, 3, 8, 10)

The hook's "every few nights" conflict cadence and "fourteen months" audit request, the
writer-conflict simulation's specific conflict rates under overlapping versus disjoint layouts,
and the maintenance schedule's exact timing windows are illustrative, stated lab numbers for the
storyboard and the simulation in `examples.py`, not cited real-world incident figures — no claim
is made about any specific company's actual commit-conflict frequency or audit history.

## Outcome

No open findings. Every claim about the atomic-swap commit protocol, the legal-hold tag, and the
Delta conflict exceptions traces to one of SOURCES.md's four verbatim quotes across three
sources (the Iceberg specification, Iceberg's branching-and-tagging documentation, Delta Lake's
concurrency-control documentation); the partition-writers plan, the maintenance framing and the
writer-conflict simulation rest on `CHAPTER.md`'s own stated scope, not an unsourced factual
claim; both predicts are checked against the chapter's own established mechanisms rather than
invented reasoning.
