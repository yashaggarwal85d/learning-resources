# Fact-check — de.choosing-data-flow-shape

## Claims re-derived against the source

1. **Lambda's dual-logic pain is painful and, in Kreps's view, not fixable.**
   SOURCES.md quote 1 ("maintaining code that needs to produce the same result in two complex
   distributed systems is exactly as painful as it seems... I don't think this problem is
   fixable") supports this directly. The reel (step 6) states this as Lambda's real cost without
   softening it — matches the source's own certainty ("I don't think this problem is fixable",
   not "can be hard").

2. **LinkedIn's own lived hybrid-Hadoop / "transparent" dual-run API experience — worked, never
   pleasant.** SOURCES.md quote 2 supports this verbatim. Post-notes' "Production" section uses
   this as the concrete failure mode; checked that the post-notes text doesn't claim the API
   failed outright (it didn't — Kreps says "these approaches worked, but none were very pleasant
   or productive"), so the reel's own wording ("worked, but never pleasant or productive") is
   kept, not strengthened into "failed."

3. **Reprocessing defined as re-deriving output from retained input after the processing code
   changes.** SOURCES.md quote 3 supports this. Step 5/6 use this definition implicitly (Kappa's
   replay is reprocessing); checked the reel never uses the word "reprocessing" without this
   specific meaning (code changed, not just "replaying old data for a new reason").

4. **The Kappa proposal: retain the full log, start a second instance of the same job from the
   start, write to a new output table.** SOURCES.md quote 4 supports this exactly, including the
   "one code path" property (same job, not a second system) — step 5's fig line matches this
   precisely ("Kappa sits on the streaming card, replay as the batch path, from the retained
   log").

5. **The "Kappa Architecture" name, offered with explicit modesty.** SOURCES.md quote 5 supports
   this ("though it may be too simple of an idea to merit a Greek letter"). The reel does not
   claim Kreps asserted this as a formal, settled architecture name — step 5's narrator line
   treats it as a named point to place, not an authority claim, which matches the source's own
   modesty.

6. **Kappa's real resource cost: roughly double output storage during a reprocessing run, not a
   free alternative to Lambda.** SOURCES.md quote 6 supports this directly ("my proposal requires
   temporarily having 2x the storage space in the output database"). Step 6's takeaway and fig
   state Kappa's cost as "a real, temporary doubling of output storage," matching the source's own
   number (2x, temporary) rather than inflating it into a permanent cost.

7. **The Dataflow Model paper's own framing: nothing about the unified model is magical, and it
   reserves "streaming"/"batch" for execution engines only, not for the data's own shape.**
   SOURCES.md's second source (Akidau et al., VLDB 2015) supports both claims directly, fetched
   and quoted independently rather than attributed to the engines' own documentation. Post-notes'
   "Internals" section uses this as the theoretical basis unified engines implement — checked that
   the post-notes wording doesn't overclaim the model as a solved, shipped product (it isn't; the
   paper itself is the *model*, and Flink/Spark are named separately as its *implementations*).

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("streaming always wins once it meets the SLO, since it
  has the most headroom") is wrong because headroom costs infrastructure that sits idle most of
  the time — this is a reasonable, not strawman, distractor (a newcomer's first instinct really is
  "fastest wins"). The correct option matches the chapter's own decision-card logic (topics 1-2):
  cheapest that clears the floor, re-opened by reprocessing cost. No source claim needed here —
  this is the chapter's own established decision rule, not Kreps's claim.
- **Predict 2 (step 8):** checked this isn't attributed to Kreps's own text (it isn't — push/pull
  failure visibility is a structural point this topic makes on its own, flagged in `OUTLINE.md`
  as "named as a structural choice," and SOURCES.md's note already discloses that the push/pull
  and unified-engine material isn't independently sourced here, per `CHAPTER.md`'s own "leaves
  out" line for this entry). No fact-check risk: the claim is framed as reasoning from the
  decision card's own logic (silent zero-row pull looks identical to a quiet day), not as a cited
  fact requiring its own source.

## Decision-card numbers (step 3-4 fig)

The four shapes' latency floors against the fifteen-minute SLO are illustrative orderings
(batch ≫ SLO, micro-batch ≈ SLO boundary, streaming and hybrid ≪ SLO) used only to show the
*shape* of the decision, not as cited real-world latency figures — no source claim is made about
any specific system's floor, and no literal digit appears in `reel.tsx` for these (see QUALITY.md
digit rule). `examples.py`'s own `DECISION_CARD` structure carries the actual modeled numbers used
to compute which shapes clear the bar, so the on-screen comparison is backed by a real
computation, not an arbitrary illustration.

## Outcome

No open findings. Every claim traces to one of SOURCES.md's nine verbatim quotes across its two
sources; the two predicts rest on the chapter's own established decision rule and a disclosed,
deliberately independent structural point, not an unsourced factual claim.
