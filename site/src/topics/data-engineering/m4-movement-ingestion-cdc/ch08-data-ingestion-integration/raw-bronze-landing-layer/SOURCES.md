# Sources — de.raw-bronze-landing-layer

`CHAPTER.md` names *Fundamentals of Data Engineering* (secondary, for framing) and Databricks'
own medallion-architecture documentation for the bronze definition, plus the GDPR text (Articles
5(1)(e) storage limitation and 17 erasure). This topic quotes two independent primary sources:
Databricks' own documentation and the GDPR text itself.

## Databricks: "What is a Medallion Architecture?"

URL: https://www.databricks.com/blog/what-is-medallion-architecture
Fetched: 2026-10-31.

Quotes:
> The Bronze layer is where we land all the data from external source systems.

Items: the exact design this topic's own raw layer implements — a landing layer that captures
source data before anything downstream touches it.

## GDPR (Regulation (EU) 2016/679): Article 17(1)

URL: https://gdpr-info.eu/art-17-gdpr/
Fetched: 2026-10-31.

Quotes:
> The data subject shall have the right to obtain from the controller the erasure of personal data concerning him or her without undue delay

Items: the exact obligation this topic's own erasure-as-a-tracked-exception measurement answers
— an immutable raw layer must still be able to satisfy this right, without breaking its own
append-only guarantee for every other record.

## GDPR (Regulation (EU) 2016/679): Article 5(1)(e)

URL: https://gdpr-info.eu/art-5-gdpr/
Fetched: 2026-10-31.

Quotes:
> kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed

Items: the storage-limitation duty this topic's own retention-versus-replayability tension is
built around — keeping raw data forever for replay directly works against this duty.
