## Before this topic

- **disaggregated state** — an architecture where the authoritative copy of a system's state is stored separately from the machine doing the processing, rather than kept local to it.
- **primary copy** — the one copy of a piece of state that is treated as authoritative; everything else (a local cache, a replica) is derived from it.
- **local cache** — a copy of data kept close to the processing for speed, understood to not be the source of truth.
- **async state API** — an API where a request returns a handle to a future result instead of blocking until that result is ready.
- **per-key ordering** — a guarantee that operations touching the same key complete in the order they were issued, even when operations on different keys may not.
- **key group** — the fixed, hash-assigned unit that keyed state is partitioned into and redistributed by on a rescale (topic 22).
