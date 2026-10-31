Last verified: 30 October 2026. Expert sign-off: pending. Four measured experiments run in this
sandbox (`examples.py`): a mean-vs-tail demonstration, a two-hosts histogram-merge comparison, a
fan-out Monte Carlo simulation, and the chapter lab's closed-loop-vs-constant-rate generator
comparison, all against this sandbox's own Postgres.

- HdrHistogram project, README: [raw.githubusercontent.com](https://raw.githubusercontent.com/HdrHistogram/HdrHistogram/master/README.md). Histogram additivity and merge-based aggregation, quoted directly.
- Gil Tene, wrk2 README: [raw.githubusercontent.com](https://raw.githubusercontent.com/giltene/wrk2/master/README.md). The Coordinated Omission effect and its fix, quoted directly.
- Dean & Barroso, "The Tail at Scale" (Communications of the ACM, 2013): [barroso.org](https://www.barroso.org/publications/TheTailAtScale.pdf). The fan-out tail-amplification worked example, quoted directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=latency-percentiles-histogram-aggregation:%20).
