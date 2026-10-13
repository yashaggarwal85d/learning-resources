# REVIEW: RAII, drop order, and leak safety

## Content review (ROUTINE.md section 4)

- **Reviewer:** content review agent (Fable); wrote nothing in this topic.
- **Date:** 2026-10-11
- **Read, in order:** ROUTINE.md section 4; PROJECT_PLAN.md "Learning design"; QUALITY.md; DESIGN.md; `../CHAPTER.md` (all of it, Topic 2 entry and A.4 vocabulary in particular); the previous topic as it really is on `origin/topic/rust.single-ownership-move-semantics` (registry entry, reel step titles, `OUTLINE.md` concept ledger and "Changes after final", `REVIEW.md`); the syllabus lines of 1.1 (this one and "Partial moves and destructuring as transfer"), 2.2, Ch.4, Ch.6, Ch.8, Ch.11, Ch.30 and the Canonical references; this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, registry entry, `coverage.json`, `sources/expert-list.json`, `SOURCES.md` (headings and the quotes the findings rest on), `FACT-CHECK.md`, `OUTLINE.md` (all sections) and `examples.py` with `examples/*.rs`, plus the fetched texts `sources/exit.txt`, `scope.txt`, `rwlock.txt`, `ref-destructors.txt` where a finding needed them.
- **Not re-run:** no compiler in this review; every behavioural claim below is either in a fetched source named by file and line, or marked "verify" for the fix agent to measure in `examples.py`.
- **Counts:** 2 major, 20 minor (Flow 7, Gap hunt 7, Expert reader 8).
- **What already works:** the syllabus line is covered clause by clause in the reel and the Deep dive; the two edition changes are proven by one file compiled twice; every number on screen is asserted; the leak thread (steps 15–19) is the clearest telling of RFC 1066 I have read; the bridge answers topic 1's real handoff word for word and the end card hands off to E0509 without teaching it; no concept this topic uses sits later in the syllabus (dropck is owned here by the chapter plan, `RefCell`, `RwLock`, `thread::scope` and closures are glossed in one line each and declared).

### Part 1 · Flow

**1. `SpillFile` appears in step 2, five steps before step 7 builds it** (minor)
- *Where:* reel step 2 (`spill: SpillFile, // closes + unlinks in Drop` in the `Stage` listing; the caption lists `spill` among the fields); narration step 2 "then name, input, and the spill file".
- *What:* The learner meets a type by name, with a job, that the reel has not shown; the code comment is the only explanation. The chapter plan fixes `Stage`'s fields, so the forward reference is unavoidable, but it needs a word.
- *Fix:* Add to step 2's caption: "(`SpillFile`, built at step 7, closes a temporary file in `Drop`)".
- *Status:* fixed: step 2 caption now says `SpillFile` is built at step 7 and closes a temporary file in `Drop`.

**2. The previous topic promised "exactly this wrapper"; this topic builds a different one and says so late** (minor)
- *Where:* previous topic step 9 ("You'll build exactly this wrapper properly in the next topic", about `Fd(i32)`); this topic step 6 caption ("The previous topic's `Fd` wrapper is about to become real") and drawing (`IF Fd WERE Copy` over a payload labelled `File (4 bytes)`); step 7 builds `SpillFile { path: PathBuf, file: File }`.
- *What:* A learner expecting the `Fd(i32)` wrapper gets a struct that holds a `File`; the step 6 drawing mixes the two names (`Fd` slots pointing at a `File` payload), and the reason the raw-fd version is not built ("Raw descriptors and I/O safety are Chapter 11") is the last clause of step 7's caption.
- *Fix:* In step 6 say it where the name appears: "The previous topic's `Fd(i32)` wrapper is `File` (4 bytes: the descriptor), which std already wraps for you; the raw-fd version, `OwnedFd`, is Chapter 11. Here we build the wrapper one level up: `SpillFile`." Relabel the step 6 slots `a: File` / `b = a`, or the payload `fd`, so one drawing uses one name.
- *Status:* fixed: step 6 caption says the previous topic's `Fd(i32)` is `File` (4 bytes on Linux), raw-fd `OwnedFd` is Chapter 11, and the wrapper built here is `SpillFile`; the step 6 drawing now uses one name (`File`) throughout.

**3. Step 1 asks a temporaries question; step 2 answers a different one, and nothing says when step 1's thread resumes** (minor)
- *Where:* steps 1 → 2 (the problem is `if let` temporaries; step 2 is destructor anatomy; temporaries return at step 9, the problem is closed at step 11).
- *What:* The layering (problem first, mechanism later) is right, but the jump has no signpost, and a learner who came for the deadlock sees seven steps of `Stage`, `Fd` and `SpillFile` before it comes back.
- *Fix:* End step 1's caption (or start step 2's) with one clause: "First what a destructor is and where it runs (steps 2–8); then when a *temporary* dies, which is what changed (9–12)."
- *Status:* fixed: step 1 caption and narration end with the signpost (destructor and where it runs, steps 2 to 8; then when a temporary dies, 9 to 12); narration step 2 also says the spill file is built a few steps on.

**4. Step 12's answer depends on a fact the question does not give** (minor)
- *Where:* step 12 body ("a cell whose borrow rules are checked at run time; `borrow()` returns a guard") and explain ("`c.borrow()` returns a `Ref` guard whose destructor touches `c`").
- *What:* The question is answerable only if the learner knows the `Ref` guard *borrows* `c` (so its destructor needs `c` alive). `RefCell` is Chapter 4; the gloss says "guard" but not "a guard that holds a borrow of `c`", so the predict question tests Chapter 4 knowledge, not this step's rule.
- *Fix:* Body: "`borrow()` returns a guard that holds a borrow of `c` and releases it in `Drop`". Then the learner has both facts the rule needs.
- *Status:* fixed: step 12 body says the guard holds a borrow of `c` and releases it in `Drop`.

**5. Step 22 uses `impl FnOnce(&Dma)` and `DmaGuard<'_>` without a word** (minor)
- *Where:* step 22 explain and reveal (`fn with_dma(buf: &mut [u8], f: impl FnOnce(&Dma))`); Deep dive Prove it 3 and 7 (`impl FnOnce(&mut SpillFile) -> R`).
- *What:* `FnOnce` is Book ch. 13; `closures-basics` declares lambdas as an idea, not Rust's closure traits. The chapter plan says Rust's closure syntax is "shown on the spot".
- *Fix:* In the explain: "`f: impl FnOnce(&Dma)` is a closure argument, called once" (or show the call site `with_dma(buf, |dma| …)` instead of the trait bound on screen).
- *Status:* fixed: step 22 explain glosses `f: impl FnOnce(&Dma)` as a closure argument called once; Deep dive Prove it 3 and 7 gloss it too; `prerequisites.mdx` lists it among the one-line glosses.

**6. The ledger departs from the chapter plan in a way topics 3 and 4 will trip over** (minor)
- *Where:* registry entry: `introduces` ends with `counting-allocator`; `uses` is `ownership, move-semantics, deinitialized-place, copy-trait, clone-cost, ownership-signatures`. `OUTLINE.md` → "Changes from the chapter plan" items 1–2 explain why (topic 1's real ids differ from the plan's; topic 1 built the instrument but did not register the id).
- *What:* Right for this topic, and the build's ledger check will pass. But the chapter ledger now says the counting allocator is *introduced* by topic 2, while topic 1's reel and Lab 2 teach it; and topics 3 and 4, built in parallel to the plan, will write `uses: ['single-ownership', 'copy-vs-clone', 'counting-allocator', …]` and fail the same check. Nothing in `syllabus/review-notes/` records either.
- *Fix:* Log it (ROUTINE.md section 4 says reviews that touch other topics go to `syllabus/review-notes/`): at release, add `counting-allocator` to topic 1's `introduces` (its run can still do it while content-final; an unlock is needed only once it is live) and drop it here; topics 3 and 4 must use topic 1's real ids. Keep this topic's entry as it is until then.
- *Status:* fixed: logged in `syllabus/review-notes/rust-ch01-topic2-ledger-departure.md` (move `counting-allocator` to topic 1 at its release; topics 3 and 4 use topic 1's real ids). Registry entry kept as is, as the finding says.

**7. Step 23's recap drops the one rule the handoff needs** (minor)
- *Where:* step 23 rows and caption; registry `handoff`.
- *What:* The handoff is "A type with `Drop` keeps its fields until it dies", and the end card shows `E0509`. But no step states *why* a `Drop` type keeps its fields (the Deep dive does: `Drop::drop` takes `&mut self` and expects every field initialised). The recap rows restate steps 2–19 and the handoff sentence arrives without a hook in the reel.
- *Fix:* Add half a sentence to step 5's explain or step 6's caption, which already talk about `&mut self`: "and because `drop` gets `&mut self`, every field must still be there when it runs: a `Drop` type keeps its fields until it dies". Then the recap's handoff lands on something taught.
- *Status:* fixed: step 5 explain now says that because `drop` gets `&mut self` every field must still be there, so a `Drop` type keeps its fields until it dies; the recap handoff lands on it.

### Part 2 · Gap hunt

**8. "Every way a destructor is skipped" omits the two that bite in production: `main` returning while other threads run, and thread-local destructors** (major)
- *Where:* outcome 3 ("list every way a destructor is skipped"); step 14 caption and the Deep dive "Leaking is safe" list (`forget`, `ManuallyDrop`, `Box::leak`, an `Rc` cycle, `exit`, `abort`, `panic = "abort"`, a non-unwinding ABI boundary, statics).
- *What:* (a) When `main` returns, the process ends and every other thread is killed where it stands: its locals (a `BufWriter`, a `SpillFile`, a lock guard) are never dropped. This is the leak a senior engineer has actually been bitten by (lost log lines at shutdown), and `process::exit` has the same property on *other* threads' stacks, which the topic does not say although the fetched text does. (b) Thread-local destructors (the topic's own `thread_local!` log) are best-effort and may not run on the main thread at exit; the Deep dive mentions them only in the `thread::scope` caveat.
- *Evidence:* `sources/exit.txt` line 26: "no destructors on the current stack or any other thread's stack will be run" (fetched, not quoted in `SOURCES.md`). The std `thread` module docs say a spawned thread may outlive its caller "unless the caller thread is the main thread; the whole process is terminated when the main thread finishes", and the `LocalKey` docs say destructors are run on a "best effort" basis and may not run on the main thread: both to be fetched with `sources.mjs fetch` before quoting.
- *Fix:* One sentence in step 14's caption ("…and when `main` returns, every other thread dies where it stands, destructors unrun") and two bullets in the Deep dive list with the quotes; fetch the two std pages and add them to `SOURCES.md` and `coverage.json`. Optional: a measured case in `unwind.rs` (a spawned thread holding a `Noisy` that `main` does not join; assert no `drop` line).
- *Status:* fixed: step 14 caption and narration, Deep dive 'Ways a destructor is skipped' (the `std::thread` and `LocalKey` quotes, `process::exit` quote) and outcome 3 now cover `main` returning and best-effort thread-local destructors; fetched and quoted in `SOURCES.md`, mapped in `coverage.json`; measured in `unwind.rs` (mode `thread`, asserted in `examples.py`: no `drop t`).

**9. Expert item 13's second half, `drop` of a reference, is marked covered but not taught** (minor)
- *Where:* `coverage.json` expert item "…it does nothing to a Copy value or a reference" → steps 4 and 5; step 4 caption and Deep dive teach only the `Copy` half.
- *What:* `drop(&guard)` or `drop(&mut guard)` drops the reference and keeps the guard alive: the classic "I dropped the lock" bug, and rustc has a warn-by-default lint for it (`dropping_references`, the sibling of the `dropping_copy_types` lint the Deep dive already names).
- *Fix:* Add to step 4's caption or the Deep dive's `mem::drop` paragraph: "and on a reference it drops the reference, not the value: `drop(&g)` keeps `g` locked (`dropping_references` warns)". Verify the lint name and warning text on the toolchain and assert it in `examples.py`.
- *Status:* fixed: step 4 caption, narration and Deep dive `mem::drop` paragraph teach `drop(&g)` keeps `g` locked; `examples/dropref.rs` measures it and `examples.py` asserts the `dropping_references` warning text.

**10. `for` and `while let` loop headers: the lock-held-longer-than-it-looks case engineers hit most is missing** (minor)
- *Where:* step 9 (the `match` scrutinee case); Deep dive "Temporaries: scopes, extension, and the two 2024 changes" (lists the 2024 "pattern-matching condition and loop body of a `while`" entry without saying what it means).
- *What:* `for x in m.lock().unwrap().iter() { … }` holds the lock for the whole loop (the loop's iterator expression lives like a `match` scrutinee), and a `while let Some(x) = m.lock().unwrap().pop() { … }` holds it through each body. Neither is said, and nothing says that a local declared in a loop body is dropped at the end of every iteration (the fix engineers reach for: `let item = { m.lock().unwrap().pop() };`).
- *Evidence:* `sources/ref-destructors.txt` lines 407–411: the Reference's own `while let` example, "`while let loop body` dropped here. `while let scrutinee` dropped here." The `for` case: verify with `try_lock` inside the loop body in `semi.rs` (the Reference describes `for` as a `loop` over a `match` on `IntoIterator::into_iter(expr)`).
- *Fix:* One row in step 9 (or a sentence in its caption) for `for` with the measured `try_lock` result, and a Deep dive sentence for `while let` quoting the Reference's example; one clause on loop-body locals dropping per iteration.
- *Status:* fixed: step 9 caption and narration, and the Deep dive, cover `for` headers, `while let` scrutinees and loop-body locals; `semi.rs` measures `try_lock` in both loop bodies, `trace.rs` adds `loop-body`, all asserted.

**11. `ptr::drop_in_place` and panic-safety guards are mapped to places that only name them and promise a chapter that does not cover them** (minor)
- *Where:* `coverage.json` expert item 38 (`drop_in_place`) → "The destructor, as the Reference states it" ("named here, taught with allocators in Chapter 30"); item 39 (drop guards for panic safety) → "In production" ("the place for panic-safety guards (Chapter 30)").
- *What:* No Ch.30 syllabus line mentions `drop_in_place`, exception safety or drop guards (30.1 is contracts, UB and Miri; 30.2 is allocators and reclamation). So the items are "covered elsewhere" by a chapter that does not say so, and the Deep dive gives neither the two clauses the expert list asks for.
- *Fix:* Either give each its clauses here (`drop_in_place`: runs a destructor through a pointer, needed for unsized values, and the pointee counts as dropped afterwards, which ties to the "a value whose `drop` panicked counts as dropped" bullet; drop guards: a guard *local to the function*, which no caller can forget, is how `with_dma` and Prove it 3 stay sound on the unwind path, which the Deep dive already describes without naming the pattern), or log the Ch.30 gap in `syllabus/review-notes/`.
- *Status:* fixed: Deep dive gives `drop_in_place` its clauses (runs a destructor through a pointer, required for unsized values, pinned data, pointee counts as dropped; quotes added to `SOURCES.md`) and names the local-guard pattern for panic safety in 'In production'; `coverage.json` items still point there and now match.

**12. Enum variants, and `Option<T>` in particular, have no trace row** (minor)
- *Where:* Deep dive "Every drop-order rule, with a trace" table; `examples/trace.rs`.
- *What:* The Reference rule for "the fields of the active variant" is stated but not measured, and `Option<SpillFile>` is exactly what topic 3's `PooledBuf { buf: Option<Buf> }` rests on: dropping `None` runs nothing, `Some` drops its payload, and `take()` leaves a `None` that the glue then skips. One row makes the handoff concrete.
- *Fix:* Add `Some(Trace("some"))` and `None::<Trace>` cases to `trace.rs` and one table row ("enum: the active variant's fields").
- *Status:* fixed: `trace.rs` has `option` (`Some` drops its payload, `None` nothing) and `option-take` cases, with two table rows in the Deep dive and in Lab 1; `examples.py` asserts them (trace is now 22 lines).

**13. The FLS, a canonical M1 reference, is not cited** (minor)
- *Where:* `SOURCES.md`, `index.mdx` Sources, `coverage.json` → `sources`.
- *What:* The syllabus names the Reference *and* the FLS as M1's specification texts; the previous topic's review (finding 12) asked for the FLS and its run added it. This topic quotes the Reference only. The FLS has a "Destruction" chapter (drop scopes, drop order, temporaries) that would be the normative anchor for the rules this topic states.
- *Fix:* Fetch the FLS destruction chapter (`https://rust-lang.github.io/fls/destructors.html`, check the current path), quote the drop-order and drop-scope rules, add it as a source with items mapped; or record in `coverage.json` why it was not used, as topic 1 did for *Rust for Rustaceans*.
- *Status:* fixed: FLS chapter 15 (`ownership-and-deconstruction.html`; the plan's `destructors.html` path is a 404) fetched, quoted in `SOURCES.md`, added to `coverage.json` sources, `index.mdx` Sources and the Deep dive.

**14. `coverage.json` → `gapReview` is still the placeholder** (minor)
- *Where:* `coverage.json` → `gapReview.by: "pending: the content review … replaces this placeholder"`.
- *Fix:* After the fixes above, record this review (date, reviewer, `open: []`, with notes for anything left out of scope on purpose, as topic 1 did).
- *Status:* fixed: `coverage.json` `gapReview` is now the real record (2026-10-11, 'Fable content review', `open: []`).

**Coverage placements checked:** every `topic` placement quotes text that really appears in that topic's syllabus line: "why you cannot partially move out of a type that implements Drop" (Partial moves); "OwnedFd closes on Drop", "into_raw_fd(self)/from_raw_fd are the explicit ownership handoffs that prevent use-after-close", "I/O safety (RFC 3128, stable 1.63)" (File descriptors and I/O safety); "safe Rust can still leak through cyclic logical ownership" (Reference cycles and Weak); "Pin exists because an async state machine may hold references into itself after its first poll" (Pin and self-referential state). All 10 syllabus clauses are in the reel; all 40 expert items are placed, one `out` with a sound reason (closure capture timing, Ch.2); six source items `out` with reasons. Only findings 9 and 11 are placements that overstate what the place teaches.

### Part 3 · Expert reader

**15. "Exactly once is a theorem" is contradicted nine steps later by the topic's own second half** (major)
- *Where:* step 6 caption ("Put the three rules together and 'exactly once' is a theorem, not a convention"); narration step 6 ("Exactly once isn't a convention... it's a theorem"); step 23 row 4 ("One owner, one release: RAII") and narration ("One owner means one release").
- *What:* The three rules (one owner, a move deinitialises, no `Copy` with `Drop`) prove *never twice*. They do not prove *once*: steps 15–19 show that `forget`, `ManuallyDrop`, `Box::leak`, an `Rc` cycle and `exit` make it zero times, and the chapter's own A.4 defines "leak-safe" around that. A sceptical reader stops at step 15 and asks which step was wrong. The syllabus says "closes it exactly once"; that holds *when the destructor runs*, which Rust does not promise, and the topic's whole point is that it does not.
- *Fix:* Step 6: "'Never twice' is a theorem: one owner, a move empties the source, no `Copy` on a type with a destructor. 'Exactly once' follows whenever the destructor runs at all, and, as you'll see, Rust does not promise that." Step 23 row 4: "One owner: one release, never two". Narration step 6 and 23 to match.
- *Status:* fixed: step 6 caption and narration say 'never twice' is the theorem and 'exactly once' holds whenever the destructor runs, which Rust does not promise; step 23 row, caption and narration say 'one release, never two'; outcome 2 in `index.mdx` reworded. Step titles unchanged (coverage keys on them).

**16. Step 3 states a reason for reverse drop order that no source gives, as if it were the rule's basis** (minor)
- *Where:* step 3 explain ("The reason is borrowing: a later local may hold a reference to an earlier one (`let r = &a;`), so the later one must die first"); narration answer ("there's a reason. A later local may be borrowing an earlier one").
- *What:* The Reference states the rule (`ref-destructors.txt` line 101) and gives no reason. The borrowing rationale only bites for a later value whose *destructor* uses the borrow (drop check, the Deep dive's own paragraph); a plain `&a` has no destructor and NLL ends it before either dies. C++ destroys automatics in the same reverse order with no borrow checker at all. Presented as "the reason", an expert will object; as "the case the rule makes safe", it is right.
- *Fix:* "Reverse order is the stack discipline, and it is what makes a later value that borrows an earlier one sound: a guard holding `&a` (its destructor may still read `a`) dies before `a` does. The Deep dive's drop check is this rule made precise."
- *Status:* fixed: step 3 explain and narration now present reverse order as the stack discipline that makes a later value that borrows an earlier one sound (guard holding `&a`), pointing to drop check.

**17. Step 9 calls the `match` scrutinee case an "exception" to end-of-statement; it is not one** (minor)
- *Where:* step 9 caption ("Two exceptions matter. … And a `match` scrutinee is **not** a temporary scope, so its temporaries live to the end of the whole `match` statement").
- *What:* Those temporaries *do* die at the end of the enclosing statement, the `match`; the surprise is that the scrutinee is not a *smaller* scope of its own, the way an `if` condition is (Reference list, quoted in the Deep dive). Calling it an exception to the rule the caption just stated muddles the one rule the step teaches.
- *Fix:* "One exception and one trap. The exception: lifetime extension … The trap: an `if` condition is a scope of its own, a `match` scrutinee is not, so a lock taken in the scrutinee lives to the end of the whole `match`."
- *Status:* fixed: step 9 caption now says 'one exception and one trap': an `if` condition is a scope of its own, a `match` scrutinee is not.

**18. Step 1 says "hangs forever"; the chapter plan asked for "deadlocks (or may panic)"** (minor)
- *Where:* step 1 caption ("it hangs forever when the flag is unset") and narration ("it hangs forever"); CHAPTER.md Topic 2 "Suggested opening problem" ("say 'deadlocks (or may panic)' and report what the topic's own run does").
- *Evidence:* `SOURCES.md` → `std::sync::RwLock`: "This function might panic when called if the lock is already held by the current thread in read or write mode." The Deep dive has the nuance; the reel asserts the toolchain's behaviour as the language's.
- *Fix:* Caption: "it deadlocks (the `RwLock` docs allow a panic instead; on this toolchain it hangs)"; narration: "it deadlocks. Here, it hangs forever."
- *Status:* fixed: step 1 caption says it deadlocks (the `RwLock` docs allow a panic; on this toolchain it hangs) and narration says 'it deadlocks. Here, it hangs forever.'

**19. Step 4's "drops the old `v1` on the spot" hides the order that matters for resources** (minor)
- *Where:* step 4 caption ("Assignment also runs the destructor: `v = Trace("v2")` drops the old `v1` on the spot"); Deep dive table row `assign`.
- *What:* The right operand is built first, then the old value is dropped, then the new one is written. So when the new value's constructor needs the resource the old one holds (re-creating a `SpillFile` at the same path; re-taking a lock the old guard holds), the assignment fails or deadlocks, which "on the spot" does not predict. The measured trace `["v1", "v2"]` cannot show this because `v2` logs nothing when built.
- *Fix:* "drops the old `v1` after the new value is built and before it is stored"; log a `built-v2` marker in `trace.rs` to measure the order; quote the Reference's assignment-expression sentence on operand order (fetch `expressions/operator-expr.html` → "Assignment expressions").
- *Status:* fixed: step 4 caption and narration say the new value is built first, then the old one dropped, then the new one stored; `trace.rs` logs `built` (`assign: [built, v1, v2]`, asserted); Reference assignment sentences quoted in `SOURCES.md`; Deep dive row and paragraph updated.

**20. The `closes` counter counts `SpillFile::drop`, not `close(2)`** (minor)
- *Where:* step 7 (`CLOSES.fetch_add(1, Relaxed)` inside `SpillFile::drop`, counter labelled `CLOSES`), steps 15 and 17; `spill.rs`, `leak.rs`.
- *What:* The OS close happens in `File`'s glue *after* the counter ticks, and nothing counts it; the counter proves the wrapper's destructor ran once, which is the point, but a reader who checks the code sees the name promise more than it measures. The `/proc/self/fd` delta in `leak.rs` is the real close evidence and is only in the Deep dive.
- *Fix:* Rename the on-screen label to `DROPS` (or say once in step 7: "`closes` counts the wrapper's `Drop`; the descriptor count in `/proc/self/fd` confirms the close, Lab 4"), and add the fd delta to step 7's values.
- *Status:* fixed: step 7 caption says `closes` ticks in the wrapper's `Drop` and the `/proc/self/fd` count confirms the close; the drawing shows 'descriptors open: +1 inside, +0 after'; `spill.rs` prints `fds_inside=1 fds_after=0`, asserted.

**21. Step 21's example cannot happen as written** (minor)
- *Where:* step 21 body and `wild.rs` (`let lock = RwLock::new(0); let mut shared = 0; let _ = lock.write().unwrap(); shared += 1;`).
- *What:* With `RwLock<T>` the protected data is mutated *through* the guard, so "the increment runs unlocked" is impossible for the data the lock holds; the bug exists only when a lock stands guard over state outside it (a file, FFI state, a `static`), the `Mutex<()>` idiom. An expert will ask what `shared` has to do with `lock`.
- *Fix:* Say it in the body ("a lock used as a plain mutex around state it does not hold, `RwLock<()>`") and make `wild.rs` use `RwLock<()>` so the example is the real idiom.
- *Status:* fixed: step 21 body says `lock` is a plain mutex around state it does not hold (`RwLock<()>`) and `wild.rs` now uses `RwLock::new(())` (outputs unchanged, asserted).

**22. Narration step 19 states the `Drain` design as a general fact the Deep dive contradicts** (minor)
- *Where:* narration step 19 ("A vector sets its length to zero before it gives out a drain"); step 19 caption ("put the owner into a consistent state *before* handing out the proxy, so a leak only amplifies"); Deep dive ("the implementation sets `len` to the start of the range", measured `drain(1..3)` → `len 1`; std promises only that elements "may have lost and leaked … arbitrarily").
- *What:* "Sets its length to zero" is true for `drain(..)` only; and the caption presents the Nomicon's design as behaviour, where std's guarantee is weaker (nothing freed twice, elements may be lost).
- *Fix:* Narration: "sets its length to the start of the drained range, zero for a full drain"; caption: "…so a leak only amplifies into more leaks: std promises nothing is freed twice, not which elements survive."
- *Status:* fixed: narration step 19, step 19 caption and the drawing now say the length is set to the start of the drained range (zero for a full drain) and that std promises only that nothing is freed twice.

**23. Smaller precision points** (minor)
- Step 13 caption and narration: "the flags live on the stack" / "a one-bit flag on the stack". The MIR shows a local (`_5`); where it lives is up to the optimiser (a register, or gone when the branch folds). Say "a hidden boolean local (`_5` in the MIR)", keeping the Nomicon's "on the stack" for the unoptimised picture.
- Step 7 caption: "`File` is 4 bytes here: the descriptor" is a Linux fact (`OwnedFd` over an `i32`); say "on Linux" on screen as the Deep dive does.
- Deep dive Prove it 6: "stops opening files after about 1,021 failures" assumes the service holds no other descriptors; a service has a listening socket, connections and a log. Say "fewer than 1,021, once its sockets and logs are counted".
- A.4 "guard" is used from step 1 ("guards that unlock when dropped") but never given the chapter's definition ("a value whose only job is to do something in `Drop`"), and `raii-guard` is introduced here. One clause in step 7: "a *guard* is a value whose only job is to do something in `Drop`; `SpillFile` is one, and so is a lock guard."
- Step 16 body: "Four ways … Which one needs `unsafe`?" while the options list three ways plus "None of them"; make the body say "Four ways are on screen" or add `process::exit` as an option in place of one, so the question and the options match.
- *Status:* fixed: step 13 caption, narration, drawing label and Deep dive say 'hidden boolean local (`_5`)'; 'on Linux' added to step 6/7 captions and the step 7 drawing; Prove it 6 says 'fewer than 1,021'; step 7 defines *guard*; step 16 body now says four ways are drawn and asks which of the first three needs `unsafe`.

## Looks and learning review (ROUTINE.md section 5)

- **Reviewer:** looks and learning review agent (Opus); edited nothing in this topic except this section.
- **Date:** 2026-10-11
- **Read:** DESIGN.md (all of it; the checklist under "The looks review checks"), this topic's `OUTLINE.md` ("Shared visual vocabulary" and all 23 step storyboards), `narration.json`, and every screenshot `site/test-results/{desktop,phone}-raii-drop-order-leak-01…23.png` (1440 × 900 desktop; iPhone 13 phone, 3× pixels, so screenshot px ÷ 3 = CSS px). I opened `reel.tsx` and `scenes.tsx` only to name where a fix goes, and took one extra phone screenshot of step 1 from the built `dist/` (see finding 5).
- **Counts:** 17 major, 23 minor (40 in all). Steps 3, 8 and 14 hold up best (minor findings only). The step 14 lanes (two with badges, two empty, exit codes on the right) and the step 8 reveal (a cherry folder with `left behind`) read at a glance.
- **Severity:** *major* means text that overlaps, is clipped or is too small to read, or a picture that teaches the wrong thing or hides the step's point. *Minor* means crowding, weak focus, a mismatch between caption and picture, or polish.

### Across many steps

**1. Phone predict reveals are drawn at about 0.4 scale, so drawing text renders at about 6 px** (major)
- *Where:* phone, steps 3, 5, 8, 10, 12, 16, 20, 21, 22 once they are answered (the `Svg h={340…400}` predict drawings).
- *What:* Once a predict step is answered, the question, the four options and the explain box take the space, so the drawing gets about 150 CSS px of height. A 340–400-unit-tall drawing then shrinks to about 0.4 px per unit, where DESIGN.md plans for about 0.6. Labels set at 13 units (`DROP ORDER`, `dropped 3`, `the temporary is part of an expression…`, `stops before it returns`) render at about 5–6 CSS px, and code at about 6–7 px. That is well under DESIGN.md's 9.5 px and hard to read on a real phone. The answer, the thing the learner just committed to, is the hardest text on screen to read.
- *Evidence:* phone-03: the timeline (x 40→540 units) spans screenshot x 270→875, which is 202 CSS px for 500 units (0.40/unit). On phone-14, a mechanism step, the same 500 units span 311 CSS px (0.62/unit). The same squeeze shows on phone-05 (0.45), -08, -12, -16, -20, -21 and -22. The reel test's 9 px check did not catch it, probably because it measures before the explain panel grows; worth a line in QUALITY.md.
- *Fix:* On `portrait && answer !== null`, draw a shorter reveal that fills the width. Cut the empty bands: step 3 moves the timeline up under the slots (h ≈ 240); step 20 keeps the slots and the timeline only. Drop the in-SVG code lines when the body already quotes the code (steps 12, 21, 22, as step 10 already does with the `Code` panel). Aim for at least 0.55 px/unit on phone-03-style captures.
- *Status:* fixed: on portrait once answered, steps 3, 5, 8, 12, 20, 21, 22 draw a shorter reveal (code lines dropped or cut to one line, slots moved up, `h` 200 to 270) so the drawing is about 0.6 px/unit (phone-03 timeline now about 311 CSS px for 500 units); step 16 has no portrait problem now (shorter `h`, no chips, no timeline). Steps 10 already swapped the code. The test's 9 px check is shared code, not touched.

**2. Desktop: the topic eyebrow (and step 1's bridge quote) slides under the domain nav** (major)
- *Where:* desktop steps 1, 5, 12, 22.
- *What:* When the left column is taller than the viewport, it is centred upward and its top line runs under the fixed nav pill. On step 1 the italic bridge line ("…who destroys a value. Now: exactly when that happens, in what order, and why…") is cut by the `Data Engineering` pill. On steps 5, 12 and 22 the eyebrow `RAII, DROP ORDER, AND LEAK` is clipped (`AND L…`, `AND`, `LEAK` half-covered).
- *Evidence:* desktop-01 (y 25–60), desktop-05 (y 42), desktop-12 (y 33), desktop-22 (y 52).
- *Fix:* In this topic, shorten what makes those columns tall: step 1's caption (finding 3) and the explains of 5 and 22, which are over the 75-word cap. Then check that the column top clears y ≈ 60. The general cure is in shared code (top padding for the left column equal to the nav's height), so raise it with the run rather than here.
- *Status:* fixed in this topic (captions only): step 1 body cut to about 85 words and the repeated bridge sentence removed; step 5, 12 and 22 explains cut; step 12 body shortened. desktop-01, -05, -12 and -22 now clear the nav (eyebrow top at y 90 or more). Shared fix (top padding equal to the nav height) not done: raise it with the run.

**3. Caption walls on desktop; three explains over the 75-word cap** (minor)
- *Where:* bodies of steps 1, 4, 6, 7, 9 (about 145–165 words each) and 2, 13, 18, 19, 23 (about 110–115). The explains of steps 3 and 5 (about 85–89 words) and 22 (about 80).
- *What:* On desktop these fill the whole left column, the same height as the drawing, so the eye goes to the paragraph, not the picture. Step 4 adds `drop(&g)` and `dropping_references`, and step 6 adds the E0184 error-index quote and `OwnedFd`, which belong in the Deep dive. Step 1 says the bridge sentence twice: once as the italic quote above the title, once in the middle of the body. OUTLINE.md sets "every `explain` is 75 words or fewer".
- *Fix:* Cut each body to the mechanism the picture shows, at most about 90 words, and move the asides (lint names, error-index quotes, chapter pointers) to the Deep dive. Delete the repeated bridge sentence from step 1's body. Trim explains 3, 5 and 22 to 75 words: step 3 can drop "The Deep dive's drop check is this rule made precise", and step 5 can drop the last sentence about panics.
- *Status:* fixed: bodies of steps 1, 2, 4, 6, 7, 9, 13, 18 cut to about 80 to 100 words; lint names, E0184 quote, `OwnedFd`, `dropping_references`, loop-header and `&&`/`||` asides are in the Deep dive already; explains 3, 5, 22 trimmed to 75 words or fewer. Narration step 4 (copy / reference line) and step 9 (loop header line) removed to match. Steps 19 and 23 left at about 100 words.

**4. Phone mechanism steps leave an empty band above a small drawing** (minor)
- *Where:* phone steps 2, 4, 7, 13, 15 (also 9 and 14, less so).
- *What:* About 70–100 CSS px of blank space sits between the nav and the drawing, while the drawing itself is only about 0.6 scale. On step 2 the space between the note and the timeline is empty too, so the final frame is mostly dark.
- *Evidence:* phone-02 (drawing content starts at y ≈ 520 of 1150 px of drawing area), phone-04 (y ≈ 455), phone-07 (y ≈ 405), phone-13 (y ≈ 455), phone-15 (y ≈ 445).
- *Fix:* After the code panel is swapped out on portrait, use a shorter portrait `h` (or top-align the drawing) so it grows into the space. Step 2 needs this most (see finding 7).
- *Status:* partly fixed: steps 2, 4, 7 and 17 now use more of the height (brackets, ghost slots, arcs, two-beat strip), but the blank band above a width-bound drawing on phone comes from the shared `Svg` centring, so it is not removable in this topic; steps 13 and 15 unchanged. Raise top-aligning `Svg fill` on portrait with the run.

**5. The phone screenshot for step 1 is actually step 2; the real phone step 1 has two small problems** (minor)
- *Where:* `phone-raii-drop-order-leak-01.png`; phone step 1.
- *What:* phone-01 shows step 2 (`2/23`, `struct Stag▌` still typing). So the test's `ArrowRight` advanced past step 1 instead of finishing it, and phone step 1 was never checked by the test. I captured it myself from `dist/` after 7 s. Its final frame is readable, but on portrait it drops the `stage.rs` code, so the `read() · then · else · write()` ruler has no source on screen. Also the `read guard` label sits about 2 CSS px under its bar (both lanes).
- *Evidence:* phone-01 vs desktop-01; my capture of phone step 1 (bar bottom y ≈ 331, label top y ≈ 338 in 3× px).
- *Fix:* Re-run the reel test and confirm phone-01 is step 1 (if not, the harness needs a look; that is shared code, so raise it with the run). In `Problem`, move each `read guard` label 8 units lower. On portrait, keep a one-line source above the lanes, e.g. `if let … = *value.read()… { } else { value.write() }` in 13-unit latte.
- *Status:* partly fixed: the `read guard` labels are 8 units lower and portrait step 1 keeps a one-line source above the lanes. The phone-01 screenshot is still step 2 (the harness's `ArrowRight` issue is shared test code, not touched; raise it with the run).

### Step by step

**6. Step 4: `DROP ORDER` is struck through by the `drop` frame's bottom border** (major)
- *Where:* step 4 `LastOwner`, desktop and phone.
- *What:* The timeline label (`Timeline`, `y - 12`, anchored at x 540) sits exactly on the bottom edge of the dashed `drop` frame (x 320–560, y 120–170), so the frame's line runs through the letters.
- *Evidence:* desktop-04 (`DROP ORDER` at y 614, frame bottom at y 614); phone-04 (y 752).
- *Fix:* Shorten the `drop` frame (bottom ≤ TLY − 30), or pass `label={false}` to this step's `Timeline`. The two badges already say "order".
- *Status:* fixed: step 4 `Timeline` has `label={false}`.

**7. Step 2: the "two parts" are not visible; it is one row of four equal badges** (major)
- *Where:* step 2 `TwoParts`, final frame, both sizes.
- *What:* The step's point is "your `Drop::drop`, *then* the glue drops the fields". The final frame shows four look-alike badges `stage · name · input · spill`, a floating three-line taupe note far up and to the right, and a brace above `input`. The `Stage` frame and its slots have faded out, and on phone the code is gone, so nothing groups badge 1 apart from badges 2–4 except a caramel ring. A paused learner sees "four things in order", not "two parts".
- *Evidence:* desktop-02, phone-02 (note at y 530–610, badges at y 830; nothing in between).
- *Fix:* Put a bracket under each group, directly below the badge names: `Drop::drop` under badge 1 and `drop glue: fields, in order` under badges 2–4, in 13-unit latte. Delete the floating note. Keep the `Stage` outline at about 0.3 opacity in the final frame so the field names have a home, and move the brace next to the frame, not over badge 3.
- *Status:* fixed: `Drop::drop` bracket under badge 1 and `drop glue: fields, in order` bracket under badges 2 to 4; floating note deleted; `Stage` outline stays at 0.3 opacity; brace moved beside the frame.

**8. Step 6: on phone the `File (4 bytes)` label overflows its box and the arrowheads hit it** (major)
- *Where:* step 6 `CopyDrop`, both payload boxes, phone.
- *What:* The 15-unit label is wider than its 90-unit box at phone scale. `F` sits on the arrowhead and `)` runs past the right border, in both rows.
- *Evidence:* phone-06 (y 375 and y 767: `▸File (4 bytes)` with the closing paren outside the box).
- *Fix:* Widen the payload box to ≥ 150 units (move it left to x ≈ 360), or label it `File` with `4 bytes` as a 13-unit line under the box.
- *Status:* fixed: payload boxes are 170 units wide (x 350), so the label fits at phone scale and the arrowheads stop at the box edge.

**9. Step 6: `nothing to drop` sits under `b`, the live owner, not under the moved-from `a`** (major)
- *Where:* step 6 row B (`scenes.tsx` `CopyDrop`, the `nothing to drop` text at `x={125} y={366}`).
- *What:* In the RUST row the caramel `b File` slot (the owner, which *is* dropped: badge `1 close`) has `nothing to drop` directly under it. The moved-from `a` is the slot above. A glance reads "b: nothing to drop", which is the opposite of the lesson.
- *Evidence:* desktop-06 (y 594 under the `b` slot at y 548); phone-06 (y 901).
- *Fix:* Put the label inside or beside the `a moved` outline (e.g. right of it, or replace `moved` with `moved · nothing to drop`), as step 4 does.
- *Status:* fixed: `nothing to drop` now sits on the `RUST` header line directly above the moved-from `a` slot, away from the live `b` owner.

**10. Step 7: the closing brace sits on `main`'s slot border, on top of `dropped 1`** (major)
- *Where:* step 7 `Spill` (`Brace x={176} y={90}`), both sizes.
- *What:* The caramel `}` overlaps the right edge of the dashed `s dropped 1` slot.
- *Evidence:* desktop-07 (x 783, y 486); phone-07 (x 350, y 530).
- *Fix:* Move the brace below the `main` frame (y ≈ 125, as in `Brace` elsewhere) or to x ≥ 200, clear of the slot.
- *Status:* fixed: the brace moved to the corridor between the `main` and first `pass` frames, below the slot row.

**11. Step 9 (phone): the `{` of `match m.lock().unwrap().len() {` runs into the `temp` slot** (major)
- *Where:* step 9 `Temporaries`, row 3, phone.
- *What:* The code line is about 34 characters. At phone scale it reaches the left dashed edge of row 3's `TempSlot`, so `{` and the dash overlap.
- *Evidence:* phone-09 (x 625–645, y 805).
- *Fix:* Start row 3's slot and bar at x ≥ 330 (or put the `TempSlot` above the bar rather than beside the code), keeping the code line as it is: the lock call in the scrutinee is the point.
- *Status:* fixed: row 3 slot, bar and arm tick start at x 352 (and rows 1 and 2 match), clear of the 34-character code line at phone scale.

**12. Step 11: panel A highlights the wrong badge** (major)
- *Where:* step 11 `TwoChanges`, `<Lane y={72} year="2021" … hiIdx={0}>`.
- *What:* The caption and narration say "that one badge, landing on the other side of the else". In panel B the caramel ring follows `tail` in both lanes, which is right. In panel A it rings `1 else` in 2021 and `1 guard` in 2024, so the eye compares `else` with `guard` and the moved badge (the guard) is not marked in 2021.
- *Evidence:* desktop-11 (caramel ring on `else`, y 189); phone-11 (y 340).
- *Fix:* `hiIdx={1}` for the 2021 lane of panel A, so `guard` is ringed in both lanes (see finding 30 for making the move itself visible).
- *Status:* fixed: panel A now rings the guard badge in both lanes.

**13. Step 12: `E0597` and `prints 2` sit on the timeline, so the line strikes them through** (major)
- *Where:* step 12 `TailRefCell` reveal, desktop (and phone at small size).
- *What:* Both result labels are drawn at the timeline's y, so the taupe line runs through their middles. `E0597` reads as a struck-out error, which says "not E0597", the opposite of the answer.
- *Evidence:* desktop-12 (`E0597` x 1075–1138, y 408; `prints 2` x 1075–1190, y 588, both crossed by the line); phone-12 (y 428, 589).
- *Fix:* Stop each lane's line at the last badge (x2 ≈ 400) and put the result to the right with 24+ units of clear space, or put it 20 units above the line.
- *Status:* fixed: lane lines stop at x 350 and `E0597` / `prints 2` start at x 390 with clear space.

**14. Step 13: `skipped: flag 0` sits over badge `2 z`, so it reads as "z was skipped"** (major)
- *Where:* step 13 `DropFlags`, upper lane (`flag = true`), both sizes.
- *What:* The note that `t`'s drop was skipped is placed directly above the `z` badge. `z` is dropped on that path; the skipped value (`cond`/`t`) has no mark at the brace. The step's one idea (the brace checks a flag and skips the drop) is misattributed.
- *Evidence:* desktop-13 (`skipped: flag 0` at x 873–1037, y 467, directly over badge 2 at x 845); phone-13 (x 492–770 over x 453).
- *Fix:* In the true lane, draw a dashed empty badge position after `z` labelled `cond: skipped (flag 0)`, or put the note on the `t` slot. Keep nothing above `z`.
- *Status:* fixed: nothing sits above `z`; a dashed empty badge position after `z` is labelled `skipped` and an arrow from the lane's drop-flag box points at it.

**15. Steps 15 and 17: the `1 · 0` counter reads as "1.0"** (major)
- *Where:* `Counter … label="ALLOCS · FREED" text="1 · 0"` in `Forget` and `OnPurpose`.
- *What:* At 20 units in Fraunces, the middle dot between `1` and `0` looks like a decimal point. The step's one serif number reads as "one point zero" rather than "1 allocated, 0 freed". It is the number that proves the leak.
- *Evidence:* desktop-15 (x 590–640, y 525, cherry), desktop-17 (y 617), phone-15 (y 665), phone-17 (y 933).
- *Fix:* Split it into two counters side by side, `ALLOCS 1` and `FREED 0` (13-unit labels, 20-unit values), or one counter `LIVE ALLOCS +1`, the delta `examples.py` asserts.
- *Status:* fixed: the two `1 · 0` counters are now one `LIVE ALLOCS +1` (the delta `examples.py` asserts) in steps 15 and 17.

**16. Step 15: `CLOSES 1` beside `no destructor ran`** (major)
- *Where:* step 15 `Forget` counters.
- *What:* This run forgets a fresh `SpillFile`. The `1` is carried over from step 7's run, but a paused learner sees "closes: 1" next to "no destructor ran" and "still on disk", which looks like a contradiction. Everything else in the frame is cherry (counter, payload, label, file icon, `no destructor ran`), so there is no single thing to look at first.
- *Evidence:* desktop-15 (`CLOSES 1` at x 819, y 525); phone-15 (y 665).
- *Fix:* Show the delta for this block, `CLOSES +0`, matching what `leak.rs` measures. Make `no destructor ran` the one cherry focal label on the empty timeline. Draw the payload and file icon with a cherry outline only and latte labels, so cherry marks one idea.
- *Status:* fixed: step 15 shows `CLOSES +0`; payload and file icon are cherry outlines with latte labels; `no destructor ran` is the one cherry label.

**17. Step 16 (phone): `// in a cycle` runs into its chip** (major)
- *Where:* step 16 `WhichUnsafe`, row 3, phone.
- *What:* The code `let a = Rc::new(..); // in a cycle` reaches the left dashed edge of the `s` chip.
- *Evidence:* phone-16 (x 540–670 against the chip at x 678, y 366).
- *Fix:* Move the chips to x ≥ 470 (or drop the chips; they add nothing, see finding 34) and shorten the comment to `// cycle`.
- *Status:* fixed: chips removed and the comment shortened to `// cycle`.

**18. Step 17: `ALLOCS · FREED` overlaps the `r` slot's bottom border** (major)
- *Where:* step 17 `OnPurpose` row B (`Slot x={40} y={284}` with `Counter x={40} y={330}`), both sizes.
- *What:* The counter's label is drawn over the slot's bottom edge.
- *Evidence:* desktop-17 (y 583, slot bottom y 578); phone-17 (y 885).
- *Fix:* Move the counter to the row's right (x ≈ 400, y 340), as the outline specifies (`allocs 1 · freed 0` small counter at the row's right), or move it 24 units lower.
- *Status:* fixed: the counter moved to the row's lower right (x 400, y 362), clear of the payload and the `r` slot.

**19. Step 17: the `ManuallyDrop` half leaves nothing of its idea in the final frame** (major)
- *Where:* step 17 row A, final frame.
- *What:* The storyboard's mark (a slot with a latch, the brace that does *nothing*, then `into_inner` lifting the latch) has fully collapsed by the end. What remains is two lines of code, a lone brace, `CLOSES 2` (with no `1` ever shown in this step) and badge `1 spill`. That frame looks like an ordinary drop. "Same bytes, no automatic drop" is not on screen.
- *Evidence:* desktop-17 (y 170–370), phone-17 (y 320–590).
- *Fix:* End on a two-beat strip. On the left, the `m` slot with its caramel latch at the brace and the label `brace: nothing dropped`. On the right, `into_inner → drop(s)` with badge `1 spill`. Show `CLOSES 1 → 2` or `+1` so the counter is explained.
- *Status:* fixed: the final frame is a two-beat strip: `m` with its latch and `brace: nothing dropped`, then `into_inner → drop(s)` with `s dropped 1` and badge `1 spill`; the counter reads `CLOSES +0` then `+1`.

**20. Step 20: on phone `DROP ORDER` overlaps badge 4; the slots abut and overhang the timeline** (major)
- *Where:* step 20 `ProveParams` reveal.
- *What:* The fourth badge lands under the right-anchored `DROP ORDER` label. The four 180-unit dashed slots touch each other with no gap (their dashes merge) and run wider than the timeline (desktop x 555–1310 vs timeline x 590–1263).
- *Evidence:* phone-20 (`DROP ORDER` x 775–905, y 580 over badge 4 at x 772, y 602); desktop-20 (label at y 561, badge 4 top at y 568, 4 px apart).
- *Fix:* Badges at x 90/200/310/420 (the step 2 spacing) and slots 120 units wide with 16-unit gaps, or a 2 × 2 slot grid. With the badges ending at x 420, the label at x 540 is clear.
- *Status:* fixed: slots are a 2 x 2 grid (200 wide, gaps), badges at x 80/180/280/380, so `DROP ORDER` clears badge 4.

**21. Step 3: the three revealed slots abut, so their dashed borders merge** (minor)
- *Where:* step 3 reveal, both sizes.
- *Evidence:* desktop-03 (slots at y 185–350, no gap); phone-03.
- *Fix:* 8-unit gap between slots (y 30, 80, 130).
- *Status:* fixed: step 3 slots have a 10-unit gap.

**22. Step 4: where `m` died is not shown; `nothing to drop` crowds badge 1** (minor)
- *Where:* step 4 final frame.
- *What:* The `consume` and `drop` frames are empty, and nothing ties badge `1 m` to `consume`'s brace or badge `2 n` to the `drop` frame. Yet "m dies at consume's brace, not main's" is the step's point. `nothing to drop` sits about 20 px above badge 1 and reads as its label.
- *Evidence:* desktop-04 (label y 596, badge y 636); phone-04.
- *Fix:* Leave a small dashed ghost `m · dropped 1` in `consume` and `n · dropped 2` in `drop` (as step 7 does in `main`). Move `nothing to drop` inside the `MAIN` frame under the two `moved` outlines.
- *Status:* fixed: dashed ghost slots `m · dropped 1` in `consume` and `n · dropped 2` in `drop`; `nothing to drop` moved inside `MAIN`.

**23. Step 5: the struck-through `x.drop();` is hard to read, and the dropped slot sits on the wrong line** (minor)
- *Where:* step 5 reveal.
- *What:* The line the question is about is dark cherry text under a cherry strike line on dark roast, the lowest-contrast text in the frame. The revealed `x dropped 1` slot sits level with `x.drop();`, which suggests that call did the dropping, while the caramel `drop(x);` line is below it.
- *Evidence:* desktop-05 (x 590–700, y 378); phone-05 (y 396).
- *Fix:* Keep `x.drop();` in crema with only the strike in cherry (or `C.cherryText` for the text). Move the `x · dropped 1` slot level with `drop(x);`.
- *Status:* fixed: `x.drop();` is crema with a cherry strike; the `x dropped 1` slot is level with `drop(x);`.

**24. Step 6: dimming row A makes its point (`closed twice`, `E0184`) low-contrast** (minor)
- *Where:* step 6 row A in the final frame (opacity 0.6); `E0184` under `b = a`.
- *What:* Cherry text at 0.6 opacity on dark roast is the faintest text on screen, and it is the counterfactual's whole result. `E0184` touches the bottom of the `b = a` slot.
- *Evidence:* desktop-06 (y 266, 296); phone-06 (y 447, 487).
- *Fix:* Dim only the slots and arrows in row A and keep `closed twice` and `E0184` at full opacity. Put `E0184` 18+ units below the slot, or to its right.
- *Status:* fixed: only slots, arrows, badges dimmed in row A; `closed twice` and `E0184` stay full colour, `E0184` 30 units below the slot.

**25. Step 7: about twelve labels compete, and the round trip is not drawn** (minor)
- *Where:* step 7 final frame.
- *What:* `main`, `pass`, `pass`, three slot labels, `/tmp/…/spill`, `CLOSES`, `1`, three crema size lines, `DROP ORDER`, `spill`. The sizes block is crema, the same weight as primary labels, and outweighs the counter. The move `main → pass → pass → main` (the reason "one close" is remarkable) leaves no trace. `CLOSES 1` sits under the second `pass` frame as if it belonged to it.
- *Evidence:* desktop-07, phone-07.
- *Fix:* Draw two thin latte arcs, `main → pass → pass → main`, over the frames. Set the size lines in 13-unit taupe (or move them to the caption). Put `CLOSES` top-right as A.5 specifies.
- *Status:* fixed: two thin latte arcs `main → pass → pass → main` over the frames, sizes block in 13-unit taupe, a rule separates the frames from the `CLOSES` row.

**26. Step 8: after the reveal, the `Spool` slots are still drawn live** (minor)
- *Where:* step 8 reveal, right-hand `Spool` frame.
- *What:* The badges say `1 dir · 2 spill` were dropped, but the `dir` and `spill` slots keep their live fill.
- *Evidence:* desktop-08 (x 1080–1245, y 357–462).
- *Fix:* Draw them as dashed `dropped 1/2` outlines, as steps 3 and 20 do.
- *Status:* fixed: `dir` and `spill` redraw as dashed `dropped 1` and `dropped 2` after the answer (Spool frame widened to fit).

**27. Step 9: the bars are not anchored to anything, and rows 2 and 3 look the same** (minor)
- *Where:* step 9 final frame.
- *What:* Each bar floats on the right with a tiny `;` or `}` at its end. Rows 2 (block end) and 3 (end of the match statement) end at the same x with the same `}`, so "extended to the block" and "lives to the end of the statement" are indistinguishable in the picture. The row-1 `;` sits on the bar's end. The label `guard dropped · try_lock ok` is closer to row 2's code than to row 1's.
- *Evidence:* desktop-09 (row-1 label y 290, row-2 code y 360, row-1 code y 190).
- *Fix:* Give each row a small code ruler (as step 1 does: `stmt ; next` / `let … }` / `match { arm } ;`) and end each bar on its stop. Keep each row's label 12 units under its own bar. The loop-header case in the narration ("the lock stays held through the whole loop") could be a fourth row, or cut from the narration.
- *Status:* fixed: each row has a start tick and label (`lock()`, `let r`, `match`) and an end label (`} block`, `} match`), labels sit under their own bar. The loop-header sentence was cut from the narration and caption.

**28. Step 10: the reveal's ruler still says `then / else` for a `match`** (minor)
- *Where:* step 10 reveal lane `2024 after cargo fix`.
- *What:* The code under the lane is the rewritten `match` with `Some(x) =>` and `_ =>` arms, but the ruler stops still read `read() · then · else · write()`. The learner has to translate.
- *Evidence:* desktop-10 (y 424 vs the `match` block at y 548–636).
- *Fix:* Relabel the stops `read() · Some(x) · _ => · write()` in the answered frame.
- *Status:* fixed: the answered ruler reads `read() · Some(x) · _ => · write()`.

**29. Step 12 (phone): a stray mark above the body, and the title is scrolled out of view** (minor)
- *Where:* phone-12.
- *What:* A small light bar (about 6 × 2 CSS px) floats at x ≈ 110, y ≈ 227 CSS. The step number and title are scrolled off, so the frame has no heading.
- *Evidence:* phone-12 (3× px x 322–342, y 678–684).
- *Fix:* Find what it is (probably the clipped bottom of the title or eyebrow under the drawing) and keep the title in view after answering. Shrinking the reveal drawing (finding 1) gives the room.
- *Status:* fixed: with the shorter portrait reveal the title and the stray mark are gone in phone-12; on phone-22 the title is partly scrolled under the explain panel, which is page layout (shared).

**30. Step 11: the badge never visibly moves past `else`; trace events sit on a `DROP ORDER` line** (minor)
- *Where:* step 11 panel A.
- *What:* Both lanes use the same three x positions, so only the *labels* swap. The "badge landing on the other side of the else" (narration) is not a visible movement. The vertical dashed `else` marker the storyboard asked for is missing. `else` and `after-if` are events, not destructors, yet they are drawn as numbered drop badges. The rule line `scrutinee temporaries drop before else` sits about 10 px under the lane labels.
- *Evidence:* desktop-11 (labels y 337, rule y 363); phone-11 (y 543, 580).
- *Fix:* Draw a fixed dashed `else` marker per lane. Draw the guard badge left of it in 2024 and right of it in 2021. Draw `else` and `after-if` as small taupe ticks, not badges. Give the rule line 20+ units of space.
- *Status:* fixed: a fixed dashed `else` marker per lane; the guard badge sits left of it in 2024 and right in 2021; `else` is a label and `after-if` a small tick (not badges); the rule line has 20+ units of space.

**31. Step 13: the flag is a 16-unit box that connects to nothing** (minor)
- *Where:* step 13 final frame.
- *What:* The outline's branch arrows (`flag = true` to a `consume` frame, `flag = false` down) are gone. The `0` box sits beside a live, caramel-ringed `t`, but only the true path set it to 0, so the frame shows `t` both alive and flagged moved. Nothing links the flag to the check at the brace.
- *Evidence:* desktop-13 (flag at x 805–828, y 400–424).
- *Fix:* Show the flag twice, one per lane at the lane's start (`flag 1` / `flag 0`), with a short taupe arrow to the brace position where the lane's `cond` badge does or does not land. Drop the caramel ring from `t`.
- *Status:* fixed: one drop-flag box per lane (`0` / `1`) with an arrow to where `cond` lands or not; the caramel ring on `t` is gone.

**32. Step 14: timelines run into `101` and `134`; `exit code` is repeated four times** (minor)
- *Where:* step 14 lanes 2 and 4.
- *Evidence:* desktop-14 (line end x 1210 touches `101` at x 1215 and `134` at x 1215); phone-14 (x 958 vs 955).
- *Fix:* End the lines at x ≈ 470 and write one `EXIT CODE` column header above lane 1.
- *Status:* fixed: lines end at x 470 and one `EXIT CODE` header sits over lane 1.

**33. Step 15: all-cherry frame, no single focal point** (minor)
- See finding 16 for the fix. Listed separately because finding 16 is about the wrong value, and this one is about colour focus (DESIGN.md: "the eye lands on one thing first").
- *Status:* fixed with finding 16.

**34. Steps 16 and 22: chips and empty timelines that say nothing** (minor)
- *Where:* step 16 (four `s` chips, nearly invisible taupe text, labelled `s` even on the `Rc` and `exit` rows); steps 16 and 22 (an empty `DROP ORDER` timeline).
- *What:* Decoration by DESIGN.md's test: the picture makes sense without them, and they add two more label sets.
- *Fix:* Step 16: drop the chips and keep code · `✓ safe`. Steps 16 and 22: drop the empty timeline, or label it `no drops` if the emptiness is the point.
- *Status:* fixed: chips, empty timelines removed from steps 16 and 22.

**35. Step 17: the cut is drawn on `r`'s reference; three accents** (minor)
- *Where:* step 17 row B.
- *What:* The cherry `×` sits on the dashed `&mut` edge from `r` to the payload, so it reads as "the reference is cut". `r` is the one live way to the leaked bytes; what `Box::leak` cuts is the box's *owner* edge. The frame also uses caramel (brace, badge), cinnamon (the `&mut` edge) and cherry (the `×`), three accents where DESIGN.md allows two.
- *Fix:* Draw a short caramel owner stub from a ghost `Box` outline, cut it with the `×`, and keep `r`'s `&mut` edge intact and latte (or cinnamon with no cherry).
- *Status:* fixed: a ghost `Box` with a caramel owner stub is cut by the `×`; `r`'s `&mut` edge is intact and latte, so the step uses caramel and cherry only.

**36. Step 18: names on screen don't match, and the year floats** (minor)
- *Where:* step 18.
- *What:* The badge says `1 data`, but no label on screen says `data` (the box is `heap: Vec<u32>`, drawn *inside* the parent's stack frame while the caption says the child borrowed the parent's *stack*). `2015` sits right above `child thread` and reads as its label. `Drop joins the child` (the mechanism) is at forgotten-opacity and nearly invisible. `use after free` floats in the gap, attached to nothing.
- *Evidence:* desktop-18 (y 130–155, 278, 397–400).
- *Fix:* Label the box `data: Vec<u32>` (or the badge `heap`). Move `2015` top-left as the storyboard says. Keep `Drop joins the child` at latte 0.8 beside the forgotten slot. Put `use after free` on the cherry edge, just above its open dot.
- *Status:* fixed: payload reads `data: Vec<u32>`, `2015` moved top-left, `Drop joins the child` stays at latte 0.8, `use after free` sits on the cherry edge.

**37. Step 19: two ideas, crowded labels** (minor)
- *Where:* step 19.
- *What:* `joined` and `joins all, then returns` are stacked about 12 CSS px apart on phone, and the latter touches the frame's bottom border. The borrow edges cross the frame's title line. On phone `len 0` fills its cell edge to edge. The lower half has five text items, and `scope` and leak amplification compete for the eye in one frame.
- *Evidence:* phone-19 (y 597 / 632; cells x 297–515).
- *Fix:* Put the frame label outside the frame's bottom edge in caramel and the `joined` ticks inside. Route the borrow edges out of the frame's right side. Widen the `len` cell. Cut the lower text to two lines (`len 0 before the proxy` / `forget → more leaks, never UB`), moving the rest to the caption.
- *Status:* fixed: frame label moved below the frame in caramel, `len` cells widened, lower text cut to two lines (`len 0 before the proxy`, `forget → more leaks, never UB`).

**38. Step 21: the reveal shows run results for code that does not compile** (minor)
- *Where:* step 21 reveal.
- *What:* The answer is "rustc refuses", yet the frame shows `temp · try_read ok`, `_g · try_read blocked` and two drop badges, as if it ran. A learner can't tell that these are the `#[allow(let_underscore_lock)]` measurements. The struck line is the same hard-to-read dark cherry as step 5.
- *Fix:* Add a 13-unit taupe heading over the right-hand results, `if allowed:`. Use crema text with a cherry strike for line 1.
- *Status:* fixed: `if allowed:` heading over the results; line 1 is crema with a cherry strike.

**39. Step 22: the failure label is far from what fails** (minor)
- *Where:* step 22 reveal.
- *What:* `writes into freed memory` sits under the forgotten guard, about 200 units left of the `device` box. The device-to-`buf` edge is three short dashes, so the picture of "the device keeps writing" is the smallest thing on screen.
- *Fix:* Draw a longer cherry edge from `device` to the dashed `buf`, with the label right under it.
- *Status:* fixed: the device edge is 120 units long and the label sits right under it.

**40. Step 23 (phone): a row nearly reaches the edge; the badge glyph overlaps itself; two rows repeat** (minor)
- *Where:* step 23 `Recap`.
- *What:* On phone, `Leaking is safe. forget, ManuallyDrop, leak` ends about 14 CSS px from the screen edge, inside the 16 px gutter. The `1 2 3` glyph's circles overlap each other and touch the left edge. Rows 1 and 2 both say "fields in order". The `[ ]` glyph for row 6 means nothing yet.
- *Evidence:* phone-23 (row 5 ends x 1128 of 1170; glyph x 42–185).
- *Fix:* Shorten row 5 to `Leaking is safe: forget, leak, cycles`. Space the three badges 26 units apart. Make row 1 `Destructor = Drop::drop, then glue` and row 2 `Locals reverse · fields in order`. For row 6, reuse step 19's scope frame mark (a small caramel-bordered rect).
- *Status:* fixed: row 5 is `Leaking is safe: forget, leak, cycles`, badges 30 units apart and inset, rows 1 and 2 reworded, row 6 uses the caramel scope-frame mark.
