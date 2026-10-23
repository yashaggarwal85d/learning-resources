{{
    config(
        materialized='incremental',
        incremental_strategy='microbatch',
        event_time='order_date',
        batch_size='day',
        begin='2026-01-01',
        lookback=1
    )
}}

select order_id, customer_id, product_id, order_date, amount_dollars, status, updated_at
from {{ ref('stg_orders') }}
