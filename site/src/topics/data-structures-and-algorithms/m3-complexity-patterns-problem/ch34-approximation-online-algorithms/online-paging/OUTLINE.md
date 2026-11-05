# Outline: Online paging

## Storyboard (steps)

1. **The hook: a cache that always loses.** Four pages of cache, a request stream of five distinct pages cycling endlessly. Every single request is for the page the cache just evicted. Over two thousand requests, LRU and FIFO both fault on every one; the best possible policy, seeing the whole future, faults five hundred and three times.
2. **The online constraint, named.** An online algorithm decides with only the past; an offline algorithm sees the whole input before deciding anything. Paging is the paging problem exactly this way: on a fault, evict a page now, without knowing what comes next.
3. **The adversary argument.** Why no deterministic online algorithm can beat this ratio of k, ever: an adversary with k+1 distinct pages always asks for the one page the algorithm just evicted, which is always the one page the algorithm cannot have.
4. **Predict: can randomization escape the adversary?** Before naming the actual escape route, ask whether a cleverer deterministic rule could dodge this trap, or whether something else entirely is needed.
5. **Bélády's offline optimum, defined.** Evict the page whose next use is furthest away — the one rule no real system can run, because it needs the future.
6. **LRU is a marking algorithm; FIFO is not.** Marking algorithms (never evict a page marked earlier in the current phase) carry a proved competitive ratio; LRU is one of them, FIFO is not, even though both carry the same adversary-forced ratio of k in the worst case.
7. **Bélády's anomaly, computed directly.** The classic reference string: FIFO faults nine times with three frames, ten times with four frames — more memory, more faults. LRU and the true optimum are both monotone on the identical sequence: more memory never hurts either one.
8. **Connecting the theory to Chapter 11's own policies.** LRU's k-competitiveness and its practical excellence do not contradict each other: the ratio is a worst case over adversarial sequences, and real traces are not built by an adversary.
9. **Recap and handoff.** A competitive ratio of k says what cannot be fixed by a cleverer deterministic policy. What is actually handed to an engineer is one problem with a size and a shape — reading that off the statement is the skill that comes before any algorithm.

## Learning outcomes

- State the paging problem and the competitive ratio, and prove by an adversary argument that no deterministic online algorithm beats a ratio of k.
- Compute and explain Bélády's anomaly directly: why FIFO's own fault count can rise with more memory while the true optimum's count never does.
- Say what a competitive ratio of k does and does not tell an engineer about a real cache policy's practical behavior.

## Concept ledger

- **Introduces:** `online-algorithm`, `competitive-ratio`, `paging-problem`, `belady-offline-optimum`, `oblivious-adversary`, `marking-algorithm`, `belady-anomaly`.
- **Uses:** `approximation-ratio`, `lower-bound-on-opt` (topic 109).
- **Declared:** `lru-policy`, `fifo-policy` (Chapter 11's own topics on these are not live at the time this topic is built; this topic states each in one line and does not re-teach the mechanism).

## Bridge and handoff

- **Bridge:** "Everything in this chapter so far assumed the whole input was in front of the algorithm: the sets, the files, the points, the join graph. Some decisions do not get that luxury. A cache has to evict a page now, before it knows which pages will be asked for next, and the choice cannot be taken back. The question changes from 'how close to the best answer can you get' to 'how close to the best answer someone who could see the future would have got'. Online paging, next."
- **Handoff:** "A competitive ratio is a promise about every possible input, and the best deterministic cache can promise only k, which says that a cleverer policy is not where the next gain is. Every guarantee in this chapter has had that character: true of the worst input, and the worst input is rarely the one in front of you."

## Changes from the chapter plan

- The chapter plan calls for Sleator and Tarjan's own 1985 CACM paper, read directly, with its exact theorem statement. That paper was not independently fetched; the k-competitiveness of paging algorithms is instead sourced from Wikipedia's k-server problem page, which states plainly: "the paging problem... was also already known to have a k-competitive algorithm (Sleator and Tarjan 1985)." The topic does not state the paper's own inequality, only this summary.
- The chapter plan calls for randomized marking at O(log k) against an oblivious adversary, attributed to Fiat, Karp, Luby, McGeoch, Sleator and Young (1991). That paper, and any Wikipedia page describing the randomized marking algorithm specifically, were checked for and not found (the Wikipedia pages read for this topic cover deterministic marking algorithms and the k-competitive bound only). This build does not include the randomized marking algorithm or its O(log k) bound, since no accessible source for it was found; a reader wanting that result is pointed to the primary paper in post-notes, not given an unsourced number here.
- The chapter plan calls for the "related-resource-augmentation" fact (competitive ratio k/(k−h+1) against a smaller offline cache of size h). This is sourced directly from the Page replacement algorithm Wikipedia page's own marking-algorithm section, and is included in post-notes as a named fact, not built into the main storyboard's own computed examples.
- The chapter plan calls for LIFO and LFU's lack of competitiveness, cited to Sleator and Tarjan's own counterexamples. Since the paper was not read, this topic does not state a specific counterexample for LIFO or LFU; it names the fact (not every replacement policy is competitive) without constructing an unsourced proof.
