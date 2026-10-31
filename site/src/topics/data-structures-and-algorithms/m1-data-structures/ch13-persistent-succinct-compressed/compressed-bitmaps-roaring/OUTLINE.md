# OUTLINE: Compressed bitmaps: Roaring (`dsa.compressed-bitmaps-roaring`)

## Storyboard (12 steps, ~14 min)

1. **Hook.** `level = ERROR AND service = auth AND hour = 13`: each predicate matches a set of
   row ids from a universe of four billion, and the query is their intersection. A plain bitmap
   per predicate costs 512 MiB whether it matches a thousand rows or two billion; a sorted array
   costs four bytes per matching row and is smaller until 134 million rows match. A thousand
   matches: which is smaller, and by how much? Then the real question: what does one structure
   do when the same set is dense here, sparse there, and one long run somewhere else?
2. **The two-level structure.** Split the 32-bit universe by its top 16 bits into 65,536 chunks
   of 65,536 values each; a sorted list of (key, container) pairs, the key the shared top bits,
   the container holding the low 16 bits of whichever values are in that chunk.
3. **Predict (within first four steps).** "A chunk with a hundred values, scattered, versus a
   chunk with thirty thousand values, in short runs. Does the same container win both?" Correct:
   no — the right container depends on the shape of the chunk's own content, not a fixed choice.
4. **Reveal: three containers, one honest size.** Array (two bytes per value) for a sparse
   chunk, bitmap (a fixed eight kilobytes) for a dense one, run (a start and a length per run)
   for a clustered one — each chunk's container picked by whichever is actually smallest,
   measured and checked against the worked sizes. **Takeaway.**
5. **The 4,096 threshold.** Array and bitmap cross exactly where two bytes per value equals the
   bitmap's fixed eight kilobytes — not a tuned number, the arithmetic itself.
6. **Predict.** "A chunk holds every one of its 65,536 possible values, one single run. Is its
   container six bytes, or sixty-five thousand?" Correct: six bytes — one run, however long.
7. **Reveal: run containers, and runOptimize.** A run container cost almost nothing regardless
   of how many values it covers, as long as they're few long runs rather many short ones; a
   library function scans existing containers and converts them to run containers only when
   that's smaller, typically done once, right before the set is stored for querying. **Takeaway.**
8. **Three real predicates, measured.** The chapter's own dense, sparse and clustered predicates
   over a few million row ids: a plain bitmap costs the same fixed half-gigabyte regardless; a
   plain array costs four bytes per match; Roaring beats both, every time, by picking per chunk.
9. **Predict.** "An AND of two Roaring bitmaps reaches a chunk present in one bitmap but missing
   from the other entirely. What does that chunk cost the intersection?" Correct: nothing — a
   missing chunk is skipped outright, not computed and discarded.
10. **Reveal: chunk-by-chunk AND, and galloping.** The three-predicate intersection walks matching
    chunks only; within a chunk, a bitmap-bitmap AND is one word-by-word pass, an array-array
    intersection merges when the two are close in size and gallops (exponential search) once one
    dwarfs the other, measured directly against a plain merge. **Takeaway.**
11. **Where Roaring is used.** Named at the strength each source actually supports: Lucene's own
    two Roaring-inspired classes, Spark's direct use of the library for shuffle bookkeeping,
    Pinot's inverted index, Druid's bitmap-index default.
12. **Recap.** Roaring is the chapter's exact counterpart to a Bloom filter's approximate one:
    no false answers, in close to the space the densest honest encoding of each chunk would
    take. What it stores one way, as a sorted list of small integers, is itself compressible
    further. Integer compression, next.

## Engagement arc

- Hook: directly extends Chapter 12's own handoff (an exact set, where Bloom gave an approximate
  one), not a fresh setup.
- First predict: step 3, inside the first four steps.
- Second predict: step 6 (the surprising "six bytes, not sixty-five thousand" number).
- Third predict: step 9 (commits to "a missing chunk costs nothing" before the reveal).
- Takeaways: steps 4, 7, 10.
- Surprising number: step 6's six-byte full chunk, and step 8's measured roaring-beats-both.
- Recap: step 12, in the narrator's own words, naming the handoff to integer compression.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next`.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** Chapter 12 topic 42's handoff, word for word: "A Bloom filter spends about one and
  a half times the fewest bits any filter could, to answer one question about one key, and it
  pays for that with a wrong answer in one direction and with everything it cannot do: it cannot
  delete, and it cannot list what it holds. When the thing to store is a set of integers and
  every answer must be exact, with intersections and unions as fast as the data can be read, a
  different bit array does the work: one bit per possible value, compressed in pieces. Compressed
  bitmaps: Roaring, next."
- **Handoff:** "Roaring stores each chunk of a set one of three ways, and one of the three is
  nothing more than a sorted list of sixteen-bit integers, two bytes each, stored as they are.
  That is the cheapest honest encoding only when the list is short. A list of millions of ids, in
  order, can be stored in far fewer bits than that, and decoded at nearly the speed memory can
  supply it, if you stop treating each integer as a fixed-size thing. Integer compression, next."

## Running example

Chapter 5's/12's log, now treated as a table of row ids. `examples.py` works the full planning
table: the universe-level bitmap/array break-even at 2^27; the chunk-level 4,096 break-even; the
four worked chunk sizes (100 scattered, 4,097 in one run, 30,000 in 15,000 runs, a full 65,536-run
chunk) matching CHAPTER.md exactly; three real predicates (dense, sparse, clustered) over about
four million row ids, each beating both the plain bitmap and the plain array; a real three-way
intersection checked against a brute-force set computation; and the galloping-vs-merge cost
comparison at and beyond the factor-64 threshold.

## Changes from the chapter plan

- The "30,000 values in 15,000 runs" worked example needed a specific construction (15,000
  evenly-spaced runs of exactly two values each, rather than naively doubling 15,000 scattered
  points, which collapsed some runs where two scattered points landed adjacent to each other) to
  land on exactly 15,000 runs and reproduce the plan's own "run 60,002" figure. Implementation
  detail, not a claim changed.
- The three real predicates (dense/sparse/clustered) stand in for the hook's own
  `level=ERROR`/`service=auth`/`hour=13` by shape, not by literal semantic meaning — named as
  such explicitly in the reel's narration and post-notes, not presented as real log semantics.
