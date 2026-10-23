---
id: dsa.separate-chaining
title: Separate chaining
---

<section data-section="outcomes">

## After this topic you can

- State the load factor (α = n/m) and explain why the expected length of the chain a random key lands in is about α, under the simple-uniform-hashing assumption.
- Explain why chaining tolerates α > 1 without failing — access degrades toward Θ(n) in the worst case, but there is no fixed capacity per bucket, so nothing ever runs out of room.
- Name chaining's per-entry pointer cost as the one real trade-off the next topic's scheme (open addressing) gives up, and pays for differently.

</section>

<section data-section="internals">

## Into the internals

### The assumption the Θ(1 + α) result depends on

Everything this topic cites rests on one stated assumption, in the lecture's own words: "each key k ∈ S is equally likely to be hashed to any slot of table T, independent of where other keys are hashed" — simple uniform hashing. Under that assumption, the expected time for an unsuccessful search is Θ(1 + α), and Θ(1) whenever α = O(1). A successful search carries the same asymptotic bound, but the lecture itself hedges the proof: "a rigorous argument is a little more complicated. (See textbook.)" This topic keeps that same hedge rather than manufacturing a derivation the primary source didn't give.

### The correction found while building this topic's `examples.py`

An early draft measured only that the average chain length tracked α, and called that evidence the hash was behaving well. It isn't: for n keys inserted into m buckets, the total number of chain nodes is always n, so the average is always n/m = α — by arithmetic alone, for any hash function at all, including a deliberately degenerate one that sends every key to the same bucket. The real, hash-dependent claim is that the *longest* chain stays close to that average instead of hoarding keys; `examples.py` measures this directly (the longest chain stays under 5% of n at every tested α under Python's own well-spread `hash()`) and contrasts it against a worst-case construction where the longest chain holds literally all of n.

### What Java's `HashMap` actually ships, beyond pure chaining

Java's `HashMap` is chaining-based by its own source comment ("a binned (bucketed) hash table"), but it isn't *pure* chaining: once a bin grows past a size threshold, it's "transformed into bins of TreeNodes, each structured similarly to those in java.util.TreeMap." That refinement trades a little memory for a worst-case O(log n) guarantee per bucket even under a bad hash or an adversary — a real production answer to this exact topic's worst case, named here but not built.

</section>

<section data-section="lab">

## In the lab

No separate *Lab* bullet is named for this topic in the syllabus §3.2; every number in this topic's reel (steps 5, 6, 8) is produced directly by `examples.py`'s own measurement, described above.

</section>

<section data-section="production">

## In production

Java's `HashMap` is the production example this topic leans on: chaining by default, a 0.75 default load factor chosen as "a general rule" trade-off between time and space, and rehashing once entries exceed load-factor × capacity — plus the tree-bin refinement above for the one case pure chaining handles worst. Treat the tree-bin threshold as evidence that even a mature, heavily used standard library doesn't trust "the average case is fine" alone; it hedges against the one case where it isn't.

</section>

<section data-section="frontier">

## The frontier

Universal hashing's formal guarantee — a provable bound on collision probability for any fixed input, independent of what an adversary chooses, rather than this topic's stated assumption — is the deeper theoretical tool behind "simple uniform hashing." This syllabus's own Chapter 3 plan marks "Universal and k-independent hashing" *(skipped)* for this run; it is named here with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- If α could be made very small (many more buckets than keys), what does that buy you, and what does it cost?
- Java's `HashMap` treeifies a bin only past a size threshold, not always. Why not treeify every bin from the start?

</section>

<section data-section="next">

## Where this goes next

Chaining never runs out of room in a bucket, at the cost of a pointer per entry. The next scheme gives that pointer up — every entry lives in the table itself — and pays for it differently.

</section>
