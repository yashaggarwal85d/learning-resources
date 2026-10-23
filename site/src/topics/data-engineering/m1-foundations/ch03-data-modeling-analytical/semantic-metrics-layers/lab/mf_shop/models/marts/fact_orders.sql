select
    row_number() over () as order_id,
    1 + (row_number() over ()) % 50 as customer_id,
    1 + (row_number() over () * 7) % 20 as product_id,
    (date '2026-01-01' + interval (row_number() over ()) hour)::date as order_date,
    1 + (row_number() over ()) % 5 as quantity,
    round(10 + ((row_number() over () * 37) % 490), 2) as amount
from range(1, 8000)
