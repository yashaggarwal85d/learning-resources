# Sources — de.multi-region-analytical-platform

`CHAPTER.md` names GDPR Articles 5, 25 and Chapter V (transfers) as primary text, the AWS S3
Replication Time Control documentation and the provider pricing pages for egress, and Chapter
10 §10.5/§10.7 and Chapter 11 §11.3 as in-course anchors. This topic quotes GDPR's own articles
(the storage-limitation and accountability principles, the design-by-default clause, and
Chapter V's transfer-restriction rule), AWS's own S3 Replication Time Control documentation (the
seconds/15-minute replication guarantee this topic's residency-vs-latency tradeoff is built on),
and AWS's own S3 pricing page (the dated per-GB egress figure the egress estimate uses) — three
sources, satisfying the ≥2-source rule. Chapter 10's regulatory and cloud-foundations material
and Chapter 11's disaster-recovery material are prior topics on this same site, used and not
re-taught, not external sources.

## GDPR (Regulation (EU) 2016/679), Article 5

URL: https://gdpr-info.eu/art-5-gdpr/
Fetched: 2026-10-31.

Quotes:
> kept in a form which permits identification of data subjects for no longer than is necessary

> The controller shall be responsible for, and be able to demonstrate compliance with, paragraph 1

Items: (1) Article 5(1)(e)'s storage-limitation principle — the same principle topic 4's
tiering-and-retention design already applies, now applied per-region; (2) Article 5(2)'s
accountability principle — the text behind this topic's own "state what the design does not
claim, make the legal question visible" convention.

## GDPR (Regulation (EU) 2016/679), Article 25

URL: https://gdpr-info.eu/art-25-gdpr/
Fetched: 2026-10-31.

Quotes:
> implement appropriate technical and organisational measures, such as pseudonymisation

Items: Article 25(1)'s design-by-default clause — the text behind "residency is designed in,
not retrofitted," mirroring topic 4's erasure framing.

## GDPR (Regulation (EU) 2016/679), Article 44

URL: https://gdpr-info.eu/art-44-gdpr/
Fetched: 2026-10-31.

Quotes:
> Any transfer of personal data which are undergoing processing

> shall take place only if, subject to the other provisions of this Regulation

Items: Article 44's transfer-restriction rule — the named legal mechanism that makes "which data
must stay in the EU" a real, binding constraint on the placement decision, not a preference.

## AWS, "Meeting compliance requirements with S3 Replication Time Control"

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication-time-control.html
Fetched: 2026-10-31.

Quotes:
> S3 RTC replicates most objects that you upload to Amazon S3 in seconds, and 99.9 percent of those objects within 15 minutes.

Items: the named, SLA-backed replication guarantee `CHAPTER.md` itself requires this topic to
quote and re-verify — the concrete number behind "replicate" as a design option with a bounded,
paid consistency lag, as opposed to an unbounded best-effort copy.

## AWS, "Amazon S3 pricing"

URL: https://aws.amazon.com/s3/pricing/
Fetched: 2026-10-31.

Quotes:
> The Data Transfer out charge from Amazon S3 in Europe (Ireland) to internet is $0.09 per GB.

Items: the dated, provider-stated per-GB price this topic's egress estimate multiplies against
the shop's events and aggregates volumes to compute the replicate-versus-federate cost
comparison `CHAPTER.md` requires.
