---
id: dsa.online-paging
title: Online paging
---

<section data-section="outcomes">

## After this topic you can

- State the paging problem and the competitive ratio, and prove by an adversary argument that no deterministic online algorithm beats a ratio of k.
- Compute and explain Bélády's anomaly directly: why FIFO's own fault count can rise with more memory while the true optimum's count never does.
- Say what a competitive ratio of k does and does not tell an engineer about a real cache policy's practical behavior.

</section>

<section data-section="internals">

## Into the internals

### Why the adversary argument needs only k plus one pages

The adversary doesn't need to know anything about the algorithm's internal state beyond the one fact every deterministic algorithm's own rule reveals: which page it just evicted. With k pages in the cache and k plus one distinct pages available, exactly one page is ever missing from the cache at any moment under this request pattern, and the adversary simply asks for that one. Because the algorithm is deterministic, its eviction choice is a fixed function of the request history, which means the adversary's next request is always computable in advance, before the algorithm "chooses" anything. Randomization breaks this exact argument, because the adversary (if oblivious, fixing its sequence in advance without seeing the algorithm's coin flips) cannot know which page a randomized algorithm will have evicted until after the fact.

### Why LRU is a marking algorithm and FIFO is not

Within one stretch of distinct-page requests (a phase), LRU's own eviction rule always picks the page used longest ago — and any page requested during the current phase was, by definition, used more recently than any page that has not yet been requested this phase. So LRU can never evict a page marked (requested) earlier in the same phase; it structurally cannot. FIFO's rule looks only at arrival order, which has nothing to do with how recently a page was requested — a page that arrived early in the cache but was marked (requested again) moments ago can still be the next one FIFO evicts, because FIFO never looks at the mark at all.

</section>

<section data-section="lab">

## In the lab

Take the adversary trace builder in `examples.py` and try it against a cache policy that evicts a uniformly random page on every fault (not one of the policies taught here, but easy to add). Does the measured ratio against Bélády's optimum on the identical cyclic trace come out lower than LRU's and FIFO's own measured 3.98, closer to the k minus one over k behavior a randomized policy should show against an oblivious adversary? Separately, extend Bélády's anomaly reference string by hand: can you build a shorter sequence than the twelve-request classic one that still shows FIFO's fault count rising from three frames to four?

</section>

<section data-section="production">

## In production

LRU's proven worst-case ratio of k and its excellent real-world behavior are not in tension: the adversary argument describes the worst possible input over every conceivable request sequence, and an ordinary workload's request pattern was never built by an adversary trying to maximize LRU's fault count. This is the exact connection Chapter 11's own measured miss-ratio trace replays are best read against — a real trace's miss ratio sits far below the worst-case ceiling this topic proves, and that gap is not a contradiction, it is the whole reason LRU remains a default choice in practice despite carrying a worst-case guarantee that sounds alarming on its own.

</section>

<section data-section="frontier">

## The frontier

A randomized version of the marking algorithm — evict a page chosen uniformly at random among the currently unmarked pages, rather than FIFO's or LRU's own deterministic rule — is 2H_k-competitive against an oblivious adversary, where H_k is the k-th harmonic number, 1 + 1/2 + … + 1/k, roughly ln k: a bound of order log k, against every deterministic algorithm's k. The same paper proves that no randomized paging algorithm can do better than H_k, so randomized marking is within a factor of two of the best possible. Both results are Fiat, Karp, Luby, McGeoch, Sleator and Young, "Competitive Paging Algorithms" (Journal of Algorithms, 1991; the authors' copy is arXiv cs/0205038), which states the algorithm in k-server terms: a page in the cache is a vertex covered by a server. This topic names the bound and its source; the proof, a phase-by-phase count of how many evicted pages come back, is in the paper. The related-resource-augmentation fact (a marking algorithm with a cache of size k, compared against an offline optimum with a smaller cache of size h, is k divided by (k minus h plus one)-competitive, confirmed directly from the Page replacement algorithm Wikipedia page) is the practical answer to "a ratio of k sounds terrible": give the online policy a little more memory than the benchmark it's compared against, and the ratio collapses sharply.

</section>

<section data-section="questions">

## More questions

- The adversary argument depends on the algorithm being deterministic. What is the smallest concrete change to the adversary's own construction that would still work against a randomized algorithm that commits to its coin flips in advance (not an oblivious adversary's usual target, but something in between)?
- Bélády's anomaly was shown to be unbounded in 2010, not capped at a factor of two as originally conjectured. What does "unbounded" mean operationally here: is there a reference string where FIFO with more memory faults on literally every single request while a smaller cache faults hardly at all?

</section>

<section data-section="next">

## Where this goes next

A competitive ratio is a promise about every possible input, and the best deterministic cache can promise only k, which says a cleverer deterministic policy is not where the next gain sits. Every guarantee in this chapter has had that same character: true of the worst input, and the worst input is rarely the one actually in front of you. What an engineer is actually handed is one problem with a size, a time limit and a shape, and the first skill, before any of these algorithms, is reading those off the statement to see which algorithms are even allowed. Complexity budgeting from constraints, next.

</section>
