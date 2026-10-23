# Fact-check — Consistent hashing rings

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Ring placement: both keys and machines are hashed onto the same continuous range; a key belongs to the first machine found walking clockwise from it. | Confirmed | `sources/karger-chash.txt`: "The function rB maps buckets randomly to the unit interval, and rI does the same for items" and "i is mapped to the bucket 'closest' to i." `sources/cassandra-vnodes.txt`: "Cassandra instead maps every node to one or more tokens on a continuous hash ring... we 'walk' the ring in a clockwise fashion until we encounter three distinct nodes." |
| 2 | Minimal remapping: when a machine joins or leaves, only the keys between its ring position and its clockwise neighbor move. | Confirmed by construction | `examples.py` builds a real ring, adds a machine, and measures exactly which keys change owner — see `examples.py` itself. The property follows directly from claim 1's own mechanism: every key's clockwise-nearest machine is unchanged unless the new machine sits between it and its old owner. |
| 3 | One point per machine gives an unpredictable, often lopsided share of the ring — the paper's own reason for needing more than one point per bucket. | Confirmed | `sources/karger-chash.txt`: "we actually need to have more than one point in the unit interval associated with each bucket." |
| 4 | Virtual nodes (hashing one machine to many ring points) fix the imbalance; a real production system documents a concrete count. | Confirmed | `sources/cassandra-vnodes.txt`: "The Dynamo paper advocates for the use of 'virtual nodes' to solve this imbalance problem. Virtual nodes solve the problem by assigning multiple tokens in the token ring to each physical node," and "the default number of tokens per node had to be quite high, at 256." |
| 5 | Consistent hashing with bounded loads guarantees a maximum load factor c = 1+ε over the fair share, while still moving only an expected constant number of clients per join/leave. | Confirmed, read in full | `sources/bounded-loads.txt`: "with n clients and n servers, we get a guaranteed max-load of 2, while only moving an expected constant number of clients each time a client or server is added or removed," and "the system designer can specify a balancing parameter c = 1+ε, guaranteeing that the maximum load is at most" (the paper's own general statement of the configurable bound). |
| 6 | Every number put on screen (steps 4, 7, 9) is measured directly in `examples.py`. | Confirmed by construction | `examples.py` builds a real ring, measures the join-remapping fraction against topic 20's own resize-all fraction, and measures per-machine imbalance with one point vs. many virtual points per machine — see `examples.py` itself. |

## Red team: the predict questions

**Step 3 (JoinPredict).** Distractors tested against the real mechanism:
- "All of them, the same as a single-machine resize" — wrong, and tests whether a learner has carried topic 20's resize-everything picture forward without noticing the ring changes that entirely; this is the contrast the whole topic turns on.
- "About half of them" — wrong, and tests whether a learner assumes some vague partial-but-large fraction rather than the much smaller, specific arc the ring's own structure guarantees.
- "Only the keys between the new machine's position and its clockwise neighbor" (correct) — directly what claim 1's mechanism implies, and what `examples.py` measures directly.
- "None, until the ring itself needs to grow" — wrong, and tests whether a learner conflates "the ring's total range doesn't change" with "no key's owner ever changes," which are different claims; some keys' owners do change, just very few of them.

**Step 6 (VirtualNodesPredict).** Distractors tested against the real mechanism:
- "Give the overloaded machine more memory" — wrong, and tests whether a learner treats this as a capacity problem rather than a placement problem; the imbalance is about how much of the ring's range a machine owns, not how much it can hold.
- "Hash each machine to many points on the ring instead of just one" (correct) — directly Karger's own stated fix ("more than one point... associated with each bucket"), confirmed in production by Cassandra's own vnode mechanism.
- "Pick each machine's ring position by hand instead of hashing it" — wrong, and tests whether a learner abandons the hash-based placement that makes the whole scheme work, rather than keeping it and adding more points.
- "Shrink the ring's total range so there's less room to be uneven" — wrong, and tests whether a learner thinks the range's size, rather than the number of points per machine, is what drives the imbalance; shrinking the range doesn't change how unevenly a fixed number of random points falls on it.

## Currency notes

- Karger et al.'s paper is the original 1997 STOC paper that introduced consistent hashing, fetched from a course-archive mirror of the paper's own PDF; it is cited for its own original statements, not a secondary retelling.
- The bounded-loads paper is the arXiv preprint of the SODA 2018 paper, read in full for its actual stated guarantee rather than a simplified summary.
- Cassandra's documentation was fetched from its current, stable docs, describing both the older random-token default (256) and the newer deterministic allocator as a dated contrast, not treating the old default as current practice.

## Claims not made

- No claim that this topic's from-scratch ring's measured numbers (join-remapping fraction, imbalance with vs. without virtual nodes) match any real production system's own benchmarked numbers — they are this topic's own honest measurements of the same mechanism's real shape.
- No claim that Karger's paper itself uses "ring" or "clockwise" terminology — `post-notes.md`'s internals section names this distinction explicitly (see "Changes from the chapter plan" in `OUTLINE.md`).
- No claim about rendezvous, jump, or Maglev hashing's own mechanisms beyond naming them in `post-notes.md`'s frontier section — all three are skipped in the syllabus for this topic.
- No claim about the full mechanics covered in *Data Engineering* §5.3 beyond naming it as the cross-domain handoff the syllabus specifies.
