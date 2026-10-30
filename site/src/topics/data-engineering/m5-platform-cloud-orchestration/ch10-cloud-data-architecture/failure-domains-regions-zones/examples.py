"""Every number shown in the Failure domains reel, computed and checked.
Run: python3 examples.py (CI runs it too). No cloud account is used here: every
number is arithmetic on a sourced, stated rate, not a measurement against a live service."""

# Step: "What a zone outage actually costs to insure against"
# AWS's own EC2 On-Demand pricing page (data transfer section, fetched 2026-10-30):
# cross-AZ transfer within one Region is billed at $0.01/GB in each direction.
CROSS_AZ_RATE_PER_GB = 0.01

def cross_az_cost(gb_each_direction: float) -> float:
    return round(gb_each_direction * CROSS_AZ_RATE_PER_GB * 2, 2)  # both directions

# The reel shows 500 GB replicated each way over one day.
daily_gb = 500
daily_cost = cross_az_cost(daily_gb)
assert daily_cost == 10.00, daily_cost  # 500 GB out + 500 GB in, at $0.01/GB each = $10.00/day
monthly_cost = round(daily_cost * 30, 2)
assert monthly_cost == 300.00, monthly_cost

# Step: "A cell is a smaller blast radius than a whole region"
TOTAL_CELLS = 20
BAD_CELLS = 1
CUSTOMERS_PER_CELL = 5000  # evenly distributed, for the figure's arithmetic only

affected_customers = BAD_CELLS * CUSTOMERS_PER_CELL
total_customers = TOTAL_CELLS * CUSTOMERS_PER_CELL
blast_radius_fraction = affected_customers / total_customers
assert affected_customers == 5000
assert total_customers == 100_000
assert round(blast_radius_fraction * 100, 1) == 5.0  # one bad cell affects 5% of customers, not 100%

# A whole-region failure mode, by contrast, would have affected every customer:
whole_region_fraction = total_customers / total_customers
assert whole_region_fraction == 1.0

# Step: "Zonal vs regional vs multi-AZ by design, not by luck"
# AWS's own page: "Each AWS Region consists of a minimum of three, isolated,
# and physically separate AZs within a geographic area."
MIN_AZS_PER_AWS_REGION = 3
assert MIN_AZS_PER_AWS_REGION == 3

# AZs are "within 100 km (60 miles) of each other" (same AWS source) — close
# enough that synchronous replication between them is practical.
MAX_AZ_DISTANCE_KM = 100
assert MAX_AZ_DISTANCE_KM == 100

if __name__ == '__main__':
    print(f'Cross-AZ replication: {daily_gb} GB each way/day -> ${daily_cost}/day, ${monthly_cost}/month')
    print(f'Cell blast radius: {BAD_CELLS}/{TOTAL_CELLS} cells bad -> {affected_customers}/{total_customers} customers affected ({blast_radius_fraction:.1%})')
    print('All assertions passed.')
