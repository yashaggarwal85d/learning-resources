---
id: dsa.simd-group-probing-tables
title: SIMD group-probing tables (Swiss Tables)
---

<section data-section="outcomes">

## After this topic you can

- Explain the forcing problem Swiss Tables solve and name the design (H1/H2 split, one control byte per slot) that solves it.
- Explain why one SIMD instruction can test many slots at once, and what makes most of them rejectable by one byte instead of the whole key.
- Name the three real languages/runtimes that converged on this design, as verified at research time.

</section>

<section data-section="internals">

## Into the internals

### Abseil's 16-wide groups vs. Go's 8-wide groups

The syllabus's own wording ("matching 16 slots per SIMD instruction") names Abseil's original group width, confirmed from Abseil's own design notes and its SSE-based code (128-bit registers, 16 one-byte lanes). But Go's own blog post, describing its 1.24 implementation, is explicit that Go "breaks the array into logical groups of 8 slots each." Both share the identical mechanism — one control byte per slot, a wide SIMD-style compare against a query's H2 fingerprint — at two different real widths. This topic names both numbers honestly rather than treating "16" as a universal constant of "the Swiss Table design," per `FACT-CHECK.md` row 6.

### The false-positive rate, measured and corrected

`examples.py`'s first draft asserted the fingerprint's false-positive rate should land near the flat theoretical odds of 1/128 "per group probed." Running it caught a real bug in that reasoning: a false positive is forced once per *occupied slot* a miss lookup has to check, not once per group — at this table's load factor (α = 0.5, ~8 occupied slots per group on average), the correct expectation is roughly 8/128 ≈ 0.0625, which is exactly where the measured rate (0.0616 over 20,000 trials) lands. The theoretical calculation in `examples.py` was fixed to multiply by the expected occupied-slot count, not loosened to force a pass.

</section>

<section data-section="lab">

## In the lab

The syllabus's §3.3 *Lab* bullet ("implement... SIMD-group tables; measure probe-length distributions and throughput vs load factor") is kept in reduced form here, per `CHAPTER.md`: `examples.py` builds a real group-probing table from scratch, measures the group-compare-vs-byte-scan cost asymmetry directly (including a dedicated worst-case demo on a packed group), and measures the 7-bit fingerprint's own false-positive rate over many lookups rather than asserting it from the bit count alone.

</section>

<section data-section="production">

## In production

All three adopters are real, current, and independently verified at research time: Abseil's `flat_hash_map` (the 2017 design, open-sourced in 2018); Rust's standard library `HashMap`, via the `hashbrown` crate, since Rust 1.36; and Go's built-in map, since Go 1.24 — confirmed from Go's own current blog post describing this year's release, not assumed from an older or remembered version of Go's map.

</section>

<section data-section="frontier">

## The frontier

The full capacity-and-growth mechanics of resizing a table like this one are this chapter's own next topic (20), not built here. Robin Hood hashing and cuckoo hashing are more elaborate probe-sequence designs with their own worst-case guarantees; both are marked *(skipped)* in this chapter's syllabus run and are named here with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- Why does a 7-bit fingerprint, not a 1-bit or a 32-bit one, turn out to be the right size?
- Go's built-in map splits into multiple independent tables rather than one big one. Why might that matter for a map under concurrent-ish use?

</section>

<section data-section="next">

## Where this goes next

Every scheme so far has worked inside a table of fixed size. None of them has yet said what happens when that table fills up. Next: resizing, and the two real ways to pay for it.

</section>
