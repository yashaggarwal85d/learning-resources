# Sources — grain-first dimensional design

Fetched: 2026-10-22.

## Kimball Group, "Four-Step Dimensional Design Process"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/four-4-step-design-process/

> The four key decisions made during the design of a dimensional model include:

> Select the business process.

> Declare the grain.

> Identify the dimensions.

> Identify the facts.

> The answers to these questions are determined by considering the needs of the business along with the realities of the underlying source data during the collaborative modeling sessions.

## Kimball Group, "Grain"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/

> Declaring the grain is the pivotal step in a dimensional design. The grain establishes exactly what a single fact table row represents. The grain declaration becomes a binding contract on the design.

> The grain must be declared before choosing dimensions or facts because every candidate dimension or fact must be consistent with the grain.

> Atomic grain refers to the lowest level at which data is captured by a given business process. We strongly encourage you to start by focusing on atomic-grained data because it withstands the assault of unpredictable user queries; rolled-up summary grains are important for performance tuning, but they pre-suppose the business’s common questions.

> Each proposed fact table grain results in a separate physical table; different grains must not be mixed in the same fact table.

## Kimball Group, "Additive, Semi-Additive, and Non-Additive Facts"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/additive-semi-additive-non-additive-fact/

> The numeric measures in a fact table fall into three categories. The most ﬂexible and useful facts are fully additive; additive measures can be summed across any of the dimensions associated with the fact table.

> Semi-additive measures can be summed across some dimensions, but not all; balance amounts are common semi-additive facts because they are additive across all dimensions except time.

> Finally, some measures are completely non-additive, such as ratios.

> A good approach for non-additive facts is, where possible, to store the fully additive components  of the non-additive measure and sum these components  into the ﬁnal answer set before calculating the ﬁnal non-additive fact.

## Measured directly
URL: n/a — measured on this session's PostgreSQL sandbox, on a throwaway fact table built fresh for this topic
and dropped afterward.

No existing fact table in this sandbox already uses the shop's order-line grain, so this topic builds one fresh,
disclosed: a real `order_lines` table at the order-line grain, with a real SUM query proving the line-total
measure sums correctly across every dimension, and a real account-balance-style measure proving it does not sum
correctly across time (summing four quarterly balances does not reproduce the year's own ending balance), and a
real ratio measure (profit margin) proving it cannot be summed at all. See `examples.py`.
