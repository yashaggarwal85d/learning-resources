# Fact-check

1. **An error budget is 100% minus the SLO target.** Sourced and reproduced directly: `examples.py` asserts the Google SRE Workbook states "the SLO is a target percentage and the error budget is 100% minus the SLO," verified word for word against the fetched page text.

2. **Burn rate measures how fast, relative to the SLO, a service consumes its error budget.** Sourced and reproduced directly: `examples.py` asserts the Workbook states "Burn rate is how fast, relative to the SLO, the service consumes the error budget," verified against the fetched page text.

3. **A burn rate of 1 means a service empties its error budget exactly at the end of the SLO's own time window.** Sourced, Google SRE Workbook: "The example service uses a burn rate of 1, which means that it's consuming error budget at a rate that leaves you with exactly 0 budget at the end of the SLO's time window (see Chapter 4 in our first book)."

4. **Multiple burn rates and time windows catch both a fast, sharp failure and a slower, still-significant one.** Sourced, Google SRE Workbook: "Your alerting logic can use multiple burn rates and time windows, and fire alerts when burn rates surpass a specified threshold. This option retains the benefits of alerting on burn rates and ensures that you don't overlook lower (but still significant) error rates."

5. **The Workbook's own recommended thresholds: 2% budget in one hour and 5% in six hours page; 10% in three days tickets.** Sourced and reproduced directly: `examples.py` asserts "We recommend 2% budget consumption in one hour and 5% budget consumption in six hours as reasonable starting numbers for paging, and 10% budget consumption in three days as a good baseline for ticket alerts," verified against the fetched page text.

6. **A real thirty-day pipeline run measured a perfect finish-time SLI while a six-day downstream outage made the consumer-facing read point stale.** Run and reproduced directly, this topic's own in-process SQLite experiment: `examples.py` asserts the real run's finish-time SLI scored thirty out of thirty days on schedule, while the read-point SLI scored twenty-four out of thirty, with exactly the six days the outage was injected on showing up as stale. This is the project's own experiment, not a third-party claim.

7. **That same six-day outage, measured against a tier-one 99% monthly SLO, consumed many times the entire month's error budget.** Run and reproduced directly: `examples.py` computes the tier-one error budget (1% of thirty days) and shows the six real stale days spent twenty times that budget — well past exhausted.

8. **The Workbook's own ticket-alert rule (10% of budget consumed in a rolling three-day window, burn rate 1) fires correctly against the real stale-day data, and never fires outside the outage.** Run and reproduced directly: `examples.py` evaluates the rule day by day against the real read-point series; it is `True` during the outage and never spuriously fires elsewhere in the thirty real days measured.

9. **The six quality dimensions (freshness, completeness, validity, uniqueness, consistency, accuracy) are refresher material, not new content.** Per CHAPTER.md's own scope for this topic: "the dimensions themselves are refresher material" — this topic's new content is only the SLI/SLO/error-budget framing applied to them, not their definitions, which were taught earlier in the course.

10. **The tiering idea (a tier-one table gets a tighter SLO than a tier-three table) is this topic's own synthesis of CHAPTER.md's stated scope, not an independently sourced claim from any one vendor.** Consistent with CHAPTER.md's framing: "SLO targets per data tier" is named as this topic's own content, built on the error-budget mechanics the Google SRE Workbook sources, not quoted from the Workbook itself as a tiering scheme.
