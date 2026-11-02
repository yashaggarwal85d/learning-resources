# Sources

## Multi-Region keys in AWS KMS

URL: https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html
Version: AWS KMS Developer Guide (fetched 2026-10-31)

> AWS KMS supports multi-Region keys, which are AWS KMS keys in different AWS Regions that can be used interchangeably – as though you had the same key in multiple Regions. Each set of related multi-Region keys has the same key material and key ID, so you can encrypt data in one AWS Region and decrypt it in a different AWS Region without re-encrypting or making a cross-Region call to AWS KMS.

> In a backup and recovery architecture, multi-Region keys let you process encrypted data without interruption even in the event of an AWS Region outage.

## Locking objects with Object Lock

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-overview.html
Version: Amazon S3 User Guide (fetched 2026-10-31)

> S3 Object Lock can help prevent Amazon S3 objects from being deleted or overwritten for a fixed or variable amount of time, or indefinitely. Object Lock uses a write-once-read-many (WORM) model to store objects.

> In compliance mode, a protected object version can't be overwritten or deleted by any user, including the root user in your AWS account. When an object is locked in compliance mode, its retention mode can't be changed, and its retention period can't be shortened.

> The only way to delete an object under the compliance mode before its retention date expires is to delete the associated AWS account.

> Consider using variable retention when you need to protect objects but don't know the retain-until-date at write time. For example, use it when you want a configurable recovery window against ransomware or accidental deletion.

## ManifestFile (Apache Iceberg Javadoc)

URL: https://iceberg.apache.org/javadoc/1.7.1/org/apache/iceberg/ManifestFile.html
Version: Apache Iceberg 1.7.1 Javadoc (fetched 2026-10-31)

> Returns fully qualified path to the file, suitable for constructing a Hadoop Path.

## Delta Transaction Log Protocol (add / remove actions)

URL: https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md
Version: Delta Lake PROTOCOL.md, master branch (fetched 2026-10-31)

> A relative path to a data file from the root of the table or an absolute path to a file that should be added to the table. The path is a URI as specified by

## Digital Operational Resilience Act (DORA)

URL: https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/digital-operational-resilience-act-dora
Version: ESMA (European Securities and Markets Authority) DORA page (fetched 2026-10-31)

> The Digital Operational Resilience Act (DORA) is an EU regulation that entered into force on 16 January 2023 and will apply as of 17 January 2025. It aims at strengthening the information and communication technology (ICT) security of financial entities in the remit of the 3 ESAs and making sure that the financial sector in Europe is able to stay resilient in the event of a severe operational digital disruption.

> Digital operational resilience testing

> Operational resilience testing programme encompassing a range of tests, including advanced testing.
