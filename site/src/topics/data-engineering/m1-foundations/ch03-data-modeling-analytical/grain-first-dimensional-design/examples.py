"""Measured truth for grain-first-dimensional-design, run on this session's PostgreSQL sandbox
against a throwaway order-line fact table, an account-balance table, and a profit-margin table
built fresh for this topic and dropped afterward (SOURCES.md)."""

# --- 1. Grain: one order, two order lines ---
ORDER_TOTAL = 70.00
LINE_ONE_TOTAL = 40.00
LINE_TWO_TOTAL = 30.00
LINE_TOTAL_SUM_BY_REGION = 70.00       # sum(line_total) grouped by region, for this one order's region
LINE_TOTAL_SUM_ROLLED_UP_TO_ORDER = 70.00  # sum(line_total) grouped by order_id, matches the order total exactly

# --- 2. Additive measure: line_total sums correctly across any dimension ---
# proven above: grouping by region or rolling up to the order both reproduce the correct total.

# --- 3. Semi-additive measure: an account balance sums across accounts, not across time ---
QUARTERLY_BALANCES = [100.00, 120.00, 90.00, 150.00]
WRONGLY_SUMMED_ACROSS_QUARTERS = 460.00   # sum(QUARTERLY_BALANCES) -- not a meaningful number
CORRECT_YEAR_END_BALANCE = 150.00         # the last quarter's own balance -- the actually correct answer

# --- 4. Non-additive measure: a profit margin cannot be summed (or averaged) at all ---
EAST_REVENUE, EAST_COST = 200.00, 150.00
WEST_REVENUE, WEST_COST = 100.00, 40.00
WRONGLY_AVERAGED_MARGIN = 0.4250          # avg of the two regions' own ratios -- wrong
CORRECTLY_RECOMPUTED_MARGIN = 0.3667      # (sum(revenue) - sum(cost)) / sum(revenue) -- the correct approach


def check():
    assert LINE_ONE_TOTAL + LINE_TWO_TOTAL == ORDER_TOTAL
    assert LINE_TOTAL_SUM_BY_REGION == ORDER_TOTAL
    assert LINE_TOTAL_SUM_ROLLED_UP_TO_ORDER == ORDER_TOTAL
    assert sum(QUARTERLY_BALANCES) == WRONGLY_SUMMED_ACROSS_QUARTERS
    assert WRONGLY_SUMMED_ACROSS_QUARTERS != CORRECT_YEAR_END_BALANCE
    assert CORRECT_YEAR_END_BALANCE == QUARTERLY_BALANCES[-1]
    naive_avg = round(((EAST_REVENUE - EAST_COST) / EAST_REVENUE + (WEST_REVENUE - WEST_COST) / WEST_REVENUE) / 2, 4)
    assert naive_avg == WRONGLY_AVERAGED_MARGIN
    correct = round((EAST_REVENUE + WEST_REVENUE - EAST_COST - WEST_COST) / (EAST_REVENUE + WEST_REVENUE), 4)
    assert correct == CORRECTLY_RECOMPUTED_MARGIN
    assert WRONGLY_AVERAGED_MARGIN != CORRECTLY_RECOMPUTED_MARGIN
    print("grain-first-dimensional-design examples: all numbers check out")


if __name__ == "__main__":
    check()
