{{
    config(
        materialized='incremental',
        incremental_strategy='append'
    )
}}

select order_id, customer_id, product_id, order_date, amount_dollars, status, updated_at
from {{ ref('stg_orders') }}

{% if is_incremental() %}
where order_id > (select coalesce(max(order_id), 0) from {{ this }})
{% endif %}
