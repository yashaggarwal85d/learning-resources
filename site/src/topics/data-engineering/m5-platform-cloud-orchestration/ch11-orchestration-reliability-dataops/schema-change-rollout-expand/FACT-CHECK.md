# Fact-check

1. **BACKWARD compatibility means consumers using the new schema can read data produced with the last schema.** Sourced and reproduced directly: `examples.py` asserts Confluent's own Schema Registry documentation states this, verified word for word against the fetched page text.

2. **FORWARD compatibility means data produced with a new schema can be read by consumers using the last schema.** Sourced and reproduced directly: `examples.py` asserts Confluent's own documentation states this, verified word for word against the fetched page text.

3. **FULL compatibility means schemas are both backward and forward compatible.** Sourced and reproduced directly: `examples.py` asserts Confluent's own documentation states this, verified word for word against the fetched page text.

4. **Parallel change (expand and contract) breaks a backward-incompatible interface change into three distinct phases: expand, migrate, and contract.** Sourced and reproduced directly: `examples.py` asserts Martin Fowler's bliki states this, verified word for word against the fetched page text (after normalizing spacing the source's own markup inserts around punctuation).

5. **Writing to both a source and a target as two separate transactions risks a failure between the two writes, leaving them inconsistent.** Sourced and reproduced directly, paraphrased from Google Cloud's own "Database migration: Concepts and principles" documentation, verified by fetching the page directly: "two database writes are two separate transactions; you might encounter a failure after the first finishes and before the second finishes."

6. **A real toy compatibility checker confirms expanding the shop's orders schema (adding total_amount alongside amount, with a default) passes backward, forward and full compatibility.** Run and reproduced directly, this topic's own experiment: `examples.py` applies real `backward_compatible`/`forward_compatible`/`full_compatible` functions to the real `orders_v1` and `orders_v2_expand` schema objects and asserts all three pass.

7. **Contracting straight from the expand schema -- skipping migrate -- fails forward compatibility, before any real consumer is involved.** Run and reproduced directly: `examples.py` applies the same compatibility functions to the expand and contract schema objects and asserts backward passes while forward genuinely fails, because a reader still expecting `amount` can no longer find it.

8. **A premature contract, run while one consumer genuinely hasn't migrated, raises a real KeyError naming exactly that consumer, with every migrated consumer unaffected.** Run and reproduced directly: `examples.py` ticks three consumers through a dual-write simulation, migrates two, leaves one behind, attempts a contract-shaped record against the laggard, and asserts a real `KeyError` is raised and caught -- while the two migrated consumers, tested separately, raise nothing.

9. **A measured dual-write window can be checked against a bound rather than left open-ended.** Run and reproduced directly: `examples.py` counts the real number of ticks the dual-write phase ran and asserts it is within `MAX_DUAL_WRITE_WINDOW_TICKS`.

10. **Dual-read windows, CI contract-enforcement gates, and CDC schema evolution's own version of expand/migrate/contract are this topic's own framing of CHAPTER.md's stated scope, not independently sourced claims demonstrated live here.** Dual-read is the read-side mirror of the sourced dual-write risk, not separately sourced; the CI gate and CDC evolution are later topics in this chapter and in Chapter 8 respectively, used here only by reference (not re-taught), consistent with CHAPTER.md's own "coordinated with" framing for this clause.
