<section data-section="outcomes">

## Outcomes

Classify a reproduced shift as data drift, concept drift, or both; run PSI, KS and Jensen-Shannon
on the same feature pair and explain a case where they disagree; detect a null-rate creep that a
per-feature distributional test misses and say what check does catch it; name which signals are
available as proxies while a label is delayed, and state precisely what a proxy's movement does
and does not prove about real model performance.

</section>

<section data-section="internals">

## Internals

Each of the three tests is a different function of the same two samples. PSI bins both windows on
the reference's own edges and sums a weighted log-ratio across bins — Evidently AI's own
documentation gives it a default flag threshold of 0.1 ("drift detected when psi_value ≥
threshold, default threshold: 0.1"). The Kolmogorov-Smirnov test skips binning entirely and
compares the two samples' empirical cumulative distribution functions directly at every observed
value, which is why Wikipedia's own description calls it "sensitive to differences in both
location and shape." Jensen-Shannon divergence is, in its own words, "a symmetrized and smoothed
version of the Kullback-Leibler divergence," bounded by 1 under a base-2 logarithm, whose square
root (the Jensen-Shannon distance) is itself a proper metric — Evidently's own default method for
larger categorical columns, precisely because it stays well-defined where a bin's probability
drops to zero and KL divergence alone would not.

</section>

<section data-section="lab">

## Lab

This topic hosts no lab of its own; the reproduced shifts in `examples.py` are the executable
evidence, implemented directly in NumPy since this sandbox has no scipy. An obvious mean shift
(mean 4.0 to mean 6.0) produced PSI 1.631, KS 0.499, and Jensen-Shannon distance 0.512 — all three
tests agreeing cleanly. A concept-drift case — the identical feature distribution, with a fixed
decision rule's label relationship fully inverted — held PSI at 0.007 while the rule's measured
precision collapsed from 1.00 to 0.00. A null-rate creep of 11.8%, mean-imputed, kept PSI on the
imputed column at 0.091, just under Evidently's own 0.1 flag threshold, while the null rate itself
was directly and unambiguously measurable. And a narrow, concentrated shift (4% of rows collapsed
onto one value) produced PSI 0.012 against KS 0.022 — a real, reproduced disagreement between the
two tests on identical data.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a quiet distributional test as proof nothing changed.** PSI, KS and Jensen-Shannon were
built to notice an input distribution moving. None of them were built to notice the relationship
between that input and a label moving — their silence is not evidence against concept drift, only
evidence against data drift.

**Letting imputation hide the problem it was meant to patch over.** A null-rate creep absorbed by
mean-imputation can pass a distributional check on the imputed column while the underlying
missingness keeps growing unaddressed — a null-rate check has to exist as its own, separate signal,
not as something a distribution test is expected to surface indirectly.

</section>

<section data-section="frontier">

## Frontier

Evidently AI's own documentation states default thresholds for each test directly: the
Kolmogorov-Smirnov test's "default threshold: 0.05" on its p-value, PSI's "default threshold: 0.1"
on its psi_value, and Jensen-Shannon distance's "default threshold: 0.1" on its distance, the
latter also "the default method for categorical, if > 1000 objects." These are read here as one
real, documented convention to calibrate against, not as a universal law every monitoring setup
must follow.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything in this section assumed a feature is a number or a category. An embedding is a feature
too — a few hundred numbers standing for a document — and it drifts exactly the same way, except
re-embedding the whole corpus to fix it is not free. The next topic is what keeping embeddings
fresh actually costs at scale.

</section>
