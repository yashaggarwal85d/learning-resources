Last verified against these sources: 22 October 2026, with the grain and additivity demonstrations
run directly on this session's PostgreSQL sandbox against a throwaway order-line/order-header pair,
a throwaway balance series, and a throwaway revenue/cost pair, all built for this topic and dropped
afterward. Expert sign-off: pending.

- Kimball Group, "Four-Step Dimensional Design Process": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/four-4-step-design-process/). The four decisions, in order.
- Kimball Group, "Grain": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/). Why grain is declared first, and why atomic grain is the safer default.
- Kimball Group, "Additive, Semi-Additive, and Non-Additive Facts": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/additive-semi-additive-non-additive-fact/). The three measure categories, and the fix for non-additive ones.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=grain-first-dimensional-design:%20).
