# Outline: KRaft: metadata as a replicated log (`de.kraft-metadata-replicated-log`)

## Progress

- [x] Research (`SOURCES.md`, 16 quotes verified via `node scripts/sources.mjs check`)
- [x] Real toy measurements verified (`examples.py`, all asserts pass)
- [x] Content plan / storyboard (this file)
- [ ] Fact-check (`FACT-CHECK.md`)
- [ ] Coverage map (`coverage.json`)
- [ ] Build every file (`reel.tsx`, `scenes.tsx`, `post-notes.md`, `references.md`, `pre-notes.md`, `prerequisites.mdx`, `narration.json`, registry entry)
- [ ] Content review (`REVIEW.md`)
- [ ] Checks and looks review
- [ ] Queue narration (`renarration.json`)
- [ ] Ship (merge, check, push, held)

**Note for whoever resumes this topic:** `../CHAPTER.md`'s topic 4 entry is this topic's
contract. Topic 3 (`de.replication-isr-high-watermark`) is shipped (held) ahead of it; this
topic reuses its ISR/high-watermark and leader-epoch vocabulary (the controller quorum is "the
same kind of log" generalized to cluster metadata) without re-teaching it.

**Correction to `CHAPTER.md`'s scope line, applied here and in `FACT-CHECK.md`:** the scope line
names "the mandatory 3.9 bridge migration" as a specific fact. No fetchable Apache source confirms
3.9 as *the* bridge release by name — see `SOURCES.md`'s closing note. This topic teaches the
bridge-release concept (sourced to KIP-500/KIP-866) without asserting the specific version number.

## Learning outcomes (from `CHAPTER.md`)

1. Explain why Kafka folded its own metadata into a Kafka-shaped log instead of a separate
   coordination service.
2. Describe the controller quorum, heartbeat fencing, and snapshotting.
3. State what pre-vote and dynamic quorums each fix.
4. Place the bridge release correctly in the upgrade path.

## Expert list (from the syllabus line and SOURCES.md)

1. The controller nodes comprise a Raft quorum that manages the metadata log; everything
   formerly stored in ZooKeeper (topics, partitions, ISRs, configs) lives in this log instead —
   *here* (quoted).
2. The same majority-survives-failures math as any Raft quorum applies: a three-node controller
   quorum survives one failure, five survives two — *here* (quoted).
3. Brokers do not have metadata pushed to them; they pull it via a `MetadataFetch`-style API,
   tracking their own fetch offset — *here* (quoted).
4. That same periodic fetch doubles as a heartbeat; a broker that stops fetching for long enough
   is fenced by the active controller, even if it is still reachable by other brokers — *here*
   (quoted, measured in `examples.py`).
5. The pre-KRaft failure this design specifically fixes: a broker that can reach ZooKeeper but
   not the controller kept serving stale metadata to clients, with no way for the controller to
   know — *here* (quoted, this is the hook).
6. A periodic snapshot of the metadata log bounds how much a joining or recovering broker must
   replay from scratch, the same idea as a database checkpoint — *here* (named from the design,
   not separately quoted; a standard Raft/log-compaction technique this topic applies to the
   metadata log specifically).
7. Pre-vote is a canvassing round: a candidate checks informally whether it would win before
   bumping its epoch and sending a real, disruptive vote request — *here* (quoted, measured).
8. A flaky node that can never actually win an election still disrupts the leader under a
   standard vote every time it reconnects, because the epoch bump happens before the vote is
   decided; pre-vote skips the bump entirely when the canvass fails — *here* (measured directly).
9. Dynamic controller quorums (KIP-853) let an operator add or remove a controller via
   `AddVoter`/`RemoveVoter` RPCs, without a full cluster restart — *here* (quoted).
10. Only one voter-membership change is allowed in flight at a time; a second request arriving
    while one is still pending is rejected, not queued silently — *here* (quoted, measured).
11. No Apache-published source fetchable in this sandbox names a specific version as "the"
    mandatory bridge release; KIP-500/KIP-866 define the concept without pinning a version number
    — *here* (`SOURCES.md` correction, not asserted as a version claim).

## The reel's steps, storyboarded

### Step 1 — Hook: the broker that kept serving stale metadata (`fig: Hook`)

- **On screen:** a broker that can still reach the old coordination system but not the active
  controller, still answering client requests with metadata that's gone stale.
- **Caption:** a broker partitioned from the controller, but not from the system that used to
  track cluster state, kept serving requests with a view of the world that had already changed.
- **Narrator's line of thought:** poses the failure before naming the fix — two systems that
  disagree about what's current is worse than one system, even a slower one.

### Step 2 — Setup: one log instead of two systems (`fig: Setup`)

- **On screen:** the old two-system picture (a separate coordination service plus the brokers)
  collapsing into the one-log picture this chapter has already built for ordinary partitions.
- **Caption:** cluster metadata used to live in a completely separate system. Now it's a log,
  built the same way every other partition in this chapter has been.
- **Narrator's line of thought:** explicitly reuses topic 1-3's own vocabulary — this is the
  same kind of log, generalized.

### Step 3 — Predict: "does the controller push updates out, or do brokers pull them?" (`fig: PredictPullPush`)

- **Options:** (a) the controller pushes updates to every broker as they happen; (b) brokers
  pull updates themselves, tracking their own position; (c) a mix, depending on cluster size.
- **Right answer:** (b). Wrong-but-tempting: (a) matches how a lot of systems distribute state,
  and how Kafka's old controller worked; (c) assumes an operational detail that isn't how the
  protocol is actually designed.
- **Narrator's line of thought:** connects to a pattern seen before — a consumer fetching from a
  partition, not having records pushed to it.

### Step 4 — Reveal: the metadata log, fetched like any other (`fig: RevealFetch`)

- **On screen:** a broker's own tracked offset into the metadata log, fetching forward, the same
  shape as a consumer fetching a partition.
- **Takeaway:** "A broker pulls metadata updates and tracks its own position — the same pattern
  this chapter has used for an ordinary partition, just applied to the cluster's own state."
- **Narrator's line of thought:** answers step 3, and makes the fetch-doubles-as-heartbeat idea
  land naturally in the next step.

### Step 5 — Reveal: heartbeat fencing, in real numbers (`fig: RevealFencing`)

- **On screen:** a toy run — a broker's time since its last fetch against the fencing threshold,
  twice: once comfortably under it, once well past it.
- **Takeaway:** "The same periodic fetch that pulls metadata also tells the controller a broker
  is alive — stop fetching long enough, and that broker gets fenced, even if it's still up."
- **Narrator's line of thought:** closes the loop on step 1 — this is exactly the mechanism that
  prevents a stale broker from quietly serving stale data forever.

### Step 6 — Predict: "a candidate that could never actually win an election keeps interrupting the leader. Why?" (`fig: PredictDisruption`)

- **Options:** (a) because a vote request always forces a new epoch, whether or not the
  candidate wins; (b) because the leader has to step down the moment any vote request arrives;
  (c) because the quorum doesn't check whether a candidate is eligible.
- **Right answer:** (a). Wrong-but-tempting: (b) overstates what a vote request does on its own;
  (c) misdiagnoses the mechanism — eligibility isn't the issue, timing is.
- **Narrator's line of thought:** sets up the fix by making the actual mechanism of the problem
  concrete before naming the solution.

### Step 7 — Reveal: pre-vote, measured (`fig: RevealPreVote`)

- **On screen:** a toy run, repeated rounds of a flaky node reconnecting: epoch bumps and leader
  disruptions under a standard vote, against the same rounds under pre-vote.
- **Takeaway:** "Canvassing for a likely win before bumping the epoch turns a node that can never
  actually win into a node that never disrupts anyone."
- **Narrator's line of thought:** answers step 6 directly with a measured before/after.

### Step 8 — Reveal: dynamic quorums, one change at a time (`fig: RevealDynamicQuorum`)

- **On screen:** an operator adding and removing controllers in sequence without a restart,
  against a second request arriving while one is still pending and getting rejected.
- **Takeaway:** "Growing or shrinking the controller quorum needs no restart — but only one
  membership change is ever in flight at once."
- **Narrator's line of thought:** frames this as the last piece Raft itself doesn't solve for
  you, closing the chapter's run through what KRaft adds on top of the base protocol.

### Step 9 — Prove it (`fig: ProvePanel`)

- **On screen:** a results panel with the run's real numbers: the fencing threshold comparison,
  the pre-vote-vs-standard-vote disruption counts, and the voter-change acceptance outcome.
- **Caption:** every number in this reel came from a real toy controller-quorum run, just now.

### Step 10 — Recap

- **On screen:** a short pipeline sketch (two systems → one log → pull-based fetch → fencing →
  pre-vote → dynamic membership), one icon per takeaway.
- **Handoff line (spoken):** sets up topic 5 — a partition's data is one thing; who reads it,
  together, as a group, is next.

## Post-notes headings (Deep dive)

- **Internals:** the `__cluster_metadata` internal topic/partition name (named from the design,
  not separately quoted here); periodic snapshots as the metadata-log equivalent of a database
  checkpoint, bounding replay time for a joining or recovering broker (named, not measured — no
  toy models snapshot-interval tradeoffs here).
- **Lab:** no lab of its own (`CHAPTER.md` names none); the bridge-migration sequencing is named
  here as a sourced fact for the Deep dive, per the chapter's own note.
- **Production:** the bridge-release requirement itself — a cluster cannot jump straight from an
  old ZooKeeper-based release to KRaft-only; it must pass through a release built for the
  migration first, with the dual-write rollback safety KIP-866 describes (named here, version
  number not asserted — see the correction above).
- **Frontier:** formal consensus theory (what Raft actually guarantees and why) is named here,
  not taught — it belongs to a later chapter per `CHAPTER.md`'s own "leaves out" line.
- **Where this goes next:** topic 5 (consumer groups and rebalance protocols) answers who reads
  a partition's data together, as a group, and what happens when that group's membership changes
  — the same "membership changes without a full restart" idea this topic just taught for
  controllers, now applied to consumers.

## Engagement arc

- **Hook:** step 1 (the broker serving stale metadata).
- **Predict:** steps 3 and 6 (two, within the first eight of ten steps).
- **Surprising number:** step 7's zero-disruptions-under-pre-vote result, confirmed in step 9.
- **Takeaways (≥3):** steps 4, 5, 7, 8 (four).
- **Recap:** step 10.

## Examples to execute (`examples.py`)

1. `heartbeat_fencing`: a broker's time since its last heartbeat against a fixed timeout; assert
   a broker well past the timeout is fenced and one comfortably under it is not.
2. `repeated_partition_disruption`: a flaky node that can never win reconnecting across several
   rounds; assert a standard vote bumps the epoch and disrupts the leader every round, while
   pre-vote bumps the epoch and disrupts the leader zero times.
3. `one_voter_change_at_a_time` (+ a concurrent variant): assert a sequence of fully-completed
   voter changes all succeed, and a second request arriving while one is still pending is
   rejected, not silently queued or merged.
4. Every number above is asserted, not printed uncomputed, and is what steps five, seven, eight
   and nine show on screen.

## Claims list (claim → source)

1. The controller quorum is a Raft group that manages the metadata log; everything formerly in
   ZooKeeper lives there instead — KIP-500 (quoted).
2. A three-node controller quorum survives one failure, a five-node quorum survives two — KIP-500
   (quoted).
3. Brokers pull metadata updates via a fetch-style API rather than having them pushed — KIP-500
   (quoted).
4. That periodic fetch doubles as a heartbeat; a controller fences a broker whose heartbeat lapses
   — KIP-500 (quoted).
5. Brokers register with the controller quorum, not with ZooKeeper, in the post-ZooKeeper design —
   KIP-500 (quoted).
6. The failure this design fixes: a broker partitioned from the controller but not from
   ZooKeeper kept serving stale metadata — KIP-500 (quoted).
7. The "bridge release" is a named, required intermediate step of the ZooKeeper-to-KRaft
   migration, with a dual-write rollback mechanism — KIP-500/KIP-866 (quoted).
8. Pre-vote canvasses for a likely win before bumping the epoch and sending a real vote request —
   KIP-996 (quoted).
9. Dynamic controller-quorum membership changes use `AddVoter`/`RemoveVoter` RPCs, one change in
   flight at a time — KIP-853 (quoted).

## Concept ledger

- **Introduces:** `kraft-controller-quorum`.
- **Uses:** `isr-high-watermark`, `leader-epoch-fencing` (topic 3).
- **Declared:** none beyond topic 3.

## Bridge / handoff

- **Bridge** (from topic 3): "Ordinary partitions are replicated the way topic 3 described.
  Kafka's own cluster metadata used to be replicated by a completely different system,
  ZooKeeper. This topic is how Kafka 4.0 replaced that with the same kind of log it already runs
  for everything else."
- **Handoff** (to topic 5): "A partition's data is one thing; who is allowed to read it,
  together, as a group, and what happens when that group's membership changes, is the next
  topic."
