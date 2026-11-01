# Sources — de.managed-ingestion-tools-build

`CHAPTER.md` names Fivetran, Airbyte, dlt, Meltano and Kafka Connect; this topic quotes three
independent primary sources covering the load-bearing claims (Fivetran's pricing unit, the
Fivetran/dbt Labs merger completion, and dlt's schema-drift contract modes) and names the other
tools' own documented behaviour in prose without quoting internals this topic does not measure.

## Fivetran docs: Usage-based pricing

URL: https://fivetran.com/docs/core-concepts/usage-based-pricing
Fetched: 2026-10-31.

Quotes:
> MAR is the number of distinct rows synced from the source system to your destination system in a given calendar month.

> We separately count primary keys by account, destination, connection, table, activation, and activation sync.

> Once a row is active, it is only counted once per month - no matter how many updates are made that month.

Items: the exact pricing mechanic this topic's own MAR-cost measurement reproduces — a key is
charged once per month regardless of how many times it is updated that month, counted
separately per table.

## Fivetran press release: "Fivetran + dbt Labs Complete Merger to Create the Data Infrastructure for Trusted AI Agents"

URL: https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents
Fetched: 2026-10-31.

Quotes:
> Fivetran, the data foundation for AI, today announced the completion of its merger with dbt Labs, the creator of dbt and the leader in standards for AI-ready structured data.

Items: confirms the merger named in the syllabus ("merging with dbt Labs, announced Oct 2025")
completed on 1 June 2026, so this topic states it in the past tense rather than as pending.

## dlt docs: Schema and data contracts

URL: https://dlthub.com/docs/general-usage/schema-contracts
Fetched: 2026-10-31.

Quotes:
> evolve: No constraints on schema changes.

> freeze: This will raise an exception if data is encountered that does not fit the existing schema, so no data will be loaded to the destination.

> discard_row: This will discard any extracted row if it does not adhere to the existing schema, and this row will not be loaded to the destination.

> discard_value: This will discard data in an extracted row that does not adhere to the existing schema, and the row will be loaded without this data.

Items: the exact four schema-drift policies this topic's own measurement reproduces (dlt's real
mode names are `discard_row` and `discard_value`, not the syllabus's informal
"discard_rows"/"discard_columns" phrasing, so this topic uses dlt's own terms).
