# Sources: Partitioned log storage: segments and indexes (`de.partitioned-log-segments-indexes`)

## Apache Kafka: Design (the "Persistence" and "Efficiency" sections)

URL: https://raw.githubusercontent.com/apache/kafka/trunk/docs/design/design.md (the rendered page at https://kafka.apache.org/documentation/#design assembles client-side from this same Markdown source and could not be fetched as static HTML by `sources.mjs fetch` — see Notes below — so this topic fetches and quotes the source Markdown directly). Read at trunk, `gradle.properties` version `4.5.0-SNAPSHOT`, the in-development successor to the current 4.4 release the Kafka downloads page lists as newest; no version-specific change to these paragraphs was found between the 4.4 branch and trunk.
Version: Apache Kafka, trunk (post-4.4), file `docs/design/design.md`.

> Keeping track of _what_ has been consumed is, surprisingly, one of the key performance points of a messaging system.

> Kafka handles this differently. Our topic is divided into a set of totally ordered partitions, each of which is consumed by exactly one consumer within each subscribing consumer group at any given time. This means that the position of a consumer in each partition is just a single integer, the offset of the next message to consume. This makes the state about what has been consumed very small, just one number for each partition. This state can be periodically checkpointed. This makes the equivalent of message acknowledgements very cheap.

> There is a side benefit of this decision. A consumer can deliberately _rewind_ back to an old offset and re-consume data. This violates the common contract of a queue, but turns out to be an essential feature for many consumers.

> The key fact about disk performance is that the throughput of hard drives has been diverging from the latency of a disk seek for the last decade.

> This suggests a design which is very simple: rather than maintain as much as possible in-memory and flush it all out to the filesystem in a panic when we run out of space, we invert that. All data is immediately written to a persistent log on the filesystem without necessarily flushing to disk. In effect this just means that it is transferred into the kernel's pagecache.

> Intuitively a persistent queue could be built on simple reads and appends to files as is commonly the case with logging solutions. This structure has the advantage that all operations are O(1) and reads do not block writes or each other.

> To understand the impact of sendfile, it is important to understand the common data path for transfer of data from file to socket:

> Using sendfile, this re-copying is avoided by allowing the OS to send the data from pagecache to the network directly. So in this optimized path, only the final copy to the NIC buffer is needed.

> We expect a common use case to be multiple consumers on a topic. Using the zero-copy optimization above, data is copied into pagecache exactly once and reused on each consumption instead of being stored in memory and copied out to user-space every time it is read. This allows messages to be consumed at a rate that approaches the limit of the network connection.

> This combination of pagecache and sendfile means that on a Kafka cluster where the consumers are mostly caught up you will see no read activity on the disks whatsoever as they will be serving data entirely from cache.

> If not set, all log segments are eligible for compaction except for the last segment, i.e. the one currently being written to. The active segment will not be compacted even if all of its messages are older than the minimum compaction time lag.

Contents:
- Persistence: why Kafka relies on the filesystem and OS pagecache rather than an in-process cache (used: topic's figure of the log living on disk, served from pagecache).
- Constant Time Suffices: why an append-only log with O(1) operations beats a B-tree-per-queue design for a messaging system (used: motivates "why a log, not a queue-with-index" framing in the hook/outcomes).
- Efficiency / End-to-end Batch Compression: the sendfile/zero-copy data path and why it matters at multi-consumer scale (used verbatim for the zero-copy clause of the syllabus line).
- Consumer Position: offsets as a single integer per partition, held by the consumer side, not broker-tracked per-message state (used verbatim for the "offsets owned by consumers" clause).
- Configuring The Log Cleaner: the active segment is never compacted (used to support "active segment rolling" — a segment is either active (open, appendable) or closed, and only closed segments participate in compaction/retention/tiering elsewhere in the chapter).

## Apache Kafka: `TopicConfig` and `LogConfig` (segment size, roll time, index interval)

URL: https://raw.githubusercontent.com/apache/kafka/trunk/clients/src/main/java/org/apache/kafka/common/config/TopicConfig.java
Version: Apache Kafka, trunk (post-4.4).

> The active segment is rolled once it reaches this size.

Contents:
- `segment.bytes` (`log.segment.bytes` at the broker level): "This configuration controls the segment file size for the log. Retention and cleaning is always done a file at a time so a larger segment size means fewer files but less granular control over retention." (read from the doc string's Java source concatenation, not quoted verbatim above because the source splits it across string-literal lines; the standalone final sentence is quoted verbatim instead). Used for the "a segment rolls at a size limit" and "retention acts on whole segments" framing.
- `DEFAULT_SEGMENT_BYTES = 1024 * 1024 * 1024` (`storage/src/main/java/org/apache/kafka/storage/internals/log/LogConfig.java`, read not quoted as prose, since it is a numeric constant, not documentation text): the real default segment size is 1 GiB, cited in `post-notes.md` as the real-world figure the toy log's much smaller demo size stands in for.
- `DEFAULT_SEGMENT_MS = 24 * 7 * 60 * 60 * 1000L` (same file): the real default roll time is 7 days, cited the same way.
- `LOG_INDEX_INTERVAL_BYTES_DEFAULT = 4096` (`server-common/src/main/java/org/apache/kafka/server/config/ServerLogConfigs.java`, read not quoted): the real default sparsity of the offset index is one entry per 4096 bytes of log data appended, cited in `post-notes.md` as the concrete answer to "how sparse is sparse."

## Apache Kafka: source tree, `storage/` module (file layout reference, read not quoted)

URL: https://github.com/apache/kafka/tree/trunk/storage/src/main/java/org/apache/kafka/storage/internals/log
Version: Apache Kafka, trunk checkout (post-4.4).

Read (not quoted, since this is source code rather than documentation prose) to confirm the on-disk file layout the design doc describes in prose: a partition directory holds `<base-offset>.log` (the record data), `<base-offset>.index` (`OffsetIndex`, a sparse offset-to-file-position map, not one entry per record), and `<base-offset>.timeindex` (`TimeIndex`, timestamp-to-offset) per segment, confirmed by the `OffsetIndex`/`TimeIndex`/`LogSegment` class names and comments present in this directory at read time. No class-internals claim from this source is put on screen as a quote; the topic's figure and `examples.py` model the same three-file-per-segment shape as a toy reimplementation, disclosed as such, not as a line-by-line port of Kafka's own code.

Notes on this topic's research:

- `kafka.apache.org/documentation/#design` and the versioned variants (`/44/design.html`, `/44/documentation.html`) all returned either a client-side-redirect shell page or HTTP 404 to a plain `curl` fetch (`node scripts/sources.mjs fetch`), because the live site assembles the Design page from Hugo-built fragments client-side. The underlying source text is public in the Apache Kafka repository under `docs/design/design.md`, which `node scripts/sources.mjs check` can still verify every quote above against (cached locally from the repository checkout, not re-fetched over HTTP each run — see the topic's build note for how `sources.mjs check` was pointed at this file).
- This is the first chapter-9 topic; no earlier-chapter source file is reused.
