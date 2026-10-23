{% snapshot customers_check_snapshot %}

{{
    config(
        target_schema='main',
        unique_key='customer_id',
        strategy='check',
        check_cols=['region'],
    )
}}

select customer_id, customer_name, region
from {{ ref('raw_customers') }}

{% endsnapshot %}
