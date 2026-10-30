# Outline — de.pseudonymisation-vs-anonymisation

**Kind:** full, §13.2. About 15 minutes. Hosts the privacy-attack half of the §13.2 chapter lab.

## Scope (full syllabus line, five clauses)

"the legal and technical line: pseudonymised data remains personal data for whoever can
re-identify; the CJEU's relative approach in *EDPS v SRB* (C‑413/23 P, Sept 2025: may be
non-personal for a recipient with no means to re-identify) and the pending GDPR changes in the
Digital Omnibus; keyed hashing (HMAC) vs plain hashing (dictionary attacks on emails and phone
numbers), linkage attacks."

- Clause 1: GDPR Article 4(5) defines pseudonymisation as processing that leaves data no longer
  attributable to a specific person "without the use of additional information", kept separate
  and protected; Recital 26 states that pseudonymised data "which could be attributed to a
  natural person by the use of additional information should be considered to be information on
  an identifiable natural person" — so a pseudonymised table is still personal data in the hands
  of whoever holds the key or the dictionary, and still needs a legal basis, security, retention
  and erasure.
- Clause 2: the CJEU's judgment of 4 September 2025 (C‑413/23 P, *EDPS v SRB*) confirmed
  pseudonymised data "must not be regarded as constituting, in all cases and for every person,
  personal data" — the relative approach — and separately held that the controller's duty to
  inform is judged "at the time of collection of the data and from the point of view of the
  controller," so a controller cannot point to a recipient's inability to re-identify to escape
  its own transparency duty. **Stated caveat:** the case is decided under Regulation (EU)
  2018/1725 (the EU institutions' own regulation), not the GDPR directly — the press release does
  not discuss GDPR Article 4(1) by name, so this topic treats the holding as persuasive for the
  GDPR's identical wording, not as a GDPR ruling.
- Clause 3: the Commission's Digital Omnibus proposal, COM(2025) 837 final of 19 November 2025,
  would write the CJEU's relative approach into the GDPR's own recitals and add a new Article 41a
  letting the Commission specify by implementing act when pseudonymised data stops being personal
  data for certain entities; the EDPB and EDPS, in Joint Opinion 2/2026, object to Article 41a
  specifically and recommend deleting it; as of the European Parliament's Legislative Train
  tracker (updated 20/09/2026), the personal-data definition was left to later committee
  negotiation and the Council's negotiating-mandate vote was cancelled. **Stated as a proposal,
  not law** — the topic states its status with that date and builds no design on it.
- Clause 4: a plain hash of an email or phone number is deterministic and public — anyone with a
  candidate list computes the same hashes and matches them (the EDPB's own guidelines give this
  exact dictionary-attack example: "if you know the transformation is merely a SHA256 hash of a
  name, you could apply this to all names you have elsewhere and then see which hashes match");
  a keyed hash (HMAC) under a secret is not reproducible without the key, so the key is the
  Article 4(5) "additional information" and must be kept separate — the EDPB's guidelines
  recommend "(keyed) pre-image resistant cryptographic one-way functions (like HMACs)."
- Clause 5: even a well-keyed pseudonym can be re-linked by joining quasi-identifiers (postcode,
  birth date, product mix) against an outside list — a linkage attack, measured here against
  synthetic data, distinct from a dictionary attack on the pseudonym itself.

## Outcomes

State the Article 4(5) definition and say why a keyed pseudonym is still personal data for the
key holder; explain *EDPS v SRB* precisely, including what it does and does not decide and the
date and status of the Digital Omnibus proposal; show a dictionary attack recovering emails from
plain hashes and failing against HMAC without the key; carry out a linkage attack on a
pseudonymised release using quasi-identifiers and report the re-identification rate.

## Concept ledger

- **Introduces:** `pseudonymised-vs-anonymised-data`, `edps-v-srb-relative-identifiability`,
  `keyed-vs-plain-hash-pseudonyms`, `linkage-attack`.
- **Uses:** `dek-kek-envelope-hierarchy`, `crypto-shredding-key-deletion` (topic 5, live in this
  chapter), `sensitivity-tier-and-category`, `discovery-false-negatives` (topic 4, live in this
  chapter) — all four confirmed in `registry.ts`'s `introduces` lists for those topics.
- **Declared (gaps, logged per `CHAPTER.md` §"Cross-chapter ids"):** Chapter 10 §10.5 (EU
  regulatory architecture) — confirmed unresolvable: Chapter 10 has only its own `CHAPTER.md`
  under `ch10-cloud-data-architecture`, no topic folders. Named `data-eu-regulatory-architecture-ch10`,
  consistent with topics 4 and 5's own declaration of the same gap. Also declared per
  `CHAPTER.md`'s own entry: `keyed-hash` and `cryptographic-hash` (the *Data Structures &
  Algorithms* track, a separate track, not resolvable as a cross-track `uses`) — why a keyed hash
  is not reproducible without its key and a plain hash is, taken as already known.

## Storyboard (10 steps)

1. **Hook.** The analytics team asks for customer emails "hashed, so it's anonymous." In ten
   minutes, a list of ten million known email addresses is hashed with the same function and 90
   percent of the table matches back to named people. Was it anonymous?
2. **Predict:** what single change would have made that attack fail — and would the data then be
   anonymous, or only pseudonymised? (Plain SHA-256 versus HMAC, and what each is legally.)
3. **Reveal: pseudonymised data is still personal data for the key holder.** Article 4(5)'s own
   test — attribution without additional information — and Recital 26's statement that
   pseudonymised data attributable with additional information is still information on an
   identifiable person.
4. **Reveal: the dictionary attack on a plain hash.** The EDPB's own worked example: hash every
   candidate email with the same function, match it against the table. Deterministic, and public.
5. **Reveal: HMAC resists it.** A keyed hash under a secret is not reproducible without the key;
   the key is the "additional information," kept separately — the same Article 4(5) test, now
   satisfied.
6. **Reveal: the CJEU's relative approach, *EDPS v SRB*.** Pseudonymised data is not personal
   data "in all cases and for every person" — it depends on whether the recipient has the means to
   re-identify. Stated with its date and its regulation (2018/1725, not the GDPR directly).
7. **Reveal: the controller's duty is judged from the controller's own side.** The second
   holding: the transparency obligation is assessed "at the time of collection... from the point
   of view of the controller" — a controller cannot point to a recipient's blind spot to escape
   its own duty.
8. **Reveal: the Digital Omnibus, pending.** The Commission's proposal would write the relative
   approach into the GDPR and let the Commission define the line by implementing act; the EDPB
   and EDPS object to that specific provision and recommend deleting it; stated as a proposal,
   with its tracker date and status.
9. **Reveal: linkage attacks.** Even a perfectly keyed pseudonym can be re-linked by joining
   quasi-identifiers to an outside list — a different attack from the dictionary attack on the
   pseudonym itself.
10. **Recap and Prove it:** given a pseudonymised release with the key destroyed and quasi-
    identifiers intact, which attack still works, and what does the re-identification rate come
    out to?

## Visual idea

Two tables side by side, one with plain-hash emails and one with HMAC emails, and a dictionary of
known emails poured through the same function as a third column: matches light up against the
plain-hash table, none against the HMAC table, with the key drawn as a locked box on a separate
shelf (the "additional information"). A second strip draws the *EDPS v SRB* principle as one
dataset seen by two parties — one holding the key (a person icon, identifiable) and one without
(a blank) — captioned that the controller's duty to inform is judged from the controller's own
side, not the recipient's. A third frame shows the linkage attack: a quasi-identifier column from
the pseudonymised release joined against an outside list, producing matches despite the key being
gone entirely.

## `examples.py` plan

Synthetic (plain Python, `hashlib`'s `sha256` and `hmac` — real hash primitives, since the point
is that nothing about SHA-256 itself is broken, only its unkeyed use):

1. `dictionary_attack_on_plain_hash`: hash a synthetic list of candidate emails and a synthetic
   "pseudonymised" table with the same unkeyed SHA-256; match hashes; report the recovery rate.
2. `hmac_resists_without_the_key`: the same tables, now hashed with HMAC-SHA256 under a secret;
   attempt the same dictionary match without the key and show zero matches; unwrap with the key
   and show it reproduces the pseudonym, confirming the mechanism (not just that the attack
   failed).
3. `linkage_attack_on_quasi_identifiers`: a synthetic pseudonymised release (postcode, birth date,
   product mix, pseudonym) joined against a synthetic outside list carrying the same
   quasi-identifiers plus a real name; measure the re-identification rate from the join alone,
   with the pseudonymisation key never used or needed.
4. `main`: runs all three and prints the recovery/resistance/re-identification numbers the reel's
   prose states.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 5's handoff verbatim): "Encryption makes data
  unreadable to a thief. It does not change what the data legally is for the people who hold the
  key, and it does not help once an analyst has decrypted it. This topic is the line between data
  that can be tied to a person and data that cannot: pseudonymisation versus anonymisation."
- **Handoff** (to topic 7, verbatim): "Whether a dataset is personal data decides what you must
  protect. The next question is who inside your own company may read it, and how that rule is
  written down so a machine can apply it: access-control models."

## Changes from the chapter plan

One gap, logged rather than guessed: `CHAPTER.md` cites Chapter 10 §10.5 (EU regulatory
architecture) as a `uses` source. Chapter 10 is unbuilt (confirmed: only a `CHAPTER.md` plan under
`ch10-cloud-data-architecture`, no topic folders), consistent with topics 4 and 5's own finding.
Declared rather than used, named here and in `post-notes.md`'s "Frontier."

The skipped syllabus topic "k-anonymity, l-diversity, t-closeness" (and differential privacy) is
named in the Deep dive with the Netflix Prize de-anonymisation as the cited failure, per
`CHAPTER.md`'s own instruction, and not built.
