Last verified: 2026-11-03.

- Kuiper, "Fastest Table Sort in the West – Redesigning DuckDB's Sort" (duckdb.org, 27 August 2021) — the multi-column byte-encoding example this topic reworks by hand. [source](https://duckdb.org/2021/08/27/external-sorting.html)
- Kuiper & Mühleisen, "These Rows Are Made for Sorting and That's Just What We'll Do" (ICDE 2023) — the fuller, later account of DuckDB's own row-sorting approach, linked directly from the 2021 post. [source](https://hannes.muehleisen.org/publications/ICDE2023-sorting.pdf)
- McIlroy, Bostic & McIlroy, "Engineering Radix Sort" (*Computing Systems* 6(1), Winter 1993) — the paper that names American flag sort and describes its cycle-leader in-place permutation. [source](https://static.usenix.org/publications/compsystems/1993/win_mcilroy.pdf)
- Sedgewick & Wayne, *Algorithms*, 4th ed., booksite §5.1 "String Sorts" — an independent confirmation of American flag sort's name and mechanism, used because the 1993 paper's own code listings are OCR-damaged in the fetched PDF text. [source](https://algs4.cs.princeton.edu/51radix/)
- Herf, "Radix Tricks" (stereopsis.com) — the IEEE 754 float order-preserving bit-flip transform this topic reproduces exactly. [source](https://stereopsis.com/radix.html)

CLRS 4th ed. chapter 8 (counting, radix and bucket sort, and its bucket-sort expected-cost lemma), Graefe's 2006 survey, Knuth *TAOCP* vol. 3 section 5.2.5, and the IEEE 754-2019 standard itself are citation-only this session (paywalled or named-only, per `CHAPTER.md`'s own "to verify"/"not opened" framing). The bucket-sort expected-cost claim is instead verified directly by simulation in `examples.py`; the IEEE 754 bit-flip rule is corroborated by a second, independently documented source (a Rust crate's own documentation, read at research time).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=counting-radix-bucket-sort:%20).
