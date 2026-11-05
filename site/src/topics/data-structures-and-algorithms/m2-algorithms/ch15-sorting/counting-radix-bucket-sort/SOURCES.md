## Kuiper — "Fastest Table Sort in the West – Redesigning DuckDB's Sort" (duckdb.org, 27 August 2021)

URL: https://duckdb.org/2021/08/27/external-sorting.html
Version: fetched 2026-11-03, the post as currently published

> While std::sort is excellent algorithmically, it is still a single-threaded approach that is unable to efficiently sort by multiple columns because function call overhead would quickly dominate sorting time.

> If we have columnar storage, this comparator has to jump between columns, causing random access in memory.

> The binary string comparison technique improves sorting performance by simplifying the comparator. It encodes all columns in the ORDER BY clause into a single binary sequence that, when compared using memcmp will yield the correct overall sorting order.

> The bytes in c_birth_year are swapped because we need the big-endian representation to encode the sorting order.
> The first bit is also flipped, to preserve order between positive and negative integers for signed integers.

> The string "GERMANY" is shorter than "NETHERLANDS", therefore it is padded with 00000000's.
> All bits in column c_birth_country are subsequently inverted because this column is sorted descendingly.

> However, the encoding is necessary for Radix sort: Binary strings that produce a correct order with memcmp will produce a correct order if we do a byte-by-byte Radix sort.

> K-way merge merges K lists into one sorted list in one pass, and is traditionally used for external sorting (sorting more data than fits in memory) because it minimizes I/O.

> Cascade merge merges two lists of sorted data at a time until only one sorted list remains, and is used for in-memory sorting because it is more efficient than K-way merge.

### Contents (item by item, this topic's scope)

- The example query's own three-row encoding (NETHERLANDS/1991, NETHERLANDS/1992, GERMANY/1924) is the one this topic reworks by hand in `examples.py`: big-endian year bytes with the sign bit flipped, the descending string column's bits inverted, the shorter string padded to the longer one's length.
- The post's own stated motivation for the encoding (comparator overhead in a multi-column loop, and columnar storage's random access when jumping between columns) and why the encoding, having been paid for, then also makes radix sort possible on table rows.
- The K-way-vs-cascade-merge passage is cited only as the contrast this topic uses to say what DuckDB does for its own in-memory second phase (not built here; Chapter 15 topic 54 is the external, I/O-bound K-way merge).
- The post's own link to its 2023 follow-up paper (read below) is this topic's source for "what DuckDB does now," since the 2021 post itself is explicitly an older design snapshot.

## Kuiper & Mühleisen — "These Rows Are Made for Sorting and That's Just What We'll Do" (ICDE 2023)

URL: https://hannes.muehleisen.org/publications/ICDE2023-sorting.pdf
Version: fetched 2026-11-03, the authors' own posted PDF, linked directly from the 2021 DuckDB post as "Read our paper on sorting at ICDE '23"

> We show that, regardless of architectural differences between query engines, sorting rows is almost always more efficient than sorting columnar data, even if this requires converting the data from columns to rows and back.

> Based on our findings, we implement a highly optimized row-based sorting approach in the DuckDB open-source in-process analytical database management system, which has a vectorized interpreted query engine.

### Contents (item by item, this topic's scope)

- The paper's own title and authors (Laurens Kuiper and Hannes Mühleisen, CWI Amsterdam), confirming the 2021 post's own link target and this topic's citation "DuckDB's sort as described in its 2021 post and 2023 paper."
- The paper's own headline finding (row-based sorting beats columnar sorting even after a conversion cost) is named as the 2023 account's own addition to the 2021 post's design, not elaborated further: this topic's scope is the byte-encoding and the radix-sort connection, not the full row-vs-column benchmark.

## Peter M. McIlroy, Keith Bostic & M. D. McIlroy — "Engineering Radix Sort" (*Computing Systems* 6(1), Winter 1993, pp. 5–27)

URL: https://static.usenix.org/publications/compsystems/1993/win_mcilroy.pdf
Version: fetched 2026-11-03, USENIX's own static archive copy of the original PDF

> We recommend American flag sort as an all-round algorithm for

> Instead of copying data to an auxiliary array and back, we can permute the data in place.

> By analogy with the latter, we call the general problem
> the American flag problem.

### Contents (item by item, this topic's scope)

- The paper's own coining of "American flag sort" for the in-place MSD radix-sort variant, by analogy with the Dutch national flag problem (three-way partitioning, this chapter's topic 50) generalized from 3 piles to as many piles as there are distinct digit values.
- The paper's own description of the mechanism (read directly, not quoted verbatim past this point because this PDF's extracted text is heavily OCR-garbled through its code listings and figures — see Red team): fill the counted "piles" from the top by cyclically displacing elements, following one cycle of the permutation until it returns to its own starting slot, then moving to the next unfilled pile. This topic's own `examples.py` implements this cycle-leader permutation directly from the mechanism as described, not from a literal transcription of the paper's own (OCR-damaged) code.
- The paper's own recommendation (the abstract, and again at the point quoted above) that American flag sort be used as a general-purpose radix-sort variant, which the topic cites as the reason this topic teaches it rather than the two-array alternative the same paper also describes.

## Sedgewick & Wayne — *Algorithms*, 4th ed., booksite §5.1 "String Sorts"

URL: https://algs4.cs.princeton.edu/51radix/
Version: fetched 2026-11-03, "Last modified on August 26, 2016"

> American flag sort. (in-place key-indexed counting)
> Given an array with N distinct values between 0 and R-1, rearrange them
> in ascending order in linear time and with O(R) extra space.

> Scan over the input array. Take the first key, find the bin in which it
> belong, and swap it into place (updating the corresponding count[] entry).
> Repeat with the second key, but be careful to skip over
> keys already known to be where they belong.

### Contents (item by item, this topic's scope)

- An independent second confirmation of the "American flag sort" name and its in-place, count-array-driven swap mechanism, from a widely used textbook's own exercise, used here because the primary paper's own PDF text is too OCR-damaged to quote its code listings word for word.

## Herf — "Radix Tricks" (stereopsis.com)

URL: https://stereopsis.com/radix.html
Version: fetched 2026-11-03, the page as currently published

> the sign bit is set when the value is negative, which means that all negative numbers are bigger than positive ones

> Always flip the sign bit.

> If the sign bit was set, flip the other bits too.

### Contents (item by item, this topic's scope)

- The exact order-preserving bit transform this topic uses for IEEE 754 floats (flip the sign bit always; if the sign bit was set, flip every other bit too), which this topic reproduces directly in `examples.py` and checks against Python's own `struct`-packed float bit patterns.
- Cited as a widely used, independently reproduced technique (the same rule is documented, in the same words, in other radix-sort libraries read at research time — see Red team) rather than as a primary standards citation, since the IEEE 754 standard itself is paywalled.

### Red team

1. **The McIlroy, Bostic & McIlroy PDF's extracted text is heavily OCR-damaged**, especially through its code listings and ligature-heavy words ("Mcllroy" for "McIlroy", "progrurrì" for "program", italic variable names rendered as stray symbols). This topic quotes only the handful of plain-prose sentences that survive extraction cleanly, and describes the cycle-leader mechanism in its own words rather than transcribing the paper's own garbled code, consistent with how this project has handled other OCR/rendering artifacts (the CAV 2015 PDF in topic 52).
2. **The IEEE 754-2019 standard itself is not opened** (paywalled, per `CHAPTER.md`'s own "to verify" framing); this topic instead cites a widely reproduced, independently documented statement of the exact bit-flip rule (Herf's page), the same rule stated in the same words by at least one other radix-sort library's own documentation read at research time (a Rust crate's doc comments: "Positive numbers: Flip the sign bit only" / "Negative numbers: Flip all bits"), which this topic treats as sufficient corroboration for a technique, not a standards citation.
3. **CLRS 4th ed. chapter 8 (counting sort, radix sort, bucket sort, and its bucket-sort expected-time lemma) is not opened this session** — citation-only, per `CHAPTER.md`'s own "numbers to verify" framing. This topic's bucket-sort expected-cost claim is instead verified directly by simulation in `examples.py` (uniform keys into buckets, the empty-bucket fraction compared to e⁻¹), not by the book's own proof.
4. **Graefe, "Implementing sorting in database systems" (ACM Computing Surveys 38(3), 2006) is named only**, as the survey the DuckDB post itself credits; this topic does not independently open or cite any specific claim from it.
5. **Knuth, TAOCP vol. 3 §5.2.5, is not opened**, per `CHAPTER.md`'s own instruction; no claim in this topic rests on it.
6. **This topic does not open the DuckDB documentation for the engine's current sort behavior.** Per `CHAPTER.md`'s own instruction, no claim about DuckDB's present-day implementation is made; the topic states only what the 2021 post and the 2023 paper, both dated, say, and says so explicitly.
