select
    region,
    sum(amount_dollars) as total_revenue,
    count(*) as order_count
from {{ ref('fct_orders') }}
where status = 'completed'
group by region
