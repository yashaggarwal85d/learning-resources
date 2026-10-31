# Sources — de.global-manufacturing-telemetry-platform

`CHAPTER.md` names Chapter 10's hybrid-and-regulatory topics as in-course anchors, the OASIS MQTT
5.0 standard, the Eclipse Sparkplug and OPC Foundation specification pages (forward pointers to
Chapter 16, fetched for naming accuracy only), Pelkonen et al.'s "Gorilla" paper (VLDB 2015),
Prometheus's labels and storage documentation, and a public engineering write-up of a
manufacturing or industrial IoT data platform as candidates. This topic quotes Pelkonen et al.,
"Gorilla: A Fast, Scalable, In-Memory Time Series Database" (the compression figure this topic's
capacity estimate quotes as a reference point, not a promise) and Prometheus's own documentation
(the cardinality warning behind this topic's series-count decision) — two sources, satisfying the
≥2-source rule. Chapter 10's hybrid-and-regulatory material is a prior topic on this same site,
used and not re-taught, not an external source.

## Pelkonen et al., "Gorilla: A Fast, Scalable, In-Memory Time Series Database"

URL: https://www.vldb.org/pvldb/vol8/p1816-teller.pdf
Fetched: 2026-10-31. Proceedings of the VLDB Endowment, Vol. 8, No. 12 (2015).

Quotes:
> As of Spring 2015, Facebook's monitoring systems generate more than 2 billion unique time series of counters, with about 12 million data points added per second.

> At 16 bytes per point, the resulting 16TB of RAM would be too resource intensive for practical deployment.

> A two-hour block allows us to achieve a compression ratio of 1.37 bytes per data point.

Items: (1) the scale this topic's own capacity estimate is modeled against, stated as Facebook's
own monitoring workload, not this topic's manufacturing data; (2) the uncompressed baseline (16
bytes per point) the compression figure is measured against; (3) the published compression result
(1.37 bytes per point, a roughly twelve-times reduction from the 16-byte baseline) this topic
quotes as a reference point for what telemetry compression can achieve, explicitly not as a
promise for this topic's own signals, which the topic states depend on the data.

## Prometheus documentation, "Metric and label naming"

URL: https://prometheus.io/docs/practices/naming/
Fetched: 2026-10-31.

Quotes:
> Use labels to differentiate the characteristics of the thing that is being measured:

> Remember that every unique combination of key-value label pairs represents a new time series,

> Do not use labels to store dimensions with high cardinality (many different label values), such as user IDs, email addresses, or other unbounded sets of values.

Items: (1) the intended use of a label, the mechanism this topic's asset-hierarchy context ends
up attached to each series through; (2) the definition of cardinality this topic's series-count
estimate is built on — every unique label combination is its own series; (3) the warning this
topic's design follows when deciding what becomes a label versus what stays inside the asset
hierarchy's own reference table.
