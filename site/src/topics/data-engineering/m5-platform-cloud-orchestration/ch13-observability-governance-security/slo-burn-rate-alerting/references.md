Last verified: 30 October 2026. Expert sign-off: pending. Five synthetic experiments run in
`examples.py` (pure Python, reusing the shape of topic 1's own freshness series): burn-rate and
time-to-exhaustion, a fixed-threshold rule's poor reset time, a multi-window rule's fast reset, the
low-availability threshold check, and the fixed-vs-schedule-aware false-alarm comparison — all five
pass their asserts.

- Google SRE Workbook, "Alerting on SLOs": [sre.google](https://sre.google/workbook/alerting-on-slos/). Burn rate, multiwindow alerting, the recommended thresholds and the low-availability caveat.
- Google SRE Book, "Monitoring Distributed Systems": [sre.google](https://sre.google/sre-book/monitoring-distributed-systems/). "Every page should be actionable."
- Prometheus documentation, "Alerting rules": [prometheus.io](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/). The alert-rule syntax the workbook's own examples use.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=slo-burn-rate-alerting:%20).
