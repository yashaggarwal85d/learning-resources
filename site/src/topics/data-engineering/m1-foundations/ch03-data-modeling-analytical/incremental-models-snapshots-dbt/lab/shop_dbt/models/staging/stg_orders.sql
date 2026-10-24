select
    order_id,
    customer_id,
    product_id,
    order_date,
    quantity,
    {{ cents_to_dollars('amount_cents') }} as amount_dollars,
    status,
    updated_at,
    channel
from {{ ref('raw_orders') }}
