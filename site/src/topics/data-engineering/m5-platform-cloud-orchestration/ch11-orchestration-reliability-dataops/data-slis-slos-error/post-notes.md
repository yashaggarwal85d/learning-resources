<section data-section="outcomes">

## Outcomes

By the end of this topic you can: turn a quality dimension into a measurable SLI at the consumer's read point; set a tiered SLO target and compute its error budget; build a multi-window multi-burn-rate alert and show it pages appropriately before a budget is exhausted; explain how a planned backfill or schema change deliberately spends budget.

</section>

<section data-section="internals">

## Internals

The error budget's arithmetic is exactly "100% minus the SLO," but what that buys in practice depends entirely on the measurement window: a 99% SLO over thirty days allows roughly a quarter of a day's worth of lateness across the whole month, not per incident. The Google SRE Workbook's own multi-burn-rate table trades a single fixed window's precision against recall -- a short window catches a sharp failure fast but can miss a slow, still-significant one, so its own recommended rule pairs "2% budget in one hour" and "5% in six hours" (fast, high-burn, page) with "10% in three days" (slower, lower-burn, ticket), so neither failure shape goes unnoticed.

</section>

<section data-section="lab">

## Lab

This topic hosts the three-SLO-with-burn-rate-alerts leg of the 11.3 chapter lab, run as a real thirty-day pipeline run against an in-process database rather than described abstractly. Two SLIs are measured from the same real data: finish-time (did the pipeline's own run complete on schedule) and read-point (how stale is the row a consumer actually reads, right now). A six-day downstream failure is injected partway through the month. The finish-time SLI scores a perfect thirty for thirty; the read-point SLI drops to twenty-four for thirty, and the Google SRE Workbook's own ticket-alert rule, evaluated day by day against the real numbers, fires exactly during the six real stale days and nowhere else.

</section>

<section data-section="production">

## Production

The hook's failure mode is specific and common: a pipeline-level SLA genuinely can be met in full while a consumer-facing promise is broken, with no contradiction anywhere in the data -- the two are simply answering different questions. The practical fix isn't more monitoring in general; it's monitoring at the specific point that matches what was actually promised, and sizing that promise (the SLO) by who is actually depending on it, rather than applying one target uniformly across every table regardless of its tier.

</section>

<section data-section="frontier">

## Frontier

An error budget only does real work once an organization has an error-budget policy: an explicit, agreed answer to what happens once the budget is actually exhausted, approved by the product owner, the development team and the people on call. Without that policy, an SLO is just another number on a dashboard, not a decision-making tool. A planned backfill (topic 3) or a planned schema migration (topic 14) is how a team spends budget on purpose, with the policy already agreed in advance, rather than discovering the cost only after an incident review.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A burn-rate alert tells you a budget is draining. What to do in the minutes after it fires -- and after it's gone -- is incident response, the next topic.

</section>
