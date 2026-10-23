{{
    config(
        materialized='incremental',
        incremental_strategy='delete+insert',
        unique_key='order_id'
    )
}}

select order_id, customer_id, product_id, order_date, amount_dollars, status, updated_at
from {{ ref('stg_orders') }}

{% if is_incremental() %}
where updated_at > (select coalesce(max(updated_at), '1900-01-01'::timestamp) from {{ this }})
{% endif %}
