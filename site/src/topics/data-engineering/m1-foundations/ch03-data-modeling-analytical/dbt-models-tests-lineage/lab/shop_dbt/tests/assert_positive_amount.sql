select order_id
from {{ ref('fct_orders') }}
where amount_dollars <= 0
