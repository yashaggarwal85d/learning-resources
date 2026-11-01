# OUTLINE: Integer compression (`dsa.integer-compression`)

## Storyboard (12 steps, ~15 min)

1. **Hook.** A posting list of about a million document ids, in order, is four mebibytes as
   32-bit integers. The counting floor for a list this size, out of a universe of four billion,
   is thirteen and a half bits per id — no encoding can average fewer. Plain varint on the gaps
   between ids spends about sixteen. Packing fixed-width blocks of a hundred and twenty eight
   spends about seventeen here, because one stretch of wide gaps forces its whole block wide.
   Predict: is the smallest encoding also the fastest to decode?
2. **Varint, the whole mechanism.** Seven payload bits per byte, the eighth a continuation flag;
   decode one byte at a time, each one asking "is there another byte." Protobuf's own worked
   examples: one is a single byte, a hundred and fifty is two.
3. **Predict (within first four steps).** "Decoding a byte-oriented varint, one byte at a time —
   is the number of bytes to read for a given value known in advance, or does it depend on the
   value itself?" Correct: it depends on the value — every byte's continuation flag is a
   genuinely data-dependent branch, not knowable ahead of time.
4. **Reveal: the cost of that branch.** Measured: just under two data-dependent branches for
   every id this list's own varint decode has to take, one for the gap's own last byte and most
   of a second for the byte before it. **Takeaway.**
5. **Frame of reference.** Split the list into fixed blocks; each block stores its own bit width,
   wide enough for its largest gap, and every other value is packed at exactly that width — no
   per-value flag, no per-value branch at all inside a block.
6. **Predict.** "One single unusually large gap lands inside an otherwise tight block of a
   hundred and twenty eight small gaps. What happens to that block's own stored width?" Correct:
   the whole block widens to fit the one outlier — every other value in it now spends more bits
   than it needs.
7. **Reveal: patching.** Pick a width that covers most of a block's own values; store the few
   that don't fit aside, as an exception list, and patch them back in after decoding the block at
   its narrow width. Measured: patching recovers most of what one outlier would have cost the
   whole block, while decoding stays just as branch-free. **Takeaway.**
8. **Grouped control bytes.** One control byte can describe four integers' own byte lengths at
   once, cutting the per-byte continuation check down to one decision point per four integers —
   Google's own VARINT-GB, the idea the chapter's grouped byte code measures directly.
9. **Predict.** "Stream VByte keeps the same grouped control-byte idea as VARINT-GB, moving every
   control byte into its own separate stream ahead of the data. Does separating the two streams
   change how many bits the encoding spends?" Correct: no — it is the same number of bits,
   arranged differently, so the data stream can be read as one contiguous run for a vector
   instruction to unpack.
10. **Reveal: branches against bits, together.** The measured table: the counting floor, then
    varint, the grouped byte code, frame of reference and patched frame of reference, each one's
    bits per id beside its own branches per id. The two numbers don't fall in the same order —
    frame of reference costs more bits here than plain varint, for far fewer branches; patching
    recovers the bits without giving back any of that branch count. **Takeaway.**
11. **Where this is used.** Lucene's postings format, in fixed blocks of a hundred and twenty
    eight with patching on one kind of block and not the other; Parquet's own two named
    encodings, delta plus bit-packing and the run-length/bit-packing hybrid — each read from its
    own current documentation, not assumed from the papers.
12. **Recap.** The fastest decoder here was never the smallest one; it was the one with the
    fewest decisions a value's own content could force. Roaring's array container was exactly
    this chapter's own plain sorted list — and now it's compressible in exactly this way.

## Engagement arc

- Hook: a direct number continuation from Chapter 13 topic 43's own array container (a plain
  sorted list of sixteen-bit values), now treated as the thing to compress.
- First predict: step 3, inside the first four steps.
- Second predict: step 6 (the "one outlier widens the whole block" surprise).
- Third predict: step 9 (Stream VByte's own reorganization, same bits, different layout).
- Takeaways: steps 4, 7, 10.
- Surprising number: step 1's "not necessarily the smallest" framing, paid off exactly at step 10
  where frame of reference costs *more* bits than varint on this list, for a tiny fraction of the
  branches.
- Recap: step 12, naming the direct handoff back to Roaring's array container, and forward to
  Chapter 14's progress guarantees.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next`.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** topic 43's own handoff, word for word: "Roaring stores each chunk of a set one of
  three ways, and one of the three is nothing more than a sorted list of sixteen-bit integers,
  two bytes each, stored as they are. That is the cheapest honest encoding only when the list is
  short. A list of millions of ids, in order, can be stored in far fewer bits than that, and
  decoded at nearly the speed memory can supply it, if you stop treating each integer as a
  fixed-size thing. Integer compression, next."
- **Handoff:** "A compressed posting list is a block of bytes that no one ever changes, and that
  is why a hundred threads can decode it at once with no coordination at all: nothing they touch
  can be altered under them. Every structure that can be changed is a different matter. The
  first time two threads write to the same queue, map or counter, the question is no longer how
  fast it is but what it means for it to be correct, and the answer has a name and a formal
  definition. Progress guarantees and linearizability, next."

## Running example and measured values

`examples.py` builds one real posting list: 2^20 (about a million) ids over a universe of 2^32,
gaps drawn mostly from an exponential distribution with mean 4,096 (the universe-over-cardinality
ratio), with one percent of gaps drawn from a much wider exponential (mean forty times larger) to
give the list the clustered-with-outliers shape `CHAPTER.md` asks for, specifically so that one
stretch of wide gaps can be shown forcing a frame-of-reference block wide. Measured on this list:
counting floor 13.44 bits/id (exact, matching `CHAPTER.md`'s own planning value for a list this
size); plain varint 15.97 bits/id, just under two branches per id; a Varint-GB-style grouped byte
code at 17.57 bits/id, a quarter of a branch per id; frame of reference in blocks of 128 at 16.93
bits/id (worse than plain varint here, because of the outliers), under one hundredth of a branch
per id; patched frame of reference at 15.21 bits/id, recovering most of what the outliers cost
frame of reference, at the same branch count. Decode *speed* is never timed in Python (Chapter
13's own CHAPTER.md instruction: interpreter overhead would hide exactly the branch counts this
topic is about) — the papers' own named-hardware numbers (Stream VByte on a 3.4 GHz Haswell;
SIMD-BP128 against the previously fastest byte-oriented schemes) are quoted and attributed, never
recomputed.

## Changes from the chapter plan

- `CHAPTER.md`'s own planning run drew gaps from a plain exponential distribution (no outliers)
  and got about 15.9 bits/id for varint and about 15 for frame of reference. This build's own
  list adds a small outlier fraction specifically so patching has something real to demonstrate
  (`CHAPTER.md`'s own scope line asks for "a clustered gap distribution with outliers, to show
  patching"), which also makes plain frame of reference lose to varint on this particular list —
  a real, measured result, not a contradiction of the chapter's own closer-to-15 planning figure,
  which was from a list without outliers.
- The GOV2-collection bits-per-integer table in Lemire and Boytsov's own paper (binary packing,
  SIMD-BP128, OptPFD at specific decimal values) is a PDF-table extraction too garbled to quote
  exact figures from reliably (the numbers are present but their row/column alignment with each
  scheme's name is lost in extraction). This topic cites the paper's qualitative claims instead
  (nearly twice as fast, saves up to two bits per integer, within ten percent of a state-of-the-
  art scheme) and does not repeat the specific GOV2 decimal figures CHAPTER.md's own planning
  prose mentions, noted explicitly in `FACT-CHECK.md`'s red team rather than asserting a number
  this build could not itself verify word for word against the source.
