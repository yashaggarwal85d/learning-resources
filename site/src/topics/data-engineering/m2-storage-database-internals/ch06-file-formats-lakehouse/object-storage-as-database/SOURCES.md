# Sources — de.object-storage-as-database

## AWS: Amazon S3 now delivers strong read-after-write consistency (Dec 2020)

URL: https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications/
Version: AWS "What's New" announcement, fetched 2026-10-31

> Amazon S3 now delivers strong read-after-write consistency automatically for all applications. Unlike other cloud providers, Amazon S3 delivers strong read-after-write consistency for any storage request, without changes to performance or availability, without sacrificing regional isolation for applications, and at no additional cost.

> Amazon S3 pioneered object storage in the cloud with high availability, performance, and virtually unlimited scalability, with eventual consistency.

> After a successful write of a new object or an overwrite of an existing object, any subsequent read request immediately receives the latest version of the object. S3 also provides strong consistency for list operations, so after a write, you can immediately perform a listing of the objects in a bucket with all changes reflected.

## AWS: Amazon S3 now supports conditional writes (Aug 2024)

URL: https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes/
Version: AWS "What's New" announcement, fetched 2026-10-31

> Amazon S3 adds support for conditional writes that can check for the existence of an object before creating it. This capability can help you more easily prevent applications from overwriting any existing objects when uploading data. You can perform conditional writes using PutObject or CompleteMultipartUpload API requests in both general purpose and directory buckets.

> Using conditional writes, you can simplify how distributed applications with multiple clients concurrently update data in parallel across shared datasets. Each client can conditionally write objects, making sure that it does not overwrite any objects already written by another client.

## AWS: Amazon S3 now supports enforcement of conditional write operations (Nov 2024)

URL: https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-enforcement-conditional-write-operations-general-purpose-buckets
Version: AWS "What's New" announcement, fetched 2026-10-31

> Amazon S3 now supports enforcement of conditional write operations for S3 general purpose buckets using bucket policies. With enforcement of conditional writes, you can now mandate that S3 check the existence of an object before creating it in your bucket. Similarly, you can also mandate that S3 check the state of the object's content before updating it in your bucket.

> To enforce conditional write operations, you can now use s3:if-none-match or s3:if-match condition keys to write a bucket policy that mandates the use of HTTP if-none-match or HTTP if-match conditional headers in S3 PutObject and CompleteMultipartUpload API requests. With this bucket policy in place, any attempt to write an object to your bucket without the required conditional header will be rejected.

## AWS: PutObject API reference

URL: https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
Version: AWS S3 API Reference, fetched 2026-10-31

> If-None-Match - Uploads the object only if the object key name does not already exist in the specified bucket. Otherwise, Amazon S3 returns a 412 Precondition Failed error.

> Uploads the object only if the ETag (entity tag) value provided during the WRITE operation matches the ETag of the object in S3. If the ETag values do not match, the operation returns a 412 Precondition Failed error.

## AWS: Best practices design patterns — optimizing Amazon S3 performance

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html
Version: AWS S3 User Guide, fetched 2026-10-31

> Your applications can easily achieve thousands of transactions per second in request performance when uploading and retrieving storage from Amazon S3.

> For example, your application can achieve at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned Amazon S3 prefix. There are no limits to the number of prefixes in a bucket.

## Google Cloud: Cloud Storage consistency

URL: https://cloud.google.com/storage/docs/consistency
Version: Google Cloud documentation, fetched 2026-10-31

> This page describes strongly consistent and eventually consistent Cloud Storage operations.

> When you write an object to Cloud Storage, such as when you upload, compose, or copy an object, the object is immediately available for reading and metadata operations as soon as you receive a success response to your write request.

> Bucket listing and object listing are strongly consistent: when you create a bucket or object and then immediately perform the relevant list operation, the newly created bucket or object appears in the returned list.

## Microsoft Learn: Specifying conditional headers for Blob service operations

URL: https://learn.microsoft.com/en-us/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations
Version: Azure Storage REST API documentation, fetched 2026-10-31

> An ETag value, or the wildcard character (*). Specify this header to perform the operation only if the resource's ETag doesn't match the value specified.

> Specify the wildcard character (*) to perform the operation only if the resource doesn't exist, and fail the operation if it does exist.
