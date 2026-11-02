## Google Cloud: Estimate and control costs (BigQuery)

URL: https://docs.cloud.google.com/bigquery/docs/best-practices-costs
Version: fetched 2026-10-31

> You can limit the number of bytes billed for a query using the maximum bytes
billed setting. When you set maximum bytes billed, the number of bytes that the
query reads is estimated before the query execution. If the number of
estimated bytes is beyond the limit, then the query fails without incurring a
charge.

> For clustered tables, the estimation of the number of bytes billed for a query
is an upper bound, and can be higher than the actual number of bytes billed
after running the query. So in some cases, if you set the maximum bytes billed,
a query on a clustered table can fail, even though the actual bytes billed
wouldn't exceed the maximum bytes billed setting.

## Snowflake: Overview of warehouses

URL: https://docs.snowflake.com/en/user-guide/warehouses-overview
Version: fetched 2026-10-31

> there is a doubling of credit usage as you increase in size to the next larger warehouse size for each full
hour that the warehouse runs; however, note that Snowflake utilizes per-second billing (with a 60-second minimum each time the warehouse
starts) so warehouses are billed only for the credits they actually consume.

> By default, auto-suspend is enabled. Snowflake automatically suspends the warehouse if it is inactive for the specified period of time.

> By default, auto-resume is enabled. Snowflake automatically resumes the warehouse when any statement that requires a warehouse is submitted

## Snowflake: Working with resource monitors

URL: https://docs.snowflake.com/en/user-guide/resource-monitors
Version: fetched 2026-10-31

> A resource monitor can help control costs and avoid unexpected credit usage caused by running warehouses. A
virtual warehouse consumes Snowflake credits while it runs. You can use a resource monitor
to monitor credit usage by virtual warehouses and the cloud services needed to support those warehouses. You can also set up a resource
monitor to suspend a standard virtual warehouse or disable an Adaptive Warehouse when it reaches a
credit limit.

> Resource monitors work for warehouses only. You can't use a resource monitor to track spending associated with serverless
features and AI services. To monitor credit consumption by these features, use a budget instead.

> Credit usage limits can be set for a specified interval or date range. When a limit is reached and/or reaches a specified threshold,
the resource monitor can trigger various actions, such as sending alert notifications, suspending standard warehouses, or disabling
Adaptive Warehouses.

## Databricks: Attribute usage with serverless usage policies

URL: https://docs.databricks.com/en/admin/usage/budget-policies.html
Version: fetched 2026-10-31

> Serverless usage policies consist of tags that are applied to any serverless compute activity incurred by a user assigned to the policy. The tags are logged in your billing records, allowing you to attribute serverless usage to specific budgets.

> If a user is only assigned a single policy, then that policy is automatically applied to the user's newly created resources.

## Google Cloud: Spot VMs

URL: https://cloud.google.com/compute/docs/instances/spot
Version: fetched 2026-10-31

> Spot VMs are available at much lower
prices—up to 91% discounts for many machine types, GPUs, TPUs,
and Local SSDs—compared to the on-demand price for standard VMs.

> However, Compute Engine might preempt Spot VMs at any time,
such as when it needs the resources for other tasks.

> Use Spot VMs to reduce costs for fault-tolerant workloads,
such as batch processing jobs or stateless applications.

> Compute Engine sends a preemption notice to the VM by updating
the preempted value in your VM's default metadata to TRUE, which your
workload can monitor to detect preemption.

> We recommend setting the preemption notice duration to 120 seconds for any
workloads that need a dedicated duration or longer than 30 seconds to
handle preemption.

> The shutdown period for Spot VMs
is best effort and up to 30 seconds, which is shorter than the
shutdown period for other instances.

## Google Cloud: Committed use discounts

URL: https://cloud.google.com/docs/cuds
Version: fetched 2026-10-31

> When you purchase Google Cloud commitments, you commit to either using a
minimum level of resources or spending a minimum amount, for a term duration of
one or three years.

> With standard spend-based CUDs, you receive discounted rates until your
hourly spend on eligible resources and services meets your hourly committed
spend amount.
