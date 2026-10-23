select
    pid as product_id,
    'category_' || (pid % 5) as category
from range(1, 21) as t(pid)
