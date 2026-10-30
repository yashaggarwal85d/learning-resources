## Google SRE Workbook — Alerting on SLOs

URL: https://sre.google/workbook/alerting-on-slos/
Version: Google SRE Workbook, chapter "Alerting on SLOs" (fetched 2026-10-30)

> Burn rate is how fast, relative to the SLO, the service consumes the error budget.

> The example service uses a burn rate of 1, which means that it's consuming error budget at a rate that leaves you with exactly 0 budget at the end of the SLO's time window

> Because the duration does not scale with the severity of the incident, a 100% outage alerts after one hour, the same detection time as a 0.2% outage. The 100% outage would consume 140% of the 30-day budget in that hour.

> A good guideline is to make the short window 1/12 the duration of the long window

> We recommend 2% budget consumption in one hour and 5% budget consumption in six hours as reasonable starting numbers for paging, and 10% budget consumption in three days as a good baseline for ticket alerts.

> Services with an extremely low or an extremely high availability goal may require special consideration. For example, consider a service that has a 90% availability target. Table 5-8 says to page when 2% of the error budget in a single hour is consumed. Because a 100% outage consumes only 1.4% of the budget in that hour, this alert could never fire. If your error budgets are set over long time periods, you may need to tune your alerting parameters.

> Low recall: A 35x burn rate never alerts, but consumes all of the 30-day error budget in 20.5 hours.

Contents:
1. Burn rate's definition and burn-rate-1 as exact budget exhaustion at window end.
2. The progression from a fixed threshold (poor detection/reset time) to burn rate to multiwindow, multi-burn-rate alerting.
3. The 1/12 short-window guideline.
4. The recommended starting thresholds: page at 2%/1hr and 5%/6hr, ticket at 10%/3 days.
5. The low-availability caveat: at 90% availability, a 100% outage only consumes 1.4% of the budget in an hour, so the 2%/1hr page threshold can never fire.

## Google SRE Book — Monitoring Distributed Systems

URL: https://sre.google/sre-book/monitoring-distributed-systems/
Version: Google SRE Book, chapter "Monitoring Distributed Systems" (fetched 2026-10-30)

> Does this rule detect an otherwise undetected condition that is urgent, actionable, and actively or imminently user-visible?

> Every page should be actionable.

> Email alerts were triggered as the SLO approached, and paging alerts were triggered when the SLO was exceeded. Both types of alerts were firing voluminously, consuming unacceptable amounts of engineering time: the team spent significant amounts of time triaging the alerts to find the few that were really actionable, and we often missed the problems that actually affected users, because so few of them did.

Contents:
1. The "every page should be actionable" principle, and the real-world cost of pages that are not (triage time, missed real incidents).

## Prometheus — Alerting rules

URL: https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
Version: Prometheus documentation, "Alerting rules" page (fetched 2026-10-30)

Used only as background for Prometheus' own alert-rule syntax (`expr`, `for`, grouping), matching
the workbook's own example expressions quoted above; no additional claim relied on beyond what the
workbook itself already states.
