<section data-section="outcomes">

## Outcomes

State the Article 4(5) definition and say why a keyed pseudonym is still personal data for the
key holder; explain *EDPS v SRB* precisely, including what it does and does not decide and the
date and status of the Digital Omnibus proposal; show a dictionary attack recovering emails from
plain hashes and failing against HMAC without the key; carry out a linkage attack on a
pseudonymised release using quasi-identifiers and report the re-identification rate.

</section>

<section data-section="internals">

## Internals

`examples.py` uses real `hashlib`/`hmac` primitives, not a toy stand-in, because the point here is
the opposite of topic 5's: nothing about SHA-256 itself is broken, and the dictionary attack works
against a function that is cryptographically strong by every normal measure. The vulnerability is
entirely in how the function is used — deterministically, without a secret, against a guessable
input space (email addresses drawn from a candidate list, not the full space of possible strings).
The EDPB's own guidelines make the same point directly: the fix is not a stronger hash, it is a
*keyed* one, where the secret, not the algorithm, is what an attacker lacks. The linkage attack in
`linkage_attack_on_quasi_identifiers` is deliberately built to never touch the pseudonymisation key
at all, to make the point in `OUTLINE.md`'s own clause 5 concrete: a perfectly executed
pseudonymisation defeats exactly one attack, the one against the pseudonym itself.

</section>

<section data-section="lab">

## Lab: privacy attacks on synthetic data

This topic hosts the privacy-attack half of the §13.2 chapter lab directly:
`examples.py`'s own `dictionary_attack_on_plain_hash`, `hmac_resists_without_the_key` and
`linkage_attack_on_quasi_identifiers` are that lab — hashing synthetic emails with a plain,
unkeyed function and recovering nine of ten of them, repeating the same attack against an HMAC
construction and recovering none, then joining synthetic quasi-identifiers against an outside
list and measuring how many rows a linkage attack alone re-identifies, with the pseudonymisation
key never generated for that last step at all. The "k-anonymised release" leg that would complete
the full chapter lab belongs to the *(skipped)* syllabus topic "k-anonymity, l-diversity,
t-closeness" and is pointed to below, not built here.

</section>

<section data-section="production">

## Production failures this topic warns about

**Calling a plain hash "anonymisation."** This topic's own hook is the production incident: a
team hashes a column and calls it anonymous, and a dictionary attack with a known candidate list
(a customer list, a breach dump, a directory) recovers most of it in minutes. The EDPB's own
guidelines exist specifically to head this off, down to the SHA256-of-a-name example this topic's
reveal borrows almost verbatim.

**Treating a keyed pseudonym as a complete privacy guarantee.** HMAC genuinely stops the
dictionary attack — but a dataset that keeps quasi-identifiers sitting beside the pseudonym is
still exposed to a linkage attack that never needs the key at all. The re-identification rate this
topic measures from quasi-identifiers alone is the number a team relying only on "we hashed it
with a key" would never see coming.

</section>

<section data-section="frontier">

## Frontier

k-anonymity, l-diversity and t-closeness, and differential privacy for aggregate release, are
both *(skipped)* syllabus topics named here only: generalisation-based techniques that reduce a
linkage attack's success rate by coarsening quasi-identifiers into equivalence classes, and the
production case this course cites for where they still failed — the Netflix Prize
de-anonymisation, where researchers re-identified subscribers in an "anonymised" ratings dataset
by linking it against public IMDb reviews, a linkage attack at far larger scale than the one this
topic measures. Tokenization and format-preserving encryption, the erasure obligation (topic 9),
and legal advice on any specific transfer are also left out, per `CHAPTER.md`. Chapter 10's EU
regulatory-architecture material, which `CHAPTER.md` cites as background for this topic, is not
yet built as of this writing (confirmed: only a `CHAPTER.md` plan exists under
`ch10-cloud-data-architecture`) — named here as the gap, not guessed at.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Whether a dataset is personal data decides what you must protect. The next question is who
inside your own company may read it, and how that rule is written down so a machine can apply it:
access-control models.

</section>
