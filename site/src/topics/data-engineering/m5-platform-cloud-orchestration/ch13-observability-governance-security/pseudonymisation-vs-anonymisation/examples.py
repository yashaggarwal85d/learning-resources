"""Synthetic examples for de.pseudonymisation-vs-anonymisation. Uses real hashlib/hmac primitives
(SHA-256 is not broken; the point is that nothing about the hash function itself is weak, only its
unkeyed use) over synthetic candidate lists and a synthetic pseudonymised release."""

import hashlib
import hmac
import random

SECRET_KEY = b"pseudonymisation-secret-not-shared-with-attacker"


def _plain_hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _keyed_hash(value: str, key: bytes = SECRET_KEY) -> str:
    return hmac.new(key, value.encode(), hashlib.sha256).hexdigest()


def _synthetic_emails(n=200):
    domains = ["example.com", "mail.test", "corp.example"]
    return [f"person{i}.lastname{i}@{domains[i % len(domains)]}" for i in range(n)]


def dictionary_attack_on_plain_hash():
    """The EDPB's own worked example: hash a candidate list with the same unkeyed function used
    to 'pseudonymise' a table, then match hashes. Deterministic, and public."""
    known_emails = _synthetic_emails(200)
    # The "pseudonymised" table: 180 of the 200 known emails, plus 20 unrelated ones, all
    # hashed with plain, unkeyed SHA-256.
    table_emails = known_emails[:180] + [f"unrelated{i}@other.test" for i in range(20)]
    table_hashes = {_plain_hash(e) for e in table_emails}

    attacker_dictionary = {e: _plain_hash(e) for e in known_emails}
    recovered = [e for e, h in attacker_dictionary.items() if h in table_hashes]

    recovery_rate = len(recovered) / len(known_emails)
    assert len(recovered) == 180
    assert recovery_rate == 0.9  # 90% recovered, matching the hook's own claim
    return recovery_rate, len(recovered)


def hmac_resists_without_the_key():
    """The same tables, now hashed with HMAC-SHA256 under a secret. Without the key, the
    attacker's dictionary produces different hashes entirely and nothing matches."""
    known_emails = _synthetic_emails(200)
    table_emails = known_emails[:180] + [f"unrelated{i}@other.test" for i in range(20)]
    table_hashes = {_keyed_hash(e) for e in table_emails}

    # Attacker has no key: guesses with an unkeyed hash, or a wrong key, either way the hashes
    # it computes never land in the keyed table's hash space.
    attacker_guess_without_key = {e: _plain_hash(e) for e in known_emails}
    recovered_without_key = [e for e, h in attacker_guess_without_key.items() if h in table_hashes]
    assert len(recovered_without_key) == 0

    # The key holder (the controller) can still reproduce the mechanism: hashing the same email
    # with the key recovers a hash that IS in the table, confirming the key — not the hash
    # function — is what makes attribution possible.
    reproduced = {e: _keyed_hash(e) for e in known_emails[:180]}
    matched_by_key_holder = [e for e, h in reproduced.items() if h in table_hashes]
    assert len(matched_by_key_holder) == 180

    return len(recovered_without_key), len(matched_by_key_holder)


def linkage_attack_on_quasi_identifiers(seed=7):
    """Even a perfectly keyed pseudonym gives up nothing to a dictionary attack. A linkage attack
    is a different mechanism entirely: join quasi-identifiers (postcode, birth year, product mix)
    against an outside list, no key involved."""
    rng = random.Random(seed)
    postcodes = ["N1", "E2", "SW1", "W4", "EC1"]
    product_mixes = ["groceries", "electronics", "books", "clothing"]

    # The outside list: real names with the same quasi-identifiers (e.g. a public voter roll
    # or loyalty-card signup list the attacker already holds).
    outside_list = []
    for i in range(500):
        outside_list.append({
            "name": f"Real Person {i}",
            "postcode": rng.choice(postcodes),
            "birth_year": rng.randint(1950, 2005),
            "product_mix": rng.choice(product_mixes),
        })

    # The pseudonymised release: the SAME 500 people's records, pseudonym in place of name, key
    # destroyed (never used below — the attack doesn't need it).
    release = []
    for i, person in enumerate(outside_list):
        release.append({
            "pseudonym": _keyed_hash(f"subject-{i}"),
            "postcode": person["postcode"],
            "birth_year": person["birth_year"],
            "product_mix": person["product_mix"],
        })

    # Join on the quasi-identifier tuple. A match is unique only if no other outside-list row
    # shares the same (postcode, birth_year, product_mix) combination.
    from collections import Counter
    quasi_key = lambda r: (r["postcode"], r["birth_year"], r["product_mix"])
    outside_counts = Counter(quasi_key(r) for r in outside_list)

    reidentified = 0
    for row in release:
        key = quasi_key(row)
        if outside_counts[key] == 1:
            reidentified += 1

    reidentification_rate = reidentified / len(release)
    return reidentified, len(release), reidentification_rate


def main():
    rate, recovered = dictionary_attack_on_plain_hash()
    print(f"Dictionary attack on plain hash: {recovered}/200 emails recovered ({rate:.0%})")

    without_key, with_key = hmac_resists_without_the_key()
    print(f"HMAC without the key: {without_key} matches. With the key: {with_key} matches.")

    reidentified, total, reid_rate = linkage_attack_on_quasi_identifiers()
    print(
        f"Linkage attack on quasi-identifiers: {reidentified}/{total} "
        f"uniquely re-identified ({reid_rate:.0%}), key never used."
    )


if __name__ == "__main__":
    main()
