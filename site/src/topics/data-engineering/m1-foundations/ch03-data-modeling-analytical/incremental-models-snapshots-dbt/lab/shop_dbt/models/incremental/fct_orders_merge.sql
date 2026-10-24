{{
    config(
        materialized='incremental',
        incremental_strategy='merge',
        unique_key='order_id'
    )
}}

select order_id, customer_id, product_id, order_date, amount_dollars, status, updated_at
from {{ ref('stg_orders') }}

{% if is_incremental() %}
-- one day of lookback, to catch late-arriving updates to rows this run would otherwise consider already settled
where updated_at > (select coalesce(max(updated_at), '1900-01-01'::timestamp) - interval '1 day' from {{ this }})
{% endif %}
