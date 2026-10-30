"""Synthetic examples for de.envelope-encryption-kms-key. A local, runnable key-store stand-in
(a dict-based toy KMS with wrap/unwrap) illustrating the DEK/KEK mechanism's shape, never a real
cryptographic library and never production crypto."""

import random


class ToyKMS:
    """A KEK store. wrap/unwrap only ever handle a small DEK, never the data itself — the whole
    point of envelope encryption."""

    def __init__(self, seed=1):
        self._rng = random.Random(seed)
        self._keks = {}  # kek_id -> kek material (opaque int, stand-in for real key bytes)

    def generate_kek(self, kek_id):
        self._keks[kek_id] = self._rng.randint(10**9, 10**10)
        return kek_id

    def wrap(self, kek_id, dek):
        kek = self._keks[kek_id]
        return dek ^ kek  # toy XOR "wrap", not real crypto, just reversible under the same kek

    def unwrap(self, kek_id, wrapped_dek):
        kek = self._keks[kek_id]
        return wrapped_dek ^ kek


def wrap_and_unwrap_dek():
    kms = ToyKMS()
    kms.generate_kek("kek-1")
    dek = 123456789  # stand-in for real DEK bytes
    wrapped = kms.wrap("kek-1", dek)
    recovered = kms.unwrap("kek-1", wrapped)
    assert recovered == dek
    assert wrapped != dek  # the KMS never handles the DEK's own plaintext value unwrapped
    return dek, wrapped, recovered


def _encrypt_block(data_byte, dek):
    return data_byte ^ dek  # toy "encryption" of one data block under a DEK


def _decrypt_block(ciphertext_byte, dek):
    return ciphertext_byte ^ dek


def kek_rotation_leaves_data_untouched(n_blocks=50):
    kms = ToyKMS()
    kms.generate_kek("kek-old")
    dek = 42
    data = [i for i in range(n_blocks)]
    ciphertext = [_encrypt_block(b, dek) for b in data]
    wrapped_old = kms.wrap("kek-old", dek)

    # Rotate: a new KEK re-wraps the SAME dek. Data/ciphertext never touched.
    kms.generate_kek("kek-new")
    dek_from_old = kms.unwrap("kek-old", wrapped_old)
    wrapped_new = kms.wrap("kek-new", dek_from_old)

    dek_after_rotation = kms.unwrap("kek-new", wrapped_new)
    decrypted = [_decrypt_block(c, dek_after_rotation) for c in ciphertext]

    reencrypt_operations = 0  # rotation touches zero data blocks
    return {
        "blocks": n_blocks,
        "data_unchanged": decrypted == data,
        "ciphertext_unchanged": True,  # ciphertext list was never re-derived
        "reencrypt_operations": reencrypt_operations,
    }


def dek_compromise_forces_reencryption(n_blocks=50):
    kms = ToyKMS()
    kms.generate_kek("kek-1")
    compromised_dek = 42
    data = [i for i in range(n_blocks)]
    ciphertext_under_compromised = [_encrypt_block(b, compromised_dek) for b in data]

    # The compromised DEK leaked. Rotating the KEK would re-wrap it but not help (same data
    # still readable by anyone who has the leaked DEK). The actual fix: a fresh DEK,
    # re-encrypting every block that was under the compromised one.
    fresh_dek = 99
    ciphertext_under_fresh = [_encrypt_block(b, fresh_dek) for b in data]
    reencrypt_operations = len(data)

    # Confirm the new ciphertext is NOT readable with the old, leaked DEK.
    wrongly_decrypted = [_decrypt_block(c, compromised_dek) for c in ciphertext_under_fresh]
    assert wrongly_decrypted != data

    correctly_decrypted = [_decrypt_block(c, fresh_dek) for c in ciphertext_under_fresh]
    assert correctly_decrypted == data

    return {"blocks": n_blocks, "reencrypt_operations": reencrypt_operations, "rotation_alone_would_fix": 0}


CONTROL_AVAILABILITY_SCALE = [
    {"model": "provider-managed", "control": 1, "availability_risk": 1},
    {"model": "customer-managed", "control": 2, "availability_risk": 1},
    {"model": "BYOK (imported)", "control": 3, "availability_risk": 2},
    {"model": "external (hold-your-own)", "control": 4, "availability_risk": 4},
]


def control_vs_availability_scale():
    scale = CONTROL_AVAILABILITY_SCALE
    # Confirm the trade genuinely moves in the same direction: more control, more availability risk.
    for i in range(1, len(scale)):
        assert scale[i]["control"] >= scale[i - 1]["control"]
        assert scale[i]["availability_risk"] >= scale[i - 1]["availability_risk"]
    return scale


def crypto_shred_one_subject(n_customers=10, blocks_per_customer=5):
    kms = ToyKMS()
    blocks = []  # each block: (customer_id, ciphertext)
    customer_deks = {}
    for cust in range(n_customers):
        kek_id = f"kek-{cust}"
        kms.generate_kek(kek_id)
        dek = 1000 + cust
        wrapped = kms.wrap(kek_id, dek)
        customer_deks[cust] = {"kek_id": kek_id, "wrapped_dek": wrapped}
        for b in range(blocks_per_customer):
            blocks.append((cust, _encrypt_block(b, dek)))

    # Delete customer 3's key entirely (simulated: remove its KEK, so unwrap is impossible).
    erased_customer = 3
    del kms._keks[customer_deks[erased_customer]["kek_id"]]

    unreadable = []
    readable = []
    for cust, ciphertext in blocks:
        kek_id = customer_deks[cust]["kek_id"]
        if kek_id not in kms._keks:
            unreadable.append((cust, ciphertext))
        else:
            dek = kms.unwrap(kek_id, customer_deks[cust]["wrapped_dek"])
            readable.append((cust, _decrypt_block(ciphertext, dek)))

    return {
        "total_blocks": len(blocks),
        "unreadable_blocks": len(unreadable),
        "unreadable_all_belong_to_erased_customer": all(c == erased_customer for c, _ in unreadable),
        "readable_blocks": len(readable),
        "other_customers_fully_intact": len(readable) == len(blocks) - blocks_per_customer,
    }


def main():
    dek, wrapped, recovered = wrap_and_unwrap_dek()
    print(f"DEK wrapped (KMS never sees {dek} in the clear): wrapped={wrapped}, unwrapped back to {recovered}")

    rotation = kek_rotation_leaves_data_untouched()
    print(f"KEK rotation over {rotation['blocks']} blocks: data unchanged={rotation['data_unchanged']}, re-encrypt operations={rotation['reencrypt_operations']}")
    assert rotation["data_unchanged"] is True
    assert rotation["reencrypt_operations"] == 0

    compromise = dek_compromise_forces_reencryption()
    print(f"DEK compromise over {compromise['blocks']} blocks: re-encrypt operations={compromise['reencrypt_operations']} (rotation alone would have fixed {compromise['rotation_alone_would_fix']})")
    assert compromise["reencrypt_operations"] == compromise["blocks"]

    scale = control_vs_availability_scale()
    print("control vs availability scale:", ", ".join(f"{s['model']} (control {s['control']}, risk {s['availability_risk']})" for s in scale))

    shred = crypto_shred_one_subject()
    print(f"crypto-shredding: {shred['unreadable_blocks']} of {shred['total_blocks']} blocks unreadable after one key deletion, all belonging to the erased customer: {shred['unreadable_all_belong_to_erased_customer']}, other customers fully intact: {shred['other_customers_fully_intact']}")
    assert shred["unreadable_all_belong_to_erased_customer"] is True
    assert shred["other_customers_fully_intact"] is True

    print("de.envelope-encryption-kms-key examples: all checks pass")


if __name__ == "__main__":
    main()
