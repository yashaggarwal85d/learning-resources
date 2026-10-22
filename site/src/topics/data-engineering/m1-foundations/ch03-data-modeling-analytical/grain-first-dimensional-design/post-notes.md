---
id: de.grain-first-dimensional-design
title: Grain-first dimensional design
---

<section data-section="outcomes">

## After this topic you can

- Run Kimball's four-step design process — business process, grain, dimensions, facts — on a new
  business process, in that order, rather than reaching for dimensions or facts first.
- Declare the most atomic grain available for a fact table, and explain concretely what breaks when
  a grain is declared too coarse instead.
- Classify a measure as additive, semi-additive or non-additive, and state which dimensions each
  one can safely be summed across.

</section>

<section data-section="internals">

## A little deeper

The grain comparison in this topic's reveals is run against a real table pair, not a described
hypothetical: a throwaway order-line table at the atomic grain, and a throwaway order-header table
at the coarser, order-level grain, both built for this topic. Summing the order-line table's own
line totals, whether grouped by region or rolled straight back up to the order, reproduces the
order's own total exactly — real, executed proof that the atomic grain loses nothing a coarser grain
would have kept. The order-header table, by contrast, simply has no product or quantity column at
all, which is the sharper point Kimball's own "different grains must not be mixed" rule is getting
at: a coarse grain isn't merely less convenient to query, it structurally cannot answer a question
the finer grain answers for free.

The additivity demonstrations are similarly measured rather than described. A four-quarter balance
series, summed directly, produces a specific wrong number; the correct year-end balance is simply
the fourth quarter's own value, and the two numbers visibly disagree. A profit margin for two
regions, averaged the naive way, produces a different specific number than recomputing the margin
from each region's summed revenue and cost — and Kimball Group's own stated fix is exactly what
closes that gap: store the additive components, sum those first, and only then compute the ratio.
Both demonstrations exist so that "semi-additive" and "non-additive" are not abstract warnings but
concrete, checkable facts about numbers that genuinely disagree when handled the wrong way.

</section>
