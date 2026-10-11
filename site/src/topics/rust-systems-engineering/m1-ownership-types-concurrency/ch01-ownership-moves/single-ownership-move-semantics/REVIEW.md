# REVIEW: Single ownership and move semantics

## Content review (ROUTINE.md section 4)

- **Reviewer:** content review agent (Opus); wrote nothing in this topic.
- **Date:** 2026-10-11
- **Read, in order:** ROUTINE.md section 4; the Core Rules and Learning design sections of PROJECT_PLAN.md; syllabus 1.1 (this line and the three after it), 2.1, 2.2 and the Chapter 4 line; `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, the registry entry, `coverage.json`, `expert-list.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md` (claims and notes) and `examples.py`. There is no previous topic: this is the first topic of the domain, and the domain prerequisite is the Book through ch. 10.
- **Compiler checks:** rustc 1.97.0 (2d8144b78 2026-07-07), edition 2024, run in a scratch directory. These outputs are verbatim, as the reel shows them: E0382 (header, the three spans, the note, the help), E0505 (help `&batch.clone()[..4]`), the loop E0382 ("value moved here, in previous iteration of loop" / "inside of this loop"), E0184, E0373, and E0384 on reinitializing without `mut`. Step 11 prints `false` at opt-level 0, 1, 2 and 3. Each number the findings below rely on was measured the same way.
- **Counts:** 3 major, 19 minor.

### Part 1 · Flow

**1. Closures and `thread::spawn` used before they are taught, and one of them sits later in this syllabus** (major)
- Status: fixed — option (a): closures prerequisite (item 05, Book 13.1) added to prerequisites.mdx and `closures` to registry `declared`; thread example removed (Lab 4 row, Prove it 6, Deep dive Closures) in favour of a returned `impl Fn` closure and `let f = move || ...`, with one clause on why spawn needs `move` pointing at Chapter 2; examples.py asserts E0373 and E0382. OUTLINE.md records the change and reason.
- *Where:* `index.mdx` → "Where moves hide" → **Closures**; Prove it 6; the Lab 4 row for `thread::spawn(move || data.len())`.
- *What:* The topic uses `move` closures, the `Fn`/`FnMut`/`FnOnce` traits, E0373 and `thread::spawn` as if the reader knew them. Closures are Book ch. 13 and threads are Book ch. 16, both past the declared prerequisite (the Book through ch. 10). Why `thread::spawn` needs `move` (the closure "must outlive the scope", that is, `'static`) is what syllabus 2.2, "Borrows across thread and task boundaries", teaches. That is a prerequisite placed later in the same domain.
- *Evidence:* The registry entry's `declared` is `programming, rust-book-basics, stack-and-heap, references-and-borrowing, slices, structs-traits-generics`: it names no closures and no threads. `prerequisites.mdx` has no closures item. The Deep dive cites Book 13.1 as a source, which shows the text depends on it.
- *Fix:* Do not reorder the syllabus. Either (a) add a closures prerequisite (Book 13.1) to `prerequisites.mdx` and to `declared`, and swap the thread example for one that needs no threads, e.g. `fn len_fn() -> impl Fn() -> usize { let data = vec![1u8; 4]; move || data.len() }` (return-position `impl Trait` is Book 10.2); or (b) keep the thread example, but say in one clause that a spawned thread may outlive the caller, which is why the closure must own its captures ("Chapter 2, Borrows across thread and task boundaries"). Option (b) still needs the closures prerequisite declared.

**2. `Drop` is used in a reel step, but no prerequisite covers it** (minor)
- Status: fixed — step 9 body glosses `Drop`; prerequisite item 04 now says what Drop is and links Book 15.3.
- *Where:* step 9, "A file descriptor that is just an i32" (`impl Drop for Fd`); `prerequisites.mdx` item 04.
- *What:* `Drop` is Book ch. 15.3, after the prerequisite boundary, and the next topic (RAII) is where it is taught. Prerequisite item 04 says "The reel talks about `Copy`, `Clone` and `Drop` as traits", but the resources it links (Book ch. 5 and ch. 10) do not cover `Drop`.
- *Fix:* Add a short gloss to step 9's body: "`Drop` is the trait for a destructor, code that runs when the owner goes away; the next topic is about it". Also add Book 15.3 to prerequisite item 04, or drop "and `Drop`" from that sentence.

**3. The "hidden drop flag, next topic" promise is not backed by the next topic's syllabus line** (minor)
- Status: fixed — step 20 now points to this topic's Deep dive ("The borrow checker's view of a move"); the coverage.json expert item is placed there instead of the RAII topic.
- *Where:* step 20's explanation ("a hidden drop flag, next topic"); the `coverage.json` expert item on conditional moves, placed at the RAII topic with the quote "deterministic destruction".
- *What:* The next topic's line says nothing about drop flags. "Deterministic destruction" does not quote drop flags, so this placement is a stretch, and the reel makes a promise the next topic may not keep.
- *Fix:* Either point to this topic's own Deep dive, which already explains drop flags ("The borrow checker's view of a move"), and map the expert item there, or log in `syllabus/review-notes/` that the RAII topic must cover drop flags.

**4. Small pieces used without a word** (minor)
- Status: fixed — step 15 explanation and step 19 body say `&batch` coerces to `&[u8]`; step 18 says the `for` loop calls `into_iter` which takes the value; Lab 2 says to copy the harness as is (`unsafe` Ch.30, `Relaxed` Ch.7); `coerce` asserted in examples.py.
- *Where:* step 18 (`IntoIterator::into_iter`); steps 15 and 19 (passing `&batch` where `&[u8]` is expected); Lab 2 (`unsafe impl GlobalAlloc`, `Ordering::Relaxed`).
- *What:* `IntoIterator` is Book ch. 13.2. The reader is not told that `&Vec<u8>` turns into `&[u8]` (deref coercion, which Book 4.3 only names). `unsafe` is syllabus Ch.30 and atomics are Ch.7, both later in this domain.
- *Fix:* Add half a sentence each. Step 19: "`&batch` coerces to `&[u8]`". Lab 2: "Copy this harness as is; `unsafe` is Chapter 30 and `Relaxed` is Chapter 7." Step 18: "a `for` loop calls `into_iter` on what it loops over, which takes it by value".

**5. Step 16 lists the fixes in a different order on screen, in the narration and in the body** (minor)
- Status: fixed — step 16 body reordered to span order (Copy, borrow, use first).
- *Where:* `reel.tsx` step 16 body versus `ReadE0382` and narration step 16.
- *What:* The body lists "borrow at the move site, use the value before the move, or … make the type `Copy`". The scene chips and the narration follow span order: ① derive `Copy` (why), ② borrow (where), ③ use it first (the later use). The body breaks the "each span is a place to fix it" mapping it has just set up.
- *Fix:* Reorder the body to span order: Copy (for plain data only), borrow, use first.

**6. Step 12's body describes values the chooser does not show** (minor)
- Status: fixed — `Vec<u8> (1,000,000)` = 24 chip added to SizeChooser (why line: header only), narration step 12 gains the Vec line; bar width and sizes asserted in examples.py (E11).
- *Where:* step 12 body versus `SizeChooser`.
- *What:* The body leads with "a `Vec` with a million elements moves 24 bytes" and `Box<[u8]>` = 16. The chooser shows only arrays and `Box<[u8; 65536]>`, and the narration speaks about a 16-byte array. The most important contrast in the topic, a 1,000,000-element `Vec` that moves 24 bytes, is not on screen.
- *Fix:* Add a `Vec<u8> (1,000,000 elements)` → 24 chip (the "why" line: "header only; the 1,000,000 bytes stay on the heap"), and keep the narration in step with what is on screen.

### Part 2 · Gap hunt

**7. The Frontier leaves out the active work that challenges "Clone is the visible cost"** (major)
- Status: fixed — new Frontier bullet from fetched primary pages (nightly `UseCloned` and `Share` docs, 2025H2 and 2026 goal pages): as of 11 Oct 2026 everything is nightly-only; the 2026 goal (Accepted) chose `Share` + `move($expr)`, keeping ref counts visible; what stays true is stated. Quotes added to SOURCES.md and mapped in coverage.json. RFC 3680's own PR page was HTTP 403 through the proxy, noted in SOURCES.md and FACT-CHECK.md.
- *Where:* `index.mdx` → "The frontier" (two bullets: `Pin`, Polonius).
- *What:* RFC 3680 (`x.use` and `use ||` closures) and the nightly `UseCloned` trait (feature `ergonomic_clones`, tracking issue #132290) mark types whose clone is O(1) and allocation-free. The 2025H2 project goal "ergonomic ref-counting" proposed an alternative RFC that would make such lightweight clones *automatic*. Either outcome changes this topic's central rule that every non-`Copy` duplicate is spelled `.clone()`. Deep copies would stay explicit, but cheap clones might not.
- *Evidence:* the nightly docs for `std::clone::UseCloned`; rust-lang/rfcs PR 3680; the 2025H2 goal page (goals.rust-lang.org/2025h2/ergonomic-rc.html). A search found nothing dated 2026, so confirm the current status before writing.
- *Fix:* Add a Frontier bullet stating the status as of the verification date, and say what stays true: an implicit duplicate never allocates or deep-copies. Add the sources to `SOURCES.md` and `coverage.json` (source or expert item).

**8. No time or bandwidth number for the problem the topic is built around** (major)
- Status: fixed — Lab 5 and "In production" give the clone time (measured about 18 us here and 72 us on the review machine) with the 10,000 batches/s estimate; examples.py asserts only a loose bound (5 us to 2 ms) and the arithmetic; step 19 says "tens of microseconds" without a number.
- *Where:* steps 1, 10 and 19; Deep dive → "In production". Learning design layer 4 asks for "the numbers that matter … with back-of-envelope estimates".
- *What:* The cost of the clone is given only in allocations and bytes. A senior reader's first question is "how much time is that per batch, and does it matter at my rate?", and the topic never answers it.
- *Evidence:* Measured here: one `clone()` of a 1,000,000-byte `Vec<u8>` passed into a function costs about 72 µs per batch at `-C opt-level=3` (rustc 1.97, x86_64, 2,000 iterations, two runs: 74.3 and 72.1 µs). At 10,000 batches/s that is roughly 0.7 of a core spent on copying alone.
- *Fix:* Add a measured µs-per-clone figure to `examples.py`, stated as machine-dependent, or as a range checked against memcpy bandwidth (~10–20 GB/s). Show it in step 19 or in "In production", with the batches/s × size estimate.

**9. "Box caps it" leaves out that getting a value into a box is itself a move** (minor)
- Status: fixed — step 12 body, Deep dive ("A move is a bit copy") and In production say the first move into a Box can copy and overflow in debug; Lab 5 and examples.py assert overflow at opt 0 on a 2 MiB thread, success at opt 3, and the `into_boxed_slice().try_into()` alternative.
- *Where:* step 12; Deep dive Prove it 7; "In production" ("Box large values you pass around").
- *What:* `Box::new(x)` builds `x` first and then moves it into the heap, and in a debug build that passes through the stack.
- *Evidence:* Measured: `let b = Box::new([7u8; 16_000_000]);` aborts with "thread 'main' has overflowed its stack" at opt-level 0 and runs at opt-level 3.
- *Fix:* Add one line to step 12's body or to "In production": boxing caps the cost of later moves, but the first move into the box can still copy (and in debug can overflow the stack). For big buffers, allocate on the heap directly: `vec![0u8; n].into_boxed_slice()`, then `try_into()` for a fixed-size `Box<[u8; N]>`.

**10. Returning large values by value is not covered** (minor)
- Status: fixed — Deep dive sentence plus a measured same-address check in Lab 3 (examples.py `ret`, opt 0 and 3), stated as an observation, not a guarantee.
- *Where:* steps 11 and 12; Deep dive → "A move is a bit copy".
- *What:* The expert list says "passed **or returned** by value", but only passing is discussed. Large returns go through a slot the caller provides (no copy in the common case, but no guarantee either); this matters for builder-style APIs that return large structs.
- *Fix:* Add one sentence plus a measurement (asm or address check) in Lab 3, or record why it is out of scope.

**11. A source item is marked covered but is not taught: assigning to a live place drops the old value** (minor)
- Status: fixed — step 5 explanation and Deep dive now state that assigning to a live place drops the old value at once; examples.py `assign_live` / `assign_moved` execute both cases.
- *Where:* `coverage.json` → Book 4.1, "Scope and Assignment: assigning a new value drops the old one immediately" → step 5 and Deep dive "What a move is".
- *What:* Both places teach only the opposite case: assigning to a *deinitialized* place drops nothing. Nowhere does the topic say that `s = String::from("second");` on a live `s` drops `"first"` at once.
- *Fix:* Add the contrast clause to step 5's explanation ("had `s` still owned `first`, the assignment would drop it first"), or remap the item to the RAII topic, where it belongs naturally.

**12. The canonical M1 references are not used** (minor)
- Status: fixed — FLS ch. 15 (ownership, initialization, passing conventions) added with quotes to SOURCES.md, coverage.json and the Deep dive; Rust for Rustaceans not used because it is not freely available (recorded in SOURCES.md and coverage.json with an `out` reason).
- *Where:* `SOURCES.md`, `coverage.json` → `sources`.
- *What:* The syllabus names the FLS (the specification text the project adopted) and *Rust for Rustaceans* as M1 references. Neither appears: the FLS's ownership, initialization and passing-convention rules would be the normative anchor for "a move deinitializes the place", and *Rust for Rustaceans* ch. 1 covers ownership, moves and `Copy`.
- *Fix:* Add the relevant FLS sections (quoted) as a source with items mapped. Add *Rust for Rustaceans* ch. 1, or record why it was not used (not freely available).

**13. The two E0382 headers are never explained** (minor)
- Status: fixed — step 16 body and a Deep dive bullet ("The two E0382 headers") explain borrow of vs use of moved value; both headers were already asserted.
- *Where:* steps 16 and 18; Lab 4.
- *What:* Lab 4 shows both "borrow of moved value" and "use of moved value", and the reel shows each in a different step without saying why. The header names what the *later* use does: `batch.len()` borrows through autoref; `ship(batch)` in the next loop iteration moves again.
- *Fix:* Add one sentence to step 16's body or to the Deep dive.

**14. Gaps around signature contracts** (minor)
- Status: fixed — step 15 explanation covers `&Vec<u8>` and why `&[u8]`; Deep dive "Signatures in practice" covers a generic `T` instantiated as `&U` and `Into<String>`/`AsRef`, with `Cow` deferred to Zero-copy parsing; asserted in examples.py (`accepts`, `vec_ref`).
- *Where:* steps 13 and 15.
- *What:* (a) Step 15 does not offer `&Vec<u8>`, the most common real-world mistake, and never says why `&[u8]` is better: it accepts arrays, `Box<[u8]>` and sub-slices, and it removes a layer of indirection (Clippy's `ptr_arg`). (b) "`T` takes" has a generic exception: a `T` parameter can be instantiated as `&U`, so a generic function that takes `T` may only be borrowing. (c) Flexible-ownership signatures (`impl Into<String>`, `AsRef<[u8]>`) are how APIs avoid forcing a clone; this is worth one line, with `Cow` left to 2.2.
- *Fix:* Add `&Vec<u8>` as an option or to the explanation, and add (b) and (c) to the Deep dive.

**15. "In production" has misconceptions but no real incidents** (minor)
- Status: not fixed as asked, by design — no public post-mortem with a verifiable primary page was found in the time available, and none is invented. In production now cites the Perf Book (secondary) for the same cost class and says no incident is cited; recorded in coverage.json `gapReview.notes`.
- *Where:* Deep dive → "In production". Learning design layer 7 asks for "incidents and post-mortems".
- *Fix:* Add one documented, sourced case: a public write-up of a Rust hot path fixed by removing clones or boxing a large move. If no citable one exists, say so in `coverage.json`. Do not make one up.

**Coverage placements checked:** each `topic` placement in `coverage.json` quotes text that really appears in that topic's syllabus line:
- "deterministic destruction" (RAII)
- "many `&T` or exactly one `&mut T`" and "Reborrowing" (Aliasing XOR mutability)
- "`Rc` for a single-threaded refcount" and "`Arc` for an atomic refcount" (Box, Rc, and Arc ownership shapes)
- "idioms for moving out of a", "cannot partially move out of a type that implements `Drop`" and "Pattern matching" (Partial moves)
- "non-lexical lifetimes" (NLL limits)
- "Self-referential structs" (Zero-copy parsing)

The quotes leave out the backticks, which is harmless. Only the drop-flag placement (finding 3) and the Book 4.1 assignment item (finding 11) are not really covered. All 8 syllabus clauses are covered in the reel, and all 25 items of `expert-list.json` are placed.

### Part 3 · Expert reader

**16. "`.clone()` allocates once" is wrong for a `Vec` of owning elements** (minor)
- Status: fixed — outcome 1 rewritten (Vec<u8>/String once, Vec<T> clones every element, 1 + n); step 10 says "clones every element"; `e16` asserts 4 allocations for a 3-String Vec.
- *Where:* `index.mdx` outcome 1 ("`.clone()` of a non-empty `Vec` or `String` allocates once and copies its elements"); step 10 ("allocates a new buffer and copies every element").
- *Evidence:* Measured with a counting allocator: cloning a 3-element `Vec<String>` makes **4** allocations. `Vec::clone` *clones* each element, and the cost is recursive.
- *Fix:* Change the outcome to "of a `Vec<u8>` or `String` allocates once; a `Vec<T>` clones every element, so a `Vec<String>` costs 1 + n allocations". In step 10, change "copies every element" to "clones every element".

**17. "`String + &str` … reuses its buffer" overstates it** (minor)
- Status: fixed — step 14 and Deep dive Operators now say it appends into the left operand's allocation, growing it if needed; narration matches; `e17` runs it (pointer change is allocator-dependent, so not asserted).
- *Where:* step 14; Deep dive → "Where moves hide" → Operators.
- *What:* `+` reuses the left operand's *allocation* and grows it with a reallocation when capacity runs out, which can move the buffer.
- *Evidence:* Measured: `String::from("hello")` followed by an unrelated allocation, then `s + &"x".repeat(4096)`: the pointer changes (`same ptr false`). The Lab 2 row measures only the favourable `with_capacity(16)` case.
- *Fix:* "consumes the left side and appends into its allocation (growing it if needed); it never builds a second string".

**18. `&mut` exclusivity alone does not rule out data races** (minor)
- Status: fixed — step 13 now says "which, with `Send` and `Sync` (Chapter 6), is how Rust rules out data races".
- *Where:* step 13 ("which is what rules out data races at compile time").
- *What:* Across threads, data-race freedom also needs `Send`/`Sync` (Ch.6) and, for shared mutation, interior mutability that is safe across threads. Exclusivity is necessary but not sufficient.
- *Fix:* "…which, with `Send` and `Sync` (Chapter 6), is how Rust rules out data races at compile time".

**19. "`Copy` marks types whose bits are the whole value" mixes up *can be* and *is*** (minor)
- Status: fixed — step 8 first sentence rewritten as opt-in; step 9 explanation and Deep dive add the plain-bits handle without `Drop` point; `opt_in` asserts a struct of numbers is move-only.
- *Where:* step 8 body and narration ("Those can be Copy" is right; the body's first sentence is not).
- *What:* `Copy` is opt-in: a struct of plain numbers is move-only until you derive it. And plain bits can still stand for unique ownership of something outside the value, such as an fd number, a slot index or a capability token, even with no `Drop`. Such a type should usually *not* be `Copy`, which is exactly the RAII topic's point.
- *Fix:* Change the first sentence to "`Copy` is the opt-in for types whose bits are the whole value: primitives are `Copy`, and your own struct is once you derive it". Add a clause to step 9 or the Deep dive about handles without `Drop`.

**20. Prove it 3's "best" answer is open to argument** (minor)
- Status: fixed — Prove it 3 and step 22 use `Point3 { x, y, z: f32 }` (will not grow); the `&Config` caveat stays as one sentence and is asserted (`cfg_ref`).
- *Where:* step 22 (`Config { retries, timeout_ms, batch }`).
- *What:* A config struct is the classic type that later grows a `String` (an endpoint or a path). The step's own caveat ("if `Config` might gain a `String`… take `&Config`") applies to most real configs, yet `&Config` is not an option. A sceptical senior engineer would pick it.
- *Fix:* Either use a type that clearly will not grow (e.g. `Rgb { r, g, b }` or a `Point3`), or add `fn process(cfg: &Config)` as an option and make the explanation weigh the two openly.

**21. "A 16-byte pointer plus length" is ambiguous** (minor)
- Status: fixed — step 12 body says "16 bytes: an 8-byte pointer and an 8-byte length".
- *Where:* step 12 body.
- *What:* It reads as a 16-byte pointer plus a length.
- *Fix:* "16 bytes: an 8-byte pointer and an 8-byte length".

**22. Narration wording** (minor)
- Status: fixed — narration steps 10, 14 and 23 reworded as suggested (steps 12 and 14 also updated for findings 6 and 17); no audio exists yet, so nothing is stale.
- *Where:* `narration.json` steps 10, 14 and 23.
- *What:* Step 10's "to vec, to owned and to string" and step 14's "Push string takes…", "Into bytes takes self" are three method names in a row, said as if they were words; a listener cannot tell they are methods. The recap line "And the two errors: why, where and the use... or end the borrow first" is hard to follow aloud, and the "or" makes it sound like two alternatives, not two different errors. Elsewhere the narration is plain, speakable English and matches the screen, apart from findings 5 and 6.
- *Fix:* Step 10: "…and for its cousins, the to-vec, to-owned and to-string methods…". Step 14: "The length method borrows. The push-string method borrows mutably. Into-bytes takes the string itself." Recap: "For the use-after-move error, read why, where, and the later use. For the move-while-borrowed error, end the borrow first."
