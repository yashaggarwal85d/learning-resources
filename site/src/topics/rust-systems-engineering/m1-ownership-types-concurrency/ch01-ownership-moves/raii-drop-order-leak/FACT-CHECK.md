# Fact-check: RAII, drop order, and leak safety

Every claim in `OUTLINE.md` (claims list, step captions and explains, predict questions and options, Deep dive plan, examples table) checked against the primary sources on 11 October 2026: their raw fetched texts in `sources/*.txt` (fetched with `scripts/sources.mjs`, never through a summarising tool), not only the quotes in `SOURCES.md`. Current stable is the 1.99 baseline (the std pages were fetched as "std 1.99.0 (b940084d7 2026-09-28)"); every code claim and predicted output was re-run on the installed rustc 1.97.0 (2d8144b78 2026-07-07), x86_64 Linux, under both `--edition 2021` and `--edition 2024`, plus `cargo fix --edition` (cargo 1.97.0) for step 10. Nothing in the 1.97 → 1.99 gap touches these behaviours: the 1.99 docs describe the same rules, and the one version-dated item (`ManuallyDrop` + `Box`, fixed in 1.96.0) is older than both.

Corrections were applied to `OUTLINE.md` (each noted where it was made, as "Fact-check"). New sources were fetched and appended to `SOURCES.md`; `node scripts/sources.mjs check` passes (438 quotes word for word, 0 problems).

Source shorthand: **Ref-D** https://doc.rust-lang.org/reference/destructors.html · **Ref-P** https://doc.rust-lang.org/reference/patterns.html · **Ref-S** https://doc.rust-lang.org/reference/items/static-items.html · **EG-iflet** https://doc.rust-lang.org/edition-guide/rust-2024/temporary-if-let-scope.html · **EG-tail** https://doc.rust-lang.org/edition-guide/rust-2024/temporary-tail-expr-scope.html · **EG-2024** https://doc.rust-lang.org/edition-guide/rust-2024/index.html · **std-Drop** https://doc.rust-lang.org/std/ops/trait.Drop.html · **std-drop** https://doc.rust-lang.org/std/mem/fn.drop.html · **std-forget** https://doc.rust-lang.org/std/mem/fn.forget.html · **std-MD** https://doc.rust-lang.org/std/mem/struct.ManuallyDrop.html · **std-Box** https://doc.rust-lang.org/std/boxed/struct.Box.html · **std-Copy** https://doc.rust-lang.org/std/marker/trait.Copy.html · **std-File** https://doc.rust-lang.org/std/fs/struct.File.html · **std-RwLock** https://doc.rust-lang.org/std/sync/struct.RwLock.html · **std-scope** https://doc.rust-lang.org/std/thread/fn.scope.html · **std-Vec** https://doc.rust-lang.org/std/vec/struct.Vec.html (drain, "Leaking") · **std-pin** https://doc.rust-lang.org/std/pin/index.html · **Nom-L/D/F/K** Nomicon Leaking / Destructors / Drop Flags / Drop Check (https://doc.rust-lang.org/nomicon/…) · **RFC1066** https://rust-lang.github.io/rfcs/1066-safe-mem-forget.html · **E0040/E0184/E0597** https://doc.rust-lang.org/error_codes/… · **lints** https://doc.rust-lang.org/rustc/lints/listing/deny-by-default.html · **AD2015** Aria Desires, "Pre-Pooping Your Pants With Rust", https://faultlore.com/blah/everyone-poops/ (April 27, 2015; secondary) · **measured** = re-run here on rustc 1.97.0.

## Claims list (claims 1-60 as planned, 61-70 added by this check)

| # | Verdict | Note | Source |
|---|---|---|---|
| 1 | CONFIRMED | Verbatim in [destructors.intro]. Measured: `assign: ["v1", "v2"]`. | Ref-D |
| 2 | CONFIRMED | [destructors.operation] and std-Drop's "two components"; std-Drop's `HasTwoDrops` example prints `Running!`, `Dropping HasTwoDrops!`, then the two `Dropping HasDrop!` lines, as the Deep dive plans. | Ref-D; std-Drop |
| 3 | CONFIRMED | Struct fields, tuple fields, array elements all front to back. Measured both editions: `stage: ["stage", "name", "input", "spill"]`, `tuple: ["t0", "t1", "t2"]`, `array: ["e0", "e1", "e2"]`. | Ref-D; std-Drop; std-MD |
| 4 | CONFIRMED | "dropped in an unspecified order". | Ref-D |
| 5 | CONFIRMED | Both sentences in Nomicon Destructors. | Nom-D |
| 6 | CONFIRMED | "useful … for types which directly manage a resource … memory … file descriptor … network socket". | std-Drop |
| 7 | CONFIRMED | [destructors.scope.intro]; measured `locals: ["c", "b", "a"]` both editions. | Ref-D; std-Drop; Nom-K |
| 8 | CONFIRMED | [destructors.scope.params]. The Reference's `patterns_in_parameters`, copied exactly, prints `drop(3) drop(2) drop(0) drop(1)` (measured, both editions); our `f(a, (b, c)) { let d }` gives `d c b a`. | Ref-D |
| 9 | CORRECTED | Rule confirmed (the or-pattern sentence is now quoted). **The Deep dive's "the Reference's `(a, b, 1) \| (b, a, 2)` example" is not in the current Reference.** Its example is `or_pattern_drop_order((Ok([x, y]) \| Err([y, x])))`; measured, both calls print `drop(Declared last, dropped first)` then `drop(Declared first, dropped last)`. Our `(a, b, 1) \| (b, a, 2)` case (needs parentheses in a `let`) does print `drop(a) drop(b)` and may stay as our own example. E13 updated. | Ref-D [destructors.scope.bindings.or-patterns] |
| 10 | CONFIRMED | Measured `shadow: ["x2", "y", "x"]`. | measured |
| 11 | CONFIRMED | Measured `memdrop: ["m", "n"]`, `condmove: ["z", "cond"]` (not moved), `["cond", "z"]` (moved). | measured; Ref-D example "Drops when moved" |
| 12 | CONFIRMED | Docs: "This function is not magic; it is literally defined as pub fn drop<T>(_x: T) {}" (signature line shows "1.0.0 (const: unstable)"). Measured `copy_drop: 5`; note rustc warns there (`dropping_copy_types`), added to E6. | std-drop |
| 13 | CONFIRMED | Measured: `error[E0040]: explicit use of destructor method`, label `explicit destructor calls not allowed`, `help: consider using `drop` function`, with or without `mut`, and also inside `unsafe { }` (so option 4 of step 5 is wrong, as planned). | E0040; std-Drop; measured |
| 14 | CONFIRMED | `fn drop(&mut self)`; "self has not yet been deallocated". | std-Drop |
| 15 | CONFIRMED | Docs: "will likely abort"; measured on 1.97.0: `panic in a destructor during cleanup`, `thread caused non-unwinding panic. aborting.`, SIGABRT. Production bullet now carries both. | std-Drop; measured |
| 16 | CONFIRMED | Both rationales, kept apart as planned. | std-Copy; std-Drop |
| 17 | CORRECTED (wording) | Step 6 caption paraphrased E0184 as "would be unsound"; it now quotes "is incorrect and can lead to memory unsafety". Measured header and label exact. | E0184; measured |
| 18 | CONFIRMED | All four sentences in std-File. | std-File |
| 19 | CONFIRMED | Measured: `closes=1 exists=false`; `size_of::<File>() = 4`, `PathBuf` 24, `SpillFile` 32, `ManuallyDrop<SpillFile>` 32 (target facts). | measured |
| 20 | CONFIRMED | Measured: bad `dir exists=true file exists=false`; good both false. The std-MD / Nomicon disagreement in emphasis is real (std: reorder; Nomicon dropck: "fragile and subtle … better to use the ManuallyDrop wrapper"). | std-MD; Nom-K; measured |
| 21 | CORRECTED | List now quoted from the fetched text. **The Deep dive's list was outdated:** the current Reference says "The entire function" (not "the function body") and "Each operand of a lazy boolean expression" (not "the second operand"); it also lists "The pattern-matching condition(s) and consequent body of if" and "The pattern-matching condition and loop body of while" as 2024 entries, and splits guards into non-pattern-matching operands and pattern-matching guards. Step 9's caption ("`&&`/`\|\|` operands … each get their own") was already right. | Ref-D [destructors.scope.temporary.enclosing] |
| 22 | CONFIRMED | Note quoted; measured `match: ["arm", "scrut", "after-stmt", "tmpmatch"]`, and E10 `in arm: try_lock ok = false`. | Ref-D; measured |
| 23 | CORRECTED | **`let r = id(&String::from("a"));` alone compiles** (only an unused-variable warning, measured); it is E0716 once `r` is used later (`println!("{r}")`, measured). Step 9 caption, Deep dive and E9 fixed. The extending list was incomplete: arguments of tuple-struct / tuple-variant constructors extend (`Some(&temp())`, measured: kept to the block end), braced (not all) structs, `async` block tails and labelled `break` operands do not extend; `pin!`/`format_args!` measured extending on 1.97.0. | Ref-D [destructors.scope.lifetime-extension.exprs]; measured |
| 24 | CONFIRMED | [destructors.scope.operands]. | Ref-D |
| 25 | CONFIRMED | Measured E10 exactly, both editions. | measured |
| 26 | CONFIRMED | Quotes support it; measured `else-path` 2021 `["else", "guard", "after-if", "outer"]` vs 2024 `["guard", "else", "after-if", "outer"]`; `then-path` identical. Rust 2024 = release 1.85.0. | EG-iflet; EG-2024; Ref-D |
| 27 | CONFIRMED | Measured: 2021 `try_write` → `WouldBlock`, real `write()` still running after 5 s (killed, exit 124 under `timeout`); 2024 prints `set to true` / `set`, `Some(true)`. The Guide says "causes a deadlock"; std-RwLock allows a panic instead; on 1.97.0 x86_64 Linux it hangs. Step 1's code drops the Guide's `if v.is_none()` check: a fair reshaping. | EG-iflet; std-RwLock; measured |
| 28 | CONFIRMED | | std-RwLock |
| 29 | CORRECTED (wording) | Lint text measured exactly ("`if let` assigns a shorter lifetime since Edition 2024"; help "a `match` with a single arm can preserve the drop order up to Edition 2021"). **But the suggestion and the code `cargo fix --edition` actually writes have two arms** (`Some(x) => {…} _ => {…}`, measured; also the Guide's own rewrite). Step 10's explain said "a single-arm `match`" while its reveal showed two arms; the explain and the Deep dive now say "a `match` with a `_` arm for the `else`". Measured too: `cargo fix --edition` leaves `edition = "2021"` in `Cargo.toml`; the rewritten `match` under 2024 still gives `WouldBlock`. | EG-iflet; measured |
| 30 | CONFIRMED (wording) | Step 11 now says 2021 extended tail temporaries "to the next temporary-scope boundary (usually the end of the enclosing statement)", the Guide's terms. Measured `tail` 2021 `["local", "tail"]`, 2024 `["tail", "local"]`. | EG-tail; Ref-D |
| 31 | CONFIRMED | Measured 2021: `error[E0597]: `c` does not live long enough` + `note: the temporary is part of an expression at the end of a block;`; 2024 prints `2`. | EG-tail; measured |
| 32 | CONFIRMED | Measured: 2021 prints `4`; 2024 `error[E0716]: temporary value dropped while borrowed` (the Guide names no code). | EG-tail; measured |
| 33 | CONFIRMED | Measured lint header `relative drop order changing in Rust 2024`. | EG-tail; measured |
| 34 | CONFIRMED | | std-drop; EG-tail |
| 35 | CONFIRMED (precision) | The Nomicon says the compiler "can theoretically generate more efficient code" where state is static; step 13 now says "can emit". MIR measured (`--crate-type lib --emit=mir`, 1.97.0): `_5 = const false;`, `_5 = const true;`, `switchInt(copy _5)`, `drop(_2)`. | Nom-F; measured |
| 36 | CORRECTED (wording) | Step 14's caption listed the non-unwinding ABI boundary among "do not run"; the Reference says "either no destructors will run, or all destructors up until the ABI boundary will run". Fixed. Measured exits: 0, 101, 3, and SIGABRT under `-C panic=abort` (134 in a shell, -6 from Python). | Ref-D [destructors.process-termination]; measured |
| 37 | CONFIRMED | Also: forget "reclaim[s] the space taken by the variable" (used in Prove it 6's correction). | std-forget |
| 38 | CONFIRMED | | std-forget |
| 39 | CONFIRMED | "even then, ManuallyDrop is typically preferred" is said of FFI/unsafe uses; the "Relationship with ManuallyDrop" section is about transferring ownership of raw parts, matching step 17. | std-forget |
| 40 | CONFIRMED | Measured: forget `SpillFile` → closes +0, file exists, live allocations +1, `/proc/self/fd` +1; forget 64 KiB `Vec` → +1 live, `BYTES` +65,536. | measured |
| 41 | CONFIRMED | Measured `size_of::<ManuallyDrop<SpillFile>>() == 32`; `ManuallyDrop::new(SpillFile)` → no close, file stays; `into_inner` + `drop` → closes +1; `ManuallyDrop<Vec>` +1 live, `into_inner` + drop +0. | std-MD; measured |
| 42 | CONFIRMED | Measured: `let r: &'static mut [u8; 64] = Box::leak(Box::new([7u8; 64]));` compiles in safe code, +1 live allocation. | std-Box; measured |
| 43 | CONFIRMED | | std-Box |
| 44 | CONFIRMED | Both sentences in [destructors.forget]. | Ref-D |
| 45 | CONFIRMED | | Nom-L |
| 46 | CONFIRMED | | Nom-L |
| 47 | CONFIRMED (precision) | Nomicon design confirmed. Added: the implementation sets `len` to the range **start** (measured: `drain(..)` → `len 0`, `cap 3`; `drain(1..3)` of five → `len 1`, `cap 5`, so elements outside the range are lost), and std promises only "may have lost and leaked elements arbitrarily, including elements outside the range". Step 19 draws `drain(..)`, so its `len 3 → 0` stands. | Nom-L; std-Vec; AD2015 (`self.set_len(a)`); measured |
| 48 | CONFIRMED | | Nom-L |
| 49 | CORRECTED (wording) | Issue #24292 is the soundness report the Nomicon points to ("for more information you may refer issue #24292"); AD2015 gives its title, "std::thread::JoinGuard (and scoped) are unsound because of reference cycles". Step 18 had called it "the removed API issue". | Nom-L; AD2015 |
| 50 | CONFIRMED | Start Date 2015-04-15; RFC issue rust-lang/rust#25186. | RFC1066 |
| 51 | CONFIRMED | | RFC1066 |
| 52 | CONFIRMED (precision) | Stable 1.63.0. The docs' example ends with `assert_eq!(x, a.len());` and prints no `ok`: E12's `ok x=4` needs one added `println!` (measured: `ok x=4`). Step 19 now says "std's later design" rather than "the replacement" (the Nomicon says only "a completely different design"). | std-scope; measured |
| 53 | CONFIRMED | Measured: `error[E0597]: `world.days` does not live long enough` … `when `world` is dropped and runs the destructor for type `World<'_>``. | Nom-K; std-Drop; measured |
| 54 | CONFIRMED | "Now `ManuallyDrop`" is our reading of the Nomicon's "in the future" sentence; say so. | Nom-D |
| 55 | CONFIRMED | Measured: `error[E0509]: cannot move out of type `Guard`, which implements the `Drop` trait`. | measured |
| 56 | CONFIRMED | Sources fetched: Ref-P "Unlike identifier patterns, it does not copy, move, or borrow the value it matches."; lints: `let_underscore_lock` description and `#[deny(let_underscore_lock)]` (part of `#[deny(let_underscore)]`) on by default. Measured (both editions): `error: non-binding let on a synchronization lock` for `RwLock::write` and `Mutex::lock`; with the lint allowed: `let _` → `try_read ok = true`, `let _g` → `false`, `let _ = g` → `false`; `wildcard: ["wild", "g", "f"]`. | Ref-P; lints; measured |
| 57 | CONFIRMED | Sentence now quoted: "Before Rust 1.96.0, if you had a ManuallyDrop<T>, where the type T was a Box or contained a Box inside, then dropping the T followed by moving the ManuallyDrop<T> was considered to be undefined behavior." Not outdated for 1.97/1.99 (it is a historical note). | std-MD |
| 58 | CONFIRMED | | EG-2024 |
| 59 | CORRECTED | **A fetched source does use the word.** AD2015 opens with a section headed "Leakpocalypse" and says "Leakpocalypse 2k15" (byline Aria Desires, dated April 27, 2015). Attribution rule now in the outline: the community's name for the episode, as used in that post, cited as secondary; don't claim who coined it; credit the byline "Aria Desires"; cite the facts themselves from RFC 1066 and the Nomicon. The author also renamed "Pre-Pooping Your Pants" to "Leak Amplification", so step 19's narration now says "leak amplification" instead of "pre-poop". | AD2015 |
| 60 | CONFIRMED | Instrument compiled verbatim from CHAPTER.md A.3 under 2024 with no `unsafe` beyond the impl (the inner `unsafe { }` blocks and `unsafe impl`). | measured |
| 61 | CONFIRMED (new) | `Vec::drain` "Leaking" section, fetched (was "still to fetch"). | std-Vec |
| 62 | CONFIRMED (new) | The "Leakpocalypse" name, issue title, leak-reliance ladder, and the rename to "Leak Amplification". Secondary source. | AD2015 |
| 63 | CONFIRMED (new) | `Pin`'s Drop guarantee and that leaking still satisfies it; frontier (e) can keep its sentence. | std-pin |
| 64 | CONFIRMED (new) | "Static items do not call drop at the end of the program." (expert item 28 now placed in the Deep dive). | Ref-S |
| 65 | CONFIRMED (new) | Wildcard does not copy, move or borrow. | Ref-P |
| 66 | CONFIRMED (new) | RAII comparison now sourced: Go spec go1.27 "Defer statements"; Python 3.15 "The with statement"; JLS SE 27 §14.20.3; C++ draft [class.dtor] (automatic objects destroyed at block exit) and [lib.types.movedfrom] ("valid but unspecified state"). "A null-out in every move constructor" is our inference from the last two, to be worded as such. | https://go.dev/ref/spec ; https://docs.python.org/3/reference/compound_stmts.html ; https://docs.oracle.com/javase/specs/jls/se27/html/jls-14.html ; https://eel.is/c++draft/class.dtor ; https://eel.is/c++draft/lib.types.movedfrom |
| 67 | CORRECTED (new) | Prove it 6: **the 24-byte `PathBuf` handle is not leaked** (forget reclaims the variable's space); what leaks per failure is one heap allocation (the path bytes), one descriptor and one file (measured +1/+1). The limit is now sourced: systemd's `DefaultLimitNOFILE=` "defaults to 1024" (soft); with stdin/stdout/stderr open, about 1,021 failures. E14 no longer asserts `24`. | https://raw.githubusercontent.com/systemd/systemd/main/man/systemd-system.conf.xml ; std-forget; measured |
| 68 | CONFIRMED (new) | "Just before Rust 1.0": RFC start date 2015-04-15 and "an acceptable change to cherry-pick into the 1.0 release"; Rust 1.0 announced May 15, 2015. | RFC1066; https://blog.rust-lang.org/2015/05/15/Rust-1.0/ |
| 69 | CONFIRMED (new) | Double panic aborts: measured on 1.97.0 (see 15). | std-Drop; measured |
| 70 | CONFIRMED (new) | `cargo fix --edition` output measured (see 29). | EG-iflet; measured |

## Predict questions and explanations (red team)

| # | Verdict | Note | Source |
|---|---|---|---|
| S3 | CONFIRMED | Answer `c, b, a` measured; the explain's shadowing and tuple/array lines measured. Corrected an internal "why tempting" note: "optimiser" was called "the C++ habit", but C++ destroys automatic objects at block exit ([class.dtor]); it is now the GC-language habit. | measured; C++ [class.dtor] |
| S5 | CONFIRMED | E0040 even inside `unsafe { }` (measured), so option 4 is wrong; the "kaboom" form compiles to the same error. | measured |
| S8 | CONFIRMED | Measured E5. | measured |
| S10 | CORRECTED | See claim 29; the explain is rewritten (no "single-arm", 74 words; it was 82, over the 75-word rule). Correct option unchanged. | EG-iflet; measured |
| S12 | CONFIRMED | Correct option "2024 only" measured; the opposite-direction example measured. | EG-tail; measured |
| S16 | CONFIRMED | All four compile in safe code (forget, `Box::leak`, `exit` measured; `Rc` cycles per std-forget, Nom-L, Book 15.6 "memory leaks are memory safe in Rust"); `ManuallyDrop::drop` is `unsafe`. | std-forget; std-MD; https://doc.rust-lang.org/book/ch15-06-reference-cycles.html |
| S20 | CONFIRMED | `d, c, b, a` measured both editions. | Ref-D; measured |
| S21 | CONFIRMED | Correct option measured (deny by default); explain trimmed to 73 words (was 78) by dropping a parenthesis that repeated the reveal's `try_read` labels. | lints; Ref-P; measured |
| S22 | CORRECTED | **Two defensible answers.** Option 4, "Sound if the function is marked unsafe", is arguably *true*: an `unsafe fn` whose safety contract says "drop the guard" is sound in Rust's sense (the obligation moves to the caller). Replaced by "Sound: the guard borrows buf, so buf outlives the device" (false: `forget` ends the guard, and its borrow, without running `Drop`). Also flagged for the Deep dive: the `with_dma` redesign must stop the device on the unwind path too (a guard local to `with_dma`, or `catch_unwind`), or it has the same hole. Explain trimmed to 69 words (was 76). | Ref-D [destructors.forget]; std-pin |
| S1/S11 | CONFIRMED | Step 1 and step 11 traces measured; the 2024 `if let` change and the tail change are the only diffs between editions in the eighteen-line trace (measured). | measured |
| S9 | CORRECTED | See claim 23 (`id(&temp())` needs a later use for E0716; `Some(&temp())` extends). | Ref-D; measured |
| S13/S14/S18/S19 | CORRECTED (wording) | See claims 35, 36, 49/59, 47/52. | as above |
| Prereq | CORRECTED | Book 16.1's title is "Using Threads to Run Code Simultaneously" (not "Using Threads"); Book 15.3 "Running Code on Cleanup with the Drop Trait", 4.1 "What is Ownership?" (has "Variable Scope"), 9.2 "Recoverable Errors with Result" confirmed by fetch. | https://doc.rust-lang.org/book/ch16-01-threads.html ; …/ch15-03-drop.html ; …/ch04-01-what-is-ownership.html ; …/ch09-02-recoverable-errors-with-result.html |

## Sources fetched by this check

Required by the outline: Reference "Patterns" (wildcard), rustc deny-by-default lint listing (`let_underscore_lock`), Book 15.3, std `Vec::drain` "Leaking". Optional ones from the outline: `std::pin` (Drop guarantee), Book 15.6, Aria Desires 2015 (the page byline; the outline called it "Gankra"). Further: Reference "Static items", Go spec, Python reference, JLS SE 27 ch. 14 (the newest edition found; SE 25 was tried first and discarded), C++ draft [class.dtor] and [lib.types.movedfrom] (cppreference refused the fetch with 403), systemd's man source on GitHub (freedesktop.org answered 418 and man7.org reset the connection), the Rust 1.0 announcement, Book 4.1, 9.2, 16.1. Missing quotes that the plan said "the run adds" were added to the existing Reference "Destructors", `ManuallyDrop` and RFC 1066 sections. Nothing was fetched through a summarising tool; only URLs were sent.

## Nothing dropped

No claim had to be dropped: every one was re-derived from a source opened here or measured on rustc 1.97.0. The corrections above are all applied in `OUTLINE.md`.
