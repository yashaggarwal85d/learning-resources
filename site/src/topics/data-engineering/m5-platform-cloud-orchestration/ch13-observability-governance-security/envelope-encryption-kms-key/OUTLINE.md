# Outline — de.envelope-encryption-kms-key

**Kind:** full, §13.2. About 15 minutes. Hosts the key-management half of the §13.2 chapter lab.

## Scope (full syllabus line, six clauses)

"DEK/KEK hierarchy and what the KMS actually sees, KEK rotation without re-encrypting data vs DEK
re-encryption after compromise, customer-managed, BYOK and external/hold-your-own keys, TLS and
mTLS in transit, client- vs server-side encryption, key deletion as crypto-shredding."

- Clause 1: a data encryption key (DEK) encrypts the data locally; a key encryption key (KEK)
  held in the KMS wraps the DEK; the KMS sees only the small DEK to wrap and unwrap, never the
  data itself (Google Cloud KMS and AWS KMS both documented).
- Clause 2: rotating the KEK re-wraps DEKs without touching the data (AWS's own text: "has no
  effect on the data"); but it does not help once a DEK itself has leaked ("will not mitigate the
  effect of a compromised data key") — that forces re-encryption, at the cost of every block
  under that DEK.
- Clause 3: who generates and holds the KEK — provider-managed, customer-managed in the
  provider's own KMS, imported/BYOK, or held entirely outside the provider (AWS external key
  stores, Google Cloud EKM) — trading control and sovereignty against availability and
  operational burden.
- Clause 4: TLS and mTLS protect data in motion between two peers (RFC 8446's own stated primary
  goal), not data at rest, and do not protect the endpoints themselves.
- Clause 5: client-side encryption (the client holds the key, the store only ever sees
  ciphertext) versus server-side (the store holds and uses the key), with Iceberg table
  encryption and Parquet modular encryption as lakehouse-native, file-level forms of the same
  envelope shape.
- Clause 6: deleting a key makes everything it ever encrypted unreadable, everywhere, without
  touching the data itself (crypto-shredding); AWS KMS's own 7-30-day waiting period before an
  irreversible deletion; the granularity of the key is the granularity of what gets erased.

## Outcomes

Draw the DEK and KEK hierarchy and say exactly what the KMS sees in an encrypt and a decrypt;
state what KEK rotation changes and what it leaves, and when a DEK compromise forces
re-encryption and what it costs; place customer-managed, BYOK and external key control on a
control-versus-availability scale; say what TLS and mTLS protect that at-rest encryption does
not, and the reverse; explain why key deletion erases only what that key encrypted.

## Concept ledger

- **Introduces:** `dek-kek-envelope-hierarchy`, `kek-rotation-vs-dek-reencryption`,
  `customer-managed-byok-external-keys`, `crypto-shredding-key-deletion`.
- **Uses:** `sensitivity-tier-and-category`, `automated-sensitive-data-discovery` (topic 4, live
  in this chapter), `object-storage` (Chapter 1, confirmed live under `de.object-storage-as-storage`'s
  own introduces list).
- **Declared (gaps, logged per `CHAPTER.md` §"Cross-chapter ids"):** Chapter 10 §10.2 (cloud KMS
  mechanics) and §10.5 (EU key-residency) — Chapter 10 is unplanned beyond its own `CHAPTER.md`
  (confirmed: no topic folders under `ch10-cloud-data-architecture`). Chapter 6's table-format
  files (what a data, delete and manifest file is) — confirmed Chapter 6 has only one topic built
  (`de.text-interchange-formats-their`, which does not introduce any Iceberg/Parquet
  manifest-level id); named as `data-table-format-files-ch06` and declared. Also declared per
  `CHAPTER.md`'s own entry: `cryptographic-hash` (the *Data Structures & Algorithms* track, a
  separate track from this one, not resolvable as a cross-track `uses`) and public-key
  cryptography at the "one key encrypts, another decrypts" level.

## Storyboard (10 steps)

1. **Hook.** A data key for last quarter's customer files leaks from a log line. Security says
   "we rotate keys every year, so it's fine." Separately, legal wants one customer's data made
   unrecoverable everywhere, backups included.
2. **Predict:** rotate the KEK, re-encrypt the data, or delete a key — which operation actually
   answers each question?
3. **Reveal: the DEK/KEK hierarchy — what the KMS actually sees.** The DEK encrypts data
   locally; the KEK, held in the KMS, only ever wraps and unwraps the DEK. The KMS never touches
   the data itself.
4. **Reveal: rotation versus compromise.** Rotating the KEK re-wraps DEKs, data untouched. A
   leaked DEK is a different problem entirely — rotation doesn't help; only re-encrypting under a
   new DEK does, at the cost of every block under it.
5. **Reveal: customer-managed, BYOK, external — a control-versus-availability scale.**
   Provider-managed is the least control, most availability; an external key manager is the most
   control, and its outage is now your outage too.
6. **Reveal: TLS and mTLS — the wire, not the disk.** TLS's own stated goal is a secure channel
   between two peers. It says nothing about data once it's written down, or about either
   endpoint.
7. **Reveal: client- versus server-side — down to the file.** Iceberg encrypts and
   tamper-proofs its data, delete, manifest and manifest-list files before they reach storage;
   Parquet wraps a per-file or per-column data key under a master key, the same envelope shape at
   the file-format level.
8. **Reveal: key deletion as crypto-shredding.** Destroy the key, and everything it ever
   encrypted is unreadable everywhere, without touching a single byte of the data. The
   granularity of the key is the granularity of the erasure.
9. **Recap.**
10. **Prove it:** a DEK leaks from a log line. The KEK that wrapped it has been rotated twice
    since. Is the data still exposed?

## Visual idea

The key ladder: a KEK block above, DEK blocks below, data blocks below those. Rotation re-wraps
the DEK row (a quick wave, data row untouched); a leaked DEK lights one column of data blocks
red, and the re-encrypt wave runs down it, counting blocks; deleting one key greys out exactly
the blocks under it while every other block stays readable.

## `examples.py` plan

Synthetic (a local, runnable key-store stand-in: a dict-based "KMS" with wrap/unwrap, never a
real cryptographic library — the shape of the mechanism, not production crypto):

1. `wrap_and_unwrap_dek`: a toy KEK wraps a random DEK; unwrap recovers it; the "KMS" function
   only ever sees the (small) DEK, never the (larger) data it encrypts.
2. `kek_rotation_leaves_data_untouched`: rotate the KEK (new KEK wraps the same DEKs), confirm
   every DEK still unwraps correctly and the data blocks were never touched (same byte count,
   zero re-encrypt operations).
3. `dek_compromise_forces_reencryption`: a DEK is marked compromised; count how many data blocks
   must be re-encrypted under a fresh DEK (every block that DEK protected) versus how many KEK
   rotation alone would have fixed (zero).
4. `control_vs_availability_scale`: a simple ordered list (provider-managed, customer-managed,
   BYOK, external) each tagged with a control score and an availability-risk score, showing the
   trade moves in opposite directions.
5. `crypto_shred_one_subject`: a toy table of blocks, each tagged with the customer key that
   encrypted it; deleting one customer's key renders exactly their blocks unreadable (simulated
   as "key missing, cannot unwrap") while every other block still decrypts.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 4's handoff verbatim): "Once a column is
  classified restricted, the first protection is that it cannot be read by anyone who steals the
  disk. This topic is how a key hierarchy delivers that, and what rotating or deleting a key
  really does to the data: envelope encryption."
- **Handoff** (to topic 6, verbatim): "Encryption makes data unreadable to a thief. It does not
  change what the data legally is for the people who hold the key, and it does not help once an
  analyst has decrypted it. The next topic is the line between data that can be tied to a person
  and data that cannot: pseudonymisation versus anonymisation."

## Changes from the chapter plan

Two gaps, logged rather than guessed: `CHAPTER.md` cites Chapter 10 §10.2/§10.5 (cloud KMS
mechanics, EU key-residency) and Chapter 6's table-format files as `uses` sources. Chapter 10 is
unbuilt (confirmed: only a `CHAPTER.md` plan under `ch10-cloud-data-architecture`) and Chapter 6
has only one topic built, which does not introduce any Iceberg/Parquet/manifest-level id
(confirmed by listing its folder and checking `registry.ts`). Both are `declared`, not `uses`,
and named here and in `post-notes.md`'s "Frontier" rather than silently dropped.
