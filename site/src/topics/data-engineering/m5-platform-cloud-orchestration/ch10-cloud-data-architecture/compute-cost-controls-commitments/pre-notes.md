# Pre-notes: Compute cost controls and commitments

- **Slot reservation.** A fixed allocation of BigQuery query-processing capacity paid for by time rather than by bytes scanned.
- **On-demand billing.** Paying per byte actually scanned, with no capacity reserved ahead of time.
- **Warehouse auto-suspend.** A Snowflake warehouse stopping itself, and its billing, after a period of inactivity.
- **Resource monitor.** A Snowflake object that tracks a warehouse's credit usage and can alert, suspend, or disable it at a threshold.
- **`maximum_bytes_billed`.** A BigQuery query setting that fails the query before execution if its estimated bytes exceed the configured cap.
- **Committed-use discount.** A discounted rate traded for a one- or multi-year spend or resource commitment, which only pays off above a break-even utilization.
- **Cost regression.** A pipeline's measured cost exceeding a stated budget on a given run, treated as a CI failure like any other regression.
