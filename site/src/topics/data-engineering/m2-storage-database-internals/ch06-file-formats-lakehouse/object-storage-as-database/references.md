Last verified: 31 October 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python with `moto`/`boto3`, no AWS account or network access
required): a real local S3-compatible HTTP server, real conditional-write requests that really
succeed or fail with a real `412`, a real copy-then-delete "rename" with both objects verified to
exist afterward, and a real paginated `LIST` call whose round-trip count is measured directly.

- AWS, "Amazon S3 now delivers strong read-after-write consistency automatically for all applications": [aws.amazon.com](https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications/). Fetched 2026-10-31. The December 2020 strong-consistency change this topic opens with.
- AWS, "Amazon S3 now supports conditional writes": [aws.amazon.com](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes/). Fetched 2026-10-31. The August 2024 `If-None-Match` launch this topic's conditional-create demo reproduces.
- AWS, "Amazon S3 now supports enforcement of conditional write operations": [aws.amazon.com](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-enforcement-conditional-write-operations-general-purpose-buckets). Fetched 2026-10-31. The November 2024 `If-Match`/bucket-policy enforcement follow-up.
- AWS, PutObject API reference: [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html). Fetched 2026-10-31. The exact `If-Match`/`If-None-Match` semantics and `412` behavior this topic's demo matches.
- AWS, S3 performance guidelines: [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html). Fetched 2026-10-31. Per-prefix request-rate limits.
- Google Cloud, Cloud Storage consistency: [cloud.google.com](https://cloud.google.com/storage/docs/consistency). Fetched 2026-10-31. GCS's own strong-consistency guarantees.
- Microsoft Learn, specifying conditional headers for Blob service operations: [learn.microsoft.com](https://learn.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations). Fetched 2026-10-31. ADLS/Azure Blob's own conditional-header support.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=object-storage-as-database:%20).
