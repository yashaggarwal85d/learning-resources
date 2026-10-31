## AWS: Understanding and managing Amazon S3 storage classes (minimum storage durations)

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html
Version: fetched 2026-10-30

> The S3 Glacier Instant Retrieval (GLACIER_IR), S3 Glacier Flexible Retrieval (GLACIER), and S3 Glacier Deep Archive (DEEP_ARCHIVE) storage classes are designed for low-cost, long-term data storage and data archiving. These storage classes require minimum storage durations and retrieval fees making them most effective for rarely accessed data.

Contents: a comparison table giving, per storage class, durability, availability, minimum number of Availability Zones, minimum storage duration and per-request/retrieval fee notes — S3 Standard-IA and S3 One Zone-IA: 30 days; S3 Glacier Instant Retrieval and S3 Glacier Flexible Retrieval: 90 days; S3 Glacier Deep Archive: 180 days; S3 Standard, S3 Intelligent-Tiering and S3 Express One Zone: no minimum.

## AWS: Transitioning objects using Amazon S3 Lifecycle (minimum-duration charges)

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-transition-general-considerations.html
Version: fetched 2026-10-30

> Certain storage classes have a minimum object storage duration. If you transition objects out of these storage classes before the minimum duration, you are charged for the remainder of that duration.

> The minimal storage duration period is 90 days for the S3 Glacier Flexible Retrieval storage class and 180 days for S3 Glacier Deep Archive. Deleting data that is archived to Amazon Glacier doesn't incur charges if the objects you delete are archived for more than the minimal storage duration period. If you delete or overwrite an archived object within the minimal duration period, Amazon S3 charges a prorated early deletion fee.

Contents: the minimum-duration charge applying on early transition, deletion or overwrite; a worked example of two chained lifecycle rules needing at least 94 days combined when transitioning through two minimum-duration classes; the asynchronous S3 Glacier transition billing starting at rule-match time, not physical-transition time.

## AWS: Understanding archive retrieval options (Expedited/Standard/Bulk timing)

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects-retrieval-options.html
Version: fetched 2026-10-30

> Expedited retrieval – Quickly access your data stored in the S3 Glacier Flexible Retrieval storage class or S3 Intelligent-Tiering Archive Access tier. You can use this option for occasional urgent requests for up to hundreds of objects. Objects under 250 megabytes in size are typically made available within 1–5 minutes, and objects 250 megabytes or larger in size are typically retrieved with up to 300 megabytes per second of retrieval throughput.

> Standard retrieval – Access your data within several hours. Standard is the default option for requests that do not specify the retrieval option. Standard retrievals typically finish within 3–5 hours for the S3 Glacier Flexible Retrieval storage class or S3 Intelligent-Tiering Archive Access tier. Standard retrievals typically finish within 12 hours for the S3 Glacier Deep Archive storage class or S3 Intelligent-Tiering Deep Archive Access tier.

> Bulk retrieval – Access your data by using the lowest-cost retrieval option in S3 Glacier storage classes. With Bulk retrievals, you can retrieve large amounts of data inexpensively. For objects stored in the S3 Glacier Flexible Retrieval storage class or the S3 Intelligent-Tiering Archive Access tier, Bulk retrievals typically finish within 5–12 hours. For objects stored in the S3 Glacier Deep Archive storage class or the S3 Intelligent-Tiering Deep Archive Access tier, these retrievals typically finish within 48 hours.

Contents: the three named retrieval tiers (Expedited, Standard, Bulk) and their typical completion windows for S3 Glacier Flexible Retrieval versus S3 Glacier Deep Archive; Expedited retrieval as a premium, separately charged option; Bulk/Standard being free in some cases for S3 Intelligent-Tiering's archive tiers.

## AWS: Locking objects with Object Lock (governance vs compliance mode)

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
Version: fetched 2026-10-30

> In compliance mode, a protected object version can't be overwritten or deleted by any user, including the root user in your AWS account. When an object is locked in compliance mode, its retention mode can't be changed, and its retention period can't be shortened.

> The only way to delete an object under the compliance mode before its retention date expires is to delete the associated AWS account.

> In governance mode, users can't overwrite or delete an object version or alter its lock settings unless they have special permissions. With governance mode, you protect objects against being deleted by most users, but you can still grant some users permission to alter the retention settings or delete the objects if necessary. You can also use governance mode to test retention-period settings before creating a compliance-mode retention period.

> To override or remove governance-mode retention settings, you must have the s3:BypassGovernanceRetention permission and must explicitly include x-amz-bypass-governance-retention:true as a request header with any request that requires overriding governance mode.

Contents: compliance mode as irreversible short of deleting the whole AWS account; governance mode as overridable only with the explicit bypass permission and header; using governance mode to rehearse a compliance-mode retention policy before committing to it.

## Google Cloud: Storage classes (minimum storage durations)

URL: https://cloud.google.com/storage/docs/storage-classes
Version: fetched 2026-10-30

> Nearline storage is a better choice than Standard storage in scenarios where slightly lower availability, a 30-day minimum storage duration, and costs for data access are acceptable trade-offs for lowered at-rest storage costs.

> Coldline storage is a better choice than Standard storage or Nearline storage in scenarios where slightly lower availability, a 90-day minimum storage duration, and higher costs for data access are acceptable trade-offs for lowered at-rest storage costs.

> Like Nearline storage and Coldline storage, Archive storage has a slightly lower availability than Standard storage. Archive storage also has higher costs for data access and operations, as well as a 365-day minimum storage duration.

> Coldline storage is ideal for data you plan to read or modify at most once a quarter.

Contents: the three cold-tier classes' minimum storage durations (30/90/365 days); the Autoclass feature that lets Cloud Storage manage transitions between classes automatically based on observed access.

## Microsoft Learn: Access tiers for blob data (minimums and early deletion)

URL: https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview
Version: fetched 2026-10-30

> Cool tier - An online tier optimized for storing data that is infrequently accessed or modified. Data in the cool tier should be stored for a minimum of 30 days.

> Cold tier - An online tier optimized for storing data that is rarely accessed or modified, but still requires fast retrieval. Data in the cold tier should be stored for a minimum of 90 days.

> Archive tier - An offline tier optimized for storing data that is rarely accessed, and that has flexible latency requirements, on the order of hours. Data in the archive tier should be stored for a minimum of 180 days.

> Blobs are subject to an early deletion penalty if they are deleted, overwritten or moved to a different tier before the minimum number of days required by the tier have transpired. For example, a blob in the cool tier in a general-purpose v2 account is subject to an early deletion penalty if it's deleted or moved to a different tier before 30 days has elapsed. For a blob in the cold tier, the deletion penalty applies if it's deleted or moved to a different tier before 90 days has elapsed. This charge is prorated.

> While a blob is in the archive tier, it can't be read or modified. To read or download a blob in the archive tier, you must first rehydrate it to an online tier, either hot, cool, or cold. Data in the archive tier can take up to 15 hours to rehydrate, depending on the priority you specify for the rehydration operation.

Contents: Azure's four tiers (hot, cool, cold, archive) and the prorated early-deletion penalty, worked examples for the cool and archive tiers; the archive tier's read-only/unreadable state until rehydrated, up to 15 hours.

## Apache Iceberg: Maintenance (expireSnapshots)

URL: https://iceberg.apache.org/docs/latest/maintenance/
Version: fetched 2026-10-30

> Snapshots accumulate until they are expired by the expireSnapshots operation. Regularly expiring snapshots is recommended to delete data files that are no longer needed, and to keep the size of table metadata small.

> Expiring old snapshots removes them from metadata, so they are no longer available for time travel queries.

> Data files are not deleted until they are no longer referenced by a snapshot that may be used for time travel or rollback.

Contents: the `expireSnapshots` Java API and a Spark action for parallel expiration on large tables; the exact ordering guarantee this topic's hook depends on (a data file is only Iceberg-eligible for deletion once no live snapshot references it, which a bucket lifecycle rule has no way to know).
