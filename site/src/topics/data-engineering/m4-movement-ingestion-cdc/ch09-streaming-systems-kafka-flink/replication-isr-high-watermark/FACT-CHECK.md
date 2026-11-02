# Fact-check: Replication, ISR and the high watermark (`de.replication-isr-high-watermark`)

Role: adversarial fact-checker, re-deriving every claim in `OUTLINE.md`'s claims list from the
fetched source text in `sources/`, and red-teaming all three predict steps and the toy
measurements.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A write isn't committed until every ISR member has it; with `f+1` replicas in the ISR, a topic tolerates `f` failures without losing a committed message. | Confirmed | Direct quote, Kafka design doc: "A write to a Kafka partition is not considered committed until all in-sync replicas have received the write." / "With this ISR model and f+1 replicas, a Kafka topic can tolerate f failures without losing committed messages." |
| 2 | By default since 0.11.0.0, Kafka favors waiting for a consistent replica, configurable via `unclean.leader.election.enable`. | Confirmed | Direct quote: "By default from version 0.11.0.0, Kafka chooses the first strategy and favor waiting for a consistent replica. This behavior can be changed using configuration property unclean.leader.election.enable." |
| 3 | A two-replica topic down to one in-sync replica still accepts `acks=all` writes, lost if that replica also fails. | Confirmed | Direct quote: "if a topic is configured with only two replicas and one fails (i.e., only one in sync replica remains), then writes that specify acks=all will succeed. However, these writes could be lost if the remaining replica also fails." |
| 4 | `min.insync.replicas` gates both write success under `acks=all` and read visibility to consumers. | Confirmed | Direct quote, topic config reference: "Regardless of the acks setting, the messages will not be visible to the consumers until they are replicated to all in-sync replicas and the min.insync.replicas condition is met." |
| 5 | Truncating a restarted follower to its own recorded high watermark can discard a committed message, because the follower's HW is a round-trip stale. | Confirmed | Direct quotes, KIP-101: "the follower takes an extra round of RPC to update its high watermark" / "Message m2 has been lost permanently (regardless of whether B comes back or not)." |
| 6 | A leader epoch is stamped on every message; a follower asks for the end offset of its current epoch instead of trusting its own high watermark. | Confirmed | Direct quotes, KIP-101: "Leader Epoch: A 32 bit, monotonically increasing number representing a continuous period of leadership for a single partition. This is marked on all messages." / "In this case the LeaderEpochResponse returns offset 2. Note this is different to the high watermark which, on the follower, is offset 0. Thus the follower does not truncate any messages and hence message m2 is not lost." |
| 7 | Epoch-based truncation does not protect against divergence under `unclean.leader.election.enable=true`. | Confirmed | Direct quote, KIP-101: "this proposal does not protect against log divergence for clusters that use the setting unclean.leader.election.enable=true." |
| 8 | KIP-966's "last replica standing" scenario: a sole ISR member's unclean shutdown can erase committed data from every replica once re-elected leader. | Confirmed | Direct quote, KIP-966: "When the last replica in the ISR experiences an unclean shutdown and loses committed data, it will be reelected leader after starting up again, causing rejoining followers to truncate their logs and thereby removing the last copies of the committed records which the leader lost initially." |
| 9 | ELR is a tracked pool of replicas outside the ISR but guaranteed caught up to the high watermark; KIP-966 proposes gating HW advancement on `min.insync.replicas`. | Confirmed | Direct quotes, KIP-966: "we use ELR to store the replicas that are not in ISR but guarantee to have the data at least to High Watermark." / "We propose to enforce that High Watermark can only advance if the ISR size is larger or equal to min.insync.replicas." |

## Correction: ELR's default-on claim

`CHAPTER.md`'s scope line asserts ELR is "default on new clusters from Kafka 4.1 per the KIP."
This is **not confirmed** and appears to be **wrong as written**. The KIP-966 text fetched for
this topic states the opposite directly: "To enable ELR, you should turn on its feature version
eligible.leader.replicas.version to ELRV_1. ... False is the default value. It will turn true in
the future." — no version is named. Three attempts to find a confirming source for a
specific default-on version failed outright (not just redirect-shelled):
`downloads.apache.org/kafka/4.1.0/RELEASE_NOTES.html` errored, `kafka.apache.org/44/upgrade`
errored, and `kafka.apache.org/44/documentation.html#upgrade_4_1_0` /
`kafka.apache.org/41/documentation.html#upgrade_4_1_0` both returned client-side-assembled
redirect shells with no release-note content. The generated Kafka 4.4 config reference
(`kafka_config.html`) and `kafka.apache.org/44/generated/` index listing contain no
release-notes or upgrade-guide page either. **Resolution**: this topic teaches ELR as a safer,
explicitly-tracked election pool Kafka added via KIP-966 (an accepted KIP), without asserting
it is on by default in Kafka 4.1 or any other specific version — the KIP's own config default is
`False`. `OUTLINE.md`, `reel.tsx`, `narration.json` and `coverage.json` all avoid the
unconfirmed version claim.

## Currency check

- The design-doc and topic-config-reference quotes are read from the Apache Kafka 4.4
  documentation's generated, version-pinned pages (`/44/design/design/`,
  `/44/generated/topic_config.html`), the same low-currency-risk pattern established for topics
  1 and 2.
- KIP-101 and KIP-966 are both accepted KIPs; KIP-101 shipped long ago (leader-epoch truncation
  is long-established Kafka behavior) and is a historical record, not a moving target. KIP-966
  is more recent — its "accepted" status and the explicit "it will turn true in the future"
  language for its own feature flag mean the exact default-on version genuinely may not be
  settled yet, which is consistent with (and is the reason for) the correction above rather than
  a research gap on this topic's part.

## Red team: predict step 3 ("which position counts as committed?")

- **Wrong option (a), "the leader's own tick":** tempting because the leader is the one actually
  accepting writes first and seems authoritative; wrong because the design doc is explicit that
  commitment requires *every* in-sync replica, not just the leader — if the leader alone defined
  "committed," a leader crash the instant after a write would make every uncommitted write
  simply vanish with no fallback.
- **Wrong option (c), "whichever replica is fastest besides the leader":** tempting because it
  sounds like a reasonable proxy for "caught up"; wrong because the high watermark is a minimum
  over the *whole* ISR, not a pick of one follower — a single slow-but-still-in-sync follower
  holds the line back exactly as much as the slowest one, which `examples.py`'s
  `hw_is_minimum_of_isr` demonstrates directly (the watermark sits at the slower follower's
  offset of 150, not the faster one's 180).

## Red team: predict step 5 ("safe to trust its own recorded line?")

- **Wrong option (a), "yes, truncate to the recorded line":** tempting because it is the
  simplest possible rule and matches what a learner might assume "the committed point" means by
  default; wrong because KIP-101's own worked example shows this losing a message (m2) that was
  never actually divergent, purely because the follower's own high-watermark bookkeeping lags
  one round of RPC behind what it has actually fetched.
- **Wrong option (c), "compare raw offsets with the leader directly":** tempting because it
  sounds more careful than blind self-truncation; wrong because a raw offset number alone
  doesn't distinguish "I am behind but valid" from "I have data the leader never had" — that
  distinction is exactly what the leader-epoch number encodes and a raw offset does not.

## Red team: predict step 7 ("does a one-replica ISR keep accepting full-durability writes?")

- **Wrong option (a), "no, Kafka blocks writes once the set is this small":** tempting because
  it is the behavior a learner might *hope* Kafka has, and is in fact what KIP-966 proposes
  adding; wrong as a description of classic (pre-KIP-966) behavior, which checks only that the
  ISR is non-empty before advancing the high watermark, not its size against
  `min.insync.replicas` — confirmed by KIP-966's own motivation section describing exactly this
  gap as the problem it fixes.
- **Wrong option (c), "it depends only on whether unclean election is turned on":** tempting
  because unclean election is the other major lever this topic covers, so a learner might
  conflate the two; wrong because unclean election decides who gets to *lead* after a failure,
  while the question here is whether a write was ever accepted as durable *before* any failure
  happened — two different decisions at two different times, confirmed by KIP-966 treating the
  high-watermark-advancement gate as a distinct proposed change from the (separate, pre-existing)
  unclean-election configuration.

## Red team: the toy measurements themselves

- **`hw_is_minimum_of_isr`:** re-derived by hand — leader offset two hundred, followers lagging
  twenty and fifty, giving follower offsets one hundred eighty and one hundred fifty; the
  minimum of `{200, 180, 150}` is `150`, matching the asserted `high_watermark == 150`. The
  function is a direct arithmetic minimum, not a stand-in for any timing-sensitive real-cluster
  behavior, and is disclosed as such.
- **`min_insync_rejects_writes`:** re-derived by hand for each phase — `isr_size=3 >= 2` so all
  hundred writes in phase one succeed; `isr_size=1 < 2` so all forty writes in phase two are
  rejected; `isr_size=2 >= 2` so all sixty writes in phase three succeed. Matches
  `examples.py`'s asserted per-phase counts exactly. This models the configured durability gate
  only (a binary accept/reject per phase), not Kafka's real exception-throwing mechanics or
  partial-batch behavior, disclosed in `references.md`.
- **`leader_epoch_truncation`:** a direct, minimal reimplementation of KIP-101's own example
  (follower log `["m1", "m2"]`, recorded high watermark at offset one, leader-epoch end offset
  at offset two) — truncating a two-item list to index one drops the second item (`m2`);
  truncating to index two keeps both. This is intentionally a simplified index-slice model of
  the real protocol (no actual leader-epoch request/response round trip, no real broker), chosen
  to make the exact mechanism KIP-101 describes — "the follower's own recorded line is stale;
  the epoch log is not" — directly checkable rather than merely asserted in prose.
- **`last_replica_standing`:** re-derived by hand — classic rule accepts all six writes made
  during the shrink window, and the unclean-shutdown loss (four most-recent records of the
  fifty-six-record sole-replica log) overlaps all six of them, since four is less than six and
  they are the most recent entries; matches `writes_during_shrink_now_lost == 4` for at least one
  of them (checked as `> 0`, not an exact count, since the overlap depends on which records are
  "most recent" and the toy only asserts the qualitative gap). The gated rule accepts zero writes
  during the shrink by construction (`enforce_min_insync_on_hw=True` and `1 < 2`), so the
  intersection with any lost set is necessarily empty — matches `writes_during_shrink_now_lost ==
  0`. The simulation does not model network-partition timing, real unclean-shutdown mechanics,
  or controller election; it isolates exactly the one claim this topic needs (gating
  high-watermark advancement on the configured minimum, not just non-emptiness, closes the loss
  window) and nothing more.

## Corrections applied to OUTLINE.md

- The ELR default-on-version claim from `CHAPTER.md`'s scope line was downgraded before
  `OUTLINE.md` was written (see the correction above) — no walk-back of already-published reel
  content was needed since this is the first draft of this topic's files.
