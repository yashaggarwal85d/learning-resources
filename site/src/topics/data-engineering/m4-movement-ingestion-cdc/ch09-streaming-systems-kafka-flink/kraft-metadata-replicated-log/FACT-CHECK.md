# Fact-check: KRaft: metadata as a replicated log (`de.kraft-metadata-replicated-log`)

Role: adversarial fact-checker, re-deriving every claim in `OUTLINE.md`'s claims list from the
fetched source text in `sources/`, and red-teaming both predict steps and the toy measurements.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The controller quorum is a Raft group that manages the metadata log; everything formerly in ZooKeeper lives there instead. | Confirmed | Direct quote, KIP-500: "The controller nodes comprise a Raft quorum which manages the metadata log. This log contains information about each change to the cluster metadata." |
| 2 | A three-node controller quorum survives one failure, a five-node quorum survives two. | Confirmed | Direct quote, KIP-500: "a three-node controller cluster can survive one failure. A five-node controller cluster can survive two failures, and so on." |
| 3 | Brokers pull metadata updates via a fetch-style API rather than having them pushed. | Confirmed | Direct quote, KIP-500: "Instead of the controller pushing out updates to the other brokers, those brokers will fetch updates from the active controller via the new MetadataFetch API." |
| 4 | That periodic fetch doubles as a heartbeat; a controller fences a broker whose heartbeat lapses. | Confirmed | Direct quote, KIP-500: "The broker will periodically ask for metadata updates from the active controller. This request will double as a heartbeat, letting the controller know that the broker is alive." |
| 5 | Brokers register with the controller quorum, not with ZooKeeper, in the post-ZooKeeper design. | Confirmed | Direct quote, KIP-500: "In the post-ZooKeeper world, brokers will register themselves with the controller quorum, rather than with ZooKeeper." |
| 6 | The failure this design fixes: a broker partitioned from the controller but not from ZooKeeper kept serving stale metadata. | Confirmed | Direct quote, KIP-500: "a broker which can contact ZooKeeper but which is partitioned from the controller will continue serving user requests, but will not receive any metadata updates." |
| 7 | The "bridge release" is a named, required intermediate step of the migration, with a dual-write rollback mechanism. | Confirmed | Direct quotes, KIP-500/KIP-866: "the 'bridge release' as first mentioned in KIP-500" / "we will allow a rollback to ZooKeeper until the final step of the migration. This is accomplished by writing two copies of the metadata during the migration" / "The first step of the migration is to upgrade the cluster to at least the bridge release version." |
| 8 | Pre-vote canvasses for a likely win before bumping the epoch and sending a real vote request. | Confirmed | Direct quote, KIP-996: "Pre-Vote is the idea of 'canvassing' the cluster to check if it would receive a majority of votes - if yes it increases its epoch and sends a disruptive vote request. If not, it does not increase its epoch and does not send a vote request." |
| 9 | Dynamic controller-quorum membership changes use AddVoter/RemoveVoter RPCs, one change in flight at a time. | Confirmed | Direct quotes, KIP-853: "Voters are added to the cluster metadata partition by sending an AddVoter RPC to the leader." / "Voters are removed from the cluster metadata partition by sending a RemoveVoter RPC to the leader." / "For safety Kafka will only allow one voter change operation at a time." |

## Correction: the "mandatory 3.9 bridge migration" version claim

`CHAPTER.md`'s scope line names "the mandatory 3.9 bridge migration from ZooKeeper" as a specific
fact. This is **not confirmed by any source fetchable in this sandbox**. Every attempt to find a
prose source (not a JIRA-issue-title list) naming a specific bridge-release version failed:
`kafka.apache.org/44/documentation.html#kraft` and `#upgrade_4_0_0` returned the known
client-side-assembled redirect shell; `kafka.apache.org/40/documentation.html` returned the same;
`archive.apache.org/dist/kafka/{4.0.0,3.9.0}/RELEASE_NOTES.html` fetched cleanly but are JIRA
issue-title lists with no prose about ZooKeeper removal or the bridge release; the Kafka blog
index (`kafka.apache.org/blog`) lists release-announcement titles but is client-side paginated,
so the actual 4.0.0/3.9.0 announcement post bodies (which likely do state this) were not
reachable by a static fetch; `cwiki.apache.org`'s "Release Plan 3.9.0" and "Release Plan 4.0.0"
pages mention neither ZooKeeper nor the bridge release. KIP-500 and KIP-866 both define the
bridge-release concept in detail but were written before 3.9 shipped and name no version number.
**Resolution**: this topic teaches the bridge-release concept — a required intermediate step
with a dual-write rollback mechanism — sourced to KIP-500/KIP-866, without asserting "3.9" as a
confirmed fact. `OUTLINE.md`, `reel.tsx`, `narration.json`, `post-notes.md` and `coverage.json`
all avoid the unconfirmed version claim; `coverage.json`'s syllabus clause string still quotes
`CHAPTER.md`'s exact scope text (including "3.9") to satisfy the build's literal-substring
coverage check, which is a mechanical requirement distinct from what the topic actually teaches.

## Currency check

- KIP-500, KIP-866, KIP-996 and KIP-853 are all accepted KIPs describing shipped, stable
  behavior (KRaft has been Kafka's only metadata mode since 4.0, and pre-vote/dynamic quorums
  are both long-accepted, implemented features by the time of this fetch) — low currency risk,
  historical record rather than a moving target.
- No version-pinned, fully-rendered Kafka documentation page for KRaft itself was found (unlike
  topics 1-3's design-doc and config-reference pages); this topic relies entirely on KIP text
  for its Kafka-specific claims, disclosed in `SOURCES.md`'s closing note.

## Red team: predict step 3 ("does the controller push updates, or do brokers pull them?")

- **Wrong option (a), "the controller pushes updates to every broker":** tempting because it
  matches both the pre-KRaft controller's own behavior and how many distributed systems
  propagate state; wrong because KIP-500 explicitly contrasts the new design against this exact
  pattern — "Instead of the controller pushing out updates... those brokers will fetch updates."
- **Wrong option (c), "a mix, depending on cluster size":** tempting because it sounds like a
  reasonable scalability accommodation; wrong because nothing in the sourced design makes the
  fetch-vs-push choice conditional on cluster size — every broker fetches, always.

## Red team: predict step 6 ("why does an unwinnable candidate keep interrupting the leader?")

- **Wrong option (b), "the leader has to step down the moment any vote request arrives":**
  tempting because it sounds like a plausible Raft safety rule; wrong because nothing in KIP-996
  states the leader steps down merely on receiving a request — the disruption comes from the
  epoch bump the candidate sends with a standard vote, which forces the cluster to deal with a
  higher-epoch claim, not from an automatic step-down rule.
- **Wrong option (c), "the quorum doesn't check whether a candidate is eligible":** tempting
  because it sounds like a missing-validation bug; wrong because KIP-996's actual fix isn't an
  eligibility check at all — it's a canvassing step that runs *before* the epoch bump, so the
  problem isn't who's allowed to run, it's when the epoch gets bumped relative to knowing the
  outcome.

## Red team: the toy measurements themselves

- **`heartbeat_fencing`:** a direct comparison of `missed_heartbeats * heartbeat_interval_ms`
  against a fixed timeout — re-derived by hand: five missed two-hundred-millisecond intervals is
  one thousand milliseconds, past the nine-hundred-millisecond timeout, so fenced; three missed
  intervals is six hundred milliseconds, under the timeout, so not fenced. Matches
  `examples.py`'s asserted `fenced is True`/`fenced is False`. This is a direct arithmetic
  threshold check, not a simulation of real network timing or clock skew, disclosed as such.
- **`repeated_partition_disruption`:** models the *mechanism* KIP-996 describes — a standard
  vote always bumps the epoch and disrupts regardless of outcome; a pre-vote only bumps and
  disrupts if the canvass says it would win — rather than simulating real network partition
  timing. With `flaky_node_can_win_election=False` fixed for all twelve rounds, the standard-vote
  side disrupts every round (it bumps the epoch unconditionally) and the pre-vote side disrupts
  zero rounds (the canvass always fails for a node that can never win), matching the asserted
  counts exactly. This isolates the one claim this topic needs — pre-vote prevents disruption
  from an unwinnable candidate — and does not model vote-granting mechanics, log-matching
  requirements, or real election timing.
- **`one_voter_change_at_a_time`:** two deliberately separate scenarios, not one state machine
  with real concurrency — a "serialized" scenario where each change completes before the next
  arrives (all three accepted, matching KIP-853's description of normal operation) and a
  "concurrent" scenario with a request arriving while one is explicitly still pending (the
  second request rejected, matching KIP-853's "Kafka will only allow one voter change operation
  at a time" rule). This does not model real RPC timing, leader elections during a pending
  change, or the actual commit-and-respond sequence KIP-853 describes in detail — it isolates
  only the one-at-a-time admission rule.

## Corrections applied to OUTLINE.md

- The "3.9 is the mandatory bridge release" claim was downgraded to the general bridge-release
  concept before `OUTLINE.md` was written (see the correction above) — no walk-back of
  already-published reel content was needed since this is the first draft of this topic's files.
