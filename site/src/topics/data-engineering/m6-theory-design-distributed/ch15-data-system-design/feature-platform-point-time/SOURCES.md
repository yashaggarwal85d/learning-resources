# Sources — de.feature-platform-point-time

`CHAPTER.md` names Feast's documentation (point-in-time joins, online and offline stores),
Uber's Michelangelo write-up and the Palette feature-store write-up, Chapter 2's as-of-join
topic and Chapter 17 §17.1 as pointers, and Chapter 15 topic 17's dual-logic evidence as
candidates. Uber's Michelangelo write-up (eng.uber.com and its regional mirrors) returned a 404
or an HTTP 406 bot block on every URL tried at research time; this topic quotes Feast's own
documentation instead — the "Point-in-time joins" page (the as-of-join mechanism this topic's
training-set build is built on) and the "Online store" page (the low-latency store this topic's
parity check compares against) — two sources, satisfying the ≥2-source rule. Chapter 2's as-of-
join material and Chapter 15 topic 17's dual-logic material are prior topics on this same site,
used and not re-taught, not external sources.

## Feast documentation, "Point-in-time joins"

URL: https://docs.feast.dev/getting-started/concepts/point-in-time-joins
Fetched: 2026-10-31. Covers Feast v0.66-branch docs.

Quotes:
> Feast is able to join features from one or more feature views onto an entity dataframe in a point-in-time correct way.

> This means Feast is able to reproduce the state of features at a specific point in the past.

> Feast will scan backward in time from the entity dataframe timestamp up to a maximum of the TTL time specified.

Items: (1) the point-in-time join is exactly this topic's as-of join mechanism, applied to a
feature view instead of a generic table; (2) the join's purpose is literally reconstructing past
feature state, the property this topic's training-set build depends on; (3) the TTL-bounded
backward scan is the mechanism the training-set join uses to find each feature's correct
historical value without reading anything later.

## Feast documentation, "Online store"

URL: https://docs.feast.dev/getting-started/components/online-store
Fetched: 2026-10-31. Covers Feast v0.66-branch docs.

Quotes:
> Feast uses online stores to serve features at low latency.

> only the latest feature values are stored. No historical values are stored.

> Features can also be written directly to the online store via push sources

Items: (1) the online store's own job in this topic's design, serving the current feature value
at prediction time; (2) the reason the online store alone cannot answer a point-in-time question,
which is exactly why the parity check and the offline store's history both matter; (3) the
streaming-write path this topic's per-feature freshness decision chooses for a feature that needs
it.
