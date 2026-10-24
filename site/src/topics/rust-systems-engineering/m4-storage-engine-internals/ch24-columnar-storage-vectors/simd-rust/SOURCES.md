# Sources — SIMD in Rust

## Rust Standard Library Docs: `std::arch`
URL: https://doc.rust-lang.org/std/arch/index.html
Fetched: 2026-10-24, cached at `sources/std-arch.txt`.
> This module exposes vendor-specific intrinsics that typically correspond to

> The CPU the program is currently running on supports the function being called. For example, it is unsafe to call an AVX2 function on a CPU that doesn’t actually support AVX2.

> First up we notice the is_x86_feature_detected! macro. Provided by the standard library, this macro will perform necessary runtime detection to determine whether the CPU the program is running on supports the specified feature.

> This function is decorated with the #[target_feature] attribute which enables a CPU feature for just this one function.

> And with all that we should have a working program! This program will run across all machines and it’ll use the optimized AVX2 implementation on machines where support is detected.

## Rust Standard Library Docs: `is_x86_feature_detected!`
URL: https://doc.rust-lang.org/std/macro.is_x86_feature_detected.html
Fetched: 2026-10-24, cached at `sources/is-x86-feature-detected.txt`.
> Check for the presence of a CPU feature at runtime.

> Runtime detection currently relies mostly on the cpuid instruction.
