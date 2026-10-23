# Sources — Size, alignment, and padding rules

## The Rust Reference — Type layout
URL: https://doc.rust-lang.org/reference/type-layout.html
Version: fetched 2026-10-23

> The alignment of a value specifies what addresses are valid to store the value at. A value of alignment n must only be stored at an address that is a multiple of n.

Alignment "must be at least 1, and always a power of 2":

> Alignment is measured in bytes, and must be at least 1, and always a power of 2.

> The size of a value is the offset in bytes between successive elements in an array with that item type including alignment padding. The size of a value is always a multiple of its alignment.

> All user-defined composite types (structs, enums, and unions) have a representation that specifies what the layout is for the type.

> The Rust representation is the default representation for nominal types without a repr attribute. Using this representation explicitly through a repr attribute is guaranteed to be the same as omitting the attribute entirely.

> The only data layout guarantees made by this representation are those required for soundness. These are:
>
> The offset of a field is divisible by that field's alignment.
>
> The alignment of the type is at least the maximum alignment of its fields.

> Type layout can be changed with each compilation. Instead of trying to document exactly what is done, we only document what is guaranteed today.

> The representation of a type can change the padding between fields, but does not change the layout of the fields themselves.

Contents:
- alignment definition and "always a power of 2"
- size is always a multiple of alignment
- `repr(Rust)` is the default, and explicit `repr(Rust)` == no attribute at all
- `repr(Rust)`'s only soundness guarantees: field offset divisible by its own alignment; type alignment at least the max field alignment
- layout "can be changed with each compilation" — explicitly not a stable, documented contract
- `repr` changes padding between fields, never the layout of the fields themselves
- `repr(C)` fixes field order to source order and the platform C ABI's rules (§repr(C) Structs)

## Rust std docs — `offset_of` in `std::mem`
URL: https://doc.rust-lang.org/std/mem/macro.offset_of.html
Version: std 1.99.1, stabilized 1.77.0

> Expands to the offset in bytes of a field from the beginning of the given type.

> Note that type layout is, in general, subject to change and platform-specific. If layout stability is required, consider using an explicit repr attribute.

> Rust guarantees that the offset of a given field within a given type will not change over the lifetime of the program. However, two different compilations of the same program may result in different layouts.

Contents:
- `offset_of!` returns a field's byte offset from the start of its type
- stabilized 1.77.0
- offsets are stable within one program's single run but not guaranteed stable across two separate compilations

## The Rust Unstable Book — `randomize-layout`
URL: https://doc.rust-lang.org/unstable-book/compiler-flags/randomize-layout.html
Version: fetched 2026-10-23

> The -Zrandomize-layout flag changes the layout algorithm for repr(Rust) types defined in the current crate from its normal optimization goals to pseudorandomly rearranging fields within the degrees of freedom provided by the largely unspecified default representation. This also affects type sizes and padding.

> It can be used to find unsafe code that accidentally relies on unspecified behavior.

> Randomization is not guaranteed to use a different permutation for each compilation session. -Zlayout-seed=<u64> can be used to supply additional entropy.

Contents:
- `-Zrandomize-layout` pseudorandomly rearranges `repr(Rust)` fields, changing size and padding too
- its purpose is exposing code that wrongly assumes a stable layout
- needs an explicit `-Zlayout-seed=<u64>` per run to guarantee a different permutation, since randomization alone isn't guaranteed to differ run to run — load-bearing for `examples.py`: two demonstration runs must pass different seeds, not rely on chance.
