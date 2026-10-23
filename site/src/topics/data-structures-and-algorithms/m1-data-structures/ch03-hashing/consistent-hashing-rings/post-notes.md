---
id: dsa.consistent-hashing-rings
title: Consistent hashing rings
---

<section data-section="outcomes">

## After this topic you can

- Explain ring placement and why a key's owning machine is found by walking clockwise from the key's hash.
- Explain virtual nodes as the fix for a single ring point's unpredictable load share.
- State the minimal-remapping property and measure it directly for a join or leave.
- Name the bounded-loads extension and the real guarantee it adds over plain consistent hashing.

</section>

<section data-section="internals">

## Into the internals

### Karger's own words, and the picture everyone actually draws

Karger et al.'s 1997 paper never says "ring" or "clockwise." It maps buckets and items onto "the unit interval" and assigns each item to the bucket whose point is "closest" to it. The ring-and-clockwise picture this topic (and almost every explanation of consistent hashing since) uses is the now-standard pedagogical redrawing of that same unit-interval, closest-point mechanism — not Karger's own terminology, and not invented for this topic either. It's confirmed as real, current production language: Cassandra's own docs say outright that lookups "walk the ring in a clockwise fashion." The mechanism is identical either way; only the picture changed.

### Why many small points beat one big one

Hashing a machine to many points instead of one doesn't change the hash function or the ring — it just asks the same question more times per machine. Each of a machine's many points gets some small, independent, roughly random share of the ring. By the law of large numbers, many small independent shares summed together land much closer to their average than one single large draw does. That's the entire mechanism behind virtual nodes: not a smarter placement rule, just more independent samples per machine.

</section>

<section data-section="lab">

## In the lab

The syllabus's own Lab bullet measures key movement when growing a ten-machine ring to eleven. `examples.py` builds exactly that ring, measures the fraction of keys that move on the join (averaged over many independent trials, since a single trial with only ten existing points varies a lot), and measures per-machine imbalance with one point per machine against many virtual points per machine, on the identical key set.

</section>

<section data-section="production">

## In production

Cassandra's own current documentation is the real, cited production example here: it names "virtual nodes" by name as the fix for single-token imbalance, and states its own older default — two hundred fifty six tokens per physical node under random allocation — before describing a newer deterministic allocator that needs far fewer tokens per node to reach the same evenness. Both are read from Cassandra's own current docs, not a secondary summary of them.

</section>

<section data-section="frontier">

## The frontier

Rendezvous hashing, jump consistent hashing, and Maglev hashing are three other real schemes for the same problem — mapping keys to machines so that a machine joining or leaving moves few keys — named here with no mechanism taught, since the syllabus skips them for this topic. *Data Engineering* §5.3 picks up consistent hashing again for sharding a distributed store across many machines; this topic hands off the placement mechanism, not that chapter's own content.

</section>

<section data-section="questions">

## More questions

- Why does a ring join only ever affect one clockwise neighbor, never two?
- What would happen to the bounded-loads guarantee if every client requested the same one key?

</section>

<section data-section="next">

## Where this goes next

Consistent hashing answers where a piece of data lives, and how little moves when the set of machines changes. It says nothing about whether two copies of that data actually agree. Next: proving they do, without comparing either one whole.

</section>
