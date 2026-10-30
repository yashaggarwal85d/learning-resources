# Outline — de.drift-label-delay-monitoring

## Outcomes (from CHAPTER.md)

Classify a reproduced shift as data drift, concept drift, or both; run PSI, KS and Jensen-Shannon
on the same feature pair and explain a case where they disagree; detect a null-rate creep that a
per-feature distributional test misses and say what check does catch it; name which signals are
available as proxies while a label is delayed, and state precisely what a proxy's movement does
and does not prove about real model performance.

## 10-step storyboard

1. **Hook.** A model's PSI stays under 0.05 for months — no drift, by that number — while live
   precision quietly halves.
2. **Predict: what kind of drift a distribution test structurally misses.** (Correct: concept
   drift — the inputs look the same, but what they predict has changed.)
3. **Reveal: data drift vs. concept drift, the distinction.** Data drift is the input moving;
   concept drift is the input-to-label relationship moving even when the input looks the same. No
   takeaway (reel test's reference step).
4. **Reveal: PSI, KS and JS, run on the same shift.** All three tests, implemented by hand, agree
   cleanly on an obvious mean shift. Takeaway on what each test actually measures.
5. **Reveal: a case where they disagree.** A shift concentrated narrowly enough that PSI's coarse
   deciles stay quiet while KS's full-resolution comparison notices more. Takeaway on why
   disagreement is expected, not a bug.
6. **Reveal: schema and null-rate drift, the silent corruption.** A rising null rate, absorbed by
   mean-imputation, barely moves PSI on the imputed column — but the null-rate check itself
   catches it directly. Takeaway on why that check has to exist separately.
7. **Reveal: proxy metrics during label delay.** While the true label is weeks away, a team
   watches proxies: input/output distributions, confidence scores, downstream signals. Takeaway
   naming proxies explicitly as proxies.
8. **Reveal: what a proxy's movement does and does not prove.** The concept-drift case from step 2
   revisited: PSI on the feature stayed quiet while precision collapsed — proof that a proxy can
   move in a direction with no reliable relationship to real performance at all, in either
   direction. Takeaway on the gap between "the proxy moved" and "the model got worse."
9. **Recap.**
10. **Prove it.** PSI, KS and JS all agree "no drift" on a feature; precision has visibly dropped
    anyway. Trust the three tests, or trust the proxy you can actually observe sooner? (Correct:
    neither is "trusted" blindly — the tests cover data drift, not concept drift, which is exactly
    the gap a label-tied proxy exists to watch for.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7, 8 (five takeaways).

## Post-notes headings

Outcomes; Internals (the three tests' actual mechanics, implemented and run); Lab (none of its
own — the reproduced shifts are the executable evidence); Production failures this topic warns
about; Frontier (Evidently's own default thresholds); Where this goes next (embeddings drift too).

## Examples.py spec

Pure NumPy (no scipy in this sandbox) implementations of PSI, a two-sample KS statistic, and
Jensen-Shannon distance, run against feature windows loaded into this sandbox's own Postgres
(`t17d_reference`, `t17d_current`) and local arrays: (1) an obvious mean-shift case where all
three tests agree; (2) a concept-drift case where the feature distribution is unchanged (low PSI)
but a fixed decision rule's precision collapses because the label relationship flipped; (3) a
null-rate creep absorbed by mean-imputation, where PSI on the imputed column stays low but the
null rate itself is clearly elevated; (4) a narrowly concentrated shift engineered so PSI's
decile-based bins stay quieter than KS's full-resolution comparison, demonstrating real
disagreement between the two tests on the same data.

## Bridge / handoff

Bridge (answers topic 4's handoff verbatim): "A versioned dataset still assumes the world it was
drawn from hasn't moved since. It has. This topic is what to do about that: telling data drift
apart from concept drift, three per-feature tests that disagree on purpose, the silent corruption
a null-rate creep causes, and the proxy metrics you watch while the true label is still weeks
away."

Handoff (leads into topic 6): "Everything in this section assumed a feature is a number or a
category. An embedding is a feature too — a few hundred numbers standing for a document — and it
drifts exactly the same way, except re-embedding the whole corpus to fix it is not free. The next
topic is what keeping embeddings fresh actually costs at scale."

## Concept ledger

Introduces: `data-drift-vs-concept-drift`, `psi-ks-js-per-feature-tests`,
`schema-and-null-rate-drift`, `proxy-metrics-during-label-delay`.
Uses: `dataset-snapshot-reproducibility`, `label-version-drift` (topic 4); `feature-ttl-staleness`,
`label-feature-timeline-join` (topic 1); `log-and-wait-label-join` (topic 3).
Declared: basic descriptive statistics (a histogram, a cumulative distribution).

## Claims list (for FACT-CHECK.md)

1. Evidently: KS test default threshold is p-value < 0.05, used by default for numerical data at
   small sample sizes.
2. Evidently: PSI's drift is flagged when psi_value ≥ its default threshold of 0.1.
3. Evidently: Jensen-Shannon distance drift is flagged at distance ≥ its default threshold of 0.1,
   and is Evidently's default method for categorical data above 1000 objects.
4. Jensen-Shannon divergence is a symmetrized, smoothed version of KL divergence.
5. Jensen-Shannon divergence is bounded by 1 for two distributions when using the base-2 logarithm.
6. The square root of the Jensen-Shannon divergence is itself a metric, the Jensen-Shannon
   distance.
7. The two-sample KS test compares the empirical cumulative distribution functions of two samples
   directly, without binning, and is sensitive to both location and shape differences.
8. (This course, measured) all three tests agree cleanly on an engineered mean-shift case.
9. (This course, measured) a feature's PSI can stay near zero while a fixed decision rule's
   precision collapses, if only the label relationship moved.
10. (This course, measured) mean-imputation of a rising null rate can keep a distributional test's
    score low on the imputed column even as the null rate itself is clearly elevated.
11. (This course, measured) a narrowly concentrated shift can register more on a KS statistic than
    on PSI's coarser decile bins, on the identical data.
