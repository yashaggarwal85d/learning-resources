## Google SRE Book — Chapter 4, "Service Level Objectives"

URL: https://sre.google/sre-book/service-level-objectives/
Version: Google SRE Book, Chapter 4 (accessed 2026-10-30)

> An SLI is a service level indicator—a carefully defined quantitative measure of some aspect of the level of service that is provided.

> Most services consider request latency—how long it takes to return a response to a request—as a key SLI. Other common SLIs include the error rate, often expressed as a fraction of all requests received, and system throughput, typically measured in requests per second. The measurements are often aggregated: i.e., raw data is collected over a measurement window and then turned into a rate, average, or percentile.

> An SLO is a service level objective: a target value or range of values for a service level that is measured by an SLI. A natural structure for SLOs is thus SLI ≤ target, or lower bound ≤ SLI ≤ upper bound. For example, we might decide that we will return Shakespeare search results "quickly," adopting an SLO that our average search request latency should be less than 100 milliseconds.

> Finally, SLAs are service level agreements: an explicit or implicit contract with your users that includes consequences of meeting (or missing) the SLOs they contain. The consequences are most easily recognized when they are financial—a rebate or a penalty—but they can take other forms. An easy way to tell the difference between an SLO and an SLA is to ask "what happens if the SLOs aren't met?": if there is no explicit consequence, then you are almost certainly looking at an SLO.

> Most people really mean SLO when they say "SLA." One giveaway: if somebody talks about an "SLA violation," they are almost always talking about a missed SLO. A real SLA violation might trigger a court case for breach of contract.

> Using percentiles for indicators allows you to consider the shape of the distribution and its differing attributes: a high-order percentile, such as the 99th or 99.9th, shows you a plausible worst-case value, while using the 50th percentile (also known as the median) emphasizes the typical case.

> All systems should care about correctness: was the right answer returned, the right data retrieved, the right analysis done? Correctness is important to track as an indicator of system health, even though it's often a property of the data in the system rather than the infrastructure per se, and so usually not an SRE responsibility to meet.

> Start by thinking about (or finding out!) what your users care about, not what you can measure. Often, what your users care about is difficult or impossible to measure, so you'll end up approximating users' needs in some way. However, if you simply start with what's easy to measure, you'll end up with less useful SLOs.

Contents (for the coverage map):
1. Indicators — definition, latency/error-rate/throughput examples, aggregation over a window into rate/average/percentile.
2. Why percentiles over the mean — worst-case (p99/p99.9) vs typical case (median), skew of response-time data.
3. Correctness as an indicator, and whose responsibility it is.
4. Objectives — the SLI ≤ target / bound ≤ SLI ≤ bound structure, worked example.
5. Agreements — SLA vs SLO, the "what happens if missed" test, the common conflation of the two terms.
6. Objectives in practice — start from what users care about, not what is easy to measure.

## Google SRE Workbook — Chapter 2, "Implementing SLOs"

URL: https://sre.google/workbook/implementing-slos/
Version: Google SRE Workbook, Chapter 2 (accessed 2026-10-30)

> Consider the common ways your users interact with your system—common tasks and critical activities.

> We recommend choosing a small number (five or fewer) of SLI types that represent the most critical functionality to your customers.

> You can use critical user journeys to help capture the experience of your customers. A critical user journey is a sequence of tasks that is a core part of a given user's experience and an essential aspect of the service.

> If a particular component has inherent reliability limitations, the SLO can communicate that limitation. If the user journey that depends upon it needs a higher level of availability than that component can reasonably provide, you need to engineer around that condition.

Contents (for the coverage map):
1. The worksheet method for turning a system into SLIs — list user interactions, draw the architecture, group components by category.
2. Recommending five or fewer SLI types per critical function, to keep the set actionable.
3. Critical user journeys as the unit SLOs should be defined around, rather than components in isolation.
4. A component's inherited reliability ceiling — a dependency can't give a journey a guarantee stronger than its own.

Note: Kleppmann's *Designing Data-Intensive Applications* was considered for the "correctness as framing" angle but has no accessible primary-source text to fetch and quote under this project's sourcing rule (`scripts/sources.mjs`); its claim is dropped rather than cited from memory. The SRE book's own correctness discussion (source 1, item 3) carries that role instead.
