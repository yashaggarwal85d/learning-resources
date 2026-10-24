# Outline: SIMD in Rust (`rust.simd-rust`)

Chapter 24, topic 65 (fourth and last, closes Chapter 24 and Milestone 4). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real explicit AVX2 SIMD kernel, checking the real CPU's own feature support at runtime via `is_x86_feature_detected!` before ever calling it, with a clearly labeled scalar-only fallback if the feature is genuinely absent.
2. Measure that the explicit kernel produces the exact identical result as a plain scalar loop, on the identical column.
3. Measure that, when the kernel genuinely runs, it processes far fewer vector operations than the scalar loop processes scalar operations.
4. Measure that the vector-operation count matches the real lane-width arithmetic exactly, not approximately.
5. State, from the Rust standard library's own documentation on `std::arch` and `is_x86_feature_detected!`, the real safety contract runtime feature detection exists to uphold.

## Changes from the chapter plan

None. All claims are measured directly against a real scalar loop and a real, explicit `std::arch` AVX2 kernel, gated behind a genuine runtime feature check; nothing here needs root access or real file I/O, and the container's own real CPU genuinely supports AVX2, so the explicit kernel path runs for real rather than only exercising the fallback.

## Reel steps (storyboard)

1. **"Build an explicit AVX2 kernel, summing eight values at a time instead of one. Before ever calling it, check the real CPU's own feature support at runtime. Does the real CPU here genuinely support AVX2?"** (predict, hook) — `fig`: the runtime feature check, `is_x86_feature_detected!`. Options: no, the kernel always falls back to the scalar path / yes, genuinely, the real CPU supports it (correct) / only if the binary was compiled with a special flag.
2. **"Measured: the real CPU here genuinely supports AVX2, detected at runtime, so the explicit kernel ran for real"** — `fig`: the real, measured detection result. NO takeaway (this is the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; the point — the kernel is only ever called once the real CPU's own support is actually checked, never assumed — is stated directly in the step's own body instead).
3. **"Run the explicit SIMD kernel and the plain scalar loop on the identical column. Does the kernel produce the exact identical sum as the scalar loop?"** (predict) — `fig`: both paths' own final sums, side by side. Options: no, summing eight lanes at a time changes the total slightly / yes, genuinely, the exact identical sum (correct) / only if the column's own length happens to divide evenly by eight.
4. **"Measured: the exact identical sum, from both the explicit SIMD kernel and the plain scalar loop"** — `fig`: the real, measured identical sums. Takeaway: "An explicit SIMD kernel changes how many values one instruction touches, never the real answer it computes."
5. **"Now measure vector operations instead: does the SIMD kernel genuinely process far fewer of them than the scalar loop processes scalar operations, on the identical column?"** (predict) — `fig`: the real, measured operation counts. Options: no, both process the same real number of operations / yes, genuinely, far fewer in the SIMD kernel (correct) / only if the column's own values happen to repeat.
6. **"Measured: far fewer vector operations in the SIMD kernel, matching the real lane width exactly"** — `fig`: the real, measured operation counts, and the exact match. Takeaway: "The real cut a SIMD kernel buys isn't a rough estimate; it follows exactly from how many lanes one real instruction holds."
7. **"The Rust standard library's own documentation states why that runtime check has to come first, in its own words. Does it name calling an AVX2 function on a CPU that genuinely lacks AVX2 as unsafe?"** (predict) — `fig`: the standard library's own words on the safety contract, shown directly. Options: no, calling it anyway is merely slower, never unsafe / yes, genuinely; it names that call directly as unsafe (correct) / only when the function also reads uninitialized memory.
8. **"Measured, in the Rust standard library's own words: it is unsafe to call an AVX2 function on a CPU that doesn't actually support AVX2"** — `fig`: the standard library's own words, shown directly. Takeaway: "The runtime feature check isn't a performance nicety; it's the real safety contract an explicit SIMD kernel depends on."
9. **"The standard library's own documentation also names exactly what that runtime check itself relies on: does it state that runtime detection currently relies mostly on the cpuid instruction?"** — `fig`: the standard library's own words on how the check itself works, shown directly. NO new predict (continues directly from step seven's own question, to the real mechanism this topic's own `is_x86_feature_detected!` call relies on). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — an explicit SIMD kernel, called only once the real CPU's own support is checked at runtime, computes the exact identical answer as its scalar equivalent while processing far fewer real operations, by exactly the real lane width, and that runtime check is the genuine safety contract making any of it sound to call at all.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (the standard library's own stated safety contract; step 9 continues from it directly, with no new predict, to the standard library's own name for the detection mechanism itself).
- Surprising fact: step 9 (the real mechanism, `cpuid`, this topic's own runtime check genuinely relies on).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| this module exposes vendor-specific intrinsics that typically correspond to a single machine instruction | Rust Standard Library Docs: `std::arch` (quoted) |
| it is unsafe to call an AVX2 function on a CPU that doesn't actually support AVX2 | Rust Standard Library Docs: `std::arch` (quoted) |
| the `is_x86_feature_detected!` macro performs runtime detection to determine whether the CPU the program is running on supports the specified feature | Rust Standard Library Docs: `std::arch` (quoted) |
| the `#[target_feature]` attribute enables a CPU feature for just one function | Rust Standard Library Docs: `std::arch` (quoted) |
| a program using this pattern runs across all machines and uses the optimized AVX2 implementation on machines where support is detected | Rust Standard Library Docs: `std::arch` (quoted) |
| `is_x86_feature_detected!` checks for the presence of a CPU feature at runtime | Rust Standard Library Docs: `is_x86_feature_detected!` (quoted) |
| runtime detection currently relies mostly on the cpuid instruction | Rust Standard Library Docs: `is_x86_feature_detected!` (quoted) |
| the explicit SIMD kernel produces the exact identical result as a plain scalar loop, on the identical column | `examples/runtime-demo/src/simd_autovectorization_verification.rs` (executed, measured) |
| the explicit SIMD kernel, when it genuinely runs, processes far fewer vector operations than the scalar loop processes scalar operations | `examples/runtime-demo/src/simd_autovectorization_verification.rs` (executed, measured) |
| the vector-operation count matches the real lane-width arithmetic exactly | `examples/runtime-demo/src/simd_autovectorization_verification.rs` (executed, measured) |

## Concept ledger

- `introduces`: `simd-autovectorization-verification` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `vectorized-vs-compiled-execution-tradeoff` (topic 64)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "Vectorized execution already cuts the per-row overhead a naive loop pays by working through a batch at a time; it says nothing yet about how much further a single CPU instruction can push that same batch, by working on several of its values at once."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured what a single machine's own layout and execution choices cost, in real, measured bytes touched and real, measured throughput; the next milestone turns to what happens once that single machine's own data is replicated across several machines that can fail independently, and what an acknowledgement from one of them is actually allowed to promise."
