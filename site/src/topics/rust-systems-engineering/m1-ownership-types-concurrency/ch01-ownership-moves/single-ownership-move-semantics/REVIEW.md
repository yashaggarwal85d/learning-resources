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

## Looks and learning review (DESIGN.md, "The looks review checks")

- **Reviewer:** looks and learning review agent (Opus); wrote nothing in this topic.
- **Date:** 2026-10-11
- **Read:** DESIGN.md; OUTLINE.md (shared visual vocabulary, the 23 storyboards, Changes after final); `narration.json`; `reel.tsx` (captions); `scenes.tsx` where a frame needed explaining; the 46 final-frame captures `site/test-results/{desktop,phone}-single-ownership-move-semantics-01..23.png` (desktop 1440 × 900, phone iPhone 13).
- **Counts:** 6 major, 15 minor.
- **What already works:** no step uses more than two accents, and the colour meaning holds across the reel (caramel = live owner, taupe dashed = moved-out, cherry = cost or error). Nothing reaches the desktop side rail. Every step looks like part of the site. Steps 4, 6, 7, 17 and 20 are strong: each makes its point at a glance at both sizes.
- **Caveat on the captures:** `site/tests/reels.mjs` takes the screenshot 250 ms after the option click, but reveals fade in over 0.45 s with staggered delays. So the desktop reveals of steps 2, 5, 9 and 15 were caught mid-fade (finding 1), and `phone-…-01.png` actually shows step 2. Findings about reveals are judged on whichever size shows the finished frame.

### Findings

**1. The captures miss phone step 1 and catch several reveals mid-fade** (minor)
- *Step / size:* 1 phone; 2, 5, 9, 15 desktop (also 15 phone).
- *What:* `phone-…-01.png` shows step 2 answered (two progress segments filled), so step 1 was never captured at phone size and is not reviewed here. Some desktop reveals are still fading in: on step 2 the `24 bytes copied` / `0 heap bytes copied` lines are missing and a faint arrow still runs from the moved-out `s1`; on step 5 `t: "first"` and `prints: second first` are at about 30% opacity; step 9's fd/copy/descriptor picture is almost invisible; step 15's C and D chips are missing (D is missing on phone too). The captures don't show the full reveal.
- *Fix:* This is a test-harness change, outside this topic: wait for the reveal to finish (about 0.45 s + 0.15 s × groups, so roughly 1 s) before the screenshot, and press nothing on phone step 1 that can advance the step. Then recapture this topic and re-check step 1 on phone, where a 7-line code panel sits above a 262-high drawing.
- Status: not fixed — shared harness (`site/tests/reels.mjs` is out of scope). Mitigated in the topic: reveals now fade in 0.15 s with at most 0.1 s delay, so desktop captures 02, 05, 09 and 15 show the complete reveal; `phone-…-01.png` still shows step 2 because of the harness.

**2. Step 1: the card's numbers carry no meaning** (minor)
- *Step / size:* 1, desktop.
- *What:* Both cards show `● | 1,000,000 | 1,000,000` with no `ptr · len · cap` legend and no `24 B`, and the storyboard's `MAIN'S FRAME` and `HEAP` labels are gone. A first-time viewer sees two identical numbers in three boxes and can't tell that the card is a header and the bar is the heap. Step 2 adds the legend one step too late for the picture that opens the reel.
- *Fix:* Add the 13-unit taupe legend `ptr · len · cap` above the first card (or the `HEAP` label above the bars) as step 2 does. It costs one label, and the frame stays under four.
- Status: fixed — the `ptr · len · cap` legend sits over the first card (13 units, taupe); checked on desktop 01 (phone 01 is not captured, see finding 1).

**3. Phone predict reveals: the caption slides under the drawing and gets cut, and on step 2 it repeats** (major)
- *Step / size:* 2, 9, 11 phone.
- *What:* After an answer the caption column scrolls up behind the visual. On step 2, `24 bytes copied` / `0 heap bytes copied` sit on top of the caption's first line, which is cut in half, and the same caption paragraph then appears three times in a row (both captures, 01 and 02). On step 9 the title "…that is just an i32" is cut in half under `descriptor`. On step 11 the kicker `11/23 · §1.1` is sliced through. Text that is clipped or overlapped fails the checklist, and the repeated paragraph looks broken whether it is real or a render artifact.
- *Fix:* Check step 2 on a real phone first. For this topic: shorten the three long explanations (step 9: move the "even without a `Drop`…" sentence to the Deep dive; step 11: keep three sentences; step 2: drop the parenthesis about the optimiser), so the reveal fits without the caption scrolling under the visual. Log the scroll-under and repeat behaviour for the player in QUALITY.md.
- Status: partly fixed — explanations of steps 2, 9 and 11 shortened (2: parenthesis dropped; 9: the plain-bits sentence is Deep dive only, question body shortened; 11: three sentences). Not fixed: the caption column still scrolls under the drawing on phone after an answer, and the step 2 caption still repeats; both are the shared player and are logged in QUALITY.md row 36.

**4. Steps 3 and 6: small contrast and spacing problems in good steps** (minor)
- *Step / size:* 3 both; 6 phone.
- *What:* Step 3: the cherry burst circle (opacity 0.6) sits right on `double free` and on the freed `l l` cells, so cherry text lands on a cherry fill. The two `}` glyphs float at the right with no label, and the storyboard's vertical scope line is missing. Step 6 on phone: the two C++ output lines and `destructors: 2` stack with almost no gap, so the counter crowds the second output line.
- *Fix:* Step 3: put the burst behind the buffer only, dropping it to about 0.35 or ending it once the label lands, and turn `}` into the planned scope marker with `}` as its label, or drop it. Step 6: add 8 units between the output lines and the counter.
- Status: fixed — step 3 burst is behind the buffer only and at 0.35 opacity, and each `}` is now a scope line with `}` as its label; step 6 counter moved 8 units down (and the drawing is taller).

**5. Step 5: line labels point at code the phone has hidden, and the question names the wrong line** (minor)
- *Step / size:* 5, phone (reveal); caption at both sizes.
- *What:* The portrait reveal hides `reinit.rs`, but the boxes are still labelled `line 1`, `line 2`, `line 3`, so a phone learner can't see what line 2 did. The caption asks "What happens on line 3?", but every option and the answer are about what line 4 prints.
- *Fix:* Label the boxes with the statements (`let mut s = …`, `let t = s;`, `s = …`), 13 units, which fit at 150 units each in short form. Change the caption to "Does this compile, and what does it print?"
- Status: fixed — boxes are labelled `let mut s = …`, `let t = s;`, `s = …` (checked on phone 05), and the question reads "Does this compile, and what does it print?".

**6. Step 7: the language and the code run together, and three rows say the same thing** (minor)
- *Step / size:* 7, both.
- *What:* The LINE column reads `Python b = a`, `Go b := a`, `C++ b = move(a)`, with the language and the code in one colour and the storyboard's padding lost. Python, Java and Go are three identical `shared / usable, alias` rows, so half the grid repeats itself before the eye reaches Rust.
- *Fix:* Put the language in latte and the code in crema, or give each its own column. Optionally fold the three alias languages into one `Python / Java / Go` row (the footnote already sorts Go and Java), which gives four rows and a faster path to the Rust row.
- Status: partly fixed — language in latte, code in crema. Not done: folding Python, Java and Go into one row, because the title promises six meanings and the six rows are those six.

**7. Step 8: too many labels compete, and the accent is spread over nine chips** (minor)
- *Step / size:* 8, both.
- *What:* The final frame has a demo line, two value boxes, three rule lines in full-weight crema, two bin titles, two sublabels and 11 chips. The three rules float between the demo and the bins, tied to nothing; `&T is Copy; &mut T never is` doesn't point at the `&String` and `&mut String` chips. With every Copy chip outlined in caramel, the accent marks a category instead of "the thing to look at". The sieve idea (chips falling by one test) is also gone from the still frame, which is just two boxes.
- *Fix:* Make the rules quiet (taupe, 13 units) or move them into the caption. Put the one test, "owns anything beyond its bytes?", above the bins as the single caramel label. Outline the chips in mocha, and use caramel only for the two reference chips with a thin line to the `&T / &mut T` rule.
- Status: partly fixed — rules are quiet taupe 13-unit lines, the single caramel label "owns anything beyond its bytes?" sits above the bins, chips are mocha and only `&String` and `&mut String` are caramel. Not drawn: the thin line from those chips to the `&T` rule (it would cross both bins).

**8. Step 12: the step's point, "Box caps it", is not what the final frame shows** (major)
- *Step / size:* 12, both.
- *What:* The default selection is `[u8; 4096]`, so the paused frame lights up the least surprising row and reads "the whole array is copied". `Box<[u8; 65536]>` (8) and `Vec<u8> (1,000,000)` (24) are mocha like the arrays. On a log scale their bars are a fifth and a third of the longest bar, so "tiny, however big the contents" doesn't come across. The title's claim and the topic's central contrast (a million bytes owned, 24 moved) are not visible at a glance. `(1,000,000)` doesn't say elements or bytes.
- *Fix:* Default to `Vec<u8>` (or `Box`), and give its explanation line ("header only; the 1,000,000 bytes stay on the heap"). Draw what each type owns as a faint dashed heap bar beside the inline bar (65,536 for Box, 1,000,000 for Vec) so the gap between inline and owned is the picture. Label the row `Vec<u8> (1,000,000 bytes)`.
- Status: fixed — default is `Vec<u8> (1,000,000 bytes)`, Box and Vec rows draw a dashed `owns 65,536` / `owns 1,000,000` bar on a log scale (denominator 20); `examples.py` bar-width assertion updated.

**9. Step 13: in the final frame, borrow, exclusive borrow and hand back look the same** (major)
- *Step / size:* 13, both.
- *What:* In the end state (confirmed in `Contracts`), lanes 2, 3 and 4 all show the `batch` token in the caller box and an empty callee box. The ghost `&`/`&mut` tokens exist only in flight, `no other access` shows only while the borrow is out, and the only trace of the mutation is a token 12 units wider. A paused or reduced-motion learner sees four signatures and three identical pictures, so the caption's contrast between `&T` (many at once), `&mut T` (exclusive) and `-> T` (hands back) is missing from the still frame. With eight caramel items (four tokens, four verdicts), nothing stands out.
- *Fix:* Leave a trace in each lane's final state: lane 1 an arrow caller → ship; lane 2 two latte `&` outlines parked at the callee with a two-way arrow; lane 3 one thick `&mut` outline with `no other access` kept (taupe) under the caller; lane 4 an arrow make → caller with the token labelled `new`. Put the verdicts in crema and keep caramel for the tokens.
- Status: fixed — lane 1 keeps an arrow to `ship`, lane 2 two parked `&` with a two-way arrow, lane 3 a thick `&mut` and `no other access` in taupe, lane 4 an arrow back with the token labelled `new`; verdicts are crema.

**10. Step 14: the drawing still says "reuses its buffer"** (minor)
- *Step / size:* 14, both.
- *What:* The bottom line reads `String + &str also consumes the left side and reuses its buffer`. That is the overstated wording content-review finding 17 fixed in the caption and narration ("appends into its allocation, growing it if needed"), and the Svg `label` says "reuses" too. The verdicts `reads` / `mutates` / `consumes` also sit on their own lines halfway between the signatures, so `mutates` reads as belonging to either neighbour. And after the morph only `v: Vec<u8>` is left, so the paused frame never shows that this was a `String`.
- *Fix:* Change the line to `String + &str also consumes the left side (appends in place, may grow)`, and the label to match. Put each verdict on its signature's baseline, right-aligned. Keep a taupe dashed ghost `s: String (moved-out)` beside `v`.
- Status: fixed — line and Svg label now say "appends in place, may grow" / "returns a Vec on the same buffer"; verdicts sit on their signature's baseline; a dashed `s: String` ghost stays beside `v`.

**11. Step 15: the drawing repeats the four buttons, and on phone it is the smallest text in the reel** (minor)
- *Step / size:* 15, both (phone for size).
- *What:* Before the answer, the visual is the four option strings typed out again, so it adds nothing to the buttons beside it. On phone the 14-unit signature text and 13-unit chips render near the 9 px floor, and the A/C/D chips (`exclusive for no reason` in taupe) are low-contrast.
- *Fix:* Show what the job needs instead: a caller timeline `checksum(batch)` → `batch.len()` afterwards, with the batch card. On reveal, mark each signature's effect on that timeline (A: card goes dashed, C: card locked, D: card leaves and comes back, B: the `&` borrow returns). If the cards stay, drop the setup lines (the caption has them) so the drawing can scale up, and put the wrong-option chips in latte.
- Status: fixed — the drawing is now the caller's timeline (`batch` card, `checksum(batch)`, `batch.len()`) and, after the answer, one row per option with a card glyph for its effect (dashed, borrowed, locked, out and back); signatures stay on the buttons only; wrong options are latte.

**12. Step 16: a wall of diagnostic text; the fixes, which are the payoff, are crammed at the bottom** (minor)
- *Step / size:* 16, both.
- *What:* About 19 text lines: the header, 3 source lines, 3 labels, a 5-line note, a 2-line help line, 3 chips and `clone: last resort`. The note is as bright as the spans. The three chips almost touch (about 8 units apart), and on phone `clone: last resort` sits right on the caption kicker `16/23`.
- *Fix:* Dim the note and its label to taupe, and drop the `at Vec<u8>: this parameter takes ownership of the value` sub-label (the caption covers it). Space the chips by 12 units, and leave at least 16 units under `clone: last resort`. Markers ①②③ stay the point.
- Status: fixed — note and its label are taupe, the sub-label is gone, chips are 12 units apart and `clone: last resort` has 26 units below it.

**13. Step 17: the borrow bar is far from its code, and the move dot is hard to see** (minor)
- *Step / size:* 17, desktop mostly.
- *What:* The bar sits at x 555, about 330 px to the right of the code on desktop, tied to lines 7–9 only by height. The rejected move is a small dark-cherry dot on a caramel bar, with no label.
- *Fix:* Move both bars into the gutter beside the line numbers (around x 40, shifting the code right), make the bad move a cherry ring with r 11, and add a 13-unit `move` label to both markers.
- Status: fixed — both bars are in the gutter, the rejected move is a cherry ring (r 11) and both markers carry a 13-unit `move` label; code shifted right.

**14. Step 18: the reveal loses the batch and stacks marks on top of each other** (major)
- *Step / size:* 18, both.
- *What:* `LoopMove` hides the token once answered (`!ans && <Token…>`), so the reveal never shows the batch that moved: the `ship` box at tick 1 is empty. The `ship` box (y 12–40) sits on the ellipse's top edge, so the line runs through it. The tick label `2` (x 446) falls inside the dashed slot (x 391–451) and under the cherry burst. The loop has no direction, so "a path that comes back" isn't drawn. The final frame doesn't teach the step on its own.
- *Fix:* Keep the `batch` token inside the `ship` box at tick 1 and move the box above the ellipse (y ≤ 0, and h 270 if needed). Move the `2` label outside the slot, and add a small arrowhead on the ellipse from 1 to 2. Label the empty slot `lap 2: batch already moved` in cherryText, or keep the rustc label and point it at the slot.
- Status: fixed — the `batch` token stays in the `ship` box, which moved above the loop; arrowhead on the ellipse; the `2` label is outside the slot; `lap 2: batch gone` labels the empty slot (the rustc label stays below).

**15. Step 19: the strike reads as an underline, and the worked example drops the picture it promised to close** (minor)
- *Step / size:* 19, both.
- *What:* The cherry strike is drawn at the digits' baseline and cuts through the commas of `1,000,000`, so it reads as an underline. The step echoes step 1's counters but not its picture (the card, the buffer and the cherry stamp), so the reel's own glyph doesn't come back for the payoff. Six repeated `ALLOCATIONS` / `BYTES COPIED` labels compete.
- *Fix:* Raise the strike to the middle of the digits' height (about y 82). Draw step 1's card and buffer once at the top with the cherry stamp fading out, and below it a `&` borrow arrow (fix A) and a slide (fix B). Or make the counters a 3-row table with one header.
- Status: fixed — strike raised to mid-digit height; the card-and-buffer motif returns beside each of the three counter blocks (cherry stamp fading, `&` borrow arrow, slide). The six `ALLOCATIONS` / `BYTES COPIED` labels remain.

**16. Phone: the bottom of the drawing touches the caption kicker** (minor)
- *Step / size:* 12, 16, 20 phone.
- *What:* The chip row on step 12, `clone: last resort` on step 16 and `maybe moved = moved` on step 20 each end 3–10 CSS px above `NN/23 · §1.1`, so the drawing and the caption read as one block.
- *Fix:* Leave at least 16 units of empty space at the bottom of these drawings (raise `h` or shift the content up). On step 12, put the chip row before the caption with a top margin.
- Status: fixed — at least 16 units of space under the chips on 12 (margins on the chip row), 16 and 20 (taller drawings), and one more unit of room on 6.

**17. Step 22: the reveal is three lines of text, one of them about a type that isn't on screen** (minor)
- *Step / size:* 22, both.
- *What:* `size_of::<Point3>() = 12`, `plain bits → Copy` and `a config that may grow a String? take &Config`. There is no picture, and `Config` is left over from before the Point3 change, a type the learner has not seen in this step.
- *Fix:* Reuse step 8's bins: a `Point3` chip drops into the Copy bin, next to a 12-byte bit row (three 4-byte cells). Keep the caution in the caption only, or reword it to "a struct that may grow a String? take &T".
- Status: fixed — reuses step 8's bin with a `Point3` chip and three 4-byte cells; `&Config` is gone from the drawing (the caption keeps it as a caution about config structs); narration says "a point"; `examples.py` asserts the 4-byte float.

**18. Step 23: the wrapped rows break on a separator, and the lane glyph looks like a menu icon** (minor)
- *Step / size:* 23, both.
- *What:* Rows 5 and 6 wrap with a dangling `·` at the end of the first line (`&T borrows ·`, `E0382: why, where, use ·`), even on desktop where there is room. The "four tiny lane arrows" glyph is drawn as four plain lines, which reads as a hamburger menu.
- *Fix:* Wrap before the separator and drop it at line ends (or split row 6 into `E0382: why · where · use` / `E0505: end the borrow first`). Draw the glyph as four short arrows of different kinds (→, ⇄, ⇄ thick, ←), echoing step 13.
- Status: fixed — rows wrap before the separator (`E0382: why · where · use` / `E0505: end the borrow first`); the glyph is four arrows (→, ⇄, thick ⇄, ←).

**19. Desktop: on long predict steps the kicker and title run into the top nav** (major)
- *Step / size:* 9, 11, 15 desktop.
- *What:* After an answer the left column (title, question, options, explanation box) is taller than the viewport, so it moves up. On step 9 `9/23 · §1.1 · SINGLE OWNERSHIP AND MOVE` runs under the nav pill. On step 11 the kicker is cut off at the top edge. On step 15 `SINGLE OWNERSHI` is cut by the nav. The overflow comes from the explanation plus the options: step 9's explanation is 94 words, step 11's 121, and step 15's 88 with options that wrap to three lines. Step 22 (103 words, short options) only just fits, with its kicker at y 82.
- *Fix:* Bring each explanation to 75 words or fewer, or 60 where the options wrap. Step 9: move the plain-bit handle sentence to the Deep dive. Step 11: drop the "never keep a raw pointer" sentence (the Deep dive has it). Step 15: move the `&[u8]` versus `&Vec<u8>` paragraph to the Deep dive. Also log in QUALITY.md that the player should keep the kicker clear of the nav when the column overflows.
- Status: fixed — explanations of steps 9, 11, 15 and 22 cut to 75 words or fewer (15 to about 60); desktop captures 9, 11 and 15 now keep the kicker clear of the nav. The player-side rule is logged in QUALITY.md row 36.

**20. Pacing: the topic's own idea disappears after step 6, and the same table comes back five times** (major)
- *Step / size:* reel-wide, both.
- *What:* The 24-byte card and the buffer it points to, the visual vocabulary OUTLINE.md builds once "to reuse in every step", appear in steps 1–3, 6 and 14 only. From step 7 on the reel is mostly tables and text: an ALLOCATIONS / HEAP BYTES grid showing 0 / 1 / 1,000,000 appears in steps 4, 10, 19 and 21 (and as counters in 1), so step 10 repeats step 4 with one row added, and its own new point, "search for `.clone()` and its cousins", is not pictured. Steps 14–17 are four text-dominated frames in a row (signatures, signatures, a diagnostic, a diagnostic), the reel's densest stretch, including its two longest durations (6.4 s, 6.0 s). Steps 20–22 end on three predict reveals, two of which are text only. Nothing is broken, but the middle and end feel the same, and the glyph that would make them memorable is left unused.
- *Fix:* Bring the card and buffer back where the concept is a move or a clone. Step 10: show a code listing with `.clone()`, `to_vec()` and `to_owned()` lighting up as the only lines that stamp a cherry buffer, which replaces the second table. Step 19: see finding 15. Step 21: a → b slides, `b.clone()` stamps a cherry buffer, c → d slides, ending on `total: 1 allocation`. Step 22: see finding 17. This also breaks up the 14–17 run, because step 15 changes per finding 11.
- Status: partly fixed — step 10 now shows the listing where `.clone()`, `to_vec()` and `to_owned()` each stamp a cherry buffer (new execution in `examples.py`), step 21 is a → b slide, `b.clone()` stamp, c → d slide, `total: 1 allocation`, and steps 19 and 22 bring the card and buffer back; step 15 changed per finding 11. Not done: re-planning steps 14 to 17 (order and durations), out of scope for a fix batch; recorded in OUTLINE.md.

**21. Captions match their pictures, with two exceptions** (minor)
- *Step / size:* 14, 22 (both).
- *What:* Elsewhere each caption names what the drawing shows, and the narration follows the screen. The two mismatches are finding 10 (the `+` line versus the corrected caption) and finding 17 (`&Config` versus Point3). Step 1's caption promises "two fixes that copy nothing", and step 19 delivers them, which is good.
- *Fix:* Covered by findings 10 and 17. Re-run this check after those edits.
- Status: fixed — covered by findings 10 and 17; re-checked on the new captures, the `+` line and the Point3 step now match their captions.
