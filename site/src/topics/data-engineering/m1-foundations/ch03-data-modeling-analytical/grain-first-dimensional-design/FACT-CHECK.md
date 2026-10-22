# Fact-check — grain-first dimensional design

| # | Claim | Status |
|---|---|---|
| 1 | The four key decisions in dimensional design: select the business process, declare the grain, identify the dimensions, identify the facts. | Confirmed, quoted directly (Kimball Group, "Four-Step Dimensional Design Process"). |
| 2 | These answers are determined by the needs of the business and the realities of the source data, during collaborative modeling sessions. | Confirmed, quoted directly (same source). |
| 3 | Declaring the grain is the pivotal step; the grain establishes exactly what a single fact table row represents, and becomes a binding contract on the design. | Confirmed, quoted directly (Kimball Group, "Grain"). |
| 4 | The grain must be declared before choosing dimensions or facts, because every candidate dimension or fact must be consistent with the grain. | Confirmed, quoted directly (same source). |
| 5 | Atomic grain is the lowest level at which data is captured by a business process; starting there withstands unpredictable queries, while rolled-up grains pre-suppose the business's common questions. | Confirmed, quoted directly (same source). |
| 6 | Different grains must not be mixed in the same fact table; each proposed grain results in a separate physical table. | Confirmed, quoted directly (same source). |
| 7 | Additive measures can be summed across any dimension associated with the fact table. | Confirmed, quoted directly (Kimball Group, "Additive, Semi-Additive, and Non-Additive Facts"). |
| 8 | Semi-additive measures can be summed across some dimensions but not all; balance amounts are additive across all dimensions except time. | Confirmed, quoted directly (same source). |
| 9 | Some measures are completely non-additive, such as ratios. | Confirmed, quoted directly (same source). |
| 10 | The fix for a non-additive measure: store its fully additive components, sum those, then compute the final ratio — often in the BI layer or OLAP cube. | Confirmed, quoted directly (same source). |
| 11 | A real order-line fact table, built at atomic grain, sums its line totals to exactly the order's own total whether grouped by region or rolled up to the order. | Measured directly on this sandbox; see `examples.py`. |
| 12 | A coarser, order-level grain has no product/quantity/line columns at all, so it cannot answer a line-level question — not merely "harder," but structurally unable. | Measured directly: the throwaway order-header table built for this topic has no such columns (SOURCES.md, `examples.py`). |
| 13 | Summing four quarterly account balances produces a number (460.00) that does not match the correct year-end balance (150.00, the last quarter's own value) — a concrete demonstration of semi-additivity's limit. | Measured directly on this sandbox; see `examples.py`. |
| 14 | Naively averaging a profit margin across two regions (0.4250) gives a different, wrong answer than recomputing it from the summed revenue and cost (0.3667). | Measured directly on this sandbox; see `examples.py`. |

No claim in this topic is left as an unverified assumption: every definitional claim traces directly to Kimball
Group's own text, and every numeric claim is measured on a real, disclosed throwaway table built for this
topic, not merely asserted.
