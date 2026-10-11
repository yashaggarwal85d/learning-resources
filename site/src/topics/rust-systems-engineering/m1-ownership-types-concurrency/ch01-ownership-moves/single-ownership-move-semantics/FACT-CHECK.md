# FACT-CHECK: Single ownership and move semantics

Adversarial check of `OUTLINE.md` (claims list, reel steps with predict options, examples, Deep dive) against the fetched primary texts in `sources/*.txt` and against the compiler.

- **Date:** 2026-10-11.
- **Toolchain used:** rustc 1.97.0 (2d8144b78 2026-07-07), edition 2024, x86_64-unknown-linux-gnu; g++ 13.3.0 and clang++ for the C++ program. Current stable is 1.99 (std docs quoted are 1.99.0); diagnostics were checked on 1.97 only (see open items).
- **Quote check:** a script compared every `>` quote in `SOURCES.md` (183 after edits) and every quoted fragment in the claims list (about 100) with the fetched text, ignoring whitespace and quote style. All appear verbatim. Context was then read by hand for the quotes that carry weight. Three quotes are verbatim but support something other than what they were cited for (claims 12, 39, 45); they were replaced.
- **Behaviour check:** every compiler or runtime claim, every predict answer and every wrong option was compiled and run in `/tmp` scratch programs at `-C opt-level=0` and `3` where relevant.

## Per-claim verdicts

V = verified (quote in fetched text, in context, supports the claim). M = verified by running it on rustc 1.97. C = corrected (wording changed in OUTLINE.md).

| # | Verdict | Source checked | Notes |
|---|---|---|---|
| 1 | V | book-ownership.txt | Three ownership rules, verbatim. |
| 2 | V | String docs (1.99) | "three components" and "always stored on the heap" are in the representation section. |
| 3 | V | Book 4.1 | |
| 4 | V | Book 4.1 | |
| 5 | V | Book 4.1 | |
| 6 | V | CWE-415 (4.20) | "memory management data structures may become corrupted". |
| 7 | V+M | size_of docs; run | `size_of::<String>()` = `size_of::<Vec<u8>>()` = 24. |
| 8 | V | Book 4.1 | Only about *implicit* copies. Step 10 and 21 wording tightened (C) because explicit deep copies are also spelled `to_vec`/`to_owned`/`to_string`, not just `.clone()`. |
| 9 | M | run, opt 0 and 3 | Same heap pointer, len/cap 1,000,000, header address differs, 0 allocations; clone 1 / 1,000,000. Step 4 caption said the header went "into ship's stack frame": **C**. On x86_64 a by-value argument this large is passed as a pointer to a copy *the caller* makes (measured), so the caption now says "to a new address". |
| 10 | V | std::pin | "assignment or passing a value into a function" in context. |
| 11 | V | Reference, expressions | |
| 12 | **C** | Reference, destructors | "// Uninitialized does not drop." is about an uninitialized variable leaving scope, not about assignment. Replaced with "// No destructor run on assignment." (the example assigns to a declared-but-uninitialized `moved`). Added to SOURCES.md. |
| 13 | M | run | Prints `second first`. Edge case added to the step 5 explanation (C): without `let mut`, reassigning is E0384. |
| 14 | V | [forward] | |
| 15 | V | [string.cons], [lib.types.movedfrom] | "In the second form" refers to `basic_string(basic_string&&)`. |
| 16 | V+M | [class.dtor] 14.3; g++ and clang++ | Output `a.data is null: 1`, `destructor (data owned)`, `destructor (data null)`; zero warnings under `-Wall -Wextra -Werror`. Step 6 drawing labelled the hand-written `Buf`'s moved-from `a` "valid but unspecified": **C**. That rule covers standard-library types, and `Buf`'s state is fully specified (`data == nullptr`), so the label is now `moved-from, still alive`. |
| 17 | V | [string.cons] | |
| 18 | V | Python 3.15.0 copy docs | |
| 19 | V | JLS SE 25 §4.3.1 | Applies to reference types only. The step 7 footnote now says so (C). |
| 20 | V | Go spec | Applies to slices. Already footnoted. |
| 21 | V | Copy docs | "sometimes optimized away" is what the corrected step 11 now builds on. |
| 22 | V | Copy docs | |
| 23 | V | Copy docs | |
| 24 | V+M | Book 4.1; run | `is_copy` compiles for i32, f64, bool, char, [u8; 4], (u8, char, f64), &String. It fails with E0277 "the trait bound `X: Copy` is not satisfied" for String, Vec<u8>, Box<u8> and &mut String. |
| 25 | V | Copy docs; primitive reference docs | |
| 26 | V+M | Copy docs, E0184 docs, Book | Exact 1.97 text: "error[E0184]: the trait `Copy` cannot be implemented for this type; the type has a destructor" and the label "`Copy` not allowed on types with destructors". Wrong option "Only if Clone is written by hand" is still E0184. |
| 27 | V | Copy docs | |
| 28 | V | Clone docs; Book | |
| 29 | V, **C** (pointer) | Clone docs | Step 10 sent this "later in this chapter". The syllabus teaches Rc/Arc cost in **Ch.4** "Box, Rc, and Arc ownership shapes", so the footnote, caption, Deep dive and expert-list item 7 now point there. |
| 30 | M | run | (0,0), (0,0), (1, 1,000,000). |
| 31 | **C** | run + asm | See "Main correction" below. |
| 32 | V | Perf Book (secondary) | It describes *how* a copy is emitted. The Lab 3 note now adds "(when they are copied at all)". |
| 33 | V | Book 15.1 | |
| 34 | V+M, **C** | size_of docs; run | Step 12 said moving a Box "copies 8 bytes whatever `T` is". That is false for unsized `T`: `Box<[u8]>`, `Box<str>` and `Box<dyn Fn()>` are 16 bytes (measured). It now says "for a sized `T`", with an aside. The Deep dive says the same for `&T`. E11 asserts `Box<[u8]>` = 16. |
| 35 | V | Book 4.1 | Supports the new step 13 aside: a `Copy` argument is copied, not taken. |
| 36 | V | Book 4.2 | |
| 37 | V+M | Book 4.2; run | E0502 for the exclusivity snippet. Step 13 caption (C): `&T` access is "normally read-only (interior mutability, Ch.4, is the exception)". |
| 38 | V | Book 5.3 | |
| 39 | **C** (quote) + M | String docs | "pub fn len(&self) -> usize" on the page belongs to `str::len` (Methods from Deref). `String::len` is `pub const fn len(&self) -> usize` (const since 1.87). Quote fixed in SOURCES.md and the claims list. Step 14 notes that it shows signatures without `pub const`. Measured: `into_bytes` keeps the same pointer with 0 allocations. |
| 40 | V+M | String docs; run | `with_capacity(16)` + "hello" + " world": same pointer, 0 allocations, len 11, cap 16. |
| 41 | V | Book 4.2 | |
| 42 | V | E0382 docs | |
| 43 | **C** + M | run | Step 16 drew `note: this parameter takes ownership of the value`, which rustc never prints as a note. The 1.97 note is "note: consider changing this parameter type in function `ship` to borrow instead if owning the value isn't necessary". "this parameter takes ownership of the value" is the span label under `Vec<u8>`. Drawing, caption, real-values line and E2 asserts updated. All other spans, labels and help lines are verbatim (batch.rs, loop.rs, p1.rs, cfg). |
| 44 | V+M | E0505 docs; run | Header and labels verbatim. rustc also prints `binding \`batch\` declared here` on line 6; the drawing omits it on purpose, which is now noted and asserted. The help suggests `&batch.clone()[..4]`, a clone *at the borrow*, so the caption's "copying 1,000,000 bytes to keep 4" is right. The suggestion is now quoted and asserted. The reordered fix prints `[7, 7, 7, 7]` / `1000000`; copy-out does 0 allocations. |
| 45 | V, **C** (scope) | RFC 2094; Book 4.2 | "A borrow lasts until its last use" fails for a borrow held by a value with `Drop`. Measured: `Guard<'a>(&'a [u8])` with `Drop` gives E0505 "borrow might be used here, when `g` is dropped". The step 17 caption now says "A plain reference's borrow…". A supporting RFC quote was added to SOURCES.md. |
| 46 | V | RFC 2094 | |
| 47 | V+M | Reference, loop-expr; run | forin.rs note and `&v` help verbatim. |
| 48 | M | run | loop.rs labels verbatim; clone per lap = 3 / 3,000,000. |
| 49 | V+M | Nomicon drop flags; run | p1.rs fails with E0382; it compiles without the `println!`. Step 20 explanation reworded for precision (C). |
| 50 | M | run | (1, 1,000,000) for line 1 and for lines 2–4. Note: `vec![0u8; n]` goes through `alloc_zeroed`. The harness must not override it without counting it; a note was added. |
| 51 | V | Copy docs | |
| 52 | M | run | 12 bytes. The loop compiles with `derive(Clone, Copy)`; without it, E0382 "use of moved value: `cfg`" with "in previous iteration of loop". |
| 53 | V | Reference, expressions | Edge check: `let s = *b; println!("{b}")` is E0382, and `*b = …` reinitialises (measured `x y`). Consistent with the list. |
| 54 | V+M | Reference, array-expr; E0507 docs; run | "error[E0507]: cannot move out of index of `Vec<String>`" verbatim; `swap_remove` keeps the same pointer with 0 allocations. |
| 55 | V+M, **C** | keyword move; Book 13.1; E0507; run | "`move` captures by value (needed for `thread::spawn`)" was too strong. A closure whose body consumes a capture takes it by value without `move` (measured), and a `Copy` capture stays usable (measured `6 5`). `move` is needed when the body only borrows; without it, E0373 (measured). The FnOnce error is E0382 "use of moved value: `consume`", and "closure cannot be invoked more than once…" is its *note*. Deep dive and E20 updated. |
| 56 | V | Clone docs | |
| 57 | V | Nomicon ownership | |
| 58 | V | std::alloc | |
| 59 | V | E0382 docs | |

## Main correction: step 11, "Is a move always cheap?"

The outline said that in an optimised build "a function that just passes a `Big` on compiles to a `memcpy` of 4,096 bytes". **False on rustc 1.97.**

- `pub fn pass_plain(b: Big) -> u8 { consume(b) }` at `-C opt-level=3` compiles to a single `jmpq` to `consume`, with no copy. At `-C opt-level=0` it has a `memcpy` with `$4096`.
- The `memcpy` in E10's `pass_on` survives only because `black_box(b)` lets the value's address escape.
- Step 11's program prints `false` at opt 0, 1, 2 and 3. The address is taken before the move, which forces a real second location. This is observed behaviour, not a guarantee.

What changed:

- **Step 11:** the explanation, the reveal label and the narration answer were rewritten, and the reveal's frame boxes were renamed. They were `MAIN'S FRAME`/`TAKE'S FRAME`; the argument copy actually sits in the caller's frame on x86_64 (measured), so they are now `b IN MAIN`/`take'S PARAMETER`.
- **E10:** now asserts both the opt-0 `memcpy` and the opt-3 elision of `pass_plain`, and still checks `pass_on`.
- **Elsewhere:** Lab 3 is now "Find the memcpy (and watch it vanish)". The production bullet and claim 31 were reworded to match.
- **"Up to" hedges:** learning outcome 1, step 2, step 12 and step 21 now say "up to" / "at most" / "the optimiser may skip" where they described the cost of a move. The Copy docs' "sometimes optimized away" covers this.

## Other corrections made in OUTLINE.md

- **Step 7 footnote:** the rows hold only for particular kinds of `a`. It now reads `Go: a slice · Java: an object · C++, Rust: a heap string`. A Java `int` is copied, and a short SSO `std::string` is copied on a move, not stolen.
- **Frontier:** "no way to make a type immovable except pinning" became "no type is immovable by itself: a value is kept in place by putting it behind a pointer and pinning it (`Pin`, for `!Unpin` types)". Supported by the std::pin docs.
- **Production:** a moved value's address "changes" became "can change".
- **Step 13 caption:** `T` "drops it, stores it or passes it on". For a `Copy` `T` the caller keeps its value.

## Predict questions: answers and wrong options (all on rustc 1.97)

| Step | Correct answer | Wrong options | Result |
|---|---|---|---|
| 2 | Holds | All three are wrong models | Measured: same heap pointer, 0 allocations; the 8-byte option ignores len/cap. |
| 5 | Holds | All three fail | Prints `second first`. |
| 9 | Holds | All three fail | E0184; a hand-written Clone is still E0184. |
| 11 | Holds as measured | "0: prints true" is the wrong *model* | Hedged: the opt-3 result is an observation, not a guarantee. |
| 15 | Holds | A fails with E0382; C and D compile | B, C and D compile and run. |
| 18 | Holds | No other option compiles | Verbatim labels. |
| 20 | Holds | No other option compiles | E0382 whatever the arguments. |
| 21 | Holds | 2/3 allocations are not the result | Measured. |
| 22 | Holds | Clone/Rc/&mut all work less well | E0382 without Copy; compiles with it; 12 bytes. |

## Red-team cases tried that need no change

- Arrays of `String` move as a whole (E0382 on a later use).
- Two-phase borrow `v.push(v.len())` compiles. Not claimed here; it belongs in Ch.2.
- A `&mut` reference moves; annotating the type reborrows (prints `abc`).
- E0382 is the same for assignment, call, loop and `for`.
- The C++ use of `a` after `std::move` compiles with no warning under g++ `-Wall -Wextra -Werror`.
- The 24-byte header lands at a new address with and without `#[inline(never)]` at opt 0 and 3. This is an observation, and Lab 1 now says so.

## Open items

1. **Diagnostics are checked on 1.97 only.** Stable is 1.99. CI pins 1.97.0, so the asserts hold. Re-check the E0382 note text and the E0505 `binding … declared here` label before bumping the pin; these strings have changed between releases before.
2. **The step 11 measurement can change with the compiler.** The opt-3 `false` and the `pass_plain` elision depend on LLVM. If a future rustc prints `true` or keeps the copy, update the label and explanation; the claim stays "nothing guarantees either".
3. **Step 16 drawing needs a layout check.** The note is longer now (two lines plus a label) and help moved to y 398/414. The builder should check it fits above the fix chips at y 430 on a phone.
4. **Python 3.15.0 docs version.** It is the version the fetched page reports. Fine as of 2026-10-11; no action.
