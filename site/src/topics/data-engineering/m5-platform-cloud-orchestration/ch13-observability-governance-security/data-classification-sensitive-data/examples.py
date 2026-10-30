"""Synthetic examples for de.data-classification-sensitive-data. Pure Python over synthetic data
(the shop's customers, orders and support_notes columns, all generated here, no real email, phone
or card number used anywhere)."""

import random
import re


def luhn_checksum_valid(digits):
    """The Luhn algorithm: double every second digit from the right, subtract 9 if over 9, sum
    everything, valid iff the total is divisible by ten."""
    total = 0
    for i, d in enumerate(reversed(digits)):
        d = int(d)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def check_luhn_examples():
    valid_card = "4242424242424242"
    transposed_digit = "4242424242424224"  # last two digits swapped
    assert luhn_checksum_valid(valid_card) is True
    assert luhn_checksum_valid(transposed_digit) is False
    print(f"Luhn check on a valid synthetic card number: {luhn_checksum_valid(valid_card)}")
    print(f"Luhn check on the same number with two digits transposed: {luhn_checksum_valid(transposed_digit)}")


CARD_PATTERN = re.compile(r"\b\d{16}\b")
EMAIL_PATTERN = re.compile(r"\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b", re.IGNORECASE)


def _valid_luhn_card(rng):
    """Build a 16-digit number that passes the Luhn check, deterministically from the rng."""
    base = [str(rng.randint(0, 9)) for _ in range(15)]
    for last in "0123456789":
        if luhn_checksum_valid("".join(base) + last):
            return "".join(base) + last
    raise AssertionError("unreachable: one of ten digits always completes a Luhn-valid number")


def synthetic_structured_rows(n=200, seed=1):
    """Synthetic customers rows: an email and a valid synthetic card number in every row, plus a
    random 16-digit order reference that is Luhn-invalid in all but a tiny fraction of cases (the
    false-positive rate a bare 16-digit regex would have without the checksum)."""
    rng = random.Random(seed)
    rows = []
    for i in range(n):
        email = f"customer{i}@example-shop.test"
        card = _valid_luhn_card(rng)
        order_id = "".join(str(rng.randint(0, 9)) for _ in range(16))  # a decoy 16-digit non-card number
        rows.append({"text": f"{email} card {card} order ref {order_id}", "order_id": order_id})
    return rows


def structured_scanner_precision_recall():
    rows = synthetic_structured_rows()
    true_positive_cards = 0
    false_positive_cards = 0
    emails_found = 0
    for row in rows:
        found = EMAIL_PATTERN.findall(row["text"])
        emails_found += len(found)
        card_candidates = CARD_PATTERN.findall(row["text"])
        cards = [c for c in card_candidates if luhn_checksum_valid(c)]
        true_positive_cards += 1 if any(c != row["order_id"] for c in cards) else 0
        false_positive_cards += 1 if row["order_id"] in cards else 0
    precision = true_positive_cards / (true_positive_cards + false_positive_cards) if (true_positive_cards + false_positive_cards) else 1.0
    recall = true_positive_cards / len(rows)
    return {"rows": len(rows), "emails_found": emails_found, "precision": precision, "recall": recall}


# Ground truth: every one of these notes contains real PII. Only the first two have a
# standard-format phone number a plain phone regex can catch; the rest hide PII in a shape no
# phone-or-card regex (tuned for the structured columns above) can match at all — a genuinely
# unformatted phone and a bare card-ending-in-four-digits reference.
FREE_TEXT_WITH_PII = [
    "call me on 0151 822 4567 instead, happy to confirm the order",
    "customer said reach her at 0161 905 2210 if the parcel is late",
    "customer said reach her at 0161 905 2210 if the parcel is late",
    "alternate contact is oh-one-five-one, eight hundred, forty five sixty seven, ask for Dana",
    "my card ends 4242, no need to call",
    "card on file ends in 7781, update not required",
]
FREE_TEXT_WITHOUT_PII = [
    "customer was happy with the resolution",
    "escalated to billing team for review",
    "no further action needed on this ticket",
    "refund already processed per policy",
]

FREE_TEXT_PHONE_PATTERN = re.compile(r"\b0\d{3,4}[ -]?\d{3}[ -]?\d{4}\b")


def synthetic_support_notes(seed=2):
    rng = random.Random(seed)
    notes = [(text, True) for text in FREE_TEXT_WITH_PII]
    notes += [(text, False) for text in FREE_TEXT_WITHOUT_PII] * 5  # pad the clean class
    rng.shuffle(notes)
    return notes


def free_text_miss_rate():
    """The same phone pattern used on structured data, run over free text: catches the two
    standard-format phone numbers, misses the spelled-out phone and both partial-card mentions,
    because a scanner built for structured columns has no pattern for either shape."""
    notes = synthetic_support_notes()
    true_positive = 0
    false_negative = 0
    for text, has_pii in notes:
        if not has_pii:
            continue
        if FREE_TEXT_PHONE_PATTERN.search(text):
            true_positive += 1
        else:
            false_negative += 1
    total_with_pii = true_positive + false_negative
    recall = true_positive / total_with_pii if total_with_pii else 1.0
    return {"total_with_pii": total_with_pii, "true_positive": true_positive, "false_negative": false_negative, "recall": recall}


def tag_propagation_through_hash_and_aggregate():
    """A toy three-node lineage graph: source column (tagged) -> hashed column -> aggregate.
    The tag survives the hash (still personal data under GDPR Art. 4's 'identifiable indirectly'
    clause, since a hash of a known value set is reversible by lookup) but is dropped at the
    aggregate (a count has no per-subject content left)."""
    source = {"column": "customers.email", "tag": "restricted-pii", "readable": True}
    hashed = {"column": "customers.email_hash", "tag": source["tag"], "readable": False}
    aggregate = {"column": "daily_revenue.customer_count", "tag": None, "readable": True}
    return source, hashed, aggregate


def unprotected_fraction_from_miss_rate(discovery_recall, fraction_of_data_sensitive):
    """If a masking policy protects only tagged columns, and discovery has a known recall (the
    fraction of truly sensitive columns it actually tags), the fraction of sensitive data left
    unprotected is the fraction discovery misses, times how much of the data is sensitive at
    all."""
    miss_rate = 1 - discovery_recall
    return miss_rate * fraction_of_data_sensitive


def check_unprotected_fraction_example(free_text_recall):
    # discovery recall taken directly from this topic's own free-text measurement above; of the
    # shop's columns, a fifth are actually sensitive.
    unprotected = unprotected_fraction_from_miss_rate(discovery_recall=free_text_recall, fraction_of_data_sensitive=0.20)
    print(f"with {free_text_recall:.1%} discovery recall on free text and 20% of columns truly sensitive, {unprotected:.1%} of columns are sensitive AND unprotected")
    assert abs(unprotected - (1 - free_text_recall) * 0.20) < 1e-9


def main():
    check_luhn_examples()
    structured = structured_scanner_precision_recall()
    print(f"structured columns: precision {structured['precision']:.3f}, recall {structured['recall']:.3f}, over {structured['rows']} rows")
    free_text = free_text_miss_rate()
    print(f"free text (support_notes): recall {free_text['recall']:.3f}, {free_text['false_negative']} missed out of {free_text['total_with_pii']} notes with real PII")
    assert structured["recall"] > 0.99
    assert free_text["recall"] < structured["recall"]
    assert free_text["false_negative"] > 0
    source, hashed, aggregate = tag_propagation_through_hash_and_aggregate()
    print(f"tag propagation: {source['column']} ({source['tag']}, readable={source['readable']}) -> {hashed['column']} ({hashed['tag']}, readable={hashed['readable']}) -> {aggregate['column']} (tag={aggregate['tag']})")
    assert hashed["tag"] == source["tag"] and hashed["readable"] is False
    assert aggregate["tag"] is None
    check_unprotected_fraction_example(free_text["recall"])
    print("de.data-classification-sensitive-data examples: all checks pass")


if __name__ == "__main__":
    main()
