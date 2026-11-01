"""
de.pseudonymisation-vs-anonymisation -- measured directly against real local hashing (Python's
own hashlib/hmac) and a real linkage attack on synthetic quasi-identifiers, standing in for this
topic's own lab (the privacy-attack half of the chapter 13 lab: dictionary-attack plain hashes
of synthetic emails and phone numbers, show HMAC resisting; join quasi-identifiers to an outside
list and measure the re-identification rate).

Three claims, verified directly:

1. A dictionary attack recovers the large majority of a synthetic email list's plain SHA-256
   hashes, by hashing a list of known candidate emails and matching the hashes -- exactly the
   mechanism the EDPB's own pseudonymisation guidelines describe.
2. The identical dictionary attack against the same emails hashed with a keyed HMAC (under a
   secret unknown to the attacker) recovers none of them.
3. A linkage attack that joins quasi-identifiers (postcode, birth year, product category) from a
   pseudonymised release against an outside reference list re-identifies a real, measurable
   fraction of individuals, even though their direct identifiers (name, email) were never in the
   pseudonymised release at all.
"""
import hashlib
import hmac
import random

random.seed(11)

N = 5_000

FIRST_NAMES = ["alex", "jordan", "taylor", "morgan", "casey", "riley", "sam", "jamie", "drew", "avery"]
LAST_NAMES = ["smith", "jones", "patel", "garcia", "kim", "nguyen", "brown", "davis", "lee", "clark"]
DOMAINS = ["example.com", "mailbox.net", "inboxly.org", "freemail.io"]


def make_email(first, last, n):
    return f"{first}.{last}{n}@{random.choice(DOMAINS)}"


# The real dataset: emails that exist in the pseudonymised release.
real_people = []
for i in range(N):
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    email = make_email(first, last, i)
    real_people.append(email)

# The attacker's own candidate list: overlaps heavily with the real emails (as a leaked or
# purchased list of known addresses would), plus some addresses that were never pseudonymised.
candidate_emails = list(real_people) + [make_email(random.choice(FIRST_NAMES), random.choice(LAST_NAMES), 100_000 + i) for i in range(2_000)]
random.shuffle(candidate_emails)

SECRET_KEY = b"a-key-the-attacker-never-sees-and-cannot-guess"

plain_hashes = {hashlib.sha256(email.encode()).hexdigest() for email in real_people}
hmac_hashes = {hmac.new(SECRET_KEY, email.encode(), hashlib.sha256).hexdigest() for email in real_people}

# --- Claim 1: a dictionary attack recovers the large majority of plain hashes ---

plain_recovered = 0
for email in candidate_emails:
    if hashlib.sha256(email.encode()).hexdigest() in plain_hashes:
        plain_recovered += 1

plain_recovery_rate = plain_recovered / len(real_people)

assert plain_recovery_rate > 0.95, (
    f"expected a dictionary attack to recover the large majority of plain SHA-256 hashes "
    f"using a candidate list that includes every real email; got recovery rate "
    f"{plain_recovery_rate:.3f} (expected > 0.95)"
)

# --- Claim 2: the identical attack against HMAC, without the key, recovers none ---

hmac_recovered = 0
for email in candidate_emails:
    # The attacker does not have SECRET_KEY; guessing with no key (an all-zero key) is the only
    # thing an attacker without the secret could even attempt.
    guessed = hmac.new(b"\x00" * 32, email.encode(), hashlib.sha256).hexdigest()
    if guessed in hmac_hashes:
        hmac_recovered += 1

assert hmac_recovered == 0, (
    f"expected an attacker without the HMAC secret key to recover zero emails; got "
    f"{hmac_recovered} recovered out of {len(real_people)}"
)

# --- Claim 3: a linkage attack on quasi-identifiers re-identifies a real fraction of people ---

POSTCODES = [f"PC{d:03d}" for d in range(50)]
BIRTH_YEARS = list(range(1950, 2006))
PRODUCT_CATEGORIES = ["electronics", "groceries", "apparel", "home", "sports", "books"]


def make_quasi_identifier_record(rng):
    return (rng.choice(POSTCODES), rng.choice(BIRTH_YEARS), rng.choice(PRODUCT_CATEGORIES))


rng = random.Random(23)

# The pseudonymised release: no names or emails, just a pseudonym plus quasi-identifiers.
pseudonymised_release = []
for i in range(N):
    qi = make_quasi_identifier_record(rng)
    pseudonymised_release.append({"pseudonym": f"P{i:05d}", "qi": qi})

# An outside reference list the attacker already has (e.g. a public voter roll or marketing
# list), naming real people against the same quasi-identifiers. Built from the identical
# underlying individuals, in a different order, standing in for an outside list that happens to
# cover the same population.
outside_list = [{"name": real_people[i], "qi": pseudonymised_release[i]["qi"]} for i in range(N)]
rng.shuffle(outside_list)

# Build an index from quasi-identifier combination to the outside list's own name(s).
qi_to_names = {}
for row in outside_list:
    qi_to_names.setdefault(row["qi"], []).append(row["name"])

re_identified = 0
for row in pseudonymised_release:
    names = qi_to_names.get(row["qi"], [])
    if len(names) == 1:
        # A unique quasi-identifier combination in the outside list re-identifies this pseudonym
        # with a single named individual.
        re_identified += 1

re_identification_rate = re_identified / len(pseudonymised_release)

assert re_identification_rate > 0.10, (
    f"expected a linkage attack joining quasi-identifiers against an outside list to "
    f"re-identify a real, measurable fraction of the pseudonymised release; got "
    f"re-identification rate {re_identification_rate:.3f} (expected > 0.10)"
)

print("all claims verified")
