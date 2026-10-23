{% snapshot customers_timestamp_snapshot %}

{{
    config(
        target_schema='main',
        unique_key='customer_id',
        strategy='timestamp',
        updated_at='updated_at',
    )
}}

select customer_id, customer_name, region, updated_at
from {{ ref('raw_customers') }}

{% endsnapshot %}
