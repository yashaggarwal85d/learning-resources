# Sources — de.gdpr-erasure-across-lakehouse

`CHAPTER.md` names GDPR Articles 5, 17 and 25 as primary text, Chapter 13 topic 9's sources
(Iceberg maintenance, Delta `VACUUM` and deletion-vector documentation, Kafka compaction and
`delete.retention.ms` documentation, NIST SP 800-88 Rev. 2) and the EDPB's guidelines as
candidates, plus Chapter 13's own in-course anchors. This topic quotes GDPR's own Article 17
(the erasure deadline language and a named legal carve-out `CHAPTER.md` itself requires this
topic to quote) and NIST's own current Special Publication 800-88 Revision 2 (the cryptographic
erase mechanism this topic's shredding design is built on) — two sources, satisfying the
≥2-source rule. Chapter 13's table-format, key-management and lineage material (erasure
mechanisms, delete files, snapshot expiry, Kafka tombstones) are prior topics on this same site
and this chapter's own established method, used and not re-taught, not external sources.

## GDPR (Regulation (EU) 2016/679), Article 17

URL: https://gdpr-info.eu/art-17-gdpr/
Fetched: 2026-10-31.

Quotes:
> The data subject shall have the right to obtain from the controller the erasure of personal data

> without undue delay

> for the establishment, exercise or defence of legal claims.

Items: (1)-(2) Article 17(1)'s own erasure right and its "without undue delay" deadline —
`CHAPTER.md` itself requires this topic to quote this exact language as the legal deadline the
expiry schedule is designed against; (3) Article 17(3)(e)'s legal-claims carve-out — the named
exception that may keep some data, which this topic treats as a lawyer's call it makes visible
and does not make.

## NIST Special Publication 800-88 Revision 2, "Guidelines for Media Sanitization"

URL: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf
Fetched: 2026-10-31.

Quotes:
> At a basic level, CE is based on the sanitization of keys used to encrypt data or to prevent access to the keys that encrypt data.

Items: the named mechanism behind this topic's crypto-shredding design — NIST's own definition
of cryptographic erase as sanitizing the encryption keys rather than the data itself, which is
exactly the mechanism "delete one per-subject key and every copy becomes unreadable" is built
on.
