# Sources

## Implementing SLOs (Google SRE Workbook, Chapter 2)

URL: https://sre.google/workbook/implementing-slos/
Version: Google SRE Workbook (fetched 2026-10-31)

> the SLO is a target percentage and the error budget is 100% minus the SLO. For example, if you have a 99.9% success ratio SLO, then a service that receives 3 million requests over a four-week period had a budget of 3,000 (0.1%) errors over that period.

> Once you have an SLO, you can use the SLO to derive an error budget. In order to use this error budget, you need a policy outlining what to do when your service runs out of budget.

## Monitoring and Alerting on SLOs (Google SRE Workbook, Chapter 5)

URL: https://sre.google/workbook/alerting-on-slos/
Version: Google SRE Workbook (fetched 2026-10-31)

> Burn rate is how fast, relative to the SLO, the service consumes the error budget.

> The example service uses a burn rate of 1, which means that it’s consuming error budget at a rate that leaves you with exactly 0 budget at the end of the SLO’s time window (see Chapter 4 in our first book).

> Your alerting logic can use multiple burn rates and time windows, and fire alerts when burn rates surpass a specified threshold. This option retains the benefits of alerting on burn rates and ensures that you don't overlook lower (but still significant) error rates.

> We recommend 2% budget consumption in one hour and 5% budget consumption in six hours as reasonable starting numbers for paging, and 10% budget consumption in three days as a good baseline for ticket alerts.
