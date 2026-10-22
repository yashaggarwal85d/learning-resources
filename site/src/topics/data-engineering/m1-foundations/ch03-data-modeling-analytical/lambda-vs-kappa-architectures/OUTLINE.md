# Outline — de.lambda-vs-kappa-architectures

13-step plan, no lab of its own. First predict within the first four steps.

1. **Hook.** A fraud-detection pipeline needs an answer in seconds, but it also needs to be
   exactly right once all of today's data is in. One stream, or two?
2. **Reveal: Lambda itself, quoted directly.** Marz's own description — batch and realtime
   layers run in parallel, merged at query time (quote 1).
3. **Predict.** Does merging two independently-computed layers at query time risk the two
   disagreeing? (within the first four steps)
4. **Reveal: the realtime layer's own stack, quoted directly.** Read/write databases,
   incremental algorithms — a genuinely different, more complex reasoning model than the batch
   layer's pure functions (quotes 2, 4).
5. **Reveal: the batch layer always wins, quoted directly.** The realtime layer's results are
   always eventually overridden by the batch layer — its own complexity is transient (quote 3).
   Takeaway: a merge at serving time is not a vote between equals; one side is provisional.
6. **Predict.** Is "run the same transformation logic in two different systems" actually the
   expensive part of Lambda, or is it the merge step itself?
7. **Reveal: Kreps's own description of Lambda and its real cost, quoted directly.** Kreps's own
   restatement of Lambda (quote 6) plus his direct naming of the dual-logic cost as "not
   fixable" (quote 7). Takeaway: the cost is maintaining the same logic twice, in two different
   systems, not the merge arithmetic.
8. **Reveal: reprocessing as the shared problem, quoted directly.** Kreps names reprocessing
   (re-deriving output when code changes) as the real challenge both architectures have to
   answer (quote 8) — sets up Kappa as a different answer to the same question Lambda answers.
9. **Predict.** If you kept a full, replayable log of every input record, could a single
   stream-only pipeline reprocess history without ever needing a separate batch system?
10. **Reveal: Kappa itself, quoted directly, named by its own creator.** The retained-log replay
    mechanism (quote 9) and Kreps's own naming of it, "the Kappa Architecture" (quote 10).
    Takeaway: Kappa answers Lambda's own reprocessing problem with one pipeline, not two.
11. **Reveal: the honest trade, quoted directly.** Kreps's own efficiency comparison — a wash,
    not a one-sided win — and his actual stated reason for preferring Kappa: one framework to
    develop, test, and debug, not raw efficiency (quotes 11, 12).
12. **Recap.** Lambda's real cost is duplicate logic across two systems, merged at serving;
    Kappa's answer is one pipeline that reprocesses by replaying a retained log; the industry's
    real reason to prefer unified engines is operational simplicity, not speed.
13. **Prove it.** A pipeline whose retained log is enormous and whose reprocessing-by-replay
    would itself take days — does Kappa's single-pipeline answer still fully replace Lambda's
    batch layer, or does a slower, separately-correct batch layer still earn its cost here?
