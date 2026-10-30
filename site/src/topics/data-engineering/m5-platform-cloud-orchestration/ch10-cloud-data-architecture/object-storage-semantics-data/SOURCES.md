## AWS: strong read-after-write and list consistency (Dec 2020)

URL: https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications
Version: fetched 2026-10-30

> Amazon S3 now delivers strong read-after-write consistency automatically for all applications. Unlike other cloud providers, Amazon S3 delivers strong read-after-write consistency for any storage request, without changes to performance or availability, without sacrificing regional isolation for applications, and at no additional cost.

> After a successful write of a new object or an overwrite of an existing object, any subsequent read request immediately receives the latest version of the object. S3 also provides strong consistency for list operations, so after a write, you can immediately perform a listing of the objects in a bucket with all changes reflected.

Contents: the Dec 2020 S3 strong read-after-write consistency launch, replacing the prior eventual-consistency model; strong list consistency after a write; no cost or performance change.

## AWS: Amazon S3 user guide (atomic single-key PUT)

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
Version: fetched 2026-10-30

> Updates to a single key are atomic. For example, if you make a PUT request to an existing key from one thread and perform a GET request on the same key from a second thread concurrently, you will get either the old data or the new data, but never partial or corrupt data.

> Updates are key-based. There is no way to make atomic updates across keys. For example, you cannot make the update of one key dependent on the update of another key unless you design this functionality into your application.

Contents: atomicity of a single-key PUT (old data or new data, never partial); the explicit absence of cross-key atomicity; last-writer-wins on simultaneous PUTs to the same key.

## AWS: conditional requests on S3

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html
Version: fetched 2026-10-30

> Conditional writes can ensure there is no existing object with the same key name in your bucket during PUT operations. This prevents overwriting of existing objects with identical key names. Similarly, you can use conditional writes to check if an object's ETag is unchanged before updating the object. This prevents unintentional overwrites on an object without knowing the state of its content. You can use conditional writes for PutObject, CompleteMultipartUpload, or CopyObject requests.

> There is no additional charge for conditional reads, conditional writes or conditional deletes. You are only charged existing rates for the applicable requests, including for failed requests.

Contents: conditional reads, writes, and deletes as a family of preconditions; which API calls support conditional writes; no additional charge for a failed conditional request.

## AWS: If-None-Match conditional writes (Aug 2024)

URL: https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes
Version: fetched 2026-10-30

> Posted on: Aug 20, 2024

> Using conditional writes, you can simplify how distributed applications with multiple clients concurrently update data in parallel across shared datasets. Each client can conditionally write objects, making sure that it does not overwrite any objects already written by another client. This means you no longer need to build any client-side consensus mechanisms to coordinate updates or use additional API requests to check for the presence of an object before uploading data. Instead, you can reliably offload such validations to S3, enabling better performance and efficiency for large-scale analytics, distributed machine learning, and other highly parallelized workloads. To use conditional writes, you can add the HTTP if-none-match conditional header along with PutObject and CompleteMultipartUpload API requests.

Contents: the Aug 20, 2024 launch date; the if-none-match header on PutObject and CompleteMultipartUpload; removing the need for client-side consensus mechanisms to avoid overwriting another client's object.

## AWS: If-Match conditional writes (Nov 2024)

URL: https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-functionality-conditional-writes/
Version: fetched 2026-10-30

> Posted on: Nov 25, 2024

> Conditional writes simplify how distributed applications with multiple clients concurrently update data across shared datasets. Similar to using the HTTP if-none-match conditional header to check for the existence of an object before creating it, clients can now perform conditional-write checks on an object's Etag, which reflects changes to the object, by specifying it via the HTTP if-match header in the API request. S3 then evaluates if the object's ETag matches the value provided in the API request before committing the write and prevents your clients from overwriting the object until the condition is satisfied. This new conditional header can help improve the efficiency of your large-scale analytics, distributed machine learning, and other highly parallelized workloads by reliably offloading compare and swap operations to S3.

Contents: the Nov 25, 2024 launch date; the if-match header checked against an object's ETag; framing this as offloading a compare-and-swap operation to S3.

## AWS: conditional CopyObject (Oct 2025)

URL: https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-s3-conditional-write-functionality-copy-operations
Version: fetched 2026-10-30

> Posted on: Oct 29, 2025

> You can now perform conditional copy operations through S3 CopyObject by including either the HTTP if-none-match header to verify object existence or the HTTP if-match header with ETag to validate the object's content. Additionally, you can use the s3:if-match and s3:if-none-match condition keys in your S3 bucket policies to enforce conditional copy operations. S3 then evaluates the condition against the specified object's key or ETag before executing the copy operation in the destination bucket. This eliminates the need for additional client-side coordination mechanisms or API validation requests.

Contents: the Oct 29, 2025 launch date; if-none-match/if-match extended to CopyObject; the matching s3:if-match and s3:if-none-match bucket-policy condition keys.

## AWS: optimizing Amazon S3 performance (per-prefix request rates)

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html
Version: fetched 2026-10-30

> For example, your application can achieve at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned Amazon S3 prefix. There are no limits to the number of prefixes in a bucket.

> While Amazon S3 is scaling to your new higher request rate, you may see some 503 (Slow Down) errors.

Contents: the per-prefix request-rate baseline (3,500 PUT/COPY/POST/DELETE, 5,500 GET/HEAD per second); no limit on the number of prefixes; 503 Slow Down while S3 scales to a new rate; parallelizing across prefixes to raise effective throughput.

## Microsoft Learn: Azure Data Lake Storage Gen2 hierarchical namespace

URL: https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-namespace
Version: fetched 2026-10-30

> Atomic directory manipulation: Object stores approximate a directory hierarchy by adopting a convention of embedding slashes (/) in the object name to denote path segments. While this convention works for organizing objects, it provides no assistance for actions like moving, renaming, or deleting directories. Without real directories, applications must process potentially millions of individual blobs to achieve directory-level tasks. By contrast, a hierarchical namespace processes these tasks by updating a single entry (the parent directory).

> This optimization is especially significant for many big data analytics frameworks. Tools like Hive and Spark often write output to temporary locations and then rename the location at the conclusion of the job. Without a hierarchical namespace, this rename operation can often take longer than the analytics process itself. Lower job latency equals lower total cost of ownership (TCO) for analytics workloads.

Contents: the slash-in-key convention that only approximates a directory hierarchy on a flat object store; atomic directory rename under a hierarchical namespace, versus per-blob rename cost without one; why Hive/Spark write-then-rename jobs care about this.
