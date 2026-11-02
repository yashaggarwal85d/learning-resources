## Delta Lake, Transaction Log Protocol

URL: https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md
Version: latest (fetched 2026-11-02)

> Delta Log Entries, also known as Delta files, are JSON files stored in the `_delta_log` directory at the root of the table. Together with checkpoints, they make up the log of all changes that have occurred to a table. Delta files are the unit of atomicity for a table, and are named using the next available version number, zero-padded to 20 digits.

> Delta files use newline-delimited JSON format, where every action is stored as a single-line JSON document.

> A checkpoint contains the complete replay of all actions, up to and including the checkpointed table version, with invalid actions removed.

> Rather than list the entire directory, readers can locate a recent checkpoint by looking at the `_delta_log/_last_checkpoint` file.

> Log compaction files reside in the `_delta_log` directory. A log compaction file from a start version `x` to an end version `y`

> The Delta transaction log must remain an append-only log. To enable the detection of non-compliant modifications to Delta files, writers can optionally emit an auxiliary file with every commit, which contains important information about the state of the table as of that version.

> tableSizeBytes | Long | Total size of the table in bytes, calculated as the sum of the `size` field of all live `add` actions. | required
> numFiles | Long | Number of live `add` actions in this table version after Action Reconciliation. | required

> A given snapshot of the table can be computed by replaying the events committed to the table in ascending order by commit version.

> A collection of `add` actions with unique path keys, corresponding to the newest (path, deletionVector.uniqueId) pair encountered for each path.

> The intersection of the primary keys in the `add` collection and `remove` collection must be empty.

> Reader Version 3 and Writer Version 7 add two lists of table features to the protocol action.

## Delta Lake, How does Delta Lake manage feature compatibility?

URL: https://docs.delta.io/latest/versioning.html
Version: latest (fetched 2026-11-02)

> In Delta Lake 2.3.0 and above, Delta Lake table features introduce granular flags specifying which features are supported by a given table. Table features are the successor to protocol versions and are designed with the goal of improved flexibility for clients that read and write Delta Lake.

> A Delta table feature is a marker that indicates that the table supports a particular feature. Every feature is either a write protocol feature (meaning it only upgrades the write protocol) or a read/write protocol feature (meaning both read and write protocols are upgraded to enable the feature).

> Protocol version upgrades are irreversible, and upgrading the protocol version might break the existing Delta Lake table readers, writers, or both.
