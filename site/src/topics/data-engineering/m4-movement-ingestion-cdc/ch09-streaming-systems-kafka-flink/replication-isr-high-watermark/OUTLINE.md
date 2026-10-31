# Outline: Replication, ISR and the high watermark (`de.replication-isr-high-watermark`)

## Progress

- [x] Research (`SOURCES.md`, 18 quotes verified via `node scripts/sources.mjs check`)
- [x] Real toy measurements verified (`examples.py`, all asserts pass)
- [x] Content plan / storyboard (this file)
- [ ] Fact-check (`FACT-CHECK.md`)
- [ ] Coverage map (`coverage.json`)
- [ ] Build every file (`reel.tsx`, `scenes.tsx`, `post-notes.md`, `references.md`, `pre-notes.md`, `prerequisites.mdx`, `narration.json`, registry entry)
- [ ] Content review (`REVIEW.md`)
- [ ] Checks and looks review
- [ ] Queue narration (`renarration.json`)
- [ ] Ship (merge, check, push, held)

**Note for whoever resumes this topic:** `../CHAPTER.md`'s topic 3 entry is this topic's contract.
Topics 1-2 are shipped (held) ahead of it; this topic uses their `partition-segment-index` and
`acks-durability-tradeoff` concepts without re-teaching them.

**Correction to `CHAPTER.md`'s scope line, applied here and in `FACT-CHECK.md`:** the scope line
claims ELR is "default on new clusters from Kafka 4.1 per the KIP." No source confirms this — see
`SOURCES.md`'s KIP-966 entry. ELR is taught as a safer, explicitly-tracked election pool Kafka
added via KIP-966, without asserting a specific default-on version.

## Learning outcomes (from `CHAPTER.md`)

1. Draw the leader/ISR/high-watermark relationship and say exactly what a consumer can and
   cannot read.
2. Configure `min.insync.replicas` for a stated durability target.
3. Explain leader-epoch truncation and why raw offset comparison alone is unsafe.
4. Distinguish unclean election from ELR and state the exact data-loss case each still allows.

## Expert list (from the syllabus line and SOURCES.md)

1. Followers pull from the leader; nothing is pushed to them — *here* (design doc framing).
2. The ISR is the set of replicas caught up enough to be eligible for election; a write isn't
   committed until every ISR member has it — *here* (quoted).
3. With `f+1` replicas in the ISR, a topic tolerates `f` failures without losing a committed
   message — *here* (quoted).
4. The high watermark is the minimum offset held by every in-sync replica, not the leader's own
   offset — a slow follower holds the line back even while the leader keeps writing — *here*
   (quoted framing, measured for real in `examples.py`).
5. `min.insync.replicas` gates both whether an `acks=all` write can succeed and whether a record
   becomes visible to consumers at all — *here* (quoted, measured).
6. Truncating a restarted follower to its own recorded high watermark can discard a message that
   was never actually divergent, because the follower's HW is a round-trip behind reality —
   *here* (quoted, KIP-101).
7. A leader epoch is a number stamped on every message marking a continuous period of
   leadership; a follower asks for the end offset of its own latest epoch instead of trusting its
   stale high watermark, and truncates only what the leader's log doesn't have — *here* (quoted,
   reimplemented in `examples.py`).
8. Epoch-based truncation does not by itself protect against divergence under
   `unclean.leader.election.enable=true` — *here* (quoted).
9. Classic unclean election favors consistency by default (since `0.11.0.0`), but a two-replica
   topic down to one in-sync replica still accepts `acks=all` writes that are lost if that last
   replica also fails — *here* (quoted, this is the hook).
10. KIP-966's "last replica standing" scenario: a sole surviving ISR member can suffer an unclean
    shutdown, lose committed data locally, then get re-elected leader on restart — erasing that
    data everywhere, not just locally — *here* (quoted).
11. Eligible Leader Replicas (ELR) is a tracked pool of replicas that are out of the ISR but
    still guaranteed caught up to the high watermark, eligible for a *clean* election; KIP-966
    also proposes gating high-watermark advancement on `min.insync.replicas`, not just ISR
    non-emptiness — *here* (quoted, measured in `examples.py`).
12. No source confirms a specific version where ELR became default-on; the KIP's own config
    default is off — *here* (`SOURCES.md` correction, not asserted as a version claim).

## The reel's steps, storyboarded

### Step 1 — Hook: records that were "safe" and vanished anyway (`fig: AcksHook`)

- **On screen:** a toy leader-plus-followers run, two totals — records an `acks=1` producer
  believed were durable that didn't survive a leader crash, against records an
  `acks=all`-with-`min.insync.replicas` producer believed were durable.
- **Caption:** a producer can be told a record is safe, and be wrong, depending on exactly whose
  acknowledgement it waited for.
- **Narrator's line of thought:** reopens topic 2's handoff directly — "safe" was never fully
  defined there; this topic defines it.

### Step 2 — Setup: the replica column and the ruler (`fig: Setup`)

- **On screen:** a leader box on top, follower boxes below, a shared ruler running through all
  of them; each box's own tick mark on the ruler, all at different positions.
- **Caption:** every replica keeps its own copy of the log, at its own pace. Something has to
  decide which point is actually safe to read.
- **Narrator's line of thought:** sets up the puzzle — the leader's tick is furthest right,
  followers trail behind. Which position is the one a consumer should trust?

### Step 3 — Predict: "which position counts as committed?" (`fig: PredictHW`)

- **Options:** (a) the leader's own tick, since it wrote the record first; (b) the minimum tick
  across every in-sync replica; (c) whichever replica is fastest besides the leader.
- **Right answer:** (b). Wrong-but-tempting: (a) assumes the leader's own log is sufficient,
  ignoring that the leader itself could die; (c) picks an arbitrary single follower instead of
  the whole in-sync set.
- **Narrator's line of thought:** she asks what happens if we trusted the leader's own tick and
  it died the next instant — that's exactly the gap the next reveal measures.

### Step 4 — Reveal: the high watermark, in real numbers (`fig: RevealHW`)

- **On screen:** the same replica column, now with real toy positions: the leader's own
  offset, each follower's offset, and the line marking the minimum of all of them.
- **Takeaway:** "The high watermark sits at the slowest in-sync replica's position, never at the
  leader's own — that gap is exactly what a crash can expose."
- **Narrator's line of thought:** answers step 3, and ties back to step 1 — this line is
  precisely what separates what an `acks=all` producer may safely call durable.

### Step 5 — Predict: "a follower restarts and compares its own recorded line to what it fetched. Safe to trust its own line?" (`fig: PredictTruncation`)

- **Options:** (a) yes — truncate to the recorded line and move on; (b) no — ask for a leader
  epoch's end offset instead; (c) no — compare raw offsets with the leader directly.
- **Right answer:** (b). Wrong-but-tempting: (a) is literally what a plain high-watermark
  truncation does, and can discard a message that was never actually divergent; (c) sounds more
  careful than (a), but a raw offset number alone can't tell a legitimately-caught-up follower
  from a genuinely divergent one.
- **Narrator's line of thought:** frames the follower's own recorded line as stale by
  construction — it is always at least one round-trip behind what it actually fetched.

### Step 6 — Reveal: leader-epoch truncation (`fig: RevealTruncation`)

- **On screen:** a two-message follower log; truncating to the recorded line drops the second
  message; truncating to the epoch's end offset keeps it.
- **Takeaway:** "A follower's own recorded line is always a round-trip stale — asking for the
  leader epoch's end offset is what tells it the second message was never actually divergent."
- **Narrator's line of thought:** connects back to step 4's ruler — epoch-based truncation reads
  a different, more honest mark than the high-watermark line alone.

### Step 7 — Predict: "the in-sync set shrinks to one replica. Does it keep accepting full-durability writes?" (`fig: PredictLastStanding`)

- **Options:** (a) no — Kafka blocks writes once the set is this small; (b) yes — classically,
  only emptiness of the set is checked, not its size against the configured minimum; (c) it
  depends only on whether unclean election is turned on.
- **Right answer:** (b). Wrong-but-tempting: (a) assumes the minimum-replicas setting is checked
  every time the line advances, which is exactly the gap this topic's last reveal closes; (c)
  conflates a separate, later decision (who gets to lead) with an earlier one (whether a write
  was ever safe to accept).
- **Narrator's line of thought:** she lets the learner reason from the ruler metaphor — nothing
  so far has said the line must stop moving just because fewer replicas are watching it.

### Step 8 — Reveal: last replica standing (`fig: RevealLastStanding`)

- **On screen:** a toy run, classic rule versus a rule that checks the in-sync count against the
  configured minimum before letting the line move; writes accepted during the shrink that are
  later lost, for each rule.
- **Takeaway:** "Checking the minimum before moving the line, not just checking the set isn't
  empty, is what stops a lone surviving replica from quietly losing writes it shouldn't have
  accepted."
- **Narrator's line of thought:** closes the loop from step 1 — this is the precise mechanism
  that turns a local crash into a cluster-wide loss, and the precise fix that prevents it.

### Step 9 — Prove it (`fig: ProvePanel`)

- **On screen:** a results panel with the run's real numbers: the high-watermark gap, the
  leader-epoch truncation outcome, and the last-replica-standing loss counts under both rules.
- **Caption:** every number in this reel came from a real toy replication run, just now.

### Step 10 — Recap

- **On screen:** a short pipeline sketch (replica column → ruler → epoch log → in-sync count),
  one icon per takeaway.
- **Handoff line (spoken):** sets up topic 4 — Kafka's own cluster metadata used to be
  replicated by a completely different system; what replaced it is next.

## Post-notes headings (Deep dive)

- **Internals:** the leader-epoch sequence file (named from the KIP's own terminology, not
  quoted or re-derived here); `replica.lag.time.max.ms`-style staleness checks that decide ISR
  membership in the first place (named, not taught — this topic assumes a replica's ISR
  membership as given and focuses on what the ISR implies).
- **Lab:** the toy high-watermark, min-insync-replicas, leader-epoch-truncation and
  last-replica-standing simulations built and run in `examples.py`; this hosts the leader-kill
  leg of the 9.1 chapter lab (`CHAPTER.md`'s lab table), building on topic 2's producer-side
  baseline.
- **Production:** running with `min.insync.replicas` left at its default of one (named here,
  from the topic config reference) means a single in-sync replica is enough for an `acks=all`
  write to succeed — the exact "last replica standing" exposure this topic's hook measures,
  not a hypothetical misconfiguration.
- **Frontier:** Unclean Recovery (`unclean.recovery.manager.enabled`, named in KIP-966) replaces
  pure random election during an unclean leader election with a more deliberate recovery
  process — named, not taught here.
- **Where this goes next:** topic 4 (KRaft) answers how Kafka replicates its own cluster
  metadata, using the same kind of log this topic has been describing for ordinary partitions.

## Engagement arc

- **Hook:** step 1 (records believed safe that didn't survive).
- **Predict:** steps 3, 5, 7 (three, well within the first eight of ten steps).
- **Surprising number:** step 1's loss gap, confirmed in step 9.
- **Takeaways (≥3):** steps 4, 6, 8 (three).
- **Recap:** step 10.

## Examples to execute (`examples.py`)

1. `hw_is_minimum_of_isr`: a leader offset and two follower offsets at different lags; assert the
   high watermark equals the minimum of all in-sync offsets and is strictly below the leader's
   own offset.
2. `min_insync_rejects_writes`: three phases of in-sync-set size against a fixed
   `min.insync.replicas`; assert writes succeed only in phases where the in-sync size meets or
   exceeds the minimum, and are entirely rejected otherwise.
3. `leader_epoch_truncation`: a direct reimplementation of KIP-101's own worked example; assert
   truncating to the recorded high watermark loses the second message, and truncating to the
   leader epoch's end offset keeps it.
4. `last_replica_standing`: the classic (ISR-non-empty-only) high-watermark rule versus the
   `min.insync.replicas`-gated rule from KIP-966, across the same shrink-then-unclean-shutdown
   scenario; assert the classic rule exposes writes made during the shrink to loss and the gated
   rule does not.
5. Every number above is asserted, not printed uncomputed, and is what steps one, four, six,
   eight and nine show on screen.

## Claims list (claim → source)

1. A write isn't committed until every in-sync replica has it; with `f+1` replicas in the ISR, a
   topic tolerates `f` failures without losing a committed message — Kafka design doc (quoted).
2. By default since `0.11.0.0`, Kafka favors waiting for a consistent replica over availability,
   configurable via `unclean.leader.election.enable` — Kafka design doc (quoted).
3. A two-replica topic down to one in-sync replica still accepts `acks=all` writes, which are
   lost if that last replica also fails — Kafka design doc (quoted).
4. `min.insync.replicas` gates both write success under `acks=all` and read visibility to
   consumers — topic config reference (quoted).
5. Truncating a restarted follower to its own recorded high watermark can discard a committed
   message, because the follower's HW is a round-trip stale — KIP-101 (quoted).
6. A leader epoch is stamped on every message; a follower asks for the end offset of its current
   epoch instead of trusting its own high watermark, truncating only what the leader's log lacks
   — KIP-101 (quoted, reimplemented).
7. Epoch-based truncation does not protect against divergence under
   `unclean.leader.election.enable=true` — KIP-101 (quoted).
8. KIP-966's "last replica standing" scenario: a sole ISR member's unclean shutdown can erase
   committed data from every replica once it is re-elected leader — KIP-966 (quoted).
9. ELR is a tracked pool of replicas outside the ISR but guaranteed caught up to the high
   watermark, eligible for a clean election; KIP-966 also proposes gating high-watermark
   advancement on `min.insync.replicas` — KIP-966 (quoted, measured).

## Concept ledger

- **Introduces:** `isr-high-watermark`, `leader-epoch-fencing`, `unclean-election-vs-elr`.
- **Uses:** `producer-batching-linger`, `acks-durability-tradeoff` (topic 2).
- **Declared:** none beyond topic 2.

## Bridge / handoff

- **Bridge** (from topic 2): "`acks=all` means waiting for every in-sync replica. This topic is
  what makes a replica count as in-sync, what the high watermark actually commits, and what
  happens — precisely — when a leader dies."
- **Handoff** (to topic 4): "Kafka's own cluster metadata — which broker leads which partition,
  which replicas are in sync — used to live in ZooKeeper, replicated by a completely different
  system. Kafka 4.0 replaced it with the same kind of log this chapter has been building. That's
  next."
