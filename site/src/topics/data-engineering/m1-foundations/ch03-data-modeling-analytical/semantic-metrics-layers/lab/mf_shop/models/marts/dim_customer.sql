select
    cid as customer_id,
    'region_' || (cid % 4) as region
from range(1, 51) as t(cid)
