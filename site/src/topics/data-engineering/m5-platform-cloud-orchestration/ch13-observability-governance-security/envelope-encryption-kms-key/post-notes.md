<section data-section="outcomes">

## Outcomes

Draw the DEK and KEK hierarchy and say exactly what the KMS sees in an encrypt and a decrypt;
state what KEK rotation changes and what it leaves, and when a DEK compromise forces
re-encryption and what it costs; place customer-managed, BYOK and external key control on a
control-versus-availability scale; say what TLS and mTLS protect that at-rest encryption does
not, and the reverse; explain why key deletion erases only what that key encrypted.

</section>

<section data-section="internals">

## Internals

`examples.py`'s own `ToyKMS` is deliberately a toy (XOR, not real crypto) because the point of
this topic is the *shape* of the mechanism, not a cryptographic implementation: every operation a
real KMS performs — wrap, unwrap, rotate — reduces to the same three functions here, and the
asserts (`kek_rotation_leaves_data_untouched` touching zero data blocks,
`dek_compromise_forces_reencryption` touching every one) hold regardless of which real algorithm
sits underneath. The one subtlety worth dwelling on: rotation and re-encryption are not two
points on a severity scale, they are answers to two different questions. Rotation answers "has
enough time passed that best practice says to refresh this key," and genuinely costs nothing in
data terms. Re-encryption answers "is this specific key no longer trustworthy," and costs exactly
as many operations as there are blocks under it. Treating a compromise as "we'll catch it on the
next scheduled rotation" is the mistake AWS's own documentation exists specifically to head off.

</section>

<section data-section="lab">

## Lab: the key ladder, worked

This topic hosts the key-management half of the §13.2 chapter lab directly:
`examples.py`'s own `wrap_and_unwrap_dek`, `kek_rotation_leaves_data_untouched`,
`dek_compromise_forces_reencryption` and `crypto_shred_one_subject` are that lab, run against a
local toy key store rather than a real cloud KMS — rotating a KEK and showing the data literally
unchanged, simulating a DEK compromise and counting exactly what must be re-encrypted, then
deleting one customer's key and showing their blocks alone go unreadable while every other
customer's own blocks stay fully intact.

</section>

<section data-section="production">

## Production failures this topic warns about

**Believing routine rotation covers a key compromise.** AWS's own documentation states this
directly — rotation "will not mitigate the effect of a compromised data key" — and this topic's
hook is built from exactly that false reassurance ("we rotate every year, so it's fine"). A
leaked key stays exploitable until the data under it is re-encrypted, no matter how many
rotations happen in between.

**Sizing a key's scope wrong for the erasure granularity you'll eventually need.** Crypto-
shredding only erases what a key protects. A KEK shared across an entire table can't erase one
subject without destroying everyone's data; a key scoped too narrowly multiplies key-management
overhead. Topic 9 (right to erasure in immutable lakehouses) depends on having made this choice
correctly ahead of time.

</section>

<section data-section="frontier">

## Frontier

Tokenization and format-preserving encryption (the skipped syllabus topic; FF3-1 per NIST SP
800-38G Revision 1) and audit logging of key use (the other skipped syllabus topic) are both
named here only, left to a fuller treatment this topic does not attempt. Chapter 10's cloud KMS
mechanics (§10.2) and EU key-residency material (§10.5), and Chapter 6's table-format files, which
`CHAPTER.md` cites as background for this topic, are not yet built as of this writing (confirmed:
only a `CHAPTER.md` plan exists under `ch10-cloud-data-architecture`, and Chapter 6 has only one
topic built, introducing no Iceberg/Parquet/manifest-level id) — named here as the gap, not
guessed at.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Encryption makes data unreadable to a thief. It does not change what the data legally is for the
people who hold the key, and it does not help once an analyst has decrypted it. The next topic is
the line between data that can be tied to a person and data that cannot: pseudonymisation versus
anonymisation.

</section>
