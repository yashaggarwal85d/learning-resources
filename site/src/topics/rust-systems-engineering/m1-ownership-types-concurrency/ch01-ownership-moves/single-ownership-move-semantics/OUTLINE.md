# OUTLINE: Single ownership and move semantics (`rust.single-ownership-move-semantics`)

Content plan and storyboard (ROUTINE.md 2.2). The builder follows this file exactly; a change of plan is made here first, with the reason.

- **Domain:** Rust Systems Engineering. **Milestone 1** Ownership, Types, and Concurrency Primitives. **Chapter 1** Ownership and Moves, **section 1.1** Ownership as resource topology. Kind: **full**. First topic of the domain, so it has no previous topic.
- **Syllabus line (verbatim):** "**Single ownership and move semantics** — one live owner is responsible for destruction. A move is a shallow bitwise copy that statically invalidates the source binding, with no implicit deep copy; `Copy` vs `Clone` marks where the cost is. Signatures act as ownership contracts (`T` takes, `&T` borrows, `&mut T` borrows exclusively, returning `T` hands ownership back). Reading E0382 (use after move) and E0505 (move while borrowed)."
- **Next topic:** "RAII, drop order, and leak safety" (drop order of locals, fields and temporaries, Rust 2024 temporary scopes, an RAII wrapper for an OS resource, `mem::forget`/`ManuallyDrop`, why leaking is safe). **Do not teach any of it here**: no drop order, no temporaries, no `forget`, no RAII wrapper design. We may say *that* a value is dropped exactly once by its owner, and *that* conditional moves compile (the run-time drop flag is named once and handed off).
- **Also later, do not teach:** partial moves / `mem::take` / `mem::replace` / `Option::take` / binding modes ("Partial moves and destructuring as transfer"); `Rc`/`Arc` design ("Ownership topology over shared mutability"); reborrowing, two-phase borrows, lifetimes ("Aliasing XOR mutability", "Lifetimes as constraints" in Ch.2); `Pin` (async material).
- **Audience:** senior engineers from C/C++/Go/Java/Python who have read the Book through ch. 10. No syntax teaching. Contrasts with other languages appear only in steps 6 and 7 and only with the sourced statements listed in the claims.
- **Toolchain facts used on screen:** measured with **rustc 1.97.0, edition 2024, x86_64-unknown-linux-gnu** (the local toolchain; std docs quoted are 1.99.0). Sizes are for a 64-bit target; `String`'s layout is not a language guarantee (size_of docs), so the reel always says "on a 64-bit target" next to 24.

---

## Learning outcomes ("After this topic you can")

1. Predict, for any assignment, call, return or loop, whether a value is **moved, copied or must be cloned**, and what each costs in bytes copied and heap allocations (a move is a bitwise copy of `size_of::<T>()` bytes, which the optimiser may shrink or remove, and allocates nothing; `.clone()` of a non-empty `Vec`/`String` allocates once and copies its elements).
2. Explain at the memory level what a move copies (the 24-byte `ptr/len/cap` header of a `String`/`Vec`) and what it never copies (the heap buffer), why the source must become unusable (otherwise two owners free twice), and how this differs from C++ `std::move` and from Go/Java/Python reference sharing.
3. Read a function or method **signature as an ownership contract**: `T`/`self` takes, `&T`/`&self` borrows, `&mut T`/`&mut self` borrows exclusively, `-> T` hands ownership back; and choose the right one for an API.
4. Read **E0382** and **E0505** span by span (why it moved, where, the later use; or the live borrow around the move) and fix them without cloning: borrow at the move site, move the last use before the move, return ownership, derive `Copy` for plain data, clone last.

---

## Bridge and handoff

- **Registry `bridge`** (shown on step 1): "Rust Systems Engineering starts here. You've read the Book through chapter 10; now ownership becomes a design tool, starting with its smallest unit: one value, one owner, one destruction."
- **Registry `handoff`** (end card, and said in step 23): "One owner decides who destroys a value. Next: exactly when that happens: drop order, temporaries, and why leaking memory is still safe."

---

## Shared visual vocabulary (build once at the top of `scenes.tsx`, reuse in every step)

The topic's own idea: **the 24-byte card and the buffer it points to.** A move slides the card; the buffer never moves; the old slot becomes a dashed outline. A clone stamps a second buffer in cherry and ticks an allocation counter. Every memory step reuses these glyphs so the learner reads them instantly.

Use `C`, `Svg`, `T`, `Stack`, `Bar` from `site/src/reels/kit.tsx`, `Code` from `site/src/reels/Code.tsx`, helpers from `anim.ts`. Do not copy kit code into the topic (the Python refresher's local copies are the old pattern; use the kit).

- **`Card` (a String/Vec header):** rounded rect 180 × 46 (rx 10), three cells of 60 each separated by 1-unit `C.mocha` lines, cell text 14 units `C.crema`: `ptr` cell shows a dot (r 5, `C.caramel`) that the arrow starts from, `len` cell the length, `cap` cell the capacity. Binding name above the card's left edge, 15 units `C.crema` weight 600 (e.g. `s1`). Optional small `24 B` 13 units `C.taupe` right-aligned above the card's right edge.
  - **live** state: stroke `C.caramel` 2.5, fill `C.roast`.
  - **moved-out** state: stroke `C.taupe` dashed `6 5`, fill none, whole group opacity 0.55, cell texts hidden, label `moved-out` 13 units `C.taupe` under the card. No arrow from a moved-out card.
- **`Buf` (heap buffer):** for short strings, a row of byte cells 30 × 34 (stroke `C.latte` 1.5, fill `C.espresso`) with the characters in 15 units `C.crema`; for big buffers a single bar 260 × 30 (fill `C.cocoa`, stroke `C.latte`) with `1,000,000 bytes` centered in 14 units `C.crema`. A small `HEAP` label 13 units `C.taupe` uppercase above the first buffer in a step.
  - **freed** state: stroke `C.taupe` dashed, fill none.
  - **clone stamp:** a second buffer with stroke `C.cherry` 2 and fill `C.cherry` at opacity 0.25; its label in `C.cherryText`.
- **`Arrow`:** straight or one-elbow path from the ptr dot to the buffer's top-left, stroke `C.latte` 2, a small triangular head. Arrows appear by moving their endpoint (lerp of coordinates) or by opacity; never by stroke-dash animation (DESIGN: position, scale, opacity only).
- **`FrameBox` (a stack frame):** rounded rect stroke `C.mocha` 1.5, no fill, label at top-left 13 units `C.taupe` uppercase (`MAIN'S FRAME`, `SHIP'S FRAME`).
- **`Counter`:** a label (13 units `C.taupe` uppercase) above a value (20 units, `C.crema` for 0, `C.cherryText` for a cost > 0), value counts up from 0 with `easeOut` and `fmt()`.
- **Colour meaning across the whole reel:** `caramel` = the live owner / the thing to look at; `taupe` dashed = moved-out (deinitialized); `cherry` (fills) / `cherryText` (text) = a cost or an error (extra allocation, double free, compile error); `latte` = arrows and secondary labels; `crema` = values. At most two accents per step (caramel + cherry).
- **Predict steps:** the clock stops at `duration`, so a reveal can't be timed. The question frame animates in `duration`; the reveal (when `answer !== null`) is a complete still frame. Reveal groups may fade in with a CSS opacity transition (`style={{ transition: 'opacity .45s', transitionDelay: '…' }}`), staggered by 0.15 s; nothing else depends on it. On portrait, when the reveal needs the space, hide the code panel (`portrait && answered`), as the Python refresher does.
- **Text in drawings:** 13 units minimum; 15–17 for values; one 20+ number per step. Code lines on screen ≤ 40 characters wherever possible (the `Code` panel shrinks its font to the longest line; the diagnostic panels in steps 16–17 are the exception and are drawn in SVG, not `Code`). Keep content out of the right 64 px on desktop.
- **Every snippet on screen is compiled verbatim by `examples.py`**, so every number in it is in `examples.py` too (the build's number check). Where a snippet shows only the body of `main`, `examples.py` wraps exactly those lines in `fn main() { … }` and adds nothing between them.

---

## The reel: 23 steps

Layers: 1 the problem (step 1), 2 predict-first (steps 2, 5, 9, 11, 15, 18), 3 mechanism (steps 2–14, 16–17), 4 trade-offs and numbers (steps 4, 10–12, 19), worked example solved (step 19), Prove it (steps 20–22), recap with handoff (step 23). About 18 minutes (`minutes: 18`).

Titles below are exact. Write each in `reel.tsx` as a 6-space-indented `title: '…',` line (the build parses that form); titles contain no apostrophes, so single quotes are safe.

---

### Step 1 — `It compiled after one .clone()`  (the problem; `duration: 4.6`)

- **Visual idea:** the cost that the compiler's suggestion quietly added, made visible: one batch, one stamped duplicate, one allocation per batch. It clicks because the learner sees a correct-looking program paying for a copy it never needed, and wants to know why Rust forced the choice.
- **On screen, portrait:** `Stack`: `Code` panel titled `ingest.rs` (top), `Svg h={240} fill` below.
  - Code (exact, 7 lines):
    ```
    fn ship(batch: Vec<u8>) -> usize {
        batch.len()
    }

    let batch = vec![7u8; 1_000_000];
    let sent = ship(batch.clone());
    println!("{sent} {}", batch.len());
    ```
    `highlight={[5]}` (the clone line) once typed.
  - Drawing (600 × 240): `MAIN'S FRAME` box x 20–300, y 20–120 holding `Card` `batch` at (50, 50) with len `1,000,000`, cap `1,000,000`; `Buf` bar `1,000,000 bytes` at (40, 170) with `HEAP` label above; `Arrow` card → bar. On the right (x 330–580): the clone stamp: a second card `clone` at (370, 50) and a cherry `Buf` bar at (330, 150) labelled `1,000,000 bytes` in `cherryText`, arrow between. Two `Counter`s side by side at the bottom right: label baseline y 200, value baseline y 226, at x 340 (`ALLOCATIONS`, value `1`) and x 470 (`BYTES COPIED`, value `1,000,000`). Move the original `Buf` up to y 150 as well so both bars share a row and the counters sit clear of them. In this step both bars are 240 wide (original x 40–280, clone x 330–570) so nothing reaches the right rail.
- **Landscape:** same structure; the code panel is wider so its font is larger; drawing `h={240}` unchanged.
- **Beats:** 0–1.1 s code types (`end={1.1}`). 1.2 s original card + bar + arrow fade in (0.4 s). 2.0 s the clone card slides from the original card's position to (370, 50) (`easeOutBack`, 0.6 s); 2.6 s the cherry bar scales in from x-scale 0 to 1 anchored at its left edge (0.6 s). 3.2–4.2 s the two counters count up from 0 to `1` and `1,000,000`. 4.2–4.6 s a taupe 13-unit line fades in under the counters: `per batch, every batch`.
- **Real values:** `1,000,000` (len, cap, bytes), `1` allocation. From examples E1 (clone version: 1 allocation, 1,000,000 bytes; `sent` = 1,000,000; `batch.len()` still 1,000,000).
- **Final frame:** original card and buffer (caramel), the cherry clone and its buffer, counters `1` and `1,000,000`, `per batch, every batch`. A paused learner sees: this code copies a megabyte per batch.
- **Caption (body):** "An ingest service ships 1,000,000-byte batches. `ship(batch)` was rejected with error E0382, and the review accepted the compiler's own suggestion: `.clone()`. It works, and every batch now pays one extra allocation and a 1,000,000-byte copy. By the end you'll know why Rust refused, and two fixes that copy nothing. Along the way: what every assignment really copies, signatures as ownership contracts, and how to read E0382 and E0505."
- **Narration gist:** the service, the error, the reviewer's clone, the hidden cost; "by the end, you'll fix it without copying a single byte".

### Step 2 — `What does let s2 = s1 copy?`  (predict; `duration: 1.6`)

- **Visual idea:** the Book's String picture made literal: a three-cell card on the stack pointing at five heap bytes, and an empty slot waiting for `s2`. The learner commits to a mental model (alias? deep copy? pointer?) before seeing which bytes move.
- **On screen (both orientations, one Svg h 400):** code line at top as SVG text (15 units `C.crema`): `let s1 = String::from("hello");` at (40, 40) and `let s2 = s1;` at (40, 66). `MAIN'S FRAME` box x 20–580, y 90–200. `Card` `s1` at (50, 130), len `5`, cap `5`. Empty dashed slot (same size as a card, stroke `C.mocha` dashed, label `s2` above) at (340, 130). `HEAP` label and `Buf` of 5 cells `h e l l o` at (150, 290). Arrow s1 → buffer.
- **Beats (question frame):** 0–0.6 s frame + s1 card + buffer fade in; 0.6–1.2 s arrow endpoint moves into place; 1.2–1.6 s the empty `s2` slot pulses once (scale 1 → 1.04 → 1).
- **Predict:**
  - Options (in this order): `Nothing: s2 is just another name for s1` · `The 24-byte header; the 5 heap bytes stay put` **(correct)** · `The header and the 5 heap bytes (a deep copy)` · `Only the 8-byte pointer`
  - Why each wrong option is tempting: "another name" is Python/Java/Go reference intuition; "deep copy" is C++ copy-constructor intuition; "only the pointer" forgets len and cap.
  - **explain:** "`s2` gets a bit-for-bit copy of the 24-byte header (pointer, length, capacity on a 64-bit target); the 5 heap bytes are not copied. (The optimiser may even skip copying the header; it never copies the heap bytes.) Then Rust treats `s1` as no longer valid. A shallow copy plus an invalidated source is what Rust calls a move."
- **Reveal frame:** the s2 slot is filled by a live card (len `5`, cap `5`), a second arrow from s2 to the **same** buffer; s1's card switches to **moved-out** (dashed, label `moved-out`), its arrow removed. Two 15-unit labels at the bottom (y 370), stacked, not side by side: `24 bytes copied (the header)` in `C.crema` and `0 heap bytes copied` in `C.caramel`.
- **Real values:** `24` = `size_of::<String>()`; `5` len and cap of `String::from("hello")`; `0` heap bytes allocated by `let s2 = s1` (E4). `8` appears only in a wrong option (exempt).
- **Final frame:** the reveal.
- **Narration:** question lines; answer clip: "Just the header: pointer, length and capacity. Twenty-four bytes. The text itself never moves... and Rust now treats s one as gone."

### Step 3 — `Two owners would free twice`  (mechanism; `duration: 5.4`)

- **Visual idea:** run the counterfactual. If both cards still owned the buffer, the closing brace would free it twice: the buffer flashes cherry. Then replay with Rust's rule: one card dashed, one free. The point lands because the learner watches the double free happen.
- **On screen (Svg h 420, both orientations):** two rows, each a mini-scene.
  - Row A, y 20–190, small label `IF BOTH OWNED` 13 units `C.taupe` at (30, 36): cards `s1` (50, 60) and `s2` (330, 60), both **live**, both arrows to one 5-cell `Buf` at (165, 140). A vertical line `}` marker (the scope end) at x = 560, label `}` 20 units `C.latte`.
  - Row B, y 220–400, label `RUST` 13 units `C.caramel` at (30, 236): same layout but `s1` **moved-out**; one arrow from `s2`.
- **Beats:** 0–0.6 s row A appears. 0.8 s a small `free` pulse (circle r 6, `C.latte`) travels from s2's card down to the buffer (0.5 s); at 1.3 s the buffer switches to **freed**. 1.6 s a second pulse travels from s1 (0.5 s); at 2.1 s it hits the freed buffer: cherry burst (circle scale 0 → 1, fill `C.cherry`, opacity 0.6) and label `double free` 17 units `C.cherryText` under the buffer, plus counter `frees: 2` at (440, 150) in `cherryText`. 2.9 s row B appears (0.5 s). 3.6 s one pulse from s2 to the buffer, buffer → freed at 4.1 s, label `frees: 1` at (440, 380) 17 units `C.caramel` fades in by 4.6 s. 4.6–5.4 s row A dims to opacity 0.6 (still readable).
- **Real values:** `2`, `1` (frees). Backed by E6's drop count (Rust: exactly one drop) and the Book quotes; nothing on screen claims what a real double free prints (we never execute undefined behaviour).
- **Final frame:** row A (dimmed) with `double free` and `frees: 2`; row B bright with s1 moved-out and `frees: 1`.
- **Caption:** "Why must `s1` die? If both bindings owned the buffer, both would free it at the closing brace: a double free, the classic memory bug (CWE-415) that can corrupt the allocator. So after `let s2 = s1;` Rust considers `s1` no longer valid and doesn't free anything for it. One owner, one drop, and the rule is checked at compile time."
- **Narration gist:** "Here's why."; the double free; "Rust's rule: exactly one owner, so exactly one free".

### Step 4 — `Proof: the buffer never moved`  (mechanism + numbers; `duration: 5.0`)

- **Visual idea:** a measured before/after table, not a diagram: a real 1,000,000-byte `Vec` moved into a function versus cloned, observed with `as_ptr()`, `len()`, `capacity()` and a counting global allocator. It clicks because the numbers are from a run, not from a picture.
- **On screen, landscape:** `Stack`: `Code` panel `proof.rs` (top) + `Svg h={300} fill` (table). **Portrait:** the code panel is hidden (`!portrait` only), the table alone fills the visual (`Svg h={300}`).
  - Code (exact, 7 lines):
    ```
    fn ship(b: Vec<u8>) -> *const u8 {
        b.as_ptr()
    }
    let batch = vec![7u8; 1_000_000];
    let before = batch.as_ptr();
    let inside = ship(batch);
    assert_eq!(before, inside);
    ```
  - Table (600 × 300): column headers at y 40, 15 units weight 600: `MOVED INTO ship()` at x 250 (`C.caramel`), `CLONED` at x 450 (`C.cherryText`). Row labels at x 24, 14 units `C.latte`; values 16 units centered in their column. Rows at y 95, 145, 195, 245:
    1. `heap pointer` · `same` · `new`
    2. `header copied` · `24 bytes` · `24 bytes`
    3. `allocations` · `0` · `1`
    4. `heap bytes` · `0` · `1,000,000`
    Footer at y 288, 13 units `C.taupe`, centered: `len 1,000,000 · cap 1,000,000 · unchanged by the move`
- **Beats:** 0–1.0 s code types (landscape). 1.0 s headers fade in. Rows appear one per 0.7 s from 1.4 s (row 1 at 1.4, row 2 at 2.1, row 3 at 2.8, row 4 at 3.5); numeric cells count up from 0 over 0.5 s. 4.4–5.0 s footer fades in; the `same` cell gets a caramel underline (rect 60 × 3) at 4.6 s.
- **Real values (E4, asserted at `-C opt-level=0` and `-C opt-level=3`):** moved: `as_ptr` before == inside callee (true), len `1,000,000`, cap `1,000,000`, header address inside `ship` != address in `main` (true), allocations `0`, bytes `0`; cloned: `as_ptr` differs, allocations `1`, bytes `1,000,000`; `size_of::<Vec<u8>>() == 24`.
- **Final frame:** full table + footer.
- **Caption:** "Measured, not assumed. Moving a 1,000,000-byte `Vec` into `ship` copied its 24-byte header to a new address (the one `ship` sees for its parameter); the heap pointer, length and capacity are unchanged, and a counting global allocator saw 0 allocations. `clone()` made 1 allocation of 1,000,000 bytes at a new address. Rust never makes a deep copy unless you write `.clone()`."
- **Narration gist:** "Let's measure it."; same pointer, zero allocations; clone, one allocation, a million bytes.

### Step 5 — `Can a moved-out variable come back?`  (predict; `duration: 1.4`)

- **Visual idea:** validity belongs to the **place** (the variable) at each point of the program, not to the value. A three-state strip for `s` makes "deinitialized, then reinitialized" visible.
- **On screen, question frame:** `Stack`: `Code` panel `reinit.rs` (exact, 4 lines):
  ```
  let mut s = String::from("first");
  let t = s;
  s = String::from("second");
  println!("{s} {t}");
  ```
  plus `Svg h={200} fill` showing only the label `s:` at (30, 60) and three empty state boxes (140 × 44) at x 80, 240, 400, y 40 (stroke `C.mocha`), with line markers `line 1`, `line 2`, `line 3` under them (13 units `C.taupe`).
- **Beats:** code types 0–1.0 s; boxes fade in 1.0–1.4 s.
- **Predict:**
  - Options: `E0382: s was moved, it is gone for good` · `Compiles and prints: second first` **(correct)** · `Compiles and prints: first first` · `Compiles only with s.clone()`
  - **explain:** "It compiles and prints `second first`. A move deinitializes the place `s`; it can't be read until it is assigned again (which needs `let mut`; without it, E0384), and then it's an ordinary variable. Assigning to a deinitialized place drops nothing, because nothing is there. `t` owns `first`."
- **Reveal (portrait hides the code):** the three boxes fill: box 1 live (caramel stroke) text `"first"`; box 2 moved-out style, text `deinitialized` 13 units `C.taupe`; box 3 live, text `"second"`. Under them, at y 150: `t: "first"` 15 units `C.crema` at x 240, and output line `prints: second first` 16 units `C.caramel` at x 300 centered, y 190.
- **Real values:** output `second first` (E5). Line numbers `1`, `2`, `3` (present in examples).
- **Final frame:** the reveal.
- **Narration answer:** "It compiles. Moving out leaves the variable empty, not cursed. Assign a new value, and it's usable again."

### Step 6 — `C++ std::move leaves a shell`  (contrast; `duration: 5.6`)

- **Visual idea:** run the same ownership handover in both languages and count destructor calls: C++ runs two (one on an empty shell), Rust runs one. It clicks for C++ engineers because the second destructor is exactly the thing their move constructors null pointers for.
- **On screen (Svg h 440; landscape: two columns side by side x 20–290 and x 310–580; portrait: same two columns, they fit at 270 units each):**
  - Column header 15 units weight 600: `C++` (`C.latte`) and `RUST` (`C.caramel`). Under each, a 2-line code fragment as SVG text 13 units `C.crema`: C++ `Buf b = std::move(a);`; Rust `let b = a;`.
  - Each column: two small cards (120 × 40, just a `data` cell): `a` at y 120 and `b` at y 200, and a 1024-byte buffer bar (200 × 26, label `1024 bytes`) at y 300.
  - C++ column: after the move, `a`'s cell reads `null` (card stays **solid** latte stroke: still alive), `b` points at the buffer. Label under `a`: `moved-from, still alive` 13 units `C.latte`. (Fact-check: not `valid but unspecified`: that phrase is the standard library's rule for its own types such as `std::string`; this hand-written `Buf`'s moved-from state is fully specified, `data == nullptr`. The caption keeps "valid but unspecified" attached to `std::string` only.)
  - Rust column: `a` becomes **moved-out**, `b` points at the buffer.
  - At the bottom, a "scope end" strip at y 350–435, label `AT THE CLOSING BRACE` 13 units `C.taupe`: the C++ column shows the program's two output lines, 13 units `C.crema`, stacked: `destructor (data owned)` then `destructor (data null)`, and below them counter `destructors: 2` in `cherryText`; the Rust column shows one output line `drop (1024 bytes)` and `drops: 1` in `C.caramel`.
- **Beats:** 0–0.8 s headers, code, cards, buffers. 1.0–1.8 s C++: arrow moves from a to b, a's text changes to `null`. 1.8–2.6 s Rust: arrow moves, a → moved-out. 3.0 s C++ first destructor line; 3.5 s second line; 3.8 s counter `2`. 4.4 s Rust drop line; 4.8 s counter `1`. 5.0–5.6 s a 13-unit line spanning the bottom, `C.taupe`: `std::move is a cast; the source lives on`.
- **Real values (E6):** C++ program compiled with `g++ -std=c++20 -Wall -Wextra -Werror` prints `a.data is null: 1`, `destructor (data owned)`, `destructor (data null)` (2 destructor calls); Rust program prints `drop (1024 bytes)` exactly once. The drawing shows exactly these printed lines.
- **Final frame:** both columns complete with counters `2` and `1`.
- **Caption:** "In C++, `std::move(a)` is only a cast to an rvalue reference. The move constructor you write steals the buffer and must null out `a`'s pointer, because `a` stays alive: a moved-from `std::string` is 'valid but unspecified', you may still use it, and its destructor still runs at the end of the block. Run both: C++ calls the destructor twice, once on an empty shell; Rust drops once. A Rust move runs no user code at all: the bytes are copied and the compiler stops letting you use the source."
- **Narration gist:** for C++ engineers; the cast; the shell; "two destructors versus one drop".

### Step 7 — `One line, six meanings`  (contrast, still summary; `duration: 4.2`)

- **Visual idea:** a single grid answering "after `b = a`, what happened to the data and to `a`?" across the learners' languages. The Rust row lands last, highlighted: no deep copy, no alias.
- **On screen (Svg h 400):** header row at y 40, 13 units `C.taupe` uppercase: `LINE` (x 20), `THE DATA` (x 230), `a AFTERWARDS` (x 390). Six rows at y 95, 145, 195, 245, 295, 345, values 14 units (longest cell, `use = compile error`, ends near x 545):
  | line (x 20) | the data (x 230) | a afterwards (x 390) |
  |---|---|---|
  | `Python  b = a` | `shared object` | `usable, alias` |
  | `Java    b = a` | `shared object` | `usable, alias` |
  | `Go      b := a` | `shared array` | `usable, alias` |
  | `C++     b = a` | `copied` | `usable, separate` |
  | `C++  b = move(a)` | `stolen` | `valid, unspecified` |
  | `Rust    let b = a` | `stays put` | `use = compile error` |
  Row text `C.latte`; Rust row `C.caramel` weight 600 with a caramel rect underline (full width, 2 units) under it. Each row is only true for a particular kind of `a`, so a 13-unit `C.taupe` footnote at y 385: `Go: a slice · Java: an object · C++, Rust: a heap string`. (Fact-check: a Java `int` or a Rust `i32` is copied and both stay usable; a short `std::string` under the small-string optimisation is copied, not "stolen", on a move. The footnote pins the rows to the cases where they hold.)
- **Beats:** header 0–0.4 s; rows fade+slide in from x −20, one per 0.5 s from 0.6 s; Rust row at 3.1 s with `easeOutBack` scale 0.96 → 1; footnote 3.8–4.2 s.
- **Real values:** none numeric.
- **Final frame:** the grid.
- **Caption:** "One line, six meanings. Python, Java and Go copy a reference or a slice, so both names stay usable and alias one object. C++ copy-construction gives `b` its own copy of the string; `std::move` steals it and leaves `a` valid but unspecified. Rust copies the same few bytes a shallow copy would, and ends `a`, so there is still exactly one owner. The std docs put it exactly: the only difference between a copy and a move is whether you may still use the source."
- **Narration gist:** walk the rows briefly; land on Rust.

### Step 8 — `Copy: when the bits are the whole value`  (mechanism; `duration: 5.2`)

- **Visual idea:** a sorting sieve. Type chips fall and land in one of two bins by one rule: does the value own anything beyond its own bytes (or claim exclusivity)? It turns a list to memorise into a test to apply.
- **On screen (Svg h 440):** two bins at the bottom: left bin x 30–290, y 300–420, label `Copy` 17 units `C.caramel` and sublabel `bits are the whole value` 13 units `C.latte`; right bin x 310–570, label `move-only` 17 units `C.latte` and sublabel `owns more, or is exclusive` 13 units `C.latte`. Chips (rounded rect, height 30, width fits text at 14 units, stroke `C.mocha`, fill `C.roast`, text `C.crema`):
  - to Copy: `i32`, `f64`, `bool`, `char`, `[u8; 4]`, `(u8, char, f64)`, `&String`
  - to move-only: `String`, `Vec<u8>`, `Box<u8>`, `&mut String`
  Chips settle in two columns inside each bin, rows 34 units apart (Copy bin: 7 chips in 2 columns; move-only bin: 4 chips in 2 columns).
  Top area y 30–120: the demo `let x = 5; let y = x;` as 15-unit text and two small boxes `x 5` and `y 5`, both caramel-stroked (both valid).
  Rules area y 150–260 (three lines, 14 units `C.crema`, appear on beats): `Copy only if every field is Copy` · `a type with Drop is never Copy` · `&T is Copy; &mut T never is`.
- **Beats:** 0–0.8 s demo boxes (y box slides from x box). 1.0 s bins appear. Chips drop one every 0.25 s from 1.2 s (11 chips → done 4.0 s), each falling from y 130 into its slot (`easeOutBack`, 0.4 s). Rules lines at 4.2, 4.5, 4.8 s.
- **Real values (E7):** `x` and `y` print `5 5`; `[u8; 4]` — every chip's classification is asserted by compiling `is_copy::<T>()` (Copy chips compile; move-only chips fail with E0277 "the trait bound `T: Copy` is not satisfied").
- **Final frame:** both bins filled, the three rules, the x/y demo.
- **Caption:** "`Copy` marks types whose bits are the whole value: integers, floats, `bool`, `char`, and arrays and tuples of `Copy` types. Assigning one duplicates it and the source stays valid; the copy is always a plain bitwise copy, never your code. A type can be `Copy` only if every field is. `&T` is `Copy` (copying a shared reference is harmless); `&mut T` never is, because two copies would be two mutable aliases. Under the hood a copy and a move copy the same bits; the only difference is whether the source stays usable."
- **Narration gist:** "the test is simple: is the value just its bits?"

### Step 9 — `A file descriptor that is just an i32`  (predict; `duration: 1.4`)

- **Visual idea:** the most tempting wrong `Copy`: a wrapper around an integer handle with a destructor that closes it. Copying it would close the same descriptor twice, the double free's cousin.
- **On screen, question frame:** `Code` panel `fd.rs` (exact, 5 lines; compiled verbatim):
  ```
  #[derive(Clone, Copy)]
  struct Fd(i32);
  impl Drop for Fd {
      fn drop(&mut self) {}
  }
  ```
  and `Svg h={160} fill` with a single centered 15-unit question line `C.latte`: `does it compile?`
- **Predict:**
  - Options: `Yes: it is just an i32` · `No: E0184, Copy is not allowed on a type with a destructor` **(correct)** · `Yes, and drop runs once per copy` · `Only if Clone is written by hand`
  - **explain:** "E0184. A type with `Drop` manages something beyond its own bytes (here, a descriptor to close), so a bitwise copy would duplicate that responsibility: two copies, two closes. `Copy` and `Drop` are mutually exclusive, so any type with a destructor, or with a field that has one, always moves. You'll build exactly this wrapper properly in the next topic."
- **Reveal (portrait hides code):** SVG text, 14 units `C.cherryText`, two lines: `error[E0184]: the trait \`Copy\` cannot be` / `implemented for this type; the type has a destructor`; then 14 units `C.latte`: `\`Copy\` not allowed on types with destructors`. Below, a small illustration: two `Fd` chips `fd` and `copy` both with arrows to one circle labelled `descriptor`, and the label `two closes` 15 units `C.cherryText`.
- **Real values:** none numeric besides the error code (the build ignores `E0184`, since a letter precedes the digits).
- **Final frame:** the reveal.
- **Narration answer:** "It doesn't compile. A type with a destructor can never be Copy: two copies would mean two closes."

### Step 10 — `.clone() is where the cost is`  (trade-off; `duration: 4.6`)

- **Visual idea:** three lines of code, three cost meters. Copy and move both read `0 allocations`; only the line that says `.clone()` lights up. The learner sees that cost in Rust is visible in the text.
- **On screen:** `Stack`: `Code` panel `cost.rs` (exact, 3 lines):
  ```
  let n2 = n;           // i32: copy
  let b2 = b;           // Vec<u8>: move
  let c2 = c.clone();   // Vec<u8>: clone
  ```
  `Svg h={260} fill`: three rows aligned to the code lines (y 50, 120, 190), each with two counters side by side: `ALLOCATIONS` (x 120) and `HEAP BYTES` (x 360). Values: row 1 `0` / `0`, row 2 `0` / `0`, row 3 `1` / `1,000,000` (cherryText). Footnote y 248, 13 units `C.taupe`: `Rc::clone and Arc::clone only bump a count: Chapter 4`. (Fact-check: `Rc`/`Arc` cost is taught in Ch.4 "Box, Rc, and Arc ownership shapes", not later in Chapter 1.)
- **Beats:** code 0–1.0 s; row counters count up at 1.4, 2.2, 3.0 s (0.6 s each); `highlight={[2]}` from 3.0 s; footnote 4.0–4.6 s.
- **Real values (E9):** `n` is `i32`, `b` and `c` are `vec![7u8; 1_000_000]`; counting allocator: 0/0, 0/0, 1/1,000,000.
- **Final frame:** all meters; the clone row highlighted.
- **Caption:** "Rust never deep-copies behind your back, so the expensive line is the one that says so. A copy and a move allocate nothing; `.clone()` on a `Vec` allocates a new buffer and copies every element. `Clone` is always explicit and may run arbitrary code, which is why the Book calls a `.clone()` call a visual signal that something costly may be happening. Searching a hot path for `.clone()`, and for explicit cousins such as `to_vec()`, `to_owned()` and `to_string()`, finds its deep copies. (Not every clone is deep: cloning an `Rc` or `Arc` only bumps a count; that comes in Chapter 4.)"
- **Narration gist:** "If it's expensive, it says clone."

### Step 11 — `Is a move always cheap?`  (predict; `duration: 1.6`)

- **Visual idea:** challenge the slogan "moves are free". A 4,096-byte struct moved into a function: did the bytes stay where they were?
- **On screen, question frame:** `Code` panel `big.rs` (exact, 8 lines; compiled and run verbatim):
  ```
  struct Big { data: [u8; 4096] }
  fn take(b: Big) -> *const u8 {
      b.data.as_ptr()
  }
  let b = Big { data: [7; 4096] };
  let at = b.data.as_ptr();
  let moved_to = take(b);
  println!("{}", at == moved_to);
  ```
  `Svg h={120} fill`: question line 15 units `C.latte`: `how many bytes does take(b) copy?`
- **Predict:**
  - Options: `0: a move just renames, so it prints true` · `8: a move passes a pointer` · `4,096: the data lands at a new address, it prints false` **(correct)** · `24: just a header`
  - **explain:** "A move is a bitwise copy of the whole value, `size_of::<Big>()` = 4,096 bytes. Here the data really does land at a new address: with rustc 1.97 it prints `false` at every optimisation level, because we took its address first. The optimiser may remove a copy, but nothing guarantees it: a function that only passes a `Big` on does a 4,096-byte `memcpy` in a debug build, and the optimised build drops that copy, but keeps it once the value's address has escaped. A move is always cheap only when the type is small, like `Vec`'s 24-byte header. Because Rust may relocate any value on a move without running code, never keep a raw pointer into a value you then move."
- **Reveal (portrait hides code):** Svg h 300: two boxes `b IN MAIN` (x 20–280) and `take'S PARAMETER` (x 320–580), y 60–180 (not "TAKE'S FRAME": on x86_64 a by-value `Big` is passed by pointer to a copy the caller makes, measured with rustc 1.97, so the copy sits in main's frame); each holds a long bar (240 × 28) labelled `4,096 bytes`; a ghost copy of the bar shown mid-way between them with an arrow (static, opacity 0.5). Labels under the boxes, 14 units: `at` and `moved_to`; centered at y 230: `prints: false` 17 units `C.caramel`; y 262 and 280, 13 units `C.taupe`, two lines: `pass-through, debug: memcpy of 4096 bytes` / `-C opt-level=3: removed, unless the address escaped`.
- **Real values (E10):** `size_of::<Big>() == 4096`; program prints `false` at opt-level 0 and 3 (measured, not guaranteed); asm checks: `pass_plain` (`consume(b)` only) contains `memcpy` and `$4096` at opt-level 0 and **no** `memcpy` at opt-level 3; `pass_on` (address escapes through `black_box`) contains `memcpy` and `$4096` at opt-level 3. Display `4096` in the asm label exactly as the assembly writes it, `4,096` elsewhere.
- **Final frame:** the reveal.
- **Narration answer:** "Four thousand ninety-six. A move copies the whole value... the optimiser sometimes removes the copy, but you can only count on a move being cheap when the value is small."

### Step 12 — `Size decides the cost; Box caps it`  (interactive trade-off; `duration: 3.6`)

- **Visual idea:** the learner taps a type and sees the bytes a move copies; `Box` stays at 8 however big its contents, while its heap block sits still. Interactive, because "cost = `size_of`" is learned by changing the type.
- **On screen (changed by the review, see Changes after final):** a row of five buttons BELOW the drawing, in a plain `div` (no `data-interactive`; each is an HTML `<button type="button">`, font-mono 0.72rem, rounded-full, border `crema/15`; the selected one `border-caramel text-caramel`): `[u8; 16]` · `[u8; 4096]` · `[u8; 65536]` · `Box<[u8; 65536]>` · `Vec<u8> (1,000,000)` (24 bytes: "header only; the 1,000,000 bytes stay on the heap"). Default selection: `[u8; 4096]`. React `useState` holds the selection (as in io-cost-model step 7).
  - Drawing `Svg h={380}`: a log-scale bar chart, four rows (y 50, 120, 190, 260), one per type in button order. Each row: the type label at (24, y), 14 units `C.latte`; under it a bar at (24, y + 10), height 22, rx 6, width = 420 × log2(bytes) / 16 (so 16 → 105, 4096 → 315, 65536 → 420, Box's 8 → 79); the value 15 units `C.crema` at x = 24 + width + 12, baseline y + 27 (rightmost ends near x 504). Bars `C.mocha`; the selected row's bar `C.caramel` and its label `C.crema`. Values: `16`, `4,096`, `65,536`, `8`. Axis caption at y 325, 13 units `C.taupe`: `bytes one move copies = size_of::<T>() (log scale)`.
  - Under it at y 358, a one-line explanation for the selection (14 units `C.crema`): for the arrays `the whole array is copied`; for Box `8-byte pointer; the 65,536 bytes stay on the heap`.
- **Beats:** 0–0.4 s axis caption; bars grow from width 0 one per 0.5 s from 0.4 s (`easeOut`, 0.6 s each); explanation line at 3.0–3.6 s. Tapping a button changes highlight instantly (no time dependence).
- **Real values (E11):** `size_of::<[u8; 16]>() == 16`, `[u8; 4096]` 4096, `[u8; 65536]` 65536, `Box<[u8; 65536]>` 8; a `Box<[u8; 65536]>` moved into a function keeps its data address (ptr equal), 0 allocations.
- **Final frame:** all four bars, `[u8; 4096]` highlighted, its explanation line.
- **Caption:** "A move copies up to `size_of::<T>()` bytes, so its cost follows the type's inline size, not what it owns: a `Vec` with a million elements moves 24 bytes; a 65,536-byte array can cost all 65,536. `Box<T>` puts the `T` on the heap and owns it; for a sized `T` the box itself is a single pointer, so moving it copies 8 bytes however big `T` is. (A box of an unsized type, such as `Box<[u8]>`, is a 16-byte pointer plus length.) That's the Book's reason to box large data you pass around. Tap a type."
- **Narration gist:** "the cost of a move is the size of the type"; Box is one pointer.

### Step 13 — `Signatures are ownership contracts`  (mechanism; `duration: 6.0`)

- **Visual idea:** four lanes, one per parameter form, each animating what the call does to the caller's value: given away, lent for reading (many lenders allowed), lent exclusively, or handed back. Reading a signature becomes reading a picture.
- **On screen (Svg h 460):** four lanes at y 30, 140, 250, 360 (height 90 each). Each lane: signature text at top-left, 15 units `C.crema` (exact strings): `fn ship(b: Vec<u8>)` · `fn peek(b: &[u8])` · `fn fill(b: &mut Vec<u8>)` · `fn make() -> Vec<u8>`. A caller box `caller` (x 30–200) and a callee box (x 380–560) labelled with the function name, 13 units `C.taupe`. The value token: caramel rounded square 40 × 30 labelled `batch` 13 units `C.espresso` weight 700. Verdict label at the lane's right end under the callee, 15 units: `takes`, `borrows`, `borrows exclusively`, `hands back`.
  - Lane 1 (`ship`): token slides caller → callee and stays; caller slot becomes moved-out dashed square.
  - Lane 2 (`peek`): the token stays; two ghost tokens (latte outline, no fill, label `&`) travel to the callee and back, staggered 0.2 s (many shared borrows at once).
  - Lane 3 (`fill`): one ghost token with a thick caramel outline labelled `&mut` travels and returns; while it's out the caller's token dims to opacity 0.4 with a 13-unit label `no other access` under it; the token is wider on return (40 → 52 units, it was mutated).
  - Lane 4 (`make`): a token appears in the callee and slides to the caller.
- **Beats:** lanes animate in sequence: lane 1 0.4–1.6 s, lane 2 1.6–2.9 s, lane 3 2.9–4.4 s, lane 4 4.4–5.4 s; verdict labels fade in at the end of each lane; 5.4–6.0 s all lanes settle in their end states.
- **Real values (E12):** a program with these four functions compiles and runs: `ship(batch)` then use → E0382; `peek(&batch)` twice then `batch.len()` still `4`; `fill(&mut batch)` pushes one byte, `batch.len()` becomes `5`; `make()` returns an owned `Vec<u8>`. Exclusivity: `let r1 = &mut batch; let r2 = &batch; r1.push(8); r2.len();` fails with E0502. (Only the signatures are on screen; numbers 4/5 are not shown.)
- **Final frame:** all four lanes in end state with verdicts.
- **Caption:** "A signature tells you what a call does to your value without opening the body. `T` takes ownership: the callee drops it, stores it or passes it on (if `T` is `Copy`, the callee gets a copy and you keep yours). `&T` borrows for shared, normally read-only access (interior mutability, Chapter 4, is the exception), and any number of shared borrows may coexist. `&mut T` borrows exclusively: while it's live, no other reference to the value may exist, which is what rules out data races at compile time. Returning `T` hands ownership back to the caller."
- **Narration gist:** four contracts, one sentence each.

### Step 14 — `Methods sign the same contract`  (mechanism + numbers; `duration: 5.0`)

- **Visual idea:** the receiver is the contract on methods. Three real `String` methods sorted into read / mutate / consume, then a measured proof that consuming can be zero-copy: `into_bytes` hands back a `Vec<u8>` on the same buffer.
- **On screen (Svg h 440):** three rows at y 50, 110, 170, each a real std signature in 15 units `C.crema` with a verdict chip at the right (13 units), shown without `pub`/`const` (std 1.99 declares `pub const fn len(&self) -> usize` and `pub const fn into_bytes(self) -> Vec<u8>`): `fn len(&self) -> usize` → `reads`; `fn push_str(&mut self, string: &str)` → `mutates`; `fn into_bytes(self) -> Vec<u8>` → `consumes` (caramel chip). Lower half y 230–430: a `Card` `s` (String, len `5`, cap `5`) at (60, 260) pointing at a 5-cell `Buf` `h e l l o` at (230, 380). On a beat the card morphs: its name label changes from `s: String` to `v: Vec<u8>` while the arrow keeps pointing at the same buffer; label to the right, 15 units `C.caramel`: `same buffer · 0 allocations`. A 13-unit `C.latte` line at y 425: `String + &str also consumes the left side and reuses its buffer`.
- **Beats:** rows at 0.3, 0.9, 1.5 s; card + buffer 2.1 s; morph 2.9–3.5 s (old label fades out, new fades in, card slides 20 units right and back); proof label 3.7 s; the `+` line 4.4–5.0 s.
- **Real values (E13):** `"hello"` len `5` cap `5`; `into_bytes`: `as_ptr` equal, allocations `0`; `String::with_capacity(16)` + `push_str("hello")` then `+ " world"`: pointer equal, allocations `0`, len `11`, cap `16` (not shown on screen; Deep dive).
- **Final frame:** three signature rows with chips; `v: Vec<u8>` card on the same buffer; proof label; the `+` line.
- **Caption:** "Methods state the same contract in their receiver. `String::len` takes `&self`, `push_str` takes `&mut self`, and `into_bytes` takes `self`: it consumes the `String` and returns a `Vec<u8>` built on the same buffer (measured: same pointer, 0 allocations). A by-value `self` is how an API says 'don't use the old value after this': `into_*` conversions, builders, state transitions. Even `+` is a contract: `String + &str` consumes the left side and reuses its buffer."
- **Narration gist:** reads, mutates, consumes; "consuming isn't copying".

### Step 15 — `Which signature would you ship?`  (predict, defend-a-design; `duration: 1.2`)

- **Visual idea:** four plausible signatures for one job; the learner picks the contract that matches the job.
- **On screen, question frame:** Svg h 380: top text 15 units `C.latte`, two lines: `checksum reads every byte;` / `the caller keeps using the batch`. Then four signature cards (rounded rect 520 × 46, stroke `C.mocha`, text 14 units `C.crema`) at y 120, 180, 240, 300, letters `A`–`D` at the left in `C.taupe`, texts identical to the options.
- **Predict:**
  - Options: `fn checksum(b: Vec<u8>) -> u32` · `fn checksum(b: &[u8]) -> u32` **(correct)** · `fn checksum(b: &mut Vec<u8>) -> u32` · `fn checksum(b: Vec<u8>) -> (Vec<u8>, u32)`
  - **explain:** "Borrow: `&[u8]`. Taking `Vec<u8>` consumes the batch, so the caller gets E0382 or pays for a clone. `&mut` demands exclusive access the function doesn't need and forbids the caller from holding any other reference meanwhile. Returning the vector in a tuple works, but it's the clumsy pattern references exist to replace. A shared borrow reads without owning, and the caller keeps the batch."
- **Reveal:** card B stroke `C.caramel` 2.5 with chip `borrows: right contract`; A chip `takes`, C chip `exclusive for no reason`, D chip `works, clumsy`; chips 13 units, A/C/D in `C.latte`.
- **Real values (E14):** four variants with a caller that uses `batch` afterwards: A fails (E0382), B, C and D compile.
- **Narration answer:** "The shared borrow. The function only reads, so it shouldn't own the batch... or lock it."

### Step 16 — `Reading E0382, span by span`  (mechanism; `duration: 6.4`)

- **Visual idea:** the real diagnostic from step 1's original code, read in a fixed order with numbered markers: ① why it moved, ② where, ③ the later use. Each span then gets the fix that changes it. Reading order is the lesson.
- **On screen (Svg h 520, drawn in SVG, not `Code`, so the wrapped labels stay aligned):** monospace 13 units throughout except where noted.
  - y 30, 14 units `C.cherryText` weight 600: `error[E0382]: borrow of moved value: \`batch\``
  - Source lines exactly as rustc prints them (gutter + code, `C.crema`), at y 80, 190, 280:
    - `6 |     let batch = vec![7u8; 1_000_000];`
    - `7 |     let sent = ship(batch);`
    - `8 |     println!("{sent} {}", batch.len());`
  - Under each, an underline rect beneath the span (under `batch` in each line; width = 5 chars) and the rustc label text verbatim, `C.latte`, wrapped where needed:
    - ① under line 6 (y 102, 120): `move occurs because \`batch\` has type \`Vec<u8>\`,` / `which does not implement the \`Copy\` trait`
    - ② under line 7 (y 212): `value moved here`
    - ③ under line 8 (y 302): `value borrowed here after move`
  - Numbered markers ① ② ③ (circle r 11, `C.caramel` fill, number 13 units `C.espresso` weight 700) at x 18 beside each label.
  - The note and help, 13 units. The note exactly as rustc 1.97 prints it (`C.latte`), wrapped in two lines at y 340 and 356: `note: consider changing this parameter type in function \`ship\`` / `to borrow instead if owning the value isn't necessary`, then its span label at y 374 (`C.latte`, indented 2 characters): `at \`Vec<u8>\`: this parameter takes ownership of the value`. Help at y 398 and 414 (wrap after `value`; `C.cherryText`): `help: consider cloning the value if the performance cost is acceptable`. (Fact-check: the earlier draft showed `note: this parameter takes ownership of the value`, which rustc never prints as a note line; that text is the label under `Vec<u8>` in `fn ship`, and the note itself recommends a borrow.)
  - Fix chips (y 430–510, three chips stacked, 14 units, caramel outline): `① plain data? derive Copy` · `② borrow: ship(&batch)` · `③ use it first: let n = batch.len();` and, in `C.cherryText`, a fourth smaller line `clone: last resort` at y 512.
- **Beats:** header 0–0.4 s; source lines 0.4–1.2 s; ① label + marker 1.6 s; ② 2.4 s; ③ 3.2 s; earlier labels dim to opacity 0.6 when the next appears, all back to 1 at 4.0 s; note/help 4.2 s; fix chips at 4.8, 5.3, 5.8 s; `clone: last resort` 6.2 s.
- **Real values (E2):** each displayed line appears verbatim in rustc 1.97.0's stderr for `batch.rs` (the file in step 1 without `.clone()`, exact text in E2), including the gutter numbers `6`, `7`, `8`, the header line, the three labels, the note line ``note: consider changing this parameter type in function `ship` to borrow instead if owning the value isn't necessary``, its label `this parameter takes ownership of the value`, and the help line.
- **Final frame:** all three spans, markers, note/help, fix chips.
- **Caption:** "Read E0382 in three spans, in this order: why the value moved (its type isn't `Copy`), where it moved (the call), and the later use. Each span is a place to fix it: borrow at the move site, use the value before the move, or, only for plain data, make the type `Copy`. The note points at the parameter that takes ownership and suggests making it a borrow if owning isn't necessary: the signature may be wrong. The help line, clone, is the fix to reach for last."
- **Narration gist:** "three spans: why, where, and the use that broke the rule".

### Step 17 — `E0505: a move inside a live borrow`  (mechanism; `duration: 6.0`)

- **Visual idea:** a borrow is a bar of time from its creation to its **last use**. A move that lands inside the bar is rejected; finishing with the borrow first shrinks the bar and the move fits. Makes non-lexical lifetimes physical.
- **On screen (Svg h 480):**
  - y 30, 14 units `C.cherryText` weight 600, two lines: `error[E0505]: cannot move out of \`batch\`` / `because it is borrowed`
  - Source lines as rustc prints them (`C.crema`, 13 units), at y 110, 180, 250:
    - `7 |     let header = &batch[..4];`
    - `8 |     let sent = ship(batch);`
    - `9 |     println!("{sent} {header:?}");`
  - rustc labels under each line (13 units `C.latte`): `borrow of \`batch\` occurs here` · `move out of \`batch\` occurs here` · `borrow later used here`. (rustc 1.97 also prints line 6 with the label ``binding `batch` declared here``; the drawing omits that line on purpose and shows the three labels that matter.)
  - The **borrow bar**: a vertical caramel rect (width 10, rx 5) at x 560 from y 100 (line 7) to y 255 (line 9), label `header is live` 13 units `C.caramel` rotated? **No rotation**: label above the bar at (560, 92) anchored end.
  - The **move marker**: cherry circle r 9 at (560, 175) on the bar, with a cherry burst when it appears.
  - **Fix animation**, lower area y 300–470, titled `fix: finish with the borrow first` (14 units `C.caramel`): the same three source lines **without gutter numbers**, reordered: `let header = &batch[..4];` / `println!("{header:?}");` / `let sent = ship(batch);` at y 340, 380, 420; a short caramel bar from y 330 to 385 (ends at the print), and a caramel move marker at y 415 outside the bar, with a `compiles` chip (13 units) at the right. A 13-unit `C.taupe` line at y 465: `or copy the 4 bytes out: [u8; 4] is Copy`.
- **Beats:** header + lines 0–1.2 s; labels 1.4–2.2 s (one per 0.4 s); borrow bar grows downward from line 7 to line 9 (2.4–3.2 s); move marker + burst at 3.4 s; fix block appears 4.0 s; its lines slide from their old order into the new one (the print line moves up, 4.2–4.8 s); short bar grows 4.8–5.2 s; marker + `compiles` 5.4 s; last line 5.8 s.
- **Real values (E15):** the header, gutter numbers `7`, `8`, `9`, source lines and three labels appear verbatim in rustc's stderr for `e0505.rs` (exact text in E15); the reordered program compiles and prints `[7, 7, 7, 7]` then `1000000`; the copy-out variant (`let mut header = [0u8; 4]; header.copy_from_slice(&batch[..4]);`) compiles and allocates nothing. The `4` in `[u8; 4]` and `[..4]` is in examples.
- **Final frame:** the error with the long bar and the cherry move inside it; the fix with the short bar and the move outside it.
- **Caption:** "E0505: you tried to move a value while a borrow of it was still live. A plain reference's borrow lasts until its last use, not to the end of the block (that's what non-lexical lifetimes, RFC 2094, compute), so the cheapest fix is to finish with the reference before the move. The move would hand the buffer to `ship`, which frees it while `header` still points into it. rustc's help suggests cloning at the borrow, `&batch.clone()[..4]`: copying 1,000,000 bytes to keep 4. Copying the 4 bytes into a `[u8; 4]` is the better copy."
- **Narration gist:** "a borrow lives until its last use"; reorder; the clone suggestion again misfires.

### Step 18 — `A move inside a loop`  (predict; `duration: 1.4`)

- **Visual idea:** a loop is a path that comes back. The second lap arrives at an empty slot.
- **On screen, question frame:** `Code` panel `loop.rs` (exact, 4 lines, the body of `main`; `ship` is the step-1 function):
  ```
  let batch = vec![7u8; 4];
  for _ in 0..3 {
      ship(batch);
  }
  ```
  `Svg h={180} fill`: a circular loop path (ellipse rx 140, ry 50, stroke `C.mocha`) with three tick marks labelled `1`, `2`, `3` (13 units `C.taupe`), and the `batch` token at tick 1.
- **Predict:**
  - Options: `Ships the same batch 3 times` · `Compiles; later calls get an empty Vec` · `E0382: value moved here, in previous iteration of loop` **(correct)** · `Panics on the second iteration`
  - **explain:** "E0382, at compile time. The check follows every path, and the path round the loop reaches `ship(batch)` a second time with `batch` already moved. Borrow (`fn ship(b: &[u8])`), build a fresh batch inside the loop, or clone per iteration if each send truly must own its copy: 3 allocations for 3 laps. The same rule makes `for s in v` consume `v`: a `for` loop calls `IntoIterator::into_iter(v)`; iterate `&v` to borrow."
- **Reveal (portrait hides code):** the token sits in a `ship` box at tick 1; at tick 2 a dashed empty slot with a cherry burst; rustc's labels verbatim under the loop (13 units): `inside of this loop` (`C.latte`) and `value moved here, in previous iteration of loop` (`C.cherryText`, wrap after `here,`).
- **Real values (E16):** `loop.rs` stderr contains `error[E0382]: use of moved value: \`batch\``, `inside of this loop`, `value moved here, in previous iteration of loop`; clone-per-iteration with a 1,000,000-byte batch: 3 allocations, 3,000,000 bytes; `forin.rs` stderr contains `\`into_iter\` takes ownership of the receiver \`self\`, which moves \`v\`` and the `&v` help; the `&v` version compiles.
- **Narration answer:** "It doesn't compile. The second time round the loop, the batch is already gone."

### Step 19 — `Back to the batch`  (worked example solved; `duration: 5.6`)

- **Visual idea:** step 1's counters return and fall to zero under the two right fixes. The problem from the opening is closed with the tools of the topic.
- **On screen (portrait: `Svg h={520}` alone, fixes stacked; landscape: same):**
  - Top band y 20–110: `the clone fix` 14 units `C.cherryText` with the step-1 counters `1` allocation and `1,000,000` bytes, struck through by a cherry line at 4.8 s.
  - Fix A block y 130–300, title `if ship only reads: borrow` 15 units `C.caramel`; code as SVG text 14 units `C.crema`: `fn ship(batch: &[u8]) -> usize` / `let sent = ship(&batch);`; counters `ALLOCATIONS 0` and `BYTES COPIED 0`.
  - Fix B block y 320–500, title `if ship must own it: use first, move last` 15 units `C.caramel`; code: `let n = batch.len();` / `let sent = ship(batch);`; counters `0` and `0`.
- **Beats:** top band 0–0.8 s; Fix A at 1.2 s (code 1.2–2.0, counters count to 0 at 2.2 s); Fix B at 2.8 s (code 2.8–3.6, counters 3.8 s); strike-through at 4.8 s; 5.0–5.6 s both fix titles brighten (opacity 0.8 → 1).
- **Real values (E1):** clone version 1 allocation, 1,000,000 bytes; borrow version 0 / 0 (and `sent` 1,000,000, `batch.len()` still 1,000,000); use-first version 0 / 0.
- **Final frame:** struck-through clone costs; both fixes with zero counters.
- **Caption:** "Read the original error by its spans: `Vec<u8>` isn't `Copy` (and shouldn't be), it moved at `ship(batch)`, and it was used after. If `ship` only reads, the signature was wrong: take `&[u8]`, pass `&batch`: 0 allocations, 0 bytes copied. If `ship` must own the batch, say to hand it to a writer thread, read the length first and move last: also 0. The clone was correct code paying 1 allocation and 1,000,000 bytes per batch for nothing."
- **Narration gist:** close the loop on the opening; "the right signature costs nothing".

### Step 20 — `Prove it · 1 of 3`  (predict, debug-this; `duration: 1.2`)

- **On screen:** `Code` panel `retry.rs` (exact, the body of `main`; `ship` as in step 1):
  ```
  let batch = vec![7u8; 4];
  let retry = std::env::args().count() > 1;
  if retry {
      ship(batch);
  }
  println!("{}", batch.len());
  ```
  Body: "Run without arguments, `retry` is false. What happens?"
- **Predict:**
  - Options: `Compiles; fine whenever retry is false` · `E0382: batch is moved on one path` **(correct)** · `Compiles; panics when retry is true` · `Compiles; prints 0 when retry is true`
  - **explain:** "E0382 at compile time, whatever `retry` is at run time. Moves are checked on every path: a value moved on any path that reaches the `println!` counts as moved there. Delete the `println!` and it compiles: Rust then tracks at run time whether `batch` still needs freeing at the end of the scope (a hidden drop flag, next topic)."
- **Reveal (portrait hides code):** Svg h 300: a small control-flow graph: node `let batch` (top) splits into `retry: ship(batch)` (left, card moved-out) and `no retry` (right, card live); both arrows join at node `println!` drawn with a cherry stroke and label `maybe moved = moved` 15 units `C.cherryText`.
- **Real values (E17):** `p1.rs` stderr contains `error[E0382]: borrow of moved value: \`batch\``; without the `println!` line it compiles (`cond.rs`). Numbers `4`, `1`, `0` present in examples.
- **Narration answer:** "It doesn't compile, even though the move might never happen. Maybe moved counts as moved."

### Step 21 — `Prove it · 2 of 3`  (predict, estimate-the-cost; `duration: 1.2`)

- **On screen:** `Code` panel `chain.rs` (exact, 4 lines, body of `main`):
  ```
  let a = vec![0u8; 1_000_000];
  let b = a;
  let c = b.clone();
  let d = c;
  ```
  Body: "Line 1 allocates the buffer. How many heap allocations do lines 2 to 4 add?"
- **Predict:**
  - Options: `0` · `1 allocation, 1,000,000 bytes` **(correct)** · `2 allocations, 2,000,000 bytes` · `3 allocations, 3,000,000 bytes`
  - **explain:** "One. `let b = a` and `let d = c` are moves: at most 24 bytes each, no allocation. Only `b.clone()` allocates, once, 1,000,000 bytes. Here, count the `.clone()` calls and you've counted the deep copies (elsewhere also look for `to_vec()`, `to_owned()` and friends)."
- **Reveal:** Svg h 220 (portrait hides code): three rows `line 2: move`, `line 3: clone`, `line 4: move` with allocation counters `0`, `1` (cherryText, plus `1,000,000 bytes`), `0`; total line `total: 1 allocation` 17 units `C.caramel`.
- **Real values (E18):** counting allocator: line 1 alone 1 allocation of 1,000,000 bytes; lines 2–4 together 1 allocation, 1,000,000 bytes.
- **Narration answer:** "Just one. Two of those lines are moves, and moves never allocate."

### Step 22 — `Prove it · 3 of 3`  (predict, defend-a-design; `duration: 1.2`)

- **On screen:** `Code` panel `config.rs` (exact; compiled verbatim with a `process` function and `main` around the `for` line, see E19):
  ```
  struct Config {
      retries: u32,
      timeout_ms: u32,
      batch: u32,
  }
  for _ in 0..3 { process(cfg); }  // E0382
  ```
  Body: "`process(cfg: Config)` only reads the three numbers, and E0382 fires on the second lap. Which fix fits this type best?"
- **Predict:**
  - Options: `#[derive(Clone)] and pass cfg.clone()` · `#[derive(Clone, Copy)] on Config` **(correct)** · `Wrap it in Rc<Config>` · `Change the parameter to &mut Config`
  - **explain:** "Derive `Copy`. `Config` is 12 bytes of plain numbers and owns nothing, so it can be `Copy`, and the std docs' advice is that a type that can be `Copy` generally should be: each call gets its own bitwise copy, no move, no clone call. `.clone()` would do the same work behind a call that suggests a cost; `Rc` adds a heap allocation and a count; `&mut` demands exclusivity for a read. One caution: `Copy` is part of a public type's API, so if `Config` might gain a `String` later, take `&Config` instead."
- **Reveal:** Svg h 200 (portrait hides code): chip `size_of::<Config>() = 12` 15 units `C.crema`; under it `plain bits → Copy` 17 units `C.caramel`; under that 13 units `C.taupe`: `public type that may grow? take &Config`.
- **Real values (E19):** non-Copy version stderr contains `error[E0382]: use of moved value: \`cfg\`` and `value moved here, in previous iteration of loop`; with `#[derive(Clone, Copy)]` it compiles and runs; `size_of::<Config>() == 12`.
- **Narration answer:** "Derive Copy. Twelve bytes of plain numbers... it's exactly what Copy is for."

### Step 23 — `In one breath`  (recap + handoff; `duration: 3.0`)

- **Visual idea:** six stacked rows, each a glyph from the reel plus one phrase, so the summary recalls the pictures.
- **On screen (Svg h 460):** six rows stacked at y 50, 120, 190, 260, 330, 400 (never two columns; QUALITY #44), each: a small glyph at x 40 (mini card, mini moved-out card, mini bit-row, cherry stamp, four tiny lane arrows, ① marker) and a phrase at x 90, 15 units `C.crema`:
  1. `one owner, one drop`
  2. `move = copy the bytes, end the source`
  3. `Copy = the bits are the whole value; never with Drop`
  4. `.clone() = the visible cost`
  5. `T takes · &T borrows · &mut T excludes · -> T returns`
  6. `E0382: why, where, use · E0505: end the borrow first`
  Row 3 and 5 wrap if needed at phone scale: split row 3 after `value;` and row 5 after `borrows ·` onto a second line 18 units lower; leave 70 units between rows so wrapped rows never touch.
- **Beats:** one row per 0.4 s from 0.3 s; done by 2.7 s.
- **Caption (handoff):** "Six things to keep. Ownership decides who destroys a value; the next topic is about exactly when: drop order, temporaries, and why leaking memory is still safe."
- **Narration:** read the six rows in spoken form; handoff sentence.

---

## Deep dive (`index.mdx`)

Sections use `<section data-section="…">` as in the io-cost-model topic, in this order: `outcomes`, `internals`, `lab`, `production`, `frontier`, `prove`, `sources` (section names are free-form anchors; `prove` is new and fine).

1. **`## After this topic you can`** — the four outcomes above.
2. **`## Into the internals`**
   - **`### What a move is, as the Reference states it`** — place expressions vs value expressions; a place in a value context is copied if its type is `Copy`, otherwise moved (if `Sized`); the list of places that may be moved out of (unborrowed variables, temporaries, fields of movable places whose type doesn't implement `Drop`, `*` of a `Box`); after moving out of a local, the location is deinitialized until reinitialized. One sentence each that moving a field out of a `Drop` type, and moving parts out with patterns, belong to "Partial moves and destructuring as transfer".
   - **`### A move is a bit copy, and addresses change`** — Copy docs: both a copy and a move may copy bits, sometimes optimised away; no move constructor: std::pin "the compiler is allowed to move a value to a new address without running any code"; measured: the 24-byte header lands at a new address inside the callee, the heap pointer doesn't; consequence: never keep a raw pointer into a value across a move; `Pin` exists for address-sensitive types such as self-referential futures (one sentence, out of scope). `String`'s 24 bytes are not a language guarantee (`size_of` docs: sizes are not stable across compilations except for specific types); `Box<T>` and `&T` are guaranteed pointer-sized when `T` is `Sized` (for unsized `T` they carry metadata: `size_of::<Box<[u8]>>()` is 16 on x86_64, measured). Where the copy lives is also not promised: on x86_64 a large by-value argument is passed as a pointer to a copy the caller makes (measured), and an optimised build may skip the copy entirely (Lab 3).
   - **`### The borrow checker's view of a move`** — RFC 2094: values may not be moved or mutated while borrowed; moves count as "deep writes"; a borrow's lifetime is the smallest region covering its uses (why E0505 fixes are about the last use); liveness. Conditional moves compile; a use after a "maybe moved" point is E0382; when the state is only known at run time Rust keeps a drop flag (Nomicon), detailed in the next topic.
   - **`### Copy, Clone and the types in between`** — `Copy` is a bitwise copy and can't be overloaded; `Clone` is a supertrait of `Copy` and may run arbitrary code; derive rules (all fields; derive adds bounds on type parameters); E0204 (non-Copy field) and E0184 (Copy with Drop); `&T: Copy` for any `T`, `&mut T` never `Copy` or `Clone` (primitive reference docs); `let r2 = r;` moves a `&mut`, while an annotated `let r2: &mut String = r;` compiles because the compiler inserts a reborrow (measured; reborrowing is taught in Ch.2 "Aliasing XOR mutability"); `Copy` is part of a public type's API (semver); `clone` is not always deep (`Rc`/`Arc` bump a count: Ch.4 "Box, Rc, and Arc ownership shapes"); `clone_from` can reuse the destination's allocation.
   - **`### Where moves hide`** — loops: `for x in v` is `IntoIterator::into_iter(v)` (Reference desugaring; rustc's note and `&v` help, measured); moving an outer value inside a loop body ("in previous iteration of loop"); method receivers (`self`); operators (`String + &str`); closures: `move` forces capture by value (needed when the body only borrows, as in `thread::spawn(move || data.len())`; without `move` that is E0373, measured; with it, a later `data.len()` is E0382 "value moved into closure here"); a closure whose body consumes a capture (`|| drop(data)`) takes it by value even without `move` (measured E0382); a `Copy` capture is copied, so the original stays usable (measured: `let n = 5; let c = move || n + 1;` then `n` prints `5`); which `Fn` trait a closure implements depends on what its body does: a body that moves a capture out is `FnOnce` (measured: calling it twice is E0382 "use of moved value: `consume`", with the note "closure cannot be invoked more than once because it moves the variable `name` out of its environment"), and moving out of a capture in an `Fn`/`FnMut` is E0507; indexing: `v[i]` on a `Vec` is `*Index::index(&v, i)`, a place behind a reference, so `let s = v[0];` for `Vec<String>` is E0507 (measured); take ownership with `remove`, `swap_remove` (measured: same pointer, 0 allocations), `pop` or `into_iter`, or borrow `&v[0]`; `mem::take`/`mem::replace`/`Option::take` are in "Partial moves and destructuring as transfer"; `match` on a non-Copy value can move out of it (one sentence, same later topic).
   - **`### C++, Go, Java and Python, precisely`** — C++: `std::move` is `static_cast<remove_reference_t<T>&&>(t)`; moved-from library objects are valid but unspecified; the moved-from object's destructor runs at block exit (automatic storage), measured 2 destructor calls vs 1 drop; copy construction gives an independent value; why a C++ move constructor must leave the source destructible and Rust needs no such code. Go: slices share storage with their array, so `b := a` leaves two usable views of one array. Java: references are pointers; many references to one object. Python: assignment binds names, never copies. In all three, both names stay valid; in Rust exactly one does.
3. **`## Build, break, measure`** (lab; every command and output from `examples.py`)
   - **`### Lab 1 · Watch the buffer stay put`** — the `proof.rs` program extended to print `as_ptr`, `len`, `capacity` and the header's address before and after the move; expected: pointer equal, header address different; run at `-C opt-level=0` and `3` (observed with rustc 1.97 with and without `#[inline(never)]`; the header address is an observation, not a guarantee, and the text says so).
   - **`### Lab 2 · Count allocations with a global allocator`** — the counting `#[global_allocator]` from `examples.py` (full code); expected: move 0, clone 1 / 1,000,000 bytes, `into_bytes` 0, `String + &str` with spare capacity 0, loop clone 3 / 3,000,000.
   - **`### Lab 3 · Find the memcpy (and watch it vanish)`** — compile the `Big` pass-through `pass_plain` (`consume(b)` only) with `--emit=asm`: at `-C opt-level=0` it contains a `memcpy` with `$4096`; at `-C opt-level=3` it is a single jump to `consume`, no copy. Then `pass_on`, where the value's address escapes through `std::hint::black_box`: at `-C opt-level=3` the `memcpy` with `$4096` is back. The `Box<Big>` version has none at either level. Lesson: a large move may cost a 4,096-byte copy, and the optimiser removes it only when it can prove nobody observes the old address. Note: the Rust Performance Book (secondary) says types over 128 bytes are copied with `memcpy` rather than inline code (when they are copied at all); DHAT's copy profiling finds hot ones.
   - **`### Lab 4 · Break it on purpose`** — compile each failing snippet and read the spans: E0382 (assignment, call, loop, `for` over a `Vec`, `move` closure, `&mut` moved), E0505, E0184, E0507; the expected first line of each, as asserted.
4. **`## In production`** — sourced or measured only:
   - Clone-to-silence on a hot path: one allocation plus a full copy per call (measured); how to find it: count allocations in a test with a global allocator, profile with a heap profiler.
   - "Moves are free" for large types: a 4,096-byte struct passed on by value is a `memcpy` in a debug build, and in an optimised build whenever its address has escaped (measured); the optimiser removes it only sometimes. Box large values you pass around (Book 15.1) or pass `&T`.
   - Holding a raw pointer or an FFI-registered address into a value and then moving it: the address can change without notice (std::pin); keep such values boxed or pinned.
   - Deriving `Copy` on a public type, then needing a heap field: removing `Copy` is a breaking change (Copy docs).
   - Habits from other languages: expecting a moved-from Rust variable to be an empty but usable object (C++), or two structs to share one buffer by assignment (Go/Java/Python); in Rust the second needs a borrow or shared ownership (later topic).
   - Double free (CWE-415) is the bug class single ownership rules out in safe code.
5. **`## The frontier`** — (a) Rust has no move constructors, and no type is immovable by itself: a value can only be kept in place by putting it behind a pointer and pinning it (`Pin`, whose guarantee applies to `!Unpin` types); self-referential data is handled by `Pin` and by crates the Ch.2 topic "Zero-copy parsing with borrowed views" discusses; (b) the borrow checker still rejects some sound programs that NLL's RFC lists as remaining limitations; the next-generation checker is the subject of Ch.2 "NLL limits and the Polonius borrow checker" (no further claims here).
6. **`## Prove it`** — the three reel questions with worked answers, plus four more, each with a worked answer and asserted in examples: (4) `for s in v { … } v.len()` → E0382, fix `&v`; (5) `let r = &mut s; let r2 = r; r2.push('b'); r.push('c');` → E0382 (a `&mut` is not `Copy`); with `let r2: &mut String = r;` it compiles and `s` is `abc` (reborrow, Ch.2); (6) `thread::spawn(move || data.len())` then `data.len()` → E0382 ("value moved into closure here"); (7) estimate: passing a `[u8; 65536]` by value through four nested calls can copy up to 4 × 65,536 = 262,144 bytes; a `Box<[u8; 65536]>`, 4 × 8 = 32 (assert the arithmetic and `size_of` values; say "up to": the optimiser may remove copies).
7. **`## Sources`** — every source in `SOURCES.md` with URL and version; "Last verified against these sources: 11 October 2026. Examples executed with rustc 1.97.0 (edition 2024) and g++ 13 on x86_64 Linux. Expert sign-off: pending."

---

## Prerequisites (`prerequisites.mdx`)

First topic of the domain; prerequisites are the syllabus's "The Rust Programming Language through ch. 10". Sections (`<section class="prereq" data-section="…">`, numbered like the pattern):

1. **Compile and run Rust** — `rustc`/`cargo`, edition 2024. Check: "Can you compile a single file with `rustc --edition 2024 main.rs` and run it?" Resource: Book ch. 1.2 "Hello, World!" (https://doc.rust-lang.org/book/ch01-02-hello-world.html).
2. **The stack, the heap and pointers** — what lives in a stack frame, what a heap allocation is, what a pointer is. Check: "Where do the characters of a `String` live, and where does the `String` itself live when it's a local?" (Answer: heap; the 24-byte header is in the local's stack frame.) Resource: Book ch. 4.1 "What Is Ownership?" (https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html), section "The Stack and the Heap".
3. **References, borrowing and slices** — `&`, `&mut`, `&[u8]`/`&str`. Check: "Why can you still use `s` after `let r = &s;`?" Resources: Book ch. 4.2 (https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html) and ch. 4.3 "The Slice Type" (https://doc.rust-lang.org/book/ch04-03-slices.html).
4. **Structs, traits and derive** — `struct`, `impl`, `#[derive(...)]`, trait bounds. Check: "What does `fn f<T: Clone>(x: &T) -> T { x.clone() }` require of `T`?" Resources: Book ch. 5 (https://doc.rust-lang.org/book/ch05-00-structs.html) and ch. 10 (https://doc.rust-lang.org/book/ch10-00-generics.html); Rust by Example "Ownership and moves" (https://doc.rust-lang.org/rust-by-example/scope/move.html).

Every link, title and author is verified by the builder (HTTP 200 and matching title); drop any that fail. No lengths unless verified.

---

## Examples to execute (`examples.py`)

`npm run test:examples` runs `python3 examples.py` from the topic folder. `examples.py` compiles and runs Rust (and one C++ program) through `subprocess` in a `tempfile.TemporaryDirectory()`; it never skips: if `rustc` or `g++` is missing it fails with a clear message.

**Harness (write these helpers first):**
- `RUSTC = shutil.which('rustc')`; assert it exists; `rustc --version` must parse and be ≥ 1.85 (edition 2024). Print the version in the final line.
- `def compile_rs(name, src, opt=0, ok=True, crate_type=None, emit=None) -> str`: writes `<tmp>/<name>.rs`, runs `rustc --edition 2024 --color never -C opt-level=<opt> <name>.rs -o <name>` **with `cwd=tmp`** (so diagnostics read `--> <name>.rs:L:C`), returns stderr; asserts `returncode == 0` if `ok` else `!= 0`.
- `def run_rs(name, src, opt=0) -> str`: compile then run, return stdout.
- `def main_body(lines: str, prelude: str = '') -> str`: returns `prelude + "fn main() {\n" + indented(lines) + "\n}\n"` for snippets shown as the body of `main` (indent each line by 4 spaces, nothing else changed).
- The counting allocator prelude (used by E1, E4, E9, E11, E13, E18): `static ALLOCS: AtomicUsize`, `static BYTES: AtomicUsize`; `GlobalAlloc` impl over `System` incrementing both in `alloc` (and in `realloc` if implemented: count it as one allocation of the new size; simplest is to not override `realloc`, the default calls `alloc`); also do **not** override `alloc_zeroed` unless it counts too: `vec![0u8; n]` (E18 line 1) allocates through `alloc_zeroed`, whose default calls `alloc` (measured: counted as 1 / 1,000,000 that way); `fn snap() -> (usize, usize)`. Programs print `key=value` lines; Python parses them into a dict and asserts.
- **CI:** neither workflow installs Rust. Add a step **before** "Run every topic's code examples" in both `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`: `- name: Rust toolchain for the Rust examples` / `run: rustup toolchain install 1.97.0 --profile minimal && rustup default 1.97.0` (rustup is preinstalled on `ubuntu-latest`; `g++` is too). Pinning the version keeps the asserted diagnostic text stable; bump it deliberately with a re-check.

**Examples and their asserts** (E-numbers are referenced by the steps above; every number on screen appears literally in this file):

- **E1 · the problem and its fixes (steps 1, 19, 18).** One program with the counting allocator, `fn ship_owned(batch: Vec<u8>) -> usize { batch.len() }` and `fn ship(batch: &[u8]) -> usize`. Assert: clone version `ship_owned(batch.clone())` → allocs `1`, bytes `1_000_000`, sent `1_000_000`, `batch.len()` `1_000_000`; borrow version `ship(&batch)` → `0`, `0`; use-first version (`let n = batch.len(); ship_owned(batch)`) → `0`, `0`, `n == 1_000_000`; clone per iteration ×3 → allocs `3`, bytes `3_000_000`. Also compile verbatim: step 1's 7-line code (lines 5–7 wrapped in `main`, `ship` above) → compiles; step 19's two fixes as shown → compile.
- **E2 · E0382 diagnostic (step 16).** `batch.rs` exactly:
  ```
  fn ship(batch: Vec<u8>) -> usize {
      batch.len()
  }

  fn main() {
      let batch = vec![7u8; 1_000_000];
      let sent = ship(batch);
      println!("{sent} {}", batch.len());
  }
  ```
  Must fail; stderr contains each of: ``error[E0382]: borrow of moved value: `batch` ``; `6 |     let batch = vec![7u8; 1_000_000];`; ``move occurs because `batch` has type `Vec<u8>`, which does not implement the `Copy` trait``; `7 |     let sent = ship(batch);`; `value moved here`; `8 |     println!("{sent} {}", batch.len());`; `value borrowed here after move`; ``note: consider changing this parameter type in function `ship` to borrow instead if owning the value isn't necessary``; `this parameter takes ownership of the value`; `help: consider cloning the value if the performance cost is acceptable`.
- **E3 · the Book's String example (steps 2–3).** `let s1 = String::from("hello"); let s2 = s1; println!("{s1}, world!");` fails with ``error[E0382]: borrow of moved value: `s1` `` and ``move occurs because `s1` has type `String`, which does not implement the `Copy` trait``.
- **E4 · memory proof (steps 2, 4).** Run at opt-level 0 **and** 3; assert identical results: `size_of::<String>() == 24`, `size_of::<Vec<u8>>() == 24`; `String::from("hello")` len `5` cap `5`; `let s2 = s1` → `as_ptr` equal, allocs `0`; `s2.clone()` → allocs `1`, bytes `5`, pointer different; `vec![7u8; 1_000_000]` moved into an `#[inline(never)] fn ship(batch: Vec<u8>)` that returns `(as_ptr, len, capacity, &batch as *const _ as usize)`: pointer equal, len and cap `1_000_000`, header address **different**, allocs `0`, bytes `0`; clone → allocs `1`, bytes `1_000_000`, pointer different. Also compile and run step 4's 7-line `proof.rs` verbatim (lines 4–7 in `main`): exits 0 (the `assert_eq!` holds).
- **E5 · reinitialization (step 5).** Step 5's code verbatim in `main` → stdout `second first\n`.
- **E6 · C++ vs Rust (step 6).** C++ (compile with `g++ -std=c++20 -Wall -Wextra -Werror`): a `Buf` with `char* data = new char[1024]`, a move constructor that steals `data` and sets `o.data = nullptr`, a destructor printing `destructor (data owned)` or `destructor (data null)`; `main`: `Buf a; Buf b = std::move(a); printf("a.data is null: %d\n", a.data == nullptr);`. Assert stdout lines exactly `a.data is null: 1`, `destructor (data owned)`, `destructor (data null)`; count of lines starting `destructor` == `2`. Rust: `struct Buf(Vec<u8>)` with `Drop` printing `drop ({} bytes)`; `let a = Buf(vec![0; 1024]); let b = a;` → stdout exactly `drop (1024 bytes)\n` (one line). Rust use of `a` after `let b = a;` fails with E0382 (the C++ program used `a` after the move and compiled with zero warnings).
- **E7 · the Copy sieve (step 8).** `fn is_copy<T: Copy>() {}`; compiles for `i32`, `f64`, `bool`, `char`, `[u8; 4]`, `(u8, char, f64)`, `&String`; for each of `String`, `Vec<u8>`, `Box<u8>`, `&mut String` a separate program fails and stderr contains ``the trait bound `<T>: Copy` is not satisfied`` with `<T>` the type as rustc prints it (assert ``the trait bound `&mut String: Copy` is not satisfied`` and ``the trait bound `String: Copy` is not satisfied`` exactly; for `Vec<u8>` and `Box<u8>` assert `E0277` and `Copy` is not satisfied). `let x = 5; let y = x; println!("{x} {y}");` prints `5 5`.
- **E8 · E0184 (step 9).** Step 9's 5 lines + `fn main() {}` fail; stderr contains `error[E0184]` and ``the trait `Copy` cannot be implemented for this type; the type has a destructor`` and `` `Copy` not allowed on types with destructors``.
- **E9 · cost meters (step 10).** Counting allocator; `let n: i32 = 7; let b = vec![7u8; 1_000_000]; let c = vec![7u8; 1_000_000];` then measure each of step 10's three lines separately: `(0, 0)`, `(0, 0)`, `(1, 1_000_000)`. Compile step 10's three lines verbatim (with those definitions above them).
- **E10 · the 4 KiB move (step 11).** Step 11's code verbatim (struct and fn above `main`, the last four lines in `main`) at opt-level 0 and 3 → stdout `false\n` both times. `size_of::<Big>() == 4096`. Box variant (`fn take_box(b: Box<Big>) -> *const u8`) → `true`, `size_of::<Box<Big>>() == 8`. Assembly: compile as `--crate-type lib -C opt-level=3 --emit=asm`:
  ```
  pub struct Big { pub data: [u8; 4096] }
  #[inline(never)]
  pub fn consume(b: Big) -> u8 { std::hint::black_box(&b); b.data[0] }
  pub fn pass_on(b: Big) -> u8 { let c = std::hint::black_box(b); consume(c) }
  pub fn pass_box(b: Box<Big>) -> u8 { let c = std::hint::black_box(b); c.data[0] }
  ```
  plus `pub fn pass_plain(b: Big) -> u8 { consume(b) }` in the same file. Extract each function's body (from the line ending in `pass_on:` / `pass_box:` / `pass_plain:` to the next `.Lfunc_end`; symbols are v0-mangled, e.g. `_RNv…3lib7pass_on:`, so match the suffix); assert at opt-level 3: `memcpy` and `$4096` in `pass_on`'s body, no `memcpy` in `pass_box`'s, **no** `memcpy` in `pass_plain`'s (the optimiser removed that copy; measured with rustc 1.97: a single `jmpq` to `consume`); and, compiling the same file at `-C opt-level=0`, `memcpy` and `$4096` in `pass_plain`'s body. (Fact-check: the earlier claim that "a function that just passes a `Big` on compiles to a `memcpy`" in an optimised build is false; the `memcpy` in `pass_on` is there because `black_box` lets the address escape.) If a future rustc also keeps or removes a copy differently, update the step 11 label rather than the assertion's meaning.
- **E11 · size chooser (step 12).** `size_of::<[u8; 16]>() == 16`, `[u8; 4096]` → `4096`, `[u8; 65536]` → `65536`, `Box<[u8; 65536]>` → `8`, `Box<[u8]>` → `16` (the step 12 caption's unsized aside); a `Box<[u8; 65536]>` (made with `vec![1u8; 65536].into_boxed_slice().try_into().unwrap()`, never on the stack) moved into a function: data pointer equal, allocations during the move `0`. Also assert the bar-width formula inputs: `log2(8) == 3`, `log2(65536) == 16` in Python (so the drawing's scale is backed).
- **E12 · four contracts (step 13).** One program with `ship(b: Vec<u8>)`, `peek(b: &[u8]) -> usize`, `fill(b: &mut Vec<u8>)` (pushes `8`), `make() -> Vec<u8>`; run: after `peek` twice `batch.len() == 4`; after `fill`, `5`; `make().len()` asserted. Separately: `ship(batch); batch.len()` fails E0382; the exclusivity snippet (`let r1 = &mut batch; let r2 = &batch; r1.push(8); println!("{}", r2.len());`) fails with `error[E0502]`.
- **E13 · methods (step 14).** Counting allocator: `String::from("hello")` → `len() == 5`, `capacity() == 5`; `into_bytes()` → pointer equal, allocs `0`; `let mut s = String::with_capacity(16); s.push_str("hello"); let t = s + " world";` → pointer equal, allocs `0`, `t == "hello world"`, `t.len() == 11`, `t.capacity() == 16`. Assert the three signatures exist by compiling `let _: fn(&String) -> usize = String::len; let _: fn(&mut String, &str) = String::push_str; let _: fn(String) -> Vec<u8> = String::into_bytes;`.
- **E14 · which signature (step 15).** Four programs, each defining one `checksum` variant (bodies: sum bytes as `u32` with `wrapping_add`) and a `main` that calls it and then uses `batch.len()`: A (`Vec<u8>`) fails E0382; B (`&[u8]`, call `checksum(&batch)`), C (`&mut Vec<u8>`, call `checksum(&mut batch)` with `let mut batch`), D (`Vec<u8>` → `(Vec<u8>, u32)`, call `let (batch, sum) = checksum(batch);`) compile and run.
- **E15 · E0505 (step 17).** `e0505.rs` exactly:
  ```
  fn ship(batch: Vec<u8>) -> usize {
      batch.len()
  }

  fn main() {
      let batch = vec![7u8; 1_000_000];
      let header = &batch[..4];
      let sent = ship(batch);
      println!("{sent} {header:?}");
  }
  ```
  Fails; stderr contains: ``error[E0505]: cannot move out of `batch` because it is borrowed``; `7 |     let header = &batch[..4];`; ``borrow of `batch` occurs here``; `8 |     let sent = ship(batch);`; ``move out of `batch` occurs here``; `9 |     println!("{sent} {header:?}");`; `borrow later used here`; ``binding `batch` declared here``; `help: consider cloning the value if the performance cost is acceptable`; `let header = &batch.clone()[..4];` (the suggestion the caption quotes). Fix (reordered, as drawn): `let header = &batch[..4]; println!("{header:?}"); let sent = ship(batch); println!("{sent}");` → stdout `[7, 7, 7, 7]\n1000000\n`. Copy-out fix: `let mut header = [0u8; 4]; header.copy_from_slice(&batch[..4]); let sent = ship(batch); println!("{sent} {header:?}");` → stdout `1000000 [7, 7, 7, 7]\n` and, with the counting allocator, allocations between `header` creation and the print `0`.
- **E16 · loops (step 18).** `loop.rs` (step 18's 4 lines in `main`, `ship` above) fails; stderr contains ``error[E0382]: use of moved value: `batch` ``, `inside of this loop`, `value moved here, in previous iteration of loop`. `forin.rs`: `let v = vec![String::from("a"), String::from("b")]; for s in v { println!("{s}"); } println!("{}", v.len());` fails; stderr contains ``borrow of moved value: `v` `` and `` `into_iter` takes ownership of the receiver `self`, which moves `v` `` and ``consider iterating over a slice of the `Vec<String>`'s content to avoid moving into the `for` loop``; the `&v` version compiles and prints `a`, `b`, `2`.
- **E17 · Prove it 1 (step 20).** Step 20's code verbatim in `main` (`ship` above) fails with ``error[E0382]: borrow of moved value: `batch` ``; the same without the `println!` line compiles and runs.
- **E18 · Prove it 2 (step 21).** Counting allocator: line 1 alone → `(1, 1_000_000)`; step 21's lines 2–4 together → `(1, 1_000_000)`; also `(2, 2_000_000)` and `(3, 3_000_000)` are **not** the result (no need to assert wrong options).
- **E19 · Prove it 3 (step 22).** Program: step 22's struct verbatim; `fn process(cfg: Config) -> u32 { cfg.retries + cfg.timeout_ms + cfg.batch }`; `main`: `let cfg = Config { retries: 3, timeout_ms: 500, batch: 64 };` then step 22's `for` line verbatim. Fails with ``error[E0382]: use of moved value: `cfg` `` and `value moved here, in previous iteration of loop`. With `#[derive(Clone, Copy)]` added above the struct: compiles and runs; `size_of::<Config>() == 12`.
- **E20 · Deep dive extras.** E0507: `let v = vec![String::from("a"), String::from("b")]; let s = v[0];` fails with ``error[E0507]: cannot move out of index of `Vec<String>` ``; `swap_remove(0)`: pointer equal, allocs `0`. `&mut` moved: `let r = &mut s; let r2 = r; r2.push('b'); r.push('c');` fails E0382; with `let r2: &mut String = r;` compiles, `s == "abc"`. `move` closure: `let data = vec![1, 2, 3]; let h = std::thread::spawn(move || data.len()); println!("{}", data.len());` fails with `value moved into closure here`. FnOnce: `let name = String::from("batch-7"); let consume = move || name; let a = consume(); let b = consume();` fails with ``error[E0382]: use of moved value: `consume` `` and the note ``closure cannot be invoked more than once because it moves the variable `name` out of its environment``. Closure capture modes (Deep dive): `std::thread::spawn(|| data.len())` without `move` fails with `error[E0373]`; `let c = || drop(data); c(); data.len()` fails with `value moved into closure here` (by-value capture without `move`); `let n = 5; let c = move || n + 1; println!("{} {}", c(), n);` prints `6 5`. Prove-it 7 arithmetic: `4 * 65_536 == 262_144`, `4 * 8 == 32`.

Final line prints a one-line summary (rustc version and the key measured values).

---

## Concept ledger (registry entry)

```ts
{
  id: 'rust.single-ownership-move-semantics',
  domain: 'rust-systems-engineering',
  slug: 'rust-systems-engineering/m1-ownership-types-concurrency/ch01-ownership-moves/single-ownership-move-semantics',
  title: 'Single ownership and move semantics',
  syllabusTitle: 'Single ownership and move semantics',
  kind: 'full',
  status: 'live',            // first topic of the domain: nothing before it
  milestone: { number: 1, title: 'Ownership, Types, and Concurrency Primitives' },
  chapter: { number: 1, title: 'Ownership and Moves', section: '1.1' },
  minutes: 18,
  verified: '2026-10-11',
  introduces: ['ownership', 'move-semantics', 'deinitialized-place', 'copy-trait', 'clone-cost', 'move-cost', 'box-ownership', 'ownership-signatures', 'e0382', 'e0505'],
  uses: [],
  declared: ['programming', 'rust-book-basics', 'stack-and-heap', 'references-and-borrowing', 'slices', 'structs-traits-generics'],
  bridge: '…as above…',
  handoff: '…as above…',
}
```

Check the exact milestone/chapter title strings against `syllabus/rust-systems-engineering.md` ("Milestone 1 — Ownership, Types, and Concurrency Primitives", "Chapter 1 — Ownership and Moves"). Closures and `Box` are beyond the Book's ch. 10: the reel explains `Box<T>` on the spot (step 12, "puts the `T` in one heap allocation and owns it; the box itself is a single pointer"), and closures appear only in the Deep dive, where a `move` closure is explained in one sentence before use.

---

## Claims list

Every factual claim the topic makes, with its source (URL) and the `SOURCES.md` quote it rests on. "Measured" means asserted in `examples.py` (the primary evidence for compiler and runtime behaviour); a measured claim also cites a doc where one exists.

| # | Claim (where) | Source | Quote in SOURCES.md / evidence |
|---|---|---|---|
| 1 | Each value has one owner at a time and is dropped when the owner goes out of scope (steps 3, 23) | https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html | "Each value in Rust has an owner." / "There can only be one owner at a time." / "When the owner goes out of scope, the value will be dropped." |
| 2 | A `String` is pointer + length + capacity; its buffer is on the heap (steps 2, 4) | https://doc.rust-lang.org/std/string/struct.String.html | "A String is made up of three components: a pointer to some bytes, a length, and a capacity." / "This buffer is always stored on the heap." |
| 3 | `let s2 = s1` copies ptr, len, cap and not the heap data (step 2) | Book ch4.1 | "When we assign s1 to s2, the String data is copied, meaning we copy the pointer, the length, and the capacity that are on the stack. We do not copy the data on the heap that the pointer refers to." |
| 4 | Shallow copy + invalidated source = a move (steps 2, 23) | Book ch4.1 | "But because Rust also invalidates the first variable, instead of being called a shallow copy, it's known as a move." |
| 5 | Two owners would both free: double free; Rust treats s1 as invalid and frees nothing for it (step 3) | Book ch4.1 | "When s2 and s1 go out of scope, they will both try to free the same memory. This is known as a double free error…" / "To ensure memory safety, after the line let s2 = s1;, Rust considers s1 as no longer valid. Therefore, Rust doesn't need to free anything when s1 goes out of scope." |
| 6 | Double free is a weakness class that can corrupt allocator data structures (step 3, production) | https://cwe.mitre.org/data/definitions/415.html | "The product calls free() twice on the same memory address." / "…the program's memory management data structures may become corrupted…" |
| 7 | `size_of::<String>()` and `size_of::<Vec<u8>>()` are 24 on x86_64; type sizes in general are not guaranteed (steps 2, 4, internals) | measured E4; https://doc.rust-lang.org/std/mem/fn.size_of.html | "In general, the size of a type is not stable across compilations, but specific types such as primitives are." |
| 8 | Rust never deep-copies implicitly; automatic copies are cheap (steps 4, 10) | Book ch4.1 | "Rust will never automatically create "deep" copies of your data. Therefore, any automatic copying can be assumed to be inexpensive in terms of runtime performance." |
| 9 | Moving a 1,000,000-byte Vec: same heap pointer/len/cap, header at a new address, 0 allocations; clone: 1 allocation of 1,000,000 bytes, new pointer (step 4) | measured E4 (opt 0 and 3) | n/a (executed) |
| 10 | The compiler may move a value to a new address without running code; assignment and passing to a function are moves (steps 4, 6, 11, internals) | https://doc.rust-lang.org/std/pin/index.html | "The compiler is allowed to move a value to a new address without running any code to notify that value that its address has changed." / "…when doing assignment or passing a value into a function." |
| 11 | A moved-out local is deinitialized and can't be read until reinitialized (step 5) | https://doc.rust-lang.org/reference/expressions.html | "After moving out of a place expression that evaluates to a local variable, the location is deinitialized and cannot be read from again until it is reinitialized." |
| 12 | Assignment drops the old value only if the place is initialized; assigning to an uninitialized place runs no destructor (step 5, internals) | https://doc.rust-lang.org/reference/destructors.html | "When an initialized variable or temporary goes out of scope, its destructor is run or it is dropped." / "Assignment also runs the destructor of its left-hand operand, if it’s initialized." / "// No destructor run on assignment." (the Reference's example assigns to a declared-but-uninitialized `moved`; the earlier quote "// Uninitialized does not drop." is about an uninitialized variable leaving scope, not assignment) |
| 13 | Step 5's program compiles and prints `second first` | measured E5 | n/a |
| 14 | `std::move` is a cast to an rvalue reference (step 6, internals) | https://eel.is/c++draft/forward | "template<class T> constexpr remove_reference_t<T>&& move(T&& t) noexcept;" / "Returns: static_cast<remove_reference_t<T>&&>(t)." |
| 15 | A moved-from `std::string` (and std library objects generally) is valid but unspecified (steps 6, 7) | https://eel.is/c++draft/string.cons ; https://eel.is/c++draft/lib.types.movedfrom | "Remarks: In the second form, str is left in a valid but unspecified state." / "Unless otherwise specified, such moved-from objects shall be placed in a valid but unspecified state" |
| 16 | A C++ automatic object's destructor runs at block exit, moved-from or not; measured 2 destructor calls vs 1 Rust drop (step 6) | https://eel.is/c++draft/class.dtor ; measured E6 | "for a constructed object with automatic storage duration ([basic.stc.auto]) when the block in which an object is created exits ([stmt.dcl])" |
| 17 | C++ copy construction makes an object with the source's value (an independent `std::string`) (step 7) | https://eel.is/c++draft/string.cons | "Effects: Constructs an object whose value is that of str prior to this call." |
| 18 | Python assignment binds, doesn't copy (step 7) | https://docs.python.org/3/library/copy.html | "Assignment statements in Python do not copy objects, they create bindings between a target and an object." |
| 19 | Java references are pointers; many references to one object (step 7) | https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html | "The reference values (often just references) are pointers to these objects" / "There may be many references to the same object." |
| 20 | Go slices share storage with their array (step 7) | https://go.dev/ref/spec | "A slice therefore shares storage with its array and with other slices of the same array" |
| 21 | Copy and move both copy bits; the only difference is access to the source; sometimes optimised away (steps 7, 8, 11) | https://doc.rust-lang.org/std/marker/trait.Copy.html | "It’s important to note that in these two examples, the only difference is whether you are allowed to access x after the assignment. Under the hood, both a copy and a move can result in bits being copied in memory, although this is sometimes optimized away." |
| 22 | Copy is a non-overloadable bitwise copy; Clone is explicit (steps 8, 10) | Copy docs | "Copies happen implicitly, for example as part of an assignment y = x. The behavior of Copy is not overloadable; it is always a simple bit-wise copy." / "Cloning is an explicit action, x.clone()." |
| 23 | A type can be Copy only if all components are; non-Copy field → E0204 (step 8, internals) | Copy docs | "A type can implement Copy if all of its components implement Copy." / "If you try to implement Copy on a struct or enum containing non-Copy data, you will get the error E0204." |
| 24 | Simple scalars and groups of them are Copy; anything allocating or a resource isn't (step 8) | Book ch4.1 ; measured E7 | "as a general rule, any group of simple scalar values can implement Copy, and nothing that requires allocation or is some form of resource can implement Copy." |
| 25 | `&T` is Copy; `&mut T` is not Copy or Clone (step 8, internals) | Copy docs ; https://doc.rust-lang.org/std/primitive.reference.html | "Shared references (&T) are also Copy…" / "copying &mut T would create an aliased mutable reference." / "&mut T references get all of the above except Copy and Clone (to prevent creating multiple simultaneous mutable borrows)" |
| 26 | A type with Drop can't be Copy; E0184 (step 9) | Copy docs ; https://doc.rust-lang.org/error_codes/E0184.html ; Book ch4.1 ; measured E8 | "any type implementing Drop can’t be Copy, because it’s managing some resource besides its own size_of::<T> bytes." / "Explicitly implementing both Drop and Copy trait on a type is currently disallowed." / "Rust won't let us annotate a type with Copy if the type, or any of its parts, has implemented the Drop trait." |
| 27 | Copying String would double free; String is Clone, not Copy (steps 3, 8) | Copy docs | "A simple bitwise copy of String values would merely copy the pointer, leading to a double free down the line. For this reason, String is Clone but not Copy." |
| 28 | Clone is explicit, may be expensive, may run arbitrary code; a clone call signals cost (step 10) | https://doc.rust-lang.org/std/clone/trait.Clone.html ; Book ch4.1 | "Differs from Copy in that Copy is implicit and an inexpensive bit-wise copy, while Clone is always explicit and may or may not be expensive." / "When you see a call to clone, you know that some arbitrary code is being executed and that code may be expensive." |
| 29 | Rc/Arc clone only increments a count; taught in Ch.4 (step 10 footnote, internals) | Clone docs | "For smart pointers like Arc or Rc, this increments the reference count but still points to the same underlying data" |
| 30 | Cost meters: copy and move 0 allocations, clone 1 / 1,000,000 bytes (step 10) | measured E9 | n/a |
| 31 | A move is a copy of the whole value: step 11's 4,096-byte struct (address taken before the move) lands at a new address at opt 0 and 3 with rustc 1.97 (observed, not guaranteed); a plain pass-through is a 4,096-byte `memcpy` at opt 0 and has no copy at opt 3; with the address escaping (`black_box`) the opt-3 build keeps the `memcpy` (step 11, lab 3, production) | measured E10 ; Copy docs (claim 21: "sometimes optimized away") | n/a (executed) |
| 32 | Large types (>128 bytes) are copied with memcpy (Deep dive lab 3 only; secondary) | https://nnethercote.github.io/perf-book/type-sizes.html | "Rust types that are larger than 128 bytes are copied with memcpy rather than inline code." |
| 33 | Moving large data can be slow; boxing it means only the pointer is copied (step 12) | https://doc.rust-lang.org/book/ch15-01-box.html | "transferring ownership of a large amount of data can take a long time because the data is copied around on the stack." / "only the small amount of pointer data is copied around on the stack, while the data it references stays in one place on the heap." |
| 34 | `[T; n]` is `n * size_of::<T>()`; `Box<T>` (T sized) is pointer-sized; `Box<[u8]>` is 16 bytes on x86_64 (measured only; the docs promise nothing for unsized `T`) (step 12, internals) | size_of docs ; measured E11 | "for any type T and length n, [T; n] has a size of n * size_of::<T>()." / "The types *const T, &T, Box<T>, Option<&T>, and Option<Box<T>> all have the same size. If T is Sized, all of those types have the same size as usize." |
| 35 | Passing to a function moves or copies like assignment; returning transfers ownership (step 13) | Book ch4.1 | "Passing a variable to a function will move or copy, just as assignment does." / "Returning values can also transfer ownership." |
| 36 | References borrow without owning; the borrowed value isn't dropped when the reference stops being used (step 13) | https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html | "These ampersands represent references, and they allow you to refer to some value without taking ownership of it." / "Because the reference does not own it, the value it points to will not be dropped when the reference stops being used." |
| 37 | Many shared references allowed; a `&mut` excludes every other reference; this prevents data races at compile time (step 13) | Book ch4.2 ; measured E12 (E0502) | "multiple immutable references are allowed because no one who is just reading the data has the ability to affect anyone else's reading of the data." / "If you have a mutable reference to a value, you can have no other references to that value." / "The benefit of having this restriction is that Rust can prevent data races at compile time." |
| 38 | Receivers: `&self` reads, `&mut self` mutates, `self` consumes; consuming self prevents later use (step 14) | https://doc.rust-lang.org/book/ch05-03-method-syntax.html | "Rust can figure out definitively whether the method is reading (&self), mutating (&mut self), or consuming (self)." / "…this technique is usually used when the method transforms self into something else and you want to prevent the caller from using the original instance after the transformation." |
| 39 | `String::len(&self)`, `push_str(&mut self, &str)`, `into_bytes(self)`; into_bytes doesn't copy (measured same pointer, 0 allocations) (step 14) | String docs ; measured E13 | "pub const fn len(&self) -> usize" (String's own method; the earlier quote "pub fn len(&self) -> usize" on that page is `str::len`, reached through `Deref`) / "pub fn push_str(&mut self, string: &str)" / "pub const fn into_bytes(self) -> Vec<u8>" / "This consumes the String, so we do not need to copy its contents." |
| 40 | `String + &str` consumes the left side, reuses its buffer, borrows the right (step 14) | String docs ; measured E13 | "This consumes the String on the left-hand side and re-uses its buffer (growing it if necessary)." / "The string on the right-hand side is only borrowed;" |
| 41 | Returning a tuple to give ownership back is the clumsy pre-reference pattern; references remove the need (step 15) | Book ch4.2 | "When functions have references as parameters instead of the actual values, we won't need to return the values in order to give back ownership, because we never had ownership." |
| 42 | E0382 = a variable used after its contents moved; fixes: borrow, clone, Copy, Rc/RefCell (steps 16, 19) | https://doc.rust-lang.org/error_codes/E0382.html ; measured E2 | "A variable was used after its contents have been moved elsewhere." / "Sometimes we don’t need to move the value. Using a reference, we can let another function borrow the value without changing its ownership." / "We can mark our own types Copy if all their members also are marked Copy." |
| 43 | rustc's E0382 spans, note (``consider changing this parameter type in function `ship` to borrow instead if owning the value isn't necessary``, with the label `this parameter takes ownership of the value`) and clone help, verbatim for rustc 1.97 (steps 16, 18, 20, 22) | measured E2, E16, E17, E19 ; Book ch4.1 shows the same format | "error[E0382]: borrow of moved value: `s1`" / "move occurs because `s1` has type `String`, which does not implement the `Copy` trait" |
| 44 | E0505 = moved while borrowed; fixes: avoid the move, release the borrow before the move, Copy (step 17) | https://doc.rust-lang.org/error_codes/E0505.html ; measured E15 | "A value was moved out while it was still borrowed." / "Release borrow before move." / "Try to avoid moving the variable." |
| 45 | Values may not be moved while borrowed; a reference's borrow lasts over the smallest span covering its uses (non-lexical); a value with a destructor that holds a borrow uses it again when dropped, so "last use" means the plain-reference case (step 17, internals) | https://rust-lang.github.io/rfcs/2094-nll.html ; Book ch4.2 | "The basic idea of the borrow checker is that values may not be mutated or moved while they are borrowed…" / "The compiler will infer this lifetime to be the smallest lifetime that it can have that still encompasses all the uses of the reference." / "Note that a reference's scope starts from where it is introduced and continues through the last time that reference is used." / RFC 2094: "if you have a value v of type Foo<'a> that implements Drop, then 'a typically cannot dangle when v is dropped" ; measured (fact-check): a `Guard<'a>(&'a [u8])` with `Drop` makes `ship(batch)` E0505 "borrow might be used here, when `g` is dropped" |
| 46 | Moves count as deep writes for the borrow checker (internals) | RFC 2094 | "Note that moves count as “deep writes”." |
| 47 | `for` loops call `IntoIterator::into_iter` on the iterated value (step 18, internals) | https://doc.rust-lang.org/reference/expressions/loop-expr.html ; measured E16 | "A for expression is a syntactic construct for looping over elements provided by an implementation of std::iter::IntoIterator." / "let result = match IntoIterator::into_iter(iter_expr) {" |
| 48 | A move inside a loop is rejected ("in previous iteration of loop"); clone per lap = 3 allocations (step 18) | measured E16, E1 | n/a |
| 49 | Conditional moves compile; use after a maybe-move is E0382; drop state may be tracked at run time with a drop flag (step 20, internals) | measured E17 ; https://doc.rust-lang.org/nomicon/drop-flags.html | "It turns out that Rust actually tracks whether a type should be dropped or not at runtime." / "As a variable becomes initialized and uninitialized, a drop flag for that variable is toggled." |
| 50 | Lines 2–4 of step 21 make 1 allocation of 1,000,000 bytes (step 21) | measured E18 | n/a |
| 51 | If a type can be Copy it generally should; Copy is part of a public API (step 22, internals, production) | Copy docs | "Generally speaking, if your type can implement Copy, it should." / "implementing Copy is part of the public API of your type. If the type might become non-Copy in the future, it could be prudent to omit the Copy implementation now, to avoid a breaking API change." |
| 52 | `Config` is 12 bytes; with `derive(Clone, Copy)` the loop compiles (step 22) | measured E19 | n/a |
| 53 | Place vs value expressions; which places can be moved out of (internals) | Reference expressions | "A place expression is an expression that represents a memory location." / "If the type of that value implements Copy, then the value will be copied." / "Only the following place expressions may be moved out of:" / "Variables which are not currently borrowed." / "Temporary values." / "Fields of a place expression which can be moved out of and don’t implement Drop." / "The result of dereferencing an expression with type Box<T> and that can also be moved out of." |
| 54 | `v[i]` on a Vec is `*Index::index(&v, i)`; moving out of it is E0507 (internals) | https://doc.rust-lang.org/reference/expressions/array-expr.html ; https://doc.rust-lang.org/error_codes/E0507.html ; measured E20 | "For other types an index expression a[b] is equivalent to *std::ops::Index::index(&a, b)" / "A borrowed value was moved out." |
| 55 | `move` closures capture by value (needed when the body only borrows: E0373 otherwise, measured); a body that consumes a capture captures it by value even without `move` (measured); a `Copy` capture is copied (measured); Fn traits depend on what the body does; a body moving a capture out is FnOnce; moving out in Fn/FnMut is E0507 (internals) | https://doc.rust-lang.org/std/keyword.move.html ; https://doc.rust-lang.org/book/ch13-01-closures.html ; E0507 docs ; measured E20 | "the traits implemented by a closure type are determined by what the closure does with captured values, not how it captures them" / "A closure that moves captured values out of its body will only implement FnOnce and none of the other Fn traits because it can only be called once." / "This can also happen when using a type implementing Fn or FnMut, as neither allows moving out of them" |
| 56 | `clone_from` can reuse the destination's resources (internals) | Clone docs | "a.clone_from(&b) is equivalent to a = b.clone() in functionality, but can be overridden to reuse the resources of a to avoid unnecessary allocations." |
| 57 | Ownership gives memory safety without a garbage collector (step 7 framing, internals intro) | https://doc.rust-lang.org/nomicon/ownership.html | "Ownership is the breakout feature of Rust. It allows Rust to be completely memory-safe and efficient, while avoiding garbage collection." |
| 58 | `#[global_allocator]` lets a program route allocations through its own allocator (step 4 method, lab 2) | https://doc.rust-lang.org/std/alloc/index.html | "This attribute allows configuring the choice of global allocator." |
| 59 | E0382's alternative for shared ownership is Rc/RefCell (internals, pointer to later topic) | E0382 docs | "Alternatively, if we don’t control the struct’s definition, or mutable shared ownership is truly required, we can use Rc and RefCell" |

No other factual claims go on screen or in the Deep dive. In particular: no claim that a Go slice header is 24 bytes, no claim about Python or Java memory reclamation, no timings, no incident names.

---

## Expert-list mapping (`expert-list.json`, every item placed)

| # | Expert item (short) | Placement |
|---|---|---|
| 1 | One owner responsible for the destructor; owners include bindings, fields, containers, closures | Steps `Two owners would free twice`, `Signatures are ownership contracts`; Deep dive `### What a move is, as the Reference states it` (owners beyond variables: fields, container slots, closure environments) |
| 2 | A move copies only inline bytes and invalidates the source; no implicit deep copy | Steps `What does let s2 = s1 copy?`, `Proof: the buffer never moved` |
| 3 | Invalidation is a compile-time property of the place; reassign revives | Step `Can a moved-out variable come back?` |
| 4 | Loops: `for x in v` consumes; moving inside a loop body | Step `A move inside a loop`; Deep dive `### Where moves hide` |
| 5 | Copy = bitwise, no user code, source usable; Clone explicit and visible | Steps `Copy: when the bits are the whole value`, `.clone() is where the cost is` |
| 6 | The E0382 clone help is a suggestion, not the fix | Steps `Reading E0382, span by span`, `Back to the batch` |
| 7 | `Rc::clone`/`Arc::clone` only bump a count | Other topic: Ch.4 "Box, Rc, and Arc ownership shapes" (its line: "`Rc` for a single-threaded refcount (`!Send`), `Arc` for an atomic refcount"; fact-check: moved from "Ownership topology over shared mutability", whose line is about `Arc<Mutex<T>>` topology, not clone cost); mentioned in step `.clone() is where the cost is` footnote and Deep dive `### Copy, Clone and the types in between` |
| 8 | Copy and Drop mutually exclusive (E0184) | Step `A file descriptor that is just an i32` |
| 9 | Deriving Copy is a semver commitment | Step `Prove it · 3 of 3` (explain); Deep dive `### Copy, Clone and the types in between`; `## In production` |
| 10 | `&T` Copy, `&mut T` never; reborrowing elsewhere | Step `Copy: when the bits are the whole value`; Deep dive `### Copy, Clone and the types in between`; reborrowing: Ch.2 "Aliasing XOR mutability" (its line: "Reborrowing (`&mut *x`, implicit reborrows at call sites)") |
| 11 | Signatures as ownership contracts; by-value `self` | Steps `Signatures are ownership contracts`, `Methods sign the same contract`, `Which signature would you ship?` |
| 12 | `&mut T` promises exclusivity | Step `Signatures are ownership contracts`; full model in Ch.2 "Aliasing XOR mutability" (its line: "many `&T` or exactly one `&mut T`, never both") |
| 13 | E0382's three spans and which fix changes which span | Step `Reading E0382, span by span` |
| 14 | E0505: release the borrow before the move | Step `E0505: a move inside a live borrow` |
| 15 | `let s = v[i]` for `Vec<String>` is E0507; take with remove/swap_remove/pop/into_iter | Deep dive `### Where moves hide` (indexing) |
| 16 | Moving out through `&mut`: `mem::replace`/`mem::take`/`Option::take` | Other topic: "Partial moves and destructuring as transfer" (its line: "`Option::take`/`mem::replace`/`mem::take` are the idioms for moving out of a `&mut`"); one sentence pointer in Deep dive `### Where moves hide` |
| 17 | Which places can be moved out of; E0509 for fields of Drop types | Deep dive `### What a move is, as the Reference states it` (the list); E0509 detail in other topic "Partial moves and destructuring as transfer" (its line: "why you cannot partially move out of a type that implements `Drop`") |
| 18 | Moving a Box moves one pointer; `*b` is movable | Step `Size decides the cost; Box caps it`; `*b` movable in Deep dive `### What a move is, as the Reference states it` |
| 19 | Large by-value moves are real memcpy, not guaranteed to be removed | Steps `Is a move always cheap?`, `Size decides the cost; Box caps it`; Deep dive `### Lab 3 · Find the memcpy` |
| 20 | No move constructor; addresses change at any move | Steps `C++ std::move leaves a shell`, `Is a move always cheap?` (explain); Deep dive `### A move is a bit copy, and addresses change` |
| 21 | C++ `std::move` is a cast; moved-from object still destroyed | Steps `C++ std::move leaves a shell`, `One line, six meanings`; Deep dive `### C++, Go, Java and Python, precisely` |
| 22 | Conditional moves and drop flags | Step `Prove it · 1 of 3` (conditional moves compile, maybe-moved is moved, the drop flag named); mechanism in the next topic "RAII, drop order, and leak safety" (its line: "deterministic destruction") |
| 23 | Closures are owners; `move`; Fn traits by body; E0507 in Fn/FnMut | Deep dive `### Where moves hide` (closures) |
| 24 | Patterns move; `_` doesn't; matching on a reference | One sentence in Deep dive `### Where moves hide`; detail in other topic "Partial moves and destructuring as transfer" (its line: "Pattern matching (by-value vs binding modes, Rust 2024 match-ergonomics reservations) works as a resource-transfer boundary") |
| 25 | Self-referential values and `Pin` | Out of scope (async/unsafe material); one sentence in Deep dive `### A move is a bit copy, and addresses change`; self-referential structs also in Ch.2 "Zero-copy parsing with borrowed views" (its line: "Self-referential structs and why `yoke`/`ouroboros` exist") |

## Syllabus clauses → where taught

| Clause (verbatim) | Step(s) |
|---|---|
| "one live owner is responsible for destruction" | `Two owners would free twice`; `C++ std::move leaves a shell` |
| "A move is a shallow bitwise copy" | `What does let s2 = s1 copy?`; `Proof: the buffer never moved`; `Is a move always cheap?` |
| "that statically invalidates the source binding" | `Two owners would free twice`; `Can a moved-out variable come back?` |
| "with no implicit deep copy" | `Proof: the buffer never moved`; `.clone() is where the cost is` |
| "`Copy` vs `Clone` marks where the cost is" | `Copy: when the bits are the whole value`; `A file descriptor that is just an i32`; `.clone() is where the cost is` |
| "Signatures act as ownership contracts (`T` takes, `&T` borrows, `&mut T` borrows exclusively, returning `T` hands ownership back)" | `Signatures are ownership contracts`; `Methods sign the same contract`; `Which signature would you ship?` |
| "Reading E0382 (use after move)" | `Reading E0382, span by span`; `A move inside a loop`; `Back to the batch` |
| "and E0505 (move while borrowed)" | `E0505: a move inside a live borrow` |

---

## Notes for the builder (decisions already made)

- **Narration (`narration.json`)**: one entry per step, `answer` on steps 2, 5, 9, 11, 15, 18, 20, 21, 22 only. Spoken forms: "E zero three eight two", "E zero five zero five", "E zero one eight four" (if the transcript check rejects them, rewrite as "the use-after-move error" / "the move-while-borrowed error"), "vec" → "vector", `String` → "string", `&T` → "a shared reference", `&mut T` → "a mutable reference", `.clone()` → "clone", `size_of` → "the size of the type", numbers as words ("one million", "twenty-four bytes", "four thousand and ninety-six"), `rustc` → "the compiler", C++ → "C plus plus", `std::move` → "standard move". No digits, symbols or code names in any line.
- **Visual labels** (`aria-label` on every `Svg`) carry the step's whole point in a sentence (text equivalent).
- **Durations** are as given; predict question frames are short because the reveal is a still frame.
- Use `fmt()` for every number ≥ 1,000 shown in drawings.

---

## Progress

- Sources, OUTLINE, FACT-CHECK, expert list done. Next: coverage.json and the build (section 3).

- 2026-10-11 adversarial fact-check done (rustc 1.97.0, g++ 13.3): corrections applied in place above, each marked "Fact-check" where the reason isn't obvious; verdicts and open items in `FACT-CHECK.md`.

## Changes after final

### Review fixes, 2026-10-11 (REVIEW.md, 22 findings)

The plan changed in these places, each for the reason given:

- **Prerequisites: new item 05 Closures (Book 13.1), `closures` added to the registry `declared`, and Book 15.3 (`Drop`) linked from item 04** (findings 1, 2). The Deep dive uses `move` closures and the reel uses `Drop`; neither is in "the Book through ch. 10". The syllabus is not reordered.
- **Thread example removed** (finding 1, option a): Lab 4 row and Prove it 6 now use a closure that is returned (`-> impl Fn() -> usize`, E0373 without `move`) or kept in a local (`let f = move || data.len()`, E0382). Why `thread::spawn` needs `move` is one clause pointing at Chapter 2 "Borrows across thread and task boundaries". Reason: `thread::spawn` and `'static` are syllabus 2.2, later in this domain.
- **Step 12 gains a fifth chip, `Vec<u8> (1,000,000)` = 24**, the topic's central contrast, and its chips move below the drawing and lose the `data-interactive` wrapper (finding 6, and the reel test: a full-width `data-interactive` row at the top of the visual swallowed a swipe that started on it, because the player ignores presses there). Bars use 56-unit rows, `h` 350.
- **Step 22 and Prove it 3 use `Point3 { x, y, z: f32 }`** instead of `Config` (finding 20): a type that clearly will not grow, so `Copy` is the unambiguous answer. The `&Config` caution stays as one sentence about config structs.
- **Frontier gains the ergonomic-clones bullet** (finding 7), written from the fetched 2025H2 and 2026 goal pages and the nightly `UseCloned` and `Share` docs, with quotes in `SOURCES.md`.
- **Time numbers** (finding 8): Lab 5 and "In production" give the clone time as measured on two machines (about 18 and 72 microseconds), `examples.py` asserts only the bound 5 us to 2 ms; step 19 says "tens of microseconds" without a figure.
- **Drop-flag promise** (finding 3): step 20 points to this topic's Deep dive; the `coverage.json` item is placed there instead of at the RAII topic.
- **New claims, each executed in `examples.py`:** assignment to a live place drops the old value; `Vec<String>` clone is 1 + n allocations; `String +` can reallocate; first move into a `Box`; returned large values; `&[u8]` vs `&Vec<u8>`; generic `T` as `&U`; `Into<String>`; plain-bit handles are not automatically `Copy`.
- **No incident cited** (finding 15): no public post-mortem with a verifiable primary page was found; recorded in `coverage.json` `gapReview.notes`, not invented.
- **Rust for Rustaceans not used** (finding 12): not freely available; the FLS section 15 is quoted instead.
- Narration lines for steps 10, 12, 14 and 23 reworded or extended (findings 6, 17, 22). No audio exists yet for this topic, so nothing is stale.

### Looks review fixes, 2026-10-11 (REVIEW.md, "Looks and learning review", 21 findings)

The plan changed in these places, each for the reason given. Shared code (`site/src/reels/`, `site/tests/`, `kit.tsx`) is untouched.

- **Reveal fades are shorter** (`rv`: 0.15 s with 0 to 0.1 s delays instead of 0.45 s with up to 0.45 s). Reason: the shared test screenshots 250 ms after the click (finding 1, a harness issue), so a reveal that finishes inside 250 ms is captured complete.
- **Step 1** gains the `ptr · len · cap` legend over the first card. Reason: the opening card's numbers meant nothing without it (finding 2).
- **Steps 2, 9, 11, 15 captions (the `explain` text) shortened** to 75 words or fewer (60 where options wrap); the dropped sentences are already in the Deep dive. Reason: a long reveal pushed the title under the nav on desktop and the caption under the drawing on phone (findings 3, 19). Step 5's question now asks "Does this compile, and what does it print?" and its boxes are labelled with the statements (finding 5).
- **Step 3** burst sits behind the buffer only and is lighter; the `}` becomes a scope line with `}` as its label. **Step 6** counter moves 8 units down (finding 4).
- **Step 7** colours the language latte and the code crema. The three alias rows are NOT folded into one: the title promises six meanings and the six rows are the six (finding 6, partly).
- **Step 8** rules go taupe, one caramel test label ("owns anything beyond its bytes?") sits above the bins, chips are mocha and only the two reference chips are caramel (finding 7). The thin line from the reference chips to the `&T` rule is not drawn: it would cross the bins.
- **Step 12** defaults to `Vec<u8> (1,000,000 bytes)`; Box and Vec rows get a dashed "owns" bar on a log scale (denominator 20, so 1,000,000 fits); the bar widths asserted in `examples.py` are updated (finding 8).
- **Step 13** leaves a trace in each lane's final state (arrow, two parked `&`, a thick `&mut`, `new` token with an arrow back); verdicts are crema (finding 9).
- **Step 14** line says "appends in place, may grow"; verdicts on the signature baselines; a dashed `s: String` ghost stays beside `v` (finding 10).
- **Step 15** drawing becomes the caller's timeline (`batch` card, `checksum(batch)`, `batch.len()`) and, after the answer, one row per option with a small card glyph for its effect; the signatures stay on the buttons only (finding 11).
- **Step 16** drops the sub-label, dims the note, spaces the chips (finding 12). **Step 17** bars move into the gutter, with a cherry ring and `move` labels (finding 13). **Step 18** keeps the batch in the `ship` box (moved above the loop), adds a direction arrow and a `lap 2: batch gone` label (finding 14). **Step 19** strike raised; the card-and-buffer motif returns beside each of the three counter blocks (findings 15, 20).
- **Bottom spacing** on steps 12, 16, 20 (finding 16). **Step 22** reuses step 8's bin with a `Point3` chip and three 4-byte cells (finding 17); its narration says "point" not "config". **Step 23** wraps before the separator and draws four arrows (finding 18).
- **Pacing (finding 20), the reasonable part:** step 10 swaps its second table for the code listing where `.clone()`, `to_vec()` and `to_owned()` each stamp a cherry buffer (new execution in `examples.py`); step 21 becomes a → b slide, clone stamp, c → d slide, `total: 1 allocation`; step 19 and 22 as above. Steps 14 to 17 stay as ordered text-dominated frames: re-planning their order and durations is out of scope for a fix batch; step 15 now has a picture, which breaks the run.
