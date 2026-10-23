select
    d::date as order_date,
    extract(month from d) as month_of_year,
    extract(year from d) as calendar_year
from range(date '2026-01-01', date '2027-01-01', interval 1 day) as t(d)
