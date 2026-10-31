# Sources: KRaft: metadata as a replicated log (`de.kraft-metadata-replicated-log`)

## Apache Kafka: KIP-500, "Replace ZooKeeper with a Self-Managed Metadata Quorum"

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum
Version: accepted KIP (the founding design for KRaft, shipped as Kafka 4.0's default and only mode).

> The controller nodes comprise a Raft quorum which manages the metadata log. This log contains information about each change to the cluster metadata.

> Just like ZooKeeper, Raft requires a majority of nodes to be running in order to continue running. Therefore, a three-node controller cluster can survive one failure. A five-node controller cluster can survive two failures, and so on.

> Instead of the controller pushing out updates to the other brokers, those brokers will fetch updates from the active controller via the new MetadataFetch API.

> The broker will periodically ask for metadata updates from the active controller. This request will double as a heartbeat, letting the controller know that the broker is alive.

> In the post-ZooKeeper world, brokers will register themselves with the controller quorum, rather than with ZooKeeper.

> In the current world, a broker which can contact ZooKeeper but which is partitioned from the controller will continue serving user requests, but will not receive any metadata updates. This can lead to some confusing and difficult situations.

Contents:
- The controller quorum as a Raft group that owns the metadata log, and the same majority-survives-failures math as any Raft/ZooKeeper quorum (used for the controller-quorum reveal).
- The broker-pulls-not-pushed-to model (`MetadataFetch`) and the heartbeat-doubles-as-fetch mechanism that fences a broker whose heartbeat lapses (used for the fencing reveal).
- The pre-KRaft failure mode this design fixes: a broker partitioned from the controller but not from ZooKeeper could keep serving stale metadata (used for the hook/motivation).
- The "bridge release" as a named, required intermediate step of the migration (used for the Deep dive's bridge-migration note; see the correction below on the specific version).

## Apache Kafka: KIP-866, "ZooKeeper to KRaft Migration"

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-866+ZooKeeper+to+KRaft+Migration
Version: accepted KIP (the migration protocol that defines what a cluster must do during the bridge release).

> This KIP defines the behavior and set of new APIs for the "bridge release" as first mentioned in KIP-500.

> In order to give users more confidence about undertaking the migration to KRaft, we will allow a rollback to ZooKeeper until the final step of the migration. This is accomplished by writing two copies of the metadata during the migration – one to the KRaft quorum, and one to ZooKeeper.

> The first step of the migration is to upgrade the cluster to at least the bridge release version. Upgrading the cluster to a well known starting point will reduce our compatibility matrix and ensure that the necessary logic is in place prior to the migration.

Contents:
- The dual-write rollback-safety mechanism during migration, and the bridge release as the mandatory starting point of the migration sequence (used for the Deep dive's migration-sequencing note).

## Apache Kafka: KIP-996, "Pre-Vote"

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-996%3A+Pre-Vote
Version: accepted KIP.

> Pre-Vote is the idea of "canvassing" the cluster to check if it would receive a majority of votes - if yes it increases its epoch and sends a disruptive vote request. If not, it does not increase its epoch and does not send a vote request.

> We will add a new field PreVote to VoteRequests and VoteResponses to signal whether the requests and responses are for Pre-Votes. The server does not increase its epoch prior to sending a Pre-Vote request.

Contents:
- The pre-vote mechanism itself: a canvassing round that avoids an epoch bump (and the disruption that comes with one) unless the candidate could actually win (used for the pre-vote reveal).

## Apache Kafka: KIP-853, "KRaft Controller Membership Changes"

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-853%3A+KRaft+Controller+Membership+Changes
Version: accepted KIP.

> KIP-595, KIP-630 and KIP631, introduced the KRaft cluster metadata topic partition. This is a partition with replicas that can achieve consensus on the Kafka log without relying on the Controller or ZK.

> This KIP describes a protocol for extending KIP-595 so that the operators can programmatically update the set of voters in a way that is consistent and available. There are two important use cases that this KIP supports. One use case is that the operator wants to change the number of controllers by adding or removing a controller. The other use case is that the operation wants to replace a controller because of a disk or hardware failure.

> Voters are added to the cluster metadata partition by sending an AddVoter RPC to the leader.

> Voters are removed from the cluster metadata partition by sending a RemoveVoter RPC to the leader.

> For safety Kafka will only allow one voter change operation at a time. If there are any pending voter change operations the leader will wait for them to finish.

Contents:
- Dynamic controller-quorum membership changes (`AddVoter`/`RemoveVoter` RPCs) as a KRaft-specific addition on top of the base Raft protocol from KIP-595/630/631, including the one-change-at-a-time safety rule (used for the dynamic-quorum reveal).

Notes on this topic's research:

The unversioned and version-pinned `documentation.html#kraft`/`#upgrade_4_0_0` pages return the
same client-side-assembled redirect shell every prior topic has hit; no working static page was
found for Kafka's own KRaft overview or 4.0/3.9 upgrade guide specifically (unlike topics 1-3,
where a `/44/design/design/` or `/44/generated/*.html` page existed as a fully-rendered
alternative — no equivalent exists for KRaft or the upgrade guide). `archive.apache.org`'s
`RELEASE_NOTES.html` for 4.0.0 and 3.9.0 fetch cleanly but are JIRA-issue-title lists with no
prose explaining the bridge release or ZooKeeper's removal in human language, so they are not
quoted here. **Correction**: `CHAPTER.md`'s scope line names "the mandatory 3.9 bridge
migration" specifically. No Apache-published source fetchable in this sandbox confirms 3.9 as
*the* bridge release by name — KIP-500 and KIP-866 define the bridge-release concept and its
dual-write rollback mechanism, but neither pins a version number (both were written before 3.9
shipped). This topic teaches the bridge-release concept and its role in the migration sequence,
sourced to KIP-500/KIP-866, without asserting "3.9" as a confirmed fact from an Apache source —
see `FACT-CHECK.md`'s correction.
