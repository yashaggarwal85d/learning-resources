# Outline — de.iceberg-v3-spec-features

1. **Hook.** Both delete mechanisms from the last topic are v2 features. v3 is a whole version
   bump — most of it, this chapter has already quietly met, one feature at a time.
2. **Predict.** Deletion vectors, row lineage, and Variant were each taught separately, in earlier
   topics, as if they were just one idea at a time. What actually ties them together as one thing?
3. **Reveal.** They're all one coherent version bump: v3, adding deletion vectors (already built),
   row lineage (already built), Variant (already built) — and five more features named here.
4. **Reveal.** v3 also adds: geometry and geography types, nanosecond-precision timestamps, the
   `unknown` type, column default values, multi-argument transforms, and table encryption keys.
   Takeaway.
5. **Predict.** A v2-only reader opens a table that now has a required column filled in by a v3
   default value. What does it actually do: read it correctly, silently get it wrong, or fail?
6. **Reveal — reproduced for real.** Measured: an optional column's default reads back correctly
   even through this sandbox's own v2-format table — old rows get the default, new rows get their
   own value. A required field's default is the one case that genuinely fails an old reader.
   Takeaway.
7. **Reveal — reproduced for real.** And writing an actual v3 table is attempted directly here: it
   fails outright, with this library's own real, open, named error. v3 is read about and partly
   borrowed from here — not fully written yet, even in this sandbox.
8. **Reveal.** That gap is the real story: a real, dated engine's own v3 announcement lists exactly
   three features as supported today — deletion vectors, row lineage, Variant — and says nothing
   about the other five.
9. **Reveal.** Engine support lag, not the spec itself, is what actually gates adopting v3 today.
   Takeaway.
10. **Recap.**

Ten steps, two predicts (steps 2 and 5), three takeaways (steps 4, 6, 9 — none on step 3, the reel
test's "from" step).
