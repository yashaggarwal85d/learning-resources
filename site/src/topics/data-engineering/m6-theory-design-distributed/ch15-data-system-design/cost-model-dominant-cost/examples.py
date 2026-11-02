"""Lab for de.cost-model-dominant-cost.

Two simulations: a cost waterfall ranking five cost classes to find the one
that dominates a bill, and a lever that lowers a dominating cost while
introducing a second-order cost of its own.
"""

ORDERS_PER_MONTH = 1_000_000

COST_CLASSES_BEFORE = {
    "compute": 900.0,
    "storage": 400.0,
    "egress": 300.0,
    "requests": 6_100.0,
    "licence": 200.0,
}


def cost_waterfall(cost_classes):
    """Rank cost classes by their share of the total bill."""
    total = sum(cost_classes.values())
    ranked = sorted(cost_classes.items(), key=lambda kv: kv[1], reverse=True)
    return {
        "total": total,
        "ranked": [{"class": name, "amount": amount, "share": amount / total} for name, amount in ranked],
    }


def dominating_class(cost_classes):
    waterfall = cost_waterfall(cost_classes)
    return waterfall["ranked"][0]


def cost_per_business_unit(cost_classes, orders_per_month=ORDERS_PER_MONTH):
    total = sum(cost_classes.values())
    return total / orders_per_month * 1_000  # per thousand orders


PRUNING_LAYOUT_SCAN_REDUCTION = 0.9  # the layout lever cuts scanned bytes by this fraction


def apply_pruning_layout_lever(cost_classes):
    """A layout-and-pruning lever lands on the dominating requests/scan cost."""
    after = dict(cost_classes)
    after["requests"] = cost_classes["requests"] * (1 - PRUNING_LAYOUT_SCAN_REDUCTION)
    saved = cost_classes["requests"] - after["requests"]
    return {"after": after, "saved": saved, "reduction_ratio": PRUNING_LAYOUT_SCAN_REDUCTION}


WRITE_AMPLIFICATION_SECOND_ORDER_COST = 150.0  # pre-aggregation's own added write cost


def lever_with_second_order_cost(primary_saving):
    """Every lever that lowers one cost has a second-order cost of its own."""
    net_saving = primary_saving - WRITE_AMPLIFICATION_SECOND_ORDER_COST
    return {
        "primary_saving": primary_saving,
        "second_order_cost": WRITE_AMPLIFICATION_SECOND_ORDER_COST,
        "net_saving": net_saving,
    }


def waterfall_after_price_change(cost_classes, class_name, new_amount):
    """Re-running the waterfall after one provider's price sheet changes —
    the dominator isn't assumed, it's recomputed.
    """
    after = dict(cost_classes)
    after[class_name] = new_amount
    return cost_waterfall(after)


def check():
    before = cost_waterfall(COST_CLASSES_BEFORE)
    assert before["ranked"][0]["class"] == "requests"
    assert before["ranked"][0]["share"] > 0.5  # requests dominates the bill

    dominator = dominating_class(COST_CLASSES_BEFORE)
    assert dominator["class"] == "requests"

    unit_cost = cost_per_business_unit(COST_CLASSES_BEFORE)
    assert unit_cost > 0

    lever = apply_pruning_layout_lever(COST_CLASSES_BEFORE)
    assert lever["after"]["requests"] < COST_CLASSES_BEFORE["requests"]
    assert lever["saved"] > 0

    net = lever_with_second_order_cost(lever["saved"])
    assert net["net_saving"] < lever["saved"]  # the second-order cost eats into the saving
    assert net["net_saving"] > 0

    after_price_change = waterfall_after_price_change(COST_CLASSES_BEFORE, "egress", 20_000.0)
    assert after_price_change["ranked"][0]["class"] == "egress"  # the dominator changed


if __name__ == "__main__":
    check()
    print("de.cost-model-dominant-cost: all checks passed")
